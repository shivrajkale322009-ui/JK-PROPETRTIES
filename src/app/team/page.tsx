"use client";

import { motion } from "framer-motion";
import { UsersRound, Plus } from "lucide-react";

export default function TeamPage() {
  return (
    <div className="mobile-view compact-crm">
      <div className="app-bar compact-app-bar">
        <div className="app-bar-left">
          <h1 className="native-title compact">Team Management</h1>
        </div>
      </div>

      <div className="content-area compact-mode">
        <div className="task-banner" style={{background: 'var(--sidebar-bg)'}}>
           <div className="task-banner-text">
              <h4>Sales Team</h4>
              <p>Manage your agents and access controls here.</p>
           </div>
           <button className="banner-action-btn"><Plus size={14} style={{marginRight: 4}}/> Add Agent</button>
        </div>
        
        <div style={{textAlign: 'center', padding: '40px 20px', color: 'gray', background: 'white', borderRadius: 16, border: '1px solid var(--border)'}}>
           <UsersRound size={48} style={{opacity: 0.2, margin: '0 auto 10px'}} />
           <p>Your team directory will appear here.</p>
        </div>
      </div>
    </div>
  );
}
