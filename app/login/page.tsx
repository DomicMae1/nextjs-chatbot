/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";
// import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const syncUserToMongo = async (user: any, provider: string) => {
    try {
      await fetch("/api/user/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          name: user.displayName || "Pengguna",
          email: user.email,
          photoURL: user.photoURL,
          provider,
        }),
      });
    } catch (err) {
      console.error("❌ Gagal sync user:", err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await syncUserToMongo(user, "password");
      router.push("/chat");
    } catch (err: any) {
      setError("Gagal login: " + err.message);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      await syncUserToMongo(user, "google");
      router.push("/chat");
    } catch (err: any) {
      setError("Login Google gagal: " + err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-white">
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
            Selamat Datang 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
            Silakan login untuk melanjutkan ke Chatbot AI
          </p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              placeholder="contoh@email.com"
              className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
              placeholder="••••••••"
              className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-md transition-all duration-200"
          >
            Login
          </button>
        </form>

        <div className="mt-5">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex items-center justify-center gap-3 w-full border border-gray-300 dark:border-gray-600 py-2.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
          >
            <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
            <span className="text-gray-700 dark:text-gray-200 font-medium">
              Login dengan Google
            </span>
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            Belum punya akun?{" "}
            <a
              href="/register"
              className="text-blue-600 hover:underline font-medium"
            >
              Daftar di sini
            </a>
          </p>
          <p className="mt-2">
            <a
              href="/reset-password"
              className="text-blue-600 hover:underline font-medium"
            >
              Lupa password?
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
