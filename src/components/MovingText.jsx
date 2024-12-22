import {StyleSheet, Text, View} from 'react-native';
import React, {useEffect} from 'react';
import Animated, {
    Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@react-navigation/native';

const MovingText = ({text, animationThreshold, style}) => {
  const {colors} = useTheme();
  const translaeX = useSharedValue(0);
  const shouldAnimate = text?.length >= animationThreshold;

  const textWidth = text?.length * 3;

  useEffect(() => {
    if (!shouldAnimate) return;

    translaeX.value = withDelay(
      1000,
      withRepeat(
        withTiming(-textWidth, {duration: 5000, easing: Easing.linear}),
        -1,
        true,
      ),
    );
  }, [translaeX, text, animationThreshold, textWidth]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateX: translaeX.value}],
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

const styles = StyleSheet.create({});
