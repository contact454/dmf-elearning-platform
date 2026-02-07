/**
 * Text-to-Speech Service
 * Integrates Google Cloud TTS API for audio generation
 * Falls back to null if API key not configured (frontend will use Web Speech API)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Google TTS client (lazy initialization)
let ttsClient: any = null;

/**
 * Initialize Google TTS client if API key is available
 */
async function initializeTtsClient() {
  if (ttsClient !== null) {
    return ttsClient;
  }

  const apiKey = process.env.GOOGLE_TTS_API_KEY;
  
  if (!apiKey) {
    console.warn('[ttsService] GOOGLE_TTS_API_KEY not configured. Audio will use Web Speech API fallback.');
    ttsClient = false; // Mark as unavailable
    return null;
  }

  try {
    // Dynamic import to avoid error if package not installed
    const { TextToSpeechClient } = await import('@google-cloud/text-to-speech');
    
    ttsClient = new TextToSpeechClient({
      apiKey: apiKey
    });
    
    console.log('[ttsService] Google TTS client initialized successfully');
    return ttsClient;
  } catch (error) {
    console.error('[ttsService] Failed to initialize Google TTS client:', error.message);
    console.warn('[ttsService] Falling back to Web Speech API. Install @google-cloud/text-to-speech to enable server-side TTS.');
    ttsClient = false;
    return null;
  }
}

/**
 * Generate audio URL for a word
 * Uses cache if exists, generates if needed
 * 
 * @param wordId - VocabularyItem ID
 * @param text - Text to convert to speech
 * @param language - Language code (default: de-DE)
 * @returns Audio URL (data URL or null for fallback)
 */
export async function generateAudioUrl(
  wordId: string,
  text: string,
  language: string = 'de-DE'
): Promise<string | null> {
  try {
    // 1. Check cache first
    const word = await prisma.vocabularyItem.findUnique({
      where: { id: wordId },
      select: { audioUrl: true }
    });

    if (word?.audioUrl) {
      console.log(`[ttsService] Using cached audio for word ${wordId}`);
      return word.audioUrl;
    }

    // 2. Initialize TTS client if not done
    const client = await initializeTtsClient();
    
    if (!client) {
      console.log(`[ttsService] TTS client not available for word ${wordId}, using fallback`);
      return null; // Frontend will use Web Speech API
    }

    // 3. Generate audio using Google TTS
    console.log(`[ttsService] Generating audio for: "${text}" (${language})`);
    
    const [response] = await client.synthesizeSpeech({
      input: { text },
      voice: {
        languageCode: language,
        name: language === 'de-DE' ? 'de-DE-Wavenet-D' : undefined,
        ssmlGender: 'NEUTRAL'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 0.9, // Slightly slower for learning
        pitch: 0.0
      }
    });

    // 4. Convert to base64 data URL
    // TODO: In production, upload to S3/Cloud Storage instead
    const audioContent = response.audioContent as Buffer;
    const base64Audio = audioContent.toString('base64');
    const dataUrl = `data:audio/mp3;base64,${base64Audio}`;

    // 5. Cache URL in database
    await prisma.vocabularyItem.update({
      where: { id: wordId },
      data: { audioUrl: dataUrl }
    });

    console.log(`[ttsService] Audio generated and cached for word ${wordId}`);
    return dataUrl;

  } catch (error) {
    console.error('[ttsService] generateAudioUrl failed:', {
      wordId,
      text,
      error: error.message,
      stack: error.stack
    });
    return null; // Fallback to browser TTS
  }
}

/**
 * Generate audio for multiple words (batch processing)
 * Useful for pre-generating audio for new vocabulary imports
 * 
 * @param wordIds - Array of VocabularyItem IDs
 * @returns Object with success count and errors
 */
export async function batchGenerateAudio(
  wordIds: string[]
): Promise<{ success: number; failed: number; errors: string[] }> {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[]
  };

  console.log(`[ttsService] Starting batch audio generation for ${wordIds.length} words`);

  for (const wordId of wordIds) {
    try {
      // Fetch word
      const word = await prisma.vocabularyItem.findUnique({
        where: { id: wordId },
        select: { id: true, word: true, audioUrl: true }
      });

      if (!word) {
        results.failed++;
        results.errors.push(`Word ${wordId} not found`);
        continue;
      }

      // Skip if already has audio
      if (word.audioUrl) {
        console.log(`[ttsService] Skipping ${word.word} - audio already exists`);
        results.success++;
        continue;
      }

      // Generate audio
      const audioUrl = await generateAudioUrl(wordId, word.word);
      
      if (audioUrl) {
        results.success++;
      } else {
        results.failed++;
        results.errors.push(`Failed to generate audio for ${word.word}`);
      }

      // Rate limiting: wait 100ms between requests to avoid API limits
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      results.failed++;
      results.errors.push(`Error processing ${wordId}: ${error.message}`);
      console.error(`[ttsService] Batch generation error for ${wordId}:`, error.message);
    }
  }

  console.log(`[ttsService] Batch generation complete: ${results.success} success, ${results.failed} failed`);
  return results;
}

/**
 * Clear cached audio for a word (force regeneration)
 * 
 * @param wordId - VocabularyItem ID
 */
export async function clearAudioCache(wordId: string): Promise<void> {
  try {
    await prisma.vocabularyItem.update({
      where: { id: wordId },
      data: { audioUrl: null }
    });
    console.log(`[ttsService] Cleared audio cache for word ${wordId}`);
  } catch (error) {
    console.error(`[ttsService] Failed to clear audio cache for ${wordId}:`, error.message);
    throw error;
  }
}
