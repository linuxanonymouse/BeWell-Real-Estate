"use client";

import { useEffect, useState, useCallback, Fragment } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, TrendingUp, TrendingDown, DollarSign, Package, X, RefreshCw, ChevronDown, ChevronUp, BarChart3, History, Users, Ban, MessageCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, Cell, Area, AreaChart } from "recharts";
import { getAuthHeader } from "../../layout";

interface PriceHistory {
  date: string;
  price: number;
}

interface Material {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  initialPrice: number;
  currentPrice: number;
  priceHistory: PriceHistory[];
}

interface Project {
  id: string;
  name: string;
  location: string;
  status: string;
  value: string;
  materials: Material[];
  progressUpdates?: { text: string; images: string[]; date: string }[];
}

export default function ProjectResourcesPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState<"ETB" | "USD">("ETB");
  const [expandedMaterial, setExpandedMaterial] = useState<string | null>(null);

  // Add material form
  const [showAddForm, setShowAddForm] = useState(false);
  const [matName, setMatName] = useState("");
  const [matUnit, setMatUnit] = useState("units");
  const [matQty, setMatQty] = useState("");
  const [matPrice, setMatPrice] = useState("");
  const [matCurrency, setMatCurrency] = useState<"ETB" | "USD">("ETB");

  // Update price modal
  const [updatingMaterial, setUpdatingMaterial] = useState<Material | null>(null);
  const [newPrice, setNewPrice] = useState("");

  // Add Progress Update Modal
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [progressImage, setProgressImage] = useState("");
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  // Assign Client Modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [assigning, setAssigning] = useState(false);

  // Send Message Modal
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messagingClient, setMessagingClient] = useState<any>(null);
  const [sendingMsg, setSendingMsg] = useState(false);

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/auth/clients", { headers: getAuthHeader() });
      if (res.ok) setClients(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleAssignClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) return;
    setAssigning(true);
    try {
      const res = await fetch("/api/auth/assign-project", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({ clientId: selectedClientId, projectId }),
      });
      if (res.ok) {
        setShowAssignModal(false);
        setSelectedClientId("");
        alert("Client assigned successfully! They have been notified via Telegram.");
        fetchClients(); // Refresh to show in assigned list
      } else {
        alert("Failed to assign client");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAssigning(false);
    }
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
        setClients(prev => prev.map(c => c.id === id ? { ...c, banned: data.banned } : c));
      }
    } catch (e) { console.error(e); }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !messagingClient) return;
    setSendingMsg(true);
    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const res = await fetch("/api/tickets/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({
          clientId: messagingClient.id,
          clientName: messagingClient.name,
          department: user?.role === 'superadmin' ? 'management' : 'support',
          text: messageText
        })
      });
      if (res.ok) {
        setShowMessageModal(false);
        setMessageText("");
        setMessagingClient(null);
        alert("Message sent successfully!");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSendingMsg(false);
    }
  };

  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setProject(data);
      }
    } catch (error) {
      console.error("Failed to fetch project", error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(matPrice);
    const quantity = parseFloat(matQty);
    if (isNaN(price) || isNaN(quantity)) return;

    try {
      const res = await fetch(`/api/projects/${projectId}/materials`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({
          name: matName,
          unit: matUnit,
          quantity,
          initialPrice: price,
          currentPrice: price,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setProject(data);
        setMatName("");
        setMatUnit("units");
        setMatQty("");
        setMatPrice("");
        setShowAddForm(false);
      }
    } catch (error) {
      console.error("Failed to add material", error);
    }
  };

  const handleUpdatePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingMaterial) return;
    const price = parseFloat(newPrice);
    if (isNaN(price)) return;

    try {
      const res = await fetch(`/api/projects/${projectId}/materials/${updatingMaterial.id}/price`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({ price }),
      });
      if (res.ok) {
        const data = await res.json();
        setProject(data);
        setUpdatingMaterial(null);
        setNewPrice("");
      }
    } catch (error) {
      console.error("Failed to update price", error);
    }
  };

  const handleAddProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!progressText.trim()) return;

    try {
      const res = await fetch(`/api/projects/${projectId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({ 
          text: progressText, 
          images: progressImage ? [progressImage] : [] 
        }),
      });
      if (res.ok) {
        await fetchProject();
        setShowProgressModal(false);
        setProgressText("");
        setProgressImage("");
      }
    } catch (error) {
      console.error("Failed to add progress", error);
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingMedia(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: getAuthHeader(),
        body: formData,
      });
      
      if (res.ok) {
        const data = await res.json();
        setProgressImage(data.url);
      }
    } catch (error) {
      console.error("Failed to upload media", error);
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!confirm("Delete this material?")) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/materials/${materialId}`, {
        method: "DELETE",
        headers: getAuthHeader(),
      });
      if (res.ok) {
        const data = await res.json();
        setProject(data);
      }
    } catch (error) {
      console.error("Failed to delete material", error);
    }
  };

  if (loading) {
    return <div className="text-zinc-500 p-8">Loading project resources...</div>;
  }

  if (!project) {
    return <div className="text-red-400 p-8">Project not found.</div>;
  }

  const materials = project.materials || [];

  // Calculate totals
  const initialTotal = materials.reduce((sum, m) => sum + m.quantity * m.initialPrice, 0);
  const currentTotal = materials.reduce((sum, m) => sum + m.quantity * m.currentPrice, 0);
  const inflationPct = initialTotal > 0 ? ((currentTotal - initialTotal) / initialTotal) * 100 : 0;
  const isUp = inflationPct > 0;
  const isDown = inflationPct < 0;

  // Per-material inflation data for bar chart
  const materialInflationData = materials.map((m) => {
    const change = m.initialPrice > 0 ? ((m.currentPrice - m.initialPrice) / m.initialPrice) * 100 : 0;
    return { name: m.name, inflation: parseFloat(change.toFixed(2)) };
  });

  const avgInflation = materialInflationData.length > 0
    ? materialInflationData.reduce((sum, d) => sum + d.inflation, 0) / materialInflationData.length
    : 0;

  // Build chart data from all materials' price histories
  const buildChartData = () => {
    if (materials.length === 0) return [];

    const dateMap = new Map<string, Record<string, number>>();

    materials.forEach((mat) => {
      (mat.priceHistory || []).forEach((ph) => {
        const dateKey = new Date(ph.date).toLocaleString("en-US", { month: "short", day: "numeric", year: "2-digit", hour: "2-digit", minute: "2-digit" });
        if (!dateMap.has(dateKey)) {
          dateMap.set(dateKey, {});
        }
        const entry = dateMap.get(dateKey)!;
        entry[mat.name] = ph.price;
      });
    });

    const sortedDates = [...dateMap.entries()].sort((a, b) => {
      return new Date(a[0]).getTime() - new Date(b[0]).getTime();
    });

    const lastKnownPrices: Record<string, number> = {};
    materials.forEach((m) => {
      lastKnownPrices[m.name] = m.initialPrice;
    });

    return sortedDates.map(([date, prices]) => {
      Object.entries(prices).forEach(([name, price]) => {
        lastKnownPrices[name] = price;
      });

      let total = 0;
      materials.forEach((m) => {
        total += m.quantity * (lastKnownPrices[m.name] || m.initialPrice);
      });

      return { date, total, ...prices };
    });
  };

  const chartData = buildChartData();
  const materialColors = ["#c09b62", "#60a5fa", "#f472b6", "#34d399", "#fbbf24", "#a78bfa", "#fb923c", "#22d3ee"];

  const formatCurrency = (val: number) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(2)}M`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`;
    return val.toFixed(2);
  };

  // Get previous price for a material (second-to-last in history)
  const getPreviousPrice = (m: Material) => {
    if (!m.priceHistory || m.priceHistory.length < 2) return m.initialPrice;
    return m.priceHistory[m.priceHistory.length - 2].price;
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin/projects")}
            className="text-zinc-500 hover:text-white transition-colors p-2 rounded-lg hover:bg-zinc-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-serif text-white uppercase tracking-widest">{project.name}</h1>
            <p className="text-zinc-500 font-sans tracking-widest uppercase text-[10px] mt-1">Resource & Inflation Management</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowAssignModal(true)}
            className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-sans text-xs tracking-wider uppercase transition-colors"
          >
            <Users className="w-4 h-4" /> Assign Client
          </button>
          {/* Currency Toggle */}
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
            <button
              onClick={() => setCurrency("ETB")}
              className={`px-4 py-2 rounded-md text-xs font-sans uppercase tracking-wider transition-colors ${currency === "ETB" ? "bg-[#c09b62] text-black" : "text-zinc-400 hover:text-white"}`}
            >
              ETB
            </button>
            <button
              onClick={() => setCurrency("USD")}
              className={`px-4 py-2 rounded-md text-xs font-sans uppercase tracking-wider transition-colors ${currency === "USD" ? "bg-[#c09b62] text-black" : "text-zinc-400 hover:text-white"}`}
            >
              USD
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Initial Total */}
        <div className="bg-[#050505] border border-zinc-900 rounded-2xl p-6 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-zinc-400" />
            </div>
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-sans">Initial Expense</span>
          </div>
          <div className="text-2xl font-serif text-white truncate">{formatCurrency(initialTotal)} <span className="text-sm text-zinc-500">{currency}</span></div>
        </div>

        {/* Current Total */}
        <div className="bg-[#050505] border border-zinc-900 rounded-2xl p-6 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-[#c09b62]" />
            </div>
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-sans">Current Expense</span>
          </div>
          <div className="text-2xl font-serif text-white truncate">{formatCurrency(currentTotal)} <span className="text-sm text-zinc-500">{currency}</span></div>
        </div>

        {/* Overall Inflation */}
        <div className={`bg-[#050505] border rounded-2xl p-6 ${isUp ? 'border-red-900/50' : isDown ? 'border-green-900/50' : 'border-zinc-900'}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isUp ? 'bg-red-950' : isDown ? 'bg-green-950' : 'bg-zinc-800'}`}>
              {isUp ? <TrendingUp className="w-5 h-5 text-red-400" /> : isDown ? <TrendingDown className="w-5 h-5 text-green-400" /> : <TrendingUp className="w-5 h-5 text-zinc-400" />}
            </div>
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-sans">Overall Inflation</span>
          </div>
          <div className={`text-2xl font-serif ${isUp ? 'text-red-400' : isDown ? 'text-green-400' : 'text-white'}`}>
            {isUp ? '+' : ''}{inflationPct.toFixed(2)}%
          </div>
        </div>

        {/* Average Per-Material Inflation */}
        <div className={`bg-[#050505] border rounded-2xl p-6 ${avgInflation > 0 ? 'border-red-900/50' : avgInflation < 0 ? 'border-green-900/50' : 'border-zinc-900'}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${avgInflation > 0 ? 'bg-red-950' : avgInflation < 0 ? 'bg-green-950' : 'bg-zinc-800'}`}>
              <BarChart3 className={`w-5 h-5 ${avgInflation > 0 ? 'text-red-400' : avgInflation < 0 ? 'text-green-400' : 'text-zinc-400'}`} />
            </div>
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-sans">Avg. Material Inflation</span>
          </div>
          <div className={`text-2xl font-serif ${avgInflation > 0 ? 'text-red-400' : avgInflation < 0 ? 'text-green-400' : 'text-white'}`}>
            {avgInflation > 0 ? '+' : ''}{avgInflation.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Total Expense Over Time Chart */}
      {chartData.length > 0 && (
        <div className="bg-[#050505] border border-zinc-900 rounded-2xl p-6">
          <h2 className="text-[#c09b62] text-sm uppercase tracking-widest font-sans pb-4 border-b border-zinc-900 mb-6">Expense Over Time</h2>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c09b62" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#c09b62" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#71717a" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
                <YAxis stroke="#71717a" tick={{ fontSize: 11 }} tickFormatter={(v) => formatCurrency(v)} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #27272a', borderRadius: '12px', fontSize: '12px' }}
                  labelStyle={{ color: '#a1a1aa' }}
                  formatter={(value: any, name: any) => [`${formatCurrency(value)} ${currency}`, name]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#a1a1aa' }} />
                <Area type="monotone" dataKey="total" name="Total Expense" stroke="#c09b62" strokeWidth={3} fill="url(#totalGrad)" dot={{ fill: '#c09b62', r: 4 }} activeDot={{ r: 6 }} />
                {materials.map((m, i) => (
                  <Line key={m.id} type="monotone" dataKey={m.name} stroke={materialColors[i % materialColors.length]} strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Market Analysis Section */}
      {materials.length > 0 && (
        <div className="bg-[#050505] border border-zinc-900 rounded-2xl p-6">
          <h2 className="text-[#c09b62] text-sm uppercase tracking-widest font-sans pb-4 border-b border-zinc-900 mb-6 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> Market Analysis
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Per-Material Inflation Bar Chart */}
            <div className="min-w-0">
              <h3 className="text-zinc-400 text-xs uppercase tracking-widest mb-4 font-sans">Inflation by Material</h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={materialInflationData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis type="number" stroke="#71717a" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                    <YAxis dataKey="name" type="category" stroke="#71717a" tick={{ fontSize: 11 }} width={100} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #27272a', borderRadius: '12px', fontSize: '12px' }}
                      formatter={(value: any, name: any) => [`${Number(value).toFixed(2)}%`, 'Inflation']}
                    />
                    <Bar dataKey="inflation" radius={[0, 4, 4, 0]}>
                      {materialInflationData.map((entry, index) => (
                        <Cell key={index} fill={entry.inflation > 0 ? '#ef4444' : entry.inflation < 0 ? '#22c55e' : '#71717a'} fillOpacity={0.7} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Market Comparison Table */}
            <div className="min-w-0">
              <h3 className="text-zinc-400 text-xs uppercase tracking-widest mb-4 font-sans">Material Comparison</h3>
              <div className="overflow-x-auto border border-zinc-800 rounded-xl">
                <table className="w-full text-left font-sans text-xs">
                  <thead className="bg-zinc-950/50 border-b border-zinc-800 text-zinc-500 uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Material</th>
                      <th className="p-3">Initial</th>
                      <th className="p-3">Current</th>
                      <th className="p-3">Previous</th>
                      <th className="p-3">Inflation</th>
                      <th className="p-3">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {materials.map((m) => {
                      const change = m.initialPrice > 0 ? ((m.currentPrice - m.initialPrice) / m.initialPrice) * 100 : 0;
                      const prevPrice = getPreviousPrice(m);
                      const prevChange = prevPrice > 0 ? ((m.currentPrice - prevPrice) / prevPrice) * 100 : 0;
                      const mUp = change > 0;
                      const mDown = change < 0;
                      return (
                        <tr key={m.id} className="hover:bg-zinc-900/30">
                          <td className="p-3 text-white font-medium">{m.name}</td>
                          <td className="p-3 text-zinc-400">{m.initialPrice.toLocaleString()}</td>
                          <td className="p-3 text-white">{m.currentPrice.toLocaleString()}</td>
                          <td className="p-3 text-zinc-400">{prevPrice.toLocaleString()}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] ${mUp ? 'bg-red-500/10 text-red-400' : mDown ? 'bg-green-500/10 text-green-400' : 'bg-zinc-500/10 text-zinc-400'}`}>
                              {mUp ? '+' : ''}{change.toFixed(1)}%
                            </span>
                          </td>
                          <td className="p-3">
                            {prevChange > 0 ? (
                              <span className="text-red-400 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +{prevChange.toFixed(1)}%</span>
                            ) : prevChange < 0 ? (
                              <span className="text-green-400 flex items-center gap-1"><TrendingDown className="w-3 h-3" /> {prevChange.toFixed(1)}%</span>
                            ) : (
                              <span className="text-zinc-500">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Materials Table with Expandable History */}
      <div className="bg-[#050505] border border-zinc-900 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-zinc-900 flex justify-between items-center">
          <h2 className="text-[#c09b62] text-sm uppercase tracking-widest font-sans">Materials / Resources</h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-[#c09b62] hover:bg-[#dfc499] text-black px-5 py-2 rounded-lg flex items-center gap-2 font-sans text-xs tracking-wider uppercase transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add Material
          </button>
        </div>

        {materials.length === 0 ? (
          <div className="p-12 text-center text-zinc-600 font-sans">
            <Package className="w-12 h-12 mx-auto mb-4 text-zinc-800" />
            <p className="text-sm">No materials added yet.</p>
            <p className="text-xs mt-1 text-zinc-700">Click &quot;Add Material&quot; to start tracking resources and inflation.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-sm whitespace-nowrap">
              <thead className="bg-zinc-950/50 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-xs">
                <tr>
                  <th className="p-4 font-medium w-8"></th>
                  <th className="p-4 font-medium">Material</th>
                  <th className="p-4 font-medium">Qty</th>
                  <th className="p-4 font-medium">Unit</th>
                  <th className="p-4 font-medium">Initial</th>
                  <th className="p-4 font-medium">Previous</th>
                  <th className="p-4 font-medium">Current</th>
                  <th className="p-4 font-medium">Subtotal</th>
                  <th className="p-4 font-medium">Change</th>
                  <th className="p-4 font-medium">History</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {materials.map((m, mIdx) => {
                  const subCurr = m.quantity * m.currentPrice;
                  const change = m.initialPrice > 0 ? ((m.currentPrice - m.initialPrice) / m.initialPrice) * 100 : 0;
                  const prevPrice = getPreviousPrice(m);
                  const prevChange = prevPrice > 0 ? ((m.currentPrice - prevPrice) / prevPrice) * 100 : 0;
                  const mUp = change > 0;
                  const mDown = change < 0;
                  const isExpanded = expandedMaterial === m.id;
                  const historyCount = m.priceHistory?.length || 0;

                  return (
                    <Fragment key={m.id}>
                      <tr className="hover:bg-zinc-900/30 transition-colors cursor-pointer" onClick={() => setExpandedMaterial(isExpanded ? null : m.id)}>
                        <td className="pl-4">
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                        </td>
                        <td className="p-4 text-white font-medium">{m.name}</td>
                        <td className="p-4 text-zinc-300">{m.quantity.toLocaleString()}</td>
                        <td className="p-4 text-zinc-400">{m.unit}</td>
                        <td className="p-4 text-zinc-400">{m.initialPrice.toLocaleString()} {currency}</td>
                        <td className="p-4 text-zinc-400">{prevPrice.toLocaleString()} {currency}</td>
                        <td className="p-4 text-white">{m.currentPrice.toLocaleString()} {currency}</td>
                        <td className="p-4 text-white">{formatCurrency(subCurr)} {currency}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs tracking-wider ${
                            mUp ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            mDown ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                            'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                          }`}>
                            {mUp ? '+' : ''}{change.toFixed(1)}%
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-zinc-500 text-xs flex items-center gap-1">
                            <History className="w-3 h-3" /> {historyCount} entries
                          </span>
                        </td>
                        <td className="p-4 flex justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => { setUpdatingMaterial(m); setNewPrice(m.currentPrice.toString()); }}
                            className="text-zinc-500 hover:text-[#c09b62] transition-colors"
                            title="Update Price"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMaterial(m.id)}
                            className="text-zinc-500 hover:text-red-400 transition-colors"
                            title="Delete Material"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                      {/* Expanded Price History */}
                      {isExpanded && (
                        <tr key={`${m.id}-history`}>
                          <td colSpan={11} className="p-0">
                            <div className="bg-zinc-950/50 border-t border-zinc-800 p-6">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Price History Mini Chart */}
                                <div>
                                  <h4 className="text-zinc-400 text-xs uppercase tracking-widest mb-3 font-sans flex items-center gap-2">
                                    <TrendingUp className="w-3 h-3" /> Price Trend – {m.name}
                                  </h4>
                                  {m.priceHistory && m.priceHistory.length > 0 ? (
                                    <div className="h-[180px]">
                                      <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={m.priceHistory.map((ph) => ({
                                          date: new Date(ph.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                                          price: ph.price,
                                        }))}>
                                          <defs>
                                            <linearGradient id={`grad-${m.id}`} x1="0" y1="0" x2="0" y2="1">
                                              <stop offset="5%" stopColor={mUp ? '#ef4444' : '#22c55e'} stopOpacity={0.3} />
                                              <stop offset="95%" stopColor={mUp ? '#ef4444' : '#22c55e'} stopOpacity={0} />
                                            </linearGradient>
                                          </defs>
                                          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                          <XAxis dataKey="date" stroke="#71717a" tick={{ fontSize: 10 }} />
                                          <YAxis stroke="#71717a" tick={{ fontSize: 10 }} />
                                          <Tooltip
                                            contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #27272a', borderRadius: '8px', fontSize: '11px' }}
                                            formatter={(value: any, name: any) => [`${value.toLocaleString()} ${currency}`, 'Price']}
                                          />
                                          <Area type="monotone" dataKey="price" stroke={mUp ? '#ef4444' : mDown ? '#22c55e' : '#c09b62'} strokeWidth={2} fill={`url(#grad-${m.id})`} dot={{ r: 3 }} />
                                        </AreaChart>
                                      </ResponsiveContainer>
                                    </div>
                                  ) : (
                                    <div className="text-zinc-600 text-xs py-8 text-center">No price history available yet.</div>
                                  )}
                                </div>

                                {/* Price History Table */}
                                <div>
                                  <h4 className="text-zinc-400 text-xs uppercase tracking-widest mb-3 font-sans flex items-center gap-2">
                                    <History className="w-3 h-3" /> Price History Log
                                  </h4>
                                  <div className="max-h-[200px] overflow-y-auto border border-zinc-800 rounded-lg">
                                    <table className="w-full text-xs font-sans">
                                      <thead className="bg-zinc-900/50 sticky top-0">
                                        <tr className="text-zinc-500 uppercase tracking-wider">
                                          <th className="p-2 text-left">Date</th>
                                          <th className="p-2 text-left">Price</th>
                                          <th className="p-2 text-left">Δ Prev</th>
                                          <th className="p-2 text-left">Δ Initial</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-zinc-800/50">
                                        {(m.priceHistory || []).slice().reverse().map((ph, idx, arr) => {
                                          const prevPh = idx < arr.length - 1 ? arr[idx + 1] : null;
                                          const changeFromPrev = prevPh ? ((ph.price - prevPh.price) / prevPh.price) * 100 : 0;
                                          const changeFromInit = m.initialPrice > 0 ? ((ph.price - m.initialPrice) / m.initialPrice) * 100 : 0;
                                          return (
                                            <tr key={idx} className="hover:bg-zinc-900/30">
                                              <td className="p-2 text-zinc-400">{new Date(ph.date).toLocaleString("en-US", { month: "short", day: "numeric", year: "2-digit", hour: "2-digit", minute: "2-digit" })}</td>
                                              <td className="p-2 text-white">{ph.price.toLocaleString()} {currency}</td>
                                              <td className="p-2">
                                                {prevPh ? (
                                                  <span className={changeFromPrev > 0 ? 'text-red-400' : changeFromPrev < 0 ? 'text-green-400' : 'text-zinc-500'}>
                                                    {changeFromPrev > 0 ? '↑' : changeFromPrev < 0 ? '↓' : '→'} {Math.abs(changeFromPrev).toFixed(1)}%
                                                  </span>
                                                ) : <span className="text-zinc-600">—</span>}
                                              </td>
                                              <td className="p-2">
                                                <span className={changeFromInit > 0 ? 'text-red-400' : changeFromInit < 0 ? 'text-green-400' : 'text-zinc-500'}>
                                                  {changeFromInit > 0 ? '↑' : changeFromInit < 0 ? '↓' : '→'} {Math.abs(changeFromInit).toFixed(1)}%
                                                </span>
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Material Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-black/20">
              <h3 className="text-xl font-serif text-white uppercase tracking-wider">Add Material</h3>
              <button onClick={() => setShowAddForm(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddMaterial} className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-zinc-400">Material Name</label>
                <input
                  required value={matName} onChange={e => setMatName(e.target.value)}
                  placeholder="e.g. Cement, Steel Rebar, Sand..."
                  className="bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-[#c09b62] outline-none transition-colors placeholder:text-zinc-700"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-widest text-zinc-400">Quantity</label>
                  <input
                    required type="number" step="any" min="0" value={matQty} onChange={e => setMatQty(e.target.value)}
                    placeholder="e.g. 500"
                    className="bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-[#c09b62] outline-none transition-colors placeholder:text-zinc-700"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-widest text-zinc-400">Unit</label>
                  <select
                    value={matUnit} onChange={e => setMatUnit(e.target.value)}
                    className="bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-[#c09b62] outline-none transition-colors appearance-none"
                  >
                    <option value="units">Units</option>
                    <option value="tons">Tons</option>
                    <option value="kg">Kilograms</option>
                    <option value="m³">Cubic Meters (m³)</option>
                    <option value="m²">Square Meters (m²)</option>
                    <option value="liters">Liters</option>
                    <option value="bags">Bags</option>
                    <option value="pieces">Pieces</option>
                    <option value="rolls">Rolls</option>
                    <option value="sheets">Sheets</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-zinc-400">Price Per Unit ({currency})</label>
                <input
                  required type="number" step="any" min="0" value={matPrice} onChange={e => setMatPrice(e.target.value)}
                  placeholder="e.g. 450"
                  className="bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-[#c09b62] outline-none transition-colors placeholder:text-zinc-700"
                />
              </div>
              <div className="mt-2 flex gap-4">
                <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 py-3 border border-zinc-700 rounded-lg text-zinc-300 hover:bg-zinc-800 transition-colors uppercase tracking-wider text-xs">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 bg-[#c09b62] rounded-lg text-black hover:bg-[#dfc499] transition-colors uppercase tracking-wider text-xs font-medium">
                  Add Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assigned Clients Section */}
      <div className="bg-[#050505] border border-zinc-900 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-zinc-900 flex justify-between items-center">
          <h2 className="text-[#c09b62] text-sm uppercase tracking-widest font-sans">Assigned Clients</h2>
        </div>
        <div className="p-6">
          {clients.filter(c => c.assignedProjectIds?.includes(projectId)).length === 0 ? (
            <div className="text-center py-8 text-zinc-600 text-sm">No clients assigned to this project yet.</div>
          ) : (
            <div className="flex flex-col gap-4">
              {clients.filter(c => c.assignedProjectIds?.includes(projectId)).map(client => (
                <div key={client.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-950 border border-zinc-800 p-4 rounded-xl">
                  <div>
                    <h3 className="text-white font-serif">{client.name}</h3>
                    <p className="text-xs text-zinc-500 mt-1">{client.email}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => { setMessagingClient(client); setShowMessageModal(true); }}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-sans uppercase tracking-widest transition-colors flex items-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" /> Message
                    </button>
                    <button
                      onClick={() => handleBan(client.id, client.banned)}
                      className={`px-4 py-2 rounded-lg text-xs font-sans uppercase tracking-widest transition-colors flex items-center gap-2 ${
                        client.banned ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                    >
                      <Ban className="w-4 h-4" /> {client.banned ? "Unblock" : "Block"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Send Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-black/20">
              <h3 className="text-xl font-serif text-white uppercase tracking-wider">Message Client</h3>
              <button onClick={() => { setShowMessageModal(false); setMessageText(""); setMessagingClient(null); }} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSendMessage} className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-zinc-400">Message to {messagingClient?.name}</label>
                <textarea
                  required value={messageText} onChange={e => setMessageText(e.target.value)}
                  placeholder="Type your message here..."
                  rows={4}
                  className="bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-[#c09b62] outline-none transition-colors placeholder:text-zinc-700 resize-none"
                />
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => { setShowMessageModal(false); setMessageText(""); setMessagingClient(null); }} className="flex-1 py-3 border border-zinc-700 rounded-lg text-zinc-300 hover:bg-zinc-800 transition-colors uppercase tracking-wider text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={sendingMsg || !messageText.trim()} className="flex-1 py-3 bg-[#c09b62] rounded-lg text-black hover:bg-[#dfc499] disabled:opacity-50 transition-colors uppercase tracking-wider text-xs font-medium">
                  {sendingMsg ? "Sending..." : "Send Message"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Progress Updates Section */}
      <div className="bg-[#050505] border border-zinc-900 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-zinc-900 flex justify-between items-center">
          <h2 className="text-[#c09b62] text-sm uppercase tracking-widest font-sans">Progress Updates</h2>
          <button
            onClick={() => setShowProgressModal(true)}
            className="bg-[#c09b62] hover:bg-[#dfc499] text-black px-5 py-2 rounded-lg flex items-center gap-2 font-sans text-xs tracking-wider uppercase transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Update
          </button>
        </div>
        <div className="p-6">
          {!project.progressUpdates || project.progressUpdates.length === 0 ? (
            <div className="text-center py-8 text-zinc-600 text-sm">No progress updates yet.</div>
          ) : (
            <div className="flex flex-col gap-6">
              {project.progressUpdates.map((update, idx) => (
                <div key={idx} className="border-l-2 border-[#c09b62]/30 pl-4 py-1">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">
                    {new Date(update.date).toLocaleString()}
                  </div>
                  <p className="text-white text-sm">{update.text}</p>
                  {update.images && update.images.length > 0 && (
                    <div className="flex gap-2 mt-4">
                      {update.images.map((img, i) => (
                        img.match(/\.(mp4|webm|mov)$/i) ? (
                          <video key={i} src={img} controls className="w-24 h-24 object-cover rounded-lg border border-zinc-800" />
                        ) : (
                          <img key={i} src={img} className="w-24 h-24 object-cover rounded-lg border border-zinc-800" alt="Progress" />
                        )
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Update Price Modal – Enhanced */}
      {updatingMaterial && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-black/20">
              <h3 className="text-lg font-serif text-white uppercase tracking-wider">Update Price</h3>
              <button onClick={() => setUpdatingMaterial(null)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdatePrice} className="p-6 flex flex-col gap-5">
              {/* Material Info Card */}
              <div className="bg-black/50 border border-zinc-800 rounded-xl p-4">
                <p className="text-white font-medium mb-2">{updatingMaterial.name}</p>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-zinc-500 block">Initial</span>
                    <span className="text-zinc-300">{updatingMaterial.initialPrice.toLocaleString()} {currency}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Previous</span>
                    <span className="text-zinc-300">{getPreviousPrice(updatingMaterial).toLocaleString()} {currency}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Current</span>
                    <span className="text-white font-medium">{updatingMaterial.currentPrice.toLocaleString()} {currency}</span>
                  </div>
                </div>
              </div>

              {/* Mini Sparkline of last 5 prices */}
              {updatingMaterial.priceHistory && updatingMaterial.priceHistory.length > 0 && (
                <div className="bg-black/30 border border-zinc-800 rounded-xl p-3">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Recent Price Trend</span>
                  <div className="h-[80px] mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={updatingMaterial.priceHistory.slice(-7).map(ph => ({
                        d: new Date(ph.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                        p: ph.price
                      }))}>
                        <Line type="monotone" dataKey="p" stroke="#c09b62" strokeWidth={2} dot={{ fill: '#c09b62', r: 3 }} />
                        <XAxis dataKey="d" stroke="#71717a" tick={{ fontSize: 9 }} />
                        <YAxis stroke="#71717a" tick={{ fontSize: 9 }} domain={['auto', 'auto']} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #27272a', borderRadius: '8px', fontSize: '11px' }}
                          formatter={(value: any, name: any) => [`${Number(value).toLocaleString()} ${currency}`, '']}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-zinc-400">New Price Per Unit ({currency})</label>
                <input
                  required type="number" step="any" min="0" value={newPrice} onChange={e => setNewPrice(e.target.value)}
                  className="bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-[#c09b62] outline-none transition-colors text-lg"
                  autoFocus
                />
              </div>

              {/* Change indicators */}
              {(() => {
                const np = parseFloat(newPrice);
                if (!isNaN(np)) {
                  const prevPrice = getPreviousPrice(updatingMaterial);
                  const diffFromInitial = updatingMaterial.initialPrice > 0 ? ((np - updatingMaterial.initialPrice) / updatingMaterial.initialPrice) * 100 : 0;
                  const diffFromPrev = prevPrice > 0 ? ((np - prevPrice) / prevPrice) * 100 : 0;
                  return (
                    <div className="flex gap-3">
                      <div className={`flex-1 text-xs px-3 py-2 rounded-lg ${diffFromInitial > 0 ? 'bg-red-950/50 text-red-400' : diffFromInitial < 0 ? 'bg-green-950/50 text-green-400' : 'bg-zinc-800 text-zinc-400'}`}>
                        vs Initial: {diffFromInitial > 0 ? '↑' : diffFromInitial < 0 ? '↓' : '→'} {Math.abs(diffFromInitial).toFixed(2)}%
                      </div>
                      <div className={`flex-1 text-xs px-3 py-2 rounded-lg ${diffFromPrev > 0 ? 'bg-red-950/50 text-red-400' : diffFromPrev < 0 ? 'bg-green-950/50 text-green-400' : 'bg-zinc-800 text-zinc-400'}`}>
                        vs Previous: {diffFromPrev > 0 ? '↑' : diffFromPrev < 0 ? '↓' : '→'} {Math.abs(diffFromPrev).toFixed(2)}%
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              <div className="mt-2 flex gap-4">
                <button type="button" onClick={() => setUpdatingMaterial(null)} className="flex-1 py-3 border border-zinc-700 rounded-lg text-zinc-300 hover:bg-zinc-800 transition-colors uppercase tracking-wider text-xs">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 bg-[#c09b62] rounded-lg text-black hover:bg-[#dfc499] transition-colors uppercase tracking-wider text-xs font-medium">
                  Update Price
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Add Progress Update Modal */}
      {showProgressModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-black/20">
              <h3 className="text-xl font-serif text-white uppercase tracking-wider">Add Progress Update</h3>
              <button onClick={() => setShowProgressModal(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddProgress} className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-zinc-400">Update Message</label>
                <textarea
                  required value={progressText} onChange={e => setProgressText(e.target.value)}
                  placeholder="What's the latest status?"
                  className="bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-[#c09b62] outline-none transition-colors placeholder:text-zinc-700 min-h-[100px]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-zinc-400">Update Media</label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 bg-black border border-zinc-800 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                    {progressImage ? (
                      progressImage.match(/\.(mp4|webm|mov)$/i) ? (
                        <video src={progressImage} className="w-full h-full object-cover" autoPlay muted loop />
                      ) : (
                        <img src={progressImage} alt="Preview" className="w-full h-full object-cover" />
                      )
                    ) : (
                      <div className="text-zinc-700 text-xs">None</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="cursor-pointer bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-lg text-xs uppercase tracking-widest hover:bg-zinc-800 transition-colors inline-block w-full text-center">
                      {isUploadingMedia ? 'Uploading...' : 'Upload Media'}
                      <input 
                        type="file" 
                        accept="image/*,video/*" 
                        className="hidden" 
                        onChange={handleMediaUpload}
                        disabled={isUploadingMedia}
                      />
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="mt-2 flex gap-4">
                <button type="button" onClick={() => setShowProgressModal(false)} className="flex-1 py-3 border border-zinc-700 rounded-lg text-zinc-300 hover:bg-zinc-800 transition-colors uppercase tracking-wider text-xs">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 bg-[#c09b62] rounded-lg text-black hover:bg-[#dfc499] transition-colors uppercase tracking-wider text-xs font-medium">
                  Add Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Assign Client Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-black/20">
              <h3 className="text-xl font-serif text-white uppercase tracking-wider">Assign Client</h3>
              <button onClick={() => setShowAssignModal(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAssignClient} className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-zinc-400">Select Client</label>
                <select
                  required
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-[#c09b62] outline-none transition-colors"
                >
                  <option value="">-- Choose a Client --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>
              
              <div className="mt-2 flex gap-4">
                <button type="button" onClick={() => setShowAssignModal(false)} className="flex-1 py-3 border border-zinc-700 rounded-lg text-zinc-300 hover:bg-zinc-800 transition-colors uppercase tracking-wider text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={assigning || !selectedClientId} className="flex-1 py-3 bg-[#c09b62] rounded-lg text-black hover:bg-[#dfc499] transition-colors uppercase tracking-wider text-xs font-medium disabled:opacity-50">
                  {assigning ? "Assigning..." : "Assign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
