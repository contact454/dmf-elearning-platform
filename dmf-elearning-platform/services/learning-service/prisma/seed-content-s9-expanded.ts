/**
 * S9 Expanded — Bulk Content Generator
 * Generates 200+ items per skill type using template variations
 * Run: npx tsx prisma/seed-content-s9-expanded.ts
 */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const LEVELS = ['A1', 'A2', 'B1', 'B2'] as const;

const TOPICS: Record<string, string[]> = {
    A1: ['Begrüßung', 'Familie', 'Essen', 'Zahlen', 'Farben', 'Tiere', 'Wetter', 'Kleidung', 'Körper', 'Hobbys', 'Schule', 'Haus', 'Berufe', 'Uhrzeit', 'Einkaufen'],
    A2: ['Einkaufen', 'Reisen', 'Gesundheit', 'Wohnung', 'Arbeit', 'Freizeit', 'Stadt', 'Schule', 'Feste', 'Medien', 'Verkehr', 'Restaurant', 'Nachbarn', 'Urlaub', 'Termine'],
    B1: ['Umwelt', 'Politik', 'Technologie', 'Kultur', 'Bildung', 'Beruf', 'Gesellschaft', 'Sport', 'Musik', 'Film', 'Ernährung', 'Wirtschaft', 'Medien', 'Integration', 'Mobilität'],
    B2: ['Wirtschaft', 'Philosophie', 'Wissenschaft', 'Geschichte', 'Literatur', 'Psychologie', 'Recht', 'Architektur', 'Kunst', 'Globalisierung', 'Ethik', 'Digitalisierung', 'Migration', 'Nachhaltigkeit', 'Urbanisierung'],
};

// Template sentences by level for generating reading content variations
const SENTENCE_BANK: Record<string, string[]> = {
    A1: [
        'Ich heiße {name}. Ich bin {age} Jahre alt.',
        'Ich wohne in {city}. Die Stadt ist schön.',
        'Mein Vater heißt {name}. Er arbeitet als {job}.',
        'Ich esse gern {food}. Es schmeckt gut.',
        'Heute ist das Wetter {weather}.',
        'Ich habe einen {pet}. Er heißt {petname}.',
        'Am Wochenende gehe ich in den {place}.',
        'Meine Lieblingsfarbe ist {color}.',
        'Ich lerne Deutsch. Es macht Spaß.',
        'Guten Morgen! Wie geht es Ihnen?',
        'Ich trinke gern {drink} zum Frühstück.',
        'Meine Schwester ist {age} Jahre alt.',
        'Wir haben {num} Zimmer in unserem Haus.',
        'Der {animal} ist groß und braun.',
        'Ich gehe um {time} Uhr zur Schule.',
    ],
    A2: [
        'Gestern bin ich zum {place} gegangen. Es war sehr schön.',
        'Ich habe {food} gekocht. Meine Familie hat es gern gegessen.',
        'Letztes Jahr bin ich nach {city} gefahren. Die Reise war toll.',
        'Ich möchte gern {activity} lernen, weil es interessant ist.',
        'Am Montag muss ich zum Arzt gehen, weil ich {symptom} habe.',
        'In meiner Freizeit spiele ich oft {sport} mit meinen Freunden.',
        'Die Wohnung hat einen schönen Balkon mit vielen Blumen.',
        'Können Sie mir bitte helfen? Ich suche den {place}.',
        'Das Restaurant war teuer, aber das Essen war ausgezeichnet.',
        'Ich habe einen neuen Job gefunden. Ich arbeite als {job}.',
        'Wir haben ein Fest gefeiert. Es gab Kuchen und Musik.',
        'Der Bus kommt um {time} Uhr. Wir müssen uns beeilen.',
    ],
    B1: [
        'Die Digitalisierung verändert unsere Gesellschaft grundlegend.',
        'Viele Menschen engagieren sich ehrenamtlich für {cause}.',
        'Das Bildungssystem in Deutschland unterscheidet sich von {country}.',
        'Der Klimawandel stellt uns vor große Herausforderungen.',
        'Die Arbeitswelt hat sich durch Homeoffice stark verändert.',
        'Kulturelle Vielfalt bereichert unsere Gesellschaft.',
        'Sport spielt eine wichtige Rolle für die Gesundheit.',
        'Die Medien beeinflussen unsere Meinung erheblich.',
        'Integration erfordert Anstrengungen von beiden Seiten.',
        'Nachhaltiger Konsum wird immer wichtiger.',
    ],
    B2: [
        'Die zunehmende Polarisierung der Gesellschaft gibt Anlass zur Sorge.',
        'Ethische Fragestellungen gewinnen in der Technologiebranche an Bedeutung.',
        'Die Globalisierung hat sowohl positive als auch negative Auswirkungen.',
        'Der demografische Wandel erfordert innovative Lösungsansätze.',
        'Die Rolle der Künstlichen Intelligenz wird kontrovers diskutiert.',
        'Nachhaltige Stadtentwicklung ist eine der zentralen Herausforderungen.',
        'Die Wissenschaftsfreiheit muss gegen politische Einflussnahme verteidigt werden.',
        'Kulturelle Identität in einer globalisierten Welt ist ein komplexes Thema.',
    ],
};

