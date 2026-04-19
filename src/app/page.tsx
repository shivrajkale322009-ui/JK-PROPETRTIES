"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Bell, Search, MessageSquare, Menu } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { collection, getDocs, orderBy, query, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import dynamicNext from "next/dynamic";

// Lazy load modular components for performance
const StatsBar = dynamicNext(() => import("@/components/dashboard/StatsBar"), { ssr: false });
const LeadsTable = dynamicNext(() => import("@/components/dashboard/LeadsTable"), { ssr: false });
const TaskWidget = dynamicNext(() => import("@/components/dashboard/TaskWidget"), { ssr: false });

export default function Dashboard() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      if (!db) return;
      // Optimize query to only get 10 recent leads
      const q = query(collection(db, "leads"), orderBy("createdAt", "desc"), limit(10));
      const snapshot = await getDocs(q);
      const fetchedLeads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLeads(fetchedLeads);
    } catch (error) {
      console.error("Dashboard fetch error: ", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Memoize aggregates
  const aggregates = useMemo(() => {
    const totalLeads = leads.length;
    const hotLeads = leads.filter(l => l.status && l.status.toLowerCase() === 'hot').length;
    return { totalLeads, hotLeads };
  }, [leads]);

  return (
    <div className="mobile-view compact-crm">
      {/* Top Sticky Quick Action Bar */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="app-bar compact-app-bar"
      >
        <div className="app-bar-left">
          <button className="hamburger-btn" id="sidebar-toggle" onClick={() => window.dispatchEvent(new CustomEvent("toggle-sidebar"))}>
            <Menu size={20} />
          </button>
          <div>
            <h1 className="native-title compact">Dashboard</h1>
          </div>
        </div>
        
        <div className="app-bar-right quick-actions-top">
           <button className="top-q-btn"><Search size={18} /></button>
           <button className="top-q-btn"><MessageSquare size={18} /></button>
           <button className="top-q-btn"><Bell size={18} /></button>
           <Link href="/leads/add">
             <button className="icon-btn-gold compact-btn ripple">
                <Plus size={18} /> <span className="hide-mobile">Lead</span>
             </button>
           </Link>
        </div>
      </motion.div>

      <div className="content-area compact-mode">

        {/* Compact Stats Strip */}
        <section className="dashboard-section">
           <StatsBar totalLeads={aggregates.totalLeads} hotLeads={aggregates.hotLeads} loading={loading} />
        </section>

        <div className="dashboard-grid-compact">
          {/* Main Leads Table */}
          <section className="dashboard-section main-col">
            <div className="compact-section-header">
              <h3>Recent Leads</h3>
              <Link href="/leads" className="view-link">View All</Link>
            </div>
            <LeadsTable leads={leads} loading={loading} />
          </section>

          {/* Secondary Column: Tasks */}
          <section className="dashboard-section side-col">
            <TaskWidget />
          </section>
        </div>
      </div>
    </div>
  );
}

