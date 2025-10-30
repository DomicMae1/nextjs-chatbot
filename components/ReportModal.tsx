/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ReportModal({
  userId,
  isOpen,
  onOpenChange,
  onReportAdded,
}: {
  userId: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onReportAdded?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title || !description) {
      console.error("Judul dan deskripsi wajib diisi!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, title, description, author }),
      });

      if (!res.ok) throw new Error("Gagal menyimpan laporan");

      setTitle("");
      setDescription("");
      setAuthor("");

      // Tutup modal
      onOpenChange(false);

      // Callback optional
      onReportAdded?.();

      // 🔄 Reload halaman
      window.location.reload();
    } catch (error) {
      console.error("Terjadi kesalahan saat menyimpan laporan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buat Laporan Baru</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input
            placeholder="Judul laporan"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Deskripsi laporan"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Input
            placeholder="Nama penulis (opsional)"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
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
