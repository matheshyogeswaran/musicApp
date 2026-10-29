import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {usePlayerRepeatMode} from '../hooks/useTrackPlayerRepeat';
import {RepeatMode} from 'react-native-track-player';
import {useTheme} from '@react-navigation/native';

const PlayerRepeatToggle = ({size = 22}) => {
  const {colors} = useTheme();
  const {repeatMode, changeRepeatMode} = usePlayerRepeatMode();

  const repeatOrder = [RepeatMode.Off, RepeatMode.Track, RepeatMode.Queue];

  const toggleRepeatMode = () => {
    if (repeatMode == null) {
      return;
    }
    const currentIndex = repeatOrder.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % repeatOrder.length;
    changeRepeatMode(repeatOrder[nextIndex]);
  };

  const isActive = repeatMode !== RepeatMode.Off;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.toggleBtn}
      onPress={toggleRepeatMode}
      hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
      {repeatMode === RepeatMode.Track ? (
        <MaterialCommunityIcons
          name="repeat-once"
          size={size + 2}
          color={colors.primary || '#6366F1'}
        />
      ) : (
        <Feather
          name="repeat"
          size={size}
          color={isActive ? colors.primary || '#6366F1' : colors.iconSecondary}
        />
      )}
      {isActive && (
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

export default PlayerRepeatToggle;

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
