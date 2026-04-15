"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { 
  sortableKeyboardCoordinates, 
} from "@dnd-kit/sortable";
import { db } from "@/lib/firebase";
import { collection, query, limit, onSnapshot, doc, updateDoc, orderBy } from "firebase/firestore";
import { MoreHorizontal, Calendar, History, ArrowLeft } from "lucide-react";
import Link from "next/link";

const COLUMNS = [
  "New Lead",
  "Contacted",
  "Follow-Up Pending",
  "Interested",
  "Site Visit Scheduled",
  "Negotiation",
  "Closed"
];

const PipelinePage = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Use useCallback to memoize and prevent unnecessary re-fetches
  const fetchPipeline = useCallback(() => {
    // Only fetch 50 leads to prevent dropping FPS. Production typically requires server pagination
    const q = query(collection(db, "leads"), orderBy("createdAt", "desc"), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLeads(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsub = fetchPipeline();
    return () => unsub();
  }, [fetchPipeline]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const overId = over.id as string;
      if (COLUMNS.includes(overId)) {
        await updateDoc(doc(db, "leads", active.id), {
          status: overId,
          lastUpdated: new Date()
        });
      }
    }
  };

  return (
    <div className="mobile-view compact-crm">
      <header className="app-bar compact-app-bar">
        <div className="app-bar-left">
          <Link href="/"><button className="icon-btn-transparent"><ArrowLeft size={20} color="var(--sidebar-bg)" /></button></Link>
          <h1 className="native-title compact">Kanban Pipeline</h1>
        </div>
      </header>

      <div className="content-area compact-mode">
        {loading ? (
           <div className="leads-skeleton">
             {[1, 2, 3].map(i => <div key={i} className="skeleton-row"></div>)}
           </div>
        ) : (
          <div className="kanban-board-compact">
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              {COLUMNS.map((column) => (
                <div key={column} className="kanban-column-compact" id={column}>
                  <div className="k-col-header">
                    <span>{column}</span>
                    <span className="badge">{leads.filter(l => l.status === column).length}</span>
                  </div>
                  
                  <div className="k-col-body">
                    {leads.filter(l => l.status === column).map((lead) => (
                      <CompactLeadCard key={lead.id} lead={lead} />
                    ))}
                  </div>
                </div>
              ))}
            </DndContext>
          </div>
        )}
      </div>
    </div>
  );
};

const CompactLeadCard = ({ lead }: { lead: any }) => {
  return (
    <Link href={`/leads/${lead.id}`}>
      <div className="k-card ripple" id={lead.id}>
        <div className="k-card-top">
          <span className="k-card-title">{lead.name || "Unknown"}</span>
          <span className="k-card-budget">{lead.budget || "N/A"}</span>
        </div>
        
        <div className="k-card-bottom">
          <span style={{display: 'flex', alignItems:'center', gap:4}}>
            <History size={10} /> 
            {lead.lastContact ? new Date(lead.lastContact).toLocaleDateString() : "No contact"}
          </span>
          <button className="icon-btn-transparent" style={{padding:0, color:'var(--text-muted)'}}><MoreHorizontal size={14} /></button>
        </div>
      </div>
    </Link>
  );
};

export default PipelinePage;
