import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  Text,
  Modal,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '../context/ThemeContext';
import { getThemeColors, spacing, typography } from '../styles/theme';

const { width, height } = Dimensions.get('window');
const STORY_DURATION = 5000;

interface Story {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  media: string;
  timestamp: number;
}

interface StoriesViewerProps {
  stories: Story[];
  visible: boolean;
  onClose: () => void;
  onReply: (storyId: string, message: string) => void;
}

export default function StoriesViewer({
  stories,
  visible,
  onClose,
  onReply,
}: StoriesViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);
  
  const translateX = useSharedValue(0);
  const progress = useSharedValue(0);
  const timer = useRef<NodeJS.Timeout>();

  const startTimer = () => {
    progress.value = 0;
    timer.current = setInterval(() => {
      progress.value = withTiming(1, { duration: STORY_DURATION }, (finished) => {
        if (finished) {
          runOnJS(goToNextStory)();
        }
      });
    }, STORY_DURATION);
  };

  const resetTimer = () => {
    if (timer.current) {
      clearInterval(timer.current);
    }
    progress.value = 0;
  };

  const goToNextStory = () => {
    resetTimer();
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      startTimer();
    } else {
      onClose();
    }
  };

  const goToPrevStory = () => {
    resetTimer();
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      startTimer();
    }
  };

  const tap = Gesture.Tap()
    .onStart(({ x }) => {
      if (x < width / 2) {
        goToPrevStory();
      } else {
        goToNextStory();
      }
    });

  const longPress = Gesture.LongPress()
    .onStart(() => {
      runOnJS(setPaused)(true);
      resetTimer();
    })
    .onEnd(() => {
      runOnJS(setPaused)(false);
      runOnJS(startTimer)();
    });

  const composed = Gesture.Exclusive(longPress, tap);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const handleReply = () => {
    if (replyText.trim()) {
      onReply(stories[currentIndex].id, replyText);
      setReplyText('');
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <SafeAreaView style={[styles.container, { backgroundColor: '#000' }]}>
        <View style={styles.header}>
          <View style={styles.progressContainer}>
            {stories.map((_, index) => (
              <View
                key={index}
                style={[styles.progressBar, { backgroundColor: 'rgba(255,255,255,0.3)' }]}
              >
                {index === currentIndex && (
                  <Animated.View
                    style={[styles.progress, progressStyle, { backgroundColor: '#fff' }]}
                  />
                )}
              </View>
            ))}
          </View>

          <View style={styles.userInfo}>
            <Image
              source={{ uri: stories[currentIndex]?.user.avatar }}
              style={styles.avatar}
            />
            <Text style={styles.username}>{stories[currentIndex]?.user.name}</Text>
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <FontAwesome name="times" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <GestureDetector gesture={composed}>
          <Animated.View style={styles.content}>
            <Image
              source={{ uri: stories[currentIndex]?.media }}
              style={styles.media}
              resizeMode="cover"
            />
          </Animated.View>
        </GestureDetector>

        <View style={styles.footer}>
          <View style={styles.replyContainer}>
            <TextInput
              style={styles.replyInput}
              placeholder="Reply to story..."
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={replyText}
              onChangeText={setReplyText}
              onFocus={() => setPaused(true)}
              onBlur={() => setPaused(false)}
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleReply}
              disabled={!replyText.trim()}
            >
              <FontAwesome
                name="send"
                size={20}
                color={replyText.trim() ? '#fff' : 'rgba(255,255,255,0.5)'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 2,
    borderRadius: 1,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: spacing.sm,
  },
  username: {
    color: '#fff',
    ...typography.subtitle,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    padding: spacing.sm,
  },
  content: {
    flex: 1,
  },
  media: {
    width,
    height: height - 200,
  },
  footer: {
    padding: spacing.md,
  },
  replyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: spacing.md,
  },
  replyInput: {
    flex: 1,
    color: '#fff',
    height: 40,
    ...typography.body,
  },
  sendButton: {
    padding: spacing.sm,
  },
});
