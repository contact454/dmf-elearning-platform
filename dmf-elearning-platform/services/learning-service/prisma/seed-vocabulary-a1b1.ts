import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

const DEFAULT_SOURCE_FILE = path.resolve(
  __dirname,
  '../../../scripts/data/quality-expansion/final-vocabulary-v2.json'
);
const DEFAULT_LEVELS = ['A1', 'A2', 'B1'];
const DEFAULT_TARGET_COUNT = 1000;
const DEFAULT_BATCH_SIZE = 200;
const SCRIPT_SOURCE = 'phase2/final-vocabulary-v2';

interface RawVocabularyItem {
  word?: string;
  normalized?: string;
  level?: string;
  topic?: string;
  pos?: string;
  meaning_vi?: string;
  meaningVi?: string;
  example_de?: string;
  example_vi?: string;
  artikel?: string;
  plural?: string;
  gender?: string;
  scores?: {
    total?: number;
    frequency?: number;
  };
  flags?: {
    frequencyRank?: number;
  };
}

interface CandidateVocabularyItem {
  word: string;
  normalizedWord: string;
  level: string;
  topic: string | null;
  pos: string | null;
  meaningVi: string;
  exampleDe: string | null;
  exampleVi: string | null;
  artikel: string | null;
  plural: string | null;
  gender: string | null;
  scoreTotal: number;
  frequencyRank: number;
}

