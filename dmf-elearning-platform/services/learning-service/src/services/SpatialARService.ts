/**
 * Spatial AR Service — Phase 6, Sprint 6.2
 * Camera-based vocabulary labeling + AR flashcards
 * Designed for ARKit (iOS), ARCore (Android), WebXR
 */

// ─── Types ───

export interface ARScene {
    id: string;
    name: string;
    nameVi: string;
    description: string;
    environment: AREnvironment;
    objects: ARLabeledObject[];
    difficulty: string;  // CEFR level
}

type AREnvironment = 'kitchen' | 'living_room' | 'office' | 'restaurant' | 'supermarket' | 'street' | 'classroom' | 'hospital' | 'airport' | 'custom';

export interface ARLabeledObject {
    id: string;
    germanWord: string;
    article: 'der' | 'die' | 'das';
    plural: string;
    translation: string;
    ipa: string;
    category: string;
    position3D: { x: number; y: number; z: number };
    boundingBox: { width: number; height: number; depth: number };
    difficulty: string;
    exampleSentence: string;
    exampleSentenceVi: string;
}

export interface ObjectDetectionResult {
    detectedLabel: string;     // What camera sees (English)
    confidence: number;
    boundingBox: { x: number; y: number; width: number; height: number };
    germanMatch?: ARLabeledObject;
}

export interface ARFlashcard {
    id: string;
    object: ARLabeledObject;
    mode: 'learn' | 'quiz' | 'review';
    showArticle: boolean;
    showTranslation: boolean;
    audioUrl: string;
}

// ─── Scene Library ───

