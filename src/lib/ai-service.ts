const { default: OpenAI } = require('openai');

export interface LeadData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status?: string;
  source?: string;
  createdAt?: any;
  notes?: string;
  budget?: string;
  propertyType?: string;
  location?: string;
}

export interface AIInsight {
  type: 'lead_score' | 'sentiment' | 'recommendation' | 'trend';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  relatedData?: any;
}

class AIAssistant {
  private openai: OpenAI | null = null;
  private isInitialized = false;

  constructor() {
    this.initializeAI();
  }

  private initializeAI() {
    try {
      const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
      if (apiKey) {
        this.openai = new OpenAI({
          apiKey: apiKey,
          dangerouslyAllowBrowser: true // Only for development, use API routes in production
        });
        this.isInitialized = true;
      } else {
        console.warn('OpenAI API key not found. AI features will be limited.');
      }
    } catch (error) {
      console.error('Failed to initialize AI service:', error);
    }
  }

  async analyzeLead(lead: LeadData): Promise<AIInsight[]> {
    if (!this.isInitialized) {
      return this.getFallbackInsights(lead);
    }

    try {
      const prompt = `
        Analyze this real estate lead and provide insights:
        Name: ${lead.name}
        Email: ${lead.email || 'Not provided'}
        Phone: ${lead.phone || 'Not provided'}
        Status: ${lead.status || 'New'}
        Source: ${lead.source || 'Unknown'}
        Budget: ${lead.budget || 'Not specified'}
        Property Type: ${lead.propertyType || 'Not specified'}
        Location: ${lead.location || 'Not specified'}
        Notes: ${lead.notes || 'No notes'}

        Provide:
        1. Lead score (0-100)
        2. Sentiment analysis
        3. 2-3 actionable recommendations
        4. Conversion probability

        Format as JSON with keys: score, sentiment, recommendations, conversionProbability
      `;

      const response = await this.openai!.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
        temperature: 0.3,
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      
      return [
        {
          type: 'lead_score',
          title: `Lead Score: ${analysis.score || 50}/100`,
          description: `Based on available data, this lead has ${analysis.score || 50}% chance of conversion`,
          confidence: 0.8,
          actionable: true
        },
        {
          type: 'sentiment',
          title: `Sentiment: ${analysis.sentiment || 'Neutral'}`,
          description: `Lead appears ${analysis.sentiment?.toLowerCase() || 'neutral'} based on communication patterns`,
          confidence: 0.7,
          actionable: false
        },
        ...(analysis.recommendations || []).map((rec: string, index: number) => ({
          type: 'recommendation' as const,
          title: `Recommendation ${index + 1}`,
          description: rec,
          confidence: 0.6,
          actionable: true
        }))
      ];
    } catch (error) {
      console.error('AI analysis failed:', error);
      return this.getFallbackInsights(lead);
    }
  }

  async processQuery(query: string, context: { leads?: LeadData[], userRole?: string }): Promise<string> {
    if (!this.isInitialized) {
      return this.getFallbackResponse(query);
    }

    try {
      const contextInfo = context.leads ? `
        Current context: ${context.leads.length} leads in database
        Recent leads: ${context.leads.slice(0, 3).map(l => l.name).join(', ')}
      ` : 'No lead data available';

      const prompt = `
        You are an AI assistant for a real estate CRM (JK Properties). 
        User role: ${context.userRole || 'User'}
        ${contextInfo}
        
        User query: "${query}"
        
        Provide a helpful, concise response. If asking about data, acknowledge limitations and suggest actions.
        Keep responses under 150 words.
      `;

      const response = await this.openai!.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200,
        temperature: 0.5,
      });

      return response.choices[0].message.content || 'I apologize, but I couldn\'t process your request right now.';
    } catch (error) {
      console.error('Query processing failed:', error);
      return this.getFallbackResponse(query);
    }
  }

  async generateLeadSummary(leads: LeadData[]): Promise<string> {
    if (!this.isInitialized || leads.length === 0) {
      return `You have ${leads.length} leads in your database.`;
    }

    try {
      const hotLeads = leads.filter(l => l.status?.toLowerCase() === 'hot').length;
      const totalLeads = leads.length;
      const conversionRate = ((hotLeads / totalLeads) * 100).toFixed(1);

      const prompt = `
        Summarize this real estate lead data:
        Total leads: ${totalLeads}
        Hot leads: ${hotLeads}
        Conversion rate: ${conversionRate}%
        
        Lead sources: ${leads.map(l => l.source).filter(Boolean).slice(0, 5).join(', ')}
        
        Provide a 2-3 sentence business summary with key insights.
      `;

      const response = await this.openai!.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150,
        temperature: 0.4,
      });

      return response.choices[0].message.content || 'Lead summary unavailable.';
    } catch (error) {
      console.error('Summary generation failed:', error);
      return `You have ${leads.length} leads with ${leads.filter(l => l.status?.toLowerCase() === 'hot').length} hot leads.`;
    }
  }

  private getFallbackInsights(lead: LeadData): AIInsight[] {
    return [
      {
        type: 'lead_score',
        title: 'Lead Score: 50/100',
        description: 'Basic analysis - more data needed for accurate scoring',
        confidence: 0.3,
        actionable: true
      },
      {
        type: 'recommendation',
        title: 'Data Collection',
        description: 'Add more lead details for better AI insights',
        confidence: 0.9,
        actionable: true
      }
    ];
  }

  private getFallbackResponse(query: string): string {
    if (query.toLowerCase().includes('lead')) {
      return 'I can help you analyze leads once the AI service is properly configured. Please add your OpenAI API key to enable full AI features.';
    }
    if (query.toLowerCase().includes('help')) {
      return 'I\'m your AI assistant for JK Properties CRM. I can help analyze leads, provide insights, and answer questions about your real estate business.';
    }
    return 'AI features are limited right now. Please configure your OpenAI API key to enable full functionality.';
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}

export const aiAssistant = new AIAssistant();
