#!/usr/bin/env node
/**
 * Mine Vocabulary Batch 10 - Everyday & Practical Words (450 words)
 * Topics: Shopping, Restaurant, Hotel, Airport, Public Transport,
 * Doctor Visit, Sports, Hobbies, Cooking, Gardening, Pets
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT = path.join(__dirname, '../data/quality-expansion/batch10-vocabulary.json');

const TOPICS = {
  shopping: {
    topic: 'Mua sam',
    level: 'A2',
    words: [
      { word: 'der Einkauf', pos: 'noun', meaning_vi: 'việc mua sắm' },
      { word: 'der Warenkorb', pos: 'noun', meaning_vi: 'giỏ hàng' },
      { word: 'die Kasse', pos: 'noun', meaning_vi: 'quầy thu ngân' },
      { word: 'der Kassenbon', pos: 'noun', meaning_vi: 'hóa đơn' },
      { word: 'das Angebot', pos: 'noun', meaning_vi: 'khuyến mãi' },
      { word: 'der Rabatt', pos: 'noun', meaning_vi: 'giảm giá' },
      { word: 'der Ausverkauf', pos: 'noun', meaning_vi: 'bán hết hàng' },
      { word: 'die Umkleidekabine', pos: 'noun', meaning_vi: 'phòng thử đồ' },
      { word: 'die Größe', pos: 'noun', meaning_vi: 'kích cỡ' },
      { word: 'die Rückgabe', pos: 'noun', meaning_vi: 'trả hàng' },
      { word: 'der Umtausch', pos: 'noun', meaning_vi: 'đổi hàng' },
      { word: 'die Garantie', pos: 'noun', meaning_vi: 'bảo hành' },
      { word: 'bezahlen', pos: 'verb', meaning_vi: 'thanh toán' },
      { word: 'anprobieren', pos: 'verb', meaning_vi: 'thử (quần áo)' },
      { word: 'umtauschen', pos: 'verb', meaning_vi: 'đổi hàng' },
      { word: 'zurückgeben', pos: 'verb', meaning_vi: 'trả lại' },
      { word: 'reduziert', pos: 'adj', meaning_vi: 'giảm giá' },
      { word: 'ausverkauft', pos: 'adj', meaning_vi: 'hết hàng' },
      { word: 'günstig', pos: 'adj', meaning_vi: 'rẻ' },
      { word: 'teuer', pos: 'adj', meaning_vi: 'đắt' },
    ]
  },

  restaurant: {
    topic: 'Nha hang',
    level: 'A2',
    words: [
      { word: 'die Speisekarte', pos: 'noun', meaning_vi: 'thực đơn' },
      { word: 'die Vorspeise', pos: 'noun', meaning_vi: 'món khai vị' },
      { word: 'das Hauptgericht', pos: 'noun', meaning_vi: 'món chính' },
      { word: 'die Nachspeise', pos: 'noun', meaning_vi: 'món tráng miệng' },
      { word: 'die Beilage', pos: 'noun', meaning_vi: 'món ăn kèm' },
      { word: 'das Tagesgericht', pos: 'noun', meaning_vi: 'món trong ngày' },
      { word: 'der Kellner', pos: 'noun', meaning_vi: 'bồi bàn nam' },
      { word: 'die Kellnerin', pos: 'noun', meaning_vi: 'bồi bàn nữ' },
      { word: 'das Trinkgeld', pos: 'noun', meaning_vi: 'tiền tip' },
      { word: 'die Reservierung', pos: 'noun', meaning_vi: 'đặt chỗ' },
      { word: 'bestellen', pos: 'verb', meaning_vi: 'gọi món' },
      { word: 'servieren', pos: 'verb', meaning_vi: 'phục vụ' },
      { word: 'reservieren', pos: 'verb', meaning_vi: 'đặt trước' },
      { word: 'empfehlen', pos: 'verb', meaning_vi: 'gợi ý' },
      { word: 'abräumen', pos: 'verb', meaning_vi: 'dọn bàn' },
      { word: 'lecker', pos: 'adj', meaning_vi: 'ngon' },
      { word: 'scharf', pos: 'adj', meaning_vi: 'cay' },
      { word: 'mild', pos: 'adj', meaning_vi: 'nhẹ' },
      { word: 'vegetarisch', pos: 'adj', meaning_vi: 'chay' },
      { word: 'vegan', pos: 'adj', meaning_vi: 'thuần chay' },
    ]
  },

  hotel: {
    topic: 'Khach san',
    level: 'A2',
    words: [
      { word: 'die Rezeption', pos: 'noun', meaning_vi: 'lễ tân' },
      { word: 'das Einzelzimmer', pos: 'noun', meaning_vi: 'phòng đơn' },
      { word: 'das Doppelzimmer', pos: 'noun', meaning_vi: 'phòng đôi' },
      { word: 'die Suite', pos: 'noun', meaning_vi: 'phòng suite' },
      { word: 'der Zimmerschlüssel', pos: 'noun', meaning_vi: 'chìa khóa phòng' },
      { word: 'die Zimmerservice', pos: 'noun', meaning_vi: 'dịch vụ phòng' },
      { word: 'das Frühstücksbuffet', pos: 'noun', meaning_vi: 'buffet sáng' },
      { word: 'die Minibar', pos: 'noun', meaning_vi: 'minibar' },
      { word: 'der Safe', pos: 'noun', meaning_vi: 'két an toàn' },
      { word: 'die Klimaanlage', pos: 'noun', meaning_vi: 'điều hòa' },
      { word: 'einchecken', pos: 'verb', meaning_vi: 'nhận phòng' },
      { word: 'auschecken', pos: 'verb', meaning_vi: 'trả phòng' },
      { word: 'buchen', pos: 'verb', meaning_vi: 'đặt phòng' },
      { word: 'stornieren', pos: 'verb', meaning_vi: 'hủy đặt' },
      { word: 'übernachten', pos: 'verb', meaning_vi: 'nghỉ qua đêm' },
      { word: 'inklusive', pos: 'adj', meaning_vi: 'bao gồm' },
      { word: 'exklusive', pos: 'adj', meaning_vi: 'không bao gồm' },
      { word: 'gebucht', pos: 'adj', meaning_vi: 'đã đặt' },
      { word: 'verfügbar', pos: 'adj', meaning_vi: 'còn trống' },
      { word: 'ausgebucht', pos: 'adj', meaning_vi: 'hết phòng' },
    ]
  },

  airport: {
    topic: 'San bay',
    level: 'B1',
    words: [
      { word: 'der Flughafen', pos: 'noun', meaning_vi: 'sân bay' },
      { word: 'der Terminal', pos: 'noun', meaning_vi: 'nhà ga' },
      { word: 'der Check-in', pos: 'noun', meaning_vi: 'làm thủ tục' },
      { word: 'die Bordkarte', pos: 'noun', meaning_vi: 'thẻ lên máy bay' },
      { word: 'das Gepäck', pos: 'noun', meaning_vi: 'hành lý' },
      { word: 'das Handgepäck', pos: 'noun', meaning_vi: 'hành lý xách tay' },
      { word: 'die Gepäckausgabe', pos: 'noun', meaning_vi: 'nơi nhận hành lý' },
      { word: 'die Sicherheitskontrolle', pos: 'noun', meaning_vi: 'kiểm tra an ninh' },
      { word: 'der Zoll', pos: 'noun', meaning_vi: 'hải quan' },
      { word: 'das Gate', pos: 'noun', meaning_vi: 'cửa khởi hành' },
      { word: 'der Abflug', pos: 'noun', meaning_vi: 'khởi hành' },
      { word: 'die Ankunft', pos: 'noun', meaning_vi: 'đến nơi' },
      { word: 'die Verspätung', pos: 'noun', meaning_vi: 'trễ chuyến' },
      { word: 'der Anschlussflug', pos: 'noun', meaning_vi: 'chuyến bay nối chuyến' },
      { word: 'abfliegen', pos: 'verb', meaning_vi: 'cất cánh' },
      { word: 'landen', pos: 'verb', meaning_vi: 'hạ cánh' },
      { word: 'umsteigen', pos: 'verb', meaning_vi: 'đổi chuyến' },
      { word: 'verspätet', pos: 'adj', meaning_vi: 'bị trễ' },
      { word: 'pünktlich', pos: 'adj', meaning_vi: 'đúng giờ' },
      { word: 'gestrichen', pos: 'adj', meaning_vi: 'bị hủy' },
    ]
  },

  publicTransport: {
    topic: 'Giao thong cong cong',
    level: 'A2',
    words: [
      { word: 'die U-Bahn', pos: 'noun', meaning_vi: 'tàu điện ngầm' },
      { word: 'die S-Bahn', pos: 'noun', meaning_vi: 'tàu ngoại ô' },
      { word: 'die Straßenbahn', pos: 'noun', meaning_vi: 'tàu điện' },
      { word: 'die Haltestelle', pos: 'noun', meaning_vi: 'trạm dừng' },
      { word: 'der Bahnsteig', pos: 'noun', meaning_vi: 'sân ga' },
      { word: 'die Fahrkarte', pos: 'noun', meaning_vi: 'vé' },
      { word: 'der Fahrplan', pos: 'noun', meaning_vi: 'lịch trình' },
      { word: 'die Monatskarte', pos: 'noun', meaning_vi: 'vé tháng' },
      { word: 'die Tageskarte', pos: 'noun', meaning_vi: 'vé ngày' },
      { word: 'der Fahrschein', pos: 'noun', meaning_vi: 'vé xe' },
      { word: 'der Kontrolleur', pos: 'noun', meaning_vi: 'người soát vé' },
      { word: 'die Endstation', pos: 'noun', meaning_vi: 'ga cuối' },
      { word: 'einsteigen', pos: 'verb', meaning_vi: 'lên xe' },
      { word: 'aussteigen', pos: 'verb', meaning_vi: 'xuống xe' },
      { word: 'entwerten', pos: 'verb', meaning_vi: 'đóng dấu vé' },
      { word: 'umsteigen', pos: 'verb', meaning_vi: 'chuyển tuyến' },
      { word: 'halten', pos: 'verb', meaning_vi: 'dừng' },
      { word: 'abfahren', pos: 'verb', meaning_vi: 'khởi hành' },
      { word: 'ankommen', pos: 'verb', meaning_vi: 'đến' },
      { word: 'überfüllt', pos: 'adj', meaning_vi: 'đông đúc' },
    ]
  },

  doctorVisit: {
    topic: 'Di kham bac si',
    level: 'B1',
    words: [
      { word: 'die Arztpraxis', pos: 'noun', meaning_vi: 'phòng khám' },
      { word: 'der Termin', pos: 'noun', meaning_vi: 'cuộc hẹn' },
      { word: 'das Wartezimmer', pos: 'noun', meaning_vi: 'phòng chờ' },
      { word: 'die Versichertenkarte', pos: 'noun', meaning_vi: 'thẻ bảo hiểm' },
      { word: 'die Krankmeldung', pos: 'noun', meaning_vi: 'giấy nghỉ bệnh' },
      { word: 'die Überweisung', pos: 'noun', meaning_vi: 'giấy chuyển viện' },
      { word: 'das Blutbild', pos: 'noun', meaning_vi: 'xét nghiệm máu' },
      { word: 'der Röntgen', pos: 'noun', meaning_vi: 'chụp X-quang' },
      { word: 'die Ultraschall', pos: 'noun', meaning_vi: 'siêu âm' },
      { word: 'die Blutdruckmessung', pos: 'noun', meaning_vi: 'đo huyết áp' },
      { word: 'untersuchen', pos: 'verb', meaning_vi: 'khám' },
      { word: 'abtasten', pos: 'verb', meaning_vi: 'sờ nắn' },
      { word: 'abhören', pos: 'verb', meaning_vi: 'nghe' },
      { word: 'verschreiben', pos: 'verb', meaning_vi: 'kê đơn' },
      { word: 'überweisen', pos: 'verb', meaning_vi: 'chuyển viện' },
      { word: 'krank', pos: 'adj', meaning_vi: 'ốm' },
      { word: 'gesund', pos: 'adj', meaning_vi: 'khỏe mạnh' },
      { word: 'ansteckend', pos: 'adj', meaning_vi: 'lây nhiễm' },
      { word: 'verschreibungspflichtig', pos: 'adj', meaning_vi: 'cần kê đơn' },
      { word: 'rezeptfrei', pos: 'adj', meaning_vi: 'không cần đơn' },
    ]
  },

  sports: {
    topic: 'The thao',
    level: 'A2',
    words: [
      { word: 'der Sport', pos: 'noun', meaning_vi: 'thể thao' },
      { word: 'das Training', pos: 'noun', meaning_vi: 'tập luyện' },
      { word: 'der Wettkampf', pos: 'noun', meaning_vi: 'cuộc thi' },
      { word: 'die Mannschaft', pos: 'noun', meaning_vi: 'đội' },
      { word: 'der Trainer', pos: 'noun', meaning_vi: 'huấn luyện viên' },
      { word: 'das Tor', pos: 'noun', meaning_vi: 'bàn thắng' },
      { word: 'der Schiedsrichter', pos: 'noun', meaning_vi: 'trọng tài' },
      { word: 'die Halbzeit', pos: 'noun', meaning_vi: 'hiệp' },
      { word: 'das Finale', pos: 'noun', meaning_vi: 'trận chung kết' },
      { word: 'die Meisterschaft', pos: 'noun', meaning_vi: 'giải vô địch' },
      { word: 'trainieren', pos: 'verb', meaning_vi: 'tập luyện' },
      { word: 'gewinnen', pos: 'verb', meaning_vi: 'thắng' },
      { word: 'verlieren', pos: 'verb', meaning_vi: 'thua' },
      { word: 'spielen', pos: 'verb', meaning_vi: 'chơi' },
      { word: 'schießen', pos: 'verb', meaning_vi: 'sút' },
      { word: 'laufen', pos: 'verb', meaning_vi: 'chạy' },
      { word: 'schwimmen', pos: 'verb', meaning_vi: 'bơi' },
      { word: 'sportlich', pos: 'adj', meaning_vi: 'thể thao' },
      { word: 'fit', pos: 'adj', meaning_vi: 'khỏe mạnh' },
      { word: 'unentschieden', pos: 'adj', meaning_vi: 'hòa' },
    ]
  },

  hobbies: {
    topic: 'So thich',
    level: 'A2',
    words: [
      { word: 'das Hobby', pos: 'noun', meaning_vi: 'sở thích' },
      { word: 'die Freizeit', pos: 'noun', meaning_vi: 'thời gian rảnh' },
      { word: 'das Lesen', pos: 'noun', meaning_vi: 'đọc sách' },
      { word: 'das Kochen', pos: 'noun', meaning_vi: 'nấu ăn' },
      { word: 'das Backen', pos: 'noun', meaning_vi: 'làm bánh' },
      { word: 'das Wandern', pos: 'noun', meaning_vi: 'đi bộ đường dài' },
      { word: 'das Radfahren', pos: 'noun', meaning_vi: 'đạp xe' },
      { word: 'das Fotografieren', pos: 'noun', meaning_vi: 'chụp ảnh' },
      { word: 'das Malen', pos: 'noun', meaning_vi: 'vẽ tranh' },
      { word: 'das Stricken', pos: 'noun', meaning_vi: 'đan len' },
      { word: 'das Nähen', pos: 'noun', meaning_vi: 'may vá' },
      { word: 'das Basteln', pos: 'noun', meaning_vi: 'thủ công' },
      { word: 'sammeln', pos: 'verb', meaning_vi: 'sưu tầm' },
      { word: 'zeichnen', pos: 'verb', meaning_vi: 'vẽ' },
      { word: 'wandern', pos: 'verb', meaning_vi: 'đi bộ đường dài' },
      { word: 'angeln', pos: 'verb', meaning_vi: 'câu cá' },
      { word: 'campen', pos: 'verb', meaning_vi: 'cắm trại' },
      { word: 'reiten', pos: 'verb', meaning_vi: 'cưỡi ngựa' },
      { word: 'entspannend', pos: 'adj', meaning_vi: 'thư giãn' },
      { word: 'kreativ', pos: 'adj', meaning_vi: 'sáng tạo' },
    ]
  },

  cooking: {
    topic: 'Nau an',
    level: 'A2',
    words: [
      { word: 'das Rezept', pos: 'noun', meaning_vi: 'công thức' },
      { word: 'die Zutat', pos: 'noun', meaning_vi: 'nguyên liệu' },
      { word: 'die Pfanne', pos: 'noun', meaning_vi: 'chảo' },
      { word: 'der Topf', pos: 'noun', meaning_vi: 'nồi' },
      { word: 'der Ofen', pos: 'noun', meaning_vi: 'lò nướng' },
      { word: 'der Herd', pos: 'noun', meaning_vi: 'bếp' },
      { word: 'das Schneidebrett', pos: 'noun', meaning_vi: 'thớt' },
      { word: 'das Messer', pos: 'noun', meaning_vi: 'dao' },
      { word: 'der Löffel', pos: 'noun', meaning_vi: 'muỗng' },
      { word: 'die Gabel', pos: 'noun', meaning_vi: 'nĩa' },
      { word: 'schneiden', pos: 'verb', meaning_vi: 'cắt' },
      { word: 'braten', pos: 'verb', meaning_vi: 'chiên/xào' },
      { word: 'kochen', pos: 'verb', meaning_vi: 'nấu' },
      { word: 'backen', pos: 'verb', meaning_vi: 'nướng bánh' },
      { word: 'grillen', pos: 'verb', meaning_vi: 'nướng' },
      { word: 'würzen', pos: 'verb', meaning_vi: 'nêm gia vị' },
      { word: 'rühren', pos: 'verb', meaning_vi: 'khuấy' },
      { word: 'schälen', pos: 'verb', meaning_vi: 'gọt vỏ' },
      { word: 'roh', pos: 'adj', meaning_vi: 'sống' },
      { word: 'gar', pos: 'adj', meaning_vi: 'chín' },
    ]
  },

  gardening: {
    topic: 'Lam vuon',
    level: 'B1',
    words: [
      { word: 'der Garten', pos: 'noun', meaning_vi: 'vườn' },
      { word: 'die Pflanze', pos: 'noun', meaning_vi: 'cây' },
      { word: 'die Blume', pos: 'noun', meaning_vi: 'hoa' },
      { word: 'der Baum', pos: 'noun', meaning_vi: 'cây to' },
      { word: 'der Strauch', pos: 'noun', meaning_vi: 'bụi cây' },
      { word: 'das Gemüse', pos: 'noun', meaning_vi: 'rau củ' },
      { word: 'das Beet', pos: 'noun', meaning_vi: 'luống' },
      { word: 'der Rasen', pos: 'noun', meaning_vi: 'bãi cỏ' },
      { word: 'der Dünger', pos: 'noun', meaning_vi: 'phân bón' },
      { word: 'die Gießkanne', pos: 'noun', meaning_vi: 'bình tưới' },
      { word: 'der Rasenmäher', pos: 'noun', meaning_vi: 'máy cắt cỏ' },
      { word: 'die Schaufel', pos: 'noun', meaning_vi: 'xẻng' },
      { word: 'pflanzen', pos: 'verb', meaning_vi: 'trồng' },
      { word: 'gießen', pos: 'verb', meaning_vi: 'tưới' },
      { word: 'düngen', pos: 'verb', meaning_vi: 'bón phân' },
      { word: 'mähen', pos: 'verb', meaning_vi: 'cắt cỏ' },
      { word: 'jäten', pos: 'verb', meaning_vi: 'nhổ cỏ' },
      { word: 'ernten', pos: 'verb', meaning_vi: 'thu hoạch' },
      { word: 'beschneiden', pos: 'verb', meaning_vi: 'tỉa cây' },
      { word: 'biologisch', pos: 'adj', meaning_vi: 'hữu cơ' },
    ]
  },

  pets: {
    topic: 'Thu cung',
    level: 'A2',
    words: [
      { word: 'das Haustier', pos: 'noun', meaning_vi: 'thú cưng' },
      { word: 'der Hund', pos: 'noun', meaning_vi: 'chó' },
      { word: 'die Katze', pos: 'noun', meaning_vi: 'mèo' },
      { word: 'der Vogel', pos: 'noun', meaning_vi: 'chim' },
      { word: 'der Fisch', pos: 'noun', meaning_vi: 'cá' },
      { word: 'das Kaninchen', pos: 'noun', meaning_vi: 'thỏ' },
      { word: 'der Hamster', pos: 'noun', meaning_vi: 'chuột hamster' },
      { word: 'das Aquarium', pos: 'noun', meaning_vi: 'bể cá' },
      { word: 'der Käfig', pos: 'noun', meaning_vi: 'lồng' },
      { word: 'die Leine', pos: 'noun', meaning_vi: 'dây xích' },
      { word: 'das Futter', pos: 'noun', meaning_vi: 'thức ăn' },
      { word: 'der Tierarzt', pos: 'noun', meaning_vi: 'bác sĩ thú y' },
      { word: 'füttern', pos: 'verb', meaning_vi: 'cho ăn' },
      { word: 'Gassi gehen', pos: 'verb', meaning_vi: 'dắt chó đi dạo' },
      { word: 'streicheln', pos: 'verb', meaning_vi: 'vuốt ve' },
      { word: 'bellen', pos: 'verb', meaning_vi: 'sủa' },
      { word: 'miauen', pos: 'verb', meaning_vi: 'kêu meo meo' },
      { word: 'zahm', pos: 'adj', meaning_vi: 'thuần' },
      { word: 'wild', pos: 'adj', meaning_vi: 'hoang dã' },
      { word: 'treu', pos: 'adj', meaning_vi: 'trung thành' },
    ]
  },

  furniture: {
    topic: 'Noi that',
    level: 'A2',
    words: [
      { word: 'das Möbel', pos: 'noun', meaning_vi: 'đồ nội thất' },
      { word: 'das Sofa', pos: 'noun', meaning_vi: 'ghế sofa' },
      { word: 'der Sessel', pos: 'noun', meaning_vi: 'ghế bành' },
      { word: 'der Schrank', pos: 'noun', meaning_vi: 'tủ' },
      { word: 'die Kommode', pos: 'noun', meaning_vi: 'tủ ngăn kéo' },
      { word: 'das Regal', pos: 'noun', meaning_vi: 'kệ' },
      { word: 'der Tisch', pos: 'noun', meaning_vi: 'bàn' },
      { word: 'der Stuhl', pos: 'noun', meaning_vi: 'ghế' },
      { word: 'das Bett', pos: 'noun', meaning_vi: 'giường' },
      { word: 'die Matratze', pos: 'noun', meaning_vi: 'đệm' },
      { word: 'das Kissen', pos: 'noun', meaning_vi: 'gối' },
      { word: 'die Decke', pos: 'noun', meaning_vi: 'chăn' },
      { word: 'der Teppich', pos: 'noun', meaning_vi: 'thảm' },
      { word: 'die Gardine', pos: 'noun', meaning_vi: 'rèm' },
      { word: 'die Lampe', pos: 'noun', meaning_vi: 'đèn' },
      { word: 'der Spiegel', pos: 'noun', meaning_vi: 'gương' },
      { word: 'einrichten', pos: 'verb', meaning_vi: 'bày trí' },
      { word: 'aufbauen', pos: 'verb', meaning_vi: 'lắp ráp' },
      { word: 'bequem', pos: 'adj', meaning_vi: 'thoải mái' },
      { word: 'gemütlich', pos: 'adj', meaning_vi: 'ấm cúng' },
    ]
  },

  bathroom: {
    topic: 'Phong tam',
    level: 'A2',
    words: [
      { word: 'das Badezimmer', pos: 'noun', meaning_vi: 'phòng tắm' },
      { word: 'die Dusche', pos: 'noun', meaning_vi: 'vòi sen' },
      { word: 'die Badewanne', pos: 'noun', meaning_vi: 'bồn tắm' },
      { word: 'das Waschbecken', pos: 'noun', meaning_vi: 'bồn rửa' },
      { word: 'die Toilette', pos: 'noun', meaning_vi: 'bồn cầu' },
      { word: 'der Wasserhahn', pos: 'noun', meaning_vi: 'vòi nước' },
      { word: 'das Handtuch', pos: 'noun', meaning_vi: 'khăn tắm' },
      { word: 'die Seife', pos: 'noun', meaning_vi: 'xà phòng' },
      { word: 'das Shampoo', pos: 'noun', meaning_vi: 'dầu gội' },
      { word: 'das Duschgel', pos: 'noun', meaning_vi: 'sữa tắm' },
      { word: 'die Zahnbürste', pos: 'noun', meaning_vi: 'bàn chải đánh răng' },
      { word: 'die Zahnpasta', pos: 'noun', meaning_vi: 'kem đánh răng' },
      { word: 'der Föhn', pos: 'noun', meaning_vi: 'máy sấy tóc' },
      { word: 'der Rasierer', pos: 'noun', meaning_vi: 'dao cạo' },
      { word: 'duschen', pos: 'verb', meaning_vi: 'tắm vòi sen' },
      { word: 'baden', pos: 'verb', meaning_vi: 'tắm bồn' },
      { word: 'sich waschen', pos: 'verb', meaning_vi: 'rửa' },
      { word: 'abtrocknen', pos: 'verb', meaning_vi: 'lau khô' },
      { word: 'sich rasieren', pos: 'verb', meaning_vi: 'cạo râu' },
      { word: 'feucht', pos: 'adj', meaning_vi: 'ẩm' },
    ]
  },

  kitchen: {
    topic: 'Nha bep',
    level: 'A2',
    words: [
      { word: 'die Küche', pos: 'noun', meaning_vi: 'nhà bếp' },
      { word: 'der Kühlschrank', pos: 'noun', meaning_vi: 'tủ lạnh' },
      { word: 'der Gefrierschrank', pos: 'noun', meaning_vi: 'tủ đông' },
      { word: 'die Mikrowelle', pos: 'noun', meaning_vi: 'lò vi sóng' },
      { word: 'der Toaster', pos: 'noun', meaning_vi: 'máy nướng bánh mì' },
      { word: 'die Kaffeemaschine', pos: 'noun', meaning_vi: 'máy pha cà phê' },
      { word: 'der Wasserkocher', pos: 'noun', meaning_vi: 'ấm đun nước' },
      { word: 'der Mixer', pos: 'noun', meaning_vi: 'máy xay' },
      { word: 'die Spüle', pos: 'noun', meaning_vi: 'bồn rửa bát' },
      { word: 'der Mülleimer', pos: 'noun', meaning_vi: 'thùng rác' },
      { word: 'der Teller', pos: 'noun', meaning_vi: 'đĩa' },
      { word: 'die Tasse', pos: 'noun', meaning_vi: 'tách' },
      { word: 'das Glas', pos: 'noun', meaning_vi: 'ly' },
      { word: 'die Schüssel', pos: 'noun', meaning_vi: 'tô' },
      { word: 'der Becher', pos: 'noun', meaning_vi: 'cốc' },
      { word: 'spülen', pos: 'verb', meaning_vi: 'rửa bát' },
      { word: 'aufräumen', pos: 'verb', meaning_vi: 'dọn dẹp' },
      { word: 'aufbewahren', pos: 'verb', meaning_vi: 'bảo quản' },
      { word: 'sauber', pos: 'adj', meaning_vi: 'sạch' },
      { word: 'schmutzig', pos: 'adj', meaning_vi: 'bẩn' },
    ]
  },

  clothing: {
    topic: 'Quan ao',
    level: 'A2',
    words: [
      { word: 'die Kleidung', pos: 'noun', meaning_vi: 'quần áo' },
      { word: 'das Hemd', pos: 'noun', meaning_vi: 'áo sơ mi' },
      { word: 'die Bluse', pos: 'noun', meaning_vi: 'áo blouse' },
      { word: 'das T-Shirt', pos: 'noun', meaning_vi: 'áo thun' },
      { word: 'der Pullover', pos: 'noun', meaning_vi: 'áo len' },
      { word: 'die Jacke', pos: 'noun', meaning_vi: 'áo khoác' },
      { word: 'der Mantel', pos: 'noun', meaning_vi: 'áo choàng' },
      { word: 'die Hose', pos: 'noun', meaning_vi: 'quần' },
      { word: 'die Jeans', pos: 'noun', meaning_vi: 'quần jeans' },
      { word: 'der Rock', pos: 'noun', meaning_vi: 'váy' },
      { word: 'das Kleid', pos: 'noun', meaning_vi: 'đầm' },
      { word: 'der Anzug', pos: 'noun', meaning_vi: 'bộ vest' },
      { word: 'die Krawatte', pos: 'noun', meaning_vi: 'cà vạt' },
      { word: 'der Schal', pos: 'noun', meaning_vi: 'khăn choàng' },
      { word: 'die Mütze', pos: 'noun', meaning_vi: 'mũ' },
      { word: 'der Handschuh', pos: 'noun', meaning_vi: 'găng tay' },
      { word: 'anziehen', pos: 'verb', meaning_vi: 'mặc' },
      { word: 'ausziehen', pos: 'verb', meaning_vi: 'cởi' },
      { word: 'passen', pos: 'verb', meaning_vi: 'vừa' },
      { word: 'elegant', pos: 'adj', meaning_vi: 'thanh lịch' },
    ]
  },

  accessories: {
    topic: 'Phu kien',
    level: 'A2',
    words: [
      { word: 'die Tasche', pos: 'noun', meaning_vi: 'túi' },
      { word: 'der Rucksack', pos: 'noun', meaning_vi: 'ba lô' },
      { word: 'die Handtasche', pos: 'noun', meaning_vi: 'túi xách' },
      { word: 'der Gürtel', pos: 'noun', meaning_vi: 'thắt lưng' },
      { word: 'die Brille', pos: 'noun', meaning_vi: 'kính' },
      { word: 'die Sonnenbrille', pos: 'noun', meaning_vi: 'kính râm' },
      { word: 'die Uhr', pos: 'noun', meaning_vi: 'đồng hồ' },
      { word: 'der Ring', pos: 'noun', meaning_vi: 'nhẫn' },
      { word: 'die Kette', pos: 'noun', meaning_vi: 'dây chuyền' },
      { word: 'der Ohrring', pos: 'noun', meaning_vi: 'bông tai' },
      { word: 'das Armband', pos: 'noun', meaning_vi: 'vòng tay' },
      { word: 'der Regenschirm', pos: 'noun', meaning_vi: 'ô' },
      { word: 'die Geldbörse', pos: 'noun', meaning_vi: 'ví' },
      { word: 'der Schuh', pos: 'noun', meaning_vi: 'giày' },
      { word: 'der Stiefel', pos: 'noun', meaning_vi: 'ủng' },
      { word: 'die Sandale', pos: 'noun', meaning_vi: 'dép' },
      { word: 'der Hausschuh', pos: 'noun', meaning_vi: 'dép đi trong nhà' },
      { word: 'tragen', pos: 'verb', meaning_vi: 'mang/đeo' },
      { word: 'modisch', pos: 'adj', meaning_vi: 'thời trang' },
      { word: 'praktisch', pos: 'adj', meaning_vi: 'tiện dụng' },
    ]
  },

  numbers: {
    topic: 'So dem',
    level: 'A1',
    words: [
      { word: 'null', pos: 'num', meaning_vi: 'không' },
      { word: 'elf', pos: 'num', meaning_vi: 'mười một' },
      { word: 'zwölf', pos: 'num', meaning_vi: 'mười hai' },
      { word: 'dreizehn', pos: 'num', meaning_vi: 'mười ba' },
      { word: 'vierzehn', pos: 'num', meaning_vi: 'mười bốn' },
      { word: 'fünfzehn', pos: 'num', meaning_vi: 'mười lăm' },
      { word: 'sechzehn', pos: 'num', meaning_vi: 'mười sáu' },
      { word: 'siebzehn', pos: 'num', meaning_vi: 'mười bảy' },
      { word: 'achtzehn', pos: 'num', meaning_vi: 'mười tám' },
      { word: 'neunzehn', pos: 'num', meaning_vi: 'mười chín' },
      { word: 'zwanzig', pos: 'num', meaning_vi: 'hai mươi' },
      { word: 'dreißig', pos: 'num', meaning_vi: 'ba mươi' },
      { word: 'vierzig', pos: 'num', meaning_vi: 'bốn mươi' },
      { word: 'fünfzig', pos: 'num', meaning_vi: 'năm mươi' },
      { word: 'sechzig', pos: 'num', meaning_vi: 'sáu mươi' },
      { word: 'siebzig', pos: 'num', meaning_vi: 'bảy mươi' },
      { word: 'achtzig', pos: 'num', meaning_vi: 'tám mươi' },
      { word: 'neunzig', pos: 'num', meaning_vi: 'chín mươi' },
      { word: 'hundert', pos: 'num', meaning_vi: 'một trăm' },
      { word: 'tausend', pos: 'num', meaning_vi: 'một nghìn' },
    ]
  },

  ordinals: {
    topic: 'So thu tu',
    level: 'A2',
    words: [
      { word: 'erste', pos: 'adj', meaning_vi: 'thứ nhất' },
      { word: 'zweite', pos: 'adj', meaning_vi: 'thứ hai' },
      { word: 'dritte', pos: 'adj', meaning_vi: 'thứ ba' },
      { word: 'vierte', pos: 'adj', meaning_vi: 'thứ tư' },
      { word: 'fünfte', pos: 'adj', meaning_vi: 'thứ năm' },
      { word: 'sechste', pos: 'adj', meaning_vi: 'thứ sáu' },
      { word: 'siebte', pos: 'adj', meaning_vi: 'thứ bảy' },
      { word: 'achte', pos: 'adj', meaning_vi: 'thứ tám' },
      { word: 'neunte', pos: 'adj', meaning_vi: 'thứ chín' },
      { word: 'zehnte', pos: 'adj', meaning_vi: 'thứ mười' },
      { word: 'elfte', pos: 'adj', meaning_vi: 'thứ mười một' },
      { word: 'zwölfte', pos: 'adj', meaning_vi: 'thứ mười hai' },
      { word: 'letzte', pos: 'adj', meaning_vi: 'cuối cùng' },
      { word: 'nächste', pos: 'adj', meaning_vi: 'tiếp theo' },
      { word: 'vorherige', pos: 'adj', meaning_vi: 'trước đó' },
      { word: 'einzige', pos: 'adj', meaning_vi: 'duy nhất' },
      { word: 'halbe', pos: 'adj', meaning_vi: 'một nửa' },
      { word: 'doppelte', pos: 'adj', meaning_vi: 'gấp đôi' },
      { word: 'dreifache', pos: 'adj', meaning_vi: 'gấp ba' },
      { word: 'vielfache', pos: 'adj', meaning_vi: 'gấp nhiều' },
    ]
  },

  timeExpressions: {
    topic: 'Bieu hien thoi gian',
    level: 'A2',
    words: [
      { word: 'der Morgen', pos: 'noun', meaning_vi: 'buổi sáng' },
      { word: 'der Vormittag', pos: 'noun', meaning_vi: 'buổi sáng (trước trưa)' },
      { word: 'der Mittag', pos: 'noun', meaning_vi: 'buổi trưa' },
      { word: 'der Nachmittag', pos: 'noun', meaning_vi: 'buổi chiều' },
      { word: 'der Abend', pos: 'noun', meaning_vi: 'buổi tối' },
      { word: 'die Nacht', pos: 'noun', meaning_vi: 'ban đêm' },
      { word: 'gestern', pos: 'adv', meaning_vi: 'hôm qua' },
      { word: 'heute', pos: 'adv', meaning_vi: 'hôm nay' },
      { word: 'morgen', pos: 'adv', meaning_vi: 'ngày mai' },
      { word: 'übermorgen', pos: 'adv', meaning_vi: 'ngày kia' },
      { word: 'vorgestern', pos: 'adv', meaning_vi: 'hôm kia' },
      { word: 'täglich', pos: 'adj', meaning_vi: 'hàng ngày' },
      { word: 'wöchentlich', pos: 'adj', meaning_vi: 'hàng tuần' },
      { word: 'monatlich', pos: 'adj', meaning_vi: 'hàng tháng' },
      { word: 'jährlich', pos: 'adj', meaning_vi: 'hàng năm' },
      { word: 'früh', pos: 'adj', meaning_vi: 'sớm' },
      { word: 'spät', pos: 'adj', meaning_vi: 'muộn' },
      { word: 'pünktlich', pos: 'adj', meaning_vi: 'đúng giờ' },
      { word: 'rechtzeitig', pos: 'adj', meaning_vi: 'kịp lúc' },
      { word: 'verspätet', pos: 'adj', meaning_vi: 'trễ' },
    ]
  },

  directions: {
    topic: 'Chi duong',
    level: 'A2',
    words: [
      { word: 'links', pos: 'adv', meaning_vi: 'bên trái' },
      { word: 'rechts', pos: 'adv', meaning_vi: 'bên phải' },
      { word: 'geradeaus', pos: 'adv', meaning_vi: 'thẳng' },
      { word: 'zurück', pos: 'adv', meaning_vi: 'quay lại' },
      { word: 'vorwärts', pos: 'adv', meaning_vi: 'tiến về phía trước' },
      { word: 'rückwärts', pos: 'adv', meaning_vi: 'lùi lại' },
      { word: 'oben', pos: 'adv', meaning_vi: 'phía trên' },
      { word: 'unten', pos: 'adv', meaning_vi: 'phía dưới' },
      { word: 'hinten', pos: 'adv', meaning_vi: 'phía sau' },
      { word: 'vorne', pos: 'adv', meaning_vi: 'phía trước' },
      { word: 'die Kreuzung', pos: 'noun', meaning_vi: 'ngã tư' },
      { word: 'die Ampel', pos: 'noun', meaning_vi: 'đèn giao thông' },
      { word: 'die Ecke', pos: 'noun', meaning_vi: 'góc' },
      { word: 'abbiegen', pos: 'verb', meaning_vi: 'rẽ' },
      { word: 'überqueren', pos: 'verb', meaning_vi: 'băng qua' },
      { word: 'folgen', pos: 'verb', meaning_vi: 'đi theo' },
      { word: 'weitergehen', pos: 'verb', meaning_vi: 'đi tiếp' },
      { word: 'nah', pos: 'adj', meaning_vi: 'gần' },
      { word: 'weit', pos: 'adj', meaning_vi: 'xa' },
      { word: 'gegenüber', pos: 'prep', meaning_vi: 'đối diện' },
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
console.log('║    ⛏️  MINE VOCABULARY BATCH 10                             ║');
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
