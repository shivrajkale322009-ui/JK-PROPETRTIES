"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  MessageCircle, 
  PhoneCall, 
  MoreVertical,
  ChevronRight,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Define interface for Lead based on usage
interface Lead {
  id: string;
  name: string;
  phone: string;
  budget: string;
  location: string;
  status: string;
  type?: string;
}

export default function LeadsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        if (!db) return;
        const q = query(collection(db, "leads"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Lead[];
        setLeads(data);
      } catch (error) {
        console.error("Error fetching leads:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeads();
  }, []);

  const filteredLeads = leads.filter(lead => 
    (lead.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lead.location || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mobile-view">
      <div className="app-bar">
        <div className="app-bar-content">
          <div>
            <h1 className="native-title">All Leads</h1>
            <p className="native-subtitle">{loading ? "Loading..." : `${filteredLeads.length} active prospects`}</p>
          </div>
          <div className="header-actions">
             <button className="icon-btn-transparent"><Search size={22} /></button>
          </div>
        </div>
      </div>

      <div className="content-area">
        <div className="search-filter-row">
           <div className="native-search-bar">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search name or location..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <button className="filter-pill">
              <Filter size={16} />
              <span>Filters</span>
           </button>
        </div>

        <div className="leads-vertical-list">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              Loading leads from database...
            </div>
          ) : filteredLeads.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No leads found. Drop the demo logic and add some live data!
            </div>
          ) : (
            <AnimatePresence>
              {filteredLeads.map((lead, i) => (
                <motion.div 
                  key={lead.id}
                  layout
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link href={`/leads/${lead.id}`} className="lead-card-native ripple">
                    <div className="lead-card-body">
                      <div className="lead-avatar-circle">
                        {(lead.name || "?").split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()}
                      </div>
                      <div className="lead-info-main">
                        <div className="lead-name-row">
                          <span className="lead-name">{lead.name}</span>
                          <div className="status-dot" data-status={(lead.status || "new").toLowerCase()} />
                        </div>
                        <span className="lead-sub">{lead.phone}</span>
                        <div className="lead-tags">
                          {lead.budget && <span className="tag-budget">{lead.budget}</span>}
                          {lead.location && <span className="tag-loc">{lead.location}</span>}
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-muted" />
                    </div>
                    <div className="lead-card-actions">
                       <button className="action-btn-circle wa"><MessageCircle size={18} /></button>
                       <button className="action-btn-circle call"><PhoneCall size={18} /></button>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* FAB for Adding Lead */}
      <Link href="/leads/add" className="android-fab">
        <Plus size={28} />
      </Link>
    </div>
  );
}
