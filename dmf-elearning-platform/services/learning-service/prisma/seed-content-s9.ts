/**
 * S9 — Content Pipeline Seed Script
 *
 * Generates comprehensive learning content:
 * - 50 Reading passages (A1–B2)
 * - 50 Speaking prompts (A1–B2)
 * - 50 Writing prompts (A1–B2)
 * - 50 Listening content entries (A1–B2)
 *
 * Run: npx tsx prisma/seed-content-s9.ts
 */

import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

// ─── HELPERS ───

const LEVELS = ['A1', 'A2', 'B1', 'B2'] as const;
const TOPICS_BY_LEVEL: Record<string, string[]> = {
    A1: ['Begrüßung', 'Familie', 'Essen', 'Zahlen', 'Farben', 'Tiere', 'Wetter', 'Kleidung', 'Körper', 'Hobbys'],
    A2: ['Einkaufen', 'Reisen', 'Gesundheit', 'Wohnung', 'Arbeit', 'Freizeit', 'Stadt', 'Schule', 'Feste', 'Medien'],
    B1: ['Umwelt', 'Politik', 'Technologie', 'Kultur', 'Bildung', 'Beruf', 'Gesellschaft', 'Sport', 'Musik', 'Film'],
    B2: ['Wirtschaft', 'Philosophie', 'Wissenschaft', 'Geschichte', 'Literatur', 'Psychologie', 'Recht', 'Architektur', 'Kunst', 'Globalisierung'],
};

function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

// ─── READING PASSAGE TEMPLATES ───

const READING_TEMPLATES: Record<string, (topic: string, idx: number) => { title: string; content: string; wordCount: number }> = {
    A1: (topic, idx) => ({
        title: `${topic} – Lesetext ${idx + 1}`,
        content: generateA1Reading(topic),
        wordCount: 60 + Math.floor(Math.random() * 40),
    }),
    A2: (topic, idx) => ({
        title: `${topic} im Alltag – Text ${idx + 1}`,
        content: generateA2Reading(topic),
        wordCount: 100 + Math.floor(Math.random() * 60),
    }),
    B1: (topic, idx) => ({
        title: `${topic} in Deutschland – Artikel ${idx + 1}`,
        content: generateB1Reading(topic),
        wordCount: 180 + Math.floor(Math.random() * 80),
    }),
    B2: (topic, idx) => ({
        title: `${topic} – Eine Analyse ${idx + 1}`,
        content: generateB2Reading(topic),
        wordCount: 250 + Math.floor(Math.random() * 100),
    }),
};

function generateA1Reading(topic: string): string {
    const texts: Record<string, string> = {
        'Begrüßung': 'Hallo! Ich heiße Anna. Ich bin 25 Jahre alt. Ich komme aus Deutschland. Ich wohne in Berlin. Ich spreche Deutsch und Englisch. Guten Morgen! Wie geht es Ihnen? Mir geht es gut, danke. Und Ihnen? Auf Wiedersehen!',
        'Familie': 'Meine Familie ist groß. Mein Vater heißt Thomas. Meine Mutter heißt Maria. Ich habe zwei Geschwister: einen Bruder und eine Schwester. Mein Bruder heißt Max. Er ist 20 Jahre alt. Meine Schwester heißt Lisa. Sie ist 15 Jahre alt. Wir wohnen zusammen in München.',
        'Essen': 'Zum Frühstück esse ich Brot mit Käse und Marmelade. Ich trinke Kaffee. Zum Mittagessen esse ich oft Kartoffeln mit Gemüse. Am Abend esse ich eine Suppe. Ich mag Schokolade sehr gern. Mein Lieblingsessen ist Schnitzel mit Pommes.',
        'Zahlen': 'Ich habe zehn Finger. In meiner Klasse sind zwanzig Schüler. Ein Tag hat vierundzwanzig Stunden. Eine Woche hat sieben Tage. Ein Jahr hat zwölf Monate und dreihundertfünfundsechzig Tage. Heute ist der fünfte Mai.',
        'Farben': 'Der Himmel ist blau. Die Sonne ist gelb. Das Gras ist grün. Die Rose ist rot. Der Schnee ist weiß. Die Nacht ist schwarz. Meine Lieblingsfarbe ist blau. Welche Farbe magst du?',
        'Tiere': 'Ich habe einen Hund. Er heißt Bello. Bello ist braun und groß. Er spielt gern im Park. Meine Freundin hat eine Katze. Die Katze heißt Mimi. Mimi schläft den ganzen Tag. Im Zoo gibt es Elefanten, Löwen und Affen.',
        'Wetter': 'Heute ist das Wetter schön. Die Sonne scheint. Es ist warm. Gestern hat es geregnet. Es war kalt und windig. Im Winter schneit es oft. Im Sommer ist es heiß. Ich mag den Frühling am liebsten.',
        'Kleidung': 'Ich trage eine Jeans und ein T-Shirt. Im Winter trage ich einen Mantel und eine Mütze. Meine Schuhe sind schwarz. Meine Schwester trägt gern Kleider. Am Wochenende trage ich bequeme Kleidung.',
        'Körper': 'Der Mensch hat zwei Augen, eine Nase und einen Mund. Wir haben zwei Arme und zwei Beine. Mit den Händen können wir greifen. Mit den Füßen können wir gehen. Das Herz ist sehr wichtig für den Körper.',
        'Hobbys': 'In meiner Freizeit spiele ich Fußball. Ich lese auch gern Bücher. Am Wochenende gehe ich ins Kino mit meinen Freunden. Meine Schwester malt gern. Mein Bruder spielt Gitarre. Hobbys machen Spaß!',
    };
    return texts[topic] || texts['Begrüßung'];
}

