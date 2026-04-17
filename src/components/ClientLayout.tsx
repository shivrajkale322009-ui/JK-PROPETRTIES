"use client";

import { useState, useEffect } from "react";
import DesktopSidebar from "@/components/navigation/Sidebar";
import MobileDrawer from "@/components/navigation/MobileDrawer";
import BottomNav from "@/components/navigation/BottomNav";
import { MessageSquare } from "lucide-react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const pathname = usePathname();

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = isDrawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isDrawerOpen]);

  // Listen for hamburger toggle from page-level app-bars
  useEffect(() => {
    const handler = () => setIsDrawerOpen(prev => !prev);
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
    <div className="crm-layout-wrapper">
      {/* Desktop / Tablet Sidebar (Hidden on Mobile automatically via CSS) */}
      <DesktopSidebar />

      {/* Mobile Drawer (Only mounts when visible & hidden via CSS on Desktop) */}
      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      {/* Page Content */}
      <main className="app-main content-wrapper">
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
      <BottomNav />
    </div>
  );
}
