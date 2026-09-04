"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, MessageCircle, Shield, Headphones, Paperclip } from "lucide-react";

export default function ClientChatPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeDepartment, setActiveDepartment] = useState<string>("management");
  const [replyText, setReplyText] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachmentType, setAttachmentType] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (!token || !userStr) { router.push("/auth/login"); return; }
    setUser(JSON.parse(userStr));
    fetchTickets(token);

    interval = setInterval(() => {
      fetchTickets(token);
    }, 5000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [router]);

  const fetchTickets = async (token?: string) => {
    const t = token || localStorage.getItem("token");
    try {
      const res = await fetch("/api/tickets/my", {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.ok) setTickets(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const activeTicket = tickets.find(t => t.department === activeDepartment);

  useEffect(() => {
    if (activeTicket) {
      const token = localStorage.getItem("token");
      fetch(`/api/tickets/${activeTicket.id}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      }).catch(e => console.error(e));
    }
  }, [activeTicket]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setAttachmentUrl(data.url);
        setAttachmentType(file.type.startsWith("video") ? "video" : "image");
      }
    } catch (err) { console.error(err); }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async () => {
    if (!replyText.trim() && !attachmentUrl) return;
    const token = localStorage.getItem("token");
    
    try {
      if (activeTicket) {
        // Add message to existing thread
        const res = await fetch(`/api/tickets/${activeTicket.id}/message`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ text: replyText, attachmentUrl: attachmentUrl || undefined, attachmentType: attachmentType || undefined }),
        });
        if (res.ok) {
          const updated = await res.json();
          setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
        }
      } else {
        // Create new thread
        const res = await fetch("/api/tickets", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ department: activeDepartment, text: replyText, attachmentUrl: attachmentUrl || undefined, attachmentType: attachmentType || undefined }),
        });
        if (res.ok) {
          const newTicket = await res.json();
          setTickets(prev => [newTicket, ...prev]);
        }
      }
      setReplyText("");
      setAttachmentUrl("");
      setAttachmentType("");
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="min-h-screen bg-[#050505]" />;

  return (
      <main className="pt-32 pb-24 px-6 md:px-12 lg:px-24 max-w-6xl mx-auto">
        <Link href="/client-dashboard" className="flex items-center gap-2 text-[#c09b62] text-xs uppercase tracking-widest mb-8 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <h1 className="text-3xl font-serif uppercase tracking-wider mb-8">Messages</h1>

        <div className="flex flex-col lg:flex-row gap-6 min-h-[600px] lg:h-[600px]">
          
          {/* Contacts Sidebar */}
          <div className="w-full lg:w-1/3 bg-[#0d0a08] border border-white/10 rounded-xl flex flex-col overflow-hidden shrink-0">
            <div className="p-4 border-b border-white/10 bg-black/40">
              <h2 className="text-xs uppercase tracking-widest text-gray-400">Contacts</h2>
            </div>
            
            <button 
              onClick={() => setActiveDepartment("management")}
              className={`flex items-center gap-4 p-4 text-left transition-colors ${activeDepartment === "management" ? "bg-white/5 border-l-2 border-[#c09b62]" : "hover:bg-white/5 border-l-2 border-transparent"}`}
            >
              <div className="w-10 h-10 rounded-full bg-[#c09b62]/20 flex items-center justify-center border border-[#c09b62]/30">
                <Shield className="w-5 h-5 text-[#c09b62]" />
              </div>
              <div>
                <h3 className="font-serif tracking-wide text-white">Management</h3>
                <p className="text-xs text-gray-500">Super Admin Team</p>
              </div>
            </button>
            
            <button 
              onClick={() => setActiveDepartment("support")}
              className={`flex items-center gap-4 p-4 text-left transition-colors ${activeDepartment === "support" ? "bg-white/5 border-l-2 border-blue-500" : "hover:bg-white/5 border-l-2 border-transparent"}`}
            >
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                <Headphones className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-serif tracking-wide text-white">Support</h3>
                <p className="text-xs text-gray-500">Technical & Help Desk</p>
              </div>
            </button>
          </div>

          {/* Chat Area */}
          <div className="w-full lg:w-2/3 lg:flex-1 min-w-0 bg-[#0d0a08] border border-white/10 rounded-xl flex flex-col overflow-hidden h-[600px] lg:h-auto">
            
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-black/40 flex items-center gap-3">
              {activeDepartment === "management" ? (
                 <Shield className="w-5 h-5 text-[#c09b62]" />
              ) : (
                 <Headphones className="w-5 h-5 text-blue-400" />
              )}
              <h2 className="text-sm uppercase tracking-widest text-white">
                {activeDepartment === "management" ? "Chat with Management" : "Chat with Support"}
              </h2>
            </div>

            {/* Messages */}
            <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
              {!activeTicket || activeTicket.messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <MessageCircle className="w-12 h-12 text-gray-700 mb-4" />
                  <p className="text-gray-400 text-sm">No messages yet.</p>
                  <p className="text-gray-600 text-xs mt-2">Send a message to start the conversation.</p>
                </div>
              ) : (
                activeTicket.messages.map((msg: any, idx: number) => (
                  <div key={idx} className={`flex ${msg.senderRole === 'client' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-xl text-sm ${
                      msg.senderRole === 'client'
                        ? 'bg-[#c09b62]/20 text-white border border-[#c09b62]/30'
                        : 'bg-white/5 text-gray-300 border border-white/10'
                    }`}>
                      <div className="text-[10px] text-gray-500 mb-1 uppercase tracking-widest">
                        {msg.senderRole === 'client' ? 'You' : msg.senderName || msg.senderRole}
                      </div>
                      <p>{msg.text}</p>
                      {msg.attachmentUrl && msg.attachmentType === 'image' && (
                        <img src={`/api${msg.attachmentUrl}`} alt="attachment" className="mt-2 rounded-lg max-w-full max-h-64 object-cover" />
                      )}
                      {msg.attachmentUrl && msg.attachmentType === 'video' && (
                        <video src={`/api${msg.attachmentUrl}`} controls className="mt-2 rounded-lg max-w-full max-h-64" />
                      )}
                      <div className="text-[9px] text-gray-600 mt-1 text-right">{new Date(msg.date).toLocaleString()}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <div className="border-t border-white/10 bg-black/20">
              {attachmentUrl && (
                <div className="px-4 pt-3 flex items-center gap-2">
                  <div className="relative">
                    {attachmentType === 'image' ? (
                      <img src={`/api${attachmentUrl}`} alt="preview" className="w-16 h-16 object-cover rounded-lg border border-white/10" />
                    ) : (
                      <div className="w-16 h-16 bg-zinc-800 border border-white/10 rounded-lg flex items-center justify-center text-xs text-zinc-400">Video</div>
                    )}
                    <button onClick={() => { setAttachmentUrl(""); setAttachmentType(""); }} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[8px] flex items-center justify-center">✕</button>
                  </div>
                </div>
              )}
              <div className="p-4 flex gap-2 items-center">
                <input type="file" ref={fileInputRef} accept="image/*,video/*" onChange={handleFileUpload} className="hidden" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="p-3 text-zinc-400 hover:text-[#c09b62] transition-colors disabled:opacity-50"
                >
                  {uploading ? <div className="w-4 h-4 border-2 border-zinc-600 border-t-[#c09b62] rounded-full animate-spin" /> : <Paperclip className="w-4 h-4" />}
                </button>
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-[#c09b62] outline-none"
                />
                <button 
                  onClick={handleSend}
                  disabled={!replyText.trim() && !attachmentUrl}
                  className="px-6 py-3 bg-[#c09b62] text-black rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#dfc499] transition-colors flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
  );
}