const SCENES: ARScene[] = [
    {
        id: 'kitchen', name: 'Die Küche', nameVi: 'Nhà bếp',
        description: 'Learn kitchen vocabulary by scanning objects',
        environment: 'kitchen', difficulty: 'A1',
        objects: [
            { id: 'k1', germanWord: 'Tisch', article: 'der', plural: 'Tische', translation: 'bàn', ipa: '/tɪʃ/', category: 'Möbel', position3D: { x: 0, y: 0, z: 0 }, boundingBox: { width: 1.2, height: 0.75, depth: 0.8 }, difficulty: 'A1', exampleSentence: 'Der Tisch steht in der Küche.', exampleSentenceVi: 'Cái bàn ở trong bếp.' },
            { id: 'k2', germanWord: 'Stuhl', article: 'der', plural: 'Stühle', translation: 'ghế', ipa: '/ʃtuːl/', category: 'Möbel', position3D: { x: 0.5, y: 0, z: 0.3 }, boundingBox: { width: 0.5, height: 0.9, depth: 0.5 }, difficulty: 'A1', exampleSentence: 'Setz dich bitte auf den Stuhl.', exampleSentenceVi: 'Xin hãy ngồi lên ghế.' },
            { id: 'k3', germanWord: 'Tasse', article: 'die', plural: 'Tassen', translation: 'tách', ipa: '/ˈtasə/', category: 'Geschirr', position3D: { x: 0.2, y: 0.75, z: 0 }, boundingBox: { width: 0.1, height: 0.1, depth: 0.1 }, difficulty: 'A1', exampleSentence: 'Möchtest du eine Tasse Kaffee?', exampleSentenceVi: 'Bạn muốn một tách cà phê không?' },
            { id: 'k4', germanWord: 'Messer', article: 'das', plural: 'Messer', translation: 'dao', ipa: '/ˈmɛsɐ/', category: 'Besteck', position3D: { x: 0.3, y: 0.76, z: 0.1 }, boundingBox: { width: 0.22, height: 0.02, depth: 0.03 }, difficulty: 'A1', exampleSentence: 'Das Messer ist scharf.', exampleSentenceVi: 'Con dao sắc.' },
            { id: 'k5', germanWord: 'Kühlschrank', article: 'der', plural: 'Kühlschränke', translation: 'tủ lạnh', ipa: '/ˈkyːlʃʁaŋk/', category: 'Geräte', position3D: { x: -1, y: 0, z: -0.5 }, boundingBox: { width: 0.7, height: 1.8, depth: 0.7 }, difficulty: 'A2', exampleSentence: 'Die Milch ist im Kühlschrank.', exampleSentenceVi: 'Sữa ở trong tủ lạnh.' },
            { id: 'k6', germanWord: 'Herd', article: 'der', plural: 'Herde', translation: 'bếp nấu', ipa: '/heːɐ̯t/', category: 'Geräte', position3D: { x: -0.5, y: 0, z: -1 }, boundingBox: { width: 0.6, height: 0.9, depth: 0.6 }, difficulty: 'A2', exampleSentence: 'Das Wasser kocht auf dem Herd.', exampleSentenceVi: 'Nước đang sôi trên bếp.' },
        ],
    },
    {
        id: 'office', name: 'Das Büro', nameVi: 'Văn phòng',
        description: 'Learn office vocabulary',
        environment: 'office', difficulty: 'A2',
        objects: [
            { id: 'o1', germanWord: 'Computer', article: 'der', plural: 'Computer', translation: 'máy tính', ipa: '/kɔmˈpjuːtɐ/', category: 'Technik', position3D: { x: 0, y: 0.75, z: 0 }, boundingBox: { width: 0.4, height: 0.3, depth: 0.3 }, difficulty: 'A1', exampleSentence: 'Ich arbeite am Computer.', exampleSentenceVi: 'Tôi làm việc trên máy tính.' },
            { id: 'o2', germanWord: 'Drucker', article: 'der', plural: 'Drucker', translation: 'máy in', ipa: '/ˈdʁʊkɐ/', category: 'Technik', position3D: { x: 1, y: 0.5, z: 0 }, boundingBox: { width: 0.4, height: 0.3, depth: 0.3 }, difficulty: 'A2', exampleSentence: 'Der Drucker druckt nicht mehr.', exampleSentenceVi: 'Máy in không in nữa.' },
            { id: 'o3', germanWord: 'Schreibtisch', article: 'der', plural: 'Schreibtische', translation: 'bàn làm việc', ipa: '/ˈʃʁaɪ̯ptɪʃ/', category: 'Möbel', position3D: { x: 0, y: 0, z: 0 }, boundingBox: { width: 1.4, height: 0.75, depth: 0.7 }, difficulty: 'A2', exampleSentence: 'Mein Schreibtisch ist aufgeräumt.', exampleSentenceVi: 'Bàn làm việc của tôi gọn gàng.' },
            { id: 'o4', germanWord: 'Kugelschreiber', article: 'der', plural: 'Kugelschreiber', translation: 'bút bi', ipa: '/ˈkuːɡl̩ʃʁaɪ̯bɐ/', category: 'Schreibwaren', position3D: { x: 0.1, y: 0.76, z: 0.1 }, boundingBox: { width: 0.15, height: 0.01, depth: 0.01 }, difficulty: 'A2', exampleSentence: 'Hast du einen Kugelschreiber?', exampleSentenceVi: 'Bạn có bút bi không?' },
        ],
    },
    {
        id: 'supermarket', name: 'Der Supermarkt', nameVi: 'Siêu thị',
        description: 'Learn food and shopping vocabulary',
        environment: 'supermarket', difficulty: 'A1',
        objects: [
            { id: 's1', germanWord: 'Apfel', article: 'der', plural: 'Äpfel', translation: 'táo', ipa: '/ˈapfl̩/', category: 'Obst', position3D: { x: 0, y: 1, z: 0 }, boundingBox: { width: 0.08, height: 0.08, depth: 0.08 }, difficulty: 'A1', exampleSentence: 'Ein Apfel am Tag hält den Arzt fern.', exampleSentenceVi: 'Một quả táo mỗi ngày giúp xa bác sĩ.' },
            { id: 's2', germanWord: 'Brot', article: 'das', plural: 'Brote', translation: 'bánh mì', ipa: '/bʁoːt/', category: 'Backwaren', position3D: { x: 0.5, y: 1, z: 0 }, boundingBox: { width: 0.25, height: 0.15, depth: 0.12 }, difficulty: 'A1', exampleSentence: 'Ich kaufe ein Brot.', exampleSentenceVi: 'Tôi mua một ổ bánh mì.' },
            { id: 's3', germanWord: 'Milch', article: 'die', plural: '-', translation: 'sữa', ipa: '/mɪlç/', category: 'Getränke', position3D: { x: -0.5, y: 1, z: 0 }, boundingBox: { width: 0.08, height: 0.25, depth: 0.08 }, difficulty: 'A1', exampleSentence: 'Die Milch ist frisch.', exampleSentenceVi: 'Sữa tươi.' },
            { id: 's4', germanWord: 'Einkaufswagen', article: 'der', plural: 'Einkaufswagen', translation: 'xe đẩy', ipa: '/ˈaɪ̯nkaʊ̯fsvaːɡn̩/', category: 'Supermarkt', position3D: { x: 0, y: 0, z: 1 }, boundingBox: { width: 0.6, height: 1, depth: 0.8 }, difficulty: 'A2', exampleSentence: 'Der Einkaufswagen ist voll.', exampleSentenceVi: 'Xe đẩy đầy rồi.' },
        ],
    },
    {
        id: 'restaurant', name: 'Das Restaurant', nameVi: 'Nhà hàng',
        description: 'Learn restaurant and dining vocabulary',
        environment: 'restaurant', difficulty: 'A2',
        objects: [
            { id: 'r1', germanWord: 'Speisekarte', article: 'die', plural: 'Speisekarten', translation: 'thực đơn', ipa: '/ˈʃpaɪ̯zəkaʁtə/', category: 'Restaurant', position3D: { x: 0, y: 0.76, z: 0 }, boundingBox: { width: 0.25, height: 0.35, depth: 0.01 }, difficulty: 'A2', exampleSentence: 'Kann ich bitte die Speisekarte haben?', exampleSentenceVi: 'Cho tôi xin thực đơn được không?' },
            { id: 'r2', germanWord: 'Rechnung', article: 'die', plural: 'Rechnungen', translation: 'hóa đơn', ipa: '/ˈʁɛçnʊŋ/', category: 'Restaurant', position3D: { x: 0.3, y: 0.76, z: 0.1 }, boundingBox: { width: 0.15, height: 0.2, depth: 0.01 }, difficulty: 'A2', exampleSentence: 'Die Rechnung, bitte!', exampleSentenceVi: 'Tính tiền nha!' },
            { id: 'r3', germanWord: 'Kellner', article: 'der', plural: 'Kellner', translation: 'phục vụ', ipa: '/ˈkɛlnɐ/', category: 'Personen', position3D: { x: 1, y: 0, z: 0.5 }, boundingBox: { width: 0.5, height: 1.8, depth: 0.3 }, difficulty: 'A2', exampleSentence: 'Der Kellner bringt das Essen.', exampleSentenceVi: 'Nhân viên phục vụ mang đồ ăn.' },
        ],
    },
];