const NAMES = ['Anna', 'Max', 'Lena', 'Tom', 'Marie', 'Paul', 'Sophie', 'Felix', 'Laura', 'David'];
const CITIES = ['Berlin', 'München', 'Hamburg', 'Wien', 'Zürich', 'Köln', 'Frankfurt', 'Dresden', 'Leipzig', 'Stuttgart'];
const FOODS = ['Pizza', 'Pasta', 'Schnitzel', 'Bratwurst', 'Kuchen', 'Suppe', 'Salat', 'Brot', 'Kartoffeln', 'Fisch'];
const JOBS = ['Lehrer', 'Arzt', 'Ingenieur', 'Kellner', 'Koch', 'Verkäufer', 'Programmierer', 'Krankenschwester'];
const WEATHER = ['sonnig', 'regnerisch', 'kalt', 'warm', 'windig', 'bewölkt', 'neblig'];
const COLORS = ['blau', 'rot', 'grün', 'gelb', 'weiß', 'schwarz', 'orange', 'lila'];
const PETS = ['Hund', 'Katze', 'Hamster', 'Vogel', 'Kaninchen'];
const DRINKS = ['Kaffee', 'Tee', 'Milch', 'Orangensaft', 'Wasser'];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function fillTemplate(tpl: string): string {
    return tpl
        .replace('{name}', pick(NAMES)).replace('{age}', String(18 + Math.floor(Math.random() * 40)))
        .replace('{city}', pick(CITIES)).replace('{job}', pick(JOBS))
        .replace('{food}', pick(FOODS)).replace('{weather}', pick(WEATHER))
        .replace('{pet}', pick(PETS)).replace('{petname}', pick(NAMES))
        .replace('{place}', pick(['Park', 'Supermarkt', 'Bahnhof', 'Museum', 'Kino']))
        .replace('{color}', pick(COLORS)).replace('{drink}', pick(DRINKS))
        .replace('{num}', String(2 + Math.floor(Math.random() * 5)))
        .replace('{animal}', pick(PETS)).replace('{time}', String(6 + Math.floor(Math.random() * 12)))
        .replace('{activity}', pick(['Schwimmen', 'Kochen', 'Tanzen', 'Gitarre spielen']))
        .replace('{symptom}', pick(['Kopfschmerzen', 'Fieber', 'Husten', 'Halsschmerzen']))
        .replace('{sport}', pick(['Fußball', 'Tennis', 'Basketball', 'Volleyball']))
        .replace('{cause}', pick(['die Umwelt', 'Flüchtlinge', 'Bildung', 'Tiere']))
        .replace('{country}', pick(['Vietnam', 'Japan', 'Frankreich', 'der Türkei']));
}

