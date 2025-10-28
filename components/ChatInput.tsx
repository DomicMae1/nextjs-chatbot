"use client";

import { useState, useEffect, useRef } from "react";

export default function ChatInput({
  onSend,
  disabled = false,
}: {
  onSend: (msg: string) => void;
  disabled?: boolean;
}) {
  const [input, setInput] = useState("");
  const [isDark, setIsDark] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 🌗 Deteksi mode dari <html class="dark">
  useEffect(() => {
    const checkTheme = () =>
      setIsDark(document.documentElement.classList.contains("dark"));

    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input);
      setInput("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex items-end p-4.5 border-t transition-colors duration-300 ${
        isDark
          ? "bg-gray-800 border-gray-700"
          : "bg-gray-100 border-gray-200 text-black"
      }`}
    >
      <textarea
        ref={textareaRef}
        className={`flex-1 resize-none rounded-lg px-3 py-2 mr-2 focus:outline-none border transition-colors duration-300 ${
          isDark
            ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400"
            : "bg-white text-gray-900 border-gray-300 placeholder-gray-500"
        }`}
        placeholder="Ketik pesan... (Shift + Enter untuk baris baru)"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={disabled}
      />
      <button
        type="submit"
        className={`px-4 py-2 rounded transition-colors duration-300 ${
          isDark
            ? "bg-blue-500 hover:bg-blue-600 text-white disabled:bg-blue-900 disabled:opacity-50"
            : "bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-300 disabled:cursor-not-allowed"
        }`}
        disabled={disabled || !input.trim()}
      >
        Kirim
      </button>
    </form>
  );
}
