import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const prompts = [
  // A1 Level
  {
    cefrLevel: 'A1',
    topic: 'daily_conversation',
    title: 'Introduce Yourself',
    description: 'Tell us about yourself',
    questionText: 'Please introduce yourself. What is your name? Where are you from? What do you do?',
    preparationTimeSeconds: 30,
    speakingTimeSeconds: 60,
    difficultyLevel: 1,
    evaluationCriteria: {
      pronunciation: { weight: 0.25, description: 'Basic pronunciation accuracy' },
      fluency: { weight: 0.25, description: 'Simple sentence structure' },
      vocabulary: { weight: 0.25, description: 'Basic vocabulary usage' },
      grammar: { weight: 0.25, description: 'Simple present tense' },
    },
  },
  {
    cefrLevel: 'A1',
    topic: 'descriptions',
    title: 'Describe Your Room',
    description: 'Describe a room in your home',
    questionText: 'Describe your bedroom. What furniture do you have? What colors are the walls?',
    preparationTimeSeconds: 30,
    speakingTimeSeconds: 60,
    difficultyLevel: 1,
    evaluationCriteria: {
      pronunciation: { weight: 0.25, description: 'Clear pronunciation of objects' },
      fluency: { weight: 0.25, description: 'Simple descriptive sentences' },
      vocabulary: { weight: 0.25, description: 'Basic furniture and color vocabulary' },
      grammar: { weight: 0.25, description: 'Correct use of "haben" and "sein"' },
    },
  },
  // A2 Level
  {
    cefrLevel: 'A2',
    topic: 'daily_conversation',
    title: 'Your Daily Routine',
    description: 'Talk about your typical day',
    questionText: 'Describe your daily routine from morning to evening. What do you usually do?',
    preparationTimeSeconds: 45,
    speakingTimeSeconds: 90,
    difficultyLevel: 2,
    evaluationCriteria: {
      pronunciation: { weight: 0.25, description: 'Pronunciation of time expressions' },
      fluency: { weight: 0.25, description: 'Connected simple sentences' },
      vocabulary: { weight: 0.25, description: 'Daily activity vocabulary' },
      grammar: { weight: 0.25, description: 'Present tense and time expressions' },
    },
  },
  {
    cefrLevel: 'A2',
    topic: 'opinions',
    title: 'Your Favorite Hobby',
    description: 'Talk about what you like to do',
    questionText: 'What is your favorite hobby? Why do you enjoy it? How often do you do it?',
    preparationTimeSeconds: 45,
    speakingTimeSeconds: 90,
    difficultyLevel: 2,
    evaluationCriteria: {
      pronunciation: { weight: 0.25, description: 'Clear articulation' },
      fluency: { weight: 0.25, description: 'Connected discourse' },
      vocabulary: { weight: 0.25, description: 'Hobby-related vocabulary' },
      grammar: { weight: 0.25, description: 'Present tense and frequency adverbs' },
    },
  },
  // B1 Level
  {
    cefrLevel: 'B1',
    topic: 'storytelling',
    title: 'A Memorable Experience',
    description: 'Tell a story about a memorable event',
    questionText: 'Tell us about a memorable experience from your past. What happened? How did you feel?',
    preparationTimeSeconds: 60,
    speakingTimeSeconds: 120,
    difficultyLevel: 3,
    evaluationCriteria: {
      pronunciation: { weight: 0.25, description: 'Natural intonation and rhythm' },
      fluency: { weight: 0.25, description: 'Smooth narrative flow' },
      vocabulary: { weight: 0.25, description: 'Varied descriptive vocabulary' },
      grammar: { weight: 0.25, description: 'Past tenses and connectors' },
    },
  },
  {
    cefrLevel: 'B1',
    topic: 'opinions',
    title: 'Technology in Daily Life',
    description: 'Discuss the role of technology',
    questionText: 'How has technology changed your daily life? What are the advantages and disadvantages?',
    preparationTimeSeconds: 60,
    speakingTimeSeconds: 120,
    difficultyLevel: 3,
    evaluationCriteria: {
      pronunciation: { weight: 0.25, description: 'Clear and intelligible speech' },
      fluency: { weight: 0.25, description: 'Coherent argumentation' },
      vocabulary: { weight: 0.25, description: 'Technology-related vocabulary' },
      grammar: { weight: 0.25, description: 'Complex sentences and connectors' },
    },
  },
  // B2 Level
  {
    cefrLevel: 'B2',
    topic: 'opinions',
    title: 'Environmental Issues',
    description: 'Discuss environmental challenges',
    questionText: 'What do you think are the most important environmental issues today? What can individuals do to help?',
    preparationTimeSeconds: 90,
    speakingTimeSeconds: 150,
    difficultyLevel: 4,
    evaluationCriteria: {
      pronunciation: { weight: 0.25, description: 'Natural pronunciation with good stress and intonation' },
      fluency: { weight: 0.25, description: 'Fluent extended discourse' },
      vocabulary: { weight: 0.25, description: 'Sophisticated environmental vocabulary' },
      grammar: { weight: 0.25, description: 'Complex grammatical structures' },
    },
  },
  {
    cefrLevel: 'B2',
    topic: 'storytelling',
    title: 'Career Aspirations',
    description: 'Talk about your professional goals',
    questionText: 'Describe your career aspirations. What are your professional goals for the next 5 years? How do you plan to achieve them?',
    preparationTimeSeconds: 90,
    speakingTimeSeconds: 150,
    difficultyLevel: 4,
    evaluationCriteria: {
      pronunciation: { weight: 0.25, description: 'Clear and natural delivery' },
      fluency: { weight: 0.25, description: 'Well-structured presentation' },
      vocabulary: { weight: 0.25, description: 'Professional and abstract vocabulary' },
      grammar: { weight: 0.25, description: 'Future forms and conditional structures' },
    },
  },
];

async function main() {
  console.log('🌱 Seeding speaking prompts...');

  for (const prompt of prompts) {
    await prisma.speakingPrompt.create({
      data: prompt,
    });
    console.log(`✅ Created prompt: ${prompt.title} (${prompt.cefrLevel})`);
  }

  console.log('✅ Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
