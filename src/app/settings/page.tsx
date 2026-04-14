"use client";

import { UserPlus, Shield, Users, Mail } from 'lucide-react';

const AdminPanel = () => {
  const staff = [
    { name: "Admin User", email: "admin@jkproperties.com", role: "Super Admin", performance: "100%" },
    { name: "Rohit Verma", email: "rohit@jkproperties.com", role: "Sales Manager", performance: "85%" },
    { name: "Sneha Patil", email: "sneha@jkproperties.com", role: "Lead Agent", performance: "92%" },
  ];

  return (
    <div className="container animate-fade">
      <header className="page-header">
        <h1>Admin Settings</h1>
        <button className="btn-primary">
          <UserPlus size={18} />
          Add Staff Member
        </button>
      </header>

      <div className="settings-grid">
        <section className="card">
          <div className="section-header">
            <Users size={20} />
            <h2>Staff Management</h2>
          </div>
          <div className="staff-list">
            {staff.map((s, i) => (
              <div key={i} className="staff-item">
                <div className="staff-info">
                  <p className="name">{s.name}</p>
                  <p className="email">{s.email}</p>
                </div>
                <div className="staff-meta">
                  <span className="role">{s.role}</span>
                  <span className="perf">Perf: {s.performance}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <div className="section-header">
            <Shield size={20} />
            <h2>System Preferences</h2>
          </div>
          <div className="pref-form">
            <div className="pref-item">
              <label>Default Currency</label>
              <select><option>INR (₹)</option></select>
            </div>
            <div className="pref-item">
              <label>Notification Alerts</label>
              <div className="toggle-group">
                <span>Enabled</span>
                <input type="checkbox" checked readOnly />
              </div>
            </div>
            <div className="pref-item">
              <label>Automatic Lead Assignment</label>
              <div className="toggle-group">
                <span>Round Robin</span>
                <input type="checkbox" checked readOnly />
              </div>
            </div>
          </div>
        </section>
      </div>

    </div>
  );
};

export default AdminPanel;
