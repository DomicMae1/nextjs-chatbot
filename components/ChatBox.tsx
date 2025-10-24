"use client";

import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  sender: string;
  text: string;
}

interface ChatBoxProps {
  messages: Message[];
  loading: boolean;
  sessionId: string | null;
  userId: string | null;
}

export default function ChatBox({
  messages,
  loading,
  sessionId,
}: ChatBoxProps) {
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const [displayedMessages, setDisplayedMessages] = useState<Message[]>([]);

  // Kosongkan chat saat sessionId berubah
  useEffect(() => {
    setDisplayedMessages([]); // kosongkan dulu
  }, [sessionId]);

  // Update isi chat setelah messages baru datang
  useEffect(() => {
    if (messages.length > 0) {
      setDisplayedMessages(messages);
    }
  }, [messages]);

  // Scroll ke bawah setiap kali isi chat berubah
  useEffect(() => {
    if (chatContainerRef.current) {
      setTimeout(() => {
        chatContainerRef.current!.scrollTop =
          chatContainerRef.current!.scrollHeight;
      }, 100);
    }
  }, [displayedMessages]);

  // Jika belum pilih session
  if (!sessionId) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Pilih atau buat sesi chat untuk memulai.
      </div>
    );
  }

  // Jika sedang loading dan belum ada chat
  if (loading && displayedMessages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Memuat chat...
      </div>
    );
  }

  return (
    <div
      ref={chatContainerRef}
      className="flex-1 overflow-y-auto p-4 space-y-3"
    >
      {displayedMessages.map((m, i) => (
        <div
          key={i}
          className={`max-w-[75%] p-3 rounded-xl whitespace-pre-wrap ${
            m.sender === "user"
              ? "bg-blue-500 text-white ml-auto"
              : "bg-gray-100 text-gray-900"
          }`}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold mb-2">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-semibold mt-3 mb-1">{children}</h2>
              ),
              p: ({ children }) => <p className="mb-2">{children}</p>,
              strong: ({ children }) => (
                <strong className="font-bold text-blue-700">{children}</strong>
              ),
              li: ({ children }) => (
                <li className="ml-5 list-disc">{children}</li>
              ),
            }}
          >
            {m.text}
          </ReactMarkdown>
        </div>
      ))}

      {loading && displayedMessages.length > 0 && (
        <div className="bg-gray-200 text-gray-600 px-3 py-2 rounded-xl w-fit">
          Mengetik...
        </div>
      )}
    </div>
  );
}
