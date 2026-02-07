import { NextRequest, NextResponse } from 'next/server';

// ═══════════════════════════════════════════════════════════════
// AI Text-to-Speech API
// Converts German text to audio for pronunciation practice
// Uses Web Speech API on client or external TTS service
// ═══════════════════════════════════════════════════════════════

interface TextToSpeechRequest {
  text: string;
  language?: string;
  voice?: string;
  speed?: number;
  pitch?: number;
}

interface TextToSpeechResponse {
  success: boolean;
  data?: {
    text: string;
    language: string;
    voice: string;
    audioUrl?: string;
    duration?: number;
    // Return configuration for client-side synthesis
    synthesis: {
      text: string;
      lang: string;
      rate: number;
      pitch: number;
      voice: string;
    };
  };
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<TextToSpeechResponse>> {
  try {
    const body: TextToSpeechRequest = await request.json();
    const {
      text,
      language = 'de-DE',
      voice = 'de-DE-Neural2-B',
      speed = 1.0,
      pitch = 1.0
    } = body;

    if (!text) {
      return NextResponse.json({
        success: false,
        error: 'Text is required',
      }, { status: 400 });
    }

    // Validate text length (max 5000 characters)
    if (text.length > 5000) {
      return NextResponse.json({
        success: false,
        error: 'Text is too long (max 5000 characters)',
      }, { status: 400 });
    }

    // Validate speed (0.25 to 4.0)
    if (speed < 0.25 || speed > 4.0) {
      return NextResponse.json({
        success: false,
        error: 'Speed must be between 0.25 and 4.0',
      }, { status: 400 });
    }

    // Validate pitch (0.0 to 2.0)
    if (pitch < 0.0 || pitch > 2.0) {
      return NextResponse.json({
        success: false,
        error: 'Pitch must be between 0.0 and 2.0',
      }, { status: 400 });
    }

    // Check if Google Cloud TTS API key is available
    const googleApiKey = process.env.GOOGLE_CLOUD_TTS_API_KEY;

    if (googleApiKey) {
      // Use Google Cloud Text-to-Speech API
      try {
        const response = await fetch(
          `https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleApiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              input: { text },
              voice: {
                languageCode: language,
                name: voice,
              },
              audioConfig: {
                audioEncoding: 'MP3',
                speakingRate: speed,
                pitch: pitch,
              },
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Google TTS API error: ${response.statusText}`);
        }

        const data = await response.json();

        // Return base64 audio data
        return NextResponse.json({
          success: true,
          data: {
            text,
            language,
            voice,
            audioUrl: `data:audio/mp3;base64,${data.audioContent}`,
            duration: Math.ceil(text.length / 10), // Rough estimate
            synthesis: {
              text,
              lang: language,
              rate: speed,
              pitch: pitch,
              voice,
            },
          },
        });
      } catch (error: any) {
        console.error('Google TTS API error:', error);
        // Fall through to client-side synthesis
      }
    }

    // Return configuration for client-side Web Speech API synthesis
    // The client will use window.speechSynthesis to generate audio
    return NextResponse.json({
      success: true,
      data: {
        text,
        language,
        voice,
        duration: Math.ceil(text.length / 10), // Rough estimate: ~10 chars per second
        synthesis: {
          text,
          lang: language,
          rate: speed,
          pitch: pitch,
          voice: voice,
        },
      },
    });

  } catch (error: any) {
    console.error('Text-to-speech error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to synthesize speech',
    }, { status: 500 });
  }
}

// GET endpoint to list available voices
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const googleApiKey = process.env.GOOGLE_CLOUD_TTS_API_KEY;

    if (googleApiKey) {
      // Fetch available voices from Google Cloud TTS
      const response = await fetch(
        `https://texttospeech.googleapis.com/v1/voices?key=${googleApiKey}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const germanVoices = data.voices.filter((v: any) =>
          v.languageCodes.includes('de-DE')
        );

        return NextResponse.json({
          success: true,
          data: {
            voices: germanVoices,
            provider: 'google',
          },
        });
      }
    }

    // Return default German voices for Web Speech API
    return NextResponse.json({
      success: true,
      data: {
        voices: [
          {
            name: 'de-DE-Standard-A',
            languageCodes: ['de-DE'],
            ssmlGender: 'FEMALE',
            provider: 'browser',
          },
          {
            name: 'de-DE-Standard-B',
            languageCodes: ['de-DE'],
            ssmlGender: 'MALE',
            provider: 'browser',
          },
        ],
        provider: 'browser',
      },
    });

  } catch (error: any) {
    console.error('Error fetching voices:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch voices',
    }, { status: 500 });
  }
}
