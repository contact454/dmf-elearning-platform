#!/usr/bin/env node
/**
 * Test Claude API Connection
 * Quick validation before running full translation
 */

import Anthropic from '@anthropic-ai/sdk';

async function testClaudeAPI() {
  console.log('🔍 Kiểm tra kết nối Claude API...\n');

  // Check API key
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.error('❌ ANTHROPIC_API_KEY không tồn tại!');
    console.error('\n📖 Hướng dẫn:');
    console.error('   export ANTHROPIC_API_KEY="sk-ant-api03-YOUR_KEY"');
    console.error('   hoặc thêm vào .env file\n');
    process.exit(1);
  }

  console.log(`✅ API Key found: ${apiKey.substring(0, 20)}...`);

  // Test translation
  const config = { apiKey };

  // Support custom base URL (for OpenRouter, etc.)
  if (process.env.ANTHROPIC_BASE_URL) {
    config.baseURL = process.env.ANTHROPIC_BASE_URL;
    console.log(`🔗 Using custom endpoint: ${config.baseURL}\n`);
  }

  const anthropic = new Anthropic(config);

  try {
    console.log('\n🧪 Test dịch 3 từ mẫu...\n');

    const testWords = [
      { word: 'rot', meaning_en: 'red', type: 'adjective' },
      { word: 'das Haus', meaning_en: 'house', type: 'noun', gender: 'neuter' },
      { word: 'arbeiten', meaning_en: 'to work', type: 'verb' }
    ];

    // Try different model names for different providers
    const modelName = process.env.ANTHROPIC_MODEL || 'anthropic/claude-3.5-sonnet:beta';

    console.log(`🤖 Using model: ${modelName}\n`);

    const message = await anthropic.messages.create({
      model: modelName,
      max_tokens: 2000,
      temperature: 0.2,
      messages: [
        {
          role: 'user',
          content: `Dịch các từ Đức sau sang tiếng Việt chính xác. Trả về JSON array:

${JSON.stringify(testWords, null, 2)}

Format: [{"word": "rot", "meaning_vi": "đỏ", "meaning_en": "red", "type": "adjective"}]`
        }
      ]
    });

    const response = message.content[0].text;
    console.log('📨 Phản hồi từ Claude:');
    console.log(response);

    // Parse JSON
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      console.log('\n✅ TEST THÀNH CÔNG!');
      console.log('\n📊 Kết quả dịch:');
      result.forEach(item => {
        console.log(`   ${item.word} → ${item.meaning_vi}`);
      });

      console.log('\n🚀 Sẵn sàng chạy translation toàn bộ!');
      console.log('   node scripts/translate-with-claude.mjs');
    } else {
      console.error('⚠️  Không parse được JSON. Kiểm tra response format.');
    }

  } catch (error) {
    console.error('\n❌ LỖI KHI GỌI CLAUDE API:');
    console.error(`   ${error.message}`);

    if (error.status === 401) {
      console.error('\n🔑 API Key không hợp lệ. Kiểm tra lại:');
      console.error('   https://console.anthropic.com/settings/keys');
    }

    process.exit(1);
  }
}

testClaudeAPI().catch(console.error);
