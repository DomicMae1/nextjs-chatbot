/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sun, Moon } from "lucide-react";

interface Trivia {
  question: string;
  options: string[];
  answer: string;
}

export default function TriviaGame() {
  const [trivia, setTrivia] = useState<Trivia | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [theme, setTheme] = useState("dark");

  // Ambil tema dari localStorage
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) setTheme(saved);
  }, []);

  // Terapkan ke body + simpan ke localStorage
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  const isDark = theme === "dark";
  const bgBase = isDark ? "bg-gray-900" : "bg-white";
  const textBase = isDark ? "text-white" : "text-gray-900";

  // ganti kedua fungsi ini di komponen TriviaGame

  const generateQuestion = async () => {
    setTrivia(null);
    setSelected(null);
    setFeedback("");
    try {
      const res = await fetch("/api/trivia");
      const data = await res.json();
      console.log("🔁 /api/trivia response:", data); // debug: lihat payload asli

      // sanity check: jika API mengirim object with question/options/answer
      if (
        !data ||
        typeof data.question !== "string" ||
        !Array.isArray(data.options) ||
        (typeof data.answer !== "string" && typeof data.answer !== "number")
      ) {
        console.warn("Unexpected trivia format, using fallback.");
        // fallback simple
        setTrivia({
          question: "Fallback: What is 2+2?",
          options: ["3", "4", "5", "22"],
          answer: "4",
        });
      } else {
        setTrivia({
          question: data.question,
          options: data.options,
          // normalisasikan answer jadi string supaya konsisten
          answer: String(data.answer),
        });
      }
    } catch (err) {
      console.error("Failed to fetch trivia:", err);
      setTrivia({
        question: "Network error fallback: What is 2+2?",
        options: ["3", "4", "5", "22"],
        answer: "4",
      });
    }
  };

  const normalizeText = (t: string) =>
    t
      .replace(/^[\s\.\)\-–:]+/, "") // hapus awalan seperti "A.", "1)", "- " dll
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

  const checkAnswer = (option: string) => {
    if (!trivia) return;

    // debug logging
    console.log("Clicked option raw:", option);
    console.log("Trivia answer raw:", trivia.answer);
    console.log("Trivia options:", trivia.options);

    // Normalisasi option yang diklik
    const optionNorm = normalizeText(option);

    // Normalisasi jawaban dari API
    const answerRaw = String(trivia.answer).trim();
    const answerNorm = normalizeText(answerRaw);

    // 1) Jika answer adalah single letter (A/B/C/D atau a,b,c...), coba cocokkan berdasarkan index
    const letterMatch = /^[A-Za-z]$/.test(answerRaw);
    if (letterMatch) {
      const letter = answerRaw.toUpperCase();
      const idx = letter.charCodeAt(0) - 65; // A->0, B->1...
      if (idx >= 0 && idx < trivia.options.length) {
        const mapped = normalizeText(trivia.options[idx]);
        setSelected(option);
        if (optionNorm === mapped || optionNorm === answerNorm) {
          setFeedback("✅ Correct!");
        } else {
          setFeedback(
            `❌ Wrong! The correct answer is "${trivia.options[idx]}"`
          );
        }
        return;
      }
    }

    // 2) Jika answer mengandung label seperti "A. Tokyo", hapus label dan cocokkan teks
    //    (normalizeText sudah menghapus awalan label)
    // 3) Coba direct match antara optionNorm dan answerNorm
    setSelected(option);
    if (optionNorm === answerNorm) {
      setFeedback("✅ Correct!");
      return;
    }

    // 4) Coba cari apakah answerNorm sama dengan salah satu opsi (bila API mengirim full answer text)
    const foundIndex = trivia.options.findIndex(
      (opt) => normalizeText(opt) === answerNorm
    );
    if (foundIndex !== -1) {
      // jika option yang diklik sama dengan opsi yang cocok
      if (normalizeText(trivia.options[foundIndex]) === optionNorm) {
        setFeedback("✅ Correct!");
      } else {
        setFeedback(
          `❌ Wrong! The correct answer is "${trivia.options[foundIndex]}"`
        );
      }
      return;
    }

    // 5) fallback: periksa apakah answer berupa index (0/1/2) atau string angka
    const numeric = Number(answerRaw);
    if (
      !Number.isNaN(numeric) &&
      numeric >= 0 &&
      numeric < trivia.options.length
    ) {
      const mapped = normalizeText(trivia.options[numeric]);
      if (optionNorm === mapped) {
        setFeedback("✅ Correct!");
      } else {
        setFeedback(
          `❌ Wrong! The correct answer is "${trivia.options[numeric]}"`
        );
      }
      return;
    }

    // 6) terakhir: kalau semua gagal, bandingkan partial (contains)
    if (optionNorm.includes(answerNorm) || answerNorm.includes(optionNorm)) {
      setFeedback("✅ Correct!");
    } else {
      setFeedback(`❌ Wrong! The correct answer is "${trivia.answer}"`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-lg mb-10">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          🧙‍♂️ <span>AI Trivia Game</span>
        </h1>

        <button
          onClick={toggleTheme}
          className={`p-2 rounded-xl transition-colors duration-200 shadow-sm flex items-center justify-center ${
            isDark
              ? "bg-gray-800 hover:bg-gray-700 text-yellow-300"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* Main content */}
      {!trivia ? (
        <Button onClick={generateQuestion}>Generate Question</Button>
      ) : (
        <Card className="w-full max-w-lg shadow-lg p-4">
          <CardContent>
            <h2 className="text-xl font-semibold mb-4">{trivia.question}</h2>
            <div className="grid gap-3">
              {trivia.options.map((option, idx) => (
                <Button
                  key={idx}
                  variant={selected === option ? "secondary" : "outline"}
                  onClick={() => checkAnswer(option)}
                >
                  {option}
                </Button>
              ))}
            </div>

            {feedback && (
              <p className="mt-4 text-center font-medium">{feedback}</p>
            )}

            <div className="mt-6 text-center">
              <Button variant="ghost" onClick={generateQuestion}>
                🔄 New Question
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
