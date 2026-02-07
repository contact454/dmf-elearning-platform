import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Get user ID from header
    const userId = request.headers.get('x-user-id') || 'cm64test0001user'
    
    // Get request body
    const body = await request.json()
    
    // Forward to backend API
    const response = await fetch('http://localhost:3003/api/review/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
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
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error submitting review:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
