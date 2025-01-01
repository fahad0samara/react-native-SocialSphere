import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Text,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';
import firestore from '@react-native-firebase/firestore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useTheme } from '../../context/ThemeContext';
import { getThemeColors, spacing, typography } from '../../styles/theme';
import FloatingActionButton from '../../components/FloatingActionButton';

interface ChatItemProps {
  chat: {
    id: string;
    participants: string[];
    lastMessage?: {
      text: string;
      timestamp: number;
    };
    unreadCount: { [key: string]: number };
  };
  otherUser: {
    id: string;
    name: string;
    avatar: string;
    online?: boolean;
  };
}

function ChatItem({ chat, otherUser }: ChatItemProps) {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const colors = getThemeColors(isDark);

  const unreadCount = user ? chat.unreadCount[user.uid] || 0 : 0;

  return (
    <TouchableOpacity
      style={[styles.chatItem, { backgroundColor: colors.card }]}
      onPress={() => router.push(`/chat/${chat.id}`)}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: otherUser.avatar }} style={styles.avatar} />
        {otherUser.online && (
          <View style={[styles.onlineIndicator, { backgroundColor: '#4CAF50' }]} />
        )}
      </View>

      <View style={styles.chatInfo}>
        <Text style={[styles.userName, { color: colors.text }]}>
          {otherUser.name}
        </Text>
        {chat.lastMessage && (
          <>
            <Text
              style={[
                styles.lastMessage,
                { color: colors.textSecondary },
                unreadCount > 0 && styles.unreadMessage,
              ]}
              numberOfLines={1}
            >
              {chat.lastMessage.text}
            </Text>
            <Text
              style={[styles.timestamp, { color: colors.textSecondary }]}
            >
              {formatDistanceToNow(chat.lastMessage.timestamp, { addSuffix: true })}
            </Text>
          </>
        )}
      </View>

      {unreadCount > 0 && (
        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
          <Text style={styles.badgeText}>{unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function ChatsScreen() {
  const { chats, loading } = useChat();
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);
  const [users, setUsers] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    const loadUsers = async () => {
      const userIds = new Set(chats.flatMap(chat => chat.participants));
      const usersData: { [key: string]: any } = {};

      await Promise.all(
        Array.from(userIds).map(async (userId) => {
          const userDoc = await firestore()
            .collection('users')
            .doc(userId)
            .get();
          usersData[userId] = {
            id: userId,
            ...userDoc.data(),
          };
        })
      );

      setUsers(usersData);
    };

    loadUsers();
  }, [chats]);

  const getOtherUser = (chat: any) => {
    const otherUserId = chat.participants.find(
      (id: string) => id !== user?.uid
    );
    return users[otherUserId] || {
      name: 'Unknown User',
      avatar: 'https://placekitten.com/200/200',
    };
  };

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={chats.sort((a, b) => b.updatedAt - a.updatedAt)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatItem chat={item} otherUser={getOtherUser(item)} />
        )}
        contentContainerStyle={styles.list}
      />

      <FloatingActionButton
        actions={[
          {
            icon: 'plus',
            onPress: () => router.push('/new-chat'),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: spacing.md,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  chatInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  userName: {
    ...typography.subtitle,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  lastMessage: {
    ...typography.body,
    fontSize: 14,
  },
  unreadMessage: {
    fontWeight: '600',
  },
  timestamp: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