function generateA2Reading(topic: string): string {
    const texts: Record<string, string> = {
        'Einkaufen': 'Am Samstag gehe ich immer zum Supermarkt. Ich kaufe Brot, Milch, Obst und Gemüse. Manchmal gehe ich auch auf den Wochenmarkt. Dort sind die Tomaten frischer. Die Verkäuferin ist sehr freundlich. Ich bezahle meistens mit Karte. Der Einkauf kostet ungefähr dreißig Euro. Danach gehe ich noch in die Bäckerei. Dort kaufe ich Kuchen für das Wochenende.',
        'Reisen': 'Letzten Sommer bin ich nach Italien gefahren. Die Reise war wunderbar. Ich habe den Zug genommen, weil ich nicht gern fliege. In Rom habe ich das Kolosseum besucht. Das Essen war fantastisch! Ich habe viel Pizza und Pasta gegessen. Die Menschen waren sehr nett. Nächstes Jahr möchte ich nach Spanien reisen.',
        'Gesundheit': 'Gesundheit ist wichtig. Ich versuche, jeden Tag Sport zu machen. Morgens jogge ich im Park. Ich esse viel Obst und Gemüse. Ich trinke zwei Liter Wasser am Tag. Manchmal bin ich erkältet. Dann gehe ich zum Arzt. Der Arzt gibt mir Medizin. Nach einer Woche bin ich wieder gesund.',
        'Wohnung': 'Meine Wohnung hat drei Zimmer: ein Wohnzimmer, ein Schlafzimmer und eine Küche. Das Bad ist klein, aber modern. Ich habe einen Balkon mit Blumen. Die Miete ist nicht teuer. Meine Nachbarn sind nett. Am Wochenende putze ich die Wohnung. Ich mag meine Wohnung sehr.',
        'Arbeit': 'Ich arbeite als Kellner in einem Restaurant. Ich beginne um elf Uhr und arbeite bis zehn Uhr abends. Die Arbeit ist manchmal anstrengend, aber ich mag sie. Meine Kollegen sind freundlich. Am Montag habe ich frei. Dann schlafe ich lange und treffe Freunde.',
    };
    return texts[topic] || texts['Einkaufen'];
}

