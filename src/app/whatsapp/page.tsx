"use client";

import { useState } from "react";
import { MessageSquare, Users, BarChart3, Settings, Phone, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import dynamicNext from "next/dynamic";

// Lazy load WhatsApp components for performance
const WhatsAppInbox = dynamicNext(() => import("@/components/whatsapp/WhatsAppInbox"), { ssr: false });
const WhatsAppPipeline = dynamicNext(() => import("@/components/whatsapp/WhatsAppPipeline"), { ssr: false });
const AgentDashboard = dynamicNext(() => import("@/components/whatsapp/AgentDashboard"), { ssr: false });

export default function WhatsAppPage() {
  const [activeTab, setActiveTab] = useState<'inbox' | 'pipeline' | 'agents' | 'analytics'>('inbox');

  const tabs = [
    { id: 'inbox', label: 'Inbox', icon: MessageSquare },
    { id: 'pipeline', label: 'Pipeline', icon: TrendingUp },
    { id: 'agents', label: 'Agents', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <div className="whatsapp-page">
      {/* Page Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="page-header"
      >
        <div className="header-content">
          <div className="header-left">
            <div className="header-icon">
              <Phone size={24} className="text-green-600" />
            </div>
            <div>
              <h1 className="page-title">WhatsApp Automation</h1>
              <p className="page-subtitle">Manage leads, conversations, and agent performance</p>
            </div>
          </div>
          
          <div className="header-actions">
            <button className="settings-btn">
              <Settings size={18} />
              Settings
            </button>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="nav-tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="tab-content"
      >
        {activeTab === 'inbox' && <WhatsAppInbox />}
        {activeTab === 'pipeline' && <WhatsAppPipeline />}
        {activeTab === 'agents' && <AgentDashboard />}
        {activeTab === 'analytics' && (
          <div className="analytics-placeholder">
            <div className="placeholder-content">
              <BarChart3 size={48} className="text-gray-400" />
              <h3>Analytics Dashboard</h3>
              <p>WhatsApp analytics and reporting coming soon</p>
              <div className="placeholder-features">
                <div className="feature-item">
                  <span>📊 Response Rate Tracking</span>
                </div>
                <div className="feature-item">
                  <span>📈 Conversion Analytics</span>
                </div>
                <div className="feature-item">
                  <span>⏰ Response Time Metrics</span>
                </div>
                <div className="feature-item">
                  <span>🎯 Campaign Performance</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      <style jsx>{`
        .whatsapp-page {
          min-height: 100vh;
          background: #f9fafb;
        }

        .page-header {
          background: white;
          border-bottom: 1px solid #e5e7eb;
          padding: 24px 32px;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-icon {
          width: 48px;
          height: 48px;
          background: #f0fdf4;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .page-title {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
        }

        .page-subtitle {
          margin: 4px 0 0 0;
          font-size: 14px;
          color: #6b7280;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .settings-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border: 1px solid #d1d5db;
          background: white;
          border-radius: 8px;
          font-size: 14px;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s;
        }

        .settings-btn:hover {
          background: #f3f4f6;
          border-color: #9ca3af;
        }

        .nav-tabs {
          background: white;
          border-bottom: 1px solid #e5e7eb;
          padding: 0 32px;
          display: flex;
          gap: 8px;
        }

        .nav-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 16px 20px;
          border: none;
          background: none;
            color: #6b7280;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.2s;
        }

        .nav-tab:hover {
          color: #374151;
          background: #f9fafb;
        }

        .nav-tab.active {
          color: #10b981;
          border-bottom-color: #10b981;
          background: #f0fdf4;
        }

        .tab-content {
          padding: 24px 32px;
        }

        .analytics-placeholder {
          background: white;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          padding: 48px;
          text-align: center;
          min-height: 500px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .placeholder-content {
          max-width: 400px;
        }

        .placeholder-content h3 {
          margin: 16px 0 8px 0;
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
        }

        .placeholder-content p {
          margin: 0 0 24px 0;
          font-size: 14px;
          color: #6b7280;
        }

        .placeholder-features {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          text-align: left;
        }

        .feature-item {
          padding: 12px;
          background: #f9fafb;
          border-radius: 8px;
          font-size: 13px;
          color: #4b5563;
          border: 1px solid #e5e7eb;
        }
      `}</style>
    </div>
  );
}
