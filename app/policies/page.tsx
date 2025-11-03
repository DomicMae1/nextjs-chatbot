/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Sun, Moon } from "lucide-react";

interface Policy {
  _id: string;
  title: string;
  content: string;
  type: "privacy" | "terms";
  updatedAt: string;
}

export default function PoliciesPage() {
  const [privacyPolicies, setPrivacyPolicies] = useState<Policy[]>([]);
  const [termsPolicies, setTermsPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetch("/api/policies")
      .then((res) => res.json())
      .then((data: Policy[]) => {
        const privacy = data.filter((p) => p.type === "privacy");
        const terms = data.filter((p) => p.type === "terms");
        setPrivacyPolicies(privacy);
        setTermsPolicies(terms);
      })
      .catch(() => {
        setPrivacyPolicies([]);
        setTermsPolicies([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-16 px-6 space-y-12">
      <div className="flex items-center justify-between mb-8">
        {" "}
        {/* Tambah margin-bottom */}
        <h1 className="text-3xl font-bold">📢 Term & Policies</h1>{" "}
        {/* Besarkan judul */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-md ${
            // Gunakan p-2
            isDark
              ? "bg-gray-700 hover:bg-gray-600 text-yellow-300" // Warna ikon
              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
          }`}
          aria-label="Toggle theme" // Tambahkan aria-label
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
      {/* === Privacy Policy Section === */}
      <section>
        <h1 className="text-3xl font-bold mb-6 text-center">Privacy Policy</h1>
        {privacyPolicies.length === 0 ? (
          <p className="text-gray-500 text-center">
            Tidak ada data Privacy Policy yang tersedia.
          </p>
        ) : (
          privacyPolicies.map((policy) => (
            <Card
              key={policy._id}
              className="mb-6 shadow-md hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-2">{policy.title}</h2>
                <div
                  className="prose prose-sm text-gray-700"
                  dangerouslySetInnerHTML={{ __html: policy.content }}
                />
                <p className="text-sm text-gray-400 mt-4">
                  Diperbarui pada:{" "}
                  {new Date(policy.updatedAt).toLocaleDateString("id-ID")}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </section>

      {/* === Terms & Conditions Section === */}
      <section>
        <h1 className="text-3xl font-bold mb-6 text-center">
          Terms & Conditions
        </h1>
        {termsPolicies.length === 0 ? (
          <p className="text-gray-500 text-center">
            Tidak ada data Terms & Conditions yang tersedia.
          </p>
        ) : (
          termsPolicies.map((policy) => (
            <Card
              key={policy._id}
              className="mb-6 shadow-md hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-2">{policy.title}</h2>
                <div
                  className="prose prose-sm text-gray-700"
                  dangerouslySetInnerHTML={{ __html: policy.content }}
                />
                <p className="text-sm text-gray-400 mt-4">
                  Diperbarui pada:{" "}
                  {new Date(policy.updatedAt).toLocaleDateString("id-ID")}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}
