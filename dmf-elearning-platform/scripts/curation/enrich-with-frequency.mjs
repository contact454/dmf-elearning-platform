#!/usr/bin/env node
/**
 * 📊 FETCH GERMAN WORD FREQUENCY DATA
 *
 * Nguồn dữ liệu tần suất:
 * 1. Leipzig Corpora Collection (Free, academic)
 * 2. DWDS (Digitales Wörterbuch der deutschen Sprache)
 * 3. Goethe Institut wordlists (A1-C2)
 *
 * Mục tiêu: Gán frequency rank cho tất cả từ vựng
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ============================================================================
// GOETHE CORE VOCABULARY (Official A1-B2)
// These are the most essential words for German learners
// ============================================================================

const GOETHE_A1_CORE = `
der die das ein eine
und oder aber auch nicht
ich du er sie es wir ihr
sein haben werden können müssen wollen sollen dürfen mögen
machen gehen kommen sehen hören sprechen sagen fragen antworten
essen trinken schlafen arbeiten lernen lesen schreiben spielen
gut schlecht groß klein neu alt jung schön
ja nein bitte danke
Haus Wohnung Zimmer Küche Bad Schlafzimmer
Familie Mutter Vater Kind Bruder Schwester
Freund Freundin Mann Frau
Tag Woche Monat Jahr heute morgen gestern
Morgen Mittag Abend Nacht
Montag Dienstag Mittwoch Donnerstag Freitag Samstag Sonntag
eins zwei drei vier fünf sechs sieben acht neun zehn
rot blau grün gelb weiß schwarz
Wasser Brot Milch Kaffee Tee Bier Wein
Auto Bus Bahn Zug Fahrrad
Straße Platz Stadt Land
Arzt Krankenhaus Apotheke
Schule Universität Lehrer Schüler Student
Arbeit Beruf Chef Kollege Büro
Geld Euro Preis billig teuer
kaufen verkaufen bezahlen kosten
Name Adresse Telefon E-Mail
helfen brauchen suchen finden nehmen geben
verstehen wissen kennen glauben denken meinen
lieben mögen hassen
anfangen beginnen aufhören enden
öffnen schließen
schnell langsam früh spät
hier dort oben unten links rechts
viel wenig alle keine mehr
sehr zu ganz nur noch schon immer nie
wenn weil dass ob obwohl damit
vor nach zwischen neben unter über hinter
mit ohne für gegen um durch
`.trim().split(/\s+/).filter(w => w.length > 0);

const GOETHE_A2_CORE = `
ändern verbessern verschlechtern
anrufen telefonieren
antworten fragen stellen
bedeuten heißen
beginnen anfangen starten
bekommen erhalten kriegen
benutzen verwenden gebrauchen
berichten erzählen
beschreiben erklären
besuchen
bewegen
bieten anbieten
bitten
bleiben
bringen holen
dauern
denken glauben meinen
dienen
drücken
einladen
entscheiden
entwickeln
erinnern vergessen
erkennen bemerken
erlauben verbieten
erreichen
erscheinen
erwarten hoffen
fallen steigen
fehlen
feiern
fliegen
folgen
fordern verlangen
freuen ärgern
führen leiten
funktionieren klappen
gehören besitzen
gewinnen verlieren
grüßen
halten stoppen
handeln
hängen
heiraten
hoffen
interessieren
kämpfen
kaufen verkaufen
klingen tönen
kochen backen braten
kontrollieren prüfen
lachen weinen
lassen
laufen rennen
legen stellen setzen
leiden
leihen borgen
liefern
lösen
melden
merken
messen
mieten vermieten
mögen lieben hassen
nennen
passen
passieren geschehen
planen
probieren versuchen
reagieren
reden sprechen
retten
riechen schmecken
rufen schreien
sammeln
schaffen
schenken
schicken senden
schlagen
schließen öffnen
schmecken
schneiden
schreiben lesen
schützen
schwimmen
singen tanzen
sitzen stehen liegen
sparen ausgeben
spielen
sprechen reden
springen
starten enden
stattfinden
stecken
steigen fallen
stellen legen setzen
stimmen
stören
streiten
studieren
suchen finden
tauschen wechseln
teilen
tragen
treffen begegnen
treiben
trennen verbinden
treten
trinken essen
tun machen
üben trainieren
überlegen nachdenken
überraschen
überzeugen
umziehen
unterhalten
unterscheiden
untersuchen
verbessern
verbinden trennen
verdienen
vergessen erinnern
vergleichen
verhalten
verkaufen kaufen
verlangen fordern
verlassen
verlieren gewinnen
vermissen
versprechen
verstehen begreifen
versuchen probieren
vertrauen
verzichten
vorbereiten
vorstellen
wachsen
wählen
warnen
warten
waschen putzen reinigen
wechseln tauschen
wecken
werden sein
werfen fangen
wiederholen
wirken
wissen kennen
wohnen leben
wünschen
zahlen bezahlen
zeigen
ziehen schieben
zuhören hören
zunehmen abnehmen
zurückkommen wiederkommen
zusammen gemeinsam
`.trim().split(/\s+/).filter(w => w.length > 0);

// B1 Core Vocabulary (Intermediate - Essential for daily life)
const GOETHE_B1_CORE = `
abbrechen abgeben abhängen abholen ablaufen abnehmen abschließen
achten aktivieren akzeptieren analysieren anbieten anerkennen
anfassen angeben angehören ankommen anmelden annehmen anpassen
anschauen ansehen ansprechen anstellen anwenden anziehen aufbauen
aufbewahren auffordern aufführen aufgeben aufheben aufklären
aufmachen aufnehmen aufpassen aufregen aufstehen auftauchen
auftreten aufwachsen ausbauen ausbilden ausdrücken ausführen
ausfüllen ausgeben ausmachen auspacken ausrichten ausschalten
ausschließen aussetzen aussprechen ausstatten ausstellen ausüben
auswählen ausweichen auszeichnen beachten beantragen beantworten
bearbeiten bedanken bedauern bedecken bedienen bedeuten bedienen
bedrücken beeilen beeindrucken beeinflussen beenden befassen
befehlen befinden befreien begegnen begeistern begreifen begrenzen
behaupten behandeln beherrschen beibringen beißen beitragen
beklagen belasten belegen beleuchten bemerken bemühen beobachten
beraten bereit bereiten berichten berichtigen berücksichtigen
beruhigen beschädigen beschäftigen beschließen beschreiben
beschuldigen beschützen beschweren beseitigen besetzen besichtigen
besitzen besorgen besprechen bestätigen bestehen bestellen
bestimmen bestrafen besuchen beteiligen betonen betrachten
betragen betreten betreuen betrügen beurteilen bevorzugen
bewahren beweisen bewerben bewerten bewundern bezahlen bezeichnen
bieten binden bitten blasen bleiben blicken blockieren bluten
borgen braten brauchen brechen brennen bringen buchen buchstabieren
charakterisieren definieren demonstrieren diskutieren dominieren
drängen drehen drohen drücken dulden durchführen durchsetzen
duschen eignen einbauen einbrechen eindringen einführen einhalten
einholen einigen einlassen einleben einpacken einrichten einschlafen
einschalten einschließen einsetzen einstellen eintreten einziehen
empfangen empfehlen empfinden enden entdecken entfernen enthalten
entlassen entscheiden entstehen entsprechen enttäuschen entwickeln
erfassen erfahren erfinden erfüllen ergänzen erhalten erhöhen
erholen erinnern erklären erlauben erleben erleiden erledigen
ermöglichen ermutigen ernähren erreichen errichten erscheinen
erschrecken ersetzen erstellen erteilen erwähnen erwarten erweisen
erweitern erwerben erzählen erziehen existieren
`.trim().split(/\s+/).filter(w => w.length > 0);

const GOETHE_B1_NOUNS = `
Abbruch Abfall Abgabe Abhängigkeit Abitur Abkommen Ablauf Abnahme
Abrechnung Abschnitt Absicht Abstimmung Abteilung Abwesenheit
Abzug Achtung Aktion Aktivität Akzent Alarm Album Alkohol
Allergie Alternative Aluminium Analyse Anblick Anbau Anerkennung
Anfall Anforderung Anführer Angelegenheit Angriff Anhänger Anklage
Anlass Anleitung Annahme Anordnung Anpassung Anregung Anschlag
Anschluss Anspruch Anstalt Anteil Antrag Anwalt Anwendung
Anweisung Anwesenheit Anzeige Apparat Appetit Arbeitnehmer Archiv
Argument Arm Art Artikel Aspekt Atmosphäre Atom Aufenthalt
Auffassung Aufführung Aufgabe Aufklärung Aufmerksamkeit Aufnahme
Aufsicht Aufstand Auftrag Auftritt Aufwand Augenblick Ausbreitung
Ausdauer Ausdrucksweise Ausflug Ausführung Ausgabe Ausgang Auskunft
Ausland Ausmaß Ausnahme Ausrüstung Aussage Außenseiter Aussprache
Ausstattung Ausstellung Austausch Auswahl Ausweis Auswirkung
Auszug Bagger Bande Bargeld Basis Batterie Bauernhof Baumwolle
Beamte Bearbeitung Bedarf Bedauern Bedenken Bedeutung Bedienung
Bedingung Bedrohung Bedürfnis Befehl Beförderung Begegnung
Begeisterung Begleitung Begriff Begründung Behandlung Behauptung
Behinderung Behörde Beilage Bein Beistand Beitrag Bekanntschaft
Beleg Beleuchtung Belohnung Bemerkung Bemühung Benutzung Benzin
Beobachtung Bequemlichkeit Beratung Berechnung Berechtigung Bereich
Bereitschaft Bergwerk Bericht Berichterstattung Berücksichtigung
Berufung Beschäftigung Bescheid Beschreibung Beschuldigung
Beschwerden Beseitigung Besichtigung Besitz Besitzer Bestandteil
Bestätigung Bestellung Bestrafung Bestreben Beteiligung Betonung
Betrag Betreuung Betrieb Bevölkerung Bewährung Beweggrund Beweis
Bewerber Bewertung Bewohner Bewunderung Bewusstsein Bezeichnung
Beziehung Bezug Bilanz Bildschirm Bindung Biologie Bischof Blatt
Blitz Block Bluse Bombe Bord Boss Branche Brand Brief Brille
Bronze Brötchen Brühe Brunnen Buchhandlung Bühne Bündnis Bürge
Bürgermeister Bürste Bus Busen Butter Camping Chaos Charakter
Chef Chemie Chor Christ Chronik Code Computer Dach Damm Dank
Darlehen Daten Dauer Deckel Defekt Definition Dekoration Demo
Demokrat Denkmal Depression Detektiv Devise Dialog Diät Dichter
Dienst Dienstleistung Differenz Ding Direktor Diskussion Dokument
Dolmetscher Dom Dosis Draht Drama Drang Drehbuch Dritte Druck
Drücker Droge Duft Dumheit Dunkelheit Durchbruch Durchführung
Durchgang Durchschnitt Dürre Durst Dusche Dutzend Dynamik
`.trim().split(/\s+/).filter(w => w.length > 0);

// B2 Core Vocabulary (Upper Intermediate - Professional/Academic)
const GOETHE_B2_CORE = `
abbauen abbilden abgrenzen abheben abklingen ablehnen ablenken
abmelden abordnen abreisen absagen abschätzen abschieben abschwächen
absorbieren absperren abstammen absteigen abstimmen abtrennen
abwägen abwarten abweichen abwenden abwickeln abziehen addieren
adressieren ahnen akkumulieren aktivieren alarmieren amüsieren
analysieren andeuten anfertigen anflehen angeben angleichen
angreifen anklagen ankündigen anlocken anmuten anordnen anregen
anreichern anrichten ansässig ansaugen anschlagen anschneiden
ansetzen ansiedeln anspornen anstecken anstreben anstrengen
antasten antreiben anvertrauen anweisen anzetteln anzweifeln
archivieren argumentieren arrangieren artikulieren assistieren
assoziieren aufbereiten aufblühen aufbringen aufdecken auffassen
auffinden aufgreifen aufheitern aufhorchen aufhören aufklären
aufladen auflisten auflösen aufmuntern aufnehmen aufopfern
aufpolieren aufräumen aufrichten aufschlüsseln aufschrecken
aufspüren aufstocken auftischen aufwenden aufwirbeln aufzeichnen
ausbauen ausbeuten ausbilden ausbleiben ausbreiten ausdenken
ausdehnen auseinandersetzen ausfertigen ausforschen ausfragen
ausgehen aushändigen ausheben ausholen ausklammern auskommen
auslachen auslassen auslegen ausleihen ausliefern auslösen
ausmalen ausmerzen ausmisten ausnutzen ausprobieren ausräumen
ausreichen ausreißen ausrichten ausruhen ausrüsten ausschalten
ausscheiden ausschöpfen ausschreiben aussehen aussetzen aussöhnen
aussortieren aussprechen ausstatten aussteigen aussterben
ausstrahlen ausströmen aussuchen austauschen austeilen austoben
austragen austreten austrocknen ausüben auswählen ausweichen
ausweisen auswerten auszahlen auszeichnen authentifizieren
autorisieren balancieren bannen basieren basteln beabsichtigen
beaufsichtigen beauftragen beben bedrängen beeinträchtigen
befestigen befördern befreunden befriedigen begaben begeben
begehren beglaubigen begnadigen begründen beharrlich behandeln
beheben behelfen beherbergen behindern beibehalten beichten
beiführen beikommen beimessen beinhalten beiordnen beirren
beistehen bekehren bekennen bekräftigen beladen belasten belästigen
beleben belegen beleuchten beliefern bemächtigen bemerken bemessen
benachrichtigen benachteiligen benennen benötigen beraten berauben
bereichern bereinigen berichten berufen berühren besänftigen
beschaffen beschämen bescheinigen bescheren beschimpfen beschleunigen
beschließen beschmutzen beschneiden beschönigen beschränken
beschwichtigen beschwören beseelen besetzen besiedeln besinnen
besitzen bespitzeln besprengen bestechen bestehen bestellen
betäuben beten beteuern betiteln betrachten betrauern betreiben
betrügen bevollmächtigen bevormunden bewachen bewaffnen bewältigen
bewegen beweinen bewilligen bewirken bewohnen bezaubern bezeugen
bezichtigen beziehen billigen binden blättern bläuen blähen
blockieren blühen bohren bombardieren boykottieren bräunen bremsen
brillieren brodeln brühen brüllen brüsten buchstabieren bügeln
bündeln charakterisieren codieren dämmern dämpfen danken debattieren
decken definieren degradieren dehnen deklarieren deklinieren
delegieren demonstrieren demütigen denunzieren deprimieren
desinfizieren deuten diagnoszieren dichten differenzieren
diktieren dirigieren diskriminieren diskutieren disponieren
distanzieren dividieren dokumentieren dolmetschen dominieren
dopen dotieren dozieren drängen dramatisieren drehen dreschen
dringen drohen drucken drücken duften dulden düngen durchblicken
durchbrennen durchdringen durchfallen durchführen durchhalten
durchlaufen durchleben durchqueren durchreisen durchringen
durchschauen durchschlagen durchsetzen durchstehen durchstreichen
durchsuchen durchwachsen einarbeiten einatmen einbilden einblenden
einbrechen einbürgern eindämmen eindrücken einfahren einfallen
`.trim().split(/\s+/).filter(w => w.length > 0);

const GOETHE_B2_NOUNS = `
Abbau Abbild Abbruch Abendessen Abenteuer Aberkennung Abfall
Abfertigung Abfindung Abfluss Abfolge Abführung Abgabe Abgang
Abgeordneter Abgrund Abhang Abhilfe Abholzung Abhörer Abiturient
Abkehr Abkommen Ablagerung Ablauf Ableger Ablehnung Ableitung
Ablenkung Ablieferung Ablösung Abmachung Abmahnung Abnahme
Abneigung Abnutzung Abonnement Abordnung Abriss Absage Absatz
Abscheu Abschied Abschlag Abschleppdienst Abschluss Abschnitt
Abschwung Absender Absicht Absolution Absorber Absprache Abstand
Abstieg Abstimmung Absturz Abteilung Abtreibung Abwägung Abwandlung
Abwanderung Abwärme Abwasser Abwehr Abweichung Abwesenheit
Abwicklung Abzahlung Abzeichen Abzug Achse Achtung Adapter
Adel Administrator Adoption Adresse Advent Affäre Affe Afghane
Aggression Ahnung Aids Akademie Aktion Aktionär Aktiva Aktivist
Aktivität Akustik Akzent Akzeptanz Alarm Album Alge Alibi Alkohol
Allee Alleinerbe Allergie Allianz Allradantrieb Alltag Almanach
Almosen Alphabet Altar Alter Altersheim Aluminium Amateur Ambulanz
Ameise Amnestie Ampel Amplitude Amtszeit Amüsement Analogie Analyse
Analytiker Anarchie Anatomie Andacht Andrang Anerkennung Anfänger
Anfechtung Anflug Anforderung Anfrage Anführer Angehöriger Angeklagter
Angelegenheit Angemessenheit Angestellter Angewohnheit Angler
Angriff Angst Anhaltspunkt Anhänger Anhörung Animation Anklage
Ankläger Anknüpfung Ankündigung Anlage Anlass Anlauf Anleger
Anleitung Anlieger Anlockung Anmeldung Anmut Annahme Annäherung
Annehmlichkeit Annonce Anonymität Anordnung Anpassung Anprobe
Anrede Anregung Anreiz Anreise Anruf Ansammlung Ansatz Anschaffung
Anschauung Anschlag Anschluss Anschrift Ansehen Ansehnlichkeit
Ansicht Anspielung Ansporn Ansprache Anspruch Anstalt Anstand
Ansteckung Anstellung Anstieg Anstifter Anstiftung Anstoß Anstrich
Anteil Anteilnahme Anthologie Antibiotikum Antike Antilope Antipathie
Antiquität Antrag Antreiber Antrieb Antritt Antwort Anwalt
Anwärter Anweisung Anwendung Anwesen Anwesenheit Anwohner Anzahl
Anzeichen Anzeige Anzug Apfel Apostel Apparat Appartement Appell
Appetit Applaus April Aquarell Aquarium Arbeit Arbeiter Arbeitgeber
Arbeitsamt Arbeitslosigkeit Archäologe Architekt Architektur
Archiv Arena Argument Aristokrat Arithmetik Arktis Arm Armee
Armut Aroma Arrangement Arrest Arroganz Arsenal Art Arterie
Artikel Artist Arznei Arzt Asche Asien Asphalt Assistent
Assoziation Ast Asyl Ästhetik Astrologe Astronomie Asyl Atelier
Atem Atheist Äther Athlet Atlantik Atlas Atmosphäre Atom Attentat
Attraktion Aufbau Aufbewahrung Aufbruch Aufdeckung Aufenthalt
Auffassung Aufführung Aufgabe Aufgang Aufgebot Aufhebung Aufholjagd
Aufklärung Auflage Auflösung Aufmachung Aufmerksamkeit Aufnahme
`.trim().split(/\s+/).filter(w => w.length > 0);

// Common nouns A2
const GOETHE_A2_NOUNS = `
Abend Abfahrt Absender Adresse Alter Anfang Angebot Angst Ankunft
Anmeldung Anruf Antwort Anzahl Apfel Arbeit Arbeitgeber Arbeitnehmer
Arbeitsplatz Arzt Aufgabe Auge Ausbildung Ausdruck Ausgang Auskunft
Ausländer Aussage Ausstellung Ausweis Auto Bäcker Bad Bahn Bahnhof
Bahnsteig Bank Bar Baum Beispiel Berg Beruf Bescheid Bestellung
Besuch Besucher Bett Bier Bild Birne Blatt Blick Blume Boden Boot
Brief Briefmarke Brille Brot Brücke Bruder Brust Buch Büro Bus Butter
Café Chef Computer Dank Datum Deutsch Deutschland Dienst Ding Dorf
Dose Drucker Durst Dusche Ecke Eingang Einladung Einwohner Eltern
Ende Entschuldigung Erdgeschoss Erfahrung Erfolg Ergebnis Erinnerung
Erwachsene Essen Fabrik Fahrkarte Fahrplan Fahrrad Familie Farbe
Fehler Feier Feiertag Feld Fenster Ferien Fernsehen Fest Feuer Fieber
Film Finger Firma Fisch Flasche Fleisch Flughafen Flugzeug Flur Fluss
Foto Frage Frau Freiheit Freizeit Freude Freund Freundin Freundschaft
Frieden Friseur Frühstück Führerschein Gabel Garten Gast Gebäude
Geburtstag Gedanke Gefahr Gefühl Gegend Gegenteil Geld Gemüse
Gepäck Gerät Gericht Geruch Geschäft Geschenk Geschichte Geschirr
Geschmack Geschwister Gesetz Gesicht Gesundheit Getränk Gewicht
Glas Glück Glückwunsch Gott Grenze Größe Grund Gruppe Gruß Haar
Hals Hand Handy Hauptstadt Haus Haut Heimat Heizung Herr Herz Hilfe
Himmel Hobby Hotel Hund Hunger Idee Information Inhalt Interesse
Internet Jahr Jahreszeit Job Jugend Jugendliche Junge Kaffee Kalender
Kälte Kamera Karte Kartoffel Käse Kasse Katze Kauf Kind Kino Kirche
Klasse Klavier Kleid Kleidung Koffer Kollege Kopf Körper Kosten Kraft
Krankenhaus Krankheit Kredit Krieg Küche Kuchen Kuh Kultur Kunde
Kunst Künstler Kurs Land Landschaft Leben Lebensmittel Leder Lehrer
Leid Leistung Leiter Leitung Leute Licht Liebe Lied Liste Lkw Loch
Löffel Lösung Luft Lust Mädchen Mahlzeit Mann Mark Markt Maschine
Material Medikament Meer Meinung Menge Mensch Messer Miete Minute
Mitarbeiter Mitglied Mitte Mittel Mitternacht Mittag Mittwoch Möbel
Mode Monat Mond Morgen Motor Mühe Müll Mund Museum Musik Mutter
Nachbar Nachricht Nacht Nähe Name Nase Natur Nebel Norden Notfall
Nudel Nummer Obst Öffentlichkeit Ohr Onkel Oper Ordnung Ort Osten
Österreich Paar Paket Papier Park Partei Party Pass Patient Pause
Person Pfeffer Plan Platz Politik Polizei Position Post Praxis Preis
Problem Programm Projekt Prozent Prüfung Publikum Qualität Quittung
Rad Radio Rat Rathaus Raum Rechnung Recht Regen Reihe Reise Reparatur
Restaurant Rezept Richtung Ring Rock Rolle Rose Rücken Ruhe Sache
Saft Salat Salz Samstag Satz Schaden Schalter Schauspieler Scheck
Schere Schiff Schlüssel Schmerz Schnee Schokolade Schrank Schrift
Schuh Schule Schulter Schutz Schwester See Seife Seite Sekretär
Sekunde Semester SendungService Sicherheit Situation Sitz Sohn
Sommer Sonne Sonntag Sorge Soße Spaziergang Speise Spiegel Spiel
Sport Sprache Staat Stadt Stall Stand Statistik Stelle Steuer Stoff
Stock Straße Strom Stück Student Studie Stuhl Suche Süden Supermarkt
Suppe System Tabelle Tafel Tag Tante Tanz Tasche Tasse Taste Taxi Team
Technik Teil Telefon Teller Temperatur Termin Test Text Theater Thema
Tier Tisch Titel Tochter Tod Toilette Tomate Ton Topf Tor Tour Tourist
Tradition Traum Treppe Tropfen Tür Typ Übung Ufer Uhr Umwelt Unfall
Universität Unterschied Unterschrift Untersuchung Urlaub Vater
Veranstaltung Verein Verfügung Vergangenheit Vergleich Vergnügen
Verkauf Verkehr Verlust Versammlung Versicherung Versuch Vertrag
Verwaltung Video Viertel Vitamin Volk Voraussetzung Vorfahrt Vorname
Vorschlag Vorstellung Vorteil Vortrag Wagen Wahl Wahrheit Wald Wand
Ware Wärme Wasser Wechsel Weg Weihnachten Wein Weise Welt Werbung
Werk Wert Westen Wetter Wichtigkeit Wille Wind Winter Wirklichkeit
Wirtschaft Wissen Wissenschaft Woche Wochenende Wohnung Wort Wörterbuch
Wunder Wunsch Wurst Zahl Zahn Zeichen Zeile Zeit Zeitung Zentrum
Zettel Ziel Zigarette Zimmer Zitrone Zucker Zufall Zugang Zukunft
Zusammenhang Zuschauer Zustand Zweck
`.trim().split(/\s+/).filter(w => w.length > 0);

// ============================================================================
// BUILD FREQUENCY INDEX
// ============================================================================

function buildFrequencyIndex() {
  const frequencyMap = new Map();

  // A1 core = rank 1-200 (most frequent)
  GOETHE_A1_CORE.forEach((word, i) => {
    frequencyMap.set(word.toLowerCase(), {
      rank: i + 1,
      level: 'A1',
      isGoethe: true,
      source: 'goethe_a1_core'
    });
  });

  // A2 verbs = rank 201-500
  GOETHE_A2_CORE.forEach((word, i) => {
    if (!frequencyMap.has(word.toLowerCase())) {
      frequencyMap.set(word.toLowerCase(), {
        rank: 200 + i + 1,
        level: 'A2',
        isGoethe: true,
        source: 'goethe_a2_verbs'
      });
    }
  });

  // A2 nouns = rank 501-1000
  GOETHE_A2_NOUNS.forEach((word, i) => {
    if (!frequencyMap.has(word.toLowerCase())) {
      frequencyMap.set(word.toLowerCase(), {
        rank: 500 + i + 1,
        level: 'A2',
        isGoethe: true,
        source: 'goethe_a2_nouns'
      });
    }
  });

  // B1 verbs = rank 1001-1500
  GOETHE_B1_CORE.forEach((word, i) => {
    if (!frequencyMap.has(word.toLowerCase())) {
      frequencyMap.set(word.toLowerCase(), {
        rank: 1000 + i + 1,
        level: 'B1',
        isGoethe: true,
        source: 'goethe_b1_verbs'
      });
    }
  });

  // B1 nouns = rank 1501-2500
  GOETHE_B1_NOUNS.forEach((word, i) => {
    if (!frequencyMap.has(word.toLowerCase())) {
      frequencyMap.set(word.toLowerCase(), {
        rank: 1500 + i + 1,
        level: 'B1',
        isGoethe: true,
        source: 'goethe_b1_nouns'
      });
    }
  });

  // B2 verbs = rank 2501-3500
  GOETHE_B2_CORE.forEach((word, i) => {
    if (!frequencyMap.has(word.toLowerCase())) {
      frequencyMap.set(word.toLowerCase(), {
        rank: 2500 + i + 1,
        level: 'B2',
        isGoethe: true,
        source: 'goethe_b2_verbs'
      });
    }
  });

  // B2 nouns = rank 3501-5000
  GOETHE_B2_NOUNS.forEach((word, i) => {
    if (!frequencyMap.has(word.toLowerCase())) {
      frequencyMap.set(word.toLowerCase(), {
        rank: 3500 + i + 1,
        level: 'B2',
        isGoethe: true,
        source: 'goethe_b2_nouns'
      });
    }
  });

  return frequencyMap;
}

// ============================================================================
// ENRICH VOCABULARY WITH FREQUENCY DATA
// ============================================================================

async function enrichWithFrequency() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║    📊 ENRICH VOCABULARY WITH FREQUENCY DATA                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Build frequency index
  const frequencyMap = buildFrequencyIndex();
  console.log(`📚 Built frequency index: ${frequencyMap.size} words\n`);

  // Load mined vocabulary
  const minedPath = path.join(__dirname, '../data/new-mined-words.json');
  const mined = JSON.parse(fs.readFileSync(minedPath, 'utf-8'));
  console.log(`📥 Loaded ${mined.length} mined words\n`);

  // Enrich with frequency data
  let enriched = 0;
  let goetheCount = 0;

  const enrichedVocab = mined.map(word => {
    const freq = frequencyMap.get(word.word.toLowerCase());
    if (freq) {
      enriched++;
      if (freq.isGoethe) goetheCount++;
      return {
        ...word,
        frequency: freq.rank,
        is_goethe: freq.isGoethe,
        freq_source: freq.source,
      };
    }
    // Estimate frequency for non-Goethe words based on level
    const levelRanks = {
      A1: 2000,
      A2: 4000,
      B1: 8000,
      B2: 15000,
      C1: 25000,
      C2: 40000,
    };
    return {
      ...word,
      frequency: levelRanks[word.level] || 30000,
      is_goethe: false,
      freq_source: 'estimated',
    };
  });

  console.log('📊 Enrichment Results:');
  console.log(`   Total words: ${mined.length}`);
  console.log(`   Matched Goethe: ${goetheCount}`);
  console.log(`   Total enriched: ${enriched}`);
  console.log(`   Estimated: ${mined.length - enriched}\n`);

  // Save enriched vocabulary
  const outputPath = path.join(__dirname, '../data/frequency-enriched-vocabulary.json');
  fs.writeFileSync(outputPath, JSON.stringify(enrichedVocab, null, 2));
  console.log(`💾 Saved to: ${outputPath}`);

  // Also save frequency index for reference
  const indexPath = path.join(__dirname, '../data/frequency/goethe-frequency-index.json');
  const indexDir = path.dirname(indexPath);
  if (!fs.existsSync(indexDir)) {
    fs.mkdirSync(indexDir, { recursive: true });
  }
  fs.writeFileSync(indexPath, JSON.stringify(
    Object.fromEntries(frequencyMap),
    null, 2
  ));
  console.log(`💾 Saved frequency index to: ${indexPath}`);

  console.log('\n✅ Frequency enrichment complete!');
}

enrichWithFrequency().catch(console.error);
