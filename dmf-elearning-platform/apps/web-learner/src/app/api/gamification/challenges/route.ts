import { NextRequest, NextResponse } from 'next/server'
import { withAuthenticatedUser } from '../_lib'

export async function GET(request: NextRequest) {
  return withAuthenticatedUser(request, async () =>
    NextResponse.json({
      success: true,
      data: [],
      message: 'Challenges are not wired to gamification-service yet',
    })
  )
}

export async function POST(request: NextRequest) {
  return withAuthenticatedUser(request, async () =>
    NextResponse.json({
      success: true,
      data: null,
      completed: false,
      message: 'No-op challenge update',
    })
  )
}

export async function DELETE(request: NextRequest) {
  return withAuthenticatedUser(request, async () =>
    NextResponse.json({
      success: true,
      message: 'No-op challenge cleanup',
    })
  )
}
