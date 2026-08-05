"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import ContactModal from "@/components/ContactModal";
import ScrollVideoBackground from "@/components/ScrollVideoBackground";
import Link from "next/link";

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

interface Project {
  id: string;
  name: string;
  location: string;
  status: string;
  value: string;
  image?: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  image?: string;
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  
  const defaultContent = {
    hero: { titleLine1: "Building", titleLine2: "Beyond", titleHighlight: "Imagination", subtitle: "We don't just build buildings, we build legacies." },
    projectsSection: { titleLine1: "Iconic Projects", titleLine2: "That Define", titleHighlight: "Tomorrow", subtitle: "Explore our signature projects across prime locations." },
    certifications: { titleLine1: "Trusted By", titleLine2: "Those Who", titleHighlight: "Know Excellence", subtitle: "Our commitment to quality and timely delivery has earned us the trust of industry leaders.", quote: "\"Their dedication, professionalism, and exceptional execution have made them our most trusted development partner.\"", quoteAuthor: "CEO, MVP Developers" },
    footer: { titleLine1: "Let's Build", titleLine2: "The Future", titleHighlight: "Together", description: "Building more than structures, we build trust, relationships, and a better tomorrow.", email: "info@bewell.com", phone: "+251 912 345 6789", location: "Addis Ababa" }
  };

  const defaultProjects: Project[] = [
    { id: '1', name: 'Rosewood Heights', location: 'Addis Ababa', status: 'Under Construction', value: '$450M' },
    { id: '2', name: 'Lemene Tower', location: 'Istanbul', status: 'Completed', value: '$320M' },
    { id: '3', name: 'Rose Vista', location: 'Riyadh', status: 'Planning', value: '$180M' },
    { id: '4', name: 'Lemene Signature', location: 'Lahore', status: 'Completed', value: '$250M' },
    { id: '5', name: 'Rose Bay', location: 'Miami', status: 'Under Construction', value: '$500M' },
  ];

  const [siteContent, setSiteContent] = useState<any>(defaultContent);
  const [projects, setProjects] = useState<Project[]>(defaultProjects);
  const [team, setTeam] = useState<TeamMember[]>([]);

  useEffect(() => {
    setMounted(true);
    
    async function fetchData() {
      try {
        const [contentRes, projectsRes, teamRes] = await Promise.all([
          fetch(process.env.NEXT_PUBLIC_API_URL + "/site-content"),
          fetch(process.env.NEXT_PUBLIC_API_URL + "/projects"),
          fetch(process.env.NEXT_PUBLIC_API_URL + "/team")
        ]);
        
        if (contentRes.ok) {
          const data = await contentRes.json();
          setSiteContent({
            ...defaultContent,
            ...data,
            hero: { ...defaultContent.hero, ...(data?.hero || {}) },
            projectsSection: { ...defaultContent.projectsSection, ...(data?.projectsSection || {}) },
            certifications: { ...defaultContent.certifications, ...(data?.certifications || {}) },
            footer: { ...defaultContent.footer, ...(data?.footer || {}) }
          });
        }
        if (projectsRes.ok) {
          const data = await projectsRes.json();
          if (Array.isArray(data) && data.length > 0) setProjects(data);
        }
        if (teamRes.ok) {
          const data = await teamRes.json();
          if (Array.isArray(data)) setTeam(data);
        }
      } catch (err) {
        console.error("Failed to fetch homepage data", err);
      }
    }
    
    fetchData();
  }, []);

  if (!mounted) return null;

