/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Groq from "groq-sdk";
import Chat from "@/models/Chat";
import ChatSession from "@/models/ChatSession";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    await connectDB();
    const { userId, sessionId, message } = await req.json();

    if (!userId || !sessionId || !message) {
      return NextResponse.json(
        { reply: "userId, sessionId, dan message wajib diisi." },
        { status: 400 }
      );
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Kamu adalah asisten AI yang ramah dan informatif.",
        },
        { role: "user", content: message },
      ],
      model: "llama-3.3-70b-versatile",
    });

    const reply =
      completion.choices[0]?.message?.content || "Maaf, tidak ada respons.";

    // ✅ Simpan chat baru
    const newChat = await Chat.create({
      userId,
      sessionId,
      message,
      response: reply,
      timestamp: new Date(),
    });

    // ✅ Kaitkan chat ke session
    await ChatSession.findByIdAndUpdate(sessionId, {
      $push: { messages: newChat._id },
      $set: { preview: message.slice(0, 50) }, // Tambahkan sedikit ringkasan
    });

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("❌ ERROR Groq API:", error);
    return NextResponse.json(
      {
        reply: "Terjadi kesalahan saat memproses permintaan.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
