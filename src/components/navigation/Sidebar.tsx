import React, { memo, useState } from "react";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Target, Calendar, Building2, UsersRound, BarChart3, Settings, LogOut, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import NavItem from "./NavItem";
import { useAuth } from "@/contexts/AuthContext";

const NAV_CONFIG = [
  {
    group: "SALES",
    items: [
      { id: "dashboard", title: "Dashboard", href: "/", icon: <LayoutDashboard size={20} /> },
      { id: "leads", title: "Leads", href: "/leads", icon: <Users size={20} />, badge: 3 },
      { id: "pipeline", title: "Pipeline", href: "/pipeline", icon: <Target size={20} /> },
      { id: "followups", title: "Follow-ups", href: "/follow-ups", icon: <Calendar size={20} />, badge: 5 },
      { id: "whatsapp", title: "WhatsApp", href: "/whatsapp", icon: <MessageSquare size={20} /> },
    ]
  },
  {
    group: "INVENTORY",
    items: [
      { id: "properties", title: "Properties", href: "/properties", icon: <Building2 size={20} /> }
    ]
  },
  {
    group: "MANAGEMENT",
    items: [
      { id: "team", title: "Team", href: "/team", icon: <UsersRound size={20} /> },
      { id: "reports", title: "Reports", href: "/reports", icon: <BarChart3 size={20} /> }
    ]
  },
  {
    group: "SYSTEM",
    items: [
      { id: "settings", title: "Settings", href: "/settings", icon: <Settings size={20} /> }
    ]
  }
];

const DesktopSidebar = memo(() => {
  const pathname = usePathname();
  const [isCompact, setIsCompact] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("sidebar_compact") === "true";
  });
  const { accessProfile, user, logout } = useAuth();

  const toggleCompact = () => {
    setIsCompact(prev => {
      localStorage.setItem("sidebar_compact", String(!prev));
      return !prev;
    });
  };

  return (
    <aside className={`desktop-sidebar ${isCompact ? "compact" : "expanded"}`}>
      <div className="sidebar-header">
         <div className="brand-logo" style={{background: 'transparent'}}>
           <img src="/logo.png" alt="JK" style={{width: 34, height: 34, borderRadius: 8, objectFit: 'contain'}} />
         </div>
         {!isCompact && (
           <div className="brand-name-group">
              <span className="b-name">JK Properties</span>
           </div>
         )}
         <button className="toggle-collapse-btn" onClick={toggleCompact}>
            {isCompact ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
         </button>
      </div>

      <nav className="sidebar-menu-scroll">
        {NAV_CONFIG.map((group, idx) => {
          const visibleItems = group.items.filter((item) => {
            if (!accessProfile) return false;
            return accessProfile.allowedRoutes.includes(item.href);
          });
          if (visibleItems.length === 0) return null;
          return (
          <div key={idx} className="nav-group">
            {!isCompact && <span className="nav-group-title">{group.group}</span>}
            <div className="nav-group-items">
              {visibleItems.map(item => (
                <NavItem 
                  key={item.id}
                  href={item.href}
                  icon={item.icon}
                  title={item.title}
                  isActive={item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href)}
                  isCompact={isCompact}
                  badgeCount={item.badge}
                />
              ))}
            </div>
          </div>
          );
        })}
      </nav>

      <div className="sidebar-footer-profile">
         <div className="s-profile-wrap">
            <div className="s-avatar">SK</div>
            {!isCompact && (
              <div className="s-profile-info">
                 <span className="s-name">{user?.displayName ?? "User"}</span>
                 <span className="s-role">{accessProfile?.role ?? "No Role"}</span>
              </div>
            )}
            <button className="s-logout" title="Logout" onClick={logout}><LogOut size={18} /></button>
         </div>
      </div>
    </aside>
  );
});

DesktopSidebar.displayName = "DesktopSidebar";
export default DesktopSidebar;
