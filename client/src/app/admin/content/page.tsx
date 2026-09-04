"use client";

import { useEffect, useState } from "react";
import { Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { getAuthHeader } from "../layout";

export default function AdminSiteContent() {
  const [content, setContent] = useState<any>(null);
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

    const defaultContent = {
    hero: { titleLine1: "Building", titleLine2: "Beyond", titleHighlight: "Imagination", subtitle: "We don't just build buildings, we build legacies." },
    projectsSection: { titleLine1: "Iconic Projects", titleLine2: "That Define", titleHighlight: "Tomorrow", subtitle: "Explore our signature projects across prime locations." },
    certifications: { titleLine1: "Trusted By", titleLine2: "Those Who", titleHighlight: "Know Excellence", subtitle: "Our commitment to quality and timely delivery has earned us the trust of industry leaders.", quote: "\"Their dedication, professionalism, and exceptional execution have made them our most trusted development partner.\"", quoteAuthor: "CEO, MVP Developers" },
    footer: { titleLine1: "Let's Build", titleLine2: "The Future", titleHighlight: "Together", description: "Building more than structures, we build trust, relationships, and a better tomorrow.", email: "info@bewell.com", phone: "+251 912 345 6789", location: "Addis Ababa" },
    about: { vision: "Our vision is to transform the skyline while respecting the rich cultural heritage of our surroundings.", story: "Founded on the principles of excellence and innovation, B Well Real Estate has established itself as the premier developer of luxury properties in Addis Ababa." }
  };

  useEffect(() => {
    async function fetchContent() {
      try {
        const res = await fetch("/api/site-content", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setContent({
            ...defaultContent,
            ...data,
            hero: { ...defaultContent.hero, ...(data?.hero || {}) },
            projectsSection: { ...defaultContent.projectsSection, ...(data?.projectsSection || {}) },
            certifications: { ...defaultContent.certifications, ...(data?.certifications || {}) },
            footer: { ...defaultContent.footer, ...(data?.footer || {}) },
            about: { ...defaultContent.about, ...(data?.about || {}) },
          });
        } else {
          setContent(defaultContent);
        }
      } catch (error) {
        console.error("Failed to fetch site content", error);
        setContent(defaultContent);
      }
    }
    fetchContent();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');
    try {
      await fetch("/api/site-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify(content),
      });
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      console.error("Failed to save content", error);
      setStatus('error');
    }
  };

  const handleChange = (section: string, field: string, value: string) => {
    setContent((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  if (!content) {
    return <div className="text-zinc-500">Loading content...</div>;
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-white uppercase tracking-widest mb-2">Site Content</h1>
          <p className="text-zinc-500 font-sans tracking-widest uppercase text-[10px]">Manage Global Website Copy</p>
        </div>
      </div>

      <div className="bg-[#050505] border border-zinc-900 rounded-2xl p-8 max-w-4xl">
        <form onSubmit={handleSave} className="flex flex-col gap-12">
          
          {/* Hero Section */}
          <div className="flex flex-col gap-6">
            <h2 className="text-[#c09b62] text-sm uppercase tracking-widest font-sans pb-2 border-b border-zinc-900">Hero Section</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-sans">Title Line 1</label>
                <input required value={content.hero.titleLine1} onChange={e => handleChange('hero', 'titleLine1', e.target.value)}
                  className="bg-black border border-zinc-900 rounded-xl px-4 py-3 text-sm text-white focus:border-[#c09b62]/50 outline-none transition-all font-sans" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-sans">Title Line 2</label>
                <input required value={content.hero.titleLine2} onChange={e => handleChange('hero', 'titleLine2', e.target.value)}
                  className="bg-black border border-zinc-900 rounded-xl px-4 py-3 text-sm text-white focus:border-[#c09b62]/50 outline-none transition-all font-sans" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-sans">Title Highlight (Italic)</label>
                <input required value={content.hero.titleHighlight} onChange={e => handleChange('hero', 'titleHighlight', e.target.value)}
                  className="bg-black border border-zinc-900 rounded-xl px-4 py-3 text-sm text-[#c09b62] focus:border-[#c09b62]/50 outline-none transition-all font-sans" />
              </div>
              <div className="col-span-2 flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-sans">Subtitle</label>
                <textarea required value={content.hero.subtitle} onChange={e => handleChange('hero', 'subtitle', e.target.value)}
                  className="bg-black border border-zinc-900 rounded-xl px-4 py-3 text-sm text-white focus:border-[#c09b62]/50 outline-none transition-all font-sans min-h-[80px]" />
              </div>
            </div>
          </div>

          {/* Projects Section */}
          <div className="flex flex-col gap-6">
            <h2 className="text-[#c09b62] text-sm uppercase tracking-widest font-sans pb-2 border-b border-zinc-900">Projects Section</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-sans">Title Line 1</label>
                <input required value={content.projectsSection.titleLine1} onChange={e => handleChange('projectsSection', 'titleLine1', e.target.value)}
                  className="bg-black border border-zinc-900 rounded-xl px-4 py-3 text-sm text-white focus:border-[#c09b62]/50 outline-none transition-all font-sans" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-sans">Title Line 2</label>
                <input required value={content.projectsSection.titleLine2} onChange={e => handleChange('projectsSection', 'titleLine2', e.target.value)}
                  className="bg-black border border-zinc-900 rounded-xl px-4 py-3 text-sm text-white focus:border-[#c09b62]/50 outline-none transition-all font-sans" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-sans">Title Highlight (Italic)</label>
                <input required value={content.projectsSection.titleHighlight} onChange={e => handleChange('projectsSection', 'titleHighlight', e.target.value)}
                  className="bg-black border border-zinc-900 rounded-xl px-4 py-3 text-sm text-[#c09b62] focus:border-[#c09b62]/50 outline-none transition-all font-sans" />
              </div>
              <div className="col-span-2 flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-sans">Subtitle</label>
                <textarea required value={content.projectsSection.subtitle} onChange={e => handleChange('projectsSection', 'subtitle', e.target.value)}
                  className="bg-black border border-zinc-900 rounded-xl px-4 py-3 text-sm text-white focus:border-[#c09b62]/50 outline-none transition-all font-sans min-h-[80px]" />
              </div>
            </div>
          </div>

          {/* Certifications Section */}
          <div className="flex flex-col gap-6">
            <h2 className="text-[#c09b62] text-sm uppercase tracking-widest font-sans pb-2 border-b border-zinc-900">Certifications Section</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-sans">Title Line 1</label>
                <input required value={content.certifications.titleLine1} onChange={e => handleChange('certifications', 'titleLine1', e.target.value)}
                  className="bg-black border border-zinc-900 rounded-xl px-4 py-3 text-sm text-white focus:border-[#c09b62]/50 outline-none transition-all font-sans" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-sans">Title Line 2</label>
                <input required value={content.certifications.titleLine2} onChange={e => handleChange('certifications', 'titleLine2', e.target.value)}
                  className="bg-black border border-zinc-900 rounded-xl px-4 py-3 text-sm text-white focus:border-[#c09b62]/50 outline-none transition-all font-sans" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-sans">Title Highlight (Italic)</label>
                <input required value={content.certifications.titleHighlight} onChange={e => handleChange('certifications', 'titleHighlight', e.target.value)}
                  className="bg-black border border-zinc-900 rounded-xl px-4 py-3 text-sm text-[#c09b62] focus:border-[#c09b62]/50 outline-none transition-all font-sans" />
              </div>
              <div className="col-span-2 flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-sans">Subtitle</label>
                <textarea required value={content.certifications.subtitle} onChange={e => handleChange('certifications', 'subtitle', e.target.value)}
                  className="bg-black border border-zinc-900 rounded-xl px-4 py-3 text-sm text-white focus:border-[#c09b62]/50 outline-none transition-all font-sans min-h-[80px]" />
              </div>
              <div className="col-span-2 flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-sans">Testimonial Quote</label>
                <textarea required value={content.certifications.quote} onChange={e => handleChange('certifications', 'quote', e.target.value)}
                  className="bg-black border border-zinc-900 rounded-xl px-4 py-3 text-sm text-white focus:border-[#c09b62]/50 outline-none transition-all font-sans min-h-[80px]" />
              </div>
              <div className="col-span-2 flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-sans">Quote Author</label>
                <input required value={content.certifications.quoteAuthor} onChange={e => handleChange('certifications', 'quoteAuthor', e.target.value)}
                  className="bg-black border border-zinc-900 rounded-xl px-4 py-3 text-sm text-white focus:border-[#c09b62]/50 outline-none transition-all font-sans" />
              </div>
            </div>
          </div>

          {/* Footer Section */}
          <div className="flex flex-col gap-6">
            <h2 className="text-[#c09b62] text-sm uppercase tracking-widest font-sans pb-2 border-b border-zinc-900">Footer Section</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-sans">Title Line 1</label>
                <input required value={content.footer.titleLine1} onChange={e => handleChange('footer', 'titleLine1', e.target.value)}
                  className="bg-black border border-zinc-900 rounded-xl px-4 py-3 text-sm text-white focus:border-[#c09b62]/50 outline-none transition-all font-sans" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-sans">Title Line 2</label>
                <input required value={content.footer.titleLine2} onChange={e => handleChange('footer', 'titleLine2', e.target.value)}
                  className="bg-black border border-zinc-900 rounded-xl px-4 py-3 text-sm text-white focus:border-[#c09b62]/50 outline-none transition-all font-sans" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-sans">Title Highlight (Italic)</label>
                <input required value={content.footer.titleHighlight} onChange={e => handleChange('footer', 'titleHighlight', e.target.value)}
                  className="bg-black border border-zinc-900 rounded-xl px-4 py-3 text-sm text-[#c09b62] focus:border-[#c09b62]/50 outline-none transition-all font-sans" />
              </div>
              <div className="col-span-2 flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-sans">Description</label>
                <textarea required value={content.footer.description} onChange={e => handleChange('footer', 'description', e.target.value)}
                  className="bg-black border border-zinc-900 rounded-xl px-4 py-3 text-sm text-white focus:border-[#c09b62]/50 outline-none transition-all font-sans min-h-[80px]" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-sans">Contact Email</label>
                <input required type="email" value={content.footer.email} onChange={e => handleChange('footer', 'email', e.target.value)}
                  className="bg-black border border-zinc-900 rounded-xl px-4 py-3 text-sm text-white focus:border-[#c09b62]/50 outline-none transition-all font-sans" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-sans">Contact Phone</label>
                <input required value={content.footer.phone} onChange={e => handleChange('footer', 'phone', e.target.value)}
                  className="bg-black border border-zinc-900 rounded-xl px-4 py-3 text-sm text-white focus:border-[#c09b62]/50 outline-none transition-all font-sans" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-sans">Location</label>
                <input required value={content.footer.location} onChange={e => handleChange('footer', 'location', e.target.value)}
                  className="bg-black border border-zinc-900 rounded-xl px-4 py-3 text-sm text-white focus:border-[#c09b62]/50 outline-none transition-all font-sans" />
              </div>
            </div>
          </div>
          
          {/* About Page */}
          <div className="flex flex-col gap-6">
            <h2 className="text-[#c09b62] text-sm uppercase tracking-widest font-sans pb-2 border-b border-zinc-900">About Page — Hero</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-sans">Hero Title (Gold Word)</label>
                <input value={content.about.heroHighlight || ''} onChange={e => handleChange('about', 'heroHighlight', e.target.value)}
                  placeholder="e.g. Legacy"
                  className="bg-black border border-zinc-900 rounded-xl px-4 py-3 text-sm text-[#c09b62] focus:border-[#c09b62]/50 outline-none transition-all font-sans" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-sans">Hero Title (Rest)</label>
                <input value={content.about.heroTitle || ''} onChange={e => handleChange('about', 'heroTitle', e.target.value)}
                  placeholder="e.g. Beyond Imagination"
                  className="bg-black border border-zinc-900 rounded-xl px-4 py-3 text-sm text-white focus:border-[#c09b62]/50 outline-none transition-all font-sans" />
              </div>
              <div className="col-span-2 flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-sans">Hero Subtitle</label>
                <textarea value={content.about.heroSubtitle || ''} onChange={e => handleChange('about', 'heroSubtitle', e.target.value)}
                  placeholder="e.g. B Well Real Estate is redefining luxury living..."
                  className="bg-black border border-zinc-900 rounded-xl px-4 py-3 text-sm text-white focus:border-[#c09b62]/50 outline-none transition-all font-sans min-h-[80px]" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <h2 className="text-[#c09b62] text-sm uppercase tracking-widest font-sans pb-2 border-b border-zinc-900">About Page — Our Story</h2>
            <div className="grid grid-cols-1 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-sans">Section Heading</label>
                <input value={content.about.storySectionTitle || ''} onChange={e => handleChange('about', 'storySectionTitle', e.target.value)}
                  placeholder="e.g. Shaping the Future of Urban Living"
                  className="bg-black border border-zinc-900 rounded-xl px-4 py-3 text-sm text-white focus:border-[#c09b62]/50 outline-none transition-all font-sans" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-sans">Our Story</label>
                <textarea value={content.about.story || ''} onChange={e => handleChange('about', 'story', e.target.value)}
                  className="bg-black border border-zinc-900 rounded-xl px-4 py-3 text-sm text-white focus:border-[#c09b62]/50 outline-none transition-all font-sans min-h-[120px]" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-sans">Middle Paragraph</label>
                <textarea value={content.about.storyMiddle || ''} onChange={e => handleChange('about', 'storyMiddle', e.target.value)}
                  placeholder="e.g. We don't just build structures; we create communities..."
                  className="bg-black border border-zinc-900 rounded-xl px-4 py-3 text-sm text-white focus:border-[#c09b62]/50 outline-none transition-all font-sans min-h-[100px]" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-sans">Our Vision</label>
                <textarea value={content.about.vision || ''} onChange={e => handleChange('about', 'vision', e.target.value)}
                  className="bg-black border border-zinc-900 rounded-xl px-4 py-3 text-sm text-white focus:border-[#c09b62]/50 outline-none transition-all font-sans min-h-[120px]" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <h2 className="text-[#c09b62] text-sm uppercase tracking-widest font-sans pb-2 border-b border-zinc-900">About Page — Stats &amp; Values</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-sans">Stat Number (e.g. 15+)</label>
                <input value={content.about.statNumber || ''} onChange={e => handleChange('about', 'statNumber', e.target.value)}
                  className="bg-black border border-zinc-900 rounded-xl px-4 py-3 text-sm text-white focus:border-[#c09b62]/50 outline-none transition-all font-sans" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-sans">Stat Label</label>
                <input value={content.about.statLabel || ''} onChange={e => handleChange('about', 'statLabel', e.target.value)}
                  placeholder="e.g. Years of Excellence"
                  className="bg-black border border-zinc-900 rounded-xl px-4 py-3 text-sm text-white focus:border-[#c09b62]/50 outline-none transition-all font-sans" />
              </div>
            </div>
            <p className="text-zinc-600 text-[10px] uppercase tracking-widest font-sans mt-2">Core Value 1</p>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-sans">Title</label>
                <input value={content.about.value1Title || ''} onChange={e => handleChange('about', 'value1Title', e.target.value)}
                  placeholder="e.g. Uncompromising Quality"
                  className="bg-black border border-zinc-900 rounded-xl px-4 py-3 text-sm text-white focus:border-[#c09b62]/50 outline-none transition-all font-sans" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-sans">Description</label>
                <input value={content.about.value1Desc || ''} onChange={e => handleChange('about', 'value1Desc', e.target.value)}
                  className="bg-black border border-zinc-900 rounded-xl px-4 py-3 text-sm text-white focus:border-[#c09b62]/50 outline-none transition-all font-sans" />
              </div>
            </div>
            <p className="text-zinc-600 text-[10px] uppercase tracking-widest font-sans">Core Value 2</p>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-sans">Title</label>
                <input value={content.about.value2Title || ''} onChange={e => handleChange('about', 'value2Title', e.target.value)}
                  placeholder="e.g. Visionary Architecture"
                  className="bg-black border border-zinc-900 rounded-xl px-4 py-3 text-sm text-white focus:border-[#c09b62]/50 outline-none transition-all font-sans" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-sans">Description</label>
                <input value={content.about.value2Desc || ''} onChange={e => handleChange('about', 'value2Desc', e.target.value)}
                  className="bg-black border border-zinc-900 rounded-xl px-4 py-3 text-sm text-white focus:border-[#c09b62]/50 outline-none transition-all font-sans" />
              </div>
            </div>
            <p className="text-zinc-600 text-[10px] uppercase tracking-widest font-sans">Core Value 3</p>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-sans">Title</label>
                <input value={content.about.value3Title || ''} onChange={e => handleChange('about', 'value3Title', e.target.value)}
                  placeholder="e.g. Client-Centric Approach"
                  className="bg-black border border-zinc-900 rounded-xl px-4 py-3 text-sm text-white focus:border-[#c09b62]/50 outline-none transition-all font-sans" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-sans">Description</label>
                <input value={content.about.value3Desc || ''} onChange={e => handleChange('about', 'value3Desc', e.target.value)}
                  className="bg-black border border-zinc-900 rounded-xl px-4 py-3 text-sm text-white focus:border-[#c09b62]/50 outline-none transition-all font-sans" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <h2 className="text-[#c09b62] text-sm uppercase tracking-widest font-sans pb-2 border-b border-zinc-900">About Page — Call To Action</h2>
            <div className="grid grid-cols-1 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-sans">CTA Title</label>
                <input value={content.about.ctaTitle || ''} onChange={e => handleChange('about', 'ctaTitle', e.target.value)}
                  placeholder="e.g. Ready to Experience Luxury?"
                  className="bg-black border border-zinc-900 rounded-xl px-4 py-3 text-sm text-white focus:border-[#c09b62]/50 outline-none transition-all font-sans" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-sans">CTA Subtitle</label>
                <textarea value={content.about.ctaSubtitle || ''} onChange={e => handleChange('about', 'ctaSubtitle', e.target.value)}
                  placeholder="e.g. Connect with our team to discover our portfolio..."
                  className="bg-black border border-zinc-900 rounded-xl px-4 py-3 text-sm text-white focus:border-[#c09b62]/50 outline-none transition-all font-sans min-h-[80px]" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t border-zinc-900 pt-6">
            <button 
              type="submit" 
              disabled={status === 'saving'}
              className="bg-gradient-to-r from-[#c09b62] to-[#dfc499] hover:from-[#dfc499] hover:to-[#f0d5a8] text-black rounded-xl px-8 py-3 text-sm font-medium tracking-wider uppercase transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {status === 'saving' ? 'Saving...' : 'Save All Changes'}
            </button>

            {status === 'success' && (
              <div className="flex items-center gap-2 text-green-500 text-sm font-sans">
                <CheckCircle2 className="w-4 h-4" />
                Settings saved successfully
              </div>
            )}
            
            {status === 'error' && (
              <div className="flex items-center gap-2 text-red-500 text-sm font-sans">
                <AlertCircle className="w-4 h-4" />
                Failed to save settings
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
