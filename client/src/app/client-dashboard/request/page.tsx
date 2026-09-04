"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

export default function RequestProjectPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", location: "", value: "TBD", image: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push("/client-dashboard");
      } else {
        setError("Failed to submit project request.");
      }
    } catch (err) {
      setError("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
      <main className="pt-32 pb-24 px-6 md:px-12 lg:px-24 max-w-4xl mx-auto">
        <Link href="/client-dashboard" className="flex items-center gap-2 text-[#c09b62] text-xs uppercase tracking-widest mb-8 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <h1 className="text-3xl md:text-4xl font-serif tracking-wider uppercase mb-8">Request New Project</h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg mb-8 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-[#0d0a08] border border-white/10 rounded-xl p-8 flex flex-col gap-6">
          
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest text-gray-400">Project Name / Type</label>
            <input 
              type="text" required
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Modern Villa in Addis Ababa"
              className="bg-black/50 border border-white/10 rounded-lg p-4 text-sm focus:border-[#c09b62] outline-none transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest text-gray-400">Location</label>
            <input 
              type="text" required
              value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
              placeholder="e.g. Bole, Addis Ababa"
              className="bg-black/50 border border-white/10 rounded-lg p-4 text-sm focus:border-[#c09b62] outline-none transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest text-gray-400">Estimated Budget / Value</label>
            <input 
              type="text" required
              value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})}
              placeholder="e.g. $500,000 or TBD"
              className="bg-black/50 border border-white/10 rounded-lg p-4 text-sm focus:border-[#c09b62] outline-none transition-colors"
            />
          </div>

          <button 
            type="submit" disabled={loading}
            className="mt-4 flex items-center justify-center gap-2 py-4 bg-[#c09b62] text-black font-sans text-sm tracking-widest uppercase hover:bg-[#dfc499] transition-colors rounded-lg disabled:opacity-50"
          >
            {loading ? "Submitting..." : <><Send className="w-4 h-4" /> Submit Request</>}
          </button>
          
          <p className="text-gray-500 text-xs text-center mt-2">
            After submission, our management team will review your request and contact you.
          </p>
        </form>
      </main>
  );
}
