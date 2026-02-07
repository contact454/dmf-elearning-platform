#!/usr/bin/env node
/**
 * Data Quality Validator
 * Audit translated vocabulary for accuracy and completeness
 */

import fs from 'fs/promises';
import path from 'path';

const KNOWN_TRANSLATIONS = {
  // Colors
  'rot': 'đỏ',
  'blau': 'xanh dương',
  'grün': 'xanh lá',
  'gelb': 'vàng',
  'weiß': 'trắng',
  'schwarz': 'đen',

  // Numbers
  'eins': 'một',
  'zwei': 'hai',
  'drei': 'ba',
  'vier': 'bốn',
  'fünf': 'năm',

  // Common verbs
  'sein': 'là',
  'haben': 'có',
  'gehen': 'đi',
  'machen': 'làm',
  'essen': 'ăn',
};

async function validateTranslations() {
  console.log('🔍 BẮT ĐẦU THANH TRA CHẤT LƯỢNG DỮ LIỆU\n');

  const resourceDir = path.resolve(
    'services/learning-service/storage/resource-hub/A1'
  );

  let files;
  try {
    files = await fs.readdir(resourceDir);
    files = files.filter(f => f.endsWith('.json'));
  } catch (error) {
    console.error('❌ Không tìm thấy thư mục resource-hub/A1');
    process.exit(1);
  }

  console.log(`📁 Tìm thấy ${files.length} file JSON\n`);

  let totalWords = 0;
  let validWords = 0;
  let issuesFound = [];

  for (const file of files) {
    const filepath = path.join(resourceDir, file);
    const content = await fs.readFile(filepath, 'utf-8');
    const data = JSON.parse(content);

    console.log(`📄 ${file}: ${data.length} từ`);

    for (const item of data) {
      totalWords++;

      // Check 1: Has Vietnamese meaning
      if (!item.meaning_vi) {
        issuesFound.push({
          file,
          word: item.word,
          issue: 'Thiếu meaning_vi',
        });
        continue;
      }

      // Check 2: Vietnamese meaning is not English
      if (item.meaning_vi === item.meaning_en) {
        issuesFound.push({
          file,
          word: item.word,
          issue: `Nghĩa tiếng Việt giống tiếng Anh: "${item.meaning_vi}"`,
        });
        continue;
      }

      // Check 3: Known translations validation
      const baseWord = item.word.replace(/^(der|die|das)\s+/, '');
      if (KNOWN_TRANSLATIONS[baseWord]) {
        const expected = KNOWN_TRANSLATIONS[baseWord];
        if (!item.meaning_vi.includes(expected)) {
          issuesFound.push({
            file,
            word: item.word,
            issue: `Nghĩa sai: "${item.meaning_vi}" (đáng lẽ phải có "${expected}")`,
          });
          continue;
        }
      }

      // Check 4: Has level field
      if (!item.level || item.level !== 'A1') {
        issuesFound.push({
          file,
          word: item.word,
          issue: `Thiếu hoặc sai cấp độ: "${item.level}"`,
        });
        continue;
      }

      validWords++;
    }
  }

  // Report
  console.log('\n' + '='.repeat(60));
  console.log('📊 BÁO CÁO THANH TRA');
  console.log('='.repeat(60));

  console.log(`\n✅ Từ hợp lệ: ${validWords}/${totalWords} (${((validWords / totalWords) * 100).toFixed(1)}%)`);

  if (issuesFound.length > 0) {
    console.log(`\n⚠️  Phát hiện ${issuesFound.length} vấn đề:\n`);

    const samples = issuesFound.slice(0, 10);
    samples.forEach((issue, i) => {
      console.log(`${i + 1}. [${issue.file}] "${issue.word}"`);
      console.log(`   → ${issue.issue}\n`);
    });

    if (issuesFound.length > 10) {
      console.log(`   ... và ${issuesFound.length - 10} vấn đề khác\n`);
    }
  } else {
    console.log('\n✨ KHÔNG PHÁT HIỆN VẤN ĐỀ NÀO!\n');
  }

  // Scoring
  const score = (validWords / totalWords) * 10;
  console.log('='.repeat(60));
  console.log(`🎯 ĐIỂM CHẤT LƯỢNG: ${score.toFixed(1)}/10`);
  console.log('='.repeat(60));

  if (score >= 9) {
    console.log('\n🏆 XUẤT SẮC! Dữ liệu sẵn sàng production.');
  } else if (score >= 7) {
    console.log('\n✅ TỐT! Một số vấn đề nhỏ cần sửa.');
  } else if (score >= 5) {
    console.log('\n⚠️  TRUNG BÌNH. Cần review và sửa chữa.');
  } else {
    console.log('\n❌ KÉM! Khuyến nghị xóa và làm lại.');
    console.log('   rm -rf services/learning-service/storage/resource-hub/A1/*');
  }

  console.log('');
}

validateTranslations().catch(console.error);
