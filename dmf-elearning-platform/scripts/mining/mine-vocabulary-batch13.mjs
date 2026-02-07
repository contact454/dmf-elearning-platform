#!/usr/bin/env node
/**
 * Mine Vocabulary Batch 13 - Additional Words (500 words)
 * Topics: Verbs, Adjectives, Adverbs, Prepositions, Connectors
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT = path.join(__dirname, '../data/quality-expansion/batch13-vocabulary.json');

const TOPICS = {
  commonVerbs: {
    topic: 'Dong tu thong dung',
    level: 'A1',
    words: [
      { word: 'sein', pos: 'verb', meaning_vi: 'là' },
      { word: 'haben', pos: 'verb', meaning_vi: 'có' },
      { word: 'werden', pos: 'verb', meaning_vi: 'trở thành' },
      { word: 'können', pos: 'verb', meaning_vi: 'có thể' },
      { word: 'müssen', pos: 'verb', meaning_vi: 'phải' },
      { word: 'sollen', pos: 'verb', meaning_vi: 'nên' },
      { word: 'wollen', pos: 'verb', meaning_vi: 'muốn' },
      { word: 'dürfen', pos: 'verb', meaning_vi: 'được phép' },
      { word: 'mögen', pos: 'verb', meaning_vi: 'thích' },
      { word: 'machen', pos: 'verb', meaning_vi: 'làm' },
      { word: 'gehen', pos: 'verb', meaning_vi: 'đi' },
      { word: 'kommen', pos: 'verb', meaning_vi: 'đến' },
      { word: 'sehen', pos: 'verb', meaning_vi: 'nhìn' },
      { word: 'geben', pos: 'verb', meaning_vi: 'cho' },
      { word: 'nehmen', pos: 'verb', meaning_vi: 'lấy' },
      { word: 'finden', pos: 'verb', meaning_vi: 'tìm thấy' },
      { word: 'denken', pos: 'verb', meaning_vi: 'nghĩ' },
      { word: 'sagen', pos: 'verb', meaning_vi: 'nói' },
      { word: 'wissen', pos: 'verb', meaning_vi: 'biết' },
      { word: 'lassen', pos: 'verb', meaning_vi: 'để' },
    ]
  },

  actionVerbs: {
    topic: 'Dong tu hanh dong',
    level: 'A2',
    words: [
      { word: 'arbeiten', pos: 'verb', meaning_vi: 'làm việc' },
      { word: 'spielen', pos: 'verb', meaning_vi: 'chơi' },
      { word: 'lernen', pos: 'verb', meaning_vi: 'học' },
      { word: 'lesen', pos: 'verb', meaning_vi: 'đọc' },
      { word: 'schreiben', pos: 'verb', meaning_vi: 'viết' },
      { word: 'sprechen', pos: 'verb', meaning_vi: 'nói' },
      { word: 'hören', pos: 'verb', meaning_vi: 'nghe' },
      { word: 'verstehen', pos: 'verb', meaning_vi: 'hiểu' },
      { word: 'kaufen', pos: 'verb', meaning_vi: 'mua' },
      { word: 'verkaufen', pos: 'verb', meaning_vi: 'bán' },
      { word: 'öffnen', pos: 'verb', meaning_vi: 'mở' },
      { word: 'schließen', pos: 'verb', meaning_vi: 'đóng' },
      { word: 'beginnen', pos: 'verb', meaning_vi: 'bắt đầu' },
      { word: 'beenden', pos: 'verb', meaning_vi: 'kết thúc' },
      { word: 'helfen', pos: 'verb', meaning_vi: 'giúp' },
      { word: 'brauchen', pos: 'verb', meaning_vi: 'cần' },
      { word: 'bringen', pos: 'verb', meaning_vi: 'mang' },
      { word: 'holen', pos: 'verb', meaning_vi: 'lấy' },
      { word: 'tragen', pos: 'verb', meaning_vi: 'mang/đeo' },
      { word: 'halten', pos: 'verb', meaning_vi: 'giữ' },
    ]
  },

  movementVerbs: {
    topic: 'Dong tu di chuyen',
    level: 'A2',
    words: [
      { word: 'fahren', pos: 'verb', meaning_vi: 'lái xe/đi' },
      { word: 'fliegen', pos: 'verb', meaning_vi: 'bay' },
      { word: 'laufen', pos: 'verb', meaning_vi: 'chạy' },
      { word: 'springen', pos: 'verb', meaning_vi: 'nhảy' },
      { word: 'schwimmen', pos: 'verb', meaning_vi: 'bơi' },
      { word: 'steigen', pos: 'verb', meaning_vi: 'leo' },
      { word: 'fallen', pos: 'verb', meaning_vi: 'ngã' },
      { word: 'setzen', pos: 'verb', meaning_vi: 'đặt' },
      { word: 'stellen', pos: 'verb', meaning_vi: 'đặt đứng' },
      { word: 'legen', pos: 'verb', meaning_vi: 'đặt nằm' },
      { word: 'sitzen', pos: 'verb', meaning_vi: 'ngồi' },
      { word: 'stehen', pos: 'verb', meaning_vi: 'đứng' },
      { word: 'liegen', pos: 'verb', meaning_vi: 'nằm' },
      { word: 'hängen', pos: 'verb', meaning_vi: 'treo' },
      { word: 'folgen', pos: 'verb', meaning_vi: 'theo' },
      { word: 'erreichen', pos: 'verb', meaning_vi: 'đạt tới' },
      { word: 'verlassen', pos: 'verb', meaning_vi: 'rời đi' },
      { word: 'betreten', pos: 'verb', meaning_vi: 'bước vào' },
      { word: 'rennen', pos: 'verb', meaning_vi: 'chạy nhanh' },
      { word: 'wandern', pos: 'verb', meaning_vi: 'đi bộ' },
    ]
  },

  communicationVerbs: {
    topic: 'Dong tu giao tiep',
    level: 'B1',
    words: [
      { word: 'erzählen', pos: 'verb', meaning_vi: 'kể' },
      { word: 'berichten', pos: 'verb', meaning_vi: 'báo cáo' },
      { word: 'erklären', pos: 'verb', meaning_vi: 'giải thích' },
      { word: 'beschreiben', pos: 'verb', meaning_vi: 'mô tả' },
      { word: 'fragen', pos: 'verb', meaning_vi: 'hỏi' },
      { word: 'antworten', pos: 'verb', meaning_vi: 'trả lời' },
      { word: 'bitten', pos: 'verb', meaning_vi: 'yêu cầu' },
      { word: 'danken', pos: 'verb', meaning_vi: 'cảm ơn' },
      { word: 'entschuldigen', pos: 'verb', meaning_vi: 'xin lỗi' },
      { word: 'begrüßen', pos: 'verb', meaning_vi: 'chào hỏi' },
      { word: 'verabschieden', pos: 'verb', meaning_vi: 'tạm biệt' },
      { word: 'vorstellen', pos: 'verb', meaning_vi: 'giới thiệu' },
      { word: 'diskutieren', pos: 'verb', meaning_vi: 'thảo luận' },
      { word: 'argumentieren', pos: 'verb', meaning_vi: 'lập luận' },
      { word: 'überzeugen', pos: 'verb', meaning_vi: 'thuyết phục' },
      { word: 'zustimmen', pos: 'verb', meaning_vi: 'đồng ý' },
      { word: 'ablehnen', pos: 'verb', meaning_vi: 'từ chối' },
      { word: 'vorschlagen', pos: 'verb', meaning_vi: 'đề xuất' },
      { word: 'empfehlen', pos: 'verb', meaning_vi: 'gợi ý' },
      { word: 'warnen', pos: 'verb', meaning_vi: 'cảnh báo' },
    ]
  },

  mentalVerbs: {
    topic: 'Dong tu tu duy',
    level: 'B1',
    words: [
      { word: 'glauben', pos: 'verb', meaning_vi: 'tin' },
      { word: 'meinen', pos: 'verb', meaning_vi: 'cho rằng' },
      { word: 'vermuten', pos: 'verb', meaning_vi: 'đoán' },
      { word: 'annehmen', pos: 'verb', meaning_vi: 'giả định' },
      { word: 'bezweifeln', pos: 'verb', meaning_vi: 'nghi ngờ' },
      { word: 'überlegen', pos: 'verb', meaning_vi: 'suy nghĩ' },
      { word: 'nachdenken', pos: 'verb', meaning_vi: 'suy ngẫm' },
      { word: 'erinnern', pos: 'verb', meaning_vi: 'nhớ' },
      { word: 'vergessen', pos: 'verb', meaning_vi: 'quên' },
      { word: 'erkennen', pos: 'verb', meaning_vi: 'nhận ra' },
      { word: 'bemerken', pos: 'verb', meaning_vi: 'nhận thấy' },
      { word: 'entdecken', pos: 'verb', meaning_vi: 'khám phá' },
      { word: 'verstehen', pos: 'verb', meaning_vi: 'hiểu' },
      { word: 'begreifen', pos: 'verb', meaning_vi: 'lĩnh hội' },
      { word: 'lernen', pos: 'verb', meaning_vi: 'học' },
      { word: 'studieren', pos: 'verb', meaning_vi: 'nghiên cứu' },
      { word: 'planen', pos: 'verb', meaning_vi: 'lên kế hoạch' },
      { word: 'entscheiden', pos: 'verb', meaning_vi: 'quyết định' },
      { word: 'wählen', pos: 'verb', meaning_vi: 'chọn' },
      { word: 'vergleichen', pos: 'verb', meaning_vi: 'so sánh' },
    ]
  },

  basicAdjectives: {
    topic: 'Tinh tu co ban',
    level: 'A1',
    words: [
      { word: 'gut', pos: 'adj', meaning_vi: 'tốt' },
      { word: 'schlecht', pos: 'adj', meaning_vi: 'xấu' },
      { word: 'groß', pos: 'adj', meaning_vi: 'lớn' },
      { word: 'klein', pos: 'adj', meaning_vi: 'nhỏ' },
      { word: 'alt', pos: 'adj', meaning_vi: 'già/cũ' },
      { word: 'jung', pos: 'adj', meaning_vi: 'trẻ' },
      { word: 'neu', pos: 'adj', meaning_vi: 'mới' },
      { word: 'schnell', pos: 'adj', meaning_vi: 'nhanh' },
      { word: 'langsam', pos: 'adj', meaning_vi: 'chậm' },
      { word: 'hoch', pos: 'adj', meaning_vi: 'cao' },
      { word: 'niedrig', pos: 'adj', meaning_vi: 'thấp' },
      { word: 'lang', pos: 'adj', meaning_vi: 'dài' },
      { word: 'kurz', pos: 'adj', meaning_vi: 'ngắn' },
      { word: 'breit', pos: 'adj', meaning_vi: 'rộng' },
      { word: 'schmal', pos: 'adj', meaning_vi: 'hẹp' },
      { word: 'dick', pos: 'adj', meaning_vi: 'dày/béo' },
      { word: 'dünn', pos: 'adj', meaning_vi: 'mỏng/gầy' },
      { word: 'schwer', pos: 'adj', meaning_vi: 'nặng/khó' },
      { word: 'leicht', pos: 'adj', meaning_vi: 'nhẹ/dễ' },
      { word: 'stark', pos: 'adj', meaning_vi: 'mạnh' },
    ]
  },

  descriptiveAdjectives: {
    topic: 'Tinh tu mo ta',
    level: 'A2',
    words: [
      { word: 'schwach', pos: 'adj', meaning_vi: 'yếu' },
      { word: 'hart', pos: 'adj', meaning_vi: 'cứng' },
      { word: 'weich', pos: 'adj', meaning_vi: 'mềm' },
      { word: 'hell', pos: 'adj', meaning_vi: 'sáng' },
      { word: 'dunkel', pos: 'adj', meaning_vi: 'tối' },
      { word: 'laut', pos: 'adj', meaning_vi: 'ồn' },
      { word: 'leise', pos: 'adj', meaning_vi: 'nhẹ nhàng' },
      { word: 'sauber', pos: 'adj', meaning_vi: 'sạch' },
      { word: 'schmutzig', pos: 'adj', meaning_vi: 'bẩn' },
      { word: 'trocken', pos: 'adj', meaning_vi: 'khô' },
      { word: 'nass', pos: 'adj', meaning_vi: 'ướt' },
      { word: 'voll', pos: 'adj', meaning_vi: 'đầy' },
      { word: 'leer', pos: 'adj', meaning_vi: 'trống' },
      { word: 'offen', pos: 'adj', meaning_vi: 'mở' },
      { word: 'geschlossen', pos: 'adj', meaning_vi: 'đóng' },
      { word: 'richtig', pos: 'adj', meaning_vi: 'đúng' },
      { word: 'falsch', pos: 'adj', meaning_vi: 'sai' },
      { word: 'wichtig', pos: 'adj', meaning_vi: 'quan trọng' },
      { word: 'einfach', pos: 'adj', meaning_vi: 'đơn giản' },
      { word: 'schwierig', pos: 'adj', meaning_vi: 'khó' },
    ]
  },

  qualityAdjectives: {
    topic: 'Tinh tu chat luong',
    level: 'B1',
    words: [
      { word: 'möglich', pos: 'adj', meaning_vi: 'có thể' },
      { word: 'unmöglich', pos: 'adj', meaning_vi: 'không thể' },
      { word: 'notwendig', pos: 'adj', meaning_vi: 'cần thiết' },
      { word: 'nützlich', pos: 'adj', meaning_vi: 'hữu ích' },
      { word: 'nutzlos', pos: 'adj', meaning_vi: 'vô ích' },
      { word: 'gefährlich', pos: 'adj', meaning_vi: 'nguy hiểm' },
      { word: 'sicher', pos: 'adj', meaning_vi: 'an toàn' },
      { word: 'bekannt', pos: 'adj', meaning_vi: 'nổi tiếng' },
      { word: 'unbekannt', pos: 'adj', meaning_vi: 'không rõ' },
      { word: 'berühmt', pos: 'adj', meaning_vi: 'nổi tiếng' },
      { word: 'beliebt', pos: 'adj', meaning_vi: 'được yêu thích' },
      { word: 'typisch', pos: 'adj', meaning_vi: 'điển hình' },
      { word: 'normal', pos: 'adj', meaning_vi: 'bình thường' },
      { word: 'besonders', pos: 'adj', meaning_vi: 'đặc biệt' },
      { word: 'gewöhnlich', pos: 'adj', meaning_vi: 'thường' },
      { word: 'selten', pos: 'adj', meaning_vi: 'hiếm' },
      { word: 'häufig', pos: 'adj', meaning_vi: 'thường xuyên' },
      { word: 'regelmäßig', pos: 'adj', meaning_vi: 'đều đặn' },
      { word: 'plötzlich', pos: 'adj', meaning_vi: 'đột ngột' },
      { word: 'langsam', pos: 'adj', meaning_vi: 'chậm' },
    ]
  },

  adverbs: {
    topic: 'Trang tu',
    level: 'A2',
    words: [
      { word: 'hier', pos: 'adv', meaning_vi: 'ở đây' },
      { word: 'dort', pos: 'adv', meaning_vi: 'ở đó' },
      { word: 'überall', pos: 'adv', meaning_vi: 'khắp nơi' },
      { word: 'nirgendwo', pos: 'adv', meaning_vi: 'không đâu' },
      { word: 'irgendwo', pos: 'adv', meaning_vi: 'đâu đó' },
      { word: 'jetzt', pos: 'adv', meaning_vi: 'bây giờ' },
      { word: 'heute', pos: 'adv', meaning_vi: 'hôm nay' },
      { word: 'morgen', pos: 'adv', meaning_vi: 'ngày mai' },
      { word: 'gestern', pos: 'adv', meaning_vi: 'hôm qua' },
      { word: 'immer', pos: 'adv', meaning_vi: 'luôn luôn' },
      { word: 'nie', pos: 'adv', meaning_vi: 'không bao giờ' },
      { word: 'manchmal', pos: 'adv', meaning_vi: 'đôi khi' },
      { word: 'oft', pos: 'adv', meaning_vi: 'thường' },
      { word: 'selten', pos: 'adv', meaning_vi: 'hiếm khi' },
      { word: 'schon', pos: 'adv', meaning_vi: 'đã' },
      { word: 'noch', pos: 'adv', meaning_vi: 'vẫn' },
      { word: 'wieder', pos: 'adv', meaning_vi: 'lại' },
      { word: 'auch', pos: 'adv', meaning_vi: 'cũng' },
      { word: 'nur', pos: 'adv', meaning_vi: 'chỉ' },
      { word: 'sehr', pos: 'adv', meaning_vi: 'rất' },
    ]
  },

  moreAdverbs: {
    topic: 'Trang tu bo sung',
    level: 'B1',
    words: [
      { word: 'vielleicht', pos: 'adv', meaning_vi: 'có lẽ' },
      { word: 'wahrscheinlich', pos: 'adv', meaning_vi: 'có thể' },
      { word: 'sicherlich', pos: 'adv', meaning_vi: 'chắc chắn' },
      { word: 'bestimmt', pos: 'adv', meaning_vi: 'chắc chắn' },
      { word: 'eigentlich', pos: 'adv', meaning_vi: 'thực ra' },
      { word: 'wirklich', pos: 'adv', meaning_vi: 'thực sự' },
      { word: 'tatsächlich', pos: 'adv', meaning_vi: 'thực tế' },
      { word: 'ungefähr', pos: 'adv', meaning_vi: 'khoảng' },
      { word: 'genau', pos: 'adv', meaning_vi: 'chính xác' },
      { word: 'besonders', pos: 'adv', meaning_vi: 'đặc biệt' },
      { word: 'hauptsächlich', pos: 'adv', meaning_vi: 'chủ yếu' },
      { word: 'normalerweise', pos: 'adv', meaning_vi: 'thông thường' },
      { word: 'glücklicherweise', pos: 'adv', meaning_vi: 'may mắn' },
      { word: 'leider', pos: 'adv', meaning_vi: 'tiếc là' },
      { word: 'hoffentlich', pos: 'adv', meaning_vi: 'hy vọng' },
      { word: 'trotzdem', pos: 'adv', meaning_vi: 'mặc dù vậy' },
      { word: 'deshalb', pos: 'adv', meaning_vi: 'vì vậy' },
      { word: 'daher', pos: 'adv', meaning_vi: 'do đó' },
      { word: 'jedoch', pos: 'adv', meaning_vi: 'tuy nhiên' },
      { word: 'außerdem', pos: 'adv', meaning_vi: 'ngoài ra' },
    ]
  },

  prepositions: {
    topic: 'Gioi tu',
    level: 'A2',
    words: [
      { word: 'in', pos: 'prep', meaning_vi: 'trong' },
      { word: 'an', pos: 'prep', meaning_vi: 'ở/tại' },
      { word: 'auf', pos: 'prep', meaning_vi: 'trên' },
      { word: 'unter', pos: 'prep', meaning_vi: 'dưới' },
      { word: 'über', pos: 'prep', meaning_vi: 'trên/qua' },
      { word: 'vor', pos: 'prep', meaning_vi: 'trước' },
      { word: 'hinter', pos: 'prep', meaning_vi: 'sau' },
      { word: 'neben', pos: 'prep', meaning_vi: 'bên cạnh' },
      { word: 'zwischen', pos: 'prep', meaning_vi: 'giữa' },
      { word: 'mit', pos: 'prep', meaning_vi: 'với' },
      { word: 'ohne', pos: 'prep', meaning_vi: 'không có' },
      { word: 'für', pos: 'prep', meaning_vi: 'cho' },
      { word: 'gegen', pos: 'prep', meaning_vi: 'chống/khoảng' },
      { word: 'durch', pos: 'prep', meaning_vi: 'qua' },
      { word: 'um', pos: 'prep', meaning_vi: 'quanh/lúc' },
      { word: 'bei', pos: 'prep', meaning_vi: 'ở/tại' },
      { word: 'nach', pos: 'prep', meaning_vi: 'sau/đến' },
      { word: 'von', pos: 'prep', meaning_vi: 'từ/của' },
      { word: 'zu', pos: 'prep', meaning_vi: 'đến' },
      { word: 'seit', pos: 'prep', meaning_vi: 'từ (thời gian)' },
    ]
  },

  conjunctions: {
    topic: 'Lien tu',
    level: 'A2',
    words: [
      { word: 'und', pos: 'conj', meaning_vi: 'và' },
      { word: 'oder', pos: 'conj', meaning_vi: 'hoặc' },
      { word: 'aber', pos: 'conj', meaning_vi: 'nhưng' },
      { word: 'denn', pos: 'conj', meaning_vi: 'bởi vì' },
      { word: 'sondern', pos: 'conj', meaning_vi: 'mà' },
      { word: 'weil', pos: 'conj', meaning_vi: 'vì' },
      { word: 'dass', pos: 'conj', meaning_vi: 'rằng' },
      { word: 'wenn', pos: 'conj', meaning_vi: 'nếu/khi' },
      { word: 'als', pos: 'conj', meaning_vi: 'khi/như' },
      { word: 'obwohl', pos: 'conj', meaning_vi: 'mặc dù' },
      { word: 'während', pos: 'conj', meaning_vi: 'trong khi' },
      { word: 'bevor', pos: 'conj', meaning_vi: 'trước khi' },
      { word: 'nachdem', pos: 'conj', meaning_vi: 'sau khi' },
      { word: 'bis', pos: 'conj', meaning_vi: 'cho đến khi' },
      { word: 'damit', pos: 'conj', meaning_vi: 'để' },
      { word: 'um zu', pos: 'conj', meaning_vi: 'để' },
      { word: 'falls', pos: 'conj', meaning_vi: 'trong trường hợp' },
      { word: 'sodass', pos: 'conj', meaning_vi: 'để mà' },
      { word: 'je ... desto', pos: 'conj', meaning_vi: 'càng ... càng' },
      { word: 'sowohl ... als auch', pos: 'conj', meaning_vi: 'cả ... lẫn' },
    ]
  },

  pronouns: {
    topic: 'Dai tu',
    level: 'A1',
    words: [
      { word: 'ich', pos: 'pron', meaning_vi: 'tôi' },
      { word: 'du', pos: 'pron', meaning_vi: 'bạn' },
      { word: 'er', pos: 'pron', meaning_vi: 'anh ấy' },
      { word: 'sie', pos: 'pron', meaning_vi: 'cô ấy/họ' },
      { word: 'es', pos: 'pron', meaning_vi: 'nó' },
      { word: 'wir', pos: 'pron', meaning_vi: 'chúng tôi' },
      { word: 'ihr', pos: 'pron', meaning_vi: 'các bạn' },
      { word: 'Sie', pos: 'pron', meaning_vi: 'quý vị' },
      { word: 'mich', pos: 'pron', meaning_vi: 'tôi (Akk)' },
      { word: 'dich', pos: 'pron', meaning_vi: 'bạn (Akk)' },
      { word: 'mir', pos: 'pron', meaning_vi: 'tôi (Dat)' },
      { word: 'dir', pos: 'pron', meaning_vi: 'bạn (Dat)' },
      { word: 'mein', pos: 'pron', meaning_vi: 'của tôi' },
      { word: 'dein', pos: 'pron', meaning_vi: 'của bạn' },
      { word: 'sein', pos: 'pron', meaning_vi: 'của anh ấy' },
      { word: 'ihr', pos: 'pron', meaning_vi: 'của cô ấy' },
      { word: 'unser', pos: 'pron', meaning_vi: 'của chúng tôi' },
      { word: 'euer', pos: 'pron', meaning_vi: 'của các bạn' },
      { word: 'dieser', pos: 'pron', meaning_vi: 'này' },
      { word: 'jener', pos: 'pron', meaning_vi: 'kia' },
    ]
  },

  questionWords: {
    topic: 'Tu nghi van',
    level: 'A1',
    words: [
      { word: 'wer', pos: 'pron', meaning_vi: 'ai' },
      { word: 'was', pos: 'pron', meaning_vi: 'cái gì' },
      { word: 'wo', pos: 'adv', meaning_vi: 'ở đâu' },
      { word: 'wohin', pos: 'adv', meaning_vi: 'đến đâu' },
      { word: 'woher', pos: 'adv', meaning_vi: 'từ đâu' },
      { word: 'wann', pos: 'adv', meaning_vi: 'khi nào' },
      { word: 'wie', pos: 'adv', meaning_vi: 'như thế nào' },
      { word: 'warum', pos: 'adv', meaning_vi: 'tại sao' },
      { word: 'welcher', pos: 'pron', meaning_vi: 'cái nào' },
      { word: 'wessen', pos: 'pron', meaning_vi: 'của ai' },
      { word: 'wem', pos: 'pron', meaning_vi: 'cho ai' },
      { word: 'wen', pos: 'pron', meaning_vi: 'ai (Akk)' },
      { word: 'wie viel', pos: 'adv', meaning_vi: 'bao nhiêu' },
      { word: 'wie lange', pos: 'adv', meaning_vi: 'bao lâu' },
      { word: 'wie oft', pos: 'adv', meaning_vi: 'bao nhiêu lần' },
      { word: 'wie weit', pos: 'adv', meaning_vi: 'bao xa' },
      { word: 'wieso', pos: 'adv', meaning_vi: 'tại sao' },
      { word: 'weshalb', pos: 'adv', meaning_vi: 'vì sao' },
      { word: 'womit', pos: 'adv', meaning_vi: 'bằng gì' },
      { word: 'worüber', pos: 'adv', meaning_vi: 'về điều gì' },
    ]
  },

  colors: {
    topic: 'Mau sac',
    level: 'A1',
    words: [
      { word: 'rot', pos: 'adj', meaning_vi: 'đỏ' },
      { word: 'blau', pos: 'adj', meaning_vi: 'xanh dương' },
      { word: 'grün', pos: 'adj', meaning_vi: 'xanh lá' },
      { word: 'gelb', pos: 'adj', meaning_vi: 'vàng' },
      { word: 'orange', pos: 'adj', meaning_vi: 'cam' },
      { word: 'lila', pos: 'adj', meaning_vi: 'tím' },
      { word: 'rosa', pos: 'adj', meaning_vi: 'hồng' },
      { word: 'braun', pos: 'adj', meaning_vi: 'nâu' },
      { word: 'schwarz', pos: 'adj', meaning_vi: 'đen' },
      { word: 'weiß', pos: 'adj', meaning_vi: 'trắng' },
      { word: 'grau', pos: 'adj', meaning_vi: 'xám' },
      { word: 'beige', pos: 'adj', meaning_vi: 'be' },
      { word: 'türkis', pos: 'adj', meaning_vi: 'ngọc lam' },
      { word: 'gold', pos: 'adj', meaning_vi: 'vàng kim' },
      { word: 'silber', pos: 'adj', meaning_vi: 'bạc' },
      { word: 'hell', pos: 'adj', meaning_vi: 'sáng' },
      { word: 'dunkel', pos: 'adj', meaning_vi: 'tối' },
      { word: 'bunt', pos: 'adj', meaning_vi: 'nhiều màu' },
      { word: 'farbig', pos: 'adj', meaning_vi: 'có màu' },
      { word: 'farblos', pos: 'adj', meaning_vi: 'không màu' },
    ]
  },

  countries: {
    topic: 'Quoc gia',
    level: 'A1',
    words: [
      { word: 'Deutschland', pos: 'noun', meaning_vi: 'Đức' },
      { word: 'Österreich', pos: 'noun', meaning_vi: 'Áo' },
      { word: 'die Schweiz', pos: 'noun', meaning_vi: 'Thụy Sĩ' },
      { word: 'Frankreich', pos: 'noun', meaning_vi: 'Pháp' },
      { word: 'Italien', pos: 'noun', meaning_vi: 'Ý' },
      { word: 'Spanien', pos: 'noun', meaning_vi: 'Tây Ban Nha' },
      { word: 'England', pos: 'noun', meaning_vi: 'Anh' },
      { word: 'die USA', pos: 'noun', meaning_vi: 'Mỹ' },
      { word: 'China', pos: 'noun', meaning_vi: 'Trung Quốc' },
      { word: 'Japan', pos: 'noun', meaning_vi: 'Nhật Bản' },
      { word: 'Russland', pos: 'noun', meaning_vi: 'Nga' },
      { word: 'Vietnam', pos: 'noun', meaning_vi: 'Việt Nam' },
      { word: 'Thailand', pos: 'noun', meaning_vi: 'Thái Lan' },
      { word: 'Indien', pos: 'noun', meaning_vi: 'Ấn Độ' },
      { word: 'Brasilien', pos: 'noun', meaning_vi: 'Brazil' },
      { word: 'Australien', pos: 'noun', meaning_vi: 'Úc' },
      { word: 'Kanada', pos: 'noun', meaning_vi: 'Canada' },
      { word: 'die Türkei', pos: 'noun', meaning_vi: 'Thổ Nhĩ Kỳ' },
      { word: 'Polen', pos: 'noun', meaning_vi: 'Ba Lan' },
      { word: 'die Niederlande', pos: 'noun', meaning_vi: 'Hà Lan' },
    ]
  },

  nationalities: {
    topic: 'Quoc tich',
    level: 'A2',
    words: [
      { word: 'deutsch', pos: 'adj', meaning_vi: 'Đức' },
      { word: 'österreichisch', pos: 'adj', meaning_vi: 'Áo' },
      { word: 'schweizerisch', pos: 'adj', meaning_vi: 'Thụy Sĩ' },
      { word: 'französisch', pos: 'adj', meaning_vi: 'Pháp' },
      { word: 'italienisch', pos: 'adj', meaning_vi: 'Ý' },
      { word: 'spanisch', pos: 'adj', meaning_vi: 'Tây Ban Nha' },
      { word: 'englisch', pos: 'adj', meaning_vi: 'Anh' },
      { word: 'amerikanisch', pos: 'adj', meaning_vi: 'Mỹ' },
      { word: 'chinesisch', pos: 'adj', meaning_vi: 'Trung Quốc' },
      { word: 'japanisch', pos: 'adj', meaning_vi: 'Nhật Bản' },
      { word: 'russisch', pos: 'adj', meaning_vi: 'Nga' },
      { word: 'vietnamesisch', pos: 'adj', meaning_vi: 'Việt Nam' },
      { word: 'thailändisch', pos: 'adj', meaning_vi: 'Thái Lan' },
      { word: 'indisch', pos: 'adj', meaning_vi: 'Ấn Độ' },
      { word: 'brasilianisch', pos: 'adj', meaning_vi: 'Brazil' },
      { word: 'australisch', pos: 'adj', meaning_vi: 'Úc' },
      { word: 'kanadisch', pos: 'adj', meaning_vi: 'Canada' },
      { word: 'türkisch', pos: 'adj', meaning_vi: 'Thổ Nhĩ Kỳ' },
      { word: 'polnisch', pos: 'adj', meaning_vi: 'Ba Lan' },
      { word: 'niederländisch', pos: 'adj', meaning_vi: 'Hà Lan' },
    ]
  },

  languages: {
    topic: 'Ngon ngu',
    level: 'A1',
    words: [
      { word: 'Deutsch', pos: 'noun', meaning_vi: 'tiếng Đức' },
      { word: 'Englisch', pos: 'noun', meaning_vi: 'tiếng Anh' },
      { word: 'Französisch', pos: 'noun', meaning_vi: 'tiếng Pháp' },
      { word: 'Spanisch', pos: 'noun', meaning_vi: 'tiếng Tây Ban Nha' },
      { word: 'Italienisch', pos: 'noun', meaning_vi: 'tiếng Ý' },
      { word: 'Chinesisch', pos: 'noun', meaning_vi: 'tiếng Trung' },
      { word: 'Japanisch', pos: 'noun', meaning_vi: 'tiếng Nhật' },
      { word: 'Russisch', pos: 'noun', meaning_vi: 'tiếng Nga' },
      { word: 'Portugiesisch', pos: 'noun', meaning_vi: 'tiếng Bồ Đào Nha' },
      { word: 'Arabisch', pos: 'noun', meaning_vi: 'tiếng Ả Rập' },
      { word: 'Vietnamesisch', pos: 'noun', meaning_vi: 'tiếng Việt' },
      { word: 'Koreanisch', pos: 'noun', meaning_vi: 'tiếng Hàn' },
      { word: 'Hindi', pos: 'noun', meaning_vi: 'tiếng Hindi' },
      { word: 'Türkisch', pos: 'noun', meaning_vi: 'tiếng Thổ' },
      { word: 'Polnisch', pos: 'noun', meaning_vi: 'tiếng Ba Lan' },
      { word: 'die Sprache', pos: 'noun', meaning_vi: 'ngôn ngữ' },
      { word: 'die Muttersprache', pos: 'noun', meaning_vi: 'tiếng mẹ đẻ' },
      { word: 'die Fremdsprache', pos: 'noun', meaning_vi: 'ngoại ngữ' },
      { word: 'sprechen', pos: 'verb', meaning_vi: 'nói' },
      { word: 'übersetzen', pos: 'verb', meaning_vi: 'dịch' },
    ]
  },
};

// Generate vocabulary
const vocabulary = [];
for (const [category, data] of Object.entries(TOPICS)) {
  for (const word of data.words) {
    vocabulary.push({
      ...word,
      level: data.level,
      topic: data.topic,
    });
  }
}

// Save
fs.writeFileSync(OUTPUT, JSON.stringify(vocabulary, null, 2));

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║    ⛏️  MINE VOCABULARY BATCH 13                             ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

console.log(`📊 Total words: ${vocabulary.length}`);

// Distribution
const levels = {};
for (const w of vocabulary) {
  levels[w.level] = (levels[w.level] || 0) + 1;
}
console.log('\n📈 Distribution by Level:');
Object.entries(levels).sort().forEach(([l, c]) => console.log(`   ${l}: ${c}`));

console.log(`\n💾 Saved to: ${OUTPUT}`);
