#!/usr/bin/env node
/**
 * Mine Vocabulary Batch 3 - B1/B2 Level Advanced Words
 * Target: 700+ words for intermediate learners
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT = path.join(__dirname, '../data/quality-expansion/batch3-vocabulary.json');

const TOPICS = {
  // Travel & Tourism Extended
  travel_tourism: {
    level: 'B1',
    words: [
      { word: 'Reise', meaning_vi: 'chuyến đi', pos: 'noun' },
      { word: 'Reisebüro', meaning_vi: 'công ty du lịch', pos: 'noun' },
      { word: 'Flughafen', meaning_vi: 'sân bay', pos: 'noun' },
      { word: 'Flugzeug', meaning_vi: 'máy bay', pos: 'noun' },
      { word: 'Abflug', meaning_vi: 'khởi hành', pos: 'noun' },
      { word: 'Ankunft', meaning_vi: 'đến nơi', pos: 'noun' },
      { word: 'Gepäck', meaning_vi: 'hành lý', pos: 'noun' },
      { word: 'Koffer', meaning_vi: 'vali', pos: 'noun' },
      { word: 'Rucksack', meaning_vi: 'ba lô', pos: 'noun' },
      { word: 'Pass', meaning_vi: 'hộ chiếu', pos: 'noun' },
      { word: 'Visum', meaning_vi: 'visa', pos: 'noun' },
      { word: 'Grenze', meaning_vi: 'biên giới', pos: 'noun' },
      { word: 'Zoll', meaning_vi: 'hải quan', pos: 'noun' },
      { word: 'Buchung', meaning_vi: 'đặt chỗ', pos: 'noun' },
      { word: 'Reservierung', meaning_vi: 'đặt trước', pos: 'noun' },
      { word: 'Unterkunft', meaning_vi: 'nơi ở', pos: 'noun' },
      { word: 'Jugendherberge', meaning_vi: 'nhà nghỉ thanh niên', pos: 'noun' },
      { word: 'Pension', meaning_vi: 'nhà nghỉ', pos: 'noun' },
      { word: 'Empfang', meaning_vi: 'lễ tân', pos: 'noun' },
      { word: 'Schlüssel', meaning_vi: 'chìa khóa', pos: 'noun' },
      { word: 'Sehenswürdigkeit', meaning_vi: 'điểm tham quan', pos: 'noun' },
      { word: 'Ausflug', meaning_vi: 'chuyến dã ngoại', pos: 'noun' },
      { word: 'Rundfahrt', meaning_vi: 'tour tham quan', pos: 'noun' },
      { word: 'Stadtführung', meaning_vi: 'tour thành phố', pos: 'noun' },
      { word: 'Reiseführer', meaning_vi: 'sách hướng dẫn du lịch', pos: 'noun' },
      { word: 'Landkarte', meaning_vi: 'bản đồ', pos: 'noun' },
      { word: 'Andenken', meaning_vi: 'đồ lưu niệm', pos: 'noun' },
      { word: 'buchen', meaning_vi: 'đặt chỗ', pos: 'verb' },
      { word: 'reservieren', meaning_vi: 'đặt trước', pos: 'verb' },
      { word: 'einchecken', meaning_vi: 'nhận phòng', pos: 'verb' },
      { word: 'auschecken', meaning_vi: 'trả phòng', pos: 'verb' },
      { word: 'besichtigen', meaning_vi: 'tham quan', pos: 'verb' },
      { word: 'erkunden', meaning_vi: 'khám phá', pos: 'verb' },
      { word: 'entspannen', meaning_vi: 'thư giãn', pos: 'verb' },
      { word: 'übernachten', meaning_vi: 'qua đêm', pos: 'verb' },
    ]
  },

  // Banking & Finance
  banking_finance: {
    level: 'B1',
    words: [
      { word: 'Konto', meaning_vi: 'tài khoản', pos: 'noun' },
      { word: 'Girokonto', meaning_vi: 'tài khoản vãng lai', pos: 'noun' },
      { word: 'Sparkonto', meaning_vi: 'tài khoản tiết kiệm', pos: 'noun' },
      { word: 'Überweisung', meaning_vi: 'chuyển khoản', pos: 'noun' },
      { word: 'Abhebung', meaning_vi: 'rút tiền', pos: 'noun' },
      { word: 'Einzahlung', meaning_vi: 'nạp tiền', pos: 'noun' },
      { word: 'Kontostand', meaning_vi: 'số dư tài khoản', pos: 'noun' },
      { word: 'Kontoauszug', meaning_vi: 'sao kê', pos: 'noun' },
      { word: 'Geldautomat', meaning_vi: 'máy ATM', pos: 'noun' },
      { word: 'Kreditkarte', meaning_vi: 'thẻ tín dụng', pos: 'noun' },
      { word: 'Bankkarte', meaning_vi: 'thẻ ngân hàng', pos: 'noun' },
      { word: 'Bargeld', meaning_vi: 'tiền mặt', pos: 'noun' },
      { word: 'Münze', meaning_vi: 'đồng xu', pos: 'noun' },
      { word: 'Schein', meaning_vi: 'tờ tiền', pos: 'noun' },
      { word: 'Kredit', meaning_vi: 'tín dụng', pos: 'noun' },
      { word: 'Darlehen', meaning_vi: 'khoản vay', pos: 'noun' },
      { word: 'Zinsen', meaning_vi: 'lãi suất', pos: 'noun' },
      { word: 'Schulden', meaning_vi: 'nợ', pos: 'noun' },
      { word: 'Rechnung', meaning_vi: 'hóa đơn', pos: 'noun' },
      { word: 'Quittung', meaning_vi: 'biên lai', pos: 'noun' },
      { word: 'Steuer', meaning_vi: 'thuế', pos: 'noun' },
      { word: 'Einkommen', meaning_vi: 'thu nhập', pos: 'noun' },
      { word: 'Ausgabe', meaning_vi: 'chi tiêu', pos: 'noun' },
      { word: 'Ersparnis', meaning_vi: 'tiền tiết kiệm', pos: 'noun' },
      { word: 'abheben', meaning_vi: 'rút tiền', pos: 'verb' },
      { word: 'einzahlen', meaning_vi: 'nạp tiền', pos: 'verb' },
      { word: 'überweisen', meaning_vi: 'chuyển khoản', pos: 'verb' },
      { word: 'sparen', meaning_vi: 'tiết kiệm', pos: 'verb' },
      { word: 'ausgeben', meaning_vi: 'chi tiêu', pos: 'verb' },
      { word: 'bezahlen', meaning_vi: 'thanh toán', pos: 'verb' },
    ]
  },

  // Technology & Internet Extended
  technology_extended: {
    level: 'B1',
    words: [
      { word: 'Computer', meaning_vi: 'máy tính', pos: 'noun' },
      { word: 'Laptop', meaning_vi: 'laptop', pos: 'noun' },
      { word: 'Tablet', meaning_vi: 'máy tính bảng', pos: 'noun' },
      { word: 'Smartphone', meaning_vi: 'điện thoại thông minh', pos: 'noun' },
      { word: 'Bildschirm', meaning_vi: 'màn hình', pos: 'noun' },
      { word: 'Tastatur', meaning_vi: 'bàn phím', pos: 'noun' },
      { word: 'Maus', meaning_vi: 'chuột máy tính', pos: 'noun' },
      { word: 'Drucker', meaning_vi: 'máy in', pos: 'noun' },
      { word: 'Scanner', meaning_vi: 'máy quét', pos: 'noun' },
      { word: 'Lautsprecher', meaning_vi: 'loa', pos: 'noun' },
      { word: 'Kopfhörer', meaning_vi: 'tai nghe', pos: 'noun' },
      { word: 'USB-Stick', meaning_vi: 'USB', pos: 'noun' },
      { word: 'Festplatte', meaning_vi: 'ổ cứng', pos: 'noun' },
      { word: 'Speicher', meaning_vi: 'bộ nhớ', pos: 'noun' },
      { word: 'Datei', meaning_vi: 'tệp tin', pos: 'noun' },
      { word: 'Ordner', meaning_vi: 'thư mục', pos: 'noun' },
      { word: 'Programm', meaning_vi: 'chương trình', pos: 'noun' },
      { word: 'App', meaning_vi: 'ứng dụng', pos: 'noun' },
      { word: 'Software', meaning_vi: 'phần mềm', pos: 'noun' },
      { word: 'Browser', meaning_vi: 'trình duyệt', pos: 'noun' },
      { word: 'Suchmaschine', meaning_vi: 'công cụ tìm kiếm', pos: 'noun' },
      { word: 'Netzwerk', meaning_vi: 'mạng', pos: 'noun' },
      { word: 'WLAN', meaning_vi: 'wifi', pos: 'noun' },
      { word: 'Passwort', meaning_vi: 'mật khẩu', pos: 'noun' },
      { word: 'Benutzername', meaning_vi: 'tên người dùng', pos: 'noun' },
      { word: 'Konto', meaning_vi: 'tài khoản', pos: 'noun' },
      { word: 'downloaden', meaning_vi: 'tải xuống', pos: 'verb' },
      { word: 'uploaden', meaning_vi: 'tải lên', pos: 'verb' },
      { word: 'installieren', meaning_vi: 'cài đặt', pos: 'verb' },
      { word: 'aktualisieren', meaning_vi: 'cập nhật', pos: 'verb' },
      { word: 'speichern', meaning_vi: 'lưu', pos: 'verb' },
      { word: 'löschen', meaning_vi: 'xóa', pos: 'verb' },
      { word: 'kopieren', meaning_vi: 'sao chép', pos: 'verb' },
      { word: 'einfügen', meaning_vi: 'dán', pos: 'verb' },
      { word: 'drucken', meaning_vi: 'in', pos: 'verb' },
    ]
  },

  // Law & Government
  law_government: {
    level: 'B2',
    words: [
      { word: 'Gesetz', meaning_vi: 'luật', pos: 'noun' },
      { word: 'Recht', meaning_vi: 'quyền, pháp luật', pos: 'noun' },
      { word: 'Regel', meaning_vi: 'quy tắc', pos: 'noun' },
      { word: 'Vorschrift', meaning_vi: 'quy định', pos: 'noun' },
      { word: 'Verbot', meaning_vi: 'lệnh cấm', pos: 'noun' },
      { word: 'Erlaubnis', meaning_vi: 'sự cho phép', pos: 'noun' },
      { word: 'Genehmigung', meaning_vi: 'giấy phép', pos: 'noun' },
      { word: 'Gericht', meaning_vi: 'tòa án', pos: 'noun' },
      { word: 'Richter', meaning_vi: 'thẩm phán', pos: 'noun' },
      { word: 'Anwalt', meaning_vi: 'luật sư', pos: 'noun' },
      { word: 'Prozess', meaning_vi: 'phiên tòa', pos: 'noun' },
      { word: 'Urteil', meaning_vi: 'phán quyết', pos: 'noun' },
      { word: 'Strafe', meaning_vi: 'hình phạt', pos: 'noun' },
      { word: 'Gefängnis', meaning_vi: 'nhà tù', pos: 'noun' },
      { word: 'Verbrechen', meaning_vi: 'tội phạm', pos: 'noun' },
      { word: 'Zeuge', meaning_vi: 'nhân chứng', pos: 'noun' },
      { word: 'Beweis', meaning_vi: 'bằng chứng', pos: 'noun' },
      { word: 'Regierung', meaning_vi: 'chính phủ', pos: 'noun' },
      { word: 'Parlament', meaning_vi: 'quốc hội', pos: 'noun' },
      { word: 'Partei', meaning_vi: 'đảng chính trị', pos: 'noun' },
      { word: 'Wahl', meaning_vi: 'bầu cử', pos: 'noun' },
      { word: 'Abstimmung', meaning_vi: 'bỏ phiếu', pos: 'noun' },
      { word: 'Bürger', meaning_vi: 'công dân', pos: 'noun' },
      { word: 'Demokratie', meaning_vi: 'dân chủ', pos: 'noun' },
      { word: 'Freiheit', meaning_vi: 'tự do', pos: 'noun' },
      { word: 'Gleichheit', meaning_vi: 'bình đẳng', pos: 'noun' },
      { word: 'verbieten', meaning_vi: 'cấm', pos: 'verb' },
      { word: 'erlauben', meaning_vi: 'cho phép', pos: 'verb' },
      { word: 'klagen', meaning_vi: 'kiện', pos: 'verb' },
      { word: 'verurteilen', meaning_vi: 'kết án', pos: 'verb' },
    ]
  },

  // Business & Commerce Extended
  business_commerce: {
    level: 'B1',
    words: [
      { word: 'Unternehmen', meaning_vi: 'doanh nghiệp', pos: 'noun' },
      { word: 'Firma', meaning_vi: 'công ty', pos: 'noun' },
      { word: 'Geschäft', meaning_vi: 'việc kinh doanh', pos: 'noun' },
      { word: 'Markt', meaning_vi: 'thị trường', pos: 'noun' },
      { word: 'Konkurrenz', meaning_vi: 'cạnh tranh', pos: 'noun' },
      { word: 'Produkt', meaning_vi: 'sản phẩm', pos: 'noun' },
      { word: 'Dienstleistung', meaning_vi: 'dịch vụ', pos: 'noun' },
      { word: 'Qualität', meaning_vi: 'chất lượng', pos: 'noun' },
      { word: 'Preis', meaning_vi: 'giá', pos: 'noun' },
      { word: 'Rabatt', meaning_vi: 'giảm giá', pos: 'noun' },
      { word: 'Angebot', meaning_vi: 'ưu đãi', pos: 'noun' },
      { word: 'Nachfrage', meaning_vi: 'nhu cầu', pos: 'noun' },
      { word: 'Umsatz', meaning_vi: 'doanh thu', pos: 'noun' },
      { word: 'Gewinn', meaning_vi: 'lợi nhuận', pos: 'noun' },
      { word: 'Verlust', meaning_vi: 'thua lỗ', pos: 'noun' },
      { word: 'Investition', meaning_vi: 'đầu tư', pos: 'noun' },
      { word: 'Lieferant', meaning_vi: 'nhà cung cấp', pos: 'noun' },
      { word: 'Lieferung', meaning_vi: 'giao hàng', pos: 'noun' },
      { word: 'Bestellung', meaning_vi: 'đơn hàng', pos: 'noun' },
      { word: 'Zahlung', meaning_vi: 'thanh toán', pos: 'noun' },
      { word: 'Garantie', meaning_vi: 'bảo hành', pos: 'noun' },
      { word: 'Reklamation', meaning_vi: 'khiếu nại', pos: 'noun' },
      { word: 'verkaufen', meaning_vi: 'bán', pos: 'verb' },
      { word: 'kaufen', meaning_vi: 'mua', pos: 'verb' },
      { word: 'bestellen', meaning_vi: 'đặt hàng', pos: 'verb' },
      { word: 'liefern', meaning_vi: 'giao hàng', pos: 'verb' },
      { word: 'investieren', meaning_vi: 'đầu tư', pos: 'verb' },
      { word: 'produzieren', meaning_vi: 'sản xuất', pos: 'verb' },
      { word: 'exportieren', meaning_vi: 'xuất khẩu', pos: 'verb' },
      { word: 'importieren', meaning_vi: 'nhập khẩu', pos: 'verb' },
    ]
  },

  // Science & Research
  science_research: {
    level: 'B2',
    words: [
      { word: 'Wissenschaft', meaning_vi: 'khoa học', pos: 'noun' },
      { word: 'Forschung', meaning_vi: 'nghiên cứu', pos: 'noun' },
      { word: 'Experiment', meaning_vi: 'thí nghiệm', pos: 'noun' },
      { word: 'Labor', meaning_vi: 'phòng thí nghiệm', pos: 'noun' },
      { word: 'Theorie', meaning_vi: 'lý thuyết', pos: 'noun' },
      { word: 'Hypothese', meaning_vi: 'giả thuyết', pos: 'noun' },
      { word: 'Ergebnis', meaning_vi: 'kết quả', pos: 'noun' },
      { word: 'Entdeckung', meaning_vi: 'phát hiện', pos: 'noun' },
      { word: 'Erfindung', meaning_vi: 'phát minh', pos: 'noun' },
      { word: 'Analyse', meaning_vi: 'phân tích', pos: 'noun' },
      { word: 'Statistik', meaning_vi: 'thống kê', pos: 'noun' },
      { word: 'Daten', meaning_vi: 'dữ liệu', pos: 'noun' },
      { word: 'Methode', meaning_vi: 'phương pháp', pos: 'noun' },
      { word: 'Studie', meaning_vi: 'nghiên cứu', pos: 'noun' },
      { word: 'Wissenschaftler', meaning_vi: 'nhà khoa học', pos: 'noun' },
      { word: 'Forscher', meaning_vi: 'nhà nghiên cứu', pos: 'noun' },
      { word: 'forschen', meaning_vi: 'nghiên cứu', pos: 'verb' },
      { word: 'untersuchen', meaning_vi: 'khảo sát', pos: 'verb' },
      { word: 'analysieren', meaning_vi: 'phân tích', pos: 'verb' },
      { word: 'beweisen', meaning_vi: 'chứng minh', pos: 'verb' },
      { word: 'entdecken', meaning_vi: 'phát hiện', pos: 'verb' },
      { word: 'erfinden', meaning_vi: 'phát minh', pos: 'verb' },
      { word: 'entwickeln', meaning_vi: 'phát triển', pos: 'verb' },
      { word: 'messen', meaning_vi: 'đo', pos: 'verb' },
      { word: 'beobachten', meaning_vi: 'quan sát', pos: 'verb' },
      { word: 'testen', meaning_vi: 'thử nghiệm', pos: 'verb' },
    ]
  },

  // Medicine & Healthcare Extended
  medicine_healthcare: {
    level: 'B1',
    words: [
      { word: 'Gesundheit', meaning_vi: 'sức khỏe', pos: 'noun' },
      { word: 'Krankheit', meaning_vi: 'bệnh tật', pos: 'noun' },
      { word: 'Symptom', meaning_vi: 'triệu chứng', pos: 'noun' },
      { word: 'Diagnose', meaning_vi: 'chẩn đoán', pos: 'noun' },
      { word: 'Behandlung', meaning_vi: 'điều trị', pos: 'noun' },
      { word: 'Therapie', meaning_vi: 'liệu pháp', pos: 'noun' },
      { word: 'Heilung', meaning_vi: 'chữa lành', pos: 'noun' },
      { word: 'Impfung', meaning_vi: 'tiêm chủng', pos: 'noun' },
      { word: 'Spritze', meaning_vi: 'ống tiêm', pos: 'noun' },
      { word: 'Verband', meaning_vi: 'băng gạc', pos: 'noun' },
      { word: 'Pflaster', meaning_vi: 'băng cá nhân', pos: 'noun' },
      { word: 'Blutdruck', meaning_vi: 'huyết áp', pos: 'noun' },
      { word: 'Puls', meaning_vi: 'mạch', pos: 'noun' },
      { word: 'Temperatur', meaning_vi: 'nhiệt độ', pos: 'noun' },
      { word: 'Allergie', meaning_vi: 'dị ứng', pos: 'noun' },
      { word: 'Infektion', meaning_vi: 'nhiễm trùng', pos: 'noun' },
      { word: 'Virus', meaning_vi: 'virus', pos: 'noun' },
      { word: 'Bakterie', meaning_vi: 'vi khuẩn', pos: 'noun' },
      { word: 'Notfall', meaning_vi: 'cấp cứu', pos: 'noun' },
      { word: 'Rettungswagen', meaning_vi: 'xe cứu thương', pos: 'noun' },
      { word: 'Notaufnahme', meaning_vi: 'phòng cấp cứu', pos: 'noun' },
      { word: 'Patient', meaning_vi: 'bệnh nhân', pos: 'noun' },
      { word: 'Termin', meaning_vi: 'lịch hẹn', pos: 'noun' },
      { word: 'Sprechstunde', meaning_vi: 'giờ khám bệnh', pos: 'noun' },
      { word: 'behandeln', meaning_vi: 'điều trị', pos: 'verb' },
      { word: 'heilen', meaning_vi: 'chữa lành', pos: 'verb' },
      { word: 'impfen', meaning_vi: 'tiêm chủng', pos: 'verb' },
      { word: 'operieren', meaning_vi: 'phẫu thuật', pos: 'verb' },
      { word: 'verschreiben', meaning_vi: 'kê đơn', pos: 'verb' },
      { word: 'röntgen', meaning_vi: 'chụp X-quang', pos: 'verb' },
    ]
  },

  // Environment & Climate
  environment_climate: {
    level: 'B1',
    words: [
      { word: 'Klima', meaning_vi: 'khí hậu', pos: 'noun' },
      { word: 'Klimawandel', meaning_vi: 'biến đổi khí hậu', pos: 'noun' },
      { word: 'Umweltschutz', meaning_vi: 'bảo vệ môi trường', pos: 'noun' },
      { word: 'Verschmutzung', meaning_vi: 'ô nhiễm', pos: 'noun' },
      { word: 'Abgas', meaning_vi: 'khí thải', pos: 'noun' },
      { word: 'Müll', meaning_vi: 'rác', pos: 'noun' },
      { word: 'Abfall', meaning_vi: 'chất thải', pos: 'noun' },
      { word: 'Recycling', meaning_vi: 'tái chế', pos: 'noun' },
      { word: 'Mülltrennung', meaning_vi: 'phân loại rác', pos: 'noun' },
      { word: 'Energie', meaning_vi: 'năng lượng', pos: 'noun' },
      { word: 'Strom', meaning_vi: 'điện', pos: 'noun' },
      { word: 'Solarenergie', meaning_vi: 'năng lượng mặt trời', pos: 'noun' },
      { word: 'Windenergie', meaning_vi: 'năng lượng gió', pos: 'noun' },
      { word: 'Erderwärmung', meaning_vi: 'sự nóng lên toàn cầu', pos: 'noun' },
      { word: 'Treibhauseffekt', meaning_vi: 'hiệu ứng nhà kính', pos: 'noun' },
      { word: 'Naturschutz', meaning_vi: 'bảo tồn thiên nhiên', pos: 'noun' },
      { word: 'Naturschutzgebiet', meaning_vi: 'khu bảo tồn', pos: 'noun' },
      { word: 'Artensterben', meaning_vi: 'tuyệt chủng loài', pos: 'noun' },
      { word: 'Nachhaltigkeit', meaning_vi: 'bền vững', pos: 'noun' },
      { word: 'nachhaltig', meaning_vi: 'bền vững', pos: 'adjective' },
      { word: 'umweltfreundlich', meaning_vi: 'thân thiện môi trường', pos: 'adjective' },
      { word: 'schützen', meaning_vi: 'bảo vệ', pos: 'verb' },
      { word: 'verschmutzen', meaning_vi: 'gây ô nhiễm', pos: 'verb' },
      { word: 'recyceln', meaning_vi: 'tái chế', pos: 'verb' },
      { word: 'sparen', meaning_vi: 'tiết kiệm', pos: 'verb' },
    ]
  },

  // Culture & Society
  culture_society: {
    level: 'B1',
    words: [
      { word: 'Kultur', meaning_vi: 'văn hóa', pos: 'noun' },
      { word: 'Tradition', meaning_vi: 'truyền thống', pos: 'noun' },
      { word: 'Brauch', meaning_vi: 'phong tục', pos: 'noun' },
      { word: 'Sitte', meaning_vi: 'tập quán', pos: 'noun' },
      { word: 'Gesellschaft', meaning_vi: 'xã hội', pos: 'noun' },
      { word: 'Gemeinschaft', meaning_vi: 'cộng đồng', pos: 'noun' },
      { word: 'Bevölkerung', meaning_vi: 'dân số', pos: 'noun' },
      { word: 'Volk', meaning_vi: 'dân tộc', pos: 'noun' },
      { word: 'Nation', meaning_vi: 'quốc gia', pos: 'noun' },
      { word: 'Religion', meaning_vi: 'tôn giáo', pos: 'noun' },
      { word: 'Glaube', meaning_vi: 'niềm tin', pos: 'noun' },
      { word: 'Feiertag', meaning_vi: 'ngày lễ', pos: 'noun' },
      { word: 'Fest', meaning_vi: 'lễ hội', pos: 'noun' },
      { word: 'Weihnachten', meaning_vi: 'Giáng sinh', pos: 'noun' },
      { word: 'Ostern', meaning_vi: 'Phục sinh', pos: 'noun' },
      { word: 'Silvester', meaning_vi: 'đêm giao thừa', pos: 'noun' },
      { word: 'Hochzeit', meaning_vi: 'đám cưới', pos: 'noun' },
      { word: 'Beerdigung', meaning_vi: 'tang lễ', pos: 'noun' },
      { word: 'Taufe', meaning_vi: 'lễ rửa tội', pos: 'noun' },
      { word: 'Feier', meaning_vi: 'buổi lễ', pos: 'noun' },
      { word: 'feiern', meaning_vi: 'ăn mừng', pos: 'verb' },
      { word: 'gratulieren', meaning_vi: 'chúc mừng', pos: 'verb' },
      { word: 'einladen', meaning_vi: 'mời', pos: 'verb' },
      { word: 'schenken', meaning_vi: 'tặng', pos: 'verb' },
      { word: 'kulturell', meaning_vi: 'thuộc văn hóa', pos: 'adjective' },
    ]
  },

  // Sports & Fitness Extended
  sports_fitness: {
    level: 'A2',
    words: [
      { word: 'Mannschaft', meaning_vi: 'đội', pos: 'noun' },
      { word: 'Spieler', meaning_vi: 'cầu thủ', pos: 'noun' },
      { word: 'Trainer', meaning_vi: 'huấn luyện viên', pos: 'noun' },
      { word: 'Schiedsrichter', meaning_vi: 'trọng tài', pos: 'noun' },
      { word: 'Stadion', meaning_vi: 'sân vận động', pos: 'noun' },
      { word: 'Spielfeld', meaning_vi: 'sân thi đấu', pos: 'noun' },
      { word: 'Tor', meaning_vi: 'khung thành', pos: 'noun' },
      { word: 'Ball', meaning_vi: 'quả bóng', pos: 'noun' },
      { word: 'Meisterschaft', meaning_vi: 'giải vô địch', pos: 'noun' },
      { word: 'Turnier', meaning_vi: 'giải đấu', pos: 'noun' },
      { word: 'Wettkampf', meaning_vi: 'cuộc thi', pos: 'noun' },
      { word: 'Sieg', meaning_vi: 'chiến thắng', pos: 'noun' },
      { word: 'Niederlage', meaning_vi: 'thất bại', pos: 'noun' },
      { word: 'Unentschieden', meaning_vi: 'hòa', pos: 'noun' },
      { word: 'Ergebnis', meaning_vi: 'kết quả', pos: 'noun' },
      { word: 'Rekord', meaning_vi: 'kỷ lục', pos: 'noun' },
      { word: 'Medaille', meaning_vi: 'huy chương', pos: 'noun' },
      { word: 'Pokal', meaning_vi: 'cúp', pos: 'noun' },
      { word: 'Fitnessstudio', meaning_vi: 'phòng gym', pos: 'noun' },
      { word: 'Training', meaning_vi: 'buổi tập', pos: 'noun' },
      { word: 'Übung', meaning_vi: 'bài tập', pos: 'noun' },
      { word: 'Ausdauer', meaning_vi: 'sức bền', pos: 'noun' },
      { word: 'Kraft', meaning_vi: 'sức mạnh', pos: 'noun' },
      { word: 'trainieren', meaning_vi: 'tập luyện', pos: 'verb' },
      { word: 'spielen', meaning_vi: 'chơi', pos: 'verb' },
      { word: 'gewinnen', meaning_vi: 'thắng', pos: 'verb' },
      { word: 'verlieren', meaning_vi: 'thua', pos: 'verb' },
      { word: 'schießen', meaning_vi: 'sút', pos: 'verb' },
      { word: 'werfen', meaning_vi: 'ném', pos: 'verb' },
      { word: 'fangen', meaning_vi: 'bắt', pos: 'verb' },
    ]
  },

  // Professions Extended
  professions: {
    level: 'A2',
    words: [
      { word: 'Beruf', meaning_vi: 'nghề nghiệp', pos: 'noun' },
      { word: 'Ingenieur', meaning_vi: 'kỹ sư', pos: 'noun' },
      { word: 'Architekt', meaning_vi: 'kiến trúc sư', pos: 'noun' },
      { word: 'Anwalt', meaning_vi: 'luật sư', pos: 'noun' },
      { word: 'Journalist', meaning_vi: 'nhà báo', pos: 'noun' },
      { word: 'Politiker', meaning_vi: 'chính trị gia', pos: 'noun' },
      { word: 'Künstler', meaning_vi: 'nghệ sĩ', pos: 'noun' },
      { word: 'Musiker', meaning_vi: 'nhạc sĩ', pos: 'noun' },
      { word: 'Schauspieler', meaning_vi: 'diễn viên', pos: 'noun' },
      { word: 'Koch', meaning_vi: 'đầu bếp', pos: 'noun' },
      { word: 'Friseur', meaning_vi: 'thợ làm tóc', pos: 'noun' },
      { word: 'Mechaniker', meaning_vi: 'thợ cơ khí', pos: 'noun' },
      { word: 'Elektriker', meaning_vi: 'thợ điện', pos: 'noun' },
      { word: 'Maler', meaning_vi: 'thợ sơn', pos: 'noun' },
      { word: 'Bäcker', meaning_vi: 'thợ làm bánh', pos: 'noun' },
      { word: 'Fleischer', meaning_vi: 'người bán thịt', pos: 'noun' },
      { word: 'Verkäufer', meaning_vi: 'nhân viên bán hàng', pos: 'noun' },
      { word: 'Kellner', meaning_vi: 'bồi bàn', pos: 'noun' },
      { word: 'Taxifahrer', meaning_vi: 'tài xế taxi', pos: 'noun' },
      { word: 'Busfahrer', meaning_vi: 'tài xế xe buýt', pos: 'noun' },
      { word: 'Pilot', meaning_vi: 'phi công', pos: 'noun' },
      { word: 'Sekretär', meaning_vi: 'thư ký', pos: 'noun' },
      { word: 'Manager', meaning_vi: 'quản lý', pos: 'noun' },
      { word: 'Programmierer', meaning_vi: 'lập trình viên', pos: 'noun' },
      { word: 'Wissenschaftler', meaning_vi: 'nhà khoa học', pos: 'noun' },
      { word: 'Zahnarzt', meaning_vi: 'nha sĩ', pos: 'noun' },
      { word: 'Tierarzt', meaning_vi: 'bác sĩ thú y', pos: 'noun' },
      { word: 'Psychologe', meaning_vi: 'nhà tâm lý', pos: 'noun' },
      { word: 'Sozialarbeiter', meaning_vi: 'nhân viên xã hội', pos: 'noun' },
      { word: 'Landwirt', meaning_vi: 'nông dân', pos: 'noun' },
    ]
  },

  // Abstract Nouns
  abstract_nouns: {
    level: 'B1',
    words: [
      { word: 'Möglichkeit', meaning_vi: 'khả năng', pos: 'noun' },
      { word: 'Gelegenheit', meaning_vi: 'cơ hội', pos: 'noun' },
      { word: 'Chance', meaning_vi: 'cơ hội', pos: 'noun' },
      { word: 'Problem', meaning_vi: 'vấn đề', pos: 'noun' },
      { word: 'Lösung', meaning_vi: 'giải pháp', pos: 'noun' },
      { word: 'Grund', meaning_vi: 'lý do', pos: 'noun' },
      { word: 'Ursache', meaning_vi: 'nguyên nhân', pos: 'noun' },
      { word: 'Folge', meaning_vi: 'hậu quả', pos: 'noun' },
      { word: 'Wirkung', meaning_vi: 'tác động', pos: 'noun' },
      { word: 'Einfluss', meaning_vi: 'ảnh hưởng', pos: 'noun' },
      { word: 'Zusammenhang', meaning_vi: 'mối liên hệ', pos: 'noun' },
      { word: 'Unterschied', meaning_vi: 'sự khác biệt', pos: 'noun' },
      { word: 'Ähnlichkeit', meaning_vi: 'sự tương đồng', pos: 'noun' },
      { word: 'Vorteil', meaning_vi: 'lợi thế', pos: 'noun' },
      { word: 'Nachteil', meaning_vi: 'bất lợi', pos: 'noun' },
      { word: 'Erfolg', meaning_vi: 'thành công', pos: 'noun' },
      { word: 'Misserfolg', meaning_vi: 'thất bại', pos: 'noun' },
      { word: 'Erfahrung', meaning_vi: 'kinh nghiệm', pos: 'noun' },
      { word: 'Wissen', meaning_vi: 'kiến thức', pos: 'noun' },
      { word: 'Können', meaning_vi: 'khả năng', pos: 'noun' },
      { word: 'Fähigkeit', meaning_vi: 'năng lực', pos: 'noun' },
      { word: 'Talent', meaning_vi: 'tài năng', pos: 'noun' },
      { word: 'Interesse', meaning_vi: 'sự quan tâm', pos: 'noun' },
      { word: 'Aufmerksamkeit', meaning_vi: 'sự chú ý', pos: 'noun' },
      { word: 'Konzentration', meaning_vi: 'sự tập trung', pos: 'noun' },
      { word: 'Bedeutung', meaning_vi: 'ý nghĩa', pos: 'noun' },
      { word: 'Sinn', meaning_vi: 'ý nghĩa', pos: 'noun' },
      { word: 'Ziel', meaning_vi: 'mục tiêu', pos: 'noun' },
      { word: 'Plan', meaning_vi: 'kế hoạch', pos: 'noun' },
      { word: 'Idee', meaning_vi: 'ý tưởng', pos: 'noun' },
    ]
  },

  // Modal Particles & Expressions
  particles_expressions: {
    level: 'B1',
    words: [
      { word: 'doch', meaning_vi: 'chứ, mà', pos: 'particle' },
      { word: 'ja', meaning_vi: 'này, đấy', pos: 'particle' },
      { word: 'mal', meaning_vi: 'một chút', pos: 'particle' },
      { word: 'eben', meaning_vi: 'vừa mới, đó là', pos: 'particle' },
      { word: 'halt', meaning_vi: 'thì đấy', pos: 'particle' },
      { word: 'wohl', meaning_vi: 'có lẽ', pos: 'particle' },
      { word: 'bloß', meaning_vi: 'chỉ', pos: 'particle' },
      { word: 'ruhig', meaning_vi: 'cứ thoải mái', pos: 'particle' },
      { word: 'übrigens', meaning_vi: 'nhân tiện', pos: 'adverb' },
      { word: 'allerdings', meaning_vi: 'tuy nhiên', pos: 'adverb' },
      { word: 'jedenfalls', meaning_vi: 'dù sao', pos: 'adverb' },
      { word: 'außerdem', meaning_vi: 'ngoài ra', pos: 'adverb' },
      { word: 'deshalb', meaning_vi: 'vì vậy', pos: 'adverb' },
      { word: 'deswegen', meaning_vi: 'vì thế', pos: 'adverb' },
      { word: 'darum', meaning_vi: 'bởi vậy', pos: 'adverb' },
      { word: 'trotzdem', meaning_vi: 'mặc dù vậy', pos: 'adverb' },
      { word: 'dennoch', meaning_vi: 'tuy thế', pos: 'adverb' },
      { word: 'jedoch', meaning_vi: 'tuy nhiên', pos: 'adverb' },
      { word: 'stattdessen', meaning_vi: 'thay vào đó', pos: 'adverb' },
      { word: 'inzwischen', meaning_vi: 'trong khi đó', pos: 'adverb' },
      { word: 'mittlerweile', meaning_vi: 'trong thời gian này', pos: 'adverb' },
      { word: 'normalerweise', meaning_vi: 'thông thường', pos: 'adverb' },
      { word: 'meistens', meaning_vi: 'phần lớn', pos: 'adverb' },
      { word: 'hauptsächlich', meaning_vi: 'chủ yếu', pos: 'adverb' },
      { word: 'insgesamt', meaning_vi: 'tổng cộng', pos: 'adverb' },
    ]
  },

  // B2 Advanced Adjectives
  advanced_adjectives: {
    level: 'B2',
    words: [
      { word: 'verantwortlich', meaning_vi: 'chịu trách nhiệm', pos: 'adjective' },
      { word: 'unabhängig', meaning_vi: 'độc lập', pos: 'adjective' },
      { word: 'abhängig', meaning_vi: 'phụ thuộc', pos: 'adjective' },
      { word: 'zuverlässig', meaning_vi: 'đáng tin cậy', pos: 'adjective' },
      { word: 'gründlich', meaning_vi: 'kỹ lưỡng', pos: 'adjective' },
      { word: 'ausführlich', meaning_vi: 'chi tiết', pos: 'adjective' },
      { word: 'umfangreich', meaning_vi: 'rộng lớn', pos: 'adjective' },
      { word: 'vielfältig', meaning_vi: 'đa dạng', pos: 'adjective' },
      { word: 'wesentlich', meaning_vi: 'cơ bản, quan trọng', pos: 'adjective' },
      { word: 'erheblich', meaning_vi: 'đáng kể', pos: 'adjective' },
      { word: 'deutlich', meaning_vi: 'rõ ràng', pos: 'adjective' },
      { word: 'offensichtlich', meaning_vi: 'hiển nhiên', pos: 'adjective' },
      { word: 'angemessen', meaning_vi: 'phù hợp', pos: 'adjective' },
      { word: 'geeignet', meaning_vi: 'thích hợp', pos: 'adjective' },
      { word: 'verfügbar', meaning_vi: 'sẵn có', pos: 'adjective' },
      { word: 'erforderlich', meaning_vi: 'cần thiết', pos: 'adjective' },
      { word: 'notwendig', meaning_vi: 'cần thiết', pos: 'adjective' },
      { word: 'dringend', meaning_vi: 'khẩn cấp', pos: 'adjective' },
      { word: 'aktuell', meaning_vi: 'hiện tại', pos: 'adjective' },
      { word: 'künftig', meaning_vi: 'tương lai', pos: 'adjective' },
      { word: 'bisherig', meaning_vi: 'cho đến nay', pos: 'adjective' },
      { word: 'ehemalig', meaning_vi: 'trước đây', pos: 'adjective' },
      { word: 'zusätzlich', meaning_vi: 'bổ sung', pos: 'adjective' },
      { word: 'jeweilig', meaning_vi: 'tương ứng', pos: 'adjective' },
      { word: 'entsprechend', meaning_vi: 'tương ứng', pos: 'adjective' },
    ]
  },

  // B2 Advanced Verbs
  advanced_verbs: {
    level: 'B2',
    words: [
      { word: 'berücksichtigen', meaning_vi: 'xem xét', pos: 'verb' },
      { word: 'bereitstellen', meaning_vi: 'cung cấp', pos: 'verb' },
      { word: 'gewährleisten', meaning_vi: 'đảm bảo', pos: 'verb' },
      { word: 'umsetzen', meaning_vi: 'thực hiện', pos: 'verb' },
      { word: 'durchführen', meaning_vi: 'tiến hành', pos: 'verb' },
      { word: 'anwenden', meaning_vi: 'áp dụng', pos: 'verb' },
      { word: 'einsetzen', meaning_vi: 'sử dụng', pos: 'verb' },
      { word: 'einbeziehen', meaning_vi: 'bao gồm', pos: 'verb' },
      { word: 'ausschließen', meaning_vi: 'loại trừ', pos: 'verb' },
      { word: 'voraussetzen', meaning_vi: 'giả định', pos: 'verb' },
      { word: 'ergeben', meaning_vi: 'cho kết quả', pos: 'verb' },
      { word: 'entsprechen', meaning_vi: 'tương ứng', pos: 'verb' },
      { word: 'betreffen', meaning_vi: 'liên quan đến', pos: 'verb' },
      { word: 'beziehen', meaning_vi: 'liên quan đến', pos: 'verb' },
      { word: 'erfordern', meaning_vi: 'đòi hỏi', pos: 'verb' },
      { word: 'ermöglichen', meaning_vi: 'làm cho có thể', pos: 'verb' },
      { word: 'verhindern', meaning_vi: 'ngăn chặn', pos: 'verb' },
      { word: 'vermeiden', meaning_vi: 'tránh', pos: 'verb' },
      { word: 'bewirken', meaning_vi: 'gây ra', pos: 'verb' },
      { word: 'verursachen', meaning_vi: 'gây ra', pos: 'verb' },
      { word: 'beschränken', meaning_vi: 'hạn chế', pos: 'verb' },
      { word: 'erweitern', meaning_vi: 'mở rộng', pos: 'verb' },
      { word: 'verbessern', meaning_vi: 'cải thiện', pos: 'verb' },
      { word: 'verschlechtern', meaning_vi: 'làm xấu đi', pos: 'verb' },
      { word: 'vergleichen', meaning_vi: 'so sánh', pos: 'verb' },
    ]
  },
};

// Generate vocabulary
function generateVocabulary() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║    📚 MINE VOCABULARY BATCH 3 - B1/B2 ADVANCED WORDS       ║');
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
