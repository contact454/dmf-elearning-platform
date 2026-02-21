import { NextRequest, NextResponse } from 'next/server'
import {
  asNumber,
  callGamification,
  getOrCreateStats,
  normalizeStats,
  withAuthenticatedUser,
} from '../_lib'

export async function GET(request: NextRequest) {
  return withAuthenticatedUser(request, async (_req, userId, accessToken) => {
    try {
      const stats = await getOrCreateStats(userId, accessToken)

      return NextResponse.json({
        success: true,
        data: normalizeStats(stats),
      })
    } catch (error) {
      console.error('[gamification/points] GET failed:', error)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UPSTREAM_ERROR',
            message: 'Failed to fetch points',
          },
        },
        { status: 502 }
      )
    }
  })
}

export async function POST(request: NextRequest) {
  return withAuthenticatedUser(request, async (req, userId, accessToken) => {
    try {
      const payload = await req.json().catch(() => ({}))
      const amount = asNumber(payload?.points, NaN)

      if (!Number.isFinite(amount) || amount < 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'points must be a non-negative number',
            },
          },
          { status: 400 }
        )
      }

      const awardCall = await callGamification('/api/gamification/add-xp', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          userId,
          amount,
        }),
      })

      if (!awardCall.response.ok) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'UPSTREAM_ERROR',
              message: 'Failed to update points',
            },
          },
          { status: 502 }
        )
      }

      const stats = await getOrCreateStats(userId, accessToken)

      return NextResponse.json({
        success: true,
        data: normalizeStats(stats),
        leveledUp: Boolean(awardCall.json?.leveledUp),
        newLevel: asNumber(awardCall.json?.level, stats.currentLevel),
      })
    } catch (error) {
      console.error('[gamification/points] POST failed:', error)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to update points',
          },
        },
        { status: 500 }
      )
    }
  })
}
