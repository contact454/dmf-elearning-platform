import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// ═══════════════════════════════════════════════════════════════
// AI Speech-to-Text API
// Transcribes German audio to text for speaking practice
// Uses Claude AI for pronunciation evaluation
// ═══════════════════════════════════════════════════════════════

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
  baseURL: process.env.ANTHROPIC_BASE_URL,
});

interface SpeechToTextRequest {
  audio: string; // Base64 encoded audio
  expectedText?: string; // For pronunciation evaluation
  language?: string;
  level?: string;
}

interface SpeechToTextResponse {
  success: boolean;
  data?: {
    transcript: string;
    confidence: number;
    language: string;
    duration?: number;
    evaluation?: {
      accuracy: number;
      pronunciation: number;
      fluency: number;
      feedback: string;
      mistakes: Array<{
        word: string;
        suggestion: string;
        explanation: string;
      }>;
    };
  };
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<SpeechToTextResponse>> {
  try {
    const body: SpeechToTextRequest = await request.json();
    const {
      audio,
      expectedText,
      language = 'de-DE',
      level = 'A1'
    } = body;

    if (!audio) {
      return NextResponse.json({
        success: false,
        error: 'Audio data is required',
      }, { status: 400 });
    }

    // Check if Google Cloud Speech-to-Text API key is available
    const googleApiKey = process.env.GOOGLE_CLOUD_STT_API_KEY;

    let transcript = '';
    let confidence = 0;

    if (googleApiKey) {
      // Use Google Cloud Speech-to-Text API
      try {
        // Remove data URL prefix if present
        const audioContent = audio.replace(/^data:audio\/[a-z]+;base64,/, '');

        const response = await fetch(
          `https://speech.googleapis.com/v1/speech:recognize?key=${googleApiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              config: {
                encoding: 'WEBM_OPUS',
                sampleRateHertz: 48000,
                languageCode: language,
                enableAutomaticPunctuation: true,
                model: 'default',
              },
              audio: {
                content: audioContent,
              },
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Google STT API error: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.results && data.results.length > 0) {
          const result = data.results[0];
          transcript = result.alternatives[0].transcript;
          confidence = result.alternatives[0].confidence || 0;
        } else {
          // No speech detected
          return NextResponse.json({
            success: false,
            error: 'No speech detected in audio',
          }, { status: 400 });
        }
      } catch (error: any) {
        console.error('Google STT API error:', error);
        // Return error if Google API was expected but failed
        return NextResponse.json({
          success: false,
          error: 'Speech recognition failed: ' + error.message,
        }, { status: 500 });
      }
    } else {
      // No STT service available - return instructions for client-side processing
      return NextResponse.json({
        success: false,
        error: 'Speech-to-text service not configured. Please add GOOGLE_CLOUD_STT_API_KEY to environment variables, or use browser Web Speech API on the client.',
      }, { status: 501 });
    }

    // If expectedText is provided, evaluate pronunciation using Claude AI
    if (expectedText && transcript) {
      try {
        const evaluationPrompt = `You are a German language pronunciation expert.

Student level: ${level}
Expected text: "${expectedText}"
Student's spoken text (transcribed): "${transcript}"

Evaluate the student's pronunciation and provide detailed feedback in JSON format:

{
  "accuracy": 0-100,  // How close to the expected text
  "pronunciation": 0-100,  // Pronunciation quality
  "fluency": 0-100,  // Natural flow and rhythm
  "feedback": "Detailed, encouraging feedback in Vietnamese about what was good and what needs improvement",
  "mistakes": [
    {
      "word": "incorrect word or phrase",
      "suggestion": "correct pronunciation/word",
      "explanation": "why it's important (in Vietnamese)"
    }
  ]
}

Be encouraging and constructive. For ${level} level, adjust expectations accordingly.`;

        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4',
          max_tokens: 2048,
          temperature: 0.3,
          messages: [
            {
              role: 'user',
              content: evaluationPrompt,
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

        const evaluation = JSON.parse(jsonText);

        return NextResponse.json({
          success: true,
          data: {
            transcript,
            confidence,
            language,
            evaluation,
          },
        });

      } catch (error: any) {
        console.error('Pronunciation evaluation error:', error);
        // Return transcript even if evaluation fails
        return NextResponse.json({
          success: true,
          data: {
            transcript,
            confidence,
            language,
          },
        });
      }
    }

    // Return transcript without evaluation
    return NextResponse.json({
      success: true,
      data: {
        transcript,
        confidence,
        language,
      },
    });

  } catch (error: any) {
    console.error('Speech-to-text error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to process speech',
    }, { status: 500 });
  }
}

// GET endpoint to check service availability
export async function GET(request: NextRequest): Promise<NextResponse> {
  const googleApiKey = process.env.GOOGLE_CLOUD_STT_API_KEY;
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

  return NextResponse.json({
    success: true,
    data: {
      services: {
        speechToText: {
          available: !!googleApiKey,
          provider: googleApiKey ? 'google' : 'none',
          fallback: 'browser Web Speech API',
        },
        pronunciationEvaluation: {
          available: !!anthropicApiKey,
          provider: anthropicApiKey ? 'anthropic-claude' : 'none',
        },
      },
      supportedLanguages: ['de-DE'],
      maxAudioDuration: 60, // seconds
      supportedFormats: ['webm', 'ogg', 'wav'],
    },
  });
}
