"use client";
import React, { useState, useEffect } from "react";
import { 
  Search, 
  PhoneCall, 
  PhoneMissed,
  Users,
  Clock,
  TrendingUp,
  Play,
  Pause,
  Download,
  Edit2,
  MoreHorizontal,
  PhoneIncoming,
  PhoneOutgoing,
  Calendar,
  CheckCircle2,
  XCircle,
  MapPin,
  IndianRupee,
  Activity,
  List,
  Grid
} from "lucide-react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import "./calls.css";

interface CallLead {
  id: string;
  name: string;
  phone: string;
  budget: string;
  location: string;
  status: string;
  interest_level: string;
  call_summary: string;
  recording_url: string;
  follow_up_date: string;
  createdAt?: any;
}

export default function CallsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [calls, setCalls] = useState<CallLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All Calls");

  const getInterestClass = (level: string) => {
    const l = (level || "").toLowerCase();
    if (l.includes('hot')) return 'bg-hot';
    if (l.includes('warm')) return 'bg-warm';
    if (l.includes('cold')) return 'bg-cold';
    return 'bg-neutral';
  };

  const getInitials = (name: string) => {
    if (!name) return "UN";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const fetchCalls = async () => {
    try {
      if (!db) return;
      const q = query(
        collection(db, "leads"), 
        where("source", "==", "call"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CallLead[];
      setCalls(data);
    } catch (error) {
      console.error("Error fetching calls:", error);
      // Fallback data if index error happens or db is empty for demonstration
      setCalls([
        {
          id: "1",
          name: "Rahul Sharma",
          phone: "+91 98765 43210",
          budget: "50L",
          location: "Pune",
          status: "Answered",
          interest_level: "Hot",
          call_summary: "Interested in 2BHK in Pune. Budget around 50L. Wants site visit next weekend.",
          recording_url: "#",
          follow_up_date: "Follow-up",
          createdAt: new Date().toISOString()
        },
        {
          id: "2",
          name: "Unused Call",
          phone: "+91 98765 43210",
          budget: "50L",
          location: "Pune",
          status: "Missed",
          interest_level: "Hot",
          call_summary: "Interested in 2BHK in Pune. Budget around 50L. Wants site visit next weekend.",
          recording_url: "#",
          follow_up_date: "Check",
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, []);

  const filteredCalls = calls.filter(call => 
    (call.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (call.phone || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="calls-container">
      {/* Header Section */}
      <div className="calls-header-section">
        <div className="calls-title">
          <h1>Calls</h1>
          <p>Manage and analyze all your calls in one place</p>
        </div>
        <div className="calls-controls">
          <div className="calls-search">
            <Search size={16} color="#9ca3af" />
            <input 
              type="text" 
              placeholder="Search by name, phone number or call ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="calls-dropdown">
            <option>Status</option>
          </select>
          <select className="calls-dropdown">
            <option>Outcome</option>
          </select>
          <select className="calls-dropdown">
            <option>Agent</option>
          </select>
          <div className="calls-date-range">
            30 Apr - 30 May, 2026
          </div>
          <button className="calls-btn-outline">
            <Download size={16} /> Export
          </button>
          <button className="calls-btn-primary">
            Add Call
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrapper kpi-icon-blue">
            <PhoneCall size={24} />
          </div>
          <div className="kpi-content">
            <h3>Total Calls</h3>
            <p className="kpi-value">248</p>
            <span className="kpi-trend"><TrendingUp size={12} className="trend-up" /> <span className="trend-up">+18%</span> <span className="trend-text">vs last 30 days</span></span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon-wrapper kpi-icon-red">
            <PhoneMissed size={24} />
          </div>
          <div className="kpi-content">
            <h3>Missed Calls</h3>
            <p className="kpi-value">32</p>
            <span className="kpi-trend"><TrendingUp size={12} className="trend-up" /> <span className="trend-up">+12%</span> <span className="trend-text">vs last 30 days</span></span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon-wrapper kpi-icon-green">
            <Users size={24} />
          </div>
          <div className="kpi-content">
            <h3>Interested Leads</h3>
            <p className="kpi-value">86</p>
            <span className="kpi-trend"><TrendingUp size={12} className="trend-up" /> <span className="trend-up">+25%</span> <span className="trend-text">vs last 30 days</span></span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon-wrapper kpi-icon-purple">
            <Clock size={24} />
          </div>
          <div className="kpi-content">
            <h3>Avg. Call Duration</h3>
            <p className="kpi-value">02m 34s</p>
            <span className="kpi-trend"><TrendingUp size={12} className="trend-up" /> <span className="trend-up">+6%</span> <span className="trend-text">vs last 30 days</span></span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon-wrapper kpi-icon-yellow">
            <TrendingUp size={24} />
          </div>
          <div className="kpi-content">
            <h3>Conversion Rate</h3>
            <p className="kpi-value">34.7%</p>
            <span className="kpi-trend"><TrendingUp size={12} className="trend-up" /> <span className="trend-up">+8%</span> <span className="trend-text">vs last 30 days</span></span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="calls-tabs-section">
        <div className="calls-tabs">
          {['All Calls', 'Answered', 'Missed', 'Voicemails'].map(tab => (
            <button 
              key={tab}
              className={`calls-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="calls-tab-actions">
          <div className="sort-by">
            Sort by: 
            <select className="calls-dropdown" style={{ padding: '4px 8px', fontSize: '13px' }}>
              <option>Newest First</option>
            </select>
          </div>
          <div className="view-toggles">
            <button className="view-toggle-btn active"><List size={16} /></button>
            <button className="view-toggle-btn"><Grid size={16} /></button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="calls-list">
        {filteredCalls.map((call, idx) => {
          const isMissed = call.status?.toLowerCase().includes('missed') || idx % 2 !== 0; // Simulated
          return (
            <div className="call-card" key={call.id || idx}>
              {/* Col 1 */}
              <div className="call-info-col">
                <div className="caller-avatar">
                  {getInitials(call.name)}
                </div>
                <div className="caller-details">
                  <h4 className="caller-name">{call.name || "Unknown"}</h4>
                  <p className="caller-phone">{call.phone}</p>
                  <span className="badge-direction">
                    {idx % 2 === 0 ? <PhoneIncoming size={12} /> : <PhoneOutgoing size={12} />}
                    {idx % 2 === 0 ? 'Incoming' : 'Outgoing'}
                  </span>
                  <span className="call-id">Call ID: call_01HXFAB12...</span>
                </div>
              </div>

              {/* Col 2 */}
              <div className="call-player-col">
                <div className="player-meta">
                  {isMissed ? (
                    <span className="badge-missed"><XCircle size={12} /> Missed</span>
                  ) : (
                    <span className="badge-answered"><CheckCircle2 size={12} /> Answered</span>
                  )}
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> 30 May, 2026 10:24 AM</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> 02m 34s</span>
                </div>
                
                <div className="audio-player-wrapper">
                  <button className="play-btn">
                    <Play size={16} fill="currentColor" />
                  </button>
                  <span className="time-display">0:00 / 2:34</span>
                  <div className="waveform"></div>
                  <div className="player-controls">
                    <button>1x</button>
                    <button>&#10005;</button>
                    <button><Download size={14} /></button>
                  </div>
                </div>

                <div className="call-tags">
                  <span className="tag-item">Source: Facebook Ads</span>
                  <span className="tag-item">Agent: Shivraj</span>
                  <span className="tag-item">Device: Mobile</span>
                </div>
              </div>

              {/* Col 3 */}
              <div className="ai-summary-col">
                <h4 className="ai-summary-title">AI Summary</h4>
                <p className="ai-summary-text">
                  {call.call_summary || "Interested in 2BHK in Pune. Budget around 50L. Wants site visit next weekend."}
                </p>
                <div className="ai-badges">
                  <div className="ai-badge">
                    <Activity size={12} /> Interest: 
                    <span className={`badge-value ${getInterestClass(call.interest_level || 'Hot')}`}>
                      {call.interest_level || "Hot"}
                    </span>
                  </div>
                  <div className="ai-badge">
                    <IndianRupee size={12} /> Budget: 
                    <span className="badge-value bg-neutral">{call.budget || "50L"}</span>
                  </div>
                  <div className="ai-badge">
                    <MapPin size={12} /> Location: 
                    <span className="badge-value bg-neutral">{call.location || call.follow_up_date || "Follow-up"}</span>
                  </div>
                </div>
                <a href="#" className="view-transcript">View Full Transcript</a>
              </div>

              {/* Col 4 */}
              <div className="actions-col">
                <div className="action-icons">
                  <button className="icon-btn" title="Play"><Play size={14} /></button>
                  <button className="icon-btn" title="Edit"><Edit2 size={14} /></button>
                  <button className="icon-btn" title="More"><MoreHorizontal size={14} /></button>
                </div>
                <button className="btn-followup">Mark Follow-up</button>
                <button className="btn-view-lead">View Lead</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
