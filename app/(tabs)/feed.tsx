import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getThemeColors, spacing } from '../../styles/theme';
import Post from '../../components/Post';
import FloatingActionButton from '../../components/FloatingActionButton';

interface PostData {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  image?: string;
  likes: string[];
  comments: number;
  timestamp: number;
}

export default function FeedScreen() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);

  const loadPosts = async () => {
    try {
      const snapshot = await firestore()
        .collection('posts')
        .orderBy('timestamp', 'desc')
        .limit(20)
        .get();

      const postsData = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data();
          const userDoc = await firestore()
            .collection('users')
            .doc(data.userId)
            .get();
          const userData = userDoc.data();

          return {
            id: doc.id,
            userId: data.userId,
            userName: userData?.displayName || 'Unknown',
            userAvatar: userData?.photoURL || 'https://placekitten.com/200/200',
            content: data.content,
            image: data.image,
            likes: data.likes || [],
            comments: data.comments || 0,
            timestamp: data.timestamp,
          };
        })
      );

      setPosts(postsData);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadPosts();
  };

  const handleLike = async (postId: string) => {
    if (!user) return;

    const postRef = firestore().collection('posts').doc(postId);
    const post = await postRef.get();
    const likes = post.data()?.likes || [];

    if (likes.includes(user.uid)) {
      await postRef.update({
        likes: likes.filter((id: string) => id !== user.uid),
      });
    } else {
      await postRef.update({
        likes: [...likes, user.uid],
      });
    }

    loadPosts();
  };

  const actions = [
    {
      icon: 'pencil',
      onPress: () => router.push('/create-post'),
    },
    {
      icon: 'camera',
      onPress: () => router.push('/create-story'),
    },
  ];

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
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Post
            id={item.id}
            user={{
              id: item.userId,
              name: item.userName,
              avatar: item.userAvatar,
            }}
            content={item.content}
            image={item.image}
            likes={item.likes.length}
            comments={item.comments}
            timestamp={item.timestamp}
            liked={user ? item.likes.includes(user.uid) : false}
            onLike={() => handleLike(item.id)}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      />
      <FloatingActionButton actions={actions} />
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
});
