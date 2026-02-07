#!/usr/bin/env node
/**
 * Mine Vocabulary Batch 12 - Additional Essential Words (500 words)
 * Topics: Emotions Extended, Body Parts, Health Conditions,
 * Food Preparation, Beverages, Desserts, Fruits, Vegetables
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT = path.join(__dirname, '../data/quality-expansion/batch12-vocabulary.json');

const TOPICS = {
  emotionsExtended: {
    topic: 'Cam xuc mo rong',
    level: 'B1',
    words: [
      { word: 'die Begeisterung', pos: 'noun', meaning_vi: 'sự hào hứng' },
      { word: 'die Zufriedenheit', pos: 'noun', meaning_vi: 'sự hài lòng' },
      { word: 'die Gelassenheit', pos: 'noun', meaning_vi: 'sự bình thản' },
      { word: 'die Erleichterung', pos: 'noun', meaning_vi: 'sự nhẹ nhõm' },
      { word: 'die Aufregung', pos: 'noun', meaning_vi: 'sự hồi hộp' },
      { word: 'die Nervosität', pos: 'noun', meaning_vi: 'sự lo lắng' },
      { word: 'die Langeweile', pos: 'noun', meaning_vi: 'sự buồn chán' },
      { word: 'die Sehnsucht', pos: 'noun', meaning_vi: 'nỗi nhớ nhung' },
      { word: 'die Einsamkeit', pos: 'noun', meaning_vi: 'sự cô đơn' },
      { word: 'die Verlegenheit', pos: 'noun', meaning_vi: 'sự ngượng ngùng' },
      { word: 'begeistert', pos: 'adj', meaning_vi: 'hào hứng' },
      { word: 'zufrieden', pos: 'adj', meaning_vi: 'hài lòng' },
      { word: 'gelassen', pos: 'adj', meaning_vi: 'bình thản' },
      { word: 'erleichtert', pos: 'adj', meaning_vi: 'nhẹ nhõm' },
      { word: 'aufgeregt', pos: 'adj', meaning_vi: 'hồi hộp' },
      { word: 'nervös', pos: 'adj', meaning_vi: 'lo lắng' },
      { word: 'gelangweilt', pos: 'adj', meaning_vi: 'buồn chán' },
      { word: 'einsam', pos: 'adj', meaning_vi: 'cô đơn' },
      { word: 'verlegen', pos: 'adj', meaning_vi: 'ngượng ngùng' },
      { word: 'überwältigt', pos: 'adj', meaning_vi: 'choáng ngợp' },
    ]
  },

  bodyParts: {
    topic: 'Bo phan co the',
    level: 'A2',
    words: [
      { word: 'der Kopf', pos: 'noun', meaning_vi: 'đầu' },
      { word: 'das Haar', pos: 'noun', meaning_vi: 'tóc' },
      { word: 'das Gesicht', pos: 'noun', meaning_vi: 'mặt' },
      { word: 'die Stirn', pos: 'noun', meaning_vi: 'trán' },
      { word: 'die Augenbraue', pos: 'noun', meaning_vi: 'lông mày' },
      { word: 'das Augenlid', pos: 'noun', meaning_vi: 'mi mắt' },
      { word: 'die Wimper', pos: 'noun', meaning_vi: 'lông mi' },
      { word: 'die Wange', pos: 'noun', meaning_vi: 'má' },
      { word: 'das Kinn', pos: 'noun', meaning_vi: 'cằm' },
      { word: 'der Kiefer', pos: 'noun', meaning_vi: 'hàm' },
      { word: 'die Lippe', pos: 'noun', meaning_vi: 'môi' },
      { word: 'die Zunge', pos: 'noun', meaning_vi: 'lưỡi' },
      { word: 'der Zahn', pos: 'noun', meaning_vi: 'răng' },
      { word: 'das Ohr', pos: 'noun', meaning_vi: 'tai' },
      { word: 'der Hals', pos: 'noun', meaning_vi: 'cổ' },
      { word: 'die Schulter', pos: 'noun', meaning_vi: 'vai' },
      { word: 'der Arm', pos: 'noun', meaning_vi: 'cánh tay' },
      { word: 'der Ellenbogen', pos: 'noun', meaning_vi: 'khuỷu tay' },
      { word: 'das Handgelenk', pos: 'noun', meaning_vi: 'cổ tay' },
      { word: 'der Finger', pos: 'noun', meaning_vi: 'ngón tay' },
    ]
  },

  bodyPartsExtended: {
    topic: 'Bo phan co the mo rong',
    level: 'A2',
    words: [
      { word: 'der Daumen', pos: 'noun', meaning_vi: 'ngón cái' },
      { word: 'der Fingernagel', pos: 'noun', meaning_vi: 'móng tay' },
      { word: 'die Brust', pos: 'noun', meaning_vi: 'ngực' },
      { word: 'der Rücken', pos: 'noun', meaning_vi: 'lưng' },
      { word: 'der Bauch', pos: 'noun', meaning_vi: 'bụng' },
      { word: 'die Hüfte', pos: 'noun', meaning_vi: 'hông' },
      { word: 'das Bein', pos: 'noun', meaning_vi: 'chân' },
      { word: 'der Oberschenkel', pos: 'noun', meaning_vi: 'đùi' },
      { word: 'das Knie', pos: 'noun', meaning_vi: 'đầu gối' },
      { word: 'die Wade', pos: 'noun', meaning_vi: 'bắp chân' },
      { word: 'der Knöchel', pos: 'noun', meaning_vi: 'mắt cá chân' },
      { word: 'der Fuß', pos: 'noun', meaning_vi: 'bàn chân' },
      { word: 'die Ferse', pos: 'noun', meaning_vi: 'gót chân' },
      { word: 'der Zeh', pos: 'noun', meaning_vi: 'ngón chân' },
      { word: 'die Haut', pos: 'noun', meaning_vi: 'da' },
      { word: 'der Knochen', pos: 'noun', meaning_vi: 'xương' },
      { word: 'der Muskel', pos: 'noun', meaning_vi: 'cơ' },
      { word: 'die Sehne', pos: 'noun', meaning_vi: 'gân' },
      { word: 'das Gelenk', pos: 'noun', meaning_vi: 'khớp' },
      { word: 'die Wirbelsäule', pos: 'noun', meaning_vi: 'cột sống' },
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
      { word: 'das Blut', pos: 'noun', meaning_vi: 'máu' },
      { word: 'die Ader', pos: 'noun', meaning_vi: 'mạch máu' },
      { word: 'das Rückenmark', pos: 'noun', meaning_vi: 'tủy sống' },
      { word: 'die Milz', pos: 'noun', meaning_vi: 'lá lách' },
      { word: 'die Bauchspeicheldrüse', pos: 'noun', meaning_vi: 'tuyến tụy' },
      { word: 'die Gallenblase', pos: 'noun', meaning_vi: 'túi mật' },
      { word: 'die Blase', pos: 'noun', meaning_vi: 'bàng quang' },
      { word: 'die Schilddrüse', pos: 'noun', meaning_vi: 'tuyến giáp' },
      { word: 'die Drüse', pos: 'noun', meaning_vi: 'tuyến' },
      { word: 'der Nerv', pos: 'noun', meaning_vi: 'dây thần kinh' },
      { word: 'atmen', pos: 'verb', meaning_vi: 'thở' },
      { word: 'verdauen', pos: 'verb', meaning_vi: 'tiêu hóa' },
      { word: 'pumpen', pos: 'verb', meaning_vi: 'bơm' },
    ]
  },

  healthConditions: {
    topic: 'Tinh trang suc khoe',
    level: 'B1',
    words: [
      { word: 'der Bluthochdruck', pos: 'noun', meaning_vi: 'huyết áp cao' },
      { word: 'der Diabetes', pos: 'noun', meaning_vi: 'tiểu đường' },
      { word: 'die Migräne', pos: 'noun', meaning_vi: 'đau nửa đầu' },
      { word: 'die Asthma', pos: 'noun', meaning_vi: 'hen suyễn' },
      { word: 'die Bronchitis', pos: 'noun', meaning_vi: 'viêm phế quản' },
      { word: 'die Lungenentzündung', pos: 'noun', meaning_vi: 'viêm phổi' },
      { word: 'der Herzinfarkt', pos: 'noun', meaning_vi: 'nhồi máu cơ tim' },
      { word: 'der Schlaganfall', pos: 'noun', meaning_vi: 'đột quỵ' },
      { word: 'der Krebs', pos: 'noun', meaning_vi: 'ung thư' },
      { word: 'die Arthritis', pos: 'noun', meaning_vi: 'viêm khớp' },
      { word: 'die Osteoporose', pos: 'noun', meaning_vi: 'loãng xương' },
      { word: 'der Bandscheibenvorfall', pos: 'noun', meaning_vi: 'thoát vị đĩa đệm' },
      { word: 'die Blasenentzündung', pos: 'noun', meaning_vi: 'viêm bàng quang' },
      { word: 'die Gastritis', pos: 'noun', meaning_vi: 'viêm dạ dày' },
      { word: 'die Blinddarmentzündung', pos: 'noun', meaning_vi: 'viêm ruột thừa' },
      { word: 'erkranken', pos: 'verb', meaning_vi: 'mắc bệnh' },
      { word: 'genesen', pos: 'verb', meaning_vi: 'hồi phục' },
      { word: 'leiden', pos: 'verb', meaning_vi: 'chịu đựng' },
      { word: 'heilbar', pos: 'adj', meaning_vi: 'có thể chữa được' },
      { word: 'unheilbar', pos: 'adj', meaning_vi: 'không thể chữa' },
    ]
  },

  foodPreparation: {
    topic: 'Che bien thuc pham',
    level: 'A2',
    words: [
      { word: 'kochen', pos: 'verb', meaning_vi: 'nấu' },
      { word: 'braten', pos: 'verb', meaning_vi: 'chiên' },
      { word: 'backen', pos: 'verb', meaning_vi: 'nướng bánh' },
      { word: 'grillen', pos: 'verb', meaning_vi: 'nướng' },
      { word: 'dämpfen', pos: 'verb', meaning_vi: 'hấp' },
      { word: 'dünsten', pos: 'verb', meaning_vi: 'om' },
      { word: 'schmoren', pos: 'verb', meaning_vi: 'kho' },
      { word: 'rösten', pos: 'verb', meaning_vi: 'rang' },
      { word: 'marinieren', pos: 'verb', meaning_vi: 'ướp' },
      { word: 'panieren', pos: 'verb', meaning_vi: 'tẩm bột' },
      { word: 'zerkleinern', pos: 'verb', meaning_vi: 'cắt nhỏ' },
      { word: 'hacken', pos: 'verb', meaning_vi: 'băm' },
      { word: 'reiben', pos: 'verb', meaning_vi: 'bào' },
      { word: 'pürieren', pos: 'verb', meaning_vi: 'xay nhuyễn' },
      { word: 'aufschlagen', pos: 'verb', meaning_vi: 'đánh (trứng)' },
      { word: 'kneten', pos: 'verb', meaning_vi: 'nhào' },
      { word: 'schmelzen', pos: 'verb', meaning_vi: 'tan chảy' },
      { word: 'abkühlen', pos: 'verb', meaning_vi: 'làm nguội' },
      { word: 'erhitzen', pos: 'verb', meaning_vi: 'đun nóng' },
      { word: 'anrichten', pos: 'verb', meaning_vi: 'bày biện' },
    ]
  },

  spicesHerbs: {
    topic: 'Gia vi thao moc',
    level: 'A2',
    words: [
      { word: 'das Salz', pos: 'noun', meaning_vi: 'muối' },
      { word: 'der Pfeffer', pos: 'noun', meaning_vi: 'tiêu' },
      { word: 'der Zucker', pos: 'noun', meaning_vi: 'đường' },
      { word: 'das Öl', pos: 'noun', meaning_vi: 'dầu' },
      { word: 'der Essig', pos: 'noun', meaning_vi: 'giấm' },
      { word: 'die Soße', pos: 'noun', meaning_vi: 'nước sốt' },
      { word: 'der Senf', pos: 'noun', meaning_vi: 'mù tạt' },
      { word: 'der Ketchup', pos: 'noun', meaning_vi: 'tương cà' },
      { word: 'die Mayonnaise', pos: 'noun', meaning_vi: 'sốt mayonnaise' },
      { word: 'der Knoblauch', pos: 'noun', meaning_vi: 'tỏi' },
      { word: 'die Zwiebel', pos: 'noun', meaning_vi: 'hành tây' },
      { word: 'der Ingwer', pos: 'noun', meaning_vi: 'gừng' },
      { word: 'der Zimt', pos: 'noun', meaning_vi: 'quế' },
      { word: 'der Oregano', pos: 'noun', meaning_vi: 'lá oregano' },
      { word: 'der Thymian', pos: 'noun', meaning_vi: 'húng tây' },
      { word: 'das Basilikum', pos: 'noun', meaning_vi: 'húng quế' },
      { word: 'die Petersilie', pos: 'noun', meaning_vi: 'mùi tây' },
      { word: 'der Rosmarin', pos: 'noun', meaning_vi: 'hương thảo' },
      { word: 'der Koriander', pos: 'noun', meaning_vi: 'rau mùi' },
      { word: 'die Minze', pos: 'noun', meaning_vi: 'bạc hà' },
    ]
  },

  beverages: {
    topic: 'Do uong',
    level: 'A2',
    words: [
      { word: 'das Wasser', pos: 'noun', meaning_vi: 'nước' },
      { word: 'der Saft', pos: 'noun', meaning_vi: 'nước ép' },
      { word: 'der Orangensaft', pos: 'noun', meaning_vi: 'nước cam' },
      { word: 'der Apfelsaft', pos: 'noun', meaning_vi: 'nước táo' },
      { word: 'die Limonade', pos: 'noun', meaning_vi: 'nước chanh' },
      { word: 'die Cola', pos: 'noun', meaning_vi: 'cola' },
      { word: 'der Tee', pos: 'noun', meaning_vi: 'trà' },
      { word: 'der Kaffee', pos: 'noun', meaning_vi: 'cà phê' },
      { word: 'die Milch', pos: 'noun', meaning_vi: 'sữa' },
      { word: 'der Kakao', pos: 'noun', meaning_vi: 'ca cao' },
      { word: 'das Bier', pos: 'noun', meaning_vi: 'bia' },
      { word: 'der Wein', pos: 'noun', meaning_vi: 'rượu vang' },
      { word: 'der Rotwein', pos: 'noun', meaning_vi: 'rượu vang đỏ' },
      { word: 'der Weißwein', pos: 'noun', meaning_vi: 'rượu vang trắng' },
      { word: 'der Sekt', pos: 'noun', meaning_vi: 'champagne' },
      { word: 'der Schnaps', pos: 'noun', meaning_vi: 'rượu mạnh' },
      { word: 'der Cocktail', pos: 'noun', meaning_vi: 'cocktail' },
      { word: 'der Smoothie', pos: 'noun', meaning_vi: 'sinh tố' },
      { word: 'trinken', pos: 'verb', meaning_vi: 'uống' },
      { word: 'alkoholfrei', pos: 'adj', meaning_vi: 'không cồn' },
    ]
  },

  desserts: {
    topic: 'Trang mieng',
    level: 'A2',
    words: [
      { word: 'der Kuchen', pos: 'noun', meaning_vi: 'bánh ngọt' },
      { word: 'die Torte', pos: 'noun', meaning_vi: 'bánh kem' },
      { word: 'der Keks', pos: 'noun', meaning_vi: 'bánh quy' },
      { word: 'das Eis', pos: 'noun', meaning_vi: 'kem' },
      { word: 'die Schokolade', pos: 'noun', meaning_vi: 'sô cô la' },
      { word: 'die Praline', pos: 'noun', meaning_vi: 'kẹo sô cô la' },
      { word: 'das Bonbon', pos: 'noun', meaning_vi: 'kẹo' },
      { word: 'der Pudding', pos: 'noun', meaning_vi: 'pudding' },
      { word: 'die Creme', pos: 'noun', meaning_vi: 'kem (topping)' },
      { word: 'das Marzipan', pos: 'noun', meaning_vi: 'kẹo hạnh nhân' },
      { word: 'der Pfannkuchen', pos: 'noun', meaning_vi: 'bánh kếp' },
      { word: 'die Waffel', pos: 'noun', meaning_vi: 'bánh quế' },
      { word: 'der Donut', pos: 'noun', meaning_vi: 'donut' },
      { word: 'das Croissant', pos: 'noun', meaning_vi: 'bánh sừng bò' },
      { word: 'der Muffin', pos: 'noun', meaning_vi: 'muffin' },
      { word: 'das Tiramisu', pos: 'noun', meaning_vi: 'tiramisu' },
      { word: 'der Obstsalat', pos: 'noun', meaning_vi: 'salad trái cây' },
      { word: 'süß', pos: 'adj', meaning_vi: 'ngọt' },
      { word: 'cremig', pos: 'adj', meaning_vi: 'béo mịn' },
      { word: 'knusprig', pos: 'adj', meaning_vi: 'giòn' },
    ]
  },

  fruits: {
    topic: 'Trai cay',
    level: 'A1',
    words: [
      { word: 'der Apfel', pos: 'noun', meaning_vi: 'táo' },
      { word: 'die Birne', pos: 'noun', meaning_vi: 'lê' },
      { word: 'die Orange', pos: 'noun', meaning_vi: 'cam' },
      { word: 'die Banane', pos: 'noun', meaning_vi: 'chuối' },
      { word: 'die Traube', pos: 'noun', meaning_vi: 'nho' },
      { word: 'die Erdbeere', pos: 'noun', meaning_vi: 'dâu tây' },
      { word: 'die Himbeere', pos: 'noun', meaning_vi: 'mâm xôi' },
      { word: 'die Blaubeere', pos: 'noun', meaning_vi: 'việt quất' },
      { word: 'die Kirsche', pos: 'noun', meaning_vi: 'cherry' },
      { word: 'die Pflaume', pos: 'noun', meaning_vi: 'mận' },
      { word: 'der Pfirsich', pos: 'noun', meaning_vi: 'đào' },
      { word: 'die Aprikose', pos: 'noun', meaning_vi: 'mơ' },
      { word: 'die Zitrone', pos: 'noun', meaning_vi: 'chanh vàng' },
      { word: 'die Limette', pos: 'noun', meaning_vi: 'chanh xanh' },
      { word: 'die Mango', pos: 'noun', meaning_vi: 'xoài' },
      { word: 'die Ananas', pos: 'noun', meaning_vi: 'dứa' },
      { word: 'die Wassermelone', pos: 'noun', meaning_vi: 'dưa hấu' },
      { word: 'die Melone', pos: 'noun', meaning_vi: 'dưa' },
      { word: 'die Kiwi', pos: 'noun', meaning_vi: 'kiwi' },
      { word: 'die Kokosnuss', pos: 'noun', meaning_vi: 'dừa' },
    ]
  },

  vegetables: {
    topic: 'Rau cu',
    level: 'A1',
    words: [
      { word: 'die Kartoffel', pos: 'noun', meaning_vi: 'khoai tây' },
      { word: 'die Tomate', pos: 'noun', meaning_vi: 'cà chua' },
      { word: 'die Gurke', pos: 'noun', meaning_vi: 'dưa chuột' },
      { word: 'die Karotte', pos: 'noun', meaning_vi: 'cà rốt' },
      { word: 'der Kohl', pos: 'noun', meaning_vi: 'bắp cải' },
      { word: 'der Salat', pos: 'noun', meaning_vi: 'rau xà lách' },
      { word: 'der Spinat', pos: 'noun', meaning_vi: 'rau chân vịt' },
      { word: 'der Brokkoli', pos: 'noun', meaning_vi: 'bông cải xanh' },
      { word: 'der Blumenkohl', pos: 'noun', meaning_vi: 'súp lơ' },
      { word: 'die Paprika', pos: 'noun', meaning_vi: 'ớt chuông' },
      { word: 'die Aubergine', pos: 'noun', meaning_vi: 'cà tím' },
      { word: 'die Zucchini', pos: 'noun', meaning_vi: 'bí ngòi' },
      { word: 'der Kürbis', pos: 'noun', meaning_vi: 'bí ngô' },
      { word: 'die Bohne', pos: 'noun', meaning_vi: 'đậu' },
      { word: 'die Erbse', pos: 'noun', meaning_vi: 'đậu Hà Lan' },
      { word: 'die Linse', pos: 'noun', meaning_vi: 'đậu lăng' },
      { word: 'der Lauch', pos: 'noun', meaning_vi: 'tỏi tây' },
      { word: 'der Sellerie', pos: 'noun', meaning_vi: 'cần tây' },
      { word: 'der Spargel', pos: 'noun', meaning_vi: 'măng tây' },
      { word: 'der Pilz', pos: 'noun', meaning_vi: 'nấm' },
    ]
  },

  meatFish: {
    topic: 'Thit ca',
    level: 'A2',
    words: [
      { word: 'das Fleisch', pos: 'noun', meaning_vi: 'thịt' },
      { word: 'das Rindfleisch', pos: 'noun', meaning_vi: 'thịt bò' },
      { word: 'das Schweinefleisch', pos: 'noun', meaning_vi: 'thịt heo' },
      { word: 'das Hähnchen', pos: 'noun', meaning_vi: 'thịt gà' },
      { word: 'das Lammfleisch', pos: 'noun', meaning_vi: 'thịt cừu' },
      { word: 'die Wurst', pos: 'noun', meaning_vi: 'xúc xích' },
      { word: 'der Schinken', pos: 'noun', meaning_vi: 'giăm bông' },
      { word: 'der Speck', pos: 'noun', meaning_vi: 'thịt xông khói' },
      { word: 'das Hackfleisch', pos: 'noun', meaning_vi: 'thịt xay' },
      { word: 'das Steak', pos: 'noun', meaning_vi: 'bít tết' },
      { word: 'der Fisch', pos: 'noun', meaning_vi: 'cá' },
      { word: 'der Lachs', pos: 'noun', meaning_vi: 'cá hồi' },
      { word: 'der Thunfisch', pos: 'noun', meaning_vi: 'cá ngừ' },
      { word: 'die Forelle', pos: 'noun', meaning_vi: 'cá hồi nước ngọt' },
      { word: 'der Kabeljau', pos: 'noun', meaning_vi: 'cá tuyết' },
      { word: 'die Garnele', pos: 'noun', meaning_vi: 'tôm' },
      { word: 'die Krabbe', pos: 'noun', meaning_vi: 'cua' },
      { word: 'die Muschel', pos: 'noun', meaning_vi: 'sò' },
      { word: 'der Tintenfisch', pos: 'noun', meaning_vi: 'mực' },
      { word: 'der Hummer', pos: 'noun', meaning_vi: 'tôm hùm' },
    ]
  },

  dairyProducts: {
    topic: 'San pham sua',
    level: 'A2',
    words: [
      { word: 'die Milch', pos: 'noun', meaning_vi: 'sữa' },
      { word: 'die Butter', pos: 'noun', meaning_vi: 'bơ' },
      { word: 'der Käse', pos: 'noun', meaning_vi: 'phô mai' },
      { word: 'der Joghurt', pos: 'noun', meaning_vi: 'sữa chua' },
      { word: 'die Sahne', pos: 'noun', meaning_vi: 'kem tươi' },
      { word: 'der Quark', pos: 'noun', meaning_vi: 'phô mai tươi' },
      { word: 'die Schlagsahne', pos: 'noun', meaning_vi: 'kem đánh' },
      { word: 'die saure Sahne', pos: 'noun', meaning_vi: 'kem chua' },
      { word: 'der Frischkäse', pos: 'noun', meaning_vi: 'phô mai tươi' },
      { word: 'der Parmesan', pos: 'noun', meaning_vi: 'phô mai Parmesan' },
      { word: 'der Mozzarella', pos: 'noun', meaning_vi: 'phô mai Mozzarella' },
      { word: 'das Ei', pos: 'noun', meaning_vi: 'trứng' },
      { word: 'das Eigelb', pos: 'noun', meaning_vi: 'lòng đỏ trứng' },
      { word: 'das Eiweiß', pos: 'noun', meaning_vi: 'lòng trắng trứng' },
      { word: 'das Spiegelei', pos: 'noun', meaning_vi: 'trứng ốp la' },
      { word: 'das Rührei', pos: 'noun', meaning_vi: 'trứng chiên' },
      { word: 'das gekochte Ei', pos: 'noun', meaning_vi: 'trứng luộc' },
      { word: 'fettarm', pos: 'adj', meaning_vi: 'ít béo' },
      { word: 'vollfett', pos: 'adj', meaning_vi: 'nguyên kem' },
      { word: 'laktosefrei', pos: 'adj', meaning_vi: 'không lactose' },
    ]
  },

  bakeryProducts: {
    topic: 'San pham banh mi',
    level: 'A2',
    words: [
      { word: 'das Brot', pos: 'noun', meaning_vi: 'bánh mì' },
      { word: 'das Brötchen', pos: 'noun', meaning_vi: 'bánh mì nhỏ' },
      { word: 'das Vollkornbrot', pos: 'noun', meaning_vi: 'bánh mì nguyên cám' },
      { word: 'das Weißbrot', pos: 'noun', meaning_vi: 'bánh mì trắng' },
      { word: 'das Toastbrot', pos: 'noun', meaning_vi: 'bánh mì toast' },
      { word: 'die Brezel', pos: 'noun', meaning_vi: 'bánh pretzel' },
      { word: 'das Baguette', pos: 'noun', meaning_vi: 'bánh mì Pháp' },
      { word: 'die Semmel', pos: 'noun', meaning_vi: 'bánh mì tròn' },
      { word: 'der Teig', pos: 'noun', meaning_vi: 'bột nhào' },
      { word: 'die Hefe', pos: 'noun', meaning_vi: 'men' },
      { word: 'das Mehl', pos: 'noun', meaning_vi: 'bột mì' },
      { word: 'die Kruste', pos: 'noun', meaning_vi: 'vỏ bánh' },
      { word: 'die Krume', pos: 'noun', meaning_vi: 'ruột bánh' },
      { word: 'frisch', pos: 'adj', meaning_vi: 'tươi' },
      { word: 'altbacken', pos: 'adj', meaning_vi: 'cũ' },
      { word: 'knusprig', pos: 'adj', meaning_vi: 'giòn' },
      { word: 'weich', pos: 'adj', meaning_vi: 'mềm' },
      { word: 'getoastet', pos: 'adj', meaning_vi: 'nướng' },
      { word: 'belegen', pos: 'verb', meaning_vi: 'phủ lên' },
      { word: 'schneiden', pos: 'verb', meaning_vi: 'cắt' },
    ]
  },

  quantities: {
    topic: 'So luong',
    level: 'A2',
    words: [
      { word: 'das Gramm', pos: 'noun', meaning_vi: 'gram' },
      { word: 'das Kilogramm', pos: 'noun', meaning_vi: 'kilogram' },
      { word: 'der Liter', pos: 'noun', meaning_vi: 'lít' },
      { word: 'der Milliliter', pos: 'noun', meaning_vi: 'mililít' },
      { word: 'die Packung', pos: 'noun', meaning_vi: 'gói' },
      { word: 'die Dose', pos: 'noun', meaning_vi: 'hộp' },
      { word: 'die Flasche', pos: 'noun', meaning_vi: 'chai' },
      { word: 'die Tüte', pos: 'noun', meaning_vi: 'túi' },
      { word: 'das Stück', pos: 'noun', meaning_vi: 'miếng' },
      { word: 'die Scheibe', pos: 'noun', meaning_vi: 'lát' },
      { word: 'die Portion', pos: 'noun', meaning_vi: 'phần' },
      { word: 'die Handvoll', pos: 'noun', meaning_vi: 'nắm' },
      { word: 'der Löffel', pos: 'noun', meaning_vi: 'muỗng' },
      { word: 'der Teelöffel', pos: 'noun', meaning_vi: 'muỗng cà phê' },
      { word: 'der Esslöffel', pos: 'noun', meaning_vi: 'muỗng canh' },
      { word: 'die Prise', pos: 'noun', meaning_vi: 'nhúm' },
      { word: 'die Messerspitze', pos: 'noun', meaning_vi: 'đầu dao' },
      { word: 'abwiegen', pos: 'verb', meaning_vi: 'cân' },
      { word: 'abmessen', pos: 'verb', meaning_vi: 'đo' },
      { word: 'portionieren', pos: 'verb', meaning_vi: 'chia phần' },
    ]
  },

  taste: {
    topic: 'Vi',
    level: 'A2',
    words: [
      { word: 'süß', pos: 'adj', meaning_vi: 'ngọt' },
      { word: 'sauer', pos: 'adj', meaning_vi: 'chua' },
      { word: 'salzig', pos: 'adj', meaning_vi: 'mặn' },
      { word: 'bitter', pos: 'adj', meaning_vi: 'đắng' },
      { word: 'scharf', pos: 'adj', meaning_vi: 'cay' },
      { word: 'mild', pos: 'adj', meaning_vi: 'nhẹ' },
      { word: 'würzig', pos: 'adj', meaning_vi: 'đậm đà' },
      { word: 'fettig', pos: 'adj', meaning_vi: 'béo' },
      { word: 'zart', pos: 'adj', meaning_vi: 'mềm' },
      { word: 'saftig', pos: 'adj', meaning_vi: 'mọng nước' },
      { word: 'trocken', pos: 'adj', meaning_vi: 'khô' },
      { word: 'frisch', pos: 'adj', meaning_vi: 'tươi' },
      { word: 'reif', pos: 'adj', meaning_vi: 'chín' },
      { word: 'unreif', pos: 'adj', meaning_vi: 'chưa chín' },
      { word: 'verdorben', pos: 'adj', meaning_vi: 'hỏng' },
      { word: 'roh', pos: 'adj', meaning_vi: 'sống' },
      { word: 'gar', pos: 'adj', meaning_vi: 'chín' },
      { word: 'schmecken', pos: 'verb', meaning_vi: 'có vị' },
      { word: 'riechen', pos: 'verb', meaning_vi: 'có mùi' },
      { word: 'probieren', pos: 'verb', meaning_vi: 'nếm thử' },
    ]
  },

  weather: {
    topic: 'Thoi tiet',
    level: 'A2',
    words: [
      { word: 'das Wetter', pos: 'noun', meaning_vi: 'thời tiết' },
      { word: 'die Sonne', pos: 'noun', meaning_vi: 'mặt trời' },
      { word: 'der Regen', pos: 'noun', meaning_vi: 'mưa' },
      { word: 'der Schnee', pos: 'noun', meaning_vi: 'tuyết' },
      { word: 'der Wind', pos: 'noun', meaning_vi: 'gió' },
      { word: 'der Sturm', pos: 'noun', meaning_vi: 'bão' },
      { word: 'das Gewitter', pos: 'noun', meaning_vi: 'giông bão' },
      { word: 'der Blitz', pos: 'noun', meaning_vi: 'sét' },
      { word: 'der Donner', pos: 'noun', meaning_vi: 'sấm' },
      { word: 'der Nebel', pos: 'noun', meaning_vi: 'sương mù' },
      { word: 'der Hagel', pos: 'noun', meaning_vi: 'mưa đá' },
      { word: 'der Frost', pos: 'noun', meaning_vi: 'sương giá' },
      { word: 'die Wolke', pos: 'noun', meaning_vi: 'mây' },
      { word: 'der Regenbogen', pos: 'noun', meaning_vi: 'cầu vồng' },
      { word: 'die Temperatur', pos: 'noun', meaning_vi: 'nhiệt độ' },
      { word: 'das Grad', pos: 'noun', meaning_vi: 'độ' },
      { word: 'die Vorhersage', pos: 'noun', meaning_vi: 'dự báo' },
      { word: 'scheinen', pos: 'verb', meaning_vi: 'chiếu sáng' },
      { word: 'regnen', pos: 'verb', meaning_vi: 'mưa' },
      { word: 'schneien', pos: 'verb', meaning_vi: 'tuyết rơi' },
    ]
  },

  nature: {
    topic: 'Thien nhien',
    level: 'A2',
    words: [
      { word: 'die Natur', pos: 'noun', meaning_vi: 'thiên nhiên' },
      { word: 'der Wald', pos: 'noun', meaning_vi: 'rừng' },
      { word: 'der Baum', pos: 'noun', meaning_vi: 'cây' },
      { word: 'die Blume', pos: 'noun', meaning_vi: 'hoa' },
      { word: 'das Gras', pos: 'noun', meaning_vi: 'cỏ' },
      { word: 'der Berg', pos: 'noun', meaning_vi: 'núi' },
      { word: 'der Fluss', pos: 'noun', meaning_vi: 'sông' },
      { word: 'der See', pos: 'noun', meaning_vi: 'hồ' },
      { word: 'das Meer', pos: 'noun', meaning_vi: 'biển' },
      { word: 'der Strand', pos: 'noun', meaning_vi: 'bãi biển' },
      { word: 'die Welle', pos: 'noun', meaning_vi: 'sóng' },
      { word: 'der Wasserfall', pos: 'noun', meaning_vi: 'thác nước' },
      { word: 'die Wiese', pos: 'noun', meaning_vi: 'đồng cỏ' },
      { word: 'der Hügel', pos: 'noun', meaning_vi: 'đồi' },
      { word: 'die Höhle', pos: 'noun', meaning_vi: 'hang động' },
      { word: 'die Wüste', pos: 'noun', meaning_vi: 'sa mạc' },
      { word: 'der Dschungel', pos: 'noun', meaning_vi: 'rừng rậm' },
      { word: 'wandern', pos: 'verb', meaning_vi: 'đi bộ đường dài' },
      { word: 'erkunden', pos: 'verb', meaning_vi: 'khám phá' },
      { word: 'natürlich', pos: 'adj', meaning_vi: 'tự nhiên' },
    ]
  },

  animals: {
    topic: 'Dong vat',
    level: 'A2',
    words: [
      { word: 'das Tier', pos: 'noun', meaning_vi: 'động vật' },
      { word: 'der Hund', pos: 'noun', meaning_vi: 'chó' },
      { word: 'die Katze', pos: 'noun', meaning_vi: 'mèo' },
      { word: 'der Vogel', pos: 'noun', meaning_vi: 'chim' },
      { word: 'der Fisch', pos: 'noun', meaning_vi: 'cá' },
      { word: 'das Pferd', pos: 'noun', meaning_vi: 'ngựa' },
      { word: 'die Kuh', pos: 'noun', meaning_vi: 'bò cái' },
      { word: 'das Schwein', pos: 'noun', meaning_vi: 'lợn' },
      { word: 'das Schaf', pos: 'noun', meaning_vi: 'cừu' },
      { word: 'die Ziege', pos: 'noun', meaning_vi: 'dê' },
      { word: 'das Huhn', pos: 'noun', meaning_vi: 'gà' },
      { word: 'die Ente', pos: 'noun', meaning_vi: 'vịt' },
      { word: 'die Gans', pos: 'noun', meaning_vi: 'ngỗng' },
      { word: 'der Esel', pos: 'noun', meaning_vi: 'lừa' },
      { word: 'das Kaninchen', pos: 'noun', meaning_vi: 'thỏ' },
      { word: 'die Maus', pos: 'noun', meaning_vi: 'chuột' },
      { word: 'der Bär', pos: 'noun', meaning_vi: 'gấu' },
      { word: 'der Wolf', pos: 'noun', meaning_vi: 'sói' },
      { word: 'der Fuchs', pos: 'noun', meaning_vi: 'cáo' },
      { word: 'der Löwe', pos: 'noun', meaning_vi: 'sư tử' },
    ]
  },

  wildAnimals: {
    topic: 'Dong vat hoang da',
    level: 'B1',
    words: [
      { word: 'der Tiger', pos: 'noun', meaning_vi: 'hổ' },
      { word: 'der Elefant', pos: 'noun', meaning_vi: 'voi' },
      { word: 'die Giraffe', pos: 'noun', meaning_vi: 'hươu cao cổ' },
      { word: 'das Zebra', pos: 'noun', meaning_vi: 'ngựa vằn' },
      { word: 'das Nilpferd', pos: 'noun', meaning_vi: 'hà mã' },
      { word: 'das Nashorn', pos: 'noun', meaning_vi: 'tê giác' },
      { word: 'der Affe', pos: 'noun', meaning_vi: 'khỉ' },
      { word: 'der Gorilla', pos: 'noun', meaning_vi: 'khỉ đột' },
      { word: 'das Krokodil', pos: 'noun', meaning_vi: 'cá sấu' },
      { word: 'die Schlange', pos: 'noun', meaning_vi: 'rắn' },
      { word: 'die Schildkröte', pos: 'noun', meaning_vi: 'rùa' },
      { word: 'der Hai', pos: 'noun', meaning_vi: 'cá mập' },
      { word: 'der Delfin', pos: 'noun', meaning_vi: 'cá heo' },
      { word: 'der Wal', pos: 'noun', meaning_vi: 'cá voi' },
      { word: 'der Pinguin', pos: 'noun', meaning_vi: 'chim cánh cụt' },
      { word: 'der Adler', pos: 'noun', meaning_vi: 'đại bàng' },
      { word: 'der Papagei', pos: 'noun', meaning_vi: 'vẹt' },
      { word: 'die Eule', pos: 'noun', meaning_vi: 'cú' },
      { word: 'der Schmetterling', pos: 'noun', meaning_vi: 'bướm' },
      { word: 'die Biene', pos: 'noun', meaning_vi: 'ong' },
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
console.log('║    ⛏️  MINE VOCABULARY BATCH 12                             ║');
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
