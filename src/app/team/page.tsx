"use client";

import { Plus, ShieldCheck, UserCheck, UsersRound } from "lucide-react";

const TEAM_METRICS = [
  {
    id: "total-members",
    label: "Total Members",
    value: "12",
    icon: UsersRound,
  },
  {
    id: "active-agents",
    label: "Active Agents",
    value: "9",
    icon: UserCheck,
  },
  {
    id: "role-types",
    label: "Role Types",
    value: "4",
    icon: ShieldCheck,
  },
];

const TEAM_MEMBERS = [
  { id: "1", name: "Shivraj Kale", role: "Administrator", status: "Active" },
  { id: "2", name: "Riya Sharma", role: "Sales Manager", status: "Active" },
  { id: "3", name: "Aman Verma", role: "Sales Agent", status: "On Leave" },
  { id: "4", name: "Neha Patil", role: "Sales Agent", status: "Active" },
];

const sectionContainerStyle = {
  background: "white",
  borderRadius: 16,
  border: "1px solid var(--border)",
};

export default function TeamPage() {
  return (
    <div className="mobile-view compact-crm">
      <div className="app-bar compact-app-bar">
        <div className="app-bar-left">
          <h1 className="native-title compact">Team Management</h1>
        </div>
      </div>

      <div className="content-area compact-mode">
        <div className="task-banner" style={{ background: "var(--sidebar-bg)" }}>
          <div className="task-banner-text">
            <h4>Sales Team</h4>
            <p>Manage your agents, responsibilities, and role-based access.</p>
          </div>
          <button className="banner-action-btn">
            <Plus size={14} style={{ marginRight: 4 }} /> Add Agent
          </button>
        </div>

        <div
          style={{
            ...sectionContainerStyle,
            display: "grid",
            gap: 12,
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            padding: "16px",
            marginBottom: "12px",
          }}
        >
          {TEAM_METRICS.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.id}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: "12px",
                  background: "var(--surface, #fff)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <strong style={{ fontSize: 16 }}>{metric.value}</strong>
                  <Icon size={16} style={{ opacity: 0.7 }} />
                </div>
                <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
                  {metric.label}
                </span>
              </div>
            );
          })}
        </div>

        <div style={{ ...sectionContainerStyle, padding: "18px" }}>
          <h4 style={{ margin: "0 0 12px 0" }}>Team Directory</h4>
          <div style={{ display: "grid", gap: 10 }}>
            {TEAM_MEMBERS.map((member) => (
              <div
                key={member.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: "10px 12px",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{member.name}</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    {member.role}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 12,
                    padding: "4px 8px",
                    borderRadius: 999,
                    border: "1px solid var(--border)",
                    background:
                      member.status === "Active"
                        ? "rgba(34,197,94,0.10)"
                        : "rgba(245,158,11,0.12)",
                    color:
                      member.status === "Active"
                        ? "rgb(21,128,61)"
                        : "rgb(180,83,9)",
                  }}
                >
                  {member.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
