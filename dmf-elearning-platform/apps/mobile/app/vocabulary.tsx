/**
 * Vocabulary Tab — Flashcard review
 */
import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const SAMPLE_WORDS = [
    { de: 'der Hund', vi: 'con chó', example: 'Der Hund spielt im Garten.', level: 'A1' },
    { de: 'die Katze', vi: 'con mèo', example: 'Die Katze schläft auf dem Sofa.', level: 'A1' },
    { de: 'arbeiten', vi: 'làm việc', example: 'Ich arbeite jeden Tag von 9 bis 17 Uhr.', level: 'A1' },
    { de: 'die Reise', vi: 'chuyến đi', example: 'Wir machen eine Reise nach Berlin.', level: 'A2' },
    { de: 'sich freuen', vi: 'vui mừng', example: 'Ich freue mich auf das Wochenende.', level: 'A2' },
    { de: 'die Erfahrung', vi: 'kinh nghiệm', example: 'Das war eine tolle Erfahrung.', level: 'B1' },
    { de: 'beeinflussen', vi: 'ảnh hưởng', example: 'Das Wetter beeinflusst meine Stimmung.', level: 'B1' },
    { de: 'die Verantwortung', vi: 'trách nhiệm', example: 'Er übernimmt die Verantwortung.', level: 'B2' },
];

export default function VocabularyScreen() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [stats, setStats] = useState({ correct: 0, wrong: 0 });
    const flipAnim = useRef(new Animated.Value(0)).current;

    const word = SAMPLE_WORDS[currentIndex];

    const flip = () => {
        Animated.spring(flipAnim, { toValue: flipped ? 0 : 1, useNativeDriver: true }).start();
        setFlipped(!flipped);
    };

    const answer = (correct: boolean) => {
        setStats(prev => ({
            correct: prev.correct + (correct ? 1 : 0),
            wrong: prev.wrong + (correct ? 0 : 1),
        }));
        setFlipped(false);
        flipAnim.setValue(0);
        setCurrentIndex(prev => (prev + 1) % SAMPLE_WORDS.length);
    };

    const frontRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
    const backRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>🔤 Wortschatz</Text>
                <View style={styles.statsRow}>
                    <Text style={styles.statCorrect}>✅ {stats.correct}</Text>
                    <Text style={styles.statWrong}>❌ {stats.wrong}</Text>
                    <Text style={styles.statRemaining}>📝 {SAMPLE_WORDS.length - currentIndex}</Text>
                </View>
            </View>

            {/* Level badge */}
            <View style={styles.levelBadge}>
                <Text style={styles.levelText}>{word.level}</Text>
            </View>

            {/* Flashcard */}
            <View style={styles.cardContainer}>
                <TouchableOpacity onPress={flip} activeOpacity={0.9}>
                    {/* Front */}
                    <Animated.View style={[styles.card, { transform: [{ rotateY: frontRotate }], backfaceVisibility: 'hidden' }]}>
                        <Text style={styles.cardWord}>{word.de}</Text>
                        <Text style={styles.cardHint}>Tippe zum Umdrehen</Text>
                    </Animated.View>
                    {/* Back */}
                    <Animated.View style={[styles.card, styles.cardBack, { transform: [{ rotateY: backRotate }], backfaceVisibility: 'hidden' }]}>
                        <Text style={styles.cardTranslation}>{word.vi}</Text>
                        <Text style={styles.cardExample}>{word.example}</Text>
                    </Animated.View>
                </TouchableOpacity>
            </View>

            {/* Answer buttons */}
            <View style={styles.buttonRow}>
                <TouchableOpacity style={[styles.btn, styles.btnWrong]} onPress={() => answer(false)}>
                    <Text style={styles.btnText}>Nochmal 🔄</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.btnCorrect]} onPress={() => answer(true)}>
                    <Text style={styles.btnText}>Gewusst! ✅</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f0d1a' },
    header: { paddingHorizontal: 20, paddingTop: 16 },
    title: { fontSize: 24, color: '#f3f4f6', fontWeight: '800' },
    statsRow: { flexDirection: 'row', gap: 16, marginTop: 8 },
    statCorrect: { color: '#4ade80', fontSize: 14, fontWeight: '600' },
    statWrong: { color: '#f87171', fontSize: 14, fontWeight: '600' },
    statRemaining: { color: '#9ca3af', fontSize: 14, fontWeight: '600' },
    levelBadge: {
        alignSelf: 'center', marginTop: 16,
        paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20,
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
    },
    levelText: { color: '#818cf8', fontSize: 14, fontWeight: '700' },
    cardContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
    card: {
        width: width - 60, height: 250, borderRadius: 24,
        backgroundColor: '#1c1a2e', borderWidth: 1, borderColor: '#2d2b42',
        justifyContent: 'center', alignItems: 'center', padding: 24,
        position: 'absolute',
    },
    cardBack: { backgroundColor: '#1a1640' },
    cardWord: { fontSize: 36, color: '#f3f4f6', fontWeight: '800', textAlign: 'center' },
    cardHint: { fontSize: 13, color: '#6b7280', marginTop: 16 },
    cardTranslation: { fontSize: 28, color: '#a5b4fc', fontWeight: '700', textAlign: 'center' },
    cardExample: { fontSize: 15, color: '#9ca3af', marginTop: 16, textAlign: 'center', fontStyle: 'italic' },
    buttonRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingBottom: 100 },
    btn: { flex: 1, paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
    btnWrong: { backgroundColor: 'rgba(248, 113, 113, 0.15)', borderWidth: 1, borderColor: 'rgba(248, 113, 113, 0.3)' },
    btnCorrect: { backgroundColor: 'rgba(74, 222, 128, 0.15)', borderWidth: 1, borderColor: 'rgba(74, 222, 128, 0.3)' },
    btnText: { color: '#f3f4f6', fontSize: 16, fontWeight: '700' },
});
