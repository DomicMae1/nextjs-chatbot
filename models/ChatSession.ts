import mongoose, { Schema, Document, models } from "mongoose";

export interface IChatSession extends Document {
  userId: string;
  title: string;
  preview?: string;
  createdAt: Date;
}

const ChatSessionSchema = new Schema<IChatSession>({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  preview: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default models.ChatSession ||
  mongoose.model<IChatSession>("ChatSession", ChatSessionSchema);
