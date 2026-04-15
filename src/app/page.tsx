"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
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
import { collection, getDocs, orderBy, query, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Dashboard() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!db) return;
        const q = query(collection(db, "leads"), orderBy("createdAt", "desc"), limit(5));
        const snapshot = await getDocs(q);
        const fetchedLeads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLeads(fetchedLeads);
      } catch (error) {
        console.error("Dashboard fetch error: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const totalLeads = leads.length; // Just an approximation based on fetched limit
  const hotLeads = leads.filter(l => l.status && l.status.toLowerCase() === 'hot').length;

  const metrics = [
    { title: "Total Leads", value: loading ? "-" : totalLeads.toString(), icon: <Users size={20} />, trend: "Active in database" },
    { title: "Hot Leads", value: loading ? "-" : hotLeads.toString(), icon: <TrendingUp size={20} />, trend: "Requires attention" },
    { title: "WhatsApp", value: "-", icon: <MessageSquare size={20} />, trend: "Integration pending" },
    { title: "Follow-ups", value: "-", icon: <Clock size={20} />, trend: "Active tasks" },
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
          <Link href="/leads/add">
            <button className="icon-btn-gold ripple">
               <Plus size={22} />
            </button>
          </Link>
        </div>
      </motion.div>

      <div className="content-area">
        <section className="metrics-section">
          <div className="native-section-header">
            <h3>Overview</h3>
            <span>Live Data</span>
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
                <h4>System Ready</h4>
                <p>Start logging tasks for your properties.</p>
             </div>
             <Link href="/follow-ups">
              <button className="banner-action-btn">Go to Tasks</button>
             </Link>
          </div>
        </section>

        {/* Recent Inquiries List */}
        <section className="recent-list-section">
          <div className="native-section-header">
            <h3>Recent Leads</h3>
            <Link href="/leads" className="view-link">See All</Link>
          </div>
          <div className="lead-compact-list">
            {loading ? (
              <p style={{textAlign: 'center', fontSize: '0.9rem', color: 'gray', padding: '10px 0'}}>Loading leads...</p>
            ) : leads.length === 0 ? (
              <p style={{textAlign: 'center', fontSize: '0.9rem', color: 'gray', padding: '10px 0'}}>No leads found in database.</p>
            ) : (
              leads.map((lead, i) => (
                <motion.div 
                  key={lead.id || i} 
                  className="lead-compact-card ripple"
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="lead-avatar">
                    {(lead.name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="lead-main-info">
                    <div className="lead-top">
                      <span className="lead-name">{lead.name || "Unknown"}</span>
                      <span className="lead-time">Recent</span>
                    </div>
                    <div className="lead-meta-row">
                      <span className="lead-budget">{lead.budget || "N/A"}</span>
                      <span className="lead-dot">•</span>
                      <span className="lead-loc">{lead.location || "N/A"}</span>
                    </div>
                  </div>
                  <div className="lead-status-chip" data-status={(lead.status || "new").toLowerCase()}>
                    {lead.status || "New"}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
