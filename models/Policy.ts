// models/Policy.ts
import mongoose, { Schema, Document, models } from "mongoose";

export interface IPolicy extends Document {
  title: string;
  type: "terms" | "privacy" | "other";
  slug?: string;
  content: string; // HTML / markdown / plain text
  effectiveDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  author?: string;
}

const PolicySchema = new Schema<IPolicy>(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["terms", "privacy", "other"],
      default: "other",
    },
    slug: { type: String, index: true },
    content: { type: String, required: true },
    effectiveDate: { type: Date },
    author: { type: String, default: "system" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    collection: "policies",
  }
);

// update updatedAt automatically on save & updateOne/findOneAndUpdate
PolicySchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});
PolicySchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

const Policy = models.Policy || mongoose.model<IPolicy>("Policy", PolicySchema);
export default Policy;
