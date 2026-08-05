"use client";

import { useEffect, useState } from "react";
import { Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { getAuthHeader } from "../layout";

export default function AdminSiteContent() {
  const [content, setContent] = useState<any>(null);
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  useEffect(() => {
    async function fetchContent() {
      try {
        const res = await fetch("http://localhost:3001/site-content");
        if (res.ok) {
          const data = await res.json();
          setContent(data);
        }
      } catch (error) {
        console.error("Failed to fetch site content", error);
      }
    }
    fetchContent();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');
    try {
      await fetch("http://localhost:3001/site-content", {
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
