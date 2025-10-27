/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ChatSession from "@/models/ChatSession";

export async function GET(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId diperlukan" }, { status: 400 });
  }

  try {
    const pinnedSessions = await ChatSession.find({
      userId,
      isPinned: true,
    }).sort({ createdAt: -1 });
    return NextResponse.json(pinnedSessions);
  } catch (err: any) {
    console.error("❌ Error fetching pinned sessions:", err);
    return NextResponse.json(
      { error: "Gagal mengambil session sematkan" },
      { status: 500 }
    );
  }
}
