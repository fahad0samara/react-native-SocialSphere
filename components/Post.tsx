import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { formatDistanceToNow } from 'date-fns';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withSequence,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { getThemeColors, spacing, typography } from '../styles/theme';

const { width } = Dimensions.get('window');

interface PostProps {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  image?: string;
  likes: number;
  comments: number;
  timestamp: number;
  liked: boolean;
  onLike: () => void;
}

const AnimatedIcon = Animated.createAnimatedComponent(FontAwesome);

export default function Post({
  id,
  user,
  content,
  image,
  likes,
  comments,
  timestamp,
  liked,
  onLike,
}: PostProps) {
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);
  const scale = useSharedValue(1);

  const handleLike = () => {
    scale.value = withSequence(
      withSpring(1.2),
      withSpring(1)
    );
    onLike();
  };

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: colors.card },
      ]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.userInfo}
          onPress={() => router.push(`/profile/${user.id}`)}
        >
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <View>
            <Text style={[styles.userName, { color: colors.text }]}>
              {user.name}
            </Text>
            <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
              {formatDistanceToNow(timestamp)} ago
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity>
          <FontAwesome
            name="ellipsis-h"
            size={18}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <Text style={[styles.content, { color: colors.text }]}>{content}</Text>

      {image && (
        <Image
          source={{ uri: image }}
          style={styles.image}
          resizeMode="cover"
        />
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <AnimatedIcon
            name={liked ? 'heart' : 'heart-o'}
            size={24}
            color={liked ? '#e74c3c' : colors.textSecondary}
            style={iconStyle}
          />
          <Text style={[styles.actionText, { color: colors.textSecondary }]}>
            {likes}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/post/${id}/comments`)}
        >
          <FontAwesome
            name="comment-o"
            size={24}
            color={colors.textSecondary}
          />
          <Text style={[styles.actionText, { color: colors.textSecondary }]}>
            {comments}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <FontAwesome
            name="share"
            size={24}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.sm,
  },
  userName: {
    ...typography.subtitle,
    fontWeight: '600',
  },
  timestamp: {
    ...typography.caption,
  },
  content: {
    ...typography.body,
    marginBottom: spacing.md,
  },
  image: {
    width: width - (spacing.md * 4),
    height: width - (spacing.md * 4),
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    paddingTop: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionText: {
    ...typography.caption,
    fontWeight: '500',
  },
});
