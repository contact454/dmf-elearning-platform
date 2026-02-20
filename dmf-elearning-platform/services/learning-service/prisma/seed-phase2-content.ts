import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2';

type ReadingSeed = {
  level: CefrLevel;
  topic: string;
  title: string;
  content: string;
};

type SpeakingSeed = {
  level: 'A1' | 'A2' | 'B1';
  topic: string;
  category: string;
  title: string;
  promptText: string;
  promptTextVi: string;
  targetWords: string[];
  phonetics: string[];
  difficulty: number;
};

type WritingSeed = {
  level: CefrLevel;
  topic: string;
  category: string;
  title: string;
  promptText: string;
  promptTextVi: string;
  instructions: string;
  instructionsVi: string;
  templateText: string;
  keywords: string[];
  grammarPoints: string[];
  vocabularyFocus: string[];
  minWords: number;
  wordLimit: number;
  difficulty: number;
};

type ListeningSeed = {
  level: CefrLevel;
  topic: string;
  title: string;
  transcript: string;
  transcriptVi: string;
};

const SOURCE_TAG = 'phase2/seed-2026-02';

const LEVEL_READING_TOPICS: Record<CefrLevel, string[]> = {
  A1: ['Familie', 'Alltag', 'Einkaufen', 'Freizeit', 'Wetter'],
  A2: ['Reise', 'Gesundheit', 'Arbeit', 'Stadtleben', 'Essen'],
  B1: ['Umwelt', 'Technologie', 'Bildung', 'Kultur', 'Beruf'],
  B2: ['Gesellschaft', 'Medien', 'Nachhaltigkeit', 'Wissenschaft', 'Mobilität'],
};

const READING_SEEDS: ReadingSeed[] = [
  {
    level: 'A1',
    topic: 'Familie',
    title: 'Meine kleine Familie',
    content:
      'Lena wohnt in Hamburg. Sie lebt mit ihrer Mutter, ihrem Vater und ihrem Bruder in einer kleinen Wohnung. Am Abend essen alle zusammen Suppe und Brot. Danach erzählt jeder kurz von seinem Tag.',
  },
  {
    level: 'A1',
    topic: 'Alltag',
    title: 'Ein normaler Dienstag',
    content:
      'Tom steht um sechs Uhr auf. Er trinkt Tee und fährt mit dem Bus zur Arbeit. In der Mittagspause geht er mit einer Kollegin spazieren. Um achtzehn Uhr kommt er nach Hause und kocht Pasta.',
  },
  {
    level: 'A1',
    topic: 'Einkaufen',
    title: 'Im Supermarkt',
    content:
      'Sara kauft heute Gemüse, Käse und Milch. Sie liest zuerst die Preisschilder und vergleicht die Angebote. An der Kasse bezahlt sie mit Karte. Die Kassiererin wünscht ihr einen schönen Tag.',
  },
  {
    level: 'A1',
    topic: 'Freizeit',
    title: 'Samstag im Park',
    content:
      'Am Samstag trifft sich Amir mit Freunden im Park. Sie spielen Fußball und hören Musik. Später setzen sie sich auf eine Bank und sprechen über die Schule. Das Wetter ist warm und sonnig.',
  },
  {
    level: 'A1',
    topic: 'Wetter',
    title: 'Vier Jahreszeiten',
    content:
      'Im Frühling blühen viele Blumen. Im Sommer gehen die Kinder oft schwimmen. Im Herbst fallen die Blätter von den Bäumen. Im Winter trinken viele Menschen heißen Kakao.',
  },
  {
    level: 'A2',
    topic: 'Reise',
    title: 'Ein Wochenende in Wien',
    content:
      'Nora fährt mit dem Zug nach Wien und bleibt dort zwei Tage. Sie besucht ein Museum, macht viele Fotos und probiert Sachertorte. Am Sonntag spaziert sie an der Donau entlang und kauft kleine Souvenirs für ihre Familie.',
  },
  {
    level: 'A2',
    topic: 'Gesundheit',
    title: 'Gute Gewohnheiten',
    content:
      'Paul hat beschlossen, gesünder zu leben. Er kocht öfter selbst, trinkt mehr Wasser und geht dreimal pro Woche joggen. Wenn er gestresst ist, macht er kurze Atemübungen. So schläft er abends schneller ein.',
  },
  {
    level: 'A2',
    topic: 'Arbeit',
    title: 'Der erste Tag im Büro',
    content:
      'Mina beginnt eine neue Stelle in einem Reisebüro. Ihre Kolleginnen zeigen ihr die Software und erklären die wichtigsten Abläufe. Am Nachmittag beantwortet sie erste Kundenanfragen. Trotz Nervosität fühlt sie sich im Team willkommen.',
  },
  {
    level: 'A2',
    topic: 'Stadtleben',
    title: 'Ein neues Viertel',
    content:
      'In Karls Viertel wurde ein alter Parkplatz zu einem kleinen Platz mit Bäumen umgebaut. Jetzt sitzen dort viele Menschen am Abend, trinken Kaffee und reden miteinander. Auch ein Wochenmarkt findet jeden Mittwoch statt.',
  },
  {
    level: 'A2',
    topic: 'Essen',
    title: 'Kochen mit Freunden',
    content:
      'Am Freitag kochen drei Freunde zusammen. Eine Person schneidet Gemüse, eine bereitet die Soße zu und die dritte deckt den Tisch. Sie testen ein neues Rezept aus Italien. Das Ergebnis schmeckt allen sehr gut.',
  },
  {
    level: 'B1',
    topic: 'Umwelt',
    title: 'Plastik im Alltag reduzieren',
    content:
      'Viele Haushalte versuchen, weniger Plastik zu verbrauchen. Statt Einwegflaschen nutzen sie wiederverwendbare Behälter und kaufen häufiger unverpackte Lebensmittel. In Schulen wird dieses Thema inzwischen regelmäßig diskutiert, damit Kinder früh umweltfreundliche Gewohnheiten entwickeln.',
  },
  {
    level: 'B1',
    topic: 'Technologie',
    title: 'Lernen mit digitalen Tools',
    content:
      'In Sprachkursen werden heute oft Apps und Lernplattformen eingesetzt. Sie bieten interaktive Übungen, sofortiges Feedback und flexible Wiederholung. Gleichzeitig bleibt der direkte Austausch in der Gruppe wichtig, weil man dort spontan sprechen und Fragen stellen kann.',
  },
  {
    level: 'B1',
    topic: 'Bildung',
    title: 'Berufsausbildung und Studium',
    content:
      'Nach der Schule stehen Jugendlichen verschiedene Wege offen. Manche wählen eine Ausbildung, weil sie früh praktische Erfahrung sammeln möchten. Andere entscheiden sich für ein Studium, um sich theoretisch zu vertiefen. Beide Wege können zu erfolgreichen Karrieren führen.',
  },
  {
    level: 'B1',
    topic: 'Kultur',
    title: 'Ein Stadtfest verbindet',
    content:
      'Beim jährlichen Stadtfest treten lokale Bands auf und Vereine präsentieren ihre Arbeit. Besucherinnen und Besucher probieren Speisen aus unterschiedlichen Regionen und lernen neue Traditionen kennen. Solche Veranstaltungen stärken das Gemeinschaftsgefühl und fördern den kulturellen Austausch.',
  },
  {
    level: 'B1',
    topic: 'Beruf',
    title: 'Arbeiten im Homeoffice',
    content:
      'Viele Unternehmen erlauben inzwischen teilweise Homeoffice. Beschäftigte sparen dadurch Zeit für den Arbeitsweg und können ihren Tag flexibler organisieren. Gleichzeitig müssen Teams klare Regeln für Kommunikation und Erreichbarkeit vereinbaren, damit die Zusammenarbeit weiterhin effektiv bleibt.',
  },
  {
    level: 'B2',
    topic: 'Gesellschaft',
    title: 'Freiwilliges Engagement in der Stadt',
    content:
      'Immer mehr Bürgerinnen und Bürger engagieren sich in lokalen Initiativen, etwa in Nachbarschaftsprojekten oder Sprachcafés. Diese Arbeit entlastet öffentliche Einrichtungen und schafft soziale Bindungen. Allerdings benötigen Ehrenamtliche verlässliche Strukturen, damit ihr Einsatz langfristig wirksam bleibt.',
  },
  {
    level: 'B2',
    topic: 'Medien',
    title: 'Nachrichten zwischen Tempo und Qualität',
    content:
      'Digitale Medien verbreiten Informationen in Sekundenschnelle, was in Krisensituationen ein Vorteil sein kann. Gleichzeitig erhöht sich das Risiko, unvollständige oder falsche Inhalte weiterzugeben. Deshalb gewinnt Medienkompetenz an Bedeutung, sowohl in Schulen als auch in der Erwachsenenbildung.',
  },
  {
    level: 'B2',
    topic: 'Nachhaltigkeit',
    title: 'Konsum und Verantwortung',
    content:
      'Nachhaltiger Konsum bedeutet nicht nur, weniger zu kaufen, sondern bewusster auszuwählen. Viele Verbraucherinnen achten auf Produktionsbedingungen, Transportwege und Haltbarkeit. Unternehmen reagieren darauf mit transparenteren Lieferketten, doch ohne klare Standards bleibt die Vergleichbarkeit oft schwierig.',
  },
  {
    level: 'B2',
    topic: 'Wissenschaft',
    title: 'Forschung im Alltag sichtbar machen',
    content:
      'Wissenschaftliche Erkenntnisse beeinflussen zahlreiche Bereiche unseres Lebens, von Medizin bis Mobilität. Damit Forschung gesellschaftlich akzeptiert wird, müssen Ergebnisse verständlich kommuniziert werden. Wenn Fachleute komplexe Inhalte transparent erklären, steigt das Vertrauen in wissenschaftliche Prozesse.',
  },
  {
    level: 'B2',
    topic: 'Mobilität',
    title: 'Die Zukunft des Stadtverkehrs',
    content:
      'Städte investieren zunehmend in multimodale Verkehrssysteme, die Bus, Bahn, Fahrrad und Carsharing kombinieren. Ziel ist es, Emissionen zu senken und gleichzeitig die Erreichbarkeit zu verbessern. Entscheidend ist jedoch, dass Angebote verlässlich, bezahlbar und für alle Bevölkerungsgruppen zugänglich sind.',
  },
];

