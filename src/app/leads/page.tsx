"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  MessageCircle, 
  PhoneCall,
  ChevronDown,
  Users
} from "lucide-react";
import LeadModal from "@/components/LeadModal";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, addDoc, Timestamp } from "firebase/firestore";

const AllLeadsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const q = query(collection(db, "leads"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leadsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLeads(leadsList);
    });

    return () => unsubscribe();
  }, []);

  const handleAddLead = async (formData: any) => {
    try {
      await addDoc(collection(db, "leads"), {
        ...formData,
        status: "New Lead",
        createdAt: Timestamp.now(),
        history: [{
          action: "Lead Created",
          date: new Date().toISOString(),
          note: "Initial entry"
        }]
      });
    } catch (err) {
      console.error("Error adding lead:", err);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         lead.phone?.includes(searchQuery);
    const matchesStatus = statusFilter === "All" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New Lead": return "#3b82f6";
      case "Interested": return "#f59e0b";
      case "Closed": return "#10b981";
      case "Lost": return "#ef4444";
      case "Follow-Up Pending": return "#8b5cf6";
      default: return "#64748b";
    }
  };

  return (
    <div className="container animate-fade">
      <header className="page-header">
        <h1>All Leads</h1>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <Plus size={18} />
          <span>Add New Lead</span>
        </button>
      </header>

      <div className="toolbar">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search by name or phone..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="filters">
          <div className="filter-group">
            <Filter size={16} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="New Lead">New Lead</option>
              <option value="Contacted">Contacted</option>
              <option value="Follow-Up Pending">Follow-Up Pending</option>
              <option value="Interested">Interested</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="leads-table-container card">
        <table className="leads-table">
          <thead>
            <tr>
              <th>Lead Details</th>
              <th>Status</th>
              <th>Source</th>
              <th>Location/Budget</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((lead) => (
              <tr key={lead.id}>
                <td>
                  <div className="lead-main">
                    <p className="name">{lead.fullName}</p>
                    <p className="phone">{lead.phone}</p>
                  </div>
                </td>
                <td>
                  <span className="status-indicator" style={{ backgroundColor: `${getStatusColor(lead.status)}20`, color: getStatusColor(lead.status) }}>
                    {lead.status}
                  </span>
                </td>
                <td><span className="source-tag">{lead.source}</span></td>
                <td>
                  <div className="location-info">
                    <p>{lead.location || "N/A"}</p>
                    <span>{lead.budget || "No budget"}</span>
                  </div>
                </td>
                <td>
                  <div className="actions">
                    <a 
                      href={`https://wa.me/${lead.whatsapp?.replace(/\D/g, '')}`} 
                      target="_blank" 
                      className="wa-btn" 
                      title="Send WhatsApp"
                    >
                      <MessageCircle size={18} />
                    </a>
                    <button className="icon-btn"><MoreVertical size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredLeads.length === 0 && (
          <div className="empty-state">
            <Users size={48} />
            <p>No leads found matching your criteria.</p>
          </div>
        )}
      </div>

      <LeadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleAddLead}
      />

    </div>
  );
};

export default AllLeadsPage;
