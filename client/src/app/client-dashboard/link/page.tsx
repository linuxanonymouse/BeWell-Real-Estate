"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Send, CheckCircle2, Copy, ExternalLink } from "lucide-react";

export default function LinkTelegramPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const accessToken = localStorage.getItem("token");
    if (!accessToken) return router.push("/auth/login");
    try {
      const res = await fetch("/api/auth/profile", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (res.ok) {
        const user = await res.json();
        localStorage.setItem("user", JSON.stringify(user));
        
        if (user.telegramLinked) {
          router.push("/client-dashboard");
        } else {
          setToken(user.telegramLinkToken || "");
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`/start ${token}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const checkStatus = async () => {
    setChecking(true);
    await fetchProfile();
    setChecking(false);
  };

  const botLink = `https://t.me/Bwell_Real_estate_Bot?start=${token}`;

  return (
    <main className="pt-32 pb-24 px-6 md:px-12 lg:px-24 max-w-4xl mx-auto flex flex-col items-center justify-center">
      <div className="bg-[#0d0a08] border border-white/10 rounded-2xl p-8 md:p-12 text-center max-w-2xl w-full">
        <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-blue-500/20">
          <Send className="w-10 h-10 text-blue-400 -ml-1" />
        </div>
        
        <h1 className="text-3xl font-serif uppercase tracking-wider mb-4">Link Your Telegram</h1>
        <p className="text-zinc-400 font-sans mb-8">
          To receive instant notifications about your projects and support tickets, you must link your account to our Telegram bot.
        </p>

        <div className="bg-black/50 border border-white/10 rounded-xl p-6 text-left mb-8">
          <p className="text-zinc-300 font-sans text-sm mb-4">Click the button below to open the bot and link automatically:</p>
          <a
            href={botLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-3 py-4 bg-[#0088cc] text-white font-sans uppercase tracking-widest text-sm rounded-xl hover:bg-[#0099dd] transition-colors"
          >
            <Send className="w-5 h-5" />
            Open @Bwell_Real_estate_Bot
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <div className="text-zinc-500 text-xs mb-4 uppercase tracking-widest">Or copy and send manually</div>

        <div className="bg-black border border-[#c09b62]/30 rounded-xl p-4 flex items-center justify-between gap-4 mb-8">
          <code className="text-[#c09b62] text-lg tracking-widest font-mono select-all">
            /start {token}
          </code>
          <button 
            onClick={handleCopy}
            className="p-3 bg-[#c09b62]/10 hover:bg-[#c09b62]/20 text-[#c09b62] rounded-lg transition-colors flex items-center gap-2 text-sm uppercase tracking-widest"
          >
            {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <button 
          onClick={checkStatus}
          disabled={checking}
          className="w-full py-4 bg-[#c09b62] text-black font-sans uppercase tracking-widest text-sm rounded-xl hover:bg-[#dfc499] transition-colors disabled:opacity-50"
        >
          {checking ? "Checking..." : "I've linked my account"}
        </button>
      </div>
    </main>
  );
}
