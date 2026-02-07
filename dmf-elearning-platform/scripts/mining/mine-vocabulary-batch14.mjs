#!/usr/bin/env node
/**
 * Mine Vocabulary Batch 14 - Business, Travel, Entertainment
 * Target: 400 unique words
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TOPICS = {
  // Business & Office
  officeSupplies: {
    topic: 'Van phong pham',
    level: 'A2',
    words: [
      { word: 'der Kugelschreiber', pos: 'noun', meaning_vi: 'bút bi' },
      { word: 'der Bleistift', pos: 'noun', meaning_vi: 'bút chì' },
      { word: 'das Lineal', pos: 'noun', meaning_vi: 'thước kẻ' },
      { word: 'die Schere', pos: 'noun', meaning_vi: 'kéo' },
      { word: 'der Klebstoff', pos: 'noun', meaning_vi: 'keo dán' },
      { word: 'der Hefter', pos: 'noun', meaning_vi: 'dập ghim' },
      { word: 'die Büroklammer', pos: 'noun', meaning_vi: 'kẹp giấy' },
      { word: 'der Ordner', pos: 'noun', meaning_vi: 'cặp tài liệu' },
      { word: 'das Fach', pos: 'noun', meaning_vi: 'ngăn, hộc' },
      { word: 'der Locher', pos: 'noun', meaning_vi: 'máy đục lỗ' },
      { word: 'das Klebeband', pos: 'noun', meaning_vi: 'băng dính' },
      { word: 'der Textmarker', pos: 'noun', meaning_vi: 'bút dạ quang' },
      { word: 'der Radiergummi', pos: 'noun', meaning_vi: 'cục tẩy' },
      { word: 'der Notizblock', pos: 'noun', meaning_vi: 'sổ ghi chép' },
      { word: 'die Mappe', pos: 'noun', meaning_vi: 'bìa hồ sơ' },
      { word: 'das Whiteboard', pos: 'noun', meaning_vi: 'bảng trắng' },
      { word: 'der Marker', pos: 'noun', meaning_vi: 'bút lông' },
      { word: 'die Pinnwand', pos: 'noun', meaning_vi: 'bảng ghim' },
      { word: 'der Stempel', pos: 'noun', meaning_vi: 'con dấu' },
      { word: 'das Briefpapier', pos: 'noun', meaning_vi: 'giấy viết thư' },
    ]
  },
  corporateTerms: {
    topic: 'Doanh nghiep',
    level: 'B1',
    words: [
      { word: 'die Firma', pos: 'noun', meaning_vi: 'công ty' },
      { word: 'das Unternehmen', pos: 'noun', meaning_vi: 'doanh nghiệp' },
      { word: 'die Abteilung', pos: 'noun', meaning_vi: 'phòng ban' },
      { word: 'die Geschäftsführung', pos: 'noun', meaning_vi: 'ban giám đốc' },
      { word: 'der Vorstand', pos: 'noun', meaning_vi: 'ban điều hành' },
      { word: 'die Filiale', pos: 'noun', meaning_vi: 'chi nhánh' },
      { word: 'die Zentrale', pos: 'noun', meaning_vi: 'trụ sở chính' },
      { word: 'die Niederlassung', pos: 'noun', meaning_vi: 'văn phòng đại diện' },
      { word: 'der Umsatz', pos: 'noun', meaning_vi: 'doanh thu' },
      { word: 'der Gewinn', pos: 'noun', meaning_vi: 'lợi nhuận' },
      { word: 'der Verlust', pos: 'noun', meaning_vi: 'tổn thất' },
      { word: 'die Bilanz', pos: 'noun', meaning_vi: 'bảng cân đối' },
      { word: 'der Aktionär', pos: 'noun', meaning_vi: 'cổ đông' },
      { word: 'die Aktie', pos: 'noun', meaning_vi: 'cổ phiếu' },
      { word: 'die Dividende', pos: 'noun', meaning_vi: 'cổ tức' },
      { word: 'die Investition', pos: 'noun', meaning_vi: 'đầu tư' },
      { word: 'die Konkurrenz', pos: 'noun', meaning_vi: 'cạnh tranh' },
      { word: 'der Wettbewerb', pos: 'noun', meaning_vi: 'cuộc cạnh tranh' },
      { word: 'die Marktanalyse', pos: 'noun', meaning_vi: 'phân tích thị trường' },
      { word: 'die Strategie', pos: 'noun', meaning_vi: 'chiến lược' },
    ]
  },
  businessVerbs: {
    topic: 'Dong tu kinh doanh',
    level: 'B1',
    words: [
      { word: 'verhandeln', pos: 'verb', meaning_vi: 'đàm phán' },
      { word: 'vereinbaren', pos: 'verb', meaning_vi: 'thỏa thuận' },
      { word: 'abschließen', pos: 'verb', meaning_vi: 'ký kết, hoàn tất' },
      { word: 'gründen', pos: 'verb', meaning_vi: 'thành lập' },
      { word: 'fusionieren', pos: 'verb', meaning_vi: 'sáp nhập' },
      { word: 'expandieren', pos: 'verb', meaning_vi: 'mở rộng' },
      { word: 'investieren', pos: 'verb', meaning_vi: 'đầu tư' },
      { word: 'finanzieren', pos: 'verb', meaning_vi: 'tài trợ' },
      { word: 'kalkulieren', pos: 'verb', meaning_vi: 'tính toán' },
      { word: 'budgetieren', pos: 'verb', meaning_vi: 'lập ngân sách' },
      { word: 'outsourcen', pos: 'verb', meaning_vi: 'thuê ngoài' },
      { word: 'kooperieren', pos: 'verb', meaning_vi: 'hợp tác' },
      { word: 'akquirieren', pos: 'verb', meaning_vi: 'thu hút khách' },
      { word: 'liquidieren', pos: 'verb', meaning_vi: 'giải thể' },
      { word: 'restrukturieren', pos: 'verb', meaning_vi: 'tái cấu trúc' },
      { word: 'diversifizieren', pos: 'verb', meaning_vi: 'đa dạng hóa' },
      { word: 'zentralisieren', pos: 'verb', meaning_vi: 'tập trung hóa' },
      { word: 'dezentralisieren', pos: 'verb', meaning_vi: 'phi tập trung' },
      { word: 'optimieren', pos: 'verb', meaning_vi: 'tối ưu hóa' },
      { word: 'standardisieren', pos: 'verb', meaning_vi: 'chuẩn hóa' },
    ]
  },
  // Travel & Tourism
  travelBooking: {
    topic: 'Dat phong du lich',
    level: 'A2',
    words: [
      { word: 'die Reservierung', pos: 'noun', meaning_vi: 'đặt chỗ' },
      { word: 'die Buchung', pos: 'noun', meaning_vi: 'đặt phòng' },
      { word: 'die Bestätigung', pos: 'noun', meaning_vi: 'xác nhận' },
      { word: 'die Stornierung', pos: 'noun', meaning_vi: 'hủy đặt' },
      { word: 'die Anzahlung', pos: 'noun', meaning_vi: 'tiền đặt cọc' },
      { word: 'die Kaution', pos: 'noun', meaning_vi: 'tiền cọc' },
      { word: 'der Voucher', pos: 'noun', meaning_vi: 'phiếu ưu đãi' },
      { word: 'das Reisebüro', pos: 'noun', meaning_vi: 'công ty du lịch' },
      { word: 'der Reiseleiter', pos: 'noun', meaning_vi: 'hướng dẫn viên' },
      { word: 'die Pauschalreise', pos: 'noun', meaning_vi: 'tour trọn gói' },
      { word: 'die Rundreise', pos: 'noun', meaning_vi: 'tour khứ hồi' },
      { word: 'die Stadtführung', pos: 'noun', meaning_vi: 'tour thành phố' },
      { word: 'die Besichtigung', pos: 'noun', meaning_vi: 'tham quan' },
      { word: 'die Sehenswürdigkeit', pos: 'noun', meaning_vi: 'địa điểm du lịch' },
      { word: 'das Souvenir', pos: 'noun', meaning_vi: 'quà lưu niệm' },
      { word: 'die Landkarte', pos: 'noun', meaning_vi: 'bản đồ' },
      { word: 'der Reiseführer', pos: 'noun', meaning_vi: 'sách hướng dẫn' },
      { word: 'die Unterkunft', pos: 'noun', meaning_vi: 'chỗ ở' },
      { word: 'die Pension', pos: 'noun', meaning_vi: 'nhà nghỉ' },
      { word: 'die Jugendherberge', pos: 'noun', meaning_vi: 'nhà trọ thanh niên' },
    ]
  },
  hotelVocabulary: {
    topic: 'Khach san',
    level: 'A2',
    words: [
      { word: 'die Rezeption', pos: 'noun', meaning_vi: 'lễ tân' },
      { word: 'der Portier', pos: 'noun', meaning_vi: 'nhân viên gác cửa' },
      { word: 'das Einzelzimmer', pos: 'noun', meaning_vi: 'phòng đơn' },
      { word: 'das Doppelzimmer', pos: 'noun', meaning_vi: 'phòng đôi' },
      { word: 'die Suite', pos: 'noun', meaning_vi: 'phòng cao cấp' },
      { word: 'das Frühstücksbuffet', pos: 'noun', meaning_vi: 'buffet sáng' },
      { word: 'die Halbpension', pos: 'noun', meaning_vi: 'bao gồm 2 bữa' },
      { word: 'die Vollpension', pos: 'noun', meaning_vi: 'bao gồm 3 bữa' },
      { word: 'der Zimmerservice', pos: 'noun', meaning_vi: 'dịch vụ phòng' },
      { word: 'die Minibar', pos: 'noun', meaning_vi: 'tủ lạnh mini' },
      { word: 'der Safe', pos: 'noun', meaning_vi: 'két an toàn' },
      { word: 'der Zimmerschlüssel', pos: 'noun', meaning_vi: 'chìa khóa phòng' },
      { word: 'die Klimaanlage', pos: 'noun', meaning_vi: 'điều hòa' },
      { word: 'der Balkon', pos: 'noun', meaning_vi: 'ban công' },
      { word: 'der Meerblick', pos: 'noun', meaning_vi: 'view biển' },
      { word: 'der Wellnessbereich', pos: 'noun', meaning_vi: 'khu spa' },
      { word: 'das Fitnessstudio', pos: 'noun', meaning_vi: 'phòng gym' },
      { word: 'der Swimmingpool', pos: 'noun', meaning_vi: 'bể bơi' },
      { word: 'die Sauna', pos: 'noun', meaning_vi: 'phòng xông hơi' },
      { word: 'der Parkplatz', pos: 'noun', meaning_vi: 'bãi đỗ xe' },
    ]
  },
  transportExtended: {
    topic: 'Giao thong mo rong',
    level: 'B1',
    words: [
      { word: 'der Fahrschein', pos: 'noun', meaning_vi: 'vé tàu/xe' },
      { word: 'die Monatskarte', pos: 'noun', meaning_vi: 'vé tháng' },
      { word: 'die Tageskarte', pos: 'noun', meaning_vi: 'vé ngày' },
      { word: 'der Umstieg', pos: 'noun', meaning_vi: 'chuyển tàu/xe' },
      { word: 'die Endstation', pos: 'noun', meaning_vi: 'trạm cuối' },
      { word: 'die Zwischenstation', pos: 'noun', meaning_vi: 'trạm trung gian' },
      { word: 'der Bahnsteig', pos: 'noun', meaning_vi: 'sân ga' },
      { word: 'das Gleis', pos: 'noun', meaning_vi: 'đường ray' },
      { word: 'der Waggon', pos: 'noun', meaning_vi: 'toa tàu' },
      { word: 'die Lokomotive', pos: 'noun', meaning_vi: 'đầu máy' },
      { word: 'der Schlafwagen', pos: 'noun', meaning_vi: 'toa giường nằm' },
      { word: 'der Speisewagen', pos: 'noun', meaning_vi: 'toa nhà hàng' },
      { word: 'die Fahrgastinformation', pos: 'noun', meaning_vi: 'thông tin hành khách' },
      { word: 'die Ankunftstafel', pos: 'noun', meaning_vi: 'bảng đến' },
      { word: 'die Abfahrtstafel', pos: 'noun', meaning_vi: 'bảng đi' },
      { word: 'die Verspätung', pos: 'noun', meaning_vi: 'sự chậm trễ' },
      { word: 'der Anschluss', pos: 'noun', meaning_vi: 'nối chuyến' },
      { word: 'die Durchsage', pos: 'noun', meaning_vi: 'thông báo' },
      { word: 'der Schaffner', pos: 'noun', meaning_vi: 'nhân viên soát vé' },
      { word: 'die Gepäckaufbewahrung', pos: 'noun', meaning_vi: 'gửi hành lý' },
    ]
  },
  // Entertainment
  cinema: {
    topic: 'Rap phim',
    level: 'A2',
    words: [
      { word: 'das Kino', pos: 'noun', meaning_vi: 'rạp chiếu phim' },
      { word: 'der Film', pos: 'noun', meaning_vi: 'phim' },
      { word: 'die Vorstellung', pos: 'noun', meaning_vi: 'buổi chiếu' },
      { word: 'die Leinwand', pos: 'noun', meaning_vi: 'màn hình' },
      { word: 'der Trailer', pos: 'noun', meaning_vi: 'đoạn giới thiệu' },
      { word: 'die Premiere', pos: 'noun', meaning_vi: 'buổi ra mắt' },
      { word: 'der Regisseur', pos: 'noun', meaning_vi: 'đạo diễn' },
      { word: 'der Schauspieler', pos: 'noun', meaning_vi: 'diễn viên nam' },
      { word: 'die Schauspielerin', pos: 'noun', meaning_vi: 'diễn viên nữ' },
      { word: 'die Hauptrolle', pos: 'noun', meaning_vi: 'vai chính' },
      { word: 'die Nebenrolle', pos: 'noun', meaning_vi: 'vai phụ' },
      { word: 'das Drehbuch', pos: 'noun', meaning_vi: 'kịch bản' },
      { word: 'die Untertitel', pos: 'noun', meaning_vi: 'phụ đề' },
      { word: 'die Synchronisation', pos: 'noun', meaning_vi: 'lồng tiếng' },
      { word: 'der Actionfilm', pos: 'noun', meaning_vi: 'phim hành động' },
      { word: 'die Komödie', pos: 'noun', meaning_vi: 'phim hài' },
      { word: 'das Drama', pos: 'noun', meaning_vi: 'phim chính kịch' },
      { word: 'der Horrorfilm', pos: 'noun', meaning_vi: 'phim kinh dị' },
      { word: 'der Dokumentarfilm', pos: 'noun', meaning_vi: 'phim tài liệu' },
      { word: 'der Animationsfilm', pos: 'noun', meaning_vi: 'phim hoạt hình' },
    ]
  },
  theater: {
    topic: 'Nha hat',
    level: 'B1',
    words: [
      { word: 'das Theater', pos: 'noun', meaning_vi: 'nhà hát' },
      { word: 'die Bühne', pos: 'noun', meaning_vi: 'sân khấu' },
      { word: 'die Aufführung', pos: 'noun', meaning_vi: 'buổi biểu diễn' },
      { word: 'das Stück', pos: 'noun', meaning_vi: 'vở kịch' },
      { word: 'der Akt', pos: 'noun', meaning_vi: 'màn (kịch)' },
      { word: 'die Szene', pos: 'noun', meaning_vi: 'cảnh (kịch)' },
      { word: 'die Pause', pos: 'noun', meaning_vi: 'giờ nghỉ' },
      { word: 'der Vorhang', pos: 'noun', meaning_vi: 'màn sân khấu' },
      { word: 'die Kulisse', pos: 'noun', meaning_vi: 'phông nền' },
      { word: 'das Kostüm', pos: 'noun', meaning_vi: 'trang phục' },
      { word: 'die Maske', pos: 'noun', meaning_vi: 'mặt nạ' },
      { word: 'die Requisite', pos: 'noun', meaning_vi: 'đạo cụ' },
      { word: 'die Beleuchtung', pos: 'noun', meaning_vi: 'ánh sáng' },
      { word: 'der Souffleur', pos: 'noun', meaning_vi: 'người nhắc vở' },
      { word: 'das Ensemble', pos: 'noun', meaning_vi: 'đoàn kịch' },
      { word: 'die Oper', pos: 'noun', meaning_vi: 'nhạc kịch opera' },
      { word: 'das Ballett', pos: 'noun', meaning_vi: 'múa ballet' },
      { word: 'das Musical', pos: 'noun', meaning_vi: 'nhạc kịch' },
      { word: 'die Tragödie', pos: 'noun', meaning_vi: 'bi kịch' },
      { word: 'die Farce', pos: 'noun', meaning_vi: 'hài kịch' },
    ]
  },
  concertsEvents: {
    topic: 'Hoa nhac va su kien',
    level: 'B1',
    words: [
      { word: 'das Konzert', pos: 'noun', meaning_vi: 'buổi hòa nhạc' },
      { word: 'die Veranstaltung', pos: 'noun', meaning_vi: 'sự kiện' },
      { word: 'das Festival', pos: 'noun', meaning_vi: 'lễ hội' },
      { word: 'die Messe', pos: 'noun', meaning_vi: 'hội chợ' },
      { word: 'die Ausstellung', pos: 'noun', meaning_vi: 'triển lãm' },
      { word: 'die Eröffnung', pos: 'noun', meaning_vi: 'khai mạc' },
      { word: 'der Einlass', pos: 'noun', meaning_vi: 'vào cổng' },
      { word: 'die Eintrittskarte', pos: 'noun', meaning_vi: 'vé vào cửa' },
      { word: 'die Vorverkaufsstelle', pos: 'noun', meaning_vi: 'quầy bán vé' },
      { word: 'der Veranstalter', pos: 'noun', meaning_vi: 'nhà tổ chức' },
      { word: 'der Sponsor', pos: 'noun', meaning_vi: 'nhà tài trợ' },
      { word: 'die Band', pos: 'noun', meaning_vi: 'ban nhạc' },
      { word: 'der Sänger', pos: 'noun', meaning_vi: 'ca sĩ nam' },
      { word: 'die Sängerin', pos: 'noun', meaning_vi: 'ca sĩ nữ' },
      { word: 'der Musiker', pos: 'noun', meaning_vi: 'nhạc sĩ' },
      { word: 'der Dirigent', pos: 'noun', meaning_vi: 'nhạc trưởng' },
      { word: 'das Orchester', pos: 'noun', meaning_vi: 'dàn nhạc' },
      { word: 'die Zugabe', pos: 'noun', meaning_vi: 'bài hát bonus' },
      { word: 'der Applaus', pos: 'noun', meaning_vi: 'tràng pháo tay' },
      { word: 'die Standing Ovation', pos: 'noun', meaning_vi: 'đứng dậy vỗ tay' },
    ]
  },
  gamesHobbies: {
    topic: 'Tro choi va so thich',
    level: 'A2',
    words: [
      { word: 'das Spiel', pos: 'noun', meaning_vi: 'trò chơi' },
      { word: 'das Brettspiel', pos: 'noun', meaning_vi: 'trò chơi bàn' },
      { word: 'das Kartenspiel', pos: 'noun', meaning_vi: 'trò chơi bài' },
      { word: 'das Videospiel', pos: 'noun', meaning_vi: 'trò chơi điện tử' },
      { word: 'der Würfel', pos: 'noun', meaning_vi: 'con xúc xắc' },
      { word: 'die Spielfigur', pos: 'noun', meaning_vi: 'quân cờ' },
      { word: 'das Puzzle', pos: 'noun', meaning_vi: 'xếp hình' },
      { word: 'das Schach', pos: 'noun', meaning_vi: 'cờ vua' },
      { word: 'das Basteln', pos: 'noun', meaning_vi: 'thủ công' },
      { word: 'das Sammeln', pos: 'noun', meaning_vi: 'sưu tầm' },
      { word: 'das Stricken', pos: 'noun', meaning_vi: 'đan len' },
      { word: 'das Nähen', pos: 'noun', meaning_vi: 'may vá' },
      { word: 'das Malen', pos: 'noun', meaning_vi: 'vẽ tranh' },
      { word: 'das Zeichnen', pos: 'noun', meaning_vi: 'vẽ phác' },
      { word: 'die Fotografie', pos: 'noun', meaning_vi: 'nhiếp ảnh' },
      { word: 'das Angeln', pos: 'noun', meaning_vi: 'câu cá' },
      { word: 'das Wandern', pos: 'noun', meaning_vi: 'đi bộ đường dài' },
      { word: 'das Klettern', pos: 'noun', meaning_vi: 'leo núi' },
      { word: 'das Camping', pos: 'noun', meaning_vi: 'cắm trại' },
      { word: 'das Grillen', pos: 'noun', meaning_vi: 'nướng BBQ' },
    ]
  },
  // Relationships
  relationships: {
    topic: 'Quan he',
    level: 'B1',
    words: [
      { word: 'die Beziehung', pos: 'noun', meaning_vi: 'mối quan hệ' },
      { word: 'die Partnerschaft', pos: 'noun', meaning_vi: 'quan hệ đối tác' },
      { word: 'die Freundschaft', pos: 'noun', meaning_vi: 'tình bạn' },
      { word: 'die Verlobung', pos: 'noun', meaning_vi: 'đính hôn' },
      { word: 'die Hochzeit', pos: 'noun', meaning_vi: 'đám cưới' },
      { word: 'die Ehe', pos: 'noun', meaning_vi: 'hôn nhân' },
      { word: 'die Scheidung', pos: 'noun', meaning_vi: 'ly hôn' },
      { word: 'die Trennung', pos: 'noun', meaning_vi: 'chia tay' },
      { word: 'der Flirt', pos: 'noun', meaning_vi: 'tán tỉnh' },
      { word: 'das Date', pos: 'noun', meaning_vi: 'buổi hẹn hò' },
      { word: 'die Verabredung', pos: 'noun', meaning_vi: 'cuộc hẹn' },
      { word: 'der Kuss', pos: 'noun', meaning_vi: 'nụ hôn' },
      { word: 'die Umarmung', pos: 'noun', meaning_vi: 'cái ôm' },
      { word: 'die Zuneigung', pos: 'noun', meaning_vi: 'sự trìu mến' },
      { word: 'die Liebe', pos: 'noun', meaning_vi: 'tình yêu' },
      { word: 'die Leidenschaft', pos: 'noun', meaning_vi: 'đam mê' },
      { word: 'die Eifersucht', pos: 'noun', meaning_vi: 'ghen tuông' },
      { word: 'der Streit', pos: 'noun', meaning_vi: 'cãi vã' },
      { word: 'die Versöhnung', pos: 'noun', meaning_vi: 'hòa giải' },
      { word: 'das Vertrauen', pos: 'noun', meaning_vi: 'sự tin tưởng' },
    ]
  },
  familyExtended: {
    topic: 'Gia dinh mo rong',
    level: 'A2',
    words: [
      { word: 'die Schwiegermutter', pos: 'noun', meaning_vi: 'mẹ chồng/vợ' },
      { word: 'der Schwiegervater', pos: 'noun', meaning_vi: 'bố chồng/vợ' },
      { word: 'die Schwägerin', pos: 'noun', meaning_vi: 'chị/em dâu' },
      { word: 'der Schwager', pos: 'noun', meaning_vi: 'anh/em rể' },
      { word: 'die Stiefmutter', pos: 'noun', meaning_vi: 'mẹ kế' },
      { word: 'der Stiefvater', pos: 'noun', meaning_vi: 'bố dượng' },
      { word: 'das Stiefkind', pos: 'noun', meaning_vi: 'con riêng' },
      { word: 'der Halbbruder', pos: 'noun', meaning_vi: 'anh/em cùng cha khác mẹ' },
      { word: 'die Halbschwester', pos: 'noun', meaning_vi: 'chị/em cùng cha khác mẹ' },
      { word: 'die Patentante', pos: 'noun', meaning_vi: 'mẹ đỡ đầu' },
      { word: 'der Patenonkel', pos: 'noun', meaning_vi: 'bố đỡ đầu' },
      { word: 'das Patenkind', pos: 'noun', meaning_vi: 'con đỡ đầu' },
      { word: 'die Urgroßmutter', pos: 'noun', meaning_vi: 'bà cố' },
      { word: 'der Urgroßvater', pos: 'noun', meaning_vi: 'ông cố' },
      { word: 'das Urenkel', pos: 'noun', meaning_vi: 'chắt' },
      { word: 'die Nichte', pos: 'noun', meaning_vi: 'cháu gái (con anh chị em)' },
      { word: 'der Neffe', pos: 'noun', meaning_vi: 'cháu trai (con anh chị em)' },
      { word: 'die Verwandtschaft', pos: 'noun', meaning_vi: 'họ hàng' },
      { word: 'der Stammbaum', pos: 'noun', meaning_vi: 'gia phả' },
      { word: 'die Adoption', pos: 'noun', meaning_vi: 'nhận nuôi' },
    ]
  },
  // Compound words & expressions
  compoundWords1: {
    topic: 'Tu ghep 1',
    level: 'B1',
    words: [
      { word: 'die Handschuhe', pos: 'noun', meaning_vi: 'găng tay' },
      { word: 'der Handtuch', pos: 'noun', meaning_vi: 'khăn tay' },
      { word: 'das Krankenhaus', pos: 'noun', meaning_vi: 'bệnh viện' },
      { word: 'der Kühlschrank', pos: 'noun', meaning_vi: 'tủ lạnh' },
      { word: 'die Waschmaschine', pos: 'noun', meaning_vi: 'máy giặt' },
      { word: 'der Staubsauger', pos: 'noun', meaning_vi: 'máy hút bụi' },
      { word: 'die Spülmaschine', pos: 'noun', meaning_vi: 'máy rửa bát' },
      { word: 'der Briefkasten', pos: 'noun', meaning_vi: 'hộp thư' },
      { word: 'das Schlafzimmer', pos: 'noun', meaning_vi: 'phòng ngủ' },
      { word: 'das Wohnzimmer', pos: 'noun', meaning_vi: 'phòng khách' },
      { word: 'das Badezimmer', pos: 'noun', meaning_vi: 'phòng tắm' },
      { word: 'die Kinderzimmer', pos: 'noun', meaning_vi: 'phòng trẻ em' },
      { word: 'der Hausschlüssel', pos: 'noun', meaning_vi: 'chìa khóa nhà' },
      { word: 'die Haustür', pos: 'noun', meaning_vi: 'cửa chính' },
      { word: 'das Sonnenlicht', pos: 'noun', meaning_vi: 'ánh nắng' },
      { word: 'der Regenschirm', pos: 'noun', meaning_vi: 'ô/dù' },
      { word: 'der Sommertag', pos: 'noun', meaning_vi: 'ngày hè' },
      { word: 'die Winterjacke', pos: 'noun', meaning_vi: 'áo khoác mùa đông' },
      { word: 'der Morgenspaziergang', pos: 'noun', meaning_vi: 'đi dạo buổi sáng' },
      { word: 'die Abendessen', pos: 'noun', meaning_vi: 'bữa tối' },
    ]
  },
  compoundWords2: {
    topic: 'Tu ghep 2',
    level: 'B1',
    words: [
      { word: 'der Geburtstag', pos: 'noun', meaning_vi: 'sinh nhật' },
      { word: 'das Weihnachtsgeschenk', pos: 'noun', meaning_vi: 'quà Giáng sinh' },
      { word: 'der Arbeitsplatz', pos: 'noun', meaning_vi: 'nơi làm việc' },
      { word: 'die Arbeitsstunden', pos: 'noun', meaning_vi: 'giờ làm việc' },
      { word: 'der Feierabend', pos: 'noun', meaning_vi: 'sau giờ làm' },
      { word: 'das Wochenende', pos: 'noun', meaning_vi: 'cuối tuần' },
      { word: 'der Jahrestag', pos: 'noun', meaning_vi: 'ngày kỷ niệm' },
      { word: 'die Zeitschrift', pos: 'noun', meaning_vi: 'tạp chí' },
      { word: 'die Tageszeitung', pos: 'noun', meaning_vi: 'báo hàng ngày' },
      { word: 'der Fahrplan', pos: 'noun', meaning_vi: 'lịch trình xe' },
      { word: 'der Flughafen', pos: 'noun', meaning_vi: 'sân bay' },
      { word: 'der Hauptbahnhof', pos: 'noun', meaning_vi: 'ga chính' },
      { word: 'die Bushaltestelle', pos: 'noun', meaning_vi: 'trạm xe buýt' },
      { word: 'der Fußgänger', pos: 'noun', meaning_vi: 'người đi bộ' },
      { word: 'die Fußgängerzone', pos: 'noun', meaning_vi: 'phố đi bộ' },
      { word: 'der Spielplatz', pos: 'noun', meaning_vi: 'sân chơi' },
      { word: 'das Schwimmbad', pos: 'noun', meaning_vi: 'bể bơi' },
      { word: 'der Sportplatz', pos: 'noun', meaning_vi: 'sân vận động' },
      { word: 'die Tanzschule', pos: 'noun', meaning_vi: 'trường dạy nhảy' },
      { word: 'die Musikschule', pos: 'noun', meaning_vi: 'trường nhạc' },
    ]
  },
  // Separable verbs
  separableVerbs: {
    topic: 'Dong tu tach',
    level: 'A2',
    words: [
      { word: 'aufstehen', pos: 'verb', meaning_vi: 'thức dậy' },
      { word: 'aufwachen', pos: 'verb', meaning_vi: 'tỉnh giấc' },
      { word: 'einschlafen', pos: 'verb', meaning_vi: 'ngủ thiếp đi' },
      { word: 'anfangen', pos: 'verb', meaning_vi: 'bắt đầu' },
      { word: 'aufhören', pos: 'verb', meaning_vi: 'dừng lại' },
      { word: 'anrufen', pos: 'verb', meaning_vi: 'gọi điện' },
      { word: 'abfahren', pos: 'verb', meaning_vi: 'khởi hành' },
      { word: 'ankommen', pos: 'verb', meaning_vi: 'đến nơi' },
      { word: 'einsteigen', pos: 'verb', meaning_vi: 'lên xe/tàu' },
      { word: 'aussteigen', pos: 'verb', meaning_vi: 'xuống xe/tàu' },
      { word: 'umsteigen', pos: 'verb', meaning_vi: 'chuyển xe' },
      { word: 'einkaufen', pos: 'verb', meaning_vi: 'mua sắm' },
      { word: 'aufräumen', pos: 'verb', meaning_vi: 'dọn dẹp' },
      { word: 'abwaschen', pos: 'verb', meaning_vi: 'rửa bát' },
      { word: 'ausgehen', pos: 'verb', meaning_vi: 'đi chơi' },
      { word: 'zurückkommen', pos: 'verb', meaning_vi: 'quay về' },
      { word: 'mitnehmen', pos: 'verb', meaning_vi: 'mang theo' },
      { word: 'einladen', pos: 'verb', meaning_vi: 'mời' },
      { word: 'vorbereiten', pos: 'verb', meaning_vi: 'chuẩn bị' },
      { word: 'vorstellen', pos: 'verb', meaning_vi: 'giới thiệu' },
    ]
  },
  reflexiveVerbs: {
    topic: 'Dong tu phan than',
    level: 'A2',
    words: [
      { word: 'sich waschen', pos: 'verb', meaning_vi: 'rửa mặt/tay' },
      { word: 'sich duschen', pos: 'verb', meaning_vi: 'tắm vòi sen' },
      { word: 'sich anziehen', pos: 'verb', meaning_vi: 'mặc quần áo' },
      { word: 'sich ausziehen', pos: 'verb', meaning_vi: 'cởi quần áo' },
      { word: 'sich kämmen', pos: 'verb', meaning_vi: 'chải tóc' },
      { word: 'sich rasieren', pos: 'verb', meaning_vi: 'cạo râu' },
      { word: 'sich schminken', pos: 'verb', meaning_vi: 'trang điểm' },
      { word: 'sich beeilen', pos: 'verb', meaning_vi: 'vội vàng' },
      { word: 'sich erholen', pos: 'verb', meaning_vi: 'nghỉ ngơi' },
      { word: 'sich entspannen', pos: 'verb', meaning_vi: 'thư giãn' },
      { word: 'sich freuen', pos: 'verb', meaning_vi: 'vui mừng' },
      { word: 'sich ärgern', pos: 'verb', meaning_vi: 'bực mình' },
      { word: 'sich wundern', pos: 'verb', meaning_vi: 'ngạc nhiên' },
      { word: 'sich interessieren', pos: 'verb', meaning_vi: 'quan tâm' },
      { word: 'sich erinnern', pos: 'verb', meaning_vi: 'nhớ lại' },
      { word: 'sich vorstellen', pos: 'verb', meaning_vi: 'tự giới thiệu' },
      { word: 'sich setzen', pos: 'verb', meaning_vi: 'ngồi xuống' },
      { word: 'sich hinlegen', pos: 'verb', meaning_vi: 'nằm xuống' },
      { word: 'sich treffen', pos: 'verb', meaning_vi: 'gặp nhau' },
      { word: 'sich unterhalten', pos: 'verb', meaning_vi: 'nói chuyện' },
    ]
  },
  // Adjectives extended
  adjectivesPersonality: {
    topic: 'Tinh tu tinh cach',
    level: 'B1',
    words: [
      { word: 'ehrgeizig', pos: 'adjective', meaning_vi: 'tham vọng' },
      { word: 'zuverlässig', pos: 'adjective', meaning_vi: 'đáng tin cậy' },
      { word: 'verantwortungsvoll', pos: 'adjective', meaning_vi: 'có trách nhiệm' },
      { word: 'selbstbewusst', pos: 'adjective', meaning_vi: 'tự tin' },
      { word: 'bescheiden', pos: 'adjective', meaning_vi: 'khiêm tốn' },
      { word: 'großzügig', pos: 'adjective', meaning_vi: 'hào phóng' },
      { word: 'geizig', pos: 'adjective', meaning_vi: 'keo kiệt' },
      { word: 'neugierig', pos: 'adjective', meaning_vi: 'tò mò' },
      { word: 'stur', pos: 'adjective', meaning_vi: 'cứng đầu' },
      { word: 'tolerant', pos: 'adjective', meaning_vi: 'khoan dung' },
      { word: 'egoistisch', pos: 'adjective', meaning_vi: 'ích kỷ' },
      { word: 'selbstlos', pos: 'adjective', meaning_vi: 'vị tha' },
      { word: 'introvertiert', pos: 'adjective', meaning_vi: 'hướng nội' },
      { word: 'extrovertiert', pos: 'adjective', meaning_vi: 'hướng ngoại' },
      { word: 'sensibel', pos: 'adjective', meaning_vi: 'nhạy cảm' },
      { word: 'rational', pos: 'adjective', meaning_vi: 'lý tính' },
      { word: 'impulsiv', pos: 'adjective', meaning_vi: 'bốc đồng' },
      { word: 'gelassen', pos: 'adjective', meaning_vi: 'điềm tĩnh' },
      { word: 'pessimistisch', pos: 'adjective', meaning_vi: 'bi quan' },
      { word: 'optimistisch', pos: 'adjective', meaning_vi: 'lạc quan' },
    ]
  },
  adjectivesAppearance: {
    topic: 'Tinh tu ngoai hinh',
    level: 'A2',
    words: [
      { word: 'hübsch', pos: 'adjective', meaning_vi: 'xinh đẹp' },
      { word: 'gutaussehend', pos: 'adjective', meaning_vi: 'đẹp trai' },
      { word: 'attraktiv', pos: 'adjective', meaning_vi: 'hấp dẫn' },
      { word: 'schlank', pos: 'adjective', meaning_vi: 'mảnh mai' },
      { word: 'mollig', pos: 'adjective', meaning_vi: 'mũm mĩm' },
      { word: 'muskulös', pos: 'adjective', meaning_vi: 'cơ bắp' },
      { word: 'sportlich', pos: 'adjective', meaning_vi: 'khỏe mạnh' },
      { word: 'blass', pos: 'adjective', meaning_vi: 'tái nhợt' },
      { word: 'gebräunt', pos: 'adjective', meaning_vi: 'rám nắng' },
      { word: 'lockig', pos: 'adjective', meaning_vi: 'xoăn' },
      { word: 'glatt', pos: 'adjective', meaning_vi: 'thẳng (tóc)' },
      { word: 'kurzhaarig', pos: 'adjective', meaning_vi: 'tóc ngắn' },
      { word: 'langhaarig', pos: 'adjective', meaning_vi: 'tóc dài' },
      { word: 'blond', pos: 'adjective', meaning_vi: 'tóc vàng' },
      { word: 'brünett', pos: 'adjective', meaning_vi: 'tóc nâu' },
      { word: 'rothaarig', pos: 'adjective', meaning_vi: 'tóc đỏ' },
      { word: 'grauhaarig', pos: 'adjective', meaning_vi: 'tóc bạc' },
      { word: 'kahlköpfig', pos: 'adjective', meaning_vi: 'hói đầu' },
      { word: 'gepflegt', pos: 'adjective', meaning_vi: 'chỉn chu' },
      { word: 'elegant', pos: 'adjective', meaning_vi: 'thanh lịch' },
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
const outputPath = path.join(__dirname, '../data/quality-expansion/batch14-vocabulary.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(vocabulary, null, 2));

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║    📚 BATCH 14 VOCABULARY GENERATED                        ║');
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
