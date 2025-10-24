import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Chat from "@/models/Chat";
import ChatSession from "@/models/ChatSession";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId)
    return NextResponse.json({ error: "User ID diperlukan" }, { status: 400 });

  await connectDB();

  const chats = await Chat.find({ userId }).sort({ createdAt: -1 }).lean();

  return NextResponse.json(chats);
}

export async function POST(req: Request) {
  const { userId, sessionId, message } = await req.json();
  if (!userId || !sessionId || !message)
    return NextResponse.json(
      { error: "Semua field wajib diisi" },
      { status: 400 }
    );

  await connectDB();

  // Simulasi respons AI
  const reply = "Pesan diterima! Ini respons otomatis untuk percobaan.";

  const newChat = await Chat.create({
    userId,
    sessionId, // pastikan disimpan
    message,
    response: reply,
    timestamp: new Date(),
  });

  // 🔹 Tambahkan chat ini ke dalam session
  await ChatSession.findByIdAndUpdate(sessionId, {
    $push: { messages: newChat._id },
  });

  return NextResponse.json({ reply });
}
