"use client";

import { useEffect, useState, useRef } from "react";
import { Sun, Moon } from "lucide-react";

interface ReleaseNote {
  _id: string;
  title?: string;
  description: string;
  date: string;
}

export default function ReleaseNotesAdminPage() {
  const [notes, setNotes] = useState<ReleaseNote[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [theme, setTheme] = useState("dark");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 🌗 Theme setup
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  const isDark = theme === "dark";
  const bgBase = isDark ? "bg-gray-900" : "bg-gray-100";
  const textBase = isDark ? "text-white" : "text-gray-900";
  const cardBg = isDark
    ? "bg-gray-800 border-gray-700"
    : "bg-white border-gray-300";

  // 🧩 Fetch data
  const fetchNotes = async () => {
    const res = await fetch("/api/release-notes");
    const data = await res.json();
    setNotes(data);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // 📩 Tambah / Edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.description || !form.date) {
      alert("Deskripsi dan tanggal wajib diisi!");
      return;
    }

    const method = editingId ? "PUT" : "POST";
    const body = JSON.stringify({
      title: form.title,
      description: form.description,
      date: form.date,
      ...(editingId && { _id: editingId }),
    });

    const res = await fetch("/api/release-notes", {
      method,
      headers: { "Content-Type": "application/json" },
      body,
    });

    if (res.ok) {
      setForm({ title: "", description: "", date: "" });
      setEditingId(null);
      fetchNotes();
    } else {
      alert("Gagal menyimpan data");
    }
  };

  // 🗑️ Hapus
  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus release note ini?")) return;

    const res = await fetch(`/api/release-notes?id=${id}`, {
      method: "DELETE",
    });
    if (res.ok) fetchNotes();
    else alert("Gagal menghapus data");
  };

  // ✏️ Edit
  const handleEdit = (note: ReleaseNote) => {
    setEditingId(note._id);
    setForm({
      title: note.title || "",
      description: note.description,
      date: note.date.split("T")[0],
    });
  };

  // 🪄 Auto resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  }, [form.description]);

  return (
    <div className={`min-h-screen ${bgBase} ${textBase} p-6`}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">🛠️ Kelola Release Notes</h1>
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-md ${
              isDark
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Judul (opsional)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none transition-colors duration-300 ${
              isDark
                ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
            }`}
          />

          <textarea
            ref={textareaRef}
            placeholder="Tulis deskripsi perubahan..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={`w-full resize-none rounded-lg px-3 py-2 border focus:outline-none transition-colors duration-300 ${
              isDark
                ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400"
                : "bg-white text-gray-900 border-gray-300 placeholder-gray-500"
            }`}
            rows={5}
            style={{
              maxHeight: "200px",
              overflowY: "auto",
            }}
          />

          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none transition-colors duration-300 ${
              isDark
                ? "bg-gray-800 border-gray-700 text-white"
                : "bg-white border-gray-300 text-gray-900"
            }`}
          />

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {editingId ? "💾 Simpan Perubahan" : "➕ Tambah Catatan"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({ title: "", description: "", date: "" });
                }}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Batal
              </button>
            )}
          </div>
        </form>

        {/* List */}
        <ul className="space-y-4">
          {notes.length === 0 ? (
            <p className="text-center text-gray-500 italic py-10">
              Belum ada catatan rilis.
            </p>
          ) : (
            <ul className="space-y-4">
              {notes.map((note) => (
                <li
                  key={note._id}
                  className={`border rounded-xl p-5 shadow-md hover:shadow-lg transition-all flex flex-col sm:flex-row justify-between gap-3 sm:items-start ${cardBg}`}
                >
                  {/* Bagian kiri - konten */}
                  <div className="flex-1">
                    {note.title && (
                      <h3
                        className={`font-semibold mb-1 ${
                          isDark ? "text-blue-400" : "text-blue-600"
                        }`}
                      >
                        {note.title}
                      </h3>
                    )}
                    <p
                      className={`whitespace-pre-wrap leading-relaxed ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {note.description}
                    </p>
                    <p
                      className={`text-sm mt-2 ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      📅{" "}
                      {new Date(note.date).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Bagian kanan - tombol aksi */}
                  <div className="flex gap-2 sm:flex-col sm:gap-2 items-center sm:items-end">
                    <button
                      onClick={() => handleEdit(note)}
                      className="px-4 py-1.5 text-sm rounded-md font-medium bg-yellow-400 text-white hover:bg-yellow-500 transition"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(note._id)}
                      className="px-4 py-1.5 text-sm rounded-md font-medium bg-red-500 text-white hover:bg-red-600 transition"
                    >
                      🗑️ Hapus
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ul>
      </div>
    </div>
  );
}
