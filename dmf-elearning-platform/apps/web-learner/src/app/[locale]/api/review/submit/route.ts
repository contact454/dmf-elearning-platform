import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function calculateReviewXp(quality: number): number {
  if (quality >= 5) return 15
  if (quality === 4) return 12
  if (quality === 3) return 8
  return 4
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.access_token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get request body
    const body = await request.json()
    const quality = typeof body?.quality === 'number' ? body.quality : 0

    // Forward to learning-service API
    const response = await fetch('http://localhost:3003/api/review/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(body),
    })
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to submit review' },
        { status: response.status }
      )
    }
    
    const data = await response.json()

    // Best-effort XP award in gamification-service (non-blocking for review flow)
    const xp = calculateReviewXp(quality)
    void fetch('http://localhost:3006/api/gamification/add-xp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        userId: session.user.id,
        amount: xp,
      }),
    }).catch((error) => {
      console.warn('[review/submit] gamification xp award skipped:', error)
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error submitting review:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
