import React, { memo } from "react";
import Link from "next/link";
import { LayoutDashboard, Users, Target, Calendar, MessageSquare } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const BottomNav = memo(() => {
  const pathname = usePathname();
  const { canAccessRoute } = useAuth();

  return (
    <nav className="mobile-bottom-nav">
      {canAccessRoute("/") && (
        <Link href="/" className={`b-nav-item ${pathname === "/" ? "active" : ""}`}>
          <LayoutDashboard size={22} />
          <span>Home</span>
        </Link>
      )}
      {canAccessRoute("/leads") && (
        <Link href="/leads" className={`b-nav-item ${pathname?.startsWith("/leads") ? "active" : ""}`}>
          <Users size={22} />
          <span>Leads</span>
        </Link>
      )}
      {canAccessRoute("/pipeline") && (
        <Link href="/pipeline" className={`b-nav-item ${pathname === "/pipeline" ? "active" : ""}`}>
          <Target size={22} />
          <span>Pipeline</span>
        </Link>
      )}
      {canAccessRoute("/follow-ups") && (
        <Link href="/follow-ups" className={`b-nav-item ${pathname === "/follow-ups" ? "active" : ""}`}>
          <Calendar size={22} />
          <span>Tasks</span>
        </Link>
      )}
      {canAccessRoute("/whatsapp") && (
        <Link href="/whatsapp" className={`b-nav-item ${pathname === "/whatsapp" ? "active" : ""}`}>
           <MessageSquare size={22} />
           <span>WhatsApp</span>
        </Link>
      )}
    </nav>
  );
});

BottomNav.displayName = "BottomNav";
export default BottomNav;
