"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, Target, Calendar,
  Building2, BarChart3, Settings, LogOut, Plus, X, Menu, MessageSquare
} from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onMenuToggle?: () => void;
}

const menuItems = [
  { title: "Dashboard",  icon: <LayoutDashboard size={20} />, href: "/" },
  { title: "All Leads",  icon: <Users size={20} />,          href: "/leads" },
  { title: "Pipeline",   icon: <Target size={20} />,         href: "/pipeline" },
  { title: "Follow-ups", icon: <Calendar size={20} />,       href: "/follow-ups" },
  { title: "Properties", icon: <Building2 size={20} />,      href: "/properties" },
  { title: "Reports",    icon: <BarChart3 size={20} />,      href: "/reports" },
];

const Sidebar = ({ isOpen, onClose, onMenuToggle }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleAddLead = () => {
    onClose?.();
    router.push("/leads/add");
  };

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      {/* Drawer Header */}
      <div className="sidebar-logo">
        <div className="logo-group">
          <img src="/logo.png" alt="JK" className="logo-img" />
          <div className="brand-info">
            <span className="brand-name">JK Properties</span>
            <span className="gold-text">Premium CRM</span>
          </div>
        </div>
        <button className="mobile-close-btn" onClick={onClose} aria-label="Close menu">
          <X size={22} />
        </button>
      </div>

      {/* Quick Add Lead CTA */}
      <div className="sidebar-action">
        <button className="add-lead-sidebar-btn" onClick={handleAddLead}>
          <Plus size={18} />
          <span>Add New Lead</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${isActive ? "active" : ""}`}
              onClick={onClose}
            >
              {item.icon}
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="user-profile">
          <img src="/logo.png" alt="Profile" className="profile-pic" />
          <div className="user-info">
            <p className="user-name">Shivraj Kale</p>
            <p className="user-role">Administrator</p>
          </div>
        </div>
        <Link href="/settings" className="nav-link footer-link" onClick={onClose}>
          <Settings size={20} />
          <span>Settings</span>
        </Link>
        <button className="logout-btn">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
