import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const response = await fetch('http://localhost:3003/api/reading/vocabulary/save', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const responseBody = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json(responseBody, { status: response.status });
    }

    return NextResponse.json(responseBody);
  } catch (error) {
    console.error('Error in vocabulary save proxy route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
