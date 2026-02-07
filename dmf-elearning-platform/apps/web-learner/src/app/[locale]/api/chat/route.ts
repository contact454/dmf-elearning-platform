import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const LEARNING_SERVICE_URL = process.env.LEARNING_SERVICE_URL || 'http://localhost:3003';

// Initialize Anthropic client with proxy support
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: process.env.ANTHROPIC_BASE_URL || undefined,
});

interface VocabularyItem {
  id: string;
  word: string;
  meaning_vi: string | null;
  level: string;
  topic: string | null;
  pos: string | null;
  example_de: string | null;
  example_vi: string | null;
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Extract keywords from user message for vocabulary search
 */
function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    'là', 'gì', 'có', 'không', 'được', 'để', 'và', 'hoặc', 'nhưng', 'của',
    'trong', 'ngoài', 'trên', 'dưới', 'với', 'cho', 'từ', 'đến', 'như', 'thế',
    'nào', 'sao', 'tại', 'vì', 'bạn', 'tôi', 'chúng', 'họ', 'anh', 'chị',
    'em', 'ông', 'bà', 'cô', 'chú', 'một', 'hai', 'ba', 'nhiều', 'ít',
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'what', 'how', 'why',
    'when', 'where', 'which', 'who', 'whom', 'can', 'could', 'would', 'should',
    'do', 'does', 'did', 'have', 'has', 'had', 'be', 'been', 'being',
    'this', 'that', 'these', 'those', 'it', 'its', 'hãy', 'xin', 'vui', 'lòng',
    'nghĩa', 'tiếng', 'đức', 'việt', 'dịch', 'học', 'từ', 'vựng', 'nghia',
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(word => word.length > 1 && !stopWords.has(word));

  return [...new Set(words)];
}

/**
 * Fetch relevant vocabulary from learning service
 */
async function fetchVocabularyContext(keywords: string[]): Promise<VocabularyItem[]> {
  const allResults: VocabularyItem[] = [];

  try {
    const searchPromises = keywords.slice(0, 5).map(async (keyword) => {
      try {
        const response = await fetch(
          `${LEARNING_SERVICE_URL}/api/vocabulary?search=${encodeURIComponent(keyword)}&limit=3`
        );
        if (response.ok) {
          const data = await response.json();
          return data.items || [];
        }
      } catch {
        return [];
      }
      return [];
    });

    const results = await Promise.all(searchPromises);
    results.forEach(items => allResults.push(...items));

    const uniqueWords = new Map<string, VocabularyItem>();
    allResults.forEach(item => {
      if (!uniqueWords.has(item.word)) {
        uniqueWords.set(item.word, item);
      }
    });

    return Array.from(uniqueWords.values()).slice(0, 10);
  } catch (error) {
    console.error('Error fetching vocabulary:', error);
    return [];
  }
}

/**
 * Build system prompt with vocabulary context
 */
function buildSystemPrompt(vocabularyContext: VocabularyItem[]): string {
  let contextSection = '';

  if (vocabularyContext.length > 0) {
    const vocabData = vocabularyContext.map(v => ({
      word: v.word,
      meaning: v.meaning_vi,
      level: v.level,
      topic: v.topic,
      pos: v.pos,
      example: v.example_de,
    }));

    contextSection = `

## Dữ liệu từ vựng liên quan từ từ điển của App:
\`\`\`json
${JSON.stringify(vocabData, null, 2)}
\`\`\`

Hãy sử dụng dữ liệu trên để trả lời chính xác hơn nếu có liên quan.`;
  }

  return `Bạn là AI Sensei, một giáo viên tiếng Đức thân thiện và chuyên nghiệp trong ứng dụng học tiếng Đức DMF Elearning.

## Vai trò:
- Giúp học viên Việt Nam học tiếng Đức hiệu quả
- Giải đáp thắc mắc về từ vựng, ngữ pháp, phát âm
- Đưa ra ví dụ thực tế và dễ hiểu

## Quy tắc trả lời:
1. Trả lời bằng tiếng Việt là chính, kèm tiếng Đức khi cần thiết
2. Giải thích ngắn gọn, dễ hiểu, phù hợp với người mới học
3. Đưa ra ví dụ cụ thể khi giải thích ngữ pháp
4. Khuyến khích và động viên học viên
5. Nếu được hỏi về từ nào đó, hãy cung cấp: nghĩa, giống (der/die/das), cách dùng
${contextSection}

## Phong cách:
- Thân thiện, nhiệt tình
- Sử dụng emoji phù hợp để tạo không khí thoải mái
- Trả lời không quá dài (tối đa 200 từ)`;
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json() as { messages: Message[] };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    // Get the last user message for context retrieval
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    const userQuery = lastUserMessage?.content || '';

    // Extract keywords and fetch vocabulary context
    const keywords = extractKeywords(userQuery);
    const vocabularyContext = await fetchVocabularyContext(keywords);

    // Build system prompt with context
    const systemPrompt = buildSystemPrompt(vocabularyContext);

    // Prepare messages for Claude
    const claudeMessages = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    // Stream response from Claude
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-5',
            max_tokens: 500,
            system: systemPrompt,
            messages: claudeMessages,
            stream: true,
          });

          for await (const event of response) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              // Format for Vercel AI SDK useChat hook
              const data = `0:${JSON.stringify(event.delta.text)}\n`;
              controller.enqueue(encoder.encode(data));
            }
          }

          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
