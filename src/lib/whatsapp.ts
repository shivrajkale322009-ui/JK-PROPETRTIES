export interface WhatsAppMessage {
  id: string;
  from: string;
  to: string;
  text?: string;
  timestamp: number;
  type: 'text' | 'image' | 'document' | 'template';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  metadata?: any;
}

export interface WhatsAppWebhook {
  object: 'whatsapp_business_account';
  entry: Array<{
    id: string;
    changes: Array<{
      field: 'messages';
      value: {
        messaging_product: 'whatsapp';
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        messages?: WhatsAppMessage[];
      };
    }>;
  }>;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  language: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  components: Array<{
    type: 'HEADER' | 'BODY' | 'FOOTER';
    text: string;
  }>;
}

export interface WhatsAppConfig {
  phoneNumberId: string;
  accessToken: string;
  webhookVerifyToken: string;
  apiVersion: string;
}

class WhatsAppService {
  private config: WhatsAppConfig | null = null;
  private baseUrl = 'https://graph.facebook.com';

  constructor() {
    this.loadConfig();
  }

  private loadConfig() {
    this.config = {
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID || '',
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN || process.env.NEXT_PUBLIC_WHATSAPP_ACCESS_TOKEN || '',
      webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || process.env.NEXT_PUBLIC_WHATSAPP_WEBHOOK_VERIFY_TOKEN || '',
      apiVersion: process.env.WHATSAPP_API_VERSION || process.env.NEXT_PUBLIC_WHATSAPP_API_VERSION || 'v18.0'
    };

    if (!this.isConfigured() && typeof window !== "undefined") {
      console.warn("⚠️ WhatsApp service is not fully configured. Check your environment variables.");
    }
  }

  isConfigured(): boolean {
    return !!(this.config?.accessToken && this.config?.phoneNumberId);
  }

  // Webhook verification for Meta
  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    if (mode === 'subscribe' && token === this.config?.webhookVerifyToken) {
      return challenge;
    }
    return null;
  }

  // Parse incoming webhook data
  parseWebhook(body: WhatsAppWebhook): WhatsAppMessage[] {
    const messages: WhatsAppMessage[] = [];
    
    try {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.field === 'messages' && change.value.messages) {
            for (const message of change.value.messages) {
              // Only process incoming messages (not outgoing)
              if (message.from && !message.from.includes(this.config?.phoneNumberId || '')) {
                messages.push({
                  id: message.id,
                  from: message.from,
                  to: change.value.metadata.phone_number_id,
                  text: (message as any)?.text?.body,
                  timestamp: message.timestamp,
                  type: message.type,
                  status: 'delivered'
                });
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error parsing WhatsApp webhook:', error);
    }

    return messages;
  }

  // Send text message
  async sendTextMessage(to: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isConfigured()) {
      return { success: false, error: 'WhatsApp not configured' };
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/${this.config!.apiVersion}/${this.config!.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config!.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: to.replace(/[^\d]/g, ''), // Remove non-digits
            type: 'text',
            text: {
              body: message
            }
          })
        }
      );

      const data = await response.json();
      
      if (response.ok) {
        return { 
          success: true, 
          messageId: data.messages?.[0]?.id 
        };
      } else {
        return { 
          success: false, 
          error: data.error?.message || 'Unknown error' 
        };
      }
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error' 
      };
    }
  }

  // Send template message
  async sendTemplateMessage(
    to: string, 
    templateName: string, 
    components: any[] = []
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isConfigured()) {
      return { success: false, error: 'WhatsApp not configured' };
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/${this.config!.apiVersion}/${this.config!.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config!.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: to.replace(/[^\d]/g, ''),
            type: 'template',
            template: {
              name: templateName,
              language: {
                code: 'en'
              },
              components
            }
          })
        }
      );

      const data = await response.json();
      
      if (response.ok) {
        return { 
          success: true, 
          messageId: data.messages?.[0]?.id 
        };
      } else {
        return { 
          success: false, 
          error: data.error?.message || 'Unknown error' 
        };
      }
    } catch (error) {
      console.error('Error sending WhatsApp template:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error' 
      };
    }
  }

  // Mark message as read
  async markMessageAsRead(messageId: string): Promise<boolean> {
    if (!this.isConfigured()) return false;

    try {
      const response = await fetch(
        `${this.baseUrl}/${this.config!.apiVersion}/${messageId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config!.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            status: 'read'
          })
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Error marking message as read:', error);
      return false;
    }
  }

  // Get message info
  async getMessageInfo(messageId: string): Promise<any> {
    if (!this.isConfigured()) return null;

    try {
      const response = await fetch(
        `${this.baseUrl}/${this.config!.apiVersion}/${messageId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config!.accessToken}`,
          }
        }
      );

      return response.ok ? await response.json() : null;
    } catch (error) {
      console.error('Error getting message info:', error);
      return null;
    }
  }

  // Format phone number for WhatsApp
  formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let formatted = phone.replace(/\D/g, '');
    
    // Add country code if missing (assuming India for JK Properties)
    if (formatted.length === 10) {
      formatted = '91' + formatted;
    }
    
    // Remove leading + if present
    if (formatted.startsWith('+')) {
      formatted = formatted.substring(1);
    }
    
    return formatted;
  }

  // Validate phone number
  isValidPhoneNumber(phone: string): boolean {
    const formatted = this.formatPhoneNumber(phone);
    return /^\d{12}$/.test(formatted); // 91 + 10 digit number
  }
}

export const whatsappService = new WhatsAppService();
