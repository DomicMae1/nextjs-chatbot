/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ChatSession from "@/models/ChatSession";

// ✅ UPDATE SESSION (PUT)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const id = (await params).id;
  const { title } = await req.json();

  try {
    const updatedSession = await ChatSession.findByIdAndUpdate(
      id,
      { title },
      { new: true }
    );

    if (!updatedSession) {
      return NextResponse.json(
        { error: "Session tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedSession);
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal memperbarui session" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const id = (await params).id;

  try {
    const deleted = await ChatSession.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Session tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Session berhasil dihapus" });
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal menghapus session" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const id = (await params).id;

  try {
    const session = await ChatSession.findById(id);
    if (!session) {
      return NextResponse.json(
        { error: "Session tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(session);
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal mengambil session" },
      { status: 500 }
    );
  }
}
