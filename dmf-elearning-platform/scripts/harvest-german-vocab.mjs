/**
 * German A1 Vocabulary Harvester
 * Structures vocabulary from CodingFriends basic-vocabulary-word-lists
 */

const vocabulary = {
  // Verbs (24)
  verbs: [
    { word: 'arbeiten', meaning_en: 'to work', gender: 'none', type: 'verb' },
    { word: 'besuchen', meaning_en: 'to visit', gender: 'none', type: 'verb' },
    { word: 'bleiben', meaning_en: 'to stay', gender: 'none', type: 'verb' },
    { word: 'brauchen', meaning_en: 'to need', gender: 'none', type: 'verb' },
    { word: 'essen', meaning_en: 'to eat', gender: 'none', type: 'verb' },
    { word: 'fragen', meaning_en: 'to ask', gender: 'none', type: 'verb' },
    { word: 'geben', meaning_en: 'to give', gender: 'none', type: 'verb' },
    { word: 'gehen', meaning_en: 'to go', gender: 'none', type: 'verb' },
    { word: 'haben', meaning_en: 'to have', gender: 'none', type: 'verb' },
    { word: 'kaufen', meaning_en: 'to buy', gender: 'none', type: 'verb' },
    { word: 'können', meaning_en: '(I/you/we/they) can', gender: 'none', type: 'verb' },
    { word: 'lernen', meaning_en: 'to learn', gender: 'none', type: 'verb' },
    { word: 'machen', meaning_en: 'to make', gender: 'none', type: 'verb' },
    { word: 'nehmen', meaning_en: 'to take', gender: 'none', type: 'verb' },
    { word: 'sagen', meaning_en: 'to say', gender: 'none', type: 'verb' },
    { word: 'schreiben', meaning_en: 'to write', gender: 'none', type: 'verb' },
    { word: 'sehen', meaning_en: 'to see', gender: 'none', type: 'verb' },
    { word: 'sein', meaning_en: 'to be', gender: 'none', type: 'verb' },
    { word: 'suchen', meaning_en: 'to search', gender: 'none', type: 'verb' },
    { word: 'telefonieren', meaning_en: 'to call', gender: 'none', type: 'verb' },
    { word: 'trinken', meaning_en: 'to drink', gender: 'none', type: 'verb' },
    { word: 'wissen', meaning_en: 'to know', gender: 'none', type: 'verb' },
    { word: 'wollen', meaning_en: 'to want', gender: 'none', type: 'verb' },
    { word: 'zahlen', meaning_en: 'to pay', gender: 'none', type: 'verb' },
    { word: 'aufladen', meaning_en: 'to recharge', gender: 'none', type: 'verb' },
  ],

  // Adjectives (16)
  adjectives: [
    { word: 'gut', meaning_en: 'good', gender: 'none', type: 'adjective' },
    { word: 'schlecht', meaning_en: 'bad', gender: 'none', type: 'adjective' },
    { word: 'neu', meaning_en: 'new', gender: 'none', type: 'adjective' },
    { word: 'alt', meaning_en: 'old', gender: 'none', type: 'adjective' },
    { word: 'jung', meaning_en: 'young', gender: 'none', type: 'adjective' },
    { word: 'groß', meaning_en: 'big', gender: 'none', type: 'adjective' },
    { word: 'klein', meaning_en: 'small', gender: 'none', type: 'adjective' },
    { word: 'schön', meaning_en: 'beautiful', gender: 'none', type: 'adjective' },
    { word: 'billig', meaning_en: 'cheap', gender: 'none', type: 'adjective' },
    { word: 'teuer', meaning_en: 'expensive', gender: 'none', type: 'adjective' },
    { word: 'dunkel', meaning_en: 'dark', gender: 'none', type: 'adjective' },
    { word: 'hell', meaning_en: 'bright', gender: 'none', type: 'adjective' },
    { word: 'zusammen', meaning_en: 'together', gender: 'none', type: 'adjective' },
    { word: 'getrennt', meaning_en: 'separate', gender: 'none', type: 'adjective' },
    { word: 'wichtig', meaning_en: 'important', gender: 'none', type: 'adjective' },
    { word: 'müde', meaning_en: 'tired', gender: 'none', type: 'adjective' },
    { word: 'vegetarisch', meaning_en: 'vegetarian', gender: 'none', type: 'adjective' },
    { word: 'vegan', meaning_en: 'vegan', gender: 'none', type: 'adjective' },
    { word: 'glutenfrei', meaning_en: 'gluten-free', gender: 'none', type: 'adjective' },
    { word: 'alkoholfrei', meaning_en: 'non-alcoholic', gender: 'none', type: 'adjective' },
  ],

  // Food (27)
  food: [
    { word: 'das Essen', meaning_en: 'food', gender: 'neuter', type: 'noun' },
    { word: 'das Restaurant', meaning_en: 'restaurant', gender: 'neuter', type: 'noun' },
    { word: 'das Café', meaning_en: 'café', gender: 'neuter', type: 'noun' },
    { word: 'die Bar', meaning_en: 'bar', gender: 'feminine', type: 'noun' },
    { word: 'die Speisekarte', meaning_en: 'menu', gender: 'feminine', type: 'noun' },
    { word: 'die Vorspeise', meaning_en: 'starter', gender: 'feminine', type: 'noun' },
    { word: 'die Hauptspeise', meaning_en: 'main course', gender: 'feminine', type: 'noun' },
    { word: 'der Nachtisch', meaning_en: 'dessert', gender: 'masculine', type: 'noun' },
    { word: 'die Rechnung', meaning_en: 'bill', gender: 'feminine', type: 'noun' },
    { word: 'der Fisch', meaning_en: 'fish', gender: 'masculine', type: 'noun' },
    { word: 'das Fleisch', meaning_en: 'meat', gender: 'neuter', type: 'noun' },
    { word: 'der Salat', meaning_en: 'salad', gender: 'masculine', type: 'noun' },
    { word: 'die Milch', meaning_en: 'milk', gender: 'feminine', type: 'noun' },
    { word: 'der Käse', meaning_en: 'cheese', gender: 'masculine', type: 'noun' },
    { word: 'das Obst', meaning_en: 'fruits', gender: 'neuter', type: 'noun' },
    { word: 'das Gemüse', meaning_en: 'vegetables', gender: 'neuter', type: 'noun' },
    { word: 'die Nüsse', meaning_en: 'nuts', gender: 'feminine', type: 'noun' },
    { word: 'der Kaffee', meaning_en: 'coffee', gender: 'masculine', type: 'noun' },
    { word: 'der Tee', meaning_en: 'tea', gender: 'masculine', type: 'noun' },
    { word: 'das Wasser', meaning_en: 'water', gender: 'neuter', type: 'noun' },
    { word: 'der Wein', meaning_en: 'wine', gender: 'masculine', type: 'noun' },
    { word: 'das Bier', meaning_en: 'beer', gender: 'neuter', type: 'noun' },
  ],

  // Numbers (14)
  numbers: [
    { word: 'eins', meaning_en: 'one', gender: 'none', type: 'number' },
    { word: 'zwei', meaning_en: 'two', gender: 'none', type: 'number' },
    { word: 'drei', meaning_en: 'three', gender: 'none', type: 'number' },
    { word: 'vier', meaning_en: 'four', gender: 'none', type: 'number' },
    { word: 'fünf', meaning_en: 'five', gender: 'none', type: 'number' },
    { word: 'sechs', meaning_en: 'six', gender: 'none', type: 'number' },
    { word: 'sieben', meaning_en: 'seven', gender: 'none', type: 'number' },
    { word: 'acht', meaning_en: 'eight', gender: 'none', type: 'number' },
    { word: 'neun', meaning_en: 'nine', gender: 'none', type: 'number' },
    { word: 'zehn', meaning_en: 'ten', gender: 'none', type: 'number' },
    { word: 'zwanzig', meaning_en: 'twenty', gender: 'none', type: 'number' },
    { word: 'fünfzig', meaning_en: 'fifty', gender: 'none', type: 'number' },
    { word: 'hundert', meaning_en: 'hundred', gender: 'none', type: 'number' },
    { word: 'tausend', meaning_en: 'thousand', gender: 'none', type: 'number' },
  ],

  // Personal Information (11)
  personal: [
    { word: 'der Vorname', meaning_en: 'first name', gender: 'masculine', type: 'noun' },
    { word: 'der Nachname', meaning_en: 'last name', gender: 'masculine', type: 'noun' },
    { word: 'die Adresse', meaning_en: 'address', gender: 'feminine', type: 'noun' },
    { word: 'das Land', meaning_en: 'country', gender: 'neuter', type: 'noun' },
    { word: 'der Geburtsort', meaning_en: 'place of birth', gender: 'masculine', type: 'noun' },
    { word: 'das Geburtsdatum', meaning_en: 'date of birth', gender: 'neuter', type: 'noun' },
    { word: 'der Beruf', meaning_en: 'profession, job', gender: 'masculine', type: 'noun' },
    { word: 'der Mann', meaning_en: 'man', gender: 'masculine', type: 'noun' },
    { word: 'die Frau', meaning_en: 'woman', gender: 'feminine', type: 'noun' },
    { word: 'der Erwachsene', meaning_en: 'adult', gender: 'masculine', type: 'noun' },
    { word: 'das Kind', meaning_en: 'child', gender: 'neuter', type: 'noun' },
  ],

  // Time (20)
  time: [
    { word: 'die Zeit', meaning_en: 'time', gender: 'feminine', type: 'noun' },
    { word: 'der Tag', meaning_en: 'day', gender: 'masculine', type: 'noun' },
    { word: 'die Woche', meaning_en: 'week', gender: 'feminine', type: 'noun' },
    { word: 'der Monat', meaning_en: 'month', gender: 'masculine', type: 'noun' },
    { word: 'das Jahr', meaning_en: 'year', gender: 'neuter', type: 'noun' },
    { word: 'Montag', meaning_en: 'Monday', gender: 'none', type: 'noun' },
    { word: 'Dienstag', meaning_en: 'Tuesday', gender: 'none', type: 'noun' },
    { word: 'Mittwoch', meaning_en: 'Wednesday', gender: 'none', type: 'noun' },
    { word: 'Donnerstag', meaning_en: 'Thursday', gender: 'none', type: 'noun' },
    { word: 'Freitag', meaning_en: 'Friday', gender: 'none', type: 'noun' },
    { word: 'Samstag', meaning_en: 'Saturday', gender: 'none', type: 'noun' },
    { word: 'Sonntag', meaning_en: 'Sunday', gender: 'none', type: 'noun' },
    { word: 'morgens', meaning_en: 'in the morning', gender: 'none', type: 'adverb' },
    { word: 'nachmittags', meaning_en: 'in the afternoon', gender: 'none', type: 'adverb' },
    { word: 'abends', meaning_en: 'in the evening', gender: 'none', type: 'adverb' },
    { word: 'nachts', meaning_en: 'at night', gender: 'none', type: 'adverb' },
    { word: 'früher', meaning_en: 'earlier', gender: 'none', type: 'adverb' },
    { word: 'später', meaning_en: 'later', gender: 'none', type: 'adverb' },
    { word: 'pünktlich', meaning_en: 'on time', gender: 'none', type: 'adverb' },
    { word: 'verspätet', meaning_en: 'delayed', gender: 'none', type: 'adverb' },
  ],

  // Transport (10)
  transport: [
    { word: 'der Zug', meaning_en: 'train', gender: 'masculine', type: 'noun' },
    { word: 'der Bus', meaning_en: 'bus', gender: 'masculine', type: 'noun' },
    { word: 'das Auto', meaning_en: 'car', gender: 'neuter', type: 'noun' },
    { word: 'die Straßenbahn', meaning_en: 'tram', gender: 'feminine', type: 'noun' },
    { word: 'das Taxi', meaning_en: 'taxi, cab', gender: 'neuter', type: 'noun' },
    { word: 'das Fahrrad', meaning_en: 'bicycle', gender: 'neuter', type: 'noun' },
    { word: 'zu Fuß', meaning_en: 'on foot', gender: 'none', type: 'phrase' },
    { word: 'der Bahnhof', meaning_en: 'train station', gender: 'masculine', type: 'noun' },
    { word: 'der Busbahnhof', meaning_en: 'bus station', gender: 'masculine', type: 'noun' },
    { word: 'die Haltestelle', meaning_en: 'stop', gender: 'feminine', type: 'noun' },
  ],

  // Health (13)
  health: [
    { word: 'der Arzt', meaning_en: 'doctor (male)', gender: 'masculine', type: 'noun' },
    { word: 'die Ärztin', meaning_en: 'doctor (female)', gender: 'feminine', type: 'noun' },
    { word: 'das Krankenhaus', meaning_en: 'hospital', gender: 'neuter', type: 'noun' },
    { word: 'die Apotheke', meaning_en: 'pharmacy', gender: 'feminine', type: 'noun' },
    { word: 'die Schmerzmittel', meaning_en: 'painkiller', gender: 'feminine', type: 'noun' },
    { word: 'das Medikament', meaning_en: 'medicine', gender: 'neuter', type: 'noun' },
    { word: 'die Schmerzen', meaning_en: 'pain', gender: 'feminine', type: 'noun' },
    { word: 'der Rücken', meaning_en: 'back', gender: 'masculine', type: 'noun' },
    { word: 'der Fuß', meaning_en: 'foot', gender: 'masculine', type: 'noun' },
    { word: 'der Bauch', meaning_en: 'stomach', gender: 'masculine', type: 'noun' },
    { word: 'das Bein', meaning_en: 'leg', gender: 'neuter', type: 'noun' },
    { word: 'der Kopf', meaning_en: 'head', gender: 'masculine', type: 'noun' },
    { word: 'die Hand', meaning_en: 'hand', gender: 'feminine', type: 'noun' },
    { word: 'der Arm', meaning_en: 'arm', gender: 'masculine', type: 'noun' },
  ],

  // Colors (8)
  colors: [
    { word: 'die Farbe', meaning_en: 'color', gender: 'feminine', type: 'noun' },
    { word: 'weiß', meaning_en: 'white', gender: 'none', type: 'adjective' },
    { word: 'schwarz', meaning_en: 'black', gender: 'none', type: 'adjective' },
    { word: 'rot', meaning_en: 'red', gender: 'none', type: 'adjective' },
    { word: 'blau', meaning_en: 'blue', gender: 'none', type: 'adjective' },
    { word: 'grün', meaning_en: 'green', gender: 'none', type: 'adjective' },
    { word: 'gelb', meaning_en: 'yellow', gender: 'none', type: 'adjective' },
    { word: 'bunt', meaning_en: 'colorful', gender: 'none', type: 'adjective' },
  ],

  // Surrounding (16)
  surrounding: [
    { word: 'das Haus', meaning_en: 'house', gender: 'neuter', type: 'noun' },
    { word: 'die Wohnung', meaning_en: 'apartment', gender: 'feminine', type: 'noun' },
    { word: 'das Hotel', meaning_en: 'hotel', gender: 'neuter', type: 'noun' },
    { word: 'das Museum', meaning_en: 'museum', gender: 'neuter', type: 'noun' },
    { word: 'der Strand', meaning_en: 'beach', gender: 'masculine', type: 'noun' },
    { word: 'der Wald', meaning_en: 'forest', gender: 'masculine', type: 'noun' },
    { word: 'der Berg', meaning_en: 'mountain', gender: 'masculine', type: 'noun' },
    { word: 'der Park', meaning_en: 'park', gender: 'masculine', type: 'noun' },
    { word: 'der Fluss', meaning_en: 'river', gender: 'masculine', type: 'noun' },
    { word: 'das Meer', meaning_en: 'sea', gender: 'neuter', type: 'noun' },
    { word: 'der See', meaning_en: 'lake', gender: 'masculine', type: 'noun' },
    { word: 'das Wetter', meaning_en: 'weather', gender: 'neuter', type: 'noun' },
    { word: 'die Sonne', meaning_en: 'sun', gender: 'feminine', type: 'noun' },
    { word: 'der Regen', meaning_en: 'rain', gender: 'masculine', type: 'noun' },
    { word: 'der Schnee', meaning_en: 'snow', gender: 'masculine', type: 'noun' },
    { word: 'das Gewitter', meaning_en: 'thunderstorm', gender: 'neuter', type: 'noun' },
  ],

  // Technology (5)
  technology: [
    { word: 'das Internet', meaning_en: 'internet', gender: 'neuter', type: 'noun' },
    { word: 'das Passwort', meaning_en: 'password', gender: 'neuter', type: 'noun' },
    { word: 'der Computer', meaning_en: 'computer', gender: 'masculine', type: 'noun' },
    { word: 'die Steckdose', meaning_en: 'socket', gender: 'feminine', type: 'noun' },
  ],

  // Shopping (10)
  shopping: [
    { word: 'der Supermarkt', meaning_en: 'supermarket', gender: 'masculine', type: 'noun' },
    { word: 'das Geld', meaning_en: 'cash', gender: 'neuter', type: 'noun' },
    { word: 'die Karte', meaning_en: 'bank card', gender: 'feminine', type: 'noun' },
    { word: 'die Tasche', meaning_en: 'bag', gender: 'feminine', type: 'noun' },
    { word: 'der Tampon', meaning_en: 'tampon', gender: 'masculine', type: 'noun' },
    { word: 'die Binde', meaning_en: '(sanitary) pad', gender: 'feminine', type: 'noun' },
    { word: 'das Kondom', meaning_en: 'condom', gender: 'neuter', type: 'noun' },
    { word: 'die Zahnbürste', meaning_en: 'toothbrush', gender: 'feminine', type: 'noun' },
    { word: 'die Hilfe', meaning_en: 'help', gender: 'feminine', type: 'noun' },
    { word: 'die Polizei', meaning_en: 'police', gender: 'feminine', type: 'noun' },
  ],

  // Orientation (10)
  orientation: [
    { word: 'die Richtung', meaning_en: 'direction', gender: 'feminine', type: 'noun' },
    { word: 'der Eingang', meaning_en: 'entrance', gender: 'masculine', type: 'noun' },
    { word: 'der Ausgang', meaning_en: 'exit', gender: 'masculine', type: 'noun' },
    { word: 'die Straße', meaning_en: 'street', gender: 'feminine', type: 'noun' },
    { word: 'der Weg', meaning_en: 'way', gender: 'masculine', type: 'noun' },
    { word: 'der Platz', meaning_en: 'square', gender: 'masculine', type: 'noun' },
    { word: 'rechts', meaning_en: 'right', gender: 'none', type: 'adverb' },
    { word: 'links', meaning_en: 'left', gender: 'none', type: 'adverb' },
    { word: 'geradeaus', meaning_en: 'straight ahead', gender: 'none', type: 'adverb' },
    { word: 'zurück', meaning_en: 'back', gender: 'none', type: 'adverb' },
  ],

  // Communication (10)
  communication: [
    { word: 'Hallo!', meaning_en: 'Hi!', gender: 'none', type: 'phrase' },
    { word: 'Guten Tag!', meaning_en: 'Hello!', gender: 'none', type: 'phrase' },
    { word: 'Tschüß!', meaning_en: 'Goodbye! / Bye!', gender: 'none', type: 'phrase' },
    { word: 'Danke!', meaning_en: 'Thank you!', gender: 'none', type: 'phrase' },
    { word: 'Bitte!', meaning_en: 'Please!', gender: 'none', type: 'phrase' },
    { word: 'Entschuldigung!', meaning_en: 'Sorry!', gender: 'none', type: 'phrase' },
    { word: 'Stopp!', meaning_en: 'Stop!', gender: 'none', type: 'phrase' },
    { word: 'Vorsicht!', meaning_en: 'Caution!', gender: 'none', type: 'phrase' },
    { word: 'ja', meaning_en: 'yes', gender: 'none', type: 'adverb' },
    { word: 'nein', meaning_en: 'no', gender: 'none', type: 'adverb' },
    { word: 'Prost!', meaning_en: 'Cheers!', gender: 'none', type: 'phrase' },
  ],

  // Sentences (9)
  sentences: [
    { word: 'Was ist…?', meaning_en: 'What is …?', gender: 'none', type: 'phrase' },
    { word: 'Wo ist …?', meaning_en: 'Where is …?', gender: 'none', type: 'phrase' },
    { word: 'Wie …?', meaning_en: 'How …?', gender: 'none', type: 'phrase' },
    { word: 'Wie viel kostet es?', meaning_en: 'How much is it?', gender: 'none', type: 'phrase' },
    { word: 'Wie lange dauert es?', meaning_en: 'How long does it take?', gender: 'none', type: 'phrase' },
    { word: 'Gibt es …?', meaning_en: 'Is there …?', gender: 'none', type: 'phrase' },
    { word: 'Ich hätte gerne …', meaning_en: 'I would like ...', gender: 'none', type: 'phrase' },
    { word: 'Ich brauche …', meaning_en: 'I need ...', gender: 'none', type: 'phrase' },
    { word: 'Kein Problem!', meaning_en: 'No problem!', gender: 'none', type: 'phrase' },
  ],
};

// Flatten all categories into single array
const allWords = [];
for (const [category, words] of Object.entries(vocabulary)) {
  allWords.push(...words.map(w => ({ ...w, category })));
}

// Output structured data
const output = {
  source: 'CodingFriends/basic-vocabulary-word-lists',
  license: 'CC BY-NC 4.0',
  language: 'German',
  level: 'A1',
  harvestedAt: new Date().toISOString(),
  totalWords: allWords.length,
  categoryCounts: Object.entries(vocabulary).reduce((acc, [cat, words]) => {
    acc[cat] = words.length;
    return acc;
  }, {}),
  vocabulary: allWords,
};

console.log(JSON.stringify(output, null, 2));
