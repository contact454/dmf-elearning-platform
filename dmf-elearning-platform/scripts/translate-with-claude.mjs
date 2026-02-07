#!/usr/bin/env node
/**
 * German → Vietnamese Translation with Claude 3.5 Sonnet
 * High-quality, context-aware translation for A1 vocabulary
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';

const config = { apiKey: process.env.ANTHROPIC_API_KEY };
if (process.env.ANTHROPIC_BASE_URL) {
  config.baseURL = process.env.ANTHROPIC_BASE_URL;
}
const anthropic = new Anthropic(config);

const MODEL_NAME = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';

/**
 * Translate batch of German words to Vietnamese using Claude
 */
async function translateBatch(words, category) {
  const prompt = `Bạn là chuyên gia dịch thuật Đức-Việt chuyên nghiệp, chuyên về giảng dạy ngôn ngữ.

**NHIỆM VỤ**: Dịch các từ vựng tiếng Đức cấp độ A1 sau đây sang tiếng Việt CHÍNH XÁC:

**CHỦ ĐỀ**: ${category}

**DANH SÁCH TỪ** (JSON Array):
${JSON.stringify(words, null, 2)}

**YÊU CẦU**:
1. Dịch nghĩa tiếng Anh (meaning_en) sang tiếng Việt chính xác
2. Giữ nguyên giới tính (gender), loại từ (type), và từ gốc Đức (word)
3. Nếu từ có giới tính (der/die/das), thêm vào nghĩa tiếng Việt (ví dụ: "der Mann" → "người đàn ông (m)")
4. Với động từ, giữ "to" trong tiếng Việt nếu cần (ví dụ: "arbeiten" → "làm việc")
5. KHÔNG bịa đặt, KHÔNG thêm giải thích dài dòng

**OUTPUT FORMAT** (chỉ trả JSON, không markdown):
[
  {
    "word": "das Haus",
    "pos": "noun",
    "gender": "neuter",
    "type": "noun",
    "category": "surrounding",
    "meaning_vi": "ngôi nhà (n)",
    "meaning_en": "house",
    "level": "A1",
    "source": "CodingFriends + Claude Translation"
  }
]

Hãy trả về JSON array đầy đủ cho tất cả ${words.length} từ:`;

  const message = await anthropic.messages.create({
    model: MODEL_NAME,
    max_tokens: 8000,
    temperature: 0.2, // Low temperature for consistent translation
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  // Extract JSON from response
  const responseText = message.content[0].text;
  const jsonMatch = responseText.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('Invalid JSON response from Claude');
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * Process all categories
 */
async function processAllCategories() {
  // Load harvest data
  const harvestPath = path.resolve(
    'services/learning-service/storage/harvest-result.json'
  );

  let harvestData;
  try {
    const harvestContent = await fs.readFile(harvestPath, 'utf-8');
    harvestData = JSON.parse(harvestContent);
  } catch (error) {
    console.error('❌ Không tìm thấy harvest-result.json. Chạy harvest-german-vocab.mjs trước!');
    process.exit(1);
  }

  const { vocabulary } = harvestData;

  // Group by category
  const categorized = vocabulary.reduce((acc, word) => {
    if (!acc[word.category]) {
      acc[word.category] = [];
    }
    acc[word.category].push(word);
    return acc;
  }, {});

  console.log('🚀 Bắt đầu dịch với Claude 3.5 Sonnet...\n');

  const outputDir = path.resolve(
    'services/learning-service/storage/resource-hub/A1'
  );
  await fs.mkdir(outputDir, { recursive: true });

  let totalTranslated = 0;
  const categoryNames = Object.keys(categorized);

  for (let i = 0; i < categoryNames.length; i++) {
    const category = categoryNames[i];
    const words = categorized[category];

    console.log(`[${i + 1}/${categoryNames.length}] Đang dịch "${category}" (${words.length} từ)...`);

    try {
      // Translate with Claude
      const translated = await translateBatch(words, category);

      // Save to file
      const filename = `${category.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
      const filepath = path.join(outputDir, filename);

      await fs.writeFile(filepath, JSON.stringify(translated, null, 2), 'utf-8');

      totalTranslated += translated.length;
      console.log(`   ✅ Đã lưu: ${filename} (${translated.length} từ)`);

      // Rate limiting: wait 1 second between requests
      if (i < categoryNames.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`   ❌ Lỗi khi dịch "${category}":`, error.message);
    }
  }

  console.log(`\n✨ HOÀN THÀNH! Đã dịch ${totalTranslated} từ với Claude 3.5 Sonnet`);
}

// Run
processAllCategories().catch(console.error);
