#!/usr/bin/env node
/**
 * Mine Vocabulary Batch 15 - Environment, Sustainability, Social Issues
 * Target: 400 unique words
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TOPICS = {
  // Environment
  environment: {
    topic: 'Moi truong',
    level: 'B1',
    words: [
      { word: 'die Umwelt', pos: 'noun', meaning_vi: 'môi trường' },
      { word: 'der Umweltschutz', pos: 'noun', meaning_vi: 'bảo vệ môi trường' },
      { word: 'die Nachhaltigkeit', pos: 'noun', meaning_vi: 'bền vững' },
      { word: 'die Verschmutzung', pos: 'noun', meaning_vi: 'ô nhiễm' },
      { word: 'die Luftverschmutzung', pos: 'noun', meaning_vi: 'ô nhiễm không khí' },
      { word: 'die Wasserverschmutzung', pos: 'noun', meaning_vi: 'ô nhiễm nước' },
      { word: 'der Klimawandel', pos: 'noun', meaning_vi: 'biến đổi khí hậu' },
      { word: 'die Erderwärmung', pos: 'noun', meaning_vi: 'nóng lên toàn cầu' },
      { word: 'der Treibhauseffekt', pos: 'noun', meaning_vi: 'hiệu ứng nhà kính' },
      { word: 'das Ozonloch', pos: 'noun', meaning_vi: 'lỗ thủng tầng ozone' },
      { word: 'der Kohlendioxid', pos: 'noun', meaning_vi: 'carbon dioxide' },
      { word: 'die Emission', pos: 'noun', meaning_vi: 'khí thải' },
      { word: 'der Abfall', pos: 'noun', meaning_vi: 'rác thải' },
      { word: 'der Müll', pos: 'noun', meaning_vi: 'rác' },
      { word: 'die Mülltrennung', pos: 'noun', meaning_vi: 'phân loại rác' },
      { word: 'das Recycling', pos: 'noun', meaning_vi: 'tái chế' },
      { word: 'die Wiederverwendung', pos: 'noun', meaning_vi: 'tái sử dụng' },
      { word: 'der Plastikmüll', pos: 'noun', meaning_vi: 'rác nhựa' },
      { word: 'die Einwegverpackung', pos: 'noun', meaning_vi: 'bao bì dùng một lần' },
      { word: 'die Mehrwegflasche', pos: 'noun', meaning_vi: 'chai tái sử dụng' },
    ]
  },
  renewableEnergy: {
    topic: 'Nang luong tai tao',
    level: 'B2',
    words: [
      { word: 'die Solarenergie', pos: 'noun', meaning_vi: 'năng lượng mặt trời' },
      { word: 'die Windenergie', pos: 'noun', meaning_vi: 'năng lượng gió' },
      { word: 'die Wasserkraft', pos: 'noun', meaning_vi: 'thủy điện' },
      { word: 'die Geothermie', pos: 'noun', meaning_vi: 'địa nhiệt' },
      { word: 'die Biomasse', pos: 'noun', meaning_vi: 'sinh khối' },
      { word: 'das Windrad', pos: 'noun', meaning_vi: 'tuabin gió' },
      { word: 'die Solaranlage', pos: 'noun', meaning_vi: 'hệ thống điện mặt trời' },
      { word: 'das Solarpanel', pos: 'noun', meaning_vi: 'tấm pin mặt trời' },
      { word: 'die Photovoltaik', pos: 'noun', meaning_vi: 'quang điện' },
      { word: 'der Akku', pos: 'noun', meaning_vi: 'pin sạc' },
      { word: 'die Batterie', pos: 'noun', meaning_vi: 'pin' },
      { word: 'die Energiewende', pos: 'noun', meaning_vi: 'chuyển đổi năng lượng' },
      { word: 'die Energieeffizienz', pos: 'noun', meaning_vi: 'hiệu quả năng lượng' },
      { word: 'der Stromverbrauch', pos: 'noun', meaning_vi: 'tiêu thụ điện' },
      { word: 'die Energiequelle', pos: 'noun', meaning_vi: 'nguồn năng lượng' },
      { word: 'das Elektroauto', pos: 'noun', meaning_vi: 'xe điện' },
      { word: 'die Ladestation', pos: 'noun', meaning_vi: 'trạm sạc' },
      { word: 'der Hybridantrieb', pos: 'noun', meaning_vi: 'động cơ hybrid' },
      { word: 'die Wärmepumpe', pos: 'noun', meaning_vi: 'bơm nhiệt' },
      { word: 'die Dämmung', pos: 'noun', meaning_vi: 'cách nhiệt' },
    ]
  },
  nature: {
    topic: 'Thien nhien',
    level: 'A2',
    words: [
      { word: 'der Wald', pos: 'noun', meaning_vi: 'rừng' },
      { word: 'der Regenwald', pos: 'noun', meaning_vi: 'rừng mưa nhiệt đới' },
      { word: 'die Wüste', pos: 'noun', meaning_vi: 'sa mạc' },
      { word: 'die Wiese', pos: 'noun', meaning_vi: 'đồng cỏ' },
      { word: 'der Fluss', pos: 'noun', meaning_vi: 'sông' },
      { word: 'der Bach', pos: 'noun', meaning_vi: 'suối' },
      { word: 'der See', pos: 'noun', meaning_vi: 'hồ' },
      { word: 'das Meer', pos: 'noun', meaning_vi: 'biển' },
      { word: 'der Ozean', pos: 'noun', meaning_vi: 'đại dương' },
      { word: 'die Küste', pos: 'noun', meaning_vi: 'bờ biển' },
      { word: 'der Strand', pos: 'noun', meaning_vi: 'bãi biển' },
      { word: 'die Insel', pos: 'noun', meaning_vi: 'đảo' },
      { word: 'der Berg', pos: 'noun', meaning_vi: 'núi' },
      { word: 'das Tal', pos: 'noun', meaning_vi: 'thung lũng' },
      { word: 'der Hügel', pos: 'noun', meaning_vi: 'đồi' },
      { word: 'die Höhle', pos: 'noun', meaning_vi: 'hang động' },
      { word: 'der Wasserfall', pos: 'noun', meaning_vi: 'thác nước' },
      { word: 'die Quelle', pos: 'noun', meaning_vi: 'nguồn nước' },
      { word: 'der Gletscher', pos: 'noun', meaning_vi: 'sông băng' },
      { word: 'der Vulkan', pos: 'noun', meaning_vi: 'núi lửa' },
    ]
  },
  animals: {
    topic: 'Dong vat',
    level: 'A2',
    words: [
      { word: 'der Löwe', pos: 'noun', meaning_vi: 'sư tử' },
      { word: 'der Tiger', pos: 'noun', meaning_vi: 'hổ' },
      { word: 'der Elefant', pos: 'noun', meaning_vi: 'voi' },
      { word: 'die Giraffe', pos: 'noun', meaning_vi: 'hươu cao cổ' },
      { word: 'das Zebra', pos: 'noun', meaning_vi: 'ngựa vằn' },
      { word: 'der Affe', pos: 'noun', meaning_vi: 'khỉ' },
      { word: 'der Gorilla', pos: 'noun', meaning_vi: 'khỉ đột' },
      { word: 'der Bär', pos: 'noun', meaning_vi: 'gấu' },
      { word: 'der Wolf', pos: 'noun', meaning_vi: 'sói' },
      { word: 'der Fuchs', pos: 'noun', meaning_vi: 'cáo' },
      { word: 'das Krokodil', pos: 'noun', meaning_vi: 'cá sấu' },
      { word: 'die Schlange', pos: 'noun', meaning_vi: 'rắn' },
      { word: 'der Delphin', pos: 'noun', meaning_vi: 'cá heo' },
      { word: 'der Wal', pos: 'noun', meaning_vi: 'cá voi' },
      { word: 'der Hai', pos: 'noun', meaning_vi: 'cá mập' },
      { word: 'die Schildkröte', pos: 'noun', meaning_vi: 'rùa' },
      { word: 'der Pinguin', pos: 'noun', meaning_vi: 'chim cánh cụt' },
      { word: 'der Adler', pos: 'noun', meaning_vi: 'đại bàng' },
      { word: 'der Papagei', pos: 'noun', meaning_vi: 'vẹt' },
      { word: 'die Eule', pos: 'noun', meaning_vi: 'cú' },
    ]
  },
  pets: {
    topic: 'Thu cung',
    level: 'A1',
    words: [
      { word: 'der Hund', pos: 'noun', meaning_vi: 'chó' },
      { word: 'die Katze', pos: 'noun', meaning_vi: 'mèo' },
      { word: 'der Vogel', pos: 'noun', meaning_vi: 'chim' },
      { word: 'der Fisch', pos: 'noun', meaning_vi: 'cá' },
      { word: 'das Kaninchen', pos: 'noun', meaning_vi: 'thỏ' },
      { word: 'der Hamster', pos: 'noun', meaning_vi: 'chuột hamster' },
      { word: 'das Meerschweinchen', pos: 'noun', meaning_vi: 'chuột lang' },
      { word: 'die Maus', pos: 'noun', meaning_vi: 'chuột' },
      { word: 'die Schildkröte', pos: 'noun', meaning_vi: 'rùa' },
      { word: 'das Aquarium', pos: 'noun', meaning_vi: 'bể cá' },
      { word: 'der Käfig', pos: 'noun', meaning_vi: 'lồng' },
      { word: 'die Leine', pos: 'noun', meaning_vi: 'dây xích' },
      { word: 'das Halsband', pos: 'noun', meaning_vi: 'vòng cổ' },
      { word: 'das Futter', pos: 'noun', meaning_vi: 'thức ăn (vật nuôi)' },
      { word: 'der Napf', pos: 'noun', meaning_vi: 'bát ăn' },
      { word: 'das Spielzeug', pos: 'noun', meaning_vi: 'đồ chơi' },
      { word: 'der Tierarzt', pos: 'noun', meaning_vi: 'bác sĩ thú y' },
      { word: 'die Impfung', pos: 'noun', meaning_vi: 'tiêm phòng' },
      { word: 'das Gassi', pos: 'noun', meaning_vi: 'dắt chó đi dạo' },
      { word: 'streicheln', pos: 'verb', meaning_vi: 'vuốt ve' },
    ]
  },
  // Social Issues
  society: {
    topic: 'Xa hoi',
    level: 'B2',
    words: [
      { word: 'die Gesellschaft', pos: 'noun', meaning_vi: 'xã hội' },
      { word: 'die Bevölkerung', pos: 'noun', meaning_vi: 'dân số' },
      { word: 'die Einwanderung', pos: 'noun', meaning_vi: 'nhập cư' },
      { word: 'die Auswanderung', pos: 'noun', meaning_vi: 'di cư' },
      { word: 'die Integration', pos: 'noun', meaning_vi: 'hội nhập' },
      { word: 'die Diskriminierung', pos: 'noun', meaning_vi: 'phân biệt đối xử' },
      { word: 'der Rassismus', pos: 'noun', meaning_vi: 'phân biệt chủng tộc' },
      { word: 'die Gleichberechtigung', pos: 'noun', meaning_vi: 'bình đẳng' },
      { word: 'die Armut', pos: 'noun', meaning_vi: 'nghèo đói' },
      { word: 'die Obdachlosigkeit', pos: 'noun', meaning_vi: 'vô gia cư' },
      { word: 'die Arbeitslosigkeit', pos: 'noun', meaning_vi: 'thất nghiệp' },
      { word: 'die Sozialhilfe', pos: 'noun', meaning_vi: 'trợ cấp xã hội' },
      { word: 'die Rentenversicherung', pos: 'noun', meaning_vi: 'bảo hiểm hưu trí' },
      { word: 'die Krankenversicherung', pos: 'noun', meaning_vi: 'bảo hiểm y tế' },
      { word: 'das Sozialamt', pos: 'noun', meaning_vi: 'sở xã hội' },
      { word: 'die Ehrenamtlichkeit', pos: 'noun', meaning_vi: 'hoạt động tình nguyện' },
      { word: 'die Spende', pos: 'noun', meaning_vi: 'quyên góp' },
      { word: 'die Hilfsorganisation', pos: 'noun', meaning_vi: 'tổ chức cứu trợ' },
      { word: 'die Flüchtlinge', pos: 'noun', meaning_vi: 'người tị nạn' },
      { word: 'das Asyl', pos: 'noun', meaning_vi: 'tị nạn chính trị' },
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
      { word: 'die Partei', pos: 'noun', meaning_vi: 'đảng phái' },
      { word: 'die Wahl', pos: 'noun', meaning_vi: 'bầu cử' },
      { word: 'der Wahlkampf', pos: 'noun', meaning_vi: 'chiến dịch tranh cử' },
      { word: 'der Abgeordnete', pos: 'noun', meaning_vi: 'đại biểu quốc hội' },
      { word: 'der Minister', pos: 'noun', meaning_vi: 'bộ trưởng' },
      { word: 'der Kanzler', pos: 'noun', meaning_vi: 'thủ tướng' },
      { word: 'der Präsident', pos: 'noun', meaning_vi: 'tổng thống' },
      { word: 'die Opposition', pos: 'noun', meaning_vi: 'phe đối lập' },
      { word: 'die Koalition', pos: 'noun', meaning_vi: 'liên minh' },
      { word: 'das Gesetz', pos: 'noun', meaning_vi: 'luật' },
      { word: 'die Verfassung', pos: 'noun', meaning_vi: 'hiến pháp' },
      { word: 'die Reform', pos: 'noun', meaning_vi: 'cải cách' },
      { word: 'die Abstimmung', pos: 'noun', meaning_vi: 'bỏ phiếu' },
      { word: 'die Demonstration', pos: 'noun', meaning_vi: 'biểu tình' },
      { word: 'der Protest', pos: 'noun', meaning_vi: 'phản đối' },
      { word: 'die Meinungsfreiheit', pos: 'noun', meaning_vi: 'tự do ngôn luận' },
    ]
  },
  // Education extended
  educationSystem: {
    topic: 'He thong giao duc',
    level: 'B1',
    words: [
      { word: 'die Grundschule', pos: 'noun', meaning_vi: 'trường tiểu học' },
      { word: 'die Realschule', pos: 'noun', meaning_vi: 'trường thực nghiệp' },
      { word: 'das Gymnasium', pos: 'noun', meaning_vi: 'trường trung học phổ thông' },
      { word: 'die Gesamtschule', pos: 'noun', meaning_vi: 'trường liên cấp' },
      { word: 'die Berufsschule', pos: 'noun', meaning_vi: 'trường dạy nghề' },
      { word: 'die Ausbildung', pos: 'noun', meaning_vi: 'đào tạo nghề' },
      { word: 'das Studium', pos: 'noun', meaning_vi: 'việc học đại học' },
      { word: 'der Abschluss', pos: 'noun', meaning_vi: 'bằng cấp' },
      { word: 'das Abitur', pos: 'noun', meaning_vi: 'tú tài' },
      { word: 'der Bachelor', pos: 'noun', meaning_vi: 'cử nhân' },
      { word: 'der Master', pos: 'noun', meaning_vi: 'thạc sĩ' },
      { word: 'die Promotion', pos: 'noun', meaning_vi: 'tiến sĩ' },
      { word: 'das Semester', pos: 'noun', meaning_vi: 'học kỳ' },
      { word: 'die Vorlesung', pos: 'noun', meaning_vi: 'bài giảng' },
      { word: 'das Seminar', pos: 'noun', meaning_vi: 'hội thảo' },
      { word: 'die Klausur', pos: 'noun', meaning_vi: 'bài thi viết' },
      { word: 'die Hausarbeit', pos: 'noun', meaning_vi: 'bài tập về nhà' },
      { word: 'das Praktikum', pos: 'noun', meaning_vi: 'thực tập' },
      { word: 'das Stipendium', pos: 'noun', meaning_vi: 'học bổng' },
      { word: 'die Studiengebühr', pos: 'noun', meaning_vi: 'học phí' },
    ]
  },
  schoolSubjects: {
    topic: 'Mon hoc',
    level: 'A2',
    words: [
      { word: 'die Mathematik', pos: 'noun', meaning_vi: 'toán học' },
      { word: 'die Physik', pos: 'noun', meaning_vi: 'vật lý' },
      { word: 'die Chemie', pos: 'noun', meaning_vi: 'hóa học' },
      { word: 'die Biologie', pos: 'noun', meaning_vi: 'sinh học' },
      { word: 'die Geschichte', pos: 'noun', meaning_vi: 'lịch sử' },
      { word: 'die Geografie', pos: 'noun', meaning_vi: 'địa lý' },
      { word: 'die Kunst', pos: 'noun', meaning_vi: 'mỹ thuật' },
      { word: 'die Musik', pos: 'noun', meaning_vi: 'âm nhạc' },
      { word: 'der Sport', pos: 'noun', meaning_vi: 'thể dục' },
      { word: 'die Religion', pos: 'noun', meaning_vi: 'tôn giáo' },
      { word: 'die Ethik', pos: 'noun', meaning_vi: 'đạo đức' },
      { word: 'die Informatik', pos: 'noun', meaning_vi: 'tin học' },
      { word: 'die Wirtschaft', pos: 'noun', meaning_vi: 'kinh tế' },
      { word: 'die Sozialkunde', pos: 'noun', meaning_vi: 'xã hội học' },
      { word: 'die Fremdsprache', pos: 'noun', meaning_vi: 'ngoại ngữ' },
      { word: 'die Literatur', pos: 'noun', meaning_vi: 'văn học' },
      { word: 'die Philosophie', pos: 'noun', meaning_vi: 'triết học' },
      { word: 'die Psychologie', pos: 'noun', meaning_vi: 'tâm lý học' },
      { word: 'die Pädagogik', pos: 'noun', meaning_vi: 'sư phạm' },
      { word: 'die Rechtswissenschaft', pos: 'noun', meaning_vi: 'luật học' },
    ]
  },
  // Professions extended
  professions1: {
    topic: 'Nghe nghiep 1',
    level: 'A2',
    words: [
      { word: 'der Arzt', pos: 'noun', meaning_vi: 'bác sĩ' },
      { word: 'die Ärztin', pos: 'noun', meaning_vi: 'bác sĩ nữ' },
      { word: 'der Zahnarzt', pos: 'noun', meaning_vi: 'nha sĩ' },
      { word: 'die Krankenschwester', pos: 'noun', meaning_vi: 'y tá' },
      { word: 'der Apotheker', pos: 'noun', meaning_vi: 'dược sĩ' },
      { word: 'der Anwalt', pos: 'noun', meaning_vi: 'luật sư' },
      { word: 'der Richter', pos: 'noun', meaning_vi: 'thẩm phán' },
      { word: 'der Polizist', pos: 'noun', meaning_vi: 'cảnh sát' },
      { word: 'der Feuerwehrmann', pos: 'noun', meaning_vi: 'lính cứu hỏa' },
      { word: 'der Lehrer', pos: 'noun', meaning_vi: 'giáo viên' },
      { word: 'die Lehrerin', pos: 'noun', meaning_vi: 'giáo viên nữ' },
      { word: 'der Professor', pos: 'noun', meaning_vi: 'giáo sư' },
      { word: 'der Ingenieur', pos: 'noun', meaning_vi: 'kỹ sư' },
      { word: 'der Architekt', pos: 'noun', meaning_vi: 'kiến trúc sư' },
      { word: 'der Programmierer', pos: 'noun', meaning_vi: 'lập trình viên' },
      { word: 'der Journalist', pos: 'noun', meaning_vi: 'nhà báo' },
      { word: 'der Pilot', pos: 'noun', meaning_vi: 'phi công' },
      { word: 'der Koch', pos: 'noun', meaning_vi: 'đầu bếp' },
      { word: 'der Kellner', pos: 'noun', meaning_vi: 'bồi bàn' },
      { word: 'der Friseur', pos: 'noun', meaning_vi: 'thợ cắt tóc' },
    ]
  },
  professions2: {
    topic: 'Nghe nghiep 2',
    level: 'B1',
    words: [
      { word: 'der Elektriker', pos: 'noun', meaning_vi: 'thợ điện' },
      { word: 'der Klempner', pos: 'noun', meaning_vi: 'thợ ống nước' },
      { word: 'der Mechaniker', pos: 'noun', meaning_vi: 'thợ cơ khí' },
      { word: 'der Tischler', pos: 'noun', meaning_vi: 'thợ mộc' },
      { word: 'der Maler', pos: 'noun', meaning_vi: 'thợ sơn' },
      { word: 'der Gärtner', pos: 'noun', meaning_vi: 'người làm vườn' },
      { word: 'der Bäcker', pos: 'noun', meaning_vi: 'thợ làm bánh' },
      { word: 'der Metzger', pos: 'noun', meaning_vi: 'người bán thịt' },
      { word: 'der Verkäufer', pos: 'noun', meaning_vi: 'nhân viên bán hàng' },
      { word: 'der Kassierer', pos: 'noun', meaning_vi: 'thu ngân' },
      { word: 'der Buchhalter', pos: 'noun', meaning_vi: 'kế toán' },
      { word: 'der Berater', pos: 'noun', meaning_vi: 'tư vấn viên' },
      { word: 'der Manager', pos: 'noun', meaning_vi: 'quản lý' },
      { word: 'der Unternehmer', pos: 'noun', meaning_vi: 'doanh nhân' },
      { word: 'der Übersetzer', pos: 'noun', meaning_vi: 'phiên dịch viên' },
      { word: 'der Dolmetscher', pos: 'noun', meaning_vi: 'thông dịch viên' },
      { word: 'der Designer', pos: 'noun', meaning_vi: 'nhà thiết kế' },
      { word: 'der Fotograf', pos: 'noun', meaning_vi: 'nhiếp ảnh gia' },
      { word: 'der Musiker', pos: 'noun', meaning_vi: 'nhạc sĩ' },
      { word: 'der Künstler', pos: 'noun', meaning_vi: 'nghệ sĩ' },
    ]
  },
  // Health extended
  healthConditions: {
    topic: 'Tinh trang suc khoe',
    level: 'B1',
    words: [
      { word: 'die Erkältung', pos: 'noun', meaning_vi: 'cảm lạnh' },
      { word: 'die Grippe', pos: 'noun', meaning_vi: 'cúm' },
      { word: 'das Fieber', pos: 'noun', meaning_vi: 'sốt' },
      { word: 'der Husten', pos: 'noun', meaning_vi: 'ho' },
      { word: 'der Schnupfen', pos: 'noun', meaning_vi: 'sổ mũi' },
      { word: 'die Halsschmerzen', pos: 'noun', meaning_vi: 'đau họng' },
      { word: 'die Kopfschmerzen', pos: 'noun', meaning_vi: 'đau đầu' },
      { word: 'die Bauchschmerzen', pos: 'noun', meaning_vi: 'đau bụng' },
      { word: 'die Rückenschmerzen', pos: 'noun', meaning_vi: 'đau lưng' },
      { word: 'die Allergie', pos: 'noun', meaning_vi: 'dị ứng' },
      { word: 'der Ausschlag', pos: 'noun', meaning_vi: 'phát ban' },
      { word: 'die Entzündung', pos: 'noun', meaning_vi: 'viêm' },
      { word: 'die Infektion', pos: 'noun', meaning_vi: 'nhiễm trùng' },
      { word: 'der Durchfall', pos: 'noun', meaning_vi: 'tiêu chảy' },
      { word: 'die Verstopfung', pos: 'noun', meaning_vi: 'táo bón' },
      { word: 'die Übelkeit', pos: 'noun', meaning_vi: 'buồn nôn' },
      { word: 'der Schwindel', pos: 'noun', meaning_vi: 'chóng mặt' },
      { word: 'die Müdigkeit', pos: 'noun', meaning_vi: 'mệt mỏi' },
      { word: 'die Schlafstörung', pos: 'noun', meaning_vi: 'rối loạn giấc ngủ' },
      { word: 'der Stress', pos: 'noun', meaning_vi: 'căng thẳng' },
    ]
  },
  medicalTreatment: {
    topic: 'Dieu tri y te',
    level: 'B1',
    words: [
      { word: 'die Behandlung', pos: 'noun', meaning_vi: 'điều trị' },
      { word: 'die Untersuchung', pos: 'noun', meaning_vi: 'khám' },
      { word: 'die Diagnose', pos: 'noun', meaning_vi: 'chẩn đoán' },
      { word: 'das Rezept', pos: 'noun', meaning_vi: 'đơn thuốc' },
      { word: 'das Medikament', pos: 'noun', meaning_vi: 'thuốc' },
      { word: 'die Tablette', pos: 'noun', meaning_vi: 'viên thuốc' },
      { word: 'die Salbe', pos: 'noun', meaning_vi: 'thuốc mỡ' },
      { word: 'die Spritze', pos: 'noun', meaning_vi: 'tiêm' },
      { word: 'der Verband', pos: 'noun', meaning_vi: 'băng bó' },
      { word: 'die Krücke', pos: 'noun', meaning_vi: 'nạng' },
      { word: 'der Rollstuhl', pos: 'noun', meaning_vi: 'xe lăn' },
      { word: 'die Operation', pos: 'noun', meaning_vi: 'phẫu thuật' },
      { word: 'die Narkose', pos: 'noun', meaning_vi: 'gây mê' },
      { word: 'die Therapie', pos: 'noun', meaning_vi: 'trị liệu' },
      { word: 'die Rehabilitation', pos: 'noun', meaning_vi: 'phục hồi chức năng' },
      { word: 'die Krankengymnastik', pos: 'noun', meaning_vi: 'vật lý trị liệu' },
      { word: 'die Blutuntersuchung', pos: 'noun', meaning_vi: 'xét nghiệm máu' },
      { word: 'das Röntgen', pos: 'noun', meaning_vi: 'chụp X-quang' },
      { word: 'der Ultraschall', pos: 'noun', meaning_vi: 'siêu âm' },
      { word: 'die Überweisung', pos: 'noun', meaning_vi: 'giấy chuyển viện' },
    ]
  },
  // Technology
  technology: {
    topic: 'Cong nghe',
    level: 'B1',
    words: [
      { word: 'der Computer', pos: 'noun', meaning_vi: 'máy tính' },
      { word: 'der Laptop', pos: 'noun', meaning_vi: 'laptop' },
      { word: 'das Tablet', pos: 'noun', meaning_vi: 'máy tính bảng' },
      { word: 'das Smartphone', pos: 'noun', meaning_vi: 'điện thoại thông minh' },
      { word: 'der Bildschirm', pos: 'noun', meaning_vi: 'màn hình' },
      { word: 'die Tastatur', pos: 'noun', meaning_vi: 'bàn phím' },
      { word: 'die Maus', pos: 'noun', meaning_vi: 'chuột máy tính' },
      { word: 'der Drucker', pos: 'noun', meaning_vi: 'máy in' },
      { word: 'der Scanner', pos: 'noun', meaning_vi: 'máy scan' },
      { word: 'die Festplatte', pos: 'noun', meaning_vi: 'ổ cứng' },
      { word: 'der USB-Stick', pos: 'noun', meaning_vi: 'USB' },
      { word: 'das Passwort', pos: 'noun', meaning_vi: 'mật khẩu' },
      { word: 'der Benutzername', pos: 'noun', meaning_vi: 'tên đăng nhập' },
      { word: 'die App', pos: 'noun', meaning_vi: 'ứng dụng' },
      { word: 'die Software', pos: 'noun', meaning_vi: 'phần mềm' },
      { word: 'das Update', pos: 'noun', meaning_vi: 'cập nhật' },
      { word: 'der Download', pos: 'noun', meaning_vi: 'tải xuống' },
      { word: 'der Upload', pos: 'noun', meaning_vi: 'tải lên' },
      { word: 'die Cloud', pos: 'noun', meaning_vi: 'đám mây' },
      { word: 'das WLAN', pos: 'noun', meaning_vi: 'wifi' },
    ]
  },
  internet: {
    topic: 'Internet',
    level: 'B1',
    words: [
      { word: 'das Internet', pos: 'noun', meaning_vi: 'internet' },
      { word: 'die Webseite', pos: 'noun', meaning_vi: 'trang web' },
      { word: 'der Browser', pos: 'noun', meaning_vi: 'trình duyệt' },
      { word: 'die Suchmaschine', pos: 'noun', meaning_vi: 'công cụ tìm kiếm' },
      { word: 'der Link', pos: 'noun', meaning_vi: 'liên kết' },
      { word: 'die E-Mail', pos: 'noun', meaning_vi: 'email' },
      { word: 'der Anhang', pos: 'noun', meaning_vi: 'tệp đính kèm' },
      { word: 'das soziale Netzwerk', pos: 'noun', meaning_vi: 'mạng xã hội' },
      { word: 'das Profil', pos: 'noun', meaning_vi: 'hồ sơ' },
      { word: 'der Beitrag', pos: 'noun', meaning_vi: 'bài đăng' },
      { word: 'der Kommentar', pos: 'noun', meaning_vi: 'bình luận' },
      { word: 'das Video', pos: 'noun', meaning_vi: 'video' },
      { word: 'der Podcast', pos: 'noun', meaning_vi: 'podcast' },
      { word: 'das Streaming', pos: 'noun', meaning_vi: 'phát trực tuyến' },
      { word: 'der Onlineshop', pos: 'noun', meaning_vi: 'cửa hàng trực tuyến' },
      { word: 'der Warenkorb', pos: 'noun', meaning_vi: 'giỏ hàng' },
      { word: 'die Bestellung', pos: 'noun', meaning_vi: 'đơn hàng' },
      { word: 'die Lieferung', pos: 'noun', meaning_vi: 'giao hàng' },
      { word: 'die Datensicherheit', pos: 'noun', meaning_vi: 'bảo mật dữ liệu' },
      { word: 'der Virus', pos: 'noun', meaning_vi: 'virus' },
    ]
  },
  // Idioms and expressions
  idioms: {
    topic: 'Thanh ngu',
    level: 'B2',
    words: [
      { word: 'Daumen drücken', pos: 'phrase', meaning_vi: 'chúc may mắn' },
      { word: 'ins Fettnäpfchen treten', pos: 'phrase', meaning_vi: 'gây rắc rối vô tình' },
      { word: 'die Katze im Sack kaufen', pos: 'phrase', meaning_vi: 'mua mèo trong bao' },
      { word: 'den Nagel auf den Kopf treffen', pos: 'phrase', meaning_vi: 'đúng điểm' },
      { word: 'jemanden auf den Arm nehmen', pos: 'phrase', meaning_vi: 'trêu ai đó' },
      { word: 'Tomaten auf den Augen haben', pos: 'phrase', meaning_vi: 'không nhận ra điều hiển nhiên' },
      { word: 'sich etwas hinter die Ohren schreiben', pos: 'phrase', meaning_vi: 'ghi nhớ kỹ' },
      { word: 'zwei linke Hände haben', pos: 'phrase', meaning_vi: 'vụng về' },
      { word: 'die Nase voll haben', pos: 'phrase', meaning_vi: 'chán ngấy' },
      { word: 'auf dem Holzweg sein', pos: 'phrase', meaning_vi: 'đi sai đường' },
      { word: 'jemandem einen Bären aufbinden', pos: 'phrase', meaning_vi: 'nói dối ai' },
      { word: 'alles in Butter', pos: 'phrase', meaning_vi: 'mọi thứ ổn' },
      { word: 'Schwein haben', pos: 'phrase', meaning_vi: 'may mắn' },
      { word: 'ins Gras beißen', pos: 'phrase', meaning_vi: 'chết' },
      { word: 'den Faden verlieren', pos: 'phrase', meaning_vi: 'mất mạch' },
      { word: 'auf der faulen Haut liegen', pos: 'phrase', meaning_vi: 'lười biếng' },
      { word: 'Eulen nach Athen tragen', pos: 'phrase', meaning_vi: 'làm điều thừa' },
      { word: 'sich ins Zeug legen', pos: 'phrase', meaning_vi: 'nỗ lực hết sức' },
      { word: 'Butter bei die Fische', pos: 'phrase', meaning_vi: 'đi thẳng vào vấn đề' },
      { word: 'über den Tellerrand schauen', pos: 'phrase', meaning_vi: 'nhìn xa hơn' },
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
const outputPath = path.join(__dirname, '../data/quality-expansion/batch15-vocabulary.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(vocabulary, null, 2));

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║    📚 BATCH 15 VOCABULARY GENERATED                        ║');
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
