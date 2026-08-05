"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, CheckCircle2, AlertCircle } from "lucide-react";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message })
      });
      
      if (res.ok) {
        setStatus('success');
        setTimeout(() => {
          setStatus('idle');
          onClose();
          setName("");
          setEmail("");
          setPhone("");
          setMessage("");
        }, 3000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error("Failed to submit inquiry", error);
      setStatus('error');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200]"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-lg bg-[#0a0a0a] border border-white/10 shadow-2xl z-[201] p-8 lg:p-12 text-white overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#c09b62] to-transparent" />
            
            <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl md:text-3xl font-serif tracking-wider uppercase mb-2">Schedule A Consultation</h2>
            <p className="text-xs text-gray-400 font-sans tracking-widest uppercase mb-8">Let's discuss your next project.</p>

            {status === 'success' ? (
              <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="font-serif text-2xl tracking-wide">Request Received</h3>
                <p className="text-sm text-gray-400 font-sans leading-relaxed">Our team will be in touch with you shortly to schedule your consultation.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6 font-sans">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500">Full Name</label>
                  <input required value={name} onChange={e => setName(e.target.value)}
                    className="bg-black border border-white/10 px-4 py-3 text-sm text-white focus:border-[#c09b62]/50 outline-none transition-colors" />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500">Email Address</label>
                    <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
                      className="bg-black border border-white/10 px-4 py-3 text-sm text-white focus:border-[#c09b62]/50 outline-none transition-colors" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500">Phone Number (Optional)</label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                      className="bg-black border border-white/10 px-4 py-3 text-sm text-white focus:border-[#c09b62]/50 outline-none transition-colors" />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500">Message / Inquiry Details</label>
                  <textarea required value={message} onChange={e => setMessage(e.target.value)}
                    className="bg-black border border-white/10 px-4 py-3 text-sm text-white focus:border-[#c09b62]/50 outline-none transition-colors min-h-[100px]" />
                </div>

                {status === 'error' && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Failed to submit your inquiry. Please try again later.
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={status === 'submitting'}
                  className="mt-2 w-full bg-[#c09b62] text-black hover:bg-[#dfc499] transition-colors duration-500 py-4 text-xs tracking-[0.2em] uppercase font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {status === 'submitting' ? 'Sending...' : 'Submit Request'}
                  {!status && <Send className="w-3 h-3" />}
                </button>
              </form>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
