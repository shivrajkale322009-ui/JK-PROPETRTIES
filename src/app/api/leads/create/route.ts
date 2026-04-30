import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Required fields check (basic)
    if (!data.phone) {
      return NextResponse.json(
        { error: 'Phone number is required for deduplication' },
        { status: 400 }
      );
    }

    const leadsRef = adminDb.collection('leads');
    
    // Normalize phone number to use as an identifier or search criteria
    const phoneToSearch = data.phone.trim();
    
    const querySnapshot = await leadsRef.where('phone', '==', phoneToSearch).get();

    const timestamp = new Date().toISOString();
    
    const leadData = {
      name: data.name || '',
      phone: phoneToSearch,
      status: data.status || 'New',
      interest_level: data.interest_level || '',
      budget: data.budget || '',
      location: data.location || '',
      notes: data.notes || '',
      call_summary: data.call_summary || '',
      follow_up_date: data.follow_up_date || '',
      recording_url: data.recording_url || '',
      source: data.source || 'call',
      updatedAt: timestamp,
    };

    if (!querySnapshot.empty) {
      // Update existing lead
      const existingDoc = querySnapshot.docs[0];
      
      // If we don't want to overwrite name if it's already there but the AI didn't catch it
      if (existingDoc.data().name && !data.name) {
        delete leadData.name;
      }
      
      await existingDoc.ref.update(leadData);
      
      return NextResponse.json({
        message: 'Lead updated successfully',
        leadId: existingDoc.id,
        status: 'updated'
      });
    } else {
      // Create new lead
      const newLeadData = {
        ...leadData,
        createdAt: timestamp,
      };
      
      const newDoc = await leadsRef.add(newLeadData);
      
      return NextResponse.json({
        message: 'Lead created successfully',
        leadId: newDoc.id,
        status: 'created'
      });
    }

  } catch (error: any) {
    console.error('Error processing n8n webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
