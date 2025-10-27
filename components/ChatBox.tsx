"use client";

import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check } from "lucide-react";

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
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

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

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Gagal menyalin teks:", err);
    }
  };

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
      className="flex-1 overflow-y-auto p-4 space-y-3 px-24 py-12"
    >
      {displayedMessages.map((m, i) => (
        <div
          key={i}
          className={`relative max-w-[60%] p-3 rounded-xl whitespace-pre-wrap ${
            m.sender === "user"
              ? "bg-blue-400 text-white"
              : "bg-gray-200 text-black pt-12 ml-auto"
          }`}
        >
          {/* Tombol Copy hanya untuk pesan AI */}
          {m.sender !== "user" && (
            <button
              onClick={() => handleCopy(m.text, i)}
              className="absolute top-2 right-2 text-xs text-gray-600 hover:text-gray-900 bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded transition flex justify-between items-center gap-2"
            >
              {copiedIndex === i ? (
                <>
                  <Check /> <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={20} />
                </>
              )}
            </button>
          )}
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
                <strong className="font-bold text-black">{children}</strong>
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
        <div className="bg-gray-200 text-gray-600 px-3 py-2 rounded-xl w-fit ml-auto">
          Mengetik...
        </div>
      )}
    </div>
  );
}
