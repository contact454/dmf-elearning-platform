import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Vietnamese words without diacritics (loan words or simple words)
const validVietnamese = [
  'chay', 'bia', 'tay', 'hai', 'ba', 'rau', 'bao cao su', 'internet', 'mua',
  'nghe', 'taxi', 'nhanh', 'chua', 'cao', 'pizza', 'radio', 'video', 'euro',
  'wifi', 'email', 'ok', 'bus', 'cafe', 'menu'
];

async function main() {
  const vocab = await prisma.vocabulary.findMany({ select: { word: true, meaning_vi: true } });
  const needsFix = vocab.filter(v => {
    if (!v.meaning_vi) return true;
    const meaning = v.meaning_vi.toLowerCase().trim();

    // Skip valid Vietnamese words without diacritics
    if (validVietnamese.includes(meaning)) return false;

    const hasVi = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(v.meaning_vi);
    return !hasVi && /^[a-zA-Z\s\-\/\(\),\.!?]+$/.test(v.meaning_vi);
  });
  needsFix.forEach(v => console.log(`${v.word} | ${v.meaning_vi}`));
  console.log(`\nTotal: ${needsFix.length} words need fixing`);
  await prisma.$disconnect();
}

main();
