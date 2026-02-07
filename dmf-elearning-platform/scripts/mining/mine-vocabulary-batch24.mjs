#!/usr/bin/env node
/**
 * Batch 24 - Final 400 words to exceed 10K
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT = path.join(__dirname, '../data/quality-expansion/batch24-vocabulary.json');

const TOPICS = {
  a1_greetings: {
    level: 'A1',
    words: [
      { word: 'Hallo', pos: 'interjection', meaning_vi: 'xin chào' },
      { word: 'Guten Morgen', pos: 'phrase', meaning_vi: 'chào buổi sáng' },
      { word: 'Guten Tag', pos: 'phrase', meaning_vi: 'chào buổi trưa' },
      { word: 'Guten Abend', pos: 'phrase', meaning_vi: 'chào buổi tối' },
      { word: 'Gute Nacht', pos: 'phrase', meaning_vi: 'chúc ngủ ngon' },
      { word: 'Auf Wiedersehen', pos: 'phrase', meaning_vi: 'tạm biệt' },
      { word: 'Tschüss', pos: 'interjection', meaning_vi: 'tạm biệt' },
      { word: 'Bis bald', pos: 'phrase', meaning_vi: 'hẹn gặp lại' },
      { word: 'Willkommen', pos: 'interjection', meaning_vi: 'chào mừng' },
      { word: 'Bitte', pos: 'particle', meaning_vi: 'xin/mời' },
      { word: 'Danke', pos: 'interjection', meaning_vi: 'cảm ơn' },
      { word: 'Entschuldigung', pos: 'interjection', meaning_vi: 'xin lỗi' },
      { word: 'Herzlichen Glückwunsch', pos: 'phrase', meaning_vi: 'chúc mừng' },
      { word: 'Frohe Weihnachten', pos: 'phrase', meaning_vi: 'Giáng sinh vui vẻ' },
      { word: 'Frohes neues Jahr', pos: 'phrase', meaning_vi: 'Chúc mừng năm mới' },
      { word: 'Alles Gute', pos: 'phrase', meaning_vi: 'Chúc tất cả điều tốt đẹp' },
      { word: 'Viel Glück', pos: 'phrase', meaning_vi: 'Chúc may mắn' },
      { word: 'Viel Erfolg', pos: 'phrase', meaning_vi: 'Chúc thành công' },
      { word: 'Gute Besserung', pos: 'phrase', meaning_vi: 'Chúc sớm khỏe' },
      { word: 'Gute Reise', pos: 'phrase', meaning_vi: 'Chúc thượng lộ bình an' },
    ]
  },

  a1_common_phrases: {
    level: 'A1',
    words: [
      { word: 'Wie geht es dir?', pos: 'phrase', meaning_vi: 'Bạn khỏe không?' },
      { word: 'Mir geht es gut', pos: 'phrase', meaning_vi: 'Tôi khỏe' },
      { word: 'Wie heißt du?', pos: 'phrase', meaning_vi: 'Bạn tên gì?' },
      { word: 'Ich heiße...', pos: 'phrase', meaning_vi: 'Tôi tên là...' },
      { word: 'Woher kommst du?', pos: 'phrase', meaning_vi: 'Bạn từ đâu đến?' },
      { word: 'Ich komme aus...', pos: 'phrase', meaning_vi: 'Tôi đến từ...' },
      { word: 'Wie alt bist du?', pos: 'phrase', meaning_vi: 'Bạn bao nhiêu tuổi?' },
      { word: 'Ich bin...Jahre alt', pos: 'phrase', meaning_vi: 'Tôi...tuổi' },
      { word: 'Ich verstehe nicht', pos: 'phrase', meaning_vi: 'Tôi không hiểu' },
      { word: 'Können Sie das wiederholen?', pos: 'phrase', meaning_vi: 'Bạn có thể nhắc lại không?' },
      { word: 'Wie sagt man...auf Deutsch?', pos: 'phrase', meaning_vi: 'Nói...bằng tiếng Đức như thế nào?' },
      { word: 'Was bedeutet...?', pos: 'phrase', meaning_vi: '...nghĩa là gì?' },
      { word: 'Sprechen Sie Englisch?', pos: 'phrase', meaning_vi: 'Bạn nói tiếng Anh không?' },
      { word: 'Ja', pos: 'particle', meaning_vi: 'vâng' },
      { word: 'Nein', pos: 'particle', meaning_vi: 'không' },
      { word: 'Vielleicht', pos: 'adverb', meaning_vi: 'có lẽ' },
      { word: 'Natürlich', pos: 'adverb', meaning_vi: 'tất nhiên' },
      { word: 'Genau', pos: 'adverb', meaning_vi: 'chính xác' },
      { word: 'Sicher', pos: 'adverb', meaning_vi: 'chắc chắn' },
      { word: 'Klar', pos: 'adverb', meaning_vi: 'rõ ràng' },
    ]
  },

  a2_directions: {
    level: 'A2',
    words: [
      { word: 'links', pos: 'adverb', meaning_vi: 'bên trái' },
      { word: 'rechts', pos: 'adverb', meaning_vi: 'bên phải' },
      { word: 'geradeaus', pos: 'adverb', meaning_vi: 'đi thẳng' },
      { word: 'zurück', pos: 'adverb', meaning_vi: 'quay lại' },
      { word: 'vorwärts', pos: 'adverb', meaning_vi: 'tiến về phía trước' },
      { word: 'rückwärts', pos: 'adverb', meaning_vi: 'lùi lại' },
      { word: 'oben', pos: 'adverb', meaning_vi: 'ở trên' },
      { word: 'unten', pos: 'adverb', meaning_vi: 'ở dưới' },
      { word: 'drinnen', pos: 'adverb', meaning_vi: 'ở trong' },
      { word: 'draußen', pos: 'adverb', meaning_vi: 'ở ngoài' },
      { word: 'nah', pos: 'adjective', meaning_vi: 'gần' },
      { word: 'weit', pos: 'adjective', meaning_vi: 'xa' },
      { word: 'die Ecke', pos: 'noun', meaning_vi: 'góc' },
      { word: 'die Kreuzung', pos: 'noun', meaning_vi: 'ngã tư' },
      { word: 'die Ampel', pos: 'noun', meaning_vi: 'đèn giao thông' },
      { word: 'gegenüber', pos: 'preposition', meaning_vi: 'đối diện' },
      { word: 'entlang', pos: 'preposition', meaning_vi: 'dọc theo' },
      { word: 'bis zu', pos: 'preposition', meaning_vi: 'đến tận' },
      { word: 'abbiegen', pos: 'verb', meaning_vi: 'rẽ' },
      { word: 'überqueren', pos: 'verb', meaning_vi: 'băng qua' },
    ]
  },

  a2_home_items: {
    level: 'A2',
    words: [
      { word: 'die Waschmaschine', pos: 'noun', meaning_vi: 'máy giặt' },
      { word: 'der Trockner', pos: 'noun', meaning_vi: 'máy sấy' },
      { word: 'der Staubsauger', pos: 'noun', meaning_vi: 'máy hút bụi' },
      { word: 'das Bügeleisen', pos: 'noun', meaning_vi: 'bàn ủi' },
      { word: 'der Föhn', pos: 'noun', meaning_vi: 'máy sấy tóc' },
      { word: 'die Zahnbürste', pos: 'noun', meaning_vi: 'bàn chải đánh răng' },
      { word: 'die Zahnpasta', pos: 'noun', meaning_vi: 'kem đánh răng' },
      { word: 'die Seife', pos: 'noun', meaning_vi: 'xà phòng' },
      { word: 'das Shampoo', pos: 'noun', meaning_vi: 'dầu gội' },
      { word: 'das Handtuch', pos: 'noun', meaning_vi: 'khăn tắm' },
      { word: 'der Wecker', pos: 'noun', meaning_vi: 'đồng hồ báo thức' },
      { word: 'die Fernbedienung', pos: 'noun', meaning_vi: 'điều khiển từ xa' },
      { word: 'die Batterie', pos: 'noun', meaning_vi: 'pin' },
      { word: 'das Ladegerät', pos: 'noun', meaning_vi: 'bộ sạc' },
      { word: 'das Kabel', pos: 'noun', meaning_vi: 'cáp' },
      { word: 'der Ventilator', pos: 'noun', meaning_vi: 'quạt' },
      { word: 'die Heizung', pos: 'noun', meaning_vi: 'lò sưởi' },
      { word: 'der Müllbeutel', pos: 'noun', meaning_vi: 'túi rác' },
      { word: 'der Besen', pos: 'noun', meaning_vi: 'chổi' },
      { word: 'der Eimer', pos: 'noun', meaning_vi: 'xô' },
    ]
  },

  a2_shopping_phrases: {
    level: 'A2',
    words: [
      { word: 'Was kostet das?', pos: 'phrase', meaning_vi: 'Cái này giá bao nhiêu?' },
      { word: 'Wie viel macht das?', pos: 'phrase', meaning_vi: 'Tổng cộng bao nhiêu?' },
      { word: 'Das ist zu teuer', pos: 'phrase', meaning_vi: 'Cái này đắt quá' },
      { word: 'Haben Sie das billiger?', pos: 'phrase', meaning_vi: 'Có rẻ hơn không?' },
      { word: 'Kann ich bar bezahlen?', pos: 'phrase', meaning_vi: 'Tôi có thể trả tiền mặt không?' },
      { word: 'Kann ich mit Karte zahlen?', pos: 'phrase', meaning_vi: 'Tôi có thể trả bằng thẻ không?' },
      { word: 'Haben Sie eine größere Größe?', pos: 'phrase', meaning_vi: 'Có size lớn hơn không?' },
      { word: 'Haben Sie eine andere Farbe?', pos: 'phrase', meaning_vi: 'Có màu khác không?' },
      { word: 'Kann ich das anprobieren?', pos: 'phrase', meaning_vi: 'Tôi có thể thử không?' },
      { word: 'Wo ist die Umkleidekabine?', pos: 'phrase', meaning_vi: 'Phòng thử đồ ở đâu?' },
      { word: 'Ich nehme das', pos: 'phrase', meaning_vi: 'Tôi lấy cái này' },
      { word: 'Ich schaue nur', pos: 'phrase', meaning_vi: 'Tôi chỉ xem thôi' },
      { word: 'Kann ich eine Tüte haben?', pos: 'phrase', meaning_vi: 'Cho tôi một túi được không?' },
      { word: 'Haben Sie noch etwas anderes?', pos: 'phrase', meaning_vi: 'Còn cái khác không?' },
      { word: 'Das passt nicht', pos: 'phrase', meaning_vi: 'Cái này không vừa' },
      { word: 'Das gefällt mir', pos: 'phrase', meaning_vi: 'Tôi thích cái này' },
      { word: 'Das gefällt mir nicht', pos: 'phrase', meaning_vi: 'Tôi không thích cái này' },
      { word: 'die Sonderangebot', pos: 'noun', meaning_vi: 'ưu đãi đặc biệt' },
      { word: 'der Ausverkauf', pos: 'noun', meaning_vi: 'đợt sale' },
      { word: 'die Garantie', pos: 'noun', meaning_vi: 'bảo hành' },
    ]
  },

  b1_work_phrases: {
    level: 'B1',
    words: [
      { word: 'der Lebenslauf', pos: 'noun', meaning_vi: 'CV' },
      { word: 'das Anschreiben', pos: 'noun', meaning_vi: 'thư xin việc' },
      { word: 'die Stelle', pos: 'noun', meaning_vi: 'vị trí' },
      { word: 'die Vollzeit', pos: 'noun', meaning_vi: 'toàn thời gian' },
      { word: 'die Teilzeit', pos: 'noun', meaning_vi: 'bán thời gian' },
      { word: 'die Probezeit', pos: 'noun', meaning_vi: 'thời gian thử việc' },
      { word: 'das Gehalt', pos: 'noun', meaning_vi: 'lương' },
      { word: 'der Lohn', pos: 'noun', meaning_vi: 'tiền công' },
      { word: 'die Sozialversicherung', pos: 'noun', meaning_vi: 'bảo hiểm xã hội' },
      { word: 'die Krankenversicherung', pos: 'noun', meaning_vi: 'bảo hiểm y tế' },
      { word: 'der Arbeitgeber', pos: 'noun', meaning_vi: 'người sử dụng lao động' },
      { word: 'der Arbeitnehmer', pos: 'noun', meaning_vi: 'người lao động' },
      { word: 'das Arbeitszeugnis', pos: 'noun', meaning_vi: 'giấy xác nhận làm việc' },
      { word: 'die Referenz', pos: 'noun', meaning_vi: 'tham chiếu' },
      { word: 'die Qualifikation', pos: 'noun', meaning_vi: 'bằng cấp' },
      { word: 'die Berufserfahrung', pos: 'noun', meaning_vi: 'kinh nghiệm làm việc' },
      { word: 'die Weiterbildung', pos: 'noun', meaning_vi: 'đào tạo thêm' },
      { word: 'der Arbeitsvertrag', pos: 'noun', meaning_vi: 'hợp đồng lao động' },
      { word: 'die Kündigung', pos: 'noun', meaning_vi: 'nghỉ việc' },
      { word: 'die Abfindung', pos: 'noun', meaning_vi: 'trợ cấp thôi việc' },
    ]
  },

  b1_opinions: {
    level: 'B1',
    words: [
      { word: 'Ich denke, dass...', pos: 'phrase', meaning_vi: 'Tôi nghĩ rằng...' },
      { word: 'Meiner Meinung nach...', pos: 'phrase', meaning_vi: 'Theo ý kiến của tôi...' },
      { word: 'Ich glaube, dass...', pos: 'phrase', meaning_vi: 'Tôi tin rằng...' },
      { word: 'Ich finde, dass...', pos: 'phrase', meaning_vi: 'Tôi thấy rằng...' },
      { word: 'Es scheint mir, dass...', pos: 'phrase', meaning_vi: 'Có vẻ như...' },
      { word: 'Ich bin der Meinung, dass...', pos: 'phrase', meaning_vi: 'Tôi cho rằng...' },
      { word: 'Ich stimme zu', pos: 'phrase', meaning_vi: 'Tôi đồng ý' },
      { word: 'Ich bin dagegen', pos: 'phrase', meaning_vi: 'Tôi phản đối' },
      { word: 'Das stimmt', pos: 'phrase', meaning_vi: 'Đúng vậy' },
      { word: 'Das stimmt nicht', pos: 'phrase', meaning_vi: 'Không đúng' },
      { word: 'Einerseits...andererseits', pos: 'phrase', meaning_vi: 'Một mặt...mặt khác' },
      { word: 'Im Gegensatz dazu', pos: 'phrase', meaning_vi: 'Trái lại' },
      { word: 'Außerdem', pos: 'adverb', meaning_vi: 'Ngoài ra' },
      { word: 'Deshalb', pos: 'adverb', meaning_vi: 'Vì vậy' },
      { word: 'Trotzdem', pos: 'adverb', meaning_vi: 'Tuy nhiên' },
      { word: 'Allerdings', pos: 'adverb', meaning_vi: 'Tuy nhiên' },
      { word: 'Folglich', pos: 'adverb', meaning_vi: 'Do đó' },
      { word: 'Insgesamt', pos: 'adverb', meaning_vi: 'Nhìn chung' },
      { word: 'Zusammenfassend', pos: 'adverb', meaning_vi: 'Tóm lại' },
      { word: 'Letztendlich', pos: 'adverb', meaning_vi: 'Cuối cùng' },
    ]
  },

  b1_restaurant: {
    level: 'B1',
    words: [
      { word: 'die Speisekarte', pos: 'noun', meaning_vi: 'thực đơn' },
      { word: 'die Vorspeise', pos: 'noun', meaning_vi: 'món khai vị' },
      { word: 'das Hauptgericht', pos: 'noun', meaning_vi: 'món chính' },
      { word: 'die Nachspeise', pos: 'noun', meaning_vi: 'món tráng miệng' },
      { word: 'die Beilage', pos: 'noun', meaning_vi: 'món ăn kèm' },
      { word: 'das Tagesgericht', pos: 'noun', meaning_vi: 'món của ngày' },
      { word: 'die Empfehlung des Hauses', pos: 'phrase', meaning_vi: 'món đặc sản của nhà hàng' },
      { word: 'die Portion', pos: 'noun', meaning_vi: 'khẩu phần' },
      { word: 'das Trinkgeld', pos: 'noun', meaning_vi: 'tiền tip' },
      { word: 'die Rechnung', pos: 'noun', meaning_vi: 'hóa đơn' },
      { word: 'Einen Tisch für...Personen', pos: 'phrase', meaning_vi: 'Bàn cho...người' },
      { word: 'Ich hätte gern...', pos: 'phrase', meaning_vi: 'Tôi muốn...' },
      { word: 'Ich möchte bestellen', pos: 'phrase', meaning_vi: 'Tôi muốn gọi món' },
      { word: 'Was können Sie empfehlen?', pos: 'phrase', meaning_vi: 'Bạn đề xuất món gì?' },
      { word: 'Ist das vegetarisch?', pos: 'phrase', meaning_vi: 'Món này chay không?' },
      { word: 'Ich bin allergisch gegen...', pos: 'phrase', meaning_vi: 'Tôi dị ứng với...' },
      { word: 'Die Rechnung, bitte', pos: 'phrase', meaning_vi: 'Cho tôi hóa đơn' },
      { word: 'Getrennt oder zusammen?', pos: 'phrase', meaning_vi: 'Tính riêng hay chung?' },
      { word: 'Es hat sehr gut geschmeckt', pos: 'phrase', meaning_vi: 'Rất ngon' },
      { word: 'Stimmt so', pos: 'phrase', meaning_vi: 'Không cần thối lại' },
    ]
  },

  b2_formal_writing: {
    level: 'B2',
    words: [
      { word: 'Sehr geehrte Damen und Herren', pos: 'phrase', meaning_vi: 'Kính gửi quý ông/bà' },
      { word: 'Mit freundlichen Grüßen', pos: 'phrase', meaning_vi: 'Trân trọng' },
      { word: 'Ich beziehe mich auf...', pos: 'phrase', meaning_vi: 'Tôi đề cập đến...' },
      { word: 'Bezüglich', pos: 'preposition', meaning_vi: 'liên quan đến' },
      { word: 'In Bezug auf', pos: 'phrase', meaning_vi: 'liên quan đến' },
      { word: 'Hiermit', pos: 'adverb', meaning_vi: 'bằng thư này' },
      { word: 'Diesbezüglich', pos: 'adverb', meaning_vi: 'về vấn đề này' },
      { word: 'Ich erlaube mir...', pos: 'phrase', meaning_vi: 'Tôi xin phép...' },
      { word: 'Ich bitte um...', pos: 'phrase', meaning_vi: 'Tôi xin...' },
      { word: 'Anbei', pos: 'adverb', meaning_vi: 'đính kèm' },
      { word: 'Beiliegend', pos: 'adverb', meaning_vi: 'đính kèm' },
      { word: 'der Anhang', pos: 'noun', meaning_vi: 'tệp đính kèm' },
      { word: 'die Anlage', pos: 'noun', meaning_vi: 'tài liệu đính kèm' },
      { word: 'Für Rückfragen stehe ich gern zur Verfügung', pos: 'phrase', meaning_vi: 'Tôi sẵn sàng giải đáp thắc mắc' },
      { word: 'Ich freue mich auf Ihre Antwort', pos: 'phrase', meaning_vi: 'Tôi mong nhận được hồi âm' },
      { word: 'Ich danke Ihnen im Voraus', pos: 'phrase', meaning_vi: 'Xin cảm ơn trước' },
      { word: 'Mit Bezug auf Ihr Schreiben vom...', pos: 'phrase', meaning_vi: 'Liên quan đến thư ngày...' },
      { word: 'Wir bedauern...', pos: 'phrase', meaning_vi: 'Chúng tôi rất tiếc...' },
      { word: 'Wir freuen uns...', pos: 'phrase', meaning_vi: 'Chúng tôi vui mừng...' },
      { word: 'Nach Prüfung...', pos: 'phrase', meaning_vi: 'Sau khi xem xét...' },
    ]
  },

  b2_abstract_concepts: {
    level: 'B2',
    words: [
      { word: 'die Tendenz', pos: 'noun', meaning_vi: 'xu hướng' },
      { word: 'die Dimension', pos: 'noun', meaning_vi: 'khía cạnh' },
      { word: 'die Komplexität', pos: 'noun', meaning_vi: 'sự phức tạp' },
      { word: 'die Dynamik', pos: 'noun', meaning_vi: 'động lực' },
      { word: 'die Relevanz', pos: 'noun', meaning_vi: 'sự liên quan' },
      { word: 'die Effizienz', pos: 'noun', meaning_vi: 'hiệu quả' },
      { word: 'die Flexibilität', pos: 'noun', meaning_vi: 'linh hoạt' },
      { word: 'die Priorität', pos: 'noun', meaning_vi: 'ưu tiên' },
      { word: 'die Kapazität', pos: 'noun', meaning_vi: 'năng lực' },
      { word: 'die Intensität', pos: 'noun', meaning_vi: 'cường độ' },
      { word: 'die Kontinuität', pos: 'noun', meaning_vi: 'sự liên tục' },
      { word: 'die Kompatibilität', pos: 'noun', meaning_vi: 'tương thích' },
      { word: 'die Transparenz', pos: 'noun', meaning_vi: 'minh bạch' },
      { word: 'die Legitimität', pos: 'noun', meaning_vi: 'tính hợp pháp' },
      { word: 'die Objektivität', pos: 'noun', meaning_vi: 'tính khách quan' },
      { word: 'die Subjektivität', pos: 'noun', meaning_vi: 'tính chủ quan' },
      { word: 'die Authentizität', pos: 'noun', meaning_vi: 'tính xác thực' },
      { word: 'die Plausibilität', pos: 'noun', meaning_vi: 'tính hợp lý' },
      { word: 'die Kohärenz', pos: 'noun', meaning_vi: 'tính mạch lạc' },
      { word: 'die Konsistenz', pos: 'noun', meaning_vi: 'tính nhất quán' },
    ]
  },
};

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║    📚 BATCH 24 - FINAL PUSH BEYOND 10K                     ║');
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
