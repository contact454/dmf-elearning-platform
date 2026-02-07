#!/usr/bin/env node
/**
 * Mine Vocabulary Batch 19 - Final push to 10K+
 * Target: 500 unique words
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TOPICS = {
  // Cooking methods
  cookingMethods: {
    topic: 'Phuong phap nau an',
    level: 'A2',
    words: [
      { word: 'kochen', pos: 'verb', meaning_vi: 'nấu' },
      { word: 'braten', pos: 'verb', meaning_vi: 'chiên' },
      { word: 'grillen', pos: 'verb', meaning_vi: 'nướng' },
      { word: 'backen', pos: 'verb', meaning_vi: 'nướng lò' },
      { word: 'dämpfen', pos: 'verb', meaning_vi: 'hấp' },
      { word: 'frittieren', pos: 'verb', meaning_vi: 'chiên ngập dầu' },
      { word: 'schmoren', pos: 'verb', meaning_vi: 'kho' },
      { word: 'dünsten', pos: 'verb', meaning_vi: 'om' },
      { word: 'rösten', pos: 'verb', meaning_vi: 'rang' },
      { word: 'pochieren', pos: 'verb', meaning_vi: 'luộc nhẹ' },
      { word: 'marinieren', pos: 'verb', meaning_vi: 'ướp' },
      { word: 'würzen', pos: 'verb', meaning_vi: 'nêm gia vị' },
      { word: 'schneiden', pos: 'verb', meaning_vi: 'cắt' },
      { word: 'hacken', pos: 'verb', meaning_vi: 'băm' },
      { word: 'rühren', pos: 'verb', meaning_vi: 'khuấy' },
      { word: 'mischen', pos: 'verb', meaning_vi: 'trộn' },
      { word: 'schälen', pos: 'verb', meaning_vi: 'gọt vỏ' },
      { word: 'reiben', pos: 'verb', meaning_vi: 'bào' },
      { word: 'pressen', pos: 'verb', meaning_vi: 'ép' },
      { word: 'pürieren', pos: 'verb', meaning_vi: 'xay nhuyễn' },
    ]
  },
  // Spices and seasonings
  spices: {
    topic: 'Gia vi',
    level: 'A2',
    words: [
      { word: 'das Salz', pos: 'noun', meaning_vi: 'muối' },
      { word: 'der Pfeffer', pos: 'noun', meaning_vi: 'tiêu' },
      { word: 'der Zucker', pos: 'noun', meaning_vi: 'đường' },
      { word: 'das Öl', pos: 'noun', meaning_vi: 'dầu' },
      { word: 'der Essig', pos: 'noun', meaning_vi: 'giấm' },
      { word: 'die Soße', pos: 'noun', meaning_vi: 'nước sốt' },
      { word: 'der Senf', pos: 'noun', meaning_vi: 'mù tạt' },
      { word: 'der Ketchup', pos: 'noun', meaning_vi: 'tương cà' },
      { word: 'die Mayonnaise', pos: 'noun', meaning_vi: 'mayonnaise' },
      { word: 'der Zimt', pos: 'noun', meaning_vi: 'quế' },
      { word: 'der Ingwer', pos: 'noun', meaning_vi: 'gừng' },
      { word: 'der Knoblauch', pos: 'noun', meaning_vi: 'tỏi' },
      { word: 'die Zwiebel', pos: 'noun', meaning_vi: 'hành' },
      { word: 'das Basilikum', pos: 'noun', meaning_vi: 'húng quế' },
      { word: 'die Petersilie', pos: 'noun', meaning_vi: 'mùi tây' },
      { word: 'der Oregano', pos: 'noun', meaning_vi: 'oregano' },
      { word: 'der Thymian', pos: 'noun', meaning_vi: 'húng tây' },
      { word: 'der Rosmarin', pos: 'noun', meaning_vi: 'hương thảo' },
      { word: 'der Koriander', pos: 'noun', meaning_vi: 'ngò' },
      { word: 'die Muskatnuss', pos: 'noun', meaning_vi: 'nhục đậu khấu' },
    ]
  },
  // Media and news
  mediaNews: {
    topic: 'Truyen thong',
    level: 'B1',
    words: [
      { word: 'die Zeitung', pos: 'noun', meaning_vi: 'báo' },
      { word: 'die Zeitschrift', pos: 'noun', meaning_vi: 'tạp chí' },
      { word: 'die Nachrichten', pos: 'noun', meaning_vi: 'tin tức' },
      { word: 'der Artikel', pos: 'noun', meaning_vi: 'bài báo' },
      { word: 'die Schlagzeile', pos: 'noun', meaning_vi: 'tiêu đề' },
      { word: 'der Reporter', pos: 'noun', meaning_vi: 'phóng viên' },
      { word: 'das Interview', pos: 'noun', meaning_vi: 'cuộc phỏng vấn' },
      { word: 'die Sendung', pos: 'noun', meaning_vi: 'chương trình' },
      { word: 'das Radio', pos: 'noun', meaning_vi: 'đài radio' },
      { word: 'der Sender', pos: 'noun', meaning_vi: 'kênh' },
      { word: 'die Werbung', pos: 'noun', meaning_vi: 'quảng cáo' },
      { word: 'die Anzeige', pos: 'noun', meaning_vi: 'mẩu tin' },
      { word: 'die Presse', pos: 'noun', meaning_vi: 'báo chí' },
      { word: 'die Redaktion', pos: 'noun', meaning_vi: 'tòa soạn' },
      { word: 'der Chefredakteur', pos: 'noun', meaning_vi: 'tổng biên tập' },
      { word: 'die Kolumne', pos: 'noun', meaning_vi: 'chuyên mục' },
      { word: 'das Abonnement', pos: 'noun', meaning_vi: 'đăng ký' },
      { word: 'die Talkshow', pos: 'noun', meaning_vi: 'talk show' },
      { word: 'die Dokumentation', pos: 'noun', meaning_vi: 'phim tài liệu' },
      { word: 'die Serie', pos: 'noun', meaning_vi: 'phim bộ' },
    ]
  },
  // Religion
  religion: {
    topic: 'Ton giao',
    level: 'B1',
    words: [
      { word: 'die Religion', pos: 'noun', meaning_vi: 'tôn giáo' },
      { word: 'der Glaube', pos: 'noun', meaning_vi: 'đức tin' },
      { word: 'der Gott', pos: 'noun', meaning_vi: 'Chúa/thần' },
      { word: 'die Kirche', pos: 'noun', meaning_vi: 'nhà thờ' },
      { word: 'die Moschee', pos: 'noun', meaning_vi: 'nhà thờ Hồi giáo' },
      { word: 'die Synagoge', pos: 'noun', meaning_vi: 'nhà thờ Do Thái' },
      { word: 'der Tempel', pos: 'noun', meaning_vi: 'đền' },
      { word: 'das Gebet', pos: 'noun', meaning_vi: 'lời cầu nguyện' },
      { word: 'der Priester', pos: 'noun', meaning_vi: 'linh mục' },
      { word: 'der Pfarrer', pos: 'noun', meaning_vi: 'mục sư' },
      { word: 'der Imam', pos: 'noun', meaning_vi: 'imam' },
      { word: 'der Rabbiner', pos: 'noun', meaning_vi: 'giáo sĩ Do Thái' },
      { word: 'der Mönch', pos: 'noun', meaning_vi: 'tu sĩ' },
      { word: 'die Nonne', pos: 'noun', meaning_vi: 'nữ tu' },
      { word: 'die Bibel', pos: 'noun', meaning_vi: 'Kinh Thánh' },
      { word: 'der Koran', pos: 'noun', meaning_vi: 'Kinh Koran' },
      { word: 'die Taufe', pos: 'noun', meaning_vi: 'lễ rửa tội' },
      { word: 'die Hochzeit', pos: 'noun', meaning_vi: 'lễ cưới' },
      { word: 'die Beerdigung', pos: 'noun', meaning_vi: 'đám tang' },
      { word: 'das Ostern', pos: 'noun', meaning_vi: 'Lễ Phục Sinh' },
    ]
  },
  // Gardening
  gardening: {
    topic: 'Lam vuon',
    level: 'A2',
    words: [
      { word: 'der Garten', pos: 'noun', meaning_vi: 'vườn' },
      { word: 'die Pflanze', pos: 'noun', meaning_vi: 'cây' },
      { word: 'die Blume', pos: 'noun', meaning_vi: 'hoa' },
      { word: 'der Baum', pos: 'noun', meaning_vi: 'cây to' },
      { word: 'der Rasen', pos: 'noun', meaning_vi: 'bãi cỏ' },
      { word: 'das Beet', pos: 'noun', meaning_vi: 'luống hoa' },
      { word: 'der Zaun', pos: 'noun', meaning_vi: 'hàng rào' },
      { word: 'die Hecke', pos: 'noun', meaning_vi: 'hàng rào cây' },
      { word: 'der Teich', pos: 'noun', meaning_vi: 'ao' },
      { word: 'der Weg', pos: 'noun', meaning_vi: 'lối đi' },
      { word: 'die Gießkanne', pos: 'noun', meaning_vi: 'bình tưới' },
      { word: 'die Schaufel', pos: 'noun', meaning_vi: 'xẻng' },
      { word: 'die Harke', pos: 'noun', meaning_vi: 'cào' },
      { word: 'die Schere', pos: 'noun', meaning_vi: 'kéo cắt cây' },
      { word: 'der Rasenmäher', pos: 'noun', meaning_vi: 'máy cắt cỏ' },
      { word: 'pflanzen', pos: 'verb', meaning_vi: 'trồng' },
      { word: 'gießen', pos: 'verb', meaning_vi: 'tưới' },
      { word: 'jäten', pos: 'verb', meaning_vi: 'nhổ cỏ' },
      { word: 'ernten', pos: 'verb', meaning_vi: 'thu hoạch' },
      { word: 'düngen', pos: 'verb', meaning_vi: 'bón phân' },
    ]
  },
  // Measurements
  measurements: {
    topic: 'Don vi do luong',
    level: 'A2',
    words: [
      { word: 'der Meter', pos: 'noun', meaning_vi: 'mét' },
      { word: 'der Kilometer', pos: 'noun', meaning_vi: 'km' },
      { word: 'der Zentimeter', pos: 'noun', meaning_vi: 'cm' },
      { word: 'der Millimeter', pos: 'noun', meaning_vi: 'mm' },
      { word: 'das Kilogramm', pos: 'noun', meaning_vi: 'kg' },
      { word: 'das Gramm', pos: 'noun', meaning_vi: 'gram' },
      { word: 'der Liter', pos: 'noun', meaning_vi: 'lít' },
      { word: 'der Milliliter', pos: 'noun', meaning_vi: 'ml' },
      { word: 'die Stunde', pos: 'noun', meaning_vi: 'giờ' },
      { word: 'die Minute', pos: 'noun', meaning_vi: 'phút' },
      { word: 'die Sekunde', pos: 'noun', meaning_vi: 'giây' },
      { word: 'das Prozent', pos: 'noun', meaning_vi: 'phần trăm' },
      { word: 'der Quadratmeter', pos: 'noun', meaning_vi: 'mét vuông' },
      { word: 'der Kubikmeter', pos: 'noun', meaning_vi: 'mét khối' },
      { word: 'das Dutzend', pos: 'noun', meaning_vi: 'tá (12)' },
      { word: 'das Paar', pos: 'noun', meaning_vi: 'đôi' },
      { word: 'die Portion', pos: 'noun', meaning_vi: 'khẩu phần' },
      { word: 'die Scheibe', pos: 'noun', meaning_vi: 'lát' },
      { word: 'das Stück', pos: 'noun', meaning_vi: 'miếng' },
      { word: 'die Tasse', pos: 'noun', meaning_vi: 'tách' },
    ]
  },
  // Tools
  tools: {
    topic: 'Dung cu',
    level: 'A2',
    words: [
      { word: 'der Hammer', pos: 'noun', meaning_vi: 'búa' },
      { word: 'die Säge', pos: 'noun', meaning_vi: 'cưa' },
      { word: 'der Schraubenzieher', pos: 'noun', meaning_vi: 'tua vít' },
      { word: 'die Zange', pos: 'noun', meaning_vi: 'kìm' },
      { word: 'der Schraubenschlüssel', pos: 'noun', meaning_vi: 'cờ lê' },
      { word: 'die Bohrmaschine', pos: 'noun', meaning_vi: 'máy khoan' },
      { word: 'der Nagel', pos: 'noun', meaning_vi: 'đinh' },
      { word: 'die Schraube', pos: 'noun', meaning_vi: 'ốc vít' },
      { word: 'die Leiter', pos: 'noun', meaning_vi: 'thang' },
      { word: 'das Maßband', pos: 'noun', meaning_vi: 'thước dây' },
      { word: 'die Wasserwaage', pos: 'noun', meaning_vi: 'thước thủy' },
      { word: 'der Pinsel', pos: 'noun', meaning_vi: 'cọ sơn' },
      { word: 'die Farbe', pos: 'noun', meaning_vi: 'sơn' },
      { word: 'der Kleber', pos: 'noun', meaning_vi: 'keo dán' },
      { word: 'das Klebeband', pos: 'noun', meaning_vi: 'băng dính' },
      { word: 'das Schleifpapier', pos: 'noun', meaning_vi: 'giấy nhám' },
      { word: 'die Feile', pos: 'noun', meaning_vi: 'dũa' },
      { word: 'die Taschenlampe', pos: 'noun', meaning_vi: 'đèn pin' },
      { word: 'der Werkzeugkasten', pos: 'noun', meaning_vi: 'hộp đồ nghề' },
      { word: 'die Handschuhe', pos: 'noun', meaning_vi: 'găng tay' },
    ]
  },
  // Bathroom items
  bathroom: {
    topic: 'Phong tam',
    level: 'A2',
    words: [
      { word: 'die Dusche', pos: 'noun', meaning_vi: 'vòi sen' },
      { word: 'die Badewanne', pos: 'noun', meaning_vi: 'bồn tắm' },
      { word: 'die Toilette', pos: 'noun', meaning_vi: 'bồn cầu' },
      { word: 'das Waschbecken', pos: 'noun', meaning_vi: 'bồn rửa mặt' },
      { word: 'der Spiegel', pos: 'noun', meaning_vi: 'gương' },
      { word: 'das Handtuch', pos: 'noun', meaning_vi: 'khăn tắm' },
      { word: 'die Seife', pos: 'noun', meaning_vi: 'xà phòng' },
      { word: 'das Shampoo', pos: 'noun', meaning_vi: 'dầu gội' },
      { word: 'die Spülung', pos: 'noun', meaning_vi: 'dầu xả' },
      { word: 'das Duschgel', pos: 'noun', meaning_vi: 'sữa tắm' },
      { word: 'die Zahnbürste', pos: 'noun', meaning_vi: 'bàn chải đánh răng' },
      { word: 'die Zahnpasta', pos: 'noun', meaning_vi: 'kem đánh răng' },
      { word: 'der Rasierer', pos: 'noun', meaning_vi: 'dao cạo râu' },
      { word: 'der Fön', pos: 'noun', meaning_vi: 'máy sấy tóc' },
      { word: 'der Kamm', pos: 'noun', meaning_vi: 'lược' },
      { word: 'die Bürste', pos: 'noun', meaning_vi: 'bàn chải' },
      { word: 'die Creme', pos: 'noun', meaning_vi: 'kem dưỡng' },
      { word: 'das Deodorant', pos: 'noun', meaning_vi: 'lăn khử mùi' },
      { word: 'das Parfüm', pos: 'noun', meaning_vi: 'nước hoa' },
      { word: 'das Toilettenpapier', pos: 'noun', meaning_vi: 'giấy vệ sinh' },
    ]
  },
  // Cleaning
  cleaning: {
    topic: 'Don dep',
    level: 'A2',
    words: [
      { word: 'putzen', pos: 'verb', meaning_vi: 'lau chùi' },
      { word: 'waschen', pos: 'verb', meaning_vi: 'giặt' },
      { word: 'bügeln', pos: 'verb', meaning_vi: 'ủi đồ' },
      { word: 'staubsaugen', pos: 'verb', meaning_vi: 'hút bụi' },
      { word: 'wischen', pos: 'verb', meaning_vi: 'lau' },
      { word: 'fegen', pos: 'verb', meaning_vi: 'quét' },
      { word: 'abwaschen', pos: 'verb', meaning_vi: 'rửa bát' },
      { word: 'aufräumen', pos: 'verb', meaning_vi: 'dọn dẹp' },
      { word: 'ordnen', pos: 'verb', meaning_vi: 'sắp xếp' },
      { word: 'der Besen', pos: 'noun', meaning_vi: 'chổi' },
      { word: 'der Wischmop', pos: 'noun', meaning_vi: 'cây lau nhà' },
      { word: 'der Staubsauger', pos: 'noun', meaning_vi: 'máy hút bụi' },
      { word: 'das Reinigungsmittel', pos: 'noun', meaning_vi: 'chất tẩy rửa' },
      { word: 'der Schwamm', pos: 'noun', meaning_vi: 'bọt biển' },
      { word: 'der Lappen', pos: 'noun', meaning_vi: 'giẻ lau' },
      { word: 'die Waschmaschine', pos: 'noun', meaning_vi: 'máy giặt' },
      { word: 'der Trockner', pos: 'noun', meaning_vi: 'máy sấy' },
      { word: 'das Waschmittel', pos: 'noun', meaning_vi: 'bột giặt' },
      { word: 'das Bügeleisen', pos: 'noun', meaning_vi: 'bàn ủi' },
      { word: 'der Müllbeutel', pos: 'noun', meaning_vi: 'túi đựng rác' },
    ]
  },
  // Mathematical terms
  mathTerms: {
    topic: 'Thuat ngu toan hoc',
    level: 'B1',
    words: [
      { word: 'addieren', pos: 'verb', meaning_vi: 'cộng' },
      { word: 'subtrahieren', pos: 'verb', meaning_vi: 'trừ' },
      { word: 'multiplizieren', pos: 'verb', meaning_vi: 'nhân' },
      { word: 'dividieren', pos: 'verb', meaning_vi: 'chia' },
      { word: 'die Addition', pos: 'noun', meaning_vi: 'phép cộng' },
      { word: 'die Subtraktion', pos: 'noun', meaning_vi: 'phép trừ' },
      { word: 'die Multiplikation', pos: 'noun', meaning_vi: 'phép nhân' },
      { word: 'die Division', pos: 'noun', meaning_vi: 'phép chia' },
      { word: 'die Summe', pos: 'noun', meaning_vi: 'tổng' },
      { word: 'die Differenz', pos: 'noun', meaning_vi: 'hiệu' },
      { word: 'das Produkt', pos: 'noun', meaning_vi: 'tích' },
      { word: 'der Quotient', pos: 'noun', meaning_vi: 'thương' },
      { word: 'die Gleichung', pos: 'noun', meaning_vi: 'phương trình' },
      { word: 'die Formel', pos: 'noun', meaning_vi: 'công thức' },
      { word: 'der Bruch', pos: 'noun', meaning_vi: 'phân số' },
      { word: 'die Dezimalzahl', pos: 'noun', meaning_vi: 'số thập phân' },
      { word: 'die Potenz', pos: 'noun', meaning_vi: 'lũy thừa' },
      { word: 'die Wurzel', pos: 'noun', meaning_vi: 'căn' },
      { word: 'der Durchschnitt', pos: 'noun', meaning_vi: 'trung bình' },
      { word: 'der Prozentsatz', pos: 'noun', meaning_vi: 'tỷ lệ phần trăm' },
    ]
  },
  // Holidays
  holidays: {
    topic: 'Ngay le',
    level: 'A2',
    words: [
      { word: 'Weihnachten', pos: 'noun', meaning_vi: 'Giáng sinh' },
      { word: 'Ostern', pos: 'noun', meaning_vi: 'Lễ Phục sinh' },
      { word: 'Silvester', pos: 'noun', meaning_vi: 'Giao thừa' },
      { word: 'Neujahr', pos: 'noun', meaning_vi: 'Năm mới' },
      { word: 'der Geburtstag', pos: 'noun', meaning_vi: 'sinh nhật' },
      { word: 'der Valentinstag', pos: 'noun', meaning_vi: 'Lễ tình nhân' },
      { word: 'der Muttertag', pos: 'noun', meaning_vi: 'Ngày của mẹ' },
      { word: 'der Vatertag', pos: 'noun', meaning_vi: 'Ngày của cha' },
      { word: 'der Karneval', pos: 'noun', meaning_vi: 'lễ hội hóa trang' },
      { word: 'der Nationalfeiertag', pos: 'noun', meaning_vi: 'Quốc khánh' },
      { word: 'die Ferien', pos: 'noun', meaning_vi: 'kỳ nghỉ' },
      { word: 'der Urlaub', pos: 'noun', meaning_vi: 'kỳ nghỉ phép' },
      { word: 'der Feiertag', pos: 'noun', meaning_vi: 'ngày lễ' },
      { word: 'das Fest', pos: 'noun', meaning_vi: 'lễ hội' },
      { word: 'die Party', pos: 'noun', meaning_vi: 'tiệc' },
      { word: 'feiern', pos: 'verb', meaning_vi: 'ăn mừng' },
      { word: 'gratulieren', pos: 'verb', meaning_vi: 'chúc mừng' },
      { word: 'schenken', pos: 'verb', meaning_vi: 'tặng' },
      { word: 'das Geschenk', pos: 'noun', meaning_vi: 'quà' },
      { word: 'die Kerze', pos: 'noun', meaning_vi: 'nến' },
    ]
  },
  // Textures and surfaces
  textures: {
    topic: 'Ket cau be mat',
    level: 'B1',
    words: [
      { word: 'glatt', pos: 'adjective', meaning_vi: 'trơn' },
      { word: 'rau', pos: 'adjective', meaning_vi: 'nhám' },
      { word: 'weich', pos: 'adjective', meaning_vi: 'mềm' },
      { word: 'hart', pos: 'adjective', meaning_vi: 'cứng' },
      { word: 'flauschig', pos: 'adjective', meaning_vi: 'bông xù' },
      { word: 'klebrig', pos: 'adjective', meaning_vi: 'dính' },
      { word: 'rutschig', pos: 'adjective', meaning_vi: 'trơn trượt' },
      { word: 'stachelig', pos: 'adjective', meaning_vi: 'gai' },
      { word: 'samtig', pos: 'adjective', meaning_vi: 'nhung' },
      { word: 'seidig', pos: 'adjective', meaning_vi: 'lụa' },
      { word: 'pelzig', pos: 'adjective', meaning_vi: 'lông mịn' },
      { word: 'schuppig', pos: 'adjective', meaning_vi: 'có vảy' },
      { word: 'porös', pos: 'adjective', meaning_vi: 'xốp' },
      { word: 'spröde', pos: 'adjective', meaning_vi: 'giòn' },
      { word: 'elastisch', pos: 'adjective', meaning_vi: 'đàn hồi' },
      { word: 'biegsam', pos: 'adjective', meaning_vi: 'dẻo' },
      { word: 'starr', pos: 'adjective', meaning_vi: 'cứng nhắc' },
      { word: 'transparent', pos: 'adjective', meaning_vi: 'trong suốt' },
      { word: 'undurchsichtig', pos: 'adjective', meaning_vi: 'mờ đục' },
      { word: 'glänzend', pos: 'adjective', meaning_vi: 'bóng' },
    ]
  },
  // More verbs
  changeVerbs: {
    topic: 'Dong tu thay doi',
    level: 'B1',
    words: [
      { word: 'ändern', pos: 'verb', meaning_vi: 'thay đổi' },
      { word: 'verändern', pos: 'verb', meaning_vi: 'biến đổi' },
      { word: 'verbessern', pos: 'verb', meaning_vi: 'cải thiện' },
      { word: 'verschlechtern', pos: 'verb', meaning_vi: 'làm xấu đi' },
      { word: 'erweitern', pos: 'verb', meaning_vi: 'mở rộng' },
      { word: 'verkleinern', pos: 'verb', meaning_vi: 'thu nhỏ' },
      { word: 'erhöhen', pos: 'verb', meaning_vi: 'tăng' },
      { word: 'senken', pos: 'verb', meaning_vi: 'giảm' },
      { word: 'wachsen', pos: 'verb', meaning_vi: 'lớn lên' },
      { word: 'schrumpfen', pos: 'verb', meaning_vi: 'co lại' },
      { word: 'verwandeln', pos: 'verb', meaning_vi: 'biến hóa' },
      { word: 'anpassen', pos: 'verb', meaning_vi: 'điều chỉnh' },
      { word: 'korrigieren', pos: 'verb', meaning_vi: 'sửa' },
      { word: 'reparieren', pos: 'verb', meaning_vi: 'sửa chữa' },
      { word: 'erneuern', pos: 'verb', meaning_vi: 'làm mới' },
      { word: 'ersetzen', pos: 'verb', meaning_vi: 'thay thế' },
      { word: 'aktualisieren', pos: 'verb', meaning_vi: 'cập nhật' },
      { word: 'modifizieren', pos: 'verb', meaning_vi: 'chỉnh sửa' },
      { word: 'transformieren', pos: 'verb', meaning_vi: 'chuyển đổi' },
      { word: 'umwandeln', pos: 'verb', meaning_vi: 'chuyển hóa' },
    ]
  },
  // Comparative adjectives
  comparatives: {
    topic: 'So sanh',
    level: 'A2',
    words: [
      { word: 'besser', pos: 'adjective', meaning_vi: 'tốt hơn' },
      { word: 'schlechter', pos: 'adjective', meaning_vi: 'xấu hơn' },
      { word: 'größer', pos: 'adjective', meaning_vi: 'lớn hơn' },
      { word: 'kleiner', pos: 'adjective', meaning_vi: 'nhỏ hơn' },
      { word: 'schneller', pos: 'adjective', meaning_vi: 'nhanh hơn' },
      { word: 'langsamer', pos: 'adjective', meaning_vi: 'chậm hơn' },
      { word: 'mehr', pos: 'adjective', meaning_vi: 'nhiều hơn' },
      { word: 'weniger', pos: 'adjective', meaning_vi: 'ít hơn' },
      { word: 'höher', pos: 'adjective', meaning_vi: 'cao hơn' },
      { word: 'niedriger', pos: 'adjective', meaning_vi: 'thấp hơn' },
      { word: 'länger', pos: 'adjective', meaning_vi: 'dài hơn' },
      { word: 'kürzer', pos: 'adjective', meaning_vi: 'ngắn hơn' },
      { word: 'älter', pos: 'adjective', meaning_vi: 'già hơn' },
      { word: 'jünger', pos: 'adjective', meaning_vi: 'trẻ hơn' },
      { word: 'teurer', pos: 'adjective', meaning_vi: 'đắt hơn' },
      { word: 'billiger', pos: 'adjective', meaning_vi: 'rẻ hơn' },
      { word: 'schwerer', pos: 'adjective', meaning_vi: 'nặng hơn' },
      { word: 'leichter', pos: 'adjective', meaning_vi: 'nhẹ hơn' },
      { word: 'stärker', pos: 'adjective', meaning_vi: 'mạnh hơn' },
      { word: 'schwächer', pos: 'adjective', meaning_vi: 'yếu hơn' },
    ]
  },
  // More body actions
  bodyActions: {
    topic: 'Hanh dong co the',
    level: 'A2',
    words: [
      { word: 'atmen', pos: 'verb', meaning_vi: 'thở' },
      { word: 'husten', pos: 'verb', meaning_vi: 'ho' },
      { word: 'niesen', pos: 'verb', meaning_vi: 'hắt hơi' },
      { word: 'gähnen', pos: 'verb', meaning_vi: 'ngáp' },
      { word: 'blinzeln', pos: 'verb', meaning_vi: 'chớp mắt' },
      { word: 'schlucken', pos: 'verb', meaning_vi: 'nuốt' },
      { word: 'kauen', pos: 'verb', meaning_vi: 'nhai' },
      { word: 'schmecken', pos: 'verb', meaning_vi: 'nếm' },
      { word: 'riechen', pos: 'verb', meaning_vi: 'ngửi' },
      { word: 'fühlen', pos: 'verb', meaning_vi: 'cảm nhận' },
      { word: 'berühren', pos: 'verb', meaning_vi: 'chạm' },
      { word: 'greifen', pos: 'verb', meaning_vi: 'nắm lấy' },
      { word: 'kratzen', pos: 'verb', meaning_vi: 'gãi' },
      { word: 'zittern', pos: 'verb', meaning_vi: 'run rẩy' },
      { word: 'schwitzen', pos: 'verb', meaning_vi: 'đổ mồ hôi' },
      { word: 'frieren', pos: 'verb', meaning_vi: 'lạnh run' },
      { word: 'weinen', pos: 'verb', meaning_vi: 'khóc' },
      { word: 'lachen', pos: 'verb', meaning_vi: 'cười' },
      { word: 'lächeln', pos: 'verb', meaning_vi: 'mỉm cười' },
      { word: 'schnarchen', pos: 'verb', meaning_vi: 'ngáy' },
    ]
  },
};

// Generate vocabulary
function generateVocabulary() {
  const allWords = [];

  for (const [key, topicData] of Object.entries(TOPICS)) {
    for (const word of topicData.words) {
      allWords.push({
        word: word.word,
        level: topicData.level,
        topic: topicData.topic,
        pos: word.pos,
        meaning_vi: word.meaning_vi,
      });
    }
  }

  return allWords;
}

// Main
const vocabulary = generateVocabulary();
const outputPath = path.join(__dirname, '../data/quality-expansion/batch19-vocabulary.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(vocabulary, null, 2));

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║    📚 BATCH 19 VOCABULARY GENERATED                        ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');
console.log(`📊 Total words: ${vocabulary.length}`);

// Distribution
const dist = {};
for (const w of vocabulary) {
  dist[w.level] = (dist[w.level] || 0) + 1;
}
console.log('\n📈 Distribution:');
Object.entries(dist).sort().forEach(([level, count]) => {
  console.log(`   ${level}: ${count} words`);
});

console.log(`\n💾 Saved to: ${outputPath}`);