const SPEAKING_SEEDS: SpeakingSeed[] = [
  {
    level: 'A1',
    topic: 'Vorstellung',
    category: 'conversation',
    title: 'Kurz vorstellen',
    promptText: 'Stellen Sie sich mit Namen, Herkunft und Beruf in drei Sätzen vor.',
    promptTextVi: 'Giới thiệu ngắn bằng 3 câu: tên, quê quán, nghề nghiệp.',
    targetWords: ['heißen', 'kommen', 'arbeiten'],
    phonetics: ['/ˈhaɪ̯sn̩/', '/ˈkɔmən/', '/ˈaʁbaɪ̯tən/'],
    difficulty: 1,
  },
  {
    level: 'A1',
    topic: 'Familie',
    category: 'conversation',
    title: 'Familie beschreiben',
    promptText: 'Beschreiben Sie Ihre Familie mit vier einfachen Sätzen.',
    promptTextVi: 'Mô tả gia đình của bạn bằng 4 câu đơn giản.',
    targetWords: ['Familie', 'Mutter', 'Bruder'],
    phonetics: ['/faˈmiːli̯ə/', '/ˈmʊtɐ/', '/ˈbʁuːdɐ/'],
    difficulty: 1,
  },
  {
    level: 'A1',
    topic: 'Tagesablauf',
    category: 'conversation',
    title: 'Mein Tag',
    promptText: 'Erzählen Sie, was Sie morgens, mittags und abends machen.',
    promptTextVi: 'Kể bạn làm gì vào sáng, trưa và tối.',
    targetWords: ['morgens', 'mittags', 'abends'],
    phonetics: ['/ˈmɔʁɡn̩s/', '/ˈmɪtaːks/', '/ˈaːbn̩ts/'],
    difficulty: 1,
  },
  {
    level: 'A1',
    topic: 'Einkaufen',
    category: 'roleplay',
    title: 'Im Laden',
    promptText: 'Bitten Sie im Laden höflich um zwei Produkte.',
    promptTextVi: 'Đóng vai mua hàng và lịch sự xin 2 sản phẩm.',
    targetWords: ['bitte', 'möchte', 'haben'],
    phonetics: ['/ˈbɪtə/', '/ˈmœçtə/', '/ˈhaːbn̩/'],
    difficulty: 1,
  },
  {
    level: 'A1',
    topic: 'Hobbys',
    category: 'conversation',
    title: 'Mein Hobby',
    promptText: 'Sprechen Sie über Ihr Hobby und warum es Ihnen Spaß macht.',
    promptTextVi: 'Nói về sở thích và vì sao bạn thích nó.',
    targetWords: ['Hobby', 'spielen', 'Spaß'],
    phonetics: ['/ˈhɔbi/', '/ˈʃpiːlən/', '/ʃpaːs/'],
    difficulty: 1,
  },
  {
    level: 'A1',
    topic: 'Wetter',
    category: 'pronunciation',
    title: 'Wetterbericht kurz',
    promptText: 'Sagen Sie zwei Sätze über das Wetter heute.',
    promptTextVi: 'Nói 2 câu ngắn về thời tiết hôm nay.',
    targetWords: ['sonnig', 'regnerisch', 'kalt'],
    phonetics: ['/ˈzɔnɪç/', '/ˈʁeːɡnəʁɪʃ/', '/kalt/'],
    difficulty: 1,
  },
  {
    level: 'A1',
    topic: 'Schule',
    category: 'conversation',
    title: 'In der Schule',
    promptText: 'Beschreiben Sie Ihre Schule oder Ihren Deutschkurs.',
    promptTextVi: 'Mô tả trường học hoặc lớp tiếng Đức của bạn.',
    targetWords: ['Schule', 'Lehrer', 'lernen'],
    phonetics: ['/ˈʃuːlə/', '/ˈleːʁɐ/', '/ˈlɛʁnən/'],
    difficulty: 1,
  },
  {
    level: 'A1',
    topic: 'Essen',
    category: 'conversation',
    title: 'Lieblingsessen',
    promptText: 'Nennen Sie Ihr Lieblingsessen und wie oft Sie es essen.',
    promptTextVi: 'Nói món ăn yêu thích và tần suất bạn ăn.',
    targetWords: ['essen', 'Lieblingsessen', 'oft'],
    phonetics: ['/ˈʔɛsn̩/', '/ˈliːplɪŋsˌʔɛsn̩/', '/ɔft/'],
    difficulty: 1,
  },
  {
    level: 'A1',
    topic: 'Freunde',
    category: 'conversation',
    title: 'Ein guter Freund',
    promptText: 'Beschreiben Sie einen guten Freund in drei Sätzen.',
    promptTextVi: 'Mô tả một người bạn thân trong 3 câu.',
    targetWords: ['Freund', 'nett', 'hilfsbereit'],
    phonetics: ['/fʁɔʏ̯nt/', '/nɛt/', '/ˈhɪlfsbəˌʁaɪ̯t/'],
    difficulty: 1,
  },
  {
    level: 'A1',
    topic: 'Wohnung',
    category: 'conversation',
    title: 'Meine Wohnung',
    promptText: 'Beschreiben Sie Ihre Wohnung oder Ihr Zimmer.',
    promptTextVi: 'Mô tả căn hộ hoặc phòng của bạn.',
    targetWords: ['Wohnung', 'Zimmer', 'Küche'],
    phonetics: ['/ˈvoːnʊŋ/', '/ˈtsɪmɐ/', '/ˈkʏçə/'],
    difficulty: 1,
  },

  {
    level: 'A2',
    topic: 'Reise',
    category: 'conversation',
    title: 'Reiseplan erklären',
    promptText: 'Erklären Sie Ihren Plan für eine Wochenendreise.',
    promptTextVi: 'Giải thích kế hoạch cho một chuyến đi cuối tuần.',
    targetWords: ['Reise', 'buchen', 'abfahren'],
    phonetics: ['/ˈʁaɪ̯zə/', '/ˈbuːxn̩/', '/ˈapˌfaːʁən/'],
    difficulty: 2,
  },
  {
    level: 'A2',
    topic: 'Arbeit',
    category: 'conversation',
    title: 'Arbeitstag beschreiben',
    promptText: 'Beschreiben Sie Ihren typischen Arbeitstag.',
    promptTextVi: 'Mô tả một ngày làm việc điển hình của bạn.',
    targetWords: ['Arbeitstag', 'Besprechung', 'Pause'],
    phonetics: ['/ˈaʁbaɪ̯tstaːk/', '/bəˈʃpʁeːçʊŋ/', '/ˈpaʊ̯zə/'],
    difficulty: 2,
  },
  {
    level: 'A2',
    topic: 'Gesundheit',
    category: 'roleplay',
    title: 'Beim Arzt',
    promptText: 'Beschreiben Sie Ihre Symptome in einem Arztgespräch.',
    promptTextVi: 'Đóng vai trao đổi triệu chứng với bác sĩ.',
    targetWords: ['Kopfschmerzen', 'Fieber', 'Termin'],
    phonetics: ['/ˈkɔpfˌʃmɛʁtsn̩/', '/ˈfiːbɐ/', '/tɛʁˈmiːn/'],
    difficulty: 2,
  },
  {
    level: 'A2',
    topic: 'Wohnung',
    category: 'conversation',
    title: 'Wohnungsanzeige',
    promptText: 'Stellen Sie eine Wohnung kurz vor, die Sie vermieten möchten.',
    promptTextVi: 'Giới thiệu ngắn một căn hộ bạn muốn cho thuê.',
    targetWords: ['Miete', 'Balkon', 'zentral'],
    phonetics: ['/ˈmiːtə/', '/balˈkoːn/', '/tsɛnˈtʁaːl/'],
    difficulty: 2,
  },
  {
    level: 'A2',
    topic: 'Freizeit',
    category: 'conversation',
    title: 'Wochenendaktivitäten',
    promptText: 'Erzählen Sie, was Sie am Wochenende gern unternehmen.',
    promptTextVi: 'Kể bạn thường làm gì vào cuối tuần.',
    targetWords: ['unternehmen', 'wandern', 'entspannen'],
    phonetics: ['/ˌʊntɐˈneːmən/', '/ˈvandɐn/', '/ɛntˈʃpanən/'],
    difficulty: 2,
  },
  {
    level: 'A2',
    topic: 'Essen',
    category: 'roleplay',
    title: 'Im Restaurant bestellen',
    promptText: 'Bestellen Sie ein Hauptgericht und ein Getränk.',
    promptTextVi: 'Gọi món chính và đồ uống tại nhà hàng.',
    targetWords: ['Hauptgericht', 'Getränk', 'Rechnung'],
    phonetics: ['/ˈhaʊ̯ptɡəˌʁɪçt/', '/ɡəˈtʁɛŋk/', '/ˈʁɛçnʊŋ/'],
    difficulty: 2,
  },
  {
    level: 'A2',
    topic: 'Lernen',
    category: 'conversation',
    title: 'Deutsch lernen',
    promptText: 'Sprechen Sie über Ihre Methoden beim Deutschlernen.',
    promptTextVi: 'Nói về phương pháp học tiếng Đức của bạn.',
    targetWords: ['üben', 'Wortschatz', 'regelmäßig'],
    phonetics: ['/ˈyːbn̩/', '/ˈvɔʁtʃats/', '/ˈʁeːɡl̩ˌmɛːsɪç/'],
    difficulty: 2,
  },
  {
    level: 'A2',
    topic: 'Stadt',
    category: 'conversation',
    title: 'Meine Stadt',
    promptText: 'Beschreiben Sie Vorteile und Nachteile Ihrer Stadt.',
    promptTextVi: 'Mô tả ưu và nhược điểm của thành phố bạn sống.',
    targetWords: ['Verkehr', 'ruhig', 'modern'],
    phonetics: ['/fɛɐ̯ˈkeːɐ̯/', '/ˈʁuːɪç/', '/moˈdɛʁn/'],
    difficulty: 2,
  },
  {
    level: 'A2',
    topic: 'Einkaufen',
    category: 'conversation',
    title: 'Online oder im Laden',
    promptText: 'Vergleichen Sie Online-Einkauf mit Einkaufen im Laden.',
    promptTextVi: 'So sánh mua sắm online và mua tại cửa hàng.',
    targetWords: ['bestellen', 'Lieferung', 'ausprobieren'],
    phonetics: ['/bəˈʃtɛlən/', '/ˈliːfərʊŋ/', '/ˈaʊ̯sproˌbiːʁən/'],
    difficulty: 2,
  },
  {
    level: 'A2',
    topic: 'Wetter',
    category: 'conversation',
    title: 'Lieblingsjahreszeit',
    promptText: 'Nennen Sie Ihre Lieblingsjahreszeit und begründen Sie kurz.',
    promptTextVi: 'Nêu mùa bạn thích nhất và giải thích ngắn.',
    targetWords: ['Jahreszeit', 'warm', 'kühl'],
    phonetics: ['/ˈjaːʁəsˌtsaɪ̯t/', '/vaʁm/', '/kyːl/'],
    difficulty: 2,
  },

  {
    level: 'B1',
    topic: 'Beruf',
    category: 'conversation',
    title: 'Berufliche Ziele',
    promptText: 'Sprechen Sie über Ihre beruflichen Ziele in den nächsten fünf Jahren.',
    promptTextVi: 'Nói về mục tiêu nghề nghiệp trong 5 năm tới.',
    targetWords: ['Karriere', 'entwickeln', 'Verantwortung'],
    phonetics: ['/kaˈʁi̯eːʁə/', '/ɛntˈvɪkl̩n/', '/fɛɐ̯ˈʔantvɔʁtʊŋ/'],
    difficulty: 3,
  },
  {
    level: 'B1',
    topic: 'Umwelt',
    category: 'discussion',
    title: 'Umweltfreundlicher Alltag',
    promptText: 'Erläutern Sie, welche Maßnahmen im Alltag die Umwelt schützen können.',
    promptTextVi: 'Trình bày các biện pháp hằng ngày giúp bảo vệ môi trường.',
    targetWords: ['vermeiden', 'recyceln', 'Ressourcen'],
    phonetics: ['/fɛɐ̯ˈmaɪ̯dn̩/', '/ʁeˈsaɪ̯kln̩/', '/ʁeˈsʊʁsn̩/'],
    difficulty: 3,
  },
  {
    level: 'B1',
    topic: 'Technologie',
    category: 'discussion',
    title: 'Digitale Balance',
    promptText: 'Diskutieren Sie Vor- und Nachteile der ständigen Smartphone-Nutzung.',
    promptTextVi: 'Thảo luận ưu/nhược điểm của việc dùng smartphone liên tục.',
    targetWords: ['Bildschirmzeit', 'Ablenkung', 'Kommunikation'],
    phonetics: ['/ˈbɪltʃɪʁmˌtsaɪ̯t/', '/ˈaplɛŋkʊŋ/', '/kɔmunikaˈtsi̯oːn/'],
    difficulty: 3,
  },
  {
    level: 'B1',
    topic: 'Bildung',
    category: 'discussion',
    title: 'Lebenslanges Lernen',
    promptText: 'Erklären Sie, warum lebenslanges Lernen heute wichtig ist.',
    promptTextVi: 'Giải thích vì sao học tập suốt đời quan trọng hiện nay.',
    targetWords: ['Fortbildung', 'Kompetenz', 'Veränderung'],
    phonetics: ['/ˈfɔʁtbɪldʊŋ/', '/kɔmpəˈtɛnts/', '/fɛɐ̯ˈʔɛndəʁʊŋ/'],
    difficulty: 3,
  },
  {
    level: 'B1',
    topic: 'Kultur',
    category: 'presentation',
    title: 'Ein kulturelles Ereignis',
    promptText: 'Berichten Sie über ein kulturelles Ereignis, das Sie beeindruckt hat.',
    promptTextVi: 'Kể về một sự kiện văn hóa gây ấn tượng với bạn.',
    targetWords: ['Ausstellung', 'beeindruckend', 'Atmosphäre'],
    phonetics: ['/ˈaʊ̯sˌʃtɛlʊŋ/', '/bəˈʔaɪ̯ndʁʊkn̩t/', '/atmɔsˈfɛːʁə/'],
    difficulty: 3,
  },
  {
    level: 'B1',
    topic: 'Gesundheit',
    category: 'discussion',
    title: 'Stress im Alltag',
    promptText: 'Beschreiben Sie Strategien, um Stress im Alltag zu reduzieren.',
    promptTextVi: 'Mô tả chiến lược giảm căng thẳng trong cuộc sống hằng ngày.',
    targetWords: ['Stress', 'Ausgleich', 'Prioritäten'],
    phonetics: ['/ʃtʁɛs/', '/ˈaʊ̯sɡlaɪ̯ç/', '/pʁi̯oʁiˈtɛːtn̩/'],
    difficulty: 3,
  },
  {
    level: 'B1',
    topic: 'Medien',
    category: 'discussion',
    title: 'Verlässliche Informationen',
    promptText: 'Erklären Sie, wie man verlässliche Nachrichtenquellen erkennt.',
    promptTextVi: 'Giải thích cách nhận biết nguồn tin đáng tin cậy.',
    targetWords: ['Quelle', 'überprüfen', 'glaubwürdig'],
    phonetics: ['/ˈkvɛlə/', '/yːbɐˈpʁyːfn̩/', '/ˈɡlaʊ̯pvʏʁdɪç/'],
    difficulty: 3,
  },
  {
    level: 'B1',
    topic: 'Reisen',
    category: 'presentation',
    title: 'Nachhaltig reisen',
    promptText: 'Nennen Sie Möglichkeiten, Reisen nachhaltiger zu gestalten.',
    promptTextVi: 'Nêu cách để du lịch bền vững hơn.',
    targetWords: ['nachhaltig', 'Unterkunft', 'Verkehrsmittel'],
    phonetics: ['/ˈnaːxhaltɪç/', '/ˈʊntɐkʊnft/', '/fɛɐ̯ˈkeːɐ̯smɪtl̩/'],
    difficulty: 3,
  },
  {
    level: 'B1',
    topic: 'Teamarbeit',
    category: 'discussion',
    title: 'Gute Zusammenarbeit',
    promptText: 'Beschreiben Sie, welche Eigenschaften gute Teamarbeit braucht.',
    promptTextVi: 'Mô tả các yếu tố cần có để làm việc nhóm hiệu quả.',
    targetWords: ['Abstimmung', 'Vertrauen', 'Konflikt'],
    phonetics: ['/ˈapʃtɪmʊŋ/', '/fɛɐ̯ˈtʁaʊ̯ən/', '/kɔnˈflɪkt/'],
    difficulty: 3,
  },
  {
    level: 'B1',
    topic: 'Zukunft',
    category: 'presentation',
    title: 'Leben in zehn Jahren',
    promptText: 'Stellen Sie sich Ihr Leben in zehn Jahren vor und begründen Sie Ihre Erwartungen.',
    promptTextVi: 'Hãy tưởng tượng cuộc sống của bạn sau 10 năm và giải thích kỳ vọng.',
    targetWords: ['Zukunft', 'vermutlich', 'entscheiden'],
    phonetics: ['/ˈtsuːkʊnft/', '/fɛɐ̯ˈmuːtlɪç/', '/ɛntˈʃaɪ̯dn̩/'],
    difficulty: 3,
  },
];

