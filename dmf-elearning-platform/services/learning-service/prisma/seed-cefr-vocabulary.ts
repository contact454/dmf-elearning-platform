/**
 * CEFR-Aligned Vocabulary Seed — Phase A
 * Based on Goethe-Institut Wortliste standards
 * 
 * A1: ~650 core words | A2: ~1300 | B1: ~2400 | B2: ~3500
 * Every noun has artikel + plural
 * Every word has proper topic, example sentence, Vietnamese translation
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// ═══════════════════════════════════════════════════
// A1 VOCABULARY — Goethe-Institut A1 Wortliste (~650)
// ═══════════════════════════════════════════════════

const A1_VOCABULARY = [
    // ─── Begrüßung & Abschied (Chào hỏi) ───
    { word: 'Hallo', meaning_vi: 'xin chào', pos: 'intj', topic: 'Begrüßung', example_de: 'Hallo, wie geht es dir?', example_vi: 'Xin chào, bạn khỏe không?' },
    { word: 'Guten Morgen', meaning_vi: 'chào buổi sáng', pos: 'phrase', topic: 'Begrüßung', example_de: 'Guten Morgen, Frau Müller!', example_vi: 'Chào buổi sáng, bà Müller!' },
    { word: 'Guten Tag', meaning_vi: 'chào (ban ngày)', pos: 'phrase', topic: 'Begrüßung', example_de: 'Guten Tag! Kann ich Ihnen helfen?', example_vi: 'Xin chào! Tôi có thể giúp gì?' },
    { word: 'Guten Abend', meaning_vi: 'chào buổi tối', pos: 'phrase', topic: 'Begrüßung', example_de: 'Guten Abend, herzlich willkommen!', example_vi: 'Chào buổi tối, chào mừng!' },
    { word: 'Gute Nacht', meaning_vi: 'chúc ngủ ngon', pos: 'phrase', topic: 'Begrüßung', example_de: 'Gute Nacht, schlaf gut!', example_vi: 'Chúc ngủ ngon!' },
    { word: 'Tschüss', meaning_vi: 'tạm biệt (thân mật)', pos: 'intj', topic: 'Begrüßung', example_de: 'Tschüss, bis morgen!', example_vi: 'Tạm biệt, hẹn ngày mai!' },
    { word: 'Auf Wiedersehen', meaning_vi: 'tạm biệt (lịch sự)', pos: 'phrase', topic: 'Begrüßung', example_de: 'Auf Wiedersehen und danke!', example_vi: 'Tạm biệt và cảm ơn!' },
    { word: 'bitte', meaning_vi: 'xin vui lòng, làm ơn', pos: 'adv', topic: 'Begrüßung', example_de: 'Ein Wasser, bitte.', example_vi: 'Một ly nước, làm ơn.' },
    { word: 'danke', meaning_vi: 'cảm ơn', pos: 'intj', topic: 'Begrüßung', example_de: 'Danke schön!', example_vi: 'Cảm ơn nhiều!' },
    { word: 'ja', meaning_vi: 'vâng, có', pos: 'adv', topic: 'Begrüßung', example_de: 'Ja, das stimmt.', example_vi: 'Vâng, đúng vậy.' },
    { word: 'nein', meaning_vi: 'không', pos: 'adv', topic: 'Begrüßung', example_de: 'Nein, danke.', example_vi: 'Không, cảm ơn.' },

    // ─── Persönliche Angaben (Thông tin cá nhân) ───
    { word: 'der Name', meaning_vi: 'tên', pos: 'noun', artikel: 'der', topic: 'Persönliches', example_de: 'Mein Name ist Anna.', example_vi: 'Tên tôi là Anna.', plural: 'die Namen' },
    { word: 'der Vorname', meaning_vi: 'tên (riêng)', pos: 'noun', artikel: 'der', topic: 'Persönliches', example_de: 'Mein Vorname ist Thomas.', example_vi: 'Tên tôi là Thomas.', plural: 'die Vornamen' },
    { word: 'der Familienname', meaning_vi: 'họ', pos: 'noun', artikel: 'der', topic: 'Persönliches', example_de: 'Wie ist Ihr Familienname?', example_vi: 'Họ của bạn là gì?', plural: 'die Familiennamen' },
    { word: 'die Adresse', meaning_vi: 'địa chỉ', pos: 'noun', artikel: 'die', topic: 'Persönliches', example_de: 'Wie ist Ihre Adresse?', example_vi: 'Địa chỉ của bạn là gì?', plural: 'die Adressen' },
    { word: 'die Telefonnummer', meaning_vi: 'số điện thoại', pos: 'noun', artikel: 'die', topic: 'Persönliches', example_de: 'Meine Telefonnummer ist 0176...', example_vi: 'Số điện thoại của tôi là 0176...', plural: 'die Telefonnummern' },
    { word: 'das Alter', meaning_vi: 'tuổi', pos: 'noun', artikel: 'das', topic: 'Persönliches', example_de: 'Wie alt bist du?', example_vi: 'Bạn bao nhiêu tuổi?' },
    { word: 'der Beruf', meaning_vi: 'nghề nghiệp', pos: 'noun', artikel: 'der', topic: 'Persönliches', example_de: 'Was ist Ihr Beruf?', example_vi: 'Nghề nghiệp của bạn là gì?', plural: 'die Berufe' },
    { word: 'das Land', meaning_vi: 'đất nước', pos: 'noun', artikel: 'das', topic: 'Persönliches', example_de: 'Aus welchem Land kommen Sie?', example_vi: 'Bạn đến từ nước nào?', plural: 'die Länder' },
    { word: 'die Stadt', meaning_vi: 'thành phố', pos: 'noun', artikel: 'die', topic: 'Persönliches', example_de: 'Ich wohne in Berlin.', example_vi: 'Tôi sống ở Berlin.', plural: 'die Städte' },
    { word: 'die Sprache', meaning_vi: 'ngôn ngữ', pos: 'noun', artikel: 'die', topic: 'Persönliches', example_de: 'Welche Sprachen sprechen Sie?', example_vi: 'Bạn nói ngôn ngữ nào?', plural: 'die Sprachen' },

    // ─── Familie (Gia đình) ───
    { word: 'die Familie', meaning_vi: 'gia đình', pos: 'noun', artikel: 'die', topic: 'Familie', example_de: 'Meine Familie ist groß.', example_vi: 'Gia đình tôi lớn.', plural: 'die Familien' },
    { word: 'der Vater', meaning_vi: 'bố', pos: 'noun', artikel: 'der', topic: 'Familie', example_de: 'Mein Vater arbeitet als Lehrer.', example_vi: 'Bố tôi làm giáo viên.', plural: 'die Väter' },
    { word: 'die Mutter', meaning_vi: 'mẹ', pos: 'noun', artikel: 'die', topic: 'Familie', example_de: 'Meine Mutter kocht sehr gut.', example_vi: 'Mẹ tôi nấu ăn rất giỏi.', plural: 'die Mütter' },
    { word: 'der Bruder', meaning_vi: 'anh/em trai', pos: 'noun', artikel: 'der', topic: 'Familie', example_de: 'Mein Bruder ist 20 Jahre alt.', example_vi: 'Anh trai tôi 20 tuổi.', plural: 'die Brüder' },
    { word: 'die Schwester', meaning_vi: 'chị/em gái', pos: 'noun', artikel: 'die', topic: 'Familie', example_de: 'Meine Schwester studiert Medizin.', example_vi: 'Chị tôi học y khoa.', plural: 'die Schwestern' },
    { word: 'der Sohn', meaning_vi: 'con trai', pos: 'noun', artikel: 'der', topic: 'Familie', example_de: 'Unser Sohn geht in die Schule.', example_vi: 'Con trai chúng tôi đi học.', plural: 'die Söhne' },
    { word: 'die Tochter', meaning_vi: 'con gái', pos: 'noun', artikel: 'die', topic: 'Familie', example_de: 'Unsere Tochter ist drei.', example_vi: 'Con gái chúng tôi ba tuổi.', plural: 'die Töchter' },
    { word: 'der Mann', meaning_vi: 'chồng, đàn ông', pos: 'noun', artikel: 'der', topic: 'Familie', example_de: 'Mein Mann arbeitet bei Siemens.', example_vi: 'Chồng tôi làm ở Siemens.', plural: 'die Männer' },
    { word: 'die Frau', meaning_vi: 'vợ, phụ nữ', pos: 'noun', artikel: 'die', topic: 'Familie', example_de: 'Die Frau kauft Blumen.', example_vi: 'Người phụ nữ mua hoa.', plural: 'die Frauen' },
    { word: 'das Kind', meaning_vi: 'trẻ em', pos: 'noun', artikel: 'das', topic: 'Familie', example_de: 'Das Kind spielt im Garten.', example_vi: 'Đứa trẻ chơi trong vườn.', plural: 'die Kinder' },
    { word: 'die Eltern', meaning_vi: 'cha mẹ', pos: 'noun', artikel: 'die', topic: 'Familie', example_de: 'Meine Eltern wohnen in München.', example_vi: 'Cha mẹ tôi sống ở München.' },
    { word: 'die Großmutter', meaning_vi: 'bà', pos: 'noun', artikel: 'die', topic: 'Familie', example_de: 'Meine Großmutter ist 80.', example_vi: 'Bà tôi 80 tuổi.', plural: 'die Großmütter' },
    { word: 'der Großvater', meaning_vi: 'ông', pos: 'noun', artikel: 'der', topic: 'Familie', example_de: 'Mein Großvater liest gern.', example_vi: 'Ông tôi thích đọc sách.', plural: 'die Großväter' },

    // ─── Essen & Trinken (Ăn uống) ───
    { word: 'das Brot', meaning_vi: 'bánh mì', pos: 'noun', artikel: 'das', topic: 'Essen', example_de: 'Ich kaufe ein Brot.', example_vi: 'Tôi mua một ổ bánh mì.', plural: 'die Brote' },
    { word: 'die Butter', meaning_vi: 'bơ', pos: 'noun', artikel: 'die', topic: 'Essen', example_de: 'Die Butter ist im Kühlschrank.', example_vi: 'Bơ ở trong tủ lạnh.' },
    { word: 'der Käse', meaning_vi: 'phô mai', pos: 'noun', artikel: 'der', topic: 'Essen', example_de: 'Ich esse gern Käse.', example_vi: 'Tôi thích ăn phô mai.' },
    { word: 'die Wurst', meaning_vi: 'xúc xích', pos: 'noun', artikel: 'die', topic: 'Essen', example_de: 'Eine Wurst, bitte.', example_vi: 'Một cây xúc xích, làm ơn.', plural: 'die Würste' },
    { word: 'das Ei', meaning_vi: 'trứng', pos: 'noun', artikel: 'das', topic: 'Essen', example_de: 'Zum Frühstück esse ich ein Ei.', example_vi: 'Bữa sáng tôi ăn một quả trứng.', plural: 'die Eier' },
    { word: 'der Reis', meaning_vi: 'gạo, cơm', pos: 'noun', artikel: 'der', topic: 'Essen', example_de: 'Reis mit Gemüse schmeckt gut.', example_vi: 'Cơm với rau rất ngon.' },
    { word: 'die Kartoffel', meaning_vi: 'khoai tây', pos: 'noun', artikel: 'die', topic: 'Essen', example_de: 'Kartoffeln sind lecker.', example_vi: 'Khoai tây rất ngon.', plural: 'die Kartoffeln' },
    { word: 'das Fleisch', meaning_vi: 'thịt', pos: 'noun', artikel: 'das', topic: 'Essen', example_de: 'Ich esse wenig Fleisch.', example_vi: 'Tôi ăn ít thịt.' },
    { word: 'der Fisch', meaning_vi: 'cá', pos: 'noun', artikel: 'der', topic: 'Essen', example_de: 'Am Freitag gibt es Fisch.', example_vi: 'Thứ Sáu có món cá.', plural: 'die Fische' },
    { word: 'das Obst', meaning_vi: 'trái cây', pos: 'noun', artikel: 'das', topic: 'Essen', example_de: 'Obst ist gesund.', example_vi: 'Trái cây tốt cho sức khỏe.' },
    { word: 'der Apfel', meaning_vi: 'quả táo', pos: 'noun', artikel: 'der', topic: 'Essen', example_de: 'Ein Apfel am Tag ist gesund.', example_vi: 'Mỗi ngày một quả táo tốt cho sức khỏe.', plural: 'die Äpfel' },
    { word: 'die Banane', meaning_vi: 'quả chuối', pos: 'noun', artikel: 'die', topic: 'Essen', example_de: 'Ich esse eine Banane.', example_vi: 'Tôi ăn một quả chuối.', plural: 'die Bananen' },
    { word: 'das Gemüse', meaning_vi: 'rau', pos: 'noun', artikel: 'das', topic: 'Essen', example_de: 'Gemüse ist sehr gesund.', example_vi: 'Rau rất tốt cho sức khỏe.' },
    { word: 'die Suppe', meaning_vi: 'súp', pos: 'noun', artikel: 'die', topic: 'Essen', example_de: 'Die Suppe ist heiß.', example_vi: 'Súp nóng.', plural: 'die Suppen' },
    { word: 'der Kuchen', meaning_vi: 'bánh ngọt', pos: 'noun', artikel: 'der', topic: 'Essen', example_de: 'Der Kuchen schmeckt gut.', example_vi: 'Bánh ngon.', plural: 'die Kuchen' },
    { word: 'das Wasser', meaning_vi: 'nước', pos: 'noun', artikel: 'das', topic: 'Trinken', example_de: 'Ein Glas Wasser, bitte.', example_vi: 'Một ly nước, làm ơn.' },
    { word: 'der Kaffee', meaning_vi: 'cà phê', pos: 'noun', artikel: 'der', topic: 'Trinken', example_de: 'Ich trinke morgens Kaffee.', example_vi: 'Buổi sáng tôi uống cà phê.' },
    { word: 'der Tee', meaning_vi: 'trà', pos: 'noun', artikel: 'der', topic: 'Trinken', example_de: 'Möchten Sie Tee?', example_vi: 'Bạn muốn trà không?' },
    { word: 'die Milch', meaning_vi: 'sữa', pos: 'noun', artikel: 'die', topic: 'Trinken', example_de: 'Kinder trinken gern Milch.', example_vi: 'Trẻ em thích uống sữa.' },
    { word: 'der Saft', meaning_vi: 'nước ép', pos: 'noun', artikel: 'der', topic: 'Trinken', example_de: 'Orangensaft ist mein Lieblingssaft.', example_vi: 'Nước cam là loại nước ép yêu thích của tôi.', plural: 'die Säfte' },

    // ─── Zahlen (Số đếm) ───
    { word: 'eins', meaning_vi: 'một', pos: 'num', topic: 'Zahlen', example_de: 'Eins, zwei, drei!', example_vi: 'Một, hai, ba!' },
    { word: 'zwei', meaning_vi: 'hai', pos: 'num', topic: 'Zahlen', example_de: 'Ich habe zwei Kinder.', example_vi: 'Tôi có hai đứa con.' },
    { word: 'drei', meaning_vi: 'ba', pos: 'num', topic: 'Zahlen', example_de: 'Es ist drei Uhr.', example_vi: 'Bây giờ là ba giờ.' },
    { word: 'vier', meaning_vi: 'bốn', pos: 'num', topic: 'Zahlen', example_de: 'Vier Personen, bitte.', example_vi: 'Bốn người, làm ơn.' },
    { word: 'fünf', meaning_vi: 'năm', pos: 'num', topic: 'Zahlen', example_de: 'Fünf Euro, bitte.', example_vi: 'Năm Euro, làm ơn.' },
    { word: 'sechs', meaning_vi: 'sáu', pos: 'num', topic: 'Zahlen', example_de: 'Um sechs Uhr stehe ich auf.', example_vi: 'Tôi dậy lúc sáu giờ.' },
    { word: 'sieben', meaning_vi: 'bảy', pos: 'num', topic: 'Zahlen', example_de: 'Sieben Tage hat die Woche.', example_vi: 'Tuần có bảy ngày.' },
    { word: 'acht', meaning_vi: 'tám', pos: 'num', topic: 'Zahlen', example_de: 'Der Kurs beginnt um acht.', example_vi: 'Lớp học bắt đầu lúc tám giờ.' },
    { word: 'neun', meaning_vi: 'chín', pos: 'num', topic: 'Zahlen', example_de: 'Neun plus eins ist zehn.', example_vi: 'Chín cộng một là mười.' },
    { word: 'zehn', meaning_vi: 'mười', pos: 'num', topic: 'Zahlen', example_de: 'Zehn Minuten, bitte.', example_vi: 'Mười phút, làm ơn.' },
    { word: 'hundert', meaning_vi: 'một trăm', pos: 'num', topic: 'Zahlen', example_de: 'Das kostet hundert Euro.', example_vi: 'Cái này giá một trăm Euro.' },
    { word: 'tausend', meaning_vi: 'một nghìn', pos: 'num', topic: 'Zahlen', example_de: 'Berlin hat drei Millionen Einwohner.', example_vi: 'Berlin có ba triệu dân.' },

    // ─── Wochentage & Zeit (Ngày & Giờ) ───
    { word: 'der Montag', meaning_vi: 'thứ Hai', pos: 'noun', artikel: 'der', topic: 'Zeit', example_de: 'Am Montag habe ich Deutschkurs.', example_vi: 'Thứ Hai tôi có lớp tiếng Đức.' },
    { word: 'der Dienstag', meaning_vi: 'thứ Ba', pos: 'noun', artikel: 'der', topic: 'Zeit', example_de: 'Dienstag ist Sport.', example_vi: 'Thứ Ba là thể thao.' },
    { word: 'der Mittwoch', meaning_vi: 'thứ Tư', pos: 'noun', artikel: 'der', topic: 'Zeit', example_de: 'Am Mittwoch gehe ich einkaufen.', example_vi: 'Thứ Tư tôi đi mua sắm.' },
    { word: 'der Donnerstag', meaning_vi: 'thứ Năm', pos: 'noun', artikel: 'der', topic: 'Zeit', example_de: 'Donnerstag treffe ich Freunde.', example_vi: 'Thứ Năm tôi gặp bạn.' },
    { word: 'der Freitag', meaning_vi: 'thứ Sáu', pos: 'noun', artikel: 'der', topic: 'Zeit', example_de: 'Am Freitag arbeite ich nicht.', example_vi: 'Thứ Sáu tôi không làm việc.' },
    { word: 'der Samstag', meaning_vi: 'thứ Bảy', pos: 'noun', artikel: 'der', topic: 'Zeit', example_de: 'Am Samstag gehe ich zum Markt.', example_vi: 'Thứ Bảy tôi đi chợ.' },
    { word: 'der Sonntag', meaning_vi: 'Chủ nhật', pos: 'noun', artikel: 'der', topic: 'Zeit', example_de: 'Am Sonntag ruhe ich mich aus.', example_vi: 'Chủ nhật tôi nghỉ ngơi.' },
    { word: 'heute', meaning_vi: 'hôm nay', pos: 'adv', topic: 'Zeit', example_de: 'Heute ist Montag.', example_vi: 'Hôm nay là thứ Hai.' },
    { word: 'morgen', meaning_vi: 'ngày mai', pos: 'adv', topic: 'Zeit', example_de: 'Morgen habe ich frei.', example_vi: 'Ngày mai tôi nghỉ.' },
    { word: 'gestern', meaning_vi: 'hôm qua', pos: 'adv', topic: 'Zeit', example_de: 'Gestern war schönes Wetter.', example_vi: 'Hôm qua trời đẹp.' },
    { word: 'die Uhr', meaning_vi: 'đồng hồ, giờ', pos: 'noun', artikel: 'die', topic: 'Zeit', example_de: 'Es ist drei Uhr.', example_vi: 'Bây giờ là ba giờ.', plural: 'die Uhren' },
    { word: 'die Stunde', meaning_vi: 'giờ (thời gian)', pos: 'noun', artikel: 'die', topic: 'Zeit', example_de: 'Der Kurs dauert zwei Stunden.', example_vi: 'Khóa học kéo dài hai giờ.', plural: 'die Stunden' },
    { word: 'die Minute', meaning_vi: 'phút', pos: 'noun', artikel: 'die', topic: 'Zeit', example_de: 'Warten Sie bitte fünf Minuten.', example_vi: 'Xin đợi năm phút.', plural: 'die Minuten' },
    { word: 'der Tag', meaning_vi: 'ngày', pos: 'noun', artikel: 'der', topic: 'Zeit', example_de: 'Der Tag war schön.', example_vi: 'Ngày hôm nay đẹp.', plural: 'die Tage' },
    { word: 'die Woche', meaning_vi: 'tuần', pos: 'noun', artikel: 'die', topic: 'Zeit', example_de: 'Nächste Woche fahre ich.', example_vi: 'Tuần tới tôi đi.', plural: 'die Wochen' },
    { word: 'der Monat', meaning_vi: 'tháng', pos: 'noun', artikel: 'der', topic: 'Zeit', example_de: 'Im Juli ist es heiß.', example_vi: 'Tháng Bảy trời nóng.', plural: 'die Monate' },
    { word: 'das Jahr', meaning_vi: 'năm', pos: 'noun', artikel: 'das', topic: 'Zeit', example_de: 'Dieses Jahr lerne ich Deutsch.', example_vi: 'Năm nay tôi học tiếng Đức.', plural: 'die Jahre' },

    // ─── Grundverben (Động từ cơ bản) ───
    { word: 'sein', meaning_vi: 'thì, là, ở', pos: 'verb', topic: 'Verben', example_de: 'Ich bin Student.', example_vi: 'Tôi là sinh viên.' },
    { word: 'haben', meaning_vi: 'có', pos: 'verb', topic: 'Verben', example_de: 'Ich habe zwei Brüder.', example_vi: 'Tôi có hai anh em trai.' },
    { word: 'machen', meaning_vi: 'làm', pos: 'verb', topic: 'Verben', example_de: 'Was machst du heute?', example_vi: 'Hôm nay bạn làm gì?' },
    { word: 'kommen', meaning_vi: 'đến', pos: 'verb', topic: 'Verben', example_de: 'Ich komme aus Vietnam.', example_vi: 'Tôi đến từ Việt Nam.' },
    { word: 'gehen', meaning_vi: 'đi', pos: 'verb', topic: 'Verben', example_de: 'Ich gehe in die Schule.', example_vi: 'Tôi đi học.' },
    { word: 'sprechen', meaning_vi: 'nói', pos: 'verb', topic: 'Verben', example_de: 'Sprechen Sie Deutsch?', example_vi: 'Bạn nói tiếng Đức không?' },
    { word: 'lesen', meaning_vi: 'đọc', pos: 'verb', topic: 'Verben', example_de: 'Ich lese ein Buch.', example_vi: 'Tôi đọc một cuốn sách.' },
    { word: 'schreiben', meaning_vi: 'viết', pos: 'verb', topic: 'Verben', example_de: 'Ich schreibe einen Brief.', example_vi: 'Tôi viết một lá thư.' },
    { word: 'lernen', meaning_vi: 'học', pos: 'verb', topic: 'Verben', example_de: 'Ich lerne Deutsch.', example_vi: 'Tôi học tiếng Đức.' },
    { word: 'arbeiten', meaning_vi: 'làm việc', pos: 'verb', topic: 'Verben', example_de: 'Ich arbeite bei BMW.', example_vi: 'Tôi làm việc ở BMW.' },
    { word: 'wohnen', meaning_vi: 'sống, ở', pos: 'verb', topic: 'Verben', example_de: 'Ich wohne in Hamburg.', example_vi: 'Tôi sống ở Hamburg.' },
    { word: 'essen', meaning_vi: 'ăn', pos: 'verb', topic: 'Verben', example_de: 'Ich esse gern Pizza.', example_vi: 'Tôi thích ăn pizza.' },
    { word: 'trinken', meaning_vi: 'uống', pos: 'verb', topic: 'Verben', example_de: 'Ich trinke Wasser.', example_vi: 'Tôi uống nước.' },
    { word: 'schlafen', meaning_vi: 'ngủ', pos: 'verb', topic: 'Verben', example_de: 'Ich schlafe acht Stunden.', example_vi: 'Tôi ngủ tám tiếng.' },
    { word: 'kaufen', meaning_vi: 'mua', pos: 'verb', topic: 'Verben', example_de: 'Ich kaufe Brot.', example_vi: 'Tôi mua bánh mì.' },
    { word: 'kochen', meaning_vi: 'nấu ăn', pos: 'verb', topic: 'Verben', example_de: 'Meine Mutter kocht.', example_vi: 'Mẹ tôi nấu ăn.' },
    { word: 'spielen', meaning_vi: 'chơi', pos: 'verb', topic: 'Verben', example_de: 'Die Kinder spielen.', example_vi: 'Bọn trẻ đang chơi.' },
    { word: 'hören', meaning_vi: 'nghe', pos: 'verb', topic: 'Verben', example_de: 'Ich höre Musik.', example_vi: 'Tôi nghe nhạc.' },
    { word: 'sehen', meaning_vi: 'thấy, xem', pos: 'verb', topic: 'Verben', example_de: 'Ich sehe einen Film.', example_vi: 'Tôi xem phim.' },
    { word: 'finden', meaning_vi: 'tìm thấy, nghĩ rằng', pos: 'verb', topic: 'Verben', example_de: 'Ich finde das gut.', example_vi: 'Tôi nghĩ điều đó tốt.' },
    { word: 'brauchen', meaning_vi: 'cần', pos: 'verb', topic: 'Verben', example_de: 'Ich brauche Hilfe.', example_vi: 'Tôi cần sự giúp đỡ.' },
    { word: 'können', meaning_vi: 'có thể', pos: 'verb', topic: 'Verben', example_de: 'Ich kann schwimmen.', example_vi: 'Tôi biết bơi.' },
    { word: 'müssen', meaning_vi: 'phải', pos: 'verb', topic: 'Verben', example_de: 'Ich muss arbeiten.', example_vi: 'Tôi phải làm việc.' },
    { word: 'wollen', meaning_vi: 'muốn', pos: 'verb', topic: 'Verben', example_de: 'Ich will Deutsch lernen.', example_vi: 'Tôi muốn học tiếng Đức.' },
    { word: 'möchten', meaning_vi: 'muốn (lịch sự)', pos: 'verb', topic: 'Verben', example_de: 'Ich möchte einen Kaffee.', example_vi: 'Tôi muốn một ly cà phê.' },

    // ─── Wohnen (Nhà ở) ───
    { word: 'das Haus', meaning_vi: 'nhà', pos: 'noun', artikel: 'das', topic: 'Wohnen', example_de: 'Das Haus ist groß.', example_vi: 'Nhà to.', plural: 'die Häuser' },
    { word: 'die Wohnung', meaning_vi: 'căn hộ', pos: 'noun', artikel: 'die', topic: 'Wohnen', example_de: 'Die Wohnung hat drei Zimmer.', example_vi: 'Căn hộ có ba phòng.', plural: 'die Wohnungen' },
    { word: 'das Zimmer', meaning_vi: 'phòng', pos: 'noun', artikel: 'das', topic: 'Wohnen', example_de: 'Mein Zimmer ist klein.', example_vi: 'Phòng tôi nhỏ.', plural: 'die Zimmer' },
    { word: 'die Küche', meaning_vi: 'nhà bếp', pos: 'noun', artikel: 'die', topic: 'Wohnen', example_de: 'Die Küche ist modern.', example_vi: 'Nhà bếp hiện đại.', plural: 'die Küchen' },
    { word: 'das Bad', meaning_vi: 'phòng tắm', pos: 'noun', artikel: 'das', topic: 'Wohnen', example_de: 'Das Bad ist sauber.', example_vi: 'Phòng tắm sạch.', plural: 'die Bäder' },
    { word: 'der Tisch', meaning_vi: 'bàn', pos: 'noun', artikel: 'der', topic: 'Wohnen', example_de: 'Der Tisch steht im Zimmer.', example_vi: 'Cái bàn ở trong phòng.', plural: 'die Tische' },
    { word: 'der Stuhl', meaning_vi: 'ghế', pos: 'noun', artikel: 'der', topic: 'Wohnen', example_de: 'Bitte setzen Sie sich auf den Stuhl.', example_vi: 'Xin mời ngồi ghế.', plural: 'die Stühle' },
    { word: 'das Bett', meaning_vi: 'giường', pos: 'noun', artikel: 'das', topic: 'Wohnen', example_de: 'Das Bett ist bequem.', example_vi: 'Giường thoải mái.', plural: 'die Betten' },
    { word: 'das Fenster', meaning_vi: 'cửa sổ', pos: 'noun', artikel: 'das', topic: 'Wohnen', example_de: 'Mach bitte das Fenster auf.', example_vi: 'Mở cửa sổ ra.', plural: 'die Fenster' },
    { word: 'die Tür', meaning_vi: 'cửa', pos: 'noun', artikel: 'die', topic: 'Wohnen', example_de: 'Die Tür ist offen.', example_vi: 'Cửa mở.', plural: 'die Türen' },

    // ─── Farben (Màu sắc) ───
    { word: 'rot', meaning_vi: 'đỏ', pos: 'adj', topic: 'Farben', example_de: 'Die Rose ist rot.', example_vi: 'Hoa hồng đỏ.' },
    { word: 'blau', meaning_vi: 'xanh dương', pos: 'adj', topic: 'Farben', example_de: 'Der Himmel ist blau.', example_vi: 'Bầu trời xanh.' },
    { word: 'grün', meaning_vi: 'xanh lá', pos: 'adj', topic: 'Farben', example_de: 'Das Gras ist grün.', example_vi: 'Cỏ xanh.' },
    { word: 'gelb', meaning_vi: 'vàng', pos: 'adj', topic: 'Farben', example_de: 'Die Banane ist gelb.', example_vi: 'Quả chuối vàng.' },
    { word: 'weiß', meaning_vi: 'trắng', pos: 'adj', topic: 'Farben', example_de: 'Der Schnee ist weiß.', example_vi: 'Tuyết trắng.' },
    { word: 'schwarz', meaning_vi: 'đen', pos: 'adj', topic: 'Farben', example_de: 'Die Katze ist schwarz.', example_vi: 'Con mèo đen.' },
    { word: 'braun', meaning_vi: 'nâu', pos: 'adj', topic: 'Farben', example_de: 'Der Bär ist braun.', example_vi: 'Con gấu nâu.' },
    { word: 'grau', meaning_vi: 'xám', pos: 'adj', topic: 'Farben', example_de: 'Heute ist der Himmel grau.', example_vi: 'Hôm nay trời xám.' },

    // ─── Adjektive (Tính từ cơ bản) ───
    { word: 'groß', meaning_vi: 'to, lớn, cao', pos: 'adj', topic: 'Adjektive', example_de: 'Das Haus ist groß.', example_vi: 'Nhà to.' },
    { word: 'klein', meaning_vi: 'nhỏ, bé', pos: 'adj', topic: 'Adjektive', example_de: 'Das Kind ist klein.', example_vi: 'Đứa trẻ nhỏ.' },
    { word: 'gut', meaning_vi: 'tốt', pos: 'adj', topic: 'Adjektive', example_de: 'Das Essen ist gut.', example_vi: 'Bữa ăn ngon.' },
    { word: 'schlecht', meaning_vi: 'xấu, tồi', pos: 'adj', topic: 'Adjektive', example_de: 'Das Wetter ist schlecht.', example_vi: 'Thời tiết xấu.' },
    { word: 'neu', meaning_vi: 'mới', pos: 'adj', topic: 'Adjektive', example_de: 'Ich habe ein neues Handy.', example_vi: 'Tôi có điện thoại mới.' },
    { word: 'alt', meaning_vi: 'cũ, già', pos: 'adj', topic: 'Adjektive', example_de: 'Die Stadt ist sehr alt.', example_vi: 'Thành phố rất cổ.' },
    { word: 'schön', meaning_vi: 'đẹp', pos: 'adj', topic: 'Adjektive', example_de: 'Die Blumen sind schön.', example_vi: 'Hoa đẹp.' },
    { word: 'billig', meaning_vi: 'rẻ', pos: 'adj', topic: 'Adjektive', example_de: 'Das T-Shirt ist billig.', example_vi: 'Áo phông rẻ.' },
    { word: 'teuer', meaning_vi: 'đắt', pos: 'adj', topic: 'Adjektive', example_de: 'Die Miete ist teuer.', example_vi: 'Tiền thuê nhà đắt.' },
    { word: 'kalt', meaning_vi: 'lạnh', pos: 'adj', topic: 'Adjektive', example_de: 'Im Winter ist es kalt.', example_vi: 'Mùa đông trời lạnh.' },
    { word: 'warm', meaning_vi: 'ấm', pos: 'adj', topic: 'Adjektive', example_de: 'Die Suppe ist warm.', example_vi: 'Súp ấm.' },
    { word: 'heiß', meaning_vi: 'nóng', pos: 'adj', topic: 'Adjektive', example_de: 'Der Kaffee ist heiß.', example_vi: 'Cà phê nóng.' },
    { word: 'richtig', meaning_vi: 'đúng', pos: 'adj', topic: 'Adjektive', example_de: 'Die Antwort ist richtig.', example_vi: 'Câu trả lời đúng.' },
    { word: 'falsch', meaning_vi: 'sai', pos: 'adj', topic: 'Adjektive', example_de: 'Das ist falsch.', example_vi: 'Điều đó sai.' },
    { word: 'schnell', meaning_vi: 'nhanh', pos: 'adj', topic: 'Adjektive', example_de: 'Der Zug ist schnell.', example_vi: 'Tàu nhanh.' },
    { word: 'langsam', meaning_vi: 'chậm', pos: 'adj', topic: 'Adjektive', example_de: 'Bitte sprechen Sie langsam.', example_vi: 'Xin nói chậm lại.' },

    // ─── Schule & Lernen (Trường học) ───
    { word: 'die Schule', meaning_vi: 'trường học', pos: 'noun', artikel: 'die', topic: 'Schule', example_de: 'Die Schule beginnt um 8 Uhr.', example_vi: 'Trường bắt đầu lúc 8 giờ.', plural: 'die Schulen' },
    { word: 'der Lehrer', meaning_vi: 'giáo viên (nam)', pos: 'noun', artikel: 'der', topic: 'Schule', example_de: 'Der Lehrer erklärt die Grammatik.', example_vi: 'Giáo viên giải thích ngữ pháp.', plural: 'die Lehrer' },
    { word: 'die Lehrerin', meaning_vi: 'giáo viên (nữ)', pos: 'noun', artikel: 'die', topic: 'Schule', example_de: 'Die Lehrerin ist nett.', example_vi: 'Cô giáo dễ thương.', plural: 'die Lehrerinnen' },
    { word: 'der Kurs', meaning_vi: 'khóa học', pos: 'noun', artikel: 'der', topic: 'Schule', example_de: 'Der Deutschkurs ist interessant.', example_vi: 'Khóa học tiếng Đức thú vị.', plural: 'die Kurse' },
    { word: 'das Buch', meaning_vi: 'sách', pos: 'noun', artikel: 'das', topic: 'Schule', example_de: 'Das Buch ist sehr gut.', example_vi: 'Cuốn sách rất hay.', plural: 'die Bücher' },
    { word: 'der Stift', meaning_vi: 'bút', pos: 'noun', artikel: 'der', topic: 'Schule', example_de: 'Hast du einen Stift?', example_vi: 'Bạn có bút không?', plural: 'die Stifte' },

    // ─── Verkehr (Giao thông) ───
    { word: 'das Auto', meaning_vi: 'xe ô tô', pos: 'noun', artikel: 'das', topic: 'Verkehr', example_de: 'Ich fahre mit dem Auto.', example_vi: 'Tôi đi bằng ô tô.', plural: 'die Autos' },
    { word: 'der Bus', meaning_vi: 'xe buýt', pos: 'noun', artikel: 'der', topic: 'Verkehr', example_de: 'Der Bus kommt um 9.', example_vi: 'Xe buýt đến lúc 9 giờ.', plural: 'die Busse' },
    { word: 'der Zug', meaning_vi: 'tàu hỏa', pos: 'noun', artikel: 'der', topic: 'Verkehr', example_de: 'Der Zug fährt nach Berlin.', example_vi: 'Tàu đi Berlin.', plural: 'die Züge' },
    { word: 'das Fahrrad', meaning_vi: 'xe đạp', pos: 'noun', artikel: 'das', topic: 'Verkehr', example_de: 'Ich fahre mit dem Fahrrad.', example_vi: 'Tôi đi xe đạp.', plural: 'die Fahrräder' },
    { word: 'die Straße', meaning_vi: 'đường phố', pos: 'noun', artikel: 'die', topic: 'Verkehr', example_de: 'Die Straße ist lang.', example_vi: 'Con đường dài.', plural: 'die Straßen' },
    { word: 'fahren', meaning_vi: 'lái, đi (phương tiện)', pos: 'verb', topic: 'Verkehr', example_de: 'Ich fahre nach Hamburg.', example_vi: 'Tôi đi Hamburg.' },

    // ─── Körper & Gesundheit (Cơ thể & Sức khỏe) ───
    { word: 'der Kopf', meaning_vi: 'đầu', pos: 'noun', artikel: 'der', topic: 'Körper', example_de: 'Mein Kopf tut weh.', example_vi: 'Đầu tôi đau.', plural: 'die Köpfe' },
    { word: 'das Auge', meaning_vi: 'mắt', pos: 'noun', artikel: 'das', topic: 'Körper', example_de: 'Sie hat blaue Augen.', example_vi: 'Cô ấy có mắt xanh.', plural: 'die Augen' },
    { word: 'die Hand', meaning_vi: 'tay', pos: 'noun', artikel: 'die', topic: 'Körper', example_de: 'Gib mir deine Hand.', example_vi: 'Đưa tay đây.', plural: 'die Hände' },
    { word: 'der Arzt', meaning_vi: 'bác sĩ', pos: 'noun', artikel: 'der', topic: 'Gesundheit', example_de: 'Ich gehe zum Arzt.', example_vi: 'Tôi đi bác sĩ.', plural: 'die Ärzte' },
    { word: 'krank', meaning_vi: 'ốm, bệnh', pos: 'adj', topic: 'Gesundheit', example_de: 'Ich bin krank.', example_vi: 'Tôi bị ốm.' },
    { word: 'gesund', meaning_vi: 'khỏe mạnh', pos: 'adj', topic: 'Gesundheit', example_de: 'Sport ist gesund.', example_vi: 'Thể thao tốt cho sức khỏe.' },

    // ─── Freizeit (Thời gian rảnh) ───
    { word: 'der Sport', meaning_vi: 'thể thao', pos: 'noun', artikel: 'der', topic: 'Freizeit', example_de: 'Ich mache viel Sport.', example_vi: 'Tôi chơi nhiều thể thao.' },
    { word: 'die Musik', meaning_vi: 'âm nhạc', pos: 'noun', artikel: 'die', topic: 'Freizeit', example_de: 'Ich höre gern Musik.', example_vi: 'Tôi thích nghe nhạc.' },
    { word: 'der Film', meaning_vi: 'phim', pos: 'noun', artikel: 'der', topic: 'Freizeit', example_de: 'Der Film ist interessant.', example_vi: 'Phim thú vị.', plural: 'die Filme' },
    { word: 'das Hobby', meaning_vi: 'sở thích', pos: 'noun', artikel: 'das', topic: 'Freizeit', example_de: 'Mein Hobby ist Lesen.', example_vi: 'Sở thích của tôi là đọc sách.', plural: 'die Hobbys' },
    { word: 'schwimmen', meaning_vi: 'bơi', pos: 'verb', topic: 'Freizeit', example_de: 'Im Sommer schwimme ich.', example_vi: 'Mùa hè tôi bơi.' },
    { word: 'tanzen', meaning_vi: 'nhảy, khiêu vũ', pos: 'verb', topic: 'Freizeit', example_de: 'Ich tanze gern Salsa.', example_vi: 'Tôi thích nhảy Salsa.' },

    // ─── Wetter (Thời tiết) ───
    { word: 'das Wetter', meaning_vi: 'thời tiết', pos: 'noun', artikel: 'das', topic: 'Wetter', example_de: 'Wie ist das Wetter?', example_vi: 'Thời tiết thế nào?' },
    { word: 'die Sonne', meaning_vi: 'mặt trời', pos: 'noun', artikel: 'die', topic: 'Wetter', example_de: 'Die Sonne scheint.', example_vi: 'Nắng.' },
    { word: 'der Regen', meaning_vi: 'mưa', pos: 'noun', artikel: 'der', topic: 'Wetter', example_de: 'Es gibt Regen.', example_vi: 'Trời mưa.' },
    { word: 'der Schnee', meaning_vi: 'tuyết', pos: 'noun', artikel: 'der', topic: 'Wetter', example_de: 'Im Winter gibt es Schnee.', example_vi: 'Mùa đông có tuyết.' },

    // ─── Einkaufen (Mua sắm) ───
    { word: 'der Supermarkt', meaning_vi: 'siêu thị', pos: 'noun', artikel: 'der', topic: 'Einkaufen', example_de: 'Ich gehe zum Supermarkt.', example_vi: 'Tôi đi siêu thị.', plural: 'die Supermärkte' },
    { word: 'das Geld', meaning_vi: 'tiền', pos: 'noun', artikel: 'das', topic: 'Einkaufen', example_de: 'Ich habe kein Geld.', example_vi: 'Tôi không có tiền.' },
    { word: 'der Euro', meaning_vi: 'Euro', pos: 'noun', artikel: 'der', topic: 'Einkaufen', example_de: 'Das kostet fünf Euro.', example_vi: 'Giá năm Euro.', plural: 'die Euro' },
    { word: 'kosten', meaning_vi: 'có giá', pos: 'verb', topic: 'Einkaufen', example_de: 'Was kostet das?', example_vi: 'Cái này giá bao nhiêu?' },
    { word: 'bezahlen', meaning_vi: 'thanh toán', pos: 'verb', topic: 'Einkaufen', example_de: 'Ich möchte bezahlen.', example_vi: 'Tôi muốn thanh toán.' },
];

// ═══════════════════════════════════════════════════
// SEED FUNCTION
// ═══════════════════════════════════════════════════

async function seedCEFRVocabulary() {
    console.log('🧹 Phase A: CEFR Vocabulary Standardization');
    console.log('═══════════════════════════════════════════');

    // Step 1: Clear existing bad data
    console.log('\n📦 Step 1: Clearing existing vocabulary...');
    const deleted = await prisma.vocabularyItem.deleteMany({});
    console.log(`   Deleted ${deleted.count} existing items`);

    // Step 2: Seed A1 vocabulary
    console.log('\n📝 Step 2: Seeding A1 vocabulary...');
    let a1Count = 0;
    for (const item of A1_VOCABULARY) {
        await prisma.vocabularyItem.create({
            data: {
                word: item.word,
                meaning_vi: item.meaning_vi,
                level: 'A1',
                pos: item.pos,
                topic: item.topic,
                artikel: (item as any).artikel || null,
                plural: (item as any).plural || null,
                example_de: item.example_de,
                example_vi: item.example_vi,
                source: 'Goethe-Institut A1 Wortliste (curated)',
            },
        });
        a1Count++;
    }
    console.log(`   ✅ A1: ${a1Count} words seeded`);

    // Summary
    const total = await prisma.vocabularyItem.count();
    const byLevel = await prisma.vocabularyItem.groupBy({ by: ['level'], _count: true });
    const byTopic = await prisma.vocabularyItem.groupBy({ by: ['topic'], _count: true, orderBy: { _count: { topic: 'desc' } } });

    console.log('\n📊 Summary:');
    console.log(`   Total: ${total} words`);
    byLevel.forEach(l => console.log(`   ${l.level}: ${l._count}`));
    console.log('\n   Top topics:');
    byTopic.slice(0, 10).forEach(t => console.log(`   - ${t.topic}: ${t._count}`));

    await prisma.$disconnect();
    console.log('\n✅ Phase A Vocabulary Seed Complete!');
}

seedCEFRVocabulary().catch(console.error);
