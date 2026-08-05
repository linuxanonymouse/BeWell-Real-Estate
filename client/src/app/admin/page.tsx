"use client";

import { useEffect, useState } from "react";
import { Building2, Users, MessageSquare, TrendingUp } from "lucide-react";
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from "recharts";

const COLORS = ['#c09b62', '#222222', '#555555', '#888888'];

const leadData = [
  { name: 'Jan', new: 40, converted: 24 },
  { name: 'Feb', new: 30, converted: 13 },
  { name: 'Mar', new: 20, converted: 58 },
  { name: 'Apr', new: 27, converted: 39 },
  { name: 'May', new: 18, converted: 48 },
  { name: 'Jun', new: 23, converted: 38 },
  { name: 'Jul', new: 34, converted: 43 },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    projects: 0,
    team: 0,
    leads: 0
  });

  const [projectStats, setProjectStats] = useState([
    { name: 'Completed', value: 0 },
    { name: 'Under Construction', value: 0 },
    { name: 'Planning', value: 0 },
  ]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [projectsRes, teamRes, leadsRes] = await Promise.all([
          fetch(process.env.NEXT_PUBLIC_API_URL + '/projects').then(r => r.json()),
          fetch(process.env.NEXT_PUBLIC_API_URL + '/team').then(r => r.json()),
          fetch(process.env.NEXT_PUBLIC_API_URL + '/leads').then(r => r.json()),
        ]);
        
        setStats({
          projects: projectsRes.length || 0,
          team: teamRes.length || 0,
          leads: leadsRes.length || 0,
        });

        // Compute project statuses
        const statusCount = projectsRes.reduce((acc: any, p: any) => {
          acc[p.status] = (acc[p.status] || 0) + 1;
          return acc;
        }, {});

        setProjectStats(Object.entries(statusCount).map(([name, value]) => ({ name, value: value as number })));

      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      }
    }
    fetchStats();
  }, []);

  const kpis = [
    { title: "Total Properties", value: stats.projects, icon: Building2 },
    { title: "Active Inquiries", value: stats.leads, icon: MessageSquare },
    { title: "Team Members", value: stats.team, icon: Users },
    { title: "Conversion Rate", value: "18%", icon: TrendingUp },
  ];

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div>
        <h2 className="text-3xl font-serif text-white tracking-wider uppercase">Overview</h2>
        <p className="text-zinc-500 font-sans mt-2">Welcome back to the Be Well Admin Portal.</p>
      </div>
      
      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-zinc-400 text-xs font-sans uppercase tracking-widest">{kpi.title}</h3>
              <div className="w-8 h-8 rounded-full bg-[#c09b62]/10 flex items-center justify-center text-[#c09b62]">
                <kpi.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-4xl font-serif text-white group-hover:text-[#c09b62] transition-colors">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl lg:col-span-2">
          <h3 className="text-white font-sans text-sm tracking-widest uppercase mb-6">Inquiry Volume</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#666" tick={{ fill: '#888', fontSize: 12 }} />
                <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff' }}
                  itemStyle={{ color: '#c09b62' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="new" name="New Inquiries" fill="#c09b62" radius={[4, 4, 0, 0]} />
                <Bar dataKey="converted" name="Converted" fill="#444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
          <h3 className="text-white font-sans text-sm tracking-widest uppercase mb-6">Project Status</h3>
          <div className="h-[300px] w-full flex items-center justify-center">
            {projectStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {projectStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff', borderRadius: '8px' }}
                    itemStyle={{ color: '#c09b62' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-zinc-500 text-sm">No project data available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-white font-sans text-sm tracking-widest uppercase mb-6">Recent Activity</h3>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="divide-y divide-zinc-800">
            <div className="p-4 md:p-6 flex items-center justify-between hover:bg-zinc-800/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-[#c09b62]" />
                <div>
                  <p className="text-sm text-zinc-300">New inquiry received from <span className="text-white">John Smith</span></p>
                  <p className="text-xs text-zinc-500 mt-1">2 hours ago</p>
                </div>
              </div>
              <button className="text-xs text-[#c09b62] hover:underline uppercase tracking-widest">View</button>
            </div>
            <div className="p-4 md:p-6 flex items-center justify-between hover:bg-zinc-800/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-zinc-600" />
                <div>
                  <p className="text-sm text-zinc-300">Property <span className="text-white">Rosewood Heights</span> updated</p>
                  <p className="text-xs text-zinc-500 mt-1">5 hours ago</p>
                </div>
              </div>
              <button className="text-xs text-[#c09b62] hover:underline uppercase tracking-widest">View</button>
            </div>
            <div className="p-4 md:p-6 flex items-center justify-between hover:bg-zinc-800/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-zinc-600" />
                <div>
                  <p className="text-sm text-zinc-300">New team member <span className="text-white">David Allen</span> added</p>
                  <p className="text-xs text-zinc-500 mt-1">1 day ago</p>
                </div>
              </div>
              <button className="text-xs text-[#c09b62] hover:underline uppercase tracking-widest">View</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
