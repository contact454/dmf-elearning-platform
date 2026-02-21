import { NextRequest, NextResponse } from 'next/server'
import { withAuthenticatedUser } from '../_lib'

export async function GET(request: NextRequest) {
  return withAuthenticatedUser(request, async () =>
    NextResponse.json({
      success: true,
      data: [],
      message: 'Achievements are not wired to gamification-service yet',
    })
  )
}

export async function POST(request: NextRequest) {
  return withAuthenticatedUser(request, async () =>
    NextResponse.json({
      success: true,
      data: null,
      unlocked: false,
      message: 'No-op achievement update',
    })
  )
}

export async function PUT(request: NextRequest) {
  return withAuthenticatedUser(request, async () =>
    NextResponse.json({
      success: true,
      message: 'No-op achievement seed',
    })
  )
}
