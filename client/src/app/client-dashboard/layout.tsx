"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";

export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (!token || !userStr) {
      router.push("/auth/login");
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (user.role !== "client") {
        router.push("/admin");
        return;
      }

      // Check telegram link
      if (!user.telegramLinked && pathname !== "/client-dashboard/link") {
        router.push("/client-dashboard/link");
        return;
      }
      
      // If linked but trying to go to link page, go to dashboard
      if (user.telegramLinked && pathname === "/client-dashboard/link") {
        router.push("/client-dashboard");
        return;
      }

      setIsAuthenticated(true);
    } catch (err) {
      router.push("/auth/login");
    }
  }, [router, pathname]);

  if (!isAuthenticated) return <div className="min-h-screen bg-[#050505]" />;

  return (
    <>
      <Navbar onScheduleClick={() => {}} />
      <div className="min-h-screen bg-[#050505] text-white">
        {children}
      </div>
    </>
  );
}
