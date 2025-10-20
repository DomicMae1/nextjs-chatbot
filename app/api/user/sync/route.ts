/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { uid, name, email, photoURL, provider } = body;

    if (!uid || !email) {
      return NextResponse.json(
        { error: "Data user tidak lengkap" },
        { status: 400 }
      );
    }

    await connectDB();

    // Cek apakah user sudah ada
    let user = await User.findOne({ uid });

    if (!user) {
      // Kalau belum ada, simpan baru
      user = await User.create({
        uid,
        name,
        email,
        photoURL,
        provider,
      });
    }

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error("❌ Gagal sync user:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
