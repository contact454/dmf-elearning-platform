/**
 * German A1 Curriculum Seed Script
 * Imports curriculum.json into PostgreSQL database
 */

import pg from 'pg';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Direct PostgreSQL connection
const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'dmf_elearning',
  user: 'postgres',
  password: 'postgres'
});

async function main() {
  console.log('🌱 Seeding German A1 Curriculum...\n');

  await client.connect();

  // Read curriculum
  const curriculumPath = path.join(__dirname, '../storage/curriculum/german_a1_curriculum.json');
  const curriculum = JSON.parse(await fs.readFile(curriculumPath, 'utf-8'));

  console.log(`📚 Curriculum: ${curriculum.totalUnits} units, ${curriculum.totalWords} words\n`);

  // Create or get German A1 language
  const langResult = await client.query(`
    INSERT INTO "Languages" (id, code, name, level, "createdAt", "updatedAt")
    VALUES ('de-a1', 'de', 'German', 'A1', NOW(), NOW())
    ON CONFLICT (code) DO UPDATE SET name = 'German', level = 'A1', "updatedAt" = NOW()
    RETURNING id
  `);

  const languageId = langResult.rows[0].id;
  console.log(`✓ Language: German (A1) - ID: ${languageId}\n`);

  // Import units and vocabulary
  let totalVocabImported = 0;

  for (const unitData of curriculum.units) {
    // Skip units without examples
    const vocabWithExamples = unitData.vocabulary.filter(v => v.examples && v.examples.length > 0);

    if (vocabWithExamples.length === 0) {
      console.log(`⏭  Unit ${unitData.unitId}: ${unitData.title} - No examples yet, skipping`);
      continue;
    }

    console.log(`📝 Unit ${unitData.unitId}: ${unitData.title}`);
    console.log(`   Vocabulary: ${vocabWithExamples.length}/${unitData.vocabularyCount} words with examples`);

    // Create unit
    const unitResult = await client.query(`
      INSERT INTO "Units" (
        id, "languageId", "unitNumber", title, description, "grammarTopic",
        "grammarExplanation", "grammarExamples", "orderIndex", "createdAt", "updatedAt"
      )
      VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      ON CONFLICT ("languageId", "unitNumber")
      DO UPDATE SET
        title = $3,
        description = $4,
        "grammarTopic" = $5,
        "grammarExplanation" = $6,
        "grammarExamples" = $7,
        "orderIndex" = $8,
        "updatedAt" = NOW()
      RETURNING id
    `, [
      languageId,
      unitData.unitId,
      unitData.title,
      unitData.description,
      unitData.grammarPoint?.topic,
      unitData.grammarPoint?.explanation,
      JSON.stringify(unitData.grammarPoint?.examples || []),
      unitData.unitId
    ]);

    const unitId = unitResult.rows[0].id;

    // Import vocabulary
    for (let i = 0; i < vocabWithExamples.length; i++) {
      const vocabItem = vocabWithExamples[i];

      await client.query(`
        INSERT INTO "Vocabulary" (
          id, "unitId", word, "meaningEn", "meaningVi", gender, "wordType",
          category, examples, "orderIndex", "createdAt", "updatedAt"
        )
        VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
        ON CONFLICT ("unitId", word)
        DO UPDATE SET
          "meaningEn" = $3,
          "meaningVi" = $4,
          gender = $5,
          "wordType" = $6,
          category = $7,
          examples = $8,
          "orderIndex" = $9,
          "updatedAt" = NOW()
      `, [
        unitId,
        vocabItem.word,
        vocabItem.meaning_en,
        vocabItem.meaning_vi,
        vocabItem.gender,
        vocabItem.type,
        vocabItem.category,
        JSON.stringify(vocabItem.examples),
        i
      ]);

      totalVocabImported++;
    }

    console.log(`   ✓ Imported ${vocabWithExamples.length} words\n`);
  }

  console.log('='.repeat(55));
  console.log(`✅ Seeding complete!`);
  console.log(`   Total vocabulary imported: ${totalVocabImported} words`);
  console.log('='.repeat(55));
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await client.end();
  });
