import React, { memo } from "react";
import Link from "next/link";
import { LayoutDashboard, Users, Target, Calendar, MessageSquare, MoreHorizontal } from "lucide-react";
import { usePathname } from "next/navigation";

const BottomNav = memo(() => {
  const pathname = usePathname();

  return (
    <nav className="mobile-bottom-nav">
      <Link href="/" className={`b-nav-item ${pathname === "/" ? "active" : ""}`}>
        <LayoutDashboard size={22} />
        <span>Home</span>
      </Link>
      <Link href="/leads" className={`b-nav-item ${pathname?.startsWith("/leads") ? "active" : ""}`}>
        <Users size={22} />
        <span>Leads</span>
      </Link>
      <Link href="/pipeline" className={`b-nav-item ${pathname === "/pipeline" ? "active" : ""}`}>
        <Target size={22} />
        <span>Pipeline</span>
      </Link>
      <Link href="/follow-ups" className={`b-nav-item ${pathname === "/follow-ups" ? "active" : ""}`}>
        <Calendar size={22} />
        <span>Tasks</span>
      </Link>
      <button className="b-nav-item" onClick={() => window.open("https://wa.me/", "_blank")}>
         <MessageSquare size={22} />
         <span>WhatsApp</span>
      </button>
    </nav>
  );
});

BottomNav.displayName = "BottomNav";
export default BottomNav;