const WRITING_SEEDS: WritingSeed[] = [
  {
    level: 'A1',
    topic: 'Vorstellung',
    category: 'free_writing',
    title: 'Ich und mein Alltag',
    promptText: 'Schreiben Sie einen kurzen Text über sich und Ihren Alltag.',
    promptTextVi: 'Viết đoạn văn ngắn về bản thân và sinh hoạt hằng ngày.',
    instructions: 'Nutzen Sie mindestens fünf einfache Sätze im Präsens.',
    instructionsVi: 'Dùng ít nhất 5 câu đơn giản ở thì hiện tại.',
    templateText: 'Ich heiße ____. Ich wohne in ____. Am Morgen ____.',
    keywords: ['ich', 'wohnen', 'arbeiten'],
    grammarPoints: ['Präsens', 'Verbposition'],
    vocabularyFocus: ['Morgen', 'Abend', 'Tag'],
    minWords: 35,
    wordLimit: 110,
    difficulty: 1,
  },
  {
    level: 'A1',
    topic: 'Familie',
    category: 'free_writing',
    title: 'Meine Familie',
    promptText: 'Beschreiben Sie Ihre Familie in einem kurzen Text.',
    promptTextVi: 'Mô tả gia đình của bạn trong một đoạn ngắn.',
    instructions: 'Nennen Sie mindestens drei Familienmitglieder.',
    instructionsVi: 'Nêu ít nhất 3 thành viên gia đình.',
    templateText: 'In meiner Familie gibt es ____. Meine Mutter ____.',
    keywords: ['Familie', 'Mutter', 'Vater'],
    grammarPoints: ['haben', 'Possessivartikel'],
    vocabularyFocus: ['Bruder', 'Schwester', 'Eltern'],
    minWords: 40,
    wordLimit: 120,
    difficulty: 1,
  },
  {
    level: 'A1',
    topic: 'Essen',
    category: 'free_writing',
    title: 'Mein Lieblingsessen',
    promptText: 'Schreiben Sie über Ihr Lieblingsessen und warum es Ihnen schmeckt.',
    promptTextVi: 'Viết về món ăn yêu thích và lý do bạn thích nó.',
    instructions: 'Verwenden Sie einfache Adjektive.',
    instructionsVi: 'Sử dụng các tính từ đơn giản.',
    templateText: 'Mein Lieblingsessen ist ____. Es ist ____ und ____.',
    keywords: ['essen', 'lecker', 'kochen'],
    grammarPoints: ['Adjektive', 'sein'],
    vocabularyFocus: ['Suppe', 'Reis', 'Gemüse'],
    minWords: 35,
    wordLimit: 110,
    difficulty: 1,
  },
  {
    level: 'A1',
    topic: 'Freizeit',
    category: 'free_writing',
    title: 'Mein Wochenende',
    promptText: 'Beschreiben Sie Ihr typisches Wochenende.',
    promptTextVi: 'Mô tả cuối tuần điển hình của bạn.',
    instructions: 'Schreiben Sie über Samstag und Sonntag.',
    instructionsVi: 'Viết về cả thứ Bảy và Chủ nhật.',
    templateText: 'Am Samstag ____. Am Sonntag ____.',
    keywords: ['Samstag', 'Sonntag', 'Freunde'],
    grammarPoints: ['Temporale Angaben', 'Präsens'],
    vocabularyFocus: ['spazieren', 'lesen', 'treffen'],
    minWords: 40,
    wordLimit: 120,
    difficulty: 1,
  },
  {
    level: 'A1',
    topic: 'Wetter',
    category: 'fill_blank',
    title: 'Wetterbericht ergänzen',
    promptText: 'Ergänzen Sie einen kurzen Wetterbericht.',
    promptTextVi: 'Điền vào chỗ trống của một bản tin thời tiết ngắn.',
    instructions: 'Setzen Sie passende Wetterwörter ein.',
    instructionsVi: 'Điền từ vựng phù hợp về thời tiết.',
    templateText: 'Heute ist es ____. Morgen wird es ____.',
    keywords: ['sonnig', 'regnerisch', 'kalt'],
    grammarPoints: ['sein', 'werden'],
    vocabularyFocus: ['heute', 'morgen', 'Temperatur'],
    minWords: 20,
    wordLimit: 70,
    difficulty: 1,
  },

  {
    level: 'A2',
    topic: 'Reise',
    category: 'free_writing',
    title: 'Eine kurze Reiseplanung',
    promptText: 'Planen Sie eine zweitägige Reise und schreiben Sie den Plan auf.',
    promptTextVi: 'Lập kế hoạch chuyến đi 2 ngày và viết lại.',
    instructions: 'Nutzen Sie Zeitangaben und Ortsangaben.',
    instructionsVi: 'Sử dụng mốc thời gian và địa điểm.',
    templateText: 'Am ersten Tag ____. Am zweiten Tag ____.',
    keywords: ['fahren', 'besuchen', 'Hotel'],
    grammarPoints: ['Perfekt', 'Präpositionen'],
    vocabularyFocus: ['Bahnhof', 'Zimmer', 'Ticket'],
    minWords: 60,
    wordLimit: 150,
    difficulty: 2,
  },
  {
    level: 'A2',
    topic: 'Gesundheit',
    category: 'free_writing',
    title: 'Gesund bleiben',
    promptText: 'Schreiben Sie Tipps für einen gesunden Alltag.',
    promptTextVi: 'Viết lời khuyên để sống lành mạnh.',
    instructions: 'Geben Sie mindestens drei konkrete Tipps.',
    instructionsVi: 'Đưa ra ít nhất 3 lời khuyên cụ thể.',
    templateText: 'Man sollte ____. Außerdem ist es wichtig, ____.',
    keywords: ['sollte', 'Sport', 'schlafen'],
    grammarPoints: ['Modalverben', 'Nebensätze mit weil'],
    vocabularyFocus: ['Ernährung', 'Bewegung', 'Stress'],
    minWords: 70,
    wordLimit: 170,
    difficulty: 2,
  },
  {
    level: 'A2',
    topic: 'Arbeit',
    category: 'free_writing',
    title: 'Ein Arbeitstag',
    promptText: 'Beschreiben Sie Ihren Arbeitstag oder den eines Freundes.',
    promptTextVi: 'Mô tả một ngày làm việc của bạn hoặc bạn bè.',
    instructions: 'Verwenden Sie Konnektoren wie dann, danach, schließlich.',
    instructionsVi: 'Dùng từ nối như dann, danach, schließlich.',
    templateText: 'Zuerst ____. Danach ____. Schließlich ____.',
    keywords: ['Büro', 'Aufgabe', 'Kollegen'],
    grammarPoints: ['Satzverbindungen', 'Trennbare Verben'],
    vocabularyFocus: ['Besprechung', 'E-Mail', 'Pause'],
    minWords: 70,
    wordLimit: 170,
    difficulty: 2,
  },
  {
    level: 'A2',
    topic: 'Stadtleben',
    category: 'free_writing',
    title: 'Meine Stadt heute',
    promptText: 'Beschreiben Sie, was Ihre Stadt lebenswert macht.',
    promptTextVi: 'Mô tả điều khiến thành phố bạn đáng sống.',
    instructions: 'Nennen Sie öffentliche Orte und Aktivitäten.',
    instructionsVi: 'Nêu các địa điểm công cộng và hoạt động.',
    templateText: 'In meiner Stadt gibt es ____. Besonders mag ich ____.',
    keywords: ['Stadt', 'Park', 'Verkehr'],
    grammarPoints: ['Relativsätze', 'Komparativ'],
    vocabularyFocus: ['Zentrum', 'Viertel', 'Angebot'],
    minWords: 70,
    wordLimit: 170,
    difficulty: 2,
  },
  {
    level: 'A2',
    topic: 'Essen',
    category: 'free_writing',
    title: 'Kochrezept erklären',
    promptText: 'Erklären Sie ein einfaches Rezept Schritt für Schritt.',
    promptTextVi: 'Giải thích một công thức nấu ăn đơn giản theo từng bước.',
    instructions: 'Nutzen Sie Imperativformen oder man-Form.',
    instructionsVi: 'Dùng câu mệnh lệnh hoặc cấu trúc man.',
    templateText: 'Zuerst ____. Dann ____. Zum Schluss ____.',
    keywords: ['zuerst', 'dann', 'zum Schluss'],
    grammarPoints: ['Imperativ', 'man-Konstruktionen'],
    vocabularyFocus: ['schneiden', 'kochen', 'würzen'],
    minWords: 65,
    wordLimit: 160,
    difficulty: 2,
  },

  {
    level: 'B1',
    topic: 'Umwelt',
    category: 'essay',
    title: 'Plastik vermeiden im Alltag',
    promptText: 'Nehmen Sie Stellung zum Thema Plastikvermeidung im Alltag.',
    promptTextVi: 'Nêu quan điểm về việc giảm dùng nhựa trong đời sống hằng ngày.',
    instructions: 'Schreiben Sie mit Einleitung, Argumenten und Schluss.',
    instructionsVi: 'Viết có mở bài, luận điểm và kết luận.',
    templateText: 'Meiner Meinung nach ____. Ein wichtiges Argument ist ____.',
    keywords: ['Umwelt', 'Plastik', 'Verantwortung'],
    grammarPoints: ['Konjunktiv II', 'Kausalsätze'],
    vocabularyFocus: ['wiederverwenden', 'Müll', 'nachhaltig'],
    minWords: 110,
    wordLimit: 250,
    difficulty: 3,
  },
  {
    level: 'B1',
    topic: 'Technologie',
    category: 'essay',
    title: 'Digitale Medien im Lernen',
    promptText: 'Bewerten Sie den Einsatz digitaler Medien im Lernen.',
    promptTextVi: 'Đánh giá việc sử dụng phương tiện số trong học tập.',
    instructions: 'Nennen Sie Vorteile und Risiken ausgewogen.',
    instructionsVi: 'Nêu cân bằng ưu điểm và rủi ro.',
    templateText: 'Einerseits ____. Andererseits ____.',
    keywords: ['Medien', 'Lernen', 'Konzentration'],
    grammarPoints: ['Konnektoren', 'Passiv'],
    vocabularyFocus: ['Ablenkung', 'Effizienz', 'Interaktion'],
    minWords: 110,
    wordLimit: 250,
    difficulty: 3,
  },
  {
    level: 'B1',
    topic: 'Bildung',
    category: 'essay',
    title: 'Praktikum oder Studium zuerst?',
    promptText: 'Diskutieren Sie, ob ein Praktikum vor dem Studium sinnvoll ist.',
    promptTextVi: 'Thảo luận việc thực tập trước đại học có hợp lý không.',
    instructions: 'Argumentieren Sie mit Beispielen.',
    instructionsVi: 'Lập luận kèm ví dụ.',
    templateText: 'Ein Vorteil ist ____. Ein Nachteil ist ____.',
    keywords: ['Praktikum', 'Erfahrung', 'Studium'],
    grammarPoints: ['Argumentationssprache', 'Nebensätze'],
    vocabularyFocus: ['Bewerbung', 'Qualifikation', 'Karriere'],
    minWords: 110,
    wordLimit: 250,
    difficulty: 3,
  },
  {
    level: 'B1',
    topic: 'Kultur',
    category: 'essay',
    title: 'Kulturelle Vielfalt im Alltag',
    promptText: 'Beschreiben Sie, wie kulturelle Vielfalt Ihren Alltag beeinflusst.',
    promptTextVi: 'Mô tả sự đa dạng văn hóa ảnh hưởng cuộc sống hằng ngày thế nào.',
    instructions: 'Nutzen Sie konkrete Situationen als Beispiele.',
    instructionsVi: 'Dùng các tình huống cụ thể làm ví dụ.',
    templateText: 'In meinem Alltag sehe ich ____. Dadurch ____.',
    keywords: ['Vielfalt', 'Tradition', 'Respekt'],
    grammarPoints: ['Relativsätze', 'Partizipialattribute'],
    vocabularyFocus: ['Gemeinschaft', 'Austausch', 'Perspektive'],
    minWords: 110,
    wordLimit: 250,
    difficulty: 3,
  },
  {
    level: 'B1',
    topic: 'Beruf',
    category: 'essay',
    title: 'Teamarbeit im Beruf',
    promptText: 'Erklären Sie, warum Teamarbeit in vielen Berufen wichtig ist.',
    promptTextVi: 'Giải thích vì sao làm việc nhóm quan trọng trong nhiều nghề.',
    instructions: 'Führen Sie mindestens zwei klare Gründe an.',
    instructionsVi: 'Đưa ra ít nhất 2 lý do rõ ràng.',
    templateText: 'Teamarbeit ist wichtig, weil ____. Außerdem ____.',
    keywords: ['Team', 'Kommunikation', 'Erfolg'],
    grammarPoints: ['weil-Sätze', 'Nominalisierung'],
    vocabularyFocus: ['Koordination', 'Rolle', 'Ziel'],
    minWords: 110,
    wordLimit: 250,
    difficulty: 3,
  },

  {
    level: 'B2',
    topic: 'Medien',
    category: 'essay',
    title: 'Verantwortung in sozialen Medien',
    promptText: 'Analysieren Sie Verantwortung und Risiken in sozialen Medien.',
    promptTextVi: 'Phân tích trách nhiệm và rủi ro trên mạng xã hội.',
    instructions: 'Formulieren Sie eine differenzierte Position mit Gegenargument.',
    instructionsVi: 'Nêu quan điểm đa chiều và có phản biện.',
    templateText: 'Zunächst ist festzuhalten, dass ____. Dennoch ____.',
    keywords: ['Verantwortung', 'Plattform', 'Desinformation'],
    grammarPoints: ['Konzessivsätze', 'Nominalstil'],
    vocabularyFocus: ['Reichweite', 'Moderation', 'Transparenz'],
    minWords: 140,
    wordLimit: 320,
    difficulty: 4,
  },
  {
    level: 'B2',
    topic: 'Nachhaltigkeit',
    category: 'essay',
    title: 'Nachhaltiger Konsum zwischen Anspruch und Realität',
    promptText: 'Diskutieren Sie Hürden und Chancen nachhaltigen Konsums.',
    promptTextVi: 'Thảo luận rào cản và cơ hội của tiêu dùng bền vững.',
    instructions: 'Nutzen Sie strukturierte Abschnitte und ein Fazit.',
    instructionsVi: 'Viết có cấu trúc đoạn rõ ràng và kết luận.',
    templateText: 'Auf der einen Seite ____. Auf der anderen Seite ____.',
    keywords: ['Konsum', 'Ressourcen', 'Lieferkette'],
    grammarPoints: ['Partizipialkonstruktionen', 'Kohäsionsmittel'],
    vocabularyFocus: ['Zertifizierung', 'Produktion', 'Verfügbarkeit'],
    minWords: 140,
    wordLimit: 320,
    difficulty: 4,
  },
  {
    level: 'B2',
    topic: 'Wissenschaft',
    category: 'essay',
    title: 'Vertrauen in wissenschaftliche Ergebnisse',
    promptText: 'Erläutern Sie, wie Wissenschaft verständlich kommuniziert werden sollte.',
    promptTextVi: 'Trình bày cách nên truyền thông khoa học để dễ hiểu.',
    instructions: 'Berücksichtigen Sie Zielgruppe, Sprache und Medienformat.',
    instructionsVi: 'Xét đối tượng, ngôn ngữ và định dạng truyền thông.',
    templateText: 'Eine wirksame Kommunikation gelingt, wenn ____.',
    keywords: ['Forschung', 'Vertrauen', 'Kommunikation'],
    grammarPoints: ['Passiv', 'Satzklammer'],
    vocabularyFocus: ['Evidenz', 'Methode', 'Nachvollziehbarkeit'],
    minWords: 140,
    wordLimit: 320,
    difficulty: 4,
  },
  {
    level: 'B2',
    topic: 'Mobilität',
    category: 'essay',
    title: 'Stadtverkehr der Zukunft',
    promptText: 'Bewerten Sie Maßnahmen für einen nachhaltigen Stadtverkehr.',
    promptTextVi: 'Đánh giá các giải pháp giao thông đô thị bền vững.',
    instructions: 'Vergleichen Sie mindestens zwei Lösungsansätze.',
    instructionsVi: 'So sánh ít nhất 2 hướng giải pháp.',
    templateText: 'Ein möglicher Ansatz wäre ____. Im Vergleich dazu ____.',
    keywords: ['Infrastruktur', 'ÖPNV', 'Emissionen'],
    grammarPoints: ['Vergleichsstrukturen', 'Konsekutivsätze'],
    vocabularyFocus: ['Taktung', 'Verlagerung', 'Anreiz'],
    minWords: 140,
    wordLimit: 320,
    difficulty: 4,
  },
  {
    level: 'B2',
    topic: 'Gesellschaft',
    category: 'essay',
    title: 'Bürgerschaftliches Engagement stärken',
    promptText: 'Diskutieren Sie, wie freiwilliges Engagement langfristig gefördert werden kann.',
    promptTextVi: 'Thảo luận cách thúc đẩy hoạt động tình nguyện bền vững.',
    instructions: 'Entwickeln Sie konkrete Vorschläge mit Begründung.',
    instructionsVi: 'Đưa ra đề xuất cụ thể kèm lý do.',
    templateText: 'Langfristig wirksam ist Engagement dann, wenn ____.',
    keywords: ['Engagement', 'Gemeinschaft', 'Strukturen'],
    grammarPoints: ['Finalsätze', 'Abstrakte Nominalisierung'],
    vocabularyFocus: ['Anerkennung', 'Koordination', 'Verlässlichkeit'],
    minWords: 140,
    wordLimit: 320,
    difficulty: 4,
  },
];

