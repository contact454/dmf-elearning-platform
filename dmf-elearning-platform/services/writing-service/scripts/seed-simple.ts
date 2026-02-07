/**
 * SIMPLE SEED SCRIPT FOR INTEGRATION TESTING
 * Seeds only writing_prompts table with minimal data
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const prompts = [
  // A1 Level (3 prompts)
  {
    title: 'Mein Tagesablauf',
    description: 'Beschreibe deinen typischen Tagesablauf. Was machst du morgens, mittags und abends?',
    cefrLevel: 'A1',
    category: 'daily_life',
    targetWordCount: 100,
    tips: ['Benutze Zeitwörter wie: morgens, mittags, abends', 'Verwende Präsens'],
  },
  {
    title: 'Meine Familie',
    description: 'Schreibe über deine Familie. Wer gehört zu deiner Familie?',
    cefrLevel: 'A1',
    category: 'personal',
    targetWordCount: 80,
    tips: ['Verwende Possessivpronomen: mein, meine', 'Beschreibe Familienmitglieder'],
  },
  {
    title: 'Mein Hobby',
    description: 'Was ist dein Lieblingshobby? Warum magst du es?',
    cefrLevel: 'A1',
    category: 'hobbies',
    targetWordCount: 90,
    tips: ['Erkläre, warum du dein Hobby magst', 'Benutze "gern" oder "lieben"'],
  },

  // A2 Level (3 prompts)
  {
    title: 'Ein besonderer Tag',
    description: 'Erzähle von einem besonderen Tag in deinem Leben. Was ist passiert?',
    cefrLevel: 'A2',
    category: 'experiences',
    targetWordCount: 150,
    tips: ['Verwende Perfekt für vergangene Ereignisse', 'Beschreibe Gefühle'],
  },
  {
    title: 'Meine Stadt',
    description: 'Beschreibe deine Heimatstadt. Was gibt es dort zu sehen?',
    cefrLevel: 'A2',
    category: 'places',
    targetWordCount: 120,
    tips: ['Verwende "es gibt"', 'Beschreibe Sehenswürdigkeiten'],
  },
  {
    title: 'Meine Zukunftspläne',
    description: 'Was möchtest du in der Zukunft machen? Was sind deine Pläne?',
    cefrLevel: 'A2',
    category: 'future',
    targetWordCount: 130,
    tips: ['Verwende Futur: "werden + Infinitiv"', 'Erkläre deine Träume'],
  },

  // B1 Level (3 prompts)
  {
    title: 'Umweltschutz',
    description: 'Was können wir für den Umweltschutz tun? Gib konkrete Beispiele.',
    cefrLevel: 'B1',
    category: 'environment',
    targetWordCount: 200,
    tips: ['Verwende Modalverben: sollen, müssen, können', 'Gib Beispiele'],
  },
  {
    title: 'Vor- und Nachteile von Social Media',
    description: 'Diskutiere die Vor- und Nachteile von sozialen Medien.',
    cefrLevel: 'B1',
    category: 'technology',
    targetWordCount: 220,
    tips: ['Strukturiere: Einerseits... andererseits...', 'Nenne Argumente'],
  },
  {
    title: 'Eine wichtige Entscheidung',
    description: 'Beschreibe eine wichtige Entscheidung, die du getroffen hast.',
    cefrLevel: 'B1',
    category: 'personal_development',
    targetWordCount: 180,
    tips: ['Erkläre den Entscheidungsprozess', 'Reflektiere über die Folgen'],
  },

  // B2 Level (3 prompts)
  {
    title: 'Globalisierung',
    description: 'Analysiere die Auswirkungen der Globalisierung auf die Gesellschaft.',
    cefrLevel: 'B2',
    category: 'society',
    targetWordCount: 300,
    tips: ['Verwende komplexe Satzstrukturen', 'Argumentiere differenziert'],
  },
  {
    title: 'Digitalisierung in der Bildung',
    description: 'Wie verändert die Digitalisierung das Lernen? Bewerte kritisch.',
    cefrLevel: 'B2',
    category: 'education',
    targetWordCount: 280,
    tips: ['Präsentiere verschiedene Perspektiven', 'Nutze Konnektoren'],
  },
  {
    title: 'Work-Life-Balance',
    description: 'Wie wichtig ist eine ausgewogene Work-Life-Balance? Diskutiere.',
    cefrLevel: 'B2',
    category: 'work',
    targetWordCount: 250,
    tips: ['Verwende gehobene Sprache', 'Belege Argumente mit Beispielen'],
  },
];

async function main() {
  console.log('🌱 Seeding writing_prompts table...');

  // Clear existing prompts
  await prisma.prompt.deleteMany({});
  console.log('✅ Cleared existing prompts');

  // Insert new prompts
  for (const prompt of prompts) {
    await prisma.prompt.create({
      data: prompt,
    });
  }

  console.log(`✅ Created ${prompts.length} writing prompts`);

  // Verify
  const count = await prisma.prompt.count();
  console.log(`📊 Total prompts in database: ${count}`);

  // Show summary by level
  const levels = ['A1', 'A2', 'B1', 'B2'];
  for (const level of levels) {
    const levelCount = await prisma.prompt.count({
      where: { cefrLevel: level },
    });
    console.log(`   ${level}: ${levelCount} prompts`);
  }

  console.log('\n✅ Seed completed successfully!');
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
