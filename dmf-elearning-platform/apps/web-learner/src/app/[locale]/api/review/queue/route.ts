import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.access_token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Forward to backend API
    const response = await fetch('http://localhost:3003/api/review/queue', {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    })
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch review queue' },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching review queue:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
