"use client";
import { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  MessageCircle, 
  PhoneCall, 
  MoreVertical,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  Phone,
  MapPin,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { collection, getDocs, orderBy, query, doc, deleteDoc } from "firebase/firestore";
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
  createdAt?: any;
}

export default function LeadsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("All Leads");

  const quickFilters = [
    "All Leads", "Today Leads", "Hot Leads", "Follow-up Pending", "Closed Deals"
  ];

  const getStatusClass = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s.includes('new')) return 'status-new';
    if (s.includes('not called')) return 'status-not-called';
    if (s.includes('interested') && !s.includes('not')) return 'status-interested';
    if (s.includes('visit')) return 'status-site-visit';
    if (s.includes('closed')) return 'status-closed';
    if (s.includes('not interested')) return 'status-not-interested';
    return 'status-not-called';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

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

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this lead?")) {
      try {
        await deleteDoc(doc(db, "leads", id));
        setLeads(prev => prev.filter(l => l.id !== id));
      } catch (error) {
        console.error("Error deleting lead:", error);
        alert("Failed to delete lead.");
      }
    }
    setActiveMenu(null);
  };

  const toggleMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMenu(activeMenu === id ? null : id);
  };

  const filteredLeads = leads.filter(lead => 
    (lead.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lead.location || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mobile-view">
      {/* Unified Search & Filter Panel */}
      <div className="filter-panel-wrapper">
        <div className="filter-panel-container">
          <div className="panel-search-box">
            <Search size={18} className="panel-icon" />
            <input 
              type="text" 
              placeholder="Search leads..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="panel-selectors-group">
            <div className="panel-select-wrapper">
              <label>STATUS</label>
              <select onChange={(e) => setActiveFilter(e.target.value)} value={activeFilter}>
                {quickFilters.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            
            <div className="panel-select-wrapper">
              <label>BUDGET</label>
              <select>
                <option>ALL</option>
                <option>Under 50L</option>
                <option>50L - 1Cr</option>
                <option>Above 1Cr</option>
              </select>
            </div>

            <div className="panel-select-wrapper">
              <label>LOCATION</label>
              <select>
                <option>ALL</option>
                <option>Pune</option>
                <option>Mumbai</option>
                <option>Bangalore</option>
              </select>
            </div>

            <div className="panel-select-wrapper">
              <label>SORT</label>
              <select>
                <option>DATE</option>
                <option>NAME</option>
                <option>BUDGET</option>
              </select>
            </div>
          </div>
          
          <button className="panel-action-btn ripple">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="content-area pt-0">
        {/* Column Headers for PC */}
        <div className="leads-column-headers-pc">
          <div className="header-col col-avatar"></div>
          <div className="header-grid-pc">
            <div className="header-col">NAME</div>
            <div className="header-col">MOBILE NO.</div>
            <div className="header-col">LOCATION</div>
            <div className="header-col">BUDGET</div>
            <div className="header-col">STATUS</div>
          </div>
          <div className="header-col col-actions">ACTIONS</div>
        </div>

        <div className="leads-grid">
          {loading ? (
            // Skeleton Loader
            [1, 2, 3, 4].map(i => (
              <div key={i} className="lead-card-modern skeleton-pulse" style={{ height: 160 }} />
            ))
          ) : (
            <AnimatePresence>
              {filteredLeads.map((lead) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  layout
                >
                  <div className="lead-card-modern-compact">
                    <Link href={`/leads/${lead.id}`} className="lead-card-link-compact">
                      <div className="lead-avatar-mini">
                        {getInitials(lead.name || "UN")}
                      </div>
                      
                      <div className="lead-info-compact">
                        <div className="lead-main-content-pc">
                          <div className="lead-col lead-col-name">
                            <h3 className="lead-name-bold-mini">{lead.name || "Unknown"}</h3>
                            <div className="lead-mobile-meta">
                              <span className="mobile-text">{lead.phone}</span>
                              <span className="dot-sep">•</span>
                              <span className={`status-badge-tiny ${getStatusClass(lead.status)}`}>
                                {lead.status}
                              </span>
                            </div>
                          </div>

                          <div className="lead-col lead-col-phone">
                            <div className="meta-item-pc">
                              <Phone size={14} className="hide-mobile-icon" />
                              <span className="pc-text-uniform">{lead.phone}</span>
                            </div>
                          </div>

                          <div className="lead-col lead-col-location">
                            <div className="meta-item-pc">
                              <MapPin size={14} className="hide-mobile-icon" />
                              <span className="pc-text-uniform">{lead.location || "N/A"}</span>
                            </div>
                          </div>

                          <div className="lead-col lead-col-budget">
                            <div className="meta-item-pc">
                              <span className="pc-text-uniform budget-text">{lead.budget || "N/A"}</span>
                            </div>
                          </div>

                          <div className="lead-col lead-col-status">
                            <span className={`status-badge-pc ${getStatusClass(lead.status)}`}>
                              {lead.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>

                    <div className="lead-quick-actions-right">
                      <button 
                        className="action-btn-mini call"
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.href = `tel:${lead.phone}`;
                        }}
                      >
                        <PhoneCall size={16} />
                      </button>
                      <button 
                        className="action-btn-mini whatsapp"
                        onClick={(e) => {
                          e.preventDefault();
                          window.open(`https://wa.me/${lead.phone.replace(/\D/g, '')}`, '_blank');
                        }}
                      >
                        <MessageCircle size={16} />
                      </button>
                      
                      <div className="more-menu-wrapper">
                        <button 
                          className="action-btn-mini more" 
                          onClick={(e) => toggleMenu(e, lead.id)}
                        >
                          <MoreVertical size={16} />
                        </button>
                        
                        <AnimatePresence>
                          {activeMenu === lead.id && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95, x: 10 }}
                              animate={{ opacity: 1, scale: 1, x: 0 }}
                              exit={{ opacity: 0, scale: 0.95, x: 10 }}
                              className="lead-action-menu-compact"
                            >
                              <Link href={`/leads/edit/${lead.id}`} className="menu-item-compact ripple">
                                <Edit2 size={14} />
                                <span>Edit</span>
                              </Link>
                              <button 
                                onClick={(e) => handleDelete(e, lead.id)} 
                                className="menu-item-compact text-danger ripple"
                              >
                                <Trash2 size={14} />
                                <span>Delete</span>
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
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
