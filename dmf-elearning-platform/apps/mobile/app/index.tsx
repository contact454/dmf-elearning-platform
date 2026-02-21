/**
 * Learn Tab — Home screen
 * Course overview, skill tiles, continue learning
 */
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SKILLS = [
    { id: 'vocabulary', icon: '🔤', label: 'Wortschatz', labelVi: 'Từ vựng', color: '#6366f1', progress: 72 },
    { id: 'reading', icon: '📖', label: 'Lesen', labelVi: 'Đọc', color: '#8b5cf6', progress: 58 },
    { id: 'listening', icon: '🎧', label: 'Hören', labelVi: 'Nghe', color: '#a855f7', progress: 45 },
    { id: 'speaking', icon: '🎤', label: 'Sprechen', labelVi: 'Nói', color: '#d946ef', progress: 38 },
    { id: 'writing', icon: '✍️', label: 'Schreiben', labelVi: 'Viết', color: '#ec4899', progress: 32 },
    { id: 'grammar', icon: '📐', label: 'Grammatik', labelVi: 'Ngữ pháp', color: '#f43f5e', progress: 25 },
];

export default function LearnScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.greeting}>Guten Morgen! 🌅</Text>
                    <Text style={styles.title}>Was möchtest du lernen?</Text>
                </View>

                {/* Streak Banner */}
                <View style={styles.streakBanner}>
                    <Text style={styles.streakEmoji}>🔥</Text>
                    <View>
                        <Text style={styles.streakTitle}>12 Tage Streak!</Text>
                        <Text style={styles.streakSub}>Weiter so — du bist großartig!</Text>
                    </View>
                </View>

                {/* Daily Challenge */}
                <TouchableOpacity style={styles.challengeCard}>
                    <View style={styles.challengeHeader}>
                        <Text style={styles.challengeIcon}>⚡</Text>
                        <Text style={styles.challengeTitle}>Tägliche Herausforderung</Text>
                    </View>
                    <Text style={styles.challengeDesc}>Lerne 10 neue Wörter zum Thema "Reisen"</Text>
                    <View style={styles.challengeProgress}>
                        <View style={[styles.challengeBar, { width: '30%' }]} />
                    </View>
                    <Text style={styles.challengePercent}>3/10 abgeschlossen</Text>
                </TouchableOpacity>

                {/* Skill Grid */}
                <Text style={styles.sectionTitle}>Fähigkeiten</Text>
                <View style={styles.skillGrid}>
                    {SKILLS.map(skill => (
                        <TouchableOpacity key={skill.id} style={styles.skillCard}>
                            <Text style={styles.skillIcon}>{skill.icon}</Text>
                            <Text style={styles.skillLabel}>{skill.label}</Text>
                            <Text style={styles.skillLabelVi}>{skill.labelVi}</Text>
                            <View style={styles.skillProgressBg}>
                                <View style={[styles.skillProgressFill, { width: `${skill.progress}%`, backgroundColor: skill.color }]} />
                            </View>
                            <Text style={[styles.skillPercent, { color: skill.color }]}>{skill.progress}%</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f0d1a' },
    header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
    greeting: { fontSize: 16, color: '#9ca3af', fontWeight: '500' },
    title: { fontSize: 28, color: '#f3f4f6', fontWeight: '800', marginTop: 4 },
    streakBanner: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        marginHorizontal: 20, marginTop: 16, padding: 16,
        backgroundColor: '#1c1a2e', borderRadius: 16, borderWidth: 1, borderColor: '#2d2b42',
    },
    streakEmoji: { fontSize: 36 },
    streakTitle: { fontSize: 18, color: '#f3f4f6', fontWeight: '700' },
    streakSub: { fontSize: 13, color: '#9ca3af', marginTop: 2 },
    challengeCard: {
        marginHorizontal: 20, marginTop: 16, padding: 20,
        backgroundColor: 'rgba(99, 102, 241, 0.15)', borderRadius: 16,
        borderWidth: 1, borderColor: 'rgba(99, 102, 241, 0.3)',
    },
    challengeHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    challengeIcon: { fontSize: 20 },
    challengeTitle: { fontSize: 16, color: '#a5b4fc', fontWeight: '700' },
    challengeDesc: { fontSize: 14, color: '#c4b5fd', marginBottom: 12 },
    challengeProgress: { height: 6, borderRadius: 3, backgroundColor: 'rgba(99, 102, 241, 0.2)' },
    challengeBar: { height: '100%', borderRadius: 3, backgroundColor: '#6366f1' },
    challengePercent: { fontSize: 12, color: '#818cf8', marginTop: 6, textAlign: 'right' },
    sectionTitle: { fontSize: 20, color: '#f3f4f6', fontWeight: '700', marginHorizontal: 20, marginTop: 24, marginBottom: 12 },
    skillGrid: {
        flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 14,
        gap: 8, paddingBottom: 100,
    },
    skillCard: {
        width: '47%', padding: 16, backgroundColor: '#1c1a2e',
        borderRadius: 16, borderWidth: 1, borderColor: '#2d2b42', marginHorizontal: 4,
    },
    skillIcon: { fontSize: 32, marginBottom: 8 },
    skillLabel: { fontSize: 16, color: '#f3f4f6', fontWeight: '700' },
    skillLabelVi: { fontSize: 12, color: '#6b7280', marginBottom: 10 },
    skillProgressBg: { height: 4, borderRadius: 2, backgroundColor: '#2d2b42' },
    skillProgressFill: { height: '100%', borderRadius: 2 },
    skillPercent: { fontSize: 12, fontWeight: '600', marginTop: 4, textAlign: 'right' },
});
