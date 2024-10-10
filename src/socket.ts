/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import { Server as HttpServer } from "http";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import { Server, Socket } from "socket.io";
import config from "./app/config";
import AppError from "./app/errors/AppError";
import { verifyToken } from "./app/modules/auth/auth.utils";
import { ChatModel } from "./app/modules/chat/chat.model";
import { ChatServices } from "./app/modules/chat/chat.service";
import MessageModel from "./app/modules/message/message.model";
import { MessageServices } from "./app/modules/message/message.service";
import UserModel from "./app/modules/user/user.model";
import { TTokenUser } from "./app/types/common";
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
        throw new AppError(httpStatus.UNAUTHORIZED, "Please provide your access token");
      }

      // VERIFY TOKEN
      const user = verifyToken(accessToken, config.jwt_access_secret as Secret) as TTokenUser;

      if (!user) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Invalid access token");
      }

      socket.join(user._id);

      onlineUsers.add(user._id);
      sendSocketEmit(socket, "online-users", {
        success: true,
        message: "New user connected",
        data: Array.from(onlineUsers),
      });

      // MESSAGE PAGE INFORMATION
      socket.on("message-page", async ({ userId }, callback) => {
        try {
          const userDetails = await UserModel.findById(userId);
          if (!userDetails) {
            throw new AppError(httpStatus.NOT_FOUND, "User not found");
          }

          sendSocketEmit(socket, "user-details", {
            success: true,
            message: "User details",
            data: userDetails,
          });

          const messages = await MessageServices.getMyMessageListCustomer(user);

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
        if (!receiverId || (!text && !file))
          return callback({ success: false, message: "Receiver ID and text are required" });

        try {
          let chatList = await ChatModel.findOne({
            //  FIND CHAT LIST WHERE IS USER AND RECEIVER EXIST
            participants: {
              $all: [{ $elemMatch: { user: user._id } }, { $elemMatch: { user: receiverId } }],
            },
          });

          if (!chatList) {
            //  IF CHAT LIST IS NOT EXIST CREATE A NEW CHAT LIST FOR SENDER AND RECEIVER
            chatList = await ChatServices.createChatIntoDb(user, receiverId);
          }

          const message = await MessageModel.create({
            sender: user._id,
            receiver: receiverId,
            chat: chatList._id,
            text,
            file,
          });

          io.emit("new-message::" + receiverId, message);
          io.emit("new-message::" + user._id, message);
          const getPreMessage = await MessageModel.find({
            $or: [
              {
                sender: user?._id,
                receiver: receiverId,
              },
              {
                sender: receiverId,
                receiver: user?._id,
              },
            ],
          }).sort({ updatedAt: 1 });

          const senderMessage = "message::" + user._id;
          const receiverMessage = "message::" + receiverId;

          io.emit(senderMessage, { data: getPreMessage || [] });
          io.emit(receiverMessage, { data: getPreMessage || [] });

          //socket.emit("message", { data: getPreMessage } || []);

          //  NEED TO INFORM RECEIVER OR SENDER FOR UPDATE THE CHAT LIST

          const ChatListUser1 = await ChatServices.getMyChatListFromDb(user._id);

          const ChatListUser2 = await ChatServices.getMyChatListFromDb(receiverId);

          const user1Chat = "chat-list::" + user._id;

          const user2Chat = "chat-list::" + receiverId;

          io.emit(user1Chat, { data: ChatListUser1 });
          io.emit(user2Chat, { data: ChatListUser2 });

          // Send the message to both sender and receiver
          //io.to(receiverId).emit("receive-message", message);
          //io.to(user._id.toString()).emit("receive-message", message);
          //callback({ success: true, message });
        } catch (error: any) {
          console.log(error);
          callback({ success: false, message: error.message });
        }
      });

      socket.on("typing", ({ receiverId }, callback) => {
        const receiver = "typing::" + receiverId;
        io.emit(receiver, { data: true });
        callback({ success: true, message: "Typing" });
      });

      socket.on("seen", async ({ chatId }, callback) => {
        const chatList = await ChatModel.findById(chatId);

        if (!chatList) {
          throw new AppError(httpStatus.NOT_FOUND, "Chat not found");
        }

        try {
          await MessageServices.seenMessagesIntoDb(user);
          const ChatListUser1 = await ChatServices.getMyChatListFromDb(
            chatList.participants[0].user.toString(),
          );

          const ChatListUser2 = await ChatServices.getMyChatListFromDb(
            chatList.participants[1].user.toString(),
          );

          const user1Chat = "chat-list::" + chatList.participants[0].user.toString();

          const user2Chat = "chat-list::" + chatList.participants[1].user.toString();

          io.emit(user1Chat, { data: ChatListUser1 });
          io.emit(user2Chat, { data: ChatListUser2 });
        } catch (error: any) {
          console.log(error);
          callback({
            success: false,
            message: error.message,
          });
        }
      });

      socket.on("disconnect", () => {
        onlineUsers.delete(user?._id);
        //io.emit("onlineUser", Array.from(onlineUsers));
        sendSocketEmit(socket, "online-users", {
          success: true,
          message: "A user disconnected",
          data: Array.from(onlineUsers),
        });
        console.log("disconnect user ", socket.id);
      });
    } catch (error) {
      console.log(error);
    }
  });

  return io;
};

type TSocketResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

const sendSocketEmit = <T>(socket: Socket<any>, emit: string, response: TSocketResponse<T>) => {
  socket.emit(emit, response);
};

export default initializeSocketIO;
