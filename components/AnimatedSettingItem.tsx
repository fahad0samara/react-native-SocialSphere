import React from 'react';
import { StyleSheet, View, Text, Switch, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '../context/ThemeContext';
import { getThemeColors, spacing, typography } from '../styles/theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface SettingItemProps {
  icon: string;
  title: string;
  description?: string;
  hasSwitch?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  isEnabled?: boolean;
}

export default function AnimatedSettingItem({
  icon,
  title,
  description,
  hasSwitch,
  onPress,
  onToggle,
  isEnabled = false,
}: SettingItemProps) {
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);

  const scale = useSharedValue(1);
  const backgroundColor = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      backgroundColor: interpolateColor(
        backgroundColor.value,
        [0, 1],
        [colors.card, colors.primary + '20']
      ),
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
    backgroundColor.value = withTiming(1);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    backgroundColor.value = withTiming(0);
  };

  return (
    <AnimatedTouchable
      style={[styles.settingItem, animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={!onPress && !hasSwitch}
    >
      <FontAwesome
        name={icon}
        size={20}
        color={colors.primary}
        style={styles.icon}
      />
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {description && (
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {description}
          </Text>
        )}
      </View>
      {hasSwitch && (
        <Switch
          value={isEnabled}
          onValueChange={onToggle}
          trackColor={{ false: colors.textSecondary, true: colors.primary }}
          thumbColor={colors.card}
        />
      )}
      {!hasSwitch && onPress && (
        <FontAwesome
          name="chevron-right"
          size={16}
          color={colors.textSecondary}
        />
      )}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  icon: {
    marginRight: spacing.md,
    width: 24,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    marginTop: 2,
  },
});
