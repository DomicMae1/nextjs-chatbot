/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function GET() {
  try {
    // 🔀 Gunakan angka acak untuk memicu variasi tiap permintaan
    const randomSeed = Math.floor(Math.random() * 1000000);

    // 🧠 Prompt agar AI selalu hasilkan pertanyaan berbeda dan natural
    const prompt = `
      You are an AI Trivia Creator powered by Groq.
      Generate one *unique* trivia question that has never been repeated before.
      Make it fun, challenging, and written in **English**.
      Include 4 multiple-choice options (A, B, C, D).
      Randomize the correct answer.
      Use this random seed for variation: ${randomSeed}

      Return only a valid JSON in this exact format:
      {
        "question": "string",
        "options": ["A", "B", "C", "D"],
        "answer": "A"
      }

      Example:
      {
        "question": "What planet has the most moons?",
        "options": ["Earth", "Jupiter", "Mars", "Saturn"],
        "answer": "Saturn"
      }
    `;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 1.2, // 🌡️ tambahkan variasi agar tidak monoton
      messages: [
        {
          role: "system",
          content:
            "You are a creative and accurate trivia generator using Groq AI. Always respond in valid JSON.",
        },
        { role: "user", content: prompt },
      ],
    });

    const text = completion.choices[0]?.message?.content || "{}";

    let trivia;
    try {
      trivia = JSON.parse(text);
    } catch (err) {
      console.warn("⚠️ Invalid JSON returned:", text);
      trivia = {
        question: "Which element has the chemical symbol 'O'?",
        options: ["Oxygen", "Gold", "Osmium", "Oganesson"],
        answer: "Oxygen",
      };
    }

    return NextResponse.json(trivia);
  } catch (error: any) {
    console.error("❌ Trivia generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate trivia question" },
      { status: 500 }
    );
  }
}
