import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Chat from "@/models/Chat";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId)
    return NextResponse.json({ error: "User ID diperlukan" }, { status: 400 });

  await connectDB();

  const chats = await Chat.find({ userId }).sort({ createdAt: -1 }).lean();

  return NextResponse.json(chats);
}
