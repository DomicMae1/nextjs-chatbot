/* eslint-disable prefer-const */
"use client";

import { useEffect, useState, useMemo } from "react";
import { Sun, Moon } from "lucide-react";

interface ReleaseNote {
  _id: string;
  title: string;
  description: string;
  date: string;
}

interface GroupedNotes {
  [date: string]: ReleaseNote[]; // Key: tanggal (YYYY-MM-DD), Value: Array notes
}

export default function ReleaseNotesPage() {
  const [notes, setNotes] = useState<ReleaseNote[]>([]);
  const [theme, setTheme] = useState("dark");

  // Ambil tema dari localStorage
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) setTheme(saved);
  }, []);

  // Terapkan ke body + simpan ke localStorage
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  const isDark = theme === "dark";
  const bgBase = isDark ? "bg-gray-900" : "bg-white";
  const textBase = isDark ? "text-white" : "text-gray-900";

  const fetchNotes = async () => {
    try {
      // Ganti dengan endpoint API Anda
      const res = await fetch("/api/release-notes");
      if (!res.ok) throw new Error("Failed to fetch");
      let data: ReleaseNote[] = await res.json();
      // Pastikan diurutkan dari terbaru ke terlama oleh backend atau sort di sini
      data.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setNotes(data);
    } catch (error) {
      console.error("Error fetching release notes:", error);
      setNotes([]); // Set ke array kosong jika error
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const { groupedNotes, uniqueDates } = useMemo(() => {
    const groups: GroupedNotes = {};
    const dates: string[] = [];

    // Urutkan notes sekali lagi untuk memastikan (terbaru dulu)
    const sortedNotes = [...notes].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    sortedNotes.forEach((note) => {
      const dateKey = note.date.split("T")[0]; // Ambil YYYY-MM-DD
      if (!groups[dateKey]) {
        groups[dateKey] = [];
        dates.push(dateKey); // Tambahkan ke daftar tanggal unik
      }
      groups[dateKey].push(note);
    });
    return { groupedNotes: groups, uniqueDates: dates };
  }, [notes]); // Hitung ulang hanya jika notes berubah

  // Helper untuk format tanggal tampilan (contoh: October 26, 2025)
  const formatDisplayDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Gunakan format manual agar urutan sesuai keinginan
      const month = date.toLocaleString("en-US", { month: "long" }); // 👉 "October"
      const day = date.getUTCDate(); // gunakan UTC agar tidak geser hari
      const year = date.getUTCFullYear();

      return `${month} ${day}, ${year}`; // 👉 "October 29, 2025"
    } catch {
      return dateString; // fallback jika parsing gagal
    }
  };

  return (
    <div className={`min-h-screen ${bgBase} ${textBase} p-6 relative`}>
      {/* Container utama dibuat lebih lebar jika perlu */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          {" "}
          {/* Tambah margin-bottom */}
          <h1 className="text-3xl font-bold">📢 Release Notes</h1>{" "}
          {/* Besarkan judul */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-md ${
              // Gunakan p-2
              isDark
                ? "bg-gray-700 hover:bg-gray-600 text-yellow-300" // Warna ikon
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
            aria-label="Toggle theme" // Tambahkan aria-label
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* --- 1. Struktur Flex Container --- */}
        <div className="flex flex-col md:flex-row gap-12">
          {" "}
          {/* Gap antar kolom */}
          {/* Kolom Kiri: Konten Notes */}
          <div className="w-full md:w-3/4 space-y-12">
            {" "}
            {/* Lebar kolom kiri & space antar grup tanggal */}
            {notes.length === 0 ? (
              <div className="text-center py-10 text-gray-500 italic">
                Belum ada catatan rilis.
              </div>
            ) : (
              // Iterasi berdasarkan tanggal yang sudah dikelompokkan
              uniqueDates.map((dateKey) => {
                const notesForDate = groupedNotes[dateKey];
                const sectionId = `note-${dateKey}`; // --- 2. Buat ID unik ---

                return (
                  // Div untuk setiap grup tanggal
                  <div key={dateKey} id={sectionId} className="pt-2">
                    {" "}
                    {/* Tambahkan ID dan sedikit padding atas */}
                    <h2
                      className={`text-2xl font-semibold mb-6 pb-2 border-b ${
                        // Tambah margin-bottom & border
                        isDark ? "border-gray-700" : "border-gray-300"
                      }`}
                    >
                      {formatDisplayDate(dateKey)}{" "}
                      {/* Format tanggal tampilan */}
                    </h2>
                    {/* Render semua notes untuk tanggal ini */}
                    <div className="space-y-8">
                      {" "}
                      {/* Jarak antar notes di tanggal yang sama */}
                      {notesForDate.map((note) => (
                        <div key={note._id}>
                          <h3
                            className={`text-xl font-semibold mb-6 ${textBase}`}
                          >
                            {note.title || "Pembaruan"}
                          </h3>
                          <p
                            className={`whitespace-pre-wrap leading-relaxed text-base ${
                              isDark ? "text-gray-300" : "text-gray-700" // Warna teks deskripsi
                            }`}
                          >
                            {note.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {/* Kolom Kanan: Sidebar Navigasi Tanggal */}
          {uniqueDates.length > 0 && ( // Tampilkan sidebar hanya jika ada tanggal
            <div className="w-full md:w-1/4">
              {/* --- 4. Buat Sidebar Sticky --- */}
              <div className="sticky top-10">
                {" "}
                {/* Sesuaikan 'top-10' (padding dari atas) */}
                <h3
                  className={`text-sm font-semibold uppercase mb-4 ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Tanggal Rilis
                </h3>
                <ul className="space-y-2">
                  {uniqueDates.map((dateKey) => {
                    const sectionId = `note-${dateKey}`;
                    return (
                      <li key={dateKey}>
                        <a
                          href={`#${sectionId}`} // Link ke ID bagian
                          className={`block text-sm py-1 rounded ${
                            isDark
                              ? "text-gray-400 hover:text-white hover:bg-gray-700"
                              : "text-gray-600 hover:text-black hover:bg-gray-200"
                          }`}
                        >
                          {formatDisplayDate(dateKey)}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
