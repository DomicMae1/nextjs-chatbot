/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import ChatBox from "@/components/ChatBox";
import ChatInput from "@/components/ChatInput";
import SearchModal from "@/components/SearchModal";
import { useRouter } from "next/navigation";
import {
  SquarePen,
  Pencil,
  Trash2,
  Columns2,
  Search,
  Pin,
  PinOff,
  Sun,
  Moon,
} from "lucide-react";

interface Message {
  sender: string;
  text: string;
}

interface Session {
  _id: string;
  userId: string;
  title: string;
  preview?: string;
  createdAt?: string;
  matchedText?: string;
  isPinned?: boolean;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [theme, setTheme] = useState("dark");
  const router = useRouter();

  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) setTheme(saved);
  }, []);

  // 🌗 Update theme ke body dan simpan ke localStorage
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleLogout = async () => {
    await signOut(auth);
    setMessages([]);
    setSessions([]);
    setSelectedSession(null);
    setUser(null);
    setUserData(null);
    router.push("/login");
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
        setLoading(true);

        await fetch("/api/user/saveUser", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid: currentUser.uid,
            email: currentUser.email,
            name: currentUser.displayName,
            photoURL: currentUser.photoURL,
          }),
        });

        const resUser = await fetch(`/api/user/getUser?uid=${currentUser.uid}`);
        const userDb = await resUser.json();
        setUserData(userDb);

        try {
          const resSessions = await fetch(
            `/api/chat/sessions?userId=${currentUser.uid}`
          );
          if (!resSessions.ok) throw new Error("Gagal mengambil sesi");
          const sessionsData: Session[] = (await resSessions.json()) || []; // Ambil data

          // --- TAMBAHKAN LOGIKA PENGURUTAN DI SINI ---
          sessionsData.sort((a, b) => {
            // Prioritaskan yang di-pin
            if (a.isPinned && !b.isPinned) return -1; // a (pinned) duluan
            if (!a.isPinned && b.isPinned) return 1; // b (pinned) duluan

            // Jika status pin sama, urutkan berdasarkan tanggal descending (terbaru dulu)
            // Pastikan createdAt ada dan valid sebelum mengurutkan
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          });
          setSessions(sessionsData);

          if (sessionsData.length > 0) {
            const firstSessionId = sessionsData[0]._id;
            setSelectedSession(firstSessionId);

            try {
              const res = await fetch(
                `/api/chat/history?userId=${currentUser.uid}&sessionId=${firstSessionId}`
              );

              if (!res.ok) throw new Error("Gagal memuat chat session");

              const data = await res.json();

              const formatted = data
                .map((c: any) => [
                  { sender: "user", text: c.message },
                  { sender: "bot", text: c.response },
                ])
                .flat();

              setMessages(formatted);
            } catch (err) {
              console.error("Gagal memuat history awal:", err);
              setMessages([
                { sender: "bot", text: "⚠️ Gagal memuat riwayat chat." },
              ]);
            } finally {
              setLoading(false);
            }
          } else {
            setSelectedSession(null);
            setMessages([]);
            setLoading(false);
          }
        } catch (error) {
          console.error("Error fetching initial data:", error);
          setSessions([]);
          setSelectedSession(null);
          setMessages([{ sender: "bot", text: "Gagal memuat daftar sesi." }]);
          setLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSelectSession = async (sessionId: string) => {
    if (!user) return;
    if (selectedSession === sessionId) return;

    // 🔹 Kosongkan dulu
    setMessages([]);
    setSelectedSession(sessionId);
    setLoading(true);

    // 🔹 Tambahkan sedikit delay agar transisi halus
    await new Promise((r) => setTimeout(r, 80));

    try {
      const res = await fetch(
        `/api/chat/history?userId=${user.uid}&sessionId=${sessionId}`
      );

      if (!res.ok) throw new Error("Gagal memuat chat session");

      const data = await res.json();

      const formatted = data
        .map((c: any) => [
          { sender: "user", text: c.message },
          { sender: "bot", text: c.response },
        ])
        .flat();

      setMessages(formatted);
    } catch (err) {
      console.error(err);
      setMessages([{ sender: "bot", text: "⚠️ Gagal memuat riwayat chat." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewSession = async () => {
    if (!user) return;

    // Kosongkan chat box sebelum bikin sesi baru
    setMessages([]);

    const resNewSession = await fetch("/api/chat/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.uid,
        title: "Chat Baru",
      }),
    });

    const newSession = await resNewSession.json();
    setSessions((prev) => [newSession, ...prev]);
    setSelectedSession(newSession._id);

    // Pastikan tampilan kosong dulu sebelum user kirim pesan pertama
    await new Promise((r) => setTimeout(r, 50));
  };

  const handleSend = async (message: string) => {
    if (!user || !message.trim()) return;

    let activeSession = selectedSession;
    let isNewSession = false;

    // 🔹 Jika belum ada sesi, buat baru dengan placeholder "Chat Baru"
    if (!activeSession) {
      isNewSession = true;
      const resNewSession = await fetch("/api/chat/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          title: "Chat Baru",
          preview: "",
        }),
      });

      const newSession = await resNewSession.json();
      activeSession = newSession._id;

      setSelectedSession(activeSession);
      setSessions((prev) => [newSession, ...prev]);
    }

    // 🔹 Tambahkan pesan user ke UI
    setMessages((prev) => [...prev, { sender: "user", text: message }]);
    setLoading(true);

    // 🔹 Kirim pesan ke backend
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.uid,
        sessionId: activeSession,
        message,
      }),
    });

    const data = await res.json();

    // 🔹 Jika judul masih "Chat Baru", ubah jadi ringkasan dari pesan pertama user
    const currentSession = sessions.find((s) => s._id === activeSession);
    if (currentSession && currentSession.title === "Chat Baru") {
      // 🔹 Helper untuk ubah ke Title Case
      const toTitleCase = (text: string) => {
        return text
          .toLowerCase()
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      };

      const summaryTitleRaw =
        message.length > 60
          ? message.substring(0, 60).split(/[.!?]/)[0] + "..."
          : message;

      const summaryTitle = toTitleCase(summaryTitleRaw);

      const previewText =
        message.length > 50 ? message.substring(0, 50) + "..." : message;

      // 🔹 Update langsung ke database
      const updateRes = await fetch(`/api/chat/sessions/${activeSession}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: summaryTitle,
          preview: previewText,
        }),
      });

      if (updateRes.ok) {
        console.log("✅ Updated title & preview:", summaryTitle, previewText);

        // 🔹 Update state di frontend juga
        setSessions((prev) =>
          prev.map((s) =>
            s._id === activeSession
              ? { ...s, title: summaryTitle, preview: previewText }
              : s
          )
        );
      } else {
        console.error("❌ Gagal update title & preview di database");
      }
    }

    // 🔹 Tambahkan respons bot
    setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
    setLoading(false);
  };

  const handleRenameSession = async (sessionId: string) => {
    const newTitle = prompt("Masukkan nama baru:");
    if (!newTitle) return;

    const res = await fetch(`/api/chat/sessions/${sessionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });

    if (res.ok) {
      const updated = await res.json();
      setSessions((prev) =>
        prev.map((s) => (s._id === sessionId ? updated : s))
      );
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    const confirmDelete = confirm("Yakin ingin menghapus session ini?");
    if (!confirmDelete) return;

    const res = await fetch(`/api/chat/sessions/${sessionId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      // 1. Hitung daftar sesi baru terlebih dahulu
      const newSessions = sessions.filter((s) => s._id !== sessionId);

      // 2. Perbarui state daftar sesi
      setSessions(newSessions); // 3. Cek apakah sesi yang dihapus adalah sesi yang sedang aktif

      if (selectedSession === sessionId) {
        // 4. Jika ya, pilih sesi baru
        if (newSessions.length > 0) {
          // Pilih sesi pertama dari daftar baru sebagai ganti
          setSelectedSession(newSessions[0]._id);
        } else {
          // Jika tidak ada sesi tersisa, kosongkan semuanya
          setSelectedSession(null);
          setMessages([]); // <-- Ini penting untuk membersihkan chatbox
        }
      }
      // Jika sesi yang dihapus BUKAN yang aktif, kita tidak perlu melakukan apa-apa lagi
    }
  };

  const handlePinSession = async (
    sessionId: string,
    currentStatus: boolean | undefined
  ) => {
    if (!user) return;
    const newPinStatus = !currentStatus; // Toggle status

    // Optimistic UI Update & Sort
    setSessions((prev) => {
      const updatedSessions = prev.map((s) =>
        s._id === sessionId ? { ...s, isPinned: newPinStatus } : s
      );
      // Urutkan ulang setelah update pin status
      updatedSessions.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1; // a (pinned) comes first
        if (!a.isPinned && b.isPinned) return 1; // b (pinned) comes first
        // If pin status is the same, sort by date descending (newest first)
        return (
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );
      });
      return updatedSessions;
    });
    setOpenMenu(null); // Tutup menu

    try {
      // Panggil API backend untuk update
      const res = await fetch(`/api/chat/sessions/${sessionId}/pin`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: newPinStatus }),
      });

      if (!res.ok) {
        // Rollback jika API gagal
        console.error("Gagal update pin status di backend");
        setSessions((prev) => {
          const rolledBackSessions = prev.map(
            (s) => (s._id === sessionId ? { ...s, isPinned: currentStatus } : s) // Kembalikan status lama
          );
          rolledBackSessions.sort((a, b) => {
            // Urutkan lagi
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return (
              new Date(b.createdAt || 0).getTime() -
              new Date(a.createdAt || 0).getTime()
            );
          });
          return rolledBackSessions;
        });
      }
      // Jika berhasil, UI sudah optimis terupdate
    } catch (error) {
      // Rollback jika ada error network
      console.error("Error saat pin session:", error);
      setSessions((prev) => {
        const rolledBackSessions = prev.map((s) =>
          s._id === sessionId ? { ...s, isPinned: currentStatus } : s
        );
        rolledBackSessions.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
        });
        return rolledBackSessions;
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Jika menu ada DAN target klik TIDAK berada di dalam menu
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(null); // Tutup menu
      }
    };

    // Tambahkan listener HANYA jika menu terbuka
    if (openMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      // Hapus listener jika menu tertutup (ini penting!)
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Fungsi cleanup: Hapus listener saat komponen unmount ATAU sebelum effect berjalan lagi
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenu]);

  const isDark = theme === "dark";
  const bgBase = isDark ? "bg-gray-900" : "bg-white";
  const textBase = isDark ? "text-white" : "text-gray-900";
  const sidebarBg = isDark
    ? "bg-gray-900 border-gray-600 border-r"
    : "bg-white border-gray-300 border-r";
  const hoverBg = isDark ? "hover:bg-gray-700" : "hover:bg-gray-200";

  if (!user)
    return (
      <div className="p-8 text-center text-gray-700">Memeriksa login...</div>
    );

  const displayName = userData?.name || user?.displayName || "User";

  return (
    <div className={`flex h-screen ${bgBase} ${textBase}`}>
      <aside
        className={`${sidebarBg} flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "w-64" : "w-20"
        } overflow-hidden`}
      >
        {/* Header */}
        <div
          className={`p-4 ${
            isDark ? "border-gray-700" : "border-gray-200"
          } flex items-center ${
            isSidebarOpen ? "justify-between" : "justify-center"
          }`}
        >
          {isSidebarOpen && (
            <h2 className="text-lg font-semibold ml-2">List Chat</h2>
          )}
          <button
            onClick={handleToggleSidebar}
            className={`p-2 rounded-md ${hoverBg} transition-colors`}
          >
            <Columns2 size={20} />
          </button>
        </div>

        {/* Tombol utama */}
        <div
          className={`w-full px-2 pt-4 pb-4 flex flex-col ${
            isSidebarOpen ? "items-stretch" : "items-center"
          }`}
        >
          <button
            onClick={handleNewSession}
            className={`text-sm px-3 py-2 rounded-xl ${hoverBg} flex items-center gap-2 ${
              isSidebarOpen ? "justify-start" : "justify-center w-12 h-12"
            }`}
          >
            <SquarePen size={18} />
            {isSidebarOpen && <span>New Chat</span>}
          </button>
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className={`text-sm px-3 py-2 rounded-xl ${hoverBg} flex items-center gap-2 mt-2 ${
              isSidebarOpen ? "justify-start" : "justify-center w-12 h-12"
            }`}
          >
            <Search size={18} />
            {isSidebarOpen && <span>Search Chat</span>}
          </button>
        </div>

        {/* List sesi chat */}
        <div className="flex-1 overflow-y-auto p-2">
          {isSidebarOpen && (
            <>
              {sessions.length === 0 ? (
                <p className="text-sm text-gray-400 p-4">
                  Belum ada sesi chat — buat baru untuk memulai
                </p>
              ) : (
                <ul className="space-y-2">
                  {sessions.map((s) => (
                    <li
                      key={s._id}
                      className={`group relative px-3 py-3 hover:bg-gray-700 hover:text-white rounded-xl ${
                        selectedSession === s._id
                          ? "bg-gray-700 text-white"
                          : ""
                      }`}
                      onClick={() => handleSelectSession(s._id)}
                    >
                      {s.isPinned && (
                        <Pin
                          size={20}
                          className="absolute -top-2 left-0 text-yellow-400"
                        />
                      )}
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">
                            {s.title || "Chat tanpa judul"}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {s.preview || ""}
                          </p>
                        </div>
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenu(openMenu === s._id ? null : s._id);
                            }}
                            className="p-2 hover:bg-gray-600 rounded-md transition-colors"
                          >
                            ...
                          </button>
                          {openMenu === s._id && (
                            <div
                              ref={menuRef}
                              className="absolute right-0 mt-2 w-28 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10"
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePinSession(s._id, s.isPinned);
                                }}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-700 flex justify-start items-center gap-2"
                              >
                                {s.isPinned ? (
                                  <PinOff size={16} />
                                ) : (
                                  <Pin size={16} />
                                )}
                                {s.isPinned ? "Lepas Sematan" : "Sematkan"}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenu(null);
                                  handleRenameSession(s._id);
                                }}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-700 flex justify-start items-center gap-2"
                              >
                                <Pencil size={16} /> Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenu(null);
                                  handleDeleteSession(s._id);
                                }}
                                className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-700 flex justify-start items-center gap-2"
                              >
                                <Trash2 size={16} /> Hapus
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>

        {/* Sidebar user — TETAP dirender */}
        <div
          className={`py-4 px-2 transition-colors duration-300 ${
            isSidebarOpen && isDark ? "border-gray-700" : ""
          }`}
        >
          {isSidebarOpen && (
            <button
              onClick={handleLogout}
              className="w-full text-sm bg-red-500 px-3 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          )}
        </div>
      </aside>

      <div className="flex flex-col flex-1">
        <header
          className={`flex justify-between items-center ${
            isDark ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-900"
          } px-4 py-4`}
        >
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-lg font-bold">Chatbot</h1>
              <p className="text-xs opacity-75">Halo, {displayName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Tombol Dark/Light mode */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-md ${
                isDark ? "hover:bg-gray-700" : "hover:bg-gray-300"
              } transition`}
              title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
        </header>

        <ChatBox
          key={selectedSession}
          messages={messages}
          loading={loading}
          sessionId={selectedSession}
          userId={user?.uid}
        />
        <ChatInput onSend={handleSend} />
      </div>
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        userId={user?.uid}
        onSelectSession={handleSelectSession}
        sessions={sessions}
      />
    </div>
  );
}
