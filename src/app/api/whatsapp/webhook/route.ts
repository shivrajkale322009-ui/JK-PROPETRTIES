import { NextRequest, NextResponse } from 'next/server';
import { whatsappService } from '@/lib/whatsapp';
import { leadAutomationService } from '@/lib/lead-automation';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Webhook verification for Meta
  if (mode === 'subscribe') {
    const verification = whatsappService.verifyWebhook(mode || '', token || '', challenge || '');
    if (verification) {
      return new NextResponse(verification, { status: 200 });
    }
  }

  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('WhatsApp webhook received:', JSON.stringify(body, null, 2));

    // Parse webhook data
    const messages = whatsappService.parseWebhook(body);
    
    // Process each message
    for (const message of messages) {
      console.log('Processing message:', message);
      
      // Create or update lead
      const lead = await leadAutomationService.processWhatsAppMessage(message);
      
      if (lead) {
        console.log('Lead processed:', lead.id, lead.status);
        
        // Here you can add additional logic like:
        // - Send notifications to agents
        // - Trigger analytics
        // - Update dashboards in real-time
      }
    }

    return NextResponse.json({ status: 'received' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
