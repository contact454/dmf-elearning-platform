#!/usr/bin/env node
/**
 * Mine Vocabulary Batch 9 - Advanced & Technical Words (400 words)
 * Topics: IT/Programming, Science, Medicine Advanced, Law Advanced,
 * Environment, Politics, Economics, Philosophy, Psychology
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT = path.join(__dirname, '../data/quality-expansion/batch9-vocabulary.json');

const TOPICS = {
  // IT & Programming
  programming: {
    topic: 'Lap trinh',
    level: 'B2',
    words: [
      { word: 'der Algorithmus', pos: 'noun', meaning_vi: 'thuật toán' },
      { word: 'die Datenbank', pos: 'noun', meaning_vi: 'cơ sở dữ liệu' },
      { word: 'der Quellcode', pos: 'noun', meaning_vi: 'mã nguồn' },
      { word: 'die Schnittstelle', pos: 'noun', meaning_vi: 'giao diện' },
      { word: 'der Server', pos: 'noun', meaning_vi: 'máy chủ' },
      { word: 'die Cloud', pos: 'noun', meaning_vi: 'đám mây' },
      { word: 'das Framework', pos: 'noun', meaning_vi: 'framework' },
      { word: 'die Bibliothek', pos: 'noun', meaning_vi: 'thư viện (lập trình)' },
      { word: 'der Bug', pos: 'noun', meaning_vi: 'lỗi phần mềm' },
      { word: 'die Debugging', pos: 'noun', meaning_vi: 'gỡ lỗi' },
      { word: 'das Deployment', pos: 'noun', meaning_vi: 'triển khai' },
      { word: 'die Version', pos: 'noun', meaning_vi: 'phiên bản' },
      { word: 'das Update', pos: 'noun', meaning_vi: 'cập nhật' },
      { word: 'der Compiler', pos: 'noun', meaning_vi: 'trình biên dịch' },
      { word: 'programmieren', pos: 'verb', meaning_vi: 'lập trình' },
      { word: 'kompilieren', pos: 'verb', meaning_vi: 'biên dịch' },
      { word: 'debuggen', pos: 'verb', meaning_vi: 'gỡ lỗi' },
      { word: 'testen', pos: 'verb', meaning_vi: 'kiểm thử' },
      { word: 'implementieren', pos: 'verb', meaning_vi: 'triển khai' },
      { word: 'optimieren', pos: 'verb', meaning_vi: 'tối ưu hóa' },
    ]
  },

  networking: {
    topic: 'Mang',
    level: 'B2',
    words: [
      { word: 'das Netzwerk', pos: 'noun', meaning_vi: 'mạng' },
      { word: 'der Router', pos: 'noun', meaning_vi: 'bộ định tuyến' },
      { word: 'die Firewall', pos: 'noun', meaning_vi: 'tường lửa' },
      { word: 'das Protokoll', pos: 'noun', meaning_vi: 'giao thức' },
      { word: 'die Bandbreite', pos: 'noun', meaning_vi: 'băng thông' },
      { word: 'der Download', pos: 'noun', meaning_vi: 'tải xuống' },
      { word: 'der Upload', pos: 'noun', meaning_vi: 'tải lên' },
      { word: 'die Verschlüsselung', pos: 'noun', meaning_vi: 'mã hóa' },
      { word: 'das Passwort', pos: 'noun', meaning_vi: 'mật khẩu' },
      { word: 'die Authentifizierung', pos: 'noun', meaning_vi: 'xác thực' },
      { word: 'der Hacker', pos: 'noun', meaning_vi: 'tin tặc' },
      { word: 'der Virus', pos: 'noun', meaning_vi: 'virus' },
      { word: 'die Malware', pos: 'noun', meaning_vi: 'phần mềm độc hại' },
      { word: 'die IP-Adresse', pos: 'noun', meaning_vi: 'địa chỉ IP' },
      { word: 'herunterladen', pos: 'verb', meaning_vi: 'tải xuống' },
      { word: 'hochladen', pos: 'verb', meaning_vi: 'tải lên' },
      { word: 'verschlüsseln', pos: 'verb', meaning_vi: 'mã hóa' },
      { word: 'hacken', pos: 'verb', meaning_vi: 'hack' },
      { word: 'verbinden', pos: 'verb', meaning_vi: 'kết nối' },
      { word: 'synchronisieren', pos: 'verb', meaning_vi: 'đồng bộ hóa' },
    ]
  },

  scienceAdvanced: {
    topic: 'Khoa hoc nang cao',
    level: 'C1',
    words: [
      { word: 'die Hypothese', pos: 'noun', meaning_vi: 'giả thuyết' },
      { word: 'die Theorie', pos: 'noun', meaning_vi: 'lý thuyết' },
      { word: 'das Experiment', pos: 'noun', meaning_vi: 'thí nghiệm' },
      { word: 'die Variable', pos: 'noun', meaning_vi: 'biến số' },
      { word: 'die Konstante', pos: 'noun', meaning_vi: 'hằng số' },
      { word: 'die Korrelation', pos: 'noun', meaning_vi: 'tương quan' },
      { word: 'die Kausalität', pos: 'noun', meaning_vi: 'quan hệ nhân quả' },
      { word: 'die Methodik', pos: 'noun', meaning_vi: 'phương pháp luận' },
      { word: 'die Stichprobe', pos: 'noun', meaning_vi: 'mẫu nghiên cứu' },
      { word: 'die Signifikanz', pos: 'noun', meaning_vi: 'ý nghĩa thống kê' },
      { word: 'die Validität', pos: 'noun', meaning_vi: 'tính hiệu lực' },
      { word: 'die Reliabilität', pos: 'noun', meaning_vi: 'độ tin cậy' },
      { word: 'die Replikation', pos: 'noun', meaning_vi: 'sao chép thí nghiệm' },
      { word: 'der Peer-Review', pos: 'noun', meaning_vi: 'đánh giá ngang hàng' },
      { word: 'analysieren', pos: 'verb', meaning_vi: 'phân tích' },
      { word: 'synthetisieren', pos: 'verb', meaning_vi: 'tổng hợp' },
      { word: 'verifizieren', pos: 'verb', meaning_vi: 'xác minh' },
      { word: 'falsifizieren', pos: 'verb', meaning_vi: 'bác bỏ' },
      { word: 'quantifizieren', pos: 'verb', meaning_vi: 'định lượng' },
      { word: 'publizieren', pos: 'verb', meaning_vi: 'công bố' },
    ]
  },

  medicineAdvanced: {
    topic: 'Y hoc nang cao',
    level: 'C1',
    words: [
      { word: 'die Diagnose', pos: 'noun', meaning_vi: 'chẩn đoán' },
      { word: 'die Prognose', pos: 'noun', meaning_vi: 'tiên lượng' },
      { word: 'die Therapie', pos: 'noun', meaning_vi: 'liệu pháp' },
      { word: 'die Rehabilitation', pos: 'noun', meaning_vi: 'phục hồi chức năng' },
      { word: 'die Palliativmedizin', pos: 'noun', meaning_vi: 'y học giảm nhẹ' },
      { word: 'die Genetik', pos: 'noun', meaning_vi: 'di truyền học' },
      { word: 'die Onkologie', pos: 'noun', meaning_vi: 'ung thư học' },
      { word: 'die Kardiologie', pos: 'noun', meaning_vi: 'tim mạch học' },
      { word: 'die Neurologie', pos: 'noun', meaning_vi: 'thần kinh học' },
      { word: 'die Psychiatrie', pos: 'noun', meaning_vi: 'tâm thần học' },
      { word: 'die Immunologie', pos: 'noun', meaning_vi: 'miễn dịch học' },
      { word: 'die Epidemiologie', pos: 'noun', meaning_vi: 'dịch tễ học' },
      { word: 'das Symptom', pos: 'noun', meaning_vi: 'triệu chứng' },
      { word: 'die Nebenwirkung', pos: 'noun', meaning_vi: 'tác dụng phụ' },
      { word: 'diagnostizieren', pos: 'verb', meaning_vi: 'chẩn đoán' },
      { word: 'therapieren', pos: 'verb', meaning_vi: 'điều trị' },
      { word: 'operieren', pos: 'verb', meaning_vi: 'phẫu thuật' },
      { word: 'transplantieren', pos: 'verb', meaning_vi: 'cấy ghép' },
      { word: 'chronisch', pos: 'adj', meaning_vi: 'mãn tính' },
      { word: 'akut', pos: 'adj', meaning_vi: 'cấp tính' },
    ]
  },

  environment: {
    topic: 'Moi truong',
    level: 'B2',
    words: [
      { word: 'der Klimawandel', pos: 'noun', meaning_vi: 'biến đổi khí hậu' },
      { word: 'die Erderwärmung', pos: 'noun', meaning_vi: 'nóng lên toàn cầu' },
      { word: 'der Treibhauseffekt', pos: 'noun', meaning_vi: 'hiệu ứng nhà kính' },
      { word: 'die Emission', pos: 'noun', meaning_vi: 'khí thải' },
      { word: 'der CO2-Ausstoß', pos: 'noun', meaning_vi: 'lượng phát thải CO2' },
      { word: 'die Nachhaltigkeit', pos: 'noun', meaning_vi: 'bền vững' },
      { word: 'die erneuerbare Energie', pos: 'noun', meaning_vi: 'năng lượng tái tạo' },
      { word: 'die Solarenergie', pos: 'noun', meaning_vi: 'năng lượng mặt trời' },
      { word: 'die Windenergie', pos: 'noun', meaning_vi: 'năng lượng gió' },
      { word: 'das Recycling', pos: 'noun', meaning_vi: 'tái chế' },
      { word: 'die Mülltrennung', pos: 'noun', meaning_vi: 'phân loại rác' },
      { word: 'die Umweltverschmutzung', pos: 'noun', meaning_vi: 'ô nhiễm môi trường' },
      { word: 'der Artenschutz', pos: 'noun', meaning_vi: 'bảo vệ loài' },
      { word: 'das Ökosystem', pos: 'noun', meaning_vi: 'hệ sinh thái' },
      { word: 'die Biodiversität', pos: 'noun', meaning_vi: 'đa dạng sinh học' },
      { word: 'recyceln', pos: 'verb', meaning_vi: 'tái chế' },
      { word: 'reduzieren', pos: 'verb', meaning_vi: 'giảm' },
      { word: 'nachhaltig', pos: 'adj', meaning_vi: 'bền vững' },
      { word: 'umweltfreundlich', pos: 'adj', meaning_vi: 'thân thiện môi trường' },
      { word: 'klimaneutral', pos: 'adj', meaning_vi: 'trung hòa carbon' },
    ]
  },

  politics: {
    topic: 'Chinh tri',
    level: 'B2',
    words: [
      { word: 'die Demokratie', pos: 'noun', meaning_vi: 'dân chủ' },
      { word: 'die Diktatur', pos: 'noun', meaning_vi: 'độc tài' },
      { word: 'die Regierung', pos: 'noun', meaning_vi: 'chính phủ' },
      { word: 'das Parlament', pos: 'noun', meaning_vi: 'quốc hội' },
      { word: 'die Opposition', pos: 'noun', meaning_vi: 'phe đối lập' },
      { word: 'die Koalition', pos: 'noun', meaning_vi: 'liên minh' },
      { word: 'die Wahl', pos: 'noun', meaning_vi: 'bầu cử' },
      { word: 'der Wahlkampf', pos: 'noun', meaning_vi: 'chiến dịch tranh cử' },
      { word: 'die Abstimmung', pos: 'noun', meaning_vi: 'bỏ phiếu' },
      { word: 'der Politiker', pos: 'noun', meaning_vi: 'chính trị gia' },
      { word: 'der Bundeskanzler', pos: 'noun', meaning_vi: 'thủ tướng liên bang' },
      { word: 'der Bundespräsident', pos: 'noun', meaning_vi: 'tổng thống liên bang' },
      { word: 'der Minister', pos: 'noun', meaning_vi: 'bộ trưởng' },
      { word: 'der Abgeordnete', pos: 'noun', meaning_vi: 'đại biểu quốc hội' },
      { word: 'die Reform', pos: 'noun', meaning_vi: 'cải cách' },
      { word: 'wählen', pos: 'verb', meaning_vi: 'bầu' },
      { word: 'abstimmen', pos: 'verb', meaning_vi: 'bỏ phiếu' },
      { word: 'regieren', pos: 'verb', meaning_vi: 'cai trị' },
      { word: 'protestieren', pos: 'verb', meaning_vi: 'biểu tình' },
      { word: 'verhandeln', pos: 'verb', meaning_vi: 'đàm phán' },
    ]
  },

  economics: {
    topic: 'Kinh te',
    level: 'B2',
    words: [
      { word: 'die Wirtschaft', pos: 'noun', meaning_vi: 'kinh tế' },
      { word: 'das Bruttoinlandsprodukt', pos: 'noun', meaning_vi: 'GDP' },
      { word: 'die Inflation', pos: 'noun', meaning_vi: 'lạm phát' },
      { word: 'die Deflation', pos: 'noun', meaning_vi: 'giảm phát' },
      { word: 'die Rezession', pos: 'noun', meaning_vi: 'suy thoái' },
      { word: 'das Wachstum', pos: 'noun', meaning_vi: 'tăng trưởng' },
      { word: 'die Arbeitslosigkeit', pos: 'noun', meaning_vi: 'thất nghiệp' },
      { word: 'der Export', pos: 'noun', meaning_vi: 'xuất khẩu' },
      { word: 'der Import', pos: 'noun', meaning_vi: 'nhập khẩu' },
      { word: 'der Handel', pos: 'noun', meaning_vi: 'thương mại' },
      { word: 'die Börse', pos: 'noun', meaning_vi: 'sàn chứng khoán' },
      { word: 'die Aktie', pos: 'noun', meaning_vi: 'cổ phiếu' },
      { word: 'der Anleger', pos: 'noun', meaning_vi: 'nhà đầu tư' },
      { word: 'die Dividende', pos: 'noun', meaning_vi: 'cổ tức' },
      { word: 'die Subvention', pos: 'noun', meaning_vi: 'trợ cấp' },
      { word: 'investieren', pos: 'verb', meaning_vi: 'đầu tư' },
      { word: 'exportieren', pos: 'verb', meaning_vi: 'xuất khẩu' },
      { word: 'importieren', pos: 'verb', meaning_vi: 'nhập khẩu' },
      { word: 'subventionieren', pos: 'verb', meaning_vi: 'trợ cấp' },
      { word: 'privatisieren', pos: 'verb', meaning_vi: 'tư nhân hóa' },
    ]
  },

  philosophy: {
    topic: 'Triet hoc',
    level: 'C1',
    words: [
      { word: 'die Ethik', pos: 'noun', meaning_vi: 'đạo đức học' },
      { word: 'die Moral', pos: 'noun', meaning_vi: 'đạo đức' },
      { word: 'die Logik', pos: 'noun', meaning_vi: 'logic' },
      { word: 'die Metaphysik', pos: 'noun', meaning_vi: 'siêu hình học' },
      { word: 'die Ontologie', pos: 'noun', meaning_vi: 'bản thể học' },
      { word: 'die Epistemologie', pos: 'noun', meaning_vi: 'nhận thức luận' },
      { word: 'der Existenzialismus', pos: 'noun', meaning_vi: 'chủ nghĩa hiện sinh' },
      { word: 'der Rationalismus', pos: 'noun', meaning_vi: 'chủ nghĩa duy lý' },
      { word: 'der Empirismus', pos: 'noun', meaning_vi: 'chủ nghĩa kinh nghiệm' },
      { word: 'das Bewusstsein', pos: 'noun', meaning_vi: 'ý thức' },
      { word: 'der freie Wille', pos: 'noun', meaning_vi: 'ý chí tự do' },
      { word: 'die Wahrheit', pos: 'noun', meaning_vi: 'sự thật' },
      { word: 'die Gerechtigkeit', pos: 'noun', meaning_vi: 'công lý' },
      { word: 'die Tugend', pos: 'noun', meaning_vi: 'đức hạnh' },
      { word: 'philosophieren', pos: 'verb', meaning_vi: 'triết lý' },
      { word: 'reflektieren', pos: 'verb', meaning_vi: 'suy ngẫm' },
      { word: 'hinterfragen', pos: 'verb', meaning_vi: 'đặt câu hỏi' },
      { word: 'argumentieren', pos: 'verb', meaning_vi: 'lập luận' },
      { word: 'rational', pos: 'adj', meaning_vi: 'lý trí' },
      { word: 'abstrakt', pos: 'adj', meaning_vi: 'trừu tượng' },
    ]
  },

  psychology: {
    topic: 'Tam ly hoc',
    level: 'B2',
    words: [
      { word: 'die Psychologie', pos: 'noun', meaning_vi: 'tâm lý học' },
      { word: 'das Verhalten', pos: 'noun', meaning_vi: 'hành vi' },
      { word: 'die Persönlichkeit', pos: 'noun', meaning_vi: 'nhân cách' },
      { word: 'das Unterbewusstsein', pos: 'noun', meaning_vi: 'tiềm thức' },
      { word: 'die Wahrnehmung', pos: 'noun', meaning_vi: 'nhận thức' },
      { word: 'die Motivation', pos: 'noun', meaning_vi: 'động lực' },
      { word: 'die Emotion', pos: 'noun', meaning_vi: 'cảm xúc' },
      { word: 'die Kognition', pos: 'noun', meaning_vi: 'nhận thức' },
      { word: 'das Trauma', pos: 'noun', meaning_vi: 'chấn thương tâm lý' },
      { word: 'die Depression', pos: 'noun', meaning_vi: 'trầm cảm' },
      { word: 'die Angststörung', pos: 'noun', meaning_vi: 'rối loạn lo âu' },
      { word: 'die Therapie', pos: 'noun', meaning_vi: 'liệu pháp' },
      { word: 'der Therapeut', pos: 'noun', meaning_vi: 'nhà trị liệu' },
      { word: 'der Psychologe', pos: 'noun', meaning_vi: 'nhà tâm lý học' },
      { word: 'verdrängen', pos: 'verb', meaning_vi: 'đè nén' },
      { word: 'projizieren', pos: 'verb', meaning_vi: 'chiếu' },
      { word: 'konditionieren', pos: 'verb', meaning_vi: 'điều kiện hóa' },
      { word: 'psychisch', pos: 'adj', meaning_vi: 'tâm lý' },
      { word: 'kognitiv', pos: 'adj', meaning_vi: 'nhận thức' },
      { word: 'emotional', pos: 'adj', meaning_vi: 'cảm xúc' },
    ]
  },

  sociology: {
    topic: 'Xa hoi hoc',
    level: 'B2',
    words: [
      { word: 'die Gesellschaft', pos: 'noun', meaning_vi: 'xã hội' },
      { word: 'die Kultur', pos: 'noun', meaning_vi: 'văn hóa' },
      { word: 'die Tradition', pos: 'noun', meaning_vi: 'truyền thống' },
      { word: 'die Norm', pos: 'noun', meaning_vi: 'chuẩn mực' },
      { word: 'der Wert', pos: 'noun', meaning_vi: 'giá trị' },
      { word: 'die Schicht', pos: 'noun', meaning_vi: 'tầng lớp' },
      { word: 'die Klasse', pos: 'noun', meaning_vi: 'giai cấp' },
      { word: 'die Elite', pos: 'noun', meaning_vi: 'tầng lớp tinh hoa' },
      { word: 'die Globalisierung', pos: 'noun', meaning_vi: 'toàn cầu hóa' },
      { word: 'die Integration', pos: 'noun', meaning_vi: 'hội nhập' },
      { word: 'die Diskriminierung', pos: 'noun', meaning_vi: 'phân biệt đối xử' },
      { word: 'die Gleichberechtigung', pos: 'noun', meaning_vi: 'bình đẳng' },
      { word: 'der Rassismus', pos: 'noun', meaning_vi: 'phân biệt chủng tộc' },
      { word: 'der Sexismus', pos: 'noun', meaning_vi: 'phân biệt giới tính' },
      { word: 'integrieren', pos: 'verb', meaning_vi: 'hội nhập' },
      { word: 'diskriminieren', pos: 'verb', meaning_vi: 'phân biệt đối xử' },
      { word: 'assimilieren', pos: 'verb', meaning_vi: 'đồng hóa' },
      { word: 'sozialisieren', pos: 'verb', meaning_vi: 'xã hội hóa' },
      { word: 'sozial', pos: 'adj', meaning_vi: 'xã hội' },
      { word: 'kulturell', pos: 'adj', meaning_vi: 'văn hóa' },
    ]
  },

  lawAdvanced: {
    topic: 'Phap luat nang cao',
    level: 'C1',
    words: [
      { word: 'die Verfassung', pos: 'noun', meaning_vi: 'hiến pháp' },
      { word: 'das Grundgesetz', pos: 'noun', meaning_vi: 'luật cơ bản' },
      { word: 'die Rechtsprechung', pos: 'noun', meaning_vi: 'án lệ' },
      { word: 'das Zivilrecht', pos: 'noun', meaning_vi: 'luật dân sự' },
      { word: 'das Strafrecht', pos: 'noun', meaning_vi: 'luật hình sự' },
      { word: 'das Verwaltungsrecht', pos: 'noun', meaning_vi: 'luật hành chính' },
      { word: 'das Arbeitsrecht', pos: 'noun', meaning_vi: 'luật lao động' },
      { word: 'der Präzedenzfall', pos: 'noun', meaning_vi: 'tiền lệ' },
      { word: 'die Klausel', pos: 'noun', meaning_vi: 'điều khoản' },
      { word: 'die Berufung', pos: 'noun', meaning_vi: 'kháng cáo' },
      { word: 'die Revision', pos: 'noun', meaning_vi: 'phúc thẩm' },
      { word: 'der Freispruch', pos: 'noun', meaning_vi: 'tha bổng' },
      { word: 'die Bewährungsstrafe', pos: 'noun', meaning_vi: 'án treo' },
      { word: 'die Haftstrafe', pos: 'noun', meaning_vi: 'án tù' },
      { word: 'verklagen', pos: 'verb', meaning_vi: 'kiện' },
      { word: 'berappen', pos: 'verb', meaning_vi: 'kháng cáo' },
      { word: 'verfassungswidrig', pos: 'adj', meaning_vi: 'vi hiến' },
      { word: 'rechtmäßig', pos: 'adj', meaning_vi: 'hợp pháp' },
      { word: 'rechtswidrig', pos: 'adj', meaning_vi: 'bất hợp pháp' },
      { word: 'strafbar', pos: 'adj', meaning_vi: 'có thể bị truy tố' },
    ]
  },

  business: {
    topic: 'Kinh doanh',
    level: 'B2',
    words: [
      { word: 'das Unternehmen', pos: 'noun', meaning_vi: 'doanh nghiệp' },
      { word: 'die Firma', pos: 'noun', meaning_vi: 'công ty' },
      { word: 'der Konzern', pos: 'noun', meaning_vi: 'tập đoàn' },
      { word: 'die Geschäftsführung', pos: 'noun', meaning_vi: 'ban giám đốc' },
      { word: 'der Vorstand', pos: 'noun', meaning_vi: 'hội đồng quản trị' },
      { word: 'die Bilanz', pos: 'noun', meaning_vi: 'bảng cân đối' },
      { word: 'der Umsatz', pos: 'noun', meaning_vi: 'doanh thu' },
      { word: 'der Gewinn', pos: 'noun', meaning_vi: 'lợi nhuận' },
      { word: 'der Verlust', pos: 'noun', meaning_vi: 'thua lỗ' },
      { word: 'die Buchhaltung', pos: 'noun', meaning_vi: 'kế toán' },
      { word: 'die Rechnung', pos: 'noun', meaning_vi: 'hóa đơn' },
      { word: 'die Quittung', pos: 'noun', meaning_vi: 'biên lai' },
      { word: 'der Lieferant', pos: 'noun', meaning_vi: 'nhà cung cấp' },
      { word: 'der Kunde', pos: 'noun', meaning_vi: 'khách hàng' },
      { word: 'die Konkurrenz', pos: 'noun', meaning_vi: 'cạnh tranh' },
      { word: 'gründen', pos: 'verb', meaning_vi: 'thành lập' },
      { word: 'fusionieren', pos: 'verb', meaning_vi: 'sáp nhập' },
      { word: 'expandieren', pos: 'verb', meaning_vi: 'mở rộng' },
      { word: 'konkurrieren', pos: 'verb', meaning_vi: 'cạnh tranh' },
      { word: 'rentabel', pos: 'adj', meaning_vi: 'có lãi' },
    ]
  },

  media: {
    topic: 'Truyen thong',
    level: 'B1',
    words: [
      { word: 'die Presse', pos: 'noun', meaning_vi: 'báo chí' },
      { word: 'die Zeitung', pos: 'noun', meaning_vi: 'tờ báo' },
      { word: 'die Zeitschrift', pos: 'noun', meaning_vi: 'tạp chí' },
      { word: 'der Artikel', pos: 'noun', meaning_vi: 'bài báo' },
      { word: 'die Schlagzeile', pos: 'noun', meaning_vi: 'tiêu đề' },
      { word: 'der Journalist', pos: 'noun', meaning_vi: 'nhà báo' },
      { word: 'der Reporter', pos: 'noun', meaning_vi: 'phóng viên' },
      { word: 'die Redaktion', pos: 'noun', meaning_vi: 'tòa soạn' },
      { word: 'die Sendung', pos: 'noun', meaning_vi: 'chương trình' },
      { word: 'die Nachrichten', pos: 'noun', meaning_vi: 'tin tức' },
      { word: 'der Moderator', pos: 'noun', meaning_vi: 'người dẫn chương trình' },
      { word: 'die Werbung', pos: 'noun', meaning_vi: 'quảng cáo' },
      { word: 'der Podcast', pos: 'noun', meaning_vi: 'podcast' },
      { word: 'der Livestream', pos: 'noun', meaning_vi: 'phát trực tiếp' },
      { word: 'berichten', pos: 'verb', meaning_vi: 'đưa tin' },
      { word: 'veröffentlichen', pos: 'verb', meaning_vi: 'công bố' },
      { word: 'senden', pos: 'verb', meaning_vi: 'phát sóng' },
      { word: 'übertragen', pos: 'verb', meaning_vi: 'truyền' },
      { word: 'aktuell', pos: 'adj', meaning_vi: 'hiện tại' },
      { word: 'viral', pos: 'adj', meaning_vi: 'lan truyền' },
    ]
  },

  education: {
    topic: 'Giao duc',
    level: 'B1',
    words: [
      { word: 'die Bildung', pos: 'noun', meaning_vi: 'giáo dục' },
      { word: 'das Wissen', pos: 'noun', meaning_vi: 'kiến thức' },
      { word: 'die Fertigkeit', pos: 'noun', meaning_vi: 'kỹ năng' },
      { word: 'die Kompetenz', pos: 'noun', meaning_vi: 'năng lực' },
      { word: 'der Lehrplan', pos: 'noun', meaning_vi: 'chương trình học' },
      { word: 'die Methode', pos: 'noun', meaning_vi: 'phương pháp' },
      { word: 'die Didaktik', pos: 'noun', meaning_vi: 'phương pháp giảng dạy' },
      { word: 'die Pädagogik', pos: 'noun', meaning_vi: 'sư phạm' },
      { word: 'die Evaluation', pos: 'noun', meaning_vi: 'đánh giá' },
      { word: 'die Bewertung', pos: 'noun', meaning_vi: 'chấm điểm' },
      { word: 'der Lernprozess', pos: 'noun', meaning_vi: 'quá trình học' },
      { word: 'die Nachhilfe', pos: 'noun', meaning_vi: 'dạy kèm' },
      { word: 'die Weiterbildung', pos: 'noun', meaning_vi: 'đào tạo nâng cao' },
      { word: 'die Fortbildung', pos: 'noun', meaning_vi: 'bồi dưỡng' },
      { word: 'unterrichten', pos: 'verb', meaning_vi: 'dạy' },
      { word: 'ausbilden', pos: 'verb', meaning_vi: 'đào tạo' },
      { word: 'fördern', pos: 'verb', meaning_vi: 'hỗ trợ' },
      { word: 'bewerten', pos: 'verb', meaning_vi: 'đánh giá' },
      { word: 'pädagogisch', pos: 'adj', meaning_vi: 'sư phạm' },
      { word: 'akademisch', pos: 'adj', meaning_vi: 'học thuật' },
    ]
  },

  art: {
    topic: 'Nghe thuat',
    level: 'B1',
    words: [
      { word: 'die Kunst', pos: 'noun', meaning_vi: 'nghệ thuật' },
      { word: 'der Künstler', pos: 'noun', meaning_vi: 'nghệ sĩ' },
      { word: 'das Gemälde', pos: 'noun', meaning_vi: 'bức tranh' },
      { word: 'die Skulptur', pos: 'noun', meaning_vi: 'điêu khắc' },
      { word: 'die Ausstellung', pos: 'noun', meaning_vi: 'triển lãm' },
      { word: 'die Galerie', pos: 'noun', meaning_vi: 'phòng trưng bày' },
      { word: 'der Stil', pos: 'noun', meaning_vi: 'phong cách' },
      { word: 'die Epoche', pos: 'noun', meaning_vi: 'thời kỳ' },
      { word: 'der Impressionismus', pos: 'noun', meaning_vi: 'trường phái ấn tượng' },
      { word: 'der Expressionismus', pos: 'noun', meaning_vi: 'trường phái biểu hiện' },
      { word: 'die Fotografie', pos: 'noun', meaning_vi: 'nhiếp ảnh' },
      { word: 'die Architektur', pos: 'noun', meaning_vi: 'kiến trúc' },
      { word: 'das Design', pos: 'noun', meaning_vi: 'thiết kế' },
      { word: 'die Kreativität', pos: 'noun', meaning_vi: 'sáng tạo' },
      { word: 'malen', pos: 'verb', meaning_vi: 'vẽ' },
      { word: 'zeichnen', pos: 'verb', meaning_vi: 'vẽ/phác họa' },
      { word: 'gestalten', pos: 'verb', meaning_vi: 'thiết kế' },
      { word: 'ausstellen', pos: 'verb', meaning_vi: 'triển lãm' },
      { word: 'künstlerisch', pos: 'adj', meaning_vi: 'nghệ thuật' },
      { word: 'ästhetisch', pos: 'adj', meaning_vi: 'thẩm mỹ' },
    ]
  },

  music: {
    topic: 'Am nhac',
    level: 'B1',
    words: [
      { word: 'die Musik', pos: 'noun', meaning_vi: 'âm nhạc' },
      { word: 'der Musiker', pos: 'noun', meaning_vi: 'nhạc sĩ' },
      { word: 'der Komponist', pos: 'noun', meaning_vi: 'nhà soạn nhạc' },
      { word: 'das Orchester', pos: 'noun', meaning_vi: 'dàn nhạc' },
      { word: 'der Dirigent', pos: 'noun', meaning_vi: 'nhạc trưởng' },
      { word: 'die Symphonie', pos: 'noun', meaning_vi: 'giao hưởng' },
      { word: 'das Konzert', pos: 'noun', meaning_vi: 'buổi hòa nhạc' },
      { word: 'die Melodie', pos: 'noun', meaning_vi: 'giai điệu' },
      { word: 'der Rhythmus', pos: 'noun', meaning_vi: 'nhịp điệu' },
      { word: 'die Harmonie', pos: 'noun', meaning_vi: 'hòa âm' },
      { word: 'der Ton', pos: 'noun', meaning_vi: 'âm thanh' },
      { word: 'die Tonleiter', pos: 'noun', meaning_vi: 'âm giai' },
      { word: 'das Instrument', pos: 'noun', meaning_vi: 'nhạc cụ' },
      { word: 'die Geige', pos: 'noun', meaning_vi: 'violin' },
      { word: 'komponieren', pos: 'verb', meaning_vi: 'soạn nhạc' },
      { word: 'dirigieren', pos: 'verb', meaning_vi: 'chỉ huy' },
      { word: 'auftreten', pos: 'verb', meaning_vi: 'biểu diễn' },
      { word: 'üben', pos: 'verb', meaning_vi: 'luyện tập' },
      { word: 'klassisch', pos: 'adj', meaning_vi: 'cổ điển' },
      { word: 'melodisch', pos: 'adj', meaning_vi: 'du dương' },
    ]
  },

  literature: {
    topic: 'Van hoc',
    level: 'B2',
    words: [
      { word: 'die Literatur', pos: 'noun', meaning_vi: 'văn học' },
      { word: 'der Roman', pos: 'noun', meaning_vi: 'tiểu thuyết' },
      { word: 'die Novelle', pos: 'noun', meaning_vi: 'truyện vừa' },
      { word: 'die Kurzgeschichte', pos: 'noun', meaning_vi: 'truyện ngắn' },
      { word: 'das Gedicht', pos: 'noun', meaning_vi: 'bài thơ' },
      { word: 'das Drama', pos: 'noun', meaning_vi: 'kịch' },
      { word: 'der Autor', pos: 'noun', meaning_vi: 'tác giả' },
      { word: 'der Dichter', pos: 'noun', meaning_vi: 'nhà thơ' },
      { word: 'der Schriftsteller', pos: 'noun', meaning_vi: 'nhà văn' },
      { word: 'die Handlung', pos: 'noun', meaning_vi: 'cốt truyện' },
      { word: 'die Figur', pos: 'noun', meaning_vi: 'nhân vật' },
      { word: 'der Erzähler', pos: 'noun', meaning_vi: 'người kể chuyện' },
      { word: 'die Metapher', pos: 'noun', meaning_vi: 'ẩn dụ' },
      { word: 'das Symbol', pos: 'noun', meaning_vi: 'biểu tượng' },
      { word: 'verfassen', pos: 'verb', meaning_vi: 'soạn' },
      { word: 'dichten', pos: 'verb', meaning_vi: 'làm thơ' },
      { word: 'interpretieren', pos: 'verb', meaning_vi: 'diễn giải' },
      { word: 'analysieren', pos: 'verb', meaning_vi: 'phân tích' },
      { word: 'literarisch', pos: 'adj', meaning_vi: 'văn học' },
      { word: 'poetisch', pos: 'adj', meaning_vi: 'thơ mộng' },
    ]
  },

  history: {
    topic: 'Lich su',
    level: 'B2',
    words: [
      { word: 'die Geschichte', pos: 'noun', meaning_vi: 'lịch sử' },
      { word: 'die Epoche', pos: 'noun', meaning_vi: 'thời đại' },
      { word: 'das Jahrhundert', pos: 'noun', meaning_vi: 'thế kỷ' },
      { word: 'das Jahrzehnt', pos: 'noun', meaning_vi: 'thập kỷ' },
      { word: 'die Antike', pos: 'noun', meaning_vi: 'thời cổ đại' },
      { word: 'das Mittelalter', pos: 'noun', meaning_vi: 'thời trung cổ' },
      { word: 'die Renaissance', pos: 'noun', meaning_vi: 'thời phục hưng' },
      { word: 'die Aufklärung', pos: 'noun', meaning_vi: 'thời khai sáng' },
      { word: 'die Revolution', pos: 'noun', meaning_vi: 'cách mạng' },
      { word: 'der Weltkrieg', pos: 'noun', meaning_vi: 'thế chiến' },
      { word: 'das Reich', pos: 'noun', meaning_vi: 'đế chế' },
      { word: 'die Dynastie', pos: 'noun', meaning_vi: 'triều đại' },
      { word: 'der Herrscher', pos: 'noun', meaning_vi: 'người cai trị' },
      { word: 'die Kolonie', pos: 'noun', meaning_vi: 'thuộc địa' },
      { word: 'erobern', pos: 'verb', meaning_vi: 'chinh phục' },
      { word: 'herrschen', pos: 'verb', meaning_vi: 'cai trị' },
      { word: 'kolonisieren', pos: 'verb', meaning_vi: 'thuộc địa hóa' },
      { word: 'revolutionieren', pos: 'verb', meaning_vi: 'cách mạng hóa' },
      { word: 'historisch', pos: 'adj', meaning_vi: 'lịch sử' },
      { word: 'mittelalterlich', pos: 'adj', meaning_vi: 'trung cổ' },
    ]
  },

  religion: {
    topic: 'Ton giao',
    level: 'B2',
    words: [
      { word: 'die Religion', pos: 'noun', meaning_vi: 'tôn giáo' },
      { word: 'der Glaube', pos: 'noun', meaning_vi: 'niềm tin' },
      { word: 'die Spiritualität', pos: 'noun', meaning_vi: 'tâm linh' },
      { word: 'das Christentum', pos: 'noun', meaning_vi: 'Kitô giáo' },
      { word: 'der Islam', pos: 'noun', meaning_vi: 'Hồi giáo' },
      { word: 'das Judentum', pos: 'noun', meaning_vi: 'Do Thái giáo' },
      { word: 'der Buddhismus', pos: 'noun', meaning_vi: 'Phật giáo' },
      { word: 'der Hinduismus', pos: 'noun', meaning_vi: 'Ấn Độ giáo' },
      { word: 'der Atheismus', pos: 'noun', meaning_vi: 'thuyết vô thần' },
      { word: 'die Seele', pos: 'noun', meaning_vi: 'linh hồn' },
      { word: 'das Gebet', pos: 'noun', meaning_vi: 'lời cầu nguyện' },
      { word: 'die Meditation', pos: 'noun', meaning_vi: 'thiền định' },
      { word: 'der Gottesdienst', pos: 'noun', meaning_vi: 'lễ cầu nguyện' },
      { word: 'die Gemeinde', pos: 'noun', meaning_vi: 'cộng đồng tín ngưỡng' },
      { word: 'glauben', pos: 'verb', meaning_vi: 'tin' },
      { word: 'beten', pos: 'verb', meaning_vi: 'cầu nguyện' },
      { word: 'meditieren', pos: 'verb', meaning_vi: 'thiền' },
      { word: 'religiös', pos: 'adj', meaning_vi: 'tôn giáo' },
      { word: 'spirituell', pos: 'adj', meaning_vi: 'tâm linh' },
      { word: 'gläubig', pos: 'adj', meaning_vi: 'có đức tin' },
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
console.log('║    ⛏️  MINE VOCABULARY BATCH 9                              ║');
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
