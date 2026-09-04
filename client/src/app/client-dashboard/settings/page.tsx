"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Shield, AlertTriangle, Copy, CheckCircle2 } from "lucide-react";

export default function ClientSettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [newToken, setNewToken] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/auth/login"); return; }
    try {
      const res = await fetch("/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/auth/login");
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleReset = async () => {
    setResetting(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/auth/reset-telegram", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNewToken(data.telegramLinkToken);
        // Update local storage to reflect unlinked state
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          user.telegramLinked = false;
          localStorage.setItem("user", JSON.stringify(user));
        }
        setShowConfirm(false);
      }
    } catch (e) { console.error(e); }
    finally { setResetting(false); }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`/start ${newToken}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="min-h-screen bg-[#050505]" />;

  return (
    <main className="pt-32 pb-24 px-6 md:px-12 lg:px-24 max-w-4xl mx-auto">
      <Link href="/client-dashboard" className="flex items-center gap-2 text-[#c09b62] text-xs uppercase tracking-widest mb-8 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <h1 className="text-3xl font-serif uppercase tracking-wider mb-8">Settings</h1>

      {/* Account Info */}
      <div className="bg-[#0d0a08] border border-white/10 rounded-xl p-6 mb-6">
        <h3 className="text-sm uppercase tracking-widest text-[#c09b62] mb-4">Account</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-zinc-500">Name</span>
            <p className="text-white">{profile?.name}</p>
          </div>
          <div>
            <span className="text-zinc-500">Email</span>
            <p className="text-white">{profile?.email}</p>
          </div>
          <div>
            <span className="text-zinc-500">Phone</span>
            <p className="text-white">{profile?.phone || "Not set"}</p>
          </div>
          <div>
            <span className="text-zinc-500">Telegram Status</span>
            <p className={profile?.telegramLinked ? "text-green-400" : "text-yellow-400"}>
              {profile?.telegramLinked ? "✅ Linked" : "⚠️ Not linked"}
            </p>
          </div>
        </div>
      </div>

      {/* Telegram Link Management */}
      <div className="bg-[#0d0a08] border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-[#c09b62]" />
          <h3 className="text-sm uppercase tracking-widest text-[#c09b62]">Telegram Link</h3>
        </div>

        {newToken ? (
          <div>
            <p className="text-zinc-400 text-sm mb-4">
              Your old Telegram link has been terminated. Use the new token below to link a new device.
            </p>
            <div className="bg-black border border-[#c09b62]/30 rounded-xl p-4 flex items-center justify-between gap-4 mb-4">
              <code className="text-[#c09b62] text-lg tracking-widest font-mono select-all">
                /start {newToken}
              </code>
              <button 
                onClick={handleCopy}
                className="p-3 bg-[#c09b62]/10 hover:bg-[#c09b62]/20 text-[#c09b62] rounded-lg transition-colors flex items-center gap-2 text-sm"
              >
                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-zinc-500 text-xs">
              Send this command to <strong>@Bwell_Real_estate_Bot</strong> on Telegram to link your new device.
            </p>
          </div>
        ) : (
          <div>
            <p className="text-zinc-400 text-sm mb-4">
              If your phone was stolen or you need to switch devices, you can terminate the current Telegram link and generate a new token. 
              The admin will be notified of this change for security purposes.
            </p>

            {!showConfirm ? (
              <button
                onClick={() => setShowConfirm(true)}
                className="flex items-center gap-2 px-6 py-3 border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors rounded-lg text-xs uppercase tracking-widest"
              >
                <RefreshCw className="w-4 h-4" /> Reset Telegram Link
              </button>
            ) : (
              <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
                <div className="flex items-center gap-2 text-red-400 mb-3">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-sm font-semibold uppercase tracking-widest">Confirm Reset</span>
                </div>
                <p className="text-zinc-400 text-sm mb-4">
                  This will unlink all existing Telegram devices and generate a new token. The admin will be notified. Are you sure?
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setShowConfirm(false)} className="px-6 py-3 border border-white/20 rounded-lg text-xs uppercase tracking-widest hover:bg-white/5 transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={resetting}
                    className="px-6 py-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs uppercase tracking-widest hover:bg-red-500/30 transition-colors disabled:opacity-50"
                  >
                    {resetting ? "Resetting..." : "Yes, Reset"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
