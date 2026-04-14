"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Target, 
  Calendar, 
  Building2, 
  BarChart3, 
  Settings, 
  LogOut,
  Plus,
  X
} from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const pathname = usePathname();

  const menuItems = [
    { title: "Dashboard", icon: <LayoutDashboard size={20} />, href: "/" },
    { title: "All Leads", icon: <Users size={20} />, href: "/leads" },
    { title: "Pipeline", icon: <Target size={20} />, href: "/pipeline" },
    { title: "Follow-ups", icon: <Calendar size={20} />, href: "/follow-ups" },
    { title: "Properties", icon: <Building2 size={20} />, href: "/properties" },
    { title: "Reports", icon: <BarChart3 size={20} />, href: "/reports" },
  ];

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-logo">
        <div className="logo-group">
          <img src="/logo.png" alt="JK Logo" className="logo-img" />
          <div className="brand-info">
            <span className="brand-name">JK <span className="gold-text">Properties</span></span>
          </div>
        </div>
        <button className="mobile-close-btn" onClick={onClose} aria-label="Close menu">
          <X size={24} />
        </button>
      </div>

      <div className="sidebar-action">
        <button className="add-lead-sidebar-btn">
          <Plus size={20} />
          <span>Add New Lead</span>
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link 
            key={item.href} 
            href={item.href}
            className={`nav-link ${pathname === item.href ? "active" : ""}`}
            onClick={onClose}
          >
            {item.icon}
            <span>{item.title}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <img src="/logo.png" alt="Profile" className="profile-pic" />
          <div className="user-info">
            <p className="user-name">Shivraj Kale</p>
            <p className="user-role">Administrator</p>
          </div>
        </div>
        <Link href="/settings" className="nav-link footer-link">
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
