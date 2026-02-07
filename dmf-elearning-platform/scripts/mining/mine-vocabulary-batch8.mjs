#!/usr/bin/env node
/**
 * Mine Vocabulary Batch 8 - Essential Words (400 words)
 * Topics: Health/Illness, Pharmacy, Emergency, School, University,
 * Workplace, Tools, Materials, Seasons, Holidays, Family Extended
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT = path.join(__dirname, '../data/quality-expansion/batch8-vocabulary.json');

const TOPICS = {
  // Health & Medical
  healthIllness: {
    topic: 'Y te',
    level: 'A2',
    words: [
      { word: 'die Erkältung', pos: 'noun', meaning_vi: 'cảm lạnh' },
      { word: 'das Fieber', pos: 'noun', meaning_vi: 'sốt' },
      { word: 'der Husten', pos: 'noun', meaning_vi: 'ho' },
      { word: 'der Schnupfen', pos: 'noun', meaning_vi: 'sổ mũi' },
      { word: 'die Grippe', pos: 'noun', meaning_vi: 'cúm' },
      { word: 'der Durchfall', pos: 'noun', meaning_vi: 'tiêu chảy' },
      { word: 'die Verstopfung', pos: 'noun', meaning_vi: 'táo bón' },
      { word: 'der Ausschlag', pos: 'noun', meaning_vi: 'phát ban' },
      { word: 'die Allergie', pos: 'noun', meaning_vi: 'dị ứng' },
      { word: 'die Entzündung', pos: 'noun', meaning_vi: 'viêm' },
      { word: 'die Infektion', pos: 'noun', meaning_vi: 'nhiễm trùng' },
      { word: 'die Verletzung', pos: 'noun', meaning_vi: 'chấn thương' },
      { word: 'der Bruch', pos: 'noun', meaning_vi: 'gãy xương' },
      { word: 'die Wunde', pos: 'noun', meaning_vi: 'vết thương' },
      { word: 'der Verband', pos: 'noun', meaning_vi: 'băng bó' },
      { word: 'die Spritze', pos: 'noun', meaning_vi: 'ống tiêm' },
      { word: 'die Impfung', pos: 'noun', meaning_vi: 'tiêm chủng' },
      { word: 'das Rezept', pos: 'noun', meaning_vi: 'đơn thuốc' },
      { word: 'die Behandlung', pos: 'noun', meaning_vi: 'điều trị' },
      { word: 'die Untersuchung', pos: 'noun', meaning_vi: 'khám' },
    ]
  },

  pharmacy: {
    topic: 'Nha thuoc',
    level: 'A2',
    words: [
      { word: 'die Apotheke', pos: 'noun', meaning_vi: 'nhà thuốc' },
      { word: 'das Medikament', pos: 'noun', meaning_vi: 'thuốc' },
      { word: 'die Tablette', pos: 'noun', meaning_vi: 'viên thuốc' },
      { word: 'die Kapsel', pos: 'noun', meaning_vi: 'viên nang' },
      { word: 'der Sirup', pos: 'noun', meaning_vi: 'xi-rô' },
      { word: 'die Salbe', pos: 'noun', meaning_vi: 'thuốc mỡ' },
      { word: 'die Tropfen', pos: 'noun', meaning_vi: 'thuốc nhỏ' },
      { word: 'das Pflaster', pos: 'noun', meaning_vi: 'băng cá nhân' },
      { word: 'die Mullbinde', pos: 'noun', meaning_vi: 'băng gạc' },
      { word: 'das Thermometer', pos: 'noun', meaning_vi: 'nhiệt kế' },
      { word: 'das Schmerzmittel', pos: 'noun', meaning_vi: 'thuốc giảm đau' },
      { word: 'das Antibiotikum', pos: 'noun', meaning_vi: 'kháng sinh' },
      { word: 'die Nebenwirkung', pos: 'noun', meaning_vi: 'tác dụng phụ' },
      { word: 'die Dosierung', pos: 'noun', meaning_vi: 'liều lượng' },
      { word: 'verschreibungspflichtig', pos: 'adj', meaning_vi: 'cần đơn thuốc' },
    ]
  },

  emergency: {
    topic: 'Khan cap',
    level: 'B1',
    words: [
      { word: 'der Notfall', pos: 'noun', meaning_vi: 'trường hợp khẩn cấp' },
      { word: 'der Krankenwagen', pos: 'noun', meaning_vi: 'xe cứu thương' },
      { word: 'die Feuerwehr', pos: 'noun', meaning_vi: 'lính cứu hỏa' },
      { word: 'die Notaufnahme', pos: 'noun', meaning_vi: 'phòng cấp cứu' },
      { word: 'der Rettungsdienst', pos: 'noun', meaning_vi: 'dịch vụ cứu hộ' },
      { word: 'die Erste Hilfe', pos: 'noun', meaning_vi: 'sơ cứu' },
      { word: 'der Defibrillator', pos: 'noun', meaning_vi: 'máy khử rung tim' },
      { word: 'die Wiederbelebung', pos: 'noun', meaning_vi: 'hồi sức' },
      { word: 'der Unfall', pos: 'noun', meaning_vi: 'tai nạn' },
      { word: 'die Evakuierung', pos: 'noun', meaning_vi: 'sơ tán' },
      { word: 'retten', pos: 'verb', meaning_vi: 'cứu' },
      { word: 'verletzen', pos: 'verb', meaning_vi: 'làm bị thương' },
      { word: 'bluten', pos: 'verb', meaning_vi: 'chảy máu' },
      { word: 'bewusstlos', pos: 'adj', meaning_vi: 'bất tỉnh' },
      { word: 'lebensgefährlich', pos: 'adj', meaning_vi: 'nguy hiểm đến tính mạng' },
    ]
  },

  school: {
    topic: 'Truong hoc',
    level: 'A2',
    words: [
      { word: 'die Grundschule', pos: 'noun', meaning_vi: 'trường tiểu học' },
      { word: 'die Hauptschule', pos: 'noun', meaning_vi: 'trường trung học cơ sở' },
      { word: 'das Gymnasium', pos: 'noun', meaning_vi: 'trường trung học phổ thông' },
      { word: 'die Realschule', pos: 'noun', meaning_vi: 'trường thực hành' },
      { word: 'der Stundenplan', pos: 'noun', meaning_vi: 'thời khóa biểu' },
      { word: 'die Pause', pos: 'noun', meaning_vi: 'giờ nghỉ' },
      { word: 'der Schulhof', pos: 'noun', meaning_vi: 'sân trường' },
      { word: 'die Kantine', pos: 'noun', meaning_vi: 'căng tin' },
      { word: 'die Bibliothek', pos: 'noun', meaning_vi: 'thư viện' },
      { word: 'das Klassenzimmer', pos: 'noun', meaning_vi: 'phòng học' },
      { word: 'die Tafel', pos: 'noun', meaning_vi: 'bảng' },
      { word: 'der Beamer', pos: 'noun', meaning_vi: 'máy chiếu' },
      { word: 'das Zeugnis', pos: 'noun', meaning_vi: 'bảng điểm' },
      { word: 'die Note', pos: 'noun', meaning_vi: 'điểm số' },
      { word: 'die Hausaufgabe', pos: 'noun', meaning_vi: 'bài tập về nhà' },
      { word: 'die Prüfung', pos: 'noun', meaning_vi: 'bài kiểm tra' },
      { word: 'der Abschluss', pos: 'noun', meaning_vi: 'bằng tốt nghiệp' },
      { word: 'wiederholen', pos: 'verb', meaning_vi: 'ôn lại' },
      { word: 'bestehen', pos: 'verb', meaning_vi: 'đậu' },
      { word: 'durchfallen', pos: 'verb', meaning_vi: 'trượt' },
    ]
  },

  university: {
    topic: 'Dai hoc',
    level: 'B1',
    words: [
      { word: 'die Universität', pos: 'noun', meaning_vi: 'đại học' },
      { word: 'die Hochschule', pos: 'noun', meaning_vi: 'trường cao đẳng' },
      { word: 'die Fakultät', pos: 'noun', meaning_vi: 'khoa' },
      { word: 'der Studiengang', pos: 'noun', meaning_vi: 'ngành học' },
      { word: 'das Semester', pos: 'noun', meaning_vi: 'học kỳ' },
      { word: 'die Vorlesung', pos: 'noun', meaning_vi: 'bài giảng' },
      { word: 'das Seminar', pos: 'noun', meaning_vi: 'hội thảo' },
      { word: 'die Übung', pos: 'noun', meaning_vi: 'bài tập' },
      { word: 'das Praktikum', pos: 'noun', meaning_vi: 'thực tập' },
      { word: 'die Hausarbeit', pos: 'noun', meaning_vi: 'bài luận' },
      { word: 'die Bachelorarbeit', pos: 'noun', meaning_vi: 'luận văn cử nhân' },
      { word: 'die Masterarbeit', pos: 'noun', meaning_vi: 'luận văn thạc sĩ' },
      { word: 'die Dissertation', pos: 'noun', meaning_vi: 'luận án tiến sĩ' },
      { word: 'der Professor', pos: 'noun', meaning_vi: 'giáo sư' },
      { word: 'der Dozent', pos: 'noun', meaning_vi: 'giảng viên' },
      { word: 'der Kommilitone', pos: 'noun', meaning_vi: 'bạn cùng lớp' },
      { word: 'die Mensa', pos: 'noun', meaning_vi: 'căng tin đại học' },
      { word: 'das Wohnheim', pos: 'noun', meaning_vi: 'ký túc xá' },
      { word: 'das Stipendium', pos: 'noun', meaning_vi: 'học bổng' },
      { word: 'sich einschreiben', pos: 'verb', meaning_vi: 'đăng ký nhập học' },
    ]
  },

  workplace: {
    topic: 'Noi lam viec',
    level: 'B1',
    words: [
      { word: 'der Arbeitsplatz', pos: 'noun', meaning_vi: 'nơi làm việc' },
      { word: 'das Bürogebäude', pos: 'noun', meaning_vi: 'tòa nhà văn phòng' },
      { word: 'der Konferenzraum', pos: 'noun', meaning_vi: 'phòng họp' },
      { word: 'der Schreibtisch', pos: 'noun', meaning_vi: 'bàn làm việc' },
      { word: 'der Bürostuhl', pos: 'noun', meaning_vi: 'ghế văn phòng' },
      { word: 'der Aktenordner', pos: 'noun', meaning_vi: 'cặp tài liệu' },
      { word: 'der Locher', pos: 'noun', meaning_vi: 'dụng cụ đục lỗ' },
      { word: 'der Hefter', pos: 'noun', meaning_vi: 'dập ghim' },
      { word: 'die Schere', pos: 'noun', meaning_vi: 'kéo' },
      { word: 'der Tacker', pos: 'noun', meaning_vi: 'máy dập ghim' },
      { word: 'die Besprechung', pos: 'noun', meaning_vi: 'cuộc họp' },
      { word: 'die Präsentation', pos: 'noun', meaning_vi: 'bài thuyết trình' },
      { word: 'das Protokoll', pos: 'noun', meaning_vi: 'biên bản' },
      { word: 'die Überstunde', pos: 'noun', meaning_vi: 'làm thêm giờ' },
      { word: 'die Gleitzeit', pos: 'noun', meaning_vi: 'giờ làm linh hoạt' },
      { word: 'der Feierabend', pos: 'noun', meaning_vi: 'hết giờ làm' },
      { word: 'der Urlaub', pos: 'noun', meaning_vi: 'nghỉ phép' },
      { word: 'kündigen', pos: 'verb', meaning_vi: 'nghỉ việc' },
      { word: 'entlassen', pos: 'verb', meaning_vi: 'sa thải' },
      { word: 'befördern', pos: 'verb', meaning_vi: 'thăng chức' },
    ]
  },

  tools: {
    topic: 'Dung cu',
    level: 'A2',
    words: [
      { word: 'der Hammer', pos: 'noun', meaning_vi: 'búa' },
      { word: 'der Schraubenzieher', pos: 'noun', meaning_vi: 'tua vít' },
      { word: 'die Zange', pos: 'noun', meaning_vi: 'kìm' },
      { word: 'der Schraubenschlüssel', pos: 'noun', meaning_vi: 'cờ lê' },
      { word: 'die Säge', pos: 'noun', meaning_vi: 'cưa' },
      { word: 'die Bohrmaschine', pos: 'noun', meaning_vi: 'máy khoan' },
      { word: 'der Bohrer', pos: 'noun', meaning_vi: 'mũi khoan' },
      { word: 'der Nagel', pos: 'noun', meaning_vi: 'đinh' },
      { word: 'die Schraube', pos: 'noun', meaning_vi: 'ốc vít' },
      { word: 'die Mutter', pos: 'noun', meaning_vi: 'đai ốc' },
      { word: 'das Maßband', pos: 'noun', meaning_vi: 'thước dây' },
      { word: 'die Wasserwaage', pos: 'noun', meaning_vi: 'thước thủy' },
      { word: 'der Pinsel', pos: 'noun', meaning_vi: 'cọ sơn' },
      { word: 'die Farbe', pos: 'noun', meaning_vi: 'sơn' },
      { word: 'das Schleifpapier', pos: 'noun', meaning_vi: 'giấy nhám' },
      { word: 'bohren', pos: 'verb', meaning_vi: 'khoan' },
      { word: 'schrauben', pos: 'verb', meaning_vi: 'vặn ốc' },
      { word: 'nageln', pos: 'verb', meaning_vi: 'đóng đinh' },
      { word: 'sägen', pos: 'verb', meaning_vi: 'cưa' },
      { word: 'schleifen', pos: 'verb', meaning_vi: 'mài' },
    ]
  },

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
      { word: 'der Kunststoff', pos: 'noun', meaning_vi: 'nhựa' },
      { word: 'das Gummi', pos: 'noun', meaning_vi: 'cao su' },
      { word: 'das Glas', pos: 'noun', meaning_vi: 'thủy tinh' },
      { word: 'der Beton', pos: 'noun', meaning_vi: 'bê tông' },
      { word: 'der Zement', pos: 'noun', meaning_vi: 'xi măng' },
      { word: 'der Ziegel', pos: 'noun', meaning_vi: 'gạch' },
      { word: 'die Keramik', pos: 'noun', meaning_vi: 'gốm' },
      { word: 'das Porzellan', pos: 'noun', meaning_vi: 'sứ' },
      { word: 'das Leder', pos: 'noun', meaning_vi: 'da' },
      { word: 'die Wolle', pos: 'noun', meaning_vi: 'len' },
      { word: 'die Baumwolle', pos: 'noun', meaning_vi: 'bông' },
      { word: 'die Seide', pos: 'noun', meaning_vi: 'lụa' },
    ]
  },

  seasons: {
    topic: 'Mua',
    level: 'A1',
    words: [
      { word: 'der Frühling', pos: 'noun', meaning_vi: 'mùa xuân' },
      { word: 'der Sommer', pos: 'noun', meaning_vi: 'mùa hè' },
      { word: 'der Herbst', pos: 'noun', meaning_vi: 'mùa thu' },
      { word: 'der Winter', pos: 'noun', meaning_vi: 'mùa đông' },
      { word: 'die Jahreszeit', pos: 'noun', meaning_vi: 'mùa' },
      { word: 'warm', pos: 'adj', meaning_vi: 'ấm' },
      { word: 'heiß', pos: 'adj', meaning_vi: 'nóng' },
      { word: 'kühl', pos: 'adj', meaning_vi: 'mát' },
      { word: 'kalt', pos: 'adj', meaning_vi: 'lạnh' },
      { word: 'mild', pos: 'adj', meaning_vi: 'ôn hòa' },
      { word: 'sonnig', pos: 'adj', meaning_vi: 'nắng' },
      { word: 'bewölkt', pos: 'adj', meaning_vi: 'nhiều mây' },
      { word: 'regnerisch', pos: 'adj', meaning_vi: 'mưa nhiều' },
      { word: 'windig', pos: 'adj', meaning_vi: 'gió' },
      { word: 'stürmisch', pos: 'adj', meaning_vi: 'bão' },
      { word: 'neblig', pos: 'adj', meaning_vi: 'sương mù' },
      { word: 'frostig', pos: 'adj', meaning_vi: 'giá rét' },
      { word: 'schneien', pos: 'verb', meaning_vi: 'tuyết rơi' },
      { word: 'regnen', pos: 'verb', meaning_vi: 'mưa' },
      { word: 'blühen', pos: 'verb', meaning_vi: 'nở hoa' },
    ]
  },

  holidays: {
    topic: 'Ngay le',
    level: 'A2',
    words: [
      { word: 'Weihnachten', pos: 'noun', meaning_vi: 'Giáng sinh' },
      { word: 'Ostern', pos: 'noun', meaning_vi: 'Phục sinh' },
      { word: 'Silvester', pos: 'noun', meaning_vi: 'Giao thừa' },
      { word: 'Neujahr', pos: 'noun', meaning_vi: 'Năm mới' },
      { word: 'der Heiligabend', pos: 'noun', meaning_vi: 'Đêm Giáng sinh' },
      { word: 'der Karneval', pos: 'noun', meaning_vi: 'Lễ hội hóa trang' },
      { word: 'der Feiertag', pos: 'noun', meaning_vi: 'ngày lễ' },
      { word: 'der Geburtstag', pos: 'noun', meaning_vi: 'sinh nhật' },
      { word: 'die Hochzeit', pos: 'noun', meaning_vi: 'đám cưới' },
      { word: 'die Taufe', pos: 'noun', meaning_vi: 'lễ rửa tội' },
      { word: 'die Beerdigung', pos: 'noun', meaning_vi: 'đám tang' },
      { word: 'der Muttertag', pos: 'noun', meaning_vi: 'Ngày của Mẹ' },
      { word: 'der Vatertag', pos: 'noun', meaning_vi: 'Ngày của Cha' },
      { word: 'der Valentinstag', pos: 'noun', meaning_vi: 'Ngày Valentine' },
      { word: 'der Nationalfeiertag', pos: 'noun', meaning_vi: 'Quốc khánh' },
      { word: 'feiern', pos: 'verb', meaning_vi: 'ăn mừng' },
      { word: 'gratulieren', pos: 'verb', meaning_vi: 'chúc mừng' },
      { word: 'schenken', pos: 'verb', meaning_vi: 'tặng' },
      { word: 'einladen', pos: 'verb', meaning_vi: 'mời' },
      { word: 'dekorieren', pos: 'verb', meaning_vi: 'trang trí' },
    ]
  },

  familyExtended: {
    topic: 'Gia dinh mo rong',
    level: 'A2',
    words: [
      { word: 'der Großvater', pos: 'noun', meaning_vi: 'ông nội/ngoại' },
      { word: 'die Großmutter', pos: 'noun', meaning_vi: 'bà nội/ngoại' },
      { word: 'der Enkel', pos: 'noun', meaning_vi: 'cháu trai' },
      { word: 'die Enkelin', pos: 'noun', meaning_vi: 'cháu gái' },
      { word: 'der Onkel', pos: 'noun', meaning_vi: 'chú/bác/cậu' },
      { word: 'die Tante', pos: 'noun', meaning_vi: 'cô/dì/thím' },
      { word: 'der Cousin', pos: 'noun', meaning_vi: 'anh/em họ (nam)' },
      { word: 'die Cousine', pos: 'noun', meaning_vi: 'chị/em họ (nữ)' },
      { word: 'der Neffe', pos: 'noun', meaning_vi: 'cháu trai (con anh/chị/em)' },
      { word: 'die Nichte', pos: 'noun', meaning_vi: 'cháu gái (con anh/chị/em)' },
      { word: 'der Schwiegervater', pos: 'noun', meaning_vi: 'bố chồng/bố vợ' },
      { word: 'die Schwiegermutter', pos: 'noun', meaning_vi: 'mẹ chồng/mẹ vợ' },
      { word: 'der Schwager', pos: 'noun', meaning_vi: 'anh/em rể' },
      { word: 'die Schwägerin', pos: 'noun', meaning_vi: 'chị/em dâu' },
      { word: 'der Stiefvater', pos: 'noun', meaning_vi: 'bố dượng' },
      { word: 'die Stiefmutter', pos: 'noun', meaning_vi: 'mẹ kế' },
      { word: 'das Stiefkind', pos: 'noun', meaning_vi: 'con riêng' },
      { word: 'der Halbbruder', pos: 'noun', meaning_vi: 'anh/em cùng cha/mẹ khác mẹ/cha' },
      { word: 'die Halbschwester', pos: 'noun', meaning_vi: 'chị/em cùng cha/mẹ khác mẹ/cha' },
      { word: 'verwandt', pos: 'adj', meaning_vi: 'có quan hệ họ hàng' },
    ]
  },

  buildings: {
    topic: 'Toa nha',
    level: 'A2',
    words: [
      { word: 'das Rathaus', pos: 'noun', meaning_vi: 'tòa thị chính' },
      { word: 'die Kirche', pos: 'noun', meaning_vi: 'nhà thờ' },
      { word: 'die Moschee', pos: 'noun', meaning_vi: 'nhà thờ Hồi giáo' },
      { word: 'die Synagoge', pos: 'noun', meaning_vi: 'nhà thờ Do Thái' },
      { word: 'das Museum', pos: 'noun', meaning_vi: 'bảo tàng' },
      { word: 'das Theater', pos: 'noun', meaning_vi: 'nhà hát' },
      { word: 'das Kino', pos: 'noun', meaning_vi: 'rạp chiếu phim' },
      { word: 'die Oper', pos: 'noun', meaning_vi: 'nhà hát opera' },
      { word: 'das Stadion', pos: 'noun', meaning_vi: 'sân vận động' },
      { word: 'die Halle', pos: 'noun', meaning_vi: 'nhà thi đấu' },
      { word: 'das Krankenhaus', pos: 'noun', meaning_vi: 'bệnh viện' },
      { word: 'die Polizeistation', pos: 'noun', meaning_vi: 'đồn cảnh sát' },
      { word: 'das Gericht', pos: 'noun', meaning_vi: 'tòa án' },
      { word: 'das Gefängnis', pos: 'noun', meaning_vi: 'nhà tù' },
      { word: 'die Fabrik', pos: 'noun', meaning_vi: 'nhà máy' },
      { word: 'das Lager', pos: 'noun', meaning_vi: 'kho' },
      { word: 'der Turm', pos: 'noun', meaning_vi: 'tháp' },
      { word: 'die Brücke', pos: 'noun', meaning_vi: 'cầu' },
      { word: 'der Wolkenkratzer', pos: 'noun', meaning_vi: 'tòa nhà chọc trời' },
      { word: 'die Ruine', pos: 'noun', meaning_vi: 'phế tích' },
    ]
  },

  geography: {
    topic: 'Dia ly',
    level: 'B1',
    words: [
      { word: 'der Kontinent', pos: 'noun', meaning_vi: 'châu lục' },
      { word: 'das Land', pos: 'noun', meaning_vi: 'đất nước' },
      { word: 'die Region', pos: 'noun', meaning_vi: 'vùng' },
      { word: 'die Provinz', pos: 'noun', meaning_vi: 'tỉnh' },
      { word: 'die Hauptstadt', pos: 'noun', meaning_vi: 'thủ đô' },
      { word: 'der Ozean', pos: 'noun', meaning_vi: 'đại dương' },
      { word: 'das Meer', pos: 'noun', meaning_vi: 'biển' },
      { word: 'der Fluss', pos: 'noun', meaning_vi: 'sông' },
      { word: 'der See', pos: 'noun', meaning_vi: 'hồ' },
      { word: 'das Gebirge', pos: 'noun', meaning_vi: 'dãy núi' },
      { word: 'der Gipfel', pos: 'noun', meaning_vi: 'đỉnh núi' },
      { word: 'das Tal', pos: 'noun', meaning_vi: 'thung lũng' },
      { word: 'die Wüste', pos: 'noun', meaning_vi: 'sa mạc' },
      { word: 'der Regenwald', pos: 'noun', meaning_vi: 'rừng nhiệt đới' },
      { word: 'die Savanne', pos: 'noun', meaning_vi: 'thảo nguyên' },
      { word: 'die Küste', pos: 'noun', meaning_vi: 'bờ biển' },
      { word: 'die Insel', pos: 'noun', meaning_vi: 'đảo' },
      { word: 'die Halbinsel', pos: 'noun', meaning_vi: 'bán đảo' },
      { word: 'der Äquator', pos: 'noun', meaning_vi: 'xích đạo' },
      { word: 'der Pol', pos: 'noun', meaning_vi: 'cực' },
    ]
  },

  banking: {
    topic: 'Ngan hang',
    level: 'B1',
    words: [
      { word: 'das Girokonto', pos: 'noun', meaning_vi: 'tài khoản vãng lai' },
      { word: 'das Sparkonto', pos: 'noun', meaning_vi: 'tài khoản tiết kiệm' },
      { word: 'die Überweisung', pos: 'noun', meaning_vi: 'chuyển khoản' },
      { word: 'der Dauerauftrag', pos: 'noun', meaning_vi: 'lệnh chi thường xuyên' },
      { word: 'die Lastschrift', pos: 'noun', meaning_vi: 'ghi nợ' },
      { word: 'der Kontoauszug', pos: 'noun', meaning_vi: 'sao kê tài khoản' },
      { word: 'der Kredit', pos: 'noun', meaning_vi: 'tín dụng' },
      { word: 'die Hypothek', pos: 'noun', meaning_vi: 'thế chấp' },
      { word: 'der Zinssatz', pos: 'noun', meaning_vi: 'lãi suất' },
      { word: 'die Gebühr', pos: 'noun', meaning_vi: 'phí' },
      { word: 'der Geldautomat', pos: 'noun', meaning_vi: 'máy ATM' },
      { word: 'die PIN', pos: 'noun', meaning_vi: 'mã PIN' },
      { word: 'die Kreditkarte', pos: 'noun', meaning_vi: 'thẻ tín dụng' },
      { word: 'die EC-Karte', pos: 'noun', meaning_vi: 'thẻ ghi nợ' },
      { word: 'der Scheck', pos: 'noun', meaning_vi: 'séc' },
      { word: 'abheben', pos: 'verb', meaning_vi: 'rút tiền' },
      { word: 'einzahlen', pos: 'verb', meaning_vi: 'nạp tiền' },
      { word: 'überweisen', pos: 'verb', meaning_vi: 'chuyển khoản' },
      { word: 'sparen', pos: 'verb', meaning_vi: 'tiết kiệm' },
      { word: 'leihen', pos: 'verb', meaning_vi: 'vay' },
    ]
  },

  legalBasic: {
    topic: 'Phap luat co ban',
    level: 'B2',
    words: [
      { word: 'das Gesetz', pos: 'noun', meaning_vi: 'luật' },
      { word: 'das Recht', pos: 'noun', meaning_vi: 'quyền' },
      { word: 'die Pflicht', pos: 'noun', meaning_vi: 'nghĩa vụ' },
      { word: 'der Vertrag', pos: 'noun', meaning_vi: 'hợp đồng' },
      { word: 'die Klage', pos: 'noun', meaning_vi: 'đơn kiện' },
      { word: 'das Urteil', pos: 'noun', meaning_vi: 'phán quyết' },
      { word: 'der Richter', pos: 'noun', meaning_vi: 'thẩm phán' },
      { word: 'der Anwalt', pos: 'noun', meaning_vi: 'luật sư' },
      { word: 'der Zeuge', pos: 'noun', meaning_vi: 'nhân chứng' },
      { word: 'der Angeklagte', pos: 'noun', meaning_vi: 'bị cáo' },
      { word: 'die Strafe', pos: 'noun', meaning_vi: 'hình phạt' },
      { word: 'das Bußgeld', pos: 'noun', meaning_vi: 'tiền phạt' },
      { word: 'die Bewährung', pos: 'noun', meaning_vi: 'án treo' },
      { word: 'schuldig', pos: 'adj', meaning_vi: 'có tội' },
      { word: 'unschuldig', pos: 'adj', meaning_vi: 'vô tội' },
      { word: 'legal', pos: 'adj', meaning_vi: 'hợp pháp' },
      { word: 'illegal', pos: 'adj', meaning_vi: 'bất hợp pháp' },
      { word: 'klagen', pos: 'verb', meaning_vi: 'kiện' },
      { word: 'verurteilen', pos: 'verb', meaning_vi: 'kết án' },
      { word: 'freisprechen', pos: 'verb', meaning_vi: 'tha bổng' },
    ]
  },

  communication: {
    topic: 'Giao tiep',
    level: 'A2',
    words: [
      { word: 'das Gespräch', pos: 'noun', meaning_vi: 'cuộc trò chuyện' },
      { word: 'die Unterhaltung', pos: 'noun', meaning_vi: 'cuộc nói chuyện' },
      { word: 'die Diskussion', pos: 'noun', meaning_vi: 'cuộc thảo luận' },
      { word: 'der Streit', pos: 'noun', meaning_vi: 'cuộc cãi vã' },
      { word: 'die Einigung', pos: 'noun', meaning_vi: 'sự thỏa thuận' },
      { word: 'das Missverständnis', pos: 'noun', meaning_vi: 'sự hiểu lầm' },
      { word: 'die Aussage', pos: 'noun', meaning_vi: 'lời phát biểu' },
      { word: 'die Meinung', pos: 'noun', meaning_vi: 'ý kiến' },
      { word: 'der Vorschlag', pos: 'noun', meaning_vi: 'đề xuất' },
      { word: 'die Bitte', pos: 'noun', meaning_vi: 'lời yêu cầu' },
      { word: 'besprechen', pos: 'verb', meaning_vi: 'thảo luận' },
      { word: 'erklären', pos: 'verb', meaning_vi: 'giải thích' },
      { word: 'überzeugen', pos: 'verb', meaning_vi: 'thuyết phục' },
      { word: 'zustimmen', pos: 'verb', meaning_vi: 'đồng ý' },
      { word: 'ablehnen', pos: 'verb', meaning_vi: 'từ chối' },
      { word: 'widersprechen', pos: 'verb', meaning_vi: 'phản đối' },
      { word: 'versprechen', pos: 'verb', meaning_vi: 'hứa' },
      { word: 'entschuldigen', pos: 'verb', meaning_vi: 'xin lỗi' },
      { word: 'bedanken', pos: 'verb', meaning_vi: 'cảm ơn' },
      { word: 'begrüßen', pos: 'verb', meaning_vi: 'chào hỏi' },
    ]
  },

  personality: {
    topic: 'Tinh cach',
    level: 'B1',
    words: [
      { word: 'ehrlich', pos: 'adj', meaning_vi: 'thật thà' },
      { word: 'zuverlässig', pos: 'adj', meaning_vi: 'đáng tin cậy' },
      { word: 'fleißig', pos: 'adj', meaning_vi: 'chăm chỉ' },
      { word: 'faul', pos: 'adj', meaning_vi: 'lười biếng' },
      { word: 'geduldig', pos: 'adj', meaning_vi: 'kiên nhẫn' },
      { word: 'ungeduldig', pos: 'adj', meaning_vi: 'thiếu kiên nhẫn' },
      { word: 'großzügig', pos: 'adj', meaning_vi: 'hào phóng' },
      { word: 'geizig', pos: 'adj', meaning_vi: 'keo kiệt' },
      { word: 'bescheiden', pos: 'adj', meaning_vi: 'khiêm tốn' },
      { word: 'arrogant', pos: 'adj', meaning_vi: 'kiêu ngạo' },
      { word: 'sensibel', pos: 'adj', meaning_vi: 'nhạy cảm' },
      { word: 'selbstbewusst', pos: 'adj', meaning_vi: 'tự tin' },
      { word: 'schüchtern', pos: 'adj', meaning_vi: 'nhút nhát' },
      { word: 'neugierig', pos: 'adj', meaning_vi: 'tò mò' },
      { word: 'kreativ', pos: 'adj', meaning_vi: 'sáng tạo' },
      { word: 'ordentlich', pos: 'adj', meaning_vi: 'ngăn nắp' },
      { word: 'chaotisch', pos: 'adj', meaning_vi: 'hỗn loạn' },
      { word: 'optimistisch', pos: 'adj', meaning_vi: 'lạc quan' },
      { word: 'pessimistisch', pos: 'adj', meaning_vi: 'bi quan' },
      { word: 'realistisch', pos: 'adj', meaning_vi: 'thực tế' },
    ]
  },

  emotions: {
    topic: 'Cam xuc',
    level: 'B1',
    words: [
      { word: 'die Freude', pos: 'noun', meaning_vi: 'niềm vui' },
      { word: 'die Trauer', pos: 'noun', meaning_vi: 'nỗi buồn' },
      { word: 'die Angst', pos: 'noun', meaning_vi: 'nỗi sợ' },
      { word: 'die Wut', pos: 'noun', meaning_vi: 'cơn giận' },
      { word: 'die Überraschung', pos: 'noun', meaning_vi: 'sự ngạc nhiên' },
      { word: 'die Enttäuschung', pos: 'noun', meaning_vi: 'sự thất vọng' },
      { word: 'die Hoffnung', pos: 'noun', meaning_vi: 'hy vọng' },
      { word: 'die Verzweiflung', pos: 'noun', meaning_vi: 'sự tuyệt vọng' },
      { word: 'die Eifersucht', pos: 'noun', meaning_vi: 'sự ghen tuông' },
      { word: 'der Neid', pos: 'noun', meaning_vi: 'sự đố kỵ' },
      { word: 'die Scham', pos: 'noun', meaning_vi: 'sự xấu hổ' },
      { word: 'der Stolz', pos: 'noun', meaning_vi: 'niềm tự hào' },
      { word: 'die Dankbarkeit', pos: 'noun', meaning_vi: 'lòng biết ơn' },
      { word: 'das Mitgefühl', pos: 'noun', meaning_vi: 'sự đồng cảm' },
      { word: 'die Zuneigung', pos: 'noun', meaning_vi: 'tình cảm yêu mến' },
      { word: 'sich freuen', pos: 'verb', meaning_vi: 'vui mừng' },
      { word: 'sich ärgern', pos: 'verb', meaning_vi: 'bực mình' },
      { word: 'sich schämen', pos: 'verb', meaning_vi: 'xấu hổ' },
      { word: 'befürchten', pos: 'verb', meaning_vi: 'lo sợ' },
      { word: 'hoffen', pos: 'verb', meaning_vi: 'hy vọng' },
    ]
  },

  dailyRoutine: {
    topic: 'Sinh hoat hang ngay',
    level: 'A1',
    words: [
      { word: 'aufwachen', pos: 'verb', meaning_vi: 'thức dậy' },
      { word: 'aufstehen', pos: 'verb', meaning_vi: 'ra khỏi giường' },
      { word: 'sich waschen', pos: 'verb', meaning_vi: 'rửa mặt' },
      { word: 'sich duschen', pos: 'verb', meaning_vi: 'tắm vòi sen' },
      { word: 'sich anziehen', pos: 'verb', meaning_vi: 'mặc quần áo' },
      { word: 'frühstücken', pos: 'verb', meaning_vi: 'ăn sáng' },
      { word: 'zur Arbeit gehen', pos: 'verb', meaning_vi: 'đi làm' },
      { word: 'Mittag essen', pos: 'verb', meaning_vi: 'ăn trưa' },
      { word: 'Pause machen', pos: 'verb', meaning_vi: 'nghỉ giải lao' },
      { word: 'nach Hause kommen', pos: 'verb', meaning_vi: 'về nhà' },
      { word: 'kochen', pos: 'verb', meaning_vi: 'nấu ăn' },
      { word: 'Abend essen', pos: 'verb', meaning_vi: 'ăn tối' },
      { word: 'fernsehen', pos: 'verb', meaning_vi: 'xem TV' },
      { word: 'sich ausruhen', pos: 'verb', meaning_vi: 'nghỉ ngơi' },
      { word: 'ins Bett gehen', pos: 'verb', meaning_vi: 'đi ngủ' },
      { word: 'einschlafen', pos: 'verb', meaning_vi: 'ngủ thiếp đi' },
      { word: 'träumen', pos: 'verb', meaning_vi: 'mơ' },
      { word: 'der Wecker', pos: 'noun', meaning_vi: 'đồng hồ báo thức' },
      { word: 'die Routine', pos: 'noun', meaning_vi: 'thói quen hàng ngày' },
      { word: 'der Alltag', pos: 'noun', meaning_vi: 'cuộc sống hàng ngày' },
    ]
  },

  householdChores: {
    topic: 'Viec nha',
    level: 'A2',
    words: [
      { word: 'aufräumen', pos: 'verb', meaning_vi: 'dọn dẹp' },
      { word: 'putzen', pos: 'verb', meaning_vi: 'lau chùi' },
      { word: 'staubsaugen', pos: 'verb', meaning_vi: 'hút bụi' },
      { word: 'wischen', pos: 'verb', meaning_vi: 'lau sàn' },
      { word: 'waschen', pos: 'verb', meaning_vi: 'giặt' },
      { word: 'bügeln', pos: 'verb', meaning_vi: 'là/ủi quần áo' },
      { word: 'abspülen', pos: 'verb', meaning_vi: 'rửa bát' },
      { word: 'abtrocknen', pos: 'verb', meaning_vi: 'lau khô' },
      { word: 'einkaufen', pos: 'verb', meaning_vi: 'đi mua sắm' },
      { word: 'Müll rausbringen', pos: 'verb', meaning_vi: 'đổ rác' },
      { word: 'gießen', pos: 'verb', meaning_vi: 'tưới cây' },
      { word: 'fegen', pos: 'verb', meaning_vi: 'quét' },
      { word: 'der Staubsauger', pos: 'noun', meaning_vi: 'máy hút bụi' },
      { word: 'der Besen', pos: 'noun', meaning_vi: 'cây chổi' },
      { word: 'der Eimer', pos: 'noun', meaning_vi: 'cái xô' },
      { word: 'der Lappen', pos: 'noun', meaning_vi: 'giẻ lau' },
      { word: 'das Bügeleisen', pos: 'noun', meaning_vi: 'bàn là' },
      { word: 'die Waschmaschine', pos: 'noun', meaning_vi: 'máy giặt' },
      { word: 'der Trockner', pos: 'noun', meaning_vi: 'máy sấy' },
      { word: 'die Spülmaschine', pos: 'noun', meaning_vi: 'máy rửa bát' },
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
console.log('║    ⛏️  MINE VOCABULARY BATCH 8                              ║');
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
