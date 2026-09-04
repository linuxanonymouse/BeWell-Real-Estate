"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Shield, Ban, Trash2, Key, Search } from "lucide-react";
import { getAuthHeader } from "../layout";

export default function AdminClientsPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const header = getAuthHeader();
    if (!header.Authorization) {
      router.push("/admin/login");
      return;
    }
    try {
      const res = await fetch("/api/auth/users", { headers: header });
      if (res.ok) {
        setUsers(await res.json());
      } else {
        if (res.status === 401) router.push("/admin/login");
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleBan = async (id: string, currentBanStatus: boolean) => {
    try {
      const res = await fetch(`/api/auth/users/${id}/ban`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({ banned: !currentBanStatus })
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(prev => prev.map(u => u.id === id ? { ...u, banned: data.banned } : u));
      }
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this user?")) return;
    try {
      const res = await fetch(`/api/auth/users/${id}`, {
        method: "DELETE",
        headers: getAuthHeader()
      });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== id));
      }
    } catch (e) { console.error(e); }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || !selectedUserId) return;
    try {
      const res = await fetch(`/api/auth/users/${selectedUserId}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({ password: newPassword })
      });
      if (res.ok) {
        setShowPasswordModal(false);
        setNewPassword("");
        setSelectedUserId("");
        alert("Password updated successfully.");
      }
    } catch (e) { console.error(e); }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="min-h-screen bg-[#050505]" />;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif uppercase tracking-wider text-white">Client Management</h1>
          <p className="text-zinc-500 text-sm mt-1">Manage all user accounts, roles, and access</p>
        </div>
      </div>

      <div className="bg-[#0d0a08] border border-zinc-900 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-900 flex justify-between items-center bg-black/40">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#c09b62] transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-widest">
            <Users className="w-4 h-4" />
            {filteredUsers.length} Users Found
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-900 bg-black/20 text-xs uppercase tracking-widest text-zinc-500">
                <th className="p-4 font-normal">User</th>
                <th className="p-4 font-normal">Role</th>
                <th className="p-4 font-normal">Contact</th>
                <th className="p-4 font-normal">Status</th>
                <th className="p-4 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className="border-b border-zinc-900/50 hover:bg-white/5 transition-colors group">
                  <td className="p-4">
                    <div className="text-sm text-white font-medium">{user.name}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">{user.email}</div>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full ${
                      user.role === 'superadmin' ? 'bg-[#c09b62]/10 text-[#c09b62] border border-[#c09b62]/20' : 
                      user.role === 'support' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                      'bg-zinc-800 text-zinc-300'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-xs text-zinc-400">{user.phone || 'No phone'}</div>
                    <div className="text-[10px] text-zinc-500 mt-1">
                      Telegram: {user.telegramLinked ? <span className="text-blue-400">Linked</span> : 'Not linked'}
                    </div>
                  </td>
                  <td className="p-4">
                    {user.banned ? (
                      <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 flex items-center w-max gap-1">
                        <Ban className="w-3 h-3" /> Banned
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setSelectedUserId(user.id); setShowPasswordModal(true); }}
                        className="p-2 bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors"
                        title="Update Password"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      {user.role !== 'superadmin' && (
                        <>
                          <button 
                            onClick={() => handleBan(user.id, user.banned)}
                            className={`p-2 rounded-lg transition-colors ${user.banned ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20'}`}
                            title={user.banned ? "Unban User" : "Ban User"}
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(user.id)}
                            className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-500 text-sm">
                    No users found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d0a08] border border-zinc-800 rounded-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-serif uppercase tracking-wider mb-4 text-white">Update Password</h3>
            <p className="text-zinc-500 text-xs mb-4">Enter a new password for this user.</p>
            <input 
              type="password" 
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="New password..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[#c09b62] mb-6"
            />
            <div className="flex gap-3">
              <button onClick={() => { setShowPasswordModal(false); setNewPassword(""); setSelectedUserId(""); }} className="flex-1 py-2 border border-zinc-700 rounded-lg text-xs uppercase tracking-widest hover:bg-white/5 text-white transition-colors">Cancel</button>
              <button onClick={handleUpdatePassword} disabled={!newPassword} className="flex-1 py-2 bg-[#c09b62] text-black disabled:opacity-50 rounded-lg text-xs uppercase tracking-widest hover:bg-[#dfc499] transition-colors">Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
