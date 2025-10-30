/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Report from "@/models/Report";

export async function GET() {
  try {
    await connectDB();
    const reports = await Report.find().sort({ createdAt: -1 });
    return NextResponse.json(reports);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data laporan" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { userId, title, description, author } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Judul dan deskripsi wajib diisi" },
        { status: 400 }
      );
    }

    const newReport = await Report.create({
      userId,
      title,
      description,
      author: author || "Anonymous",
    });

    return NextResponse.json(newReport, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal membuat laporan" },
      { status: 500 }
    );
  }
}
