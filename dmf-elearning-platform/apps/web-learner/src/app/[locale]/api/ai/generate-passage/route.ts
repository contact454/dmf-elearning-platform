import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// ═══════════════════════════════════════════════════════════════
// AI Reading Passage Generator
// Generates German reading passages with Vietnamese translation
// ═══════════════════════════════════════════════════════════════

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
  baseURL: process.env.ANTHROPIC_BASE_URL,
});

interface PassageRequest {
  level: string;
  topic?: string;
  length?: 'short' | 'medium' | 'long';
}

interface PassageResponse {
  success: boolean;
  data?: {
    title: string;
    germanText: string;
    vietnameseTranslation: string;
    level: string;
    topic: string;
    vocabulary: Array<{
      word: string;
      translation: string;
      context: string;
    }>;
    comprehensionQuestions: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
    }>;
  };
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<PassageResponse>> {
  try {
    const body: PassageRequest = await request.json();
    const { level = 'A1', topic = 'daily life', length = 'medium' } = body;

    const lengthWords = {
      short: '100-150',
      medium: '200-300',
      long: '400-500',
    };

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4',
      max_tokens: 2048,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: `You are a German language teacher. Create a reading passage for ${level} level learners.

Topic: ${topic}
Length: ${lengthWords[length]} words
Level: ${level}

Generate a comprehensive reading passage in JSON format:
{
  "title": "Engaging title in German",
  "germanText": "The main text in German (${lengthWords[length]} words)",
  "vietnameseTranslation": "Full Vietnamese translation",
  "level": "${level}",
  "topic": "${topic}",
  "vocabulary": [
    {
      "word": "key German word from the text",
      "translation": "Vietnamese translation",
      "context": "how it's used in the passage"
    }
  ],
  "comprehensionQuestions": [
    {
      "question": "Comprehension question in Vietnamese",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": 0
    }
  ]
}

Requirements:
- Text must be appropriate for ${level} level (use simple grammar and vocabulary)
- Include 8-12 key vocabulary words
- Create 5 comprehension questions
- Make it engaging and culturally relevant
- Vietnamese translations must be natural and accurate`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Invalid response from AI');
    }

    // Parse JSON from response
    let jsonText = content.text;
    const jsonMatch = jsonText.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }

    const passageData = JSON.parse(jsonText);

    return NextResponse.json({
      success: true,
      data: passageData,
    });
  } catch (error: any) {
    console.error('Passage generation error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to generate reading passage',
    }, { status: 500 });
  }
}
