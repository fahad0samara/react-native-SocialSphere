import React, { createContext, useContext, useState, useEffect } from 'react';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from './AuthContext';

interface Message {
  id: string;
  senderId: string;
  text: string;
  image?: string;
  timestamp: number;
  read: boolean;
}

interface Chat {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: number;
}

interface ChatContextType {
  chats: Chat[];
  messages: { [chatId: string]: Message[] };
  loading: boolean;
  sendMessage: (chatId: string, text: string, image?: string) => Promise<void>;
  createChat: (userId: string) => Promise<string>;
  markAsRead: (chatId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<{ [chatId: string]: Message[] }>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setChats([]);
      setMessages({});
      setLoading(false);
      return;
    }

    const unsubscribe = firestore()
      .collection('chats')
      .where('participants', 'array-contains', user.uid)
      .onSnapshot(async (snapshot) => {
        const chatsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Chat[];

        setChats(chatsData);

        // Load messages for each chat
        const messagesData: { [chatId: string]: Message[] } = {};
        await Promise.all(
          chatsData.map(async (chat) => {
            const messagesSnapshot = await firestore()
              .collection('chats')
              .doc(chat.id)
              .collection('messages')
              .orderBy('timestamp', 'desc')
              .limit(50)
              .get();

            messagesData[chat.id] = messagesSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            })) as Message[];
          })
        );

        setMessages(messagesData);
        setLoading(false);
      });

    return () => unsubscribe();
  }, [user]);

  const sendMessage = async (chatId: string, text: string, image?: string) => {
    if (!user) return;

    const messageData = {
      senderId: user.uid,
      text,
      image,
      timestamp: Date.now(),
      read: false,
    };

    const chatRef = firestore().collection('chats').doc(chatId);
    const batch = firestore().batch();

    // Add message
    const messageRef = chatRef.collection('messages').doc();
    batch.set(messageRef, messageData);

    // Update chat
    batch.update(chatRef, {
      lastMessage: messageData,
      updatedAt: Date.now(),
      [`unreadCount.${user.uid}`]: 0,
    });

    await batch.commit();
  };

  const createChat = async (userId: string): Promise<string> => {
    if (!user) throw new Error('Not authenticated');

    const existingChat = chats.find(chat =>
      chat.participants.includes(userId) && chat.participants.length === 2
    );

    if (existingChat) return existingChat.id;

    const chatRef = firestore().collection('chats').doc();
    await chatRef.set({
      participants: [user.uid, userId],
      unreadCount: {
        [user.uid]: 0,
        [userId]: 0,
      },
      updatedAt: Date.now(),
    });

    return chatRef.id;
  };

  const markAsRead = async (chatId: string) => {
    if (!user) return;

    const chatRef = firestore().collection('chats').doc(chatId);
    await chatRef.update({
      [`unreadCount.${user.uid}`]: 0,
    });
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        messages,
        loading,
        sendMessage,
        createChat,
        markAsRead,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
