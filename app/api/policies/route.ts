/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/policies/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Policy from "@/models/Policy";

type Req = Request;

export async function GET(req: Req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type"); // e.g. "terms" or "privacy"
    const slug = searchParams.get("slug");

    if (id) {
      const item = await Policy.findById(id).lean();
      if (!item)
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(item);
    }

    if (slug) {
      const item = await Policy.findOne({ slug }).lean();
      if (!item)
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(item);
    }

    const filter: any = {};
    if (type) filter.type = type;

    const items = await Policy.find(filter)
      .sort({ effectiveDate: -1, createdAt: -1 })
      .lean();
    return NextResponse.json(items);
  } catch (err) {
    console.error("[GET /api/policies] error:", err);
    return NextResponse.json(
      { error: "Gagal mengambil data" },
      { status: 500 }
    );
  }
}

export async function POST(req: Req) {
  try {
    await connectDB();
    const body = await req.json();
    const {
      title,
      type = "other",
      slug,
      content,
      effectiveDate,
      author,
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "title dan content wajib diisi" },
        { status: 400 }
      );
    }

    const payload: any = {
      title,
      type,
      slug:
        slug ||
        (title
          ? title
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9\-]/g, "")
          : undefined),
      content,
      author: author || "system",
    };
    if (effectiveDate) payload.effectiveDate = new Date(effectiveDate);

    const created = await Policy.create(payload);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("[POST /api/policies] error:", err);
    return NextResponse.json(
      { error: "Gagal membuat policy" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id)
      return NextResponse.json({ error: "id query required" }, { status: 400 });

    const body = await req.json();
    const update: any = {};
    const allowed = [
      "title",
      "type",
      "slug",
      "content",
      "effectiveDate",
      "author",
    ];
    for (const k of allowed) {
      if (body[k] !== undefined) update[k] = body[k];
    }
    if (update.effectiveDate)
      update.effectiveDate = new Date(update.effectiveDate);

    const updated = await Policy.findByIdAndUpdate(id, update, { new: true });
    if (!updated)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PUT /api/policies] error:", err);
    return NextResponse.json(
      { error: "Gagal mengupdate policy" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id)
      return NextResponse.json({ error: "id query required" }, { status: 400 });

    const deleted = await Policy.findByIdAndDelete(id);
    if (!deleted)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/policies] error:", err);
    return NextResponse.json(
      { error: "Gagal menghapus policy" },
      { status: 500 }
    );
  }
}
