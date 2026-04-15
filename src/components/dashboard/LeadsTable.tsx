import React, { memo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface LeadsTableProps {
  leads: any[];
  loading: boolean;
}

const LeadsTable = memo(({ leads, loading }: LeadsTableProps) => {
  if (loading) {
    return (
      <div className="leads-skeleton">
        {[1, 2, 3, 4].map(i => <div key={i} className="skeleton-row"></div>)}
      </div>
    );
  }

  if (leads.length === 0) {
    return <p className="empty-text">No active leads found.</p>;
  }

  return (
    <div className="compact-leads-table">
      <div className="table-header">
        <span>Name</span>
        <span className="hide-mobile">Location</span>
        <span>Status</span>
        <span />
      </div>
      <div className="table-body">
        {leads.map((lead, i) => (
          <Link href={`/leads/${lead.id}`} key={lead.id || i}>
            <motion.div 
              className="table-row ripple"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="cell-name">
                <span className="name-text">{lead.name || "Unknown"}</span>
                <span className="date-text">Last: Today</span>
              </div>
              <div className="cell-location hide-mobile">
                {lead.location || "N/A"}
              </div>
              <div className="cell-status">
                <span className="status-chip" data-status={(lead.status || "new").toLowerCase()}>
                  {lead.status || "New"}
                </span>
              </div>
              <div className="cell-action">
                <ChevronRight size={16} className="text-muted" />
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
});

LeadsTable.displayName = "LeadsTable";
export default LeadsTable;
