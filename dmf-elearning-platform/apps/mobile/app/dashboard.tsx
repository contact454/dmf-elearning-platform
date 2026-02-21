/**
 * Dashboard Tab — XP, CEFR level, achievements, leaderboard
 */
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ACHIEVEMENTS = [
    { icon: '🏆', name: 'Erste Schritte', unlocked: true },
    { icon: '📚', name: '100 Wörter', unlocked: true },
    { icon: '🔥', name: '7-Tage-Streak', unlocked: true },
    { icon: '⭐', name: 'Level 5', unlocked: false },
    { icon: '🎯', name: 'Perfekter Tag', unlocked: false },
    { icon: '🏅', name: 'Top 10', unlocked: false },
];

const LEADERBOARD = [
    { rank: 1, name: 'Phuc H.', xp: 5420, isMe: false },
    { rank: 2, name: 'Anna K.', xp: 4890, isMe: false },
    { rank: 3, name: 'Max M.', xp: 4210, isMe: false },
    { rank: 4, name: 'Du', xp: 2450, isMe: true },
    { rank: 5, name: 'Lisa B.', xp: 2100, isMe: false },
];

export default function DashboardScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>📊 Dashboard</Text>

                {/* Level Card */}
                <View style={styles.levelCard}>
                    <View style={styles.levelRow}>
                        <View>
                            <Text style={styles.levelLabel}>Aktuelles Niveau</Text>
                            <Text style={styles.levelValue}>A2</Text>
                        </View>
                        <View style={styles.levelXP}>
                            <Text style={styles.xpValue}>2,450</Text>
                            <Text style={styles.xpLabel}>XP</Text>
                        </View>
                        <View>
                            <Text style={styles.streakValue}>🔥 12</Text>
                            <Text style={styles.xpLabel}>Streak</Text>
                        </View>
                    </View>
                    <View style={styles.progressBg}>
                        <View style={[styles.progressFill, { width: '64%' }]} />
                    </View>
                    <Text style={styles.progressText}>A2 → B1: 64%</Text>
                </View>

                {/* Achievements */}
                <Text style={styles.sectionTitle}>🏆 Erfolge</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementScroll}>
                    {ACHIEVEMENTS.map((a, i) => (
                        <View key={i} style={[styles.achievementCard, !a.unlocked && styles.achievementLocked]}>
                            <Text style={[styles.achievementIcon, !a.unlocked && { opacity: 0.3 }]}>{a.icon}</Text>
                            <Text style={[styles.achievementName, !a.unlocked && { color: '#4b5563' }]}>{a.name}</Text>
                        </View>
                    ))}
                </ScrollView>

                {/* Leaderboard */}
                <Text style={styles.sectionTitle}>🏅 Bestenliste</Text>
                <View style={styles.leaderboard}>
                    {LEADERBOARD.map(entry => (
                        <View key={entry.rank} style={[styles.leaderRow, entry.isMe && styles.leaderRowMe]}>
                            <Text style={styles.leaderRank}>
                                {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
                            </Text>
                            <Text style={[styles.leaderName, entry.isMe && styles.leaderNameMe]}>{entry.name}</Text>
                            <Text style={styles.leaderXP}>{entry.xp.toLocaleString()} XP</Text>
                        </View>
                    ))}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f0d1a' },
    title: { fontSize: 24, color: '#f3f4f6', fontWeight: '800', paddingHorizontal: 20, paddingTop: 16 },
    levelCard: {
        margin: 20, padding: 20, borderRadius: 20,
        backgroundColor: '#1f1347', borderWidth: 1, borderColor: '#3b2d7a',
    },
    levelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    levelLabel: { color: '#a5b4fc', fontSize: 13, fontWeight: '500' },
    levelValue: { color: '#f3f4f6', fontSize: 42, fontWeight: '900' },
    levelXP: { alignItems: 'center' },
    xpValue: { color: '#fbbf24', fontSize: 22, fontWeight: '800' },
    xpLabel: { color: '#9ca3af', fontSize: 12 },
    streakValue: { fontSize: 22, fontWeight: '800', color: '#f3f4f6' },
    progressBg: { height: 8, borderRadius: 4, backgroundColor: 'rgba(99, 102, 241, 0.2)' },
    progressFill: { height: '100%', borderRadius: 4, backgroundColor: '#818cf8' },
    progressText: { color: '#a5b4fc', fontSize: 12, marginTop: 8, textAlign: 'center' },
    sectionTitle: { fontSize: 18, color: '#f3f4f6', fontWeight: '700', marginHorizontal: 20, marginTop: 24, marginBottom: 12 },
    achievementScroll: { paddingLeft: 20 },
    achievementCard: {
        width: 100, padding: 16, marginRight: 12, borderRadius: 16,
        backgroundColor: '#1c1a2e', borderWidth: 1, borderColor: '#2d2b42', alignItems: 'center',
    },
    achievementLocked: { opacity: 0.5 },
    achievementIcon: { fontSize: 32, marginBottom: 8 },
    achievementName: { fontSize: 12, color: '#d1d5db', textAlign: 'center', fontWeight: '600' },
    leaderboard: { marginHorizontal: 20 },
    leaderRow: {
        flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16,
        borderRadius: 12, marginBottom: 8, backgroundColor: '#1c1a2e',
    },
    leaderRowMe: { backgroundColor: 'rgba(99, 102, 241, 0.15)', borderWidth: 1, borderColor: 'rgba(99, 102, 241, 0.3)' },
    leaderRank: { fontSize: 18, width: 40 },
    leaderName: { flex: 1, color: '#d1d5db', fontSize: 15, fontWeight: '600' },
    leaderNameMe: { color: '#a5b4fc' },
    leaderXP: { color: '#fbbf24', fontSize: 14, fontWeight: '700' },
});
