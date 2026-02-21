import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type RouteHandler = (request: NextRequest, userId: string, accessToken: string) => Promise<NextResponse>

const GAMIFICATION_BASE_URL =
  process.env.GAMIFICATION_API_URL ||
  process.env.NEXT_PUBLIC_GAMIFICATION_API_URL ||
  'http://localhost:3006'

export type GamificationPeriod = 'daily' | 'weekly' | 'monthly' | 'allTime'

interface GamificationStatsPayload {
  userId: string
  currentXP: number
  currentLevel: number
  nextLevelXP: number
  xpForNextLevel: number
  streak: number
  lastUpdated: string
}

async function readJsonSafe(response: Response): Promise<any> {
  try {
    return await response.json()
  } catch {
    return null
  }
}

export function buildGamificationUrl(path: string): string {
  return `${GAMIFICATION_BASE_URL}${path}`
}

export async function callGamification(path: string, init: RequestInit = {}) {
  const response = await fetch(buildGamificationUrl(path), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
    cache: 'no-store',
  })

  const json = await readJsonSafe(response)
  return { response, json }
}

export function asNumber(value: unknown, fallback: number = 0): number {
  const numeric = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(numeric) ? numeric : fallback
}

export function normalizeStats(stats: GamificationStatsPayload) {
  const updatedAt = stats.lastUpdated || new Date().toISOString()

  return {
    id: `stats-${stats.userId}`,
    userId: stats.userId,
    xp: asNumber(stats.currentXP),
    level: asNumber(stats.currentLevel, 1),
    streak: asNumber(stats.streak),
    nextLevelXP: asNumber(stats.nextLevelXP),
    xpForNextLevel: asNumber(stats.xpForNextLevel),
    lastActiveAt: updatedAt,
    createdAt: updatedAt,
    updatedAt: updatedAt,
  }
}

export async function getOrCreateStats(userId: string, accessToken: string) {
  const statsPath = `/api/gamification/stats/${encodeURIComponent(userId)}`
  let statsCall = await callGamification(statsPath, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (statsCall.response.status === 404) {
    await callGamification('/api/gamification/add-xp', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ userId, amount: 0 }),
    })
    statsCall = await callGamification(statsPath, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  }

  if (!statsCall.response.ok || !statsCall.json) {
    throw new Error(`Failed to load gamification stats (${statsCall.response.status})`)
  }

  return statsCall.json as GamificationStatsPayload
}

export async function withAuthenticatedUser(
  request: NextRequest,
  handler: RouteHandler
): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.access_token || !session.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Unauthorized',
          },
        },
        { status: 401 }
      )
    }

    return await handler(request, session.user.id, session.access_token)
  } catch (error) {
    console.error('[gamification-api] auth resolution failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        },
      },
      { status: 500 }
    )
  }
}

export function getLeaderboardWindow(period: GamificationPeriod) {
  const now = new Date()
  const start = new Date(now)

  if (period === 'daily') {
    start.setUTCHours(0, 0, 0, 0)
  } else if (period === 'weekly') {
    const day = now.getUTCDay()
    const diff = day === 0 ? 6 : day - 1
    start.setUTCDate(now.getUTCDate() - diff)
    start.setUTCHours(0, 0, 0, 0)
  } else if (period === 'monthly') {
    start.setUTCDate(1)
    start.setUTCHours(0, 0, 0, 0)
  } else {
    start.setUTCFullYear(1970, 0, 1)
    start.setUTCHours(0, 0, 0, 0)
  }

  return {
    startDate: start.toISOString(),
    endDate: now.toISOString(),
  }
}
