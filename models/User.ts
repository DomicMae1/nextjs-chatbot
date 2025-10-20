import mongoose, { Schema, Document, models } from "mongoose";

interface IUser extends Document {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  provider?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    uid: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    photoURL: { type: String },
    provider: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  {
    collection: "users", // ✅ simpan ke collection "users"
  }
);

const User = models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
