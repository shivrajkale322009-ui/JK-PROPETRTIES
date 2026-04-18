import { collection, doc, getDoc, getDocs, query, where, orderBy, setDoc, updateDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from './firebase';
import { whatsappService, WhatsAppMessage } from './whatsapp';

export type LeadStatus = 
  | 'New Lead'
  | 'Not Called Yet'
  | 'Called'
  | 'Interested'
  | 'Site Visit Scheduled'
  | 'Negotiation'
  | 'Closed'
  | 'Not Interested';

export type LeadSource = 'WhatsApp' | 'Website' | 'Referral' | 'Social Media' | 'Cold Call' | 'Other';

export interface Lead {
  id: string;
  name?: string;
  phone: string;
  email?: string;
  status: LeadStatus;
  source: LeadSource;
  budget?: string;
  location?: string;
  propertyType?: string;
  assignedAgent?: string;
  createdAt: any;
  updatedAt: any;
  lastMessageAt?: any;
  tags: string[];
  notes?: string;
  whatsappOptIn: boolean;
  chatHistory: ChatMessage[];
  followUpAt?: any;
  remarks?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'customer' | 'agent' | 'bot';
  timestamp: any;
  messageId?: string;
  status?: 'sent' | 'delivered' | 'read' | 'failed';
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  assignedLeads: number;
  maxLeads: number;
}

class LeadAutomationService {
  private readonly leadsCollection = 'leads';
  private readonly agentsCollection = 'teamMembers';
  private readonly chatCollection = 'chats';

  // Create or update lead from WhatsApp message
  async processWhatsAppMessage(message: WhatsAppMessage): Promise<Lead | null> {
    try {
      const phone = message.from;
      const existingLead = await this.findLeadByPhone(phone);

      if (existingLead) {
        // Update existing lead
        await this.updateLeadActivity(existingLead.id, message);
        return await this.getLead(existingLead.id);
      } else {
        // Create new lead
        return await this.createLeadFromWhatsApp(message);
      }
    } catch (error) {
      console.error('Error processing WhatsApp message:', error);
      return null;
    }
  }

  // Find lead by phone number
  async findLeadByPhone(phone: string): Promise<{ id: string } | null> {
    const q = query(
      collection(db, this.leadsCollection),
      where('phone', '==', phone)
    );

    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return { id: snapshot.docs[0].id };
    }
    return null;
  }

  // Create new lead from WhatsApp
  private async createLeadFromWhatsApp(message: WhatsAppMessage): Promise<Lead> {
    const leadData: Omit<Lead, 'id'> = {
      name: undefined,
      phone: message.from,
      status: 'New Lead',
      source: 'WhatsApp',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastMessageAt: serverTimestamp(),
      tags: ['New Lead'],
      whatsappOptIn: true,
      chatHistory: [{
        id: message.id,
        text: message.text || '',
        sender: 'customer',
        timestamp: serverTimestamp(),
        messageId: message.id,
        status: 'delivered'
      }]
    };

    const docRef = await addDoc(collection(db, this.leadsCollection), leadData);
    const newLead = { id: docRef.id, ...leadData };

    // Trigger auto-reply
    await this.sendAutoReply(newLead);

    return newLead;
  }

  // Update lead activity
  private async updateLeadActivity(leadId: string, message: WhatsAppMessage): Promise<void> {
    const leadRef = doc(db, this.leadsCollection, leadId);
    
    // Add message to chat history
    const chatMessage: ChatMessage = {
      id: message.id,
      text: message.text || '',
      sender: 'customer',
      timestamp: serverTimestamp(),
      messageId: message.id,
      status: 'delivered'
    };

    await updateDoc(leadRef, {
      lastMessageAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      chatHistory: [...(await this.getChatHistory(leadId)), chatMessage]
    });

    // Check if we need to update lead status based on conversation
    await this.processLeadIntelligence(leadId, message.text || '');
  }

  // Send auto-reply based on lead status
  private async sendAutoReply(lead: Lead): Promise<void> {
    if (lead.status === 'New Lead' && lead.chatHistory.length <= 1) {
      const welcomeMessage = `Hi 👋 Welcome to JK Properties! Please share:\n\n1. Your Name\n2. Budget Range\n3. Preferred Location`;
      
      await whatsappService.sendTextMessage(lead.phone, welcomeMessage);
      
      // Add bot message to chat history
      await this.addChatMessage(lead.id, {
        id: `bot_${Date.now()}`,
        text: welcomeMessage,
        sender: 'bot',
        timestamp: serverTimestamp(),
        status: 'sent'
      });
    }
  }

  // Process lead intelligence and update status
  private async processLeadIntelligence(leadId: string, message: string): Promise<void> {
    const lead = await this.getLead(leadId);
    if (!lead) return;

    const lowerMessage = message.toLowerCase();
    let needsUpdate = false;

    // Extract information from message
    if (!lead.name && this.extractName(message)) {
      lead.name = this.extractName(message)!;
      needsUpdate = true;
    }

    if (!lead.budget && this.extractBudget(message)) {
      lead.budget = this.extractBudget(message)!;
      needsUpdate = true;
    }

    if (!lead.location && this.extractLocation(message)) {
      lead.location = this.extractLocation(message)!;
      needsUpdate = true;
    }

    // Update status based on conversation progress
    if (lead.name && lead.budget && lead.location && lead.status === 'New Lead') {
      lead.status = 'Not Called Yet';
      lead.tags = ['Responded'];
      needsUpdate = true;

      // Assign to agent
      await this.assignToAgent(leadId);
    }

    if (needsUpdate) {
      await this.updateLead(leadId, lead);
    }
  }

  // Extract name from message
  private extractName(message: string): string | null {
    const namePatterns = [
      /(?:my name is|i am|i'm|name:?)\s+([a-zA-Z\s]{2,30})/i,
      /^([a-zA-Z\s]{2,30})\s+(?:looking|interested|searching)/i
    ];

    for (const pattern of namePatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return null;
  }

  // Extract budget from message
  private extractBudget(message: string): string | null {
    const budgetPatterns = [
      /budget\s*[:\-]?\s*([0-9\s,]+(?:lakhs?|l|crore|cr|million|m))?/i,
      /([0-9\s,]+(?:lakhs?|l|crore|cr|million|m))\s*budget/i,
      /([0-9\s,]+(?:lakhs?|l|crore|cr|million|m))/i
    ];

    for (const pattern of budgetPatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return null;
  }

  // Extract location from message
  private extractLocation(message: string): string | null {
    const locationPatterns = [
      /(?:location|area|place|where)\s*[:\-]?\s*([a-zA-Z\s,]{2,30})/i,
      /(?:in|at)\s+([a-zA-Z\s,]{2,30})\s*(?:looking|interested|searching)/i
    ];

    for (const pattern of locationPatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return null;
  }

  // Assign lead to available agent
  private async assignToAgent(leadId: string): Promise<void> {
    const agents = await this.getAvailableAgents();
    if (agents.length === 0) return;

    // Find agent with least leads
    const bestAgent = agents.reduce((prev, current) => 
      prev.assignedLeads < current.assignedLeads ? prev : current
    );

    await this.updateLead(leadId, { assignedAgent: bestAgent.id });
    
    // Update agent's lead count
    await updateDoc(doc(db, this.agentsCollection, bestAgent.id), {
      assignedLeads: bestAgent.assignedLeads + 1
    });
  }

  // Get available agents
  private async getAvailableAgents(): Promise<Agent[]> {
    const q = query(
      collection(db, this.agentsCollection),
      where('isActive', '==', true)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Agent));
  }

  // Get lead by ID
  async getLead(leadId: string): Promise<Lead | null> {
    const docRef = doc(db, this.leadsCollection, leadId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Lead;
    }
    return null;
  }

  // Update lead
  async updateLead(leadId: string, updates: Partial<Lead>): Promise<void> {
    const leadRef = doc(db, this.leadsCollection, leadId);
    await updateDoc(leadRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }

  // Get chat history
  async getChatHistory(leadId: string): Promise<ChatMessage[]> {
    const lead = await this.getLead(leadId);
    return lead?.chatHistory || [];
  }

  // Add chat message
  async addChatMessage(leadId: string, message: ChatMessage): Promise<void> {
    const leadRef = doc(db, this.leadsCollection, leadId);
    const currentHistory = await this.getChatHistory(leadId);
    
    await updateDoc(leadRef, {
      chatHistory: [...currentHistory, message],
      lastMessageAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  // Send follow-up reminder
  async scheduleFollowUp(leadId: string, dateTime: Date): Promise<void> {
    await this.updateLead(leadId, {
      followUpAt: dateTime,
      tags: ['Follow-up Scheduled']
    });
  }

  // Get leads by status
  async getLeadsByStatus(status: LeadStatus): Promise<Lead[]> {
    const q = query(
      collection(db, this.leadsCollection),
      where('status', '==', status),
      orderBy('updatedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Lead));
  }

  // Create manual lead
  async createManualLead(data: Partial<Lead>): Promise<string> {
    if (!db) throw new Error("Database not initialized");
    const leadData = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: data.status || 'New Lead',
      source: data.source || 'Other',
      chatHistory: [],
      tags: [data.status || 'New Lead'],
      whatsappOptIn: false,
    };
    const docRef = await addDoc(collection(db, this.leadsCollection), leadData);
    return docRef.id;
  }

  // Get leads by agent
  async getLeadsByAgent(agentId: string): Promise<Lead[]> {
    const q = query(
      collection(db, this.leadsCollection),
      where('assignedAgent', '==', agentId),
      orderBy('updatedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Lead));
  }

  // Update lead status
  async updateLeadStatus(leadId: string, status: LeadStatus, remarks?: string): Promise<void> {
    const updates: Partial<Lead> = { status };
    
    if (remarks) {
      updates.remarks = remarks;
    }

    // Update tags based on status
    const statusTags: Record<LeadStatus, string[]> = {
      'New Lead': ['New Lead'],
      'Not Called Yet': ['Responded'],
      'Called': ['Contacted'],
      'Interested': ['Hot Lead'],
      'Site Visit Scheduled': ['Site Visit'],
      'Negotiation': ['Negotiating'],
      'Closed': ['Converted'],
      'Not Interested': ['Lost']
    };

    updates.tags = statusTags[status];

    await this.updateLead(leadId, updates);
  }
}

export const leadAutomationService = new LeadAutomationService();
