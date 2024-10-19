import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { TTokenUser } from "../../types/common";
import UserModel from "../user/user.model";
import { ChatModel } from "./chat.model";
import MessageModel from "../message/message.model";
import { TParticipant } from "./chat.interface";

const createChatIntoDb = async (user: TTokenUser, receiverId: string) => {
  const userData = await UserModel.findById(user._id).lean();

  if (!userData) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }

  const receiverData = await UserModel.findById(receiverId).lean();
  if (!receiverData) {
    throw new AppError(httpStatus.NOT_FOUND, "Receiver Not Found");
  }

  const participants: TParticipant[] = [{ user: userData._id }, { user: receiverData._id }];

  const result = await ChatModel.create({
    participants,
  });

  return result;
};

const getMyChatListFromDb = async (userId: string) => {
  const userData = await UserModel.findOne({ _id: userId });
  if (!userData) {
    //throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
    return [];
  }

  // Retrieve the chat list where the user is a participant
  const chatsList = await ChatModel.find({
    participants: { $elemMatch: { user: userData._id } },
  });

  //if (!chatsList || chatsList.length === 0) {
  //  throw new AppError(httpStatus.NOT_FOUND, "Chat List Not Found");
  //}

  const chatData = [];
  let latestMessage;

  // Loop through each chat and get the latest message and unread message count
  for (const chat of chatsList) {
    // Filter out participants who are marked as deleted

    // Get the latest message in the chat
    latestMessage = await MessageModel.findOne({ chat: chat._id }).sort({ updatedAt: -1 });

    // Get the count of unread messages for this chat
    const unreadMessageCount = await MessageModel.countDocuments({
      chat: chat._id,
      seen: false,
      sender: { $ne: userData._id },
    });

    const info = {
      chatId: chat._id,
      participants: chat.participants,
      latestMessage,
      unreadMessageCount,
    };

    if (info.latestMessage?.sender === userData._id) {
      //delete info.latestMessage.sender;
    }

    chatData.push(info);
  }

  // Sort chat data based on the latest message date
  chatData.sort((a, b) => {
    const dateA = new Date(a.latestMessage?.createdAt || 0).getTime();
    const dateB = new Date(b.latestMessage?.createdAt || 0).getTime();
    return dateB - dateA;
  });

  return chatData;
};

export const ChatServices = {
  createChatIntoDb,
  getMyChatListFromDb,
};
