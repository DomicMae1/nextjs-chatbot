/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage(
        "✅ Email reset password telah dikirim. Silakan cek kotak masuk Anda."
      );
      setEmail("");
    } catch (err: any) {
      setError("❌ Gagal mengirim email reset: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-200 to-purple-200 p-4">
      <div className="relative bg-white/40 backdrop-blur-md border border-white/50 shadow-xl rounded-2xl p-8 w-full max-w-md transition-all duration-300 hover:shadow-2xl">
        {/* Logo atau Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-800 mb-1">
            Reset Password
          </h1>
          <p className="text-gray-600 text-sm">
            Masukkan email Anda untuk mengatur ulang kata sandi.
          </p>
        </div>

        {/* Notifikasi */}
        {error && (
          <p className="text-red-600 bg-red-100 border border-red-200 rounded p-2 mb-3 text-sm">
            {error}
          </p>
        )}
        {message && (
          <p className="text-green-700 bg-green-100 border border-green-200 rounded p-2 mb-3 text-sm">
            {message}
          </p>
        )}

        {/* Form */}
        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="email"
            placeholder="Masukkan email Anda"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-lg text-white font-medium transition-all duration-300 ${
              loading
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 shadow"
            }`}
          >
            {loading ? "Mengirim..." : "Kirim Email Reset"}
          </button>
        </form>

        {/* Link kembali */}
        <p className="text-center text-sm text-gray-700 mt-5">
          Kembali ke{" "}
          <button
            onClick={() => router.push("/login")}
            className="text-indigo-600 hover:underline font-medium"
          >
            Halaman Login
          </button>
        </p>

        {/* Ornament */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-300/40 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-300/40 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}
