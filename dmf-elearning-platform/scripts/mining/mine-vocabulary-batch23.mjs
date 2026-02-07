#!/usr/bin/env node
/**
 * Batch 23 - Final 400 words to exceed 10K
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT = path.join(__dirname, '../data/quality-expansion/batch23-vocabulary.json');

const TOPICS = {
  a1_colors: {
    level: 'A1',
    words: [
      { word: 'rot', pos: 'adjective', meaning_vi: 'đỏ' },
      { word: 'blau', pos: 'adjective', meaning_vi: 'xanh dương' },
      { word: 'grün', pos: 'adjective', meaning_vi: 'xanh lá' },
      { word: 'gelb', pos: 'adjective', meaning_vi: 'vàng' },
      { word: 'orange', pos: 'adjective', meaning_vi: 'cam' },
      { word: 'lila', pos: 'adjective', meaning_vi: 'tím' },
      { word: 'rosa', pos: 'adjective', meaning_vi: 'hồng' },
      { word: 'braun', pos: 'adjective', meaning_vi: 'nâu' },
      { word: 'grau', pos: 'adjective', meaning_vi: 'xám' },
      { word: 'schwarz', pos: 'adjective', meaning_vi: 'đen' },
      { word: 'weiß', pos: 'adjective', meaning_vi: 'trắng' },
      { word: 'bunt', pos: 'adjective', meaning_vi: 'nhiều màu' },
      { word: 'hell', pos: 'adjective', meaning_vi: 'sáng' },
      { word: 'dunkel', pos: 'adjective', meaning_vi: 'tối' },
      { word: 'goldfarben', pos: 'adjective', meaning_vi: 'màu vàng kim' },
      { word: 'silbern', pos: 'adjective', meaning_vi: 'màu bạc' },
      { word: 'türkis', pos: 'adjective', meaning_vi: 'xanh ngọc' },
      { word: 'beige', pos: 'adjective', meaning_vi: 'màu be' },
      { word: 'violett', pos: 'adjective', meaning_vi: 'tím' },
      { word: 'transparent', pos: 'adjective', meaning_vi: 'trong suốt' },
    ]
  },

  a1_numbers_words: {
    level: 'A1',
    words: [
      { word: 'eins', pos: 'numeral', meaning_vi: 'một' },
      { word: 'zwei', pos: 'numeral', meaning_vi: 'hai' },
      { word: 'drei', pos: 'numeral', meaning_vi: 'ba' },
      { word: 'vier', pos: 'numeral', meaning_vi: 'bốn' },
      { word: 'fünf', pos: 'numeral', meaning_vi: 'năm' },
      { word: 'sechs', pos: 'numeral', meaning_vi: 'sáu' },
      { word: 'sieben', pos: 'numeral', meaning_vi: 'bảy' },
      { word: 'acht', pos: 'numeral', meaning_vi: 'tám' },
      { word: 'neun', pos: 'numeral', meaning_vi: 'chín' },
      { word: 'zehn', pos: 'numeral', meaning_vi: 'mười' },
      { word: 'elf', pos: 'numeral', meaning_vi: 'mười một' },
      { word: 'zwölf', pos: 'numeral', meaning_vi: 'mười hai' },
      { word: 'zwanzig', pos: 'numeral', meaning_vi: 'hai mươi' },
      { word: 'dreißig', pos: 'numeral', meaning_vi: 'ba mươi' },
      { word: 'vierzig', pos: 'numeral', meaning_vi: 'bốn mươi' },
      { word: 'fünfzig', pos: 'numeral', meaning_vi: 'năm mươi' },
      { word: 'hundert', pos: 'numeral', meaning_vi: 'một trăm' },
      { word: 'tausend', pos: 'numeral', meaning_vi: 'một nghìn' },
      { word: 'Million', pos: 'noun', meaning_vi: 'triệu' },
      { word: 'Milliarde', pos: 'noun', meaning_vi: 'tỷ' },
    ]
  },

  a1_days: {
    level: 'A1',
    words: [
      { word: 'der Montag', pos: 'noun', meaning_vi: 'thứ Hai' },
      { word: 'der Dienstag', pos: 'noun', meaning_vi: 'thứ Ba' },
      { word: 'der Mittwoch', pos: 'noun', meaning_vi: 'thứ Tư' },
      { word: 'der Donnerstag', pos: 'noun', meaning_vi: 'thứ Năm' },
      { word: 'der Freitag', pos: 'noun', meaning_vi: 'thứ Sáu' },
      { word: 'der Samstag', pos: 'noun', meaning_vi: 'thứ Bảy' },
      { word: 'der Sonntag', pos: 'noun', meaning_vi: 'Chủ nhật' },
      { word: 'der Tag', pos: 'noun', meaning_vi: 'ngày' },
      { word: 'die Woche', pos: 'noun', meaning_vi: 'tuần' },
      { word: 'das Jahr', pos: 'noun', meaning_vi: 'năm' },
      { word: 'der Monat', pos: 'noun', meaning_vi: 'tháng' },
      { word: 'die Jahreszeit', pos: 'noun', meaning_vi: 'mùa' },
      { word: 'der Frühling', pos: 'noun', meaning_vi: 'mùa xuân' },
      { word: 'der Sommer', pos: 'noun', meaning_vi: 'mùa hè' },
      { word: 'der Herbst', pos: 'noun', meaning_vi: 'mùa thu' },
      { word: 'der Winter', pos: 'noun', meaning_vi: 'mùa đông' },
      { word: 'das Datum', pos: 'noun', meaning_vi: 'ngày tháng' },
      { word: 'der Kalender', pos: 'noun', meaning_vi: 'lịch' },
      { word: 'der Feiertag', pos: 'noun', meaning_vi: 'ngày lễ' },
      { word: 'der Werktag', pos: 'noun', meaning_vi: 'ngày làm việc' },
    ]
  },

  a2_materials: {
    level: 'A2',
    words: [
      { word: 'das Holz', pos: 'noun', meaning_vi: 'gỗ' },
      { word: 'das Metall', pos: 'noun', meaning_vi: 'kim loại' },
      { word: 'das Eisen', pos: 'noun', meaning_vi: 'sắt' },
      { word: 'der Stahl', pos: 'noun', meaning_vi: 'thép' },
      { word: 'das Kupfer', pos: 'noun', meaning_vi: 'đồng' },
      { word: 'das Gold', pos: 'noun', meaning_vi: 'vàng' },
      { word: 'das Silber', pos: 'noun', meaning_vi: 'bạc' },
      { word: 'das Glas', pos: 'noun', meaning_vi: 'kính/thủy tinh' },
      { word: 'der Stein', pos: 'noun', meaning_vi: 'đá' },
      { word: 'das Plastik', pos: 'noun', meaning_vi: 'nhựa' },
      { word: 'das Leder', pos: 'noun', meaning_vi: 'da' },
      { word: 'die Wolle', pos: 'noun', meaning_vi: 'len' },
      { word: 'die Baumwolle', pos: 'noun', meaning_vi: 'bông' },
      { word: 'die Seide', pos: 'noun', meaning_vi: 'lụa' },
      { word: 'der Gummi', pos: 'noun', meaning_vi: 'cao su' },
      { word: 'das Papier', pos: 'noun', meaning_vi: 'giấy' },
      { word: 'der Karton', pos: 'noun', meaning_vi: 'bìa cứng' },
      { word: 'der Beton', pos: 'noun', meaning_vi: 'bê tông' },
      { word: 'der Ziegel', pos: 'noun', meaning_vi: 'gạch' },
      { word: 'die Keramik', pos: 'noun', meaning_vi: 'gốm' },
    ]
  },

  a2_containers: {
    level: 'A2',
    words: [
      { word: 'die Flasche', pos: 'noun', meaning_vi: 'chai' },
      { word: 'die Dose', pos: 'noun', meaning_vi: 'lon' },
      { word: 'die Schachtel', pos: 'noun', meaning_vi: 'hộp' },
      { word: 'der Karton', pos: 'noun', meaning_vi: 'thùng carton' },
      { word: 'der Eimer', pos: 'noun', meaning_vi: 'xô' },
      { word: 'der Korb', pos: 'noun', meaning_vi: 'giỏ' },
      { word: 'die Kiste', pos: 'noun', meaning_vi: 'hòm' },
      { word: 'der Behälter', pos: 'noun', meaning_vi: 'thùng chứa' },
      { word: 'das Glas', pos: 'noun', meaning_vi: 'lọ' },
      { word: 'die Tube', pos: 'noun', meaning_vi: 'tuýp' },
      { word: 'der Sack', pos: 'noun', meaning_vi: 'bao' },
      { word: 'die Tüte', pos: 'noun', meaning_vi: 'túi' },
      { word: 'der Beutel', pos: 'noun', meaning_vi: 'túi' },
      { word: 'die Packung', pos: 'noun', meaning_vi: 'gói' },
      { word: 'die Portion', pos: 'noun', meaning_vi: 'phần' },
      { word: 'das Stück', pos: 'noun', meaning_vi: 'miếng' },
      { word: 'die Scheibe', pos: 'noun', meaning_vi: 'lát' },
      { word: 'das Kilogramm', pos: 'noun', meaning_vi: 'kg' },
      { word: 'der Liter', pos: 'noun', meaning_vi: 'lít' },
      { word: 'das Gramm', pos: 'noun', meaning_vi: 'gram' },
    ]
  },

  a2_buildings: {
    level: 'A2',
    words: [
      { word: 'das Gebäude', pos: 'noun', meaning_vi: 'tòa nhà' },
      { word: 'das Hochhaus', pos: 'noun', meaning_vi: 'nhà cao tầng' },
      { word: 'der Turm', pos: 'noun', meaning_vi: 'tháp' },
      { word: 'die Brücke', pos: 'noun', meaning_vi: 'cầu' },
      { word: 'der Tunnel', pos: 'noun', meaning_vi: 'đường hầm' },
      { word: 'die Fabrik', pos: 'noun', meaning_vi: 'nhà máy' },
      { word: 'das Bürogebäude', pos: 'noun', meaning_vi: 'tòa nhà văn phòng' },
      { word: 'das Einkaufszentrum', pos: 'noun', meaning_vi: 'trung tâm mua sắm' },
      { word: 'das Hotel', pos: 'noun', meaning_vi: 'khách sạn' },
      { word: 'die Pension', pos: 'noun', meaning_vi: 'nhà nghỉ' },
      { word: 'das Schloss', pos: 'noun', meaning_vi: 'lâu đài' },
      { word: 'die Burg', pos: 'noun', meaning_vi: 'pháo đài' },
      { word: 'das Denkmal', pos: 'noun', meaning_vi: 'đài tưởng niệm' },
      { word: 'die Statue', pos: 'noun', meaning_vi: 'tượng' },
      { word: 'der Brunnen', pos: 'noun', meaning_vi: 'đài phun nước' },
      { word: 'die Moschee', pos: 'noun', meaning_vi: 'nhà thờ Hồi giáo' },
      { word: 'der Tempel', pos: 'noun', meaning_vi: 'đền' },
      { word: 'die Synagoge', pos: 'noun', meaning_vi: 'giáo đường Do Thái' },
      { word: 'das Rathaus', pos: 'noun', meaning_vi: 'tòa thị chính' },
      { word: 'das Gymnasium', pos: 'noun', meaning_vi: 'trường trung học' },
    ]
  },

  b1_emotions_more: {
    level: 'B1',
    words: [
      { word: 'der Ärger', pos: 'noun', meaning_vi: 'sự bực tức' },
      { word: 'die Verzweiflung', pos: 'noun', meaning_vi: 'sự tuyệt vọng' },
      { word: 'die Erleichterung', pos: 'noun', meaning_vi: 'sự nhẹ nhõm' },
      { word: 'die Befriedigung', pos: 'noun', meaning_vi: 'sự thỏa mãn' },
      { word: 'die Aufregung', pos: 'noun', meaning_vi: 'sự phấn khích' },
      { word: 'die Verzückung', pos: 'noun', meaning_vi: 'sự ngây ngất' },
      { word: 'die Bewunderung', pos: 'noun', meaning_vi: 'sự ngưỡng mộ' },
      { word: 'die Verachtung', pos: 'noun', meaning_vi: 'sự khinh thường' },
      { word: 'die Reue', pos: 'noun', meaning_vi: 'sự hối hận' },
      { word: 'die Scham', pos: 'noun', meaning_vi: 'sự xấu hổ' },
      { word: 'frustriert', pos: 'adjective', meaning_vi: 'bực bội' },
      { word: 'verzweifelt', pos: 'adjective', meaning_vi: 'tuyệt vọng' },
      { word: 'erleichtert', pos: 'adjective', meaning_vi: 'nhẹ nhõm' },
      { word: 'begeistert', pos: 'adjective', meaning_vi: 'hào hứng' },
      { word: 'bewegt', pos: 'adjective', meaning_vi: 'xúc động' },
      { word: 'enttäuscht', pos: 'adjective', meaning_vi: 'thất vọng' },
      { word: 'erschöpft', pos: 'adjective', meaning_vi: 'kiệt sức' },
      { word: 'verlegen', pos: 'adjective', meaning_vi: 'ngượng ngùng' },
      { word: 'nostalgisch', pos: 'adjective', meaning_vi: 'hoài niệm' },
      { word: 'gleichgültig', pos: 'adjective', meaning_vi: 'thờ ơ' },
    ]
  },

  b1_communication_more: {
    level: 'B1',
    words: [
      { word: 'erwähnen', pos: 'verb', meaning_vi: 'đề cập' },
      { word: 'behaupten', pos: 'verb', meaning_vi: 'khẳng định' },
      { word: 'bestätigen', pos: 'verb', meaning_vi: 'xác nhận' },
      { word: 'leugnen', pos: 'verb', meaning_vi: 'phủ nhận' },
      { word: 'versprechen', pos: 'verb', meaning_vi: 'hứa' },
      { word: 'drohen', pos: 'verb', meaning_vi: 'đe dọa' },
      { word: 'warnen', pos: 'verb', meaning_vi: 'cảnh báo' },
      { word: 'vorschlagen', pos: 'verb', meaning_vi: 'đề xuất' },
      { word: 'ablehnen', pos: 'verb', meaning_vi: 'từ chối' },
      { word: 'zustimmen', pos: 'verb', meaning_vi: 'đồng ý' },
      { word: 'widersprechen', pos: 'verb', meaning_vi: 'phản đối' },
      { word: 'überreden', pos: 'verb', meaning_vi: 'thuyết phục' },
      { word: 'überzeugen', pos: 'verb', meaning_vi: 'thuyết phục' },
      { word: 'unterbrechen', pos: 'verb', meaning_vi: 'ngắt lời' },
      { word: 'fortsetzen', pos: 'verb', meaning_vi: 'tiếp tục' },
      { word: 'betonen', pos: 'verb', meaning_vi: 'nhấn mạnh' },
      { word: 'zusammenfassen', pos: 'verb', meaning_vi: 'tóm tắt' },
      { word: 'andeuten', pos: 'verb', meaning_vi: 'ám chỉ' },
      { word: 'flüstern', pos: 'verb', meaning_vi: 'thì thầm' },
      { word: 'schreien', pos: 'verb', meaning_vi: 'la hét' },
    ]
  },

  b1_learning: {
    level: 'B1',
    words: [
      { word: 'das Wissen', pos: 'noun', meaning_vi: 'kiến thức' },
      { word: 'die Kenntnis', pos: 'noun', meaning_vi: 'hiểu biết' },
      { word: 'die Fähigkeit', pos: 'noun', meaning_vi: 'khả năng' },
      { word: 'die Fertigkeit', pos: 'noun', meaning_vi: 'kỹ năng' },
      { word: 'die Übung', pos: 'noun', meaning_vi: 'bài tập' },
      { word: 'die Wiederholung', pos: 'noun', meaning_vi: 'lặp lại' },
      { word: 'der Fortschritt', pos: 'noun', meaning_vi: 'tiến bộ' },
      { word: 'das Ziel', pos: 'noun', meaning_vi: 'mục tiêu' },
      { word: 'die Konzentration', pos: 'noun', meaning_vi: 'tập trung' },
      { word: 'die Ausdauer', pos: 'noun', meaning_vi: 'kiên trì' },
      { word: 'merken', pos: 'verb', meaning_vi: 'ghi nhớ' },
      { word: 'anwenden', pos: 'verb', meaning_vi: 'áp dụng' },
      { word: 'verbessern', pos: 'verb', meaning_vi: 'cải thiện' },
      { word: 'erweitern', pos: 'verb', meaning_vi: 'mở rộng' },
      { word: 'vertiefen', pos: 'verb', meaning_vi: 'đào sâu' },
      { word: 'analysieren', pos: 'verb', meaning_vi: 'phân tích' },
      { word: 'vergleichen', pos: 'verb', meaning_vi: 'so sánh' },
      { word: 'überprüfen', pos: 'verb', meaning_vi: 'kiểm tra' },
      { word: 'bewerten', pos: 'verb', meaning_vi: 'đánh giá' },
      { word: 'nachdenken', pos: 'verb', meaning_vi: 'suy nghĩ' },
    ]
  },

  b2_finance: {
    level: 'B2',
    words: [
      { word: 'die Finanzierung', pos: 'noun', meaning_vi: 'tài trợ' },
      { word: 'die Rendite', pos: 'noun', meaning_vi: 'lợi tức' },
      { word: 'das Vermögen', pos: 'noun', meaning_vi: 'tài sản' },
      { word: 'die Schuld', pos: 'noun', meaning_vi: 'nợ' },
      { word: 'der Kredit', pos: 'noun', meaning_vi: 'tín dụng' },
      { word: 'die Hypothek', pos: 'noun', meaning_vi: 'thế chấp' },
      { word: 'die Versicherung', pos: 'noun', meaning_vi: 'bảo hiểm' },
      { word: 'die Rente', pos: 'noun', meaning_vi: 'lương hưu' },
      { word: 'die Steuer', pos: 'noun', meaning_vi: 'thuế' },
      { word: 'die Mehrwertsteuer', pos: 'noun', meaning_vi: 'thuế VAT' },
      { word: 'finanzieren', pos: 'verb', meaning_vi: 'tài trợ' },
      { word: 'investieren', pos: 'verb', meaning_vi: 'đầu tư' },
      { word: 'tilgen', pos: 'verb', meaning_vi: 'trả nợ' },
      { word: 'verzinsen', pos: 'verb', meaning_vi: 'tính lãi' },
      { word: 'versichern', pos: 'verb', meaning_vi: 'bảo hiểm' },
      { word: 'versteuern', pos: 'verb', meaning_vi: 'đóng thuế' },
      { word: 'anlegen', pos: 'verb', meaning_vi: 'đầu tư' },
      { word: 'abschreiben', pos: 'verb', meaning_vi: 'khấu hao' },
      { word: 'profitabel', pos: 'adjective', meaning_vi: 'có lãi' },
      { word: 'verschuldet', pos: 'adjective', meaning_vi: 'mắc nợ' },
    ]
  },

  b2_technology_more: {
    level: 'B2',
    words: [
      { word: 'die Künstliche Intelligenz', pos: 'noun', meaning_vi: 'trí tuệ nhân tạo' },
      { word: 'das maschinelle Lernen', pos: 'noun', meaning_vi: 'máy học' },
      { word: 'die Automatisierung', pos: 'noun', meaning_vi: 'tự động hóa' },
      { word: 'der Algorithmus', pos: 'noun', meaning_vi: 'thuật toán' },
      { word: 'die Datenbank', pos: 'noun', meaning_vi: 'cơ sở dữ liệu' },
      { word: 'die Cloud', pos: 'noun', meaning_vi: 'điện toán đám mây' },
      { word: 'die Cybersicherheit', pos: 'noun', meaning_vi: 'an ninh mạng' },
      { word: 'das Hacking', pos: 'noun', meaning_vi: 'tin tặc' },
      { word: 'die Verschlüsselung', pos: 'noun', meaning_vi: 'mã hóa' },
      { word: 'die Blockchain', pos: 'noun', meaning_vi: 'chuỗi khối' },
      { word: 'automatisieren', pos: 'verb', meaning_vi: 'tự động hóa' },
      { word: 'digitalisieren', pos: 'verb', meaning_vi: 'số hóa' },
      { word: 'verschlüsseln', pos: 'verb', meaning_vi: 'mã hóa' },
      { word: 'hacken', pos: 'verb', meaning_vi: 'hack' },
      { word: 'sichern', pos: 'verb', meaning_vi: 'bảo mật' },
      { word: 'künstlich', pos: 'adjective', meaning_vi: 'nhân tạo' },
      { word: 'automatisiert', pos: 'adjective', meaning_vi: 'tự động' },
      { word: 'digital', pos: 'adjective', meaning_vi: 'kỹ thuật số' },
      { word: 'vernetzt', pos: 'adjective', meaning_vi: 'kết nối' },
      { word: 'cloudbasiert', pos: 'adjective', meaning_vi: 'dựa trên đám mây' },
    ]
  },
};

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║    📚 BATCH 23 - FINAL PUSH TO 10K+                        ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const allWords = [];
  const distribution = {};

  for (const [topicName, topic] of Object.entries(TOPICS)) {
    for (const word of topic.words) {
      allWords.push({
        ...word,
        level: topic.level,
        topic: topicName,
      });
    }
    distribution[topic.level] = (distribution[topic.level] || 0) + topic.words.length;
  }

  console.log(`📊 Total words: ${allWords.length}\n`);
  console.log('📈 Distribution:');
  Object.entries(distribution).sort().forEach(([level, count]) => {
    console.log(`   ${level}: ${count} words`);
  });

  fs.writeFileSync(OUTPUT, JSON.stringify(allWords, null, 2));
  console.log(`\n💾 Saved to: ${OUTPUT}`);
}

main().catch(console.error);
