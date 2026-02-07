/**
 * Mock API Route: POST /api/vocabulary/save
 * Save word to user's vocabulary
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { word, passageId, context } = body;

    if (!word) {
      return NextResponse.json(
        { error: 'Word is required' },
        { status: 400 }
      );
    }

    // Mock response (in production, this would save to database)
    const mockDefinitions: Record<string, any> = {
      'hello': {
        definition: 'A greeting or expression of goodwill used when meeting or addressing someone.',
        translationVi: 'Xin chào',
        pronunciation: '/həˈləʊ/',
      },
      'greet': {
        definition: 'To address with expressions of goodwill or kindness upon meeting.',
        translationVi: 'Chào hỏi',
        pronunciation: '/ɡriːt/',
      },
      'morning': {
        definition: 'The period of time between midnight and noon, especially from sunrise to noon.',
        translationVi: 'Buổi sáng',
        pronunciation: '/ˈmɔːrnɪŋ/',
      },
      'exercise': {
        definition: 'Physical activity that is done to become stronger and healthier.',
        translationVi: 'Tập thể dục',
        pronunciation: '/ˈeksəsaɪz/',
      },
      'energy': {
        definition: 'The strength and vitality required for sustained physical or mental activity.',
        translationVi: 'Năng lượng',
        pronunciation: '/ˈenərdʒi/',
      },
    };

    const wordLower = word.toLowerCase();
    const definition = mockDefinitions[wordLower] || {
      definition: `Definition for "${word}"`,
      translationVi: null,
      pronunciation: null,
    };

    // Calculate next review date (1 day from now for new words)
    const nextReviewAt = new Date();
    nextReviewAt.setDate(nextReviewAt.getDate() + 1);

    return NextResponse.json({
      message: 'Word saved successfully',
      vocabulary: {
        id: `vocab-${Date.now()}`,
        word: wordLower,
        definition: definition.definition,
        translationVi: definition.translationVi,
        pronunciation: definition.pronunciation,
        exampleSentence: context || null,
        status: 'new',
        nextReviewAt: nextReviewAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error in POST /api/vocabulary/save:', error);
    return NextResponse.json(
      { error: 'Failed to save vocabulary' },
      { status: 500 }
    );
  }
}
