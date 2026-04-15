"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Phone, MessageSquare } from "lucide-react";
import Link from "next/link";

const FOLLOWUPS = {
  overdue: [
    { name: "Amit Sharma", time: "Yesterday, 10:00 AM", id: "1" },
    { name: "Kavita More", time: "2 days ago", id: "2" },
  ],
  today: [
    { name: "Priya Kulkarni", time: "Today, 2:30 PM", id: "3" },
    { name: "Sanjay Raut", time: "Today, 5:00 PM", id: "4" },
  ],
  upcoming: [
    { name: "Meera Nair", time: "Tomorrow, 11:00 AM", id: "5" },
    { name: "Vikram Rathore", time: "Apr 16, 3:00 PM", id: "6" },
  ],
};

type TabKey = "overdue" | "today" | "upcoming";

export default function FollowUps() {
  const [activeTab, setActiveTab] = useState<TabKey>("today");

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "overdue",  label: "Overdue",  count: FOLLOWUPS.overdue.length },
    { key: "today",    label: "Today",    count: FOLLOWUPS.today.length },
    { key: "upcoming", label: "Upcoming", count: FOLLOWUPS.upcoming.length },
  ];

  return (
    <div className="mobile-view">
      <div className="app-bar">
        <div className="app-bar-content">
          <div>
            <h1 className="native-title">Follow-ups</h1>
            <p className="native-subtitle">{FOLLOWUPS.overdue.length} overdue tasks</p>
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

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {FOLLOWUPS[activeTab].map((fu, i) => (
              <Link href={`/leads/${fu.id}`} key={i} className="followup-card-link">
                <div className={`followup-card ${activeTab}`}>
                  <div className={`fu-dot ${activeTab}`}>
                    <Clock size={18} />
                  </div>
                  <div className="fu-info">
                    <span className="fu-name">{fu.name}</span>
                    <span className="fu-time">{fu.time}</span>
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
      </div>
    </div>
  );
}