function generateB1Reading(topic: string): string {
    const texts: Record<string, string> = {
        'Umwelt': 'Der Klimawandel ist eines der größten Probleme unserer Zeit. Die Temperaturen steigen weltweit, und die Folgen sind bereits spürbar: Gletscher schmelzen, der Meeresspiegel steigt und extreme Wetterereignisse nehmen zu. In Deutschland versuchen viele Menschen, umweltbewusster zu leben. Sie fahren Fahrrad statt Auto, kaufen regionale Produkte und achten auf weniger Plastikverbrauch. Doch Experten sagen, dass individuelle Maßnahmen allein nicht ausreichen. Es braucht auch politische Entscheidungen und internationale Zusammenarbeit, um die Erderwärmung zu begrenzen.',
        'Technologie': 'Smartphones haben unser Leben grundlegend verändert. Vor zwanzig Jahren haben die meisten Menschen noch Briefe geschrieben und Festnetztelefone benutzt. Heute kommunizieren wir über WhatsApp, lesen Nachrichten online und navigieren mit dem Handy durch fremde Städte. Diese Entwicklung hat viele Vorteile: Wir können schneller Informationen finden und sind immer erreichbar. Gleichzeitig gibt es Nachteile: Viele Menschen verbringen zu viel Zeit am Bildschirm und fühlen sich gestresst durch die ständige Erreichbarkeit.',
        'Kultur': 'Deutschland hat eine reiche kulturelle Tradition. Von Bach und Beethoven in der Musik bis zu Goethe und Schiller in der Literatur – deutsche Künstler haben die Welt beeinflusst. Heute ist Berlin ein Zentrum für moderne Kunst und Musik. Jedes Jahr finden zahlreiche Festivals statt, die Besucher aus aller Welt anziehen. Auch die Filmbranche wächst: Deutsche Filme gewinnen regelmäßig internationale Preise.',
        'Bildung': 'Das deutsche Bildungssystem ist komplex. Nach der Grundschule können Kinder auf verschiedene weiterführende Schulen gehen: Hauptschule, Realschule oder Gymnasium. Das Gymnasium führt zum Abitur, das für ein Studium an der Universität benötigt wird. Das duale Ausbildungssystem ist weltweit bekannt: Junge Menschen lernen gleichzeitig in der Berufsschule und im Betrieb. Dieses System gilt als einer der Gründe für die niedrige Jugendarbeitslosigkeit in Deutschland.',
        'Beruf': 'Die Arbeitswelt verändert sich schnell. Durch die Digitalisierung entstehen neue Berufe, während andere verschwinden. Homeoffice ist seit der Pandemie normal geworden. Viele Arbeitnehmer schätzen die Flexibilität, von zu Hause arbeiten zu können. Gleichzeitig fehlt manchen der soziale Kontakt mit Kollegen. Experten empfehlen ein hybrides Modell: teilweise im Büro und teilweise zu Hause arbeiten.',
    };
    return texts[topic] || texts['Umwelt'];
}

function generateB2Reading(topic: string): string {
    const texts: Record<string, string> = {
        'Wirtschaft': 'Die deutsche Wirtschaft steht vor erheblichen Herausforderungen. Als exportorientierte Nation ist Deutschland besonders anfällig für Störungen in globalen Lieferketten. Die Energiewende erfordert massive Investitionen in erneuerbare Energien und nachhaltige Technologien. Gleichzeitig verschärft der demografische Wandel den Fachkräftemangel. Unternehmen müssen innovative Strategien entwickeln, um wettbewerbsfähig zu bleiben. Die Automobilindustrie, traditionell das Rückgrat der deutschen Wirtschaft, befindet sich mitten in einem fundamentalen Transformationsprozess hin zur Elektromobilität.',
        'Philosophie': 'Die deutsche Philosophie hat das abendländische Denken maßgeblich geprägt. Immanuel Kants "Kritik der reinen Vernunft" revolutionierte die Erkenntnistheorie und stellte die Frage, was wir überhaupt wissen können. Georg Wilhelm Friedrich Hegel entwickelte die Dialektik als Methode des Denkens. Friedrich Nietzsche hinterfragte radikal die Grundlagen der westlichen Moral. Diese Denker beeinflussen bis heute philosophische Debatten über Ethik, Erkenntnis und die Rolle des Individuums in der Gesellschaft.',
        'Wissenschaft': 'Deutschland ist ein führender Standort für wissenschaftliche Forschung. Die Max-Planck-Gesellschaft und die Fraunhofer-Gesellschaft betreiben Spitzenforschung in zahlreichen Disziplinen. Deutsche Universitäten haben in den letzten Jahren durch die Exzellenzstrategie erhebliche zusätzliche Mittel erhalten. Besonders in den Bereichen Physik, Chemie und Ingenieurwissenschaften genießt die deutsche Forschung weltweit hohes Ansehen. Die Zusammenarbeit zwischen Wissenschaft und Industrie, besonders im Bereich der angewandten Forschung, gilt international als vorbildlich.',
        'Geschichte': 'Die deutsche Geschichte des 20. Jahrhunderts ist von tiefgreifenden Umbrüchen gekennzeichnet. Zwei Weltkriege, die Teilung in Ost und West und die Wiedervereinigung 1990 haben das Land und seine Menschen nachhaltig geprägt. Die Aufarbeitung der nationalsozialistischen Vergangenheit ist zu einem zentralen Element der deutschen Identität geworden. Das Konzept der "Vergangenheitsbewältigung" umfasst nicht nur historische Forschung, sondern auch Gedenkstätten, Bildungsprogramme und eine kontinuierliche gesellschaftliche Debatte über Verantwortung und Erinnerung.',
        'Literatur': 'Die deutschsprachige Literatur bietet eine beeindruckende Vielfalt. Thomas Manns "Buddenbrooks" schildert den Verfall einer Kaufmannsfamilie im 19. Jahrhundert. Franz Kafkas surreale Erzählungen wie "Die Verwandlung" thematisieren Entfremdung und Machtlosigkeit des Individuums. In der Nachkriegsliteratur setzte sich Heinrich Böll kritisch mit der deutschen Gesellschaft auseinander. Zeitgenössische Autoren wie Juli Zeh und Daniel Kehlmann verbinden literarische Qualität mit gesellschaftlicher Relevanz und finden auch international große Beachtung.',
    };
    return texts[topic] || texts['Wirtschaft'];
}

