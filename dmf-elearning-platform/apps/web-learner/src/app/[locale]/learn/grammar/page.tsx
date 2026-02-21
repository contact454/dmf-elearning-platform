'use client';

import { useState } from 'react';
import Link from 'next/link';

// ─── Grammar Rule Data ───

interface GrammarRule {
    id: string;
    title: string;
    titleVi: string;
    level: string;
    category: string;
    explanation: string;
    examples: Array<{ de: string; vi: string; highlight: string }>;
    tips: string[];
}

const GRAMMAR_RULES: GrammarRule[] = [
    // A1
    {
        id: 'a1-01', title: 'Präsens – Regelmäßige Verben', titleVi: 'Hiện tại – Động từ có quy tắc', level: 'A1', category: 'Verben',
        explanation: 'Im Deutschen werden regelmäßige Verben im Präsens konjugiert, indem man die Endung des Infinitivs (-en) entfernt und die passende Personalendung anhängt.',
        examples: [
            { de: 'Ich lerne Deutsch.', vi: 'Tôi học tiếng Đức.', highlight: 'lerne' },
            { de: 'Du spielst Fußball.', vi: 'Bạn chơi bóng đá.', highlight: 'spielst' },
            { de: 'Er/Sie arbeitet viel.', vi: 'Anh ấy/Cô ấy làm việc nhiều.', highlight: 'arbeitet' },
        ],
        tips: ['ich → -e', 'du → -st', 'er/sie/es → -t', 'wir → -en', 'ihr → -t', 'sie/Sie → -en'],
    },
    {
        id: 'a1-02', title: 'Artikel: der, die, das', titleVi: 'Mạo từ: der, die, das', level: 'A1', category: 'Nomen',
        explanation: 'Jedes deutsche Nomen hat ein grammatisches Geschlecht: maskulin (der), feminin (die) oder neutral (das). Man muss das Geschlecht mit dem Nomen zusammen lernen.',
        examples: [
            { de: 'der Mann', vi: 'người đàn ông (giống đực)', highlight: 'der' },
            { de: 'die Frau', vi: 'người phụ nữ (giống cái)', highlight: 'die' },
            { de: 'das Kind', vi: 'đứa trẻ (giống trung)', highlight: 'das' },
        ],
        tips: ['Maskulin: der Tisch, der Stuhl', 'Feminin: die Lampe, die Tür', 'Neutral: das Buch, das Fenster'],
    },
    {
        id: 'a1-03', title: 'Negation: nicht & kein', titleVi: 'Phủ định: nicht & kein', level: 'A1', category: 'Satzstruktur',
        explanation: '"nicht" verneint Verben, Adjektive und bestimmte Nomen. "kein" verneint unbestimmte Nomen und ersetzt "ein/eine".',
        examples: [
            { de: 'Ich trinke nicht.', vi: 'Tôi không uống.', highlight: 'nicht' },
            { de: 'Das ist kein Problem.', vi: 'Đó không phải là vấn đề.', highlight: 'kein' },
            { de: 'Ich habe keine Zeit.', vi: 'Tôi không có thời gian.', highlight: 'keine' },
        ],
        tips: ['"nicht" steht oft am Satzende', '"kein" wird wie der unbestimmte Artikel dekliniert'],
    },
    // A2
    {
        id: 'a2-01', title: 'Perfekt – Partizip II', titleVi: 'Thì hoàn thành – Phân từ II', level: 'A2', category: 'Verben',
        explanation: 'Das Perfekt bildet man mit "haben" oder "sein" + Partizip II. Regelmäßige Verben: ge- + Stamm + -t. Unregelmäßige: ge- + Stamm + -en (mit Vokalwechsel).',
        examples: [
            { de: 'Ich habe Deutsch gelernt.', vi: 'Tôi đã học tiếng Đức.', highlight: 'gelernt' },
            { de: 'Er ist nach Berlin gefahren.', vi: 'Anh ấy đã đi Berlin.', highlight: 'gefahren' },
            { de: 'Wir haben Pizza gegessen.', vi: 'Chúng tôi đã ăn pizza.', highlight: 'gegessen' },
        ],
        tips: ['Bewegungsverben nutzen "sein": gehen, fahren, kommen, fliegen', 'Regelmäßig: ge-…-t (gemacht, gekauft)', 'Unregelmäßig: ge-…-en (geschrieben, gesprochen)'],
    },
    {
        id: 'a2-02', title: 'Dativ – Wem?', titleVi: 'Cách tặng – Cho ai?', level: 'A2', category: 'Kasus',
        explanation: 'Der Dativ antwortet auf die Frage "Wem?". Bestimmte Präpositionen verlangen immer den Dativ: aus, bei, mit, nach, seit, von, zu.',
        examples: [
            { de: 'Ich helfe dem Mann.', vi: 'Tôi giúp người đàn ông.', highlight: 'dem' },
            { de: 'Sie gibt der Frau ein Buch.', vi: 'Cô ấy đưa người phụ nữ một cuốn sách.', highlight: 'der' },
            { de: 'Ich komme mit dem Bus.', vi: 'Tôi đến bằng xe buýt.', highlight: 'dem' },
        ],
        tips: ['der/das → dem', 'die → der', 'die (Plural) → den + -n'],
    },
    // B1
    {
        id: 'b1-01', title: 'Konjunktiv II – Wünsche & Hypothesen', titleVi: 'Giả định II – Mong muốn & Giả thuyết', level: 'B1', category: 'Verben',
        explanation: 'Der Konjunktiv II drückt irreale Situationen, Wünsche und höfliche Bitten aus. Meistens benutzt man "würde" + Infinitiv.',
        examples: [
            { de: 'Ich hätte gern ein Bier.', vi: 'Tôi muốn một ly bia.', highlight: 'hätte' },
            { de: 'Wenn ich reich wäre, würde ich reisen.', vi: 'Nếu tôi giàu, tôi sẽ đi du lịch.', highlight: 'wäre' },
            { de: 'Könnten Sie mir bitte helfen?', vi: 'Bạn có thể giúp tôi được không?', highlight: 'Könnten' },
        ],
        tips: ['haben → hätte', 'sein → wäre', 'können → könnte', 'Andere Verben: würde + Infinitiv'],
    },
    {
        id: 'b1-02', title: 'Relativsätze', titleVi: 'Mệnh đề quan hệ', level: 'B1', category: 'Satzstruktur',
        explanation: 'Relativsätze geben zusätzliche Informationen über ein Nomen. Das Relativpronomen richtet sich nach dem Genus des Bezugsworts und dem Kasus im Nebensatz.',
        examples: [
            { de: 'Der Mann, der dort steht, ist mein Lehrer.', vi: 'Người đàn ông đứng ở đó là thầy giáo tôi.', highlight: 'der' },
            { de: 'Das Buch, das ich lese, ist spannend.', vi: 'Cuốn sách tôi đang đọc rất hấp dẫn.', highlight: 'das' },
            { de: 'Die Frau, der ich geholfen habe, dankt mir.', vi: 'Người phụ nữ tôi đã giúp cảm ơn tôi.', highlight: 'der' },
        ],
        tips: ['Verb im Nebensatz → ans Ende!', 'Relativpronomen = bestimmter Artikel (außer Dativ Plural: denen, Genitiv: dessen/deren)'],
    },
    // B2
    {
        id: 'b2-01', title: 'Passiv – Vorgangspassiv & Zustandspassiv', titleVi: 'Bị động – Quá trình & Trạng thái', level: 'B2', category: 'Verben',
        explanation: 'Das Vorgangspassiv (werden + Partizip II) beschreibt einen Prozess. Das Zustandspassiv (sein + Partizip II) beschreibt ein Ergebnis.',
        examples: [
            { de: 'Das Haus wird gebaut.', vi: 'Ngôi nhà đang được xây.', highlight: 'wird gebaut' },
            { de: 'Das Haus ist gebaut.', vi: 'Ngôi nhà đã được xây xong.', highlight: 'ist gebaut' },
            { de: 'Der Brief wurde geschrieben.', vi: 'Bức thư đã được viết.', highlight: 'wurde geschrieben' },
        ],
        tips: ['Vorgangspassiv: Fokus auf die Handlung', 'Zustandspassiv: Fokus auf das Ergebnis', 'Von + Dativ für den Akteur: "Das Buch wurde von Goethe geschrieben."'],
    },
];

