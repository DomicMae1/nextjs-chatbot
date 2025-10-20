/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import ChatBox from "@/components/ChatBox";
import ChatInput from "@/components/ChatInput";
import { useRouter } from "next/navigation";

export default function ChatPage() {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
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

        // Simpan user ke MongoDB (jika belum ada)
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

        // ✅ Ambil data user dari MongoDB
        const resUser = await fetch(`/api/user/getUser?uid=${currentUser.uid}`);
        const userDb = await resUser.json();
        setUserData(userDb);

        // ✅ Ambil history chat user
        const resChat = await fetch(
          `/api/chat/history?userId=${currentUser.uid}`
        );
        const chatData = await resChat.json();

        const formatted = chatData
          .map((c: any) => [
            { sender: "user", text: c.message },
            { sender: "bot", text: c.response },
          ])
          .flat();

        setMessages(formatted);
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (!user) return <div className="p-8 text-center">Memeriksa login...</div>;

  const handleSend = async (message: string) => {
    if (!user) return;
    setMessages((prev) => [...prev, { sender: "user", text: message }]);
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, userId: user.uid }),
    });
    const data = await res.json();

    setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
    setLoading(false);
  };

  if (!user) return <div className="p-8 text-center">Memeriksa login...</div>;

  // 🔹 Gunakan nama user dari MongoDB, fallback ke Firebase
  const displayName = userData?.name || user?.displayName || "User";

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="flex justify-between items-center bg-gray-800 text-white px-4 py-4">
        <div className="flex items-center gap-3">
          {/* Nama dan Judul */}
          <div>
            <h1 className="text-lg font-bold">Chatbot</h1>
            <p className="text-xs opacity-75">Halo, {displayName}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm bg-red-500 px-3 py-1 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </header>
      <ChatBox messages={messages} loading={loading} />
      <ChatInput onSend={handleSend} />
    </div>
  );
}
