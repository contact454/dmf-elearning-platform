/**
 * Profile Tab — User info, settings, logout
 */
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SETTINGS_ITEMS = [
    { icon: '🌍', label: 'Sprache / Ngôn ngữ', value: 'Deutsch' },
    { icon: '🔔', label: 'Benachrichtigungen', value: 'An' },
    { icon: '🌙', label: 'Dunkler Modus', value: 'An' },
    { icon: '🎯', label: 'Tagesziel', value: '10 Wörter' },
    { icon: '🔒', label: 'Datenschutz', value: '' },
    { icon: '❓', label: 'Hilfe & FAQ', value: '' },
];

export default function ProfileScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>👤 Profil</Text>

                {/* User Card */}
                <View style={styles.userCard}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>PH</Text>
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>Phuc H.</Text>
                        <Text style={styles.userEmail}>phuc@example.com</Text>
                        <View style={styles.userBadges}>
                            <View style={styles.badge}><Text style={styles.badgeText}>A2</Text></View>
                            <View style={[styles.badge, { backgroundColor: 'rgba(251, 191, 36, 0.15)' }]}>
                                <Text style={[styles.badgeText, { color: '#fbbf24' }]}>🔥 12</Text>
                            </View>
                            <View style={[styles.badge, { backgroundColor: 'rgba(74, 222, 128, 0.15)' }]}>
                                <Text style={[styles.badgeText, { color: '#4ade80' }]}>2,450 XP</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Stats */}
                <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>156</Text>
                        <Text style={styles.statLabel}>Wörter gelernt</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>23</Text>
                        <Text style={styles.statLabel}>Texte gelesen</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>48</Text>
                        <Text style={styles.statLabel}>Tage aktiv</Text>
                    </View>
                </View>

                {/* Settings */}
                <Text style={styles.sectionTitle}>⚙️ Einstellungen</Text>
                <View style={styles.settingsList}>
                    {SETTINGS_ITEMS.map((item, i) => (
                        <TouchableOpacity key={i} style={styles.settingRow}>
                            <Text style={styles.settingIcon}>{item.icon}</Text>
                            <Text style={styles.settingLabel}>{item.label}</Text>
                            <Text style={styles.settingValue}>{item.value}</Text>
                            <Text style={styles.settingArrow}>›</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Logout */}
                <TouchableOpacity
                    style={styles.logoutBtn}
                    onPress={() => Alert.alert('Abmelden?', 'Möchten Sie sich wirklich abmelden?')}
                >
                    <Text style={styles.logoutText}>🚪 Abmelden</Text>
                </TouchableOpacity>

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f0d1a' },
    title: { fontSize: 24, color: '#f3f4f6', fontWeight: '800', paddingHorizontal: 20, paddingTop: 16 },
    userCard: {
        flexDirection: 'row', alignItems: 'center', gap: 16,
        margin: 20, padding: 20, borderRadius: 20,
        backgroundColor: '#1c1a2e', borderWidth: 1, borderColor: '#2d2b42',
    },
    avatar: {
        width: 64, height: 64, borderRadius: 32,
        backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center',
    },
    avatarText: { color: '#fff', fontSize: 24, fontWeight: '800' },
    userInfo: { flex: 1 },
    userName: { fontSize: 20, color: '#f3f4f6', fontWeight: '800' },
    userEmail: { fontSize: 13, color: '#6b7280', marginTop: 2 },
    userBadges: { flexDirection: 'row', gap: 8, marginTop: 8 },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: 'rgba(99, 102, 241, 0.15)' },
    badgeText: { fontSize: 12, color: '#818cf8', fontWeight: '700' },
    statsGrid: {
        flexDirection: 'row', gap: 8, marginHorizontal: 20,
    },
    statBox: {
        flex: 1, padding: 16, borderRadius: 16,
        backgroundColor: '#1c1a2e', borderWidth: 1, borderColor: '#2d2b42', alignItems: 'center',
    },
    statValue: { color: '#f3f4f6', fontSize: 24, fontWeight: '800' },
    statLabel: { color: '#6b7280', fontSize: 11, marginTop: 4, textAlign: 'center' },
    sectionTitle: { fontSize: 18, color: '#f3f4f6', fontWeight: '700', marginHorizontal: 20, marginTop: 24, marginBottom: 12 },
    settingsList: { marginHorizontal: 20 },
    settingRow: {
        flexDirection: 'row', alignItems: 'center', paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: '#1c1a2e',
    },
    settingIcon: { fontSize: 20, width: 36 },
    settingLabel: { flex: 1, color: '#d1d5db', fontSize: 15 },
    settingValue: { color: '#6b7280', fontSize: 14, marginRight: 8 },
    settingArrow: { color: '#4b5563', fontSize: 20 },
    logoutBtn: {
        marginHorizontal: 20, marginTop: 24, paddingVertical: 16,
        borderRadius: 16, backgroundColor: 'rgba(248, 113, 113, 0.1)',
        borderWidth: 1, borderColor: 'rgba(248, 113, 113, 0.3)', alignItems: 'center',
    },
    logoutText: { color: '#f87171', fontSize: 16, fontWeight: '700' },
});
