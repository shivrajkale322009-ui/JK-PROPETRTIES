"use client";

import { UserPlus, Shield, Users, Mail, Bell, RefreshCcw, CreditCard, ChevronRight, CheckCircle2, MoreVertical, Plus, Trash2, Home, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { metadataService, Metadata } from '@/lib/metadata-service';
import { useState, useEffect } from 'react';

const AdminPanel = () => {
  const [metadata, setMetadata] = useState<Metadata>({ propertyTypes: [], leadSources: [] });
  const [newPropType, setNewPropType] = useState("");
  const [newSource, setNewSource] = useState("");

  useEffect(() => {
    const unsub = metadataService.subscribe(setMetadata);
    return () => unsub();
  }, []);

  const addPropertyType = async () => {
    if (!newPropType.trim()) return;
    const updated = [...metadata.propertyTypes, newPropType.trim()];
    await metadataService.updateMetadata({ propertyTypes: updated });
    setNewPropType("");
  };

  const removePropertyType = async (index: number) => {
    const updated = metadata.propertyTypes.filter((_, i) => i !== index);
    await metadataService.updateMetadata({ propertyTypes: updated });
  };

  const addLeadSource = async () => {
    if (!newSource.trim()) return;
    const updated = [...metadata.leadSources, newSource.trim()];
    await metadataService.updateMetadata({ leadSources: updated });
    setNewSource("");
  };

  const removeLeadSource = async (index: number) => {
    const updated = metadata.leadSources.filter((_, i) => i !== index);
    await metadataService.updateMetadata({ leadSources: updated });
  };

  const staff = [
    { name: "Admin User", email: "admin@jkproperties.com", role: "Super Admin", performance: 100, initials: "AU" },
    { name: "Rohit Verma", email: "rohit@jkproperties.com", role: "Sales Manager", performance: 85, initials: "RV" },
    { name: "Sneha Patil", email: "sneha@jkproperties.com", role: "Lead Agent", performance: 92, initials: "SP" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="mobile-view">
      <header className="app-bar">
        <div className="app-bar-content">
          <div>
            <h1 className="native-title">Admin Settings</h1>
            <p className="native-subtitle">System & Staff Management</p>
          </div>
          <button className="icon-btn-gold ripple">
            <UserPlus size={20} />
          </button>
        </div>
      </header>

      <motion.div 
        className="content-area"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Staff Management Section */}
        <motion.section variants={itemVariants} className="mb-6">
          <div className="native-section-header">
            <h3>Staff Management</h3>
            <span className="view-link">{staff.length} Active</span>
          </div>
          
          <div className="staff-grid">
            {staff.map((s, i) => (
              <div key={i} className="staff-card-modern ripple">
                <div className="staff-avatar-wrapper">
                  <div className="staff-avatar-gold">{s.initials}</div>
                  {s.performance > 90 && <CheckCircle2 size={14} className="verified-badge" />}
                </div>
                
                <div className="staff-details">
                  <div className="staff-main-info">
                    <p className="staff-name">{s.name}</p>
                    <p className="staff-email">{s.email}</p>
                  </div>
                  
                  <div className="staff-badges">
                    <span className={`role-badge ${s.role.toLowerCase().replace(' ', '-')}`}>{s.role}</span>
                    <div className="perf-meter-mini">
                      <div className="perf-bar" style={{ width: `${s.performance}%` }}></div>
                      <span className="perf-val">{s.performance}%</span>
                    </div>
                  </div>
                </div>
                
                <button className="more-btn">
                  <MoreVertical size={18} />
                </button>
              </div>
            ))}
          </div>
        </motion.section>

        {/* System Preferences */}
        <motion.section variants={itemVariants} className="mb-6">
          <div className="native-section-header">
            <h3>System Preferences</h3>
          </div>
          
          <div className="pref-container-modern">
            {/* ... (existing pref rows) ... */}
            <div className="pref-row-modern">
              <div className="pref-icon-box bg-gold-soft">
                <CreditCard size={18} className="text-gold" />
              </div>
              <div className="pref-info">
                <p className="pref-label">Default Currency</p>
                <p className="pref-desc">Global transaction currency</p>
              </div>
              <select className="pref-select-modern">
                <option>INR (₹)</option>
                <option>USD ($)</option>
                <option>AED (د.إ)</option>
              </select>
            </div>

            <div className="pref-row-modern">
              <div className="pref-icon-box bg-blue-soft">
                <Bell size={18} className="text-blue" />
              </div>
              <div className="pref-info">
                <p className="pref-label">Notification Alerts</p>
                <p className="pref-desc">In-app and push notifications</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>

            <div className="pref-row-modern">
              <div className="pref-icon-box bg-green-soft">
                <RefreshCcw size={18} className="text-green" />
              </div>
              <div className="pref-info">
                <p className="pref-label">Auto Lead Assignment</p>
                <p className="pref-desc">Round-robin agent distribution</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </motion.section>

        {/* Dynamic Metadata Management */}
        <motion.section variants={itemVariants} className="mb-6">
          <div className="native-section-header">
            <h3>Property Types</h3>
          </div>
          <div className="metadata-manager-card">
            <div className="metadata-input-row">
              <input 
                type="text" 
                placeholder="Add new type (e.g. 4BHK)" 
                value={newPropType}
                onChange={e => setNewPropType(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && addPropertyType()}
              />
              <button onClick={addPropertyType} className="add-btn-circle"><Plus size={18}/></button>
            </div>
            <div className="metadata-list-chips">
              {metadata.propertyTypes.map((type, i) => (
                <div key={i} className="meta-chip">
                  <span>{type}</span>
                  <button onClick={() => removePropertyType(i)}><Trash2 size={12}/></button>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section variants={itemVariants} className="mb-6">
          <div className="native-section-header">
            <h3>Lead Sources</h3>
          </div>
          <div className="metadata-manager-card">
            <div className="metadata-input-row">
              <input 
                type="text" 
                placeholder="Add new source (e.g. TikTok)" 
                value={newSource}
                onChange={e => setNewSource(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && addLeadSource()}
              />
              <button onClick={addLeadSource} className="add-btn-circle"><Plus size={18}/></button>
            </div>
            <div className="metadata-list-chips">
              {metadata.leadSources.map((source, i) => (
                <div key={i} className="meta-chip">
                  <span>{source}</span>
                  <button onClick={() => removeLeadSource(i)}><Trash2 size={12}/></button>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Security Section Placeholder */}
        <motion.section variants={itemVariants} className="mt-6">
          <div className="security-banner-modern">
            <div className="security-content">
              <Shield size={24} className="text-gold" />
              <div>
                <p className="security-title">Security & Access</p>
                <p className="security-text">Configure RBAC and API security settings</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-muted" />
          </div>
        </motion.section>
      </motion.div>

      <style jsx>{`
        .mb-6 { margin-bottom: 1.5rem; }
        .mt-6 { margin-top: 1.5rem; }
        
        .staff-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .staff-card-modern {
          background: white;
          padding: 12px 16px;
          border-radius: 16px;
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: var(--shadow);
          transition: all 0.2s;
        }

        .staff-avatar-wrapper {
          position: relative;
        }

        .staff-avatar-gold {
          width: 44px;
          height: 44px;
          background: var(--beige);
          color: var(--accent);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.9rem;
        }

        .verified-badge {
          position: absolute;
          bottom: -2px;
          right: -2px;
          background: var(--success);
          color: white;
          border-radius: 50%;
          border: 2px solid white;
        }

        .staff-details {
          flex: 1;
        }

        .staff-name {
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--sidebar-bg);
          margin-bottom: 2px;
        }

        .staff-email {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .staff-badges {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 8px;
        }

        .role-badge {
          font-size: 0.65rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
          text-transform: uppercase;
        }

        .super-admin { background: #fee2e2; color: #ef4444; }
        .sales-manager { background: #dcfce7; color: #10b981; }
        .lead-agent { background: #e0f2fe; color: #0ea5e9; }

        .perf-meter-mini {
          flex: 1;
          height: 6px;
          background: #f1f5f9;
          border-radius: 10px;
          position: relative;
          max-width: 80px;
        }

        .perf-bar {
          height: 100%;
          background: var(--accent);
          border-radius: 10px;
        }

        .perf-val {
          position: absolute;
          right: -30px;
          top: -6px;
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--text-muted);
        }

        .more-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }

        .pref-container-modern {
          background: white;
          border-radius: 20px;
          border: 1px solid var(--border);
          overflow: hidden;
          box-shadow: var(--shadow);
        }

        .pref-row-modern {
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 16px;
          border-bottom: 1px solid var(--border);
        }

        .pref-row-modern:last-child { border-bottom: none; }

        .pref-icon-box {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bg-gold-soft { background: rgba(197, 160, 89, 0.1); }
        .bg-blue-soft { background: rgba(14, 165, 233, 0.1); }
        .bg-green-soft { background: rgba(16, 185, 129, 0.1); }

        .text-gold { color: var(--accent); }
        .text-blue { color: #0ea5e9; }
        .text-green { color: #10b981; }

        .pref-info { flex: 1; }
        .pref-label { font-weight: 700; font-size: 0.9rem; margin-bottom: 2px; }
        .pref-desc { font-size: 0.7rem; color: var(--text-muted); }

        .pref-select-modern {
          border: 1px solid var(--border);
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--sidebar-bg);
          outline: none;
        }

        /* Toggle Switch */
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
        }

        .toggle-switch input { opacity: 0; width: 0; height: 0; }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: #e2e8f0;
          transition: .4s;
          border-radius: 34px;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 18px; width: 18px;
          left: 3px; bottom: 3px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }

        input:checked + .slider { background-color: var(--accent); }
        input:checked + .slider:before { transform: translateX(20px); }

        .security-banner-modern {
          background: white;
          padding: 16px;
          border-radius: 20px;
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: var(--shadow);
        }

        .security-content {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .security-title { font-weight: 700; font-size: 0.9rem; }
        .security-text { font-size: 0.75rem; color: var(--text-muted); }

        .metadata-manager-card {
          background: white;
          padding: 16px;
          border-radius: 20px;
          border: 1px solid var(--border);
          box-shadow: var(--shadow);
        }

        .metadata-input-row {
          display: flex;
          gap: 10px;
          margin-bottom: 16px;
        }

        .metadata-input-row input {
          flex: 1;
          border: 1px solid var(--border);
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 0.9rem;
          outline: none;
        }

        .add-btn-circle {
          width: 40px;
          height: 40px;
          background: var(--sidebar-bg);
          color: white;
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .metadata-list-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .meta-chip {
          background: var(--beige);
          color: var(--sidebar-bg);
          padding: 6px 12px;
          border-radius: 100px;
          font-size: 0.8rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid rgba(197, 160, 89, 0.2);
        }

        .meta-chip button {
          background: transparent;
          border: none;
          color: var(--danger);
          display: flex;
          align-items: center;
          cursor: pointer;
          opacity: 0.6;
        }

        .meta-chip button:hover { opacity: 1; }
      `}</style>
    </div>
  );
};

export default AdminPanel;
