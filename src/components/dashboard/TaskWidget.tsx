import React, { memo } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const TaskWidget = memo(() => {
  return (
    <div className="task-widget">
      <div className="task-widget-header">
        <h4>Top Action Items</h4>
        <Link href="/follow-ups" className="view-link">View All <ArrowRight size={12} /></Link>
      </div>
      <div className="task-widget-body">
         {/* Placeholder logic for tasks - would link to follow-ups collection */}
         <div className="mini-task-item">
            <CheckCircle2 size={16} className="task-icon pending" />
            <div className="task-meta">
              <span className="task-lead">Sanjay Raut</span>
              <span className="task-time">Overdue by 2 hours</span>
            </div>
         </div>
         <div className="mini-task-item">
            <CheckCircle2 size={16} className="task-icon upcoming" />
            <div className="task-meta">
              <span className="task-lead">Meera Nair</span>
              <span className="task-time">Today, 5:00 PM</span>
            </div>
         </div>
      </div>
    </div>
  );
});

TaskWidget.displayName = "TaskWidget";
export default TaskWidget;
