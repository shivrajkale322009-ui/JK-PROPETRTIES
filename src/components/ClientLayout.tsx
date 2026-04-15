"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import {
  LayoutDashboard, Users, Target, Calendar, MessageSquare,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on route change
  useEffect(() => { setIsSidebarOpen(false); }, [pathname]);

  // Lock body scroll when sidebar open
  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isSidebarOpen]);

  // Listen for hamburger toggle from page-level app-bars
  useEffect(() => {
    const handler = () => setIsSidebarOpen(prev => !prev);
    window.addEventListener("toggle-sidebar", handler);
    return () => window.removeEventListener("toggle-sidebar", handler);
  }, []);

  // Register service worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  if (pathname === '/login') {
    return <main className="app-main login-main">{children}</main>;
  }

  return (
    <>
      {/* Navigation Drawer Overlay */}
      <div
        className={`sidebar-overlay ${isSidebarOpen ? "show" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Navigation Drawer */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onMenuToggle={() => setIsSidebarOpen(true)}
      />

      {/* Page Content — each page manages its own app-bar */}
      <main className="app-main">
        {children}
      </main>

      {/* Global WhatsApp Floating Button (mobile only) */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        className="whatsapp-fab"
        onClick={() => window.open("https://wa.me/919999999999", "_blank")}
        aria-label="Open WhatsApp"
      >
        <MessageSquare size={22} />
      </motion.button>

      {/* Android-style Bottom Navigation (mobile only) */}
      <nav className="bottom-nav">
        <Link href="/" className={`bottom-nav-link ${pathname === "/" ? "active" : ""}`}>
          <LayoutDashboard size={22} />
          <span>Home</span>
        </Link>
        <Link href="/leads" className={`bottom-nav-link ${pathname?.startsWith("/leads") ? "active" : ""}`}>
          <Users size={22} />
          <span>Leads</span>
        </Link>
        <Link href="/pipeline" className={`bottom-nav-link ${pathname === "/pipeline" ? "active" : ""}`}>
          <Target size={22} />
          <span>Pipeline</span>
        </Link>
        <Link href="/follow-ups" className={`bottom-nav-link ${pathname === "/follow-ups" ? "active" : ""}`}>
          <Calendar size={22} />
          <span>Tasks</span>
        </Link>
      </nav>
    </>
  );
}
