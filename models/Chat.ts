import mongoose, { Schema, Document, models } from "mongoose";

interface IChat extends Document {
  userId: string;
  sessionId: string;
  message: string;
  response: string;
  timestamp: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    userId: { type: String, required: true },
    sessionId: { type: String, required: true },
    message: { type: String, required: true },
    response: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  {
    collection: "chats", // ✅ pastikan disimpan di collection "chats"
  }
);

const Chat = models.Chat || mongoose.model<IChat>("Chat", ChatSchema);
export default Chat;
