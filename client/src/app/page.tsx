"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";

// Animation Variants
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 1 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  }
};

const sectionNames: Record<string, string> = {
  "01": "Home",
  "02": "Interiors",
  "03": "Amenities",
  "04": "Team",
  "05": "Clients",
  "06": "Projects",
};

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState("01");
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Scroll listener for navbar background
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Intersection Observer for section tracking
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, { 
      rootMargin: "-40% 0px -40% 0px" 
    }); 
    
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
  }, [mounted]);

  if (!mounted) return null;

  return (
    <main className="relative w-full min-h-screen overflow-x-hidden bg-[#0d0a08] text-white selection:bg-[#c09b62]/30 selection:text-white">
      
      {/* ----------------- FIXED SIDE PAGINATION (Desktop) ----------------- */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }} 
        animate={{ opacity: 1, x: 0 }} 
        transition={{ delay: 1.5, duration: 1 }}
        className="fixed right-8 xl:right-12 top-1/2 -translate-y-1/2 flex-col items-center gap-5 text-[9px] font-sans tracking-widest z-50 drop-shadow-md hidden xl:flex"
      >
        {['01', '02', '03', '04', '05', '06'].map((num, i) => (
          <div key={num} className="flex flex-col items-center gap-5">
            <a 
              href={`#${num}`} 
              onClick={(e) => { e.preventDefault(); document.getElementById(num)?.scrollIntoView({ behavior: 'smooth' }); }}
              className={`cursor-pointer transition-all duration-500 relative ${activeSection === num ? 'text-white scale-[1.4] font-bold' : 'text-gray-600 hover:text-[#c09b62]'}`}
            >
              {num}
              {activeSection === num && (
                <motion.div layoutId="activeDot" className="absolute -left-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#c09b62]" />
              )}
            </a>
            {i === 0 && <div className={`w-[1px] h-10 transition-colors duration-500 ${activeSection === '01' ? 'bg-[#c09b62]' : 'bg-white/20'}`}></div>}
          </div>
        ))}
      </motion.div>

      {/* ----------------- FIXED HEADER / NAVBAR ----------------- */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className={`fixed top-0 left-0 w-full z-[100] px-6 md:px-8 py-4 flex items-center justify-between transition-all duration-700 ${
          mobileMenuOpen
            ? 'bg-transparent border-b-transparent'
            : scrolled 
              ? 'bg-[#0d0a08]/95 backdrop-blur-lg border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.5)]' 
              : 'bg-gradient-to-b from-black/60 to-transparent border-b border-white/5'
        }`}
      >
        <div className="flex items-center gap-1 font-serif tracking-[0.15em] text-base md:text-lg font-light drop-shadow-md">
          B WELL
          <span className="text-[#c09b62] italic text-xs md:text-sm mt-1 ml-1 drop-shadow-md">REAL ESTATE</span>
        </div>
        
        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8 xl:gap-10 text-[9px] tracking-[0.25em] uppercase font-sans drop-shadow-md">
          {Object.entries(sectionNames).map(([id, name]) => (
            <a 
              key={id}
              href={`#${id}`}
              onClick={(e) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); }}
              className={`relative py-1 transition-colors duration-300 ${
                activeSection === id 
                  ? 'text-[#c09b62]' 
                  : 'text-white/80 hover:text-[#c09b62]'
              }`}
            >
              {name}
              {activeSection === id && (
                <motion.div layoutId="navUnderline" className="absolute -bottom-1 left-0 right-0 h-[1px] bg-[#c09b62]" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
              )}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3 drop-shadow-md">
          <button className="hidden md:block px-5 py-2 border border-[#c09b62]/40 text-[#c09b62] text-[8px] tracking-[0.25em] uppercase hover:bg-[#c09b62] hover:text-black transition-all duration-500 font-sans">
            Schedule a Consultation
          </button>
          {/* Mobile Hamburger */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-10 h-10 border border-white/20 rounded-full flex items-center justify-center bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)]"
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
                  onClick={(e) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false); }}
                  className={`text-sm tracking-[0.3em] uppercase font-sans transition-colors ${
                    activeSection === id ? 'text-[#c09b62]' : 'text-white/60 hover:text-white'
                  }`}
                >
                  {name}
                </a>
              ))}
              <button className="mt-4 px-6 py-3 border border-[#c09b62] text-[#c09b62] text-[9px] tracking-[0.25em] uppercase hover:bg-[#c09b62] hover:text-black transition-all duration-500 font-sans">
                Schedule a Consultation
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ----------------- SECTION 1: HERO ----------------- */}
      <section id="01" className="relative w-full h-auto pt-32 pb-16 lg:py-0 lg:h-screen flex flex-col justify-end lg:justify-center px-6 md:px-12 lg:px-24">
        <motion.div 
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2, }}
          className="absolute inset-0 w-full h-full z-0"
        >
          <video 
            src="/Hero.mp4" 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover opacity-90" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d0a08]/80 via-[#0d0a08]/20 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0d0a08] pointer-events-none" />
        </motion.div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-4xl mt-12 md:mt-0 pt-0 md:pt-20"
        >
          <motion.h1 variants={fadeUp} className="text-[2.5rem] sm:text-[4rem] md:text-[5.5rem] leading-[1.1] font-serif font-light tracking-wide text-white uppercase flex flex-col drop-shadow-lg">
            <span>Building</span>
            <span>Beyond</span>
            <span className="text-[#c09b62] italic -mt-1 md:-mt-2">Imagination</span>
          </motion.h1>
          
          <motion.p variants={fadeUp} className="text-[#f5eedf] text-xs sm:text-sm font-sans font-light max-w-[280px] sm:max-w-sm leading-relaxed sm:leading-loose tracking-[0.1em] mt-4 md:mt-8 drop-shadow-md">
            We don't just build buildings, we build legacies.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-16 md:mt-16 flex flex-wrap gap-4">
            <a href="#06" onClick={(e) => { e.preventDefault(); document.getElementById('06')?.scrollIntoView({ behavior: 'smooth' }); }} className="px-6 md:px-8 py-3 md:py-4 bg-[#c09b62] text-black text-[8px] sm:text-[10px] tracking-[0.25em] uppercase hover:bg-[#d4b075] hover:shadow-[0_0_25px_rgba(192,155,98,0.6)] transition-all duration-500 font-sans font-medium shadow-[0_0_15px_rgba(192,155,98,0.3)] text-center">
              Explore Portfolio
            </a>
            <a href="#04" onClick={(e) => { e.preventDefault(); document.getElementById('04')?.scrollIntoView({ behavior: 'smooth' }); }} className="px-6 md:px-8 py-3 md:py-4 border border-white/30 text-white text-[8px] sm:text-[10px] tracking-[0.25em] uppercase hover:bg-white/10 hover:border-white transition-all duration-500 font-sans backdrop-blur-sm bg-black/20 text-center">
              Our Vision
            </a>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 1 }}
          className="absolute left-6 md:left-12 top-1/2 -translate-y-1/2 -rotate-90 origin-left text-[8px] tracking-[0.4em] uppercase text-gray-300 hidden xl:block font-sans z-10 drop-shadow-md"
        >
          Scroll to explore
        </motion.div>
      </section>

      {/* Cinematic Section Divider */}
      <div className="w-full h-24 bg-gradient-to-b from-[#0d0a08] via-[#0d0a08]/80 to-transparent relative">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] h-12 bg-gradient-to-b from-[#c09b62]/60 to-transparent" />
      </div>

      {/* ----------------- SECTION 2: INTERIORS ----------------- */}
      <section id="02" className="relative w-full min-h-[80vh] md:min-h-screen flex items-center py-16 md:py-24 bg-[#0d0a08]">
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
          <motion.img 
            initial={{ scale: 1.15, opacity: 0.5 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.8, }}
            src="/interior.png" 
            alt="Luxury Interiors" 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d0a08]/90 via-[#0d0a08]/40 to-transparent w-[70%] md:w-[60%] pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d0a08]/50 via-transparent to-[#0d0a08]/50 pointer-events-none" />
        </div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="relative z-10 px-6 md:px-12 lg:px-24 max-w-2xl"
        >
          <motion.h2 variants={fadeUp} className="text-[2rem] sm:text-[2.5rem] md:text-[3.5rem] leading-[1.1] font-serif font-light tracking-wide text-white uppercase flex flex-col drop-shadow-md">
            <span>Crafted</span>
            <span>For The</span>
            <span className="text-[#c09b62] italic">Extraordinary</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-[#f5eedf] text-xs font-sans font-light max-w-sm leading-loose tracking-[0.1em] mt-6 mb-8 md:mb-10 drop-shadow-md">
            Every detail is a testament to perfection and timeless design. Step into interiors that flow seamlessly, offering panoramic views and uncompromised privacy in a warm, welcoming environment.
          </motion.p>
          <motion.button variants={fadeUp} className="px-6 py-3 border border-[#c09b62] text-[8px] tracking-[0.25em] uppercase text-[#c09b62] hover:bg-[#c09b62] hover:text-black transition-all duration-300 font-sans shadow-[0_0_15px_rgba(192,155,98,0.3)] bg-black/30 backdrop-blur-sm">
            Explore Interiors
          </motion.button>
        </motion.div>
      </section>

      {/* Cinematic Divider */}
      <div className="w-full h-16 md:h-24 bg-[#0d0a08] relative flex items-center justify-center">
        <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#c09b62]/40 to-transparent" />
      </div>

      {/* ----------------- SECTION 3: AMENITIES ----------------- */}
      <section id="03" className="relative w-full min-h-[80vh] md:min-h-screen flex items-center py-16 md:py-24 bg-[#0d0a08]">
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
          <motion.img 
            initial={{ scale: 1.15, opacity: 0.5 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.8, }}
            src="/amenities.png" 
            alt="Luxury Amenities" 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d0a08]/90 via-[#0d0a08]/40 to-transparent w-[70%] md:w-[60%] pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d0a08]/50 via-transparent to-[#0d0a08]/50 pointer-events-none" />
        </div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="relative z-10 px-6 md:px-12 lg:px-24 max-w-2xl"
        >
          <motion.h2 variants={fadeUp} className="text-[2rem] sm:text-[2.5rem] md:text-[3.5rem] leading-[1.1] font-serif font-light tracking-wide text-white uppercase flex flex-col drop-shadow-md">
            <span>A Lifestyle</span>
            <span>Beyond</span>
            <span className="text-[#c09b62] italic">Luxury</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-[#f5eedf] text-xs font-sans font-light max-w-sm leading-loose tracking-[0.1em] mt-6 mb-8 md:mb-10 drop-shadow-md">
            World-class amenities for a life well lived. From infinity pools catching the sunset to private spas.
          </motion.p>
          <motion.button variants={fadeUp} className="px-6 py-3 border border-[#c09b62] text-[8px] tracking-[0.25em] uppercase text-[#c09b62] hover:bg-[#c09b62] hover:text-black transition-all duration-300 font-sans shadow-[0_0_15px_rgba(192,155,98,0.3)] bg-black/30 backdrop-blur-sm">
            Explore Amenities
          </motion.button>
        </motion.div>
      </section>

      {/* Cinematic Divider */}
      <div className="w-full h-16 md:h-24 bg-gradient-to-b from-[#0d0a08] to-[#14100c] relative flex items-center justify-center">
        <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#c09b62]/40 to-transparent" />
      </div>

      {/* ----------------- SECTION 4: VISIONARIES ----------------- */}
      <section id="04" className="relative w-full min-h-screen py-20 md:py-32 px-6 md:px-12 lg:px-24 flex flex-col justify-center bg-gradient-to-b from-[#14100c] to-[#0d0a08]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-end mb-12 md:mb-20">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="lg:col-span-4"
          >
            <motion.h2 variants={fadeUp} className="text-[2rem] sm:text-[2.5rem] md:text-[3rem] leading-[1.1] font-serif font-light tracking-wide text-white uppercase flex flex-col">
              <span>Visionaries</span>
              <span>Behind The</span>
              <span className="text-[#c09b62] italic">Legacy</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#f5eedf] text-xs font-sans font-light leading-loose tracking-[0.1em] mt-6">
              A team of leaders, architects, and innovators driven by passion and commitment to excellence.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-4">
              <button className="px-6 py-3 border border-white/20 text-[8px] tracking-[0.25em] uppercase hover:bg-white/10 transition-colors font-sans">
                Meet The Team
              </button>
              <div className="flex gap-2">
                <button className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 hover:border-white transition-all">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                <button className="w-10 h-10 rounded-full border border-[#c09b62]/50 flex items-center justify-center text-[#c09b62] hover:bg-[#c09b62] hover:text-black transition-all">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              </div>
            </motion.div>
          </motion.div>
          
          <div className="lg:col-span-8 flex gap-4 overflow-x-auto pb-8 snap-x pr-6 md:pr-[10vw]">
            {[
              { name: "Haris Lemene", role: "Chief Executive Officer" },
              { name: "Maryam Rose", role: "Managing Director" },
              { name: "Fahad Khan", role: "Head of Construction" },
              { name: "David Allen", role: "Head of Architecture" }
            ].map((leader, i) => (
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15, duration: 0.8, }}
                viewport={{ once: true }}
                key={leader.name} 
                className="min-w-[200px] sm:min-w-[240px] flex-shrink-0 group cursor-pointer snap-start"
              >
                <div className="aspect-[3/4] bg-[#1a1510] border border-white/5 group-hover:border-[#c09b62] transition-all duration-700 mb-6 relative overflow-hidden flex items-center justify-center group-hover:shadow-[0_0_40px_rgba(192,155,98,0.2)]">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#0d0a08] to-[#1a1510] group-hover:from-[#14100c] group-hover:to-[#1f1a12] transition-all duration-700" />
                  <div className="relative z-10 font-serif text-[#c09b62]/10 text-6xl group-hover:text-[#c09b62]/30 group-hover:scale-110 transition-all duration-700">0{i+1}</div>
                </div>
                <h4 className="font-serif tracking-widest uppercase text-sm sm:text-base text-white group-hover:text-[#c09b62] transition-colors duration-500">{leader.name}</h4>
                <p className="text-gray-400 text-[9px] font-sans tracking-[0.2em] mt-1">{leader.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cinematic Divider */}
      <div className="w-full h-16 md:h-24 bg-[#0d0a08] relative flex items-center justify-center">
        <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#c09b62]/40 to-transparent" />
      </div>

      {/* ----------------- SECTION 5: TRUSTED BY ----------------- */}
      <section id="05" className="relative w-full py-20 md:py-32 px-6 md:px-12 lg:px-24 bg-[#14100c] border-y border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 md:gap-16 items-center">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2 variants={fadeUp} className="text-[1.8rem] sm:text-[2rem] md:text-[2.5rem] leading-[1.1] font-serif font-light tracking-wide text-white uppercase flex flex-col">
              <span>Trusted By</span>
              <span>Those Who</span>
              <span className="text-[#c09b62] italic">Know Excellence</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#f5eedf] text-xs font-sans font-light leading-loose tracking-[0.1em] mt-6">
              Our commitment to quality and timely delivery has earned us the trust of industry leaders.
            </motion.p>
          </motion.div>
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <div className="w-full sm:w-[80%] aspect-[4/3] bg-[#0d0a08] border border-[#c09b62] p-2 relative shadow-[0_0_50px_rgba(192,155,98,0.2)] hover:shadow-[0_0_80px_rgba(192,155,98,0.3)] transition-shadow duration-700">
               <img src="/certificate.png" alt="Certificate" className="w-full h-full object-cover" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, delay: 0.3, }}
            viewport={{ once: true }}
            className="pl-0 lg:pl-12 border-l-0 lg:border-l border-white/10"
          >
            <p className="text-[#f5eedf] text-sm font-serif italic font-light leading-relaxed tracking-wider">
              "Their dedication, professionalism, and exceptional execution have made them our most trusted development partner."
            </p>
            <div className="mt-8 text-[9px] font-sans tracking-[0.25em] uppercase text-[#c09b62]">
              CEO, MVP Developers
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cinematic Divider */}
      <div className="w-full h-16 md:h-24 bg-gradient-to-b from-[#14100c] to-[#0d0a08] relative flex items-center justify-center">
        <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#c09b62]/40 to-transparent" />
      </div>

      {/* ----------------- SECTION 6: PROJECTS ----------------- */}
      <section id="06" className="relative w-full py-20 md:py-32 px-6 md:px-12 lg:px-24 bg-[#0d0a08]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-20 gap-8">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2 variants={fadeUp} className="text-[2rem] sm:text-[2.5rem] md:text-[3rem] leading-[1.1] font-serif font-light tracking-wide text-white uppercase flex flex-col">
              <span>Iconic Projects</span>
              <span>That Define</span>
              <span className="text-[#c09b62] italic">Tomorrow</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#f5eedf] text-xs font-sans font-light leading-loose tracking-[0.1em] mt-6">
              Explore our signature projects across prime locations.
            </motion.p>
          </motion.div>
          <motion.button 
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.5 }} viewport={{ once: true }}
            className="px-6 py-3 border border-[#c09b62]/40 text-[8px] tracking-[0.25em] uppercase hover:bg-[#c09b62]/10 text-[#c09b62] transition-colors font-sans"
          >
            View All Projects
          </motion.button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { location: "ADDIS ABABA", name: "Rosewood Heights", type: "Luxury Residences", img: "/project-1.png" },
            { location: "ISTANBUL", name: "Lemene Tower", type: "Commercial", img: "/project-2.png" },
            { location: "RIYADH", name: "Rose Vista", type: "Luxury Villas", img: "/project-1.png" },
            { location: "LAHORE", name: "Lemene Signature", type: "Mixed Use", img: "/project-2.png" },
            { location: "MIAMI", name: "Rose Bay", type: "Waterfront Residences", img: "/project-1.png" }
          ].map((project, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 1, }}
              viewport={{ once: true, margin: "-50px" }}
              key={project.name} 
              className="group cursor-pointer relative aspect-[3/4] overflow-hidden border border-white/5 shadow-lg hover:shadow-[0_0_30px_rgba(192,155,98,0.2)] transition-shadow duration-500"
            >
              <img src={project.img} alt={project.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 ease-out" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0a08] via-[#0d0a08]/40 to-transparent pointer-events-none" />
              
              <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6">
                <div className="text-[#c09b62] text-[8px] font-sans tracking-[0.3em] uppercase mb-1">{project.location}</div>
                <h4 className="font-serif tracking-widest text-base sm:text-lg text-white mb-1 group-hover:text-[#c09b62] transition-colors duration-500">{project.name}</h4>
                <p className="text-gray-300 text-[9px] font-sans tracking-[0.1em] mb-4">{project.type}</p>
                <div className="text-white text-[8px] font-sans tracking-[0.2em] uppercase opacity-0 -translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 flex items-center gap-2">
                  View Project <span className="text-[#c09b62]">→</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ----------------- FOOTER ----------------- */}
      <footer className="relative w-full pt-20 md:pt-32 pb-8 md:pb-12 bg-[#050505] border-t border-white/5 overflow-hidden">
        <div className="absolute inset-0 w-full h-full z-0 opacity-30 mix-blend-screen">
          <img src="/hero-bg.png" alt="Footer Skyline" className="w-full h-full object-cover object-bottom" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-[#050505]" />
        </div>

        <div className="relative z-10 px-6 md:px-12 lg:px-24">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, }}
            viewport={{ once: true }}
            className="text-center mb-20 md:mb-32"
          >
            <h2 className="text-[2.2rem] sm:text-[3rem] md:text-[4.5rem] leading-[1.1] font-serif font-light tracking-wide text-white uppercase flex flex-col items-center">
              <span>Let's Build</span>
              <span>The Future</span>
              <span className="text-[#c09b62] italic">Together</span>
            </h2>
            <div className="mt-8 md:mt-12 flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 md:px-8 py-3 md:py-4 bg-[#c09b62] border border-[#c09b62] text-black hover:bg-transparent hover:text-[#c09b62] transition-colors duration-500 text-[9px] tracking-[0.25em] uppercase font-sans shadow-[0_0_20px_rgba(192,155,98,0.4)]">
                Schedule A Consultation
              </button>
              <button className="px-6 md:px-8 py-3 md:py-4 border border-white/20 hover:bg-white/10 hover:border-white transition-colors duration-500 text-[9px] tracking-[0.25em] uppercase font-sans text-white">
                Start Your Project
              </button>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-12 gap-8 md:gap-12 text-gray-300 text-[10px] font-sans tracking-widest uppercase border-t border-white/10 pt-12 md:pt-16">
            <div className="col-span-2 md:col-span-4 flex flex-col gap-6">
              <div className="flex items-center gap-1 font-serif tracking-[0.15em] text-xl md:text-2xl font-light text-white normal-case">
                B WELL
                <span className="text-[#c09b62] italic text-base md:text-lg mt-1 ml-1">REAL ESTATE</span>
              </div>
              <p className="max-w-xs leading-relaxed text-[#f5eedf] normal-case tracking-wide">
                Building more than structures, we build trust, relationships, and a better tomorrow.
              </p>
              <div className="flex gap-4 mt-2">
                {['F', 'I', 'in'].map(icon => (
                  <div key={icon} className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:border-[#c09b62] hover:text-[#c09b62] transition-colors cursor-pointer text-[10px]">
                    {icon}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="col-span-1 md:col-span-2 flex flex-col gap-4">
              <span className="text-white mb-2 font-serif text-xs">Company</span>
              <a href="#" className="hover:text-[#c09b62] transition-colors">About Us</a>
              <a href="#" className="hover:text-[#c09b62] transition-colors">Our People</a>
              <a href="#" className="hover:text-[#c09b62] transition-colors">Careers</a>
              <a href="#" className="hover:text-[#c09b62] transition-colors">News & Media</a>
            </div>
            
            <div className="col-span-1 md:col-span-2 flex flex-col gap-4">
              <span className="text-white mb-2 font-serif text-xs">Services</span>
              <a href="#" className="hover:text-[#c09b62] transition-colors">Development</a>
              <a href="#" className="hover:text-[#c09b62] transition-colors">Construction</a>
              <a href="#" className="hover:text-[#c09b62] transition-colors">Project Mgmt</a>
              <a href="#" className="hover:text-[#c09b62] transition-colors">Design & Build</a>
            </div>

            <div className="col-span-1 md:col-span-2 flex flex-col gap-4">
              <span className="text-white mb-2 font-serif text-xs">Location</span>
              <span className="text-[#f5eedf]">Addis Ababa</span>
            </div>

            <div className="col-span-1 md:col-span-2 flex flex-col gap-4">
              <span className="text-white mb-2 font-serif text-xs">Contact</span>
              <a href="mailto:info@bewell.com" className="hover:text-[#c09b62] transition-colors lowercase tracking-widest text-[#f5eedf]">info@bewell.com</a>
              <span className="text-[#f5eedf]">+251 912 345 6789</span>
            </div>
          </div>
          
          <div className="mt-12 md:mt-16 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between text-[8px] font-sans tracking-[0.2em] uppercase text-gray-500">
            <span>© 2026 B Well Real Estate. All Rights Reserved.</span>
            <div className="flex gap-8 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
            </div>
          </div>
        </div>
      </footer>

    </main>
  );
}
