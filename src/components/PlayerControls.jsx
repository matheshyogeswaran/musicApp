import React from 'react';
import {StyleSheet, TouchableOpacity} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {iconSizes} from '../constants/dimensions';
import TrackPlayer, {useIsPlaying} from 'react-native-track-player';
import {useTheme} from '@react-navigation/native';

export const PlayPauseButton = ({size = 64}) => {
  const {colors} = useTheme();
  const {playing} = useIsPlaying();

  const togglePlayback = async () => {
    if (playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[
        styles.playBtn,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.primary || '#6366F1',
        },
      ]}
      onPress={togglePlayback}>
      <Feather
        name={playing ? 'pause' : 'play'}
        size={size * 0.45}
        color="#FFFFFF"
        style={!playing ? styles.playIconOffset : undefined}
      />
    </TouchableOpacity>
  );
};

export const GotoPreviousButton = ({size = iconSizes.lg}) => {
  const {colors} = useTheme();

  const skipToPrevious = async () => {
    try {
      await TrackPlayer.skipToPrevious();
    } catch (error) {
      console.log('No previous track');
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.skipBtn}
      onPress={skipToPrevious}
      hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
      <Feather name="skip-back" size={size} color={colors.iconPrimary} />
    </TouchableOpacity>
  );
};

export const GotoNextButton = ({size = iconSizes.lg}) => {
  const {colors} = useTheme();

  const skipToNext = async () => {
    try {
      await TrackPlayer.skipToNext();
    } catch (error) {
      console.log('No next track');
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.skipBtn}
      onPress={skipToNext}
      hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
      <Feather name="skip-forward" size={size} color={colors.iconPrimary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  playBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  playIconOffset: {
    marginLeft: 3,
  },
  skipBtn: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
