"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

// Definisikan tipe Session di sini juga
interface Session {
  _id: string;
  userId: string;
  title: string;
  preview?: string;
  createdAt?: string;
  matchedText?: string; // Teks yang cocok dari hasil pencarian
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  onSelectSession: (sessionId: string) => void;
  sessions: Session[];
}

export default function SearchModal({
  isOpen,
  onClose,
  userId,
  onSelectSession,
  sessions,
}: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Session[]>([]);
  const [isSearching, setIsSearching] = useState(false); // ... (Semua useEffect dan handler di atas sudah benar, tidak perlu diubah) ...

  useEffect(() => {
    // Jangan cari jika query kosong atau user tidak ada
    if (!searchQuery.trim() || !userId) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const fetchSearch = async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `/api/chat/sessions/search?q=${encodeURIComponent(
            searchQuery
          )}&userId=${userId}`
        );
        if (!res.ok) throw new Error("Gagal mencari data");
        const data = await res.json();
        setSearchResults(data || []);
      } catch (err) {
        console.error("Gagal mencari session:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }; // Debounce: Tunda pencarian 400ms setelah user berhenti mengetik

    const timeout = setTimeout(fetchSearch, 400);
    return () => clearTimeout(timeout);
  }, [searchQuery, userId]); // Efek untuk mereset state saat modal ditutup

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [isOpen]); // Handler saat hasil pencarian diklik

  const handleResultClick = (sessionId: string) => {
    onSelectSession(sessionId); // Pilih sesi di halaman utama
    onClose(); // Tutup modal
  }; // Jangan render apa-apa jika modal tidak terbuka

  if (!isOpen) return null;

  return (
    <div // Latar belakang overlay
      className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-20 pt-20"
      onClick={onClose} // Tutup modal saat klik di luar
    >
      <div // Konten Modal
        className="relative w-full max-w-2xl rounded-lg bg-gray-800 shadow-xl"
        onClick={(e) => e.stopPropagation()} // Hindari penutupan saat klik di dalam
      >
        <div className="flex items-center border-b border-gray-700 p-4">
          <Search size={20} className="text-gray-400 mr-3" />

          <input
            type="text"
            placeholder="Cari di semua sesi chat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-lg focus:outline-none text-gray-200 placeholder-gray-400"
          />

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full"
          >
            <X size={24} />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {isSearching && (
            <p className="text-center text-gray-400">Mencari...</p>
          )}
          {!isSearching && searchQuery && searchResults.length === 0 && (
            <p className="text-center text-gray-400">
              Tidak ada hasil ditemukan untuk &quot;{searchQuery}
              &quot;
            </p>
          )}
          {!isSearching && searchQuery && searchResults.length > 0 && (
            <>
              <p className="text-xs font-semibold uppercase text-gray-400 mb-2 px-1">
                Hasil Pencarian
              </p>
              <ul className="space-y-2">
                {searchResults.map((s) => (
                  <li
                    key={s._id}
                    onClick={() => handleResultClick(s._id)}
                    className="rounded-lg p-3 hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <p className="font-semibold text-white truncate">
                      {s.title || "Tanpa Judul"}
                    </p>
                    {s.matchedText && (
                      <p className="text-sm text-gray-300 italic truncate">
                        ...{s.matchedText}...
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}

          {!isSearching && !searchQuery && (
            <>
              <p className="text-xs font-semibold uppercase text-gray-400 mb-2 px-1">
                Sesi Terkini
              </p>
              {sessions.length > 0 ? (
                <ul className="space-y-2">
                  {sessions.map((s) => (
                    <li
                      key={s._id}
                      onClick={() => handleResultClick(s._id)}
                      className="rounded-lg p-3 hover:bg-gray-700 cursor-pointer transition-colors"
                    >
                      <p className="font-semibold text-white truncate">
                        {s.title || "Tanpa Judul"}
                      </p>
                      {s.preview && (
                        <p className="text-sm text-gray-300 italic truncate">
                          {s.preview}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-400">
                  Belum ada sesi chat.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
