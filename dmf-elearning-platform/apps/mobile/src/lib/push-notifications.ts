/**
 * Push Notifications — Expo Notifications + FCM integration
 * Registers device token with Cloud Run backend for nudges
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import mobileAPI from '../services/cloud-ai-api';

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

/**
 * Register for push notifications and send token to backend
 */
export async function registerForPushNotifications(userId: string): Promise<string | null> {
    if (!Device.isDevice) {
        console.warn('Push notifications require a physical device');
        return null;
    }

    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request if not granted
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.warn('Push notification permission not granted');
        return null;
    }

    // Get Expo push token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
    });
    const token = tokenData.data;

    // Android notification channel
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('learning', {
            name: 'Learning Reminders',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#4f46e5',
        });

        await Notifications.setNotificationChannelAsync('achievements', {
            name: 'Achievements',
            importance: Notifications.AndroidImportance.DEFAULT,
        });
    }

    // Register token with backend
    try {
        await mobileAPI.notifications.register(token, Platform.OS);
        console.log('Push token registered:', token.slice(0, 20) + '...');
    } catch (err) {
        console.error('Failed to register push token:', err);
    }

    return token;
}

/**
 * Add notification received listener
 */
export function onNotificationReceived(
    callback: (notification: Notifications.Notification) => void
) {
    return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Add notification response listener (user tapped)
 */
export function onNotificationTapped(
    callback: (response: Notifications.NotificationResponse) => void
) {
    return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Schedule a local notification (for offline reminders)
 */
export async function scheduleLocalReminder(
    title: string,
    body: string,
    triggerHour: number,
    triggerMinute: number
): Promise<string> {
    return Notifications.scheduleNotificationAsync({
        content: { title, body, sound: true },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: triggerHour,
            minute: triggerMinute,
        },
    });
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
}
