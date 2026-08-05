"use client";

import { useEffect, useState } from "react";
import { Send, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { getAuthHeader } from "../layout";

export default function AdminTelegramSettings() {
  const [token, setToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/telegram/settings", {
          headers: getAuthHeader()
        });
        if (res.ok) {
          const data = await res.json();
          setToken(data.token);
          setChatId(data.chatId);
        }
      } catch (error) {
        console.error("Failed to fetch settings", error);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');
    try {
      await fetch("/api/telegram/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({ token, chatId }),
      });
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      console.error("Failed to save settings", error);
      setStatus('error');
    }
  };

  const handleTest = async () => {
    setTestStatus('testing');
    try {
      const res = await fetch("/api/telegram/test", { 
        method: "POST",
        headers: getAuthHeader()
      });
      const data = await res.json();
      if (data.success) {
        setTestStatus('success');
      } else {
        setTestStatus('error');
      }
      setTimeout(() => setTestStatus('idle'), 3000);
    } catch (error) {
      console.error("Failed to test telegram", error);
      setTestStatus('error');
      setTimeout(() => setTestStatus('idle'), 3000);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div>
        <h2 className="text-3xl font-serif text-white tracking-wider uppercase">Telegram Integrations</h2>
        <p className="text-zinc-500 font-sans mt-2">Configure your bot to receive instant lead notifications directly on your device.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
        <div className="flex items-start gap-4 mb-8 pb-8 border-b border-zinc-800">
          <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 shrink-0">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-white font-sans text-lg tracking-wider mb-2">Bot Configuration</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              To get started, create a new bot using <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-[#c09b62] hover:underline">@BotFather</a> on Telegram. 
              Copy the HTTP API Token and paste it below. Then, start a chat with your bot and send a message to get your Chat ID.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest text-zinc-400">Bot Token</label>
            <input 
              required value={token || ""} onChange={e => setToken(e.target.value)}
              placeholder="e.g. 123456789:ABCdefGHIjklmNOPqrstUVWxyz"
              className="bg-black border border-zinc-800 rounded-lg p-4 text-white focus:border-[#c09b62] outline-none transition-colors font-mono text-sm"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest text-zinc-400">Chat ID</label>
            <input 
              required value={chatId || ""} onChange={e => setChatId(e.target.value)}
              placeholder="e.g. 987654321"
              className="bg-black border border-zinc-800 rounded-lg p-4 text-white focus:border-[#c09b62] outline-none transition-colors font-mono text-sm"
            />
          </div>

          <div className="flex items-center gap-4 mt-4">
            <button 
              type="submit" 
              disabled={status === 'saving'}
              className="bg-[#c09b62] hover:bg-[#dfc499] text-black px-8 py-3 rounded-lg flex items-center gap-2 font-sans text-sm tracking-wider uppercase transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {status === 'saving' ? 'Saving...' : 'Save Configuration'}
            </button>
            
            {status === 'success' && (
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                Settings saved
              </div>
            )}
            
            {status === 'error' && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                Failed to save
              </div>
            )}
          </div>
        </form>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
        <h3 className="text-white font-sans text-lg tracking-wider mb-2">Test Integration</h3>
        <p className="text-zinc-400 text-sm leading-relaxed mb-6">
          Send a test notification to verify your bot is configured correctly and able to reach your chat.
        </p>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={handleTest}
            disabled={testStatus === 'testing'}
            className="border border-zinc-700 hover:bg-zinc-800 text-white px-8 py-3 rounded-lg flex items-center gap-2 font-sans text-sm tracking-wider uppercase transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {testStatus === 'testing' ? 'Sending...' : 'Send Test Notification'}
          </button>
          
          {testStatus === 'success' && (
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              Notification sent! Check Telegram.
            </div>
          )}
          
          {testStatus === 'error' && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              Failed to send. Check credentials.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
