import Link from "next/link";
import { Building2, Award, Users, ArrowRight, Gem, Eye, Heart, Handshake, PenTool, Lightbulb } from "lucide-react";
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
  const ctaTitle = about.ctaTitle || "Ready to Experience Luxury?";
  const ctaSubtitle = about.ctaSubtitle || "Connect with our team to discover our exclusive portfolio of premium properties.";

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-[#050505]/40 to-[#050505] z-10" />
          <div className="absolute inset-0 bg-[#c09b62]/5 mix-blend-screen z-10" />
        </div>
        <div className="max-w-5xl mx-auto relative z-20 text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif mb-8 leading-tight">
            We don&apos;t just build buildings,{" "}
            <span className="text-[#c09b62]">we build legacies.</span>
          </h1>
          <p className="text-zinc-400 font-sans max-w-3xl mx-auto text-base md:text-lg leading-relaxed">
            B Well Real Estate is redefining urban living in Ethiopia through visionary architecture, uncompromising quality, and a profound commitment to creating elevated communities. For us, the word &ldquo;luxury&rdquo; is not a vague promise-it is a measurable standard.
          </p>
        </div>
      </section>

      {/* What Luxury Means Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="space-y-6 text-zinc-400 font-sans text-base md:text-lg leading-relaxed">
            <p>
              It means securing prime locations in Ethiopia&apos;s most exclusive diplomatic areas. It means sourcing globally vetted, premium materials. It means applying unparalleled craftsmanship to every finish and designing expansive, intelligent spaces that prioritize your daily comfort. We operate on a foundation of trust and a philosophy of growing together with our clients.
            </p>
          </div>
        </div>
      </section>

      {/* Our Vision Section */}
      <section className="py-20 px-6 bg-zinc-950 border-y border-zinc-900">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-[#c09b62] text-sm uppercase tracking-[0.2em] font-sans mb-4">Our Vision</h2>
            <h3 className="text-3xl md:text-5xl font-serif mb-6 leading-tight">Transforming Skylines</h3>
            <p className="text-zinc-400 font-sans leading-relaxed text-base md:text-lg">
              To be one of the leading luxury real estate developers in Ethiopia, setting new benchmarks for high-end urban living. By focusing on exclusive diplomatic areas and premier properties, our vision is to transform the skyline while respecting the rich cultural heritage of our surroundings-turning the aspirations of our clients into enduring realities.
            </p>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 border border-[#c09b62]/20 rounded-2xl" />
            <div className="bg-[#050505] rounded-2xl p-12 text-center relative z-10 border border-zinc-800">
              <Building2 className="w-16 h-16 text-[#c09b62] mx-auto mb-6" />
              <div className="text-6xl font-serif text-white mb-2">4+</div>
              <div className="text-zinc-500 uppercase tracking-widest text-sm font-sans">Years of Experience</div>
            </div>
          </div>
        </div>
      </section>

      {/* The Meaning Behind B Well */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-[#c09b62] text-sm uppercase tracking-[0.2em] font-sans mb-4">The Meaning Behind B Well</h2>
          <h3 className="text-3xl md:text-5xl font-serif mb-4">
            <span className="text-[#c09b62]">Built Well.</span>{" "}
            <span className="text-white">Live Well.</span>{" "}
            <span className="text-[#c09b62]">Be Well.</span>
          </h3>
          <div className="max-w-3xl mx-auto mt-10 space-y-6 text-zinc-400 font-sans text-base md:text-lg leading-relaxed text-left">
            <p>
              The name B Well comes from a simple but profound idea: when a home is built well, you can live well and be well.
            </p>
            <p>
              We see luxury as more than beautiful finishes or impressive architecture. It is in the structural integrity of the construction, the exacting care taken with each detail, and the comfort and sense of home a property provides. From the foundation to the final functional elements, we focus on creating homes that are beautiful, practical, and built to last.
            </p>
            <p>
              This philosophy shapes the way we approach every project. We aim to build homes that look exceptional, feel comfortable, function perfectly, and stand the test of time-homes that our clients can be proud of today and for years to come.
            </p>
          </div>
        </div>
      </section>

      {/* The Visionaries Behind the Brand */}
      <section className="py-24 px-6 bg-zinc-950 border-y border-zinc-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[#c09b62] text-sm uppercase tracking-[0.2em] font-sans mb-4">Leadership</h2>
            <h3 className="text-3xl md:text-5xl font-serif">The Visionaries Behind the Brand</h3>
            <p className="text-zinc-400 font-sans mt-6 max-w-2xl mx-auto leading-relaxed">
              This vision is driven by Co-Founders Muhammad and Nebil, two ambitious leaders whose complementary expertise forms the bedrock of the company.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#050505] p-10 rounded-2xl border border-zinc-900 hover:border-[#c09b62]/50 transition-colors group">
              <div className="w-16 h-16 rounded-full bg-[#c09b62]/10 flex items-center justify-center mb-6 group-hover:bg-[#c09b62]/20 transition-colors">
                <span className="text-2xl font-serif text-[#c09b62]">M</span>
              </div>
              <h4 className="text-xl font-serif text-white mb-2">Muhammad</h4>
              <div className="text-[#c09b62] text-xs uppercase tracking-[0.15em] font-sans mb-4">Co-Founder</div>
              <p className="text-zinc-500 font-sans leading-relaxed">
                A talented real estate developer and project manager with over 10 years of extensive experience working with major industry leaders. His strategic oversight and dedication to execution ensure that every project meets our rigorous standards for material quality and operational success.
              </p>
            </div>
            <div className="bg-[#050505] p-10 rounded-2xl border border-zinc-900 hover:border-[#c09b62]/50 transition-colors group">
              <div className="w-16 h-16 rounded-full bg-[#c09b62]/10 flex items-center justify-center mb-6 group-hover:bg-[#c09b62]/20 transition-colors">
                <span className="text-2xl font-serif text-[#c09b62]">N</span>
              </div>
              <h4 className="text-xl font-serif text-white mb-2">Nebil</h4>
              <div className="text-[#c09b62] text-xs uppercase tracking-[0.15em] font-sans mb-4">Co-Founder</div>
              <p className="text-zinc-500 font-sans leading-relaxed">
                A Canadian professional bringing over 10 years of experience in construction. His deep technical knowledge and international perspective infuse global standards of craftsmanship and structural integrity into the Ethiopian market.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Shaping the Future */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-[#c09b62] text-sm uppercase tracking-[0.2em] font-sans mb-4">Our Journey</h2>
          <h3 className="text-3xl md:text-5xl font-serif mb-8">Shaping the Future of Urban Living</h3>
          <p className="text-zinc-400 font-sans text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
            Founded in 2022, B Well Real Estate has rapidly established itself as a premier developer specializing in high-end properties located in Ethiopia&apos;s most exclusive diplomatic areas. The founders combine their vast industry experience to transform skylines while honoring the rich cultural heritage of their surroundings.
          </p>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-24 px-6 bg-zinc-950 border-y border-zinc-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[#c09b62] text-sm uppercase tracking-[0.2em] font-sans mb-4">Core Values</h2>
            <h3 className="text-3xl md:text-5xl font-serif">What Drives Us</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#050505] p-8 rounded-2xl border border-zinc-900 hover:border-[#c09b62]/50 transition-colors group">
              <Gem className="w-10 h-10 text-[#c09b62] mb-6 group-hover:scale-110 transition-transform" />
              <h4 className="text-xl font-serif text-white mb-2">Quality &amp; Craftsmanship</h4>
              <div className="text-[#c09b62] text-xs uppercase tracking-[0.15em] font-sans mb-4">Built Well</div>
              <p className="text-zinc-500 font-sans leading-relaxed">
                Luxury starts with the materials. We source the finest stone, wood, and fixtures globally, and enforce rigorous construction standards to ensure every structural element and surface finish stands the test of time.
              </p>
            </div>
            <div className="bg-[#050505] p-8 rounded-2xl border border-zinc-900 hover:border-[#c09b62]/50 transition-colors group">
              <Lightbulb className="w-10 h-10 text-[#c09b62] mb-6 group-hover:scale-110 transition-transform" />
              <h4 className="text-xl font-serif text-white mb-2">Thoughtful Design</h4>
              <div className="text-[#c09b62] text-xs uppercase tracking-[0.15em] font-sans mb-4">Live Well</div>
              <p className="text-zinc-500 font-sans leading-relaxed">
                True luxury is how a space works for you. Our architecture blends contemporary aesthetics with practical, intelligent floor plans that maximize natural light, space, and everyday functionality.
              </p>
            </div>
            <div className="bg-[#050505] p-8 rounded-2xl border border-zinc-900 hover:border-[#c09b62]/50 transition-colors group">
              <Heart className="w-10 h-10 text-[#c09b62] mb-6 group-hover:scale-110 transition-transform" />
              <h4 className="text-xl font-serif text-white mb-2">Living Well</h4>
              <div className="text-[#c09b62] text-xs uppercase tracking-[0.15em] font-sans mb-4">Be Well</div>
              <p className="text-zinc-500 font-sans leading-relaxed">
                We create more than structures; we build environments in premium, secure locations that provide a profound sense of home, well-being, and a higher standard of living.
              </p>
            </div>
            <div className="bg-[#050505] p-8 rounded-2xl border border-zinc-900 hover:border-[#c09b62]/50 transition-colors group">
              <Handshake className="w-10 h-10 text-[#c09b62] mb-6 group-hover:scale-110 transition-transform" />
              <h4 className="text-xl font-serif text-white mb-2">Trust &amp; Transparency</h4>
              <div className="text-[#c09b62] text-xs uppercase tracking-[0.15em] font-sans mb-4">Growing Together</div>
              <p className="text-zinc-500 font-sans leading-relaxed">
                We believe in building lasting partnerships with our clients, operating with absolute reliability, clear communication, and a shared vision for growing together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <blockquote className="text-2xl md:text-3xl font-serif text-[#c09b62] italic leading-relaxed">
            &ldquo;We don&apos;t just build structures; we create communities that elevate the standard of living and turn visions into reality.&rdquo;
          </blockquote>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative bg-zinc-950 border-t border-zinc-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-serif mb-6">{ctaTitle}</h2>
          <p className="text-zinc-400 font-sans mb-10 text-lg">
            {ctaSubtitle}
          </p>
          <AboutCTA />
        </div>
      </section>

      {/* ----------------- FOOTER ----------------- */}
      <footer className="relative w-full pt-20 md:pt-32 pb-8 md:pb-12 bg-[#050505] border-t border-white/5 overflow-hidden">
        <div className="absolute inset-0 w-full h-full z-0 opacity-30 mix-blend-screen">
          <img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/hero-bg.png`} alt="Footer Skyline" className="w-full h-full object-cover object-bottom" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-[#050505]" />
        </div>

        <div className="relative z-10 px-6 md:px-12 lg:px-24">
          <div className="grid grid-cols-2 md:grid-cols-12 gap-8 md:gap-12 text-gray-300 text-[10px] font-sans tracking-widest uppercase border-t border-white/10 pt-12 md:pt-16">
            <div className="col-span-2 md:col-span-4 flex flex-col gap-6">
              <div className="flex items-center h-16 overflow-visible">
                <img src="/main-logo.png" alt="BeWell Real Estate Logo" className="h-full w-auto object-contain drop-shadow-md flex-shrink-0 scale-[1.5] origin-left" />
              </div>
              <p className="max-w-xs leading-relaxed text-[#f5eedf] normal-case tracking-wide">
                B Well Real Estate is redefining urban living in Ethiopia through visionary architecture and uncompromising quality.
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
              <span className="text-[#f5eedf]">Addis Ababa, Ethiopia</span>
            </div>

            <div className="col-span-1 md:col-span-2 flex flex-col gap-4">
              <span className="text-white mb-2 font-serif text-xs">Contact</span>
              <a href="mailto:info@bewell.com" className="hover:text-[#c09b62] transition-colors lowercase tracking-widest text-[#f5eedf]">info@bewell.com</a>
              <span className="text-[#f5eedf]">+251 912 345 6789</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
