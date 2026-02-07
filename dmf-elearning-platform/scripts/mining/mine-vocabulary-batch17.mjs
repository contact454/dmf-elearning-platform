#!/usr/bin/env node
/**
 * Mine Vocabulary Batch 17 - Final push to 10K
 * Target: 500+ unique words
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TOPICS = {
  // Numbers extended
  numbersCardinal: {
    topic: 'So dem',
    level: 'A1',
    words: [
      { word: 'eins', pos: 'numeral', meaning_vi: 'một' },
      { word: 'zwei', pos: 'numeral', meaning_vi: 'hai' },
      { word: 'drei', pos: 'numeral', meaning_vi: 'ba' },
      { word: 'vier', pos: 'numeral', meaning_vi: 'bốn' },
      { word: 'fünf', pos: 'numeral', meaning_vi: 'năm' },
      { word: 'sechs', pos: 'numeral', meaning_vi: 'sáu' },
      { word: 'sieben', pos: 'numeral', meaning_vi: 'bảy' },
      { word: 'acht', pos: 'numeral', meaning_vi: 'tám' },
      { word: 'neun', pos: 'numeral', meaning_vi: 'chín' },
      { word: 'zehn', pos: 'numeral', meaning_vi: 'mười' },
      { word: 'elf', pos: 'numeral', meaning_vi: 'mười một' },
      { word: 'zwölf', pos: 'numeral', meaning_vi: 'mười hai' },
      { word: 'dreizehn', pos: 'numeral', meaning_vi: 'mười ba' },
      { word: 'vierzehn', pos: 'numeral', meaning_vi: 'mười bốn' },
      { word: 'fünfzehn', pos: 'numeral', meaning_vi: 'mười lăm' },
      { word: 'zwanzig', pos: 'numeral', meaning_vi: 'hai mươi' },
      { word: 'dreißig', pos: 'numeral', meaning_vi: 'ba mươi' },
      { word: 'vierzig', pos: 'numeral', meaning_vi: 'bốn mươi' },
      { word: 'fünfzig', pos: 'numeral', meaning_vi: 'năm mươi' },
      { word: 'hundert', pos: 'numeral', meaning_vi: 'một trăm' },
    ]
  },
  numbersOrdinal: {
    topic: 'So thu tu',
    level: 'A1',
    words: [
      { word: 'erste', pos: 'adjective', meaning_vi: 'thứ nhất' },
      { word: 'zweite', pos: 'adjective', meaning_vi: 'thứ hai' },
      { word: 'dritte', pos: 'adjective', meaning_vi: 'thứ ba' },
      { word: 'vierte', pos: 'adjective', meaning_vi: 'thứ tư' },
      { word: 'fünfte', pos: 'adjective', meaning_vi: 'thứ năm' },
      { word: 'sechste', pos: 'adjective', meaning_vi: 'thứ sáu' },
      { word: 'siebte', pos: 'adjective', meaning_vi: 'thứ bảy' },
      { word: 'achte', pos: 'adjective', meaning_vi: 'thứ tám' },
      { word: 'neunte', pos: 'adjective', meaning_vi: 'thứ chín' },
      { word: 'zehnte', pos: 'adjective', meaning_vi: 'thứ mười' },
      { word: 'elfte', pos: 'adjective', meaning_vi: 'thứ mười một' },
      { word: 'zwölfte', pos: 'adjective', meaning_vi: 'thứ mười hai' },
      { word: 'letzte', pos: 'adjective', meaning_vi: 'cuối cùng' },
      { word: 'nächste', pos: 'adjective', meaning_vi: 'tiếp theo' },
      { word: 'vorletzte', pos: 'adjective', meaning_vi: 'áp chót' },
      { word: 'einzige', pos: 'adjective', meaning_vi: 'duy nhất' },
      { word: 'halb', pos: 'adjective', meaning_vi: 'một nửa' },
      { word: 'doppelt', pos: 'adjective', meaning_vi: 'gấp đôi' },
      { word: 'dreifach', pos: 'adjective', meaning_vi: 'gấp ba' },
      { word: 'mehrfach', pos: 'adjective', meaning_vi: 'nhiều lần' },
    ]
  },
  // Directions and locations
  directionsLocations: {
    topic: 'Phuong huong va vi tri',
    level: 'A1',
    words: [
      { word: 'links', pos: 'adverb', meaning_vi: 'bên trái' },
      { word: 'rechts', pos: 'adverb', meaning_vi: 'bên phải' },
      { word: 'geradeaus', pos: 'adverb', meaning_vi: 'thẳng tiến' },
      { word: 'oben', pos: 'adverb', meaning_vi: 'ở trên' },
      { word: 'unten', pos: 'adverb', meaning_vi: 'ở dưới' },
      { word: 'vorne', pos: 'adverb', meaning_vi: 'phía trước' },
      { word: 'hinten', pos: 'adverb', meaning_vi: 'phía sau' },
      { word: 'hier', pos: 'adverb', meaning_vi: 'ở đây' },
      { word: 'dort', pos: 'adverb', meaning_vi: 'ở đó' },
      { word: 'überall', pos: 'adverb', meaning_vi: 'khắp nơi' },
      { word: 'nirgendwo', pos: 'adverb', meaning_vi: 'không đâu' },
      { word: 'irgendwo', pos: 'adverb', meaning_vi: 'đâu đó' },
      { word: 'drinnen', pos: 'adverb', meaning_vi: 'bên trong' },
      { word: 'draußen', pos: 'adverb', meaning_vi: 'bên ngoài' },
      { word: 'neben', pos: 'preposition', meaning_vi: 'bên cạnh' },
      { word: 'zwischen', pos: 'preposition', meaning_vi: 'giữa' },
      { word: 'gegenüber', pos: 'preposition', meaning_vi: 'đối diện' },
      { word: 'entlang', pos: 'preposition', meaning_vi: 'dọc theo' },
      { word: 'um...herum', pos: 'preposition', meaning_vi: 'xung quanh' },
      { word: 'durch', pos: 'preposition', meaning_vi: 'xuyên qua' },
    ]
  },
  // Emotions extended
  emotionsPositive: {
    topic: 'Cam xuc tich cuc',
    level: 'A2',
    words: [
      { word: 'glücklich', pos: 'adjective', meaning_vi: 'hạnh phúc' },
      { word: 'fröhlich', pos: 'adjective', meaning_vi: 'vui vẻ' },
      { word: 'zufrieden', pos: 'adjective', meaning_vi: 'hài lòng' },
      { word: 'begeistert', pos: 'adjective', meaning_vi: 'hào hứng' },
      { word: 'stolz', pos: 'adjective', meaning_vi: 'tự hào' },
      { word: 'dankbar', pos: 'adjective', meaning_vi: 'biết ơn' },
      { word: 'hoffnungsvoll', pos: 'adjective', meaning_vi: 'hy vọng' },
      { word: 'entspannt', pos: 'adjective', meaning_vi: 'thư giãn' },
      { word: 'erleichtert', pos: 'adjective', meaning_vi: 'nhẹ nhõm' },
      { word: 'aufgeregt', pos: 'adjective', meaning_vi: 'phấn khích' },
      { word: 'verliebt', pos: 'adjective', meaning_vi: 'đang yêu' },
      { word: 'inspiriert', pos: 'adjective', meaning_vi: 'được truyền cảm hứng' },
      { word: 'motiviert', pos: 'adjective', meaning_vi: 'được động viên' },
      { word: 'ruhig', pos: 'adjective', meaning_vi: 'bình tĩnh' },
      { word: 'sicher', pos: 'adjective', meaning_vi: 'an toàn' },
      { word: 'energiegeladen', pos: 'adjective', meaning_vi: 'tràn đầy năng lượng' },
      { word: 'kreativ', pos: 'adjective', meaning_vi: 'sáng tạo' },
      { word: 'leidenschaftlich', pos: 'adjective', meaning_vi: 'đam mê' },
      { word: 'überzeugt', pos: 'adjective', meaning_vi: 'tin chắc' },
      { word: 'selbstsicher', pos: 'adjective', meaning_vi: 'tự tin' },
    ]
  },
  emotionsNegative: {
    topic: 'Cam xuc tieu cuc',
    level: 'A2',
    words: [
      { word: 'traurig', pos: 'adjective', meaning_vi: 'buồn' },
      { word: 'wütend', pos: 'adjective', meaning_vi: 'giận dữ' },
      { word: 'ängstlich', pos: 'adjective', meaning_vi: 'lo lắng' },
      { word: 'nervös', pos: 'adjective', meaning_vi: 'hồi hộp' },
      { word: 'frustriert', pos: 'adjective', meaning_vi: 'thất vọng' },
      { word: 'enttäuscht', pos: 'adjective', meaning_vi: 'thất vọng' },
      { word: 'gelangweilt', pos: 'adjective', meaning_vi: 'chán' },
      { word: 'einsam', pos: 'adjective', meaning_vi: 'cô đơn' },
      { word: 'erschöpft', pos: 'adjective', meaning_vi: 'kiệt sức' },
      { word: 'gestresst', pos: 'adjective', meaning_vi: 'căng thẳng' },
      { word: 'verärgert', pos: 'adjective', meaning_vi: 'bực mình' },
      { word: 'neidisch', pos: 'adjective', meaning_vi: 'ghen tị' },
      { word: 'verwirrt', pos: 'adjective', meaning_vi: 'bối rối' },
      { word: 'unsicher', pos: 'adjective', meaning_vi: 'không chắc chắn' },
      { word: 'beschämt', pos: 'adjective', meaning_vi: 'xấu hổ' },
      { word: 'schuldig', pos: 'adjective', meaning_vi: 'có lỗi' },
      { word: 'verzweifelt', pos: 'adjective', meaning_vi: 'tuyệt vọng' },
      { word: 'besorgt', pos: 'adjective', meaning_vi: 'lo lắng' },
      { word: 'deprimiert', pos: 'adjective', meaning_vi: 'trầm cảm' },
      { word: 'hilflos', pos: 'adjective', meaning_vi: 'bất lực' },
    ]
  },
  // Body parts extended
  bodyParts: {
    topic: 'Bo phan co the',
    level: 'A2',
    words: [
      { word: 'der Kopf', pos: 'noun', meaning_vi: 'đầu' },
      { word: 'das Gesicht', pos: 'noun', meaning_vi: 'mặt' },
      { word: 'das Auge', pos: 'noun', meaning_vi: 'mắt' },
      { word: 'die Nase', pos: 'noun', meaning_vi: 'mũi' },
      { word: 'der Mund', pos: 'noun', meaning_vi: 'miệng' },
      { word: 'das Ohr', pos: 'noun', meaning_vi: 'tai' },
      { word: 'das Haar', pos: 'noun', meaning_vi: 'tóc' },
      { word: 'der Hals', pos: 'noun', meaning_vi: 'cổ' },
      { word: 'die Schulter', pos: 'noun', meaning_vi: 'vai' },
      { word: 'der Arm', pos: 'noun', meaning_vi: 'cánh tay' },
      { word: 'die Hand', pos: 'noun', meaning_vi: 'bàn tay' },
      { word: 'der Finger', pos: 'noun', meaning_vi: 'ngón tay' },
      { word: 'die Brust', pos: 'noun', meaning_vi: 'ngực' },
      { word: 'der Bauch', pos: 'noun', meaning_vi: 'bụng' },
      { word: 'der Rücken', pos: 'noun', meaning_vi: 'lưng' },
      { word: 'das Bein', pos: 'noun', meaning_vi: 'chân' },
      { word: 'das Knie', pos: 'noun', meaning_vi: 'đầu gối' },
      { word: 'der Fuß', pos: 'noun', meaning_vi: 'bàn chân' },
      { word: 'die Zehe', pos: 'noun', meaning_vi: 'ngón chân' },
      { word: 'die Haut', pos: 'noun', meaning_vi: 'da' },
    ]
  },
  internalOrgans: {
    topic: 'Noi tang',
    level: 'B1',
    words: [
      { word: 'das Herz', pos: 'noun', meaning_vi: 'tim' },
      { word: 'die Lunge', pos: 'noun', meaning_vi: 'phổi' },
      { word: 'die Leber', pos: 'noun', meaning_vi: 'gan' },
      { word: 'die Niere', pos: 'noun', meaning_vi: 'thận' },
      { word: 'der Magen', pos: 'noun', meaning_vi: 'dạ dày' },
      { word: 'der Darm', pos: 'noun', meaning_vi: 'ruột' },
      { word: 'das Gehirn', pos: 'noun', meaning_vi: 'não' },
      { word: 'die Haut', pos: 'noun', meaning_vi: 'da' },
      { word: 'der Knochen', pos: 'noun', meaning_vi: 'xương' },
      { word: 'der Muskel', pos: 'noun', meaning_vi: 'cơ' },
      { word: 'die Ader', pos: 'noun', meaning_vi: 'mạch máu' },
      { word: 'das Blut', pos: 'noun', meaning_vi: 'máu' },
      { word: 'der Nerv', pos: 'noun', meaning_vi: 'dây thần kinh' },
      { word: 'die Wirbelsäule', pos: 'noun', meaning_vi: 'cột sống' },
      { word: 'die Rippe', pos: 'noun', meaning_vi: 'xương sườn' },
      { word: 'das Gelenk', pos: 'noun', meaning_vi: 'khớp' },
      { word: 'die Sehne', pos: 'noun', meaning_vi: 'gân' },
      { word: 'der Zahn', pos: 'noun', meaning_vi: 'răng' },
      { word: 'die Zunge', pos: 'noun', meaning_vi: 'lưỡi' },
      { word: 'die Lippe', pos: 'noun', meaning_vi: 'môi' },
    ]
  },
  // Buildings and places
  buildings: {
    topic: 'Toa nha',
    level: 'A2',
    words: [
      { word: 'das Rathaus', pos: 'noun', meaning_vi: 'tòa thị chính' },
      { word: 'die Kirche', pos: 'noun', meaning_vi: 'nhà thờ' },
      { word: 'die Moschee', pos: 'noun', meaning_vi: 'nhà thờ Hồi giáo' },
      { word: 'die Synagoge', pos: 'noun', meaning_vi: 'nhà thờ Do Thái' },
      { word: 'der Tempel', pos: 'noun', meaning_vi: 'đền' },
      { word: 'das Museum', pos: 'noun', meaning_vi: 'bảo tàng' },
      { word: 'die Bibliothek', pos: 'noun', meaning_vi: 'thư viện' },
      { word: 'das Stadion', pos: 'noun', meaning_vi: 'sân vận động' },
      { word: 'der Turm', pos: 'noun', meaning_vi: 'tháp' },
      { word: 'die Burg', pos: 'noun', meaning_vi: 'lâu đài' },
      { word: 'das Schloss', pos: 'noun', meaning_vi: 'cung điện' },
      { word: 'die Fabrik', pos: 'noun', meaning_vi: 'nhà máy' },
      { word: 'das Lagerhaus', pos: 'noun', meaning_vi: 'nhà kho' },
      { word: 'der Wolkenkratzer', pos: 'noun', meaning_vi: 'tòa nhà chọc trời' },
      { word: 'das Einkaufszentrum', pos: 'noun', meaning_vi: 'trung tâm thương mại' },
      { word: 'der Markt', pos: 'noun', meaning_vi: 'chợ' },
      { word: 'der Supermarkt', pos: 'noun', meaning_vi: 'siêu thị' },
      { word: 'die Bäckerei', pos: 'noun', meaning_vi: 'tiệm bánh' },
      { word: 'die Metzgerei', pos: 'noun', meaning_vi: 'tiệm thịt' },
      { word: 'die Drogerie', pos: 'noun', meaning_vi: 'hiệu thuốc' },
    ]
  },
  publicPlaces: {
    topic: 'Noi cong cong',
    level: 'A2',
    words: [
      { word: 'der Park', pos: 'noun', meaning_vi: 'công viên' },
      { word: 'der Spielplatz', pos: 'noun', meaning_vi: 'sân chơi' },
      { word: 'der Friedhof', pos: 'noun', meaning_vi: 'nghĩa trang' },
      { word: 'der Zoo', pos: 'noun', meaning_vi: 'sở thú' },
      { word: 'der Hafen', pos: 'noun', meaning_vi: 'cảng' },
      { word: 'die Brücke', pos: 'noun', meaning_vi: 'cầu' },
      { word: 'der Tunnel', pos: 'noun', meaning_vi: 'đường hầm' },
      { word: 'die Autobahn', pos: 'noun', meaning_vi: 'đường cao tốc' },
      { word: 'die Kreuzung', pos: 'noun', meaning_vi: 'ngã tư' },
      { word: 'die Ampel', pos: 'noun', meaning_vi: 'đèn giao thông' },
      { word: 'der Zebrastreifen', pos: 'noun', meaning_vi: 'vạch qua đường' },
      { word: 'der Bürgersteig', pos: 'noun', meaning_vi: 'vỉa hè' },
      { word: 'die Straße', pos: 'noun', meaning_vi: 'đường phố' },
      { word: 'die Gasse', pos: 'noun', meaning_vi: 'hẻm' },
      { word: 'der Platz', pos: 'noun', meaning_vi: 'quảng trường' },
      { word: 'der Brunnen', pos: 'noun', meaning_vi: 'đài phun nước' },
      { word: 'die Statue', pos: 'noun', meaning_vi: 'bức tượng' },
      { word: 'das Denkmal', pos: 'noun', meaning_vi: 'đài tưởng niệm' },
      { word: 'die Tankstelle', pos: 'noun', meaning_vi: 'trạm xăng' },
      { word: 'die Waschanlage', pos: 'noun', meaning_vi: 'trạm rửa xe' },
    ]
  },
  // Communication verbs
  communicationVerbs: {
    topic: 'Dong tu giao tiep',
    level: 'A2',
    words: [
      { word: 'sagen', pos: 'verb', meaning_vi: 'nói' },
      { word: 'fragen', pos: 'verb', meaning_vi: 'hỏi' },
      { word: 'antworten', pos: 'verb', meaning_vi: 'trả lời' },
      { word: 'erzählen', pos: 'verb', meaning_vi: 'kể' },
      { word: 'erklären', pos: 'verb', meaning_vi: 'giải thích' },
      { word: 'beschreiben', pos: 'verb', meaning_vi: 'mô tả' },
      { word: 'diskutieren', pos: 'verb', meaning_vi: 'thảo luận' },
      { word: 'berichten', pos: 'verb', meaning_vi: 'báo cáo' },
      { word: 'vorschlagen', pos: 'verb', meaning_vi: 'đề xuất' },
      { word: 'bitten', pos: 'verb', meaning_vi: 'yêu cầu' },
      { word: 'danken', pos: 'verb', meaning_vi: 'cảm ơn' },
      { word: 'entschuldigen', pos: 'verb', meaning_vi: 'xin lỗi' },
      { word: 'gratulieren', pos: 'verb', meaning_vi: 'chúc mừng' },
      { word: 'loben', pos: 'verb', meaning_vi: 'khen ngợi' },
      { word: 'kritisieren', pos: 'verb', meaning_vi: 'phê bình' },
      { word: 'warnen', pos: 'verb', meaning_vi: 'cảnh báo' },
      { word: 'ermutigen', pos: 'verb', meaning_vi: 'khuyến khích' },
      { word: 'überzeugen', pos: 'verb', meaning_vi: 'thuyết phục' },
      { word: 'flüstern', pos: 'verb', meaning_vi: 'thì thầm' },
      { word: 'schreien', pos: 'verb', meaning_vi: 'la hét' },
    ]
  },
  // Thinking and learning verbs
  thinkingVerbs: {
    topic: 'Dong tu tu duy',
    level: 'B1',
    words: [
      { word: 'denken', pos: 'verb', meaning_vi: 'nghĩ' },
      { word: 'glauben', pos: 'verb', meaning_vi: 'tin' },
      { word: 'wissen', pos: 'verb', meaning_vi: 'biết' },
      { word: 'verstehen', pos: 'verb', meaning_vi: 'hiểu' },
      { word: 'erkennen', pos: 'verb', meaning_vi: 'nhận ra' },
      { word: 'bemerken', pos: 'verb', meaning_vi: 'nhận thấy' },
      { word: 'vermuten', pos: 'verb', meaning_vi: 'phỏng đoán' },
      { word: 'annehmen', pos: 'verb', meaning_vi: 'giả định' },
      { word: 'analysieren', pos: 'verb', meaning_vi: 'phân tích' },
      { word: 'bewerten', pos: 'verb', meaning_vi: 'đánh giá' },
      { word: 'schlussfolgern', pos: 'verb', meaning_vi: 'kết luận' },
      { word: 'zweifeln', pos: 'verb', meaning_vi: 'nghi ngờ' },
      { word: 'überlegen', pos: 'verb', meaning_vi: 'suy nghĩ' },
      { word: 'nachdenken', pos: 'verb', meaning_vi: 'suy ngẫm' },
      { word: 'konzentrieren', pos: 'verb', meaning_vi: 'tập trung' },
      { word: 'memorieren', pos: 'verb', meaning_vi: 'ghi nhớ' },
      { word: 'forschen', pos: 'verb', meaning_vi: 'nghiên cứu' },
      { word: 'entdecken', pos: 'verb', meaning_vi: 'khám phá' },
      { word: 'erfinden', pos: 'verb', meaning_vi: 'phát minh' },
      { word: 'beobachten', pos: 'verb', meaning_vi: 'quan sát' },
    ]
  },
  // Action verbs
  physicalActions: {
    topic: 'Dong tu hanh dong',
    level: 'A2',
    words: [
      { word: 'laufen', pos: 'verb', meaning_vi: 'chạy' },
      { word: 'springen', pos: 'verb', meaning_vi: 'nhảy' },
      { word: 'schwimmen', pos: 'verb', meaning_vi: 'bơi' },
      { word: 'klettern', pos: 'verb', meaning_vi: 'leo trèo' },
      { word: 'werfen', pos: 'verb', meaning_vi: 'ném' },
      { word: 'fangen', pos: 'verb', meaning_vi: 'bắt' },
      { word: 'schlagen', pos: 'verb', meaning_vi: 'đánh' },
      { word: 'treten', pos: 'verb', meaning_vi: 'đá' },
      { word: 'ziehen', pos: 'verb', meaning_vi: 'kéo' },
      { word: 'drücken', pos: 'verb', meaning_vi: 'đẩy' },
      { word: 'heben', pos: 'verb', meaning_vi: 'nâng' },
      { word: 'tragen', pos: 'verb', meaning_vi: 'mang' },
      { word: 'schieben', pos: 'verb', meaning_vi: 'đẩy' },
      { word: 'halten', pos: 'verb', meaning_vi: 'giữ' },
      { word: 'greifen', pos: 'verb', meaning_vi: 'nắm' },
      { word: 'schneiden', pos: 'verb', meaning_vi: 'cắt' },
      { word: 'reißen', pos: 'verb', meaning_vi: 'xé' },
      { word: 'biegen', pos: 'verb', meaning_vi: 'uốn cong' },
      { word: 'strecken', pos: 'verb', meaning_vi: 'duỗi' },
      { word: 'drehen', pos: 'verb', meaning_vi: 'xoay' },
    ]
  },
  // Connectors and function words
  conjunctions: {
    topic: 'Lien tu',
    level: 'A2',
    words: [
      { word: 'und', pos: 'conjunction', meaning_vi: 'và' },
      { word: 'oder', pos: 'conjunction', meaning_vi: 'hoặc' },
      { word: 'aber', pos: 'conjunction', meaning_vi: 'nhưng' },
      { word: 'denn', pos: 'conjunction', meaning_vi: 'vì' },
      { word: 'weil', pos: 'conjunction', meaning_vi: 'bởi vì' },
      { word: 'wenn', pos: 'conjunction', meaning_vi: 'nếu/khi' },
      { word: 'obwohl', pos: 'conjunction', meaning_vi: 'mặc dù' },
      { word: 'dass', pos: 'conjunction', meaning_vi: 'rằng' },
      { word: 'damit', pos: 'conjunction', meaning_vi: 'để mà' },
      { word: 'während', pos: 'conjunction', meaning_vi: 'trong khi' },
      { word: 'bevor', pos: 'conjunction', meaning_vi: 'trước khi' },
      { word: 'nachdem', pos: 'conjunction', meaning_vi: 'sau khi' },
      { word: 'sobald', pos: 'conjunction', meaning_vi: 'ngay khi' },
      { word: 'solange', pos: 'conjunction', meaning_vi: 'miễn là' },
      { word: 'falls', pos: 'conjunction', meaning_vi: 'trong trường hợp' },
      { word: 'sondern', pos: 'conjunction', meaning_vi: 'mà là' },
      { word: 'sowohl...als auch', pos: 'conjunction', meaning_vi: 'cả...lẫn' },
      { word: 'weder...noch', pos: 'conjunction', meaning_vi: 'không...cũng không' },
      { word: 'entweder...oder', pos: 'conjunction', meaning_vi: 'hoặc...hoặc' },
      { word: 'je...desto', pos: 'conjunction', meaning_vi: 'càng...càng' },
    ]
  },
  prepositions: {
    topic: 'Gioi tu',
    level: 'A2',
    words: [
      { word: 'in', pos: 'preposition', meaning_vi: 'trong' },
      { word: 'an', pos: 'preposition', meaning_vi: 'ở, tại' },
      { word: 'auf', pos: 'preposition', meaning_vi: 'trên' },
      { word: 'über', pos: 'preposition', meaning_vi: 'phía trên' },
      { word: 'unter', pos: 'preposition', meaning_vi: 'phía dưới' },
      { word: 'vor', pos: 'preposition', meaning_vi: 'trước' },
      { word: 'hinter', pos: 'preposition', meaning_vi: 'sau' },
      { word: 'neben', pos: 'preposition', meaning_vi: 'bên cạnh' },
      { word: 'zwischen', pos: 'preposition', meaning_vi: 'giữa' },
      { word: 'mit', pos: 'preposition', meaning_vi: 'với' },
      { word: 'ohne', pos: 'preposition', meaning_vi: 'không có' },
      { word: 'für', pos: 'preposition', meaning_vi: 'cho' },
      { word: 'gegen', pos: 'preposition', meaning_vi: 'chống lại' },
      { word: 'durch', pos: 'preposition', meaning_vi: 'qua' },
      { word: 'um', pos: 'preposition', meaning_vi: 'xung quanh' },
      { word: 'bei', pos: 'preposition', meaning_vi: 'ở chỗ' },
      { word: 'nach', pos: 'preposition', meaning_vi: 'đến, sau' },
      { word: 'seit', pos: 'preposition', meaning_vi: 'từ' },
      { word: 'von', pos: 'preposition', meaning_vi: 'của, từ' },
      { word: 'zu', pos: 'preposition', meaning_vi: 'đến' },
    ]
  },
  // Question words
  questionWords: {
    topic: 'Tu de hoi',
    level: 'A1',
    words: [
      { word: 'wer', pos: 'pronoun', meaning_vi: 'ai' },
      { word: 'was', pos: 'pronoun', meaning_vi: 'cái gì' },
      { word: 'wo', pos: 'adverb', meaning_vi: 'ở đâu' },
      { word: 'wann', pos: 'adverb', meaning_vi: 'khi nào' },
      { word: 'warum', pos: 'adverb', meaning_vi: 'tại sao' },
      { word: 'wie', pos: 'adverb', meaning_vi: 'như thế nào' },
      { word: 'welche', pos: 'pronoun', meaning_vi: 'cái nào' },
      { word: 'wessen', pos: 'pronoun', meaning_vi: 'của ai' },
      { word: 'wem', pos: 'pronoun', meaning_vi: 'cho ai' },
      { word: 'wen', pos: 'pronoun', meaning_vi: 'ai (tân ngữ)' },
      { word: 'woher', pos: 'adverb', meaning_vi: 'từ đâu' },
      { word: 'wohin', pos: 'adverb', meaning_vi: 'đi đâu' },
      { word: 'wie viel', pos: 'adverb', meaning_vi: 'bao nhiêu' },
      { word: 'wie lange', pos: 'adverb', meaning_vi: 'bao lâu' },
      { word: 'wie oft', pos: 'adverb', meaning_vi: 'bao nhiêu lần' },
      { word: 'wie weit', pos: 'adverb', meaning_vi: 'bao xa' },
      { word: 'weshalb', pos: 'adverb', meaning_vi: 'vì sao' },
      { word: 'wieso', pos: 'adverb', meaning_vi: 'tại sao' },
      { word: 'womit', pos: 'adverb', meaning_vi: 'bằng cái gì' },
      { word: 'wofür', pos: 'adverb', meaning_vi: 'cho cái gì' },
    ]
  },
  // Pronouns
  pronouns: {
    topic: 'Dai tu',
    level: 'A1',
    words: [
      { word: 'ich', pos: 'pronoun', meaning_vi: 'tôi' },
      { word: 'du', pos: 'pronoun', meaning_vi: 'bạn' },
      { word: 'er', pos: 'pronoun', meaning_vi: 'anh ấy' },
      { word: 'sie', pos: 'pronoun', meaning_vi: 'cô ấy' },
      { word: 'es', pos: 'pronoun', meaning_vi: 'nó' },
      { word: 'wir', pos: 'pronoun', meaning_vi: 'chúng tôi' },
      { word: 'ihr', pos: 'pronoun', meaning_vi: 'các bạn' },
      { word: 'Sie', pos: 'pronoun', meaning_vi: 'Ngài' },
      { word: 'mich', pos: 'pronoun', meaning_vi: 'tôi (tân ngữ)' },
      { word: 'dich', pos: 'pronoun', meaning_vi: 'bạn (tân ngữ)' },
      { word: 'ihn', pos: 'pronoun', meaning_vi: 'anh ấy (tân ngữ)' },
      { word: 'mir', pos: 'pronoun', meaning_vi: 'cho tôi' },
      { word: 'dir', pos: 'pronoun', meaning_vi: 'cho bạn' },
      { word: 'ihm', pos: 'pronoun', meaning_vi: 'cho anh ấy' },
      { word: 'ihr', pos: 'pronoun', meaning_vi: 'cho cô ấy' },
      { word: 'mein', pos: 'pronoun', meaning_vi: 'của tôi' },
      { word: 'dein', pos: 'pronoun', meaning_vi: 'của bạn' },
      { word: 'sein', pos: 'pronoun', meaning_vi: 'của anh ấy' },
      { word: 'unser', pos: 'pronoun', meaning_vi: 'của chúng tôi' },
      { word: 'euer', pos: 'pronoun', meaning_vi: 'của các bạn' },
    ]
  },
  // Common adjectives extended
  adjectivesSize: {
    topic: 'Tinh tu kich thuoc',
    level: 'A1',
    words: [
      { word: 'groß', pos: 'adjective', meaning_vi: 'lớn' },
      { word: 'klein', pos: 'adjective', meaning_vi: 'nhỏ' },
      { word: 'lang', pos: 'adjective', meaning_vi: 'dài' },
      { word: 'kurz', pos: 'adjective', meaning_vi: 'ngắn' },
      { word: 'hoch', pos: 'adjective', meaning_vi: 'cao' },
      { word: 'niedrig', pos: 'adjective', meaning_vi: 'thấp' },
      { word: 'breit', pos: 'adjective', meaning_vi: 'rộng' },
      { word: 'schmal', pos: 'adjective', meaning_vi: 'hẹp' },
      { word: 'dick', pos: 'adjective', meaning_vi: 'dày' },
      { word: 'dünn', pos: 'adjective', meaning_vi: 'mỏng' },
      { word: 'tief', pos: 'adjective', meaning_vi: 'sâu' },
      { word: 'flach', pos: 'adjective', meaning_vi: 'phẳng' },
      { word: 'rund', pos: 'adjective', meaning_vi: 'tròn' },
      { word: 'eckig', pos: 'adjective', meaning_vi: 'vuông' },
      { word: 'schwer', pos: 'adjective', meaning_vi: 'nặng' },
      { word: 'leicht', pos: 'adjective', meaning_vi: 'nhẹ' },
      { word: 'eng', pos: 'adjective', meaning_vi: 'chật' },
      { word: 'weit', pos: 'adjective', meaning_vi: 'rộng' },
      { word: 'riesig', pos: 'adjective', meaning_vi: 'khổng lồ' },
      { word: 'winzig', pos: 'adjective', meaning_vi: 'tí hon' },
    ]
  },
  adjectivesQuality: {
    topic: 'Tinh tu chat luong',
    level: 'A2',
    words: [
      { word: 'gut', pos: 'adjective', meaning_vi: 'tốt' },
      { word: 'schlecht', pos: 'adjective', meaning_vi: 'xấu' },
      { word: 'neu', pos: 'adjective', meaning_vi: 'mới' },
      { word: 'alt', pos: 'adjective', meaning_vi: 'cũ' },
      { word: 'schön', pos: 'adjective', meaning_vi: 'đẹp' },
      { word: 'hässlich', pos: 'adjective', meaning_vi: 'xấu xí' },
      { word: 'sauber', pos: 'adjective', meaning_vi: 'sạch' },
      { word: 'schmutzig', pos: 'adjective', meaning_vi: 'bẩn' },
      { word: 'schnell', pos: 'adjective', meaning_vi: 'nhanh' },
      { word: 'langsam', pos: 'adjective', meaning_vi: 'chậm' },
      { word: 'hart', pos: 'adjective', meaning_vi: 'cứng' },
      { word: 'weich', pos: 'adjective', meaning_vi: 'mềm' },
      { word: 'laut', pos: 'adjective', meaning_vi: 'ồn' },
      { word: 'leise', pos: 'adjective', meaning_vi: 'im lặng' },
      { word: 'hell', pos: 'adjective', meaning_vi: 'sáng' },
      { word: 'dunkel', pos: 'adjective', meaning_vi: 'tối' },
      { word: 'warm', pos: 'adjective', meaning_vi: 'ấm' },
      { word: 'kalt', pos: 'adjective', meaning_vi: 'lạnh' },
      { word: 'nass', pos: 'adjective', meaning_vi: 'ướt' },
      { word: 'trocken', pos: 'adjective', meaning_vi: 'khô' },
    ]
  },
  // Colors
  colors: {
    topic: 'Mau sac',
    level: 'A1',
    words: [
      { word: 'rot', pos: 'adjective', meaning_vi: 'đỏ' },
      { word: 'blau', pos: 'adjective', meaning_vi: 'xanh dương' },
      { word: 'grün', pos: 'adjective', meaning_vi: 'xanh lá' },
      { word: 'gelb', pos: 'adjective', meaning_vi: 'vàng' },
      { word: 'orange', pos: 'adjective', meaning_vi: 'cam' },
      { word: 'lila', pos: 'adjective', meaning_vi: 'tím' },
      { word: 'rosa', pos: 'adjective', meaning_vi: 'hồng' },
      { word: 'braun', pos: 'adjective', meaning_vi: 'nâu' },
      { word: 'schwarz', pos: 'adjective', meaning_vi: 'đen' },
      { word: 'weiß', pos: 'adjective', meaning_vi: 'trắng' },
      { word: 'grau', pos: 'adjective', meaning_vi: 'xám' },
      { word: 'silber', pos: 'adjective', meaning_vi: 'bạc' },
      { word: 'gold', pos: 'adjective', meaning_vi: 'vàng kim' },
      { word: 'beige', pos: 'adjective', meaning_vi: 'be' },
      { word: 'türkis', pos: 'adjective', meaning_vi: 'ngọc lam' },
      { word: 'hellblau', pos: 'adjective', meaning_vi: 'xanh nhạt' },
      { word: 'dunkelblau', pos: 'adjective', meaning_vi: 'xanh đậm' },
      { word: 'hellgrün', pos: 'adjective', meaning_vi: 'xanh lá nhạt' },
      { word: 'dunkelgrün', pos: 'adjective', meaning_vi: 'xanh lá đậm' },
      { word: 'bunt', pos: 'adjective', meaning_vi: 'nhiều màu' },
    ]
  },
  // Common phrases
  greetings: {
    topic: 'Chao hoi',
    level: 'A1',
    words: [
      { word: 'Guten Morgen', pos: 'phrase', meaning_vi: 'Chào buổi sáng' },
      { word: 'Guten Tag', pos: 'phrase', meaning_vi: 'Chào buổi trưa' },
      { word: 'Guten Abend', pos: 'phrase', meaning_vi: 'Chào buổi tối' },
      { word: 'Gute Nacht', pos: 'phrase', meaning_vi: 'Chúc ngủ ngon' },
      { word: 'Hallo', pos: 'phrase', meaning_vi: 'Xin chào' },
      { word: 'Tschüss', pos: 'phrase', meaning_vi: 'Tạm biệt' },
      { word: 'Auf Wiedersehen', pos: 'phrase', meaning_vi: 'Hẹn gặp lại' },
      { word: 'Bis bald', pos: 'phrase', meaning_vi: 'Gặp lại sớm' },
      { word: 'Bis später', pos: 'phrase', meaning_vi: 'Gặp lại sau' },
      { word: 'Danke', pos: 'phrase', meaning_vi: 'Cảm ơn' },
      { word: 'Bitte', pos: 'phrase', meaning_vi: 'Làm ơn / Không có gì' },
      { word: 'Entschuldigung', pos: 'phrase', meaning_vi: 'Xin lỗi' },
      { word: 'Es tut mir leid', pos: 'phrase', meaning_vi: 'Tôi xin lỗi' },
      { word: 'Wie geht es Ihnen?', pos: 'phrase', meaning_vi: 'Bạn khỏe không?' },
      { word: 'Mir geht es gut', pos: 'phrase', meaning_vi: 'Tôi khỏe' },
      { word: 'Freut mich', pos: 'phrase', meaning_vi: 'Rất vui được gặp' },
      { word: 'Herzlich willkommen', pos: 'phrase', meaning_vi: 'Chào mừng' },
      { word: 'Alles Gute', pos: 'phrase', meaning_vi: 'Chúc mọi điều tốt đẹp' },
      { word: 'Viel Erfolg', pos: 'phrase', meaning_vi: 'Chúc thành công' },
      { word: 'Prost', pos: 'phrase', meaning_vi: 'Chúc mừng (khi uống)' },
    ]
  },
  usefulPhrases: {
    topic: 'Cum tu huu ich',
    level: 'A1',
    words: [
      { word: 'Ich verstehe nicht', pos: 'phrase', meaning_vi: 'Tôi không hiểu' },
      { word: 'Können Sie das wiederholen?', pos: 'phrase', meaning_vi: 'Bạn có thể lặp lại không?' },
      { word: 'Sprechen Sie Englisch?', pos: 'phrase', meaning_vi: 'Bạn nói tiếng Anh không?' },
      { word: 'Ich spreche kein Deutsch', pos: 'phrase', meaning_vi: 'Tôi không nói tiếng Đức' },
      { word: 'Wo ist...?', pos: 'phrase', meaning_vi: 'Ở đâu...?' },
      { word: 'Wie viel kostet das?', pos: 'phrase', meaning_vi: 'Cái này giá bao nhiêu?' },
      { word: 'Ich möchte...', pos: 'phrase', meaning_vi: 'Tôi muốn...' },
      { word: 'Haben Sie...?', pos: 'phrase', meaning_vi: 'Bạn có...?' },
      { word: 'Kann ich...?', pos: 'phrase', meaning_vi: 'Tôi có thể...?' },
      { word: 'Ich brauche Hilfe', pos: 'phrase', meaning_vi: 'Tôi cần giúp đỡ' },
      { word: 'Kein Problem', pos: 'phrase', meaning_vi: 'Không vấn đề gì' },
      { word: 'Natürlich', pos: 'phrase', meaning_vi: 'Tất nhiên' },
      { word: 'Einverstanden', pos: 'phrase', meaning_vi: 'Đồng ý' },
      { word: 'Moment bitte', pos: 'phrase', meaning_vi: 'Xin chờ một chút' },
      { word: 'Wie bitte?', pos: 'phrase', meaning_vi: 'Xin lỗi, bạn nói gì?' },
      { word: 'Das macht nichts', pos: 'phrase', meaning_vi: 'Không sao' },
      { word: 'Genau', pos: 'phrase', meaning_vi: 'Chính xác' },
      { word: 'Stimmt', pos: 'phrase', meaning_vi: 'Đúng rồi' },
      { word: 'Schade', pos: 'phrase', meaning_vi: 'Tiếc quá' },
      { word: 'Toll', pos: 'phrase', meaning_vi: 'Tuyệt vời' },
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
const outputPath = path.join(__dirname, '../data/quality-expansion/batch17-vocabulary.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(vocabulary, null, 2));

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║    📚 BATCH 17 VOCABULARY GENERATED                        ║');
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
