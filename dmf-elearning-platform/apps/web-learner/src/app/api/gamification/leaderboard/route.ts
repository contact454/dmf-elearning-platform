import { NextRequest, NextResponse } from 'next/server'
import {
  asNumber,
  callGamification,
  getLeaderboardWindow,
  withAuthenticatedUser,
  type GamificationPeriod,
} from '../_lib'

const VALID_PERIODS: GamificationPeriod[] = ['daily', 'weekly', 'monthly', 'allTime']

function normalizePeriod(value: string | null): GamificationPeriod {
  if (!value) return 'allTime'
  return VALID_PERIODS.includes(value as GamificationPeriod) ? (value as GamificationPeriod) : 'allTime'
}

export async function GET(request: NextRequest) {
  return withAuthenticatedUser(request, async (req, userId, accessToken) => {
    try {
      const url = new URL(req.url)
      const period = normalizePeriod(url.searchParams.get('period'))
      const limit = Math.max(1, Math.min(200, asNumber(url.searchParams.get('limit'), 100)))

      const leaderboardCall = await callGamification(`/api/gamification/leaderboard?limit=${limit}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      if (!leaderboardCall.response.ok || !leaderboardCall.json) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'UPSTREAM_ERROR',
              message: 'Failed to fetch leaderboard',
            },
          },
          { status: 502 }
        )
      }

      const rows = Array.isArray(leaderboardCall.json.leaderboard) ? leaderboardCall.json.leaderboard : []
      const entries = rows.map((entry: any, index: number) => ({
        id: `leaderboard-${period}-${entry.userId ?? index}`,
        userId: String(entry.userId || ''),
        username: String(entry.username || entry.userId || 'unknown'),
        xp: asNumber(entry.xp),
        level: asNumber(entry.level, 1),
        streak: asNumber(entry.streak),
        rank: asNumber(entry.rank, index + 1),
        period,
        ...getLeaderboardWindow(period),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))

      const requestedUserId = url.searchParams.get('userId') || userId
      const userEntry = entries.find((entry) => entry.userId === requestedUserId) || null

      return NextResponse.json({
        success: true,
        data: {
          entries,
          userEntry,
          period,
          ...getLeaderboardWindow(period),
        },
      })
    } catch (error) {
      console.error('[gamification/leaderboard] GET failed:', error)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to fetch leaderboard',
          },
        },
        { status: 500 }
      )
    }
  })
}

export async function POST(request: NextRequest) {
  return withAuthenticatedUser(request, async (req, userId, accessToken) => {
    try {
      const payload = await req.json().catch(() => ({}))
      const xp = Math.max(0, asNumber(payload?.xp, 0))
      const streak = Math.max(0, asNumber(payload?.streak, 0))

      const seedCall = await callGamification('/api/debug/seed-stats', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          userId,
          xp,
          streak,
        }),
      })

      if (!seedCall.response.ok) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'UPSTREAM_ERROR',
              message: 'Failed to update leaderboard',
            },
          },
          { status: 502 }
        )
      }

      return NextResponse.json({
        success: true,
        data: seedCall.json?.stats || null,
      })
    } catch (error) {
      console.error('[gamification/leaderboard] POST failed:', error)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to update leaderboard',
          },
        },
        { status: 500 }
      )
    }
  })
}