const LISTENING_SEEDS: ListeningSeed[] = [
  {
    level: 'A1',
    topic: 'Familie',
    title: 'Ein Abend mit der Familie',
    transcript:
      'Heute Abend essen wir zusammen. Meine Schwester deckt den Tisch. Danach sprechen wir über die Schule.',
    transcriptVi:
      'Tối nay chúng tôi ăn cùng nhau. Em gái tôi dọn bàn. Sau đó chúng tôi nói về trường học.',
  },
  {
    level: 'A1',
    topic: 'Alltag',
    title: 'Morgens um sieben',
    transcript:
      'Ich stehe um sieben Uhr auf. Ich trinke Tee und esse Brot. Dann gehe ich zur Arbeit.',
    transcriptVi:
      'Tôi thức dậy lúc 7 giờ. Tôi uống trà và ăn bánh mì. Sau đó tôi đi làm.',
  },
  {
    level: 'A1',
    topic: 'Einkaufen',
    title: 'Kleine Einkaufsliste',
    transcript:
      'Im Supermarkt kaufe ich Milch, Käse und Tomaten. Die Tomaten sind heute günstig. An der Kasse bezahle ich bar.',
    transcriptVi:
      'Ở siêu thị tôi mua sữa, phô mai và cà chua. Cà chua hôm nay rẻ. Ở quầy thanh toán tôi trả tiền mặt.',
  },
  {
    level: 'A1',
    topic: 'Freizeit',
    title: 'Spaziergang im Park',
    transcript:
      'Am Nachmittag gehe ich in den Park. Ich treffe dort einen Freund. Wir sprechen und hören Musik.',
    transcriptVi:
      'Buổi chiều tôi đi công viên. Tôi gặp một người bạn ở đó. Chúng tôi trò chuyện và nghe nhạc.',
  },
  {
    level: 'A1',
    topic: 'Wetter',
    title: 'Heute und morgen',
    transcript:
      'Heute ist es sonnig und warm. Morgen wird es kühler und windig. Ich nehme eine Jacke mit.',
    transcriptVi:
      'Hôm nay trời nắng và ấm. Ngày mai sẽ mát hơn và có gió. Tôi sẽ mang theo áo khoác.',
  },
  {
    level: 'A2',
    topic: 'Reise',
    title: 'Mit dem Zug nach Berlin',
    transcript:
      'Wir fahren am Freitag mit dem Zug nach Berlin. Die Fahrt dauert vier Stunden. Im Hotel haben wir ein Zimmer mit Frühstück gebucht.',
    transcriptVi:
      'Chúng tôi đi tàu đến Berlin vào thứ Sáu. Chuyến đi mất bốn tiếng. Chúng tôi đặt phòng khách sạn có bữa sáng.',
  },
  {
    level: 'A2',
    topic: 'Gesundheit',
    title: 'Tipps vom Arzt',
    transcript:
      'Der Arzt sagt, ich soll mehr Wasser trinken und regelmäßig spazieren gehen. Außerdem soll ich früher schlafen. Nach zwei Wochen geht es mir besser.',
    transcriptVi:
      'Bác sĩ nói tôi nên uống nhiều nước hơn và đi bộ đều đặn. Ngoài ra tôi nên ngủ sớm hơn. Sau hai tuần tôi thấy khỏe hơn.',
  },
  {
    level: 'A2',
    topic: 'Arbeit',
    title: 'Ein voller Montag',
    transcript:
      'Am Montag habe ich zwei Besprechungen und viele E-Mails. In der Mittagspause esse ich mit Kolleginnen. Am Abend schreibe ich den Tagesbericht.',
    transcriptVi:
      'Thứ Hai tôi có hai cuộc họp và nhiều email. Trong giờ nghỉ trưa tôi ăn cùng đồng nghiệp. Buổi tối tôi viết báo cáo trong ngày.',
  },
  {
    level: 'A2',
    topic: 'Stadtleben',
    title: 'Neuer Wochenmarkt',
    transcript:
      'Seit diesem Monat gibt es einen Wochenmarkt im Viertel. Dort kaufen viele Menschen frisches Obst und Brot. Die Nachbarn treffen sich und sprechen miteinander.',
    transcriptVi:
      'Từ tháng này có chợ phiên trong khu phố. Ở đó nhiều người mua trái cây tươi và bánh mì. Hàng xóm gặp nhau và trò chuyện.',
  },
  {
    level: 'A2',
    topic: 'Essen',
    title: 'Gemeinsam kochen',
    transcript:
      'Heute kochen wir Gemüsesuppe mit Reis. Zuerst schneiden wir Karotten und Kartoffeln. Danach lassen wir alles zwanzig Minuten kochen.',
    transcriptVi:
      'Hôm nay chúng tôi nấu súp rau với cơm. Đầu tiên chúng tôi cắt cà rốt và khoai tây. Sau đó để mọi thứ nấu trong hai mươi phút.',
  },
  {
    level: 'B1',
    topic: 'Umwelt',
    title: 'Weniger Müll im Büro',
    transcript:
      'Unser Team hat beschlossen, im Büro weniger Müll zu produzieren. Wir verwenden wiederverwendbare Flaschen und trennen Papier konsequenter. Schon nach einem Monat sehen wir deutliche Verbesserungen.',
    transcriptVi:
      'Nhóm của chúng tôi quyết định giảm rác tại văn phòng. Chúng tôi dùng chai tái sử dụng và phân loại giấy kỹ hơn. Chỉ sau một tháng đã thấy cải thiện rõ.',
  },
  {
    level: 'B1',
    topic: 'Technologie',
    title: 'Neue Lernplattform',
    transcript:
      'In unserem Kurs testen wir eine neue Lernplattform. Die Übungen passen sich dem Niveau der Lernenden an und geben sofort Rückmeldung. Viele Teilnehmende finden diese Form motivierend.',
    transcriptVi:
      'Trong khóa học của chúng tôi, chúng tôi thử một nền tảng học mới. Bài tập tự điều chỉnh theo trình độ và phản hồi ngay. Nhiều học viên thấy cách này tạo động lực.',
  },
  {
    level: 'B1',
    topic: 'Bildung',
    title: 'Lernen außerhalb der Schule',
    transcript:
      'Viele Jugendliche lernen auch außerhalb der Schule, zum Beispiel in Vereinen oder online. Dort entwickeln sie praktische Fähigkeiten, die im Unterricht manchmal zu kurz kommen. Diese Erfahrungen helfen später im Beruf.',
    transcriptVi:
      'Nhiều bạn trẻ học ngoài trường, ví dụ trong câu lạc bộ hoặc online. Ở đó họ phát triển kỹ năng thực hành đôi khi thiếu trong lớp. Những trải nghiệm này hữu ích cho nghề nghiệp sau này.',
  },
  {
    level: 'B1',
    topic: 'Kultur',
    title: 'Musikfestival in der Region',
    transcript:
      'Jeden Sommer findet in unserer Region ein Musikfestival statt. Dort treten bekannte und lokale Bands auf, und viele Familien kommen zusammen. Das Festival stärkt den Zusammenhalt in der Region.',
    transcriptVi:
      'Mỗi mùa hè ở vùng chúng tôi có lễ hội âm nhạc. Có cả ban nhạc nổi tiếng và địa phương biểu diễn, nhiều gia đình cùng tham gia. Lễ hội giúp tăng gắn kết cộng đồng.',
  },
  {
    level: 'B1',
    topic: 'Beruf',
    title: 'Feedback im Team',
    transcript:
      'In unserem Team geben wir uns einmal pro Woche Feedback. So erkennen wir schnell, was gut läuft und wo wir uns verbessern können. Diese Routine hat die Zusammenarbeit deutlich erleichtert.',
    transcriptVi:
      'Trong nhóm của chúng tôi, mỗi tuần chúng tôi phản hồi cho nhau một lần. Nhờ vậy nhanh chóng nhận ra điều gì tốt và chỗ cần cải thiện. Thói quen này giúp hợp tác dễ dàng hơn nhiều.',
  },
  {
    level: 'B2',
    topic: 'Gesellschaft',
    title: 'Ehrenamt und Stadtentwicklung',
    transcript:
      'Freiwilliges Engagement spielt eine wichtige Rolle bei der Entwicklung urbaner Räume. Wenn Bürgerinitiativen mit der Verwaltung kooperieren, entstehen oft passgenaue Lösungen für lokale Probleme. Entscheidend ist eine transparente Kommunikation zwischen allen Beteiligten.',
    transcriptVi:
      'Hoạt động tình nguyện đóng vai trò quan trọng trong phát triển đô thị. Khi sáng kiến cộng đồng phối hợp với chính quyền, thường tạo ra giải pháp phù hợp cho vấn đề địa phương. Yếu tố then chốt là giao tiếp minh bạch giữa các bên.',
  },
  {
    level: 'B2',
    topic: 'Medien',
    title: 'Informationsflut im Alltag',
    transcript:
      'Die tägliche Informationsflut stellt viele Menschen vor neue Herausforderungen. Wer Meldungen kritisch prüft und Quellen vergleicht, kann Fehlinformationen besser erkennen. Medienbildung sollte deshalb fester Bestandteil schulischer und beruflicher Weiterbildung sein.',
    transcriptVi:
      'Lượng thông tin mỗi ngày đặt ra nhiều thách thức mới. Ai kiểm chứng tin tức và so sánh nguồn sẽ nhận diện sai lệch tốt hơn. Vì vậy giáo dục truyền thông nên là phần cố định trong học tập và đào tạo nghề.',
  },
  {
    level: 'B2',
    topic: 'Nachhaltigkeit',
    title: 'Nachhaltiger Konsum im Vergleich',
    transcript:
      'Nachhaltiger Konsum hängt nicht nur von individuellen Entscheidungen ab, sondern auch von den Rahmenbedingungen am Markt. Wenn Produkte transparent gekennzeichnet sind, können Verbraucher fundierter entscheiden. Gleichzeitig müssen Preise sozial verträglich bleiben.',
    transcriptVi:
      'Tiêu dùng bền vững không chỉ phụ thuộc quyết định cá nhân mà còn vào điều kiện thị trường. Khi sản phẩm được ghi nhãn minh bạch, người mua quyết định có cơ sở hơn. Đồng thời giá cả cần phù hợp xã hội.',
  },
  {
    level: 'B2',
    topic: 'Wissenschaft',
    title: 'Wissenschaft verständlich erklären',
    transcript:
      'Forschungsergebnisse werden eher akzeptiert, wenn sie nachvollziehbar kommuniziert werden. Komplexe Daten müssen in klare Aussagen übersetzt werden, ohne die Inhalte zu vereinfachen. So entsteht Vertrauen in wissenschaftliche Prozesse.',
    transcriptVi:
      'Kết quả nghiên cứu dễ được chấp nhận hơn khi được truyền đạt dễ hiểu. Dữ liệu phức tạp cần chuyển thành thông điệp rõ ràng mà không làm sai lệch nội dung. Nhờ đó hình thành niềm tin vào khoa học.',
  },
  {
    level: 'B2',
    topic: 'Mobilität',
    title: 'Verkehrswende vor Ort',
    transcript:
      'Eine erfolgreiche Verkehrswende braucht ein Zusammenspiel aus Infrastruktur, Tarifpolitik und Nutzerverhalten. Wenn öffentliche Verkehrsmittel verlässlich und attraktiv sind, steigt ihre Nutzung deutlich. Parallel dazu müssen sichere Rad- und Fußwege ausgebaut werden.',
    transcriptVi:
      'Chuyển đổi giao thông thành công cần phối hợp hạ tầng, chính sách giá và hành vi người dùng. Khi giao thông công cộng đáng tin và hấp dẫn, mức sử dụng tăng rõ. Song song cần mở rộng đường đi bộ và xe đạp an toàn.',
  },
];

