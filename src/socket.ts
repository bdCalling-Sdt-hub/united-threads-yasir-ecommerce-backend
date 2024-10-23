/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import { Server as HttpServer } from "http";
import { Secret } from "jsonwebtoken";
import { Server, Socket } from "socket.io";
import config from "./app/config";
//import AppError from "./app/errors/AppError";
import { verifyToken } from "./app/modules/auth/auth.utils";
import { ChatModel } from "./app/modules/chat/chat.model";
import { ChatServices } from "./app/modules/chat/chat.service";
import MessageModel from "./app/modules/message/message.model";
import { MessageServices } from "./app/modules/message/message.service";
import { TUser } from "./app/modules/user/user.interface";
import UserModel from "./app/modules/user/user.model";
import { TTokenUser } from "./app/types/common";
import { TChat } from "./app/modules/chat/chat.interface";
const initializeSocketIO = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000"],
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      credentials: true,
    },
  });

  // USE SET FOR AVOID DUPLICATE USER
  const onlineUsers = new Set();

  io.on("connection", (socket) => {
    console.log("new user connected", socket?.id);

    try {
      // GET USER ACCESS TOKEN FROM HEADERS
      const accessToken = socket.handshake.auth?.token || socket.handshake.headers?.token;

      if (!accessToken) {
        return sendSocketEmit(socket, "error", {
          success: false,
          message: "Please provide your access token",
        });
      }

      let user = null;
      // VERIFY TOKEN
      try {
        user = verifyToken(accessToken, config.jwt_access_secret as Secret) as TTokenUser;
      } catch (error) {
        console.log("JWT verification error:", error);
        return sendSocketEmit(socket, "error", {
          success: false,
          message: "Invalid or expired access token",
        });
      }

      if (!user) {
        return sendSocketEmit(socket, "error", {
          success: false,
          message: "Invalid access token",
        });
      }

      socket.join(user._id);

      onlineUsers.add(user._id);

      sendSocketEmit(socket, "online-users", {
        success: true,
        message: "New user connected",
        data: Array.from(onlineUsers),
      });

      ChatServices.getMyChatListFromDb(user._id).then((result) => {
        io.emit("chat-list::" + user._id, { data: result });
      });

      // MESSAGE PAGE INFORMATION
      socket.on("message-page", async ({ userId }, callback) => {
        try {
          let userDetails: TUser | null = null;
          if (!userId && user.role === "CSR") {
            socket.emit("error", {
              success: false,
              message: "Please provide user id",
            });
            return;
          }

          if (!userId) {
            userDetails = await UserModel.findOne({ role: "CSR" });
          }

          if (userId) {
            userDetails = await UserModel.findOne({ _id: userId });
          }

          if (!userDetails) {
            //throw new AppError(httpStatus.NOT_FOUND, "User not found");
            socket.emit("error", {
              success: false,
              message: "User not found",
            });
            return;
          }

          sendSocketEmit(socket, "online-users", {
            success: true,
            message: "New user connected",
            data: Array.from(onlineUsers),
          });

          sendSocketEmit(socket, "user-details", {
            success: true,
            message: "User details",
            data: userDetails,
          });

          const messages = await MessageServices.getMyMessageListCustomer(
            user,
            userDetails._id.toString(),
          );

          //console.log({ user, receiver: userDetails._id.toString() });

          sendSocketEmit(socket, "my-messages", {
            success: true,
            message: "My messages list",
            data: messages,
          });
        } catch (error: any) {
          console.log(error);
          callback({
            success: false,
            message: error.message,
          });
        }
      });

      socket.on("my-chat-list", async (data, callback) => {
        try {
          const chatList = await ChatServices.getMyChatListFromDb(user._id);

          sendSocketEmit(socket, "my-chat-list", {
            success: true,
            message: "My chat list",
            data: chatList,
          });
        } catch (error: any) {
          console.log(error);
          callback({
            success: false,
            message: error.message,
          });
        }
      });

      // SEND MESSAGE
      socket.on("send-message", async ({ receiverId, text, file }, callback) => {
        const senderDetails = await UserModel.findById(user._id);

        if (!senderDetails) {
          socket.emit("error", { success: false, message: "User not found" });
          return;
        }
        if (senderDetails.isActive === false) {
          socket.emit("error", { success: false, message: "Your account is blocked" });
          return;
        }

        let receiver = receiverId;
        if (!text && !file && !Array.isArray(file) && file.length === 0)
          return callback({ success: false, message: "Please provide text or file" });

        try {
          if (receiverId === user._id) {
            return callback({ success: false, message: "You can't send message to yourself" });
          }

          if (!receiverId && user.role === "CSR") {
            socket.emit("error", { success: false, message: "CSR not found" });
            return;
          }

          if (!receiverId) {
            const csr = await UserModel.findOne({ role: "CSR" });

            if (!csr) {
              socket.emit("error", { success: false, message: "CSR not found" });
              return;
            }

            receiver = receiverId || csr._id;
          }

          let chatList = await ChatModel.findOne({
            participants: {
              $all: [{ $elemMatch: { user: user._id } }, { $elemMatch: { user: receiver } }],
            },
          });

          if (!chatList) {
            chatList = await ChatServices.createChatIntoDb(user, receiver);
          }

          const payload: Record<string, any> = {
            sender: user._id,
            receiver: receiver,
            chat: chatList._id,
            text,
            file: file || [],
          };

          const message = await MessageModel.create(payload);

          io.emit("new-message::" + receiver, message);
          io.emit("new-message::" + user._id, message);

          const getPreMessage = await MessageModel.find({
            $or: [
              {
                sender: user?._id,
                receiver: receiver,
              },
              {
                sender: receiver,
                receiver: user?._id,
              },
            ],
          }).sort({ updatedAt: 1 });

          io.emit("message::" + user._id, { data: getPreMessage || [] });
          io.emit("message::" + receiver, { data: getPreMessage || [] });

          const ChatListUser1 = await ChatServices.getMyChatListFromDb(user._id);
          const ChatListUser2 = await ChatServices.getMyChatListFromDb(receiver);

          io.emit("chat-list::" + user._id, { data: ChatListUser1 });
          io.emit("chat-list::" + receiver, { data: ChatListUser2 });
        } catch (error: any) {
          console.log(error);
          callback({ success: false, message: error.message });
        }
      });

      socket.on("seen", async ({ chatId }, callback) => {
        try {
          if (!chatId) {
            if (typeof callback === "function") {
              callback({
                success: false,
                message: "chatId id is required",
              });
            }
            io.emit("error", {
              success: false,
              message: "chatId id is required",
            });
            return;
          }

          const chatList: TChat | null = await ChatModel.findById(chatId);
          if (!chatList) {
            //callback({
            //  success: false,
            //  message: "chat id is not valid",
            //});
            io.emit("error", {
              success: false,
              message: "chat id is not valid",
            });
            //throw new AppError(httpStatus.BAD_REQUEST, "chat id is not valid");
            if (typeof callback === "function") {
              callback({
                success: false,
                message: "chat id is not valid",
              });
            }

            return;
          }

          const messageIdList = await MessageModel.aggregate([
            {
              $match: {
                chat: chatList._id,
                seen: false,
                sender: { $ne: user?._id },
              },
            },
            { $group: { _id: null, ids: { $push: "$_id" } } },
            { $project: { _id: 0, ids: 1 } },
          ]);

          const unseenMessageIdList = messageIdList.length > 0 ? messageIdList[0].ids : [];

          // Update the unseen messages to seen
          await MessageModel.updateMany(
            { _id: { $in: unseenMessageIdList } },
            { $set: { seen: true } },
          );

          const user1 = chatList.participants[0];
          const user2 = chatList.participants[1];

          //----------------------ChatList------------------------//
          const ChatListUser1 = await ChatServices.getMyChatListFromDb(user1?.user?.toString());

          const ChatListUser2 = await ChatServices.getMyChatListFromDb(user2?.user?.toString());

          const user1Chat = "chat-list::" + user1.toString();
          const user2Chat = "chat-list::" + user2.toString();

          io.emit(user1Chat, { success: true, data: ChatListUser1 });
          io.emit(user2Chat, { success: true, data: ChatListUser2 });
        } catch (error: any) {
          callback({
            success: false,
            message: error.message,
          });
          console.error("Error in seen event:", error);
          socket.emit("error", { message: error.message });
        }
      });

      // start typing
      socket.on("typing", async ({ receiverId }, callback) => {
        try {
          if (!receiverId) {
            if (typeof callback === "function") {
              callback({
                success: false,
                message: "Receiver id is required",
              });
            }
            return;
          }

          const typeUser = "typing::" + receiverId;
          const userDetails = await UserModel.findOne({ _id: user?._id });

          io.emit(typeUser, { success: true, data: userDetails });
        } catch (error: any) {
          callback({
            success: false,
            message: error.message,
          });
          console.error("Error in typing event:", error);
          socket.emit("error", { message: error.message });
        }
      });

      socket.on("stop-typing", async ({ receiverId }, callback) => {
        try {
          if (!receiverId) {
            if (typeof callback === "function") {
              callback({
                success: false,
                message: "Receiver id is required",
              });
            }
            return;
          }

          const stopTyping = "stop-typing::" + receiverId;

          io.emit(stopTyping, { success: true, data: user });
        } catch (error: any) {
          callback({
            success: false,
            message: error.message,
          });
          console.error("Error in typing event:", error);
          socket.emit("error", { message: error.message });
        }
      });

      socket.on("block", async ({ receiverId }, callback) => {
        try {
          if (!receiverId) {
            if (typeof callback === "function") {
              callback({
                success: false,
                message: "Receiver id is required",
              });
            }
            return;
          }

          const blockUser = "block::" + receiverId;
          const userDetails = await UserModel.findOneAndUpdate(
            { _id: receiverId, isActive: true },
            { isActive: false },
          );

          if (!userDetails) {
            if (typeof callback === "function") {
              callback({
                success: false,
                message: "User not found",
              });
            }
            return;
          }

          socket.emit("user-details", { success: true, data: userDetails });

          io.emit(blockUser, { success: true, data: userDetails });
        } catch (error: any) {
          if (typeof callback === "function") {
            callback({
              success: false,
              message: error.message,
            });
          }
          console.error("Error in typing event:", error);
          socket.emit("error", { message: error.message });
        }
      });

      socket.on("unblock", async ({ receiverId }, callback) => {
        try {
          if (!receiverId) {
            if (typeof callback === "function") {
              callback({
                success: false,
                message: "Receiver id is required",
              });
            }
            return;
          }

          const unblockUser = "unblock::" + receiverId;

          const userDetails = await UserModel.findOneAndUpdate(
            { _id: receiverId, isActive: false },
            { isActive: true },
          );

          if (!userDetails) {
            if (typeof callback === "function") {
              callback({
                success: false,
                message: "User not found",
              });
            }
            return;
          }

          socket.emit("user-details", { success: true, data: userDetails });

          io.emit(unblockUser, { success: true, data: userDetails });
        } catch (error: any) {
          if (typeof callback === "function") {
            callback({
              success: false,
              message: error.message,
            });
          }
          console.error("Error in typing event:", error);
          socket.emit("error", { message: error.message });
        }
      });

      socket.on("disconnect", () => {
        onlineUsers.delete(user?._id);
        sendSocketEmit(socket, "online-users", {
          success: true,
          message: "A user disconnected",
          data: Array.from(onlineUsers),
        });
        console.log("disconnect user ", socket.id);
      });
    } catch (error: any) {
      console.log("Connection error:", error);
      sendSocketEmit(socket, "error", {
        success: false,
        message: error.message || "An error occurred",
      });
    }
  });

  return io;
};

type TSocketResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};

const sendSocketEmit = <T>(socket: Socket<any>, emit: string, response: TSocketResponse<T>) => {
  socket.emit(emit, response);
};

export default initializeSocketIO;
