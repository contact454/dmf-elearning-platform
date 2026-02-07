#!/usr/bin/env node
/**
 * Mine Vocabulary Batch 4 - Additional High-Frequency Words
 * Target: 800+ words covering more essential topics
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT = path.join(__dirname, '../data/quality-expansion/batch4-vocabulary.json');

const TOPICS = {
  // Animals Extended
  animals: {
    level: 'A2',
    words: [
      { word: 'Tier', meaning_vi: 'động vật', pos: 'noun' },
      { word: 'Haustier', meaning_vi: 'thú cưng', pos: 'noun' },
      { word: 'Hund', meaning_vi: 'chó', pos: 'noun' },
      { word: 'Katze', meaning_vi: 'mèo', pos: 'noun' },
      { word: 'Vogel', meaning_vi: 'chim', pos: 'noun' },
      { word: 'Fisch', meaning_vi: 'cá', pos: 'noun' },
      { word: 'Pferd', meaning_vi: 'ngựa', pos: 'noun' },
      { word: 'Kuh', meaning_vi: 'bò cái', pos: 'noun' },
      { word: 'Schwein', meaning_vi: 'lợn', pos: 'noun' },
      { word: 'Schaf', meaning_vi: 'cừu', pos: 'noun' },
      { word: 'Ziege', meaning_vi: 'dê', pos: 'noun' },
      { word: 'Huhn', meaning_vi: 'gà', pos: 'noun' },
      { word: 'Ente', meaning_vi: 'vịt', pos: 'noun' },
      { word: 'Gans', meaning_vi: 'ngỗng', pos: 'noun' },
      { word: 'Kaninchen', meaning_vi: 'thỏ', pos: 'noun' },
      { word: 'Maus', meaning_vi: 'chuột', pos: 'noun' },
      { word: 'Ratte', meaning_vi: 'chuột cống', pos: 'noun' },
      { word: 'Elefant', meaning_vi: 'voi', pos: 'noun' },
      { word: 'Löwe', meaning_vi: 'sư tử', pos: 'noun' },
      { word: 'Tiger', meaning_vi: 'hổ', pos: 'noun' },
      { word: 'Bär', meaning_vi: 'gấu', pos: 'noun' },
      { word: 'Wolf', meaning_vi: 'sói', pos: 'noun' },
      { word: 'Fuchs', meaning_vi: 'cáo', pos: 'noun' },
      { word: 'Affe', meaning_vi: 'khỉ', pos: 'noun' },
      { word: 'Schlange', meaning_vi: 'rắn', pos: 'noun' },
      { word: 'Frosch', meaning_vi: 'ếch', pos: 'noun' },
      { word: 'Schmetterling', meaning_vi: 'bướm', pos: 'noun' },
      { word: 'Biene', meaning_vi: 'ong', pos: 'noun' },
      { word: 'Spinne', meaning_vi: 'nhện', pos: 'noun' },
      { word: 'Ameise', meaning_vi: 'kiến', pos: 'noun' },
    ]
  },

  // Materials & Objects
  materials_objects: {
    level: 'A2',
    words: [
      { word: 'Holz', meaning_vi: 'gỗ', pos: 'noun' },
      { word: 'Metall', meaning_vi: 'kim loại', pos: 'noun' },
      { word: 'Glas', meaning_vi: 'thủy tinh', pos: 'noun' },
      { word: 'Plastik', meaning_vi: 'nhựa', pos: 'noun' },
      { word: 'Papier', meaning_vi: 'giấy', pos: 'noun' },
      { word: 'Stoff', meaning_vi: 'vải', pos: 'noun' },
      { word: 'Leder', meaning_vi: 'da', pos: 'noun' },
      { word: 'Wolle', meaning_vi: 'len', pos: 'noun' },
      { word: 'Baumwolle', meaning_vi: 'bông', pos: 'noun' },
      { word: 'Stein', meaning_vi: 'đá', pos: 'noun' },
      { word: 'Sand', meaning_vi: 'cát', pos: 'noun' },
      { word: 'Eisen', meaning_vi: 'sắt', pos: 'noun' },
      { word: 'Gold', meaning_vi: 'vàng', pos: 'noun' },
      { word: 'Silber', meaning_vi: 'bạc', pos: 'noun' },
      { word: 'Kupfer', meaning_vi: 'đồng', pos: 'noun' },
      { word: 'Aluminium', meaning_vi: 'nhôm', pos: 'noun' },
      { word: 'Gummi', meaning_vi: 'cao su', pos: 'noun' },
      { word: 'Karton', meaning_vi: 'bìa cứng', pos: 'noun' },
      { word: 'Seide', meaning_vi: 'lụa', pos: 'noun' },
      { word: 'Porzellan', meaning_vi: 'sứ', pos: 'noun' },
    ]
  },

  // Colors Extended
  colors: {
    level: 'A1',
    words: [
      { word: 'Farbe', meaning_vi: 'màu sắc', pos: 'noun' },
      { word: 'rot', meaning_vi: 'đỏ', pos: 'adjective' },
      { word: 'blau', meaning_vi: 'xanh dương', pos: 'adjective' },
      { word: 'grün', meaning_vi: 'xanh lá', pos: 'adjective' },
      { word: 'gelb', meaning_vi: 'vàng', pos: 'adjective' },
      { word: 'orange', meaning_vi: 'cam', pos: 'adjective' },
      { word: 'lila', meaning_vi: 'tím', pos: 'adjective' },
      { word: 'rosa', meaning_vi: 'hồng', pos: 'adjective' },
      { word: 'braun', meaning_vi: 'nâu', pos: 'adjective' },
      { word: 'schwarz', meaning_vi: 'đen', pos: 'adjective' },
      { word: 'weiß', meaning_vi: 'trắng', pos: 'adjective' },
      { word: 'grau', meaning_vi: 'xám', pos: 'adjective' },
      { word: 'dunkel', meaning_vi: 'tối', pos: 'adjective' },
      { word: 'hell', meaning_vi: 'sáng', pos: 'adjective' },
      { word: 'bunt', meaning_vi: 'nhiều màu', pos: 'adjective' },
    ]
  },

  // Shapes & Sizes
  shapes_sizes: {
    level: 'A2',
    words: [
      { word: 'Form', meaning_vi: 'hình dạng', pos: 'noun' },
      { word: 'Kreis', meaning_vi: 'hình tròn', pos: 'noun' },
      { word: 'Quadrat', meaning_vi: 'hình vuông', pos: 'noun' },
      { word: 'Dreieck', meaning_vi: 'hình tam giác', pos: 'noun' },
      { word: 'Rechteck', meaning_vi: 'hình chữ nhật', pos: 'noun' },
      { word: 'Linie', meaning_vi: 'đường thẳng', pos: 'noun' },
      { word: 'Punkt', meaning_vi: 'điểm', pos: 'noun' },
      { word: 'Ecke', meaning_vi: 'góc', pos: 'noun' },
      { word: 'Rand', meaning_vi: 'cạnh, viền', pos: 'noun' },
      { word: 'Größe', meaning_vi: 'kích cỡ', pos: 'noun' },
      { word: 'Länge', meaning_vi: 'chiều dài', pos: 'noun' },
      { word: 'Breite', meaning_vi: 'chiều rộng', pos: 'noun' },
      { word: 'Höhe', meaning_vi: 'chiều cao', pos: 'noun' },
      { word: 'Tiefe', meaning_vi: 'chiều sâu', pos: 'noun' },
      { word: 'Gewicht', meaning_vi: 'trọng lượng', pos: 'noun' },
      { word: 'Meter', meaning_vi: 'mét', pos: 'noun' },
      { word: 'Zentimeter', meaning_vi: 'xentimét', pos: 'noun' },
      { word: 'Kilometer', meaning_vi: 'kilômét', pos: 'noun' },
      { word: 'Gramm', meaning_vi: 'gam', pos: 'noun' },
      { word: 'Kilogramm', meaning_vi: 'kilôgam', pos: 'noun' },
      { word: 'Liter', meaning_vi: 'lít', pos: 'noun' },
      { word: 'Grad', meaning_vi: 'độ', pos: 'noun' },
      { word: 'Prozent', meaning_vi: 'phần trăm', pos: 'noun' },
      { word: 'Hälfte', meaning_vi: 'một nửa', pos: 'noun' },
      { word: 'Drittel', meaning_vi: 'một phần ba', pos: 'noun' },
    ]
  },

  // Weather Extended
  weather: {
    level: 'A2',
    words: [
      { word: 'Wetter', meaning_vi: 'thời tiết', pos: 'noun' },
      { word: 'Temperatur', meaning_vi: 'nhiệt độ', pos: 'noun' },
      { word: 'Sonne', meaning_vi: 'mặt trời', pos: 'noun' },
      { word: 'Regen', meaning_vi: 'mưa', pos: 'noun' },
      { word: 'Schnee', meaning_vi: 'tuyết', pos: 'noun' },
      { word: 'Wind', meaning_vi: 'gió', pos: 'noun' },
      { word: 'Sturm', meaning_vi: 'bão', pos: 'noun' },
      { word: 'Gewitter', meaning_vi: 'giông', pos: 'noun' },
      { word: 'Blitz', meaning_vi: 'sấm chớp', pos: 'noun' },
      { word: 'Donner', meaning_vi: 'sấm', pos: 'noun' },
      { word: 'Wolke', meaning_vi: 'mây', pos: 'noun' },
      { word: 'Nebel', meaning_vi: 'sương mù', pos: 'noun' },
      { word: 'Eis', meaning_vi: 'băng', pos: 'noun' },
      { word: 'Frost', meaning_vi: 'sương giá', pos: 'noun' },
      { word: 'Hitze', meaning_vi: 'nóng', pos: 'noun' },
      { word: 'Kälte', meaning_vi: 'lạnh', pos: 'noun' },
      { word: 'Feuchtigkeit', meaning_vi: 'độ ẩm', pos: 'noun' },
      { word: 'sonnig', meaning_vi: 'nắng', pos: 'adjective' },
      { word: 'regnerisch', meaning_vi: 'có mưa', pos: 'adjective' },
      { word: 'bewölkt', meaning_vi: 'nhiều mây', pos: 'adjective' },
      { word: 'windig', meaning_vi: 'có gió', pos: 'adjective' },
      { word: 'neblig', meaning_vi: 'có sương mù', pos: 'adjective' },
      { word: 'warm', meaning_vi: 'ấm', pos: 'adjective' },
      { word: 'kalt', meaning_vi: 'lạnh', pos: 'adjective' },
      { word: 'heiß', meaning_vi: 'nóng', pos: 'adjective' },
    ]
  },

  // Communication Verbs
  communication_verbs: {
    level: 'A2',
    words: [
      { word: 'sprechen', meaning_vi: 'nói', pos: 'verb' },
      { word: 'sagen', meaning_vi: 'nói, bảo', pos: 'verb' },
      { word: 'erzählen', meaning_vi: 'kể', pos: 'verb' },
      { word: 'fragen', meaning_vi: 'hỏi', pos: 'verb' },
      { word: 'antworten', meaning_vi: 'trả lời', pos: 'verb' },
      { word: 'erklären', meaning_vi: 'giải thích', pos: 'verb' },
      { word: 'beschreiben', meaning_vi: 'mô tả', pos: 'verb' },
      { word: 'mitteilen', meaning_vi: 'thông báo', pos: 'verb' },
      { word: 'berichten', meaning_vi: 'báo cáo', pos: 'verb' },
      { word: 'bitten', meaning_vi: 'xin, yêu cầu', pos: 'verb' },
      { word: 'danken', meaning_vi: 'cảm ơn', pos: 'verb' },
      { word: 'entschuldigen', meaning_vi: 'xin lỗi', pos: 'verb' },
      { word: 'vorstellen', meaning_vi: 'giới thiệu', pos: 'verb' },
      { word: 'begrüßen', meaning_vi: 'chào hỏi', pos: 'verb' },
      { word: 'verabschieden', meaning_vi: 'tạm biệt', pos: 'verb' },
      { word: 'rufen', meaning_vi: 'gọi', pos: 'verb' },
      { word: 'schreien', meaning_vi: 'hét', pos: 'verb' },
      { word: 'flüstern', meaning_vi: 'thì thầm', pos: 'verb' },
      { word: 'lachen', meaning_vi: 'cười', pos: 'verb' },
      { word: 'weinen', meaning_vi: 'khóc', pos: 'verb' },
    ]
  },

  // Movement Verbs
  movement_verbs: {
    level: 'A2',
    words: [
      { word: 'gehen', meaning_vi: 'đi bộ', pos: 'verb' },
      { word: 'laufen', meaning_vi: 'chạy', pos: 'verb' },
      { word: 'rennen', meaning_vi: 'chạy nhanh', pos: 'verb' },
      { word: 'springen', meaning_vi: 'nhảy', pos: 'verb' },
      { word: 'klettern', meaning_vi: 'leo', pos: 'verb' },
      { word: 'fallen', meaning_vi: 'rơi, ngã', pos: 'verb' },
      { word: 'stehen', meaning_vi: 'đứng', pos: 'verb' },
      { word: 'sitzen', meaning_vi: 'ngồi', pos: 'verb' },
      { word: 'liegen', meaning_vi: 'nằm', pos: 'verb' },
      { word: 'aufstehen', meaning_vi: 'đứng dậy', pos: 'verb' },
      { word: 'setzen', meaning_vi: 'đặt ngồi', pos: 'verb' },
      { word: 'legen', meaning_vi: 'đặt nằm', pos: 'verb' },
      { word: 'kommen', meaning_vi: 'đến', pos: 'verb' },
      { word: 'ankommen', meaning_vi: 'đến nơi', pos: 'verb' },
      { word: 'weggehen', meaning_vi: 'đi xa', pos: 'verb' },
      { word: 'zurückkommen', meaning_vi: 'quay lại', pos: 'verb' },
      { word: 'eintreten', meaning_vi: 'bước vào', pos: 'verb' },
      { word: 'austreten', meaning_vi: 'bước ra', pos: 'verb' },
      { word: 'fahren', meaning_vi: 'lái xe', pos: 'verb' },
      { word: 'fliegen', meaning_vi: 'bay', pos: 'verb' },
      { word: 'schwimmen', meaning_vi: 'bơi', pos: 'verb' },
      { word: 'reisen', meaning_vi: 'đi du lịch', pos: 'verb' },
      { word: 'folgen', meaning_vi: 'theo', pos: 'verb' },
      { word: 'begleiten', meaning_vi: 'đi cùng', pos: 'verb' },
      { word: 'treffen', meaning_vi: 'gặp', pos: 'verb' },
    ]
  },

  // Daily Verbs Extended
  daily_verbs: {
    level: 'A1',
    words: [
      { word: 'essen', meaning_vi: 'ăn', pos: 'verb' },
      { word: 'trinken', meaning_vi: 'uống', pos: 'verb' },
      { word: 'schlafen', meaning_vi: 'ngủ', pos: 'verb' },
      { word: 'aufwachen', meaning_vi: 'thức dậy', pos: 'verb' },
      { word: 'waschen', meaning_vi: 'rửa', pos: 'verb' },
      { word: 'duschen', meaning_vi: 'tắm vòi sen', pos: 'verb' },
      { word: 'baden', meaning_vi: 'tắm bồn', pos: 'verb' },
      { word: 'putzen', meaning_vi: 'đánh răng, lau', pos: 'verb' },
      { word: 'kämmen', meaning_vi: 'chải tóc', pos: 'verb' },
      { word: 'rasieren', meaning_vi: 'cạo râu', pos: 'verb' },
      { word: 'anziehen', meaning_vi: 'mặc vào', pos: 'verb' },
      { word: 'ausziehen', meaning_vi: 'cởi ra', pos: 'verb' },
      { word: 'kochen', meaning_vi: 'nấu ăn', pos: 'verb' },
      { word: 'aufräumen', meaning_vi: 'dọn dẹp', pos: 'verb' },
      { word: 'sauber machen', meaning_vi: 'làm sạch', pos: 'verb' },
      { word: 'arbeiten', meaning_vi: 'làm việc', pos: 'verb' },
      { word: 'studieren', meaning_vi: 'học đại học', pos: 'verb' },
      { word: 'lernen', meaning_vi: 'học', pos: 'verb' },
      { word: 'lesen', meaning_vi: 'đọc', pos: 'verb' },
      { word: 'schreiben', meaning_vi: 'viết', pos: 'verb' },
      { word: 'telefonieren', meaning_vi: 'gọi điện', pos: 'verb' },
      { word: 'fernsehen', meaning_vi: 'xem TV', pos: 'verb' },
      { word: 'entspannen', meaning_vi: 'thư giãn', pos: 'verb' },
      { word: 'ausruhen', meaning_vi: 'nghỉ ngơi', pos: 'verb' },
      { word: 'spazieren gehen', meaning_vi: 'đi dạo', pos: 'verb' },
    ]
  },

  // Modal Verbs & Auxiliaries
  modal_verbs: {
    level: 'A1',
    words: [
      { word: 'können', meaning_vi: 'có thể', pos: 'verb' },
      { word: 'müssen', meaning_vi: 'phải', pos: 'verb' },
      { word: 'wollen', meaning_vi: 'muốn', pos: 'verb' },
      { word: 'sollen', meaning_vi: 'nên', pos: 'verb' },
      { word: 'dürfen', meaning_vi: 'được phép', pos: 'verb' },
      { word: 'mögen', meaning_vi: 'thích', pos: 'verb' },
      { word: 'möchten', meaning_vi: 'muốn (lịch sự)', pos: 'verb' },
      { word: 'sein', meaning_vi: 'là, ở', pos: 'verb' },
      { word: 'haben', meaning_vi: 'có', pos: 'verb' },
      { word: 'werden', meaning_vi: 'trở nên', pos: 'verb' },
      { word: 'machen', meaning_vi: 'làm', pos: 'verb' },
      { word: 'tun', meaning_vi: 'làm', pos: 'verb' },
      { word: 'lassen', meaning_vi: 'để, cho', pos: 'verb' },
      { word: 'bleiben', meaning_vi: 'ở lại', pos: 'verb' },
      { word: 'wissen', meaning_vi: 'biết', pos: 'verb' },
    ]
  },

  // Perception & Senses
  perception_senses: {
    level: 'A2',
    words: [
      { word: 'sehen', meaning_vi: 'nhìn thấy', pos: 'verb' },
      { word: 'hören', meaning_vi: 'nghe', pos: 'verb' },
      { word: 'riechen', meaning_vi: 'ngửi', pos: 'verb' },
      { word: 'schmecken', meaning_vi: 'nếm', pos: 'verb' },
      { word: 'fühlen', meaning_vi: 'cảm nhận', pos: 'verb' },
      { word: 'spüren', meaning_vi: 'cảm thấy', pos: 'verb' },
      { word: 'bemerken', meaning_vi: 'nhận ra', pos: 'verb' },
      { word: 'erkennen', meaning_vi: 'nhận ra', pos: 'verb' },
      { word: 'beobachten', meaning_vi: 'quan sát', pos: 'verb' },
      { word: 'zuhören', meaning_vi: 'lắng nghe', pos: 'verb' },
      { word: 'ansehen', meaning_vi: 'nhìn', pos: 'verb' },
      { word: 'anschauen', meaning_vi: 'xem', pos: 'verb' },
      { word: 'zuschauen', meaning_vi: 'xem', pos: 'verb' },
      { word: 'berühren', meaning_vi: 'chạm', pos: 'verb' },
      { word: 'greifen', meaning_vi: 'nắm', pos: 'verb' },
    ]
  },

  // Thinking & Mental Verbs
  thinking_verbs: {
    level: 'A2',
    words: [
      { word: 'denken', meaning_vi: 'nghĩ', pos: 'verb' },
      { word: 'meinen', meaning_vi: 'nghĩ, cho rằng', pos: 'verb' },
      { word: 'glauben', meaning_vi: 'tin', pos: 'verb' },
      { word: 'wissen', meaning_vi: 'biết', pos: 'verb' },
      { word: 'verstehen', meaning_vi: 'hiểu', pos: 'verb' },
      { word: 'kennen', meaning_vi: 'quen biết', pos: 'verb' },
      { word: 'erinnern', meaning_vi: 'nhớ', pos: 'verb' },
      { word: 'vergessen', meaning_vi: 'quên', pos: 'verb' },
      { word: 'lernen', meaning_vi: 'học', pos: 'verb' },
      { word: 'merken', meaning_vi: 'ghi nhớ', pos: 'verb' },
      { word: 'überlegen', meaning_vi: 'suy nghĩ', pos: 'verb' },
      { word: 'nachdenken', meaning_vi: 'suy nghĩ kỹ', pos: 'verb' },
      { word: 'vermuten', meaning_vi: 'đoán', pos: 'verb' },
      { word: 'annehmen', meaning_vi: 'giả định', pos: 'verb' },
      { word: 'zweifeln', meaning_vi: 'nghi ngờ', pos: 'verb' },
    ]
  },

  // Social Relations
  social_relations: {
    level: 'A2',
    words: [
      { word: 'Familie', meaning_vi: 'gia đình', pos: 'noun' },
      { word: 'Eltern', meaning_vi: 'cha mẹ', pos: 'noun' },
      { word: 'Vater', meaning_vi: 'cha', pos: 'noun' },
      { word: 'Mutter', meaning_vi: 'mẹ', pos: 'noun' },
      { word: 'Kind', meaning_vi: 'con', pos: 'noun' },
      { word: 'Sohn', meaning_vi: 'con trai', pos: 'noun' },
      { word: 'Tochter', meaning_vi: 'con gái', pos: 'noun' },
      { word: 'Bruder', meaning_vi: 'anh/em trai', pos: 'noun' },
      { word: 'Schwester', meaning_vi: 'chị/em gái', pos: 'noun' },
      { word: 'Großvater', meaning_vi: 'ông', pos: 'noun' },
      { word: 'Großmutter', meaning_vi: 'bà', pos: 'noun' },
      { word: 'Onkel', meaning_vi: 'chú, bác', pos: 'noun' },
      { word: 'Tante', meaning_vi: 'cô, dì', pos: 'noun' },
      { word: 'Cousin', meaning_vi: 'anh/em họ (nam)', pos: 'noun' },
      { word: 'Cousine', meaning_vi: 'chị/em họ (nữ)', pos: 'noun' },
      { word: 'Neffe', meaning_vi: 'cháu trai', pos: 'noun' },
      { word: 'Nichte', meaning_vi: 'cháu gái', pos: 'noun' },
      { word: 'Schwiegervater', meaning_vi: 'bố chồng/vợ', pos: 'noun' },
      { word: 'Schwiegermutter', meaning_vi: 'mẹ chồng/vợ', pos: 'noun' },
      { word: 'Freund', meaning_vi: 'bạn (nam)', pos: 'noun' },
      { word: 'Freundin', meaning_vi: 'bạn (nữ)', pos: 'noun' },
      { word: 'Nachbar', meaning_vi: 'hàng xóm', pos: 'noun' },
      { word: 'Partner', meaning_vi: 'bạn đời', pos: 'noun' },
      { word: 'Ehemann', meaning_vi: 'chồng', pos: 'noun' },
      { word: 'Ehefrau', meaning_vi: 'vợ', pos: 'noun' },
    ]
  },

  // Personal Adjectives
  personal_adjectives: {
    level: 'A2',
    words: [
      { word: 'jung', meaning_vi: 'trẻ', pos: 'adjective' },
      { word: 'alt', meaning_vi: 'già', pos: 'adjective' },
      { word: 'groß', meaning_vi: 'cao, lớn', pos: 'adjective' },
      { word: 'klein', meaning_vi: 'nhỏ', pos: 'adjective' },
      { word: 'dünn', meaning_vi: 'gầy', pos: 'adjective' },
      { word: 'dick', meaning_vi: 'béo', pos: 'adjective' },
      { word: 'schön', meaning_vi: 'đẹp', pos: 'adjective' },
      { word: 'hübsch', meaning_vi: 'xinh', pos: 'adjective' },
      { word: 'hässlich', meaning_vi: 'xấu', pos: 'adjective' },
      { word: 'stark', meaning_vi: 'khỏe', pos: 'adjective' },
      { word: 'schwach', meaning_vi: 'yếu', pos: 'adjective' },
      { word: 'gesund', meaning_vi: 'khỏe mạnh', pos: 'adjective' },
      { word: 'krank', meaning_vi: 'ốm', pos: 'adjective' },
      { word: 'müde', meaning_vi: 'mệt', pos: 'adjective' },
      { word: 'wach', meaning_vi: 'tỉnh táo', pos: 'adjective' },
      { word: 'hungrig', meaning_vi: 'đói', pos: 'adjective' },
      { word: 'durstig', meaning_vi: 'khát', pos: 'adjective' },
      { word: 'satt', meaning_vi: 'no', pos: 'adjective' },
      { word: 'verheiratet', meaning_vi: 'đã kết hôn', pos: 'adjective' },
      { word: 'ledig', meaning_vi: 'độc thân', pos: 'adjective' },
      { word: 'geschieden', meaning_vi: 'đã ly hôn', pos: 'adjective' },
      { word: 'verwitwet', meaning_vi: 'góa', pos: 'adjective' },
      { word: 'schwanger', meaning_vi: 'có thai', pos: 'adjective' },
      { word: 'blind', meaning_vi: 'mù', pos: 'adjective' },
      { word: 'taub', meaning_vi: 'điếc', pos: 'adjective' },
    ]
  },

  // Personality Adjectives
  personality_adjectives: {
    level: 'A2',
    words: [
      { word: 'freundlich', meaning_vi: 'thân thiện', pos: 'adjective' },
      { word: 'unfreundlich', meaning_vi: 'không thân thiện', pos: 'adjective' },
      { word: 'nett', meaning_vi: 'dễ thương', pos: 'adjective' },
      { word: 'höflich', meaning_vi: 'lịch sự', pos: 'adjective' },
      { word: 'unhöflich', meaning_vi: 'bất lịch sự', pos: 'adjective' },
      { word: 'ehrlich', meaning_vi: 'trung thực', pos: 'adjective' },
      { word: 'lustig', meaning_vi: 'vui vẻ', pos: 'adjective' },
      { word: 'ernst', meaning_vi: 'nghiêm túc', pos: 'adjective' },
      { word: 'ruhig', meaning_vi: 'bình tĩnh', pos: 'adjective' },
      { word: 'nervös', meaning_vi: 'lo lắng', pos: 'adjective' },
      { word: 'schüchtern', meaning_vi: 'nhút nhát', pos: 'adjective' },
      { word: 'mutig', meaning_vi: 'dũng cảm', pos: 'adjective' },
      { word: 'faul', meaning_vi: 'lười', pos: 'adjective' },
      { word: 'fleißig', meaning_vi: 'chăm chỉ', pos: 'adjective' },
      { word: 'klug', meaning_vi: 'thông minh', pos: 'adjective' },
      { word: 'dumm', meaning_vi: 'ngu', pos: 'adjective' },
      { word: 'geduldig', meaning_vi: 'kiên nhẫn', pos: 'adjective' },
      { word: 'ungeduldig', meaning_vi: 'thiếu kiên nhẫn', pos: 'adjective' },
      { word: 'neugierig', meaning_vi: 'tò mò', pos: 'adjective' },
      { word: 'langweilig', meaning_vi: 'nhàm chán', pos: 'adjective' },
      { word: 'interessant', meaning_vi: 'thú vị', pos: 'adjective' },
      { word: 'seltsam', meaning_vi: 'kỳ lạ', pos: 'adjective' },
      { word: 'verrückt', meaning_vi: 'điên', pos: 'adjective' },
      { word: 'stolz', meaning_vi: 'tự hào', pos: 'adjective' },
      { word: 'bescheiden', meaning_vi: 'khiêm tốn', pos: 'adjective' },
    ]
  },

  // Common Expressions
  common_expressions: {
    level: 'A1',
    words: [
      { word: 'Hallo', meaning_vi: 'xin chào', pos: 'interjection' },
      { word: 'Guten Morgen', meaning_vi: 'chào buổi sáng', pos: 'interjection' },
      { word: 'Guten Tag', meaning_vi: 'chào buổi trưa', pos: 'interjection' },
      { word: 'Guten Abend', meaning_vi: 'chào buổi tối', pos: 'interjection' },
      { word: 'Gute Nacht', meaning_vi: 'chúc ngủ ngon', pos: 'interjection' },
      { word: 'Tschüss', meaning_vi: 'tạm biệt', pos: 'interjection' },
      { word: 'Auf Wiedersehen', meaning_vi: 'tạm biệt', pos: 'interjection' },
      { word: 'Danke', meaning_vi: 'cảm ơn', pos: 'interjection' },
      { word: 'Bitte', meaning_vi: 'xin mời/không có gì', pos: 'interjection' },
      { word: 'Entschuldigung', meaning_vi: 'xin lỗi', pos: 'interjection' },
      { word: 'Ja', meaning_vi: 'vâng', pos: 'interjection' },
      { word: 'Nein', meaning_vi: 'không', pos: 'interjection' },
      { word: 'Vielleicht', meaning_vi: 'có lẽ', pos: 'adverb' },
      { word: 'Genau', meaning_vi: 'chính xác', pos: 'adverb' },
      { word: 'Natürlich', meaning_vi: 'tất nhiên', pos: 'adverb' },
      { word: 'Herzlichen Glückwunsch', meaning_vi: 'chúc mừng', pos: 'interjection' },
      { word: 'Alles Gute', meaning_vi: 'mọi điều tốt đẹp', pos: 'interjection' },
      { word: 'Prost', meaning_vi: 'chúc sức khỏe', pos: 'interjection' },
      { word: 'Guten Appetit', meaning_vi: 'chúc ngon miệng', pos: 'interjection' },
      { word: 'Willkommen', meaning_vi: 'chào mừng', pos: 'interjection' },
    ]
  },

  // Office & Work Objects
  office_objects: {
    level: 'A2',
    words: [
      { word: 'Büro', meaning_vi: 'văn phòng', pos: 'noun' },
      { word: 'Schreibtisch', meaning_vi: 'bàn làm việc', pos: 'noun' },
      { word: 'Computer', meaning_vi: 'máy tính', pos: 'noun' },
      { word: 'Drucker', meaning_vi: 'máy in', pos: 'noun' },
      { word: 'Telefon', meaning_vi: 'điện thoại', pos: 'noun' },
      { word: 'Kopierer', meaning_vi: 'máy photocopy', pos: 'noun' },
      { word: 'Ordner', meaning_vi: 'bìa hồ sơ', pos: 'noun' },
      { word: 'Akte', meaning_vi: 'hồ sơ', pos: 'noun' },
      { word: 'Dokument', meaning_vi: 'tài liệu', pos: 'noun' },
      { word: 'Brief', meaning_vi: 'thư', pos: 'noun' },
      { word: 'Umschlag', meaning_vi: 'phong bì', pos: 'noun' },
      { word: 'Briefmarke', meaning_vi: 'tem', pos: 'noun' },
      { word: 'Stift', meaning_vi: 'bút', pos: 'noun' },
      { word: 'Kugelschreiber', meaning_vi: 'bút bi', pos: 'noun' },
      { word: 'Bleistift', meaning_vi: 'bút chì', pos: 'noun' },
      { word: 'Radiergummi', meaning_vi: 'tẩy', pos: 'noun' },
      { word: 'Lineal', meaning_vi: 'thước kẻ', pos: 'noun' },
      { word: 'Schere', meaning_vi: 'kéo', pos: 'noun' },
      { word: 'Klebeband', meaning_vi: 'băng keo', pos: 'noun' },
      { word: 'Hefter', meaning_vi: 'dập ghim', pos: 'noun' },
      { word: 'Notizblock', meaning_vi: 'sổ ghi chép', pos: 'noun' },
      { word: 'Kalender', meaning_vi: 'lịch', pos: 'noun' },
      { word: 'Taschenrechner', meaning_vi: 'máy tính bỏ túi', pos: 'noun' },
      { word: 'Locher', meaning_vi: 'máy đục lỗ', pos: 'noun' },
      { word: 'Büroklammer', meaning_vi: 'kẹp giấy', pos: 'noun' },
    ]
  },

  // Transportation Extended
  transportation: {
    level: 'A2',
    words: [
      { word: 'Verkehr', meaning_vi: 'giao thông', pos: 'noun' },
      { word: 'Auto', meaning_vi: 'ô tô', pos: 'noun' },
      { word: 'Wagen', meaning_vi: 'xe', pos: 'noun' },
      { word: 'Bus', meaning_vi: 'xe buýt', pos: 'noun' },
      { word: 'Zug', meaning_vi: 'tàu hỏa', pos: 'noun' },
      { word: 'Bahn', meaning_vi: 'tàu', pos: 'noun' },
      { word: 'U-Bahn', meaning_vi: 'tàu điện ngầm', pos: 'noun' },
      { word: 'Straßenbahn', meaning_vi: 'xe điện', pos: 'noun' },
      { word: 'Fahrrad', meaning_vi: 'xe đạp', pos: 'noun' },
      { word: 'Motorrad', meaning_vi: 'xe máy', pos: 'noun' },
      { word: 'Flugzeug', meaning_vi: 'máy bay', pos: 'noun' },
      { word: 'Schiff', meaning_vi: 'tàu thủy', pos: 'noun' },
      { word: 'Boot', meaning_vi: 'thuyền', pos: 'noun' },
      { word: 'Taxi', meaning_vi: 'taxi', pos: 'noun' },
      { word: 'Lastwagen', meaning_vi: 'xe tải', pos: 'noun' },
      { word: 'Krankenwagen', meaning_vi: 'xe cứu thương', pos: 'noun' },
      { word: 'Feuerwehrauto', meaning_vi: 'xe cứu hỏa', pos: 'noun' },
      { word: 'Polizeiauto', meaning_vi: 'xe cảnh sát', pos: 'noun' },
      { word: 'Fahrkarte', meaning_vi: 'vé', pos: 'noun' },
      { word: 'Fahrplan', meaning_vi: 'lịch trình', pos: 'noun' },
      { word: 'Haltestelle', meaning_vi: 'trạm dừng', pos: 'noun' },
      { word: 'Bahnhof', meaning_vi: 'ga tàu', pos: 'noun' },
      { word: 'Flughafen', meaning_vi: 'sân bay', pos: 'noun' },
      { word: 'Hafen', meaning_vi: 'cảng', pos: 'noun' },
      { word: 'Parkplatz', meaning_vi: 'bãi đỗ xe', pos: 'noun' },
    ]
  },

  // Emotions Extended
  emotions: {
    level: 'A2',
    words: [
      { word: 'glücklich', meaning_vi: 'hạnh phúc', pos: 'adjective' },
      { word: 'traurig', meaning_vi: 'buồn', pos: 'adjective' },
      { word: 'wütend', meaning_vi: 'tức giận', pos: 'adjective' },
      { word: 'ängstlich', meaning_vi: 'lo sợ', pos: 'adjective' },
      { word: 'zufrieden', meaning_vi: 'hài lòng', pos: 'adjective' },
      { word: 'unzufrieden', meaning_vi: 'không hài lòng', pos: 'adjective' },
      { word: 'aufgeregt', meaning_vi: 'hào hứng', pos: 'adjective' },
      { word: 'entspannt', meaning_vi: 'thoải mái', pos: 'adjective' },
      { word: 'gestresst', meaning_vi: 'căng thẳng', pos: 'adjective' },
      { word: 'besorgt', meaning_vi: 'lo lắng', pos: 'adjective' },
      { word: 'enttäuscht', meaning_vi: 'thất vọng', pos: 'adjective' },
      { word: 'überrascht', meaning_vi: 'ngạc nhiên', pos: 'adjective' },
      { word: 'erschrocken', meaning_vi: 'sợ hãi', pos: 'adjective' },
      { word: 'verwirrt', meaning_vi: 'bối rối', pos: 'adjective' },
      { word: 'gelangweilt', meaning_vi: 'chán', pos: 'adjective' },
      { word: 'verliebt', meaning_vi: 'yêu', pos: 'adjective' },
      { word: 'eifersüchtig', meaning_vi: 'ghen tị', pos: 'adjective' },
      { word: 'neidisch', meaning_vi: 'đố kỵ', pos: 'adjective' },
      { word: 'dankbar', meaning_vi: 'biết ơn', pos: 'adjective' },
      { word: 'hoffnungsvoll', meaning_vi: 'hy vọng', pos: 'adjective' },
    ]
  },
};

// Generate vocabulary
function generateVocabulary() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║    📚 MINE VOCABULARY BATCH 4 - ESSENTIAL WORDS            ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const allWords = [];

  for (const [topicName, topicData] of Object.entries(TOPICS)) {
    for (const word of topicData.words) {
      allWords.push({
        ...word,
        level: word.level || topicData.level,
        topic: topicName
      });
    }
  }

  // Count by level
  const levelCounts = {};
  for (const word of allWords) {
    levelCounts[word.level] = (levelCounts[word.level] || 0) + 1;
  }

  console.log(`📊 Topics: ${Object.keys(TOPICS).length}`);
  console.log(`📊 Total words: ${allWords.length}`);
  console.log('\n📈 By Level:');
  Object.entries(levelCounts).sort().forEach(([level, count]) => {
    console.log(`   ${level}: ${count} words`);
  });

  fs.writeFileSync(OUTPUT, JSON.stringify(allWords, null, 2));
  console.log(`\n💾 Saved to: ${OUTPUT}`);
}

generateVocabulary();
