import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Manual translations for remaining words
const manualTranslations: Record<string, string> = {
  "Primaten": "linh trưởng",
  "Azeton": "axeton (dung môi)",
  "R-Gespräche": "cuộc gọi đảo chiều (người nhận trả tiền)",
  "Fisches": "cá (sở hữu cách)",
  "Geburtsnamens": "tên khai sinh (sở hữu cách)",
  "Querkopfs": "người bướng bỉnh (sở hữu cách)",
  "Regenbogens": "cầu vồng (sở hữu cách)",
  "Gebetes": "lời cầu nguyện (sở hữu cách)",
  "Vipern": "rắn lục",
  "Raums": "phòng / không gian (sở hữu cách)",
  "Sprechblasen": "bong bóng thoại",
  "Baches": "suối (sở hữu cách)",
  "Ölpalmen": "cây cọ dầu",
  "Wals": "cá voi (sở hữu cách)",
  "Sonntags": "Chủ nhật (trạng từ thời gian)",
  "Texte": "văn bản / bài viết",
  "Knoblauches": "tỏi (sở hữu cách)",
  "Hühnerhabichte": "chim ưng bắt gà",
  "das Kondom": "bao cao su",
  // Already correct but missing diacritics in detection
  "vegetarisch": "chay",
  "zwei": "hai",
  "drei": "ba",
  "das Gemüse": "rau",
  "das Bier": "bia",
  "die Hand": "tay",
  "das Internet": "internet",
  "kaufen": "mua",
  "hören": "nghe",
  "das Taxi": "taxi",
  "schnell": "nhanh",
  "sauer": "chua",
  "hoch": "cao",
};

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🔧 Manual Vocabulary Fix Script');
  console.log('═══════════════════════════════════════════════════════════\n');

  let fixedCount = 0;

  for (const [word, translation] of Object.entries(manualTranslations)) {
    try {
      const result = await prisma.vocabulary.updateMany({
        where: { word },
        data: { meaning_vi: translation }
      });

      if (result.count > 0) {
        console.log(`✅ Fixed [${word}]: → "${translation}"`);
        fixedCount++;
      }
    } catch (error) {
      console.error(`❌ Failed to update ${word}:`, error);
    }
  }

  console.log(`\n═══════════════════════════════════════════════════════════`);
  console.log(`✅ Done! Fixed ${fixedCount} words`);
  console.log('═══════════════════════════════════════════════════════════\n');

  await prisma.$disconnect();
}

main();
