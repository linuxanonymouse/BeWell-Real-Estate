"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Mail, Phone, Clock, MessageSquare } from "lucide-react";

import { getAuthHeader } from "../layout";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: 'New' | 'Contacted' | 'Converted' | 'Lost';
  createdAt: string;
}

export default function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState("All");
  const [clients, setClients] = useState<any[]>([]);
  const router = useRouter();

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/auth/users", { headers: getAuthHeader() });
      if (res.ok) {
        const users = await res.json();
        setClients(users.filter((u: any) => u.role === 'client'));
      }
    } catch (e) { console.error(e); }
  };

  const handleStartChat = async (lead: Lead) => {
    const matchedClient = clients.find(c => c.email?.toLowerCase() === lead.email?.toLowerCase());
    if (!matchedClient) {
      alert(`No registered account found for ${lead.email}. The lead must register as a client first.`);
      return;
    }
    const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
    try {
      const res = await fetch("/api/tickets/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          clientId: matchedClient.id,
          clientName: matchedClient.name,
          department: "management",
          text: `Following up on your inquiry: "${lead.message}"`
        })
      });
      if (res.ok) {
        router.push("/admin/tickets");
      }
    } catch (e) { console.error(e); }
  };

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/leads", {
        cache: "no-store",
        headers: getAuthHeader()
      });
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      }
    } catch (error) {
      console.error("Failed to fetch leads", error);
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchClients();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchLeads();
      }
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const filteredLeads = filter === "All" ? leads : leads.filter(l => l.status === filter);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'New': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Contacted': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'Converted': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'Lost': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-serif text-white tracking-wider uppercase">Inquiries & Leads</h2>
          <p className="text-zinc-500 font-sans mt-2">Manage customer contacts and AI chat inquiries.</p>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-zinc-900 rounded-lg w-full md:w-fit border border-zinc-800 overflow-x-auto hide-scrollbar">
        {["All", "New", "Contacted", "Converted", "Lost"].map(status => (
          <button 
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-md text-xs font-sans tracking-widest uppercase transition-colors ${
              filter === status ? 'bg-[#c09b62] text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {filteredLeads.map((lead) => (
          <div key={lead.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col md:flex-row gap-6 hover:border-zinc-700 transition-colors">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h3 className="text-xl font-serif text-white uppercase tracking-wider">{lead.name}</h3>
                <span className={`px-3 py-1 rounded-full text-[10px] tracking-widest uppercase border ${getStatusColor(lead.status)}`}>
                  {lead.status}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-6 mb-6">
                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                  <Mail className="w-4 h-4 text-[#c09b62]" />
                  {lead.email}
                </div>
                {lead.phone && (
                  <div className="flex items-center gap-2 text-zinc-400 text-sm">
                    <Phone className="w-4 h-4 text-[#c09b62]" />
                    {lead.phone}
                  </div>
                )}
                <div className="flex items-center gap-2 text-zinc-500 text-xs">
                  <Clock className="w-4 h-4" />
                  {new Date(lead.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="bg-black/40 border border-white/5 rounded-lg p-4">
                <p className="text-zinc-300 font-light text-sm italic leading-relaxed">
                  "{lead.message}"
                </p>
              </div>
            </div>

            <div className="flex md:flex-col gap-2 md:w-48 pt-2">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1 hidden md:block">Update Status</p>
              <select 
                value={lead.status}
                onChange={(e) => updateStatus(lead.id, e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white focus:border-[#c09b62] outline-none appearance-none cursor-pointer"
              >
                <option value="New">Mark as New</option>
                <option value="Contacted">Mark as Contacted</option>
                <option value="Converted">Mark as Converted</option>
                <option value="Lost">Mark as Lost</option>
              </select>
              <button 
                onClick={() => handleStartChat(lead)}
                className="w-full bg-[#c09b62]/10 hover:bg-[#c09b62]/20 text-[#c09b62] border border-[#c09b62]/20 rounded-lg px-4 py-3 text-xs tracking-widest uppercase transition-colors mt-auto flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-3 h-3" /> Start Chat
              </button>
            </div>
          </div>
        ))}
        {filteredLeads.length === 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center flex flex-col items-center justify-center">
            <Search className="w-12 h-12 text-zinc-700 mb-4" />
            <p className="text-zinc-400">No leads found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
