#!/usr/bin/env node
/**
 * Generate Example Sentences with Claude
 * Adds contextual German-Vietnamese example sentences for each word
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Generate example sentences for a batch of words
 */
async function generateExamples(words, category) {
  const prompt = `Bạn là giáo viên tiếng Đức chuyên nghiệp.

**NHIỆM VỤ**: Tạo câu ví dụ tiếng Đức cấp độ A1 đơn giản cho mỗi từ sau, kèm dịch tiếng Việt.

**CHỦ ĐỀ**: ${category}

**DANH SÁCH TỪ**:
${words.map(w => `- ${w.word} (${w.meaning_vi})`).join('\n')}

**YÊU CẦU**:
1. Mỗi từ có 1 câu ví dụ A1 đơn giản (5-8 từ)
2. Câu phải thực tế, hữu ích cho người học
3. Dịch chính xác sang tiếng Việt
4. Highlight từ vựng bằng **bold**

**OUTPUT FORMAT** (JSON array):
[
  {
    "word": "das Haus",
    "example_de": "**Das Haus** ist sehr groß.",
    "example_vi": "**Ngôi nhà** rất lớn.",
    "example_en": "The house is very big."
  }
]

Trả về JSON cho ${words.length} từ:`;

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4000,
    temperature: 0.3,
    messages: [{ role: 'user', content: prompt }],
  });

  const responseText = message.content[0].text;
  const jsonMatch = responseText.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('Invalid JSON response');
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * Process all vocabulary files and add examples
 */
async function enrichWithExamples() {
  console.log('📝 Bắt đầu tạo câu ví dụ với Claude...\n');

  const resourceDir = path.resolve(
    'dmf-elearning-platform/services/learning-service/storage/resource-hub/A1'
  );

  const files = await fs.readdir(resourceDir);
  const jsonFiles = files.filter(f => f.endsWith('.json'));

  console.log(`📁 Tìm thấy ${jsonFiles.length} file\n`);

  for (let i = 0; i < jsonFiles.length; i++) {
    const file = jsonFiles[i];
    const filepath = path.join(resourceDir, file);

    console.log(`[${i + 1}/${jsonFiles.length}] Đang xử lý ${file}...`);

    const content = await fs.readFile(filepath, 'utf-8');
    const words = JSON.parse(content);

    if (words.length === 0) continue;

    try {
      // Generate examples in batches of 10
      const batchSize = 10;
      const enrichedWords = [];

      for (let j = 0; j < words.length; j += batchSize) {
        const batch = words.slice(j, j + batchSize);
        const category = batch[0].category || file.replace('.json', '');

        console.log(`   Batch ${Math.floor(j / batchSize) + 1}: ${batch.length} từ`);

        const examples = await generateExamples(batch, category);

        // Merge examples back into words
        batch.forEach((word, idx) => {
          const example = examples.find(e => e.word === word.word);
          enrichedWords.push({
            ...word,
            example_de: example?.example_de || '',
            example_vi: example?.example_vi || '',
            example_en: example?.example_en || '',
          });
        });

        // Rate limiting
        if (j + batchSize < words.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Save enriched data
      await fs.writeFile(filepath, JSON.stringify(enrichedWords, null, 2), 'utf-8');
      console.log(`   ✅ Đã thêm ${enrichedWords.length} câu ví dụ\n`);

    } catch (error) {
      console.error(`   ❌ Lỗi: ${error.message}\n`);
    }
  }

  console.log('✨ HOÀN THÀNH! Tất cả từ vựng đã có câu ví dụ.');
}

enrichWithExamples().catch(console.error);
