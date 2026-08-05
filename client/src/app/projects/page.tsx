"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, MapPin, Building2, CircleDollarSign, ArrowUpRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import ContactModal from "@/components/ContactModal";

interface Project {
  id: string;
  name: string;
  location: string;
  status: string;
  value: string;
  image?: string;
}

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const fallbackProjects: Project[] = [
  { id: '1', name: 'Rosewood Heights', location: 'Addis Ababa', status: 'Under Construction', value: '$450M' },
  { id: '2', name: 'Lemene Tower', location: 'Istanbul', status: 'Completed', value: '$320M' },
  { id: '3', name: 'Rose Vista', location: 'Riyadh', status: 'Planning', value: '$180M' },
  { id: '4', name: 'Lemene Signature', location: 'Lahore', status: 'Completed', value: '$250M' },
  { id: '5', name: 'Rose Bay', location: 'Miami', status: 'Under Construction', value: '$500M' },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch("http://localhost:3001/projects");
        const data = await res.json();
        if (Array.isArray(data)) {
          setProjects(data);
        } else {
          console.warn("Projects response is not an array, using fallback data");
          setProjects(fallbackProjects);
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        setProjects(fallbackProjects);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-24 pb-24 px-6 md:px-12 lg:px-24">
      <Navbar onScheduleClick={() => setIsContactModalOpen(true)} />
      <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[50vw] h-[50vw] bg-[#c09b62]/5 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-0 right-1/4 w-[40vw] h-[40vw] bg-[#c09b62]/5 rounded-full blur-[100px] mix-blend-screen" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#c09b62] transition-colors font-sans text-sm tracking-widest uppercase group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1 }}
          className="mb-12"
        >
          <h1 className="text-[3rem] md:text-[5rem] lg:text-[7rem] leading-[0.9] font-serif font-light tracking-wide uppercase flex flex-col">
            <span>Signature</span>
            <span className="text-[#c09b62] italic">Portfolio</span>
          </h1>
          <p className="mt-8 text-gray-400 font-sans tracking-[0.15em] max-w-md leading-loose text-sm">
            Discover our collection of extraordinary properties that redefine luxury living and architectural excellence.
          </p>
        </motion.div>

        {loading ? (
          <div className="h-[40vh] flex items-center justify-center">
            <div className="flex gap-2">
              <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-3 h-3 rounded-full bg-[#c09b62]" />
              <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-3 h-3 rounded-full bg-[#c09b62]" />
              <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-3 h-3 rounded-full bg-[#c09b62]" />
            </div>
          </div>
        ) : (
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-8 lg:gap-16"
          >
            {projects.map((project, index) => (
              <motion.a 
                href={`/projects/${project.id}`}
                key={project.id}
                variants={fadeUp}
                onMouseEnter={() => setHoveredProject(project.id)}
                onMouseLeave={() => setHoveredProject(null)}
                className="group relative flex flex-col lg:flex-row gap-8 lg:gap-16 items-center cursor-pointer"
              >
                {/* Image Section */}
                <div className="w-full lg:w-3/5 aspect-[16/10] overflow-hidden rounded-sm relative bg-[#111]">
                  <motion.div 
                    animate={{ scale: hoveredProject === project.id ? 1.05 : 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="w-full h-full"
                  >
                    <img 
                      src={project.image || `/project-${(index % 2) + 1}.png`} 
                      alt={project.name}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                    />
                  </motion.div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none" />
                  
                  {/* Floating View Project Button */}
                  <AnimatePresence>
                    {hoveredProject === project.id && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      >
                        <div className="w-24 h-24 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center text-[#c09b62] shadow-[0_0_30px_rgba(192,155,98,0.3)]">
                          <span className="text-[10px] uppercase tracking-widest font-sans mb-1">View</span>
                          <ArrowUpRight className="w-6 h-6" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Details Section */}
                <div className="w-full lg:w-2/5 flex flex-col justify-center">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-gray-500 font-serif text-2xl italic">0{index + 1}</span>
                    <div className="h-[1px] flex-1 bg-white/10 group-hover:bg-[#c09b62]/50 transition-colors duration-700" />
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif tracking-wider uppercase mb-6 group-hover:text-[#c09b62] transition-colors duration-500">
                    {project.name}
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-sm font-sans tracking-widest text-gray-300">
                      <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-[#c09b62]">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span className="uppercase">{project.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm font-sans tracking-widest text-gray-300">
                      <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-[#c09b62]">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <span className="uppercase">{project.status}</span>
                    </div>

                    <div className="flex items-center gap-4 text-sm font-sans tracking-widest text-gray-300">
                      <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-[#c09b62]">
                        <CircleDollarSign className="w-4 h-4" />
                      </div>
                      <span className="uppercase">{project.value}</span>
                    </div>
                  </div>

                  <div className="mt-10 overflow-hidden">
                    <span 
                      className="text-[10px] tracking-[0.3em] uppercase text-[#c09b62] border-b border-[#c09b62]/30 pb-1 group-hover:border-[#c09b62] transition-colors flex items-center gap-2 max-w-fit"
                    >
                      Discover Details <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </motion.a>
            ))}
          </motion.div>
        )}
      </div>
    </main>
  );
}