  return (
    <main className="relative w-full min-h-screen overflow-x-hidden bg-transparent text-white selection:bg-[#c09b62]/30 selection:text-white">
      
      <ScrollVideoBackground />

      <Navbar onScheduleClick={() => setIsContactModalOpen(true)} />
      <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />

      {/* ----------------- SECTION 1: HERO ----------------- */}
      <section id="01" className="relative w-full h-auto pt-32 pb-16 lg:py-0 lg:h-screen flex flex-col justify-end lg:justify-center px-6 md:px-12 lg:px-24">

        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="relative z-10 max-w-4xl mt-12 md:mt-0 pt-0 md:pt-20">
          <motion.h1 variants={fadeUp} className="text-[2.5rem] sm:text-[4rem] md:text-[5.5rem] leading-[1.1] font-serif font-light tracking-wide text-white uppercase flex flex-col drop-shadow-lg">
            <span>{siteContent.hero.titleLine1}</span>
            <span>{siteContent.hero.titleLine2}</span>
            <span className="text-[#c09b62] italic -mt-1 md:-mt-2">{siteContent.hero.titleHighlight}</span>
          </motion.h1>
          
          <motion.p variants={fadeUp} className="text-[#f5eedf] text-xs sm:text-sm font-sans font-light max-w-[280px] sm:max-w-sm leading-relaxed sm:leading-loose tracking-[0.1em] mt-4 md:mt-8 drop-shadow-md">
            {siteContent.hero.subtitle}
          </motion.p>

          <motion.div variants={fadeUp} className="mt-16 md:mt-16 flex flex-row items-center gap-4">
            <a href="#06" onClick={(e) => { e.preventDefault(); document.getElementById('06')?.scrollIntoView({ behavior: 'smooth' }); }} className="inline-flex items-center justify-center px-6 md:px-8 py-3.5 md:py-4 bg-[#c09b62] text-black text-[10px] sm:text-xs tracking-[0.25em] uppercase no-underline appearance-none transition-all duration-500 font-sans font-medium shadow-[0_0_15px_rgba(192,155,98,0.3)] rounded-none">
              Explore Portfolio
            </a>
            <a href="#04" onClick={(e) => { e.preventDefault(); document.getElementById('04')?.scrollIntoView({ behavior: 'smooth' }); }} className="inline-flex items-center justify-center px-6 md:px-8 py-3.5 md:py-4 border border-white/30 text-white text-[10px] sm:text-xs tracking-[0.25em] uppercase no-underline appearance-none transition-all duration-500 font-sans bg-black/20 rounded-none">
              Our Vision
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* ----------------- SECTION 2: INTERIORS ----------------- */}
      <section id="02" className="relative w-full min-h-[80vh] md:min-h-screen flex items-center py-16 md:py-24 bg-transparent">

        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="relative z-10 px-6 md:px-12 lg:px-24 max-w-2xl">
          <div className="bg-black/60 backdrop-blur-md p-8 md:p-12 rounded-2xl border border-white/10 shadow-2xl inline-block">
            <motion.h2 variants={fadeUp} className="text-[2rem] sm:text-[2.5rem] md:text-[3.5rem] leading-[1.1] font-serif font-light tracking-wide text-white uppercase flex flex-col drop-shadow-md">
              <span>Crafted</span><span>For The</span><span className="text-[#c09b62] italic">Extraordinary</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#f5eedf] text-xs font-sans font-light max-w-sm leading-loose tracking-[0.1em] mt-6 mb-8 md:mb-10 drop-shadow-md">
              Every detail is a testament to perfection and timeless design. Step into interiors that flow seamlessly, offering panoramic views and uncompromised privacy in a warm, welcoming environment.
            </motion.p>
            <motion.button onClick={() => setIsContactModalOpen(true)} variants={fadeUp} className="px-6 py-3 border border-[#c09b62] text-[8px] tracking-[0.25em] uppercase text-[#c09b62] hover:bg-[#c09b62] hover:text-black transition-all duration-300 font-sans shadow-[0_0_15px_rgba(192,155,98,0.3)] bg-black/30 backdrop-blur-sm">
              Inquire About Interiors
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* ----------------- SECTION 3: AMENITIES ----------------- */}
      <section id="03" className="relative w-full min-h-[80vh] md:min-h-screen flex items-center py-16 md:py-24 bg-transparent">

        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="relative z-10 px-6 md:px-12 lg:px-24 max-w-2xl ml-auto">
          <div className="bg-black/60 backdrop-blur-md p-8 md:p-12 rounded-2xl border border-white/10 shadow-2xl inline-block">
            <motion.h2 variants={fadeUp} className="text-[2rem] sm:text-[2.5rem] md:text-[3.5rem] leading-[1.1] font-serif font-light tracking-wide text-white uppercase flex flex-col drop-shadow-md">
              <span>A Lifestyle</span><span>Beyond</span><span className="text-[#c09b62] italic">Luxury</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#f5eedf] text-xs font-sans font-light max-w-sm leading-loose tracking-[0.1em] mt-6 mb-8 md:mb-10 drop-shadow-md">
              World-class amenities for a life well lived. From infinity pools catching the sunset to private spas.
            </motion.p>
            <motion.button onClick={() => setIsContactModalOpen(true)} variants={fadeUp} className="px-6 py-3 border border-[#c09b62] text-[8px] tracking-[0.25em] uppercase text-[#c09b62] hover:bg-[#c09b62] hover:text-black transition-all duration-300 font-sans shadow-[0_0_15px_rgba(192,155,98,0.3)] bg-black/30 backdrop-blur-sm">
              Schedule a Tour
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* ----------------- SECTION 4: VISIONARIES ----------------- */}
      <section id="04" className="relative w-full min-h-screen py-20 md:py-32 px-6 md:px-12 lg:px-24 flex flex-col justify-center bg-transparent">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-end mb-12 md:mb-20">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="lg:col-span-4">
            <div className="bg-black/60 backdrop-blur-md p-8 md:p-12 rounded-2xl border border-white/10 shadow-2xl">
              <motion.h2 variants={fadeUp} className="text-[2rem] sm:text-[2.5rem] md:text-[3rem] leading-[1.1] font-serif font-light tracking-wide text-white uppercase flex flex-col">
                <span>Visionaries</span><span>Behind The</span><span className="text-[#c09b62] italic">Legacy</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="text-[#f5eedf] text-xs font-sans font-light leading-loose tracking-[0.1em] mt-6">
                A team of leaders, architects, and innovators driven by passion and commitment to excellence.
              </motion.p>
            </div>
          </motion.div>
          
          <div className="lg:col-span-8 flex gap-4 overflow-x-auto pb-8 snap-x pr-6 md:pr-[10vw]">
            {team.length > 0 ? team.map((leader, i) => (
              <motion.div key={leader.id} initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15, duration: 0.8 }} viewport={{ once: true }} className="w-[200px] sm:w-[240px] min-w-[200px] sm:min-w-[240px] flex-shrink-0 group cursor-pointer snap-start">
                <div className="aspect-[3/4] bg-[#1a1510]/80 backdrop-blur-sm border border-white/5 group-hover:border-[#c09b62] transition-all duration-700 mb-6 relative overflow-hidden flex items-center justify-center group-hover:shadow-[0_0_40px_rgba(192,155,98,0.2)] rounded-lg">
                  {leader.image ? (
                    <img src={leader.image.startsWith('http') ? leader.image : `${process.env.NEXT_PUBLIC_API_URL}${leader.image.startsWith('/') ? '' : '/'}${leader.image}`} alt={leader.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-tr from-[#0d0a08] to-[#1a1510] group-hover:from-[#14100c] group-hover:to-[#1f1a12] transition-all duration-700" />
                      <div className="relative z-10 font-serif text-[#c09b62]/10 text-6xl group-hover:text-[#c09b62]/30 group-hover:scale-110 transition-all duration-700">0{i+1}</div>
                    </>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-20 transition-all duration-700 pointer-events-none" />
                </div>
                <div className="bg-black/60 backdrop-blur-sm p-3 rounded-lg border border-white/5 inline-block w-full">
                  <h4 className="font-serif tracking-widest uppercase text-sm sm:text-base text-white group-hover:text-[#c09b62] transition-colors duration-500">{leader.name}</h4>
                  <p className="text-gray-400 text-[9px] font-sans tracking-[0.2em] mt-1">{leader.role}</p>
                </div>
              </motion.div>
            )) : (
              <div className="text-gray-500 text-sm font-sans tracking-widest uppercase">No visionaries found</div>
            )}
          </div>
        </div>
      </section>

      {/* ----------------- SECTION 5: TRUSTED BY ----------------- */}
      <section id="05" className="relative w-full py-20 md:py-32 px-6 md:px-12 lg:px-24 bg-transparent overflow-hidden">
        <div className="flex flex-col xl:flex-row items-center gap-12 xl:gap-8">
          
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="w-full xl:w-1/3 flex-shrink-0">
            <div className="bg-black/60 backdrop-blur-md p-8 md:p-12 rounded-2xl border border-white/10 shadow-2xl inline-block w-full">
              <motion.h2 variants={fadeUp} className="text-[1.8rem] sm:text-[2rem] md:text-[2.5rem] leading-[1.1] font-serif font-light tracking-wide text-white uppercase flex flex-col">
                <span>{siteContent?.certifications?.titleLine1 || "Trusted By"}</span>
                <span>{siteContent?.certifications?.titleLine2 || "Those Who"}</span>
                <span className="text-[#c09b62] italic">{siteContent?.certifications?.titleHighlight || "Know Excellence"}</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="text-[#f5eedf] text-xs font-sans font-light leading-loose tracking-[0.1em] mt-6">
                {siteContent?.certifications?.subtitle || "Partnered with the world's most prestigious brands."}
              </motion.p>
            </div>
          </motion.div>

          <div className="w-full xl:w-2/3 flex gap-4 overflow-x-auto pb-6 snap-x hide-scrollbar">
          {[
            { img: "/certificate.png", quote: siteContent?.certifications?.quote || "Exceptional execution.", author: siteContent?.certifications?.quoteAuthor || "CEO, MVP" },
            { img: "/certificate.png", quote: "They redefine luxury living with every project.", author: "Director, Global Architecture" },
            { img: "/certificate.png", quote: "Unparalleled attention to detail and design.", author: "President, Elite Estates" }
          ].map((item, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.15, duration: 0.8 }} viewport={{ once: true }} className="min-w-[200px] max-w-[220px] flex-shrink-0 snap-start">
              <div className="bg-black/70 backdrop-blur-md p-3 rounded-xl border border-white/10 h-full flex flex-col gap-3 shadow-lg">
                <div className="w-full h-[140px] bg-[#0d0a08] border border-[#c09b62]/40 p-1 relative overflow-hidden rounded-lg">
                  <img src={item.img} alt="Certificate" className="w-full h-full object-cover opacity-90" />
                </div>
                <div className="flex-1">
                  <p className="text-[#f5eedf] text-[11px] font-serif italic font-light leading-relaxed tracking-wide">
                    {item.quote}
                  </p>
                  <div className="mt-2 text-[8px] font-sans tracking-[0.2em] uppercase text-[#c09b62]">
                    {item.author}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          </div>
        </div>
      </section>

      {/* ----------------- SECTION 6: PROJECTS ----------------- */}
      <section id="06" className="relative w-full py-20 md:py-32 px-6 md:px-12 lg:px-24 bg-transparent">
        <div className="flex flex-col items-center justify-center mb-12 md:mb-20 text-center">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="w-full flex justify-center">
            <div className="bg-black/80 backdrop-blur-md p-8 md:p-12 rounded-2xl border border-white/10 shadow-2xl flex flex-col items-center max-w-2xl text-center">
              <motion.h2 variants={fadeUp} className="text-[2rem] sm:text-[2.5rem] md:text-[3rem] leading-[1.1] font-serif font-light tracking-wide text-white uppercase flex flex-col">
                <span>{siteContent?.projectsSection?.titleLine1 || "The"}</span>
                <span>{siteContent?.projectsSection?.titleLine2 || "Collection"}</span>
                <span className="text-[#c09b62] italic">{siteContent?.projectsSection?.titleHighlight || ""}</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="text-[#f5eedf] text-xs font-sans font-light leading-loose tracking-[0.1em] mt-6 mb-10 max-w-sm mx-auto">
                {siteContent?.projectsSection?.subtitle || "Explore our curated portfolio of ultra-luxury properties across the globe's most desirable locations."}
              </motion.p>
              <motion.button 
                onClick={() => setIsContactModalOpen(true)}
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.5 }} viewport={{ once: true }}
                className="px-8 py-4 border border-[#c09b62]/60 text-[10px] tracking-[0.25em] uppercase hover:bg-[#c09b62] hover:text-black text-[#c09b62] transition-colors duration-300 font-sans shadow-[0_0_15px_rgba(192,155,98,0.3)]"
              >
                Inquire Now
              </motion.button>
            </div>
          </motion.div>
        </div>

        <div className="bg-black/80 backdrop-blur-md p-6 md:p-10 rounded-2xl border border-white/10 shadow-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {projects.slice(0, 5).map((project, i) => (
              <Link href={`/projects/${project.id}`} key={project.id}>
                <motion.div 
                  initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, duration: 1 }} viewport={{ once: true, margin: "-50px" }}
                  className="w-full group cursor-pointer relative aspect-[3/4] overflow-hidden border border-white/5 shadow-lg hover:shadow-[0_0_30px_rgba(192,155,98,0.2)] transition-shadow duration-500 rounded-lg"
                >
                  <img src={project.image || `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/project-${i % 2 === 0 ? 1 : 2}.png`} alt={project.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 ease-out" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0a08] via-[#0d0a08]/40 to-transparent pointer-events-none" />
                  
                  <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6">
                    <div className="text-[#c09b62] text-[8px] font-sans tracking-[0.3em] uppercase mb-1">{project.location}</div>
                    <h4 className="font-serif tracking-widest text-base sm:text-lg text-white mb-1 group-hover:text-[#c09b62] transition-colors duration-500">{project.name}</h4>
                    <p className="text-gray-300 text-[9px] font-sans tracking-[0.1em] mb-4">{project.status}</p>
                    <div className="text-white text-[8px] font-sans tracking-[0.2em] uppercase opacity-0 -translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 flex items-center gap-2">
                      View Project <span className="text-[#c09b62]">→</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
          
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.3 }} viewport={{ once: true }} className="mt-12 flex justify-center w-full">
            <Link href="/projects" className="px-8 py-4 border border-[#c09b62]/60 text-[10px] tracking-[0.25em] uppercase hover:bg-[#c09b62] hover:text-black text-[#c09b62] transition-colors duration-300 font-sans shadow-[0_0_15px_rgba(192,155,98,0.3)]">
              View All Projects
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ----------------- FOOTER ----------------- */}
      <footer className="relative w-full pt-20 md:pt-32 pb-8 md:pb-12 bg-[#050505] border-t border-white/5 overflow-hidden">
        <div className="absolute inset-0 w-full h-full z-0 opacity-30 mix-blend-screen">
          <img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/hero-bg.png`} alt="Footer Skyline" className="w-full h-full object-cover object-bottom" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-[#050505]" />
        </div>

        <div className="relative z-10 px-6 md:px-12 lg:px-24">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1.2 }} viewport={{ once: true }} className="text-center mb-20 md:mb-32">
            <h2 className="text-[2.2rem] sm:text-[3rem] md:text-[4.5rem] leading-[1.1] font-serif font-light tracking-wide text-white uppercase flex flex-col items-center">
              <span>{siteContent.footer.titleLine1}</span>
              <span>{siteContent.footer.titleLine2}</span>
              <span className="text-[#c09b62] italic">{siteContent.footer.titleHighlight}</span>
            </h2>
            <div className="mt-8 md:mt-12 flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => setIsContactModalOpen(true)} className="px-6 md:px-8 py-3 md:py-4 bg-[#c09b62] border border-[#c09b62] text-black hover:bg-transparent hover:text-[#c09b62] transition-colors duration-500 text-[9px] tracking-[0.25em] uppercase font-sans shadow-[0_0_20px_rgba(192,155,98,0.4)]">
                Schedule A Consultation
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
                {siteContent.footer.description}
              </p>
            </div>
            
            <div className="col-span-1 md:col-span-2 flex flex-col gap-4">
              <span className="text-white mb-2 font-serif text-xs">Company</span>
              <a href="#" className="hover:text-[#c09b62] transition-colors">About Us</a>
              <a href="#" className="hover:text-[#c09b62] transition-colors">Our People</a>
            </div>
            
            <div className="col-span-1 md:col-span-2 flex flex-col gap-4">
              <span className="text-white mb-2 font-serif text-xs">Services</span>
              <a href="#" className="hover:text-[#c09b62] transition-colors">Development</a>
              <a href="#" className="hover:text-[#c09b62] transition-colors">Construction</a>
            </div>

            <div className="col-span-1 md:col-span-2 flex flex-col gap-4">
              <span className="text-white mb-2 font-serif text-xs">Location</span>
              <span className="text-[#f5eedf]">{siteContent.footer.location}</span>
            </div>

            <div className="col-span-1 md:col-span-2 flex flex-col gap-4">
              <span className="text-white mb-2 font-serif text-xs">Contact</span>
              <a href={`mailto:${siteContent.footer.email}`} className="hover:text-[#c09b62] transition-colors lowercase tracking-widest text-[#f5eedf]">{siteContent.footer.email}</a>
              <span className="text-[#f5eedf]">{siteContent.footer.phone}</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
