"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Lock, Mail, ArrowRight } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await res.json();
      localStorage.setItem("admin_token", data.access_token);
      router.push("/admin");
    } catch (err) {
      setError("Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#c09b62] opacity-[0.03] blur-[120px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-tr from-[#c09b62] to-[#dfc499] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(192,155,98,0.2)]">
            <Building2 className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-3xl font-serif text-white uppercase tracking-widest mb-2">Be Well Real Estate</h1>
          <p className="text-zinc-500 font-sans tracking-widest uppercase text-xs">Admin Portal Access</p>
        </div>

        <div className="bg-[#050505] border border-zinc-900 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-sans">Admin Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-zinc-500" />
                </div>
                <input 
                  type="email"
                  required 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@bewell.com"
                  className="w-full bg-[#0a0a0a] border border-zinc-900 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-zinc-700 focus:border-[#c09b62]/50 focus:bg-black outline-none transition-all font-sans"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-sans">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-zinc-500" />
                </div>
                <input 
                  type="password"
                  required 
                  value={password} 
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0a0a0a] border border-zinc-900 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-zinc-700 focus:border-[#c09b62]/50 focus:bg-black outline-none transition-all font-sans"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-sans text-center">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#c09b62] to-[#dfc499] hover:from-[#dfc499] hover:to-[#f0d5a8] text-black rounded-xl py-3.5 text-sm font-medium tracking-wider uppercase transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {isLoading ? 'Authenticating...' : 'Secure Login'}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>
        
        <p className="text-center text-zinc-600 text-xs mt-8 tracking-widest uppercase">
          Restricted Access Area
        </p>
      </div>
    </div>
  );
}
