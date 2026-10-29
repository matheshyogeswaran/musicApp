import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {fontFamilies} from '../constants/fonts';
import {fontSize, spacing, radius} from '../constants/dimensions';
import {useSharedValue} from 'react-native-reanimated';
import {Slider} from 'react-native-awesome-slider';
import TrackPlayer, {useProgress} from 'react-native-track-player';
import {formatSecondsToMinute} from '../utills';
import {useTheme} from '@react-navigation/native';

const PlayerProgressBar = () => {
  const {duration, position} = useProgress();
  const {colors} = useTheme();

  const progress = useSharedValue(0);
  const min = useSharedValue(0);
  const max = useSharedValue(1);
  const isSliding = useSharedValue(false);

  if (!isSliding.value) {
    progress.value = duration > 0 ? position / duration : 0;
  }

  const trackElapsedTime = formatSecondsToMinute(position);
  const trackRemainingTime =
    duration >= position
      ? `-${formatSecondsToMinute(duration - position)}`
      : '00:00';

  return (
    <View style={styles.container}>
      <Slider
        style={styles.sliderContainer}
        containerStyle={{
          height: 5,
          borderRadius: radius.full,
        }}
        progress={progress}
        minimumValue={min}
        maximumValue={max}
        onSlidingStart={() => (isSliding.value = true)}
        onValueChange={async value => {
          await TrackPlayer.seekTo(value * duration);
        }}
        onSlidingComplete={async value => {
          if (!isSliding.value) {
            return;
          }
          isSliding.value = false;
          await TrackPlayer.seekTo(value * duration);
        }}
        theme={{
          disableMinTrackTintColor: colors.primary || '#6366F1',
          maximumTrackTintColor: colors.maximumTintColor || 'rgba(255,255,255,0.12)',
          minimumTrackTintColor: colors.primary || '#6366F1',
        }}
        renderBubble={() => <View />}
      />

      <View style={styles.timeRow}>
        <Text style={[styles.timeText, {color: colors.textSecondary}]}>
          {trackElapsedTime}
        </Text>
        <Text style={[styles.timeText, {color: colors.textSecondary}]}>
          {trackRemainingTime}
        </Text>
      </View>
    </View>
  );
};

export default PlayerProgressBar;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: spacing.sm,
  },
  sliderContainer: {
    width: '100%',
    height: 24,
    justifyContent: 'center',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  timeText: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSize.xs,
    letterSpacing: 0.2,
  },
});
