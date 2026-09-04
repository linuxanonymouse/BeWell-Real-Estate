import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <Building2 className="w-16 h-16 text-[#c09b62] mx-auto mb-8 opacity-40" />
        <h1 className="text-8xl font-serif text-[#c09b62] mb-4">404</h1>
        <h2 className="text-2xl font-serif uppercase tracking-wider mb-4">Page Not Found</h2>
        <p className="text-zinc-500 font-sans mb-10 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Let us guide you back to where luxury awaits.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-3 bg-[#c09b62] text-black px-8 py-4 rounded-full font-sans uppercase tracking-widest text-sm hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      <footer className="absolute bottom-0 w-full py-8 text-center">
        <p className="text-zinc-700 text-[9px] uppercase tracking-[0.2em] font-sans">
          B Well Real Estate
        </p>
      </footer>
    </main>
  );
}
