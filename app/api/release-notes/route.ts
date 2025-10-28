import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ReleaseNote from "@/models/ReleaseNote";

// ✅ GET: ambil semua release note (atau berdasarkan ID jika diberikan)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  await connectDB();

  try {
    if (id) {
      const note = await ReleaseNote.findById(id).lean();
      if (!note)
        return NextResponse.json(
          { error: "Release note tidak ditemukan" },
          { status: 404 }
        );
      return NextResponse.json(note);
    }

    const notes = await ReleaseNote.find().sort({ date: -1 }).lean();
    return NextResponse.json(notes);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Gagal mengambil data release notes" },
      { status: 500 }
    );
  }
}

// ✅ POST: tambah release note baru
export async function POST(req: Request) {
  const body = await req.json();
  const { title, description, date } = body;

  if (!description || !date) {
    return NextResponse.json(
      { error: "Field 'description' dan 'date' wajib diisi" },
      { status: 400 }
    );
  }

  await connectDB();

  try {
    const newNote = await ReleaseNote.create({
      title,
      description,
      date,
    });

    return NextResponse.json(newNote, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Gagal menambahkan release note" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { title, description, date, _id } = body;

  if (!_id) {
    return NextResponse.json(
      { error: "Parameter '_id' diperlukan untuk update" },
      { status: 400 }
    );
  }

  await connectDB();

  try {
    const updated = await ReleaseNote.findByIdAndUpdate(
      _id,
      { title, description, date },
      { new: true }
    );

    if (!updated)
      return NextResponse.json(
        { error: "Release note tidak ditemukan" },
        { status: 404 }
      );

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Gagal mengupdate release note" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Parameter 'id' diperlukan untuk menghapus" },
      { status: 400 }
    );
  }

  await connectDB();

  try {
    const deleted = await ReleaseNote.findByIdAndDelete(id);
    if (!deleted)
      return NextResponse.json(
        { error: "Release note tidak ditemukan" },
        { status: 404 }
      );

    return NextResponse.json({ message: "Release note berhasil dihapus" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Gagal menghapus release note" },
      { status: 500 }
    );
  }
}
