"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

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
