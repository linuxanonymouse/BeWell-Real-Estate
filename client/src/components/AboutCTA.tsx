"use client";
import { useState } from "react";
import ContactModal from "@/components/ContactModal";
import { ArrowRight } from "lucide-react";

export default function AboutCTA() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center gap-2 bg-[#c09b62] text-black px-8 py-4 rounded-full font-sans uppercase tracking-widest text-sm hover:bg-white transition-colors"
      >
        Schedule A Consultation <ArrowRight className="w-4 h-4" />
      </button>
      <ContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
