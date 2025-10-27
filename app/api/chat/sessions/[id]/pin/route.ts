import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ChatSession from "@/models/ChatSession";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const id = (await params).id;
  const { isPinned } = await req.json();

  if (typeof isPinned !== "boolean") {
    return NextResponse.json(
      { error: "Parameter isPinned harus berupa boolean" },
      { status: 400 }
    );
  }

  try {
    const session = await ChatSession.findById(id);
    if (!session) {
      return NextResponse.json(
        { error: "Session tidak ditemukan" },
        { status: 404 }
      );
    }

    session.isPinned = isPinned;
    await session.save();

    return NextResponse.json({
      message: `Session berhasil ${isPinned ? "disematkan" : "dilepaskan"}`,
      session,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Gagal memperbarui status pin" },
      { status: 500 }
    );
  }
}
