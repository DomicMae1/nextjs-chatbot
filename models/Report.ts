import mongoose, { Schema, Document, models } from "mongoose";

// 🧩 Interface Report
export interface IReport extends Document {
  userId: string;
  title: string;
  description: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    author: { type: String, default: "Anonymous" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    collection: "reports", // ✅ nama koleksi di MongoDB
  }
);

// 🔁 Middleware otomatis update `updatedAt`
ReportSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const Report = models.Report || mongoose.model<IReport>("Report", ReportSchema);
export default Report;
