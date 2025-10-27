import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ChatSession from "@/models/ChatSession";
import Chat from "@/models/Chat";

export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");
  const userId = searchParams.get("userId");

  if (!query || !userId) {
    return NextResponse.json([]);
  }

  try {
    // 🔍 Cari session milik user berdasarkan judul atau preview
    const sessions = await ChatSession.find({
      userId,
      $or: [
        { title: { $regex: query, $options: "i" } },
        { preview: { $regex: query, $options: "i" } },
      ],
    });

    // 🔍 Cari chat yang berisi query di message ATAU response
    const messages = await Chat.find({
      userId,
      $or: [
        { message: { $regex: query, $options: "i" } },
        { response: { $regex: query, $options: "i" } },
      ],
    });

    // 🧩 Ambil semua sessionId yang ditemukan dari chat
    const matchedSessionIds = [
      ...new Set(messages.map((m) => m.sessionId.toString())),
    ];

    // Ambil session yang cocok dari hasil message
    const matchedSessions = await ChatSession.find({
      _id: { $in: matchedSessionIds },
      userId,
    });

    // Gabungkan hasil pencarian session dan matchedSessions (hindari duplikat)
    const allSessions = [
      ...sessions,
      ...matchedSessions.filter(
        (ms) => !sessions.some((s) => s._id.toString() === ms._id.toString())
      ),
    ];

    // 🔧 Tambahkan snippet teks (matchedText)
    const sessionsWithSnippets = allSessions.map((s) => {
      const matchedMessage = messages.find(
        (m) => m.sessionId.toString() === s._id.toString()
      );
      let snippet = "";

      if (matchedMessage) {
        const textSource =
          matchedMessage.message || matchedMessage.response || "";
        const matchIndex = textSource
          .toLowerCase()
          .indexOf(query.toLowerCase());

        if (matchIndex !== -1) {
          const start = Math.max(0, matchIndex - 20);
          const end = Math.min(textSource.length, matchIndex + 50);
          snippet = textSource.substring(start, end);
          if (start > 0) snippet = "..." + snippet;
          if (end < textSource.length) snippet += "...";
        }
      }

      return {
        ...s.toObject(),
        matchedText: snippet,
      };
    });

    return NextResponse.json(sessionsWithSnippets);
  } catch (err) {
    console.error("❌ Error saat mencari data:", err);
    return NextResponse.json({ error: "Gagal mencari data" }, { status: 500 });
  }
}
