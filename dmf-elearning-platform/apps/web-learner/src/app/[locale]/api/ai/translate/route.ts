import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// ═══════════════════════════════════════════════════════════════
// AI Vocabulary Translation API
// Uses Claude API to translate German words to Vietnamese
// ═══════════════════════════════════════════════════════════════

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
  baseURL: process.env.ANTHROPIC_BASE_URL,
});

interface TranslationRequest {
  word: string;
  context?: string;
  level?: string;
}

interface TranslationResponse {
  success: boolean;
  data?: {
    german: string;
    vietnamese: string;
    english: string;
    wordType: string;
    level: string;
    examples: Array<{
      german: string;
      vietnamese: string;
    }>;
    pronunciation: string;
  };
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<TranslationResponse>> {
  try {
    const body: TranslationRequest = await request.json();
    const { word, context = '', level = 'A1' } = body;

    if (!word) {
      return NextResponse.json({
        success: false,
        error: 'Word is required',
      }, { status: 400 });
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4',
      max_tokens: 1024,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: `You are a German language expert. Translate the German word "${word}" to Vietnamese and English.

CEFR Level: ${level}
Context: ${context || 'General usage'}

Provide the response in JSON format with this structure:
{
  "german": "the original German word",
  "vietnamese": "Vietnamese translation",
  "english": "English translation",
  "wordType": "noun/verb/adjective/etc",
  "level": "appropriate CEFR level (A1-C2)",
  "pronunciation": "IPA pronunciation",
  "examples": [
    {
      "german": "example sentence in German",
      "vietnamese": "Vietnamese translation of example"
    }
  ]
}

Make sure the examples are appropriate for ${level} level learners. Keep it simple and practical.`,
        },
      ],
    });

    // Extract JSON from Claude's response
    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Invalid response from AI');
    }

    // Parse JSON from response (Claude might wrap it in markdown)
    let jsonText = content.text;
    const jsonMatch = jsonText.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }

    const translationData = JSON.parse(jsonText);

    return NextResponse.json({
      success: true,
      data: translationData,
    });
  } catch (error: any) {
    console.error('Translation error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to translate word',
    }, { status: 500 });
  }
}