function parseNumber(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseBoolean(value: string | undefined): boolean {
  return value === '1' || value === 'true' || value === 'yes';
}

function parseLevels(value: string | undefined): string[] {
  if (!value) return DEFAULT_LEVELS;
  const levels = value
    .split(',')
    .map((item) => item.trim().toUpperCase())
    .filter((item) => item.length > 0);
  return levels.length > 0 ? levels : DEFAULT_LEVELS;
}

function normalizeRawItem(raw: RawVocabularyItem): CandidateVocabularyItem | null {
  const word = (raw.word || '').trim();
  const normalizedWord = (raw.normalized || word).trim().toLowerCase();
  const level = (raw.level || '').trim().toUpperCase();
  const meaningVi = (raw.meaning_vi || raw.meaningVi || '').trim();

  if (!word || !normalizedWord || !level || !meaningVi) {
    return null;
  }

  return {
    word,
    normalizedWord,
    level,
    topic: raw.topic?.trim() || null,
    pos: raw.pos?.trim() || null,
    meaningVi,
    exampleDe: raw.example_de?.trim() || null,
    exampleVi: raw.example_vi?.trim() || null,
    artikel: raw.artikel?.trim() || null,
    plural: raw.plural?.trim() || null,
    gender: raw.gender?.trim() || null,
    scoreTotal: raw.scores?.total ?? raw.scores?.frequency ?? 0,
    frequencyRank: raw.flags?.frequencyRank ?? Number.MAX_SAFE_INTEGER,
  };
}

function comparePriority(a: CandidateVocabularyItem, b: CandidateVocabularyItem): number {
  if (a.scoreTotal !== b.scoreTotal) return b.scoreTotal - a.scoreTotal;
  if (a.frequencyRank !== b.frequencyRank) return a.frequencyRank - b.frequencyRank;
  if (a.pos && !b.pos) return -1;
  if (!a.pos && b.pos) return 1;
  return a.word.localeCompare(b.word);
}

function selectRoundRobin(
  grouped: Map<string, CandidateVocabularyItem[]>,
  levels: string[],
  targetCount: number
): CandidateVocabularyItem[] {
  const pointers = new Map<string, number>();
  for (const level of levels) pointers.set(level, 0);

  const selected: CandidateVocabularyItem[] = [];

  while (selected.length < targetCount) {
    let addedThisRound = false;

    for (const level of levels) {
      if (selected.length >= targetCount) break;
      const bucket = grouped.get(level) || [];
      const pointer = pointers.get(level) || 0;
      const item = bucket[pointer];
      if (!item) continue;
      selected.push(item);
      pointers.set(level, pointer + 1);
      addedThisRound = true;
    }

    if (!addedThisRound) break;
  }

  return selected;
}

async function main() {
  const sourceFile = process.env.VOCAB_SOURCE_FILE || DEFAULT_SOURCE_FILE;
  const targetLevels = parseLevels(process.env.VOCAB_SEED_LEVELS);
  const targetCount = parseNumber(process.env.VOCAB_SEED_COUNT, DEFAULT_TARGET_COUNT);
  const batchSize = parseNumber(process.env.VOCAB_SEED_BATCH_SIZE, DEFAULT_BATCH_SIZE);
  const dryRun = parseBoolean(process.env.DRY_RUN);
  const resetLevels = parseBoolean(process.env.VOCAB_RESET_LEVELS);

  console.log('Vocabulary Phase-2 Seeder');
  console.log(`- source: ${sourceFile}`);
  console.log(`- levels: ${targetLevels.join(', ')}`);
  console.log(`- target count: ${targetCount}`);
  console.log(`- batch size: ${batchSize}`);
  console.log(`- dry run: ${dryRun ? 'yes' : 'no'}`);

  const content = await fs.readFile(sourceFile, 'utf-8');
  const rawItems = JSON.parse(content) as RawVocabularyItem[];
  if (!Array.isArray(rawItems)) {
    throw new Error(`Expected JSON array in ${sourceFile}`);
  }

  const dedupedByWord = new Map<string, CandidateVocabularyItem>();
  let invalidCount = 0;

  for (const rawItem of rawItems) {
    const normalized = normalizeRawItem(rawItem);
    if (!normalized) {
      invalidCount++;
      continue;
    }
    if (!targetLevels.includes(normalized.level)) continue;

    const existing = dedupedByWord.get(normalized.normalizedWord);
    if (!existing || comparePriority(normalized, existing) < 0) {
      dedupedByWord.set(normalized.normalizedWord, normalized);
    }
  }

  const grouped = new Map<string, CandidateVocabularyItem[]>();
  for (const level of targetLevels) grouped.set(level, []);

  for (const item of dedupedByWord.values()) {
    grouped.get(item.level)?.push(item);
  }

  for (const level of targetLevels) {
    grouped.get(level)?.sort(comparePriority);
  }

  const selected = selectRoundRobin(grouped, targetLevels, targetCount);
  const selectedByLevel = targetLevels.reduce<Record<string, number>>((acc, level) => {
    acc[level] = selected.filter((item) => item.level === level).length;
    return acc;
  }, {});

  console.log(`- source rows: ${rawItems.length.toLocaleString()}`);
  console.log(`- invalid rows skipped: ${invalidCount.toLocaleString()}`);
  console.log(`- candidates after filter: ${dedupedByWord.size.toLocaleString()}`);
  console.log(`- selected rows: ${selected.length.toLocaleString()}`);
  for (const level of targetLevels) {
    console.log(`  - ${level}: ${selectedByLevel[level].toLocaleString()}`);
  }

  if (selected.length === 0) {
    throw new Error('No vocabulary selected for seeding. Check level filters/source file.');
  }

  if (dryRun) {
    console.log('Dry run completed. No database changes applied.');
    return;
  }

  if (resetLevels) {
    const deleted = await prisma.vocabularyItem.deleteMany({
      where: {
        level: { in: targetLevels },
        source: SCRIPT_SOURCE,
      },
    });
    console.log(`- reset removed rows: ${deleted.count.toLocaleString()}`);
  }

  const selectedWords = selected.map((item) => item.word);
  const existing = await prisma.vocabularyItem.findMany({
    where: { word: { in: selectedWords } },
    select: { word: true },
  });
  const existingWords = new Set(existing.map((item) => item.word));

  for (let i = 0; i < selected.length; i += batchSize) {
    const batch = selected.slice(i, i + batchSize);
    await prisma.$transaction(
      batch.map((item) =>
        prisma.vocabularyItem.upsert({
          where: { word: item.word },
          create: {
            word: item.word,
            meaning_vi: item.meaningVi,
            level: item.level,
            topic: item.topic,
            pos: item.pos,
            artikel: item.artikel,
            plural: item.plural,
            gender: item.gender,
            example_de: item.exampleDe,
            example_vi: item.exampleVi,
            source: SCRIPT_SOURCE,
            familyWords: [],
            grammarTags: [],
            addedAt: new Date(),
          },
          update: {
            meaning_vi: item.meaningVi,
            level: item.level,
            topic: item.topic,
            pos: item.pos,
            artikel: item.artikel,
            plural: item.plural,
            gender: item.gender,
            example_de: item.exampleDe,
            example_vi: item.exampleVi,
            source: SCRIPT_SOURCE,
          },
        })
      )
    );
    process.stdout.write(
      `\r- progress: ${Math.min(i + batch.length, selected.length)}/${selected.length}`
    );
  }
  process.stdout.write('\n');

  const createdCount = selected.filter((item) => !existingWords.has(item.word)).length;
  const updatedCount = selected.length - createdCount;

  console.log(`- created: ${createdCount.toLocaleString()}`);
  console.log(`- updated: ${updatedCount.toLocaleString()}`);

  const dbLevelCounts = await prisma.vocabularyItem.groupBy({
    by: ['level'],
    where: { level: { in: targetLevels } },
    _count: { _all: true },
    orderBy: { level: 'asc' },
  });

  console.log('Database level totals (all rows in selected levels):');
  for (const row of dbLevelCounts) {
    console.log(`  - ${row.level}: ${row._count._all.toLocaleString()}`);
  }
}

main()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
