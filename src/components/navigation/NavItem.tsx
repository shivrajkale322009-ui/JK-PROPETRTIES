import React, { memo } from "react";
import Link from "next/link";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  isActive: boolean;
  isCompact?: boolean;
  onClick?: () => void;
  badgeCount?: number;
}

const NavItem = memo(({ href, icon, title, isActive, isCompact, onClick, badgeCount }: NavItemProps) => {
  return (
    <Link 
      href={href}
      onClick={onClick}
      className={`sidebar-nav-item ${isActive ? "active" : ""} ${isCompact ? "compact-item" : ""}`}
      title={isCompact ? title : undefined}
    >
      <div className="nav-icon-wrapper">
        {icon}
      </div>
      {!isCompact && (
         <span className="nav-title">{title}</span>
      )}
      {badgeCount !== undefined && badgeCount > 0 && !isCompact && (
         <span className="nav-badge">{badgeCount}</span>
      )}
    </Link>
  );
});

NavItem.displayName = "NavItem";
export default NavItem;
