# 💾 DATABASE SEEDING GUIDE

## ✅ SETUP COMPLETE

Files created:
```
✅ services/learning-service/prisma/schema.prisma      - Database schema
✅ services/learning-service/prisma/seed-vocab.ts      - Seed script
✅ services/learning-service/.env.example              - Environment template
✅ services/learning-service/package.json              - Updated with scripts
```

---

## 🚀 STEP-BY-STEP GUIDE

### STEP 1: Install Dependencies

```bash
cd services/learning-service
pnpm install
```

**Dependencies installed:**
- `@prisma/client` - Prisma ORM client
- `prisma` - Prisma CLI
- `tsx` - TypeScript executor

---

### STEP 2: Setup Environment Variables

```bash
# Copy template
cp .env.example .env

# Edit .env with your database credentials
nano .env
```

**Example DATABASE_URL:**
```
postgresql://postgres:postgres@localhost:5432/dmf_learning_db?schema=public
```

**Components:**
- `postgres:postgres` - username:password
- `localhost:5432` - host:port
- `dmf_learning_db` - database name

---

### STEP 3: Create Database (if not exists)

```bash
# Using psql
psql -U postgres -c "CREATE DATABASE dmf_learning_db;"

# Or using Docker
docker exec -it postgres-container psql -U postgres -c "CREATE DATABASE dmf_learning_db;"
```

---

### STEP 4: Generate Prisma Client

```bash
pnpm prisma:generate
```

**Output:**
```
✔ Generated Prisma Client
```

---

### STEP 5: Run Database Migration

```bash
pnpm prisma:migrate
```

**You'll be prompted for migration name:**
```
Enter a name for the new migration:
```

Type: `init_vocabulary_schema` (or any name)

**Expected output:**
```
✔ Your database is now in sync with your Prisma schema
✔ Prisma Client generated
```

---

### STEP 6: Run Seed Script

```bash
pnpm seed
```

**Expected output:**
```
╔══════════════════════════════════════════════════════════╗
║     💾 VOCABULARY DATABASE SEEDER                        ║
╚══════════════════════════════════════════════════════════╝

📖 Loading data sources...

📁 Found 15 files in A1 directory
   ✅ Loaded adjectives.json: 20 words
   ✅ Loaded colors.json: 8 words
   ✅ Loaded communication.json: 11 words
   ... (13 more files)
📊 Total A1 words: 204

📁 Loaded mined_data.json: 100 words

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Total words to seed: 304
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Current vocabulary count: 0

💾 Starting database seeding...

   ⏳ Progress: 50/304 words processed...
   ⏳ Progress: 100/304 words processed...
   ⏳ Progress: 150/304 words processed...
   ⏳ Progress: 200/304 words processed...
   ⏳ Progress: 250/304 words processed...
   ⏳ Progress: 300/304 words processed...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ SEEDING COMPLETED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Created:  304 new words
🔄 Updated:  0 existing words
⏭️  Skipped:  0 words
❌ Errors:   0 failed
⏱️  Duration: 2.5s
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Final vocabulary count: 304 (+ 304)

📊 Vocabulary by level:
   A1: 265 words
   A2: 34 words
   B1: 5 words

✅ Seeding successful!
```

---

## 🔍 VERIFY DATA

### View in Prisma Studio (GUI)

```bash
pnpm prisma:studio
```

Opens browser at `http://localhost:5555`

### Query from Command Line

```bash
# Using psql
psql -d dmf_learning_db -U postgres -c "SELECT count(*) FROM vocabulary;"

# Sample queries
psql -d dmf_learning_db -U postgres -c "SELECT word, meaning_vi, level FROM vocabulary LIMIT 10;"
```

### Query with Prisma

Create `test-query.ts`:
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  // Count by level
  const stats = await prisma.vocabulary.groupBy({
    by: ['level'],
    _count: true,
  });

  console.log('Vocabulary by level:', stats);

  // Sample words
  const sample = await prisma.vocabulary.findMany({
    take: 5,
    select: { word: true, meaningVi: true, level: true, topic: true }
  });

  console.log('Sample:', sample);
}

test().finally(() => prisma.$disconnect());
```

Run: `tsx test-query.ts`

---

## 🔄 RE-SEED (Update Data)

If you update JSON files:

```bash
# Re-run seed script
pnpm seed
```

**Behavior:**
- Existing words: **Updated** with new data
- New words: **Created**
- Removed words: **Not deleted** (manual cleanup needed)

### Clean and Re-seed:

```bash
# Delete all vocabulary
psql -d dmf_learning_db -U postgres -c "TRUNCATE TABLE vocabulary CASCADE;"

# Re-seed
pnpm seed
```

---

## 📊 DATABASE SCHEMA

### Tables Created:

**vocabulary**
- `id` (UUID, primary key)
- `word` (unique) - German word
- `meaning_vi` - Vietnamese translation
- `meaning_en` - English translation (optional)
- `pos` - Part of speech
- `level` - CEFR level (A1-C2)
- `topic` - Topic category
- `gender` - Noun gender
- `example_de` - German example
- `example_vi` - Vietnamese example
- `source` - Data source
- Timestamps

**topics** (not yet seeded)
- Topic metadata

**user_vocabulary_progress** (empty)
- User learning progress
- Spaced repetition data

---

## 🛠️ TROUBLESHOOTING

### Error: "Can't reach database server"

```bash
# Check PostgreSQL is running
pg_isready

# Or check Docker container
docker ps | grep postgres
```

### Error: "Database does not exist"

```bash
# Create database
psql -U postgres -c "CREATE DATABASE dmf_learning_db;"
```

### Error: "prisma command not found"

```bash
# Install dependencies
cd services/learning-service
pnpm install
```

### Error: "tsx command not found"

```bash
# Install tsx globally (optional)
pnpm add -g tsx

# Or use npx
npx tsx prisma/seed-vocab.ts
```

---

## 📈 NEXT STEPS

1. ✅ **Verify data** in Prisma Studio
2. 🔧 **Create API endpoints** for vocabulary
3. 📊 **Add more data** (A2-C2 levels)
4. 🎯 **Implement learning progress** tracking
5. 🚀 **Deploy** to production

---

## 🎯 QUICK START (All-in-One)

```bash
# Navigate to service
cd services/learning-service

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# Generate Prisma client
pnpm prisma:generate

# Run migration
pnpm prisma:migrate

# Seed database
pnpm seed

# Verify in Prisma Studio
pnpm prisma:studio
```

---

**Ready to seed! 💾**
