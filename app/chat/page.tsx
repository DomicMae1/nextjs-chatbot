/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import ChatBox from "@/components/ChatBox";
import ChatInput from "@/components/ChatInput";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
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
            await loadChatHistory(currentUser.uid, firstSessionId);
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

  const loadChatHistory = async (userId: string, sessionId: string) => {
    if (!userId || !sessionId) {
      setMessages([]);
      return;
    }
    setLoading(true);
    setMessages([]);
    try {
      const resChat = await fetch(
        `/api/chat/history?userId=${userId}&sessionId=${sessionId}`
      );
      if (!resChat.ok) throw new Error("Gagal memuat riwayat");
      const chatData = await resChat.json();

      const formatted = chatData
        .map((c: any) => [
          { sender: "user", text: c.message },
          { sender: "bot", text: c.response },
        ])
        .flat();

      setMessages(formatted);
    } catch (err) {
      console.error("Error loading history:", err);
      setMessages([
        {
          sender: "bot",
          text: "⚠️ Terjadi kesalahan saat memuat riwayat chat.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    if (!user) return;

    if (selectedSession === sessionId) return;

    setLoading(true);
    setMessages([]);
    setSelectedSession(sessionId);

    try {
      const resChat = await fetch(
        `/api/chat/history?userId=${user.uid}&sessionId=${sessionId}`
      );
      const chatData = await resChat.json();

      const formatted = chatData
        .map((c: any) => [
          { sender: "user", text: c.message },
          { sender: "bot", text: c.response },
        ])
        .flat();

      setMessages(formatted);
    } catch (err) {
      console.error(err);
      setMessages([
        {
          sender: "bot",
          text: "⚠️ Terjadi kesalahan saat memuat riwayat chat.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewSession = async () => {
    if (!user) return;

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
  };

  const handleSend = async (message: string) => {
    if (!user) return;

    let activeSession = selectedSession;
    if (!activeSession) {
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
      setMessages([]);
    }

    setMessages((prev) => [...prev, { sender: "user", text: message }]);
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        userId: user.uid,
        sessionId: activeSession,
      }),
    });

    const data = await res.json();

    if (messages.length === 0) {
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
      setSessions((prev) => prev.filter((s) => s._id !== sessionId));
    }
  };

  if (!user)
    return (
      <div className="p-8 text-center text-gray-700">Memeriksa login...</div>
    );

  const displayName = userData?.name || user?.displayName || "User";

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold">List Chat</h2>
          <button
            onClick={handleNewSession}
            className="text-sm bg-blue-600 px-2 py-1 rounded hover:bg-blue-700"
          >
            + Baru
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {sessions.length === 0 ? (
            <p className="text-sm text-gray-400 p-4">
              Belum ada sesi chat — buat baru untuk memulai
            </p>
          ) : (
            <ul>
              {sessions.map((s) => (
                <li
                  key={s._id}
                  className={`group px-3 py-3 border-b border-gray-800 hover:bg-gray-700 transition-colors cursor-pointer ${
                    selectedSession === s._id ? "bg-gray-700" : ""
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

                    <div className="flex gap-2 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRenameSession(s._id);
                        }}
                        className="text-xs bg-yellow-500 hover:bg-yellow-600 px-2 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSession(s._id);
                        }}
                        className="text-xs bg-red-500 hover:bg-red-600 px-2 py-1 rounded"
                      >
                        Hapus
                      </button>
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
          <div>
            <h1 className="text-lg font-bold">Chatbot</h1>
            <p className="text-xs opacity-75">Halo, {displayName}</p>
          </div>
        </header>

        <ChatBox messages={messages} loading={loading} />
        <ChatInput onSend={handleSend} />
      </div>
    </div>
  );
}
