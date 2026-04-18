"use client";

import { useState, useEffect } from "react";
import { Phone, Send, User, Clock, CheckCircle, Paperclip, Smile, Search, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { leadAutomationService, Lead, ChatMessage } from "@/lib/lead-automation";
import { whatsappService } from "@/lib/whatsapp";

interface WhatsAppInboxProps {
  className?: string;
}

export default function WhatsAppInbox({ className = "" }: WhatsAppInboxProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    loadLeads();
  }, []);

  useEffect(() => {
    if (selectedLead) {
      loadMessages(selectedLead.id);
    }
  }, [selectedLead]);

  const loadLeads = async () => {
    try {
      setLoading(true);
      // Get WhatsApp leads only
      let allLeads: Lead[] = [];
      const statuses = ['New Lead', 'Not Called Yet', 'Called', 'Interested', 'Site Visit Scheduled', 'Negotiation', 'Closed', 'Not Interested'];
      
      if (whatsappService.isConfigured()) {
        for (const status of statuses) {
          const statusLeads = await leadAutomationService.getLeadsByStatus(status as any);
          allLeads.push(...statusLeads.filter(lead => lead.source === 'WhatsApp'));
        }
      }

      // If no leads found and not configured, show demo data
      if (allLeads.length === 0) {
        allLeads = [
          {
            id: 'demo_1',
            name: 'Demo Lead: Aarav Mehta',
            phone: '+91 98765 43210',
            status: 'Interested',
            source: 'WhatsApp',
            location: 'Gurgaon, Sector 45',
            budget: '1.5 Cr - 2 Cr',
            createdAt: new Date(),
            updatedAt: new Date(),
            chatHistory: [
              { id: 'm1', text: 'Hi, I am interested in your 3BHK properties in Gurgaon.', sender: 'customer', timestamp: new Date(Date.now() - 3600000) },
              { id: 'm2', text: 'Hello Aarav! We have some great options. What is your budget?', sender: 'agent', timestamp: new Date(Date.now() - 3500000) },
              { id: 'm3', text: 'Around 1.5 to 2 Crores.', sender: 'customer', timestamp: new Date(Date.now() - 3400000) }
            ],
            tags: ['Hot Lead'],
            whatsappOptIn: true
          },
          {
            id: 'demo_2',
            name: 'Demo Lead: Ishita Kaur',
            phone: '+91 99887 76655',
            status: 'New Lead',
            source: 'WhatsApp',
            location: 'Noida, Sector 150',
            budget: '80 L - 1.2 Cr',
            createdAt: new Date(),
            updatedAt: new Date(),
            chatHistory: [
              { id: 'm4', text: 'Looking for ready to move properties.', sender: 'customer', timestamp: new Date(Date.now() - 7200000) }
            ],
            tags: ['Ready to Move'],
            whatsappOptIn: true
          }
        ];
      }

      setLeads(allLeads);
      
      // Select first lead by default
      if (allLeads.length > 0 && !selectedLead) {
        setSelectedLead(allLeads[0]);
      }
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (leadId: string) => {
    try {
      const lead = await leadAutomationService.getLead(leadId);
      if (lead) {
        setMessages(lead.chatHistory || []);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: any) => {
    try {
      await leadAutomationService.updateLeadStatus(leadId, newStatus);
      // Update local state for the selected lead
      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead({ ...selectedLead, status: newStatus });
      }
      // Refresh the leads list to show updated status
      loadLeads();
    } catch (error) {
      console.error('Error updating lead status:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedLead) return;

    // Demo Mode handling
    if (selectedLead.id.startsWith('demo_') || !whatsappService.isConfigured()) {
      const chatMessage: ChatMessage = {
        id: `demo_${Date.now()}`,
        text: newMessage,
        sender: 'agent',
        timestamp: new Date(),
        status: 'sent'
      };
      
      setMessages(prev => [...prev, chatMessage]);
      setNewMessage("");
      
      // Optional: Add a small delay and then a bot reply for demo feel
      setTimeout(() => {
        const botReply: ChatMessage = {
          id: `demo_reply_${Date.now()}`,
          text: "This is a demo reply. In production, this would be sent via the WhatsApp Business API.",
          sender: 'customer',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botReply]);
      }, 1000);
      
      return;
    }

    try {
      setSendingMessage(true);

      // Send via WhatsApp API
      const result = await whatsappService.sendTextMessage(selectedLead.phone, newMessage);
      
      if (result.success) {
        // Add to chat history
        const chatMessage: ChatMessage = {
          id: `agent_${Date.now()}`,
          text: newMessage,
          sender: 'agent',
          timestamp: new Date(),
          messageId: result.messageId,
          status: 'sent'
        };

        await leadAutomationService.addChatMessage(selectedLead.id, chatMessage);
        
        // Update local state
        setMessages(prev => [...prev, chatMessage]);
        setNewMessage("");
      } else {
        console.error('Failed to send message:', result.error);
        // Show error to user
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const formatTime = (timestamp: any) => {
    const date = timestamp?.toDate?.() || new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp: any) => {
    const date = timestamp?.toDate?.() || new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getLeadStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'New Lead': 'bg-blue-100 text-blue-800',
      'Not Called Yet': 'bg-yellow-100 text-yellow-800',
      'Called': 'bg-purple-100 text-purple-800',
      'Interested': 'bg-green-100 text-green-800',
      'Site Visit Scheduled': 'bg-indigo-100 text-indigo-800',
      'Negotiation': 'bg-orange-100 text-orange-800',
      'Closed': 'bg-emerald-100 text-emerald-800',
      'Not Interested': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.phone.includes(searchTerm) ||
                         lead.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || lead.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className={`whatsapp-inbox-loading ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Loading WhatsApp inbox...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`whatsapp-inbox ${className}`}>
      <div className="inbox-layout">
        {/* Sidebar - Lead List */}
        <div className="inbox-sidebar">
          <div className="inbox-header">
            <h2>WhatsApp Inbox</h2>
            <div className="inbox-controls">
              <div className="search-box">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="New Lead">New Lead</option>
                <option value="Interested">Interested</option>
                <option value="Site Visit Scheduled">Site Visit</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="leads-list">
            <AnimatePresence>
              {filteredLeads.map(lead => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`lead-item ${selectedLead?.id === lead.id ? 'selected' : ''}`}
                  onClick={() => setSelectedLead(lead)}
                  whileHover={{ backgroundColor: '#f9fafb' }}
                >
                  <div className="lead-avatar">
                    <User size={20} />
                  </div>
                  
                  <div className="lead-content">
                    <div className="lead-header">
                      <h4 className="lead-name">
                        {lead.name || 'Unknown'}
                      </h4>
                      <span className="lead-time">
                        {formatDate(lead.lastMessageAt || lead.createdAt)}
                      </span>
                    </div>
                    
                    <div className="lead-phone">
                      <Phone size={14} />
                      <span>{lead.phone}</span>
                    </div>
                    
                    <div className="lead-preview">
                      {lead.chatHistory?.slice(-1)[0]?.text || 'No messages yet'}
                    </div>
                    
                    <div className="lead-meta">
                      <span className={`lead-status ${getLeadStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                      {lead.location && (
                        <span className="lead-location">{lead.location}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredLeads.length === 0 && (
              <div className="empty-inbox">
                <p>No WhatsApp leads found</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Content - Chat */}
        <div className="chat-container">
          {selectedLead ? (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                <div className="chat-lead-info">
                  <div className="chat-avatar">
                    <User size={24} />
                  </div>
                  <div className="chat-lead-details">
                    <h3>{selectedLead.name || 'Unknown'}</h3>
                    <div className="chat-lead-meta">
                      <Phone size={14} />
                      <span>{selectedLead.phone}</span>
                      <select 
                        className={`lead-status-select ${getLeadStatusColor(selectedLead.status)}`}
                        value={selectedLead.status}
                        onChange={(e) => updateLeadStatus(selectedLead.id, e.target.value as any)}
                        style={{ border: 'none', borderRadius: '4px', padding: '2px 8px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
                      >
                        <option value="New Lead">New Lead</option>
                        <option value="Not Called Yet">Not Called Yet</option>
                        <option value="Called">Called</option>
                        <option value="Interested">Interested</option>
                        <option value="Site Visit Scheduled">Site Visit Scheduled</option>
                        <option value="Negotiation">Negotiation</option>
                        <option value="Closed">Closed</option>
                        <option value="Not Interested">Not Interested</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="chat-actions">
                  {selectedLead.budget && (
                    <div className="chat-budget">
                      <span>Budget: {selectedLead.budget}</span>
                    </div>
                  )}
                  {selectedLead.location && (
                    <div className="chat-location">
                      <span>📍 {selectedLead.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="chat-messages">
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`message ${message.sender}`}
                    >
                      <div className="message-content">
                        <p>{message.text}</p>
                        <div className="message-meta">
                          <span className="message-time">
                            {formatTime(message.timestamp)}
                          </span>
                          {message.sender === 'agent' && (
                            <CheckCircle size={12} className="message-status" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Message Input */}
              <div className="message-input">
                <div className="input-container">
                  <button className="input-btn">
                    <Paperclip size={20} />
                  </button>
                  
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="message-field"
                  />
                  
                  <button className="input-btn">
                    <Smile size={20} />
                  </button>
                  
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sendingMessage}
                    className="send-btn"
                  >
                    {sendingMessage ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Send size={20} />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-chat">
              <div className="empty-chat-content">
                <Phone size={48} className="text-gray-400" />
                <h3>Select a conversation</h3>
                <p>Choose a lead from the sidebar to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .whatsapp-inbox {
          background: white;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          height: 700px;
          overflow: hidden;
        }

        .whatsapp-inbox-loading {
          background: white;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          height: 700px;
        }

        .inbox-layout {
          display: flex;
          height: 100%;
        }

        .inbox-sidebar {
          width: 380px;
          border-right: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
        }

        .inbox-header {
          padding: 20px;
          border-bottom: 1px solid #f3f4f6;
        }

        .inbox-header h2 {
          margin: 0 0 16px 0;
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
        }

        .inbox-controls {
          display: flex;
          gap: 8px;
        }

        .search-box {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-box svg {
          position: absolute;
          left: 12px;
          color: #6b7280;
        }

        .search-box input {
          width: 100%;
          padding: 8px 12px 8px 36px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
        }

        .filter-select {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          background: white;
        }

        .leads-list {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
        }

        .lead-item {
          display: flex;
          gap: 12px;
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
          margin-bottom: 4px;
          transition: all 0.2s;
        }

        .lead-item.selected {
          background: #f0fdf4;
          border: 1px solid #10b981;
        }

        .lead-avatar {
          width: 40px;
          height: 40px;
          background: #e5e7eb;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          flex-shrink: 0;
        }

        .lead-content {
          flex: 1;
          min-width: 0;
        }

        .lead-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .lead-name {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .lead-time {
          font-size: 12px;
          color: #6b7280;
        }

        .lead-phone {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 4px;
        }

        .lead-preview {
          font-size: 13px;
          color: #4b5563;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 6px;
        }

        .lead-meta {
          display: flex;
          gap: 6px;
          align-items: center;
        }

        .lead-status {
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 500;
        }

        .lead-location {
          font-size: 11px;
          color: #6b7280;
        }

        .empty-inbox {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 200px;
          color: #9ca3af;
        }

        .chat-container {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .chat-header {
          padding: 20px;
          border-bottom: 1px solid #f3f4f6;
          background: #fafafa;
        }

        .chat-lead-info {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .chat-avatar {
          width: 48px;
          height: 48px;
          background: #e5e7eb;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
        }

        .chat-lead-details h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
        }

        .chat-lead-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #6b7280;
        }

        .chat-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .chat-budget,
        .chat-location {
          padding: 4px 8px;
          background: #f3f4f6;
          border-radius: 4px;
          font-size: 12px;
          color: #4b5563;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .message {
          display: flex;
          max-width: 70%;
        }

        .message.customer {
          align-self: flex-start;
        }

        .message.agent,
        .message.bot {
          align-self: flex-end;
        }

        .message-content {
          padding: 12px 16px;
          border-radius: 12px;
          max-width: 100%;
        }

        .message.customer .message-content {
          background: #f3f4f6;
          color: #1f2937;
          border-bottom-left-radius: 4px;
        }

        .message.agent .message-content,
        .message.bot .message-content {
          background: #10b981;
          color: white;
          border-bottom-right-radius: 4px;
        }

        .message-content p {
          margin: 0;
          font-size: 14px;
          line-height: 1.4;
        }

        .message-meta {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 4px;
          font-size: 11px;
          opacity: 0.7;
        }

        .message-status {
          color: #10b981;
        }

        .message-input {
          padding: 20px;
          border-top: 1px solid #f3f4f6;
        }

        .input-container {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 24px;
          padding: 4px;
        }

        .input-btn {
          padding: 8px;
          border: none;
          background: none;
          color: #6b7280;
          cursor: pointer;
          border-radius: 50%;
          transition: background 0.2s;
        }

        .input-btn:hover {
          background: #e5e7eb;
        }

        .message-field {
          flex: 1;
          padding: 8px 12px;
          border: none;
          background: none;
          outline: none;
          font-size: 14px;
        }

        .send-btn {
          padding: 8px;
          border: none;
          background: #10b981;
          color: white;
          cursor: pointer;
          border-radius: 50%;
          transition: background 0.2s;
        }

        .send-btn:hover:not(:disabled) {
          background: #059669;
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .empty-chat {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .empty-chat-content {
          text-align: center;
          color: #6b7280;
        }

        .empty-chat-content h3 {
          margin: 16px 0 8px 0;
          font-size: 18px;
          font-weight: 600;
        }

        .empty-chat-content p {
          margin: 0;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}
