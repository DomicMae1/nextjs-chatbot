/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import ChatBox from "@/components/ChatBox";
import ChatInput from "@/components/ChatInput";
import { useRouter } from "next/navigation";
import { SquarePen, Pencil, Trash2, Columns2 } from "lucide-react";

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
  const router = useRouter();

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
          const sessionsData = (await resSessions.json()) || [];
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

    // 🔹 Jika belum ada sesi, buat baru
    if (!activeSession) {
      isNewSession = true;
      const resNewSession = await fetch("/api/chat/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          title: message.substring(0, 30) || "Chat Baru",
        }),
      });

      const newSession = await resNewSession.json();
      activeSession = newSession._id;

      setSelectedSession(activeSession);
      setSessions((prev) => [newSession, ...prev]);
    }

    // 🔹 Tambahkan pesan user dulu di UI
    setMessages((prev) => [...prev, { sender: "user", text: message }]);
    setLoading(true);

    // 🔹 Kirim ke backend
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.uid,
        sessionId: activeSession,
        message, // kirim pesan terbaru, bukan array
      }),
    });

    const data = await res.json();

    // 🔹 Update judul sesi kalau baru dibuat
    if (isNewSession) {
      await fetch(`/api/chat/sessions/${activeSession}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: message.substring(0, 30) || "Chat Baru",
        }),
      });

      setSessions((prev) =>
        prev.map((s) =>
          s._id === activeSession
            ? { ...s, title: message.substring(0, 30) || "Chat Baru" }
            : s
        )
      );
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

  if (!user)
    return (
      <div className="p-8 text-center text-gray-700">Memeriksa login...</div>
    );

  const displayName = userData?.name || user?.displayName || "User";

  return (
    <div className="flex h-screen bg-gray-100">
      <aside
        className={`bg-gray-900 text-white flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "w-64" : "w-0"
        } overflow-hidden`}
      >
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold">List Chat</h2>
        </div>

        <div className="w-full px-2 pt-4 pb-4 ">
          <button
            onClick={handleNewSession}
            className="w-58 font-medium px-3 py-4 text-left rounded-xl hover:bg-gray-700 transition-colors gap-2 flex justify-start items-center"
          >
            <SquarePen size={20} /> Baru
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {sessions.length === 0 ? (
            <p className="text-sm text-gray-400 p-4">
              Belum ada sesi chat — buat baru untuk memulai
            </p>
          ) : (
            <ul className="space-y-2">
              {sessions.map((s) => (
                <li
                  key={s._id}
                  className={`group px-3 py-3 border-b border-gray-800 hover:bg-gray-700 rounded-xl transition-colors cursor-pointer ${
                    selectedSession === s._id ? "bg-gray-700 rounded-xl" : ""
                  }`}
                  onClick={() => handleSelectSession(s._id)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="font-medium truncate">
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
                        ⋯
                      </button>

                      {/* Popout menu */}
                      {openMenu === s._id && (
                        <div className="absolute right-0 mt-2 w-28 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenu(null);
                              handleRenameSession(s._id);
                            }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-700 flex justify-start items-center gap-2"
                          >
                            <Pencil size={20} /> Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenu(null);
                              handleDeleteSession(s._id);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-700 flex justify-start items-center gap-2"
                          >
                            <Trash2 size={20} /> Hapus
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full text-sm bg-red-500 px-3 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="flex flex-col flex-1">
        <header className="flex justify-between items-center bg-gray-800 text-white px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleToggleSidebar}
              className="p-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              <Columns2 size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold">Chatbot</h1>
              <p className="text-xs opacity-75">Halo, {displayName}</p>
            </div>
          </div>
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
    </div>
  );
}