function generatePassage(level: string, sentenceCount: number): string {
    const bank = SENTENCE_BANK[level] || SENTENCE_BANK['A1'];
    const sentences: string[] = [];
    for (let i = 0; i < sentenceCount; i++) {
        sentences.push(fillTemplate(pick(bank)));
    }
    return sentences.join(' ');
}

// Speaking prompt templates
const SPEAKING_TEMPLATES: Record<string, Array<{ cat: string; prompt: string; vi: string }>> = {
    A1: [
        { cat: 'conversation', prompt: 'Stellen Sie sich vor: Name, Alter, Herkunft.', vi: 'Giới thiệu bản thân: tên, tuổi, quê.' },
        { cat: 'conversation', prompt: 'Beschreiben Sie Ihre Familie.', vi: 'Mô tả gia đình bạn.' },
        { cat: 'conversation', prompt: 'Was essen Sie zum Frühstück?', vi: 'Bạn ăn gì vào bữa sáng?' },
        { cat: 'pronunciation', prompt: 'Sprechen Sie nach: ich, nicht, möchte, Mädchen.', vi: 'Đọc theo: ich, nicht, möchte, Mädchen.' },
        { cat: 'conversation', prompt: 'Beschreiben Sie Ihr Zimmer.', vi: 'Mô tả phòng của bạn.' },
        { cat: 'conversation', prompt: 'Was machen Sie am Wochenende?', vi: 'Cuối tuần bạn làm gì?' },
        { cat: 'pronunciation', prompt: 'Üben Sie: Brötchen, Bücher, schön, über.', vi: 'Luyện: Brötchen, Bücher, schön, über.' },
        { cat: 'conversation', prompt: 'Wie ist das Wetter heute?', vi: 'Thời tiết hôm nay thế nào?' },
        { cat: 'conversation', prompt: 'Was ist Ihr Lieblingstier?', vi: 'Con vật yêu thích của bạn là gì?' },
        { cat: 'conversation', prompt: 'Zählen Sie von 1 bis 20.', vi: 'Đếm từ 1 đến 20.' },
        { cat: 'conversation', prompt: 'Was tragen Sie heute?', vi: 'Hôm nay bạn mặc gì?' },
        { cat: 'conversation', prompt: 'Beschreiben Sie Ihren besten Freund.', vi: 'Mô tả người bạn thân nhất.' },
        { cat: 'conversation', prompt: 'Was ist Ihre Lieblingsfarbe? Warum?', vi: 'Màu yêu thích? Tại sao?' },
    ],
    A2: [
        { cat: 'roleplay', prompt: 'Sie sind im Restaurant. Bestellen Sie Essen.', vi: 'Bạn ở nhà hàng. Gọi món.' },
        { cat: 'roleplay', prompt: 'Fragen Sie nach dem Weg zum Bahnhof.', vi: 'Hỏi đường đến nhà ga.' },
        { cat: 'roleplay', prompt: 'Sie sind beim Arzt. Beschreiben Sie Ihre Symptome.', vi: 'Bạn ở bác sĩ. Mô tả triệu chứng.' },
        { cat: 'conversation', prompt: 'Erzählen Sie von Ihrer letzten Reise.', vi: 'Kể về chuyến đi gần nhất.' },
        { cat: 'conversation', prompt: 'Beschreiben Sie Ihre Wohnung.', vi: 'Mô tả căn hộ của bạn.' },
        { cat: 'roleplay', prompt: 'Kaufen Sie ein Zugticket am Schalter.', vi: 'Mua vé tàu ở quầy.' },
        { cat: 'conversation', prompt: 'Was haben Sie gestern gemacht?', vi: 'Hôm qua bạn đã làm gì?' },
        { cat: 'roleplay', prompt: 'Reklamieren Sie ein defektes Produkt im Geschäft.', vi: 'Khiếu nại sản phẩm lỗi ở cửa hàng.' },
        { cat: 'conversation', prompt: 'Erzählen Sie von Ihrem Lieblingsfest.', vi: 'Kể về lễ hội yêu thích.' },
        { cat: 'roleplay', prompt: 'Vereinbaren Sie einen Termin beim Zahnarzt.', vi: 'Đặt lịch hẹn nha sĩ.' },
        { cat: 'conversation', prompt: 'Was ist Ihr Traumberuf? Warum?', vi: 'Nghề mơ ước? Tại sao?' },
        { cat: 'conversation', prompt: 'Beschreiben Sie Ihre Stadt.', vi: 'Mô tả thành phố của bạn.' },
        { cat: 'roleplay', prompt: 'Checken Sie in einem Hotel ein.', vi: 'Nhận phòng khách sạn.' },
    ],
    B1: [
        { cat: 'general', prompt: 'Diskutieren Sie: Vor- und Nachteile von Social Media.', vi: 'Thảo luận: Ưu nhược điểm mạng xã hội.' },
        { cat: 'general', prompt: 'Was können wir für die Umwelt tun?', vi: 'Chúng ta có thể làm gì cho môi trường?' },
        { cat: 'general', prompt: 'Beschreiben Sie Ihren Traumberuf und warum.', vi: 'Mô tả nghề mơ ước và tại sao.' },
        { cat: 'general', prompt: 'Vergleichen Sie das Leben in der Stadt und auf dem Land.', vi: 'So sánh cuộc sống thành thị và nông thôn.' },
        { cat: 'general', prompt: 'Wie hat sich die Arbeitswelt verändert?', vi: 'Thế giới công việc đã thay đổi thế nào?' },
        { cat: 'general', prompt: 'Was bedeutet gesunde Ernährung für Sie?', vi: 'Dinh dưỡng lành mạnh nghĩa là gì với bạn?' },
        { cat: 'general', prompt: 'Diskutieren Sie: Sollte Bildung kostenlos sein?', vi: 'Thảo luận: Giáo dục có nên miễn phí?' },
        { cat: 'general', prompt: 'Wie beeinflusst Technologie unser tägliches Leben?', vi: 'Công nghệ ảnh hưởng sinh hoạt hằng ngày thế nào?' },
        { cat: 'general', prompt: 'Was macht eine gute Freundschaft aus?', vi: 'Điều gì tạo nên tình bạn tốt?' },
        { cat: 'general', prompt: 'Erzählen Sie von einem unvergesslichen Erlebnis.', vi: 'Kể về trải nghiệm không thể quên.' },
        { cat: 'general', prompt: 'Welche Rolle spielt Sport in Ihrem Leben?', vi: 'Thể thao đóng vai trò gì trong cuộc sống bạn?' },
        { cat: 'general', prompt: 'Wie sehen Sie die Zukunft der Mobilität?', vi: 'Bạn nhìn nhận tương lai giao thông thế nào?' },
    ],
    B2: [
        { cat: 'general', prompt: 'Erörtern Sie die Auswirkungen der Globalisierung.', vi: 'Phân tích tác động toàn cầu hóa.' },
        { cat: 'general', prompt: 'Sollte KI stärker reguliert werden? Argumentieren Sie.', vi: 'AI có nên được kiểm soát chặt hơn?' },
        { cat: 'general', prompt: 'Diskutieren Sie den Zusammenhang zwischen Bildung und sozialer Mobilität.', vi: 'Thảo luận mối liên hệ giáo dục và di động xã hội.' },
        { cat: 'general', prompt: 'Wie verändert die Digitalisierung die Arbeitswelt?', vi: 'Số hóa thay đổi thế giới công việc thế nào?' },
        { cat: 'general', prompt: 'Nehmen Sie Stellung zur Gentechnologie in der Landwirtschaft.', vi: 'Đưa quan điểm về công nghệ gen trong nông nghiệp.' },
        { cat: 'general', prompt: 'Diskutieren Sie: Ist Datenschutz ein Grundrecht?', vi: 'Thảo luận: Bảo vệ dữ liệu có phải quyền cơ bản?' },
        { cat: 'general', prompt: 'Wie beeinflusst der demografische Wandel die Gesellschaft?', vi: 'Biến đổi nhân khẩu ảnh hưởng xã hội thế nào?' },
        { cat: 'general', prompt: 'Erörtern Sie den Wert der Kunst in einer technologisierten Gesellschaft.', vi: 'Phân tích giá trị nghệ thuật trong xã hội công nghệ.' },
        { cat: 'general', prompt: 'Was bedeutet kulturelle Identität in einer globalisierten Welt?', vi: 'Bản sắc văn hóa nghĩa là gì trong thế giới toàn cầu hóa?' },
        { cat: 'general', prompt: 'Diskutieren Sie die ethischen Grenzen der Wissenschaft.', vi: 'Thảo luận ranh giới đạo đức của khoa học.' },
        { cat: 'general', prompt: 'Sollten fossile Brennstoffe sofort verboten werden?', vi: 'Nhiên liệu hóa thạch có nên bị cấm ngay?' },
        { cat: 'general', prompt: 'Wie können Städte nachhaltiger gestaltet werden?', vi: 'Làm thế nào để thành phố bền vững hơn?' },
    ],
};

