"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, TrendingUp, TrendingDown, DollarSign, Package, X, RefreshCw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
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
}

export default function ProjectResourcesPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  // Add material form
  const [showAddForm, setShowAddForm] = useState(false);
  const [matName, setMatName] = useState("");
  const [matUnit, setMatUnit] = useState("units");
  const [matQty, setMatQty] = useState("");
  const [matPrice, setMatPrice] = useState("");

  // Update price modal
  const [updatingMaterial, setUpdatingMaterial] = useState<Material | null>(null);
  const [newPrice, setNewPrice] = useState("");

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

  // Build chart data from all materials' price histories
  const buildChartData = () => {
    if (materials.length === 0) return [];

    // Collect all unique dates across all materials
    const dateMap = new Map<string, Record<string, number>>();

    materials.forEach((mat) => {
      (mat.priceHistory || []).forEach((ph) => {
        const dateKey = new Date(ph.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
        if (!dateMap.has(dateKey)) {
          dateMap.set(dateKey, {});
        }
        const entry = dateMap.get(dateKey)!;
        // Store per-unit cost; we compute total later
        entry[mat.name] = ph.price;
      });
    });

    // Sort by date
    const sortedDates = [...dateMap.entries()].sort((a, b) => {
      return new Date(a[0]).getTime() - new Date(b[0]).getTime();
    });

    // For each date, compute the total expense using the last known price for each material
    const lastKnownPrices: Record<string, number> = {};
    materials.forEach((m) => {
      lastKnownPrices[m.name] = m.initialPrice;
    });

    return sortedDates.map(([date, prices]) => {
      // Update last known prices
      Object.entries(prices).forEach(([name, price]) => {
        lastKnownPrices[name] = price;
      });

      // Calculate total for this date
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

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Initial Total */}
        <div className="bg-[#050505] border border-zinc-900 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-zinc-400" />
            </div>
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-sans">Initial Expense</span>
          </div>
          <div className="text-2xl font-serif text-white">{formatCurrency(initialTotal)} <span className="text-sm text-zinc-500">ETB</span></div>
        </div>

        {/* Current Total */}
        <div className="bg-[#050505] border border-zinc-900 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-[#c09b62]" />
            </div>
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-sans">Current Expense</span>
          </div>
          <div className="text-2xl font-serif text-white">{formatCurrency(currentTotal)} <span className="text-sm text-zinc-500">ETB</span></div>
        </div>

        {/* Inflation */}
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
      </div>

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="bg-[#050505] border border-zinc-900 rounded-2xl p-6">
          <h2 className="text-[#c09b62] text-sm uppercase tracking-widest font-sans pb-4 border-b border-zinc-900 mb-6">Expense Over Time</h2>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#71717a" tick={{ fontSize: 11 }} />
                <YAxis stroke="#71717a" tick={{ fontSize: 11 }} tickFormatter={(v) => formatCurrency(v)} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #27272a', borderRadius: '12px', fontSize: '12px' }}
                  labelStyle={{ color: '#a1a1aa' }}
                  formatter={(value: number, name: string) => [formatCurrency(value), name]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#a1a1aa' }} />
                <Line type="monotone" dataKey="total" name="Total Expense" stroke="#c09b62" strokeWidth={3} dot={{ fill: '#c09b62', r: 4 }} activeDot={{ r: 6 }} />
                {materials.map((m, i) => (
                  <Line key={m.id} type="monotone" dataKey={m.name} stroke={materialColors[i % materialColors.length]} strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Materials Table */}
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
            <p className="text-xs mt-1 text-zinc-700">Click "Add Material" to start tracking resources and inflation.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-sm whitespace-nowrap">
              <thead className="bg-zinc-950/50 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-xs">
                <tr>
                  <th className="p-4 font-medium">Material</th>
                  <th className="p-4 font-medium">Quantity</th>
                  <th className="p-4 font-medium">Unit</th>
                  <th className="p-4 font-medium">Initial Price</th>
                  <th className="p-4 font-medium">Current Price</th>
                  <th className="p-4 font-medium">Subtotal (Initial)</th>
                  <th className="p-4 font-medium">Subtotal (Current)</th>
                  <th className="p-4 font-medium">Change</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {materials.map((m) => {
                  const subInit = m.quantity * m.initialPrice;
                  const subCurr = m.quantity * m.currentPrice;
                  const change = m.initialPrice > 0 ? ((m.currentPrice - m.initialPrice) / m.initialPrice) * 100 : 0;
                  const mUp = change > 0;
                  const mDown = change < 0;
                  return (
                    <tr key={m.id} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="p-4 text-white font-medium">{m.name}</td>
                      <td className="p-4 text-zinc-300">{m.quantity.toLocaleString()}</td>
                      <td className="p-4 text-zinc-400">{m.unit}</td>
                      <td className="p-4 text-zinc-400">{m.initialPrice.toLocaleString()} ETB</td>
                      <td className="p-4 text-white">{m.currentPrice.toLocaleString()} ETB</td>
                      <td className="p-4 text-zinc-400">{formatCurrency(subInit)} ETB</td>
                      <td className="p-4 text-white">{formatCurrency(subCurr)} ETB</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs tracking-wider ${
                          mUp ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          mDown ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                          'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                        }`}>
                          {mUp ? '+' : ''}{change.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-4 flex justify-end gap-3">
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
                <label className="text-xs uppercase tracking-widest text-zinc-400">Price Per Unit (ETB)</label>
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

      {/* Progress Updates Section */}
      <div className="bg-[#050505] border border-zinc-900 rounded-2xl overflow-hidden mt-8">
        <div className="p-6 border-b border-zinc-900 flex justify-between items-center">
          <h2 className="text-[#c09b62] text-sm uppercase tracking-widest font-sans">Progress Updates</h2>
          <button
            onClick={() => {
              const text = prompt("Enter progress update text:");
              if (text) {
                // Simplified for now, just text
                fetch(`/api/projects/${project.id}/progress`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json", ...getAuthHeader() },
                  body: JSON.stringify({ text, images: [] }),
                }).then(() => fetchProject());
              }
            }}
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
              {project.progressUpdates.map((update: any, idx: number) => (
                <div key={idx} className="border-l-2 border-[#c09b62]/30 pl-4 py-1">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">
                    {new Date(update.date).toLocaleString()}
                  </div>
                  <p className="text-white text-sm">{update.text}</p>
                  {update.images && update.images.length > 0 && (
                    <div className="flex gap-2 mt-4">
                      {update.images.map((img: string, i: number) => (
                        <img key={i} src={img} className="w-24 h-24 object-cover rounded-lg border border-zinc-800" alt="Progress" />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Update Price Modal */}
      {updatingMaterial && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-black/20">
              <h3 className="text-lg font-serif text-white uppercase tracking-wider">Update Price</h3>
              <button onClick={() => setUpdatingMaterial(null)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdatePrice} className="p-6 flex flex-col gap-5">
              <div className="bg-black/50 border border-zinc-800 rounded-xl p-4">
                <p className="text-white font-medium mb-1">{updatingMaterial.name}</p>
                <p className="text-zinc-500 text-xs">
                  Current: <span className="text-zinc-300">{updatingMaterial.currentPrice.toLocaleString()} ETB</span> per {updatingMaterial.unit}
                  &nbsp;•&nbsp; Initial: <span className="text-zinc-400">{updatingMaterial.initialPrice.toLocaleString()} ETB</span>
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-zinc-400">New Price Per Unit (ETB)</label>
                <input
                  required type="number" step="any" min="0" value={newPrice} onChange={e => setNewPrice(e.target.value)}
                  className="bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-[#c09b62] outline-none transition-colors text-lg"
                  autoFocus
                />
              </div>
              {(() => {
                const np = parseFloat(newPrice);
                if (!isNaN(np) && updatingMaterial.initialPrice > 0) {
                  const diff = ((np - updatingMaterial.initialPrice) / updatingMaterial.initialPrice) * 100;
                  return (
                    <div className={`text-sm px-3 py-2 rounded-lg ${diff > 0 ? 'bg-red-950/50 text-red-400' : diff < 0 ? 'bg-green-950/50 text-green-400' : 'bg-zinc-800 text-zinc-400'}`}>
                      {diff > 0 ? '↑' : diff < 0 ? '↓' : '→'} {Math.abs(diff).toFixed(2)}% {diff > 0 ? 'increase' : diff < 0 ? 'decrease' : 'no change'} from initial price
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
    </div>
  );
}
