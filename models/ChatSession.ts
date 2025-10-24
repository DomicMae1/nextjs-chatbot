import mongoose, { Schema, Document, models } from "mongoose";

interface IChatSession extends Document {
  userId: string;
  title: string;
  preview: string;
  messages: mongoose.Types.ObjectId[]; // ✅ tambahkan ini
  createdAt: Date;
}

const ChatSessionSchema = new Schema<IChatSession>(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true },
    preview: { type: String, default: "" },
    messages: [{ type: Schema.Types.ObjectId, ref: "Chat" }], // ✅ tambahkan
    createdAt: { type: Date, default: Date.now },
  },
  {
    collection: "chatsessions",
  }
);

const ChatSession =
  models.ChatSession ||
  mongoose.model<IChatSession>("ChatSession", ChatSessionSchema);

export default ChatSession;
