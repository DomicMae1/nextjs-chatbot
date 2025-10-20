/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Groq from "groq-sdk";
import Chat from "@/models/Chat";

// Inisialisasi Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    await connectDB();
    const { message, userId } = await req.json();

    if (!message) {
      return NextResponse.json(
        { reply: "Pesan kosong. Harap kirim pertanyaan." },
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
      model: "llama-3.3-70b-versatile", // 🔥 model terbaru
    });

    const reply =
      completion.choices[0]?.message?.content || "Maaf, tidak ada respons.";

    await Chat.create({ userId, message, response: reply });

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
