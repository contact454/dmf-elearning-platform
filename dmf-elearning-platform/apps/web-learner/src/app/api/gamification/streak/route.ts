import { NextRequest, NextResponse } from 'next/server'
import { callGamification, getOrCreateStats, withAuthenticatedUser } from '../_lib'

export async function GET(request: NextRequest) {
  return withAuthenticatedUser(request, async (_req, userId, accessToken) => {
    try {
      const streakCall = await callGamification(
        `/api/gamification/streak/${encodeURIComponent(userId)}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )

      if (!streakCall.response.ok || !streakCall.json) {
        const stats = await getOrCreateStats(userId, accessToken)
        return NextResponse.json({
          success: true,
          data: {
            streak: stats.streak,
            lastActiveAt: stats.lastUpdated,
            canCheckIn: true,
          },
        })
      }

      return NextResponse.json({
        success: true,
        data: {
          streak: streakCall.json.streak,
          lastActiveAt: streakCall.json.lastCheckInAt || null,
          canCheckIn: streakCall.json.canCheckIn ?? true,
        },
      })
    } catch (error) {
      console.error('[gamification/streak] GET failed:', error)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UPSTREAM_ERROR',
            message: 'Failed to fetch streak',
          },
        },
        { status: 502 }
      )
    }
  })
}

export async function POST(request: NextRequest) {
  return withAuthenticatedUser(request, async (_req, userId, accessToken) => {
    try {
      const checkInCall = await callGamification('/api/gamification/streak/check-in', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ userId }),
      })

      if (!checkInCall.response.ok || !checkInCall.json) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'UPSTREAM_ERROR',
              message: 'Failed to update streak',
            },
          },
          { status: 502 }
        )
      }

      return NextResponse.json({
        success: true,
        data: {
          streak: checkInCall.json.streak,
          lastActiveAt: checkInCall.json.lastCheckInAt || null,
          canCheckIn: false,
        },
        streakIncreased: Boolean(checkInCall.json.streakIncreased),
        message: checkInCall.json.message || 'Streak updated',
      })
    } catch (error) {
      console.error('[gamification/streak] POST failed:', error)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to update streak',
          },
        },
        { status: 500 }
      )
    }
  })
}
