"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

const sectionNames: Record<string, string> = {
  "01": "Home",
  "04": "Visionaries",
  "05": "Trusted By",
  "06": "Projects",
};

const standaloneLinks: { href: string; label: string }[] = [
  { href: "/client-portal", label: "Client Portal" },
];

interface NavbarProps {
  onScheduleClick: () => void;
}

export default function Navbar({ onScheduleClick }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("01");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
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
          {Object.entries(sectionNames).map(([id, name]) => (
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
          {standaloneLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative py-1 transition-colors duration-300 ${
                pathname === link.href
                  ? 'text-[#c09b62]'
                  : 'text-white/80 hover:text-[#c09b62]'
              }`}
            >
              {link.label}
              {pathname === link.href && (
                <motion.div layoutId="navUnderline" className="absolute -bottom-1 left-0 right-0 h-[1px] bg-[#c09b62]" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 drop-shadow-md">
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
              {Object.entries(sectionNames).map(([id, name]) => (
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
              {standaloneLinks.map((link) => (
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
              <button onClick={() => { setMobileMenuOpen(false); onScheduleClick(); }} className="mt-4 px-6 py-3 border border-[#c09b62] text-[#c09b62] text-[9px] tracking-[0.25em] uppercase hover:bg-[#c09b62] hover:text-black transition-all duration-500 font-sans">
                Schedule a Consultation
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
