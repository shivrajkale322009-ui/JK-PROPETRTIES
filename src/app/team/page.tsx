"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  ShieldCheck,
  UserCheck,
  UsersRound,
  UserPlus,
  X,
} from "lucide-react";
import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect } from "react";

type TeamStatus = "Active" | "On Leave" | "Inactive";
type TeamRole = "Administrator" | "Sales Manager" | "Sales Agent";
type TeamMember = {
  id: string;
  email: string;
  name: string;
  role: TeamRole;
  status: TeamStatus;
};

const ROLE_OPTIONS: Array<"All" | TeamRole> = ["All", "Administrator", "Sales Manager", "Sales Agent"];
const STATUS_OPTIONS: Array<"All" | TeamStatus> = ["All", "Active", "On Leave", "Inactive"];

const sectionContainerStyle = {
  background: "white",
  borderRadius: 16,
  border: "1px solid var(--border)",
};

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<"All" | TeamRole>("All");
  const [selectedStatus, setSelectedStatus] = useState<"All" | TeamStatus>("All");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<TeamRole>("Sales Agent");
  const [newStatus, setNewStatus] = useState<TeamStatus>("Active");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadMembers = async () => {
      try {
        if (!db) return;
        const snapshot = await getDocs(collection(db, "teamMembers"));
        const withCreated = snapshot.docs.map((memberDoc) => {
          const data = memberDoc.data() as Partial<TeamMember> & { createdAt?: { toMillis?: () => number } };
          const createdMs = typeof data.createdAt?.toMillis === "function" ? data.createdAt.toMillis() : 0;
          const member: TeamMember = {
            id: memberDoc.id,
            name: data.name ?? "",
            email: data.email ?? memberDoc.id,
            role: (data.role as TeamRole) ?? "Sales Agent",
            status: (data.status as TeamStatus) ?? "Inactive",
          };
          return { member, createdMs };
        });
        withCreated.sort((a, b) => b.createdMs - a.createdMs);
        setTeamMembers(withCreated.map((row) => row.member));
      } catch (loadError) {
        console.error("Failed to load team members", loadError);
        setError("Unable to load team members.");
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, []);

  const filteredMembers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return teamMembers.filter((member) => {
      const matchesSearch =
        !normalizedSearch ||
        member.name.toLowerCase().includes(normalizedSearch) ||
        member.role.toLowerCase().includes(normalizedSearch);
      const matchesRole = selectedRole === "All" || member.role === selectedRole;
      const matchesStatus = selectedStatus === "All" || member.status === selectedStatus;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [searchTerm, selectedRole, selectedStatus, teamMembers]);

  const metrics = useMemo(
    () => [
      {
        id: "total-members",
        label: "Total Members",
        value: String(filteredMembers.length),
        icon: UsersRound,
      },
      {
        id: "active-agents",
        label: "Active Agents",
        value: String(filteredMembers.filter((member) => member.status === "Active").length),
        icon: UserCheck,
      },
      {
        id: "role-types",
        label: "Role Types",
        value: String(new Set(filteredMembers.map((member) => member.role)).size),
        icon: ShieldCheck,
      },
    ],
    [filteredMembers],
  );

  const handleAddMember = () => {
    const normalizedName = newName.trim();
    const normalizedEmail = newEmail.trim().toLowerCase();
    if (!normalizedName || !normalizedEmail) return;
    if (!db) {
      setError("Firebase is not configured.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    const member: TeamMember = {
      id: normalizedEmail,
      email: normalizedEmail,
      name: normalizedName,
      role: newRole,
      status: newStatus,
    };

    setDoc(doc(db, "teamMembers", normalizedEmail), {
      ...member,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
      .then(() => {
        setTeamMembers((prev) => {
          const exists = prev.some((teamMember) => teamMember.id === normalizedEmail);
          if (exists) {
            return prev.map((teamMember) =>
              teamMember.id === normalizedEmail ? member : teamMember,
            );
          }
          return [member, ...prev];
        });
        setError("");
        setNewName("");
        setNewEmail("");
        setNewRole("Sales Agent");
        setNewStatus("Active");
        setShowAddForm(false);
      })
      .catch((saveError) => {
        console.error("Failed to save team member", saveError);
        setError("Could not save member. Check Firestore rules.");
      });
  };

  const updateStatus = (id: string, status: TeamStatus) => {
    if (!db) return;
    updateDoc(doc(db, "teamMembers", id), {
      status,
      updatedAt: serverTimestamp(),
    })
      .then(() => {
        setTeamMembers((prev) =>
          prev.map((member) => (member.id === id ? { ...member, status } : member)),
        );
      })
      .catch((updateError) => {
        console.error("Failed to update status", updateError);
        setError("Could not update member status.");
      });
  };

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
          <button className="banner-action-btn" onClick={() => setShowAddForm((prev) => !prev)}>
            <Plus size={14} style={{ marginRight: 4 }} /> Add Agent
          </button>
        </div>

        {showAddForm && (
          <div
            style={{
              ...sectionContainerStyle,
              padding: "14px",
              marginBottom: "12px",
              display: "grid",
              gap: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h4 style={{ margin: 0, fontSize: 15 }}>Add Team Member</h4>
              <button
                className="icon-btn-transparent"
                onClick={() => setShowAddForm(false)}
                title="Close form"
              >
                <X size={16} />
              </button>
            </div>
            <input
              type="text"
              placeholder="Full name"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              style={{
                height: 36,
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "0 10px",
                outline: "none",
              }}
            />
            <input
              type="email"
              placeholder="Email for Google login access"
              value={newEmail}
              onChange={(event) => setNewEmail(event.target.value)}
              style={{
                height: 36,
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "0 10px",
                outline: "none",
              }}
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <select
                value={newRole}
                onChange={(event) => setNewRole(event.target.value as TeamRole)}
                style={{
                  height: 36,
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  padding: "0 8px",
                  background: "#fff",
                }}
              >
                {ROLE_OPTIONS.filter((option) => option !== "All").map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <select
                value={newStatus}
                onChange={(event) => setNewStatus(event.target.value as TeamStatus)}
                style={{
                  height: 36,
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  padding: "0 8px",
                  background: "#fff",
                }}
              >
                {STATUS_OPTIONS.filter((option) => option !== "All").map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="banner-action-btn"
              onClick={handleAddMember}
              disabled={!newName.trim() || !newEmail.trim()}
              style={{ opacity: !newName.trim() || !newEmail.trim() ? 0.6 : 1 }}
            >
              <UserPlus size={14} style={{ marginRight: 4 }} />
              Save Member
            </button>
          </div>
        )}

        {error && (
          <div
            style={{
              ...sectionContainerStyle,
              marginBottom: "12px",
              padding: "10px 12px",
              color: "#b91c1c",
              borderColor: "rgba(185, 28, 28, 0.2)",
              background: "rgba(254, 226, 226, 0.35)",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            ...sectionContainerStyle,
            padding: "12px",
            marginBottom: "12px",
            display: "grid",
            gap: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "0 10px",
              height: 38,
            }}
          >
            <Search size={16} style={{ opacity: 0.7 }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name or role..."
              style={{ border: 0, outline: "none", width: "100%", background: "transparent" }}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <select
              value={selectedRole}
              onChange={(event) => setSelectedRole(event.target.value)}
              style={{
                height: 36,
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "0 8px",
                background: "#fff",
              }}
            >
              {ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value as "All" | TeamStatus)}
              style={{
                height: 36,
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "0 8px",
                background: "#fff",
              }}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
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
          {metrics.map((metric) => {
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
            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  border: "1px dashed var(--border)",
                  borderRadius: 12,
                  padding: "18px 12px",
                  color: "var(--text-muted)",
                  fontSize: 14,
                }}
              >
                Loading team members...
              </div>
            ) : filteredMembers.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  border: "1px dashed var(--border)",
                  borderRadius: 12,
                  padding: "18px 12px",
                  color: "var(--text-muted)",
                  fontSize: 14,
                }}
              >
                No team member found for current filters.
              </div>
            ) : (
              filteredMembers.map((member) => (
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
                      {member.role} | {member.email}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <select
                      value={member.status}
                      onChange={(event) =>
                        updateStatus(member.id, event.target.value as TeamStatus)
                      }
                      style={{
                        height: 30,
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        padding: "0 8px",
                        fontSize: 12,
                        background: "#fff",
                      }}
                    >
                      {STATUS_OPTIONS.filter((option) => option !== "All").map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <span
                      style={{
                        fontSize: 12,
                        padding: "4px 8px",
                        borderRadius: 999,
                        border: "1px solid var(--border)",
                        background:
                          member.status === "Active"
                            ? "rgba(34,197,94,0.10)"
                            : member.status === "On Leave"
                              ? "rgba(245,158,11,0.12)"
                              : "rgba(148,163,184,0.16)",
                        color:
                          member.status === "Active"
                            ? "rgb(21,128,61)"
                            : member.status === "On Leave"
                              ? "rgb(180,83,9)"
                              : "rgb(71,85,105)",
                      }}
                    >
                      {member.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
