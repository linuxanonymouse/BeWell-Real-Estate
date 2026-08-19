"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Building2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        // Redirect based on role
        if (data.user.role === 'client') {
          router.push("/client-dashboard");
        } else {
          router.push("/admin");
        }
      } else {
        setError("Invalid credentials");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-white relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-[#c09b62]/10 rounded-full blur-[150px] mix-blend-screen" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#0d0a08] border border-white/10 rounded-2xl p-8 relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <Building2 className="w-12 h-12 text-[#c09b62] mb-4" />
          <h2 className="text-2xl font-serif uppercase tracking-widest">Sign In</h2>
          <p className="text-gray-400 text-sm mt-2 font-sans">Welcome back to Be Well</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-xs mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input 
            type="email" placeholder="Email Address" required
            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
            className="bg-black/50 border border-white/10 rounded-lg p-3 text-sm focus:border-[#c09b62] outline-none"
          />
          <input 
            type="password" placeholder="Password" required
            value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
            className="bg-black/50 border border-white/10 rounded-lg p-3 text-sm focus:border-[#c09b62] outline-none"
          />

          <button 
            type="submit" disabled={loading}
            className="mt-4 py-3 bg-[#c09b62] text-black font-sans text-xs tracking-widest uppercase hover:bg-[#dfc499] transition-colors rounded-lg disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500 font-sans">
          Don't have an account? <Link href="/auth/register" className="text-[#c09b62] hover:underline">Sign up</Link>
        </div>
      </motion.div>
    </div>
  );
}
