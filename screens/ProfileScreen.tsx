import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Image,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import firestore from '@react-native-firebase/firestore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getThemeColors, spacing, typography } from '../styles/theme';
import AnimatedProfileHeader from '../components/AnimatedProfileHeader';
import Post from '../components/Post';
import Story from '../components/Story';

interface ProfileStats {
  posts: number;
  followers: number;
  following: number;
}

export default function ProfileScreen({ userId }: { userId?: string }) {
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [stats, setStats] = useState<ProfileStats>({
    posts: 0,
    followers: 0,
    following: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'posts' | 'tagged'>('posts');
  const { user: currentUser } = useAuth();
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);

  const isOwnProfile = !userId || userId === currentUser?.uid;

  const loadData = async () => {
    try {
      // Load user data
      const userDoc = await firestore()
        .collection('users')
        .doc(userId || currentUser?.uid)
        .get();

      setUser({
        id: userDoc.id,
        ...userDoc.data(),
      });

      // Load user stats
      const statsDoc = await firestore()
        .collection('userStats')
        .doc(userId || currentUser?.uid)
        .get();

      setStats(statsDoc.data() as ProfileStats);

      // Load user posts
      const postsSnapshot = await firestore()
        .collection('posts')
        .where('userId', '==', userId || currentUser?.uid)
        .orderBy('timestamp', 'desc')
        .get();

      setPosts(postsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })));

      // Load user stories
      const storiesSnapshot = await firestore()
        .collection('stories')
        .where('userId', '==', userId || currentUser?.uid)
        .where('timestamp', '>', Date.now() - 24 * 60 * 60 * 1000)
        .get();

      setStories(storiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })));
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleFollow = async () => {
    if (!currentUser || !userId) return;

    try {
      const batch = firestore().batch();
      const followingRef = firestore()
        .collection('following')
        .doc(`${currentUser.uid}_${userId}`);
      const followerRef = firestore()
        .collection('followers')
        .doc(`${userId}_${currentUser.uid}`);

      batch.set(followingRef, {
        userId: userId,
        timestamp: Date.now(),
      });

      batch.set(followerRef, {
        userId: currentUser.uid,
        timestamp: Date.now(),
      });

      await batch.commit();
      loadData(); // Refresh stats
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  if (!user) return null;

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
      <AnimatedProfileHeader
        user={user}
        stats={stats}
        isOwnProfile={isOwnProfile}
      />

      {/* Bio Section */}
      <View style={styles.bioSection}>
        <Text style={[styles.displayName, { color: colors.text }]}>
          {user.displayName}
        </Text>
        {user.bio && (
          <Text style={[styles.bio, { color: colors.textSecondary }]}>
            {user.bio}
          </Text>
        )}
        {user.website && (
          <TouchableOpacity>
            <Text style={[styles.website, { color: colors.primary }]}>
              {user.website}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {isOwnProfile ? (
          <>
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: colors.card }]}
              onPress={() => router.push('/settings/edit-profile')}
            >
              <Text style={[styles.buttonText, { color: colors.text }]}>
                Edit Profile
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.shareButton, { backgroundColor: colors.card }]}
              onPress={() => {}}
            >
              <FontAwesome name="share" size={20} color={colors.text} />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.followButton, { backgroundColor: colors.primary }]}
              onPress={handleFollow}
            >
              <Text style={styles.followButtonText}>Follow</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.messageButton, { backgroundColor: colors.card }]}
              onPress={() => router.push(`/chat/${user.id}`)}
            >
              <Text style={[styles.buttonText, { color: colors.text }]}>
                Message
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Stories */}
      {stories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.storiesContainer}
        >
          {stories.map((story) => (
            <Story
              key={story.id}
              id={story.id}
              user={user}
              hasUnseenStories={true}
              onPress={() => {}}
            />
          ))}
        </ScrollView>
      )}

      {/* Content Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'posts' && { borderBottomColor: colors.primary },
          ]}
          onPress={() => setSelectedTab('posts')}
        >
          <FontAwesome
            name="th"
            size={24}
            color={selectedTab === 'posts' ? colors.primary : colors.textSecondary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'tagged' && { borderBottomColor: colors.primary },
          ]}
          onPress={() => setSelectedTab('tagged')}
        >
          <FontAwesome
            name="user"
            size={24}
            color={selectedTab === 'tagged' ? colors.primary : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Posts Grid */}
      <View style={styles.postsGrid}>
        {selectedTab === 'posts' &&
          posts.map((post) => (
            <Post
              key={post.id}
              id={post.id}
              user={user}
              content={post.content}
              image={post.image}
              likes={post.likes}
              comments={post.comments}
              timestamp={post.timestamp}
              liked={post.likes?.includes(currentUser?.uid)}
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
  bioSection: {
    padding: spacing.lg,
  },
  displayName: {
    ...typography.subtitle,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  bio: {
    ...typography.body,
    marginBottom: spacing.sm,
  },
  website: {
    ...typography.body,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  editButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 6,
    marginRight: spacing.sm,
    alignItems: 'center',
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 6,
    marginRight: spacing.sm,
    alignItems: 'center',
  },
  messageButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    ...typography.body,
    fontWeight: '600',
  },
  followButtonText: {
    color: '#fff',
    ...typography.body,
    fontWeight: '600',
  },
  storiesContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  tabs: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
