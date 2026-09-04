import Link from "next/link";
import { Building2, Award, Users, ArrowRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import AboutCTA from "@/components/AboutCTA";

export default async function AboutPage() {
  let siteContent: any = {};
  try {
    const backendUrl = process.env.NEXT_INTERNAL_API_URL || 'http://localhost:3001';
    const res = await fetch(`${backendUrl}/site-content`, { next: { revalidate: 0 } });
    if (res.ok) siteContent = await res.json();
  } catch (e) {
    console.error("Failed to fetch site content for About page", e);
  }

  const about = siteContent.about || {};

  const heroHighlight = about.heroHighlight || "Legacy";
  const heroTitle = about.heroTitle || "Beyond\nImagination";
  const heroSubtitle = about.heroSubtitle || "B Well Real Estate is redefining luxury living in Ethiopia through visionary architecture and uncompromising quality.";
  const storySectionTitle = about.storySectionTitle || "Shaping the Future of Urban Living";
  const story = about.story || "The name 'B Well' was inspired by the concept of a Wishing Well — a symbol of hope, prosperity, and the fulfillment of dreams. Just as people cast their wishes into a well, we help our clients turn their dreams of luxury living into reality.";
  const storyMiddle = about.storyMiddle || "Founded on the principles of excellence and innovation, B Well Real Estate has established itself as the premier developer of luxury properties. We don't just build structures; we create communities that elevate the standard of living. Every B Well property is a testament to our commitment to sustainable design, premium materials, and unparalleled craftsmanship.";
  const vision = about.vision || "Our vision is to transform the skyline while respecting the rich cultural heritage of our surroundings, delivering exceptional value to our clients and investors.";
  const statNumber = about.statNumber || "15+";
  const statLabel = about.statLabel || "Years of Excellence";
  const ctaTitle = about.ctaTitle || "Ready to Experience Luxury?";
  const ctaSubtitle = about.ctaSubtitle || "Connect with our team to discover our portfolio of premium properties.";

  const values = [
    {
      icon: Award,
      title: about.value1Title || "Uncompromising Quality",
      desc: about.value1Desc || "We source only the finest materials globally to ensure every finish meets our rigorous standards of luxury."
    },
    {
      icon: Building2,
      title: about.value2Title || "Visionary Architecture",
      desc: about.value2Desc || "Our designs blend contemporary aesthetics with functional brilliance to create timeless living spaces."
    },
    {
      icon: Users,
      title: about.value3Title || "Client-Centric Approach",
      desc: about.value3Desc || "From initial consultation to final handover, we prioritize transparency and personalized service."
    }
  ];

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-[#050505]/40 to-[#050505] z-10" />
          <div className="absolute inset-0 bg-[#c09b62]/5 mix-blend-screen z-10" />
        </div>
        <div className="max-w-7xl mx-auto relative z-20 text-center">
          <h1 className="text-5xl md:text-7xl font-serif mb-6">
            <span className="text-[#c09b62]">{heroHighlight}</span>{" "}
            {heroTitle.split("\n").map((line: string, i: number) => (
              <span key={i}>{i > 0 && <br />}{line}</span>
            ))}
          </h1>
          <p className="text-zinc-400 font-sans max-w-2xl mx-auto text-lg md:text-xl">
            {heroSubtitle}
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-[#c09b62] text-sm uppercase tracking-[0.2em] font-sans mb-4">Our Story</h2>
            <h3 className="text-3xl md:text-5xl font-serif mb-6 leading-tight">{storySectionTitle}</h3>
            <div className="space-y-6 text-zinc-400 font-sans">
              <p>{story}</p>
              <p>{storyMiddle}</p>
              <p>{vision}</p>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 border border-[#c09b62]/20 rounded-2xl" />
            <div className="bg-zinc-900 rounded-2xl p-12 text-center relative z-10 border border-zinc-800">
              <Building2 className="w-16 h-16 text-[#c09b62] mx-auto mb-6" />
              <div className="text-6xl font-serif text-white mb-2">{statNumber}</div>
              <div className="text-zinc-500 uppercase tracking-widest text-sm font-sans">{statLabel}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-6 bg-zinc-950 border-y border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[#c09b62] text-sm uppercase tracking-[0.2em] font-sans mb-4">Core Values</h2>
            <h3 className="text-3xl md:text-5xl font-serif">What Drives Us</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, idx) => (
              <div key={idx} className="bg-[#050505] p-8 rounded-2xl border border-zinc-900 hover:border-[#c09b62]/50 transition-colors group">
                <value.icon className="w-10 h-10 text-[#c09b62] mb-6 group-hover:scale-110 transition-transform" />
                <h4 className="text-xl font-serif text-white mb-4">{value.title}</h4>
                <p className="text-zinc-500 font-sans leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-serif mb-6">{ctaTitle}</h2>
          <p className="text-zinc-400 font-sans mb-10 text-lg">
            {ctaSubtitle}
          </p>
          <AboutCTA />
        </div>
      </section>

      <footer className="bg-black text-[9px] text-zinc-500 uppercase tracking-[0.2em] font-sans py-24 px-6 md:px-12 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 text-white">
            <span className="text-xl md:text-2xl font-serif lowercase italic text-[#c09b62]">b</span>
            <span>well</span>
          </div>
          <div>© {new Date().getFullYear()} B WELL REAL ESTATE. ALL RIGHTS RESERVED.</div>
        </div>
      </footer>
    </main>
  );
}
