import React, { useState } from 'react';
import { StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '../context/ThemeContext';
import { getThemeColors, spacing } from '../styles/theme';

interface ActionButton {
  icon: string;
  onPress: () => void;
}

interface FloatingActionButtonProps {
  actions: ActionButton[];
}

const AnimatedIcon = Animated.createAnimatedComponent(FontAwesome);

export default function FloatingActionButton({ actions }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);

  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  const toggleMenu = () => {
    const newValue = !isOpen;
    setIsOpen(newValue);

    rotation.value = withSpring(newValue ? 135 : 0);
    opacity.value = withTiming(newValue ? 1 : 0, {
      duration: 200,
      easing: Easing.inOut(Easing.ease),
    });

    actions.forEach((_, index) => {
      const delay = newValue ? index * 100 : (actions.length - index - 1) * 100;
      scale.value = withDelay(
        delay,
        withSequence(
          withSpring(1.2),
          withSpring(1)
        )
      );
    });
  };

  const mainButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotation.value}deg` },
        { scale: scale.value },
      ],
    };
  });

  const actionButtonStyle = (index: number) => 
    useAnimatedStyle(() => {
      return {
        opacity: opacity.value,
        transform: [
          { scale: opacity.value },
          { 
            translateY: withSpring(
              isOpen ? -60 * (index + 1) : 0,
              { damping: 12 }
            )
          },
        ],
      };
    });

  return (
    <View style={styles.container}>
      {actions.map((action, index) => (
        <Animated.View
          key={index}
          style={[
            styles.actionButton,
            { backgroundColor: colors.primary },
            actionButtonStyle(index),
          ]}
        >
          <TouchableWithoutFeedback onPress={action.onPress}>
            <FontAwesome
              name={action.icon}
              size={24}
              color={colors.card}
            />
          </TouchableWithoutFeedback>
        </Animated.View>
      ))}

      <TouchableWithoutFeedback onPress={toggleMenu}>
        <Animated.View
          style={[
            styles.mainButton,
            { backgroundColor: colors.primary },
            mainButtonStyle,
          ]}
        >
          <AnimatedIcon
            name="plus"
            size={24}
            color={colors.card}
          />
        </Animated.View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    alignItems: 'center',
  },
  mainButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionButton: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
