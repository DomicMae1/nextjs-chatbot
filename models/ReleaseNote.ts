import mongoose, { Schema, Document, models } from "mongoose";

export interface IReleaseNote extends Document {
  title: string; // opsional, bisa tambahkan judul singkat
  description: string;
  date: Date;
  createdAt: Date;
}

const ReleaseNoteSchema = new Schema<IReleaseNote>(
  {
    title: { type: String, required: false },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    collection: "releasenotes",
  }
);

const ReleaseNote =
  models.ReleaseNote ||
  mongoose.model<IReleaseNote>("ReleaseNote", ReleaseNoteSchema);

export default ReleaseNote;
