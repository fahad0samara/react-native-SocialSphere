import React from 'react';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native';

interface SharedElementProps {
  id: string;
  children: React.ReactNode;
  isSource?: boolean;
  style?: any;
}

export default function SharedElement({
  id,
  children,
  isSource = true,
  style,
}: SharedElementProps) {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withSpring(1) },
        { translateY: withSpring(0) },
      ],
      opacity: withSpring(1),
    };
  });

  return (
    <Animated.View style={[styles.container, style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
});
