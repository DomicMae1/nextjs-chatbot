"use client";

import { useState } from "react";

export default function ChatInput({
  onSend,
}: {
  onSend: (msg: string) => void;
}) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex p-4 bg-white border-t border-gray-200 text-black"
    >
      <input
        type="text"
        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 mr-2 focus:outline-none"
        placeholder="Ketik pesan..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
        Kirim
      </button>
    </form>
  );
}
