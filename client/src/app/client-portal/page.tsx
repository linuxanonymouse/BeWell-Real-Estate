"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Send, MessageSquare, Briefcase, Bot } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

export default function ClientPortal() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/telegram/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", phone: "", message: "" });
        setTimeout(() => setStatus("idle"), 5000);
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-24 pb-24 px-6 md:px-12 lg:px-24">
      <Navbar onScheduleClick={() => {}} />
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[50vw] h-[50vw] bg-[#c09b62]/5 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#c09b62] transition-colors font-sans text-sm tracking-widest uppercase group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1 }}
          className="mb-12"
        >
          <h1 className="text-[3rem] md:text-[5rem] leading-[0.9] font-serif font-light tracking-wide uppercase flex flex-col">
            <span>Client</span>
            <span className="text-[#c09b62] italic">Portal</span>
          </h1>
          <p className="mt-6 text-gray-400 font-sans tracking-[0.15em] max-w-lg leading-loose text-sm">
            Welcome to the Be Well Real Estate client portal. Track your investments, get in touch with your dedicated project manager, or connect directly to our administrative team.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mt-16">
          
          {/* Left Column: Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="flex flex-col gap-6"
          >
            <Link href="/projects" className="group bg-[#0d0a08] border border-white/10 hover:border-[#c09b62]/50 rounded-2xl p-8 transition-all duration-500 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#c09b62]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Briefcase className="w-8 h-8 text-[#c09b62] mb-6" />
              <h3 className="text-2xl font-serif uppercase tracking-wider mb-2 text-white">Track Your Project</h3>
              <p className="text-gray-400 font-sans text-sm leading-relaxed tracking-wide">
                View real-time updates, construction status, and detailed metrics for all our ongoing and completed signature projects.
              </p>
              <div className="mt-6 text-[10px] uppercase tracking-widest text-[#c09b62] group-hover:translate-x-2 transition-transform duration-300">
                View Portfolio &rarr;
              </div>
            </Link>

            <a href="https://t.me/BeWellRealEstateBot" target="_blank" rel="noopener noreferrer" className="group bg-[#0d0a08] border border-white/10 hover:border-[#3b82f6]/50 rounded-2xl p-8 transition-all duration-500 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#3b82f6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Bot className="w-8 h-8 text-[#3b82f6] mb-6" />
              <h3 className="text-2xl font-serif uppercase tracking-wider mb-2 text-white">Telegram Bot</h3>
              <p className="text-gray-400 font-sans text-sm leading-relaxed tracking-wide">
                Connect with our automated Telegram Bot to receive instant notifications, project updates, and direct support.
              </p>
              <div className="mt-6 text-[10px] uppercase tracking-widest text-[#3b82f6] group-hover:translate-x-2 transition-transform duration-300">
                Connect Now &rarr;
              </div>
            </a>
          </motion.div>

          {/* Right Column: Contact Form */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <div className="bg-[#0d0a08] border border-white/10 rounded-2xl p-8 lg:p-10 h-full flex flex-col">
              <div className="flex items-center gap-4 mb-8">
                <MessageSquare className="w-6 h-6 text-[#c09b62]" />
                <h3 className="text-2xl font-serif uppercase tracking-wider text-white">Contact Administration</h3>
              </div>
              
              <form onSubmit={handleSubmit} className="flex flex-col gap-6 flex-1">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500">Full Name</label>
                  <input 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-[#c09b62] outline-none transition-colors"
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500">Email Address</label>
                  <input 
                    required 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-[#c09b62] outline-none transition-colors"
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500">Phone (Optional)</label>
                  <input 
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-[#c09b62] outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-2 flex-1">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500">Your Message</label>
                  <textarea 
                    required 
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-[#c09b62] outline-none transition-colors min-h-[120px] resize-none flex-1"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={status === "loading" || status === "success"}
                  className="mt-2 w-full py-4 bg-[#c09b62] text-black hover:bg-[#dfc499] transition-all duration-300 font-sans text-xs tracking-widest uppercase flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === "loading" ? "Sending..." : status === "success" ? "Message Sent!" : (
                    <>Send Message <Send className="w-3 h-3" /></>
                  )}
                </button>

                {status === "error" && (
                  <p className="text-red-400 text-xs text-center mt-2 font-sans">
                    Failed to send message. Please try again.
                  </p>
                )}
              </form>
            </div>
          </motion.div>

        </div>
      </div>
    </main>
  );
}
