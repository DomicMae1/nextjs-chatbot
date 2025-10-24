/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Chat from "@/models/Chat";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const sessionId = searchParams.get("sessionId");

    if (!userId || !sessionId) {
      return NextResponse.json(
        { error: "userId dan sessionId wajib diisi" },
        { status: 400 }
      );
    }

    await connectDB();

    // ✅ Ambil hanya chat dari user dan session yang sesuai
    const chats = await Chat.find({ userId, sessionId }).sort({ timestamp: 1 });

    return NextResponse.json(chats);
  } catch (err: any) {
    console.error("❌ Error mengambil chat history:", err);
    return NextResponse.json(
      { error: "Gagal mengambil chat history", details: err.message },
      { status: 500 }
    );
  }
}
