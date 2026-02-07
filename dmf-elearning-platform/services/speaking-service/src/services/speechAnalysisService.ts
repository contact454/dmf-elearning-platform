import OpenAI from 'openai';
import { TranscriptResult, SpeechAnalysisResult, PronunciationAnalysis } from '../types';
import fs from 'fs';
import FormData from 'form-data';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

export class SpeechAnalysisService {
  /**
   * Transcribe audio file using OpenAI Whisper
   */
  async transcribeAudio(audioPath: string): Promise<TranscriptResult> {
    try {
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(audioPath),
        model: 'whisper-1',
        language: 'de', // German language
        response_format: 'verbose_json',
      });

      return {
        text: transcription.text,
        confidence: 0.95, // Whisper doesn't provide confidence, using default
        duration: transcription.duration,
        language: transcription.language,
      };
    } catch (error: any) {
      console.error('Whisper transcription error:', error);
      throw new Error(`Transcription failed: ${error.message}`);
    }
  }

  /**
   * Analyze speech using GPT-4 for comprehensive feedback
   */
  async analyzeSpeech(
    transcriptText: string,
    promptText: string,
    cefrLevel: string,
    audioPath?: string
  ): Promise<SpeechAnalysisResult> {
    try {
      const systemPrompt = `You are a German language expert evaluating a student's speaking performance at ${cefrLevel} level.
Analyze the transcript and provide detailed feedback on:
1. Pronunciation quality (0-100)
2. Fluency and coherence (0-100)
3. Vocabulary range and accuracy (0-100)
4. Grammar accuracy (0-100)

Consider the prompt: "${promptText}"

Provide constructive feedback with:
- 3 strengths (what they did well)
- 3 weaknesses (areas to improve)
- 3 specific suggestions for improvement
- A detailed feedback paragraph

Return your response in JSON format:
{
  "pronunciationScore": number,
  "fluencyScore": number,
  "vocabularyScore": number,
  "grammarScore": number,
  "strengths": [string, string, string],
  "weaknesses": [string, string, string],
  "suggestions": [string, string, string],
  "detailedFeedback": string
}`;

      const completion = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `Transcript: "${transcriptText}"` 
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      const analysis = JSON.parse(completion.choices[0].message.content || '{}');

      // Calculate overall score (weighted average)
      const overallScore = (
        analysis.pronunciationScore * 0.25 +
        analysis.fluencyScore * 0.25 +
        analysis.vocabularyScore * 0.25 +
        analysis.grammarScore * 0.25
      );

      return {
        transcriptText,
        overallScore: Math.round(overallScore * 100) / 100,
        pronunciationScore: analysis.pronunciationScore,
        fluencyScore: analysis.fluencyScore,
        vocabularyScore: analysis.vocabularyScore,
        grammarScore: analysis.grammarScore,
        aiFeedback: {
          strengths: analysis.strengths || [],
          weaknesses: analysis.weaknesses || [],
          suggestions: analysis.suggestions || [],
          detailedFeedback: analysis.detailedFeedback || '',
        },
      };
    } catch (error: any) {
      console.error('Speech analysis error:', error);
      throw new Error(`Speech analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze pronunciation at word level
   */
  async analyzePronunciation(
    transcriptText: string,
    cefrLevel: string
  ): Promise<PronunciationAnalysis[]> {
    try {
      const systemPrompt = `You are a German pronunciation expert. Analyze the transcript and identify:
- Words with potential pronunciation issues
- Common pronunciation mistakes for ${cefrLevel} learners
- Specific phonemes that need improvement

For each problematic word, provide:
- The word
- Expected IPA pronunciation
- Accuracy score (0-100)
- Brief feedback

Return JSON array:
[
  {
    "word": string,
    "expectedPronunciation": string (IPA),
    "accuracyScore": number,
    "feedbackText": string
  }
]`;

      const completion = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Transcript: "${transcriptText}"` },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      const response = JSON.parse(completion.choices[0].message.content || '{"pronunciationIssues": []}');
      const issues = response.pronunciationIssues || [];

      return issues.map((issue: any) => ({
        word: issue.word,
        expectedPronunciation: issue.expectedPronunciation,
        accuracyScore: issue.accuracyScore,
        feedbackText: issue.feedbackText,
      }));
    } catch (error: any) {
      console.error('Pronunciation analysis error:', error);
      // Return empty array instead of throwing
      return [];
    }
  }

  /**
   * Complete speech analysis (transcript + feedback + pronunciation)
   */
  async analyzeComplete(
    audioPath: string,
    promptText: string,
    cefrLevel: string
  ): Promise<SpeechAnalysisResult & { transcriptResult: TranscriptResult }> {
    // Step 1: Transcribe
    const transcriptResult = await this.transcribeAudio(audioPath);

    // Step 2: Analyze speech
    const analysis = await this.analyzeSpeech(
      transcriptResult.text,
      promptText,
      cefrLevel,
      audioPath
    );

    // Step 3: Pronunciation analysis
    const pronunciationFeedback = await this.analyzePronunciation(
      transcriptResult.text,
      cefrLevel
    );

    return {
      ...analysis,
      pronunciationFeedback,
      transcriptResult,
    };
  }
}
