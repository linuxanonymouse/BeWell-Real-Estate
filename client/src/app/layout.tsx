import type { Metadata } from "next";
import { Montserrat, Cormorant_Garamond, Inter } from "next/font/google";
import SmoothScroll from "@/components/layout/SmoothScroll";
import LoadingScreen from "@/components/layout/LoadingScreen";
import AIChatWidget from "@/components/chat/AIChatWidget";
import "./globals.css";


const montserrat = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Be Well Real Estate | Cinematic Luxury",
  description: "Award-Winning Cinematic Real Estate Experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${inter.variable} ${cormorant.variable} h-full antialiased dark bg-[#050505] text-white`}
    >
      <body className="min-h-full flex flex-col font-sans overflow-x-hidden selection:bg-[#c09b62]/30 selection:text-[#fff0d4]">
        <SmoothScroll>
          {children}
        </SmoothScroll>
        <AIChatWidget />
      </body>
    </html>
  );
}
