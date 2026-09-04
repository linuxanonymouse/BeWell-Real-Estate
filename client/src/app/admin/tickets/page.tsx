"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Send, Clock, User, Shield, Headphones, MessageCircle, Plus, Paperclip, Image as ImageIcon, ArrowLeft } from "lucide-react";
import { getAuthHeader } from "../layout";

export default function AdminTicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [replyText, setReplyText] = useState("");
  const [userRole, setUserRole] = useState<string>("superadmin");
  const [showNewModal, setShowNewModal] = useState(false);
  const [newClientId, setNewClientId] = useState("");
  const [newDepartment, setNewDepartment] = useState("support");
  const [newMessage, setNewMessage] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachmentType, setAttachmentType] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
    const userStr = localStorage.getItem("user");
    if (!token || !userStr) {
      router.push("/admin/login");
      return;
    }
    try {
      const user = JSON.parse(userStr);
      setUserRole(user.role || 'superadmin');
      fetchTickets(token, user.role || 'superadmin');
      
      // Setup polling every 5 seconds
      interval = setInterval(() => {
        fetchTickets(token, user.role || 'superadmin');
      }, 5000);

      if (user.role === 'superadmin' || user.role === 'support') {
        fetchClients(token);
      }
    } catch (e) {
      router.push("/admin/login");
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [router]);

  useEffect(() => {
    if (activeTicket) {
      const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
      fetch(`/api/tickets/${activeTicket.id}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      }).catch(e => console.error(e));
    }
  }, [activeTicket]);

  const fetchTickets = async (token: string, role: string) => {
    try {
      const endpoint = role === "superadmin" 
        ? "/api/tickets/all"
        : "/api/tickets/department/support";
        
      const res = await fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const newTickets = await res.json();
        setTickets(newTickets);
        
        // Update activeTicket if it's currently selected to show new messages
        setActiveTicket((currentActive: any) => {
          if (currentActive) {
            const updatedActive = newTickets.find((t: any) => t.id === currentActive.id);
            return updatedActive || currentActive;
          }
          return currentActive;
        });
      }
    } catch (e) { console.error(e); }
  };

  const fetchClients = async (token: string) => {
    try {
      const res = await fetch("/api/auth/users", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const users = await res.json();
        setClients(users.filter((u: any) => u.role === 'client'));
      }
    } catch (e) { console.error(e); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
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

  const handleReply = async () => {
    if ((!replyText.trim() && !attachmentUrl) || !activeTicket) return;
    const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
    try {
      const res = await fetch(`/api/tickets/${activeTicket.id}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: replyText, attachmentUrl: attachmentUrl || undefined, attachmentType: attachmentType || undefined }),
      });
      if (res.ok) {
        const updated = await res.json();
        setActiveTicket(updated);
        setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
      }
      setReplyText("");
      setAttachmentUrl("");
      setAttachmentType("");
    } catch (e) { console.error(e); }
  };

  const handleCloseTicket = async (id: string) => {
    if (!window.confirm("Are you sure you want to close this conversation?")) return;
    
    const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
    try {
      const res = await fetch(`/api/tickets/${id}/close`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const updated = await res.json();
        if (activeTicket?.id === id) setActiveTicket(updated);
        setTickets(prev => prev.map(t => t.id === id ? updated : t));
      }
    } catch (e) { console.error(e); }
  };

  const handleStartChat = async () => {
    if (!newClientId || !newMessage.trim()) return;
    const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
    const client = clients.find(c => c.id === newClientId);
    if (!client) return;
    
    try {
      const res = await fetch("/api/tickets/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          clientId: client.id,
          clientName: client.name,
          department: newDepartment,
          text: newMessage
        })
      });
      if (res.ok) {
        const ticket = await res.json();
        setTickets(prev => [ticket, ...prev]);
        setActiveTicket(ticket);
        setShowNewModal(false);
        setNewMessage("");
      }
    } catch (e) { console.error(e); }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-[calc(100vh-64px)] md:h-screen flex flex-col">
      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-serif uppercase tracking-wider text-white">Client Messages</h1>
          <p className="text-zinc-500 text-sm mt-1">Manage communications and support tickets</p>
        </div>
        {(userRole === 'superadmin' || userRole === 'support') && (
          <button onClick={() => setShowNewModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#c09b62] text-black hover:bg-[#dfc499] rounded text-xs font-sans tracking-widest uppercase transition-colors">
            <Plus className="w-4 h-4" /> Start Chat
          </button>
        )}
      </div>

      {showNewModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d0a08] border border-white/10 rounded-xl w-full max-w-md p-6">
            <h3 className="text-xl font-serif uppercase tracking-wider mb-6 text-white">Start Chat with Client</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-zinc-400 uppercase tracking-widest mb-2 block">Client</label>
                <select value={newClientId} onChange={e => setNewClientId(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm text-white outline-none focus:border-[#c09b62]">
                  <option value="">Select a client...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400 uppercase tracking-widest mb-2 block">Department / Sender</label>
                <select value={newDepartment} onChange={e => setNewDepartment(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm text-white outline-none focus:border-[#c09b62]">
                  <option value="support">Support</option>
                  <option value="management">Management</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400 uppercase tracking-widest mb-2 block">Initial Message</label>
                <textarea rows={4} value={newMessage} onChange={e => setNewMessage(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm text-white outline-none focus:border-[#c09b62] resize-none" placeholder="Type message..." />
              </div>
              <div className="flex gap-3 mt-2">
                <button onClick={() => setShowNewModal(false)} className="flex-1 py-3 border border-white/20 rounded-lg text-xs uppercase tracking-widest hover:bg-white/5 text-white transition-colors">Cancel</button>
                <button onClick={handleStartChat} disabled={!newClientId || !newMessage.trim()} className="flex-1 py-3 bg-[#c09b62] disabled:opacity-50 text-black rounded-lg text-xs uppercase tracking-widest hover:bg-[#dfc499] transition-colors">Start Chat</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        <div className={`w-full lg:w-1/3 flex flex-col bg-[#050505] border border-zinc-900 rounded-xl overflow-hidden shrink-0 ${activeTicket ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-4 border-b border-zinc-900 flex justify-between items-center bg-black/20">
            <h2 className="text-xs uppercase tracking-widest text-zinc-500">Active Conversations</h2>
            <span className="text-xs bg-zinc-900 text-zinc-400 px-2 py-1 rounded-full">{tickets.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
            {tickets.map(ticket => (
              <button 
                key={ticket.id} 
                onClick={() => setActiveTicket(ticket)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  activeTicket?.id === ticket.id 
                    ? 'bg-zinc-900 border-zinc-700' 
                    : 'bg-black/20 border-zinc-900 hover:border-zinc-700'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-sans text-white text-sm font-medium">{ticket.clientName}</div>
                  <div className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(ticket.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex gap-2 mb-2">
                  <span className={`text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full ${ticket.department === 'management' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                    {ticket.department}
                  </span>
                  <span className={`text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full ${ticket.status === 'open' ? 'bg-green-500/10 text-green-400' : 'bg-zinc-500/10 text-zinc-400'}`}>
                    {ticket.status}
                  </span>
                </div>
                <p className="text-zinc-400 text-xs truncate">
                  {ticket.messages[ticket.messages.length - 1]?.text}
                </p>
              </button>
            ))}
            {tickets.length === 0 && (
               <div className="p-8 text-center text-zinc-500 text-sm">No active conversations.</div>
            )}
          </div>
        </div>

        <div className={`flex-1 flex flex-col min-w-0 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden ${!activeTicket ? 'hidden lg:flex' : 'flex'}`}>
          {activeTicket ? (
            <>
              <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-black/20">
                <div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setActiveTicket(null)} className="lg:hidden text-zinc-400 hover:text-white transition-colors mr-2">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-xl font-serif text-white">{activeTicket.clientName}</h2>
                    <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-1 rounded uppercase tracking-widest">{activeTicket.department}</span>
                  </div>
                  <div className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">Client ID: {activeTicket.clientId}</div>
                </div>
                {activeTicket.status === 'open' && (
                  <button onClick={() => handleCloseTicket(activeTicket.id)} className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors rounded-lg text-xs uppercase tracking-wider">
                    Close Ticket
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                {activeTicket.messages.map((msg: any, idx: number) => {
                  const isClient = msg.senderRole === 'client';
                  return (
                    <div key={idx} className={`flex ${isClient ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[75%] p-4 rounded-xl ${
                        isClient ? 'bg-zinc-800 border border-zinc-700 text-white' : 'bg-[#c09b62]/20 border border-[#c09b62]/30 text-white'
                      }`}>
                        <div className="flex items-center gap-2 mb-2 text-xs text-zinc-400 uppercase tracking-widest">
                          {isClient ? <User className="w-3 h-3" /> : (msg.senderRole === 'superadmin' ? <Shield className="w-3 h-3" /> : <Headphones className="w-3 h-3" />)}
                          {msg.senderName} ({msg.senderRole})
                        </div>
                        <p className="text-sm font-sans whitespace-pre-wrap">{msg.text}</p>
                        {msg.attachmentUrl && msg.attachmentType === 'image' && (
                          <img src={`/api${msg.attachmentUrl}`} alt="attachment" className="mt-2 rounded-lg max-w-full max-h-64 object-cover" />
                        )}
                        {msg.attachmentUrl && msg.attachmentType === 'video' && (
                          <video src={`/api${msg.attachmentUrl}`} controls className="mt-2 rounded-lg max-w-full max-h-64" />
                        )}
                        <div className="text-[9px] text-zinc-500 mt-2 text-right">
                          {new Date(msg.date).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {activeTicket.status === 'open' ? (
                <div className="border-t border-zinc-800 bg-black/20">
                  {attachmentUrl && (
                    <div className="px-4 pt-3 flex items-center gap-2">
                      <div className="relative">
                        {attachmentType === 'image' ? (
                          <img src={`/api${attachmentUrl}`} alt="preview" className="w-16 h-16 object-cover rounded-lg border border-zinc-700" />
                        ) : (
                          <div className="w-16 h-16 bg-zinc-800 border border-zinc-700 rounded-lg flex items-center justify-center text-xs text-zinc-400">Video</div>
                        )}
                        <button onClick={() => { setAttachmentUrl(""); setAttachmentType(""); }} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[8px] flex items-center justify-center">✕</button>
                      </div>
                    </div>
                  )}
                  <div className="p-4 flex gap-4 items-center">
                    <input type="file" ref={fileInputRef} accept="image/*,video/*" onChange={handleFileUpload} className="hidden" />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="p-3 text-zinc-400 hover:text-[#c09b62] transition-colors disabled:opacity-50"
                    >
                      {uploading ? <div className="w-5 h-5 border-2 border-zinc-600 border-t-[#c09b62] rounded-full animate-spin" /> : <Paperclip className="w-5 h-5" />}
                    </button>
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                      placeholder="Type your reply..."
                      className="flex-1 bg-zinc-950 border border-zinc-800 text-white text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-[#c09b62] transition-colors"
                    />
                    <button 
                      onClick={handleReply}
                      disabled={!replyText.trim() && !attachmentUrl}
                      className="p-3 bg-[#c09b62] text-black rounded-lg hover:bg-[#dfc499] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 border-t border-zinc-800 bg-black/20 text-center text-sm text-zinc-500 uppercase tracking-widest">
                  This conversation is closed
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
              <MessageCircle className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-sm uppercase tracking-widest">Select a conversation to view</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
