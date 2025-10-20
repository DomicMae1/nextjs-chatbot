"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  sender: string;
  text: string;
}

export default function ChatBox({
  messages,
  loading,
}: {
  messages: Message[];
  loading: boolean;
}) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((m, i) => (
        <div
          key={i}
          className={`max-w-[75%] p-3 rounded-xl whitespace-pre-wrap ${
            m.sender === "user"
              ? "bg-blue-500 text-white ml-auto"
              : "bg-gray-100 text-gray-900"
          }`}
        >
          {/* Gunakan ReactMarkdown agar teks bisa di-style seperti dokumen */}
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

      {loading && (
        <div className="bg-gray-200 text-gray-600 px-3 py-2 rounded-xl w-fit">
          Mengetik...
        </div>
      )}
    </div>
  );
}
