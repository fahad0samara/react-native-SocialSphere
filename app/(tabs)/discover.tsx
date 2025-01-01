import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import firestore from '@react-native-firebase/firestore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '../../context/ThemeContext';
import { getThemeColors, spacing, typography } from '../../styles/theme';
import Post from '../../components/Post';
import Animated, {
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

interface TrendingTopic {
  id: string;
  name: string;
  postsCount: number;
}

interface SuggestedUser {
  id: string;
  displayName: string;
  photoURL: string;
  bio: string;
  followers: number;
}

export default function DiscoverScreen() {
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<any[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);

  const loadData = async () => {
    try {
      // Load trending topics
      const topicsSnapshot = await firestore()
        .collection('topics')
        .orderBy('postsCount', 'desc')
        .limit(10)
        .get();

      setTrendingTopics(
        topicsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as TrendingTopic[]
      );

      // Load trending posts
      const postsSnapshot = await firestore()
        .collection('posts')
        .orderBy('likes', 'desc')
        .limit(10)
        .get();

      const postsData = await Promise.all(
        postsSnapshot.docs.map(async (doc) => {
          const data = doc.data();
          const userDoc = await firestore()
            .collection('users')
            .doc(data.userId)
            .get();
          const userData = userDoc.data();

          return {
            id: doc.id,
            ...data,
            user: {
              id: data.userId,
              name: userData?.displayName || 'Unknown',
              avatar: userData?.photoURL || 'https://placekitten.com/200/200',
            },
          };
        })
      );

      setTrendingPosts(postsData);

      // Load suggested users
      const usersSnapshot = await firestore()
        .collection('users')
        .orderBy('followers', 'desc')
        .limit(10)
        .get();

      setSuggestedUsers(
        usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as SuggestedUser[]
      );
    } catch (error) {
      console.error('Error loading discover data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const topicStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(1) }],
  }));

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
        />
      }
    >
      {/* Trending Topics */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Trending Topics
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {trendingTopics.map((topic) => (
            <Animated.View key={topic.id} style={topicStyle}>
              <TouchableOpacity
                style={[styles.topicCard, { backgroundColor: colors.primary }]}
                onPress={() => router.push(`/topic/${topic.id}`)}
              >
                <Text style={styles.topicName}>#{topic.name}</Text>
                <Text style={styles.topicPosts}>
                  {topic.postsCount} posts
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>
      </View>

      {/* Suggested Users */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Suggested Users
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {suggestedUsers.map((user) => (
            <TouchableOpacity
              key={user.id}
              style={[styles.userCard, { backgroundColor: colors.card }]}
              onPress={() => router.push(`/profile/${user.id}`)}
            >
              <Image source={{ uri: user.photoURL }} style={styles.userAvatar} />
              <Text style={[styles.userName, { color: colors.text }]}>
                {user.displayName}
              </Text>
              <Text
                style={[styles.userBio, { color: colors.textSecondary }]}
                numberOfLines={2}
              >
                {user.bio}
              </Text>
              <Text style={[styles.userFollowers, { color: colors.textSecondary }]}>
                {user.followers} followers
              </Text>
              <TouchableOpacity
                style={[styles.followButton, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.followButtonText}>Follow</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Trending Posts */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Trending Posts
        </Text>
        {trendingPosts.map((post) => (
          <Post
            key={post.id}
            id={post.id}
            user={post.user}
            content={post.content}
            image={post.image}
            likes={post.likes.length}
            comments={post.comments}
            timestamp={post.timestamp}
            liked={post.likes.includes(user?.uid)}
            onLike={() => {}}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginVertical: spacing.md,
  },
  sectionTitle: {
    ...typography.header,
    fontSize: 20,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  topicCard: {
    padding: spacing.md,
    borderRadius: 12,
    marginHorizontal: spacing.sm,
    marginVertical: spacing.xs,
    minWidth: 120,
  },
  topicName: {
    color: '#fff',
    ...typography.subtitle,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  topicPosts: {
    color: 'rgba(255,255,255,0.8)',
    ...typography.caption,
  },
  userCard: {
    padding: spacing.md,
    borderRadius: 12,
    marginHorizontal: spacing.sm,
    width: 200,
    alignItems: 'center',
  },
  userAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: spacing.sm,
  },
  userName: {
    ...typography.subtitle,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  userBio: {
    ...typography.caption,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  userFollowers: {
    ...typography.caption,
    marginBottom: spacing.sm,
  },
  followButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  followButtonText: {
    color: '#fff',
    ...typography.caption,
    fontWeight: '600',
  },
});
