import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getThemeColors, spacing, typography } from '../styles/theme';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  likes: string[];
  replies: Comment[];
  timestamp: number;
}

interface CommentsProps {
  postId: string;
}

export default function Comments({ postId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const { user } = useAuth();
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('posts')
      .doc(postId)
      .collection('comments')
      .orderBy('timestamp', 'desc')
      .onSnapshot(async (snapshot) => {
        const commentsData = await Promise.all(
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
              likes: data.likes || [],
              replies: data.replies || [],
              timestamp: data.timestamp,
            };
          })
        );

        setComments(commentsData);
      });

    return () => unsubscribe();
  }, [postId]);

  const handleComment = async () => {
    if (!user || !newComment.trim()) return;

    try {
      if (replyTo) {
        await firestore()
          .collection('posts')
          .doc(postId)
          .collection('comments')
          .doc(replyTo.id)
          .update({
            replies: firestore.FieldValue.arrayUnion({
              userId: user.uid,
              content: newComment,
              timestamp: Date.now(),
            }),
          });
      } else {
        await firestore()
          .collection('posts')
          .doc(postId)
          .collection('comments')
          .add({
            userId: user.uid,
            content: newComment,
            likes: [],
            replies: [],
            timestamp: Date.now(),
          });
      }

      setNewComment('');
      setReplyTo(null);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleLike = async (commentId: string) => {
    if (!user) return;

    const commentRef = firestore()
      .collection('posts')
      .doc(postId)
      .collection('comments')
      .doc(commentId);

    const comment = await commentRef.get();
    const likes = comment.data()?.likes || [];

    if (likes.includes(user.uid)) {
      await commentRef.update({
        likes: likes.filter((id: string) => id !== user.uid),
      });
    } else {
      await commentRef.update({
        likes: [...likes, user.uid],
      });
    }
  };

  const renderComment = ({ item }: { item: Comment }) => {
    const scale = useAnimatedStyle(() => ({
      transform: [{ scale: withSpring(1) }],
    }));

    return (
      <Animated.View
        style={[
          styles.commentContainer,
          { backgroundColor: colors.card },
          scale,
        ]}
      >
        <Image source={{ uri: item.userAvatar }} style={styles.avatar} />
        <View style={styles.commentContent}>
          <Text style={[styles.userName, { color: colors.text }]}>
            {item.userName}
          </Text>
          <Text style={[styles.commentText, { color: colors.text }]}>
            {item.content}
          </Text>
          <View style={styles.commentActions}>
            <Text
              style={[styles.timestamp, { color: colors.textSecondary }]}
            >
              {formatDistanceToNow(item.timestamp)} ago
            </Text>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleLike(item.id)}
            >
              <FontAwesome
                name={item.likes.includes(user?.uid || '') ? 'heart' : 'heart-o'}
                size={16}
                color={
                  item.likes.includes(user?.uid || '')
                    ? '#e74c3c'
                    : colors.textSecondary
                }
              />
              <Text
                style={[styles.actionText, { color: colors.textSecondary }]}
              >
                {item.likes.length}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setReplyTo(item)}
            >
              <FontAwesome
                name="reply"
                size={16}
                color={colors.textSecondary}
              />
              <Text
                style={[styles.actionText, { color: colors.textSecondary }]}
              >
                Reply
              </Text>
            </TouchableOpacity>
          </View>

          {item.replies.map((reply, index) => (
            <View key={index} style={styles.replyContainer}>
              <Image
                source={{ uri: reply.userAvatar }}
                style={styles.replyAvatar}
              />
              <View>
                <Text style={[styles.userName, { color: colors.text }]}>
                  {reply.userName}
                </Text>
                <Text style={[styles.commentText, { color: colors.text }]}>
                  {reply.content}
                </Text>
                <Text
                  style={[styles.timestamp, { color: colors.textSecondary }]}
                >
                  {formatDistanceToNow(reply.timestamp)} ago
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Animated.View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />

      <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
        {replyTo && (
          <View style={styles.replyingTo}>
            <Text style={[styles.replyingToText, { color: colors.text }]}>
              Replying to {replyTo.userName}
            </Text>
            <TouchableOpacity onPress={() => setReplyTo(null)}>
              <FontAwesome name="times" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder={
            replyTo ? 'Write a reply...' : 'Write a comment...'
          }
          placeholderTextColor={colors.textSecondary}
          value={newComment}
          onChangeText={setNewComment}
          multiline
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            { opacity: newComment.trim() ? 1 : 0.5 },
          ]}
          onPress={handleComment}
          disabled={!newComment.trim()}
        >
          <FontAwesome name="send" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: spacing.md,
  },
  commentContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.md,
  },
  commentContent: {
    flex: 1,
  },
  userName: {
    ...typography.subtitle,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  commentText: {
    ...typography.body,
    marginBottom: spacing.xs,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionText: {
    ...typography.caption,
  },
  timestamp: {
    ...typography.caption,
  },
  replyContainer: {
    flexDirection: 'row',
    marginTop: spacing.md,
    paddingLeft: spacing.md,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(0, 0, 0, 0.1)',
  },
  replyAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: spacing.sm,
  },
  inputContainer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  replyingTo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.sm,
  },
  replyingToText: {
    ...typography.caption,
    fontStyle: 'italic',
  },
  input: {
    ...typography.body,
    maxHeight: 100,
  },
  sendButton: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    padding: spacing.sm,
  },
});
