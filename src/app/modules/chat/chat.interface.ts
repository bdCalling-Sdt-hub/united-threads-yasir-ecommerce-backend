import { Schema } from "mongoose";

export type TParticipant = {
  user: Schema.Types.ObjectId;
  isBlocked?: boolean;
};

export type TChat = {
  _id: Schema.Types.ObjectId;
  participants: TParticipant[];
  createdAt?: Date;
  updatedAt?: Date;
};