// Writing templates
const WRITING_CATS = ['free_writing', 'sentence_construction', 'correction', 'essay'];
const GRAMMAR_BY_LEVEL: Record<string, string[]> = {
    A1: ['Präsens', 'Artikel', 'Possessivartikel', 'Trennbare Verben', 'Negation'],
    A2: ['Perfekt', 'Modalverben', 'Akkusativ', 'Dativ', 'Nebensätze mit weil/dass'],
    B1: ['Konjunktiv II', 'Passiv', 'Relativsätze', 'Konnektoren', 'Indirekte Rede'],
    B2: ['Konjunktiv I', 'Partizipialstrukturen', 'Nominalisierung', 'Passiv-Alternativen', 'Subjunktionen'],
};

async function main() {
    console.log('🌱 S9 EXPANDED Content Pipeline\n');

    // 1. READING — 200 passages
    console.log('📖 Generating 200 Reading Passages...');
    let rCount = 0;
    for (const level of LEVELS) {
        const topics = TOPICS[level];
        const sentenceCount = level === 'A1' ? 6 : level === 'A2' ? 8 : level === 'B1' ? 10 : 12;
        for (let t = 0; t < topics.length; t++) {
            for (let v = 0; v < 4; v++) { // 4 variations per topic = 60 per level
                const id = `s9x-read-${level}-${t}-${v}`;
                const content = generatePassage(level, sentenceCount);
                const wc = content.split(/\s+/).length;
                await prisma.readingContent.upsert({
                    where: { id },
                    update: {},
                    create: {
                        id, title: `${topics[t]} (${v + 1}) – ${level}`,
                        content, level, topic: topics[t], wordCount: wc,
                        difficultyScore: level === 'A1' ? 20 : level === 'A2' ? 40 : level === 'B1' ? 60 : 80,
                        source: 'seed-s9x', isPublished: true,
                    },
                });
                rCount++;
            }
        }
    }
    console.log(`  ✅ ${rCount} reading passages`);

    // 2. SPEAKING — 200 prompts
    console.log('🎤 Generating 200 Speaking Prompts...');
    let sCount = 0;
    for (const level of LEVELS) {
        const templates = SPEAKING_TEMPLATES[level];
        for (let t = 0; t < templates.length; t++) {
            for (let v = 0; v < 4; v++) {
                const id = `s9x-speak-${level}-${t}-${v}`;
                const topic = pick(TOPICS[level]);
                const diff = level === 'A1' ? 1 : level === 'A2' ? 2 : level === 'B1' ? 3 : 4;
                await prisma.speakingPrompt.upsert({
                    where: { id },
                    update: {},
                    create: {
                        id, title: `${topic} Sprechen ${v + 1} – ${level}`,
                        level, topic, category: templates[t].cat,
                        promptText: templates[t].prompt,
                        promptTextVi: templates[t].vi,
                        sampleResponse: generatePassage(level, 3),
                        targetWords: [], difficulty: diff, tags: [level, topic],
                        isPublished: true,
                    },
                });
                sCount++;
            }
        }
    }
    console.log(`  ✅ ${sCount} speaking prompts`);

    // 3. WRITING — 200 prompts
    console.log('✍️  Generating 200 Writing Prompts...');
    let wCount = 0;
    for (const level of LEVELS) {
        const topics = TOPICS[level];
        const grammar = GRAMMAR_BY_LEVEL[level];
        const minW = level === 'A1' ? 30 : level === 'A2' ? 50 : level === 'B1' ? 100 : 150;
        for (let t = 0; t < topics.length; t++) {
            for (let v = 0; v < 4; v++) {
                const id = `s9x-write-${level}-${t}-${v}`;
                const topic = topics[t];
                const cat = pick(WRITING_CATS);
                await prisma.writingPrompt.upsert({
                    where: { id },
                    update: {},
                    create: {
                        id, title: `${topic} Schreiben ${v + 1} – ${level}`,
                        level, topic, category: cat,
                        promptText: `Schreiben Sie einen Text zum Thema "${topic}". (${level}, Variante ${v + 1})`,
                        promptTextVi: `Viết một bài về chủ đề "${topic}".`,
                        instructions: `Benutzen Sie: ${pick(grammar)}. Mindestens ${minW} Wörter.`,
                        sampleResponse: generatePassage(level, 5),
                        grammarPoints: [pick(grammar), pick(grammar)],
                        vocabularyFocus: [], keywords: [topic],
                        minWords: minW, difficulty: level === 'A1' ? 1 : level === 'A2' ? 2 : level === 'B1' ? 3 : 5,
                        tags: [level, topic], isPublished: true,
                    },
                });
                wCount++;
            }
        }
    }
    console.log(`  ✅ ${wCount} writing prompts`);

    // 4. LISTENING — 200 entries
    console.log('🎧 Generating 200 Listening Entries...');
    let lCount = 0;
    for (const level of LEVELS) {
        const topics = TOPICS[level];
        for (let t = 0; t < topics.length; t++) {
            for (let v = 0; v < 4; v++) {
                const id = `s9x-listen-${level}-${t}-${v}`;
                const topic = topics[t];
                const transcript = generatePassage(level, level === 'A1' ? 5 : level === 'A2' ? 7 : level === 'B1' ? 9 : 11);
                await prisma.listeningContent.upsert({
                    where: { id },
                    update: {},
                    create: {
                        id, title: `${topic} Hörtext ${v + 1} – ${level}`,
                        description: `Listening: ${topic} (${level})`,
                        level, topic, transcript,
                        wordCount: transcript.split(/\s+/).length,
                        difficultyScore: level === 'A1' ? 20 : level === 'A2' ? 40 : level === 'B1' ? 60 : 80,
                        speed: level === 'A1' ? 'slow' : 'normal',
                        source: 'seed-s9x', isPublished: true,
                    },
                });
                lCount++;
            }
        }
    }
    console.log(`  ✅ ${lCount} listening entries`);

    console.log('\n══════════════════════════════════════════');
    console.log('🎯 S9 EXPANDED — COMPLETE');
    console.log(`  📖 Reading:   ${rCount}`);
    console.log(`  🎤 Speaking:  ${sCount}`);
    console.log(`  ✍️  Writing:   ${wCount}`);
    console.log(`  🎧 Listening: ${lCount}`);
    console.log(`  📊 TOTAL:     ${rCount + sCount + wCount + lCount}`);
    console.log('══════════════════════════════════════════\n');
}

main().catch(e => { console.error('❌', e); process.exit(1); }).finally(() => prisma.$disconnect());
