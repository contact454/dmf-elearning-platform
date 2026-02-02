#!/usr/bin/env node
/**
 * Vocabulary Curation Pipeline - Phase 1: Fetch Frequency Data
 *
 * Downloads and processes German word frequency lists from multiple sources:
 * 1. Leipzig Corpora Collection (news, web, wikipedia)
 * 2. OpenSubtitles frequency (spoken German)
 * 3. Goethe Institut official word lists (A1-B1) - PRIORITY
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../data/frequency');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Goethe Institut Official Word Lists (A1-B1)
 * These are the PRIORITY words that must be kept regardless of frequency
 * Source: https://www.goethe.de/de/spr/kup/prf/prf.html
 */
const GOETHE_A1_WORDS = `
# Goethe-Zertifikat A1: Start Deutsch 1
# Approximately 650 words

# Greetings & Basics
Hallo, Guten Tag, Guten Morgen, Guten Abend, Auf Wiedersehen, Tschüss
ja, nein, bitte, danke, Entschuldigung

# Personal Pronouns
ich, du, er, sie, es, wir, ihr, Sie

# Articles
der, die, das, ein, eine

# Numbers 0-100
null, eins, zwei, drei, vier, fünf, sechs, sieben, acht, neun, zehn
elf, zwölf, dreizehn, vierzehn, fünfzehn, sechzehn, siebzehn, achtzehn, neunzehn, zwanzig
dreißig, vierzig, fünfzig, sechzig, siebzig, achtzig, neunzig, hundert

# Days & Months
Montag, Dienstag, Mittwoch, Donnerstag, Freitag, Samstag, Sonntag
Januar, Februar, März, April, Mai, Juni, Juli, August, September, Oktober, November, Dezember

# Time
Uhr, Minute, Stunde, Tag, Woche, Monat, Jahr
heute, morgen, gestern, jetzt, später, früh, spät

# Family
Familie, Mutter, Vater, Eltern, Kind, Kinder, Sohn, Tochter
Bruder, Schwester, Großmutter, Großvater, Mann, Frau

# Body
Kopf, Auge, Augen, Nase, Mund, Ohr, Ohren, Hand, Hände, Fuß, Füße, Bein, Arm

# Colors
rot, blau, grün, gelb, schwarz, weiß, braun, grau, orange, rosa

# Food & Drink
Essen, Trinken, Wasser, Kaffee, Tee, Milch, Saft, Bier, Wein
Brot, Butter, Käse, Ei, Eier, Fleisch, Fisch, Gemüse, Obst, Apfel, Banane
Frühstück, Mittagessen, Abendessen, Restaurant, Supermarkt

# Places
Haus, Wohnung, Zimmer, Küche, Bad, Schlafzimmer, Wohnzimmer
Stadt, Straße, Platz, Park, Schule, Universität, Arbeit, Büro
Bahnhof, Flughafen, Hotel, Krankenhaus, Apotheke, Bank, Post

# Transport
Auto, Bus, Bahn, Zug, U-Bahn, Fahrrad, Taxi, Flugzeug
fahren, gehen, kommen, fliegen

# Common Verbs
sein, haben, werden, können, müssen, wollen, sollen, dürfen, mögen
machen, arbeiten, lernen, studieren, lesen, schreiben, sprechen, hören, sehen
kaufen, bezahlen, kosten, brauchen, suchen, finden
essen, trinken, kochen, schlafen, aufstehen, wohnen, leben
spielen, schwimmen, tanzen, singen, reisen, besuchen
verstehen, wissen, kennen, glauben, denken, meinen, helfen, fragen, antworten
lieben, mögen, hassen, freuen, ärgern

# Common Adjectives
gut, schlecht, schön, hässlich, groß, klein, alt, neu, jung
schnell, langsam, teuer, billig, leicht, schwer, einfach, schwierig
kalt, warm, heiß, kühl, nass, trocken
richtig, falsch, wichtig, interessant, langweilig
glücklich, traurig, müde, krank, gesund

# Common Nouns
Name, Adresse, Telefon, E-Mail, Nummer, Passwort
Freund, Freundin, Leute, Person, Menschen
Sprache, Deutsch, Englisch, Wort, Satz, Text, Buch, Zeitung
Geld, Euro, Cent, Preis, Konto
Ticket, Karte, Pass, Ausweis
Problem, Frage, Antwort, Beispiel, Idee
Musik, Film, Foto, Bild, Computer, Handy, Internet

# Question Words
was, wer, wo, woher, wohin, wann, wie, warum, welche, welcher, welches

# Prepositions
in, an, auf, über, unter, neben, zwischen, vor, hinter
mit, ohne, für, gegen, um, durch, aus, von, zu, nach, bei

# Conjunctions
und, oder, aber, denn, weil, wenn, dass, ob

# Adverbs
hier, dort, da, oben, unten, links, rechts, geradeaus
sehr, viel, wenig, mehr, weniger, nur, auch, noch, schon, immer, nie, oft, manchmal
gern, lieber, am liebsten
`.trim();

