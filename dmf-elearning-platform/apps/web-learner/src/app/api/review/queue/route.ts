import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get user ID from header
    const userId = request.headers.get('x-user-id') || 'cm64test0001user'
    
    // Forward to backend API
    const response = await fetch('http://localhost:3003/api/review/queue', {
      headers: {
        'x-user-id': userId,
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
