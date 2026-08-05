"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, UserCircle2, Briefcase, Mail } from "lucide-react";
import Link from "next/link";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  bio?: string;
  image?: string;
}

const fallbackTeam: TeamMember[] = [
  { id: '1', name: 'Haris Lemene', role: 'Chief Executive Officer', department: 'Leadership' },
  { id: '2', name: 'Maryam Rose', role: 'Managing Director', department: 'Leadership' },
  { id: '3', name: 'Fahad Khan', role: 'Head of Construction', department: 'Engineering' },
  { id: '4', name: 'David Allen', role: 'Head of Architecture', department: 'Design' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 }
  }
};

export default function TeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTeam() {
      try {
        const res = await fetch("/api/team");
        const data = await res.json();
        if (Array.isArray(data)) {
          setTeam(data);
        } else {
          setTeam(fallbackTeam);
        }
      } catch (error) {
        console.error("Failed to fetch team:", error);
        setTeam(fallbackTeam);
      } finally {
        setLoading(false);
      }
    }
    fetchTeam();
  }, []);

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 pb-24 px-6 md:px-12 lg:px-24">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-20 flex flex-col items-center text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#c09b62] transition-colors font-sans text-xs tracking-widest uppercase mb-12 self-start">
          <ArrowLeft className="w-4 h-4" />
          Back Home
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif tracking-wider uppercase mb-6 drop-shadow-sm">
            Meet The <span className="text-[#c09b62] italic">Visionaries</span>
          </h1>
          <p className="text-gray-400 font-sans text-sm md:text-base tracking-[0.2em] max-w-2xl mx-auto leading-loose font-light">
            Our leadership brings decades of unmatched expertise in luxury real estate, visionary architecture, and impeccable engineering.
          </p>
        </motion.div>
      </div>

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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto"
        >
          {team.map((member) => (
            <motion.div 
              key={member.id}
              variants={fadeUp}
              onMouseEnter={() => setHoveredMember(member.id)}
              onMouseLeave={() => setHoveredMember(null)}
              className="group relative flex flex-col border border-white/5 bg-black/20 backdrop-blur-sm rounded-sm overflow-hidden"
            >
              {/* Profile Image Space */}
              <div className="w-full aspect-[4/5] bg-[#111] relative overflow-hidden">
                <motion.div 
                  animate={{ scale: hoveredMember === member.id ? 1.05 : 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="w-full h-full flex items-center justify-center text-gray-800"
                >
                  {member.image ? (
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700" />
                  ) : (
                    <UserCircle2 className="w-32 h-32 opacity-20" />
                  )}
                </motion.div>
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
              </div>

              {/* Text Info Overlay */}
              <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col gap-2">
                <h3 className="text-xl font-serif tracking-wider uppercase text-white group-hover:text-[#c09b62] transition-colors duration-500">
                  {member.name}
                </h3>
                <div className="flex items-center gap-2 text-[#c09b62] text-[10px] uppercase font-sans tracking-[0.25em]">
                  <Briefcase className="w-3 h-3" />
                  <span>{member.role}</span>
                </div>
                <div className="h-[1px] w-0 group-hover:w-full bg-[#c09b62]/50 mt-4 transition-all duration-700 ease-out" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </main>
  );
}
