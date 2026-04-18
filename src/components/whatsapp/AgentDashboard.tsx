"use client";

import { useState, useEffect } from "react";
import { User, Phone, Mail, Calendar, TrendingUp, Clock, CheckCircle, AlertCircle, Users, Target } from "lucide-react";
import { motion } from "framer-motion";
import { leadAutomationService, Lead, LeadStatus } from "@/lib/lead-automation";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Agent {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  status?: string;
  isActive?: boolean;
  assignedLeads: number;
  maxLeads: number;
}

interface AgentDashboardProps {
  className?: string;
}

export default function AgentDashboard({ className = "" }: AgentDashboardProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentStats, setAgentStats] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  useEffect(() => {
    loadAgentData();
  }, []);

  const loadAgentData = async () => {
    try {
      setLoading(true);
      
      // Load agents from teamMembers collection
      const agentsData = await loadAgents();
      setAgents(agentsData);

      // Load stats for each agent
      const stats: Record<string, any> = {};
      for (const agent of agentsData) {
        stats[agent.id] = await getAgentStats(agent.id);
      }
      setAgentStats(stats);
    } catch (error) {
      console.error('Error loading agent data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAgents = async (): Promise<Agent[]> => {
    if (!db) return [];
    
    try {
      const q = query(collection(db, "teamMembers"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || data.displayName || "Unknown Agent",
          email: data.email || doc.id,
          phone: data.phone || "N/A",
          isActive: data.status === "Active",
          assignedLeads: data.assignedLeads || 0,
          maxLeads: data.maxLeads || 50,
          ...data
        } as Agent;
      });
    } catch (error) {
      console.error("Error fetching agents from Firestore:", error);
      return [];
    }
  };

  const getAgentStats = async (agentId: string) => {
    try {
      // Get leads assigned to this agent
      const leads = await leadAutomationService.getLeadsByAgent(agentId);
      
      const stats = {
        totalLeads: leads.length,
        newLeads: leads.filter(l => l.status === 'New Lead').length,
        interestedLeads: leads.filter(l => l.status === 'Interested').length,
        siteVisits: leads.filter(l => l.status === 'Site Visit Scheduled').length,
        closed: leads.filter(l => l.status === 'Closed').length,
        conversionRate: 0,
        avgResponseTime: '2 hours', // This would be calculated from actual data
        followUps: leads.filter(l => l.followUpAt).length
      };

      stats.conversionRate = stats.totalLeads > 0 
        ? Math.round((stats.closed / stats.totalLeads) * 100) 
        : 0;

      return stats;
    } catch (error) {
      console.error('Error getting agent stats:', error);
      return {
        totalLeads: 0,
        newLeads: 0,
        interestedLeads: 0,
        siteVisits: 0,
        closed: 0,
        conversionRate: 0,
        avgResponseTime: 'N/A',
        followUps: 0
      };
    }
  };

  const assignLeadToAgent = async (agentId: string) => {
    // This would typically open a modal to select a lead
    // For now, just showing the functionality
    console.log('Assign lead to agent:', agentId);
  };

  const getPerformanceColor = (rate: number) => {
    if (rate >= 20) return 'text-green-600 bg-green-100';
    if (rate >= 10) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getWorkloadColor = (assigned: number, max: number) => {
    const percentage = (assigned / max) * 100;
    if (percentage >= 90) return 'text-red-600 bg-red-100';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  if (loading) {
    return (
      <div className={`agent-dashboard-loading ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading agent dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`agent-dashboard ${className}`}>
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-title">
          <Users className="text-blue-600" size={24} />
          <h2>Agent Dashboard</h2>
          <span className="agent-count">{agents.filter(a => a.isActive).length} active agents</span>
        </div>
        
        <div className="header-actions">
          <button className="add-agent-btn">
            + Add Agent
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-icon">
            <Users size={20} className="text-blue-600" />
          </div>
          <div className="card-content">
            <h3>Total Agents</h3>
            <p>{agents.length}</p>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="card-icon">
            <Target size={20} className="text-green-600" />
          </div>
          <div className="card-content">
            <h3>Total Leads Assigned</h3>
            <p>{Object.values(agentStats).reduce((sum: number, stats: any) => sum + stats.totalLeads, 0)}</p>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="card-icon">
            <TrendingUp size={20} className="text-purple-600" />
          </div>
          <div className="card-content">
            <h3>Avg Conversion Rate</h3>
            <p>
              {Object.values(agentStats).length > 0 
                ? Math.round(Object.values(agentStats).reduce((sum: number, stats: any) => sum + stats.conversionRate, 0) / Object.values(agentStats).length)
                : 0}%
            </p>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="card-icon">
            <CheckCircle size={20} className="text-emerald-600" />
          </div>
          <div className="card-content">
            <h3>Deals Closed</h3>
            <p>{Object.values(agentStats).reduce((sum: number, stats: any) => sum + stats.closed, 0)}</p>
          </div>
        </div>
      </div>

      {/* Agent List */}
      <div className="agents-list">
        <h3>Agent Performance</h3>
        <div className="agents-grid">
          {agents.map((agent, index) => {
            const stats = agentStats[agent.id] || {};
            const workloadPercentage = (agent.assignedLeads / agent.maxLeads) * 100;
            
            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`agent-card ${!agent.isActive ? 'inactive' : ''}`}
              >
                {/* Agent Header */}
                <div className="agent-header">
                  <div className="agent-info">
                    <div className="agent-avatar">
                      <User size={24} />
                    </div>
                    <div className="agent-details">
                      <h4>{agent.name}</h4>
                      <div className="agent-contact">
                        <Mail size={14} />
                        <span>{agent.email}</span>
                      </div>
                      <div className="agent-contact">
                        <Phone size={14} />
                        <span>{agent.phone}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="agent-status">
                    <span className={`status-badge ${agent.isActive ? 'active' : 'inactive'}`}>
                      {agent.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Performance Stats */}
                <div className="agent-stats">
                  <div className="stat-row">
                    <div className="stat-item">
                      <span className="stat-label">Total Leads</span>
                      <span className="stat-value">{stats.totalLeads || 0}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Interested</span>
                      <span className="stat-value">{stats.interestedLeads || 0}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Site Visits</span>
                      <span className="stat-value">{stats.siteVisits || 0}</span>
                    </div>
                  </div>
                  
                  <div className="stat-row">
                    <div className="stat-item">
                      <span className="stat-label">Closed</span>
                      <span className="stat-value">{stats.closed || 0}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Conversion</span>
                      <span className={`stat-value ${getPerformanceColor(stats.conversionRate || 0)}`}>
                        {stats.conversionRate || 0}%
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Follow-ups</span>
                      <span className="stat-value">{stats.followUps || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Workload & Actions */}
                <div className="agent-footer">
                  <div className="workload">
                    <span className="workload-label">Workload</span>
                    <div className="workload-bar">
                      <div 
                        className="workload-fill" 
                        style={{ width: `${workloadPercentage}%` }}
                      ></div>
                    </div>
                    <span className={`workload-text ${getWorkloadColor(agent.assignedLeads, agent.maxLeads)}`}>
                      {agent.assignedLeads}/{agent.maxLeads}
                    </span>
                  </div>
                  
                  <div className="agent-actions">
                    <button 
                      className="action-btn"
                      onClick={() => setSelectedAgent(agent.id)}
                    >
                      View Leads
                    </button>
                    <button 
                      className="action-btn primary"
                      onClick={() => assignLeadToAgent(agent.id)}
                      disabled={!agent.isActive || agent.assignedLeads >= agent.maxLeads}
                    >
                      Assign Lead
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .agent-dashboard {
          background: white;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          overflow: hidden;
        }

        .agent-dashboard-loading {
          background: white;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #f3f4f6;
          background: #fafafa;
        }

        .header-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-title h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
        }

        .agent-count {
          background: #e5e7eb;
          color: #6b7280;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .add-agent-btn {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .add-agent-btn:hover {
          background: #2563eb;
        }

        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          padding: 20px;
          border-bottom: 1px solid #f3f4f6;
        }

        .summary-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .card-icon {
          padding: 8px;
          background: white;
          border-radius: 8px;
        }

        .card-content h3 {
          margin: 0;
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
        }

        .card-content p {
          margin: 4px 0 0 0;
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
        }

        .agents-list {
          padding: 20px;
        }

        .agents-list h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
        }

        .agents-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 16px;
        }

        .agent-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          transition: all 0.2s;
        }

        .agent-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .agent-card.inactive {
          opacity: 0.6;
          background: #f9fafb;
        }

        .agent-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .agent-info {
          display: flex;
          gap: 12px;
          flex: 1;
        }

        .agent-avatar {
          width: 48px;
          height: 48px;
          background: #e5e7eb;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          flex-shrink: 0;
        }

        .agent-details h4 {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }

        .agent-contact {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 2px;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
        }

        .status-badge.active {
          background: #10b981;
          color: white;
        }

        .status-badge.inactive {
          background: #6b7280;
          color: white;
        }

        .agent-stats {
          margin-bottom: 16px;
        }

        .stat-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 8px;
        }

        .stat-item {
          text-align: center;
          padding: 8px;
          background: #f9fafb;
          border-radius: 6px;
        }

        .stat-label {
          display: block;
          font-size: 11px;
          color: #6b7280;
          margin-bottom: 2px;
        }

        .stat-value {
          display: block;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }

        .agent-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .workload {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
        }

        .workload-label {
          font-size: 12px;
          color: #6b7280;
          white-space: nowrap;
        }

        .workload-bar {
          flex: 1;
          height: 6px;
          background: #e5e7eb;
          border-radius: 3px;
          overflow: hidden;
          max-width: 80px;
        }

        .workload-fill {
          height: 100%;
          background: #3b82f6;
          transition: width 0.3s ease;
        }

        .workload-text {
          font-size: 11px;
          font-weight: 500;
          padding: 2px 6px;
          border-radius: 4px;
          white-space: nowrap;
        }

        .agent-actions {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          padding: 6px 12px;
          border: 1px solid #d1d5db;
          background: white;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-btn:hover:not(:disabled) {
          background: #f3f4f6;
        }

        .action-btn.primary {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .action-btn.primary:hover:not(:disabled) {
          background: #2563eb;
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .text-green-600 { color: #059669; }
        .bg-green-100 { background-color: #f0fdf4; }
        .text-yellow-600 { color: #d97706; }
        .bg-yellow-100 { background-color: #fef3c7; }
        .text-red-600 { color: #dc2626; }
        .bg-red-100 { background-color: #fef2f2; }
        .text-blue-600 { color: #2563eb; }
        .bg-blue-100 { background-color: #eff6ff; }
        .text-purple-600 { color: #9333ea; }
        .bg-purple-100 { background-color: #faf5ff; }
        .text-emerald-600 { color: #059669; }
        .bg-emerald-100 { background-color: #ecfdf5; }
      `}</style>
    </div>
  );
}