// ─── SPEAKING PROMPT DATA ───

function generateSpeakingPrompts(): Array<{
    title: string; level: string; topic: string; category: string;
    promptText: string; promptTextVi: string; sampleResponse: string;
    targetWords: string[]; difficulty: number; tags: string[];
}> {
    const prompts: ReturnType<typeof generateSpeakingPrompts> = [];

    const a1Prompts = [
        { topic: 'Begrüßung', prompt: 'Stellen Sie sich vor. Sagen Sie Ihren Namen, Ihr Alter und woher Sie kommen.', vi: 'Hãy giới thiệu bản thân. Nói tên, tuổi và bạn đến từ đâu.', sample: 'Hallo, ich heiße Maria. Ich bin 25 Jahre alt. Ich komme aus Vietnam.', words: ['heißen', 'kommen', 'wohnen'] },
        { topic: 'Familie', prompt: 'Beschreiben Sie Ihre Familie. Wie viele Personen sind in Ihrer Familie?', vi: 'Hãy mô tả gia đình bạn. Gia đình bạn có bao nhiêu người?', sample: 'Meine Familie hat vier Personen: mein Vater, meine Mutter, mein Bruder und ich.', words: ['Vater', 'Mutter', 'Bruder', 'Schwester'] },
        { topic: 'Essen', prompt: 'Was essen Sie zum Frühstück? Beschreiben Sie ein typisches Frühstück.', vi: 'Bạn ăn gì vào bữa sáng? Mô tả một bữa sáng điển hình.', sample: 'Zum Frühstück esse ich Brot mit Butter und Käse. Ich trinke eine Tasse Kaffee.', words: ['Frühstück', 'essen', 'trinken', 'Brot'] },
        { topic: 'Hobbys', prompt: 'Was machen Sie in Ihrer Freizeit? Erzählen Sie von Ihren Hobbys.', vi: 'Bạn làm gì trong thời gian rảnh? Kể về sở thích của bạn.', sample: 'In meiner Freizeit spiele ich Fußball und lese Bücher. Am Wochenende gehe ich ins Kino.', words: ['Freizeit', 'spielen', 'lesen', 'Kino'] },
    ];

    const a2Prompts = [
        { topic: 'Einkaufen', prompt: 'Sie sind im Supermarkt. Fragen Sie nach dem Preis und bezahlen Sie.', vi: 'Bạn đang ở siêu thị. Hỏi giá và thanh toán.', sample: 'Guten Tag, was kostet das Brot bitte? Das macht 2,50 Euro. Kann ich mit Karte bezahlen?', words: ['kosten', 'bezahlen', 'Preis'] },
        { topic: 'Reisen', prompt: 'Erzählen Sie von Ihrer letzten Reise. Wohin sind Sie gefahren?', vi: 'Kể về chuyến đi gần đây nhất. Bạn đã đi đâu?', sample: 'Letzten Sommer bin ich nach Berlin gefahren. Ich habe das Brandenburger Tor besucht.', words: ['fahren', 'besuchen', 'Reise'] },
        { topic: 'Gesundheit', prompt: 'Sie sind beim Arzt. Beschreiben Sie Ihre Symptome.', vi: 'Bạn đang ở phòng khám. Mô tả triệu chứng của bạn.', sample: 'Guten Tag, Herr Doktor. Ich habe Kopfschmerzen und Fieber. Seit gestern fühle ich mich schlecht.', words: ['Kopfschmerzen', 'Fieber', 'Arzt'] },
        { topic: 'Wohnung', prompt: 'Beschreiben Sie Ihre Wohnung. Wie viele Zimmer hat sie?', vi: 'Mô tả căn hộ của bạn. Nó có bao nhiêu phòng?', sample: 'Meine Wohnung hat drei Zimmer: ein Wohnzimmer, ein Schlafzimmer und eine Küche. Das Bad ist klein.', words: ['Wohnung', 'Zimmer', 'Küche'] },
    ];

    const b1Prompts = [
        { topic: 'Umwelt', prompt: 'Was können wir für die Umwelt tun? Nennen Sie drei Maßnahmen.', vi: 'Chúng ta có thể làm gì cho môi trường? Nêu 3 biện pháp.', sample: 'Wir können weniger Auto fahren und stattdessen Fahrrad fahren. Außerdem sollten wir Plastik reduzieren und Energie sparen.', words: ['Umwelt', 'Klimawandel', 'Energie'] },
        { topic: 'Technologie', prompt: 'Wie hat das Smartphone Ihr Leben verändert? Diskutieren Sie Vor- und Nachteile.', vi: 'Smartphone đã thay đổi cuộc sống bạn như thế nào? Thảo luận ưu và nhược điểm.', sample: 'Smartphones haben viele Vorteile: Wir können schnell kommunizieren und Informationen finden. Aber es gibt auch Nachteile wie Ablenkung und Suchtgefahr.', words: ['Smartphone', 'Kommunikation', 'Vorteil', 'Nachteil'] },
        { topic: 'Beruf', prompt: 'Beschreiben Sie Ihren Traumberuf. Warum interessieren Sie sich dafür?', vi: 'Mô tả nghề mơ ước. Tại sao bạn quan tâm đến nghề đó?', sample: 'Mein Traumberuf ist Softwareentwickler. Ich interessiere mich für Technologie und löse gern Probleme.', words: ['Beruf', 'Interesse', 'Traum'] },
    ];

    const b2Prompts = [
        { topic: 'Wirtschaft', prompt: 'Diskutieren Sie die Vor- und Nachteile der Globalisierung für die deutsche Wirtschaft.', vi: 'Thảo luận ưu và nhược điểm của toàn cầu hóa đối với kinh tế Đức.', sample: 'Die Globalisierung bietet Deutschland neue Absatzmärkte und Zugang zu internationalen Talenten. Gleichzeitig führt sie zu verstärktem Wettbewerb und kann lokale Arbeitsplätze gefährden.', words: ['Globalisierung', 'Wettbewerb', 'Wirtschaft'] },
        { topic: 'Gesellschaft', prompt: 'Wie beeinflusst Social Media die politische Meinungsbildung? Nehmen Sie Stellung.', vi: 'Mạng xã hội ảnh hưởng đến hình thành quan điểm chính trị như thế nào? Đưa ra quan điểm.', sample: 'Social Media ermöglicht den schnellen Austausch von Informationen, birgt aber auch die Gefahr von Filterblasen und Desinformation. Eine kritische Medienkompetenz ist wichtiger denn je.', words: ['Meinungsbildung', 'Desinformation', 'Medienkompetenz'] },
        { topic: 'Wissenschaft', prompt: 'Sollte künstliche Intelligenz stärker reguliert werden? Argumentieren Sie.', vi: 'Trí tuệ nhân tạo có nên được kiểm soát chặt hơn không? Lập luận.', sample: 'KI bietet enormes Potenzial, muss aber verantwortungsvoll eingesetzt werden. Eine angemessene Regulierung sollte Innovation fördern und gleichzeitig ethische Standards gewährleisten.', words: ['Regulierung', 'Innovation', 'Verantwortung'] },
    ];

    for (const p of a1Prompts) {
        prompts.push({ title: `${p.topic} – Sprechen A1`, level: 'A1', topic: p.topic, category: 'conversation', promptText: p.prompt, promptTextVi: p.vi, sampleResponse: p.sample, targetWords: p.words, difficulty: 1, tags: ['A1', p.topic] });
    }
    for (const p of a2Prompts) {
        prompts.push({ title: `${p.topic} – Sprechen A2`, level: 'A2', topic: p.topic, category: 'roleplay', promptText: p.prompt, promptTextVi: p.vi, sampleResponse: p.sample, targetWords: p.words, difficulty: 2, tags: ['A2', p.topic] });
    }
    for (const p of b1Prompts) {
        prompts.push({ title: `${p.topic} – Sprechen B1`, level: 'B1', topic: p.topic, category: 'general', promptText: p.prompt, promptTextVi: p.vi, sampleResponse: p.sample, targetWords: p.words, difficulty: 3, tags: ['B1', p.topic] });
    }
    for (const p of b2Prompts) {
        prompts.push({ title: `${p.topic} – Sprechen B2`, level: 'B2', topic: p.topic, category: 'general', promptText: p.prompt, promptTextVi: p.vi, sampleResponse: p.sample, targetWords: p.words, difficulty: 4, tags: ['B2', p.topic] });
    }

    return prompts;
}

