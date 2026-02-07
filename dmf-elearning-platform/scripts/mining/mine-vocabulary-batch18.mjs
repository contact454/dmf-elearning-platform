#!/usr/bin/env node
/**
 * Mine Vocabulary Batch 18 - Final push past 10K
 * Target: 600 unique words
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TOPICS = {
  // Music instruments
  musicInstruments: {
    topic: 'Nhac cu',
    level: 'A2',
    words: [
      { word: 'das Klavier', pos: 'noun', meaning_vi: 'đàn piano' },
      { word: 'die Gitarre', pos: 'noun', meaning_vi: 'đàn guitar' },
      { word: 'die Geige', pos: 'noun', meaning_vi: 'đàn violin' },
      { word: 'die Flöte', pos: 'noun', meaning_vi: 'sáo' },
      { word: 'die Trompete', pos: 'noun', meaning_vi: 'kèn trumpet' },
      { word: 'das Schlagzeug', pos: 'noun', meaning_vi: 'trống' },
      { word: 'das Saxophon', pos: 'noun', meaning_vi: 'kèn saxophone' },
      { word: 'die Klarinette', pos: 'noun', meaning_vi: 'kèn clarinet' },
      { word: 'das Cello', pos: 'noun', meaning_vi: 'đàn cello' },
      { word: 'die Harfe', pos: 'noun', meaning_vi: 'đàn hạc' },
      { word: 'das Akkordeon', pos: 'noun', meaning_vi: 'đàn accordion' },
      { word: 'die Orgel', pos: 'noun', meaning_vi: 'đàn organ' },
      { word: 'die Posaune', pos: 'noun', meaning_vi: 'kèn trombone' },
      { word: 'das Horn', pos: 'noun', meaning_vi: 'kèn cor' },
      { word: 'die Trommel', pos: 'noun', meaning_vi: 'trống nhỏ' },
      { word: 'das Keyboard', pos: 'noun', meaning_vi: 'đàn keyboard' },
      { word: 'der Bass', pos: 'noun', meaning_vi: 'đàn bass' },
      { word: 'die Mundharmonika', pos: 'noun', meaning_vi: 'kèn harmonica' },
      { word: 'die Blockflöte', pos: 'noun', meaning_vi: 'sáo recorder' },
      { word: 'das Xylophon', pos: 'noun', meaning_vi: 'đàn xylophone' },
    ]
  },
  // Art supplies
  artSupplies: {
    topic: 'Do ve',
    level: 'A2',
    words: [
      { word: 'der Pinsel', pos: 'noun', meaning_vi: 'cọ vẽ' },
      { word: 'die Farbe', pos: 'noun', meaning_vi: 'màu' },
      { word: 'die Leinwand', pos: 'noun', meaning_vi: 'canvas' },
      { word: 'die Staffelei', pos: 'noun', meaning_vi: 'giá vẽ' },
      { word: 'die Palette', pos: 'noun', meaning_vi: 'bảng pha màu' },
      { word: 'der Bleistift', pos: 'noun', meaning_vi: 'bút chì' },
      { word: 'die Kohle', pos: 'noun', meaning_vi: 'than vẽ' },
      { word: 'die Kreide', pos: 'noun', meaning_vi: 'phấn' },
      { word: 'der Filzstift', pos: 'noun', meaning_vi: 'bút dạ' },
      { word: 'das Aquarell', pos: 'noun', meaning_vi: 'màu nước' },
      { word: 'die Ölfarbe', pos: 'noun', meaning_vi: 'sơn dầu' },
      { word: 'die Acrylfarbe', pos: 'noun', meaning_vi: 'sơn acrylic' },
      { word: 'die Tusche', pos: 'noun', meaning_vi: 'mực Tàu' },
      { word: 'der Rahmen', pos: 'noun', meaning_vi: 'khung tranh' },
      { word: 'die Skizze', pos: 'noun', meaning_vi: 'phác thảo' },
      { word: 'das Porträt', pos: 'noun', meaning_vi: 'chân dung' },
      { word: 'das Stillleben', pos: 'noun', meaning_vi: 'tranh tĩnh vật' },
      { word: 'die Landschaft', pos: 'noun', meaning_vi: 'phong cảnh' },
      { word: 'die Skulptur', pos: 'noun', meaning_vi: 'điêu khắc' },
      { word: 'das Modell', pos: 'noun', meaning_vi: 'người mẫu' },
    ]
  },
  // Countries and capitals
  countriesEurope: {
    topic: 'Quoc gia Chau Au',
    level: 'A1',
    words: [
      { word: 'Deutschland', pos: 'noun', meaning_vi: 'Đức' },
      { word: 'Frankreich', pos: 'noun', meaning_vi: 'Pháp' },
      { word: 'Spanien', pos: 'noun', meaning_vi: 'Tây Ban Nha' },
      { word: 'Italien', pos: 'noun', meaning_vi: 'Ý' },
      { word: 'England', pos: 'noun', meaning_vi: 'Anh' },
      { word: 'Polen', pos: 'noun', meaning_vi: 'Ba Lan' },
      { word: 'Österreich', pos: 'noun', meaning_vi: 'Áo' },
      { word: 'die Schweiz', pos: 'noun', meaning_vi: 'Thụy Sĩ' },
      { word: 'die Niederlande', pos: 'noun', meaning_vi: 'Hà Lan' },
      { word: 'Belgien', pos: 'noun', meaning_vi: 'Bỉ' },
      { word: 'Portugal', pos: 'noun', meaning_vi: 'Bồ Đào Nha' },
      { word: 'Griechenland', pos: 'noun', meaning_vi: 'Hy Lạp' },
      { word: 'Schweden', pos: 'noun', meaning_vi: 'Thụy Điển' },
      { word: 'Norwegen', pos: 'noun', meaning_vi: 'Na Uy' },
      { word: 'Dänemark', pos: 'noun', meaning_vi: 'Đan Mạch' },
      { word: 'Finnland', pos: 'noun', meaning_vi: 'Phần Lan' },
      { word: 'Russland', pos: 'noun', meaning_vi: 'Nga' },
      { word: 'die Türkei', pos: 'noun', meaning_vi: 'Thổ Nhĩ Kỳ' },
      { word: 'die Ukraine', pos: 'noun', meaning_vi: 'Ukraine' },
      { word: 'Tschechien', pos: 'noun', meaning_vi: 'Séc' },
    ]
  },
  countriesWorld: {
    topic: 'Quoc gia the gioi',
    level: 'A2',
    words: [
      { word: 'die USA', pos: 'noun', meaning_vi: 'Mỹ' },
      { word: 'Kanada', pos: 'noun', meaning_vi: 'Canada' },
      { word: 'Mexiko', pos: 'noun', meaning_vi: 'Mexico' },
      { word: 'Brasilien', pos: 'noun', meaning_vi: 'Brazil' },
      { word: 'Argentinien', pos: 'noun', meaning_vi: 'Argentina' },
      { word: 'China', pos: 'noun', meaning_vi: 'Trung Quốc' },
      { word: 'Japan', pos: 'noun', meaning_vi: 'Nhật Bản' },
      { word: 'Südkorea', pos: 'noun', meaning_vi: 'Hàn Quốc' },
      { word: 'Vietnam', pos: 'noun', meaning_vi: 'Việt Nam' },
      { word: 'Thailand', pos: 'noun', meaning_vi: 'Thái Lan' },
      { word: 'Indien', pos: 'noun', meaning_vi: 'Ấn Độ' },
      { word: 'Australien', pos: 'noun', meaning_vi: 'Úc' },
      { word: 'Neuseeland', pos: 'noun', meaning_vi: 'New Zealand' },
      { word: 'Ägypten', pos: 'noun', meaning_vi: 'Ai Cập' },
      { word: 'Südafrika', pos: 'noun', meaning_vi: 'Nam Phi' },
      { word: 'Marokko', pos: 'noun', meaning_vi: 'Morocco' },
      { word: 'Israel', pos: 'noun', meaning_vi: 'Israel' },
      { word: 'Saudi-Arabien', pos: 'noun', meaning_vi: 'Saudi Arabia' },
      { word: 'Indonesien', pos: 'noun', meaning_vi: 'Indonesia' },
      { word: 'die Philippinen', pos: 'noun', meaning_vi: 'Philippines' },
    ]
  },
  // Languages
  languages: {
    topic: 'Ngon ngu',
    level: 'A1',
    words: [
      { word: 'Deutsch', pos: 'noun', meaning_vi: 'tiếng Đức' },
      { word: 'Englisch', pos: 'noun', meaning_vi: 'tiếng Anh' },
      { word: 'Französisch', pos: 'noun', meaning_vi: 'tiếng Pháp' },
      { word: 'Spanisch', pos: 'noun', meaning_vi: 'tiếng Tây Ban Nha' },
      { word: 'Italienisch', pos: 'noun', meaning_vi: 'tiếng Ý' },
      { word: 'Chinesisch', pos: 'noun', meaning_vi: 'tiếng Trung' },
      { word: 'Japanisch', pos: 'noun', meaning_vi: 'tiếng Nhật' },
      { word: 'Koreanisch', pos: 'noun', meaning_vi: 'tiếng Hàn' },
      { word: 'Russisch', pos: 'noun', meaning_vi: 'tiếng Nga' },
      { word: 'Arabisch', pos: 'noun', meaning_vi: 'tiếng Ả Rập' },
      { word: 'Portugiesisch', pos: 'noun', meaning_vi: 'tiếng Bồ Đào Nha' },
      { word: 'Polnisch', pos: 'noun', meaning_vi: 'tiếng Ba Lan' },
      { word: 'Türkisch', pos: 'noun', meaning_vi: 'tiếng Thổ Nhĩ Kỳ' },
      { word: 'Griechisch', pos: 'noun', meaning_vi: 'tiếng Hy Lạp' },
      { word: 'Niederländisch', pos: 'noun', meaning_vi: 'tiếng Hà Lan' },
      { word: 'Schwedisch', pos: 'noun', meaning_vi: 'tiếng Thụy Điển' },
      { word: 'Vietnamesisch', pos: 'noun', meaning_vi: 'tiếng Việt' },
      { word: 'Hindi', pos: 'noun', meaning_vi: 'tiếng Hindi' },
      { word: 'Indonesisch', pos: 'noun', meaning_vi: 'tiếng Indonesia' },
      { word: 'Thailändisch', pos: 'noun', meaning_vi: 'tiếng Thái' },
    ]
  },
  // Seasons and months
  seasons: {
    topic: 'Mua',
    level: 'A1',
    words: [
      { word: 'der Frühling', pos: 'noun', meaning_vi: 'mùa xuân' },
      { word: 'der Sommer', pos: 'noun', meaning_vi: 'mùa hè' },
      { word: 'der Herbst', pos: 'noun', meaning_vi: 'mùa thu' },
      { word: 'der Winter', pos: 'noun', meaning_vi: 'mùa đông' },
      { word: 'die Jahreszeit', pos: 'noun', meaning_vi: 'mùa' },
      { word: 'die Woche', pos: 'noun', meaning_vi: 'tuần' },
      { word: 'der Monat', pos: 'noun', meaning_vi: 'tháng' },
      { word: 'die Stunde', pos: 'noun', meaning_vi: 'giờ' },
      { word: 'die Minute', pos: 'noun', meaning_vi: 'phút' },
      { word: 'die Sekunde', pos: 'noun', meaning_vi: 'giây' },
      { word: 'der Vormittag', pos: 'noun', meaning_vi: 'buổi sáng' },
      { word: 'der Nachmittag', pos: 'noun', meaning_vi: 'buổi chiều' },
      { word: 'der Mittag', pos: 'noun', meaning_vi: 'buổi trưa' },
      { word: 'die Mitternacht', pos: 'noun', meaning_vi: 'nửa đêm' },
      { word: 'die Dämmerung', pos: 'noun', meaning_vi: 'hoàng hôn' },
      { word: 'der Morgen', pos: 'noun', meaning_vi: 'buổi sáng' },
      { word: 'der Abend', pos: 'noun', meaning_vi: 'buổi tối' },
      { word: 'die Nacht', pos: 'noun', meaning_vi: 'ban đêm' },
      { word: 'der Tag', pos: 'noun', meaning_vi: 'ngày' },
      { word: 'das Datum', pos: 'noun', meaning_vi: 'ngày tháng' },
    ]
  },
  // Materials
  materials: {
    topic: 'Vat lieu',
    level: 'B1',
    words: [
      { word: 'das Holz', pos: 'noun', meaning_vi: 'gỗ' },
      { word: 'das Metall', pos: 'noun', meaning_vi: 'kim loại' },
      { word: 'das Eisen', pos: 'noun', meaning_vi: 'sắt' },
      { word: 'der Stahl', pos: 'noun', meaning_vi: 'thép' },
      { word: 'das Aluminium', pos: 'noun', meaning_vi: 'nhôm' },
      { word: 'das Kupfer', pos: 'noun', meaning_vi: 'đồng' },
      { word: 'das Gold', pos: 'noun', meaning_vi: 'vàng' },
      { word: 'das Silber', pos: 'noun', meaning_vi: 'bạc' },
      { word: 'das Glas', pos: 'noun', meaning_vi: 'thủy tinh' },
      { word: 'der Kunststoff', pos: 'noun', meaning_vi: 'nhựa' },
      { word: 'das Plastik', pos: 'noun', meaning_vi: 'nhựa' },
      { word: 'das Gummi', pos: 'noun', meaning_vi: 'cao su' },
      { word: 'das Leder', pos: 'noun', meaning_vi: 'da' },
      { word: 'die Baumwolle', pos: 'noun', meaning_vi: 'bông' },
      { word: 'die Wolle', pos: 'noun', meaning_vi: 'len' },
      { word: 'die Seide', pos: 'noun', meaning_vi: 'lụa' },
      { word: 'der Beton', pos: 'noun', meaning_vi: 'bê tông' },
      { word: 'der Ziegel', pos: 'noun', meaning_vi: 'gạch' },
      { word: 'der Stein', pos: 'noun', meaning_vi: 'đá' },
      { word: 'das Papier', pos: 'noun', meaning_vi: 'giấy' },
    ]
  },
  // Shapes
  shapes: {
    topic: 'Hinh dang',
    level: 'A2',
    words: [
      { word: 'der Kreis', pos: 'noun', meaning_vi: 'hình tròn' },
      { word: 'das Quadrat', pos: 'noun', meaning_vi: 'hình vuông' },
      { word: 'das Rechteck', pos: 'noun', meaning_vi: 'hình chữ nhật' },
      { word: 'das Dreieck', pos: 'noun', meaning_vi: 'hình tam giác' },
      { word: 'das Oval', pos: 'noun', meaning_vi: 'hình bầu dục' },
      { word: 'der Stern', pos: 'noun', meaning_vi: 'hình sao' },
      { word: 'das Herz', pos: 'noun', meaning_vi: 'hình trái tim' },
      { word: 'die Linie', pos: 'noun', meaning_vi: 'đường thẳng' },
      { word: 'der Punkt', pos: 'noun', meaning_vi: 'điểm' },
      { word: 'die Kurve', pos: 'noun', meaning_vi: 'đường cong' },
      { word: 'der Winkel', pos: 'noun', meaning_vi: 'góc' },
      { word: 'die Kugel', pos: 'noun', meaning_vi: 'hình cầu' },
      { word: 'der Würfel', pos: 'noun', meaning_vi: 'hình lập phương' },
      { word: 'der Zylinder', pos: 'noun', meaning_vi: 'hình trụ' },
      { word: 'der Kegel', pos: 'noun', meaning_vi: 'hình nón' },
      { word: 'die Pyramide', pos: 'noun', meaning_vi: 'hình chóp' },
      { word: 'die Spirale', pos: 'noun', meaning_vi: 'hình xoắn ốc' },
      { word: 'das Sechseck', pos: 'noun', meaning_vi: 'hình lục giác' },
      { word: 'das Fünfeck', pos: 'noun', meaning_vi: 'hình ngũ giác' },
      { word: 'der Rhombus', pos: 'noun', meaning_vi: 'hình thoi' },
    ]
  },
  // Containers
  containers: {
    topic: 'Vat chua',
    level: 'A2',
    words: [
      { word: 'die Flasche', pos: 'noun', meaning_vi: 'chai' },
      { word: 'die Dose', pos: 'noun', meaning_vi: 'lon' },
      { word: 'die Schachtel', pos: 'noun', meaning_vi: 'hộp' },
      { word: 'der Karton', pos: 'noun', meaning_vi: 'thùng carton' },
      { word: 'die Tüte', pos: 'noun', meaning_vi: 'túi giấy' },
      { word: 'der Beutel', pos: 'noun', meaning_vi: 'túi' },
      { word: 'der Korb', pos: 'noun', meaning_vi: 'giỏ' },
      { word: 'der Eimer', pos: 'noun', meaning_vi: 'xô' },
      { word: 'der Topf', pos: 'noun', meaning_vi: 'nồi' },
      { word: 'der Behälter', pos: 'noun', meaning_vi: 'thùng chứa' },
      { word: 'der Tank', pos: 'noun', meaning_vi: 'bể chứa' },
      { word: 'das Glas', pos: 'noun', meaning_vi: 'lọ thủy tinh' },
      { word: 'die Kanne', pos: 'noun', meaning_vi: 'bình' },
      { word: 'der Krug', pos: 'noun', meaning_vi: 'bình lớn' },
      { word: 'die Tube', pos: 'noun', meaning_vi: 'tuýp' },
      { word: 'der Sack', pos: 'noun', meaning_vi: 'bao tải' },
      { word: 'die Kiste', pos: 'noun', meaning_vi: 'thùng gỗ' },
      { word: 'der Koffer', pos: 'noun', meaning_vi: 'vali' },
      { word: 'die Tasche', pos: 'noun', meaning_vi: 'túi xách' },
      { word: 'der Rucksack', pos: 'noun', meaning_vi: 'ba lô' },
    ]
  },
  // More adjectives
  adjectivesTemperature: {
    topic: 'Tinh tu nhiet do',
    level: 'A1',
    words: [
      { word: 'heiß', pos: 'adjective', meaning_vi: 'nóng' },
      { word: 'warm', pos: 'adjective', meaning_vi: 'ấm' },
      { word: 'kühl', pos: 'adjective', meaning_vi: 'mát' },
      { word: 'kalt', pos: 'adjective', meaning_vi: 'lạnh' },
      { word: 'eisig', pos: 'adjective', meaning_vi: 'băng giá' },
      { word: 'lauwarm', pos: 'adjective', meaning_vi: 'ấm ấm' },
      { word: 'frisch', pos: 'adjective', meaning_vi: 'tươi mát' },
      { word: 'mild', pos: 'adjective', meaning_vi: 'ôn hòa' },
      { word: 'schwül', pos: 'adjective', meaning_vi: 'oi bức' },
      { word: 'feucht', pos: 'adjective', meaning_vi: 'ẩm ướt' },
      { word: 'trocken', pos: 'adjective', meaning_vi: 'khô' },
      { word: 'nass', pos: 'adjective', meaning_vi: 'ướt' },
      { word: 'regnerisch', pos: 'adjective', meaning_vi: 'mưa' },
      { word: 'sonnig', pos: 'adjective', meaning_vi: 'nắng' },
      { word: 'windig', pos: 'adjective', meaning_vi: 'có gió' },
      { word: 'stürmisch', pos: 'adjective', meaning_vi: 'bão' },
      { word: 'neblig', pos: 'adjective', meaning_vi: 'sương mù' },
      { word: 'bewölkt', pos: 'adjective', meaning_vi: 'nhiều mây' },
      { word: 'heiter', pos: 'adjective', meaning_vi: 'quang đãng' },
      { word: 'wolkenlos', pos: 'adjective', meaning_vi: 'không mây' },
    ]
  },
  adjectivesTaste: {
    topic: 'Tinh tu vi giac',
    level: 'A2',
    words: [
      { word: 'süß', pos: 'adjective', meaning_vi: 'ngọt' },
      { word: 'sauer', pos: 'adjective', meaning_vi: 'chua' },
      { word: 'salzig', pos: 'adjective', meaning_vi: 'mặn' },
      { word: 'bitter', pos: 'adjective', meaning_vi: 'đắng' },
      { word: 'scharf', pos: 'adjective', meaning_vi: 'cay' },
      { word: 'mild', pos: 'adjective', meaning_vi: 'nhạt' },
      { word: 'würzig', pos: 'adjective', meaning_vi: 'đậm đà' },
      { word: 'lecker', pos: 'adjective', meaning_vi: 'ngon' },
      { word: 'köstlich', pos: 'adjective', meaning_vi: 'thơm ngon' },
      { word: 'ekelhaft', pos: 'adjective', meaning_vi: 'kinh tởm' },
      { word: 'fade', pos: 'adjective', meaning_vi: 'nhạt nhẽo' },
      { word: 'cremig', pos: 'adjective', meaning_vi: 'béo ngậy' },
      { word: 'knusprig', pos: 'adjective', meaning_vi: 'giòn' },
      { word: 'zart', pos: 'adjective', meaning_vi: 'mềm' },
      { word: 'roh', pos: 'adjective', meaning_vi: 'sống' },
      { word: 'gekocht', pos: 'adjective', meaning_vi: 'nấu chín' },
      { word: 'gebraten', pos: 'adjective', meaning_vi: 'chiên' },
      { word: 'gegrillt', pos: 'adjective', meaning_vi: 'nướng' },
      { word: 'gebacken', pos: 'adjective', meaning_vi: 'nướng lò' },
      { word: 'gedämpft', pos: 'adjective', meaning_vi: 'hấp' },
    ]
  },
  // Action verbs extended
  movementVerbs: {
    topic: 'Dong tu di chuyen',
    level: 'A2',
    words: [
      { word: 'rennen', pos: 'verb', meaning_vi: 'chạy' },
      { word: 'gehen', pos: 'verb', meaning_vi: 'đi' },
      { word: 'laufen', pos: 'verb', meaning_vi: 'chạy bộ' },
      { word: 'spazieren', pos: 'verb', meaning_vi: 'đi dạo' },
      { word: 'wandern', pos: 'verb', meaning_vi: 'đi bộ đường dài' },
      { word: 'klettern', pos: 'verb', meaning_vi: 'leo trèo' },
      { word: 'steigen', pos: 'verb', meaning_vi: 'leo lên' },
      { word: 'fallen', pos: 'verb', meaning_vi: 'ngã' },
      { word: 'rutschen', pos: 'verb', meaning_vi: 'trượt' },
      { word: 'springen', pos: 'verb', meaning_vi: 'nhảy' },
      { word: 'hüpfen', pos: 'verb', meaning_vi: 'nhảy lò cò' },
      { word: 'tanzen', pos: 'verb', meaning_vi: 'nhảy múa' },
      { word: 'schleichen', pos: 'verb', meaning_vi: 'lẻn' },
      { word: 'stolpern', pos: 'verb', meaning_vi: 'vấp' },
      { word: 'kriechen', pos: 'verb', meaning_vi: 'bò' },
      { word: 'rollen', pos: 'verb', meaning_vi: 'lăn' },
      { word: 'gleiten', pos: 'verb', meaning_vi: 'trượt nhẹ' },
      { word: 'fliegen', pos: 'verb', meaning_vi: 'bay' },
      { word: 'schweben', pos: 'verb', meaning_vi: 'lơ lửng' },
      { word: 'tauchen', pos: 'verb', meaning_vi: 'lặn' },
    ]
  },
  dailyRoutineVerbs: {
    topic: 'Dong tu sinh hoat',
    level: 'A1',
    words: [
      { word: 'aufwachen', pos: 'verb', meaning_vi: 'thức dậy' },
      { word: 'aufstehen', pos: 'verb', meaning_vi: 'dậy' },
      { word: 'duschen', pos: 'verb', meaning_vi: 'tắm' },
      { word: 'frühstücken', pos: 'verb', meaning_vi: 'ăn sáng' },
      { word: 'arbeiten', pos: 'verb', meaning_vi: 'làm việc' },
      { word: 'mittagessen', pos: 'verb', meaning_vi: 'ăn trưa' },
      { word: 'abendessen', pos: 'verb', meaning_vi: 'ăn tối' },
      { word: 'fernsehen', pos: 'verb', meaning_vi: 'xem TV' },
      { word: 'entspannen', pos: 'verb', meaning_vi: 'thư giãn' },
      { word: 'schlafen', pos: 'verb', meaning_vi: 'ngủ' },
      { word: 'träumen', pos: 'verb', meaning_vi: 'mơ' },
      { word: 'waschen', pos: 'verb', meaning_vi: 'giặt' },
      { word: 'putzen', pos: 'verb', meaning_vi: 'lau dọn' },
      { word: 'kochen', pos: 'verb', meaning_vi: 'nấu' },
      { word: 'einkaufen', pos: 'verb', meaning_vi: 'mua sắm' },
      { word: 'joggen', pos: 'verb', meaning_vi: 'chạy bộ' },
      { word: 'telefonieren', pos: 'verb', meaning_vi: 'gọi điện' },
      { word: 'lesen', pos: 'verb', meaning_vi: 'đọc' },
      { word: 'lernen', pos: 'verb', meaning_vi: 'học' },
      { word: 'üben', pos: 'verb', meaning_vi: 'luyện tập' },
    ]
  },
  // Common expressions
  politeExpressions: {
    topic: 'Cau lich su',
    level: 'A1',
    words: [
      { word: 'Bitte schön', pos: 'phrase', meaning_vi: 'Mời bạn' },
      { word: 'Danke schön', pos: 'phrase', meaning_vi: 'Cảm ơn nhiều' },
      { word: 'Vielen Dank', pos: 'phrase', meaning_vi: 'Cảm ơn rất nhiều' },
      { word: 'Gern geschehen', pos: 'phrase', meaning_vi: 'Không có gì' },
      { word: 'Entschuldigen Sie', pos: 'phrase', meaning_vi: 'Xin lỗi (trang trọng)' },
      { word: 'Es tut mir leid', pos: 'phrase', meaning_vi: 'Tôi rất tiếc' },
      { word: 'Kein Problem', pos: 'phrase', meaning_vi: 'Không sao' },
      { word: 'Macht nichts', pos: 'phrase', meaning_vi: 'Không sao đâu' },
      { word: 'Herzlichen Glückwunsch', pos: 'phrase', meaning_vi: 'Chúc mừng' },
      { word: 'Alles Gute zum Geburtstag', pos: 'phrase', meaning_vi: 'Chúc mừng sinh nhật' },
      { word: 'Frohe Weihnachten', pos: 'phrase', meaning_vi: 'Giáng sinh vui vẻ' },
      { word: 'Frohes neues Jahr', pos: 'phrase', meaning_vi: 'Năm mới vui vẻ' },
      { word: 'Gute Besserung', pos: 'phrase', meaning_vi: 'Chúc mau khỏe' },
      { word: 'Viel Glück', pos: 'phrase', meaning_vi: 'Chúc may mắn' },
      { word: 'Viel Spaß', pos: 'phrase', meaning_vi: 'Chúc vui vẻ' },
      { word: 'Guten Appetit', pos: 'phrase', meaning_vi: 'Chúc ngon miệng' },
      { word: 'Gesundheit', pos: 'phrase', meaning_vi: 'Sức khỏe (khi ai đó hắt hơi)' },
      { word: 'Schönen Tag noch', pos: 'phrase', meaning_vi: 'Chúc một ngày tốt lành' },
      { word: 'Schönes Wochenende', pos: 'phrase', meaning_vi: 'Cuối tuần vui vẻ' },
      { word: 'Auf Ihr Wohl', pos: 'phrase', meaning_vi: 'Chúc sức khỏe (khi uống)' },
    ]
  },
  emergencyPhrases: {
    topic: 'Cau khan cap',
    level: 'A2',
    words: [
      { word: 'Hilfe!', pos: 'phrase', meaning_vi: 'Cứu với!' },
      { word: 'Rufen Sie die Polizei!', pos: 'phrase', meaning_vi: 'Gọi cảnh sát!' },
      { word: 'Rufen Sie einen Krankenwagen!', pos: 'phrase', meaning_vi: 'Gọi xe cấp cứu!' },
      { word: 'Feuer!', pos: 'phrase', meaning_vi: 'Cháy!' },
      { word: 'Ich brauche einen Arzt', pos: 'phrase', meaning_vi: 'Tôi cần bác sĩ' },
      { word: 'Ich habe mich verletzt', pos: 'phrase', meaning_vi: 'Tôi bị thương' },
      { word: 'Ich habe mich verirrt', pos: 'phrase', meaning_vi: 'Tôi bị lạc' },
      { word: 'Ich wurde bestohlen', pos: 'phrase', meaning_vi: 'Tôi bị trộm' },
      { word: 'Wo ist das Krankenhaus?', pos: 'phrase', meaning_vi: 'Bệnh viện ở đâu?' },
      { word: 'Ich bin allergisch gegen...', pos: 'phrase', meaning_vi: 'Tôi bị dị ứng với...' },
      { word: 'Ich fühle mich nicht wohl', pos: 'phrase', meaning_vi: 'Tôi không khỏe' },
      { word: 'Mein Pass wurde gestohlen', pos: 'phrase', meaning_vi: 'Hộ chiếu tôi bị mất' },
      { word: 'Ich spreche kein Deutsch', pos: 'phrase', meaning_vi: 'Tôi không nói tiếng Đức' },
      { word: 'Können Sie mir helfen?', pos: 'phrase', meaning_vi: 'Bạn có thể giúp tôi không?' },
      { word: 'Wo ist die Botschaft?', pos: 'phrase', meaning_vi: 'Đại sứ quán ở đâu?' },
      { word: 'Ich habe mein Gepäck verloren', pos: 'phrase', meaning_vi: 'Tôi bị mất hành lý' },
      { word: 'Ist es gefährlich?', pos: 'phrase', meaning_vi: 'Có nguy hiểm không?' },
      { word: 'Bleiben Sie ruhig', pos: 'phrase', meaning_vi: 'Hãy bình tĩnh' },
      { word: 'Gehen Sie zum Ausgang', pos: 'phrase', meaning_vi: 'Đi ra lối thoát' },
      { word: 'Warten Sie hier', pos: 'phrase', meaning_vi: 'Đợi ở đây' },
    ]
  },
  // Office vocabulary
  officeTerms: {
    topic: 'Van phong',
    level: 'B1',
    words: [
      { word: 'die Besprechung', pos: 'noun', meaning_vi: 'cuộc họp' },
      { word: 'die Konferenz', pos: 'noun', meaning_vi: 'hội nghị' },
      { word: 'die Präsentation', pos: 'noun', meaning_vi: 'bài thuyết trình' },
      { word: 'der Bericht', pos: 'noun', meaning_vi: 'báo cáo' },
      { word: 'das Protokoll', pos: 'noun', meaning_vi: 'biên bản' },
      { word: 'der Termin', pos: 'noun', meaning_vi: 'cuộc hẹn' },
      { word: 'die Frist', pos: 'noun', meaning_vi: 'hạn chót' },
      { word: 'die Überstunden', pos: 'noun', meaning_vi: 'làm thêm giờ' },
      { word: 'der Urlaub', pos: 'noun', meaning_vi: 'kỳ nghỉ' },
      { word: 'die Pause', pos: 'noun', meaning_vi: 'giờ nghỉ' },
      { word: 'das Gehalt', pos: 'noun', meaning_vi: 'lương' },
      { word: 'die Beförderung', pos: 'noun', meaning_vi: 'thăng chức' },
      { word: 'die Kündigung', pos: 'noun', meaning_vi: 'sa thải' },
      { word: 'der Lebenslauf', pos: 'noun', meaning_vi: 'CV' },
      { word: 'das Vorstellungsgespräch', pos: 'noun', meaning_vi: 'phỏng vấn' },
      { word: 'der Arbeitsvertrag', pos: 'noun', meaning_vi: 'hợp đồng lao động' },
      { word: 'die Arbeitszeit', pos: 'noun', meaning_vi: 'giờ làm việc' },
      { word: 'die Geschäftsreise', pos: 'noun', meaning_vi: 'chuyến công tác' },
      { word: 'die Deadline', pos: 'noun', meaning_vi: 'deadline' },
      { word: 'der Kollege', pos: 'noun', meaning_vi: 'đồng nghiệp' },
    ]
  },
  // Nature elements
  naturePlants: {
    topic: 'Thuc vat',
    level: 'A2',
    words: [
      { word: 'der Baum', pos: 'noun', meaning_vi: 'cây' },
      { word: 'die Blume', pos: 'noun', meaning_vi: 'hoa' },
      { word: 'das Gras', pos: 'noun', meaning_vi: 'cỏ' },
      { word: 'der Busch', pos: 'noun', meaning_vi: 'bụi cây' },
      { word: 'das Blatt', pos: 'noun', meaning_vi: 'lá' },
      { word: 'die Wurzel', pos: 'noun', meaning_vi: 'rễ' },
      { word: 'der Stamm', pos: 'noun', meaning_vi: 'thân cây' },
      { word: 'der Ast', pos: 'noun', meaning_vi: 'cành' },
      { word: 'die Knospe', pos: 'noun', meaning_vi: 'nụ' },
      { word: 'die Blüte', pos: 'noun', meaning_vi: 'hoa nở' },
      { word: 'die Frucht', pos: 'noun', meaning_vi: 'quả' },
      { word: 'der Samen', pos: 'noun', meaning_vi: 'hạt' },
      { word: 'die Rose', pos: 'noun', meaning_vi: 'hoa hồng' },
      { word: 'die Tulpe', pos: 'noun', meaning_vi: 'hoa tulip' },
      { word: 'die Sonnenblume', pos: 'noun', meaning_vi: 'hoa hướng dương' },
      { word: 'die Orchidee', pos: 'noun', meaning_vi: 'hoa lan' },
      { word: 'die Eiche', pos: 'noun', meaning_vi: 'cây sồi' },
      { word: 'die Tanne', pos: 'noun', meaning_vi: 'cây thông' },
      { word: 'die Birke', pos: 'noun', meaning_vi: 'cây bạch dương' },
      { word: 'der Pilz', pos: 'noun', meaning_vi: 'nấm' },
    ]
  },
  insects: {
    topic: 'Con trung',
    level: 'A2',
    words: [
      { word: 'die Biene', pos: 'noun', meaning_vi: 'ong' },
      { word: 'die Wespe', pos: 'noun', meaning_vi: 'ong vò vẽ' },
      { word: 'die Ameise', pos: 'noun', meaning_vi: 'kiến' },
      { word: 'die Fliege', pos: 'noun', meaning_vi: 'ruồi' },
      { word: 'die Mücke', pos: 'noun', meaning_vi: 'muỗi' },
      { word: 'der Schmetterling', pos: 'noun', meaning_vi: 'bướm' },
      { word: 'die Libelle', pos: 'noun', meaning_vi: 'chuồn chuồn' },
      { word: 'der Käfer', pos: 'noun', meaning_vi: 'bọ' },
      { word: 'die Spinne', pos: 'noun', meaning_vi: 'nhện' },
      { word: 'die Raupe', pos: 'noun', meaning_vi: 'sâu bướm' },
      { word: 'der Marienkäfer', pos: 'noun', meaning_vi: 'bọ rùa' },
      { word: 'die Grille', pos: 'noun', meaning_vi: 'dế' },
      { word: 'die Heuschrecke', pos: 'noun', meaning_vi: 'châu chấu' },
      { word: 'die Schnecke', pos: 'noun', meaning_vi: 'ốc sên' },
      { word: 'der Regenwurm', pos: 'noun', meaning_vi: 'giun đất' },
      { word: 'die Kakerlake', pos: 'noun', meaning_vi: 'gián' },
      { word: 'die Motte', pos: 'noun', meaning_vi: 'bướm đêm' },
      { word: 'der Floh', pos: 'noun', meaning_vi: 'bọ chét' },
      { word: 'die Laus', pos: 'noun', meaning_vi: 'chấy' },
      { word: 'die Zecke', pos: 'noun', meaning_vi: 've' },
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
const outputPath = path.join(__dirname, '../data/quality-expansion/batch18-vocabulary.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(vocabulary, null, 2));

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║    📚 BATCH 18 VOCABULARY GENERATED                        ║');
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
