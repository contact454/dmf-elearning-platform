#!/usr/bin/env node
/**
 * Mine Vocabulary Batch 11 - Advanced Academic & Professional (450 words)
 * Topics: Academic Writing, Research, Statistics, Mathematics,
 * Physics, Chemistry, Biology, Computer Science, Engineering
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT = path.join(__dirname, '../data/quality-expansion/batch11-vocabulary.json');

const TOPICS = {
  academicWriting: {
    topic: 'Viet hoc thuat',
    level: 'C1',
    words: [
      { word: 'die These', pos: 'noun', meaning_vi: 'luận điểm' },
      { word: 'die Antithese', pos: 'noun', meaning_vi: 'phản đề' },
      { word: 'die Synthese', pos: 'noun', meaning_vi: 'tổng hợp' },
      { word: 'die Argumentation', pos: 'noun', meaning_vi: 'lập luận' },
      { word: 'die Schlussfolgerung', pos: 'noun', meaning_vi: 'kết luận' },
      { word: 'die Zusammenfassung', pos: 'noun', meaning_vi: 'tóm tắt' },
      { word: 'die Einleitung', pos: 'noun', meaning_vi: 'phần mở đầu' },
      { word: 'der Hauptteil', pos: 'noun', meaning_vi: 'phần chính' },
      { word: 'das Fazit', pos: 'noun', meaning_vi: 'kết luận' },
      { word: 'die Quelle', pos: 'noun', meaning_vi: 'nguồn' },
      { word: 'das Zitat', pos: 'noun', meaning_vi: 'trích dẫn' },
      { word: 'die Fußnote', pos: 'noun', meaning_vi: 'chú thích cuối trang' },
      { word: 'das Literaturverzeichnis', pos: 'noun', meaning_vi: 'danh mục tài liệu' },
      { word: 'der Absatz', pos: 'noun', meaning_vi: 'đoạn văn' },
      { word: 'zitieren', pos: 'verb', meaning_vi: 'trích dẫn' },
      { word: 'paraphrasieren', pos: 'verb', meaning_vi: 'diễn giải' },
      { word: 'belegen', pos: 'verb', meaning_vi: 'chứng minh' },
      { word: 'widerlegen', pos: 'verb', meaning_vi: 'bác bỏ' },
      { word: 'erörtern', pos: 'verb', meaning_vi: 'thảo luận' },
      { word: 'schlüssig', pos: 'adj', meaning_vi: 'logic' },
    ]
  },

  research: {
    topic: 'Nghien cuu',
    level: 'C1',
    words: [
      { word: 'die Forschung', pos: 'noun', meaning_vi: 'nghiên cứu' },
      { word: 'die Studie', pos: 'noun', meaning_vi: 'nghiên cứu' },
      { word: 'der Forscher', pos: 'noun', meaning_vi: 'nhà nghiên cứu' },
      { word: 'das Labor', pos: 'noun', meaning_vi: 'phòng thí nghiệm' },
      { word: 'die Datenerhebung', pos: 'noun', meaning_vi: 'thu thập dữ liệu' },
      { word: 'die Befragung', pos: 'noun', meaning_vi: 'khảo sát' },
      { word: 'die Beobachtung', pos: 'noun', meaning_vi: 'quan sát' },
      { word: 'die Auswertung', pos: 'noun', meaning_vi: 'đánh giá' },
      { word: 'das Ergebnis', pos: 'noun', meaning_vi: 'kết quả' },
      { word: 'die Erkenntnis', pos: 'noun', meaning_vi: 'phát hiện' },
      { word: 'erforschen', pos: 'verb', meaning_vi: 'nghiên cứu' },
      { word: 'untersuchen', pos: 'verb', meaning_vi: 'khảo sát' },
      { word: 'erheben', pos: 'verb', meaning_vi: 'thu thập' },
      { word: 'auswerten', pos: 'verb', meaning_vi: 'phân tích' },
      { word: 'dokumentieren', pos: 'verb', meaning_vi: 'ghi chép' },
      { word: 'wissenschaftlich', pos: 'adj', meaning_vi: 'khoa học' },
      { word: 'empirisch', pos: 'adj', meaning_vi: 'thực nghiệm' },
      { word: 'theoretisch', pos: 'adj', meaning_vi: 'lý thuyết' },
      { word: 'qualitativ', pos: 'adj', meaning_vi: 'định tính' },
      { word: 'quantitativ', pos: 'adj', meaning_vi: 'định lượng' },
    ]
  },

  statistics: {
    topic: 'Thong ke',
    level: 'B2',
    words: [
      { word: 'die Statistik', pos: 'noun', meaning_vi: 'thống kê' },
      { word: 'der Durchschnitt', pos: 'noun', meaning_vi: 'trung bình' },
      { word: 'der Mittelwert', pos: 'noun', meaning_vi: 'giá trị trung bình' },
      { word: 'der Median', pos: 'noun', meaning_vi: 'trung vị' },
      { word: 'die Standardabweichung', pos: 'noun', meaning_vi: 'độ lệch chuẩn' },
      { word: 'die Varianz', pos: 'noun', meaning_vi: 'phương sai' },
      { word: 'die Wahrscheinlichkeit', pos: 'noun', meaning_vi: 'xác suất' },
      { word: 'die Verteilung', pos: 'noun', meaning_vi: 'phân phối' },
      { word: 'die Stichprobe', pos: 'noun', meaning_vi: 'mẫu' },
      { word: 'die Population', pos: 'noun', meaning_vi: 'tổng thể' },
      { word: 'der Prozentsatz', pos: 'noun', meaning_vi: 'phần trăm' },
      { word: 'das Diagramm', pos: 'noun', meaning_vi: 'biểu đồ' },
      { word: 'die Tabelle', pos: 'noun', meaning_vi: 'bảng' },
      { word: 'berechnen', pos: 'verb', meaning_vi: 'tính toán' },
      { word: 'messen', pos: 'verb', meaning_vi: 'đo' },
      { word: 'vergleichen', pos: 'verb', meaning_vi: 'so sánh' },
      { word: 'darstellen', pos: 'verb', meaning_vi: 'trình bày' },
      { word: 'signifikant', pos: 'adj', meaning_vi: 'có ý nghĩa' },
      { word: 'repräsentativ', pos: 'adj', meaning_vi: 'đại diện' },
      { word: 'zufällig', pos: 'adj', meaning_vi: 'ngẫu nhiên' },
    ]
  },

  mathematics: {
    topic: 'Toan hoc',
    level: 'B2',
    words: [
      { word: 'die Gleichung', pos: 'noun', meaning_vi: 'phương trình' },
      { word: 'die Ungleichung', pos: 'noun', meaning_vi: 'bất phương trình' },
      { word: 'die Funktion', pos: 'noun', meaning_vi: 'hàm số' },
      { word: 'die Ableitung', pos: 'noun', meaning_vi: 'đạo hàm' },
      { word: 'das Integral', pos: 'noun', meaning_vi: 'tích phân' },
      { word: 'die Matrix', pos: 'noun', meaning_vi: 'ma trận' },
      { word: 'der Vektor', pos: 'noun', meaning_vi: 'véc-tơ' },
      { word: 'der Bruch', pos: 'noun', meaning_vi: 'phân số' },
      { word: 'die Wurzel', pos: 'noun', meaning_vi: 'căn' },
      { word: 'die Potenz', pos: 'noun', meaning_vi: 'lũy thừa' },
      { word: 'der Logarithmus', pos: 'noun', meaning_vi: 'logarit' },
      { word: 'die Geometrie', pos: 'noun', meaning_vi: 'hình học' },
      { word: 'die Algebra', pos: 'noun', meaning_vi: 'đại số' },
      { word: 'addieren', pos: 'verb', meaning_vi: 'cộng' },
      { word: 'subtrahieren', pos: 'verb', meaning_vi: 'trừ' },
      { word: 'multiplizieren', pos: 'verb', meaning_vi: 'nhân' },
      { word: 'dividieren', pos: 'verb', meaning_vi: 'chia' },
      { word: 'lösen', pos: 'verb', meaning_vi: 'giải' },
      { word: 'mathematisch', pos: 'adj', meaning_vi: 'toán học' },
      { word: 'linear', pos: 'adj', meaning_vi: 'tuyến tính' },
    ]
  },

  physics: {
    topic: 'Vat ly',
    level: 'B2',
    words: [
      { word: 'die Physik', pos: 'noun', meaning_vi: 'vật lý' },
      { word: 'die Kraft', pos: 'noun', meaning_vi: 'lực' },
      { word: 'die Energie', pos: 'noun', meaning_vi: 'năng lượng' },
      { word: 'die Masse', pos: 'noun', meaning_vi: 'khối lượng' },
      { word: 'die Geschwindigkeit', pos: 'noun', meaning_vi: 'vận tốc' },
      { word: 'die Beschleunigung', pos: 'noun', meaning_vi: 'gia tốc' },
      { word: 'die Schwerkraft', pos: 'noun', meaning_vi: 'trọng lực' },
      { word: 'die Reibung', pos: 'noun', meaning_vi: 'ma sát' },
      { word: 'der Druck', pos: 'noun', meaning_vi: 'áp suất' },
      { word: 'die Temperatur', pos: 'noun', meaning_vi: 'nhiệt độ' },
      { word: 'die Wärme', pos: 'noun', meaning_vi: 'nhiệt' },
      { word: 'die Elektrizität', pos: 'noun', meaning_vi: 'điện' },
      { word: 'der Magnetismus', pos: 'noun', meaning_vi: 'từ tính' },
      { word: 'die Welle', pos: 'noun', meaning_vi: 'sóng' },
      { word: 'das Teilchen', pos: 'noun', meaning_vi: 'hạt' },
      { word: 'das Atom', pos: 'noun', meaning_vi: 'nguyên tử' },
      { word: 'beschleunigen', pos: 'verb', meaning_vi: 'tăng tốc' },
      { word: 'schwingen', pos: 'verb', meaning_vi: 'dao động' },
      { word: 'physikalisch', pos: 'adj', meaning_vi: 'vật lý' },
      { word: 'elektrisch', pos: 'adj', meaning_vi: 'điện' },
    ]
  },

  chemistry: {
    topic: 'Hoa hoc',
    level: 'B2',
    words: [
      { word: 'die Chemie', pos: 'noun', meaning_vi: 'hóa học' },
      { word: 'das Element', pos: 'noun', meaning_vi: 'nguyên tố' },
      { word: 'das Molekül', pos: 'noun', meaning_vi: 'phân tử' },
      { word: 'die Verbindung', pos: 'noun', meaning_vi: 'hợp chất' },
      { word: 'die Reaktion', pos: 'noun', meaning_vi: 'phản ứng' },
      { word: 'die Säure', pos: 'noun', meaning_vi: 'axit' },
      { word: 'die Base', pos: 'noun', meaning_vi: 'bazơ' },
      { word: 'das Salz', pos: 'noun', meaning_vi: 'muối' },
      { word: 'die Lösung', pos: 'noun', meaning_vi: 'dung dịch' },
      { word: 'der Katalysator', pos: 'noun', meaning_vi: 'chất xúc tác' },
      { word: 'die Oxidation', pos: 'noun', meaning_vi: 'sự oxy hóa' },
      { word: 'die Reduktion', pos: 'noun', meaning_vi: 'sự khử' },
      { word: 'das Periodensystem', pos: 'noun', meaning_vi: 'bảng tuần hoàn' },
      { word: 'der Stoff', pos: 'noun', meaning_vi: 'chất' },
      { word: 'reagieren', pos: 'verb', meaning_vi: 'phản ứng' },
      { word: 'lösen', pos: 'verb', meaning_vi: 'hòa tan' },
      { word: 'verbinden', pos: 'verb', meaning_vi: 'kết hợp' },
      { word: 'trennen', pos: 'verb', meaning_vi: 'tách' },
      { word: 'chemisch', pos: 'adj', meaning_vi: 'hóa học' },
      { word: 'organisch', pos: 'adj', meaning_vi: 'hữu cơ' },
    ]
  },

  biology: {
    topic: 'Sinh hoc',
    level: 'B2',
    words: [
      { word: 'die Biologie', pos: 'noun', meaning_vi: 'sinh học' },
      { word: 'die Zelle', pos: 'noun', meaning_vi: 'tế bào' },
      { word: 'das Gen', pos: 'noun', meaning_vi: 'gen' },
      { word: 'die DNA', pos: 'noun', meaning_vi: 'ADN' },
      { word: 'das Protein', pos: 'noun', meaning_vi: 'protein' },
      { word: 'der Organismus', pos: 'noun', meaning_vi: 'sinh vật' },
      { word: 'die Evolution', pos: 'noun', meaning_vi: 'tiến hóa' },
      { word: 'die Mutation', pos: 'noun', meaning_vi: 'đột biến' },
      { word: 'die Vererbung', pos: 'noun', meaning_vi: 'di truyền' },
      { word: 'der Stoffwechsel', pos: 'noun', meaning_vi: 'trao đổi chất' },
      { word: 'die Photosynthese', pos: 'noun', meaning_vi: 'quang hợp' },
      { word: 'die Atmung', pos: 'noun', meaning_vi: 'hô hấp' },
      { word: 'das Ökosystem', pos: 'noun', meaning_vi: 'hệ sinh thái' },
      { word: 'die Art', pos: 'noun', meaning_vi: 'loài' },
      { word: 'die Population', pos: 'noun', meaning_vi: 'quần thể' },
      { word: 'sich vermehren', pos: 'verb', meaning_vi: 'sinh sản' },
      { word: 'mutieren', pos: 'verb', meaning_vi: 'đột biến' },
      { word: 'biologisch', pos: 'adj', meaning_vi: 'sinh học' },
      { word: 'genetisch', pos: 'adj', meaning_vi: 'di truyền' },
      { word: 'zellulär', pos: 'adj', meaning_vi: 'tế bào' },
    ]
  },

  computerScience: {
    topic: 'Khoa hoc may tinh',
    level: 'B2',
    words: [
      { word: 'die Informatik', pos: 'noun', meaning_vi: 'tin học' },
      { word: 'die Software', pos: 'noun', meaning_vi: 'phần mềm' },
      { word: 'die Hardware', pos: 'noun', meaning_vi: 'phần cứng' },
      { word: 'das Betriebssystem', pos: 'noun', meaning_vi: 'hệ điều hành' },
      { word: 'die Anwendung', pos: 'noun', meaning_vi: 'ứng dụng' },
      { word: 'die Programmiersprache', pos: 'noun', meaning_vi: 'ngôn ngữ lập trình' },
      { word: 'der Speicher', pos: 'noun', meaning_vi: 'bộ nhớ' },
      { word: 'der Prozessor', pos: 'noun', meaning_vi: 'bộ xử lý' },
      { word: 'die Festplatte', pos: 'noun', meaning_vi: 'ổ cứng' },
      { word: 'der Arbeitsspeicher', pos: 'noun', meaning_vi: 'RAM' },
      { word: 'die Datei', pos: 'noun', meaning_vi: 'tệp' },
      { word: 'der Ordner', pos: 'noun', meaning_vi: 'thư mục' },
      { word: 'speichern', pos: 'verb', meaning_vi: 'lưu' },
      { word: 'löschen', pos: 'verb', meaning_vi: 'xóa' },
      { word: 'kopieren', pos: 'verb', meaning_vi: 'sao chép' },
      { word: 'einfügen', pos: 'verb', meaning_vi: 'dán' },
      { word: 'installieren', pos: 'verb', meaning_vi: 'cài đặt' },
      { word: 'deinstallieren', pos: 'verb', meaning_vi: 'gỡ cài đặt' },
      { word: 'digital', pos: 'adj', meaning_vi: 'kỹ thuật số' },
      { word: 'virtuell', pos: 'adj', meaning_vi: 'ảo' },
    ]
  },

  engineering: {
    topic: 'Ky thuat',
    level: 'B2',
    words: [
      { word: 'die Technik', pos: 'noun', meaning_vi: 'kỹ thuật' },
      { word: 'der Ingenieur', pos: 'noun', meaning_vi: 'kỹ sư' },
      { word: 'die Maschine', pos: 'noun', meaning_vi: 'máy móc' },
      { word: 'das Gerät', pos: 'noun', meaning_vi: 'thiết bị' },
      { word: 'die Konstruktion', pos: 'noun', meaning_vi: 'thiết kế' },
      { word: 'der Entwurf', pos: 'noun', meaning_vi: 'bản vẽ' },
      { word: 'die Fertigung', pos: 'noun', meaning_vi: 'sản xuất' },
      { word: 'die Montage', pos: 'noun', meaning_vi: 'lắp ráp' },
      { word: 'die Wartung', pos: 'noun', meaning_vi: 'bảo trì' },
      { word: 'die Reparatur', pos: 'noun', meaning_vi: 'sửa chữa' },
      { word: 'konstruieren', pos: 'verb', meaning_vi: 'thiết kế' },
      { word: 'entwerfen', pos: 'verb', meaning_vi: 'vẽ thiết kế' },
      { word: 'fertigen', pos: 'verb', meaning_vi: 'sản xuất' },
      { word: 'montieren', pos: 'verb', meaning_vi: 'lắp ráp' },
      { word: 'warten', pos: 'verb', meaning_vi: 'bảo trì' },
      { word: 'reparieren', pos: 'verb', meaning_vi: 'sửa chữa' },
      { word: 'technisch', pos: 'adj', meaning_vi: 'kỹ thuật' },
      { word: 'mechanisch', pos: 'adj', meaning_vi: 'cơ khí' },
      { word: 'elektronisch', pos: 'adj', meaning_vi: 'điện tử' },
      { word: 'automatisch', pos: 'adj', meaning_vi: 'tự động' },
    ]
  },

  agriculture: {
    topic: 'Nong nghiep',
    level: 'B1',
    words: [
      { word: 'die Landwirtschaft', pos: 'noun', meaning_vi: 'nông nghiệp' },
      { word: 'der Bauer', pos: 'noun', meaning_vi: 'nông dân' },
      { word: 'der Bauernhof', pos: 'noun', meaning_vi: 'trang trại' },
      { word: 'das Feld', pos: 'noun', meaning_vi: 'cánh đồng' },
      { word: 'die Ernte', pos: 'noun', meaning_vi: 'vụ mùa' },
      { word: 'die Saat', pos: 'noun', meaning_vi: 'hạt giống' },
      { word: 'der Traktor', pos: 'noun', meaning_vi: 'máy kéo' },
      { word: 'die Scheune', pos: 'noun', meaning_vi: 'nhà kho' },
      { word: 'der Stall', pos: 'noun', meaning_vi: 'chuồng' },
      { word: 'die Viehzucht', pos: 'noun', meaning_vi: 'chăn nuôi' },
      { word: 'säen', pos: 'verb', meaning_vi: 'gieo' },
      { word: 'ernten', pos: 'verb', meaning_vi: 'thu hoạch' },
      { word: 'pflügen', pos: 'verb', meaning_vi: 'cày' },
      { word: 'bewässern', pos: 'verb', meaning_vi: 'tưới' },
      { word: 'düngen', pos: 'verb', meaning_vi: 'bón phân' },
      { word: 'züchten', pos: 'verb', meaning_vi: 'nuôi' },
      { word: 'melken', pos: 'verb', meaning_vi: 'vắt sữa' },
      { word: 'landwirtschaftlich', pos: 'adj', meaning_vi: 'nông nghiệp' },
      { word: 'ländlich', pos: 'adj', meaning_vi: 'nông thôn' },
      { word: 'fruchtbar', pos: 'adj', meaning_vi: 'màu mỡ' },
    ]
  },

  energy: {
    topic: 'Nang luong',
    level: 'B2',
    words: [
      { word: 'die Energie', pos: 'noun', meaning_vi: 'năng lượng' },
      { word: 'der Strom', pos: 'noun', meaning_vi: 'điện' },
      { word: 'das Kraftwerk', pos: 'noun', meaning_vi: 'nhà máy điện' },
      { word: 'das Atomkraftwerk', pos: 'noun', meaning_vi: 'nhà máy điện hạt nhân' },
      { word: 'die Solaranlage', pos: 'noun', meaning_vi: 'hệ thống năng lượng mặt trời' },
      { word: 'die Windkraftanlage', pos: 'noun', meaning_vi: 'tuabin gió' },
      { word: 'der Generator', pos: 'noun', meaning_vi: 'máy phát điện' },
      { word: 'die Batterie', pos: 'noun', meaning_vi: 'pin' },
      { word: 'der Akku', pos: 'noun', meaning_vi: 'ắc quy' },
      { word: 'die Leitung', pos: 'noun', meaning_vi: 'đường dây' },
      { word: 'der Stromverbrauch', pos: 'noun', meaning_vi: 'tiêu thụ điện' },
      { word: 'die Stromrechnung', pos: 'noun', meaning_vi: 'hóa đơn điện' },
      { word: 'erzeugen', pos: 'verb', meaning_vi: 'tạo ra' },
      { word: 'speichern', pos: 'verb', meaning_vi: 'lưu trữ' },
      { word: 'verbrauchen', pos: 'verb', meaning_vi: 'tiêu thụ' },
      { word: 'laden', pos: 'verb', meaning_vi: 'sạc' },
      { word: 'entladen', pos: 'verb', meaning_vi: 'xả' },
      { word: 'erneuerbar', pos: 'adj', meaning_vi: 'tái tạo' },
      { word: 'fossil', pos: 'adj', meaning_vi: 'hóa thạch' },
      { word: 'effizient', pos: 'adj', meaning_vi: 'hiệu quả' },
    ]
  },

  transport: {
    topic: 'Van tai',
    level: 'B1',
    words: [
      { word: 'der Transport', pos: 'noun', meaning_vi: 'vận chuyển' },
      { word: 'die Lieferung', pos: 'noun', meaning_vi: 'giao hàng' },
      { word: 'der Lkw', pos: 'noun', meaning_vi: 'xe tải' },
      { word: 'der Lastwagen', pos: 'noun', meaning_vi: 'xe tải lớn' },
      { word: 'der Transporter', pos: 'noun', meaning_vi: 'xe vận tải' },
      { word: 'das Containerschiff', pos: 'noun', meaning_vi: 'tàu container' },
      { word: 'das Frachtflugzeug', pos: 'noun', meaning_vi: 'máy bay chở hàng' },
      { word: 'der Güterzug', pos: 'noun', meaning_vi: 'tàu chở hàng' },
      { word: 'die Spedition', pos: 'noun', meaning_vi: 'công ty vận tải' },
      { word: 'das Lager', pos: 'noun', meaning_vi: 'kho' },
      { word: 'transportieren', pos: 'verb', meaning_vi: 'vận chuyển' },
      { word: 'liefern', pos: 'verb', meaning_vi: 'giao' },
      { word: 'versenden', pos: 'verb', meaning_vi: 'gửi' },
      { word: 'empfangen', pos: 'verb', meaning_vi: 'nhận' },
      { word: 'lagern', pos: 'verb', meaning_vi: 'lưu kho' },
      { word: 'verladen', pos: 'verb', meaning_vi: 'bốc dỡ' },
      { word: 'entladen', pos: 'verb', meaning_vi: 'dỡ hàng' },
      { word: 'logistisch', pos: 'adj', meaning_vi: 'logistics' },
      { word: 'international', pos: 'adj', meaning_vi: 'quốc tế' },
      { word: 'regional', pos: 'adj', meaning_vi: 'khu vực' },
    ]
  },

  construction: {
    topic: 'Xay dung',
    level: 'B1',
    words: [
      { word: 'der Bau', pos: 'noun', meaning_vi: 'xây dựng' },
      { word: 'die Baustelle', pos: 'noun', meaning_vi: 'công trường' },
      { word: 'der Bauarbeiter', pos: 'noun', meaning_vi: 'công nhân xây dựng' },
      { word: 'der Architekt', pos: 'noun', meaning_vi: 'kiến trúc sư' },
      { word: 'der Bauplan', pos: 'noun', meaning_vi: 'bản vẽ xây dựng' },
      { word: 'das Fundament', pos: 'noun', meaning_vi: 'móng' },
      { word: 'die Mauer', pos: 'noun', meaning_vi: 'tường' },
      { word: 'das Dach', pos: 'noun', meaning_vi: 'mái' },
      { word: 'der Kran', pos: 'noun', meaning_vi: 'cần cẩu' },
      { word: 'der Bagger', pos: 'noun', meaning_vi: 'máy xúc' },
      { word: 'bauen', pos: 'verb', meaning_vi: 'xây' },
      { word: 'renovieren', pos: 'verb', meaning_vi: 'sửa chữa' },
      { word: 'abreißen', pos: 'verb', meaning_vi: 'phá dỡ' },
      { word: 'errichten', pos: 'verb', meaning_vi: 'dựng' },
      { word: 'mauern', pos: 'verb', meaning_vi: 'xây tường' },
      { word: 'verputzen', pos: 'verb', meaning_vi: 'trát' },
      { word: 'isolieren', pos: 'verb', meaning_vi: 'cách nhiệt' },
      { word: 'fertiggestellt', pos: 'adj', meaning_vi: 'hoàn thành' },
      { word: 'im Bau', pos: 'adj', meaning_vi: 'đang xây' },
      { word: 'stabil', pos: 'adj', meaning_vi: 'ổn định' },
    ]
  },

  insurance: {
    topic: 'Bao hiem',
    level: 'B2',
    words: [
      { word: 'die Versicherung', pos: 'noun', meaning_vi: 'bảo hiểm' },
      { word: 'die Krankenversicherung', pos: 'noun', meaning_vi: 'bảo hiểm y tế' },
      { word: 'die Lebensversicherung', pos: 'noun', meaning_vi: 'bảo hiểm nhân thọ' },
      { word: 'die Haftpflichtversicherung', pos: 'noun', meaning_vi: 'bảo hiểm trách nhiệm' },
      { word: 'die Kfz-Versicherung', pos: 'noun', meaning_vi: 'bảo hiểm xe' },
      { word: 'die Hausratversicherung', pos: 'noun', meaning_vi: 'bảo hiểm đồ dùng' },
      { word: 'der Versicherungsnehmer', pos: 'noun', meaning_vi: 'người mua bảo hiểm' },
      { word: 'die Prämie', pos: 'noun', meaning_vi: 'phí bảo hiểm' },
      { word: 'der Schadensfall', pos: 'noun', meaning_vi: 'trường hợp thiệt hại' },
      { word: 'die Deckung', pos: 'noun', meaning_vi: 'phạm vi bảo hiểm' },
      { word: 'versichern', pos: 'verb', meaning_vi: 'bảo hiểm' },
      { word: 'abschließen', pos: 'verb', meaning_vi: 'ký kết' },
      { word: 'kündigen', pos: 'verb', meaning_vi: 'hủy' },
      { word: 'melden', pos: 'verb', meaning_vi: 'khai báo' },
      { word: 'erstatten', pos: 'verb', meaning_vi: 'hoàn trả' },
      { word: 'versichert', pos: 'adj', meaning_vi: 'được bảo hiểm' },
      { word: 'pflichtversichert', pos: 'adj', meaning_vi: 'bắt buộc bảo hiểm' },
      { word: 'freiwillig', pos: 'adj', meaning_vi: 'tự nguyện' },
      { word: 'gesetzlich', pos: 'adj', meaning_vi: 'theo luật' },
      { word: 'privat', pos: 'adj', meaning_vi: 'tư nhân' },
    ]
  },

  taxes: {
    topic: 'Thue',
    level: 'B2',
    words: [
      { word: 'die Steuer', pos: 'noun', meaning_vi: 'thuế' },
      { word: 'die Einkommensteuer', pos: 'noun', meaning_vi: 'thuế thu nhập' },
      { word: 'die Mehrwertsteuer', pos: 'noun', meaning_vi: 'thuế VAT' },
      { word: 'die Lohnsteuer', pos: 'noun', meaning_vi: 'thuế lương' },
      { word: 'die Körperschaftsteuer', pos: 'noun', meaning_vi: 'thuế doanh nghiệp' },
      { word: 'die Steuererklärung', pos: 'noun', meaning_vi: 'tờ khai thuế' },
      { word: 'der Steuerzahler', pos: 'noun', meaning_vi: 'người đóng thuế' },
      { word: 'das Finanzamt', pos: 'noun', meaning_vi: 'cơ quan thuế' },
      { word: 'der Steuerberater', pos: 'noun', meaning_vi: 'tư vấn thuế' },
      { word: 'die Steuererstattung', pos: 'noun', meaning_vi: 'hoàn thuế' },
      { word: 'versteuern', pos: 'verb', meaning_vi: 'đóng thuế' },
      { word: 'absetzen', pos: 'verb', meaning_vi: 'khấu trừ' },
      { word: 'deklarieren', pos: 'verb', meaning_vi: 'khai báo' },
      { word: 'hinterziehen', pos: 'verb', meaning_vi: 'trốn thuế' },
      { word: 'steuerpflichtig', pos: 'adj', meaning_vi: 'chịu thuế' },
      { word: 'steuerfrei', pos: 'adj', meaning_vi: 'miễn thuế' },
      { word: 'absetzbar', pos: 'adj', meaning_vi: 'được khấu trừ' },
      { word: 'brutto', pos: 'adj', meaning_vi: 'gộp' },
      { word: 'netto', pos: 'adj', meaning_vi: 'ròng' },
      { word: 'progressiv', pos: 'adj', meaning_vi: 'lũy tiến' },
    ]
  },

  realEstate: {
    topic: 'Bat dong san',
    level: 'B2',
    words: [
      { word: 'die Immobilie', pos: 'noun', meaning_vi: 'bất động sản' },
      { word: 'das Grundstück', pos: 'noun', meaning_vi: 'lô đất' },
      { word: 'die Eigentumswohnung', pos: 'noun', meaning_vi: 'căn hộ sở hữu' },
      { word: 'die Mietwohnung', pos: 'noun', meaning_vi: 'căn hộ thuê' },
      { word: 'der Vermieter', pos: 'noun', meaning_vi: 'chủ nhà' },
      { word: 'der Mieter', pos: 'noun', meaning_vi: 'người thuê' },
      { word: 'die Miete', pos: 'noun', meaning_vi: 'tiền thuê' },
      { word: 'die Kaution', pos: 'noun', meaning_vi: 'tiền cọc' },
      { word: 'die Nebenkosten', pos: 'noun', meaning_vi: 'chi phí phụ' },
      { word: 'der Mietvertrag', pos: 'noun', meaning_vi: 'hợp đồng thuê' },
      { word: 'der Makler', pos: 'noun', meaning_vi: 'môi giới' },
      { word: 'die Provision', pos: 'noun', meaning_vi: 'hoa hồng' },
      { word: 'mieten', pos: 'verb', meaning_vi: 'thuê' },
      { word: 'vermieten', pos: 'verb', meaning_vi: 'cho thuê' },
      { word: 'kaufen', pos: 'verb', meaning_vi: 'mua' },
      { word: 'verkaufen', pos: 'verb', meaning_vi: 'bán' },
      { word: 'besichtigen', pos: 'verb', meaning_vi: 'xem nhà' },
      { word: 'möbliert', pos: 'adj', meaning_vi: 'có nội thất' },
      { word: 'unmöbliert', pos: 'adj', meaning_vi: 'không nội thất' },
      { word: 'bezugsfertig', pos: 'adj', meaning_vi: 'sẵn sàng dọn vào' },
    ]
  },

  contracts: {
    topic: 'Hop dong',
    level: 'B2',
    words: [
      { word: 'der Vertrag', pos: 'noun', meaning_vi: 'hợp đồng' },
      { word: 'die Vereinbarung', pos: 'noun', meaning_vi: 'thỏa thuận' },
      { word: 'die Vertragspartei', pos: 'noun', meaning_vi: 'bên hợp đồng' },
      { word: 'die Laufzeit', pos: 'noun', meaning_vi: 'thời hạn' },
      { word: 'die Kündigungsfrist', pos: 'noun', meaning_vi: 'thời hạn báo trước' },
      { word: 'die Klausel', pos: 'noun', meaning_vi: 'điều khoản' },
      { word: 'die Bedingung', pos: 'noun', meaning_vi: 'điều kiện' },
      { word: 'die Unterschrift', pos: 'noun', meaning_vi: 'chữ ký' },
      { word: 'die Vollmacht', pos: 'noun', meaning_vi: 'ủy quyền' },
      { word: 'der Vertragsbruch', pos: 'noun', meaning_vi: 'vi phạm hợp đồng' },
      { word: 'unterschreiben', pos: 'verb', meaning_vi: 'ký' },
      { word: 'vereinbaren', pos: 'verb', meaning_vi: 'thỏa thuận' },
      { word: 'verlängern', pos: 'verb', meaning_vi: 'gia hạn' },
      { word: 'kündigen', pos: 'verb', meaning_vi: 'chấm dứt' },
      { word: 'einhalten', pos: 'verb', meaning_vi: 'tuân thủ' },
      { word: 'verletzen', pos: 'verb', meaning_vi: 'vi phạm' },
      { word: 'gültig', pos: 'adj', meaning_vi: 'có hiệu lực' },
      { word: 'ungültig', pos: 'adj', meaning_vi: 'vô hiệu' },
      { word: 'verbindlich', pos: 'adj', meaning_vi: 'ràng buộc' },
      { word: 'befristet', pos: 'adj', meaning_vi: 'có thời hạn' },
    ]
  },

  meetingsEvents: {
    topic: 'Cuoc hop su kien',
    level: 'B1',
    words: [
      { word: 'die Veranstaltung', pos: 'noun', meaning_vi: 'sự kiện' },
      { word: 'die Konferenz', pos: 'noun', meaning_vi: 'hội nghị' },
      { word: 'der Kongress', pos: 'noun', meaning_vi: 'đại hội' },
      { word: 'das Symposium', pos: 'noun', meaning_vi: 'hội thảo' },
      { word: 'der Workshop', pos: 'noun', meaning_vi: 'workshop' },
      { word: 'die Messe', pos: 'noun', meaning_vi: 'hội chợ' },
      { word: 'die Tagung', pos: 'noun', meaning_vi: 'cuộc họp' },
      { word: 'der Vortrag', pos: 'noun', meaning_vi: 'bài thuyết trình' },
      { word: 'der Referent', pos: 'noun', meaning_vi: 'diễn giả' },
      { word: 'die Tagesordnung', pos: 'noun', meaning_vi: 'chương trình họp' },
      { word: 'organisieren', pos: 'verb', meaning_vi: 'tổ chức' },
      { word: 'teilnehmen', pos: 'verb', meaning_vi: 'tham gia' },
      { word: 'präsentieren', pos: 'verb', meaning_vi: 'trình bày' },
      { word: 'moderieren', pos: 'verb', meaning_vi: 'điều hành' },
      { word: 'diskutieren', pos: 'verb', meaning_vi: 'thảo luận' },
      { word: 'abstimmen', pos: 'verb', meaning_vi: 'biểu quyết' },
      { word: 'beschließen', pos: 'verb', meaning_vi: 'quyết định' },
      { word: 'geplant', pos: 'adj', meaning_vi: 'đã lên kế hoạch' },
      { word: 'online', pos: 'adj', meaning_vi: 'trực tuyến' },
      { word: 'hybrid', pos: 'adj', meaning_vi: 'kết hợp' },
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
console.log('║    ⛏️  MINE VOCABULARY BATCH 11                             ║');
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
