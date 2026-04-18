import React, { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Target, Calendar, Building2, UsersRound, BarChart3, Settings, LogOut, X, MessageSquare } from "lucide-react";
import NavItem from "./NavItem";
import { useAuth } from "@/contexts/AuthContext";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

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

const drawerVariants = {
  hidden: { x: "-100%" },
  visible: { x: 0, transition: { type: "tween", duration: 0.25 } },
  exit: { x: "-100%", transition: { type: "tween", duration: 0.2 } }
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

const MobileDrawer = memo(({ isOpen, onClose }: MobileDrawerProps) => {
  const pathname = usePathname();
  const { accessProfile, user, logout } = useAuth();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            className="drawer-overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />
          <motion.aside 
            className="mobile-drawer"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragEnd={(e, { offset, velocity }) => {
              if (offset.x < -100 || velocity.x < -500) {
                onClose();
              }
            }}
          >
            <div className="drawer-header">
               <div className="brand-logo" style={{background: 'transparent'}}>
                 <img src="/logo.png" alt="JK" style={{width: 34, height: 34, borderRadius: 8, objectFit: 'contain'}} />
               </div>
               <span className="b-name">JK Properties</span>
               <button className="icon-btn-transparent" onClick={onClose} style={{color: 'var(--text-main)', marginLeft: 'auto'}}>
                 <X size={20} />
               </button>
            </div>

            <nav className="drawer-menu-scroll">
              {NAV_CONFIG.map((group, idx) => {
                const visibleItems = group.items.filter((item) =>
                  accessProfile ? accessProfile.allowedRoutes.includes(item.href) : false,
                );
                if (visibleItems.length === 0) return null;
                return (
                  <div key={idx} className="nav-group">
                    <span className="nav-group-title">{group.group}</span>
                    <div className="nav-group-items">
                      {visibleItems.map(item => (
                        <NavItem 
                          key={item.id}
                          href={item.href}
                          icon={item.icon}
                          title={item.title}
                          isActive={item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href)}
                          onClick={onClose}
                          badgeCount={item.badge}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </nav>

            <div className="drawer-footer-profile">
               <div className="s-profile-wrap">
                  <div className="s-avatar">SK</div>
                  <div className="s-profile-info">
                     <span className="s-name">{user?.displayName ?? "User"}</span>
                     <span className="s-role">{accessProfile?.role ?? "No Role"}</span>
                  </div>
                  <button className="s-logout" onClick={logout}><LogOut size={18} /></button>
               </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
});

MobileDrawer.displayName = "MobileDrawer";
export default MobileDrawer;
