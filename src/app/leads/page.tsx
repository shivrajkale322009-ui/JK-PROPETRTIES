"use client";

import { useState } from "react";
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

const LEADS_DATA = [
  { id: "1", name: "Ramesh Pawar", phone: "+91 98765 43210", budget: "₹75L - 90L", location: "Wakad, Pune", status: "Hot", type: "2BHK" },
  { id: "2", name: "Sunita Deshpande", phone: "+91 98221 12345", budget: "₹1.2Cr - 1.5Cr", location: "Baner", status: "Warm", type: "3BHK" },
  { id: "3", name: "Amit Kulkarni", phone: "+91 90112 33445", budget: "₹45L - 55L", location: "Ravet", status: "New", type: "1BHK" },
  { id: "4", name: "Priya Sharma", phone: "+91 99887 76655", budget: "₹2.2Cr+", location: "Koregaon Park", status: "Visit Scheduled", type: "Penthouse" },
];

export default function LeadsList() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLeads = LEADS_DATA.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mobile-view">
      <div className="app-bar">
        <div className="app-bar-content">
          <div>
            <h1 className="native-title">All Leads</h1>
            <p className="native-subtitle">{filteredLeads.length} active prospects</p>
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
                      {lead.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="lead-info-main">
                      <div className="lead-name-row">
                        <span className="lead-name">{lead.name}</span>
                        <div className="status-dot" data-status={lead.status.toLowerCase()} />
                      </div>
                      <span className="lead-sub">{lead.phone}</span>
                      <div className="lead-tags">
                        <span className="tag-budget">{lead.budget}</span>
                        <span className="tag-loc">{lead.location}</span>
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
        </div>
      </div>

      {/* FAB for Adding Lead */}
      <Link href="/leads/add" className="android-fab">
        <Plus size={28} />
      </Link>
    </div>
  );
}
