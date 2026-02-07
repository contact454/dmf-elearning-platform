#!/usr/bin/env node
/**
 * Mine Vocabulary Batch 6 - C1/C2 Advanced & Academic Words
 * Target: 600+ words for advanced learners
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT = path.join(__dirname, '../data/quality-expansion/batch6-vocabulary.json');

const TOPICS = {
  // C1 Academic Verbs
  c1_academic_verbs: {
    level: 'C1',
    words: [
      { word: 'analysieren', meaning_vi: 'phân tích', pos: 'verb' },
      { word: 'argumentieren', meaning_vi: 'lập luận', pos: 'verb' },
      { word: 'beurteilen', meaning_vi: 'đánh giá', pos: 'verb' },
      { word: 'definieren', meaning_vi: 'định nghĩa', pos: 'verb' },
      { word: 'differenzieren', meaning_vi: 'phân biệt', pos: 'verb' },
      { word: 'erläutern', meaning_vi: 'giải thích chi tiết', pos: 'verb' },
      { word: 'formulieren', meaning_vi: 'hình thành', pos: 'verb' },
      { word: 'interpretieren', meaning_vi: 'diễn giải', pos: 'verb' },
      { word: 'klassifizieren', meaning_vi: 'phân loại', pos: 'verb' },
      { word: 'konkretisieren', meaning_vi: 'cụ thể hóa', pos: 'verb' },
      { word: 'legitimieren', meaning_vi: 'hợp pháp hóa', pos: 'verb' },
      { word: 'priorisieren', meaning_vi: 'ưu tiên', pos: 'verb' },
      { word: 'reflektieren', meaning_vi: 'phản ánh', pos: 'verb' },
      { word: 'resümieren', meaning_vi: 'tóm tắt', pos: 'verb' },
      { word: 'strukturieren', meaning_vi: 'cấu trúc', pos: 'verb' },
      { word: 'subsumieren', meaning_vi: 'đưa vào', pos: 'verb' },
      { word: 'thematisieren', meaning_vi: 'nêu lên chủ đề', pos: 'verb' },
      { word: 'validieren', meaning_vi: 'xác nhận', pos: 'verb' },
      { word: 'verifizieren', meaning_vi: 'xác minh', pos: 'verb' },
      { word: 'visualisieren', meaning_vi: 'hình dung', pos: 'verb' },
    ]
  },

  // C1 Abstract Nouns
  c1_abstract_nouns: {
    level: 'C1',
    words: [
      { word: 'Auffassung', meaning_vi: 'quan điểm', pos: 'noun' },
      { word: 'Auseinandersetzung', meaning_vi: 'tranh luận', pos: 'noun' },
      { word: 'Betrachtung', meaning_vi: 'sự xem xét', pos: 'noun' },
      { word: 'Dimension', meaning_vi: 'chiều, khía cạnh', pos: 'noun' },
      { word: 'Einschätzung', meaning_vi: 'đánh giá', pos: 'noun' },
      { word: 'Erkenntnis', meaning_vi: 'nhận thức', pos: 'noun' },
      { word: 'Faktor', meaning_vi: 'yếu tố', pos: 'noun' },
      { word: 'Gegebenheit', meaning_vi: 'thực tế', pos: 'noun' },
      { word: 'Gesamtheit', meaning_vi: 'toàn bộ', pos: 'noun' },
      { word: 'Grundlage', meaning_vi: 'nền tảng', pos: 'noun' },
      { word: 'Hintergrund', meaning_vi: 'bối cảnh', pos: 'noun' },
      { word: 'Kompetenz', meaning_vi: 'năng lực', pos: 'noun' },
      { word: 'Konzept', meaning_vi: 'khái niệm', pos: 'noun' },
      { word: 'Kriterium', meaning_vi: 'tiêu chí', pos: 'noun' },
      { word: 'Maßnahme', meaning_vi: 'biện pháp', pos: 'noun' },
      { word: 'Perspektive', meaning_vi: 'góc nhìn', pos: 'noun' },
      { word: 'Phänomen', meaning_vi: 'hiện tượng', pos: 'noun' },
      { word: 'Prinzip', meaning_vi: 'nguyên tắc', pos: 'noun' },
      { word: 'Rahmen', meaning_vi: 'khuôn khổ', pos: 'noun' },
      { word: 'Spektrum', meaning_vi: 'phổ', pos: 'noun' },
      { word: 'Stellenwert', meaning_vi: 'tầm quan trọng', pos: 'noun' },
      { word: 'Strategie', meaning_vi: 'chiến lược', pos: 'noun' },
      { word: 'Tendenz', meaning_vi: 'xu hướng', pos: 'noun' },
      { word: 'Umfang', meaning_vi: 'phạm vi', pos: 'noun' },
      { word: 'Zusammenhang', meaning_vi: 'mối liên hệ', pos: 'noun' },
    ]
  },

  // C1 Adjectives
  c1_adjectives: {
    level: 'C1',
    words: [
      { word: 'abstrakt', meaning_vi: 'trừu tượng', pos: 'adjective' },
      { word: 'adäquat', meaning_vi: 'phù hợp', pos: 'adjective' },
      { word: 'differenziert', meaning_vi: 'tinh tế', pos: 'adjective' },
      { word: 'empirisch', meaning_vi: 'thực nghiệm', pos: 'adjective' },
      { word: 'evident', meaning_vi: 'hiển nhiên', pos: 'adjective' },
      { word: 'explizit', meaning_vi: 'rõ ràng', pos: 'adjective' },
      { word: 'fundamental', meaning_vi: 'cơ bản', pos: 'adjective' },
      { word: 'implizit', meaning_vi: 'ngầm', pos: 'adjective' },
      { word: 'inherent', meaning_vi: 'vốn có', pos: 'adjective' },
      { word: 'innovativ', meaning_vi: 'đổi mới', pos: 'adjective' },
      { word: 'interdisziplinär', meaning_vi: 'liên ngành', pos: 'adjective' },
      { word: 'komplex', meaning_vi: 'phức tạp', pos: 'adjective' },
      { word: 'konkret', meaning_vi: 'cụ thể', pos: 'adjective' },
      { word: 'objektiv', meaning_vi: 'khách quan', pos: 'adjective' },
      { word: 'präzise', meaning_vi: 'chính xác', pos: 'adjective' },
      { word: 'primär', meaning_vi: 'chính', pos: 'adjective' },
      { word: 'relevant', meaning_vi: 'liên quan', pos: 'adjective' },
      { word: 'signifikant', meaning_vi: 'có ý nghĩa', pos: 'adjective' },
      { word: 'subjektiv', meaning_vi: 'chủ quan', pos: 'adjective' },
      { word: 'systematisch', meaning_vi: 'có hệ thống', pos: 'adjective' },
    ]
  },

  // Philosophy & Ethics
  philosophy_ethics: {
    level: 'C1',
    words: [
      { word: 'Ethik', meaning_vi: 'đạo đức học', pos: 'noun' },
      { word: 'Moral', meaning_vi: 'đạo đức', pos: 'noun' },
      { word: 'Wert', meaning_vi: 'giá trị', pos: 'noun' },
      { word: 'Norm', meaning_vi: 'chuẩn mực', pos: 'noun' },
      { word: 'Pflicht', meaning_vi: 'bổn phận', pos: 'noun' },
      { word: 'Verantwortung', meaning_vi: 'trách nhiệm', pos: 'noun' },
      { word: 'Gewissen', meaning_vi: 'lương tâm', pos: 'noun' },
      { word: 'Tugend', meaning_vi: 'đức hạnh', pos: 'noun' },
      { word: 'Gerechtigkeit', meaning_vi: 'công lý', pos: 'noun' },
      { word: 'Würde', meaning_vi: 'phẩm giá', pos: 'noun' },
      { word: 'Autonomie', meaning_vi: 'tự chủ', pos: 'noun' },
      { word: 'Wahrheit', meaning_vi: 'sự thật', pos: 'noun' },
      { word: 'Vernunft', meaning_vi: 'lý trí', pos: 'noun' },
      { word: 'Bewusstsein', meaning_vi: 'ý thức', pos: 'noun' },
      { word: 'Existenz', meaning_vi: 'tồn tại', pos: 'noun' },
      { word: 'Freiheit', meaning_vi: 'tự do', pos: 'noun' },
      { word: 'Identität', meaning_vi: 'bản sắc', pos: 'noun' },
      { word: 'Erfahrung', meaning_vi: 'trải nghiệm', pos: 'noun' },
      { word: 'Wahrnehmung', meaning_vi: 'nhận thức', pos: 'noun' },
      { word: 'Handlung', meaning_vi: 'hành động', pos: 'noun' },
    ]
  },

  // Psychology & Sociology
  psychology_sociology: {
    level: 'B2',
    words: [
      { word: 'Verhalten', meaning_vi: 'hành vi', pos: 'noun' },
      { word: 'Persönlichkeit', meaning_vi: 'nhân cách', pos: 'noun' },
      { word: 'Motivation', meaning_vi: 'động lực', pos: 'noun' },
      { word: 'Emotion', meaning_vi: 'cảm xúc', pos: 'noun' },
      { word: 'Gedächtnis', meaning_vi: 'trí nhớ', pos: 'noun' },
      { word: 'Intelligenz', meaning_vi: 'trí thông minh', pos: 'noun' },
      { word: 'Kreativität', meaning_vi: 'sáng tạo', pos: 'noun' },
      { word: 'Stress', meaning_vi: 'căng thẳng', pos: 'noun' },
      { word: 'Depression', meaning_vi: 'trầm cảm', pos: 'noun' },
      { word: 'Angst', meaning_vi: 'lo lắng', pos: 'noun' },
      { word: 'Trauma', meaning_vi: 'chấn thương', pos: 'noun' },
      { word: 'Therapie', meaning_vi: 'trị liệu', pos: 'noun' },
      { word: 'Sozialisation', meaning_vi: 'xã hội hóa', pos: 'noun' },
      { word: 'Gruppe', meaning_vi: 'nhóm', pos: 'noun' },
      { word: 'Rolle', meaning_vi: 'vai trò', pos: 'noun' },
      { word: 'Status', meaning_vi: 'địa vị', pos: 'noun' },
      { word: 'Schicht', meaning_vi: 'tầng lớp', pos: 'noun' },
      { word: 'Milieu', meaning_vi: 'môi trường', pos: 'noun' },
      { word: 'Integration', meaning_vi: 'hội nhập', pos: 'noun' },
      { word: 'Diskriminierung', meaning_vi: 'phân biệt đối xử', pos: 'noun' },
    ]
  },

  // Politics & International Relations
  politics_international: {
    level: 'B2',
    words: [
      { word: 'Politik', meaning_vi: 'chính trị', pos: 'noun' },
      { word: 'Partei', meaning_vi: 'đảng phái', pos: 'noun' },
      { word: 'Regierung', meaning_vi: 'chính phủ', pos: 'noun' },
      { word: 'Opposition', meaning_vi: 'phe đối lập', pos: 'noun' },
      { word: 'Koalition', meaning_vi: 'liên minh', pos: 'noun' },
      { word: 'Parlament', meaning_vi: 'quốc hội', pos: 'noun' },
      { word: 'Abgeordneter', meaning_vi: 'đại biểu', pos: 'noun' },
      { word: 'Kanzler', meaning_vi: 'thủ tướng', pos: 'noun' },
      { word: 'Präsident', meaning_vi: 'tổng thống', pos: 'noun' },
      { word: 'Minister', meaning_vi: 'bộ trưởng', pos: 'noun' },
      { word: 'Diplomatie', meaning_vi: 'ngoại giao', pos: 'noun' },
      { word: 'Botschaft', meaning_vi: 'đại sứ quán', pos: 'noun' },
      { word: 'Vertrag', meaning_vi: 'hiệp ước', pos: 'noun' },
      { word: 'Sanktion', meaning_vi: 'trừng phạt', pos: 'noun' },
      { word: 'Konflikt', meaning_vi: 'xung đột', pos: 'noun' },
      { word: 'Verhandlung', meaning_vi: 'đàm phán', pos: 'noun' },
      { word: 'Kompromiss', meaning_vi: 'thỏa hiệp', pos: 'noun' },
      { word: 'Reform', meaning_vi: 'cải cách', pos: 'noun' },
      { word: 'Revolution', meaning_vi: 'cách mạng', pos: 'noun' },
      { word: 'Souveränität', meaning_vi: 'chủ quyền', pos: 'noun' },
    ]
  },

  // Economics Advanced
  economics_advanced: {
    level: 'B2',
    words: [
      { word: 'Konjunktur', meaning_vi: 'kinh tế chu kỳ', pos: 'noun' },
      { word: 'Inflation', meaning_vi: 'lạm phát', pos: 'noun' },
      { word: 'Deflation', meaning_vi: 'giảm phát', pos: 'noun' },
      { word: 'Rezession', meaning_vi: 'suy thoái', pos: 'noun' },
      { word: 'Bruttoinlandsprodukt', meaning_vi: 'GDP', pos: 'noun' },
      { word: 'Arbeitslosigkeit', meaning_vi: 'thất nghiệp', pos: 'noun' },
      { word: 'Subvention', meaning_vi: 'trợ cấp', pos: 'noun' },
      { word: 'Zoll', meaning_vi: 'thuế hải quan', pos: 'noun' },
      { word: 'Währung', meaning_vi: 'tiền tệ', pos: 'noun' },
      { word: 'Wechselkurs', meaning_vi: 'tỷ giá', pos: 'noun' },
      { word: 'Zentralbank', meaning_vi: 'ngân hàng trung ương', pos: 'noun' },
      { word: 'Haushalt', meaning_vi: 'ngân sách', pos: 'noun' },
      { word: 'Schulden', meaning_vi: 'nợ', pos: 'noun' },
      { word: 'Defizit', meaning_vi: 'thâm hụt', pos: 'noun' },
      { word: 'Überschuss', meaning_vi: 'thặng dư', pos: 'noun' },
      { word: 'Monopol', meaning_vi: 'độc quyền', pos: 'noun' },
      { word: 'Kartell', meaning_vi: 'liên minh độc quyền', pos: 'noun' },
      { word: 'Privatisierung', meaning_vi: 'tư nhân hóa', pos: 'noun' },
      { word: 'Globalisierung', meaning_vi: 'toàn cầu hóa', pos: 'noun' },
      { word: 'Liberalisierung', meaning_vi: 'tự do hóa', pos: 'noun' },
    ]
  },

  // Technology Advanced
  technology_advanced: {
    level: 'B2',
    words: [
      { word: 'Algorithmus', meaning_vi: 'thuật toán', pos: 'noun' },
      { word: 'Datenbank', meaning_vi: 'cơ sở dữ liệu', pos: 'noun' },
      { word: 'Server', meaning_vi: 'máy chủ', pos: 'noun' },
      { word: 'Cloud', meaning_vi: 'đám mây', pos: 'noun' },
      { word: 'Schnittstelle', meaning_vi: 'giao diện', pos: 'noun' },
      { word: 'Verschlüsselung', meaning_vi: 'mã hóa', pos: 'noun' },
      { word: 'Cybersicherheit', meaning_vi: 'an ninh mạng', pos: 'noun' },
      { word: 'Künstliche Intelligenz', meaning_vi: 'trí tuệ nhân tạo', pos: 'noun' },
      { word: 'Maschinelles Lernen', meaning_vi: 'học máy', pos: 'noun' },
      { word: 'Automatisierung', meaning_vi: 'tự động hóa', pos: 'noun' },
      { word: 'Robotik', meaning_vi: 'robot học', pos: 'noun' },
      { word: 'Biotechnologie', meaning_vi: 'công nghệ sinh học', pos: 'noun' },
      { word: 'Nanotechnologie', meaning_vi: 'công nghệ nano', pos: 'noun' },
      { word: 'Erneuerbare Energie', meaning_vi: 'năng lượng tái tạo', pos: 'noun' },
      { word: 'Elektromobilität', meaning_vi: 'di chuyển điện', pos: 'noun' },
      { word: 'Digitalisierung', meaning_vi: 'số hóa', pos: 'noun' },
      { word: 'Vernetzung', meaning_vi: 'kết nối mạng', pos: 'noun' },
      { word: 'Innovation', meaning_vi: 'đổi mới', pos: 'noun' },
      { word: 'Forschung', meaning_vi: 'nghiên cứu', pos: 'noun' },
      { word: 'Entwicklung', meaning_vi: 'phát triển', pos: 'noun' },
    ]
  },

  // Arts & Literature
  arts_literature: {
    level: 'B1',
    words: [
      { word: 'Literatur', meaning_vi: 'văn học', pos: 'noun' },
      { word: 'Roman', meaning_vi: 'tiểu thuyết', pos: 'noun' },
      { word: 'Gedicht', meaning_vi: 'bài thơ', pos: 'noun' },
      { word: 'Drama', meaning_vi: 'kịch', pos: 'noun' },
      { word: 'Autor', meaning_vi: 'tác giả', pos: 'noun' },
      { word: 'Dichter', meaning_vi: 'nhà thơ', pos: 'noun' },
      { word: 'Schriftsteller', meaning_vi: 'nhà văn', pos: 'noun' },
      { word: 'Werk', meaning_vi: 'tác phẩm', pos: 'noun' },
      { word: 'Kapitel', meaning_vi: 'chương', pos: 'noun' },
      { word: 'Handlung', meaning_vi: 'cốt truyện', pos: 'noun' },
      { word: 'Figur', meaning_vi: 'nhân vật', pos: 'noun' },
      { word: 'Thema', meaning_vi: 'chủ đề', pos: 'noun' },
      { word: 'Motiv', meaning_vi: 'động cơ', pos: 'noun' },
      { word: 'Stil', meaning_vi: 'phong cách', pos: 'noun' },
      { word: 'Epoche', meaning_vi: 'thời kỳ', pos: 'noun' },
      { word: 'Malerei', meaning_vi: 'hội họa', pos: 'noun' },
      { word: 'Skulptur', meaning_vi: 'điêu khắc', pos: 'noun' },
      { word: 'Architektur', meaning_vi: 'kiến trúc', pos: 'noun' },
      { word: 'Oper', meaning_vi: 'opera', pos: 'noun' },
      { word: 'Orchester', meaning_vi: 'dàn nhạc', pos: 'noun' },
    ]
  },

  // History & Civilization
  history_civilization: {
    level: 'B2',
    words: [
      { word: 'Geschichte', meaning_vi: 'lịch sử', pos: 'noun' },
      { word: 'Zivilisation', meaning_vi: 'văn minh', pos: 'noun' },
      { word: 'Epoche', meaning_vi: 'thời đại', pos: 'noun' },
      { word: 'Jahrhundert', meaning_vi: 'thế kỷ', pos: 'noun' },
      { word: 'Jahrzehnt', meaning_vi: 'thập kỷ', pos: 'noun' },
      { word: 'Antike', meaning_vi: 'cổ đại', pos: 'noun' },
      { word: 'Mittelalter', meaning_vi: 'thời trung cổ', pos: 'noun' },
      { word: 'Renaissance', meaning_vi: 'thời phục hưng', pos: 'noun' },
      { word: 'Aufklärung', meaning_vi: 'thời kỳ khai sáng', pos: 'noun' },
      { word: 'Industrialisierung', meaning_vi: 'công nghiệp hóa', pos: 'noun' },
      { word: 'Kolonialismus', meaning_vi: 'chủ nghĩa thực dân', pos: 'noun' },
      { word: 'Imperialismus', meaning_vi: 'chủ nghĩa đế quốc', pos: 'noun' },
      { word: 'Weltkrieg', meaning_vi: 'chiến tranh thế giới', pos: 'noun' },
      { word: 'Kalter Krieg', meaning_vi: 'chiến tranh lạnh', pos: 'noun' },
      { word: 'Wiedervereinigung', meaning_vi: 'thống nhất', pos: 'noun' },
      { word: 'Denkmal', meaning_vi: 'đài tưởng niệm', pos: 'noun' },
      { word: 'Kulturerbe', meaning_vi: 'di sản văn hóa', pos: 'noun' },
      { word: 'Archäologie', meaning_vi: 'khảo cổ học', pos: 'noun' },
      { word: 'Ausgrabung', meaning_vi: 'khai quật', pos: 'noun' },
      { word: 'Quelle', meaning_vi: 'nguồn sử liệu', pos: 'noun' },
    ]
  },

  // Linking Words & Discourse Markers
  discourse_markers: {
    level: 'B2',
    words: [
      { word: 'folglich', meaning_vi: 'do đó', pos: 'adverb' },
      { word: 'demzufolge', meaning_vi: 'theo đó', pos: 'adverb' },
      { word: 'somit', meaning_vi: 'vì vậy', pos: 'adverb' },
      { word: 'demnach', meaning_vi: 'theo đó', pos: 'adverb' },
      { word: 'hingegen', meaning_vi: 'ngược lại', pos: 'adverb' },
      { word: 'indessen', meaning_vi: 'trong khi đó', pos: 'adverb' },
      { word: 'ferner', meaning_vi: 'hơn nữa', pos: 'adverb' },
      { word: 'zudem', meaning_vi: 'ngoài ra', pos: 'adverb' },
      { word: 'ohnehin', meaning_vi: 'dù sao', pos: 'adverb' },
      { word: 'keineswegs', meaning_vi: 'không hề', pos: 'adverb' },
      { word: 'keinesfalls', meaning_vi: 'trong mọi trường hợp không', pos: 'adverb' },
      { word: 'gegebenenfalls', meaning_vi: 'nếu cần', pos: 'adverb' },
      { word: 'gegebenenfalls', meaning_vi: 'nếu có thể', pos: 'adverb' },
      { word: 'beziehungsweise', meaning_vi: 'hoặc là', pos: 'adverb' },
      { word: 'hinsichtlich', meaning_vi: 'liên quan đến', pos: 'preposition' },
      { word: 'bezüglich', meaning_vi: 'về vấn đề', pos: 'preposition' },
      { word: 'angesichts', meaning_vi: 'trước tình hình', pos: 'preposition' },
      { word: 'infolge', meaning_vi: 'do kết quả của', pos: 'preposition' },
      { word: 'aufgrund', meaning_vi: 'do', pos: 'preposition' },
      { word: 'anhand', meaning_vi: 'dựa vào', pos: 'preposition' },
    ]
  },

  // Common Idioms & Expressions
  idioms_expressions: {
    level: 'B2',
    words: [
      { word: 'eine Rolle spielen', meaning_vi: 'đóng vai trò', pos: 'phrase' },
      { word: 'in Frage kommen', meaning_vi: 'được xem xét', pos: 'phrase' },
      { word: 'in Betracht ziehen', meaning_vi: 'cân nhắc', pos: 'phrase' },
      { word: 'zum Ausdruck bringen', meaning_vi: 'thể hiện', pos: 'phrase' },
      { word: 'zur Verfügung stehen', meaning_vi: 'sẵn sàng', pos: 'phrase' },
      { word: 'in Anspruch nehmen', meaning_vi: 'sử dụng', pos: 'phrase' },
      { word: 'Rücksicht nehmen', meaning_vi: 'quan tâm đến', pos: 'phrase' },
      { word: 'eine Entscheidung treffen', meaning_vi: 'đưa ra quyết định', pos: 'phrase' },
      { word: 'einen Beitrag leisten', meaning_vi: 'đóng góp', pos: 'phrase' },
      { word: 'Einfluss ausüben', meaning_vi: 'gây ảnh hưởng', pos: 'phrase' },
      { word: 'in Zusammenhang stehen', meaning_vi: 'liên quan đến', pos: 'phrase' },
      { word: 'unter Druck stehen', meaning_vi: 'chịu áp lực', pos: 'phrase' },
      { word: 'im Mittelpunkt stehen', meaning_vi: 'ở trung tâm', pos: 'phrase' },
      { word: 'zur Sprache kommen', meaning_vi: 'được đề cập', pos: 'phrase' },
      { word: 'zum Vorschein kommen', meaning_vi: 'xuất hiện', pos: 'phrase' },
    ]
  },

  // More B1 Essential Verbs
  b1_essential_verbs: {
    level: 'B1',
    words: [
      { word: 'abhängen', meaning_vi: 'phụ thuộc', pos: 'verb' },
      { word: 'aufnehmen', meaning_vi: 'tiếp nhận, ghi lại', pos: 'verb' },
      { word: 'auftreten', meaning_vi: 'xuất hiện', pos: 'verb' },
      { word: 'ausdrücken', meaning_vi: 'diễn đạt', pos: 'verb' },
      { word: 'aussprechen', meaning_vi: 'phát âm, nói ra', pos: 'verb' },
      { word: 'beachten', meaning_vi: 'chú ý', pos: 'verb' },
      { word: 'beeinflussen', meaning_vi: 'ảnh hưởng', pos: 'verb' },
      { word: 'behaupten', meaning_vi: 'khẳng định', pos: 'verb' },
      { word: 'bestätigen', meaning_vi: 'xác nhận', pos: 'verb' },
      { word: 'betonen', meaning_vi: 'nhấn mạnh', pos: 'verb' },
      { word: 'darstellen', meaning_vi: 'trình bày', pos: 'verb' },
      { word: 'einführen', meaning_vi: 'giới thiệu', pos: 'verb' },
      { word: 'einrichten', meaning_vi: 'trang bị, thiết lập', pos: 'verb' },
      { word: 'entstehen', meaning_vi: 'hình thành', pos: 'verb' },
      { word: 'ersetzen', meaning_vi: 'thay thế', pos: 'verb' },
      { word: 'festhalten', meaning_vi: 'giữ chặt', pos: 'verb' },
      { word: 'feststellen', meaning_vi: 'xác định', pos: 'verb' },
      { word: 'hinweisen', meaning_vi: 'chỉ ra', pos: 'verb' },
      { word: 'übernehmen', meaning_vi: 'tiếp nhận', pos: 'verb' },
      { word: 'zusammenfassen', meaning_vi: 'tóm tắt', pos: 'verb' },
    ]
  },

  // More B1 Essential Nouns
  b1_essential_nouns: {
    level: 'B1',
    words: [
      { word: 'Anlass', meaning_vi: 'dịp', pos: 'noun' },
      { word: 'Anteil', meaning_vi: 'phần', pos: 'noun' },
      { word: 'Anwendung', meaning_vi: 'ứng dụng', pos: 'noun' },
      { word: 'Aspekt', meaning_vi: 'khía cạnh', pos: 'noun' },
      { word: 'Auswahl', meaning_vi: 'sự lựa chọn', pos: 'noun' },
      { word: 'Bedarf', meaning_vi: 'nhu cầu', pos: 'noun' },
      { word: 'Bedingung', meaning_vi: 'điều kiện', pos: 'noun' },
      { word: 'Begriff', meaning_vi: 'khái niệm', pos: 'noun' },
      { word: 'Bereich', meaning_vi: 'lĩnh vực', pos: 'noun' },
      { word: 'Beispiel', meaning_vi: 'ví dụ', pos: 'noun' },
      { word: 'Beitrag', meaning_vi: 'đóng góp', pos: 'noun' },
      { word: 'Bewertung', meaning_vi: 'đánh giá', pos: 'noun' },
      { word: 'Eigenschaft', meaning_vi: 'đặc điểm', pos: 'noun' },
      { word: 'Einsatz', meaning_vi: 'sử dụng', pos: 'noun' },
      { word: 'Element', meaning_vi: 'yếu tố', pos: 'noun' },
      { word: 'Funktion', meaning_vi: 'chức năng', pos: 'noun' },
      { word: 'Voraussetzung', meaning_vi: 'điều kiện tiên quyết', pos: 'noun' },
      { word: 'Verhältnis', meaning_vi: 'mối quan hệ', pos: 'noun' },
      { word: 'Vorgang', meaning_vi: 'quá trình', pos: 'noun' },
      { word: 'Wirklichkeit', meaning_vi: 'thực tế', pos: 'noun' },
    ]
  },
};

// Generate vocabulary
function generateVocabulary() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║    📚 MINE VOCABULARY BATCH 6 - C1/C2 ADVANCED WORDS       ║');
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
