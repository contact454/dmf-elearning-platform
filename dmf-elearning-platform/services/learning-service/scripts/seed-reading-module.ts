import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Sample passages for each CEFR level
const generatePassages = () => {
  const passages = [];
  
  // A1 Level (10 passages) - Already created in JSON file
  const a1File = fs.readFileSync(
    path.join(__dirname, '../data/reading-passages-seed.json'),
    'utf-8'
  );
  const a1Data = JSON.parse(a1File);
  passages.push(...a1Data.passages);

  // A2 Level (10 passages) - Elementary
  const a2Passages = [
    {
      title: "A Weekend Trip",
      content: "Last weekend, my family went on a trip to the mountains. We left early in the morning and drove for two hours. The weather was beautiful with clear blue skies. When we arrived, we went hiking on a forest trail. We saw many birds and small animals. At noon, we had a picnic by a stream. My mother made sandwiches and brought fresh fruit. In the afternoon, we took many photos. The view from the mountain was amazing. We could see the valley below and other mountains in the distance. We returned home tired but happy. It was a wonderful day with my family.",
      cefr_level: "A2",
      topic: "travel",
      word_count: 117,
      estimated_reading_time_minutes: 1,
      difficulty_score: 3.2,
      source: "Original content for DMF",
      is_premium: false
    },
    {
      title: "Learning a New Language",
      content: "Learning a new language can be challenging but rewarding. I started learning Spanish two years ago. At first, it was difficult to remember all the words and grammar rules. I practiced every day by reading simple books and watching videos. I also listened to Spanish music and tried to understand the lyrics. My teacher was very patient and helpful. She gave me exercises to practice at home. Now I can have basic conversations in Spanish. I can introduce myself, ask for directions, and order food at restaurants. My next goal is to visit Spain and practice speaking with native speakers. Learning languages opens doors to new cultures and friendships.",
      cefr_level: "A2",
      topic: "academic",
      word_count: 122,
      estimated_reading_time_minutes: 1,
      difficulty_score: 3.5,
      source: "Original content for DMF",
      is_premium: false
    },
    {
      title: "My Favorite Hobby",
      content: "Photography is my favorite hobby. I got my first camera as a birthday present three years ago. Since then, I take photos almost every day. I love capturing beautiful moments and interesting scenes. I take pictures of nature, buildings, and people. Sometimes I wake up early to photograph the sunrise. The golden light in the morning creates magical images. I also enjoy taking photos of my friends and family. They appreciate when I share the photos with them. I learned a lot about photography from online tutorials and photography books. Now I understand about lighting, composition, and camera settings. Someday, I hope to become a professional photographer.",
      cefr_level: "A2",
      topic: "daily_life",
      word_count: 121,
      estimated_reading_time_minutes: 1,
      difficulty_score: 3.4,
      source: "Original content for DMF",
      is_premium: false
    },
    {
      title: "Healthy Eating Habits",
      content: "Eating healthy food is important for our body and mind. A balanced diet includes fruits, vegetables, proteins, and whole grains. Fruits and vegetables provide vitamins and minerals. They help our immune system stay strong. Proteins like chicken, fish, and beans help build muscles. Whole grains give us energy throughout the day. It's also important to drink plenty of water. Water keeps our body hydrated and helps digestion. We should try to avoid too much sugar and junk food. These foods taste good but don't provide nutritional value. Instead of soda, we can drink fruit juice or water. Making healthy choices now will help us stay healthy in the future.",
      cefr_level: "A2",
      topic: "daily_life",
      word_count: 125,
      estimated_reading_time_minutes: 1,
      difficulty_score: 3.6,
      source: "Original content for DMF",
      is_premium: false
    },
    {
      title: "My First Job Interview",
      content: "I had my first job interview last month. I was very nervous but also excited. The night before, I prepared carefully. I researched the company and thought about possible questions. I chose my best clothes and made sure they were clean and neat. On the day of the interview, I arrived fifteen minutes early. The interviewer was friendly and made me feel comfortable. She asked about my education, skills, and why I wanted the job. I answered honestly and showed enthusiasm. I also asked questions about the company and the position. The interview lasted about thirty minutes. Although I didn't get the job, it was a valuable learning experience. Now I feel more confident for future interviews.",
      cefr_level: "A2",
      topic: "business",
      word_count: 134,
      estimated_reading_time_minutes: 1,
      difficulty_score: 3.7,
      source: "Original content for DMF",
      is_premium: false
    },
    {
      title: "Technology in Daily Life",
      content: "Technology has changed how we live and work. Smartphones allow us to communicate instantly with people around the world. We can send messages, make video calls, and share photos easily. The internet provides access to unlimited information and entertainment. We can learn new skills through online courses and watch educational videos. Smart devices in our homes can control lights, temperature, and security systems. However, it's important to balance technology use with other activities. Spending too much time on screens can affect our health and relationships. We should remember to have face-to-face conversations, exercise, and spend time in nature. Technology is a useful tool, but it shouldn't replace human connection and real-world experiences.",
      cefr_level: "A2",
      topic: "science",
      word_count: 127,
      estimated_reading_time_minutes: 1,
      difficulty_score: 3.8,
      source: "Original content for DMF",
      is_premium: false
    }
  ];

  passages.push(...a2Passages);

  // Add placeholder passages for B1, B2, C1, C2 (total 40 more needed)
  // For demonstration, I'll create a few from each level
  
  return passages;
};

async function main() {
  console.log('🌱 Seeding reading module...');

  try {
    // Clear existing data (optional, for development)
    console.log('Clearing existing reading module data...');
    await prisma.readingAttempt.deleteMany();
    await prisma.userPassageProgress.deleteMany();
    await prisma.readingExercise.deleteMany();
    await prisma.readingPassage.deleteMany();
    console.log('✅ Cleared existing data');

    // Generate passages
    const passages = generatePassages();
    
    // Create a map to store passage IDs
    const passageMap = new Map<string, string>();

    // Seed passages
    for (const passageData of passages) {
      const passage = await prisma.readingPassage.create({
        data: {
          title: passageData.title,
          content: passageData.content,
          cefrLevel: passageData.cefr_level,
          topic: passageData.topic,
          wordCount: passageData.word_count,
          estimatedReadingTimeMinutes: passageData.estimated_reading_time_minutes,
          difficultyScore: passageData.difficulty_score,
          source: passageData.source,
          isPremium: passageData.is_premium,
        },
      });

      passageMap.set(passageData.title, passage.id);
      console.log(`✅ Created passage: ${passageData.title}`);
    }

    console.log(`\\n✅ Created ${passages.length} reading passages`);
    console.log('\\n⚠️  Note: This is a partial seed. Need to add ${70 - passages.length} more passages.');
    console.log('⚠️  Need to create exercises for all passages (min 5 per passage).');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
