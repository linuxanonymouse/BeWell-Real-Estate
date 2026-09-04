"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, Plus, Building2, Clock, CheckCircle, MessageCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

export default function ClientDashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (!token || !userStr) {
      router.push("/auth/login");
      return;
    }

    const userData = JSON.parse(userStr);
    if (userData.role !== "client") {
      router.push("/admin");
      return;
    }

    setUser(userData);

    // Fetch client's dashboard projects
    fetch("/api/projects/dashboard", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        // Filter to only show projects this user owns (or public ones if we want to show portfolio, but usually dashboard is JUST their projects)
        // Since backend currently returns isPublic OR ownerId, let's filter for ownerId to just show THEIR stuff in the dashboard.
        const myProjects = Array.isArray(data) ? data.filter(p => p.ownerId === userData.id) : [];
        setProjects(myProjects);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  if (loading) return <div className="min-h-screen bg-[#050505]" />;

  return (
    <main className="pt-32 pb-24 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-white/10 pb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif tracking-wider uppercase mb-2 text-[#c09b62]">
            Welcome, {user?.name}
          </h1>
          <p className="text-gray-400 font-sans text-sm tracking-widest uppercase">Client Dashboard</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-xs font-sans tracking-widest uppercase border border-white/20 hover:border-red-500 hover:text-red-500 transition-colors rounded"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-serif uppercase tracking-widest">My Projects</h2>
          <div className="flex gap-3">
            <Link 
              href="/client-dashboard/chat"
              className="flex items-center gap-2 px-6 py-3 border border-white/20 text-white hover:border-[#c09b62] hover:text-[#c09b62] transition-colors rounded text-xs font-sans tracking-widest uppercase"
            >
              <MessageCircle className="w-4 h-4" /> Messages
            </Link>
            <Link 
              href="/client-dashboard/request"
              className="flex items-center gap-2 px-6 py-3 bg-[#c09b62] text-black hover:bg-[#dfc499] transition-colors rounded text-xs font-sans tracking-widest uppercase"
            >
              <Plus className="w-4 h-4" /> Request Project
            </Link>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="bg-[#0d0a08] border border-white/5 rounded-xl p-12 text-center flex flex-col items-center">
            <Building2 className="w-16 h-16 text-gray-700 mb-6" />
            <h3 className="text-xl font-serif uppercase text-gray-400 mb-2">No Projects Yet</h3>
            <p className="text-gray-500 font-sans text-sm max-w-md mx-auto leading-relaxed">
              You don't have any active projects right now. Click the button above to submit a new project request to our management team.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <Link href={`/projects/${project.id}`} key={project.id}>
                <div className="bg-[#0d0a08] border border-white/10 hover:border-[#c09b62]/50 rounded-xl overflow-hidden group cursor-pointer transition-colors">
                  <div className="aspect-[4/3] bg-[#111] relative overflow-hidden">
                    <img 
                      src={project.image || `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/project-1.png`}
                      alt={project.name}
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700"
                    />
                    <div className="absolute top-4 right-4 flex gap-2">
                      {project.approvalStatus === 'pending' && (
                        <span className="bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 px-3 py-1 text-[10px] uppercase tracking-widest rounded-full backdrop-blur-md flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                      {project.approvalStatus === 'approved' && (
                        <span className="bg-green-500/20 text-green-500 border border-green-500/50 px-3 py-1 text-[10px] uppercase tracking-widest rounded-full backdrop-blur-md flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Approved
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="text-[#c09b62] text-[10px] font-sans tracking-widest uppercase mb-1">{project.location}</div>
                    <h3 className="text-xl font-serif uppercase tracking-wider mb-2 text-white">{project.name}</h3>
                    <div className="flex justify-between items-center text-sm font-sans text-gray-400 mt-4 pt-4 border-t border-white/5">
                      <span>Value: {project.value}</span>
                      <span className="text-[#c09b62] group-hover:underline">View Updates &rarr;</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
  );
}
