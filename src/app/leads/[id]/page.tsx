"use client";

import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  MessageSquare, 
  PhoneCall, 
  Clock, 
  MapPin, 
  Wallet,
  History,
  FileText,
  Plus
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function LeadDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  // Mock data for a single lead
  const lead = {
    name: "Ramesh Pawar",
    phone: "+91 98765 43210",
    budget: "₹75L - 90L",
    location: "Wakad, Pune",
    type: "2BHK",
    status: "Hot",
    notes: "Client is looking for a ready-to-move-in property near the highway. Possibility of closing this month.",
    timeline: [
      { date: "April 14, 2024", action: "WhatsApp Inquiry", desc: "Interested in Kohinoor Courtyard One." },
      { date: "April 13, 2024", action: "Phone Call", desc: "Detailed discussion regarding payment plan." },
      { date: "April 10, 2024", action: "Lead Created", desc: "Source: Facebook Ads" },
    ]
  };

  return (
    <div className="mobile-view">
      <div className="app-bar">
        <div className="app-bar-content">
          <button className="icon-btn-transparent" onClick={() => router.back()}>
            <ArrowLeft size={24} />
          </button>
          <h1 className="native-title">Lead Profile</h1>
          <div style={{ width: 24 }} />
        </div>
      </div>

      <div className="content-area">
        <motion.section 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="lead-profile-header"
        >
          <div className="profile-hero">
            <div className="avatar-large">{lead.name.split(' ').map(n => n[0]).join('')}</div>
            <h2>{lead.name}</h2>
            <div className="status-badge-lg">{lead.status} Lead</div>
          </div>
          
          <div className="quick-actions-row">
            <button className="q-action-btn wa ripple">
              <MessageSquare size={20} />
              <span>WhatsApp</span>
            </button>
            <button className="q-action-btn call ripple">
              <PhoneCall size={20} />
              <span>Call Now</span>
            </button>
          </div>
        </motion.section>

        <section className="detail-cards-grid">
          <div className="detail-info-card">
            <div className="detail-row">
              <Wallet size={18} className="icon-gold" />
              <div className="dr-text">
                <label>Budget Range</label>
                <span>{lead.budget}</span>
              </div>
            </div>
            <div className="detail-row">
              <MapPin size={18} className="icon-gold" />
              <div className="dr-text">
                <label>Location Preference</label>
                <span>{lead.location}</span>
              </div>
            </div>
          </div>

          <div className="section-card">
            <div className="sc-header">
               <FileText size={18} />
               <h3>Admin Notes</h3>
            </div>
            <p className="note-text">{lead.notes}</p>
            <button className="add-note-btn"><Plus size={16} /> Add Note</button>
          </div>

          <div className="section-card">
            <div className="sc-header">
               <History size={18} />
               <h3>Activity Timeline</h3>
            </div>
            <div className="timeline-list">
               {lead.timeline.map((item, i) => (
                 <div key={i} className="timeline-item">
                    <div className="tl-dot" />
                    <div className="tl-content">
                       <span className="tl-date">{item.date}</span>
                       <span className="tl-action">{item.action}</span>
                       <p className="tl-desc">{item.desc}</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
