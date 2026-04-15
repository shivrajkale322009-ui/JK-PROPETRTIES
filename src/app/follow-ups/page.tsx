"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Phone, MessageSquare } from "lucide-react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

type TabKey = "overdue" | "today" | "upcoming";

export default function FollowUps() {
  const [activeTab, setActiveTab] = useState<TabKey>("today");
  const [followups, setFollowups] = useState<{ overdue: any[], today: any[], upcoming: any[] }>({
    overdue: [],
    today: [],
    upcoming: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFollowups = async () => {
      try {
        if (!db) return;
        const querySnapshot = await getDocs(collection(db, "leads"));
        const allLeads = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const endOfToday = startOfToday + 86400000;

        const overdue: any[] = [];
        const today: any[] = [];
        const upcoming: any[] = [];

        allLeads.forEach((lead: any) => {
          // Check for a nextFollowUp timestamp, or fallback to mock classification based on generic conditions if none set
          if (lead.nextFollowUp) {
            const time = lead.nextFollowUp.toMillis ? lead.nextFollowUp.toMillis() : new Date(lead.nextFollowUp).getTime();
            if (time < startOfToday) overdue.push(lead);
            else if (time >= startOfToday && time < endOfToday) today.push(lead);
            else upcoming.push(lead);
          } else if (lead.status && lead.status.toLowerCase() !== "closed" && lead.status.toLowerCase() !== "new") {
             // For production CRM, if they don't have a next followup but are active, stick them in upcoming
             upcoming.push(lead);
          }
        });

        setFollowups({ overdue, today, upcoming });
      } catch (error) {
        console.error("Error fetching followups:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFollowups();
  }, []);

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "overdue",  label: "Overdue",  count: followups.overdue.length },
    { key: "today",    label: "Today",    count: followups.today.length },
    { key: "upcoming", label: "Upcoming", count: followups.upcoming.length },
  ];

  return (
    <div className="mobile-view">
      <div className="app-bar">
        <div className="app-bar-content">
          <div>
            <h1 className="native-title">Follow-ups</h1>
            <p className="native-subtitle">{loading ? "Loading..." : `${followups.overdue.length} overdue tasks`}</p>
          </div>
        </div>
      </div>

      <div className="content-area">
        <div className="tabs-row">
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`tab-btn ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'gray' }}>
            Loading follow-up tasks...
          </div>
        ) : followups[activeTab].length === 0 ? (
           <div style={{ textAlign: 'center', padding: '2rem', color: 'gray' }}>
             No tasks here right now.
           </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {followups[activeTab].map((fu, i) => (
                <Link href={`/leads/${fu.id}`} key={i} className="followup-card-link">
                  <div className={`followup-card ${activeTab}`}>
                    <div className={`fu-dot ${activeTab}`}>
                      <Clock size={18} />
                    </div>
                    <div className="fu-info">
                      <span className="fu-name">{fu.name || "Unknown Lead"}</span>
                      <span className="fu-time">
                        {fu.nextFollowUp 
                          ? new Date(fu.nextFollowUp.toMillis ? fu.nextFollowUp.toMillis() : fu.nextFollowUp).toLocaleString() 
                          : "Unscheduled Task"}
                      </span>
                    </div>
                    <div className="fu-quick-actions">
                      <button className="action-btn-circle wa" onClick={e => e.preventDefault()}>
                        <MessageSquare size={16} />
                      </button>
                      <button className="action-btn-circle call" onClick={e => e.preventDefault()}>
                        <Phone size={16} />
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
