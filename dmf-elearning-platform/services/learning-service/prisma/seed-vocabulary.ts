import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface VocabEntry {
  word: string;
  pos: string;
  meaning_vi: string;
  source: string;
  addedAt: string;
}

interface VocabStats {
  total: number;
  byLevel: Record<string, number>;
  errors: Array<{ file: string; error: string }>;
  duplicates: number;
}

// Map complex level folders to standard CEFR levels
function normalizeCEFRLevel(folderName: string): string {
  // Handle combined levels like "A1|B1" -> take the first level
  if (folderName.includes('|')) {
    const levels = folderName.split('|');
    // Return the lowest level (first in sorted order)
    const cefrOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    for (const level of cefrOrder) {
      if (levels.includes(level)) {
        return level;
      }
    }
  }

  // Handle standard levels
  if (['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(folderName)) {
    return folderName;
  }

  // Default to A1 for unknown/invalid levels
  return 'A1';
}

async function readVocabularyFiles(resourceHubPath: string): Promise<{
  vocabularies: Array<VocabEntry & { level: string; topic: string }>;
  stats: VocabStats;
}> {
  const vocabularies: Array<VocabEntry & { level: string; topic: string }> = [];
  const stats: VocabStats = {
    total: 0,
    byLevel: {},
    errors: [],
    duplicates: 0,
  };

  const seenWords = new Set<string>();

  try {
    const levelFolders = fs.readdirSync(resourceHubPath);

    for (const levelFolder of levelFolders) {
      const levelPath = path.join(resourceHubPath, levelFolder);

      // Skip non-directories and hidden files
      if (!fs.statSync(levelPath).isDirectory() || levelFolder.startsWith('.')) {
        continue;
      }

      const level = normalizeCEFRLevel(levelFolder);

      if (!stats.byLevel[level]) {
        stats.byLevel[level] = 0;
      }

      try {
        const jsonFiles = fs.readdirSync(levelPath).filter(f => f.endsWith('.json'));

        for (const jsonFile of jsonFiles) {
          const filePath = path.join(levelPath, jsonFile);
          const topic = path.basename(jsonFile, '.json');

          try {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const entries: VocabEntry[] = JSON.parse(fileContent);

            if (!Array.isArray(entries)) {
              stats.errors.push({
                file: `${levelFolder}/${jsonFile}`,
                error: 'Not an array',
              });
              continue;
            }

            for (const entry of entries) {
              if (!entry.word || !entry.meaning_vi) {
                continue; // Skip invalid entries
              }

              // Check for duplicates (case-insensitive)
              const normalizedWord = entry.word.toLowerCase();
              if (seenWords.has(normalizedWord)) {
                stats.duplicates++;
                continue; // Skip duplicate
              }

              seenWords.add(normalizedWord);
              vocabularies.push({
                ...entry,
                level,
                topic,
              });

              stats.total++;
              stats.byLevel[level]++;
            }
          } catch (error) {
            stats.errors.push({
              file: `${levelFolder}/${jsonFile}`,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        }
      } catch (error) {
        stats.errors.push({
          file: levelFolder,
          error: `Failed to read directory: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }
  } catch (error) {
    console.error('Failed to read resource hub:', error);
    throw error;
  }

  return { vocabularies, stats };
}

async function seedVocabulary() {
  console.log('🚀 Starting vocabulary import...\n');

  const resourceHubPath = path.join(__dirname, '..', 'storage', 'resource-hub');

  // Check if path exists
  if (!fs.existsSync(resourceHubPath)) {
    throw new Error(`Resource hub path not found: ${resourceHubPath}`);
  }

  console.log(`📂 Reading vocabulary files from: ${resourceHubPath}`);

  // Read all vocabulary files
  const { vocabularies, stats } = await readVocabularyFiles(resourceHubPath);

  console.log(`\n📊 Files processed:`);
  console.log(`   Total words found: ${stats.total.toLocaleString()}`);
  console.log(`   Duplicates skipped: ${stats.duplicates.toLocaleString()}`);
  console.log(`   Errors encountered: ${stats.errors.length}`);

  if (stats.errors.length > 0) {
    console.log(`\n⚠️  Errors (first 10):`);
    stats.errors.slice(0, 10).forEach(err => {
      console.log(`   - ${err.file}: ${err.error}`);
    });
  }

  console.log(`\n📈 Breakdown by level:`);
  Object.entries(stats.byLevel)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([level, count]) => {
      console.log(`   ${level}: ${count.toLocaleString()} words`);
    });

  // Clear existing vocabulary data
  console.log(`\n🗑️  Clearing existing vocabulary data...`);
  const deletedCount = await prisma.vocabulary.deleteMany({});
  console.log(`   Deleted ${deletedCount.count.toLocaleString()} existing entries`);

  // Batch insert vocabulary
  console.log(`\n💾 Inserting ${vocabularies.length.toLocaleString()} vocabulary entries...`);

  const batchSize = 500;
  let insertedCount = 0;
  const errors: Array<{ word: string; error: string }> = [];

  for (let i = 0; i < vocabularies.length; i += batchSize) {
    const batch = vocabularies.slice(i, i + batchSize);

    try {
      await prisma.$transaction(
        batch.map(vocab =>
          prisma.vocabulary.create({
            data: {
              word: vocab.word,
              meaning_vi: vocab.meaning_vi,
              level: vocab.level,
              topic: vocab.topic,
              pos: vocab.pos || null,
              source: vocab.source || null,
              addedAt: vocab.addedAt ? new Date(vocab.addedAt) : null,
              familyWords: [],
              grammarTags: [],
            },
          })
        )
      );

      insertedCount += batch.length;

      // Progress indicator
      const progress = ((i + batch.length) / vocabularies.length * 100).toFixed(1);
      process.stdout.write(`\r   Progress: ${progress}% (${insertedCount.toLocaleString()}/${vocabularies.length.toLocaleString()})`);
    } catch (error) {
      // If batch fails, try individual inserts
      for (const vocab of batch) {
        try {
          await prisma.vocabulary.create({
            data: {
              word: vocab.word,
              meaning_vi: vocab.meaning_vi,
              level: vocab.level,
              topic: vocab.topic,
              pos: vocab.pos || null,
              source: vocab.source || null,
              addedAt: vocab.addedAt ? new Date(vocab.addedAt) : null,
              familyWords: [],
              grammarTags: [],
            },
          });
          insertedCount++;
        } catch (err) {
          errors.push({
            word: vocab.word,
            error: err instanceof Error ? err.message : 'Unknown error',
          });
        }
      }
    }
  }

  console.log(`\n\n✅ Import completed!`);
  console.log(`   Successfully inserted: ${insertedCount.toLocaleString()} words`);

  if (errors.length > 0) {
    console.log(`   Failed to insert: ${errors.length} words`);
    console.log(`\n⚠️  Insert errors (first 5):`);
    errors.slice(0, 5).forEach(err => {
      console.log(`   - ${err.word}: ${err.error}`);
    });
  }

  // Verify import
  console.log(`\n🔍 Verifying database...`);
  const totalInDb = await prisma.vocabulary.count();
  console.log(`   Total words in database: ${totalInDb.toLocaleString()}`);

  const levelCounts = await prisma.vocabulary.groupBy({
    by: ['level'],
    _count: true,
  });

  console.log(`\n📊 Database breakdown by level:`);
  levelCounts
    .sort((a, b) => a.level.localeCompare(b.level))
    .forEach(({ level, _count }) => {
      console.log(`   ${level}: ${_count.toLocaleString()} words`);
    });

  // Sample words
  console.log(`\n📝 Sample vocabulary entries:`);
  const sampleWords = await prisma.vocabulary.findMany({
    take: 5,
    orderBy: { word: 'asc' },
  });

  sampleWords.forEach(word => {
    console.log(`   - ${word.word} (${word.pos || 'unknown'}) [${word.level}]: ${word.meaning_vi}`);
  });
}

async function main() {
  try {
    await seedVocabulary();
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
