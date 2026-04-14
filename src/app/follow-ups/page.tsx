"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { Clock, AlertCircle, CheckCircle, PhoneCall, MessageCircle } from "lucide-react";
import { isPast, isToday, parseISO, format } from "date-fns";

const FollowUpsPage = () => {
  const [leads, setLeads] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "leads"), where("nextFollowUp", "!=", ""));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLeads(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const missedFollowups = leads.filter(l => isPast(parseISO(l.nextFollowUp)) && !isToday(parseISO(l.nextFollowUp)));
  const todayFollowups = leads.filter(l => isToday(parseISO(l.nextFollowUp)));
  const upcomingFollowups = leads.filter(l => !isPast(parseISO(l.nextFollowUp)) && !isToday(parseISO(l.nextFollowUp)));

  return (
    <div className="container animate-fade">
      <header className="page-header">
        <h1>Follow-up Reminders</h1>
        <p>Keep track of your client engagements</p>
      </header>

      <div className="follow-up-grid">
        {/* Missed Section */}
        <section className="reminder-section missed">
          <div className="section-header">
            <AlertCircle size={20} />
            <h2>Missed Follow-ups</h2>
            <span className="badge">{missedFollowups.length}</span>
          </div>
          <div className="reminder-list">
            {missedFollowups.map(lead => (
              <ReminderCard key={lead.id} lead={lead} type="missed" />
            ))}
          </div>
        </section>

        {/* Today Section */}
        <section className="reminder-section today">
          <div className="section-header">
            <Clock size={20} />
            <h2>Due Today</h2>
            <span className="badge">{todayFollowups.length}</span>
          </div>
          <div className="reminder-list">
            {todayFollowups.map(lead => (
              <ReminderCard key={lead.id} lead={lead} type="today" />
            ))}
          </div>
        </section>

        {/* Upcoming Section */}
        <section className="reminder-section upcoming">
          <div className="section-header">
            <CheckCircle size={20} />
            <h2>Upcoming</h2>
            <span className="badge">{upcomingFollowups.length}</span>
          </div>
          <div className="reminder-list">
            {upcomingFollowups.map(lead => (
              <ReminderCard key={lead.id} lead={lead} type="upcoming" />
            ))}
          </div>
        </section>
      </div>

    </div>
  );
};

const ReminderCard = ({ lead, type }: { lead: any; type: string }) => {
  return (
    <div className={`reminder-card ${type}`}>
      <div className="card-top">
        <p className="lead-name">{lead.fullName}</p>
        <span className="date">{format(parseISO(lead.nextFollowUp), "MMM dd, yyyy")}</span>
      </div>
      <p className="notes">{lead.notes || "No notes available"}</p>
      <div className="card-actions">
        <button className="btn-icon"><PhoneCall size={16} /></button>
        <button className="btn-icon wa"><MessageCircle size={16} /></button>
        <button className="btn-done">Mark as Done</button>
      </div>

    </div>
  );
};

export default FollowUpsPage;
