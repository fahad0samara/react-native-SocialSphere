import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { getThemeColors, spacing, typography } from '../styles/theme';

const AnimatedImage = Animated.createAnimatedComponent(Image);

interface ProfileHeaderProps {
  name: string;
  bio: string;
  avatarUrl: string;
  onEditPress: () => void;
}

export default function AnimatedProfileHeader({
  name,
  bio,
  avatarUrl,
  onEditPress,
}: ProfileHeaderProps) {
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);

  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const imageStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotateZ: `${rotation.value}deg` },
      ],
    };
  });

  const handleAvatarPress = () => {
    rotation.value = withSequence(
      withSpring(-15),
      withSpring(15),
      withSpring(0)
    );
    scale.value = withSequence(
      withSpring(1.2),
      withSpring(1)
    );
  };

  return (
    <View style={[styles.header, { backgroundColor: colors.primary }]}>
      <TouchableOpacity onPress={handleAvatarPress}>
        <AnimatedImage
          source={{ uri: avatarUrl }}
          style={[styles.avatar, imageStyle]}
        />
      </TouchableOpacity>
      
      <Animated.View>
        <Text style={[styles.name, { color: colors.card }]}>{name}</Text>
        <Text style={[styles.bio, { color: colors.card }]}>{bio}</Text>
      </Animated.View>

      <TouchableOpacity
        style={[styles.editButton, { backgroundColor: colors.card }]}
        onPress={onEditPress}
      >
        <Text style={[styles.editButtonText, { color: colors.primary }]}>
          Edit Profile
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#fff',
    marginBottom: spacing.md,
  },
  name: {
    ...typography.header,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  bio: {
    ...typography.body,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: spacing.md,
  },
  editButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  editButtonText: {
    fontWeight: 'bold',
  },
});
