import React, { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const MovingText = ({ text, animationThreshold = 20, style }) => {
  const translateX = useSharedValue(0);
  const shouldAnimate = text?.length >= animationThreshold;
  const textWidth = text?.length * 3;

  useEffect(() => {
    if (!shouldAnimate) {
      translateX.value = 0;
      return;
    }

    translateX.value = withDelay(
      1000,
      withRepeat(
        withTiming(-textWidth, { duration: 5000, easing: Easing.linear }),
        -1,
        true,
      ),
    );
  }, [shouldAnimate, textWidth, translateX]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <Animated.Text
      numberOfLines={1}
      style={[
        animatedStyle,
        style,
        shouldAnimate && {
          width: 9999,
          paddingLeft: 16,
        },
      ]}>
      {text}
    </Animated.Text>
  );
};

export default MovingText;
