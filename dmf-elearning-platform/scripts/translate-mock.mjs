#!/usr/bin/env node
/**
 * Mock Translation Engine
 * High-quality dictionary-based translation for testing without API
 */

import fs from 'fs/promises';
import path from 'path';

// Comprehensive German-Vietnamese dictionary
const DICTIONARY = {
  // Verbs
  'arbeiten': 'làm việc',
  'besuchen': 'thăm',
  'bleiben': 'ở lại',
  'brauchen': 'cần',
  'essen': 'ăn',
  'fragen': 'hỏi',
  'geben': 'cho',
  'gehen': 'đi',
  'haben': 'có',
  'kaufen': 'mua',
  'können': 'có thể',
  'lernen': 'học',
  'machen': 'làm',
  'nehmen': 'lấy',
  'sagen': 'nói',
  'schreiben': 'viết',
  'sehen': 'nhìn',
  'sein': 'là',
  'suchen': 'tìm',
  'telefonieren': 'gọi điện',
  'trinken': 'uống',
  'wissen': 'biết',
  'wollen': 'muốn',
  'zahlen': 'trả tiền',
  'aufladen': 'nạp tiền',

  // Adjectives
  'gut': 'tốt',
  'schlecht': 'xấu',
  'neu': 'mới',
  'alt': 'cũ',
  'jung': 'trẻ',
  'groß': 'lớn',
  'klein': 'nhỏ',
  'schön': 'đẹp',
  'billig': 'rẻ',
  'teuer': 'đắt',
  'dunkel': 'tối',
  'hell': 'sáng',
  'zusammen': 'cùng nhau',
  'getrennt': 'riêng',
  'wichtig': 'quan trọng',
  'müde': 'mệt',
  'vegetarisch': 'ăn chay',
  'vegan': 'thuần chay',
  'glutenfrei': 'không gluten',
  'alkoholfrei': 'không cồn',

  // Food
  'Essen': 'đồ ăn',
  'Restaurant': 'nhà hàng',
  'Café': 'quán cà phê',
  'Bar': 'quán bar',
  'Speisekarte': 'thực đơn',
  'Vorspeise': 'món khai vị',
  'Hauptspeise': 'món chính',
  'Nachtisch': 'món tráng miệng',
  'Rechnung': 'hóa đơn',
  'Fisch': 'cá',
  'Fleisch': 'thịt',
  'Salat': 'salad',
  'Milch': 'sữa',
  'Käse': 'phô mai',
  'Obst': 'trái cây',
  'Gemüse': 'rau',
  'Nüsse': 'hạt',
  'Kaffee': 'cà phê',
  'Tee': 'trà',
  'Wasser': 'nước',
  'Wein': 'rượu vang',
  'Bier': 'bia',

  // Numbers
  'eins': 'một',
  'zwei': 'hai',
  'drei': 'ba',
  'vier': 'bốn',
  'fünf': 'năm',
  'sechs': 'sáu',
  'sieben': 'bảy',
  'acht': 'tám',
  'neun': 'chín',
  'zehn': 'mười',
  'zwanzig': 'hai mươi',
  'fünfzig': 'năm mươi',
  'hundert': 'trăm',
  'tausend': 'nghìn',

  // Personal
  'Vorname': 'tên',
  'Nachname': 'họ',
  'Adresse': 'địa chỉ',
  'Land': 'quốc gia',
  'Geburtsort': 'nơi sinh',
  'Geburtsdatum': 'ngày sinh',
  'Beruf': 'nghề nghiệp',
  'Mann': 'đàn ông',
  'Frau': 'phụ nữ',
  'Erwachsene': 'người lớn',
  'Kind': 'trẻ em',

  // Time
  'Zeit': 'thời gian',
  'Tag': 'ngày',
  'Woche': 'tuần',
  'Monat': 'tháng',
  'Jahr': 'năm',
  'Montag': 'Thứ Hai',
  'Dienstag': 'Thứ Ba',
  'Mittwoch': 'Thứ Tư',
  'Donnerstag': 'Thứ Năm',
  'Freitag': 'Thứ Sáu',
  'Samstag': 'Thứ Bảy',
  'Sonntag': 'Chủ Nhật',
  'morgens': 'buổi sáng',
  'nachmittags': 'buổi chiều',
  'abends': 'buổi tối',
  'nachts': 'ban đêm',
  'früher': 'sớm hơn',
  'später': 'muộn hơn',
  'pünktlich': 'đúng giờ',
  'verspätet': 'trễ',

  // Transport
  'Zug': 'tàu hỏa',
  'Bus': 'xe buýt',
  'Auto': 'ô tô',
  'Straßenbahn': 'tàu điện',
  'Taxi': 'taxi',
  'Fahrrad': 'xe đạp',
  'zu Fuß': 'đi bộ',
  'Bahnhof': 'ga tàu',
  'Busbahnhof': 'bến xe buýt',
  'Haltestelle': 'điểm dừng',

  // Health
  'Arzt': 'bác sĩ nam',
  'Ärztin': 'bác sĩ nữ',
  'Krankenhaus': 'bệnh viện',
  'Apotheke': 'hiệu thuốc',
  'Schmerzmittel': 'thuốc giảm đau',
  'Medikament': 'thuốc',
  'Schmerzen': 'đau',
  'Rücken': 'lưng',
  'Fuß': 'bàn chân',
  'Bauch': 'bụng',
  'Bein': 'chân',
  'Kopf': 'đầu',
  'Hand': 'bàn tay',
  'Arm': 'cánh tay',

  // Colors
  'Farbe': 'màu sắc',
  'weiß': 'trắng',
  'schwarz': 'đen',
  'rot': 'đỏ',
  'blau': 'xanh dương',
  'grün': 'xanh lá',
  'gelb': 'vàng',
  'bunt': 'nhiều màu',

  // Surrounding
  'Haus': 'ngôi nhà',
  'Wohnung': 'căn hộ',
  'Hotel': 'khách sạn',
  'Museum': 'bảo tàng',
  'Strand': 'bãi biển',
  'Wald': 'rừng',
  'Berg': 'núi',
  'Park': 'công viên',
  'Fluss': 'sông',
  'Meer': 'biển',
  'See': 'hồ',
  'Wetter': 'thời tiết',
  'Sonne': 'mặt trời',
  'Regen': 'mưa',
  'Schnee': 'tuyết',
  'Gewitter': 'giông bão',

  // Technology
  'Internet': 'internet',
  'Passwort': 'mật khẩu',
  'Computer': 'máy tính',
  'Steckdose': 'ổ cắm',

  // Shopping
  'Supermarkt': 'siêu thị',
  'Geld': 'tiền',
  'Karte': 'thẻ',
  'Tasche': 'túi',
  'Tampon': 'băng vệ sinh',
  'Binde': 'băng vệ sinh',
  'Kondom': 'bao cao su',
  'Zahnbürste': 'bàn chải đánh răng',
  'Hilfe': 'giúp đỡ',
  'Polizei': 'cảnh sát',

  // Orientation
  'Richtung': 'hướng',
  'Eingang': 'lối vào',
  'Ausgang': 'lối ra',
  'Straße': 'đường',
  'Weg': 'con đường',
  'Platz': 'quảng trường',
  'rechts': 'bên phải',
  'links': 'bên trái',
  'geradeaus': 'thẳng',
  'zurück': 'quay lại',

  // Communication
  'Hallo!': 'Xin chào!',
  'Guten Tag!': 'Chào ngày tốt lành!',
  'Tschüß!': 'Tạm biệt!',
  'Danke!': 'Cảm ơn!',
  'Bitte!': 'Làm ơn!',
  'Entschuldigung!': 'Xin lỗi!',
  'Stopp!': 'Dừng lại!',
  'Vorsicht!': 'Cẩn thận!',
  'ja': 'có',
  'nein': 'không',
  'Prost!': 'Chúc mừng!',

  // Sentences
  'Was ist…?': 'Cái gì là…?',
  'Wo ist …?': 'Ở đâu…?',
  'Wie …?': 'Như thế nào…?',
  'Wie viel kostet es?': 'Cái này giá bao nhiêu?',
  'Wie lange dauert es?': 'Mất bao lâu?',
  'Gibt es …?': 'Có… không?',
  'Ich hätte gerne …': 'Tôi muốn…',
  'Ich brauche …': 'Tôi cần…',
  'Kein Problem!': 'Không vấn đề gì!',
};

