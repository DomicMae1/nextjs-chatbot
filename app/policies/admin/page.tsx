/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus } from "lucide-react";
import PolicyModal from "@/components/PolicyModal";
import Policy from "@/models/Policy";

export interface Policy {
  _id?: string;
  title: string;
  type: "terms" | "privacy" | "other";
  content: string;
  effectiveDate?: string;
  author?: string;
}

export default function AdminPoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editData, setEditData] = useState<Policy | null>(null);

  const fetchPolicies = async () => {
    try {
      const res = await fetch("/api/policies");
      const data = await res.json();
      setPolicies(data);
    } catch (err) {
      console.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus policy ini?")) return;
    try {
      await fetch(`/api/policies?id=${id}`, { method: "DELETE" });
      fetchPolicies();
    } catch {
      alert("Gagal menghapus");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">🧾 Manage Terms & Policies</h1>
        <Button
          onClick={() => {
            setEditData(null);
            setOpenModal(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> Tambah Policy
        </Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Judul</th>
                <th className="p-2 text-left">Tipe</th>
                <th className="p-2 text-left">Tanggal Berlaku</th>
                <th className="p-2 text-left">Author</th>
                <th className="p-2 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {policies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-4 text-gray-500">
                    Belum ada policy
                  </td>
                </tr>
              ) : (
                policies.map((p) => (
                  <tr key={p._id} className="border-t">
                    <td className="p-2">{p.title}</td>
                    <td className="p-2 capitalize">{p.type}</td>
                    <td className="p-2">
                      {p.effectiveDate
                        ? new Date(p.effectiveDate).toLocaleDateString("id-ID")
                        : "-"}
                    </td>
                    <td className="p-2">{p.author || "-"}</td>
                    <td className="p-2 flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditData(p);
                          setOpenModal(true);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(p._id!)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <PolicyModal
        isOpen={openModal}
        onOpenChange={setOpenModal}
        editData={editData}
        onSaved={fetchPolicies}
      />
    </div>
  );
}
