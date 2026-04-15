"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function LeadDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLead = async () => {
      try {
        if (!db || !id) return;
        const docRef = doc(db, "leads", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setLead(docSnap.data());
        } else {
          console.log("No such lead!");
        }
      } catch (error) {
        console.error("Error fetching lead:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
  }, [id]);

  if (loading) {
    return (
      <div className="mobile-view">
        <div className="app-bar">
          <div className="app-bar-content">
            <button className="icon-btn-transparent" onClick={() => router.back()}>
              <ArrowLeft size={24} />
            </button>
            <h1 className="native-title">Loading...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="mobile-view">
        <div className="app-bar">
          <div className="app-bar-content">
            <button className="icon-btn-transparent" onClick={() => router.back()}>
              <ArrowLeft size={24} />
            </button>
            <h1 className="native-title">Lead Not Found</h1>
          </div>
        </div>
      </div>
    );
  }

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
            <div className="avatar-large">{(lead.name || "U").split(' ').map((n: string) => n[0]).join('').substring(0,2).toUpperCase()}</div>
            <h2>{lead.name || "Unnamed"}</h2>
            <div className="status-badge-lg">{lead.status || "New"} Lead</div>
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
                <span>{lead.budget || "N/A"}</span>
              </div>
            </div>
            <div className="detail-row">
              <MapPin size={18} className="icon-gold" />
              <div className="dr-text">
                <label>Location Preference</label>
                <span>{lead.location || "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="section-card">
            <div className="sc-header">
               <FileText size={18} />
               <h3>Admin Notes</h3>
            </div>
            <p className="note-text">{lead.notes || "No notes available for this lead."}</p>
            <button className="add-note-btn"><Plus size={16} /> Add Note</button>
          </div>

          <div className="section-card">
            <div className="sc-header">
               <History size={18} />
               <h3>Activity Timeline</h3>
            </div>
            <div className="timeline-list">
               {lead.timeline && lead.timeline.length > 0 ? lead.timeline.map((item: any, i: number) => (
                 <div key={i} className="timeline-item">
                    <div className="tl-dot" />
                    <div className="tl-content">
                       <span className="tl-date">{item.date}</span>
                       <span className="tl-action">{item.action}</span>
                       <p className="tl-desc">{item.desc}</p>
                    </div>
                 </div>
               )) : (
                 <p className="note-text" style={{background: 'transparent', padding: 0}}>No activity timeline.</p>
               )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
