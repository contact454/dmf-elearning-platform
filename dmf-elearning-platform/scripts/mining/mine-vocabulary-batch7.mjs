#!/usr/bin/env node
/**
 * Mine Vocabulary Batch 7 - Additional Essential Words
 * Target: 800+ words covering more topics
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT = path.join(__dirname, '../data/quality-expansion/batch7-vocabulary.json');

const TOPICS = {
  // More Food & Cooking Terms
  food_cooking_ext: {
    level: 'A2',
    words: [
      { word: 'Fleisch', meaning_vi: 'thịt', pos: 'noun' },
      { word: 'Rindfleisch', meaning_vi: 'thịt bò', pos: 'noun' },
      { word: 'Schweinefleisch', meaning_vi: 'thịt lợn', pos: 'noun' },
      { word: 'Hähnchen', meaning_vi: 'thịt gà', pos: 'noun' },
      { word: 'Fisch', meaning_vi: 'cá', pos: 'noun' },
      { word: 'Meeresfrüchte', meaning_vi: 'hải sản', pos: 'noun' },
      { word: 'Ei', meaning_vi: 'trứng', pos: 'noun' },
      { word: 'Käse', meaning_vi: 'phô mai', pos: 'noun' },
      { word: 'Joghurt', meaning_vi: 'sữa chua', pos: 'noun' },
      { word: 'Sahne', meaning_vi: 'kem', pos: 'noun' },
      { word: 'Brot', meaning_vi: 'bánh mì', pos: 'noun' },
      { word: 'Brötchen', meaning_vi: 'bánh mì nhỏ', pos: 'noun' },
      { word: 'Kuchen', meaning_vi: 'bánh ngọt', pos: 'noun' },
      { word: 'Torte', meaning_vi: 'bánh kem', pos: 'noun' },
      { word: 'Keks', meaning_vi: 'bánh quy', pos: 'noun' },
      { word: 'Schokolade', meaning_vi: 'sô cô la', pos: 'noun' },
      { word: 'Bonbon', meaning_vi: 'kẹo', pos: 'noun' },
      { word: 'Eis', meaning_vi: 'kem', pos: 'noun' },
      { word: 'Suppe', meaning_vi: 'súp', pos: 'noun' },
      { word: 'Soße', meaning_vi: 'nước sốt', pos: 'noun' },
      { word: 'Nudel', meaning_vi: 'mì', pos: 'noun' },
      { word: 'Pizza', meaning_vi: 'pizza', pos: 'noun' },
      { word: 'Salat', meaning_vi: 'salad', pos: 'noun' },
      { word: 'Sandwich', meaning_vi: 'bánh sandwich', pos: 'noun' },
      { word: 'Pommes', meaning_vi: 'khoai tây chiên', pos: 'noun' },
    ]
  },

  // Restaurant & Dining
  restaurant_dining: {
    level: 'A2',
    words: [
      { word: 'Speisekarte', meaning_vi: 'thực đơn', pos: 'noun' },
      { word: 'Vorspeise', meaning_vi: 'món khai vị', pos: 'noun' },
      { word: 'Hauptgericht', meaning_vi: 'món chính', pos: 'noun' },
      { word: 'Nachspeise', meaning_vi: 'tráng miệng', pos: 'noun' },
      { word: 'Getränkekarte', meaning_vi: 'menu đồ uống', pos: 'noun' },
      { word: 'Bestellung', meaning_vi: 'đơn hàng', pos: 'noun' },
      { word: 'Rechnung', meaning_vi: 'hóa đơn', pos: 'noun' },
      { word: 'Trinkgeld', meaning_vi: 'tiền tip', pos: 'noun' },
      { word: 'Reservierung', meaning_vi: 'đặt bàn', pos: 'noun' },
      { word: 'Kellner', meaning_vi: 'bồi bàn', pos: 'noun' },
      { word: 'Kellnerin', meaning_vi: 'bồi bàn (nữ)', pos: 'noun' },
      { word: 'Tisch', meaning_vi: 'bàn', pos: 'noun' },
      { word: 'Stuhl', meaning_vi: 'ghế', pos: 'noun' },
      { word: 'Besteck', meaning_vi: 'bộ dao muỗng nĩa', pos: 'noun' },
      { word: 'bestellen', meaning_vi: 'gọi món', pos: 'verb' },
      { word: 'servieren', meaning_vi: 'phục vụ', pos: 'verb' },
      { word: 'probieren', meaning_vi: 'nếm thử', pos: 'verb' },
      { word: 'lecker', meaning_vi: 'ngon', pos: 'adjective' },
      { word: 'scharf', meaning_vi: 'cay', pos: 'adjective' },
      { word: 'süß', meaning_vi: 'ngọt', pos: 'adjective' },
      { word: 'sauer', meaning_vi: 'chua', pos: 'adjective' },
      { word: 'salzig', meaning_vi: 'mặn', pos: 'adjective' },
      { word: 'bitter', meaning_vi: 'đắng', pos: 'adjective' },
      { word: 'frisch', meaning_vi: 'tươi', pos: 'adjective' },
      { word: 'vegetarisch', meaning_vi: 'chay', pos: 'adjective' },
    ]
  },

  // Clothing & Fashion Extended
  clothing_fashion_ext: {
    level: 'A2',
    words: [
      { word: 'Kostüm', meaning_vi: 'trang phục', pos: 'noun' },
      { word: 'Uniform', meaning_vi: 'đồng phục', pos: 'noun' },
      { word: 'Sportkleidung', meaning_vi: 'quần áo thể thao', pos: 'noun' },
      { word: 'Unterwäsche', meaning_vi: 'đồ lót', pos: 'noun' },
      { word: 'Pyjama', meaning_vi: 'đồ ngủ', pos: 'noun' },
      { word: 'Badeanzug', meaning_vi: 'đồ bơi', pos: 'noun' },
      { word: 'Bikini', meaning_vi: 'bikini', pos: 'noun' },
      { word: 'Regenjacke', meaning_vi: 'áo mưa', pos: 'noun' },
      { word: 'Winterjacke', meaning_vi: 'áo khoác mùa đông', pos: 'noun' },
      { word: 'Weste', meaning_vi: 'áo gile', pos: 'noun' },
      { word: 'Krawatte', meaning_vi: 'cà vạt', pos: 'noun' },
      { word: 'Fliege', meaning_vi: 'nơ', pos: 'noun' },
      { word: 'Sandalen', meaning_vi: 'dép sandal', pos: 'noun' },
      { word: 'Turnschuhe', meaning_vi: 'giày thể thao', pos: 'noun' },
      { word: 'Hausschuhe', meaning_vi: 'dép đi trong nhà', pos: 'noun' },
      { word: 'modisch', meaning_vi: 'thời trang', pos: 'adjective' },
      { word: 'elegant', meaning_vi: 'thanh lịch', pos: 'adjective' },
      { word: 'bequem', meaning_vi: 'thoải mái', pos: 'adjective' },
      { word: 'eng', meaning_vi: 'chật', pos: 'adjective' },
      { word: 'weit', meaning_vi: 'rộng', pos: 'adjective' },
    ]
  },

  // Electronics & Gadgets
  electronics_gadgets: {
    level: 'A2',
    words: [
      { word: 'Handy', meaning_vi: 'điện thoại di động', pos: 'noun' },
      { word: 'Smartphone', meaning_vi: 'điện thoại thông minh', pos: 'noun' },
      { word: 'Ladegerät', meaning_vi: 'sạc', pos: 'noun' },
      { word: 'Akku', meaning_vi: 'pin', pos: 'noun' },
      { word: 'Batterie', meaning_vi: 'pin', pos: 'noun' },
      { word: 'Kabel', meaning_vi: 'dây cáp', pos: 'noun' },
      { word: 'Stecker', meaning_vi: 'phích cắm', pos: 'noun' },
      { word: 'Steckdose', meaning_vi: 'ổ cắm', pos: 'noun' },
      { word: 'Adapter', meaning_vi: 'bộ chuyển đổi', pos: 'noun' },
      { word: 'Fernbedienung', meaning_vi: 'điều khiển từ xa', pos: 'noun' },
      { word: 'Kamera', meaning_vi: 'máy ảnh', pos: 'noun' },
      { word: 'Mikrofon', meaning_vi: 'micro', pos: 'noun' },
      { word: 'Lautsprecher', meaning_vi: 'loa', pos: 'noun' },
      { word: 'Kopfhörer', meaning_vi: 'tai nghe', pos: 'noun' },
      { word: 'Bildschirm', meaning_vi: 'màn hình', pos: 'noun' },
      { word: 'aufladen', meaning_vi: 'sạc', pos: 'verb' },
      { word: 'einschalten', meaning_vi: 'bật', pos: 'verb' },
      { word: 'ausschalten', meaning_vi: 'tắt', pos: 'verb' },
      { word: 'verbinden', meaning_vi: 'kết nối', pos: 'verb' },
      { word: 'trennen', meaning_vi: 'ngắt kết nối', pos: 'verb' },
    ]
  },

  // Home Appliances
  home_appliances: {
    level: 'A2',
    words: [
      { word: 'Kühlschrank', meaning_vi: 'tủ lạnh', pos: 'noun' },
      { word: 'Gefrierschrank', meaning_vi: 'tủ đông', pos: 'noun' },
      { word: 'Waschmaschine', meaning_vi: 'máy giặt', pos: 'noun' },
      { word: 'Trockner', meaning_vi: 'máy sấy', pos: 'noun' },
      { word: 'Bügeleisen', meaning_vi: 'bàn là', pos: 'noun' },
      { word: 'Staubsauger', meaning_vi: 'máy hút bụi', pos: 'noun' },
      { word: 'Spülmaschine', meaning_vi: 'máy rửa bát', pos: 'noun' },
      { word: 'Mikrowelle', meaning_vi: 'lò vi sóng', pos: 'noun' },
      { word: 'Backofen', meaning_vi: 'lò nướng', pos: 'noun' },
      { word: 'Herd', meaning_vi: 'bếp', pos: 'noun' },
      { word: 'Kaffeemaschine', meaning_vi: 'máy pha cà phê', pos: 'noun' },
      { word: 'Wasserkocher', meaning_vi: 'ấm đun nước', pos: 'noun' },
      { word: 'Toaster', meaning_vi: 'máy nướng bánh mì', pos: 'noun' },
      { word: 'Mixer', meaning_vi: 'máy xay', pos: 'noun' },
      { word: 'Ventilator', meaning_vi: 'quạt', pos: 'noun' },
      { word: 'Klimaanlage', meaning_vi: 'điều hòa', pos: 'noun' },
      { word: 'Heizung', meaning_vi: 'máy sưởi', pos: 'noun' },
      { word: 'Wecker', meaning_vi: 'đồng hồ báo thức', pos: 'noun' },
      { word: 'Fön', meaning_vi: 'máy sấy tóc', pos: 'noun' },
      { word: 'Rasierapparat', meaning_vi: 'máy cạo râu', pos: 'noun' },
    ]
  },

  // Sports & Exercise Extended
  sports_exercise: {
    level: 'A2',
    words: [
      { word: 'Basketball', meaning_vi: 'bóng rổ', pos: 'noun' },
      { word: 'Volleyball', meaning_vi: 'bóng chuyền', pos: 'noun' },
      { word: 'Handball', meaning_vi: 'bóng ném', pos: 'noun' },
      { word: 'Golf', meaning_vi: 'golf', pos: 'noun' },
      { word: 'Boxen', meaning_vi: 'quyền Anh', pos: 'noun' },
      { word: 'Yoga', meaning_vi: 'yoga', pos: 'noun' },
      { word: 'Fitness', meaning_vi: 'thể hình', pos: 'noun' },
      { word: 'Gymnastik', meaning_vi: 'thể dục', pos: 'noun' },
      { word: 'Leichtathletik', meaning_vi: 'điền kinh', pos: 'noun' },
      { word: 'Skifahren', meaning_vi: 'trượt tuyết', pos: 'noun' },
      { word: 'Snowboarden', meaning_vi: 'trượt ván tuyết', pos: 'noun' },
      { word: 'Eislaufen', meaning_vi: 'trượt băng', pos: 'noun' },
      { word: 'Tauchen', meaning_vi: 'lặn', pos: 'noun' },
      { word: 'Surfen', meaning_vi: 'lướt sóng', pos: 'noun' },
      { word: 'Klettern', meaning_vi: 'leo núi', pos: 'noun' },
      { word: 'Angeln', meaning_vi: 'câu cá', pos: 'noun' },
      { word: 'Jagen', meaning_vi: 'săn bắn', pos: 'noun' },
      { word: 'Reiten', meaning_vi: 'cưỡi ngựa', pos: 'noun' },
      { word: 'Segeln', meaning_vi: 'đi thuyền buồm', pos: 'noun' },
      { word: 'Rudern', meaning_vi: 'chèo thuyền', pos: 'noun' },
    ]
  },

  // Music & Instruments
  music_instruments: {
    level: 'A2',
    words: [
      { word: 'Musik', meaning_vi: 'âm nhạc', pos: 'noun' },
      { word: 'Lied', meaning_vi: 'bài hát', pos: 'noun' },
      { word: 'Melodie', meaning_vi: 'giai điệu', pos: 'noun' },
      { word: 'Rhythmus', meaning_vi: 'nhịp điệu', pos: 'noun' },
      { word: 'Ton', meaning_vi: 'âm thanh', pos: 'noun' },
      { word: 'Klavier', meaning_vi: 'piano', pos: 'noun' },
      { word: 'Gitarre', meaning_vi: 'guitar', pos: 'noun' },
      { word: 'Geige', meaning_vi: 'violin', pos: 'noun' },
      { word: 'Flöte', meaning_vi: 'sáo', pos: 'noun' },
      { word: 'Trompete', meaning_vi: 'kèn trumpet', pos: 'noun' },
      { word: 'Saxophon', meaning_vi: 'saxophone', pos: 'noun' },
      { word: 'Schlagzeug', meaning_vi: 'trống', pos: 'noun' },
      { word: 'Akkordeon', meaning_vi: 'đàn accordion', pos: 'noun' },
      { word: 'Harfe', meaning_vi: 'đàn hạc', pos: 'noun' },
      { word: 'Sänger', meaning_vi: 'ca sĩ (nam)', pos: 'noun' },
      { word: 'Sängerin', meaning_vi: 'ca sĩ (nữ)', pos: 'noun' },
      { word: 'Band', meaning_vi: 'ban nhạc', pos: 'noun' },
      { word: 'Chor', meaning_vi: 'dàn hợp xướng', pos: 'noun' },
      { word: 'singen', meaning_vi: 'hát', pos: 'verb' },
      { word: 'spielen', meaning_vi: 'chơi (nhạc cụ)', pos: 'verb' },
    ]
  },

  // Art & Creativity
  art_creativity: {
    level: 'B1',
    words: [
      { word: 'Kunst', meaning_vi: 'nghệ thuật', pos: 'noun' },
      { word: 'Künstler', meaning_vi: 'nghệ sĩ', pos: 'noun' },
      { word: 'Maler', meaning_vi: 'họa sĩ', pos: 'noun' },
      { word: 'Gemälde', meaning_vi: 'bức tranh', pos: 'noun' },
      { word: 'Zeichnung', meaning_vi: 'bản vẽ', pos: 'noun' },
      { word: 'Skulptur', meaning_vi: 'tác phẩm điêu khắc', pos: 'noun' },
      { word: 'Bildhauer', meaning_vi: 'nhà điêu khắc', pos: 'noun' },
      { word: 'Fotograf', meaning_vi: 'nhiếp ảnh gia', pos: 'noun' },
      { word: 'Fotografie', meaning_vi: 'nhiếp ảnh', pos: 'noun' },
      { word: 'Galerie', meaning_vi: 'phòng tranh', pos: 'noun' },
      { word: 'Ausstellung', meaning_vi: 'triển lãm', pos: 'noun' },
      { word: 'Kreativität', meaning_vi: 'sáng tạo', pos: 'noun' },
      { word: 'Inspiration', meaning_vi: 'cảm hứng', pos: 'noun' },
      { word: 'malen', meaning_vi: 'vẽ', pos: 'verb' },
      { word: 'zeichnen', meaning_vi: 'vẽ', pos: 'verb' },
      { word: 'gestalten', meaning_vi: 'thiết kế', pos: 'verb' },
      { word: 'kreativ', meaning_vi: 'sáng tạo', pos: 'adjective' },
      { word: 'künstlerisch', meaning_vi: 'nghệ thuật', pos: 'adjective' },
      { word: 'originell', meaning_vi: 'độc đáo', pos: 'adjective' },
      { word: 'modern', meaning_vi: 'hiện đại', pos: 'adjective' },
    ]
  },

  // Religion & Spirituality
  religion_spirituality: {
    level: 'B1',
    words: [
      { word: 'Religion', meaning_vi: 'tôn giáo', pos: 'noun' },
      { word: 'Glaube', meaning_vi: 'đức tin', pos: 'noun' },
      { word: 'Gott', meaning_vi: 'Chúa', pos: 'noun' },
      { word: 'Kirche', meaning_vi: 'nhà thờ', pos: 'noun' },
      { word: 'Moschee', meaning_vi: 'nhà thờ Hồi giáo', pos: 'noun' },
      { word: 'Tempel', meaning_vi: 'đền', pos: 'noun' },
      { word: 'Synagoge', meaning_vi: 'giáo đường Do Thái', pos: 'noun' },
      { word: 'Gebet', meaning_vi: 'lời cầu nguyện', pos: 'noun' },
      { word: 'Gottesdienst', meaning_vi: 'buổi lễ', pos: 'noun' },
      { word: 'Bibel', meaning_vi: 'Kinh thánh', pos: 'noun' },
      { word: 'Koran', meaning_vi: 'Kinh Koran', pos: 'noun' },
      { word: 'Priester', meaning_vi: 'linh mục', pos: 'noun' },
      { word: 'Pastor', meaning_vi: 'mục sư', pos: 'noun' },
      { word: 'Mönch', meaning_vi: 'tu sĩ', pos: 'noun' },
      { word: 'Nonne', meaning_vi: 'nữ tu', pos: 'noun' },
      { word: 'heilig', meaning_vi: 'thiêng liêng', pos: 'adjective' },
      { word: 'religiös', meaning_vi: 'tôn giáo', pos: 'adjective' },
      { word: 'spirituell', meaning_vi: 'tâm linh', pos: 'adjective' },
      { word: 'beten', meaning_vi: 'cầu nguyện', pos: 'verb' },
      { word: 'glauben', meaning_vi: 'tin', pos: 'verb' },
    ]
  },

  // Military & Security
  military_security: {
    level: 'B2',
    words: [
      { word: 'Militär', meaning_vi: 'quân đội', pos: 'noun' },
      { word: 'Armee', meaning_vi: 'quân đội', pos: 'noun' },
      { word: 'Soldat', meaning_vi: 'người lính', pos: 'noun' },
      { word: 'Offizier', meaning_vi: 'sĩ quan', pos: 'noun' },
      { word: 'General', meaning_vi: 'tướng', pos: 'noun' },
      { word: 'Krieg', meaning_vi: 'chiến tranh', pos: 'noun' },
      { word: 'Frieden', meaning_vi: 'hòa bình', pos: 'noun' },
      { word: 'Waffe', meaning_vi: 'vũ khí', pos: 'noun' },
      { word: 'Panzer', meaning_vi: 'xe tăng', pos: 'noun' },
      { word: 'Hubschrauber', meaning_vi: 'trực thăng', pos: 'noun' },
      { word: 'Bombe', meaning_vi: 'bom', pos: 'noun' },
      { word: 'Rakete', meaning_vi: 'tên lửa', pos: 'noun' },
      { word: 'Sicherheit', meaning_vi: 'an ninh', pos: 'noun' },
      { word: 'Gefahr', meaning_vi: 'nguy hiểm', pos: 'noun' },
      { word: 'Bedrohung', meaning_vi: 'mối đe dọa', pos: 'noun' },
      { word: 'Verteidigung', meaning_vi: 'phòng thủ', pos: 'noun' },
      { word: 'Angriff', meaning_vi: 'tấn công', pos: 'noun' },
      { word: 'kämpfen', meaning_vi: 'chiến đấu', pos: 'verb' },
      { word: 'verteidigen', meaning_vi: 'bảo vệ', pos: 'verb' },
      { word: 'angreifen', meaning_vi: 'tấn công', pos: 'verb' },
    ]
  },

  // Space & Universe
  space_universe: {
    level: 'B1',
    words: [
      { word: 'Universum', meaning_vi: 'vũ trụ', pos: 'noun' },
      { word: 'Weltraum', meaning_vi: 'không gian vũ trụ', pos: 'noun' },
      { word: 'Planet', meaning_vi: 'hành tinh', pos: 'noun' },
      { word: 'Erde', meaning_vi: 'Trái đất', pos: 'noun' },
      { word: 'Mond', meaning_vi: 'Mặt trăng', pos: 'noun' },
      { word: 'Sonne', meaning_vi: 'Mặt trời', pos: 'noun' },
      { word: 'Stern', meaning_vi: 'ngôi sao', pos: 'noun' },
      { word: 'Galaxie', meaning_vi: 'thiên hà', pos: 'noun' },
      { word: 'Komet', meaning_vi: 'sao chổi', pos: 'noun' },
      { word: 'Asteroid', meaning_vi: 'tiểu hành tinh', pos: 'noun' },
      { word: 'Rakete', meaning_vi: 'tên lửa', pos: 'noun' },
      { word: 'Raumschiff', meaning_vi: 'tàu vũ trụ', pos: 'noun' },
      { word: 'Satellit', meaning_vi: 'vệ tinh', pos: 'noun' },
      { word: 'Astronaut', meaning_vi: 'phi hành gia', pos: 'noun' },
      { word: 'Teleskop', meaning_vi: 'kính thiên văn', pos: 'noun' },
      { word: 'Umlaufbahn', meaning_vi: 'quỹ đạo', pos: 'noun' },
      { word: 'Schwerkraft', meaning_vi: 'trọng lực', pos: 'noun' },
      { word: 'Atmosphäre', meaning_vi: 'khí quyển', pos: 'noun' },
      { word: 'Schwarzes Loch', meaning_vi: 'hố đen', pos: 'noun' },
      { word: 'Sonnensystem', meaning_vi: 'hệ mặt trời', pos: 'noun' },
    ]
  },

  // Natural Disasters & Events
  natural_events: {
    level: 'B1',
    words: [
      { word: 'Katastrophe', meaning_vi: 'thảm họa', pos: 'noun' },
      { word: 'Naturkatastrophe', meaning_vi: 'thiên tai', pos: 'noun' },
      { word: 'Erdbeben', meaning_vi: 'động đất', pos: 'noun' },
      { word: 'Tsunami', meaning_vi: 'sóng thần', pos: 'noun' },
      { word: 'Überschwemmung', meaning_vi: 'lũ lụt', pos: 'noun' },
      { word: 'Dürre', meaning_vi: 'hạn hán', pos: 'noun' },
      { word: 'Hurrikan', meaning_vi: 'bão', pos: 'noun' },
      { word: 'Tornado', meaning_vi: 'lốc xoáy', pos: 'noun' },
      { word: 'Vulkan', meaning_vi: 'núi lửa', pos: 'noun' },
      { word: 'Ausbruch', meaning_vi: 'phun trào', pos: 'noun' },
      { word: 'Lawine', meaning_vi: 'tuyết lở', pos: 'noun' },
      { word: 'Erdrutsch', meaning_vi: 'sạt lở', pos: 'noun' },
      { word: 'Waldbrand', meaning_vi: 'cháy rừng', pos: 'noun' },
      { word: 'Blitz', meaning_vi: 'sét', pos: 'noun' },
      { word: 'Hagel', meaning_vi: 'mưa đá', pos: 'noun' },
      { word: 'Evakuierung', meaning_vi: 'sơ tán', pos: 'noun' },
      { word: 'Rettung', meaning_vi: 'cứu hộ', pos: 'noun' },
      { word: 'Hilfe', meaning_vi: 'cứu trợ', pos: 'noun' },
      { word: 'Opfer', meaning_vi: 'nạn nhân', pos: 'noun' },
      { word: 'Schaden', meaning_vi: 'thiệt hại', pos: 'noun' },
    ]
  },

  // Mathematics & Numbers Extended
  math_numbers: {
    level: 'A2',
    words: [
      { word: 'Zahl', meaning_vi: 'số', pos: 'noun' },
      { word: 'Nummer', meaning_vi: 'số', pos: 'noun' },
      { word: 'Mathematik', meaning_vi: 'toán học', pos: 'noun' },
      { word: 'Rechnung', meaning_vi: 'phép tính', pos: 'noun' },
      { word: 'Addition', meaning_vi: 'phép cộng', pos: 'noun' },
      { word: 'Subtraktion', meaning_vi: 'phép trừ', pos: 'noun' },
      { word: 'Multiplikation', meaning_vi: 'phép nhân', pos: 'noun' },
      { word: 'Division', meaning_vi: 'phép chia', pos: 'noun' },
      { word: 'Summe', meaning_vi: 'tổng', pos: 'noun' },
      { word: 'Differenz', meaning_vi: 'hiệu', pos: 'noun' },
      { word: 'Produkt', meaning_vi: 'tích', pos: 'noun' },
      { word: 'Quotient', meaning_vi: 'thương', pos: 'noun' },
      { word: 'Bruch', meaning_vi: 'phân số', pos: 'noun' },
      { word: 'Prozent', meaning_vi: 'phần trăm', pos: 'noun' },
      { word: 'Durchschnitt', meaning_vi: 'trung bình', pos: 'noun' },
      { word: 'rechnen', meaning_vi: 'tính toán', pos: 'verb' },
      { word: 'addieren', meaning_vi: 'cộng', pos: 'verb' },
      { word: 'subtrahieren', meaning_vi: 'trừ', pos: 'verb' },
      { word: 'multiplizieren', meaning_vi: 'nhân', pos: 'verb' },
      { word: 'dividieren', meaning_vi: 'chia', pos: 'verb' },
    ]
  },

  // Geometry & Space
  geometry_space: {
    level: 'B1',
    words: [
      { word: 'Geometrie', meaning_vi: 'hình học', pos: 'noun' },
      { word: 'Kreis', meaning_vi: 'hình tròn', pos: 'noun' },
      { word: 'Quadrat', meaning_vi: 'hình vuông', pos: 'noun' },
      { word: 'Rechteck', meaning_vi: 'hình chữ nhật', pos: 'noun' },
      { word: 'Dreieck', meaning_vi: 'tam giác', pos: 'noun' },
      { word: 'Kugel', meaning_vi: 'hình cầu', pos: 'noun' },
      { word: 'Würfel', meaning_vi: 'hình lập phương', pos: 'noun' },
      { word: 'Zylinder', meaning_vi: 'hình trụ', pos: 'noun' },
      { word: 'Pyramide', meaning_vi: 'hình chóp', pos: 'noun' },
      { word: 'Kegel', meaning_vi: 'hình nón', pos: 'noun' },
      { word: 'Fläche', meaning_vi: 'diện tích', pos: 'noun' },
      { word: 'Volumen', meaning_vi: 'thể tích', pos: 'noun' },
      { word: 'Umfang', meaning_vi: 'chu vi', pos: 'noun' },
      { word: 'Radius', meaning_vi: 'bán kính', pos: 'noun' },
      { word: 'Durchmesser', meaning_vi: 'đường kính', pos: 'noun' },
      { word: 'Winkel', meaning_vi: 'góc', pos: 'noun' },
      { word: 'Parallel', meaning_vi: 'song song', pos: 'adjective' },
      { word: 'senkrecht', meaning_vi: 'vuông góc', pos: 'adjective' },
      { word: 'rund', meaning_vi: 'tròn', pos: 'adjective' },
      { word: 'eckig', meaning_vi: 'có góc cạnh', pos: 'adjective' },
    ]
  },

  // Internet & Digital Life
  internet_digital: {
    level: 'B1',
    words: [
      { word: 'Internet', meaning_vi: 'internet', pos: 'noun' },
      { word: 'Website', meaning_vi: 'trang web', pos: 'noun' },
      { word: 'Webseite', meaning_vi: 'trang web', pos: 'noun' },
      { word: 'Homepage', meaning_vi: 'trang chủ', pos: 'noun' },
      { word: 'Suchmaschine', meaning_vi: 'công cụ tìm kiếm', pos: 'noun' },
      { word: 'Browser', meaning_vi: 'trình duyệt', pos: 'noun' },
      { word: 'Download', meaning_vi: 'tải xuống', pos: 'noun' },
      { word: 'Upload', meaning_vi: 'tải lên', pos: 'noun' },
      { word: 'Datenschutz', meaning_vi: 'bảo mật dữ liệu', pos: 'noun' },
      { word: 'Privatsphäre', meaning_vi: 'quyền riêng tư', pos: 'noun' },
      { word: 'Virus', meaning_vi: 'virus', pos: 'noun' },
      { word: 'Spam', meaning_vi: 'thư rác', pos: 'noun' },
      { word: 'Phishing', meaning_vi: 'lừa đảo', pos: 'noun' },
      { word: 'Hacker', meaning_vi: 'hacker', pos: 'noun' },
      { word: 'Passwort', meaning_vi: 'mật khẩu', pos: 'noun' },
      { word: 'Anmeldung', meaning_vi: 'đăng nhập', pos: 'noun' },
      { word: 'Abmeldung', meaning_vi: 'đăng xuất', pos: 'noun' },
      { word: 'surfen', meaning_vi: 'lướt web', pos: 'verb' },
      { word: 'googeln', meaning_vi: 'tìm kiếm trên Google', pos: 'verb' },
      { word: 'herunterladen', meaning_vi: 'tải xuống', pos: 'verb' },
    ]
  },

  // More Common Adjectives
  common_adjectives_ext: {
    level: 'A2',
    words: [
      { word: 'alt', meaning_vi: 'già, cũ', pos: 'adjective' },
      { word: 'neu', meaning_vi: 'mới', pos: 'adjective' },
      { word: 'jung', meaning_vi: 'trẻ', pos: 'adjective' },
      { word: 'groß', meaning_vi: 'to, lớn', pos: 'adjective' },
      { word: 'klein', meaning_vi: 'nhỏ', pos: 'adjective' },
      { word: 'gut', meaning_vi: 'tốt', pos: 'adjective' },
      { word: 'schlecht', meaning_vi: 'xấu, kém', pos: 'adjective' },
      { word: 'schön', meaning_vi: 'đẹp', pos: 'adjective' },
      { word: 'teuer', meaning_vi: 'đắt', pos: 'adjective' },
      { word: 'billig', meaning_vi: 'rẻ', pos: 'adjective' },
      { word: 'schnell', meaning_vi: 'nhanh', pos: 'adjective' },
      { word: 'langsam', meaning_vi: 'chậm', pos: 'adjective' },
      { word: 'einfach', meaning_vi: 'đơn giản', pos: 'adjective' },
      { word: 'schwierig', meaning_vi: 'khó', pos: 'adjective' },
      { word: 'wichtig', meaning_vi: 'quan trọng', pos: 'adjective' },
      { word: 'gleich', meaning_vi: 'giống nhau', pos: 'adjective' },
      { word: 'anders', meaning_vi: 'khác', pos: 'adjective' },
      { word: 'fertig', meaning_vi: 'xong', pos: 'adjective' },
      { word: 'bereit', meaning_vi: 'sẵn sàng', pos: 'adjective' },
      { word: 'möglich', meaning_vi: 'có thể', pos: 'adjective' },
    ]
  },
};

// Generate vocabulary
function generateVocabulary() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║    📚 MINE VOCABULARY BATCH 7 - ADDITIONAL ESSENTIALS      ║');
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
