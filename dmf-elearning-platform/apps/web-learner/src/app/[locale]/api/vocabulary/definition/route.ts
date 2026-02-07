/**
 * Mock API Route: GET /api/vocabulary/definition
 * Returns word definition, translation, and pronunciation
 */

import { NextRequest, NextResponse } from 'next/server';

const mockDefinitions: Record<string, any> = {
  'hello': {
    word: 'hello',
    definition: 'A greeting or expression of goodwill used when meeting or addressing someone.',
    translationVi: 'Xin chào',
    pronunciation: '/həˈləʊ/',
    audioUrl: null,
    exampleSentence: 'She said hello to everyone at the party.',
    partOfSpeech: 'interjection',
  },
  'greet': {
    word: 'greet',
    definition: 'To address with expressions of goodwill or kindness upon meeting.',
    translationVi: 'Chào hỏi',
    pronunciation: '/ɡriːt/',
    audioUrl: null,
    exampleSentence: 'He greeted his friends warmly at the door.',
    partOfSpeech: 'verb',
  },
  'morning': {
    word: 'morning',
    definition: 'The period of time between midnight and noon, especially from sunrise to noon.',
    translationVi: 'Buổi sáng',
    pronunciation: '/ˈmɔːrnɪŋ/',
    audioUrl: null,
    exampleSentence: 'She likes to exercise in the morning.',
    partOfSpeech: 'noun',
  },
  'exercise': {
    word: 'exercise',
    definition: 'Physical activity that is done to become stronger and healthier.',
    translationVi: 'Tập thể dục',
    pronunciation: '/ˈeksəsaɪz/',
    audioUrl: null,
    exampleSentence: 'Regular exercise is important for good health.',
    partOfSpeech: 'noun',
  },
  'energy': {
    word: 'energy',
    definition: 'The strength and vitality required for sustained physical or mental activity.',
    translationVi: 'Năng lượng',
    pronunciation: '/ˈenərdʒi/',
    audioUrl: null,
    exampleSentence: 'He had lots of energy after a good night\'s sleep.',
    partOfSpeech: 'noun',
  },
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const word = searchParams.get('word')?.toLowerCase();

    if (!word) {
      return NextResponse.json(
        { error: 'Word parameter is required' },
        { status: 400 }
      );
    }

    const definition = mockDefinitions[word];

    if (!definition) {
      // Return generic response for unknown words
      return NextResponse.json({
        word,
        definition: `Definition for "${word}" not found in dictionary.`,
        translationVi: null,
        pronunciation: null,
        audioUrl: null,
        exampleSentence: null,
        partOfSpeech: null,
      });
    }

    return NextResponse.json(definition);
  } catch (error) {
    console.error('Error in GET /api/vocabulary/definition:', error);
    return NextResponse.json(
      { error: 'Failed to fetch definition' },
      { status: 500 }
    );
  }
}
