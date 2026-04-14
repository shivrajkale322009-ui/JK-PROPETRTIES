"use client";

export const dynamic = "force-dynamic";

import { 
  Users, 
  UserCheck, 
  CalendarCheck, 
  CheckCircle2, 
  TrendingUp, 
  Clock,
  Plus,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const stats = [
    { title: "Total Leads", value: "1,284", icon: <Users />, color: "var(--info)", trend: "+12%" },
    { title: "Contacted", value: "842", icon: <UserCheck />, color: "var(--warning)", trend: "65%" },
    { title: "Site Visits", value: "156", icon: <CalendarCheck />, color: "var(--accent)", trend: "12%" },
    { title: "Closed Deals", value: "42", icon: <CheckCircle2 />, color: "var(--success)", trend: "4%" },
  ];

  const recentLeads = [
    { name: "Rahul Deshmukh", source: "Facebook", status: "New Lead", date: "2 mins ago" },
    { name: "Anjali Singh", source: "WhatsApp", status: "Interested", date: "1 hour ago" },
    { name: "Suresh Patil", source: "Website", status: "Site Visit Scheduled", date: "3 hours ago" },
  ];

  return (
    <div className="container animate-fade">
      <header className="dashboard-header">
        <div>
          <h1>Dashboard Overview</h1>
          <p className="subtitle">Welcome back! Here's what's happening today.</p>
        </div>
        <button className="btn-primary">
          <Plus size={18} />
          <span>Quick Lead</span>
        </button>
      </header>

      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-content">
              <p className="stat-label">{stat.title}</p>
              <h3 className="stat-value">{stat.value}</h3>
              <div className="stat-trend">
                <TrendingUp size={14} />
                <span>{stat.trend} this month</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <section className="card">
          <div className="card-header">
            <h3>Recent Leads</h3>
            <Link href="/leads" className="view-all">View All <ArrowRight size={14} /></Link>
          </div>
          <div className="list">
            {recentLeads.map((lead, i) => (
              <div key={i} className="list-item">
                <div className="lead-info">
                  <span className="lead-name">{lead.name}</span>
                  <span className="lead-source">{lead.source}</span>
                </div>
                <div className="lead-meta">
                  <span className={`status-badge ${lead.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    {lead.status}
                  </span>
                  <span className="date">{lead.date}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card follow-up-section">
          <div className="card-header">
            <h3>Follow-up Reminders</h3>
            <span className="alert-count">4 Pending</span>
          </div>
          <div className="reminder-list">
            <div className="reminder-item missed">
              <Clock size={16} />
              <div className="reminder-info">
                <p>Amit Sharma <strong>(Missed)</strong></p>
                <span>Scheduled for April 13, 10:00 AM</span>
              </div>
            </div>
            <div className="reminder-item">
              <Clock size={16} />
              <div className="reminder-info">
                <p>Priya Kulkarni</p>
                <span>Today at 2:30 PM</span>
              </div>
            </div>
          </div>
        </section>
      </div>

    </div>
  );
}
