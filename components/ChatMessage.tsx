import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { format } from 'date-fns';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { getThemeColors, spacing, typography } from '../styles/theme';

const { width } = Dimensions.get('window');
const MESSAGE_MAX_WIDTH = width * 0.75;

interface ChatMessageProps {
  message: {
    id: string;
    text: string;
    image?: string;
    timestamp: number;
    read: boolean;
  };
  isOwn: boolean;
  showAvatar?: boolean;
  avatar?: string;
  onImagePress?: () => void;
}

export default function ChatMessage({
  message,
  isOwn,
  showAvatar,
  avatar,
  onImagePress,
}: ChatMessageProps) {
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: withSpring(1),
    transform: [
      {
        translateY: withSpring(0),
      },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        isOwn ? styles.ownContainer : styles.otherContainer,
        containerStyle,
      ]}
    >
      {!isOwn && showAvatar && (
        <Image
          source={{ uri: avatar }}
          style={styles.avatar}
        />
      )}

      <View
        style={[
          styles.bubble,
          isOwn
            ? [styles.ownBubble, { backgroundColor: colors.primary }]
            : [styles.otherBubble, { backgroundColor: colors.card }],
        ]}
      >
        {message.image && (
          <TouchableOpacity onPress={onImagePress}>
            <Image
              source={{ uri: message.image }}
              style={styles.image}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}

        {message.text && (
          <Text
            style={[
              styles.text,
              { color: isOwn ? '#fff' : colors.text },
            ]}
          >
            {message.text}
          </Text>
        )}

        <Text
          style={[
            styles.timestamp,
            { color: isOwn ? 'rgba(255,255,255,0.7)' : colors.textSecondary },
          ]}
        >
          {format(message.timestamp, 'HH:mm')}
          {isOwn && message.read && (
            <Text style={styles.readIndicator}> ✓✓</Text>
          )}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  ownContainer: {
    justifyContent: 'flex-end',
  },
  otherContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: spacing.sm,
  },
  bubble: {
    maxWidth: MESSAGE_MAX_WIDTH,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  ownBubble: {
    borderTopRightRadius: 4,
  },
  otherBubble: {
    borderTopLeftRadius: 4,
  },
  image: {
    width: MESSAGE_MAX_WIDTH - spacing.md * 2,
    height: MESSAGE_MAX_WIDTH - spacing.md * 2,
    borderRadius: 12,
    marginBottom: spacing.xs,
  },
  text: {
    ...typography.body,
  },
  timestamp: {
    ...typography.caption,
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: spacing.xs,
  },
  readIndicator: {
    marginLeft: spacing.xs,
  },
});
