"use client";

import { useState, useEffect } from "react";
import { Phone, User, MapPin, DollarSign, Calendar, MessageSquare, Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { leadAutomationService, Lead, LeadStatus } from "@/lib/lead-automation";

interface WhatsAppPipelineProps {
  className?: string;
}

const statusColors: Record<LeadStatus, string> = {
  'New Lead': 'bg-blue-100 text-blue-800 border-blue-200',
  'Not Called Yet': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Called': 'bg-purple-100 text-purple-800 border-purple-200',
  'Interested': 'bg-green-100 text-green-800 border-green-200',
  'Site Visit Scheduled': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Negotiation': 'bg-orange-100 text-orange-800 border-orange-200',
  'Closed': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Not Interested': 'bg-red-100 text-red-800 border-red-200'
};

const statusIcons: Record<LeadStatus, React.ReactNode> = {
  'New Lead': <AlertCircle size={16} />,
  'Not Called Yet': <Clock size={16} />,
  'Called': <Phone size={16} />,
  'Interested': <MessageSquare size={16} />,
  'Site Visit Scheduled': <Calendar size={16} />,
  'Negotiation': <DollarSign size={16} />,
  'Closed': <CheckCircle size={16} />,
  'Not Interested': <XCircle size={16} />
};

export default function WhatsAppPipeline({ className = "" }: WhatsAppPipelineProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadLeads();
  }, [selectedStatus, searchTerm]);

  const loadLeads = async () => {
    try {
      setLoading(true);
      let allLeads: Lead[] = [];

      if (selectedStatus === 'all') {
        // Get leads from all statuses
        const statuses: LeadStatus[] = [
          'New Lead', 'Not Called Yet', 'Called', 'Interested',
          'Site Visit Scheduled', 'Negotiation', 'Closed', 'Not Interested'
        ];
        
        for (const status of statuses) {
          const statusLeads = await leadAutomationService.getLeadsByStatus(status);
          allLeads = [...allLeads, ...statusLeads];
        }
      } else {
        allLeads = await leadAutomationService.getLeadsByStatus(selectedStatus);
      }

      // Filter by search term
      if (searchTerm) {
        allLeads = allLeads.filter(lead => 
          lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.phone.includes(searchTerm) ||
          lead.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.budget?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setLeads(allLeads);
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: LeadStatus) => {
    try {
      await leadAutomationService.updateLeadStatus(leadId, newStatus);
      loadLeads(); // Refresh the pipeline
    } catch (error) {
      console.error('Error updating lead status:', error);
    }
  };

  const getStatusCount = (status: LeadStatus): number => {
    return leads.filter(lead => lead.status === status).length;
  };

  const pipelineStages: LeadStatus[] = [
    'New Lead',
    'Not Called Yet',
    'Called',
    'Interested',
    'Site Visit Scheduled',
    'Negotiation',
    'Closed',
    'Not Interested'
  ];

  if (loading) {
    return (
      <div className={`whatsapp-pipeline-loading ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading WhatsApp leads...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`whatsapp-pipeline ${className}`}>
      {/* Header */}
      <div className="pipeline-header">
        <div className="pipeline-title">
          <MessageSquare className="text-green-600" size={24} />
          <h2>WhatsApp Lead Pipeline</h2>
          <span className="lead-count">{leads.length} leads</span>
        </div>
        
        {/* Controls */}
        <div className="pipeline-controls">
          <input
            type="text"
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as LeadStatus | 'all')}
            className="status-filter"
          >
            <option value="all">All Statuses</option>
            {pipelineStages.map(status => (
              <option key={status} value={status}>
                {status} ({getStatusCount(status)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Pipeline Stages */}
      <div className="pipeline-stages">
        {pipelineStages.map(status => {
          const stageLeads = leads.filter(lead => lead.status === status);
          
          return (
            <div key={status} className="pipeline-stage">
              <div className={`stage-header ${statusColors[status]}`}>
                <div className="stage-info">
                  {statusIcons[status]}
                  <h3>{status}</h3>
                  <span className="stage-count">{stageLeads.length}</span>
                </div>
              </div>
              
              <div className="stage-leads">
                <AnimatePresence>
                  {stageLeads.map(lead => (
                    <motion.div
                      key={lead.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="lead-card"
                      layout
                    >
                      <div className="lead-header">
                        <div className="lead-info">
                          <h4 className="lead-name">
                            {lead.name || 'Unknown'}
                          </h4>
                          <div className="lead-contact">
                            <Phone size={14} />
                            <span>{lead.phone}</span>
                          </div>
                        </div>
                        
                        <div className="lead-source">
                          <span className="source-badge">WhatsApp</span>
                        </div>
                      </div>
                      
                      <div className="lead-details">
                        {lead.budget && (
                          <div className="lead-detail">
                            <DollarSign size={14} />
                            <span>{lead.budget}</span>
                          </div>
                        )}
                        
                        {lead.location && (
                          <div className="lead-detail">
                            <MapPin size={14} />
                            <span>{lead.location}</span>
                          </div>
                        )}
                        
                        {lead.assignedAgent && (
                          <div className="lead-detail">
                            <User size={14} />
                            <span>{lead.assignedAgent}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="lead-footer">
                        <div className="lead-tags">
                          {lead.tags.map((tag, index) => (
                            <span key={index} className="lead-tag">
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        <div className="lead-time">
                          <Clock size={12} />
                          <span>
                            {new Date(lead.lastMessageAt?.toDate?.() || lead.createdAt?.toDate?.() || Date.now()).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      {/* Status Change Buttons */}
                      <div className="lead-actions">
                        <select
                          value={lead.status}
                          onChange={(e) => updateLeadStatus(lead.id, e.target.value as LeadStatus)}
                          className="status-select"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {pipelineStages.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {stageLeads.length === 0 && (
                  <div className="empty-stage">
                    <p>No leads in this stage</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .whatsapp-pipeline {
          background: white;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          overflow: hidden;
        }

        .whatsapp-pipeline-loading {
          background: white;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }

        .pipeline-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #f3f4f6;
          background: #fafafa;
        }

        .pipeline-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .pipeline-title h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
        }

        .lead-count {
          background: #e5e7eb;
          color: #6b7280;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .pipeline-controls {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .search-input {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }

        .search-input:focus {
          border-color: #10b981;
        }

        .status-filter {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          background: white;
        }

        .pipeline-stages {
          display: flex;
          gap: 16px;
          padding: 20px;
          overflow-x: auto;
          min-height: 600px;
        }

        .pipeline-stage {
          flex: 0 0 300px;
          display: flex;
          flex-direction: column;
        }

        .stage-header {
          padding: 12px 16px;
          border-radius: 8px 8px 0 0;
          margin-bottom: 8px;
        }

        .stage-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .stage-info h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          flex: 1;
        }

        .stage-count {
          background: rgba(0, 0, 0, 0.1);
          padding: 2px 6px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 500;
        }

        .stage-leads {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-height: 400px;
        }

        .lead-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .lead-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .lead-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .lead-info h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }

        .lead-contact {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #6b7280;
          font-size: 14px;
          margin-top: 4px;
        }

        .source-badge {
          background: #10b981;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
        }

        .lead-details {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 12px;
        }

        .lead-detail {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #6b7280;
          font-size: 13px;
        }

        .lead-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .lead-tags {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }

        .lead-tag {
          background: #f3f4f6;
          color: #6b7280;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 11px;
        }

        .lead-time {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #9ca3af;
          font-size: 11px;
        }

        .lead-actions {
          margin-top: 8px;
        }

        .status-select {
          width: 100%;
          padding: 6px 8px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 12px;
          outline: none;
          background: white;
        }

        .empty-stage {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100px;
          color: #9ca3af;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}
