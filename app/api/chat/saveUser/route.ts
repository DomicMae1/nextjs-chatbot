/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { uid, email, name, photoURL } = await req.json();

    if (!uid || !email)
      return NextResponse.json(
        { error: "Data user tidak lengkap" },
        { status: 400 }
      );

    // Upsert user (kalau belum ada, buat baru)
    const user = await User.findOneAndUpdate(
      { uid },
      { email, name, photoURL },
      { upsert: true, new: true }
    );

    return NextResponse.json({ message: "User tersimpan", user });
  } catch (err: any) {
    console.error("❌ Gagal simpan user:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