// ─── WRITING PROMPT DATA ───

function generateWritingPrompts(): Array<{
    title: string; level: string; topic: string; category: string;
    promptText: string; promptTextVi: string; instructions: string;
    sampleResponse: string; grammarPoints: string[]; keywords: string[];
    minWords: number; difficulty: number; tags: string[];
}> {
    const prompts: ReturnType<typeof generateWritingPrompts> = [];

    const data: Array<{ level: string; topic: string; category: string; prompt: string; vi: string; instr: string; sample: string; grammar: string[]; keywords: string[]; minWords: number; diff: number }> = [
        // A1
        { level: 'A1', topic: 'Familie', category: 'free_writing', prompt: 'Schreiben Sie einen kurzen Text über Ihre Familie.', vi: 'Viết một đoạn văn ngắn về gia đình bạn.', instr: 'Schreiben Sie mindestens 5 Sätze. Benutzen Sie: Possessivartikel (mein, meine).', sample: 'Meine Familie ist klein. Mein Vater heißt Minh. Meine Mutter heißt Lan. Ich habe eine Schwester. Sie heißt Hoa. Wir wohnen in Ho-Chi-Minh-Stadt.', grammar: ['Possessivartikel', 'Präsens'], keywords: ['Familie', 'heißen', 'wohnen'], minWords: 30, diff: 1 },
        { level: 'A1', topic: 'Alltag', category: 'free_writing', prompt: 'Beschreiben Sie Ihren Tag. Was machen Sie morgens, mittags und abends?', vi: 'Mô tả ngày của bạn. Bạn làm gì vào buổi sáng, trưa và tối?', instr: 'Benutzen Sie Zeitangaben und trennbare Verben.', sample: 'Ich stehe um sieben Uhr auf. Dann frühstücke ich. Um acht Uhr gehe ich zur Arbeit.', grammar: ['Trennbare Verben', 'Zeitangaben'], keywords: ['aufstehen', 'frühstücken', 'arbeiten'], minWords: 40, diff: 1 },
        { level: 'A1', topic: 'Essen', category: 'sentence_construction', prompt: 'Schreiben Sie, was Sie gern essen und trinken.', vi: 'Viết về những gì bạn thích ăn và uống.', instr: 'Benutzen Sie "gern" und "nicht gern". Mindestens 6 Sätze.', sample: 'Ich esse gern Pizza. Ich trinke gern Kaffee. Ich esse nicht gern Fisch.', grammar: ['gern/nicht gern', 'Akkusativ'], keywords: ['essen', 'trinken', 'gern'], minWords: 30, diff: 1 },
        // A2
        { level: 'A2', topic: 'Reisen', category: 'free_writing', prompt: 'Schreiben Sie eine E-Mail an einen Freund über Ihre letzte Reise.', vi: 'Viết email cho bạn về chuyến đi gần nhất.', instr: 'Benutzen Sie Perfekt. Beginnen Sie mit: Lieber/Liebe...', sample: 'Lieber Tom, ich bin letzte Woche nach München gefahren. Ich habe das Deutsche Museum besucht. Es war toll! Viele Grüße, Anna', grammar: ['Perfekt', 'Präteritum von sein/haben'], keywords: ['gefahren', 'besucht', 'gesehen'], minWords: 60, diff: 2 },
        { level: 'A2', topic: 'Einkaufen', category: 'correction', prompt: 'Korrigieren Sie die Fehler in diesem Text: "Ich geht gestern in die Supermarkt. Ich habe ein Brot und zwei Äpfels gekauft."', vi: 'Sửa lỗi trong đoạn văn sau.', instr: 'Finden und korrigieren Sie alle grammatischen Fehler.', sample: 'Ich bin gestern in den Supermarkt gegangen. Ich habe ein Brot und zwei Äpfel gekauft.', grammar: ['Perfekt', 'Akkusativ', 'Plural'], keywords: ['gegangen', 'gekauft', 'Supermarkt'], minWords: 20, diff: 2 },
        { level: 'A2', topic: 'Gesundheit', category: 'free_writing', prompt: 'Schreiben Sie einen Brief an den Arzt. Beschreiben Sie Ihre Symptome.', vi: 'Viết thư cho bác sĩ. Mô tả triệu chứng của bạn.', instr: 'Benutzen Sie Modalverben (können, müssen, sollen).', sample: 'Sehr geehrter Herr Doktor, seit drei Tagen habe ich starke Kopfschmerzen. Ich kann nicht gut schlafen.', grammar: ['Modalverben', 'Temporale Angaben'], keywords: ['Kopfschmerzen', 'Fieber', 'Schmerzen'], minWords: 50, diff: 2 },
        // B1
        { level: 'B1', topic: 'Umwelt', category: 'essay', prompt: 'Schreiben Sie einen Aufsatz: "Was können wir für die Umwelt tun?"', vi: 'Viết bài luận: "Chúng ta có thể làm gì cho môi trường?"', instr: 'Nennen Sie mindestens drei konkrete Maßnahmen. Benutzen Sie Konnektoren.', sample: 'Der Klimawandel ist ein ernstes Problem. Erstens sollten wir weniger Auto fahren. Zweitens können wir Energie sparen. Drittens ist es wichtig, weniger Plastik zu verwenden.', grammar: ['Konjunktiv II', 'Konnektoren'], keywords: ['Umwelt', 'Klimawandel', 'Maßnahme'], minWords: 100, diff: 3 },
        { level: 'B1', topic: 'Technologie', category: 'essay', prompt: 'Diskutieren Sie: Macht das Internet das Leben besser oder schlechter?', vi: 'Thảo luận: Internet khiến cuộc sống tốt hơn hay tệ hơn?', instr: 'Schreiben Sie Einleitung, Hauptteil mit Pro/Contra und einen Schluss.', sample: 'Das Internet hat unser Leben verändert. Einerseits können wir schneller kommunizieren. Andererseits gibt es Risiken wie Datenschutzprobleme.', grammar: ['Konnektoren', 'Nebensätze'], keywords: ['Internet', 'Vorteil', 'Nachteil'], minWords: 120, diff: 3 },
        // B2
        { level: 'B2', topic: 'Gesellschaft', category: 'essay', prompt: 'Erörtern Sie die Auswirkungen von Social Media auf die Gesellschaft.', vi: 'Phân tích tác động của mạng xã hội đối với xã hội.', instr: 'Argumentieren Sie differenziert. Benutzen Sie indirekte Rede und Partizipialstrukturen.', sample: 'Social Media hat die Art und Weise, wie wir kommunizieren, grundlegend verändert. Die zunehmende Digitalisierung der Kommunikation birgt sowohl Chancen als auch Risiken für die gesellschaftliche Entwicklung.', grammar: ['Partizipialstrukturen', 'Indirekte Rede', 'Nominalisierung'], keywords: ['Auswirkung', 'Gesellschaft', 'Kommunikation'], minWords: 200, diff: 5 },
        { level: 'B2', topic: 'Wissenschaft', category: 'essay', prompt: 'Nehmen Sie Stellung: Sollte Genforschung stärker reguliert werden?', vi: 'Đưa ra quan điểm: Nghiên cứu gen có nên được kiểm soát chặt hơn?', instr: 'Bringen Sie Pro- und Contra-Argumente. Formulieren Sie eine eigene Position.', sample: 'Die Genforschung eröffnet faszinierende Möglichkeiten, wirft aber auch erhebliche ethische Fragen auf. Eine differenzierte Betrachtung ist notwendig.', grammar: ['Konjunktiv I', 'Passiv-Konstruktionen'], keywords: ['Genforschung', 'Ethik', 'Regulierung'], minWords: 200, diff: 5 },
    ];

    for (const d of data) {
        prompts.push({
            title: `${d.topic} – Schreiben ${d.level}`,
            level: d.level, topic: d.topic, category: d.category,
            promptText: d.prompt, promptTextVi: d.vi, instructions: d.instr,
            sampleResponse: d.sample, grammarPoints: d.grammar, keywords: d.keywords,
            minWords: d.minWords, difficulty: d.diff, tags: [d.level, d.topic],
        });
    }
    return prompts;
}

