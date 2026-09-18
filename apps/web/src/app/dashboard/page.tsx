"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";

export default function DashboardPage() {
  // In a real app, these would be actual API calls
  const stats = [
    { label: "Applications Submitted",  value: "—", color: "bg-blue-500" },
    { label: "NFT Titles Issued",        value: "—", color: "bg-green-500" },
    { label: "Pending Approval",         value: "—", color: "bg-yellow-500" },
    { label: "Revocations",              value: "—", color: "bg-red-500" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <nav className="bg-primary text-white px-6 py-4 flex items-center justify-between shadow">
        <h1 className="text-xl font-bold">Anagu Dashboard</h1>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/applications/new" className="hover:underline">+ New Application</Link>
          <Link href="/(auth)/login" className="hover:underline">Sign out</Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="card flex items-center gap-4">
              <div className={`w-3 h-10 rounded-full ${s.color}`} />
              <div>
                <div className="text-2xl font-bold text-gray-800">{s.value}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Pipeline status */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Registration Pipeline
          </h2>
          <div className="flex items-center gap-2 flex-wrap text-sm">
            {[
              "Submission",
              "Spatial Verification",
              "Ownership Oracle",
              "Legal Review",
              "Registrar Approval",
              "Blockchain Registration",
              "NFT Issued",
              "MQTT Notified",
            ].map((stage, i) => (
              <div key={stage} className="flex items-center gap-2">
                {i > 0 && <span className="text-gray-300">→</span>}
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                  {stage}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent applications table */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Recent Applications</h2>
            <Link
              href="/applications/new"
              className="btn-primary text-sm"
            >
              + New Application
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Application ID</th>
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Owner</th>
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">LGA</th>
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Status</th>
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Submitted</th>
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    No applications yet. Submit your first one to get started.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