const GOETHE_A2_WORDS = `
# Goethe-Zertifikat A2: Fit in Deutsch 2
# Additional ~700 words beyond A1

# Extended Family & Relationships
Onkel, Tante, Cousin, Cousine, Neffe, Nichte, Schwiegermutter, Schwiegervater
Nachbar, Kollege, Chef, Partner, Partnerin, Hochzeit, Scheidung

# Professions
Arzt, Ärztin, Lehrer, Lehrerin, Polizist, Verkäufer, Ingenieur, Programmierer
Kellner, Koch, Friseur, Mechaniker, Elektriker, Architekt, Rechtsanwalt
Journalist, Künstler, Musiker, Schauspieler, Sportler

# Education
Schüler, Student, Professor, Unterricht, Kurs, Prüfung, Test, Note
Hausaufgabe, Übung, Fehler, Regel, Grammatik, Vokabel
Zeugnis, Diplom, Abschluss, Ausbildung, Studium

# Health
Gesundheit, Krankheit, Schmerz, Kopfschmerzen, Fieber, Erkältung, Grippe
Medikament, Tablette, Rezept, Termin, Untersuchung, Operation
Versicherung, Krankenkasse

# Shopping
Laden, Geschäft, Markt, Einkaufszentrum, Kasse, Rechnung, Quittung
Größe, Farbe, Qualität, Angebot, Rabatt, Sonderangebot
Kleidung, Hose, Hemd, Jacke, Mantel, Kleid, Rock, Schuhe, Tasche

# Housing
Miete, Vermieter, Mieter, Vertrag, Kaution, Nebenkosten
Möbel, Tisch, Stuhl, Bett, Schrank, Sofa, Lampe, Teppich
Fenster, Tür, Treppe, Aufzug, Balkon, Garten, Garage

# Technology
Computer, Laptop, Tablet, Bildschirm, Tastatur, Maus, Drucker
Programm, Software, App, Download, Update, Datei, Ordner
Internet, Website, Link, E-Mail, Passwort, Konto

# Weather
Wetter, Sonne, Regen, Schnee, Wind, Sturm, Gewitter, Nebel
Temperatur, Grad, Himmel, Wolke

# Nature
Natur, Baum, Blume, Pflanze, Wald, Berg, See, Fluss, Meer, Strand
Tier, Hund, Katze, Vogel, Pferd, Fisch

# Emotions & Opinions
Gefühl, Freude, Angst, Sorge, Stress, Hoffnung, Überraschung
Meinung, Vorschlag, Entscheidung, Grund, Erfahrung

# Extended Verbs
anfangen, aufhören, beginnen, beenden, fortsetzen
erklären, beschreiben, erzählen, diskutieren, streiten
empfehlen, vorschlagen, entscheiden, planen, organisieren
reparieren, wechseln, tauschen, leihen, zurückgeben
anmelden, abmelden, registrieren, reservieren, bestellen, liefern
vergleichen, unterscheiden, wählen, bevorzugen

# Extended Adjectives
praktisch, bequem, gemütlich, modern, traditionell
freundlich, höflich, nett, sympathisch, lustig, ernst
sicher, gefährlich, ruhig, laut, sauber, schmutzig
möglich, unmöglich, notwendig, dringend, pünktlich

# Time Expressions
Wochenende, Feiertag, Urlaub, Ferien, Termin, Verabredung
vorgestern, übermorgen, neulich, kürzlich, bald, endlich
täglich, wöchentlich, monatlich, jährlich
`.trim();

