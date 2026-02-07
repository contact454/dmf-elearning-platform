#!/usr/bin/env node
/**
 * Batch 22 - Final Push: 600 words to exceed 10K
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT = path.join(__dirname, '../data/quality-expansion/batch22-vocabulary.json');

const TOPICS = {
  // A1/A2 - Core vocabulary gaps (200 words)
  a1_more_basics: {
    level: 'A1',
    words: [
      { word: 'auch', pos: 'adverb', meaning_vi: 'cũng' },
      { word: 'noch', pos: 'adverb', meaning_vi: 'còn/nữa' },
      { word: 'schon', pos: 'adverb', meaning_vi: 'đã' },
      { word: 'sehr', pos: 'adverb', meaning_vi: 'rất' },
      { word: 'nur', pos: 'adverb', meaning_vi: 'chỉ' },
      { word: 'ganz', pos: 'adverb', meaning_vi: 'hoàn toàn' },
      { word: 'dann', pos: 'adverb', meaning_vi: 'sau đó' },
      { word: 'hier', pos: 'adverb', meaning_vi: 'ở đây' },
      { word: 'dort', pos: 'adverb', meaning_vi: 'ở đó' },
      { word: 'da', pos: 'adverb', meaning_vi: 'ở đó/vì' },
      { word: 'viel', pos: 'adverb', meaning_vi: 'nhiều' },
      { word: 'wenig', pos: 'adverb', meaning_vi: 'ít' },
      { word: 'mehr', pos: 'adverb', meaning_vi: 'hơn' },
      { word: 'genug', pos: 'adverb', meaning_vi: 'đủ' },
      { word: 'fast', pos: 'adverb', meaning_vi: 'gần như' },
      { word: 'etwa', pos: 'adverb', meaning_vi: 'khoảng' },
      { word: 'wieder', pos: 'adverb', meaning_vi: 'lại' },
      { word: 'zusammen', pos: 'adverb', meaning_vi: 'cùng nhau' },
      { word: 'allein', pos: 'adverb', meaning_vi: 'một mình' },
      { word: 'eigentlich', pos: 'adverb', meaning_vi: 'thực ra' },
    ]
  },

  a1_conjunctions: {
    level: 'A1',
    words: [
      { word: 'und', pos: 'conjunction', meaning_vi: 'và' },
      { word: 'oder', pos: 'conjunction', meaning_vi: 'hoặc' },
      { word: 'aber', pos: 'conjunction', meaning_vi: 'nhưng' },
      { word: 'denn', pos: 'conjunction', meaning_vi: 'vì' },
      { word: 'weil', pos: 'conjunction', meaning_vi: 'bởi vì' },
      { word: 'wenn', pos: 'conjunction', meaning_vi: 'khi/nếu' },
      { word: 'dass', pos: 'conjunction', meaning_vi: 'rằng' },
      { word: 'ob', pos: 'conjunction', meaning_vi: 'liệu' },
      { word: 'als', pos: 'conjunction', meaning_vi: 'khi/hơn' },
      { word: 'bevor', pos: 'conjunction', meaning_vi: 'trước khi' },
      { word: 'nachdem', pos: 'conjunction', meaning_vi: 'sau khi' },
      { word: 'während', pos: 'conjunction', meaning_vi: 'trong khi' },
      { word: 'obwohl', pos: 'conjunction', meaning_vi: 'mặc dù' },
      { word: 'damit', pos: 'conjunction', meaning_vi: 'để' },
      { word: 'sodass', pos: 'conjunction', meaning_vi: 'đến nỗi' },
      { word: 'ja', pos: 'particle', meaning_vi: 'vâng' },
      { word: 'nein', pos: 'particle', meaning_vi: 'không' },
      { word: 'doch', pos: 'particle', meaning_vi: 'có chứ' },
      { word: 'mal', pos: 'particle', meaning_vi: 'lần' },
      { word: 'wohl', pos: 'particle', meaning_vi: 'có lẽ' },
    ]
  },

  a2_more_verbs: {
    level: 'A2',
    words: [
      { word: 'helfen', pos: 'verb', meaning_vi: 'giúp đỡ' },
      { word: 'brauchen', pos: 'verb', meaning_vi: 'cần' },
      { word: 'mögen', pos: 'verb', meaning_vi: 'thích' },
      { word: 'wollen', pos: 'verb', meaning_vi: 'muốn' },
      { word: 'können', pos: 'verb', meaning_vi: 'có thể' },
      { word: 'müssen', pos: 'verb', meaning_vi: 'phải' },
      { word: 'sollen', pos: 'verb', meaning_vi: 'nên' },
      { word: 'dürfen', pos: 'verb', meaning_vi: 'được phép' },
      { word: 'beginnen', pos: 'verb', meaning_vi: 'bắt đầu' },
      { word: 'beenden', pos: 'verb', meaning_vi: 'kết thúc' },
      { word: 'versuchen', pos: 'verb', meaning_vi: 'thử' },
      { word: 'vergessen', pos: 'verb', meaning_vi: 'quên' },
      { word: 'erinnern', pos: 'verb', meaning_vi: 'nhớ lại' },
      { word: 'zeigen', pos: 'verb', meaning_vi: 'chỉ' },
      { word: 'tragen', pos: 'verb', meaning_vi: 'mang' },
      { word: 'halten', pos: 'verb', meaning_vi: 'giữ' },
      { word: 'lassen', pos: 'verb', meaning_vi: 'để' },
      { word: 'bleiben', pos: 'verb', meaning_vi: 'ở lại' },
      { word: 'werden', pos: 'verb', meaning_vi: 'trở thành' },
      { word: 'treffen', pos: 'verb', meaning_vi: 'gặp' },
    ]
  },

  a2_more_adjectives: {
    level: 'A2',
    words: [
      { word: 'anders', pos: 'adjective', meaning_vi: 'khác' },
      { word: 'gleich', pos: 'adjective', meaning_vi: 'giống' },
      { word: 'ähnlich', pos: 'adjective', meaning_vi: 'tương tự' },
      { word: 'verschieden', pos: 'adjective', meaning_vi: 'khác nhau' },
      { word: 'bekannt', pos: 'adjective', meaning_vi: 'nổi tiếng' },
      { word: 'berühmt', pos: 'adjective', meaning_vi: 'nổi tiếng' },
      { word: 'beliebt', pos: 'adjective', meaning_vi: 'được yêu thích' },
      { word: 'besonders', pos: 'adjective', meaning_vi: 'đặc biệt' },
      { word: 'gewöhnlich', pos: 'adjective', meaning_vi: 'thông thường' },
      { word: 'normal', pos: 'adjective', meaning_vi: 'bình thường' },
      { word: 'typisch', pos: 'adjective', meaning_vi: 'điển hình' },
      { word: 'komisch', pos: 'adjective', meaning_vi: 'kỳ lạ' },
      { word: 'seltsam', pos: 'adjective', meaning_vi: 'lạ' },
      { word: 'wunderbar', pos: 'adjective', meaning_vi: 'tuyệt vời' },
      { word: 'fantastisch', pos: 'adjective', meaning_vi: 'tuyệt vời' },
      { word: 'toll', pos: 'adjective', meaning_vi: 'tuyệt' },
      { word: 'super', pos: 'adjective', meaning_vi: 'siêu' },
      { word: 'schrecklich', pos: 'adjective', meaning_vi: 'kinh khủng' },
      { word: 'furchtbar', pos: 'adjective', meaning_vi: 'khủng khiếp' },
      { word: 'angenehm', pos: 'adjective', meaning_vi: 'dễ chịu' },
    ]
  },

  a2_office: {
    level: 'A2',
    words: [
      { word: 'der Ordner', pos: 'noun', meaning_vi: 'cặp tài liệu' },
      { word: 'der Zettel', pos: 'noun', meaning_vi: 'tờ giấy' },
      { word: 'der Stift', pos: 'noun', meaning_vi: 'bút' },
      { word: 'das Papier', pos: 'noun', meaning_vi: 'giấy' },
      { word: 'die Schere', pos: 'noun', meaning_vi: 'kéo' },
      { word: 'der Klebestreifen', pos: 'noun', meaning_vi: 'băng dính' },
      { word: 'die Büroklammer', pos: 'noun', meaning_vi: 'kẹp giấy' },
      { word: 'der Hefter', pos: 'noun', meaning_vi: 'dập ghim' },
      { word: 'der Locher', pos: 'noun', meaning_vi: 'dụng cụ đục lỗ' },
      { word: 'der Kalender', pos: 'noun', meaning_vi: 'lịch' },
      { word: 'die Agenda', pos: 'noun', meaning_vi: 'nhật ký' },
      { word: 'der Terminplaner', pos: 'noun', meaning_vi: 'lịch hẹn' },
      { word: 'die Notiz', pos: 'noun', meaning_vi: 'ghi chú' },
      { word: 'der Brief', pos: 'noun', meaning_vi: 'thư' },
      { word: 'der Umschlag', pos: 'noun', meaning_vi: 'phong bì' },
      { word: 'die Briefmarke', pos: 'noun', meaning_vi: 'tem' },
      { word: 'das Paket', pos: 'noun', meaning_vi: 'gói hàng' },
      { word: 'der Empfänger', pos: 'noun', meaning_vi: 'người nhận' },
      { word: 'der Absender', pos: 'noun', meaning_vi: 'người gửi' },
      { word: 'die Adresse', pos: 'noun', meaning_vi: 'địa chỉ' },
    ]
  },

  a2_food_more: {
    level: 'A2',
    words: [
      { word: 'die Gurke', pos: 'noun', meaning_vi: 'dưa chuột' },
      { word: 'die Paprika', pos: 'noun', meaning_vi: 'ớt chuông' },
      { word: 'die Möhre', pos: 'noun', meaning_vi: 'cà rốt' },
      { word: 'der Spinat', pos: 'noun', meaning_vi: 'rau chân vịt' },
      { word: 'der Kohl', pos: 'noun', meaning_vi: 'bắp cải' },
      { word: 'die Bohne', pos: 'noun', meaning_vi: 'đậu' },
      { word: 'die Erbse', pos: 'noun', meaning_vi: 'đậu Hà Lan' },
      { word: 'der Pilz', pos: 'noun', meaning_vi: 'nấm' },
      { word: 'die Kirsche', pos: 'noun', meaning_vi: 'quả anh đào' },
      { word: 'die Erdbeere', pos: 'noun', meaning_vi: 'dâu tây' },
      { word: 'die Himbeere', pos: 'noun', meaning_vi: 'mâm xôi' },
      { word: 'die Traube', pos: 'noun', meaning_vi: 'nho' },
      { word: 'die Birne', pos: 'noun', meaning_vi: 'lê' },
      { word: 'die Zitrone', pos: 'noun', meaning_vi: 'chanh' },
      { word: 'die Ananas', pos: 'noun', meaning_vi: 'dứa' },
      { word: 'die Melone', pos: 'noun', meaning_vi: 'dưa' },
      { word: 'die Nuss', pos: 'noun', meaning_vi: 'hạt' },
      { word: 'die Mandel', pos: 'noun', meaning_vi: 'hạnh nhân' },
      { word: 'die Haselnuss', pos: 'noun', meaning_vi: 'hạt phỉ' },
      { word: 'die Walnuss', pos: 'noun', meaning_vi: 'óc chó' },
    ]
  },

  a2_animals: {
    level: 'A2',
    words: [
      { word: 'das Pferd', pos: 'noun', meaning_vi: 'con ngựa' },
      { word: 'die Kuh', pos: 'noun', meaning_vi: 'con bò cái' },
      { word: 'das Schwein', pos: 'noun', meaning_vi: 'con lợn' },
      { word: 'das Schaf', pos: 'noun', meaning_vi: 'con cừu' },
      { word: 'die Ziege', pos: 'noun', meaning_vi: 'con dê' },
      { word: 'das Huhn', pos: 'noun', meaning_vi: 'con gà' },
      { word: 'die Ente', pos: 'noun', meaning_vi: 'con vịt' },
      { word: 'die Gans', pos: 'noun', meaning_vi: 'con ngỗng' },
      { word: 'der Hase', pos: 'noun', meaning_vi: 'con thỏ' },
      { word: 'die Maus', pos: 'noun', meaning_vi: 'con chuột' },
      { word: 'der Bär', pos: 'noun', meaning_vi: 'con gấu' },
      { word: 'der Wolf', pos: 'noun', meaning_vi: 'con sói' },
      { word: 'der Fuchs', pos: 'noun', meaning_vi: 'con cáo' },
      { word: 'der Löwe', pos: 'noun', meaning_vi: 'con sư tử' },
      { word: 'der Tiger', pos: 'noun', meaning_vi: 'con hổ' },
      { word: 'der Elefant', pos: 'noun', meaning_vi: 'con voi' },
      { word: 'die Giraffe', pos: 'noun', meaning_vi: 'con hươu cao cổ' },
      { word: 'das Zebra', pos: 'noun', meaning_vi: 'con ngựa vằn' },
      { word: 'der Affe', pos: 'noun', meaning_vi: 'con khỉ' },
      { word: 'die Schlange', pos: 'noun', meaning_vi: 'con rắn' },
    ]
  },

  // B1 - Intermediate (150 words)
  b1_sports: {
    level: 'B1',
    words: [
      { word: 'der Wettkampf', pos: 'noun', meaning_vi: 'cuộc thi đấu' },
      { word: 'das Spiel', pos: 'noun', meaning_vi: 'trận đấu' },
      { word: 'die Mannschaft', pos: 'noun', meaning_vi: 'đội' },
      { word: 'der Spieler', pos: 'noun', meaning_vi: 'cầu thủ' },
      { word: 'der Trainer', pos: 'noun', meaning_vi: 'huấn luyện viên' },
      { word: 'der Schiedsrichter', pos: 'noun', meaning_vi: 'trọng tài' },
      { word: 'das Tor', pos: 'noun', meaning_vi: 'bàn thắng' },
      { word: 'der Ball', pos: 'noun', meaning_vi: 'bóng' },
      { word: 'das Stadion', pos: 'noun', meaning_vi: 'sân vận động' },
      { word: 'der Fan', pos: 'noun', meaning_vi: 'người hâm mộ' },
      { word: 'der Sieg', pos: 'noun', meaning_vi: 'chiến thắng' },
      { word: 'die Niederlage', pos: 'noun', meaning_vi: 'thất bại' },
      { word: 'das Unentschieden', pos: 'noun', meaning_vi: 'hòa' },
      { word: 'die Meisterschaft', pos: 'noun', meaning_vi: 'giải vô địch' },
      { word: 'die Olympiade', pos: 'noun', meaning_vi: 'thế vận hội' },
      { word: 'gewinnen', pos: 'verb', meaning_vi: 'thắng' },
      { word: 'verlieren', pos: 'verb', meaning_vi: 'thua' },
      { word: 'trainieren', pos: 'verb', meaning_vi: 'tập luyện' },
      { word: 'schießen', pos: 'verb', meaning_vi: 'sút' },
      { word: 'werfen', pos: 'verb', meaning_vi: 'ném' },
    ]
  },

  b1_banking: {
    level: 'B1',
    words: [
      { word: 'das Konto', pos: 'noun', meaning_vi: 'tài khoản' },
      { word: 'das Girokonto', pos: 'noun', meaning_vi: 'tài khoản vãng lai' },
      { word: 'das Sparkonto', pos: 'noun', meaning_vi: 'tài khoản tiết kiệm' },
      { word: 'die Überweisung', pos: 'noun', meaning_vi: 'chuyển khoản' },
      { word: 'die Abhebung', pos: 'noun', meaning_vi: 'rút tiền' },
      { word: 'die Einzahlung', pos: 'noun', meaning_vi: 'nộp tiền' },
      { word: 'der Kontostand', pos: 'noun', meaning_vi: 'số dư' },
      { word: 'der Kontoauszug', pos: 'noun', meaning_vi: 'sao kê' },
      { word: 'die EC-Karte', pos: 'noun', meaning_vi: 'thẻ ghi nợ' },
      { word: 'die Kreditkarte', pos: 'noun', meaning_vi: 'thẻ tín dụng' },
      { word: 'der Geldautomat', pos: 'noun', meaning_vi: 'máy ATM' },
      { word: 'der Kredit', pos: 'noun', meaning_vi: 'khoản vay' },
      { word: 'die Schulden', pos: 'noun', meaning_vi: 'nợ' },
      { word: 'die Zinsen', pos: 'noun', meaning_vi: 'lãi suất' },
      { word: 'die Rate', pos: 'noun', meaning_vi: 'tỷ lệ' },
      { word: 'überweisen', pos: 'verb', meaning_vi: 'chuyển khoản' },
      { word: 'abheben', pos: 'verb', meaning_vi: 'rút tiền' },
      { word: 'einzahlen', pos: 'verb', meaning_vi: 'nộp tiền' },
      { word: 'leihen', pos: 'verb', meaning_vi: 'vay' },
      { word: 'zurückzahlen', pos: 'verb', meaning_vi: 'trả lại' },
    ]
  },

  b1_events: {
    level: 'B1',
    words: [
      { word: 'die Veranstaltung', pos: 'noun', meaning_vi: 'sự kiện' },
      { word: 'die Feier', pos: 'noun', meaning_vi: 'buổi lễ' },
      { word: 'die Party', pos: 'noun', meaning_vi: 'tiệc' },
      { word: 'die Hochzeit', pos: 'noun', meaning_vi: 'đám cưới' },
      { word: 'die Taufe', pos: 'noun', meaning_vi: 'lễ rửa tội' },
      { word: 'die Beerdigung', pos: 'noun', meaning_vi: 'đám tang' },
      { word: 'das Jubiläum', pos: 'noun', meaning_vi: 'kỷ niệm' },
      { word: 'der Jahrestag', pos: 'noun', meaning_vi: 'ngày kỷ niệm' },
      { word: 'die Einladung', pos: 'noun', meaning_vi: 'lời mời' },
      { word: 'der Gast', pos: 'noun', meaning_vi: 'khách' },
      { word: 'der Gastgeber', pos: 'noun', meaning_vi: 'chủ nhà' },
      { word: 'das Geschenk', pos: 'noun', meaning_vi: 'quà' },
      { word: 'die Dekoration', pos: 'noun', meaning_vi: 'trang trí' },
      { word: 'das Buffet', pos: 'noun', meaning_vi: 'tiệc tự chọn' },
      { word: 'der Kuchen', pos: 'noun', meaning_vi: 'bánh' },
      { word: 'einladen', pos: 'verb', meaning_vi: 'mời' },
      { word: 'feiern', pos: 'verb', meaning_vi: 'ăn mừng' },
      { word: 'schenken', pos: 'verb', meaning_vi: 'tặng' },
      { word: 'dekorieren', pos: 'verb', meaning_vi: 'trang trí' },
      { word: 'gratulieren', pos: 'verb', meaning_vi: 'chúc mừng' },
    ]
  },

  b1_feelings: {
    level: 'B1',
    words: [
      { word: 'die Stimmung', pos: 'noun', meaning_vi: 'tâm trạng' },
      { word: 'die Laune', pos: 'noun', meaning_vi: 'tâm trạng' },
      { word: 'das Gefühl', pos: 'noun', meaning_vi: 'cảm xúc' },
      { word: 'die Begeisterung', pos: 'noun', meaning_vi: 'sự nhiệt tình' },
      { word: 'die Zufriedenheit', pos: 'noun', meaning_vi: 'sự hài lòng' },
      { word: 'die Unzufriedenheit', pos: 'noun', meaning_vi: 'sự không hài lòng' },
      { word: 'die Langeweile', pos: 'noun', meaning_vi: 'sự nhàm chán' },
      { word: 'die Einsamkeit', pos: 'noun', meaning_vi: 'sự cô đơn' },
      { word: 'die Sehnsucht', pos: 'noun', meaning_vi: 'nỗi nhớ' },
      { word: 'die Eifersucht', pos: 'noun', meaning_vi: 'sự ghen tuông' },
      { word: 'begeistert', pos: 'adjective', meaning_vi: 'hào hứng' },
      { word: 'zufrieden', pos: 'adjective', meaning_vi: 'hài lòng' },
      { word: 'unzufrieden', pos: 'adjective', meaning_vi: 'không hài lòng' },
      { word: 'gelangweilt', pos: 'adjective', meaning_vi: 'chán' },
      { word: 'einsam', pos: 'adjective', meaning_vi: 'cô đơn' },
      { word: 'sehnsüchtig', pos: 'adjective', meaning_vi: 'nhớ nhung' },
      { word: 'neugierig', pos: 'adjective', meaning_vi: 'tò mò' },
      { word: 'dankbar', pos: 'adjective', meaning_vi: 'biết ơn' },
      { word: 'überwältigt', pos: 'adjective', meaning_vi: 'choáng ngợp' },
      { word: 'erleichtert', pos: 'adjective', meaning_vi: 'nhẹ nhõm' },
    ]
  },

  b1_internet: {
    level: 'B1',
    words: [
      { word: 'die Webseite', pos: 'noun', meaning_vi: 'trang web' },
      { word: 'der Browser', pos: 'noun', meaning_vi: 'trình duyệt' },
      { word: 'die Suchmaschine', pos: 'noun', meaning_vi: 'công cụ tìm kiếm' },
      { word: 'der Link', pos: 'noun', meaning_vi: 'liên kết' },
      { word: 'der Account', pos: 'noun', meaning_vi: 'tài khoản' },
      { word: 'das Profil', pos: 'noun', meaning_vi: 'hồ sơ' },
      { word: 'der Beitrag', pos: 'noun', meaning_vi: 'bài đăng' },
      { word: 'der Kommentar', pos: 'noun', meaning_vi: 'bình luận' },
      { word: 'der Follower', pos: 'noun', meaning_vi: 'người theo dõi' },
      { word: 'der Like', pos: 'noun', meaning_vi: 'lượt thích' },
      { word: 'der Hashtag', pos: 'noun', meaning_vi: 'hashtag' },
      { word: 'die Benachrichtigung', pos: 'noun', meaning_vi: 'thông báo' },
      { word: 'der Newsletter', pos: 'noun', meaning_vi: 'bản tin' },
      { word: 'der Spam', pos: 'noun', meaning_vi: 'thư rác' },
      { word: 'die Privatsphäre', pos: 'noun', meaning_vi: 'quyền riêng tư' },
      { word: 'posten', pos: 'verb', meaning_vi: 'đăng' },
      { word: 'liken', pos: 'verb', meaning_vi: 'thích' },
      { word: 'folgen', pos: 'verb', meaning_vi: 'theo dõi' },
      { word: 'abonnieren', pos: 'verb', meaning_vi: 'đăng ký' },
      { word: 'blockieren', pos: 'verb', meaning_vi: 'chặn' },
    ]
  },

  // B2 - Upper Intermediate (100 words)
  b2_diplomacy: {
    level: 'B2',
    words: [
      { word: 'die Diplomatie', pos: 'noun', meaning_vi: 'ngoại giao' },
      { word: 'der Botschafter', pos: 'noun', meaning_vi: 'đại sứ' },
      { word: 'die Botschaft', pos: 'noun', meaning_vi: 'đại sứ quán' },
      { word: 'das Konsulat', pos: 'noun', meaning_vi: 'lãnh sự quán' },
      { word: 'der Vertrag', pos: 'noun', meaning_vi: 'hiệp ước' },
      { word: 'das Abkommen', pos: 'noun', meaning_vi: 'thỏa thuận' },
      { word: 'die Verhandlung', pos: 'noun', meaning_vi: 'đàm phán' },
      { word: 'die Sanktion', pos: 'noun', meaning_vi: 'trừng phạt' },
      { word: 'die Allianz', pos: 'noun', meaning_vi: 'liên minh' },
      { word: 'die Neutralität', pos: 'noun', meaning_vi: 'trung lập' },
      { word: 'der Konflikt', pos: 'noun', meaning_vi: 'xung đột' },
      { word: 'der Frieden', pos: 'noun', meaning_vi: 'hòa bình' },
      { word: 'die Abrüstung', pos: 'noun', meaning_vi: 'giải trừ quân bị' },
      { word: 'die Souveränität', pos: 'noun', meaning_vi: 'chủ quyền' },
      { word: 'die Intervention', pos: 'noun', meaning_vi: 'can thiệp' },
      { word: 'verhandeln', pos: 'verb', meaning_vi: 'đàm phán' },
      { word: 'vermitteln', pos: 'verb', meaning_vi: 'hòa giải' },
      { word: 'sanktionieren', pos: 'verb', meaning_vi: 'trừng phạt' },
      { word: 'diplomatisch', pos: 'adjective', meaning_vi: 'ngoại giao' },
      { word: 'neutral', pos: 'adjective', meaning_vi: 'trung lập' },
    ]
  },

  b2_psychology: {
    level: 'B2',
    words: [
      { word: 'die Psychologie', pos: 'noun', meaning_vi: 'tâm lý học' },
      { word: 'das Verhalten', pos: 'noun', meaning_vi: 'hành vi' },
      { word: 'die Wahrnehmung', pos: 'noun', meaning_vi: 'nhận thức' },
      { word: 'das Gedächtnis', pos: 'noun', meaning_vi: 'trí nhớ' },
      { word: 'die Motivation', pos: 'noun', meaning_vi: 'động lực' },
      { word: 'die Persönlichkeit', pos: 'noun', meaning_vi: 'nhân cách' },
      { word: 'das Trauma', pos: 'noun', meaning_vi: 'chấn thương tâm lý' },
      { word: 'die Depression', pos: 'noun', meaning_vi: 'trầm cảm' },
      { word: 'die Angststörung', pos: 'noun', meaning_vi: 'rối loạn lo âu' },
      { word: 'das Selbstbewusstsein', pos: 'noun', meaning_vi: 'sự tự tin' },
      { word: 'die Selbstachtung', pos: 'noun', meaning_vi: 'lòng tự trọng' },
      { word: 'die Achtsamkeit', pos: 'noun', meaning_vi: 'chánh niệm' },
      { word: 'die Resilienz', pos: 'noun', meaning_vi: 'khả năng phục hồi' },
      { word: 'die Empathie', pos: 'noun', meaning_vi: 'sự đồng cảm' },
      { word: 'die Intelligenz', pos: 'noun', meaning_vi: 'trí thông minh' },
      { word: 'wahrnehmen', pos: 'verb', meaning_vi: 'nhận thức' },
      { word: 'verdrängen', pos: 'verb', meaning_vi: 'kìm nén' },
      { word: 'reflektieren', pos: 'verb', meaning_vi: 'suy ngẫm' },
      { word: 'psychologisch', pos: 'adjective', meaning_vi: 'tâm lý' },
      { word: 'empathisch', pos: 'adjective', meaning_vi: 'đồng cảm' },
    ]
  },

  b2_medicine: {
    level: 'B2',
    words: [
      { word: 'die Medizin', pos: 'noun', meaning_vi: 'y học' },
      { word: 'die Chirurgie', pos: 'noun', meaning_vi: 'phẫu thuật' },
      { word: 'die Kardiologie', pos: 'noun', meaning_vi: 'tim mạch' },
      { word: 'die Neurologie', pos: 'noun', meaning_vi: 'thần kinh' },
      { word: 'die Onkologie', pos: 'noun', meaning_vi: 'ung thư' },
      { word: 'die Dermatologie', pos: 'noun', meaning_vi: 'da liễu' },
      { word: 'die Psychiatrie', pos: 'noun', meaning_vi: 'tâm thần' },
      { word: 'die Pädiatrie', pos: 'noun', meaning_vi: 'nhi khoa' },
      { word: 'die Anästhesie', pos: 'noun', meaning_vi: 'gây mê' },
      { word: 'die Rehabilitation', pos: 'noun', meaning_vi: 'phục hồi chức năng' },
      { word: 'der Blutdruck', pos: 'noun', meaning_vi: 'huyết áp' },
      { word: 'der Puls', pos: 'noun', meaning_vi: 'mạch' },
      { word: 'das Röntgen', pos: 'noun', meaning_vi: 'chụp X-quang' },
      { word: 'die MRT', pos: 'noun', meaning_vi: 'chụp MRI' },
      { word: 'das EKG', pos: 'noun', meaning_vi: 'điện tâm đồ' },
      { word: 'diagnostizieren', pos: 'verb', meaning_vi: 'chẩn đoán' },
      { word: 'transplantieren', pos: 'verb', meaning_vi: 'ghép' },
      { word: 'medizinisch', pos: 'adjective', meaning_vi: 'y học' },
      { word: 'klinisch', pos: 'adjective', meaning_vi: 'lâm sàng' },
      { word: 'chronisch', pos: 'adjective', meaning_vi: 'mãn tính' },
    ]
  },

  // C1 - Advanced (50 words)
  c1_academic_writing: {
    level: 'C1',
    words: [
      { word: 'die Abhandlung', pos: 'noun', meaning_vi: 'luận văn' },
      { word: 'die Erörterung', pos: 'noun', meaning_vi: 'thảo luận' },
      { word: 'die Ausführung', pos: 'noun', meaning_vi: 'trình bày' },
      { word: 'die Darlegung', pos: 'noun', meaning_vi: 'trình bày' },
      { word: 'der Sachverhalt', pos: 'noun', meaning_vi: 'tình hình thực tế' },
      { word: 'die Problematik', pos: 'noun', meaning_vi: 'vấn đề' },
      { word: 'die Thematik', pos: 'noun', meaning_vi: 'chủ đề' },
      { word: 'die Fragestellung', pos: 'noun', meaning_vi: 'câu hỏi nghiên cứu' },
      { word: 'die Zielsetzung', pos: 'noun', meaning_vi: 'mục tiêu' },
      { word: 'die Vorgehensweise', pos: 'noun', meaning_vi: 'phương pháp' },
      { word: 'die Herangehensweise', pos: 'noun', meaning_vi: 'cách tiếp cận' },
      { word: 'die Grundlage', pos: 'noun', meaning_vi: 'cơ sở' },
      { word: 'der Rahmen', pos: 'noun', meaning_vi: 'khuôn khổ' },
      { word: 'die Einschränkung', pos: 'noun', meaning_vi: 'hạn chế' },
      { word: 'die Implikation', pos: 'noun', meaning_vi: 'hàm ý' },
      { word: 'darlegen', pos: 'verb', meaning_vi: 'trình bày' },
      { word: 'ausführen', pos: 'verb', meaning_vi: 'thực hiện' },
      { word: 'erörtern', pos: 'verb', meaning_vi: 'thảo luận' },
      { word: 'herausarbeiten', pos: 'verb', meaning_vi: 'làm rõ' },
      { word: 'zugrunde legen', pos: 'verb', meaning_vi: 'dựa trên' },
      { word: 'einschränken', pos: 'verb', meaning_vi: 'hạn chế' },
      { word: 'implizieren', pos: 'verb', meaning_vi: 'ngụ ý' },
      { word: 'grundlegend', pos: 'adjective', meaning_vi: 'cơ bản' },
      { word: 'wesentlich', pos: 'adjective', meaning_vi: 'thiết yếu' },
      { word: 'umfassend', pos: 'adjective', meaning_vi: 'toàn diện' },
    ]
  },

  c1_philosophy_more: {
    level: 'C1',
    words: [
      { word: 'der Determinismus', pos: 'noun', meaning_vi: 'thuyết quyết định' },
      { word: 'der Relativismus', pos: 'noun', meaning_vi: 'thuyết tương đối' },
      { word: 'der Rationalismus', pos: 'noun', meaning_vi: 'chủ nghĩa duy lý' },
      { word: 'der Empirismus', pos: 'noun', meaning_vi: 'chủ nghĩa kinh nghiệm' },
      { word: 'die Ontologie', pos: 'noun', meaning_vi: 'bản thể học' },
      { word: 'die Epistemologie', pos: 'noun', meaning_vi: 'nhận thức luận' },
      { word: 'die Phänomenologie', pos: 'noun', meaning_vi: 'hiện tượng học' },
      { word: 'die Hermeneutik', pos: 'noun', meaning_vi: 'thông diễn học' },
      { word: 'das Apriori', pos: 'noun', meaning_vi: 'tiên nghiệm' },
      { word: 'das Aposteriori', pos: 'noun', meaning_vi: 'hậu nghiệm' },
      { word: 'das Axiom', pos: 'noun', meaning_vi: 'tiên đề' },
      { word: 'die Tautologie', pos: 'noun', meaning_vi: 'trùng ngôn' },
      { word: 'das Paradox', pos: 'noun', meaning_vi: 'nghịch lý' },
      { word: 'die Dialektik', pos: 'noun', meaning_vi: 'biện chứng' },
      { word: 'die Synthese', pos: 'noun', meaning_vi: 'tổng hợp' },
      { word: 'konstituieren', pos: 'verb', meaning_vi: 'cấu thành' },
      { word: 'transzendieren', pos: 'verb', meaning_vi: 'siêu việt' },
      { word: 'synthetisieren', pos: 'verb', meaning_vi: 'tổng hợp' },
      { word: 'deterministisch', pos: 'adjective', meaning_vi: 'quyết định' },
      { word: 'ontologisch', pos: 'adjective', meaning_vi: 'bản thể' },
      { word: 'epistemisch', pos: 'adjective', meaning_vi: 'nhận thức' },
      { word: 'phänomenologisch', pos: 'adjective', meaning_vi: 'hiện tượng học' },
      { word: 'hermeneutisch', pos: 'adjective', meaning_vi: 'thông diễn' },
      { word: 'apriorisch', pos: 'adjective', meaning_vi: 'tiên nghiệm' },
      { word: 'axiomatisch', pos: 'adjective', meaning_vi: 'tiên đề' },
    ]
  },
};

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║    📚 BATCH 22 - FINAL PUSH BEYOND 10K                     ║');
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