function stableUuid(namespace: string, key: string): string {
  const hash = crypto.createHash('md5').update(`${namespace}:${key}`).digest('hex');
  const version = `4${hash.slice(13, 16)}`;
  const variantHigh = ((parseInt(hash.slice(16, 18), 16) & 0x3f) | 0x80)
    .toString(16)
    .padStart(2, '0');
  const variant = `${variantHigh}${hash.slice(18, 20)}`;
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${version}-${variant}-${hash.slice(20, 32)}`;
}

function extractWords(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-zA-ZäöüÄÖÜß\s]/g, ' ')
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 2);
  return Array.from(new Set(words));
}

function estimateDifficulty(level: CefrLevel): number {
  if (level === 'A1') return 20;
  if (level === 'A2') return 35;
  if (level === 'B1') return 50;
  return 65;
}

function estimateMinutes(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / 130));
}

function splitSegments(transcript: string): Array<{ start: number; end: number; text: string; translation: string }> {
  const sentences = transcript
    .split('.')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
  const segmentDuration = 5;
  return sentences.map((sentence, index) => ({
    start: index * segmentDuration,
    end: (index + 1) * segmentDuration,
    text: `${sentence}.`,
    translation: '',
  }));
}

function buildDistractors(level: CefrLevel, topic: string): string[] {
  const topics = LEVEL_READING_TOPICS[level].filter((entry) => entry !== topic);
  return topics.slice(0, 3);
}

async function seedReadingModule() {
  const readingContentIds = READING_SEEDS.map((entry) =>
    stableUuid('reading-content', `${entry.level}:${entry.title}`)
  );
  const readingPassageIds = READING_SEEDS.map((entry) =>
    stableUuid('reading-passage', `${entry.level}:${entry.title}`)
  );
  const readingExerciseIds = READING_SEEDS.flatMap((entry) => {
    const passageId = stableUuid('reading-passage', `${entry.level}:${entry.title}`);
    return [
      stableUuid('reading-exercise', `${passageId}:mc`),
      stableUuid('reading-exercise', `${passageId}:tf`),
      stableUuid('reading-exercise', `${passageId}:sa`),
    ];
  });

  const [existingReadingContent, existingReadingPassages, existingReadingExercises] =
    await Promise.all([
      prisma.readingContent.findMany({ where: { id: { in: readingContentIds } }, select: { id: true } }),
      prisma.readingPassage.findMany({ where: { id: { in: readingPassageIds } }, select: { id: true } }),
      prisma.readingExercise.findMany({ where: { id: { in: readingExerciseIds } }, select: { id: true } }),
    ]);

  const existingReadingContentSet = new Set(existingReadingContent.map((item) => item.id));
  const existingReadingPassageSet = new Set(existingReadingPassages.map((item) => item.id));
  const existingReadingExerciseSet = new Set(existingReadingExercises.map((item) => item.id));

  let readingContentCreated = 0;
  let readingPassageCreated = 0;
  let readingExerciseCreated = 0;

  for (const entry of READING_SEEDS) {
    const readingContentId = stableUuid('reading-content', `${entry.level}:${entry.title}`);
    const readingPassageId = stableUuid('reading-passage', `${entry.level}:${entry.title}`);

    const vocabularyList = extractWords(entry.content);
    const wordCount = vocabularyList.length > 0 ? entry.content.split(/\s+/).length : 0;
    const estimatedTime = estimateMinutes(wordCount);
    const difficulty = estimateDifficulty(entry.level);

    if (!existingReadingContentSet.has(readingContentId)) readingContentCreated++;
    if (!existingReadingPassageSet.has(readingPassageId)) readingPassageCreated++;

    await prisma.readingContent.upsert({
      where: { id: readingContentId },
      create: {
        id: readingContentId,
        title: entry.title,
        content: entry.content,
        summary: `Kurztext zum Thema ${entry.topic}`,
        level: entry.level,
        topic: entry.topic,
        wordCount,
        uniqueWords: vocabularyList.length,
        difficultyScore: difficulty,
        vocabularyList: vocabularyList.slice(0, 80),
        source: SOURCE_TAG,
        estimatedTime,
        isPublished: true,
        isFeatured: false,
      },
      update: {
        title: entry.title,
        content: entry.content,
        summary: `Kurztext zum Thema ${entry.topic}`,
        level: entry.level,
        topic: entry.topic,
        wordCount,
        uniqueWords: vocabularyList.length,
        difficultyScore: difficulty,
        vocabularyList: vocabularyList.slice(0, 80),
        source: SOURCE_TAG,
        estimatedTime,
        isPublished: true,
      },
    });

    await prisma.readingPassage.upsert({
      where: { id: readingPassageId },
      create: {
        id: readingPassageId,
        title: entry.title,
        content: entry.content,
        cefrLevel: entry.level,
        topic: entry.topic,
        wordCount,
        estimatedReadingTimeMinutes: estimatedTime,
        difficultyScore: difficulty / 20,
        source: SOURCE_TAG,
        isPremium: false,
      },
      update: {
        title: entry.title,
        content: entry.content,
        cefrLevel: entry.level,
        topic: entry.topic,
        wordCount,
        estimatedReadingTimeMinutes: estimatedTime,
        difficultyScore: difficulty / 20,
        source: SOURCE_TAG,
        isPremium: false,
      },
    });

    const distractors = buildDistractors(entry.level, entry.topic);
    const exercises = [
      {
        id: stableUuid('reading-exercise', `${readingPassageId}:mc`),
        exerciseType: 'multiple_choice',
        question: 'Worum geht es im Text hauptsächlich?',
        exerciseData: {
          options: [entry.topic, ...distractors],
          correctIndex: 0,
        },
        explanation: `Der Text behandelt das Thema ${entry.topic}.`,
        difficultyLevel: entry.level === 'A1' ? 1 : entry.level === 'A2' ? 2 : entry.level === 'B1' ? 3 : 4,
        displayOrder: 1,
      },
      {
        id: stableUuid('reading-exercise', `${readingPassageId}:tf`),
        exerciseType: 'true_false',
        question: `Der Text hat das Thema "${entry.topic}".`,
        exerciseData: {
          correctAnswer: true,
        },
        explanation: 'Diese Aussage entspricht dem Hauptthema des Textes.',
        difficultyLevel: entry.level === 'A1' ? 1 : entry.level === 'A2' ? 2 : entry.level === 'B1' ? 3 : 4,
        displayOrder: 2,
      },
      {
        id: stableUuid('reading-exercise', `${readingPassageId}:sa`),
        exerciseType: 'short_answer',
        question: 'Nennen Sie das Hauptthema in einem Wort.',
        exerciseData: {
          acceptedAnswers: [entry.topic, entry.topic.toLowerCase()],
          caseSensitive: false,
        },
        explanation: `Als korrekte Antwort wird "${entry.topic}" erwartet.`,
        difficultyLevel: entry.level === 'A1' ? 1 : entry.level === 'A2' ? 2 : entry.level === 'B1' ? 3 : 4,
        displayOrder: 3,
      },
    ];

    for (const exercise of exercises) {
      if (!existingReadingExerciseSet.has(exercise.id)) readingExerciseCreated++;
      await prisma.readingExercise.upsert({
        where: { id: exercise.id },
        create: {
          id: exercise.id,
          passageId: readingPassageId,
          exerciseType: exercise.exerciseType,
          question: exercise.question,
          exerciseData: exercise.exerciseData,
          explanation: exercise.explanation,
          difficultyLevel: exercise.difficultyLevel,
          displayOrder: exercise.displayOrder,
        },
        update: {
          passageId: readingPassageId,
          exerciseType: exercise.exerciseType,
          question: exercise.question,
          exerciseData: exercise.exerciseData,
          explanation: exercise.explanation,
          difficultyLevel: exercise.difficultyLevel,
          displayOrder: exercise.displayOrder,
        },
      });
    }
  }

  return {
    readingContentCreated,
    readingContentUpdated: READING_SEEDS.length - readingContentCreated,
    readingPassageCreated,
    readingPassageUpdated: READING_SEEDS.length - readingPassageCreated,
    readingExerciseCreated,
    readingExerciseUpdated: READING_SEEDS.length * 3 - readingExerciseCreated,
  };
}

async function seedSpeakingModule() {
  const speakingIds = SPEAKING_SEEDS.map((entry) =>
    stableUuid('speaking-prompt', `${entry.level}:${entry.title}`)
  );
  const existingSpeaking = await prisma.speakingPrompt.findMany({
    where: { id: { in: speakingIds } },
    select: { id: true },
  });
  const existingSpeakingSet = new Set(existingSpeaking.map((item) => item.id));

  let speakingCreated = 0;

  for (const entry of SPEAKING_SEEDS) {
    const id = stableUuid('speaking-prompt', `${entry.level}:${entry.title}`);
    if (!existingSpeakingSet.has(id)) speakingCreated++;

    await prisma.speakingPrompt.upsert({
      where: { id },
      create: {
        id,
        title: entry.title,
        description: `Sprechaufgabe zum Thema ${entry.topic}`,
        level: entry.level,
        topic: entry.topic,
        category: entry.category,
        promptText: entry.promptText,
        promptTextVi: entry.promptTextVi,
        sampleResponse: null,
        sampleAudioUrl: null,
        targetWords: entry.targetWords,
        phonetics: entry.phonetics,
        difficulty: entry.difficulty,
        estimatedTime: 60,
        tags: [SOURCE_TAG, entry.topic.toLowerCase()],
        isPublished: true,
        isFeatured: false,
      },
      update: {
        title: entry.title,
        description: `Sprechaufgabe zum Thema ${entry.topic}`,
        level: entry.level,
        topic: entry.topic,
        category: entry.category,
        promptText: entry.promptText,
        promptTextVi: entry.promptTextVi,
        targetWords: entry.targetWords,
        phonetics: entry.phonetics,
        difficulty: entry.difficulty,
        estimatedTime: 60,
        tags: [SOURCE_TAG, entry.topic.toLowerCase()],
        isPublished: true,
      },
    });
  }

  return {
    speakingCreated,
    speakingUpdated: SPEAKING_SEEDS.length - speakingCreated,
  };
}

async function seedWritingModule() {
  const writingIds = WRITING_SEEDS.map((entry) =>
    stableUuid('writing-prompt', `${entry.level}:${entry.title}`)
  );
  const existingWriting = await prisma.writingPrompt.findMany({
    where: { id: { in: writingIds } },
    select: { id: true },
  });
  const existingWritingSet = new Set(existingWriting.map((item) => item.id));

  let writingCreated = 0;

  for (const entry of WRITING_SEEDS) {
    const id = stableUuid('writing-prompt', `${entry.level}:${entry.title}`);
    if (!existingWritingSet.has(id)) writingCreated++;

    await prisma.writingPrompt.upsert({
      where: { id },
      create: {
        id,
        title: entry.title,
        description: `Schreibaufgabe zum Thema ${entry.topic}`,
        level: entry.level,
        topic: entry.topic,
        category: entry.category,
        promptText: entry.promptText,
        promptTextVi: entry.promptTextVi,
        instructions: entry.instructions,
        instructionsVi: entry.instructionsVi,
        templateText: entry.templateText,
        correctAnswers: null,
        hints: [`Achten Sie auf das Thema ${entry.topic}.`, 'Nutzen Sie klare Satzstruktur.'],
        keywords: entry.keywords,
        wordLimit: entry.wordLimit,
        minWords: entry.minWords,
        sampleResponse: null,
        sampleResponseVi: null,
        grammarPoints: entry.grammarPoints,
        vocabularyFocus: entry.vocabularyFocus,
        difficulty: entry.difficulty,
        estimatedTime: Math.max(180, entry.minWords * 3),
        tags: [SOURCE_TAG, entry.topic.toLowerCase()],
        isPublished: true,
        isFeatured: false,
      },
      update: {
        title: entry.title,
        description: `Schreibaufgabe zum Thema ${entry.topic}`,
        level: entry.level,
        topic: entry.topic,
        category: entry.category,
        promptText: entry.promptText,
        promptTextVi: entry.promptTextVi,
        instructions: entry.instructions,
        instructionsVi: entry.instructionsVi,
        templateText: entry.templateText,
        hints: [`Achten Sie auf das Thema ${entry.topic}.`, 'Nutzen Sie klare Satzstruktur.'],
        keywords: entry.keywords,
        wordLimit: entry.wordLimit,
        minWords: entry.minWords,
        grammarPoints: entry.grammarPoints,
        vocabularyFocus: entry.vocabularyFocus,
        difficulty: entry.difficulty,
        estimatedTime: Math.max(180, entry.minWords * 3),
        tags: [SOURCE_TAG, entry.topic.toLowerCase()],
        isPublished: true,
      },
    });
  }

  return {
    writingCreated,
    writingUpdated: WRITING_SEEDS.length - writingCreated,
  };
}

async function seedListeningModule() {
  const contentIds = LISTENING_SEEDS.map((entry) =>
    stableUuid('listening-content', `${entry.level}:${entry.title}`)
  );
  const exerciseIds = LISTENING_SEEDS.map((entry) =>
    stableUuid('dictation-exercise', `${entry.level}:${entry.title}`)
  );

  const [existingListeningContent, existingListeningExercises] = await Promise.all([
    prisma.listeningContent.findMany({ where: { id: { in: contentIds } }, select: { id: true } }),
    prisma.dictationExercise.findMany({ where: { id: { in: exerciseIds } }, select: { id: true } }),
  ]);

  const existingListeningContentSet = new Set(existingListeningContent.map((item) => item.id));
  const existingListeningExerciseSet = new Set(existingListeningExercises.map((item) => item.id));

  let listeningContentCreated = 0;
  let listeningExerciseCreated = 0;

  for (const entry of LISTENING_SEEDS) {
    const contentId = stableUuid('listening-content', `${entry.level}:${entry.title}`);
    const exerciseId = stableUuid('dictation-exercise', `${entry.level}:${entry.title}`);
    const vocabularyList = extractWords(entry.transcript).slice(0, 80);
    const segments = splitSegments(entry.transcript);
    const duration = segments.length * 5;

    if (!existingListeningContentSet.has(contentId)) listeningContentCreated++;
    if (!existingListeningExerciseSet.has(exerciseId)) listeningExerciseCreated++;

    await prisma.listeningContent.upsert({
      where: { id: contentId },
      create: {
        id: contentId,
        title: entry.title,
        description: `Hörtext zum Thema ${entry.topic}`,
        level: entry.level,
        topic: entry.topic,
        audioUrl: null,
        duration,
        transcript: entry.transcript,
        transcriptVi: entry.transcriptVi,
        segments,
        source: SOURCE_TAG,
        speaker: 'DMF Voice',
        speed: 'normal',
        accent: 'Standard German',
        wordCount: entry.transcript.split(/\s+/).length,
        difficultyScore: estimateDifficulty(entry.level),
        vocabularyList,
        isPublished: true,
        isFeatured: false,
      },
      update: {
        title: entry.title,
        description: `Hörtext zum Thema ${entry.topic}`,
        level: entry.level,
        topic: entry.topic,
        duration,
        transcript: entry.transcript,
        transcriptVi: entry.transcriptVi,
        segments,
        source: SOURCE_TAG,
        speaker: 'DMF Voice',
        speed: 'normal',
        accent: 'Standard German',
        wordCount: entry.transcript.split(/\s+/).length,
        difficultyScore: estimateDifficulty(entry.level),
        vocabularyList,
        isPublished: true,
      },
    });

    await prisma.dictationExercise.upsert({
      where: { id: exerciseId },
      create: {
        id: exerciseId,
        contentId,
        exerciseType: 'full',
        segmentIndex: null,
        audioStart: 0,
        audioEnd: duration,
        correctText: entry.transcript,
        hints: [entry.topic, entry.level],
        difficulty: entry.level === 'A1' ? 1 : entry.level === 'A2' ? 2 : entry.level === 'B1' ? 3 : 4,
      },
      update: {
        contentId,
        exerciseType: 'full',
        segmentIndex: null,
        audioStart: 0,
        audioEnd: duration,
        correctText: entry.transcript,
        hints: [entry.topic, entry.level],
        difficulty: entry.level === 'A1' ? 1 : entry.level === 'A2' ? 2 : entry.level === 'B1' ? 3 : 4,
      },
    });
  }

  return {
    listeningContentCreated,
    listeningContentUpdated: LISTENING_SEEDS.length - listeningContentCreated,
    listeningExerciseCreated,
    listeningExerciseUpdated: LISTENING_SEEDS.length - listeningExerciseCreated,
  };
}

async function main() {
  console.log('Phase 2 Content Seeder');
  console.log(`- source tag: ${SOURCE_TAG}`);
  console.log(`- reading passages: ${READING_SEEDS.length} (A1/A2/B1/B2 = 5 each)`);
  console.log(`- speaking prompts: ${SPEAKING_SEEDS.length} (A1/A2/B1 = 10 each)`);
  console.log(`- writing prompts: ${WRITING_SEEDS.length} (A1/A2/B1/B2 = 5 each)`);
  console.log(`- listening items: ${LISTENING_SEEDS.length} (A1/A2/B1/B2 = 5 each)`);

  const readingResult = await seedReadingModule();
  const speakingResult = await seedSpeakingModule();
  const writingResult = await seedWritingModule();
  const listeningResult = await seedListeningModule();

  console.log('\nSeed summary:');
  console.log(`- ReadingContent created/updated: ${readingResult.readingContentCreated}/${readingResult.readingContentUpdated}`);
  console.log(`- ReadingPassage created/updated: ${readingResult.readingPassageCreated}/${readingResult.readingPassageUpdated}`);
  console.log(`- ReadingExercise created/updated: ${readingResult.readingExerciseCreated}/${readingResult.readingExerciseUpdated}`);
  console.log(`- SpeakingPrompt created/updated: ${speakingResult.speakingCreated}/${speakingResult.speakingUpdated}`);
  console.log(`- WritingPrompt created/updated: ${writingResult.writingCreated}/${writingResult.writingUpdated}`);
  console.log(`- ListeningContent created/updated: ${listeningResult.listeningContentCreated}/${listeningResult.listeningContentUpdated}`);
  console.log(`- DictationExercise created/updated: ${listeningResult.listeningExerciseCreated}/${listeningResult.listeningExerciseUpdated}`);
}

main()
  .catch((error) => {
    console.error('Phase 2 content seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
