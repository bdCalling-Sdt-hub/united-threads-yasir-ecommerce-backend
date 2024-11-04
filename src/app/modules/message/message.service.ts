import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { TTokenUser } from "../../types/common";
import UserModel from "../user/user.model";
import { TMessage } from "./message.interface";
import MessageModel from "./message.model";

const createMessageIntoDb = async (payload: TMessage) => {
  if (!payload.text && !payload.file) {
    throw new AppError(httpStatus.BAD_REQUEST, "Please provide text or file");
  }

  const receiver = await UserModel.findById(payload.receiver);

  if (!receiver) {
    throw new AppError(httpStatus.NOT_FOUND, "Receiver not found");
  }

  if (payload.receiver === payload.sender) {
    throw new AppError(httpStatus.BAD_REQUEST, "You can't send message to yourself");
  }

  const result = await MessageModel.create(payload);
  return result;
};

const getMyMessagesFromDb = async (user: TTokenUser) => {
  const result = await MessageModel.find({
    $or: [{ sender: user._id }, { receiver: user._id }],
  }).lean();
  return result;
};

const getMessagesByUserIdFromDb = async (userId: string) => {
  const result = await MessageModel.find({
    $or: [{ sender: userId }, { receiver: userId }],
  }).lean();
  return result;
};

const seenMessagesIntoDb = async (user: TTokenUser) => {
  const result = await MessageModel.updateMany(
    {
      receiver: user._id,
    },
    {
      $set: { seen: true },
    },
  );
  return result;
};

const getMyMessageListCustomer = async (user: TTokenUser, receiver: string) => {
  const messages = await MessageModel.find({
    $or: [
      { sender: user._id, receiver },
      { receiver: user._id, sender: receiver },
    ],
  }).lean();
  return messages;
};

export const MessageServices = {
  createMessageIntoDb,
  getMyMessagesFromDb,
  getMessagesByUserIdFromDb,
  seenMessagesIntoDb,
  getMyMessageListCustomer,
};
