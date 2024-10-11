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
import { TUser } from "./app/modules/user/user.interface";
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
        let receiver = receiverId;
        if (!text && !file)
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

          const message = await MessageModel.create({
            sender: user._id,
            receiver: receiver,
            chat: chatList._id,
            text,
            file,
          });

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