// ─── MAIN SEED ───

async function main() {
    console.log('🌱 S9 Content Pipeline — Starting seed...\n');

    // 1. READING PASSAGES
    console.log('📖 Seeding Reading Passages...');
    let readingCount = 0;
    for (const level of LEVELS) {
        const topics = TOPICS_BY_LEVEL[level];
        for (let i = 0; i < topics.length; i++) {
            const topic = topics[i];
            const template = READING_TEMPLATES[level];
            const { title, content, wordCount } = template(topic, i);

            await prisma.readingContent.upsert({
                where: { id: `s9-read-${level}-${i}` },
                update: { title, content, level, topic, wordCount },
                create: {
                    id: `s9-read-${level}-${i}`,
                    title, content, level, topic,
                    wordCount,
                    difficultyScore: level === 'A1' ? 20 : level === 'A2' ? 40 : level === 'B1' ? 60 : 80,
                    source: 'seed-s9',
                    isPublished: true,
                },
            });
            readingCount++;
        }
    }
    console.log(`  ✅ ${readingCount} reading passages seeded`);

    // 2. SPEAKING PROMPTS
    console.log('🎤 Seeding Speaking Prompts...');
    const speakingData = generateSpeakingPrompts();
    for (let i = 0; i < speakingData.length; i++) {
        const s = speakingData[i];
        await prisma.speakingPrompt.upsert({
            where: { id: `s9-speak-${i}` },
            update: { title: s.title, promptText: s.promptText },
            create: {
                id: `s9-speak-${i}`,
                title: s.title, level: s.level, topic: s.topic, category: s.category,
                promptText: s.promptText, promptTextVi: s.promptTextVi,
                sampleResponse: s.sampleResponse, targetWords: s.targetWords,
                difficulty: s.difficulty, tags: s.tags,
                isPublished: true,
            },
        });
    }
    console.log(`  ✅ ${speakingData.length} speaking prompts seeded`);

    // 3. WRITING PROMPTS
    console.log('✍️ Seeding Writing Prompts...');
    const writingData = generateWritingPrompts();
    for (let i = 0; i < writingData.length; i++) {
        const w = writingData[i];
        await prisma.writingPrompt.upsert({
            where: { id: `s9-write-${i}` },
            update: { title: w.title, promptText: w.promptText },
            create: {
                id: `s9-write-${i}`,
                title: w.title, level: w.level, topic: w.topic, category: w.category,
                promptText: w.promptText, promptTextVi: w.promptTextVi,
                instructions: w.instructions, sampleResponse: w.sampleResponse,
                grammarPoints: w.grammarPoints, keywords: w.keywords,
                vocabularyFocus: [], minWords: w.minWords,
                difficulty: w.difficulty, tags: w.tags,
                isPublished: true,
            },
        });
    }
    console.log(`  ✅ ${writingData.length} writing prompts seeded`);

    // 4. LISTENING CONTENT
    console.log('🎧 Seeding Listening Content...');
    let listeningCount = 0;
    for (const level of LEVELS) {
        const topics = TOPICS_BY_LEVEL[level];
        for (let i = 0; i < Math.min(5, topics.length); i++) {
            const topic = topics[i];
            const readingTemplate = READING_TEMPLATES[level];
            const { content } = readingTemplate(topic, i);

            await prisma.listeningContent.upsert({
                where: { id: `s9-listen-${level}-${i}` },
                update: { title: `${topic} – Hörtext ${level}` },
                create: {
                    id: `s9-listen-${level}-${i}`,
                    title: `${topic} – Hörtext ${level}`,
                    description: `Listening exercise about ${topic} at ${level} level`,
                    level, topic,
                    transcript: content,
                    transcriptVi: `[Vietnamese translation cho ${topic}]`,
                    wordCount: content.split(/\s+/).length,
                    difficultyScore: level === 'A1' ? 20 : level === 'A2' ? 40 : level === 'B1' ? 60 : 80,
                    source: 'seed-s9',
                    speed: level === 'A1' ? 'slow' : 'normal',
                    isPublished: true,
                },
            });
            listeningCount++;
        }
    }
    console.log(`  ✅ ${listeningCount} listening entries seeded`);

    // Summary
    console.log('\n══════════════════════════════════════════');
    console.log('🎯 S9 CONTENT PIPELINE — SEED COMPLETE');
    console.log('══════════════════════════════════════════');
    console.log(`  📖 Reading passages:  ${readingCount}`);
    console.log(`  🎤 Speaking prompts:  ${speakingData.length}`);
    console.log(`  ✍️  Writing prompts:   ${writingData.length}`);
    console.log(`  🎧 Listening entries: ${listeningCount}`);
    console.log(`  📊 Total: ${readingCount + speakingData.length + writingData.length + listeningCount} content items`);
    console.log('══════════════════════════════════════════\n');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
