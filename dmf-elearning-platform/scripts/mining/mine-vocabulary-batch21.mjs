#!/usr/bin/env node
/**
 * Batch 21 - Final 700 words to reach 10K+
 * Topics: Practical vocabulary for daily life and professional contexts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT = path.join(__dirname, '../data/quality-expansion/batch21-vocabulary.json');

const TOPICS = {
  // A1 - More basics (120 words)
  a1_clothing: {
    level: 'A1',
    words: [
      { word: 'das Hemd', pos: 'noun', meaning_vi: 'áo sơ mi' },
      { word: 'die Hose', pos: 'noun', meaning_vi: 'quần dài' },
      { word: 'das Kleid', pos: 'noun', meaning_vi: 'váy' },
      { word: 'der Rock', pos: 'noun', meaning_vi: 'chân váy' },
      { word: 'die Jacke', pos: 'noun', meaning_vi: 'áo khoác' },
      { word: 'der Mantel', pos: 'noun', meaning_vi: 'áo choàng' },
      { word: 'der Pullover', pos: 'noun', meaning_vi: 'áo len' },
      { word: 'das T-Shirt', pos: 'noun', meaning_vi: 'áo phông' },
      { word: 'die Schuhe', pos: 'noun', meaning_vi: 'giày' },
      { word: 'die Stiefel', pos: 'noun', meaning_vi: 'ủng' },
      { word: 'die Socken', pos: 'noun', meaning_vi: 'tất' },
      { word: 'die Mütze', pos: 'noun', meaning_vi: 'mũ len' },
      { word: 'der Hut', pos: 'noun', meaning_vi: 'mũ' },
      { word: 'der Schal', pos: 'noun', meaning_vi: 'khăn quàng' },
      { word: 'die Handschuhe', pos: 'noun', meaning_vi: 'găng tay' },
      { word: 'der Gürtel', pos: 'noun', meaning_vi: 'thắt lưng' },
      { word: 'die Krawatte', pos: 'noun', meaning_vi: 'cà vạt' },
      { word: 'die Brille', pos: 'noun', meaning_vi: 'kính' },
      { word: 'die Sonnenbrille', pos: 'noun', meaning_vi: 'kính râm' },
      { word: 'der Regenschirm', pos: 'noun', meaning_vi: 'ô dù' },
    ]
  },

  a1_places: {
    level: 'A1',
    words: [
      { word: 'die Stadt', pos: 'noun', meaning_vi: 'thành phố' },
      { word: 'das Dorf', pos: 'noun', meaning_vi: 'làng' },
      { word: 'die Straße', pos: 'noun', meaning_vi: 'đường phố' },
      { word: 'der Platz', pos: 'noun', meaning_vi: 'quảng trường' },
      { word: 'die Kirche', pos: 'noun', meaning_vi: 'nhà thờ' },
      { word: 'das Rathaus', pos: 'noun', meaning_vi: 'tòa thị chính' },
      { word: 'die Bibliothek', pos: 'noun', meaning_vi: 'thư viện' },
      { word: 'das Kino', pos: 'noun', meaning_vi: 'rạp chiếu phim' },
      { word: 'das Restaurant', pos: 'noun', meaning_vi: 'nhà hàng' },
      { word: 'das Café', pos: 'noun', meaning_vi: 'quán cà phê' },
      { word: 'die Bank', pos: 'noun', meaning_vi: 'ngân hàng' },
      { word: 'die Post', pos: 'noun', meaning_vi: 'bưu điện' },
      { word: 'die Polizei', pos: 'noun', meaning_vi: 'cảnh sát' },
      { word: 'das Krankenhaus', pos: 'noun', meaning_vi: 'bệnh viện' },
      { word: 'die Tankstelle', pos: 'noun', meaning_vi: 'trạm xăng' },
      { word: 'der Park', pos: 'noun', meaning_vi: 'công viên' },
      { word: 'der Spielplatz', pos: 'noun', meaning_vi: 'sân chơi' },
      { word: 'das Schwimmbad', pos: 'noun', meaning_vi: 'bể bơi' },
      { word: 'das Stadion', pos: 'noun', meaning_vi: 'sân vận động' },
      { word: 'der Friedhof', pos: 'noun', meaning_vi: 'nghĩa trang' },
    ]
  },

  a1_body: {
    level: 'A1',
    words: [
      { word: 'der Kopf', pos: 'noun', meaning_vi: 'đầu' },
      { word: 'das Haar', pos: 'noun', meaning_vi: 'tóc' },
      { word: 'das Gesicht', pos: 'noun', meaning_vi: 'khuôn mặt' },
      { word: 'das Auge', pos: 'noun', meaning_vi: 'mắt' },
      { word: 'die Nase', pos: 'noun', meaning_vi: 'mũi' },
      { word: 'der Mund', pos: 'noun', meaning_vi: 'miệng' },
      { word: 'das Ohr', pos: 'noun', meaning_vi: 'tai' },
      { word: 'der Hals', pos: 'noun', meaning_vi: 'cổ' },
      { word: 'die Schulter', pos: 'noun', meaning_vi: 'vai' },
      { word: 'der Arm', pos: 'noun', meaning_vi: 'cánh tay' },
      { word: 'die Hand', pos: 'noun', meaning_vi: 'bàn tay' },
      { word: 'der Finger', pos: 'noun', meaning_vi: 'ngón tay' },
      { word: 'der Bauch', pos: 'noun', meaning_vi: 'bụng' },
      { word: 'der Rücken', pos: 'noun', meaning_vi: 'lưng' },
      { word: 'das Bein', pos: 'noun', meaning_vi: 'chân' },
      { word: 'das Knie', pos: 'noun', meaning_vi: 'đầu gối' },
      { word: 'der Fuß', pos: 'noun', meaning_vi: 'bàn chân' },
      { word: 'der Zeh', pos: 'noun', meaning_vi: 'ngón chân' },
      { word: 'das Herz', pos: 'noun', meaning_vi: 'tim' },
      { word: 'der Zahn', pos: 'noun', meaning_vi: 'răng' },
    ]
  },

  a1_daily_actions: {
    level: 'A1',
    words: [
      { word: 'aufstehen', pos: 'verb', meaning_vi: 'thức dậy' },
      { word: 'duschen', pos: 'verb', meaning_vi: 'tắm vòi sen' },
      { word: 'waschen', pos: 'verb', meaning_vi: 'rửa' },
      { word: 'anziehen', pos: 'verb', meaning_vi: 'mặc' },
      { word: 'ausziehen', pos: 'verb', meaning_vi: 'cởi' },
      { word: 'frühstücken', pos: 'verb', meaning_vi: 'ăn sáng' },
      { word: 'putzen', pos: 'verb', meaning_vi: 'lau chùi' },
      { word: 'aufräumen', pos: 'verb', meaning_vi: 'dọn dẹp' },
      { word: 'einkaufen', pos: 'verb', meaning_vi: 'mua sắm' },
      { word: 'zurückkommen', pos: 'verb', meaning_vi: 'trở về' },
      { word: 'fernsehen', pos: 'verb', meaning_vi: 'xem TV' },
      { word: 'telefonieren', pos: 'verb', meaning_vi: 'gọi điện' },
      { word: 'spazieren', pos: 'verb', meaning_vi: 'đi dạo' },
      { word: 'entspannen', pos: 'verb', meaning_vi: 'thư giãn' },
      { word: 'schließen', pos: 'verb', meaning_vi: 'đóng' },
      { word: 'öffnen', pos: 'verb', meaning_vi: 'mở' },
      { word: 'einschalten', pos: 'verb', meaning_vi: 'bật' },
      { word: 'ausschalten', pos: 'verb', meaning_vi: 'tắt' },
      { word: 'sitzen', pos: 'verb', meaning_vi: 'ngồi' },
      { word: 'stehen', pos: 'verb', meaning_vi: 'đứng' },
    ]
  },

  a1_prepositions: {
    level: 'A1',
    words: [
      { word: 'in', pos: 'preposition', meaning_vi: 'trong' },
      { word: 'an', pos: 'preposition', meaning_vi: 'ở (bên cạnh)' },
      { word: 'auf', pos: 'preposition', meaning_vi: 'trên' },
      { word: 'unter', pos: 'preposition', meaning_vi: 'dưới' },
      { word: 'über', pos: 'preposition', meaning_vi: 'trên/qua' },
      { word: 'neben', pos: 'preposition', meaning_vi: 'bên cạnh' },
      { word: 'zwischen', pos: 'preposition', meaning_vi: 'giữa' },
      { word: 'vor', pos: 'preposition', meaning_vi: 'trước' },
      { word: 'hinter', pos: 'preposition', meaning_vi: 'sau' },
      { word: 'mit', pos: 'preposition', meaning_vi: 'với' },
      { word: 'ohne', pos: 'preposition', meaning_vi: 'không có' },
      { word: 'für', pos: 'preposition', meaning_vi: 'cho' },
      { word: 'gegen', pos: 'preposition', meaning_vi: 'chống lại' },
      { word: 'durch', pos: 'preposition', meaning_vi: 'qua' },
      { word: 'um', pos: 'preposition', meaning_vi: 'vào lúc/xung quanh' },
      { word: 'bei', pos: 'preposition', meaning_vi: 'ở chỗ' },
      { word: 'nach', pos: 'preposition', meaning_vi: 'sau/đến' },
      { word: 'von', pos: 'preposition', meaning_vi: 'từ' },
      { word: 'zu', pos: 'preposition', meaning_vi: 'đến' },
      { word: 'seit', pos: 'preposition', meaning_vi: 'từ (thời gian)' },
    ]
  },

  a1_questions: {
    level: 'A1',
    words: [
      { word: 'wer', pos: 'pronoun', meaning_vi: 'ai' },
      { word: 'was', pos: 'pronoun', meaning_vi: 'cái gì' },
      { word: 'wo', pos: 'adverb', meaning_vi: 'ở đâu' },
      { word: 'wann', pos: 'adverb', meaning_vi: 'khi nào' },
      { word: 'warum', pos: 'adverb', meaning_vi: 'tại sao' },
      { word: 'wie', pos: 'adverb', meaning_vi: 'như thế nào' },
      { word: 'welcher', pos: 'pronoun', meaning_vi: 'cái nào' },
      { word: 'woher', pos: 'adverb', meaning_vi: 'từ đâu' },
      { word: 'wohin', pos: 'adverb', meaning_vi: 'đi đâu' },
      { word: 'wieviel', pos: 'adverb', meaning_vi: 'bao nhiêu' },
      { word: 'ich', pos: 'pronoun', meaning_vi: 'tôi' },
      { word: 'du', pos: 'pronoun', meaning_vi: 'bạn' },
      { word: 'er', pos: 'pronoun', meaning_vi: 'anh ấy' },
      { word: 'sie', pos: 'pronoun', meaning_vi: 'cô ấy/họ' },
      { word: 'es', pos: 'pronoun', meaning_vi: 'nó' },
      { word: 'wir', pos: 'pronoun', meaning_vi: 'chúng tôi' },
      { word: 'ihr', pos: 'pronoun', meaning_vi: 'các bạn' },
      { word: 'Sie', pos: 'pronoun', meaning_vi: 'quý vị' },
      { word: 'man', pos: 'pronoun', meaning_vi: 'người ta' },
      { word: 'jemand', pos: 'pronoun', meaning_vi: 'ai đó' },
    ]
  },

  // A2 - Expanded (180 words)
  a2_kitchen: {
    level: 'A2',
    words: [
      { word: 'die Küche', pos: 'noun', meaning_vi: 'nhà bếp' },
      { word: 'der Herd', pos: 'noun', meaning_vi: 'bếp' },
      { word: 'der Ofen', pos: 'noun', meaning_vi: 'lò nướng' },
      { word: 'der Kühlschrank', pos: 'noun', meaning_vi: 'tủ lạnh' },
      { word: 'die Spülmaschine', pos: 'noun', meaning_vi: 'máy rửa bát' },
      { word: 'die Mikrowelle', pos: 'noun', meaning_vi: 'lò vi sóng' },
      { word: 'der Wasserkocher', pos: 'noun', meaning_vi: 'ấm đun nước' },
      { word: 'die Kaffeemaschine', pos: 'noun', meaning_vi: 'máy pha cà phê' },
      { word: 'der Topf', pos: 'noun', meaning_vi: 'nồi' },
      { word: 'die Pfanne', pos: 'noun', meaning_vi: 'chảo' },
      { word: 'das Messer', pos: 'noun', meaning_vi: 'dao' },
      { word: 'die Gabel', pos: 'noun', meaning_vi: 'nĩa' },
      { word: 'der Löffel', pos: 'noun', meaning_vi: 'thìa' },
      { word: 'der Teller', pos: 'noun', meaning_vi: 'đĩa' },
      { word: 'die Tasse', pos: 'noun', meaning_vi: 'cốc' },
      { word: 'das Glas', pos: 'noun', meaning_vi: 'ly' },
      { word: 'die Schüssel', pos: 'noun', meaning_vi: 'tô' },
      { word: 'das Schneidebrett', pos: 'noun', meaning_vi: 'thớt' },
      { word: 'die Schürze', pos: 'noun', meaning_vi: 'tạp dề' },
      { word: 'das Geschirrtuch', pos: 'noun', meaning_vi: 'khăn lau bát' },
    ]
  },

  a2_hobbies: {
    level: 'A2',
    words: [
      { word: 'das Hobby', pos: 'noun', meaning_vi: 'sở thích' },
      { word: 'der Sport', pos: 'noun', meaning_vi: 'thể thao' },
      { word: 'das Fußball', pos: 'noun', meaning_vi: 'bóng đá' },
      { word: 'das Tennis', pos: 'noun', meaning_vi: 'quần vợt' },
      { word: 'das Schwimmen', pos: 'noun', meaning_vi: 'bơi lội' },
      { word: 'das Laufen', pos: 'noun', meaning_vi: 'chạy bộ' },
      { word: 'das Radfahren', pos: 'noun', meaning_vi: 'đạp xe' },
      { word: 'das Wandern', pos: 'noun', meaning_vi: 'đi bộ đường dài' },
      { word: 'das Yoga', pos: 'noun', meaning_vi: 'yoga' },
      { word: 'das Tanzen', pos: 'noun', meaning_vi: 'khiêu vũ' },
      { word: 'das Lesen', pos: 'noun', meaning_vi: 'đọc sách' },
      { word: 'das Kochen', pos: 'noun', meaning_vi: 'nấu ăn' },
      { word: 'das Malen', pos: 'noun', meaning_vi: 'vẽ' },
      { word: 'das Fotografieren', pos: 'noun', meaning_vi: 'chụp ảnh' },
      { word: 'das Gärtnern', pos: 'noun', meaning_vi: 'làm vườn' },
      { word: 'das Stricken', pos: 'noun', meaning_vi: 'đan len' },
      { word: 'das Schach', pos: 'noun', meaning_vi: 'cờ vua' },
      { word: 'die Musik', pos: 'noun', meaning_vi: 'âm nhạc' },
      { word: 'das Klavier', pos: 'noun', meaning_vi: 'piano' },
      { word: 'die Gitarre', pos: 'noun', meaning_vi: 'guitar' },
    ]
  },

  a2_furniture: {
    level: 'A2',
    words: [
      { word: 'das Möbel', pos: 'noun', meaning_vi: 'đồ nội thất' },
      { word: 'das Bett', pos: 'noun', meaning_vi: 'giường' },
      { word: 'das Sofa', pos: 'noun', meaning_vi: 'ghế sofa' },
      { word: 'der Sessel', pos: 'noun', meaning_vi: 'ghế bành' },
      { word: 'der Schreibtisch', pos: 'noun', meaning_vi: 'bàn làm việc' },
      { word: 'der Esstisch', pos: 'noun', meaning_vi: 'bàn ăn' },
      { word: 'der Nachttisch', pos: 'noun', meaning_vi: 'tủ đầu giường' },
      { word: 'die Kommode', pos: 'noun', meaning_vi: 'tủ ngăn kéo' },
      { word: 'der Kleiderschrank', pos: 'noun', meaning_vi: 'tủ quần áo' },
      { word: 'das Bücherregal', pos: 'noun', meaning_vi: 'kệ sách' },
      { word: 'der Vorhang', pos: 'noun', meaning_vi: 'rèm cửa' },
      { word: 'der Teppich', pos: 'noun', meaning_vi: 'thảm' },
      { word: 'die Matratze', pos: 'noun', meaning_vi: 'đệm' },
      { word: 'das Kissen', pos: 'noun', meaning_vi: 'gối' },
      { word: 'die Bettwäsche', pos: 'noun', meaning_vi: 'ga giường' },
      { word: 'die Vase', pos: 'noun', meaning_vi: 'bình hoa' },
      { word: 'die Pflanze', pos: 'noun', meaning_vi: 'cây cảnh' },
      { word: 'der Rahmen', pos: 'noun', meaning_vi: 'khung ảnh' },
      { word: 'die Steckdose', pos: 'noun', meaning_vi: 'ổ cắm' },
      { word: 'der Schalter', pos: 'noun', meaning_vi: 'công tắc' },
    ]
  },

  a2_transport: {
    level: 'A2',
    words: [
      { word: 'das Auto', pos: 'noun', meaning_vi: 'ô tô' },
      { word: 'der Bus', pos: 'noun', meaning_vi: 'xe buýt' },
      { word: 'die U-Bahn', pos: 'noun', meaning_vi: 'tàu điện ngầm' },
      { word: 'die S-Bahn', pos: 'noun', meaning_vi: 'tàu ngoại ô' },
      { word: 'der Zug', pos: 'noun', meaning_vi: 'tàu hỏa' },
      { word: 'die Straßenbahn', pos: 'noun', meaning_vi: 'xe điện' },
      { word: 'das Fahrrad', pos: 'noun', meaning_vi: 'xe đạp' },
      { word: 'das Motorrad', pos: 'noun', meaning_vi: 'xe máy' },
      { word: 'das Taxi', pos: 'noun', meaning_vi: 'taxi' },
      { word: 'das Flugzeug', pos: 'noun', meaning_vi: 'máy bay' },
      { word: 'das Schiff', pos: 'noun', meaning_vi: 'tàu thủy' },
      { word: 'die Fähre', pos: 'noun', meaning_vi: 'phà' },
      { word: 'der LKW', pos: 'noun', meaning_vi: 'xe tải' },
      { word: 'der Führerschein', pos: 'noun', meaning_vi: 'bằng lái' },
      { word: 'die Tankstelle', pos: 'noun', meaning_vi: 'trạm xăng' },
      { word: 'der Parkplatz', pos: 'noun', meaning_vi: 'bãi đỗ xe' },
      { word: 'die Ampel', pos: 'noun', meaning_vi: 'đèn giao thông' },
      { word: 'der Zebrastreifen', pos: 'noun', meaning_vi: 'vạch sang đường' },
      { word: 'die Kreuzung', pos: 'noun', meaning_vi: 'ngã tư' },
      { word: 'der Stau', pos: 'noun', meaning_vi: 'tắc đường' },
    ]
  },

  a2_weather: {
    level: 'A2',
    words: [
      { word: 'das Wetter', pos: 'noun', meaning_vi: 'thời tiết' },
      { word: 'die Temperatur', pos: 'noun', meaning_vi: 'nhiệt độ' },
      { word: 'der Grad', pos: 'noun', meaning_vi: 'độ' },
      { word: 'die Hitze', pos: 'noun', meaning_vi: 'nắng nóng' },
      { word: 'die Kälte', pos: 'noun', meaning_vi: 'giá lạnh' },
      { word: 'der Nebel', pos: 'noun', meaning_vi: 'sương mù' },
      { word: 'der Sturm', pos: 'noun', meaning_vi: 'bão' },
      { word: 'das Gewitter', pos: 'noun', meaning_vi: 'giông bão' },
      { word: 'der Blitz', pos: 'noun', meaning_vi: 'sét' },
      { word: 'der Donner', pos: 'noun', meaning_vi: 'sấm' },
      { word: 'der Hagel', pos: 'noun', meaning_vi: 'mưa đá' },
      { word: 'das Eis', pos: 'noun', meaning_vi: 'băng' },
      { word: 'der Frost', pos: 'noun', meaning_vi: 'sương giá' },
      { word: 'regnen', pos: 'verb', meaning_vi: 'mưa' },
      { word: 'schneien', pos: 'verb', meaning_vi: 'tuyết rơi' },
      { word: 'scheinen', pos: 'verb', meaning_vi: 'chiếu sáng' },
      { word: 'wehen', pos: 'verb', meaning_vi: 'thổi' },
      { word: 'sonnig', pos: 'adjective', meaning_vi: 'nắng' },
      { word: 'bewölkt', pos: 'adjective', meaning_vi: 'nhiều mây' },
      { word: 'regnerisch', pos: 'adjective', meaning_vi: 'mưa' },
    ]
  },

  a2_relationships: {
    level: 'A2',
    words: [
      { word: 'die Familie', pos: 'noun', meaning_vi: 'gia đình' },
      { word: 'die Eltern', pos: 'noun', meaning_vi: 'bố mẹ' },
      { word: 'der Vater', pos: 'noun', meaning_vi: 'bố' },
      { word: 'die Mutter', pos: 'noun', meaning_vi: 'mẹ' },
      { word: 'das Kind', pos: 'noun', meaning_vi: 'con' },
      { word: 'der Sohn', pos: 'noun', meaning_vi: 'con trai' },
      { word: 'die Tochter', pos: 'noun', meaning_vi: 'con gái' },
      { word: 'der Bruder', pos: 'noun', meaning_vi: 'anh/em trai' },
      { word: 'die Schwester', pos: 'noun', meaning_vi: 'chị/em gái' },
      { word: 'die Großeltern', pos: 'noun', meaning_vi: 'ông bà' },
      { word: 'der Großvater', pos: 'noun', meaning_vi: 'ông' },
      { word: 'die Großmutter', pos: 'noun', meaning_vi: 'bà' },
      { word: 'der Onkel', pos: 'noun', meaning_vi: 'chú/bác/cậu' },
      { word: 'die Tante', pos: 'noun', meaning_vi: 'cô/dì/bác gái' },
      { word: 'der Cousin', pos: 'noun', meaning_vi: 'anh/em họ (nam)' },
      { word: 'die Cousine', pos: 'noun', meaning_vi: 'chị/em họ (nữ)' },
      { word: 'der Neffe', pos: 'noun', meaning_vi: 'cháu trai' },
      { word: 'die Nichte', pos: 'noun', meaning_vi: 'cháu gái' },
      { word: 'der Freund', pos: 'noun', meaning_vi: 'bạn/bạn trai' },
      { word: 'die Freundin', pos: 'noun', meaning_vi: 'bạn gái' },
    ]
  },

  a2_numbers_dates: {
    level: 'A2',
    words: [
      { word: 'die Zahl', pos: 'noun', meaning_vi: 'số' },
      { word: 'das Datum', pos: 'noun', meaning_vi: 'ngày tháng' },
      { word: 'der Monat', pos: 'noun', meaning_vi: 'tháng' },
      { word: 'das Jahr', pos: 'noun', meaning_vi: 'năm' },
      { word: 'der Januar', pos: 'noun', meaning_vi: 'tháng Một' },
      { word: 'der Februar', pos: 'noun', meaning_vi: 'tháng Hai' },
      { word: 'der März', pos: 'noun', meaning_vi: 'tháng Ba' },
      { word: 'der April', pos: 'noun', meaning_vi: 'tháng Tư' },
      { word: 'der Mai', pos: 'noun', meaning_vi: 'tháng Năm' },
      { word: 'der Juni', pos: 'noun', meaning_vi: 'tháng Sáu' },
      { word: 'der Juli', pos: 'noun', meaning_vi: 'tháng Bảy' },
      { word: 'der August', pos: 'noun', meaning_vi: 'tháng Tám' },
      { word: 'der September', pos: 'noun', meaning_vi: 'tháng Chín' },
      { word: 'der Oktober', pos: 'noun', meaning_vi: 'tháng Mười' },
      { word: 'der November', pos: 'noun', meaning_vi: 'tháng Mười một' },
      { word: 'der Dezember', pos: 'noun', meaning_vi: 'tháng Mười hai' },
      { word: 'der Geburtstag', pos: 'noun', meaning_vi: 'sinh nhật' },
      { word: 'das Alter', pos: 'noun', meaning_vi: 'tuổi' },
      { word: 'die Woche', pos: 'noun', meaning_vi: 'tuần' },
      { word: 'das Wochenende', pos: 'noun', meaning_vi: 'cuối tuần' },
    ]
  },

  a2_communication: {
    level: 'A2',
    words: [
      { word: 'sagen', pos: 'verb', meaning_vi: 'nói' },
      { word: 'erzählen', pos: 'verb', meaning_vi: 'kể' },
      { word: 'meinen', pos: 'verb', meaning_vi: 'ý là' },
      { word: 'denken', pos: 'verb', meaning_vi: 'nghĩ' },
      { word: 'glauben', pos: 'verb', meaning_vi: 'tin' },
      { word: 'wissen', pos: 'verb', meaning_vi: 'biết' },
      { word: 'kennen', pos: 'verb', meaning_vi: 'quen biết' },
      { word: 'verstehen', pos: 'verb', meaning_vi: 'hiểu' },
      { word: 'fragen', pos: 'verb', meaning_vi: 'hỏi' },
      { word: 'antworten', pos: 'verb', meaning_vi: 'trả lời' },
      { word: 'erklären', pos: 'verb', meaning_vi: 'giải thích' },
      { word: 'beschreiben', pos: 'verb', meaning_vi: 'mô tả' },
      { word: 'vorstellen', pos: 'verb', meaning_vi: 'giới thiệu' },
      { word: 'empfehlen', pos: 'verb', meaning_vi: 'đề xuất' },
      { word: 'bitten', pos: 'verb', meaning_vi: 'xin/yêu cầu' },
      { word: 'danken', pos: 'verb', meaning_vi: 'cảm ơn' },
      { word: 'entschuldigen', pos: 'verb', meaning_vi: 'xin lỗi' },
      { word: 'gratulieren', pos: 'verb', meaning_vi: 'chúc mừng' },
      { word: 'begrüßen', pos: 'verb', meaning_vi: 'chào đón' },
      { word: 'verabschieden', pos: 'verb', meaning_vi: 'tạm biệt' },
    ]
  },

  a2_opinions: {
    level: 'A2',
    words: [
      { word: 'die Meinung', pos: 'noun', meaning_vi: 'ý kiến' },
      { word: 'die Idee', pos: 'noun', meaning_vi: 'ý tưởng' },
      { word: 'der Vorschlag', pos: 'noun', meaning_vi: 'đề xuất' },
      { word: 'die Frage', pos: 'noun', meaning_vi: 'câu hỏi' },
      { word: 'die Antwort', pos: 'noun', meaning_vi: 'câu trả lời' },
      { word: 'der Rat', pos: 'noun', meaning_vi: 'lời khuyên' },
      { word: 'die Hilfe', pos: 'noun', meaning_vi: 'sự giúp đỡ' },
      { word: 'die Information', pos: 'noun', meaning_vi: 'thông tin' },
      { word: 'die Nachricht', pos: 'noun', meaning_vi: 'tin nhắn' },
      { word: 'das Gespräch', pos: 'noun', meaning_vi: 'cuộc trò chuyện' },
      { word: 'interessant', pos: 'adjective', meaning_vi: 'thú vị' },
      { word: 'langweilig', pos: 'adjective', meaning_vi: 'nhàm chán' },
      { word: 'einfach', pos: 'adjective', meaning_vi: 'đơn giản' },
      { word: 'schwierig', pos: 'adjective', meaning_vi: 'khó' },
      { word: 'möglich', pos: 'adjective', meaning_vi: 'có thể' },
      { word: 'unmöglich', pos: 'adjective', meaning_vi: 'không thể' },
      { word: 'nötig', pos: 'adjective', meaning_vi: 'cần thiết' },
      { word: 'sicher', pos: 'adjective', meaning_vi: 'chắc chắn' },
      { word: 'vielleicht', pos: 'adverb', meaning_vi: 'có lẽ' },
      { word: 'bestimmt', pos: 'adverb', meaning_vi: 'chắc chắn' },
    ]
  },

  // B1 - Intermediate (150 words)
  b1_economy: {
    level: 'B1',
    words: [
      { word: 'die Wirtschaft', pos: 'noun', meaning_vi: 'kinh tế' },
      { word: 'das Wachstum', pos: 'noun', meaning_vi: 'tăng trưởng' },
      { word: 'die Krise', pos: 'noun', meaning_vi: 'khủng hoảng' },
      { word: 'der Export', pos: 'noun', meaning_vi: 'xuất khẩu' },
      { word: 'der Import', pos: 'noun', meaning_vi: 'nhập khẩu' },
      { word: 'der Handel', pos: 'noun', meaning_vi: 'thương mại' },
      { word: 'die Industrie', pos: 'noun', meaning_vi: 'công nghiệp' },
      { word: 'die Produktion', pos: 'noun', meaning_vi: 'sản xuất' },
      { word: 'der Verbraucher', pos: 'noun', meaning_vi: 'người tiêu dùng' },
      { word: 'der Kunde', pos: 'noun', meaning_vi: 'khách hàng' },
      { word: 'das Angebot', pos: 'noun', meaning_vi: 'cung cấp' },
      { word: 'die Nachfrage', pos: 'noun', meaning_vi: 'nhu cầu' },
      { word: 'der Wettbewerb', pos: 'noun', meaning_vi: 'cạnh tranh' },
      { word: 'die Globalisierung', pos: 'noun', meaning_vi: 'toàn cầu hóa' },
      { word: 'die Inflation', pos: 'noun', meaning_vi: 'lạm phát' },
      { word: 'produzieren', pos: 'verb', meaning_vi: 'sản xuất' },
      { word: 'exportieren', pos: 'verb', meaning_vi: 'xuất khẩu' },
      { word: 'importieren', pos: 'verb', meaning_vi: 'nhập khẩu' },
      { word: 'wachsen', pos: 'verb', meaning_vi: 'tăng trưởng' },
      { word: 'sinken', pos: 'verb', meaning_vi: 'giảm' },
    ]
  },

  b1_health_advanced: {
    level: 'B1',
    words: [
      { word: 'die Gesundheit', pos: 'noun', meaning_vi: 'sức khỏe' },
      { word: 'die Ernährung', pos: 'noun', meaning_vi: 'dinh dưỡng' },
      { word: 'die Bewegung', pos: 'noun', meaning_vi: 'vận động' },
      { word: 'der Stress', pos: 'noun', meaning_vi: 'căng thẳng' },
      { word: 'die Therapie', pos: 'noun', meaning_vi: 'liệu pháp' },
      { word: 'die Diagnose', pos: 'noun', meaning_vi: 'chẩn đoán' },
      { word: 'das Symptom', pos: 'noun', meaning_vi: 'triệu chứng' },
      { word: 'die Allergie', pos: 'noun', meaning_vi: 'dị ứng' },
      { word: 'die Infektion', pos: 'noun', meaning_vi: 'nhiễm trùng' },
      { word: 'die Entzündung', pos: 'noun', meaning_vi: 'viêm' },
      { word: 'die Impfung', pos: 'noun', meaning_vi: 'tiêm chủng' },
      { word: 'die Nebenwirkung', pos: 'noun', meaning_vi: 'tác dụng phụ' },
      { word: 'die Versicherung', pos: 'noun', meaning_vi: 'bảo hiểm' },
      { word: 'die Krankenversicherung', pos: 'noun', meaning_vi: 'bảo hiểm y tế' },
      { word: 'die Notaufnahme', pos: 'noun', meaning_vi: 'phòng cấp cứu' },
      { word: 'sich erholen', pos: 'verb', meaning_vi: 'hồi phục' },
      { word: 'verletzen', pos: 'verb', meaning_vi: 'bị thương' },
      { word: 'bluten', pos: 'verb', meaning_vi: 'chảy máu' },
      { word: 'atmen', pos: 'verb', meaning_vi: 'thở' },
      { word: 'schmerzen', pos: 'verb', meaning_vi: 'đau' },
    ]
  },

  b1_law_basic: {
    level: 'B1',
    words: [
      { word: 'das Gesetz', pos: 'noun', meaning_vi: 'luật' },
      { word: 'das Recht', pos: 'noun', meaning_vi: 'quyền' },
      { word: 'die Regel', pos: 'noun', meaning_vi: 'quy tắc' },
      { word: 'das Verbot', pos: 'noun', meaning_vi: 'lệnh cấm' },
      { word: 'die Erlaubnis', pos: 'noun', meaning_vi: 'sự cho phép' },
      { word: 'die Genehmigung', pos: 'noun', meaning_vi: 'giấy phép' },
      { word: 'der Antrag', pos: 'noun', meaning_vi: 'đơn xin' },
      { word: 'das Formular', pos: 'noun', meaning_vi: 'biểu mẫu' },
      { word: 'die Unterschrift', pos: 'noun', meaning_vi: 'chữ ký' },
      { word: 'der Ausweis', pos: 'noun', meaning_vi: 'giấy tờ tùy thân' },
      { word: 'der Personalausweis', pos: 'noun', meaning_vi: 'CMND' },
      { word: 'die Bescheinigung', pos: 'noun', meaning_vi: 'giấy chứng nhận' },
      { word: 'das Zeugnis', pos: 'noun', meaning_vi: 'chứng chỉ' },
      { word: 'die Meldung', pos: 'noun', meaning_vi: 'đăng ký' },
      { word: 'die Anmeldung', pos: 'noun', meaning_vi: 'đăng ký' },
      { word: 'erlauben', pos: 'verb', meaning_vi: 'cho phép' },
      { word: 'verbieten', pos: 'verb', meaning_vi: 'cấm' },
      { word: 'beantragen', pos: 'verb', meaning_vi: 'nộp đơn' },
      { word: 'unterschreiben', pos: 'verb', meaning_vi: 'ký' },
      { word: 'bestätigen', pos: 'verb', meaning_vi: 'xác nhận' },
    ]
  },

  b1_housing: {
    level: 'B1',
    words: [
      { word: 'die Wohnung', pos: 'noun', meaning_vi: 'căn hộ' },
      { word: 'das Haus', pos: 'noun', meaning_vi: 'nhà' },
      { word: 'die Miete', pos: 'noun', meaning_vi: 'tiền thuê' },
      { word: 'der Mieter', pos: 'noun', meaning_vi: 'người thuê' },
      { word: 'der Vermieter', pos: 'noun', meaning_vi: 'chủ nhà' },
      { word: 'der Mietvertrag', pos: 'noun', meaning_vi: 'hợp đồng thuê' },
      { word: 'die Kaution', pos: 'noun', meaning_vi: 'tiền đặt cọc' },
      { word: 'die Nebenkosten', pos: 'noun', meaning_vi: 'chi phí phụ' },
      { word: 'die Heizung', pos: 'noun', meaning_vi: 'hệ thống sưởi' },
      { word: 'die Klimaanlage', pos: 'noun', meaning_vi: 'máy điều hòa' },
      { word: 'der Aufzug', pos: 'noun', meaning_vi: 'thang máy' },
      { word: 'die Treppe', pos: 'noun', meaning_vi: 'cầu thang' },
      { word: 'der Balkon', pos: 'noun', meaning_vi: 'ban công' },
      { word: 'die Terrasse', pos: 'noun', meaning_vi: 'sân thượng' },
      { word: 'der Keller', pos: 'noun', meaning_vi: 'tầng hầm' },
      { word: 'mieten', pos: 'verb', meaning_vi: 'thuê' },
      { word: 'vermieten', pos: 'verb', meaning_vi: 'cho thuê' },
      { word: 'einziehen', pos: 'verb', meaning_vi: 'chuyển vào' },
      { word: 'ausziehen', pos: 'verb', meaning_vi: 'chuyển đi' },
      { word: 'renovieren', pos: 'verb', meaning_vi: 'tân trang' },
    ]
  },

  b1_personality: {
    level: 'B1',
    words: [
      { word: 'der Charakter', pos: 'noun', meaning_vi: 'tính cách' },
      { word: 'die Persönlichkeit', pos: 'noun', meaning_vi: 'nhân cách' },
      { word: 'die Eigenschaft', pos: 'noun', meaning_vi: 'đặc điểm' },
      { word: 'die Stärke', pos: 'noun', meaning_vi: 'điểm mạnh' },
      { word: 'die Schwäche', pos: 'noun', meaning_vi: 'điểm yếu' },
      { word: 'ehrlich', pos: 'adjective', meaning_vi: 'thật thà' },
      { word: 'zuverlässig', pos: 'adjective', meaning_vi: 'đáng tin cậy' },
      { word: 'pünktlich', pos: 'adjective', meaning_vi: 'đúng giờ' },
      { word: 'fleißig', pos: 'adjective', meaning_vi: 'chăm chỉ' },
      { word: 'faul', pos: 'adjective', meaning_vi: 'lười biếng' },
      { word: 'geduldig', pos: 'adjective', meaning_vi: 'kiên nhẫn' },
      { word: 'ungeduldig', pos: 'adjective', meaning_vi: 'thiếu kiên nhẫn' },
      { word: 'freundlich', pos: 'adjective', meaning_vi: 'thân thiện' },
      { word: 'höflich', pos: 'adjective', meaning_vi: 'lịch sự' },
      { word: 'unhöflich', pos: 'adjective', meaning_vi: 'bất lịch sự' },
      { word: 'selbstbewusst', pos: 'adjective', meaning_vi: 'tự tin' },
      { word: 'schüchtern', pos: 'adjective', meaning_vi: 'nhút nhát' },
      { word: 'optimistisch', pos: 'adjective', meaning_vi: 'lạc quan' },
      { word: 'pessimistisch', pos: 'adjective', meaning_vi: 'bi quan' },
      { word: 'kreativ', pos: 'adjective', meaning_vi: 'sáng tạo' },
    ]
  },

  // B2 - Upper Intermediate (75 words)
  b2_professional: {
    level: 'B2',
    words: [
      { word: 'die Kompetenz', pos: 'noun', meaning_vi: 'năng lực' },
      { word: 'die Qualifikation', pos: 'noun', meaning_vi: 'bằng cấp' },
      { word: 'die Fortbildung', pos: 'noun', meaning_vi: 'đào tạo thêm' },
      { word: 'die Weiterbildung', pos: 'noun', meaning_vi: 'nâng cao' },
      { word: 'die Beförderung', pos: 'noun', meaning_vi: 'thăng chức' },
      { word: 'die Gehaltserhöhung', pos: 'noun', meaning_vi: 'tăng lương' },
      { word: 'die Kündigung', pos: 'noun', meaning_vi: 'sa thải' },
      { word: 'die Arbeitszeit', pos: 'noun', meaning_vi: 'giờ làm việc' },
      { word: 'die Überstunden', pos: 'noun', meaning_vi: 'làm thêm giờ' },
      { word: 'das Homeoffice', pos: 'noun', meaning_vi: 'làm từ xa' },
      { word: 'die Videokonferenz', pos: 'noun', meaning_vi: 'họp video' },
      { word: 'die Präsentation', pos: 'noun', meaning_vi: 'bài thuyết trình' },
      { word: 'der Bericht', pos: 'noun', meaning_vi: 'báo cáo' },
      { word: 'das Protokoll', pos: 'noun', meaning_vi: 'biên bản' },
      { word: 'die Deadline', pos: 'noun', meaning_vi: 'hạn chót' },
      { word: 'koordinieren', pos: 'verb', meaning_vi: 'phối hợp' },
      { word: 'delegieren', pos: 'verb', meaning_vi: 'ủy quyền' },
      { word: 'motivieren', pos: 'verb', meaning_vi: 'tạo động lực' },
      { word: 'verhandeln', pos: 'verb', meaning_vi: 'đàm phán' },
      { word: 'präsentieren', pos: 'verb', meaning_vi: 'thuyết trình' },
    ]
  },

  b2_academic: {
    level: 'B2',
    words: [
      { word: 'die Forschung', pos: 'noun', meaning_vi: 'nghiên cứu' },
      { word: 'die Studie', pos: 'noun', meaning_vi: 'nghiên cứu' },
      { word: 'die Analyse', pos: 'noun', meaning_vi: 'phân tích' },
      { word: 'die These', pos: 'noun', meaning_vi: 'luận điểm' },
      { word: 'die Hypothese', pos: 'noun', meaning_vi: 'giả thuyết' },
      { word: 'das Argument', pos: 'noun', meaning_vi: 'lập luận' },
      { word: 'der Beweis', pos: 'noun', meaning_vi: 'bằng chứng' },
      { word: 'die Quelle', pos: 'noun', meaning_vi: 'nguồn' },
      { word: 'das Zitat', pos: 'noun', meaning_vi: 'trích dẫn' },
      { word: 'die Bibliografie', pos: 'noun', meaning_vi: 'thư mục' },
      { word: 'der Aufsatz', pos: 'noun', meaning_vi: 'bài luận' },
      { word: 'die Dissertation', pos: 'noun', meaning_vi: 'luận án' },
      { word: 'die Masterarbeit', pos: 'noun', meaning_vi: 'luận văn' },
      { word: 'das Seminar', pos: 'noun', meaning_vi: 'hội thảo' },
      { word: 'die Vorlesung', pos: 'noun', meaning_vi: 'bài giảng' },
      { word: 'recherchieren', pos: 'verb', meaning_vi: 'nghiên cứu' },
      { word: 'zitieren', pos: 'verb', meaning_vi: 'trích dẫn' },
      { word: 'zusammenfassen', pos: 'verb', meaning_vi: 'tóm tắt' },
      { word: 'argumentieren', pos: 'verb', meaning_vi: 'lập luận' },
      { word: 'widerlegen', pos: 'verb', meaning_vi: 'bác bỏ' },
    ]
  },

  b2_abstract: {
    level: 'B2',
    words: [
      { word: 'der Aspekt', pos: 'noun', meaning_vi: 'khía cạnh' },
      { word: 'der Faktor', pos: 'noun', meaning_vi: 'yếu tố' },
      { word: 'das Konzept', pos: 'noun', meaning_vi: 'khái niệm' },
      { word: 'die Methode', pos: 'noun', meaning_vi: 'phương pháp' },
      { word: 'das Prinzip', pos: 'noun', meaning_vi: 'nguyên tắc' },
      { word: 'die Struktur', pos: 'noun', meaning_vi: 'cấu trúc' },
      { word: 'das System', pos: 'noun', meaning_vi: 'hệ thống' },
      { word: 'der Prozess', pos: 'noun', meaning_vi: 'quá trình' },
      { word: 'die Entwicklung', pos: 'noun', meaning_vi: 'phát triển' },
      { word: 'die Veränderung', pos: 'noun', meaning_vi: 'thay đổi' },
      { word: 'der Einfluss', pos: 'noun', meaning_vi: 'ảnh hưởng' },
      { word: 'die Auswirkung', pos: 'noun', meaning_vi: 'tác động' },
      { word: 'die Beziehung', pos: 'noun', meaning_vi: 'mối quan hệ' },
      { word: 'der Zusammenhang', pos: 'noun', meaning_vi: 'mối liên hệ' },
      { word: 'die Voraussetzung', pos: 'noun', meaning_vi: 'điều kiện tiên quyết' },
      { word: 'beeinflussen', pos: 'verb', meaning_vi: 'ảnh hưởng' },
      { word: 'verändern', pos: 'verb', meaning_vi: 'thay đổi' },
      { word: 'entwickeln', pos: 'verb', meaning_vi: 'phát triển' },
      { word: 'verbinden', pos: 'verb', meaning_vi: 'kết nối' },
      { word: 'unterscheiden', pos: 'verb', meaning_vi: 'phân biệt' },
    ]
  },

  // C1 - Advanced (50 words)
  c1_discourse: {
    level: 'C1',
    words: [
      { word: 'der Diskurs', pos: 'noun', meaning_vi: 'diễn ngôn' },
      { word: 'die Rhetorik', pos: 'noun', meaning_vi: 'thuật hùng biện' },
      { word: 'die Argumentation', pos: 'noun', meaning_vi: 'lập luận' },
      { word: 'der Standpunkt', pos: 'noun', meaning_vi: 'quan điểm' },
      { word: 'die Perspektive', pos: 'noun', meaning_vi: 'góc nhìn' },
      { word: 'die Kontroverse', pos: 'noun', meaning_vi: 'tranh cãi' },
      { word: 'der Konsens', pos: 'noun', meaning_vi: 'sự đồng thuận' },
      { word: 'der Dissens', pos: 'noun', meaning_vi: 'bất đồng' },
      { word: 'die Kritik', pos: 'noun', meaning_vi: 'phê bình' },
      { word: 'die Interpretation', pos: 'noun', meaning_vi: 'diễn giải' },
      { word: 'die Implikation', pos: 'noun', meaning_vi: 'hàm ý' },
      { word: 'die Konsequenz', pos: 'noun', meaning_vi: 'hậu quả' },
      { word: 'die Schlussfolgerung', pos: 'noun', meaning_vi: 'kết luận' },
      { word: 'das Paradoxon', pos: 'noun', meaning_vi: 'nghịch lý' },
      { word: 'die Ambiguität', pos: 'noun', meaning_vi: 'sự mơ hồ' },
      { word: 'erörtern', pos: 'verb', meaning_vi: 'thảo luận' },
      { word: 'hinterfragen', pos: 'verb', meaning_vi: 'đặt câu hỏi' },
      { word: 'relativieren', pos: 'verb', meaning_vi: 'tương đối hóa' },
      { word: 'differenzieren', pos: 'verb', meaning_vi: 'phân biệt' },
      { word: 'nuancieren', pos: 'verb', meaning_vi: 'tinh tế hóa' },
      { word: 'kontrovers', pos: 'adjective', meaning_vi: 'gây tranh cãi' },
      { word: 'ambivalent', pos: 'adjective', meaning_vi: 'mâu thuẫn' },
      { word: 'implizit', pos: 'adjective', meaning_vi: 'ngầm' },
      { word: 'explizit', pos: 'adjective', meaning_vi: 'rõ ràng' },
      { word: 'paradigmatisch', pos: 'adjective', meaning_vi: 'mẫu mực' },
    ]
  },

  c1_society: {
    level: 'C1',
    words: [
      { word: 'die Zivilgesellschaft', pos: 'noun', meaning_vi: 'xã hội dân sự' },
      { word: 'die Sozialisierung', pos: 'noun', meaning_vi: 'xã hội hóa' },
      { word: 'die Identität', pos: 'noun', meaning_vi: 'bản sắc' },
      { word: 'die Diversität', pos: 'noun', meaning_vi: 'đa dạng' },
      { word: 'die Inklusion', pos: 'noun', meaning_vi: 'hòa nhập' },
      { word: 'die Exklusion', pos: 'noun', meaning_vi: 'loại trừ' },
      { word: 'die Marginalisierung', pos: 'noun', meaning_vi: 'bị đẩy ra ngoài lề' },
      { word: 'die Emanzipation', pos: 'noun', meaning_vi: 'giải phóng' },
      { word: 'die Partizipation', pos: 'noun', meaning_vi: 'sự tham gia' },
      { word: 'die Solidarität', pos: 'noun', meaning_vi: 'đoàn kết' },
      { word: 'die Verantwortung', pos: 'noun', meaning_vi: 'trách nhiệm' },
      { word: 'die Nachhaltigkeit', pos: 'noun', meaning_vi: 'bền vững' },
      { word: 'die Transformation', pos: 'noun', meaning_vi: 'chuyển đổi' },
      { word: 'die Digitalisierung', pos: 'noun', meaning_vi: 'số hóa' },
      { word: 'die Automatisierung', pos: 'noun', meaning_vi: 'tự động hóa' },
      { word: 'transformieren', pos: 'verb', meaning_vi: 'chuyển đổi' },
      { word: 'marginalisieren', pos: 'verb', meaning_vi: 'đẩy ra ngoài lề' },
      { word: 'emanzipieren', pos: 'verb', meaning_vi: 'giải phóng' },
      { word: 'partizipieren', pos: 'verb', meaning_vi: 'tham gia' },
      { word: 'inkludieren', pos: 'verb', meaning_vi: 'hòa nhập' },
      { word: 'exkludieren', pos: 'verb', meaning_vi: 'loại trừ' },
      { word: 'solidarisch', pos: 'adjective', meaning_vi: 'đoàn kết' },
      { word: 'inklusiv', pos: 'adjective', meaning_vi: 'bao trùm' },
      { word: 'nachhaltig', pos: 'adjective', meaning_vi: 'bền vững' },
      { word: 'emanzipatorisch', pos: 'adjective', meaning_vi: 'giải phóng' },
    ]
  },
};

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║    📚 BATCH 21 - FINAL WORDS TO 10K+                       ║');
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