// ─── Core Functions ───

/**
 * Get available AR scenes
 */
export function getARScenes(level?: string): ARScene[] {
    if (!level) return SCENES;
    return SCENES.filter(s => s.difficulty === level.toUpperCase());
}

/**
 * Get scene by ID
 */
export function getARScene(sceneId: string): ARScene | undefined {
    return SCENES.find(s => s.id === sceneId);
}

/**
 * Match detected object to German vocabulary
 */
export function matchDetectedObject(
    detectedLabel: string,
    sceneId?: string
): ARLabeledObject | null {
    const label = detectedLabel.toLowerCase();
    const objectPool = sceneId
        ? SCENES.find(s => s.id === sceneId)?.objects || []
        : SCENES.flatMap(s => s.objects);

    // Direct translation match
    for (const obj of objectPool) {
        if (obj.translation.toLowerCase() === label || obj.germanWord.toLowerCase() === label) {
            return obj;
        }
    }

    // English label mapping
    const enToDeMap: Record<string, string> = {
        table: 'Tisch', chair: 'Stuhl', cup: 'Tasse', knife: 'Messer',
        fridge: 'Kühlschrank', refrigerator: 'Kühlschrank', stove: 'Herd',
        computer: 'Computer', printer: 'Drucker', desk: 'Schreibtisch', pen: 'Kugelschreiber',
        apple: 'Apfel', bread: 'Brot', milk: 'Milch', cart: 'Einkaufswagen',
        menu: 'Speisekarte', bill: 'Rechnung', waiter: 'Kellner',
    };

    const germanWord = enToDeMap[label];
    if (germanWord) {
        return objectPool.find(o => o.germanWord === germanWord) || null;
    }

    return null;
}

/**
 * Generate AR flashcard for an object
 */
export function createARFlashcard(
    objectId: string,
    mode: 'learn' | 'quiz' | 'review' = 'learn'
): ARFlashcard | null {
    const obj = SCENES.flatMap(s => s.objects).find(o => o.id === objectId);
    if (!obj) return null;

    return {
        id: `arfc_${Date.now()}_${objectId}`,
        object: obj,
        mode,
        showArticle: mode !== 'quiz',
        showTranslation: mode === 'learn',
        audioUrl: `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(obj.article + ' ' + obj.germanWord)}&tl=de&client=tw-ob`,
    };
}

/**
 * Get all objects for vocabulary building
 */
export function getAllARVocabulary(): Array<{
    germanWord: string; article: string; plural: string;
    translation: string; ipa: string; category: string;
    scene: string; difficulty: string;
}> {
    return SCENES.flatMap(s =>
        s.objects.map(o => ({
            germanWord: o.germanWord, article: o.article, plural: o.plural,
            translation: o.translation, ipa: o.ipa, category: o.category,
            scene: s.name, difficulty: o.difficulty,
        }))
    );
}
