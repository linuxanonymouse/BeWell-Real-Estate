"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, MapPin, Building2, CircleDollarSign } from "lucide-react";
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

const fallbackProjects: Project[] = [
  { id: '1', name: 'Rosewood Heights', location: 'Addis Ababa', status: 'Under Construction', value: '$450M' },
  { id: '2', name: 'Lemene Tower', location: 'Istanbul', status: 'Completed', value: '$320M' },
  { id: '3', name: 'Rose Vista', location: 'Riyadh', status: 'Planning', value: '$180M' },
  { id: '4', name: 'Lemene Signature', location: 'Lahore', status: 'Completed', value: '$250M' },
  { id: '5', name: 'Rose Bay', location: 'Miami', status: 'Under Construction', value: '$500M' },
];

export default function ProjectDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  useEffect(() => {
    async function fetchProject() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProject(data);
        } else {
          // Fallback if not found on backend
          const fallback = fallbackProjects.find(p => p.id === id);
          setProject(fallback || null);
        }
      } catch (error) {
        console.error("Failed to fetch project:", error);
        const fallback = fallbackProjects.find(p => p.id === id);
        setProject(fallback || null);
      } finally {
        setLoading(false);
      }
    }
    
    if (id) {
      fetchProject();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex gap-2">
          <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-3 h-3 rounded-full bg-[#c09b62]" />
          <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-3 h-3 rounded-full bg-[#c09b62]" />
          <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-3 h-3 rounded-full bg-[#c09b62]" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white">
        <Navbar onScheduleClick={() => setIsContactModalOpen(true)} />
        <h1 className="text-4xl font-serif mb-4">Project Not Found</h1>
        <Link href="/projects" className="text-[#c09b62] uppercase tracking-widest text-sm hover:underline">
          Return to Projects
        </Link>
        <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white pb-24">
      <Navbar onScheduleClick={() => setIsContactModalOpen(true)} />
      <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />
      {/* Hero Image */}
      <div className="w-full h-[70vh] md:h-screen relative mb-8 md:mb-12">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="w-full h-full"
        >
          <img 
            src={project.image || `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/project-${parseInt(id) % 2 === 0 ? 2 : 1}.png`} 
            alt={project.name}
            className="w-full h-full object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent pointer-events-none" />
        
        <div className="absolute bottom-0 left-0 w-full px-6 md:px-12 lg:px-24 pb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Link href="/projects" className="inline-flex items-center gap-2 text-gray-300 hover:text-[#c09b62] transition-colors font-sans text-sm tracking-widest uppercase group mb-6">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Portfolio
            </Link>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif tracking-wider uppercase text-white drop-shadow-lg">
              {project.name}
            </h1>
          </motion.div>
        </div>
      </div>

      <div className="px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Main Content */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="lg:col-span-7 lg:col-start-1 flex flex-col gap-6"
          >
            <h2 className="text-2xl md:text-3xl font-serif text-[#c09b62] italic">The Vision</h2>
            <p className="text-gray-300 font-sans tracking-wide leading-loose text-sm md:text-base">
              {project.name} stands as a testament to unparalleled architectural ambition and visionary design. 
              Situated in the heart of {project.location}, this {project.status.toLowerCase()} project redefines 
              the skyline and offers a lifestyle of uncompromised luxury. Every detail has been meticulously 
              crafted to provide an extraordinary living experience that exceeds expectations.
            </p>
            <p className="text-gray-300 font-sans tracking-wide leading-loose text-sm md:text-base">
              With an estimated value of {project.value}, it represents not just a residence, but a legacy. 
              The development integrates sustainable practices with cutting-edge amenities, ensuring that 
              it remains a timeless masterpiece for generations to come.
            </p>
          </motion.div>

          {/* Sidebar Info */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="lg:col-span-3 flex flex-col gap-10 border-l border-white/10 pl-8 lg:pl-12"
          >
            <div className="flex flex-col gap-3">
              <span className="text-[10px] text-gray-500 font-sans uppercase tracking-[0.2em]">Location</span>
              <div className="flex items-center gap-3 text-white">
                <MapPin className="w-5 h-5 text-[#c09b62]" />
                <span className="font-serif text-lg tracking-wide">{project.location}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-[10px] text-gray-500 font-sans uppercase tracking-[0.2em]">Status</span>
              <div className="flex items-center gap-3 text-white">
                <Building2 className="w-5 h-5 text-[#c09b62]" />
                <span className="font-serif text-lg tracking-wide">{project.status}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-[10px] text-gray-500 font-sans uppercase tracking-[0.2em]">Project Value</span>
              <div className="flex items-center gap-3 text-white">
                <CircleDollarSign className="w-5 h-5 text-[#c09b62]" />
                <span className="font-serif text-lg tracking-wide">{project.value}</span>
              </div>
            </div>
            
            <div className="pt-8 border-t border-white/10">
              <button onClick={() => setIsContactModalOpen(true)} className="w-full py-4 border border-[#c09b62] text-[#c09b62] hover:bg-[#c09b62] hover:text-black transition-all duration-300 font-sans text-xs tracking-widest uppercase">
                Inquire Now
              </button>
            </div>
          </motion.div>
          
        </div>
      </div>
    </main>
  );
}
