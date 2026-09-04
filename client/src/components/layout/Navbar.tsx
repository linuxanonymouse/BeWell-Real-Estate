"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

const sectionNames: Record<string, string> = {
  "01": "Home",
  "04": "Visionaries",
  "06": "Projects",
};

const standaloneLinks = [
  { name: 'About', href: '/about', label: 'About' },
  { name: 'Portfolio', href: '/projects', label: 'Portfolio' }
];

interface NavbarProps {
  onScheduleClick?: () => void;
}

export default function Navbar({ onScheduleClick }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("01");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const pathname = usePathname();
  const router = useRouter();
  const { unreadCount } = useNotifications();

  useEffect(() => {
    const token = !!localStorage.getItem("token");
    setIsLoggedIn(token);
    if (token) {
      try {
        const u = JSON.parse(localStorage.getItem("user") || "{}");
        setUserRole(u.role || "");
      } catch { setUserRole(""); }
    }
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    if (pathname === "/") {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      }, { rootMargin: "-40% 0px -40% 0px" }); 
      
      const timeoutId = setTimeout(() => {
        document.querySelectorAll('section[id]').forEach(section => {
          observer.observe(section);
        });
      }, 200);
      
      return () => {
        window.removeEventListener("scroll", handleScroll);
        clearTimeout(timeoutId);
        observer.disconnect();
      };
    } else {
      setActiveSection("");
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [pathname]);

  const handleNavClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (pathname !== "/") {
      router.push(`/#${id}`);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className={`fixed top-0 left-0 w-full z-[100] px-6 md:px-8 py-4 flex items-center justify-between transition-all duration-700 ${
          mobileMenuOpen
            ? 'bg-transparent border-b-transparent'
            : scrolled || pathname !== "/"
              ? 'bg-[#0d0a08]/95 backdrop-blur-lg border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.5)]' 
              : 'bg-gradient-to-b from-black/60 to-transparent border-b border-white/5'
        }`}
      >
        <div 
          onClick={() => router.push("/")}
          className="cursor-pointer flex items-center gap-1 font-serif tracking-[0.15em] text-base md:text-lg font-light drop-shadow-md text-white"
        >
          B WELL
          <span className="text-[#c09b62] italic text-xs md:text-sm mt-1 ml-1 drop-shadow-md">REAL ESTATE</span>
        </div>
        
        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8 xl:gap-10 text-[9px] tracking-[0.25em] uppercase font-sans drop-shadow-md text-white">
          {!isLoggedIn && Object.entries(sectionNames).map(([id, name]) => (
            <a 
              key={id}
              href={`#${id}`}
              onClick={(e) => handleNavClick(e, id)}
              className={`relative py-1 transition-colors duration-300 ${
                activeSection === id 
                  ? 'text-[#c09b62]' 
                  : 'text-white/80 hover:text-[#c09b62]'
              }`}
            >
              {name}
              {activeSection === id && pathname === "/" && (
                <motion.div layoutId="navUnderline" className="absolute -bottom-1 left-0 right-0 h-[1px] bg-[#c09b62]" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
              )}
            </a>
          ))}
          {!isLoggedIn && standaloneLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative py-1 transition-colors duration-300 ${
                pathname === link.href ? 'text-[#c09b62]' : 'text-white/80 hover:text-[#c09b62]'
              }`}
            >
              {link.label}
              {pathname === link.href && (
                <motion.div layoutId="navUnderline" className="absolute -bottom-1 left-0 right-0 h-[1px] bg-[#c09b62]" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
              )}
            </Link>
          ))}
          {isLoggedIn ? (
            <>
              {userRole === 'superadmin' || userRole === 'support' ? (
                <Link href="/admin" className="relative py-1 transition-colors duration-300 text-white/80 hover:text-[#c09b62]">
                  Admin Panel
                </Link>
              ) : (
                <>
                  <Link href="/client-dashboard" className={`relative py-1 transition-colors duration-300 ${pathname?.startsWith('/client-dashboard') && !pathname?.includes('chat') && !pathname?.includes('settings') ? 'text-[#c09b62]' : 'text-white/80 hover:text-[#c09b62]'}`}>
                    Dashboard
                  </Link>
                  <Link href="/client-dashboard/chat" className={`relative py-1 transition-colors duration-300 ${pathname?.includes('/chat') ? 'text-[#c09b62]' : 'text-white/80 hover:text-[#c09b62]'}`}>
                    Messages
                  </Link>
                  <Link href="/client-dashboard/settings" className={`relative py-1 transition-colors duration-300 ${pathname?.includes('/settings') ? 'text-[#c09b62]' : 'text-white/80 hover:text-[#c09b62]'}`}>
                    Settings
                  </Link>
                </>
              )}
              <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('admin_token'); localStorage.removeItem('user'); setIsLoggedIn(false); setUserRole(''); router.push('/'); }} className="relative py-1 transition-colors duration-300 text-white/80 hover:text-red-400">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="relative py-1 transition-colors duration-300 text-white/80 hover:text-[#c09b62]">
                Sign In
              </Link>
              <Link href="/auth/register" className="relative py-1 transition-colors duration-300 text-[#c09b62]">
                Sign Up
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3 drop-shadow-md">
          {isLoggedIn && (
            <Link href={userRole === 'client' ? '/client-dashboard/chat' : '/admin/tickets'} className="relative p-2 text-white/80 hover:text-[#c09b62] transition-colors">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#c09b62] rounded-full ring-2 ring-black" />
              )}
            </Link>
          )}
          <button onClick={onScheduleClick} className="hidden md:block px-5 py-2 border border-[#c09b62]/40 text-[#c09b62] text-[8px] tracking-[0.25em] uppercase hover:bg-[#c09b62] hover:text-black transition-all duration-500 font-sans">
            Schedule a Consultation
          </button>
          {/* Mobile Hamburger */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-10 h-10 border border-white/20 rounded-full flex items-center justify-center bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)] text-white"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="transition-transform duration-300">
              {mobileMenuOpen 
                ? <path d="M18 6L6 18M6 6l12 12" className="origin-center" /> 
                : <path d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 w-full h-auto pt-[80px] pb-10 bg-black/50 backdrop-blur-2xl z-[99] border-b border-white/10 lg:hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-b-[2rem]"
          >
            <nav className="flex flex-col items-center gap-6">
              {!isLoggedIn && Object.entries(sectionNames).map(([id, name]) => (
                <a 
                  key={id}
                  href={`#${id}`}
                  onClick={(e) => handleNavClick(e, id)}
                  className={`text-sm tracking-[0.3em] uppercase font-sans transition-colors ${
                    activeSection === id && pathname === "/" ? 'text-[#c09b62]' : 'text-white/60 hover:text-white'
                  }`}
                >
                  {name}
                </a>
              ))}
              {!isLoggedIn && standaloneLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm tracking-[0.3em] uppercase font-sans transition-colors ${
                    pathname === link.href ? 'text-[#c09b62]' : 'text-white/60 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {isLoggedIn ? (
                <>
                  {userRole === 'superadmin' || userRole === 'support' ? (
                    <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="text-sm tracking-[0.3em] uppercase font-sans transition-colors text-white/60 hover:text-white">
                      Admin Panel
                    </Link>
                  ) : (
                    <>
                      <Link href="/client-dashboard" onClick={() => setMobileMenuOpen(false)} className="text-sm tracking-[0.3em] uppercase font-sans transition-colors text-white/60 hover:text-white">
                        Dashboard
                      </Link>
                      <Link href="/client-dashboard/chat" onClick={() => setMobileMenuOpen(false)} className="text-sm tracking-[0.3em] uppercase font-sans transition-colors text-white/60 hover:text-white">
                        Messages
                      </Link>
                      <Link href="/client-dashboard/settings" onClick={() => setMobileMenuOpen(false)} className="text-sm tracking-[0.3em] uppercase font-sans transition-colors text-white/60 hover:text-white">
                        Settings
                      </Link>
                    </>
                  )}
                  <button onClick={() => { setMobileMenuOpen(false); localStorage.removeItem('token'); localStorage.removeItem('admin_token'); localStorage.removeItem('user'); setIsLoggedIn(false); setUserRole(''); router.push('/'); }} className="text-sm tracking-[0.3em] uppercase font-sans transition-colors text-red-400 hover:text-red-300">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)} className="text-sm tracking-[0.3em] uppercase font-sans transition-colors text-white/60 hover:text-white">
                    Sign In
                  </Link>
                  <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)} className="text-sm tracking-[0.3em] uppercase font-sans transition-colors text-[#c09b62] hover:text-white">
                    Sign Up
                  </Link>
                </>
              )}
              <button onClick={() => { setMobileMenuOpen(false); onScheduleClick?.(); }} className="mt-4 px-6 py-3 border border-[#c09b62] text-[#c09b62] text-[9px] tracking-[0.25em] uppercase hover:bg-[#c09b62] hover:text-black transition-all duration-500 font-sans">
                Schedule a Consultation
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
