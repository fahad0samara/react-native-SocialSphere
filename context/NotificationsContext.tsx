import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from './AuthContext';

interface NotificationsContextType {
  pushToken: string | null;
  sendPushNotification: (
    userIds: string[],
    title: string,
    body: string,
    data?: any
  ) => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(
  undefined
);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function NotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    registerForPushNotifications();
  }, []);

  useEffect(() => {
    if (user && pushToken) {
      updateUserPushToken();
    }
  }, [user, pushToken]);

  const registerForPushNotifications = async () => {
    if (!Device.isDevice) {
      console.log('Must use physical device for Push Notifications');
      return;
    }

    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      setPushToken(token);
    } catch (error) {
      console.error('Error getting push token:', error);
    }
  };

  const updateUserPushToken = async () => {
    if (!user || !pushToken) return;

    try {
      await firestore().collection('users').doc(user.uid).update({
        pushToken,
      });
    } catch (error) {
      console.error('Error updating push token:', error);
    }
  };

  const sendPushNotification = async (
    userIds: string[],
    title: string,
    body: string,
    data?: any
  ) => {
    try {
      const userTokens = await Promise.all(
        userIds.map(async (userId) => {
          const userDoc = await firestore()
            .collection('users')
            .doc(userId)
            .get();
          return userDoc.data()?.pushToken;
        })
      );

      const validTokens = userTokens.filter(Boolean);

      await Promise.all(
        validTokens.map((token) =>
          fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Accept-encoding': 'gzip, deflate',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: token,
              title,
              body,
              data,
              sound: 'default',
              priority: 'high',
            }),
          })
        )
      );
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  };

  return (
    <NotificationsContext.Provider
      value={{
        pushToken,
        sendPushNotification,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error(
      'useNotifications must be used within a NotificationsProvider'
    );
  }
  return context;
}
