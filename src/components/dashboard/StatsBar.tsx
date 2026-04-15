import React, { memo } from "react";
import { Users, TrendingUp, MessageSquare, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface StatsBarProps {
  totalLeads: number | string;
  hotLeads: number | string;
  loading: boolean;
}

const StatsBar = memo(({ totalLeads, hotLeads, loading }: StatsBarProps) => {
  const metrics = [
    { title: "Total Leads", value: loading ? "-" : totalLeads, icon: <Users size={16} />, trend: "Active" },
    { title: "Hot Leads", value: loading ? "-" : hotLeads, icon: <TrendingUp size={16} />, trend: "Urgent" },
    { title: "WhatsApp", value: "-", icon: <MessageSquare size={16} />, trend: "Pending" },
    { title: "Follow-ups", value: "-", icon: <Clock size={16} />, trend: "Tasks" },
  ];

  return (
    <div className="compact-stats-strip">
      {metrics.map((metric, i) => (
        <motion.div 
          key={i}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.03 }}
          className="compact-metric-card"
        >
          <div className="compact-metric-top">
            <span className="compact-metric-val">{metric.value}</span>
            <div className="compact-metric-icon">{metric.icon}</div>
          </div>
          <div className="compact-metric-bottom">
            <span className="compact-metric-label">{metric.title}</span>
            <span className="compact-metric-trend">{metric.trend}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
});

StatsBar.displayName = "StatsBar";
export default StatsBar;
