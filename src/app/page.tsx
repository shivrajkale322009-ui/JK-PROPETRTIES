"use client";

export const dynamic = "force-dynamic";

import { 
  Users, 
  MessageSquare, 
  Clock, 
  MapPin, 
  CheckCircle2,
  Plus,
  ArrowRight,
  TrendingUp,
  PhoneCall,
  Menu
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Dashboard() {
  const metrics = [
    { title: "Today's Leads", value: "24", icon: <Users size={20} />, trend: "+4 from yesterday" },
    { title: "WhatsApp", value: "12", icon: <MessageSquare size={20} />, trend: "8 unread inquiries" },
    { title: "Follow-ups", value: "8", icon: <Clock size={20} />, trend: "3 overdue tasks" },
    { title: "Site Visits", value: "6", icon: <MapPin size={20} />, trend: "Scheduled for today" },
    { title: "Closed Deals", value: "14", icon: <CheckCircle2 size={20} />, trend: "This month's success" },
  ];

  const recentLeads = [
    { name: "Sanjay Raut", budget: "₹85L - 1.2Cr", location: "Baner, Pune", status: "Hot", time: "10m ago" },
    { name: "Meera Nair", budget: "₹45L - 60L", location: "Hinjewadi", status: "Warm", time: "45m ago" },
    { name: "Vikram Rathore", budget: "₹2.5Cr+", location: "Koregaon Park", status: "Visit Scheduled", time: "2h ago" },
  ];

  return (
    <div className="mobile-view">
      {/* Native-style Sticky Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="app-bar"
      >
        <div className="app-bar-content">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="hamburger-btn" id="sidebar-toggle" onClick={() => {
              const event = new CustomEvent("toggle-sidebar");
              window.dispatchEvent(event);
            }}>
              <Menu size={24} />
            </button>
            <div>
              <h1 className="native-title">Dashboard</h1>
              <p className="native-subtitle">JK Properties CRM</p>
            </div>
          </div>
          <button className="icon-btn-gold ripple">
             <Plus size={22} />
          </button>
        </div>
      </motion.div>

      <div className="content-area">
        {/* Horizontal scroll for metrics if needed, or grid for mobile */}
        <section className="metrics-section">
          <div className="native-section-header">
            <h3>Overview</h3>
            <span>Today</span>
          </div>
          <div className="metrics-grid">
            {metrics.map((metric, i) => (
              <motion.div 
                key={i}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="metric-card ripple"
              >
                <div className="metric-icon-wrap">
                  {metric.icon}
                </div>
                <div className="metric-info">
                  <span className="metric-val">{metric.value}</span>
                  <span className="metric-label">{metric.title}</span>
                </div>
                <div className="metric-trend-mini">{metric.trend}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Actionable Tasks */}
        <section className="tasks-section">
          <div className="native-section-header">
            <h3>Pending Tasks</h3>
            <Link href="/follow-ups" className="view-link">View Tasks <ArrowRight size={14} /></Link>
          </div>
          <div className="task-banner">
             <div className="task-banner-text">
                <h4>3 Overdue Follow-ups</h4>
                <p>Don't lose these potential leads!</p>
             </div>
             <button className="banner-action-btn">Fix Now</button>
          </div>
        </section>

        {/* Recent Inquiries List */}
        <section className="recent-list-section">
          <div className="native-section-header">
            <h3>Recent Hot Leads</h3>
            <Link href="/leads" className="view-link">See All</Link>
          </div>
          <div className="lead-compact-list">
            {recentLeads.map((lead, i) => (
              <motion.div 
                key={i} 
                className="lead-compact-card ripple"
                whileTap={{ scale: 0.98 }}
              >
                <div className="lead-avatar">
                  {lead.name.charAt(0)}
                </div>
                <div className="lead-main-info">
                  <div className="lead-top">
                    <span className="lead-name">{lead.name}</span>
                    <span className="lead-time">{lead.time}</span>
                  </div>
                  <div className="lead-meta-row">
                    <span className="lead-budget">{lead.budget}</span>
                    <span className="lead-dot">•</span>
                    <span className="lead-loc">{lead.location}</span>
                  </div>
                </div>
                <div className="lead-status-chip" data-status={lead.status.toLowerCase()}>
                  {lead.status}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
      
      {/* Global WhatsApp FAB will be added in ClientLayout */}
    </div>
  );
}