function translateWord(word) {
  // Remove article
  const baseWord = word.replace(/^(der|die|das)\s+/i, '');

  // Look up in dictionary
  const meaning = DICTIONARY[baseWord];

  if (!meaning) {
    console.warn(`⚠️  Không tìm thấy: ${word}`);
    return `[TODO: ${word}]`;
  }

  // Add gender marker for nouns
  if (word.match(/^(der|die|das)\s+/i)) {
    const article = word.match(/^(der|die|das)/i)[0].toLowerCase();
    const genderMarker = article === 'der' ? ' (m)' : article === 'die' ? ' (f)' : ' (n)';
    return meaning + genderMarker;
  }

  return meaning;
}

async function processAllCategories() {
  const harvestPath = path.resolve(
    'dmf-elearning-platform/services/learning-service/storage/harvest-result.json'
  );

  const harvestContent = await fs.readFile(harvestPath, 'utf-8');
  const harvestData = JSON.parse(harvestContent);
  const { vocabulary } = harvestData;

  // Group by category
  const categorized = vocabulary.reduce((acc, word) => {
    if (!acc[word.category]) {
      acc[word.category] = [];
    }
    acc[word.category].push(word);
    return acc;
  }, {});

  console.log('🚀 Bắt đầu dịch với Mock Dictionary...\n');

  const outputDir = path.resolve(
    'dmf-elearning-platform/services/learning-service/storage/resource-hub/A1'
  );
  await fs.mkdir(outputDir, { recursive: true });

  let totalTranslated = 0;
  const categoryNames = Object.keys(categorized);

  for (let i = 0; i < categoryNames.length; i++) {
    const category = categoryNames[i];
    const words = categorized[category];

    console.log(`[${i + 1}/${categoryNames.length}] Đang dịch "${category}" (${words.length} từ)...`);

    const translated = words.map(word => ({
      word: word.word,
      pos: word.type === 'verb' ? 'verb' : word.type === 'adjective' ? 'adj' : word.type === 'phrase' ? 'phrase' : 'noun',
      gender: word.gender || 'none',
      type: word.type,
      category: word.category,
      meaning_vi: translateWord(word.word),
      meaning_en: word.meaning_en,
      level: 'A1',
      source: 'CodingFriends + Mock Translation',
    }));

    // Save to file
    const filename = `${category.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    const filepath = path.join(outputDir, filename);

    await fs.writeFile(filepath, JSON.stringify(translated, null, 2), 'utf-8');

    totalTranslated += translated.length;
    console.log(`   ✅ Đã lưu: ${filename} (${translated.length} từ)`);
  }

  console.log(`\n✨ HOÀN THÀNH! Đã dịch ${totalTranslated} từ với Mock Dictionary`);
  console.log('\n💡 Đây là bản mock để test workflow.');
  console.log('   Để có bản dịch chất lượng cao với Claude, chạy: node scripts/translate-with-claude.mjs');
}

processAllCategories().catch(console.error);
