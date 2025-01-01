import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as ImagePicker from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useTheme } from '../../context/ThemeContext';
import { getThemeColors, spacing } from '../../styles/theme';
import ChatMessage from '../../components/ChatMessage';

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [otherUser, setOtherUser] = useState<any>(null);
  const { user } = useAuth();
  const { messages, sendMessage, markAsRead } = useChat();
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const loadOtherUser = async () => {
      const chat = await firestore().collection('chats').doc(id as string).get();
      const otherUserId = chat.data()?.participants.find((p: string) => p !== user?.uid);
      
      if (otherUserId) {
        const userDoc = await firestore().collection('users').doc(otherUserId).get();
        setOtherUser({
          id: otherUserId,
          ...userDoc.data(),
        });
      }
    };

    loadOtherUser();
    markAsRead(id as string);
  }, [id, user]);

  const handleSend = async () => {
    if (!message.trim() && !uploading) return;

    try {
      await sendMessage(id as string, message);
      setMessage('');
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (result.assets && result.assets[0].uri) {
      setUploading(true);
      try {
        const filename = result.assets[0].uri.substring(
          result.assets[0].uri.lastIndexOf('/') + 1
        );
        const ref = storage().ref(`chat/${id}/${filename}`);
        await ref.putFile(result.assets[0].uri);
        const url = await ref.getDownloadURL();

        await sendMessage(id as string, '', url);
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      } catch (error) {
        console.error('Error uploading image:', error);
      } finally {
        setUploading(false);
      }
    }
  };

  const chatMessages = messages[id as string] || [];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <FlatList
        ref={flatListRef}
        data={chatMessages}
        inverted
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <ChatMessage
            message={item}
            isOwn={item.senderId === user?.uid}
            showAvatar={
              index === chatMessages.length - 1 ||
              chatMessages[index + 1]?.senderId !== item.senderId
            }
            avatar={otherUser?.photoURL}
          />
        )}
        contentContainerStyle={styles.messageList}
      />

      <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={styles.attachButton}
          onPress={handleImagePick}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <FontAwesome name="image" size={24} color={colors.primary} />
          )}
        </TouchableOpacity>

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
              opacity: message.trim() || uploading ? 1 : 0.5,
            },
          ]}
          onPress={handleSend}
          disabled={!message.trim() && !uploading}
        >
          <FontAwesome name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messageList: {
    padding: spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  attachButton: {
    padding: spacing.sm,
  },
  input: {
    flex: 1,
    marginHorizontal: spacing.md,
    maxHeight: 100,
    padding: spacing.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
