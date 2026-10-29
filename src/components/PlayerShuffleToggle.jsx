import React, {useState} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import TrackPlayer from 'react-native-track-player';
import {useTheme} from '@react-navigation/native';

const PlayerShuffleToggle = ({size = 22}) => {
  const {colors} = useTheme();
  const [isShuffled, setIsShuffled] = useState(false);

  const shuffleSongs = async () => {
    try {
      let queue = await TrackPlayer.getQueue();
      if (!queue || queue.length <= 1) {
        return;
      }

      const activeIndex = await TrackPlayer.getActiveTrackIndex();
      const currentTrack = activeIndex !== null && activeIndex !== undefined ? queue[activeIndex] : null;

      // Keep current track playing or at top, shuffle the rest
      let others = queue.filter((_, idx) => idx !== activeIndex);
      others.sort(() => Math.random() - 0.5);

      const newQueue = currentTrack ? [currentTrack, ...others] : others;
      await TrackPlayer.reset();
      await TrackPlayer.add(newQueue);
      await TrackPlayer.play();

      setIsShuffled(!isShuffled);
    } catch (e) {
      console.warn('Error shuffling songs:', e);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.toggleBtn}
      onPress={shuffleSongs}
      hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
      <Feather
        name="shuffle"
        size={size}
        color={isShuffled ? colors.primary || '#6366F1' : colors.iconSecondary}
      />
      {isShuffled && (
        <View
          style={[
            styles.activeDot,
            {backgroundColor: colors.primary || '#6366F1'},
          ]}
        />
      )}
    </TouchableOpacity>
  );
};

export default PlayerShuffleToggle;

const styles = StyleSheet.create({
  toggleBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 3,
  },
});
