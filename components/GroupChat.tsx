import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '../context/ThemeContext';
import { getThemeColors, spacing, typography } from '../styles/theme';
import ChatMessage from './ChatMessage';

interface GroupChatProps {
  groupId: string;
  onAddMembers?: () => void;
  onLeaveGroup?: () => void;
}

interface GroupMember {
  id: string;
  displayName: string;
  photoURL: string;
  role: 'admin' | 'member';
}

export default function GroupChat({
  groupId,
  onAddMembers,
  onLeaveGroup,
}: GroupChatProps) {
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [showMembers, setShowMembers] = useState(false);
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);

  useEffect(() => {
    const unsubscribeGroup = firestore()
      .collection('groups')
      .doc(groupId)
      .onSnapshot((doc) => {
        setGroup({
          id: doc.id,
          ...doc.data(),
        });
      });

    const unsubscribeMembers = firestore()
      .collection('groups')
      .doc(groupId)
      .collection('members')
      .onSnapshot(async (snapshot) => {
        const membersData = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const userData = await firestore()
              .collection('users')
              .doc(doc.data().userId)
              .get();
            return {
              id: doc.data().userId,
              role: doc.data().role,
              ...userData.data(),
            };
          })
        );
        setMembers(membersData);
      });

    const unsubscribeMessages = firestore()
      .collection('groups')
      .doc(groupId)
      .collection('messages')
      .orderBy('timestamp', 'desc')
      .onSnapshot((snapshot) => {
        setMessages(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );
      });

    return () => {
      unsubscribeGroup();
      unsubscribeMembers();
      unsubscribeMessages();
    };
  }, [groupId]);

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      await firestore()
        .collection('groups')
        .doc(groupId)
        .collection('messages')
        .add({
          text: message,
          senderId: user?.uid,
          timestamp: Date.now(),
          read: [],
        });

      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const toggleMembers = () => {
    setShowMembers(!showMembers);
  };

  if (!group) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Group Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={toggleMembers}>
          <View style={styles.groupInfo}>
            <View style={styles.avatarStack}>
              {members.slice(0, 3).map((member, index) => (
                <Image
                  key={member.id}
                  source={{ uri: member.photoURL }}
                  style={[
                    styles.stackedAvatar,
                    { left: index * 15, zIndex: 3 - index },
                  ]}
                />
              ))}
            </View>
            <View style={styles.groupDetails}>
              <Text style={[styles.groupName, { color: colors.text }]}>
                {group.name}
              </Text>
              <Text style={[styles.memberCount, { color: colors.textSecondary }]}>
                {members.length} members
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={onAddMembers}
          >
            <FontAwesome name="user-plus" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={onLeaveGroup}
          >
            <FontAwesome name="sign-out" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Members List */}
      {showMembers && (
        <View style={[styles.membersList, { backgroundColor: colors.card }]}>
          <ScrollView>
            {members.map((member) => (
              <View key={member.id} style={styles.memberItem}>
                <Image
                  source={{ uri: member.photoURL }}
                  style={styles.memberAvatar}
                />
                <View style={styles.memberInfo}>
                  <Text style={[styles.memberName, { color: colors.text }]}>
                    {member.displayName}
                  </Text>
                  <Text
                    style={[styles.memberRole, { color: colors.textSecondary }]}
                  >
                    {member.role}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Messages */}
      <ScrollView style={styles.messages}>
        {messages.map((message) => {
          const sender = members.find((m) => m.id === message.senderId);
          return (
            <ChatMessage
              key={message.id}
              message={message}
              isOwn={message.senderId === user?.uid}
              showAvatar
              avatar={sender?.photoURL}
            />
          );
        })}
      </ScrollView>

      {/* Input */}
      <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Type a message..."
          placeholderTextColor={colors.textSecondary}
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: colors.primary,
              opacity: message.trim() ? 1 : 0.5,
            },
          ]}
          onPress={handleSend}
          disabled={!message.trim()}
        >
          <FontAwesome name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  groupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarStack: {
    width: 60,
    height: 40,
    position: 'relative',
  },
  stackedAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#fff',
  },
  groupDetails: {
    marginLeft: spacing.md,
  },
  groupName: {
    ...typography.subtitle,
    fontWeight: '600',
  },
  memberCount: {
    ...typography.caption,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
  },
  membersList: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    maxHeight: 300,
    zIndex: 1,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  memberInfo: {
    marginLeft: spacing.md,
  },
  memberName: {
    ...typography.body,
    fontWeight: '500',
  },
  memberRole: {
    ...typography.caption,
  },
  messages: {
    flex: 1,
    padding: spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  input: {
    flex: 1,
    marginRight: spacing.md,
    padding: spacing.sm,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
