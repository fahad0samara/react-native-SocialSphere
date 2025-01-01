import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getThemeColors, spacing, typography } from '../styles/theme';
import Story from '../components/Story';
import StoriesViewer from '../components/StoriesViewer';
import PageTransition from '../components/PageTransition';

interface StoryData {
  id: string;
  userId: string;
  media: string;
  timestamp: number;
  viewers: string[];
  replies: {
    userId: string;
    message: string;
    timestamp: number;
  }[];
}

interface UserWithStories {
  id: string;
  name: string;
  avatar: string;
  stories: StoryData[];
}

export default function StoriesScreen() {
  const [users, setUsers] = useState<UserWithStories[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserWithStories | null>(null);
  const [viewerVisible, setViewerVisible] = useState(false);
  const { user } = useAuth();
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('stories')
      .where('timestamp', '>', Date.now() - 24 * 60 * 60 * 1000)
      .onSnapshot(async (snapshot) => {
        const storiesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as StoryData[];

        const userIds = [...new Set(storiesData.map(story => story.userId))];
        const usersData = await Promise.all(
          userIds.map(async (userId) => {
            const userDoc = await firestore()
              .collection('users')
              .doc(userId)
              .get();
            const userData = userDoc.data();

            return {
              id: userId,
              name: userData?.displayName || 'Unknown',
              avatar: userData?.photoURL || 'https://placekitten.com/200/200',
              stories: storiesData.filter(story => story.userId === userId),
            };
          })
        );

        setUsers(usersData);
      });

    return () => unsubscribe();
  }, []);

  const createStory = async () => {
    const result = await ImagePicker.launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (result.assets && result.assets[0].uri) {
      try {
        const filename = result.assets[0].uri.substring(
          result.assets[0].uri.lastIndexOf('/') + 1
        );
        const ref = storage().ref(`stories/${filename}`);
        await ref.putFile(result.assets[0].uri);
        const url = await ref.getDownloadURL();

        await firestore().collection('stories').add({
          userId: user?.uid,
          media: url,
          timestamp: Date.now(),
          viewers: [],
          replies: [],
        });
      } catch (error) {
        Alert.alert('Error', 'Failed to create story');
      }
    }
  };

  const handleStoryPress = (selectedUser: UserWithStories) => {
    setSelectedUser(selectedUser);
    setViewerVisible(true);
  };

  const handleStoryReply = async (storyId: string, message: string) => {
    if (!user) return;

    try {
      await firestore()
        .collection('stories')
        .doc(storyId)
        .update({
          replies: firestore.FieldValue.arrayUnion({
            userId: user.uid,
            message,
            timestamp: Date.now(),
          }),
        });
    } catch (error) {
      console.error('Error replying to story:', error);
    }
  };

  return (
    <PageTransition>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.createStory, { backgroundColor: colors.card }]}
            onPress={createStory}
          >
            <View
              style={[styles.addButton, { backgroundColor: colors.primary }]}
            >
              <FontAwesome name="plus" size={24} color="#fff" />
            </View>
            <Text style={[styles.createText, { color: colors.text }]}>
              Create Story
            </Text>
          </TouchableOpacity>

          {users.map((user) => (
            <Story
              key={user.id}
              id={user.id}
              user={user}
              hasUnseenStories={
                user.stories.some(
                  (story) => !story.viewers.includes(user?.uid || '')
                )
              }
              onPress={() => handleStoryPress(user)}
            />
          ))}
        </ScrollView>

        {selectedUser && (
          <StoriesViewer
            stories={selectedUser.stories}
            visible={viewerVisible}
            onClose={() => {
              setViewerVisible(false);
              setSelectedUser(null);
            }}
            onReply={handleStoryReply}
          />
        )}
      </View>
    </PageTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  createStory: {
    width: 70,
    height: 90,
    marginLeft: spacing.md,
    marginVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  createText: {
    ...typography.caption,
    textAlign: 'center',
  },
});
