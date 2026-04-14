"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from "@dnd-kit/sortable";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { MessageCircle, Phone, MoreHorizontal } from "lucide-react";

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
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "leads"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLeads(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      // Logic for moving within column or between columns
      // For simplicity in this CRM, we detect the column 'over' and update status
      const activeLead = leads.find(l => l.id === active.id);
      const overId = over.id as string;
      
      // If over a column id
      if (COLUMNS.includes(overId)) {
        await updateDoc(doc(db, "leads", active.id), {
          status: overId
        });
      }
    }
  };

  return (
    <div className="pipeline-container animate-fade">
      <header className="page-header">
        <h1>Sales Pipeline</h1>
        <p>Drag and drop leads to update their status</p>
      </header>

      <div className="kanban-board">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {COLUMNS.map((column) => (
            <div key={column} className="kanban-column">
              <div className="column-header">
                <h3>{column}</h3>
                <span className="count">{leads.filter(l => l.status === column).length}</span>
              </div>
              
              <div className="column-content">
                {leads.filter(l => l.status === column).map((lead) => (
                  <LeadCard key={lead.id} lead={lead} />
                ))}
              </div>
            </div>
          ))}
        </DndContext>
      </div>

    </div>
  );
};

const LeadCard = ({ lead }: { lead: any }) => {
  return (
    <div className="lead-card">
      <div className="card-header">
        <span className="source-badge">{lead.source}</span>
        <button className="more-btn"><MoreHorizontal size={14} /></button>
      </div>
      
      <p className="lead-name">{lead.fullName}</p>
      
      <div className="lead-meta">
        <p className="property">{lead.propertyType} • {lead.location}</p>
        <p className="budget">{lead.budget}</p>
      </div>

      <div className="card-footer">
        <div className="contact-icons">
          <MessageCircle size={16} />
          <Phone size={14} />
        </div>
        <div className="date">{new Date(lead.createdAt?.seconds * 1000).toLocaleDateString()}</div>
      </div>

    </div>
  );
};

export default PipelinePage;
