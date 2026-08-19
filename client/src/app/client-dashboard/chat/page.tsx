"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, MessageCircle, Headphones, Shield, Clock } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

export default function ClientChatPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [department, setDepartment] = useState<string>("");
  const [message, setMessage] = useState("");
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (!token || !userStr) { router.push("/auth/login"); return; }
    setUser(JSON.parse(userStr));
    fetchTickets(token);
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

  const handleCreateTicket = async () => {
    if (!department || !message.trim()) return;
    const token = localStorage.getItem("token");
    try {
      await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ department, text: message }),
      });
      setShowNewTicket(false);
      setDepartment("");
      setMessage("");
      fetchTickets();
    } catch (e) { console.error(e); }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !activeTicket) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/tickets/${activeTicket.id}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: replyText }),
      });
      if (res.ok) {
        const updated = await res.json();
        setActiveTicket(updated);
        setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
      }
      setReplyText("");
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="min-h-screen bg-[#050505]" />;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar onScheduleClick={() => {}} />
      <main className="pt-32 pb-24 px-6 md:px-12 lg:px-24 max-w-6xl mx-auto">
        <Link href="/client-dashboard" className="flex items-center gap-2 text-[#c09b62] text-xs uppercase tracking-widest mb-8 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif uppercase tracking-wider">Messages</h1>
          <button onClick={() => setShowNewTicket(true)} className="flex items-center gap-2 px-6 py-3 bg-[#c09b62] text-black hover:bg-[#dfc499] transition-colors rounded text-xs font-sans tracking-widest uppercase">
            <MessageCircle className="w-4 h-4" /> New Message
          </button>
        </div>

        {/* New Ticket Modal */}
        {showNewTicket && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#0d0a08] border border-white/10 rounded-xl w-full max-w-md p-6">
              <h3 className="text-xl font-serif uppercase tracking-wider mb-6">Contact</h3>
              <p className="text-gray-400 text-sm mb-4">Who would you like to contact?</p>
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setDepartment("management")}
                  className={`flex-1 p-4 rounded-xl border transition-colors flex flex-col items-center gap-2 ${
                    department === "management" ? "border-[#c09b62] bg-[#c09b62]/10" : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <Shield className="w-6 h-6 text-[#c09b62]" />
                  <span className="text-xs uppercase tracking-widest">Management</span>
                  <span className="text-[10px] text-gray-500">Super Admin</span>
                </button>
                <button
                  onClick={() => setDepartment("support")}
                  className={`flex-1 p-4 rounded-xl border transition-colors flex flex-col items-center gap-2 ${
                    department === "support" ? "border-[#c09b62] bg-[#c09b62]/10" : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <Headphones className="w-6 h-6 text-[#c09b62]" />
                  <span className="text-xs uppercase tracking-widest">Support</span>
                  <span className="text-[10px] text-gray-500">Support Team</span>
                </button>
              </div>
              {department && (
                <div className="flex flex-col gap-4">
                  <textarea
                    rows={4} placeholder="Type your message..."
                    value={message} onChange={e => setMessage(e.target.value)}
                    className="bg-black/50 border border-white/10 rounded-lg p-3 text-sm focus:border-[#c09b62] outline-none resize-none"
                  />
                  <div className="flex gap-3">
                    <button onClick={() => { setShowNewTicket(false); setDepartment(""); setMessage(""); }} className="flex-1 py-3 border border-white/20 rounded-lg text-xs uppercase tracking-widest hover:bg-white/5 transition-colors">Cancel</button>
                    <button onClick={handleCreateTicket} className="flex-1 py-3 bg-[#c09b62] text-black rounded-lg text-xs uppercase tracking-widest hover:bg-[#dfc499] transition-colors flex items-center justify-center gap-2">
                      <Send className="w-3 h-3" /> Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Active Ticket Chat View */}
        {activeTicket ? (
          <div className="bg-[#0d0a08] border border-white/10 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <div>
                <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full ${activeTicket.department === 'management' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'}`}>
                  {activeTicket.department}
                </span>
                <span className={`ml-2 text-[10px] uppercase tracking-widest px-2 py-1 rounded-full ${activeTicket.status === 'open' ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'}`}>
                  {activeTicket.status}
                </span>
              </div>
              <button onClick={() => setActiveTicket(null)} className="text-gray-400 hover:text-white text-xs uppercase tracking-widest">Close</button>
            </div>
            <div className="p-6 max-h-[400px] overflow-y-auto flex flex-col gap-4">
              {activeTicket.messages.map((msg: any, idx: number) => (
                <div key={idx} className={`flex ${msg.senderRole === 'client' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-3 rounded-xl text-sm ${
                    msg.senderRole === 'client'
                      ? 'bg-[#c09b62]/20 text-white border border-[#c09b62]/30'
                      : 'bg-white/5 text-gray-300 border border-white/10'
                  }`}>
                    <div className="text-[10px] text-gray-500 mb-1 uppercase tracking-widest">{msg.senderRole === 'client' ? 'You' : msg.senderRole}</div>
                    <p>{msg.text}</p>
                    <div className="text-[9px] text-gray-600 mt-1 text-right">{new Date(msg.date).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
            {activeTicket.status === 'open' && (
              <div className="p-4 border-t border-white/10 flex gap-3">
                <input
                  type="text" placeholder="Type a reply..."
                  value={replyText} onChange={e => setReplyText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleReply()}
                  className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-[#c09b62] outline-none"
                />
                <button onClick={handleReply} className="px-6 py-3 bg-[#c09b62] text-black rounded-lg hover:bg-[#dfc499] transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Ticket List */
          tickets.length === 0 ? (
            <div className="bg-[#0d0a08] border border-white/5 rounded-xl p-12 text-center">
              <MessageCircle className="w-16 h-16 text-gray-700 mx-auto mb-6" />
              <h3 className="text-xl font-serif uppercase text-gray-400 mb-2">No Messages Yet</h3>
              <p className="text-gray-500 font-sans text-sm">Click "New Message" to contact Management or Support.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {tickets.map(ticket => (
                <button key={ticket.id} onClick={() => setActiveTicket(ticket)} className="bg-[#0d0a08] border border-white/10 hover:border-[#c09b62]/50 rounded-xl p-5 text-left transition-colors w-full">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-2">
                      <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full ${ticket.department === 'management' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'}`}>
                        {ticket.department}
                      </span>
                      <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full ${ticket.status === 'open' ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'}`}>
                        {ticket.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 text-[10px]">
                      <Clock className="w-3 h-3" />
                      {new Date(ticket.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm truncate">{ticket.messages[ticket.messages.length - 1]?.text}</p>
                  <div className="text-[10px] text-gray-600 mt-2">{ticket.messages.length} message(s)</div>
                </button>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
}
