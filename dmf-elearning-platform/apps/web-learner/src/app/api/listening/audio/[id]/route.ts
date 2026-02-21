// GET /api/listening/audio/[id]
// Fetch audio file URL for a specific exercise

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSignedAudioUrl, getPublicAudioUrl } from '@/lib/r2';
import { withAuth } from '@/middleware/auth';

export const GET = withAuth<{ params: Promise<{ id: string }> }>(async (
  request: NextRequest,
  context
) => {
  try {
    if (!prisma) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 503 }
      );
    }

    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const signed = searchParams.get('signed') === 'true';

    // Fetch exercise
    const exercise = await prisma.listeningExercise.findUnique({
      where: { id },
      select: {
        id: true,
        audioUrl: true,
        audioDuration: true,
        title: true,
      },
    });

    if (!exercise) {
      return NextResponse.json(
        { success: false, error: 'Exercise not found' },
        { status: 404 }
      );
    }

    // If audio URL is already a full URL, return it
    if (exercise.audioUrl.startsWith('http')) {
      return NextResponse.json({
        success: true,
        data: {
          audioUrl: exercise.audioUrl,
          audioDuration: exercise.audioDuration,
          title: exercise.title,
        },
      });
    }

    // Otherwise, generate URL from R2
    const audioUrl = signed
      ? await getSignedAudioUrl(exercise.audioUrl, 3600) // 1 hour expiry
      : getPublicAudioUrl(exercise.audioUrl);

    return NextResponse.json({
      success: true,
      data: {
        audioUrl,
        audioDuration: exercise.audioDuration,
        title: exercise.title,
      },
    });

  } catch (error) {
    console.error('Error fetching audio URL:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch audio URL',
      },
      { status: 500 }
    );
  }
});
