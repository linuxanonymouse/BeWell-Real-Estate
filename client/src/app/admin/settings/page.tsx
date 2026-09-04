"use client";

import { useState } from "react";
import { getAuthHeader } from "../layout";

export default function AdminSettings() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
    try {
      const userStr = localStorage.getItem('bewell_user');
      if (!userStr) return;
      const user = JSON.parse(userStr);
      
      const res = await fetch(`/api/auth/users/${user.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ password })
      });

      if (res.ok) {
        setMessage("Password updated successfully!");
        setPassword("");
        setConfirmPassword("");
      } else {
        setMessage("Failed to update password.");
      }
    } catch (error) {
      setMessage("An error occurred.");
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-3xl font-serif text-white tracking-wider uppercase">Settings</h2>
        <p className="text-zinc-500 font-sans mt-2">Manage your account preferences and security.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-xl">
        <h3 className="text-xl font-serif text-white uppercase tracking-wider mb-6">Change Password</h3>
        
        {message && (
          <div className={`p-4 mb-6 rounded border ${message.includes('success') ? 'bg-green-900/20 border-green-900 text-green-400' : 'bg-red-900/20 border-red-900 text-red-400'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest text-zinc-400">New Password</label>
            <input 
              type="password"
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              className="bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-[#c09b62] outline-none transition-colors"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest text-zinc-400">Confirm New Password</label>
            <input 
              type="password"
              required 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)}
              className="bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-[#c09b62] outline-none transition-colors"
            />
          </div>
          <button type="submit" className="mt-4 py-3 bg-[#c09b62] rounded-lg text-black hover:bg-[#dfc499] transition-colors uppercase tracking-wider text-xs font-medium">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
