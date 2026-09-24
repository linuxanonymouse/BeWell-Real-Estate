"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, MapPin, Building2, CircleDollarSign, ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import ContactModal from "@/components/ContactModal";

interface Project {
  id: string;
  name: string;
  location: string;
  status: string;
  value: string;
  description?: string;
  image?: string;
  video?: string;
  galleryImages?: string[];
  rooms?: { name: string; images: string[] }[];
  progressUpdates?: { text: string; images: string[]; date: string }[];
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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    async function fetchProject() {
      try {
        const res = await fetch(`/api/projects/${id}`);
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

  // Derived flattened gallery for lightbox
  const allGalleryImages = project?.rooms 
    ? project.rooms.flatMap(r => r.images)
    : (project?.galleryImages || []);

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
          {project.video ? (
            <video 
              src={project.video}
              autoPlay muted loop playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img 
              src={project.image || `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/project-${parseInt(id) % 2 === 0 ? 2 : 1}.png`} 
              alt={project.name}
              className="w-full h-full object-cover"
            />
          )}
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
            {project.description ? (
              <p className="text-gray-300 font-sans tracking-wide leading-loose text-sm md:text-base whitespace-pre-wrap">
                {project.description}
              </p>
            ) : (
              <>
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
              </>
            )}
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
        
        {/* Luxury Photo Gallery Grouped By Room */}
        {project.rooms && project.rooms.length > 0 ? (
          <div className="mt-20 pt-16 border-t border-white/10 flex flex-col gap-16">
            {project.rooms.map((room, roomIdx) => (
              <motion.div 
                key={roomIdx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="text-2xl font-serif uppercase tracking-wider text-[#c09b62]">{room.name || 'Room'}</h2>
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-zinc-500 text-xs font-sans tracking-widest uppercase">{room.images.length} Photos</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {room.images.map((img, imgIdx) => {
                    const label = img.split('/').pop()?.replace(/-\d+-\d+\.[^.]+$/, '').replace(/[-_]/g, ' ') || 'Photo';
                    // Calculate global index for lightbox
                    let globalIdx = 0;
                    for(let i=0; i<roomIdx; i++) globalIdx += project.rooms![i].images.length;
                    globalIdx += imgIdx;

                    return (
                      <motion.div 
                        key={imgIdx}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: imgIdx * 0.1, duration: 0.5 }}
                        onClick={() => { setLightboxIndex(globalIdx); setLightboxOpen(true); }}
                        className="group cursor-pointer relative aspect-[4/3] overflow-hidden rounded-lg border border-white/10 hover:border-[#c09b62]/50 transition-all duration-500"
                      >
                        <img src={img} alt={label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                          <p className="text-white text-xs font-sans tracking-widest uppercase capitalize">{label}</p>
                        </div>
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <Maximize2 className="w-4 h-4 text-[#c09b62]" />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        ) : project.galleryImages && project.galleryImages.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="mt-20 pt-16 border-t border-white/10"
          >
            <div className="flex items-center gap-4 mb-10">
              <h2 className="text-2xl font-serif uppercase tracking-wider text-[#c09b62]">Interior Gallery</h2>
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-zinc-500 text-xs font-sans tracking-widest uppercase">{project.galleryImages.length} Photos</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {project.galleryImages.map((img, idx) => {
                const label = img.split('/').pop()?.replace(/-\d+-\d+\.[^.]+$/, '').replace(/[-_]/g, ' ') || 'Photo';
                return (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.2 + idx * 0.1, duration: 0.5 }}
                    onClick={() => { setLightboxIndex(idx); setLightboxOpen(true); }}
                    className="group cursor-pointer relative aspect-[4/3] overflow-hidden rounded-lg border border-white/10 hover:border-[#c09b62]/50 transition-all duration-500"
                  >
                    <img src={img} alt={label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                      <p className="text-white text-xs font-sans tracking-widest uppercase capitalize">{label}</p>
                    </div>
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <Maximize2 className="w-4 h-4 text-[#c09b62]" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Progress Updates */}
        {project.progressUpdates && project.progressUpdates.length > 0 && (
          <div className="mt-20 pt-16 border-t border-white/10">
            <h2 className="text-2xl font-serif uppercase tracking-wider mb-10 text-[#c09b62]">Progress Updates</h2>
            <div className="flex flex-col gap-10">
              {project.progressUpdates.map((update, idx) => (
                <div key={idx} className="border-l-2 border-[#c09b62] pl-6 py-2">
                  <div className="text-sm text-gray-500 font-sans tracking-widest uppercase mb-4">
                    {new Date(update.date).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <p className="text-gray-300 font-sans leading-relaxed max-w-3xl mb-6">
                    {update.text}
                  </p>
                  {update.images && update.images.length > 0 && (
                    <div className="flex flex-wrap gap-4">
                      {update.images.map((img, i) => (
                        <div key={i} className="w-48 h-48 rounded-lg overflow-hidden border border-white/10">
                          <img src={img} alt="Progress update" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500 cursor-pointer" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Fullscreen Lightbox */}
      <AnimatePresence>
        {lightboxOpen && allGalleryImages.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
          >
            {/* Close Button */}
            <button onClick={() => setLightboxOpen(false)} className="absolute top-6 right-6 z-10 w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:border-[#c09b62] hover:text-[#c09b62] transition-colors">
              <X className="w-5 h-5" />
            </button>

            {/* Counter */}
            <div className="absolute top-6 left-6 text-white/50 font-sans text-sm tracking-widest">
              <span className="text-[#c09b62]">{lightboxIndex + 1}</span> / {allGalleryImages.length}
            </div>

            {/* Prev Button */}
            <button 
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(prev => prev === 0 ? allGalleryImages.length - 1 : prev - 1); }}
              className="absolute left-4 md:left-8 z-10 w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:border-[#c09b62] hover:text-[#c09b62] transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Next Button */}
            <button 
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(prev => prev === allGalleryImages.length - 1 ? 0 : prev + 1); }}
              className="absolute right-4 md:right-8 z-10 w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:border-[#c09b62] hover:text-[#c09b62] transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Image */}
            <motion.div 
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="max-w-[90vw] max-h-[85vh] relative"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={allGalleryImages[lightboxIndex]} 
                alt={`Gallery ${lightboxIndex + 1}`}
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg">
                <p className="text-white text-sm font-sans tracking-widest uppercase capitalize text-center">
                  {allGalleryImages[lightboxIndex].split('/').pop()?.replace(/-\d+-\d+\.[^.]+$/, '').replace(/[-_]/g, ' ') || 'Photo'}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
