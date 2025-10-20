/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
// import Image from "next/image";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi tidak sama");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setSuccess("✅ Pendaftaran berhasil! Mengarahkan ke halaman login...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError("❌ Gagal mendaftar: " + err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-white">
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md shadow-xl rounded-2xl p-8 w-[90%] max-w-md">
        <div className="flex flex-col items-center mb-6">
          {/* <Image
            src="/chatbot-logo.svg"
            alt="Chatbot Logo"
            width={60}
            height={60}
            className="mb-3"
          /> */}
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Buat Akun Baru 🌱
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-1 text-center">
            Daftar untuk mulai berbicara dengan Chatbot AI kami
          </p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 text-green-700 px-4 py-2 rounded-md mb-4 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              placeholder="contoh@email.com"
              className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-md p-2.5 focus:ring-2 focus:ring-green-500 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1 font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              type="password"
              placeholder="Minimal 6 karakter"
              className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-md p-2.5 focus:ring-2 focus:ring-green-500 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1 font-medium text-gray-700 dark:text-gray-300">
              Konfirmasi Password
            </label>
            <input
              type="password"
              placeholder="Ulangi password"
              className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-md p-2.5 focus:ring-2 focus:ring-green-500 focus:outline-none"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-md transition-all duration-200"
          >
            Daftar Sekarang
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            Sudah punya akun?{" "}
            <a
              href="/login"
              className="text-green-600 hover:underline font-medium"
            >
              Login di sini
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
