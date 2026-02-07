#!/usr/bin/env node
/**
 * Mine Vocabulary Batch 16 - Advanced Topics & Miscellaneous
 * Target: 500+ unique words to reach 10K
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TOPICS = {
  // Legal vocabulary
  legalTerms: {
    topic: 'Phap luat',
    level: 'B2',
    words: [
      { word: 'das Gericht', pos: 'noun', meaning_vi: 'tòa án' },
      { word: 'der Angeklagte', pos: 'noun', meaning_vi: 'bị cáo' },
      { word: 'der Zeuge', pos: 'noun', meaning_vi: 'nhân chứng' },
      { word: 'der Staatsanwalt', pos: 'noun', meaning_vi: 'công tố viên' },
      { word: 'der Verteidiger', pos: 'noun', meaning_vi: 'luật sư bào chữa' },
      { word: 'das Urteil', pos: 'noun', meaning_vi: 'phán quyết' },
      { word: 'die Strafe', pos: 'noun', meaning_vi: 'hình phạt' },
      { word: 'die Geldstrafe', pos: 'noun', meaning_vi: 'phạt tiền' },
      { word: 'die Freiheitsstrafe', pos: 'noun', meaning_vi: 'án tù' },
      { word: 'die Bewährung', pos: 'noun', meaning_vi: 'án treo' },
      { word: 'der Freispruch', pos: 'noun', meaning_vi: 'trắng án' },
      { word: 'die Berufung', pos: 'noun', meaning_vi: 'kháng cáo' },
      { word: 'die Anklage', pos: 'noun', meaning_vi: 'cáo trạng' },
      { word: 'der Prozess', pos: 'noun', meaning_vi: 'phiên tòa' },
      { word: 'die Verhandlung', pos: 'noun', meaning_vi: 'xét xử' },
      { word: 'der Tatort', pos: 'noun', meaning_vi: 'hiện trường' },
      { word: 'der Täter', pos: 'noun', meaning_vi: 'thủ phạm' },
      { word: 'das Opfer', pos: 'noun', meaning_vi: 'nạn nhân' },
      { word: 'der Diebstahl', pos: 'noun', meaning_vi: 'trộm cắp' },
      { word: 'der Betrug', pos: 'noun', meaning_vi: 'lừa đảo' },
    ]
  },
  crimesOffenses: {
    topic: 'Toi pham',
    level: 'B2',
    words: [
      { word: 'der Mord', pos: 'noun', meaning_vi: 'giết người' },
      { word: 'der Totschlag', pos: 'noun', meaning_vi: 'ngộ sát' },
      { word: 'die Körperverletzung', pos: 'noun', meaning_vi: 'gây thương tích' },
      { word: 'der Raub', pos: 'noun', meaning_vi: 'cướp' },
      { word: 'der Einbruch', pos: 'noun', meaning_vi: 'đột nhập' },
      { word: 'die Erpressung', pos: 'noun', meaning_vi: 'tống tiền' },
      { word: 'die Bestechung', pos: 'noun', meaning_vi: 'hối lộ' },
      { word: 'die Korruption', pos: 'noun', meaning_vi: 'tham nhũng' },
      { word: 'die Urkundenfälschung', pos: 'noun', meaning_vi: 'làm giả giấy tờ' },
      { word: 'die Steuerhinterziehung', pos: 'noun', meaning_vi: 'trốn thuế' },
      { word: 'die Geldwäsche', pos: 'noun', meaning_vi: 'rửa tiền' },
      { word: 'der Drogenhandel', pos: 'noun', meaning_vi: 'buôn bán ma túy' },
      { word: 'die Sachbeschädigung', pos: 'noun', meaning_vi: 'phá hoại tài sản' },
      { word: 'die Beleidigung', pos: 'noun', meaning_vi: 'lăng mạ' },
      { word: 'die Verleumdung', pos: 'noun', meaning_vi: 'vu khống' },
      { word: 'der Hausfriedensbruch', pos: 'noun', meaning_vi: 'xâm phạm nhà ở' },
      { word: 'die Unterschlagung', pos: 'noun', meaning_vi: 'biển thủ' },
      { word: 'die Nötigung', pos: 'noun', meaning_vi: 'cưỡng ép' },
      { word: 'die Bedrohung', pos: 'noun', meaning_vi: 'đe dọa' },
      { word: 'die Fahrerflucht', pos: 'noun', meaning_vi: 'bỏ chạy sau tai nạn' },
    ]
  },
  // Finance extended
  finance: {
    topic: 'Tai chinh',
    level: 'B1',
    words: [
      { word: 'die Bank', pos: 'noun', meaning_vi: 'ngân hàng' },
      { word: 'das Konto', pos: 'noun', meaning_vi: 'tài khoản' },
      { word: 'das Girokonto', pos: 'noun', meaning_vi: 'tài khoản vãng lai' },
      { word: 'das Sparkonto', pos: 'noun', meaning_vi: 'tài khoản tiết kiệm' },
      { word: 'die Überweisung', pos: 'noun', meaning_vi: 'chuyển khoản' },
      { word: 'der Dauerauftrag', pos: 'noun', meaning_vi: 'lệnh chuyển tiền định kỳ' },
      { word: 'die Lastschrift', pos: 'noun', meaning_vi: 'ghi nợ trực tiếp' },
      { word: 'der Geldautomat', pos: 'noun', meaning_vi: 'máy ATM' },
      { word: 'die Kreditkarte', pos: 'noun', meaning_vi: 'thẻ tín dụng' },
      { word: 'die EC-Karte', pos: 'noun', meaning_vi: 'thẻ ghi nợ' },
      { word: 'der Kredit', pos: 'noun', meaning_vi: 'khoản vay' },
      { word: 'die Hypothek', pos: 'noun', meaning_vi: 'thế chấp' },
      { word: 'die Zinsen', pos: 'noun', meaning_vi: 'lãi suất' },
      { word: 'die Rate', pos: 'noun', meaning_vi: 'kỳ trả góp' },
      { word: 'die Schulden', pos: 'noun', meaning_vi: 'nợ' },
      { word: 'der Kontoauszug', pos: 'noun', meaning_vi: 'sao kê tài khoản' },
      { word: 'die Geheimzahl', pos: 'noun', meaning_vi: 'mã PIN' },
      { word: 'der Wechselkurs', pos: 'noun', meaning_vi: 'tỷ giá hối đoái' },
      { word: 'die Währung', pos: 'noun', meaning_vi: 'tiền tệ' },
      { word: 'die Gebühr', pos: 'noun', meaning_vi: 'phí' },
    ]
  },
  investments: {
    topic: 'Dau tu',
    level: 'B2',
    words: [
      { word: 'die Börse', pos: 'noun', meaning_vi: 'sàn chứng khoán' },
      { word: 'der Aktienmarkt', pos: 'noun', meaning_vi: 'thị trường chứng khoán' },
      { word: 'der Kurs', pos: 'noun', meaning_vi: 'giá' },
      { word: 'der Gewinn', pos: 'noun', meaning_vi: 'lợi nhuận' },
      { word: 'der Verlust', pos: 'noun', meaning_vi: 'thua lỗ' },
      { word: 'die Rendite', pos: 'noun', meaning_vi: 'lợi tức' },
      { word: 'das Portfolio', pos: 'noun', meaning_vi: 'danh mục đầu tư' },
      { word: 'der Fonds', pos: 'noun', meaning_vi: 'quỹ đầu tư' },
      { word: 'die Anleihe', pos: 'noun', meaning_vi: 'trái phiếu' },
      { word: 'die Rendite', pos: 'noun', meaning_vi: 'tỷ suất lợi nhuận' },
      { word: 'das Risiko', pos: 'noun', meaning_vi: 'rủi ro' },
      { word: 'die Diversifikation', pos: 'noun', meaning_vi: 'đa dạng hóa' },
      { word: 'die Inflation', pos: 'noun', meaning_vi: 'lạm phát' },
      { word: 'die Deflation', pos: 'noun', meaning_vi: 'giảm phát' },
      { word: 'die Rezession', pos: 'noun', meaning_vi: 'suy thoái' },
      { word: 'das Wirtschaftswachstum', pos: 'noun', meaning_vi: 'tăng trưởng kinh tế' },
      { word: 'der Kapitalismus', pos: 'noun', meaning_vi: 'chủ nghĩa tư bản' },
      { word: 'der Sozialismus', pos: 'noun', meaning_vi: 'chủ nghĩa xã hội' },
      { word: 'die Marktwirtschaft', pos: 'noun', meaning_vi: 'kinh tế thị trường' },
      { word: 'die Planwirtschaft', pos: 'noun', meaning_vi: 'kinh tế kế hoạch' },
    ]
  },
  // Housing
  housing: {
    topic: 'Nha o',
    level: 'A2',
    words: [
      { word: 'die Wohnung', pos: 'noun', meaning_vi: 'căn hộ' },
      { word: 'das Haus', pos: 'noun', meaning_vi: 'nhà' },
      { word: 'das Einfamilienhaus', pos: 'noun', meaning_vi: 'nhà riêng' },
      { word: 'das Mehrfamilienhaus', pos: 'noun', meaning_vi: 'nhà chung cư' },
      { word: 'die Dachgeschosswohnung', pos: 'noun', meaning_vi: 'căn hộ áp mái' },
      { word: 'der Keller', pos: 'noun', meaning_vi: 'tầng hầm' },
      { word: 'der Dachboden', pos: 'noun', meaning_vi: 'gác xép' },
      { word: 'die Garage', pos: 'noun', meaning_vi: 'gara' },
      { word: 'der Garten', pos: 'noun', meaning_vi: 'vườn' },
      { word: 'die Terrasse', pos: 'noun', meaning_vi: 'sân thượng' },
      { word: 'die Miete', pos: 'noun', meaning_vi: 'tiền thuê' },
      { word: 'der Vermieter', pos: 'noun', meaning_vi: 'chủ nhà' },
      { word: 'der Mieter', pos: 'noun', meaning_vi: 'người thuê' },
      { word: 'der Mietvertrag', pos: 'noun', meaning_vi: 'hợp đồng thuê' },
      { word: 'die Nebenkosten', pos: 'noun', meaning_vi: 'chi phí phụ' },
      { word: 'die Kaution', pos: 'noun', meaning_vi: 'tiền đặt cọc' },
      { word: 'der Umzug', pos: 'noun', meaning_vi: 'chuyển nhà' },
      { word: 'die Renovierung', pos: 'noun', meaning_vi: 'sửa chữa' },
      { word: 'die Möbel', pos: 'noun', meaning_vi: 'đồ nội thất' },
      { word: 'einrichten', pos: 'verb', meaning_vi: 'bày trí' },
    ]
  },
  furniture: {
    topic: 'Noi that',
    level: 'A2',
    words: [
      { word: 'der Tisch', pos: 'noun', meaning_vi: 'bàn' },
      { word: 'der Stuhl', pos: 'noun', meaning_vi: 'ghế' },
      { word: 'der Sessel', pos: 'noun', meaning_vi: 'ghế bành' },
      { word: 'das Sofa', pos: 'noun', meaning_vi: 'ghế sofa' },
      { word: 'der Schrank', pos: 'noun', meaning_vi: 'tủ' },
      { word: 'die Kommode', pos: 'noun', meaning_vi: 'tủ ngăn kéo' },
      { word: 'das Regal', pos: 'noun', meaning_vi: 'kệ' },
      { word: 'das Bett', pos: 'noun', meaning_vi: 'giường' },
      { word: 'die Matratze', pos: 'noun', meaning_vi: 'nệm' },
      { word: 'das Kissen', pos: 'noun', meaning_vi: 'gối' },
      { word: 'die Decke', pos: 'noun', meaning_vi: 'chăn' },
      { word: 'der Teppich', pos: 'noun', meaning_vi: 'thảm' },
      { word: 'die Gardine', pos: 'noun', meaning_vi: 'rèm cửa' },
      { word: 'die Lampe', pos: 'noun', meaning_vi: 'đèn' },
      { word: 'der Spiegel', pos: 'noun', meaning_vi: 'gương' },
      { word: 'die Uhr', pos: 'noun', meaning_vi: 'đồng hồ' },
      { word: 'das Bild', pos: 'noun', meaning_vi: 'tranh' },
      { word: 'die Vase', pos: 'noun', meaning_vi: 'bình hoa' },
      { word: 'die Pflanze', pos: 'noun', meaning_vi: 'cây cảnh' },
      { word: 'der Blumentopf', pos: 'noun', meaning_vi: 'chậu cây' },
    ]
  },
  kitchenItems: {
    topic: 'Do dung nha bep',
    level: 'A2',
    words: [
      { word: 'der Herd', pos: 'noun', meaning_vi: 'bếp' },
      { word: 'der Ofen', pos: 'noun', meaning_vi: 'lò nướng' },
      { word: 'die Mikrowelle', pos: 'noun', meaning_vi: 'lò vi sóng' },
      { word: 'der Kühlschrank', pos: 'noun', meaning_vi: 'tủ lạnh' },
      { word: 'die Gefriertruhe', pos: 'noun', meaning_vi: 'tủ đông' },
      { word: 'die Spüle', pos: 'noun', meaning_vi: 'bồn rửa' },
      { word: 'der Wasserkocher', pos: 'noun', meaning_vi: 'ấm đun nước' },
      { word: 'die Kaffeemaschine', pos: 'noun', meaning_vi: 'máy pha cà phê' },
      { word: 'der Toaster', pos: 'noun', meaning_vi: 'máy nướng bánh mì' },
      { word: 'der Mixer', pos: 'noun', meaning_vi: 'máy xay sinh tố' },
      { word: 'der Topf', pos: 'noun', meaning_vi: 'nồi' },
      { word: 'die Pfanne', pos: 'noun', meaning_vi: 'chảo' },
      { word: 'das Messer', pos: 'noun', meaning_vi: 'dao' },
      { word: 'die Gabel', pos: 'noun', meaning_vi: 'nĩa' },
      { word: 'der Löffel', pos: 'noun', meaning_vi: 'thìa' },
      { word: 'der Teller', pos: 'noun', meaning_vi: 'đĩa' },
      { word: 'die Tasse', pos: 'noun', meaning_vi: 'tách' },
      { word: 'das Glas', pos: 'noun', meaning_vi: 'cốc' },
      { word: 'das Schneidebrett', pos: 'noun', meaning_vi: 'thớt' },
      { word: 'die Schüssel', pos: 'noun', meaning_vi: 'bát' },
    ]
  },
  // Clothing extended
  clothingAccessories: {
    topic: 'Quan ao phu kien',
    level: 'A2',
    words: [
      { word: 'das Hemd', pos: 'noun', meaning_vi: 'áo sơ mi' },
      { word: 'die Bluse', pos: 'noun', meaning_vi: 'áo blouse' },
      { word: 'das T-Shirt', pos: 'noun', meaning_vi: 'áo phông' },
      { word: 'der Pullover', pos: 'noun', meaning_vi: 'áo len' },
      { word: 'die Jacke', pos: 'noun', meaning_vi: 'áo khoác' },
      { word: 'der Mantel', pos: 'noun', meaning_vi: 'áo choàng' },
      { word: 'die Hose', pos: 'noun', meaning_vi: 'quần dài' },
      { word: 'die Jeans', pos: 'noun', meaning_vi: 'quần jean' },
      { word: 'der Rock', pos: 'noun', meaning_vi: 'váy' },
      { word: 'das Kleid', pos: 'noun', meaning_vi: 'đầm' },
      { word: 'der Anzug', pos: 'noun', meaning_vi: 'bộ vest' },
      { word: 'die Krawatte', pos: 'noun', meaning_vi: 'cà vạt' },
      { word: 'die Schuhe', pos: 'noun', meaning_vi: 'giày' },
      { word: 'die Stiefel', pos: 'noun', meaning_vi: 'bốt' },
      { word: 'die Socken', pos: 'noun', meaning_vi: 'tất' },
      { word: 'die Handschuhe', pos: 'noun', meaning_vi: 'găng tay' },
      { word: 'der Schal', pos: 'noun', meaning_vi: 'khăn quàng' },
      { word: 'die Mütze', pos: 'noun', meaning_vi: 'mũ len' },
      { word: 'der Hut', pos: 'noun', meaning_vi: 'mũ' },
      { word: 'die Brille', pos: 'noun', meaning_vi: 'kính' },
    ]
  },
  jewelry: {
    topic: 'Trang suc',
    level: 'B1',
    words: [
      { word: 'der Ring', pos: 'noun', meaning_vi: 'nhẫn' },
      { word: 'die Halskette', pos: 'noun', meaning_vi: 'vòng cổ' },
      { word: 'das Armband', pos: 'noun', meaning_vi: 'vòng tay' },
      { word: 'die Ohrringe', pos: 'noun', meaning_vi: 'khuyên tai' },
      { word: 'die Brosche', pos: 'noun', meaning_vi: 'trâm cài' },
      { word: 'die Uhr', pos: 'noun', meaning_vi: 'đồng hồ' },
      { word: 'der Diamant', pos: 'noun', meaning_vi: 'kim cương' },
      { word: 'der Rubin', pos: 'noun', meaning_vi: 'hồng ngọc' },
      { word: 'der Smaragd', pos: 'noun', meaning_vi: 'ngọc lục bảo' },
      { word: 'die Perle', pos: 'noun', meaning_vi: 'ngọc trai' },
      { word: 'das Gold', pos: 'noun', meaning_vi: 'vàng' },
      { word: 'das Silber', pos: 'noun', meaning_vi: 'bạc' },
      { word: 'das Platin', pos: 'noun', meaning_vi: 'bạch kim' },
      { word: 'der Juwelier', pos: 'noun', meaning_vi: 'tiệm vàng' },
      { word: 'der Schmuck', pos: 'noun', meaning_vi: 'đồ trang sức' },
      { word: 'der Edelstein', pos: 'noun', meaning_vi: 'đá quý' },
      { word: 'die Karat', pos: 'noun', meaning_vi: 'cara' },
      { word: 'das Etui', pos: 'noun', meaning_vi: 'hộp đựng trang sức' },
      { word: 'der Verlobungsring', pos: 'noun', meaning_vi: 'nhẫn đính hôn' },
      { word: 'der Ehering', pos: 'noun', meaning_vi: 'nhẫn cưới' },
    ]
  },
  // Food extended
  meatSeafood: {
    topic: 'Thit va hai san',
    level: 'A2',
    words: [
      { word: 'das Rindfleisch', pos: 'noun', meaning_vi: 'thịt bò' },
      { word: 'das Schweinefleisch', pos: 'noun', meaning_vi: 'thịt heo' },
      { word: 'das Hähnchen', pos: 'noun', meaning_vi: 'gà' },
      { word: 'das Lammfleisch', pos: 'noun', meaning_vi: 'thịt cừu' },
      { word: 'die Ente', pos: 'noun', meaning_vi: 'vịt' },
      { word: 'die Gans', pos: 'noun', meaning_vi: 'ngỗng' },
      { word: 'der Truthahn', pos: 'noun', meaning_vi: 'gà tây' },
      { word: 'die Wurst', pos: 'noun', meaning_vi: 'xúc xích' },
      { word: 'der Schinken', pos: 'noun', meaning_vi: 'giăm bông' },
      { word: 'der Speck', pos: 'noun', meaning_vi: 'thịt xông khói' },
      { word: 'das Hackfleisch', pos: 'noun', meaning_vi: 'thịt xay' },
      { word: 'das Steak', pos: 'noun', meaning_vi: 'bít tết' },
      { word: 'der Fisch', pos: 'noun', meaning_vi: 'cá' },
      { word: 'der Lachs', pos: 'noun', meaning_vi: 'cá hồi' },
      { word: 'der Thunfisch', pos: 'noun', meaning_vi: 'cá ngừ' },
      { word: 'die Garnele', pos: 'noun', meaning_vi: 'tôm' },
      { word: 'die Muschel', pos: 'noun', meaning_vi: 'sò' },
      { word: 'der Hummer', pos: 'noun', meaning_vi: 'tôm hùm' },
      { word: 'der Tintenfisch', pos: 'noun', meaning_vi: 'mực' },
      { word: 'die Krabbe', pos: 'noun', meaning_vi: 'cua' },
    ]
  },
  fruitsVegetables: {
    topic: 'Trai cay va rau',
    level: 'A1',
    words: [
      { word: 'der Apfel', pos: 'noun', meaning_vi: 'táo' },
      { word: 'die Birne', pos: 'noun', meaning_vi: 'lê' },
      { word: 'die Orange', pos: 'noun', meaning_vi: 'cam' },
      { word: 'die Banane', pos: 'noun', meaning_vi: 'chuối' },
      { word: 'die Traube', pos: 'noun', meaning_vi: 'nho' },
      { word: 'die Erdbeere', pos: 'noun', meaning_vi: 'dâu tây' },
      { word: 'die Kirsche', pos: 'noun', meaning_vi: 'anh đào' },
      { word: 'die Zitrone', pos: 'noun', meaning_vi: 'chanh' },
      { word: 'die Wassermelone', pos: 'noun', meaning_vi: 'dưa hấu' },
      { word: 'die Ananas', pos: 'noun', meaning_vi: 'dứa' },
      { word: 'die Tomate', pos: 'noun', meaning_vi: 'cà chua' },
      { word: 'die Gurke', pos: 'noun', meaning_vi: 'dưa chuột' },
      { word: 'die Karotte', pos: 'noun', meaning_vi: 'cà rốt' },
      { word: 'die Kartoffel', pos: 'noun', meaning_vi: 'khoai tây' },
      { word: 'die Zwiebel', pos: 'noun', meaning_vi: 'hành' },
      { word: 'der Knoblauch', pos: 'noun', meaning_vi: 'tỏi' },
      { word: 'der Salat', pos: 'noun', meaning_vi: 'rau diếp' },
      { word: 'der Spinat', pos: 'noun', meaning_vi: 'rau chân vịt' },
      { word: 'der Brokkoli', pos: 'noun', meaning_vi: 'bông cải xanh' },
      { word: 'die Paprika', pos: 'noun', meaning_vi: 'ớt chuông' },
    ]
  },
  bakeryDairy: {
    topic: 'Banh va sua',
    level: 'A2',
    words: [
      { word: 'das Brot', pos: 'noun', meaning_vi: 'bánh mì' },
      { word: 'das Brötchen', pos: 'noun', meaning_vi: 'bánh mì nhỏ' },
      { word: 'der Kuchen', pos: 'noun', meaning_vi: 'bánh ngọt' },
      { word: 'die Torte', pos: 'noun', meaning_vi: 'bánh kem' },
      { word: 'der Keks', pos: 'noun', meaning_vi: 'bánh quy' },
      { word: 'das Croissant', pos: 'noun', meaning_vi: 'bánh sừng bò' },
      { word: 'der Muffin', pos: 'noun', meaning_vi: 'bánh muffin' },
      { word: 'die Brezel', pos: 'noun', meaning_vi: 'bánh bretzel' },
      { word: 'die Milch', pos: 'noun', meaning_vi: 'sữa' },
      { word: 'der Käse', pos: 'noun', meaning_vi: 'phô mai' },
      { word: 'die Butter', pos: 'noun', meaning_vi: 'bơ' },
      { word: 'der Joghurt', pos: 'noun', meaning_vi: 'sữa chua' },
      { word: 'die Sahne', pos: 'noun', meaning_vi: 'kem tươi' },
      { word: 'das Ei', pos: 'noun', meaning_vi: 'trứng' },
      { word: 'die Eier', pos: 'noun', meaning_vi: 'trứng (số nhiều)' },
      { word: 'der Quark', pos: 'noun', meaning_vi: 'phô mai tươi' },
      { word: 'die Margarine', pos: 'noun', meaning_vi: 'bơ thực vật' },
      { word: 'der Honig', pos: 'noun', meaning_vi: 'mật ong' },
      { word: 'die Marmelade', pos: 'noun', meaning_vi: 'mứt' },
      { word: 'die Schokolade', pos: 'noun', meaning_vi: 'sô cô la' },
    ]
  },
  beverages: {
    topic: 'Do uong',
    level: 'A1',
    words: [
      { word: 'das Wasser', pos: 'noun', meaning_vi: 'nước' },
      { word: 'der Saft', pos: 'noun', meaning_vi: 'nước ép' },
      { word: 'der Orangensaft', pos: 'noun', meaning_vi: 'nước cam' },
      { word: 'der Apfelsaft', pos: 'noun', meaning_vi: 'nước táo' },
      { word: 'die Limonade', pos: 'noun', meaning_vi: 'nước chanh' },
      { word: 'die Cola', pos: 'noun', meaning_vi: 'coca' },
      { word: 'der Tee', pos: 'noun', meaning_vi: 'trà' },
      { word: 'der Kaffee', pos: 'noun', meaning_vi: 'cà phê' },
      { word: 'der Kakao', pos: 'noun', meaning_vi: 'ca cao' },
      { word: 'die Milch', pos: 'noun', meaning_vi: 'sữa' },
      { word: 'das Bier', pos: 'noun', meaning_vi: 'bia' },
      { word: 'der Wein', pos: 'noun', meaning_vi: 'rượu vang' },
      { word: 'der Rotwein', pos: 'noun', meaning_vi: 'rượu vang đỏ' },
      { word: 'der Weißwein', pos: 'noun', meaning_vi: 'rượu vang trắng' },
      { word: 'der Sekt', pos: 'noun', meaning_vi: 'rượu sâm panh' },
      { word: 'der Schnaps', pos: 'noun', meaning_vi: 'rượu mạnh' },
      { word: 'der Cocktail', pos: 'noun', meaning_vi: 'cocktail' },
      { word: 'das Mineralwasser', pos: 'noun', meaning_vi: 'nước khoáng' },
      { word: 'der Eistee', pos: 'noun', meaning_vi: 'trà đá' },
      { word: 'der Smoothie', pos: 'noun', meaning_vi: 'sinh tố' },
    ]
  },
  // Sports
  sports: {
    topic: 'The thao',
    level: 'A2',
    words: [
      { word: 'der Fußball', pos: 'noun', meaning_vi: 'bóng đá' },
      { word: 'der Basketball', pos: 'noun', meaning_vi: 'bóng rổ' },
      { word: 'der Volleyball', pos: 'noun', meaning_vi: 'bóng chuyền' },
      { word: 'das Tennis', pos: 'noun', meaning_vi: 'tennis' },
      { word: 'das Schwimmen', pos: 'noun', meaning_vi: 'bơi lội' },
      { word: 'das Laufen', pos: 'noun', meaning_vi: 'chạy bộ' },
      { word: 'das Radfahren', pos: 'noun', meaning_vi: 'đạp xe' },
      { word: 'das Skifahren', pos: 'noun', meaning_vi: 'trượt tuyết' },
      { word: 'das Boxen', pos: 'noun', meaning_vi: 'đấm bốc' },
      { word: 'das Turnen', pos: 'noun', meaning_vi: 'thể dục dụng cụ' },
      { word: 'das Yoga', pos: 'noun', meaning_vi: 'yoga' },
      { word: 'das Fitness', pos: 'noun', meaning_vi: 'thể hình' },
      { word: 'der Trainer', pos: 'noun', meaning_vi: 'huấn luyện viên' },
      { word: 'der Spieler', pos: 'noun', meaning_vi: 'cầu thủ' },
      { word: 'die Mannschaft', pos: 'noun', meaning_vi: 'đội' },
      { word: 'das Tor', pos: 'noun', meaning_vi: 'khung thành' },
      { word: 'der Ball', pos: 'noun', meaning_vi: 'bóng' },
      { word: 'das Stadion', pos: 'noun', meaning_vi: 'sân vận động' },
      { word: 'die Olympiade', pos: 'noun', meaning_vi: 'Olympic' },
      { word: 'die Weltmeisterschaft', pos: 'noun', meaning_vi: 'World Cup' },
    ]
  },
  sportsEquipment: {
    topic: 'Dung cu the thao',
    level: 'B1',
    words: [
      { word: 'der Schläger', pos: 'noun', meaning_vi: 'vợt' },
      { word: 'der Helm', pos: 'noun', meaning_vi: 'mũ bảo hiểm' },
      { word: 'die Sportschuhe', pos: 'noun', meaning_vi: 'giày thể thao' },
      { word: 'die Hantel', pos: 'noun', meaning_vi: 'tạ' },
      { word: 'das Laufband', pos: 'noun', meaning_vi: 'máy chạy bộ' },
      { word: 'das Fahrrad', pos: 'noun', meaning_vi: 'xe đạp' },
      { word: 'die Skier', pos: 'noun', meaning_vi: 'ván trượt tuyết' },
      { word: 'das Surfbrett', pos: 'noun', meaning_vi: 'ván lướt sóng' },
      { word: 'das Skateboard', pos: 'noun', meaning_vi: 'ván trượt' },
      { word: 'die Yogamatte', pos: 'noun', meaning_vi: 'thảm yoga' },
      { word: 'der Boxhandschuh', pos: 'noun', meaning_vi: 'găng đấm bốc' },
      { word: 'das Springseil', pos: 'noun', meaning_vi: 'dây nhảy' },
      { word: 'die Schwimmbrille', pos: 'noun', meaning_vi: 'kính bơi' },
      { word: 'die Badehose', pos: 'noun', meaning_vi: 'quần bơi' },
      { word: 'der Badeanzug', pos: 'noun', meaning_vi: 'áo bơi' },
      { word: 'das Trikot', pos: 'noun', meaning_vi: 'áo đấu' },
      { word: 'die Stoppuhr', pos: 'noun', meaning_vi: 'đồng hồ bấm giờ' },
      { word: 'das Netz', pos: 'noun', meaning_vi: 'lưới' },
      { word: 'das Tor', pos: 'noun', meaning_vi: 'cầu môn' },
      { word: 'der Schiedsrichter', pos: 'noun', meaning_vi: 'trọng tài' },
    ]
  },
  // More verbs
  dailyVerbs: {
    topic: 'Dong tu hang ngay',
    level: 'A1',
    words: [
      { word: 'essen', pos: 'verb', meaning_vi: 'ăn' },
      { word: 'trinken', pos: 'verb', meaning_vi: 'uống' },
      { word: 'schlafen', pos: 'verb', meaning_vi: 'ngủ' },
      { word: 'arbeiten', pos: 'verb', meaning_vi: 'làm việc' },
      { word: 'spielen', pos: 'verb', meaning_vi: 'chơi' },
      { word: 'lesen', pos: 'verb', meaning_vi: 'đọc' },
      { word: 'schreiben', pos: 'verb', meaning_vi: 'viết' },
      { word: 'hören', pos: 'verb', meaning_vi: 'nghe' },
      { word: 'sehen', pos: 'verb', meaning_vi: 'nhìn' },
      { word: 'sprechen', pos: 'verb', meaning_vi: 'nói' },
      { word: 'lernen', pos: 'verb', meaning_vi: 'học' },
      { word: 'kochen', pos: 'verb', meaning_vi: 'nấu' },
      { word: 'kaufen', pos: 'verb', meaning_vi: 'mua' },
      { word: 'verkaufen', pos: 'verb', meaning_vi: 'bán' },
      { word: 'fahren', pos: 'verb', meaning_vi: 'lái xe' },
      { word: 'gehen', pos: 'verb', meaning_vi: 'đi' },
      { word: 'kommen', pos: 'verb', meaning_vi: 'đến' },
      { word: 'wohnen', pos: 'verb', meaning_vi: 'sống' },
      { word: 'helfen', pos: 'verb', meaning_vi: 'giúp đỡ' },
      { word: 'brauchen', pos: 'verb', meaning_vi: 'cần' },
    ]
  },
  advancedVerbs: {
    topic: 'Dong tu nang cao',
    level: 'B1',
    words: [
      { word: 'erklären', pos: 'verb', meaning_vi: 'giải thích' },
      { word: 'beschreiben', pos: 'verb', meaning_vi: 'mô tả' },
      { word: 'verstehen', pos: 'verb', meaning_vi: 'hiểu' },
      { word: 'vergessen', pos: 'verb', meaning_vi: 'quên' },
      { word: 'erinnern', pos: 'verb', meaning_vi: 'nhớ' },
      { word: 'besuchen', pos: 'verb', meaning_vi: 'thăm' },
      { word: 'empfehlen', pos: 'verb', meaning_vi: 'đề xuất' },
      { word: 'versprechen', pos: 'verb', meaning_vi: 'hứa' },
      { word: 'entscheiden', pos: 'verb', meaning_vi: 'quyết định' },
      { word: 'vergleichen', pos: 'verb', meaning_vi: 'so sánh' },
      { word: 'übersetzen', pos: 'verb', meaning_vi: 'dịch' },
      { word: 'entwickeln', pos: 'verb', meaning_vi: 'phát triển' },
      { word: 'verbessern', pos: 'verb', meaning_vi: 'cải thiện' },
      { word: 'erreichen', pos: 'verb', meaning_vi: 'đạt được' },
      { word: 'vermeiden', pos: 'verb', meaning_vi: 'tránh' },
      { word: 'beachten', pos: 'verb', meaning_vi: 'chú ý' },
      { word: 'berücksichtigen', pos: 'verb', meaning_vi: 'cân nhắc' },
      { word: 'unterstützen', pos: 'verb', meaning_vi: 'hỗ trợ' },
      { word: 'beeinflussen', pos: 'verb', meaning_vi: 'ảnh hưởng' },
      { word: 'verändern', pos: 'verb', meaning_vi: 'thay đổi' },
    ]
  },
  // Weather
  weather: {
    topic: 'Thoi tiet',
    level: 'A1',
    words: [
      { word: 'die Sonne', pos: 'noun', meaning_vi: 'mặt trời' },
      { word: 'der Regen', pos: 'noun', meaning_vi: 'mưa' },
      { word: 'der Schnee', pos: 'noun', meaning_vi: 'tuyết' },
      { word: 'der Wind', pos: 'noun', meaning_vi: 'gió' },
      { word: 'der Sturm', pos: 'noun', meaning_vi: 'bão' },
      { word: 'der Nebel', pos: 'noun', meaning_vi: 'sương mù' },
      { word: 'die Wolke', pos: 'noun', meaning_vi: 'mây' },
      { word: 'der Blitz', pos: 'noun', meaning_vi: 'tia chớp' },
      { word: 'der Donner', pos: 'noun', meaning_vi: 'sấm' },
      { word: 'das Gewitter', pos: 'noun', meaning_vi: 'giông bão' },
      { word: 'der Hagel', pos: 'noun', meaning_vi: 'mưa đá' },
      { word: 'der Frost', pos: 'noun', meaning_vi: 'sương giá' },
      { word: 'die Temperatur', pos: 'noun', meaning_vi: 'nhiệt độ' },
      { word: 'das Grad', pos: 'noun', meaning_vi: 'độ' },
      { word: 'sonnig', pos: 'adjective', meaning_vi: 'nắng' },
      { word: 'bewölkt', pos: 'adjective', meaning_vi: 'nhiều mây' },
      { word: 'regnerisch', pos: 'adjective', meaning_vi: 'mưa' },
      { word: 'windig', pos: 'adjective', meaning_vi: 'có gió' },
      { word: 'kalt', pos: 'adjective', meaning_vi: 'lạnh' },
      { word: 'warm', pos: 'adjective', meaning_vi: 'ấm' },
    ]
  },
  // Time expressions
  timeExpressions: {
    topic: 'Bieu dat thoi gian',
    level: 'A1',
    words: [
      { word: 'heute', pos: 'adverb', meaning_vi: 'hôm nay' },
      { word: 'morgen', pos: 'adverb', meaning_vi: 'ngày mai' },
      { word: 'gestern', pos: 'adverb', meaning_vi: 'hôm qua' },
      { word: 'jetzt', pos: 'adverb', meaning_vi: 'bây giờ' },
      { word: 'später', pos: 'adverb', meaning_vi: 'sau' },
      { word: 'früher', pos: 'adverb', meaning_vi: 'trước' },
      { word: 'immer', pos: 'adverb', meaning_vi: 'luôn luôn' },
      { word: 'nie', pos: 'adverb', meaning_vi: 'không bao giờ' },
      { word: 'manchmal', pos: 'adverb', meaning_vi: 'đôi khi' },
      { word: 'oft', pos: 'adverb', meaning_vi: 'thường xuyên' },
      { word: 'selten', pos: 'adverb', meaning_vi: 'hiếm khi' },
      { word: 'täglich', pos: 'adverb', meaning_vi: 'hàng ngày' },
      { word: 'wöchentlich', pos: 'adverb', meaning_vi: 'hàng tuần' },
      { word: 'monatlich', pos: 'adverb', meaning_vi: 'hàng tháng' },
      { word: 'jährlich', pos: 'adverb', meaning_vi: 'hàng năm' },
      { word: 'bald', pos: 'adverb', meaning_vi: 'sớm' },
      { word: 'gleich', pos: 'adverb', meaning_vi: 'ngay' },
      { word: 'sofort', pos: 'adverb', meaning_vi: 'ngay lập tức' },
      { word: 'endlich', pos: 'adverb', meaning_vi: 'cuối cùng' },
      { word: 'plötzlich', pos: 'adverb', meaning_vi: 'đột nhiên' },
    ]
  },
  daysMonths: {
    topic: 'Ngay thang',
    level: 'A1',
    words: [
      { word: 'Montag', pos: 'noun', meaning_vi: 'Thứ Hai' },
      { word: 'Dienstag', pos: 'noun', meaning_vi: 'Thứ Ba' },
      { word: 'Mittwoch', pos: 'noun', meaning_vi: 'Thứ Tư' },
      { word: 'Donnerstag', pos: 'noun', meaning_vi: 'Thứ Năm' },
      { word: 'Freitag', pos: 'noun', meaning_vi: 'Thứ Sáu' },
      { word: 'Samstag', pos: 'noun', meaning_vi: 'Thứ Bảy' },
      { word: 'Sonntag', pos: 'noun', meaning_vi: 'Chủ Nhật' },
      { word: 'Januar', pos: 'noun', meaning_vi: 'Tháng Một' },
      { word: 'Februar', pos: 'noun', meaning_vi: 'Tháng Hai' },
      { word: 'März', pos: 'noun', meaning_vi: 'Tháng Ba' },
      { word: 'April', pos: 'noun', meaning_vi: 'Tháng Tư' },
      { word: 'Mai', pos: 'noun', meaning_vi: 'Tháng Năm' },
      { word: 'Juni', pos: 'noun', meaning_vi: 'Tháng Sáu' },
      { word: 'Juli', pos: 'noun', meaning_vi: 'Tháng Bảy' },
      { word: 'August', pos: 'noun', meaning_vi: 'Tháng Tám' },
      { word: 'September', pos: 'noun', meaning_vi: 'Tháng Chín' },
      { word: 'Oktober', pos: 'noun', meaning_vi: 'Tháng Mười' },
      { word: 'November', pos: 'noun', meaning_vi: 'Tháng Mười Một' },
      { word: 'Dezember', pos: 'noun', meaning_vi: 'Tháng Mười Hai' },
      { word: 'das Jahr', pos: 'noun', meaning_vi: 'năm' },
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
const outputPath = path.join(__dirname, '../data/quality-expansion/batch16-vocabulary.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(vocabulary, null, 2));

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║    📚 BATCH 16 VOCABULARY GENERATED                        ║');
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
