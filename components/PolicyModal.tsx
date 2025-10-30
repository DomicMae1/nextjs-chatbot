"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export interface Policy {
  _id?: string;
  title: string;
  type: "terms" | "privacy" | "other";
  content: string;
  effectiveDate?: string;
  author?: string;
}

export default function PolicyModal({
  isOpen,
  onOpenChange,
  onSaved,
  editData,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  editData?: Policy | null;
}) {
  const [form, setForm] = useState<Policy>({
    title: "",
    type: "terms",
    content: "",
    author: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editData) setForm(editData);
    else
      setForm({
        title: "",
        type: "terms",
        content: "",
        author: "",
      });
  }, [editData]);

  const handleChange = (key: keyof Policy, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.content) {
      alert("Judul dan konten wajib diisi!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        editData ? `/api/policies?id=${editData._id}` : "/api/policies",
        {
          method: editData ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      if (!res.ok) throw new Error("Gagal menyimpan data");
      onSaved();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan policy");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editData ? "Edit Policy" : "Tambah Policy"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label>Judul</Label>
            <Input
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Judul policy"
            />
          </div>

          <div>
            <Label>Tipe</Label>
            <select
              className="border border-gray-300 rounded-md p-2 w-full"
              value={form.type}
              onChange={(e) =>
                handleChange("type", e.target.value as Policy["type"])
              }
            >
              <option value="terms">Terms of Service</option>
              <option value="privacy">Privacy Policy</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <Label>Konten</Label>
            <Textarea
              rows={6}
              value={form.content}
              onChange={(e) => handleChange("content", e.target.value)}
              placeholder="Isi policy (HTML / Markdown)"
            />
          </div>

          <div>
            <Label>Tanggal Berlaku</Label>
            <Input
              type="date"
              value={form.effectiveDate?.slice(0, 10) || ""}
              onChange={(e) => handleChange("effectiveDate", e.target.value)}
            />
          </div>

          <div>
            <Label>Penulis</Label>
            <Input
              value={form.author || ""}
              onChange={(e) => handleChange("author", e.target.value)}
              placeholder="Nama penulis (opsional)"
            />
          </div>
        </div>

        <DialogFooter>
          <Button disabled={loading} onClick={handleSubmit}>
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