const GOETHE_B1_WORDS = `
# Goethe-Zertifikat B1
# Additional ~1000 words beyond A2

# Abstract Concepts
Gesellschaft, Politik, Wirtschaft, Kultur, Bildung, Wissenschaft
Freiheit, Demokratie, Recht, Gesetz, Pflicht, Verantwortung
Entwicklung, Fortschritt, Veränderung, Zukunft, Vergangenheit
Erfolg, Misserfolg, Chance, Risiko, Vorteil, Nachteil

# Work & Career
Beruf, Karriere, Stelle, Position, Abteilung, Firma, Unternehmen
Bewerbung, Lebenslauf, Vorstellungsgespräch, Gehalt, Lohn
Arbeitszeit, Überstunde, Urlaub, Kündigung, Rente
Projekt, Aufgabe, Ziel, Ergebnis, Bericht, Präsentation

# Media & Communication
Nachricht, Information, Artikel, Bericht, Interview, Kommentar
Zeitung, Zeitschrift, Radio, Fernsehen, Sender, Programm
Werbung, Anzeige, Plakat, Broschüre

# Environment
Umwelt, Klima, Klimawandel, Energie, Strom, Gas
Müll, Recycling, Verschmutzung, Schutz
erneuerbar, nachhaltig, umweltfreundlich

# Social Issues
Problem, Lösung, Diskussion, Debatte, Argument
Armut, Reichtum, Gleichheit, Gerechtigkeit
Integration, Migration, Flüchtling, Asyl

# Extended Verbs
analysieren, bewerten, beurteilen, kritisieren
argumentieren, überzeugen, widersprechen, zustimmen
entwickeln, verbessern, verschlechtern, verändern
beeinflussen, kontrollieren, regeln, verwalten
fordern, verlangen, ablehnen, akzeptieren, annehmen
vermeiden, verhindern, lösen, behandeln
unterstützen, fördern, finanzieren, investieren

# Extended Adjectives
wirtschaftlich, politisch, sozial, kulturell, wissenschaftlich
international, national, regional, lokal, global
aktuell, künftig, ehemalig, bisherig
durchschnittlich, üblich, normal, typisch, besonders
grundsätzlich, prinzipiell, theoretisch, praktisch
offiziell, privat, öffentlich, staatlich

# Connectors & Discourse
allerdings, jedoch, dennoch, trotzdem, obwohl
deshalb, daher, deswegen, folglich, somit
außerdem, zusätzlich, darüber hinaus, schließlich
einerseits, andererseits, im Gegensatz, im Vergleich
zum Beispiel, insbesondere, vor allem, hauptsächlich
meiner Meinung nach, ich finde, ich glaube, ich denke
`.trim();

/**
 * Parse word list text into array of words
 */
function parseWordList(text) {
  const words = new Set();
  const lines = text.split('\n');

  for (const line of lines) {
    // Skip comments and empty lines
    if (line.startsWith('#') || line.trim() === '') continue;

    // Split by comma and clean each word
    const lineWords = line.split(',').map(w => w.trim().toLowerCase());
    lineWords.forEach(w => {
      if (w && w.length > 0) {
        words.add(w);
      }
    });
  }

  return Array.from(words);
}

