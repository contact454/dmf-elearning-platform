#!/usr/bin/env node
/**
 * 🔍 MINE ADDITIONAL GERMAN VOCABULARY
 * Focus on everyday topics: Travel, Technology, Business, Sports, Culture
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Additional topic-based vocabulary (curated high-frequency words)
const ADDITIONAL_VOCABULARY = {
  // TRAVEL & TOURISM
  travel: [
    { word: 'Reisepass', meaning_vi: 'hộ chiếu', level: 'A2', pos: 'noun' },
    { word: 'Visum', meaning_vi: 'visa, thị thực', level: 'B1', pos: 'noun' },
    { word: 'Gepäck', meaning_vi: 'hành lý', level: 'A2', pos: 'noun' },
    { word: 'Koffer', meaning_vi: 'vali', level: 'A2', pos: 'noun' },
    { word: 'Rucksack', meaning_vi: 'ba lô', level: 'A2', pos: 'noun' },
    { word: 'Unterkunft', meaning_vi: 'chỗ ở', level: 'B1', pos: 'noun' },
    { word: 'Reservierung', meaning_vi: 'đặt chỗ', level: 'B1', pos: 'noun' },
    { word: 'Sehenswürdigkeit', meaning_vi: 'điểm tham quan', level: 'B1', pos: 'noun' },
    { word: 'Ausflug', meaning_vi: 'chuyến đi chơi', level: 'A2', pos: 'noun' },
    { word: 'Rundreise', meaning_vi: 'chuyến du lịch vòng quanh', level: 'B1', pos: 'noun' },
    { word: 'Pauschalreise', meaning_vi: 'tour du lịch trọn gói', level: 'B2', pos: 'noun' },
    { word: 'Kreuzfahrt', meaning_vi: 'du thuyền', level: 'B1', pos: 'noun' },
    { word: 'Strand', meaning_vi: 'bãi biển', level: 'A2', pos: 'noun' },
    { word: 'Küste', meaning_vi: 'bờ biển', level: 'B1', pos: 'noun' },
    { word: 'Insel', meaning_vi: 'hòn đảo', level: 'A2', pos: 'noun' },
    { word: 'Gebirge', meaning_vi: 'dãy núi', level: 'B1', pos: 'noun' },
    { word: 'Tal', meaning_vi: 'thung lũng', level: 'B1', pos: 'noun' },
    { word: 'Wasserfall', meaning_vi: 'thác nước', level: 'B1', pos: 'noun' },
    { word: 'Wanderweg', meaning_vi: 'đường đi bộ', level: 'B1', pos: 'noun' },
    { word: 'Campingplatz', meaning_vi: 'khu cắm trại', level: 'A2', pos: 'noun' },
    { word: 'Jugendherberge', meaning_vi: 'nhà nghỉ thanh niên', level: 'B1', pos: 'noun' },
    { word: 'Pension', meaning_vi: 'nhà trọ', level: 'B1', pos: 'noun' },
    { word: 'buchen', meaning_vi: 'đặt (phòng, vé)', level: 'A2', pos: 'verb' },
    { word: 'stornieren', meaning_vi: 'hủy đặt', level: 'B1', pos: 'verb' },
    { word: 'einchecken', meaning_vi: 'làm thủ tục nhận phòng', level: 'B1', pos: 'verb' },
    { word: 'auschecken', meaning_vi: 'làm thủ tục trả phòng', level: 'B1', pos: 'verb' },
  ],

  // TECHNOLOGY & INTERNET
  technology: [
    { word: 'Computer', meaning_vi: 'máy tính', level: 'A1', pos: 'noun' },
    { word: 'Laptop', meaning_vi: 'máy tính xách tay', level: 'A2', pos: 'noun' },
    { word: 'Smartphone', meaning_vi: 'điện thoại thông minh', level: 'A2', pos: 'noun' },
    { word: 'Tablet', meaning_vi: 'máy tính bảng', level: 'A2', pos: 'noun' },
    { word: 'Bildschirm', meaning_vi: 'màn hình', level: 'A2', pos: 'noun' },
    { word: 'Tastatur', meaning_vi: 'bàn phím', level: 'A2', pos: 'noun' },
    { word: 'Maus', meaning_vi: 'chuột máy tính', level: 'A2', pos: 'noun' },
    { word: 'Drucker', meaning_vi: 'máy in', level: 'A2', pos: 'noun' },
    { word: 'Scanner', meaning_vi: 'máy quét', level: 'B1', pos: 'noun' },
    { word: 'Software', meaning_vi: 'phần mềm', level: 'B1', pos: 'noun' },
    { word: 'Hardware', meaning_vi: 'phần cứng', level: 'B1', pos: 'noun' },
    { word: 'Betriebssystem', meaning_vi: 'hệ điều hành', level: 'B2', pos: 'noun' },
    { word: 'Anwendung', meaning_vi: 'ứng dụng', level: 'B1', pos: 'noun' },
    { word: 'Programm', meaning_vi: 'chương trình', level: 'A2', pos: 'noun' },
    { word: 'Datei', meaning_vi: 'tệp tin', level: 'B1', pos: 'noun' },
    { word: 'Ordner', meaning_vi: 'thư mục', level: 'B1', pos: 'noun' },
    { word: 'Passwort', meaning_vi: 'mật khẩu', level: 'A2', pos: 'noun' },
    { word: 'Benutzername', meaning_vi: 'tên đăng nhập', level: 'B1', pos: 'noun' },
    { word: 'herunterladen', meaning_vi: 'tải xuống', level: 'B1', pos: 'verb' },
    { word: 'hochladen', meaning_vi: 'tải lên', level: 'B1', pos: 'verb' },
    { word: 'speichern', meaning_vi: 'lưu', level: 'A2', pos: 'verb' },
    { word: 'löschen', meaning_vi: 'xóa', level: 'A2', pos: 'verb' },
    { word: 'kopieren', meaning_vi: 'sao chép', level: 'A2', pos: 'verb' },
    { word: 'einfügen', meaning_vi: 'dán', level: 'B1', pos: 'verb' },
    { word: 'installieren', meaning_vi: 'cài đặt', level: 'B1', pos: 'verb' },
    { word: 'aktualisieren', meaning_vi: 'cập nhật', level: 'B1', pos: 'verb' },
    { word: 'Internetverbindung', meaning_vi: 'kết nối internet', level: 'B1', pos: 'noun' },
    { word: 'WLAN', meaning_vi: 'wifi', level: 'A2', pos: 'noun' },
    { word: 'Webseite', meaning_vi: 'trang web', level: 'A2', pos: 'noun' },
    { word: 'E-Mail', meaning_vi: 'email', level: 'A1', pos: 'noun' },
    { word: 'Nachricht', meaning_vi: 'tin nhắn', level: 'A2', pos: 'noun' },
    { word: 'soziales Netzwerk', meaning_vi: 'mạng xã hội', level: 'B1', pos: 'noun' },
    { word: 'Suchmaschine', meaning_vi: 'công cụ tìm kiếm', level: 'B1', pos: 'noun' },
    { word: 'Cloud', meaning_vi: 'đám mây', level: 'B1', pos: 'noun' },
    { word: 'Backup', meaning_vi: 'sao lưu', level: 'B1', pos: 'noun' },
    { word: 'Virus', meaning_vi: 'virus máy tính', level: 'B1', pos: 'noun' },
    { word: 'Antivirenprogramm', meaning_vi: 'phần mềm diệt virus', level: 'B2', pos: 'noun' },
  ],

  // BUSINESS & WORK
  business: [
    { word: 'Unternehmen', meaning_vi: 'doanh nghiệp', level: 'B1', pos: 'noun' },
    { word: 'Firma', meaning_vi: 'công ty', level: 'A2', pos: 'noun' },
    { word: 'Geschäft', meaning_vi: 'cửa hàng, việc kinh doanh', level: 'A2', pos: 'noun' },
    { word: 'Betrieb', meaning_vi: 'xí nghiệp', level: 'B1', pos: 'noun' },
    { word: 'Konzern', meaning_vi: 'tập đoàn', level: 'B2', pos: 'noun' },
    { word: 'Abteilung', meaning_vi: 'phòng ban', level: 'B1', pos: 'noun' },
    { word: 'Mitarbeiter', meaning_vi: 'nhân viên', level: 'B1', pos: 'noun' },
    { word: 'Angestellter', meaning_vi: 'nhân viên văn phòng', level: 'B1', pos: 'noun' },
    { word: 'Vorgesetzter', meaning_vi: 'cấp trên', level: 'B2', pos: 'noun' },
    { word: 'Geschäftsführer', meaning_vi: 'giám đốc điều hành', level: 'B2', pos: 'noun' },
    { word: 'Direktor', meaning_vi: 'giám đốc', level: 'B1', pos: 'noun' },
    { word: 'Kunde', meaning_vi: 'khách hàng', level: 'A2', pos: 'noun' },
    { word: 'Lieferant', meaning_vi: 'nhà cung cấp', level: 'B2', pos: 'noun' },
    { word: 'Vertrag', meaning_vi: 'hợp đồng', level: 'B1', pos: 'noun' },
    { word: 'Rechnung', meaning_vi: 'hóa đơn', level: 'A2', pos: 'noun' },
    { word: 'Angebot', meaning_vi: 'báo giá', level: 'B1', pos: 'noun' },
    { word: 'Bestellung', meaning_vi: 'đơn đặt hàng', level: 'B1', pos: 'noun' },
    { word: 'Lieferung', meaning_vi: 'giao hàng', level: 'B1', pos: 'noun' },
    { word: 'Gehalt', meaning_vi: 'lương', level: 'B1', pos: 'noun' },
    { word: 'Lohn', meaning_vi: 'tiền công', level: 'B1', pos: 'noun' },
    { word: 'Bonus', meaning_vi: 'tiền thưởng', level: 'B1', pos: 'noun' },
    { word: 'Urlaub', meaning_vi: 'nghỉ phép', level: 'A2', pos: 'noun' },
    { word: 'Überstunden', meaning_vi: 'làm thêm giờ', level: 'B1', pos: 'noun' },
    { word: 'Besprechung', meaning_vi: 'cuộc họp', level: 'B1', pos: 'noun' },
    { word: 'Konferenz', meaning_vi: 'hội nghị', level: 'B1', pos: 'noun' },
    { word: 'Präsentation', meaning_vi: 'bài thuyết trình', level: 'B1', pos: 'noun' },
    { word: 'Projekt', meaning_vi: 'dự án', level: 'B1', pos: 'noun' },
    { word: 'Deadline', meaning_vi: 'hạn chót', level: 'B1', pos: 'noun' },
    { word: 'Budget', meaning_vi: 'ngân sách', level: 'B1', pos: 'noun' },
    { word: 'Gewinn', meaning_vi: 'lợi nhuận', level: 'B1', pos: 'noun' },
    { word: 'Verlust', meaning_vi: 'thua lỗ', level: 'B1', pos: 'noun' },
    { word: 'Umsatz', meaning_vi: 'doanh thu', level: 'B2', pos: 'noun' },
    { word: 'Investition', meaning_vi: 'đầu tư', level: 'B2', pos: 'noun' },
    { word: 'verhandeln', meaning_vi: 'đàm phán', level: 'B2', pos: 'verb' },
    { word: 'unterschreiben', meaning_vi: 'ký tên', level: 'B1', pos: 'verb' },
    { word: 'kündigen', meaning_vi: 'nghỉ việc, sa thải', level: 'B1', pos: 'verb' },
    { word: 'bewerben', meaning_vi: 'ứng tuyển', level: 'B1', pos: 'verb' },
    { word: 'einstellen', meaning_vi: 'tuyển dụng', level: 'B1', pos: 'verb' },
  ],

  // SPORTS & FITNESS
  sports: [
    { word: 'Sport', meaning_vi: 'thể thao', level: 'A1', pos: 'noun' },
    { word: 'Fußball', meaning_vi: 'bóng đá', level: 'A1', pos: 'noun' },
    { word: 'Basketball', meaning_vi: 'bóng rổ', level: 'A2', pos: 'noun' },
    { word: 'Volleyball', meaning_vi: 'bóng chuyền', level: 'A2', pos: 'noun' },
    { word: 'Tennis', meaning_vi: 'quần vợt', level: 'A2', pos: 'noun' },
    { word: 'Schwimmen', meaning_vi: 'bơi lội', level: 'A2', pos: 'noun' },
    { word: 'Laufen', meaning_vi: 'chạy bộ', level: 'A2', pos: 'noun' },
    { word: 'Radfahren', meaning_vi: 'đạp xe', level: 'A2', pos: 'noun' },
    { word: 'Wandern', meaning_vi: 'đi bộ đường dài', level: 'A2', pos: 'noun' },
    { word: 'Skifahren', meaning_vi: 'trượt tuyết', level: 'B1', pos: 'noun' },
    { word: 'Yoga', meaning_vi: 'yoga', level: 'A2', pos: 'noun' },
    { word: 'Fitnessstudio', meaning_vi: 'phòng tập gym', level: 'A2', pos: 'noun' },
    { word: 'Training', meaning_vi: 'buổi tập', level: 'B1', pos: 'noun' },
    { word: 'Mannschaft', meaning_vi: 'đội', level: 'B1', pos: 'noun' },
    { word: 'Spieler', meaning_vi: 'cầu thủ', level: 'A2', pos: 'noun' },
    { word: 'Trainer', meaning_vi: 'huấn luyện viên', level: 'B1', pos: 'noun' },
    { word: 'Spiel', meaning_vi: 'trận đấu', level: 'A2', pos: 'noun' },
    { word: 'Wettkampf', meaning_vi: 'cuộc thi đấu', level: 'B1', pos: 'noun' },
    { word: 'Meisterschaft', meaning_vi: 'giải vô địch', level: 'B1', pos: 'noun' },
    { word: 'Olympiade', meaning_vi: 'thế vận hội', level: 'B1', pos: 'noun' },
    { word: 'Medaille', meaning_vi: 'huy chương', level: 'B1', pos: 'noun' },
    { word: 'Pokal', meaning_vi: 'cúp', level: 'B1', pos: 'noun' },
    { word: 'Sieg', meaning_vi: 'chiến thắng', level: 'B1', pos: 'noun' },
    { word: 'Niederlage', meaning_vi: 'thất bại', level: 'B1', pos: 'noun' },
    { word: 'Tor', meaning_vi: 'bàn thắng', level: 'A2', pos: 'noun' },
    { word: 'Punkt', meaning_vi: 'điểm', level: 'A2', pos: 'noun' },
    { word: 'gewinnen', meaning_vi: 'thắng', level: 'A2', pos: 'verb' },
    { word: 'verlieren', meaning_vi: 'thua', level: 'A2', pos: 'verb' },
    { word: 'trainieren', meaning_vi: 'tập luyện', level: 'B1', pos: 'verb' },
  ],

  // CULTURE & ENTERTAINMENT
  culture: [
    { word: 'Kultur', meaning_vi: 'văn hóa', level: 'B1', pos: 'noun' },
    { word: 'Kunst', meaning_vi: 'nghệ thuật', level: 'B1', pos: 'noun' },
    { word: 'Musik', meaning_vi: 'âm nhạc', level: 'A1', pos: 'noun' },
    { word: 'Konzert', meaning_vi: 'buổi hòa nhạc', level: 'A2', pos: 'noun' },
    { word: 'Film', meaning_vi: 'phim', level: 'A1', pos: 'noun' },
    { word: 'Kino', meaning_vi: 'rạp chiếu phim', level: 'A1', pos: 'noun' },
    { word: 'Theater', meaning_vi: 'nhà hát', level: 'A2', pos: 'noun' },
    { word: 'Museum', meaning_vi: 'bảo tàng', level: 'A2', pos: 'noun' },
    { word: 'Ausstellung', meaning_vi: 'triển lãm', level: 'B1', pos: 'noun' },
    { word: 'Galerie', meaning_vi: 'phòng tranh', level: 'B1', pos: 'noun' },
    { word: 'Gemälde', meaning_vi: 'bức tranh', level: 'B1', pos: 'noun' },
    { word: 'Skulptur', meaning_vi: 'tượng điêu khắc', level: 'B2', pos: 'noun' },
    { word: 'Fotografie', meaning_vi: 'nhiếp ảnh', level: 'B1', pos: 'noun' },
    { word: 'Literatur', meaning_vi: 'văn học', level: 'B1', pos: 'noun' },
    { word: 'Roman', meaning_vi: 'tiểu thuyết', level: 'B1', pos: 'noun' },
    { word: 'Gedicht', meaning_vi: 'bài thơ', level: 'B1', pos: 'noun' },
    { word: 'Autor', meaning_vi: 'tác giả', level: 'B1', pos: 'noun' },
    { word: 'Schriftsteller', meaning_vi: 'nhà văn', level: 'B1', pos: 'noun' },
    { word: 'Regisseur', meaning_vi: 'đạo diễn', level: 'B2', pos: 'noun' },
    { word: 'Schauspieler', meaning_vi: 'diễn viên', level: 'A2', pos: 'noun' },
    { word: 'Sänger', meaning_vi: 'ca sĩ', level: 'A2', pos: 'noun' },
    { word: 'Musiker', meaning_vi: 'nhạc sĩ', level: 'B1', pos: 'noun' },
    { word: 'Orchester', meaning_vi: 'dàn nhạc', level: 'B2', pos: 'noun' },
    { word: 'Festival', meaning_vi: 'lễ hội', level: 'B1', pos: 'noun' },
    { word: 'Veranstaltung', meaning_vi: 'sự kiện', level: 'B1', pos: 'noun' },
    { word: 'Feier', meaning_vi: 'buổi lễ', level: 'B1', pos: 'noun' },
    { word: 'Tradition', meaning_vi: 'truyền thống', level: 'B1', pos: 'noun' },
    { word: 'Brauch', meaning_vi: 'phong tục', level: 'B2', pos: 'noun' },
  ],

  // ENVIRONMENT & NATURE
  environment: [
    { word: 'Umwelt', meaning_vi: 'môi trường', level: 'B1', pos: 'noun' },
    { word: 'Natur', meaning_vi: 'thiên nhiên', level: 'A2', pos: 'noun' },
    { word: 'Klima', meaning_vi: 'khí hậu', level: 'B1', pos: 'noun' },
    { word: 'Klimawandel', meaning_vi: 'biến đổi khí hậu', level: 'B2', pos: 'noun' },
    { word: 'Umweltschutz', meaning_vi: 'bảo vệ môi trường', level: 'B1', pos: 'noun' },
    { word: 'Verschmutzung', meaning_vi: 'ô nhiễm', level: 'B1', pos: 'noun' },
    { word: 'Recycling', meaning_vi: 'tái chế', level: 'B1', pos: 'noun' },
    { word: 'Müll', meaning_vi: 'rác', level: 'A2', pos: 'noun' },
    { word: 'Abfall', meaning_vi: 'rác thải', level: 'B1', pos: 'noun' },
    { word: 'Energie', meaning_vi: 'năng lượng', level: 'B1', pos: 'noun' },
    { word: 'Strom', meaning_vi: 'điện', level: 'A2', pos: 'noun' },
    { word: 'Solarenergie', meaning_vi: 'năng lượng mặt trời', level: 'B2', pos: 'noun' },
    { word: 'Windenergie', meaning_vi: 'năng lượng gió', level: 'B2', pos: 'noun' },
    { word: 'Wald', meaning_vi: 'rừng', level: 'A2', pos: 'noun' },
    { word: 'Baum', meaning_vi: 'cây', level: 'A1', pos: 'noun' },
    { word: 'Pflanze', meaning_vi: 'cây cỏ', level: 'A2', pos: 'noun' },
    { word: 'Blume', meaning_vi: 'hoa', level: 'A1', pos: 'noun' },
    { word: 'Tier', meaning_vi: 'động vật', level: 'A1', pos: 'noun' },
    { word: 'Vogel', meaning_vi: 'chim', level: 'A2', pos: 'noun' },
    { word: 'Fisch', meaning_vi: 'cá', level: 'A1', pos: 'noun' },
    { word: 'Insekt', meaning_vi: 'côn trùng', level: 'B1', pos: 'noun' },
    { word: 'Fluss', meaning_vi: 'sông', level: 'A2', pos: 'noun' },
    { word: 'See', meaning_vi: 'hồ', level: 'A2', pos: 'noun' },
    { word: 'Meer', meaning_vi: 'biển', level: 'A2', pos: 'noun' },
    { word: 'Berg', meaning_vi: 'núi', level: 'A2', pos: 'noun' },
    { word: 'schützen', meaning_vi: 'bảo vệ', level: 'B1', pos: 'verb' },
    { word: 'verschmutzen', meaning_vi: 'gây ô nhiễm', level: 'B1', pos: 'verb' },
    { word: 'recyceln', meaning_vi: 'tái chế', level: 'B1', pos: 'verb' },
  ],

  // EMOTIONS & FEELINGS
  emotions: [
    { word: 'Gefühl', meaning_vi: 'cảm xúc', level: 'B1', pos: 'noun' },
    { word: 'Freude', meaning_vi: 'niềm vui', level: 'B1', pos: 'noun' },
    { word: 'Glück', meaning_vi: 'hạnh phúc', level: 'A2', pos: 'noun' },
    { word: 'Trauer', meaning_vi: 'nỗi buồn', level: 'B1', pos: 'noun' },
    { word: 'Angst', meaning_vi: 'sự sợ hãi', level: 'A2', pos: 'noun' },
    { word: 'Wut', meaning_vi: 'cơn giận', level: 'B1', pos: 'noun' },
    { word: 'Ärger', meaning_vi: 'sự bực bội', level: 'B1', pos: 'noun' },
    { word: 'Überraschung', meaning_vi: 'sự ngạc nhiên', level: 'B1', pos: 'noun' },
    { word: 'Hoffnung', meaning_vi: 'hy vọng', level: 'B1', pos: 'noun' },
    { word: 'Enttäuschung', meaning_vi: 'sự thất vọng', level: 'B1', pos: 'noun' },
    { word: 'Stolz', meaning_vi: 'niềm tự hào', level: 'B1', pos: 'noun' },
    { word: 'Scham', meaning_vi: 'sự xấu hổ', level: 'B2', pos: 'noun' },
    { word: 'Eifersucht', meaning_vi: 'sự ghen tuông', level: 'B2', pos: 'noun' },
    { word: 'Langeweile', meaning_vi: 'sự buồn chán', level: 'B1', pos: 'noun' },
    { word: 'Stress', meaning_vi: 'căng thẳng', level: 'B1', pos: 'noun' },
    { word: 'Entspannung', meaning_vi: 'sự thư giãn', level: 'B1', pos: 'noun' },
    { word: 'glücklich', meaning_vi: 'hạnh phúc', level: 'A2', pos: 'adj' },
    { word: 'traurig', meaning_vi: 'buồn', level: 'A2', pos: 'adj' },
    { word: 'wütend', meaning_vi: 'tức giận', level: 'B1', pos: 'adj' },
    { word: 'ängstlich', meaning_vi: 'lo lắng', level: 'B1', pos: 'adj' },
    { word: 'nervös', meaning_vi: 'hồi hộp', level: 'A2', pos: 'adj' },
    { word: 'aufgeregt', meaning_vi: 'phấn khích', level: 'B1', pos: 'adj' },
    { word: 'entspannt', meaning_vi: 'thư giãn', level: 'B1', pos: 'adj' },
    { word: 'zufrieden', meaning_vi: 'hài lòng', level: 'B1', pos: 'adj' },
    { word: 'enttäuscht', meaning_vi: 'thất vọng', level: 'B1', pos: 'adj' },
    { word: 'überrascht', meaning_vi: 'ngạc nhiên', level: 'B1', pos: 'adj' },
    { word: 'gelangweilt', meaning_vi: 'chán', level: 'B1', pos: 'adj' },
    { word: 'stolz', meaning_vi: 'tự hào', level: 'B1', pos: 'adj' },
    { word: 'eifersüchtig', meaning_vi: 'ghen tị', level: 'B2', pos: 'adj' },
  ],

  // EDUCATION
  education: [
    { word: 'Bildung', meaning_vi: 'giáo dục', level: 'B1', pos: 'noun' },
    { word: 'Erziehung', meaning_vi: 'sự dạy dỗ', level: 'B1', pos: 'noun' },
    { word: 'Schule', meaning_vi: 'trường học', level: 'A1', pos: 'noun' },
    { word: 'Universität', meaning_vi: 'đại học', level: 'A2', pos: 'noun' },
    { word: 'Hochschule', meaning_vi: 'trường cao đẳng/đại học', level: 'B1', pos: 'noun' },
    { word: 'Kindergarten', meaning_vi: 'trường mẫu giáo', level: 'A2', pos: 'noun' },
    { word: 'Grundschule', meaning_vi: 'trường tiểu học', level: 'B1', pos: 'noun' },
    { word: 'Gymnasium', meaning_vi: 'trường trung học', level: 'B1', pos: 'noun' },
    { word: 'Berufsschule', meaning_vi: 'trường dạy nghề', level: 'B1', pos: 'noun' },
    { word: 'Klasse', meaning_vi: 'lớp học', level: 'A2', pos: 'noun' },
    { word: 'Unterricht', meaning_vi: 'bài giảng', level: 'A2', pos: 'noun' },
    { word: 'Fach', meaning_vi: 'môn học', level: 'A2', pos: 'noun' },
    { word: 'Mathematik', meaning_vi: 'toán', level: 'A2', pos: 'noun' },
    { word: 'Physik', meaning_vi: 'vật lý', level: 'B1', pos: 'noun' },
    { word: 'Chemie', meaning_vi: 'hóa học', level: 'B1', pos: 'noun' },
    { word: 'Biologie', meaning_vi: 'sinh học', level: 'B1', pos: 'noun' },
    { word: 'Geschichte', meaning_vi: 'lịch sử', level: 'B1', pos: 'noun' },
    { word: 'Geografie', meaning_vi: 'địa lý', level: 'B1', pos: 'noun' },
    { word: 'Prüfung', meaning_vi: 'bài kiểm tra', level: 'A2', pos: 'noun' },
    { word: 'Klausur', meaning_vi: 'bài thi viết', level: 'B1', pos: 'noun' },
    { word: 'Note', meaning_vi: 'điểm số', level: 'A2', pos: 'noun' },
    { word: 'Zeugnis', meaning_vi: 'học bạ', level: 'B1', pos: 'noun' },
    { word: 'Abschluss', meaning_vi: 'bằng tốt nghiệp', level: 'B1', pos: 'noun' },
    { word: 'Diplom', meaning_vi: 'văn bằng', level: 'B1', pos: 'noun' },
    { word: 'Stipendium', meaning_vi: 'học bổng', level: 'B1', pos: 'noun' },
    { word: 'studieren', meaning_vi: 'học đại học', level: 'A2', pos: 'verb' },
    { word: 'unterrichten', meaning_vi: 'dạy học', level: 'B1', pos: 'verb' },
    { word: 'bestehen', meaning_vi: 'đỗ (kỳ thi)', level: 'B1', pos: 'verb' },
    { word: 'durchfallen', meaning_vi: 'trượt (kỳ thi)', level: 'B1', pos: 'verb' },
  ],
};

// Flatten all vocabulary
const allVocab = [];
for (const [topic, words] of Object.entries(ADDITIONAL_VOCABULARY)) {
  for (const word of words) {
    allVocab.push({
      ...word,
      topic,
    });
  }
}

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║    📚 ADDITIONAL HIGH-QUALITY VOCABULARY                  ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

console.log(`📊 Topics: ${Object.keys(ADDITIONAL_VOCABULARY).length}`);
console.log(`📊 Total words: ${allVocab.length}`);

// Distribution by level
const distribution = {};
allVocab.forEach(w => {
  distribution[w.level] = (distribution[w.level] || 0) + 1;
});

console.log('\n📈 By Level:');
Object.entries(distribution).sort().forEach(([level, count]) => {
  console.log(`   ${level}: ${count} words`);
});

// Save
const outputPath = path.join(__dirname, '../data/quality-expansion/additional-vocabulary.json');
fs.writeFileSync(outputPath, JSON.stringify(allVocab, null, 2));
console.log(`\n💾 Saved to: ${outputPath}`);
