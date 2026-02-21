/**
 * Root Layout — Expo Router
 * Tab navigation: Learn, Vocab, Dashboard, Profile
 */
import React from 'react';
import { Tabs } from 'expo-router';
import { AuthProvider } from '../src/contexts/AuthContext';

export default function RootLayout() {
    return (
        <AuthProvider>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarActiveTintColor: '#6366f1',
                    tabBarInactiveTintColor: '#9ca3af',
                    tabBarStyle: {
                        backgroundColor: '#0f0d1a',
                        borderTopColor: '#1f1d2e',
                        height: 85,
                        paddingBottom: 20,
                        paddingTop: 8,
                    },
                    tabBarLabelStyle: {
                        fontSize: 11,
                        fontWeight: '600',
                    },
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: 'Lernen',
                        tabBarIcon: ({ color, size }) => (
                            <TabIcon name="📚" size={size} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="vocabulary"
                    options={{
                        title: 'Wortschatz',
                        tabBarIcon: ({ color, size }) => (
                            <TabIcon name="🔤" size={size} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="dashboard"
                    options={{
                        title: 'Dashboard',
                        tabBarIcon: ({ color, size }) => (
                            <TabIcon name="📊" size={size} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: 'Profil',
                        tabBarIcon: ({ color, size }) => (
                            <TabIcon name="👤" size={size} />
                        ),
                    }}
                />
            </Tabs>
        </AuthProvider>
    );
}

function TabIcon({ name, size }: { name: string; size: number }) {
    return (
        <React.Fragment>
            <span style={{ fontSize: size }}>{name}</span>
        </React.Fragment>
    );
}
