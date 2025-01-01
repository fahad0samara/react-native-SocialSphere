import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Text,
  Dimensions,
  ScrollView,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '../context/ThemeContext';
import { getThemeColors, spacing, typography } from '../styles/theme';

const { width } = Dimensions.get('window');
const REACTION_TYPES = ['❤️', '😂', '😮', '😢', '😡', '👏'];
const FILTERS = [
  { name: 'Normal', intensity: 0 },
  { name: 'Warm', colors: ['#ff9a9e', '#fad0c4'] },
  { name: 'Cool', colors: ['#a1c4fd', '#c2e9fb'] },
  { name: 'Vintage', colors: ['#f6d365', '#fda085'] },
  { name: 'B&W', grayscale: true },
];

interface StoryProps {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  media?: string;
  hasUnseenStories?: boolean;
  onPress?: () => void;
  onReaction?: (reaction: string) => void;
}

export default function Story({
  id,
  user,
  media,
  hasUnseenStories,
  onPress,
  onReaction,
}: StoryProps) {
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const [showReactions, setShowReactions] = useState(false);
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(hasUnseenStories ? 1 : 0.9),
      },
    ],
    borderColor: hasUnseenStories ? colors.primary : 'transparent',
  }));

  const handleLongPress = () => {
    setShowReactions(true);
  };

  const handleReaction = (reaction: string) => {
    setShowReactions(false);
    onReaction?.(reaction);
  };

  const filterStyle = useAnimatedStyle(() => {
    if (selectedFilter.name === 'Normal') {
      return {};
    }

    if (selectedFilter.grayscale) {
      return {
        filter: 'grayscale(1)',
      };
    }

    return {
      backgroundColor: selectedFilter.colors?.[0],
      opacity: 0.8,
    };
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={handleLongPress}
      style={styles.container}
    >
      <Animated.View style={[styles.ring, ringStyle]}>
        <View style={styles.imageContainer}>
          <Animated.Image
            source={{ uri: media || user.avatar }}
            style={[styles.image, filterStyle]}
          />
          {selectedFilter.name !== 'Normal' && selectedFilter.colors && (
            <LinearGradient
              colors={selectedFilter.colors}
              style={styles.filterOverlay}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          )}
        </View>
      </Animated.View>

      <Text
        style={[
          styles.name,
          { color: colors.text },
          hasUnseenStories && styles.unseenName,
        ]}
        numberOfLines={1}
      >
        {user.name}
      </Text>

      {showReactions && (
        <BlurView intensity={20} style={styles.reactionsContainer}>
          <View style={styles.reactions}>
            {REACTION_TYPES.map((reaction) => (
              <TouchableOpacity
                key={reaction}
                style={styles.reactionButton}
                onPress={() => handleReaction(reaction)}
              >
                <Text style={styles.reactionEmoji}>{reaction}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </BlurView>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
      >
        {FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.name}
            style={[
              styles.filterButton,
              selectedFilter.name === filter.name && {
                borderColor: colors.primary,
              },
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text
              style={[
                styles.filterName,
                { color: colors.text },
                selectedFilter.name === filter.name && {
                  color: colors.primary,
                },
              ]}
            >
              {filter.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: spacing.sm,
  },
  ring: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    padding: 2,
    marginBottom: spacing.xs,
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 36,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  filterOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.3,
  },
  name: {
    ...typography.caption,
    textAlign: 'center',
    width: 76,
  },
  unseenName: {
    fontWeight: '600',
  },
  reactionsContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -120 }, { translateY: -25 }],
    width: 240,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  reactions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: '100%',
    paddingHorizontal: spacing.sm,
  },
  reactionButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reactionEmoji: {
    fontSize: 16,
  },
  filtersContainer: {
    position: 'absolute',
    bottom: -40,
    left: 0,
    right: 0,
    height: 40,
  },
  filterButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    marginHorizontal: spacing.xs,
  },
  filterName: {
    ...typography.caption,
    fontSize: 10,
  },
});
