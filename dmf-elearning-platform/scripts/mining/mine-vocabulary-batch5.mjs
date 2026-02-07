#!/usr/bin/env node
/**
 * Mine Vocabulary Batch 5 - Phrasal Verbs & Compound Words
 * Target: 600+ words for B1-B2 learners
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT = path.join(__dirname, '../data/quality-expansion/batch5-vocabulary.json');

const TOPICS = {
  // Separable Verbs (trennbare Verben)
  separable_verbs: {
    level: 'A2',
    words: [
      { word: 'aufmachen', meaning_vi: 'mở', pos: 'verb' },
      { word: 'zumachen', meaning_vi: 'đóng', pos: 'verb' },
      { word: 'aufstehen', meaning_vi: 'đứng dậy', pos: 'verb' },
      { word: 'einschlafen', meaning_vi: 'ngủ thiếp đi', pos: 'verb' },
      { word: 'mitkommen', meaning_vi: 'đi cùng', pos: 'verb' },
      { word: 'mitbringen', meaning_vi: 'mang theo', pos: 'verb' },
      { word: 'mitnehmen', meaning_vi: 'mang đi', pos: 'verb' },
      { word: 'zurückkommen', meaning_vi: 'quay lại', pos: 'verb' },
      { word: 'zurückgeben', meaning_vi: 'trả lại', pos: 'verb' },
      { word: 'zurückrufen', meaning_vi: 'gọi lại', pos: 'verb' },
      { word: 'vorbeikommen', meaning_vi: 'ghé qua', pos: 'verb' },
      { word: 'vorbeigehen', meaning_vi: 'đi ngang qua', pos: 'verb' },
      { word: 'anfangen', meaning_vi: 'bắt đầu', pos: 'verb' },
      { word: 'aufhören', meaning_vi: 'ngừng, dừng lại', pos: 'verb' },
      { word: 'anrufen', meaning_vi: 'gọi điện', pos: 'verb' },
      { word: 'abholen', meaning_vi: 'đón', pos: 'verb' },
      { word: 'abgeben', meaning_vi: 'nộp, giao', pos: 'verb' },
      { word: 'einladen', meaning_vi: 'mời', pos: 'verb' },
      { word: 'einsteigen', meaning_vi: 'lên (xe)', pos: 'verb' },
      { word: 'aussteigen', meaning_vi: 'xuống (xe)', pos: 'verb' },
      { word: 'umsteigen', meaning_vi: 'đổi (xe)', pos: 'verb' },
      { word: 'ankommen', meaning_vi: 'đến nơi', pos: 'verb' },
      { word: 'abfahren', meaning_vi: 'khởi hành', pos: 'verb' },
      { word: 'wegfahren', meaning_vi: 'đi xa', pos: 'verb' },
      { word: 'hinfahren', meaning_vi: 'đi đến', pos: 'verb' },
      { word: 'aufräumen', meaning_vi: 'dọn dẹp', pos: 'verb' },
      { word: 'ausmachen', meaning_vi: 'tắt', pos: 'verb' },
      { word: 'anmachen', meaning_vi: 'bật', pos: 'verb' },
      { word: 'einkaufen', meaning_vi: 'mua sắm', pos: 'verb' },
      { word: 'fernsehen', meaning_vi: 'xem TV', pos: 'verb' },
    ]
  },

  // Inseparable Verbs (untrennbare Verben)
  inseparable_verbs: {
    level: 'B1',
    words: [
      { word: 'verstehen', meaning_vi: 'hiểu', pos: 'verb' },
      { word: 'vergessen', meaning_vi: 'quên', pos: 'verb' },
      { word: 'verkaufen', meaning_vi: 'bán', pos: 'verb' },
      { word: 'verlieren', meaning_vi: 'mất, thua', pos: 'verb' },
      { word: 'verlassen', meaning_vi: 'rời bỏ', pos: 'verb' },
      { word: 'versuchen', meaning_vi: 'thử', pos: 'verb' },
      { word: 'versprechen', meaning_vi: 'hứa', pos: 'verb' },
      { word: 'verbringen', meaning_vi: 'dành (thời gian)', pos: 'verb' },
      { word: 'verdienen', meaning_vi: 'kiếm tiền', pos: 'verb' },
      { word: 'verändern', meaning_vi: 'thay đổi', pos: 'verb' },
      { word: 'verbessern', meaning_vi: 'cải thiện', pos: 'verb' },
      { word: 'vergleichen', meaning_vi: 'so sánh', pos: 'verb' },
      { word: 'verbieten', meaning_vi: 'cấm', pos: 'verb' },
      { word: 'beschreiben', meaning_vi: 'mô tả', pos: 'verb' },
      { word: 'beschließen', meaning_vi: 'quyết định', pos: 'verb' },
      { word: 'besuchen', meaning_vi: 'thăm', pos: 'verb' },
      { word: 'bezahlen', meaning_vi: 'thanh toán', pos: 'verb' },
      { word: 'beginnen', meaning_vi: 'bắt đầu', pos: 'verb' },
      { word: 'bekommen', meaning_vi: 'nhận được', pos: 'verb' },
      { word: 'benutzen', meaning_vi: 'sử dụng', pos: 'verb' },
      { word: 'bemerken', meaning_vi: 'nhận ra', pos: 'verb' },
      { word: 'beenden', meaning_vi: 'kết thúc', pos: 'verb' },
      { word: 'empfehlen', meaning_vi: 'giới thiệu', pos: 'verb' },
      { word: 'entdecken', meaning_vi: 'phát hiện', pos: 'verb' },
      { word: 'entscheiden', meaning_vi: 'quyết định', pos: 'verb' },
      { word: 'entschuldigen', meaning_vi: 'xin lỗi', pos: 'verb' },
      { word: 'entwickeln', meaning_vi: 'phát triển', pos: 'verb' },
      { word: 'erklären', meaning_vi: 'giải thích', pos: 'verb' },
      { word: 'erhalten', meaning_vi: 'nhận', pos: 'verb' },
      { word: 'erlauben', meaning_vi: 'cho phép', pos: 'verb' },
    ]
  },

  // Reflexive Verbs
  reflexive_verbs: {
    level: 'A2',
    words: [
      { word: 'sich freuen', meaning_vi: 'vui mừng', pos: 'verb' },
      { word: 'sich ärgern', meaning_vi: 'tức giận', pos: 'verb' },
      { word: 'sich fühlen', meaning_vi: 'cảm thấy', pos: 'verb' },
      { word: 'sich vorstellen', meaning_vi: 'tự giới thiệu', pos: 'verb' },
      { word: 'sich setzen', meaning_vi: 'ngồi xuống', pos: 'verb' },
      { word: 'sich hinlegen', meaning_vi: 'nằm xuống', pos: 'verb' },
      { word: 'sich anziehen', meaning_vi: 'mặc quần áo', pos: 'verb' },
      { word: 'sich ausziehen', meaning_vi: 'cởi quần áo', pos: 'verb' },
      { word: 'sich waschen', meaning_vi: 'rửa mặt/tay', pos: 'verb' },
      { word: 'sich duschen', meaning_vi: 'tắm vòi sen', pos: 'verb' },
      { word: 'sich kämmen', meaning_vi: 'chải tóc', pos: 'verb' },
      { word: 'sich rasieren', meaning_vi: 'cạo râu', pos: 'verb' },
      { word: 'sich schminken', meaning_vi: 'trang điểm', pos: 'verb' },
      { word: 'sich beeilen', meaning_vi: 'vội vàng', pos: 'verb' },
      { word: 'sich verspäten', meaning_vi: 'đến muộn', pos: 'verb' },
      { word: 'sich entschuldigen', meaning_vi: 'xin lỗi', pos: 'verb' },
      { word: 'sich unterhalten', meaning_vi: 'trò chuyện', pos: 'verb' },
      { word: 'sich erinnern', meaning_vi: 'nhớ lại', pos: 'verb' },
      { word: 'sich interessieren', meaning_vi: 'quan tâm', pos: 'verb' },
      { word: 'sich kümmern', meaning_vi: 'chăm sóc', pos: 'verb' },
      { word: 'sich treffen', meaning_vi: 'gặp gỡ', pos: 'verb' },
      { word: 'sich verabreden', meaning_vi: 'hẹn gặp', pos: 'verb' },
      { word: 'sich ausruhen', meaning_vi: 'nghỉ ngơi', pos: 'verb' },
      { word: 'sich entspannen', meaning_vi: 'thư giãn', pos: 'verb' },
      { word: 'sich verlieben', meaning_vi: 'yêu', pos: 'verb' },
    ]
  },

  // Common Compound Nouns
  compound_nouns: {
    level: 'A2',
    words: [
      { word: 'Haustür', meaning_vi: 'cửa chính', pos: 'noun' },
      { word: 'Hausaufgabe', meaning_vi: 'bài tập về nhà', pos: 'noun' },
      { word: 'Hausarbeit', meaning_vi: 'việc nhà', pos: 'noun' },
      { word: 'Handtuch', meaning_vi: 'khăn tay', pos: 'noun' },
      { word: 'Handtasche', meaning_vi: 'túi xách', pos: 'noun' },
      { word: 'Handschuh', meaning_vi: 'găng tay', pos: 'noun' },
      { word: 'Kopfschmerzen', meaning_vi: 'đau đầu', pos: 'noun' },
      { word: 'Bauchschmerzen', meaning_vi: 'đau bụng', pos: 'noun' },
      { word: 'Rückenschmerzen', meaning_vi: 'đau lưng', pos: 'noun' },
      { word: 'Halsschmerzen', meaning_vi: 'đau họng', pos: 'noun' },
      { word: 'Zahnschmerzen', meaning_vi: 'đau răng', pos: 'noun' },
      { word: 'Geburtstag', meaning_vi: 'sinh nhật', pos: 'noun' },
      { word: 'Feiertag', meaning_vi: 'ngày lễ', pos: 'noun' },
      { word: 'Wochentag', meaning_vi: 'ngày trong tuần', pos: 'noun' },
      { word: 'Wochenende', meaning_vi: 'cuối tuần', pos: 'noun' },
      { word: 'Jahreszeit', meaning_vi: 'mùa', pos: 'noun' },
      { word: 'Arbeitsplatz', meaning_vi: 'nơi làm việc', pos: 'noun' },
      { word: 'Parkplatz', meaning_vi: 'bãi đỗ xe', pos: 'noun' },
      { word: 'Spielplatz', meaning_vi: 'sân chơi', pos: 'noun' },
      { word: 'Sitzplatz', meaning_vi: 'chỗ ngồi', pos: 'noun' },
      { word: 'Schlafzimmer', meaning_vi: 'phòng ngủ', pos: 'noun' },
      { word: 'Wohnzimmer', meaning_vi: 'phòng khách', pos: 'noun' },
      { word: 'Esszimmer', meaning_vi: 'phòng ăn', pos: 'noun' },
      { word: 'Badezimmer', meaning_vi: 'phòng tắm', pos: 'noun' },
      { word: 'Kinderzimmer', meaning_vi: 'phòng trẻ em', pos: 'noun' },
    ]
  },

  // Verbs with Prepositions
  verbs_prepositions: {
    level: 'B1',
    words: [
      { word: 'warten auf', meaning_vi: 'chờ đợi', pos: 'verb' },
      { word: 'denken an', meaning_vi: 'nghĩ về', pos: 'verb' },
      { word: 'glauben an', meaning_vi: 'tin vào', pos: 'verb' },
      { word: 'hoffen auf', meaning_vi: 'hy vọng về', pos: 'verb' },
      { word: 'achten auf', meaning_vi: 'chú ý đến', pos: 'verb' },
      { word: 'aufpassen auf', meaning_vi: 'trông chừng', pos: 'verb' },
      { word: 'sprechen über', meaning_vi: 'nói về', pos: 'verb' },
      { word: 'nachdenken über', meaning_vi: 'suy nghĩ về', pos: 'verb' },
      { word: 'sich freuen über', meaning_vi: 'vui về', pos: 'verb' },
      { word: 'sich freuen auf', meaning_vi: 'mong đợi', pos: 'verb' },
      { word: 'sich ärgern über', meaning_vi: 'tức giận về', pos: 'verb' },
      { word: 'sich interessieren für', meaning_vi: 'quan tâm đến', pos: 'verb' },
      { word: 'sich kümmern um', meaning_vi: 'chăm sóc', pos: 'verb' },
      { word: 'sich bewerben um', meaning_vi: 'ứng tuyển', pos: 'verb' },
      { word: 'teilnehmen an', meaning_vi: 'tham gia', pos: 'verb' },
      { word: 'gehören zu', meaning_vi: 'thuộc về', pos: 'verb' },
      { word: 'passen zu', meaning_vi: 'phù hợp với', pos: 'verb' },
      { word: 'gratulieren zu', meaning_vi: 'chúc mừng', pos: 'verb' },
      { word: 'bitten um', meaning_vi: 'xin, yêu cầu', pos: 'verb' },
      { word: 'danken für', meaning_vi: 'cảm ơn về', pos: 'verb' },
      { word: 'fragen nach', meaning_vi: 'hỏi về', pos: 'verb' },
      { word: 'suchen nach', meaning_vi: 'tìm kiếm', pos: 'verb' },
      { word: 'riechen nach', meaning_vi: 'có mùi như', pos: 'verb' },
      { word: 'schmecken nach', meaning_vi: 'có vị như', pos: 'verb' },
      { word: 'aussehen wie', meaning_vi: 'trông như', pos: 'verb' },
    ]
  },

  // Business Terms Extended
  business_terms: {
    level: 'B1',
    words: [
      { word: 'Wirtschaft', meaning_vi: 'kinh tế', pos: 'noun' },
      { word: 'Handel', meaning_vi: 'thương mại', pos: 'noun' },
      { word: 'Export', meaning_vi: 'xuất khẩu', pos: 'noun' },
      { word: 'Import', meaning_vi: 'nhập khẩu', pos: 'noun' },
      { word: 'Wettbewerb', meaning_vi: 'cạnh tranh', pos: 'noun' },
      { word: 'Aktie', meaning_vi: 'cổ phiếu', pos: 'noun' },
      { word: 'Börse', meaning_vi: 'sàn chứng khoán', pos: 'noun' },
      { word: 'Anlage', meaning_vi: 'đầu tư', pos: 'noun' },
      { word: 'Kapital', meaning_vi: 'vốn', pos: 'noun' },
      { word: 'Budget', meaning_vi: 'ngân sách', pos: 'noun' },
      { word: 'Kosten', meaning_vi: 'chi phí', pos: 'noun' },
      { word: 'Einnahme', meaning_vi: 'thu nhập', pos: 'noun' },
      { word: 'Ausgabe', meaning_vi: 'chi tiêu', pos: 'noun' },
      { word: 'Bilanz', meaning_vi: 'bảng cân đối', pos: 'noun' },
      { word: 'Steuererklärung', meaning_vi: 'khai thuế', pos: 'noun' },
      { word: 'Mehrwertsteuer', meaning_vi: 'thuế giá trị gia tăng', pos: 'noun' },
      { word: 'Unternehmer', meaning_vi: 'doanh nhân', pos: 'noun' },
      { word: 'Geschäftsführer', meaning_vi: 'giám đốc', pos: 'noun' },
      { word: 'Mitarbeiter', meaning_vi: 'nhân viên', pos: 'noun' },
      { word: 'Angestellter', meaning_vi: 'nhân viên văn phòng', pos: 'noun' },
      { word: 'Bewerber', meaning_vi: 'ứng viên', pos: 'noun' },
      { word: 'Praktikant', meaning_vi: 'thực tập sinh', pos: 'noun' },
      { word: 'Auszubildender', meaning_vi: 'học viên', pos: 'noun' },
      { word: 'Verhandlung', meaning_vi: 'đàm phán', pos: 'noun' },
      { word: 'Vereinbarung', meaning_vi: 'thỏa thuận', pos: 'noun' },
    ]
  },

  // Legal & Administrative Terms
  legal_admin: {
    level: 'B2',
    words: [
      { word: 'Antrag', meaning_vi: 'đơn xin', pos: 'noun' },
      { word: 'Formular', meaning_vi: 'biểu mẫu', pos: 'noun' },
      { word: 'Bescheinigung', meaning_vi: 'giấy chứng nhận', pos: 'noun' },
      { word: 'Urkunde', meaning_vi: 'giấy khai sinh/tờ khai', pos: 'noun' },
      { word: 'Ausweis', meaning_vi: 'giấy tờ tùy thân', pos: 'noun' },
      { word: 'Personalausweis', meaning_vi: 'chứng minh nhân dân', pos: 'noun' },
      { word: 'Führerschein', meaning_vi: 'bằng lái xe', pos: 'noun' },
      { word: 'Meldebescheinigung', meaning_vi: 'giấy đăng ký tạm trú', pos: 'noun' },
      { word: 'Anmeldung', meaning_vi: 'đăng ký', pos: 'noun' },
      { word: 'Abmeldung', meaning_vi: 'hủy đăng ký', pos: 'noun' },
      { word: 'Ummeldung', meaning_vi: 'đăng ký chuyển', pos: 'noun' },
      { word: 'Amt', meaning_vi: 'cơ quan', pos: 'noun' },
      { word: 'Behörde', meaning_vi: 'cơ quan chức năng', pos: 'noun' },
      { word: 'Rathaus', meaning_vi: 'tòa thị chính', pos: 'noun' },
      { word: 'Bürgeramt', meaning_vi: 'văn phòng công dân', pos: 'noun' },
      { word: 'Finanzamt', meaning_vi: 'sở thuế', pos: 'noun' },
      { word: 'Arbeitsamt', meaning_vi: 'sở lao động', pos: 'noun' },
      { word: 'Standesamt', meaning_vi: 'phòng hộ tịch', pos: 'noun' },
      { word: 'Einwohnermeldeamt', meaning_vi: 'phòng đăng ký cư trú', pos: 'noun' },
      { word: 'Ausländerbehörde', meaning_vi: 'sở ngoại kiều', pos: 'noun' },
      { word: 'beantragen', meaning_vi: 'nộp đơn xin', pos: 'verb' },
      { word: 'genehmigen', meaning_vi: 'phê duyệt', pos: 'verb' },
      { word: 'ablehnen', meaning_vi: 'từ chối', pos: 'verb' },
      { word: 'verlängern', meaning_vi: 'gia hạn', pos: 'verb' },
      { word: 'ausstellen', meaning_vi: 'cấp', pos: 'verb' },
    ]
  },

  // Media & Entertainment
  media_entertainment: {
    level: 'A2',
    words: [
      { word: 'Fernsehen', meaning_vi: 'truyền hình', pos: 'noun' },
      { word: 'Fernseher', meaning_vi: 'TV', pos: 'noun' },
      { word: 'Programm', meaning_vi: 'chương trình', pos: 'noun' },
      { word: 'Nachrichten', meaning_vi: 'tin tức', pos: 'noun' },
      { word: 'Tagesschau', meaning_vi: 'bản tin hàng ngày', pos: 'noun' },
      { word: 'Wetterbericht', meaning_vi: 'dự báo thời tiết', pos: 'noun' },
      { word: 'Spielfilm', meaning_vi: 'phim truyện', pos: 'noun' },
      { word: 'Dokumentarfilm', meaning_vi: 'phim tài liệu', pos: 'noun' },
      { word: 'Serie', meaning_vi: 'phim bộ', pos: 'noun' },
      { word: 'Folge', meaning_vi: 'tập phim', pos: 'noun' },
      { word: 'Staffel', meaning_vi: 'mùa phim', pos: 'noun' },
      { word: 'Krimi', meaning_vi: 'phim trinh thám', pos: 'noun' },
      { word: 'Komödie', meaning_vi: 'phim hài', pos: 'noun' },
      { word: 'Drama', meaning_vi: 'phim chính kịch', pos: 'noun' },
      { word: 'Thriller', meaning_vi: 'phim kinh dị', pos: 'noun' },
      { word: 'Sender', meaning_vi: 'đài, kênh', pos: 'noun' },
      { word: 'Kanal', meaning_vi: 'kênh', pos: 'noun' },
      { word: 'Sendung', meaning_vi: 'chương trình', pos: 'noun' },
      { word: 'Moderator', meaning_vi: 'người dẫn chương trình', pos: 'noun' },
      { word: 'Schauspieler', meaning_vi: 'diễn viên', pos: 'noun' },
      { word: 'Regisseur', meaning_vi: 'đạo diễn', pos: 'noun' },
      { word: 'Produzent', meaning_vi: 'nhà sản xuất', pos: 'noun' },
      { word: 'Kamera', meaning_vi: 'máy quay', pos: 'noun' },
      { word: 'Drehbuch', meaning_vi: 'kịch bản', pos: 'noun' },
      { word: 'Premiere', meaning_vi: 'buổi công chiếu', pos: 'noun' },
    ]
  },

  // Social Media & Digital
  social_media: {
    level: 'B1',
    words: [
      { word: 'Soziale Medien', meaning_vi: 'mạng xã hội', pos: 'noun' },
      { word: 'Profil', meaning_vi: 'hồ sơ cá nhân', pos: 'noun' },
      { word: 'Beitrag', meaning_vi: 'bài đăng', pos: 'noun' },
      { word: 'Post', meaning_vi: 'bài đăng', pos: 'noun' },
      { word: 'Kommentar', meaning_vi: 'bình luận', pos: 'noun' },
      { word: 'Follower', meaning_vi: 'người theo dõi', pos: 'noun' },
      { word: 'Abonnent', meaning_vi: 'người đăng ký', pos: 'noun' },
      { word: 'Like', meaning_vi: 'lượt thích', pos: 'noun' },
      { word: 'Teilen', meaning_vi: 'chia sẻ', pos: 'noun' },
      { word: 'Hashtag', meaning_vi: 'hashtag', pos: 'noun' },
      { word: 'Link', meaning_vi: 'liên kết', pos: 'noun' },
      { word: 'Blog', meaning_vi: 'blog', pos: 'noun' },
      { word: 'Podcast', meaning_vi: 'podcast', pos: 'noun' },
      { word: 'Livestream', meaning_vi: 'phát trực tiếp', pos: 'noun' },
      { word: 'Influencer', meaning_vi: 'người có ảnh hưởng', pos: 'noun' },
      { word: 'Viral', meaning_vi: 'lan truyền', pos: 'adjective' },
      { word: 'online', meaning_vi: 'trực tuyến', pos: 'adjective' },
      { word: 'offline', meaning_vi: 'ngoại tuyến', pos: 'adjective' },
      { word: 'posten', meaning_vi: 'đăng bài', pos: 'verb' },
      { word: 'teilen', meaning_vi: 'chia sẻ', pos: 'verb' },
      { word: 'kommentieren', meaning_vi: 'bình luận', pos: 'verb' },
      { word: 'liken', meaning_vi: 'thích', pos: 'verb' },
      { word: 'folgen', meaning_vi: 'theo dõi', pos: 'verb' },
      { word: 'abonnieren', meaning_vi: 'đăng ký', pos: 'verb' },
      { word: 'streamen', meaning_vi: 'phát trực tuyến', pos: 'verb' },
    ]
  },

  // Academic & Research Extended
  academic_research: {
    level: 'B2',
    words: [
      { word: 'Forschung', meaning_vi: 'nghiên cứu', pos: 'noun' },
      { word: 'Studie', meaning_vi: 'nghiên cứu', pos: 'noun' },
      { word: 'Untersuchung', meaning_vi: 'khảo sát', pos: 'noun' },
      { word: 'Analyse', meaning_vi: 'phân tích', pos: 'noun' },
      { word: 'Ergebnis', meaning_vi: 'kết quả', pos: 'noun' },
      { word: 'Daten', meaning_vi: 'dữ liệu', pos: 'noun' },
      { word: 'Statistik', meaning_vi: 'thống kê', pos: 'noun' },
      { word: 'Theorie', meaning_vi: 'lý thuyết', pos: 'noun' },
      { word: 'Hypothese', meaning_vi: 'giả thuyết', pos: 'noun' },
      { word: 'Methode', meaning_vi: 'phương pháp', pos: 'noun' },
      { word: 'Quelle', meaning_vi: 'nguồn', pos: 'noun' },
      { word: 'Literatur', meaning_vi: 'tài liệu', pos: 'noun' },
      { word: 'Artikel', meaning_vi: 'bài báo', pos: 'noun' },
      { word: 'Zeitschrift', meaning_vi: 'tạp chí', pos: 'noun' },
      { word: 'Dissertation', meaning_vi: 'luận văn tiến sĩ', pos: 'noun' },
      { word: 'Masterarbeit', meaning_vi: 'luận văn thạc sĩ', pos: 'noun' },
      { word: 'Bachelorarbeit', meaning_vi: 'luận văn cử nhân', pos: 'noun' },
      { word: 'Seminar', meaning_vi: 'hội thảo', pos: 'noun' },
      { word: 'Vorlesung', meaning_vi: 'bài giảng', pos: 'noun' },
      { word: 'Übung', meaning_vi: 'bài tập', pos: 'noun' },
      { word: 'Referat', meaning_vi: 'bài thuyết trình', pos: 'noun' },
      { word: 'Klausur', meaning_vi: 'bài thi', pos: 'noun' },
      { word: 'Semester', meaning_vi: 'học kỳ', pos: 'noun' },
      { word: 'Dozent', meaning_vi: 'giảng viên', pos: 'noun' },
      { word: 'Professor', meaning_vi: 'giáo sư', pos: 'noun' },
    ]
  },

  // Housing & Real Estate
  housing_real_estate: {
    level: 'B1',
    words: [
      { word: 'Miete', meaning_vi: 'tiền thuê', pos: 'noun' },
      { word: 'Mieter', meaning_vi: 'người thuê', pos: 'noun' },
      { word: 'Vermieter', meaning_vi: 'người cho thuê', pos: 'noun' },
      { word: 'Mietvertrag', meaning_vi: 'hợp đồng thuê', pos: 'noun' },
      { word: 'Kaution', meaning_vi: 'tiền đặt cọc', pos: 'noun' },
      { word: 'Nebenkosten', meaning_vi: 'chi phí phụ', pos: 'noun' },
      { word: 'Heizung', meaning_vi: 'hệ thống sưởi', pos: 'noun' },
      { word: 'Strom', meaning_vi: 'điện', pos: 'noun' },
      { word: 'Gas', meaning_vi: 'ga', pos: 'noun' },
      { word: 'Wasser', meaning_vi: 'nước', pos: 'noun' },
      { word: 'Müll', meaning_vi: 'rác', pos: 'noun' },
      { word: 'Renovierung', meaning_vi: 'sửa chữa', pos: 'noun' },
      { word: 'Umzug', meaning_vi: 'chuyển nhà', pos: 'noun' },
      { word: 'Einzug', meaning_vi: 'dọn vào', pos: 'noun' },
      { word: 'Auszug', meaning_vi: 'dọn ra', pos: 'noun' },
      { word: 'Nachbar', meaning_vi: 'hàng xóm', pos: 'noun' },
      { word: 'Hausmeister', meaning_vi: 'quản lý tòa nhà', pos: 'noun' },
      { word: 'Hausverwaltung', meaning_vi: 'ban quản lý nhà', pos: 'noun' },
      { word: 'mieten', meaning_vi: 'thuê', pos: 'verb' },
      { word: 'vermieten', meaning_vi: 'cho thuê', pos: 'verb' },
      { word: 'kündigen', meaning_vi: 'hủy hợp đồng', pos: 'verb' },
      { word: 'einziehen', meaning_vi: 'dọn vào', pos: 'verb' },
      { word: 'ausziehen', meaning_vi: 'dọn ra', pos: 'verb' },
      { word: 'renovieren', meaning_vi: 'sửa chữa', pos: 'verb' },
      { word: 'möbliert', meaning_vi: 'có nội thất', pos: 'adjective' },
    ]
  },

  // Insurance & Social Services
  insurance_social: {
    level: 'B1',
    words: [
      { word: 'Versicherung', meaning_vi: 'bảo hiểm', pos: 'noun' },
      { word: 'Krankenversicherung', meaning_vi: 'bảo hiểm y tế', pos: 'noun' },
      { word: 'Rentenversicherung', meaning_vi: 'bảo hiểm hưu trí', pos: 'noun' },
      { word: 'Arbeitslosenversicherung', meaning_vi: 'bảo hiểm thất nghiệp', pos: 'noun' },
      { word: 'Pflegeversicherung', meaning_vi: 'bảo hiểm chăm sóc', pos: 'noun' },
      { word: 'Haftpflichtversicherung', meaning_vi: 'bảo hiểm trách nhiệm', pos: 'noun' },
      { word: 'Hausratversicherung', meaning_vi: 'bảo hiểm tài sản', pos: 'noun' },
      { word: 'Lebensversicherung', meaning_vi: 'bảo hiểm nhân thọ', pos: 'noun' },
      { word: 'Beitrag', meaning_vi: 'khoản đóng góp', pos: 'noun' },
      { word: 'Prämie', meaning_vi: 'phí bảo hiểm', pos: 'noun' },
      { word: 'Leistung', meaning_vi: 'quyền lợi', pos: 'noun' },
      { word: 'Sozialversicherung', meaning_vi: 'bảo hiểm xã hội', pos: 'noun' },
      { word: 'Krankenkasse', meaning_vi: 'quỹ bảo hiểm y tế', pos: 'noun' },
      { word: 'Arbeitslosengeld', meaning_vi: 'trợ cấp thất nghiệp', pos: 'noun' },
      { word: 'Kindergeld', meaning_vi: 'trợ cấp nuôi con', pos: 'noun' },
      { word: 'Elterngeld', meaning_vi: 'trợ cấp thai sản', pos: 'noun' },
      { word: 'Wohngeld', meaning_vi: 'trợ cấp nhà ở', pos: 'noun' },
      { word: 'Sozialhilfe', meaning_vi: 'trợ cấp xã hội', pos: 'noun' },
      { word: 'Rente', meaning_vi: 'lương hưu', pos: 'noun' },
      { word: 'versichern', meaning_vi: 'bảo hiểm', pos: 'verb' },
    ]
  },
};

// Generate vocabulary
function generateVocabulary() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║    📚 MINE VOCABULARY BATCH 5 - PHRASAL & COMPOUND WORDS   ║');
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
