"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { Menu, X, Bell } from "lucide-react";
import { usePathname } from "next/navigation";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Close sidebar on pathname change (extra safety)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSidebarOpen]);

  return (
    <>
      <header className="mobile-header">
        <button className="menu-toggle" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        <div className="mobile-logo">
           <img src="/logo.png" alt="JK" style={{ width: 32, height: 32, borderRadius: 6, marginRight: 8 }} />
           <span className="brand-name">JK <span className="gold-text" style={{ fontSize: '0.7rem' }}>Properties</span></span>
        </div>
        <button className="menu-toggle">
          <Bell size={20} />
        </button>
      </header>

      <div 
        className={`sidebar-overlay ${isSidebarOpen ? "show" : ""}`} 
        onClick={() => setIsSidebarOpen(false)}
      />

      <div className="layout-wrapper">
        <div className={`sidebar-container ${isSidebarOpen ? "open" : ""}`}>
           <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        </div>
        <main className="main-content">
          {children}
        </main>
      </div>
    </>
  );
}
