import {TouchableOpacity} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import {iconSizes} from '../constants/dimensions';
import {colors} from '../constants/colors';
import TrackPlayer, {State, useIsPlaying, usePlaybackState} from 'react-native-track-player';
import {useEffect, useState} from 'react';

export const PlayPauseButton = ({size = iconSizes.lg}) => {
  const {playing} = useIsPlaying();
  const playbackState = usePlaybackState(); // Hook to monitor playback state
  const [isPlaying, setIsPlaying] = useState(false); // Local state for immediate updates

  // Sync with playback state dynamically
  useEffect(() => {
    setIsPlaying(playbackState === State.Playing); // Update button state based on playback
  }, [playbackState]); // Listen for playback state changes

  // Toggle Play/Pause
  const togglePlayback = async () => {
    const state = await TrackPlayer.getState(); // Get current playback state
    if (state === State.Playing) {
      await TrackPlayer.pause(); // Pause playback
    } else {
      await TrackPlayer.play(); // Resume playback
    }
  };

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={togglePlayback}>
      <FontAwesome6
        name={playing ? 'pause' : 'play'} // Dynamic icon based on local state
        size={size}
        color={colors.iconPrimary}
      />
    </TouchableOpacity>
  );
};

// Previous Button
export const GotoPreviousButton = ({size = iconSizes.xl}) => {
  const skipToPrevious = async () => {
    try {
      await TrackPlayer.skipToPrevious(); // Skip to previous track
    } catch (error) {
      console.log('No previous track available');
    }
  };

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={skipToPrevious}>
      <FontAwesome6 name={'backward'} size={size} color={colors.iconPrimary} />
    </TouchableOpacity>
  );
};

export const GotoNextButton = ({size = iconSizes.xl}) => {
  const skipToNext = async () => {
    try {
      await TrackPlayer.skipToNext(); // Skip to next track
    } catch (error) {
      console.log('No next track available');
    }
  };

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={skipToNext}>
      <FontAwesome6 name={'forward'} size={size} color={colors.iconPrimary} />
    </TouchableOpacity>
  );
};
