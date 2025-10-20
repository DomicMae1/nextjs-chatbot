import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get("uid");

  if (!uid)
    return NextResponse.json({ error: "UID diperlukan" }, { status: 400 });

  await connectDB();

  const user = await User.findOne({ uid }).lean();

  if (!user)
    return NextResponse.json(
      { error: "User tidak ditemukan" },
      { status: 404 }
    );

  return NextResponse.json(user);
}