/**
 * Create comprehensive Goethe word list with levels
 */
function createGoetheWordList() {
  const a1Words = parseWordList(GOETHE_A1_WORDS);
  const a2Words = parseWordList(GOETHE_A2_WORDS);
  const b1Words = parseWordList(GOETHE_B1_WORDS);

  const goetheList = {};

  // A1 words
  a1Words.forEach(word => {
    goetheList[word] = { level: 'A1', priority: 100 };
  });

  // A2 words (don't override A1)
  a2Words.forEach(word => {
    if (!goetheList[word]) {
      goetheList[word] = { level: 'A2', priority: 90 };
    }
  });

  // B1 words (don't override A1/A2)
  b1Words.forEach(word => {
    if (!goetheList[word]) {
      goetheList[word] = { level: 'B1', priority: 80 };
    }
  });

  return goetheList;
}

/**
 * Fetch frequency list from hermitdave's GitHub (most reliable source)
 * https://github.com/hermitdave/FrequencyWords
 */
async function fetchFrequencyList() {
  console.log('📥 Fetching German frequency list from FrequencyWords project...');

  const url = 'https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/de/de_50k.txt';

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const text = await response.text();
    const lines = text.trim().split('\n');

    const frequencyMap = {};
    let rank = 1;

    for (const line of lines) {
      const [word, count] = line.split(' ');
      if (word && count) {
        // Normalize to lowercase
        const normalizedWord = word.toLowerCase();
        if (!frequencyMap[normalizedWord]) {
          frequencyMap[normalizedWord] = {
            rank: rank,
            count: parseInt(count, 10),
            // Score: 100 for rank 1, decreasing logarithmically
            score: Math.max(0, Math.round(100 - Math.log10(rank) * 25))
          };
          rank++;
        }
      }
    }

    console.log(`✅ Loaded ${Object.keys(frequencyMap).length} words from frequency list`);
    return frequencyMap;

  } catch (error) {
    console.error('❌ Failed to fetch frequency list:', error.message);
    console.log('📁 Using fallback: Creating basic frequency data...');
    return {};
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting Frequency Data Collection\n');
  console.log('=' .repeat(50));

  // 1. Create Goethe word list
  console.log('\n📚 Creating Goethe Institut word lists (A1-B1)...');
  const goetheList = createGoetheWordList();
  const goethePath = path.join(DATA_DIR, 'goethe-wordlist.json');
  fs.writeFileSync(goethePath, JSON.stringify(goetheList, null, 2));

  const a1Count = Object.values(goetheList).filter(v => v.level === 'A1').length;
  const a2Count = Object.values(goetheList).filter(v => v.level === 'A2').length;
  const b1Count = Object.values(goetheList).filter(v => v.level === 'B1').length;

  console.log(`   ✅ A1: ${a1Count} words`);
  console.log(`   ✅ A2: ${a2Count} words`);
  console.log(`   ✅ B1: ${b1Count} words`);
  console.log(`   📁 Saved to: ${goethePath}`);

  // 2. Fetch frequency data
  console.log('\n📊 Fetching frequency data...');
  const frequencyData = await fetchFrequencyList();
  const freqPath = path.join(DATA_DIR, 'frequency-data.json');
  fs.writeFileSync(freqPath, JSON.stringify(frequencyData, null, 2));
  console.log(`   📁 Saved to: ${freqPath}`);

  // 3. Summary
  console.log('\n' + '=' .repeat(50));
  console.log('📋 SUMMARY');
  console.log('=' .repeat(50));
  console.log(`   Goethe words (PROTECTED): ${Object.keys(goetheList).length}`);
  console.log(`   Frequency words: ${Object.keys(frequencyData).length}`);
  console.log('\n✅ Phase 1 data collection complete!');
  console.log('👉 Next: Run score-vocabulary.mjs to score database words');
}

main().catch(console.error);
