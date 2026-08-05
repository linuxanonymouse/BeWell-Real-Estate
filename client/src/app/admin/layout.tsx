"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Building2, LayoutDashboard, Users, MessageSquare, Send, LogOut } from "lucide-react";

export function getAuthHeader(): Record<string, string> {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("admin_token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) {
          localStorage.removeItem("admin_token");
          window.location.href = "/admin/login";
          return {};
        }
        return { "Authorization": `Bearer ${token}` };
      } catch (e) {
        localStorage.removeItem("admin_token");
        return {};
      }
    }
  }
  return {};
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (pathname === "/admin/login") return;
    
    const token = localStorage.getItem("admin_token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) {
          localStorage.removeItem("admin_token");
          window.location.href = "/admin/login";
          return;
        }
        setIsAuthenticated(true);
      } catch (e) {
        localStorage.removeItem("admin_token");
        window.location.href = "/admin/login";
      }
    } else {
      router.push("/admin/login");
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    router.push("/admin/login");
  };

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null; // Return empty until we redirect
  }

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Projects", href: "/admin/projects", icon: Building2 },
    { name: "Team Members", href: "/admin/team", icon: Users },
    { name: "Inquiries & Leads", href: "/admin/leads", icon: MessageSquare },
    { name: "Site Content", href: "/admin/content", icon: LayoutDashboard },
    { name: "Telegram Settings", href: "/admin/telegram", icon: Send },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 flex flex-col md:flex-row font-sans">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-[#050505] border-b border-zinc-900 p-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/">
          <h1 className="text-lg font-serif tracking-widest uppercase text-white">
            B WELL <span className="text-[#c09b62] italic text-xs">Admin</span>
          </h1>
        </Link>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-zinc-400 hover:text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex w-full md:w-64 bg-[#050505] border-b md:border-b-0 md:border-r border-zinc-900 p-6 flex-col md:h-screen sticky top-[69px] md:top-0 z-40 max-h-[calc(100vh-69px)] md:max-h-screen overflow-y-auto`}>
        <div className="hidden md:block mb-12">
          <Link href="/">
            <h1 className="text-xl font-serif tracking-widest uppercase text-white hover:text-[#c09b62] transition-colors">
              BWell <span className="text-[#c09b62] italic block text-sm mt-1">Admin Portal</span>
            </h1>
          </Link>
        </div>
        
        <nav className="flex flex-col gap-2 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 text-sm tracking-wide ${
                  isActive 
                    ? "bg-[#c09b62]/10 text-[#c09b62] border border-[#c09b62]/20" 
                    : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="mt-8 md:mt-auto pt-6 border-t border-zinc-900">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg w-full transition-colors">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 md:overflow-y-auto md:h-screen" data-lenis-prevent="true">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