// ─── Component ───

const LEVEL_COLORS: Record<string, string> = {
    A1: '#22c55e', A2: '#3b82f6', B1: '#a855f7', B2: '#ef4444',
};

export default function GrammarPage() {
    const [selectedLevel, setSelectedLevel] = useState<string>('all');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const filtered = selectedLevel === 'all'
        ? GRAMMAR_RULES
        : GRAMMAR_RULES.filter(r => r.level === selectedLevel);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 p-4 sm:p-6 lg:p-8">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-outfit font-bold text-gray-800 dark:text-gray-100">
                            📐 Grammatik
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Deutsche Grammatik — Ngữ pháp tiếng Đức
                        </p>
                    </div>
                    <Link href="/learn" className="px-4 py-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:bg-indigo-200 transition">
                        ← Zurück
                    </Link>
                </div>

                {/* Level filter */}
                <div className="flex gap-2 flex-wrap">
                    {['all', 'A1', 'A2', 'B1', 'B2'].map(level => (
                        <button
                            key={level}
                            onClick={() => setSelectedLevel(level)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${selectedLevel === level
                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg scale-105'
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                                }`}
                        >
                            {level === 'all' ? 'Alle Stufen' : level}
                        </button>
                    ))}
                </div>

                {/* Rules list */}
                <div className="space-y-4">
                    {filtered.map(rule => {
                        const isExpanded = expandedId === rule.id;
                        return (
                            <div
                                key={rule.id}
                                className="rounded-2xl bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-200"
                            >
                                {/* Header */}
                                <button
                                    onClick={() => setExpandedId(isExpanded ? null : rule.id)}
                                    className="w-full flex items-center gap-4 p-4 text-left"
                                >
                                    <span
                                        className="px-2 py-1 rounded-md text-xs font-bold text-white"
                                        style={{ backgroundColor: LEVEL_COLORS[rule.level] || '#6366f1' }}
                                    >
                                        {rule.level}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-800 dark:text-gray-100">{rule.title}</h3>
                                        <p className="text-sm text-gray-400">{rule.titleVi}</p>
                                    </div>
                                    <span className="text-gray-400 text-sm px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
                                        {rule.category}
                                    </span>
                                    <svg
                                        className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Expanded content */}
                                {isExpanded && (
                                    <div className="px-4 pb-4 space-y-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                                            {rule.explanation}
                                        </p>

                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Beispiele:</h4>
                                            <div className="space-y-2">
                                                {rule.examples.map((ex, i) => (
                                                    <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-900/20">
                                                        <p className="text-gray-800 dark:text-gray-100 font-medium">
                                                            {ex.de.split(ex.highlight).map((part, j, arr) => (
                                                                <span key={j}>
                                                                    {part}
                                                                    {j < arr.length - 1 && (
                                                                        <span className="px-1 rounded bg-indigo-200 dark:bg-indigo-700 font-bold text-indigo-700 dark:text-indigo-200">
                                                                            {ex.highlight}
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            ))}
                                                        </p>
                                                        <p className="text-sm text-gray-400 italic">→ {ex.vi}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {rule.tips.length > 0 && (
                                            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                                <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-1">💡 Tipps:</h4>
                                                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-0.5">
                                                    {rule.tips.map((tip, i) => (
                                                        <li key={i}>• {tip}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
