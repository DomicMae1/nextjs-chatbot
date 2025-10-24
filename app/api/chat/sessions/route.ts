import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ChatSession from "@/models/ChatSession";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId diperlukan" }, { status: 400 });
  }

  await connectDB();
  const sessions = await ChatSession.find({ userId }).sort({ createdAt: -1 });
  return NextResponse.json(sessions);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { userId, title } = body;

  if (!userId || !title) {
    return NextResponse.json(
      { error: "userId dan title diperlukan" },
      { status: 400 }
    );
  }

  await connectDB();

  const newSession = await ChatSession.create({
    userId,
    title,
    preview: "",
  });

  return NextResponse.json(newSession);
}
