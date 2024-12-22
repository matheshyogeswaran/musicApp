import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
//import {colors} from '../constants/colors';
import {iconSizes} from '../constants/dimensions';
import {usePlayerRepeatMode} from '../hooks/useTrackPlayerRepeat';
import {RepeatMode} from 'react-native-track-player';
import { useTheme } from '@react-navigation/native';

const PlayerRepeatToggle = () => {
  const {colors} = useTheme();
  const {repeatMode, changeRepeatMode} = usePlayerRepeatMode();
  console.log(repeatMode, 'repeat mode');
  const repeatOrder = [RepeatMode.Off, RepeatMode.Track, RepeatMode.Queue];

  const toggleRepeatMode = () => {
    if (repeatMode == null) {
      return;
    }
    const currentIndex = repeatOrder.indexOf(repeatMode);
    console.log('cuuree', currentIndex);
    const nextIndex = (currentIndex + 1) % repeatOrder.length;
    changeRepeatMode(nextIndex);
  };

  let iconName = 'repeat';
  switch (repeatMode) {
    case RepeatMode.Off:
      iconName = 'repeat-off';
      break;
    case RepeatMode.Queue:
      iconName = 'repeat';
      break;
    case RepeatMode.Track:
      iconName = 'repeat-once';
      break;
  }
  return (
    <TouchableOpacity onPress={toggleRepeatMode}>
      <MaterialCommunityIcons
        name={iconName}
        size={iconSizes.lg}
        color={colors.iconSecondary}
      />
    </TouchableOpacity>
  );
};

export default PlayerRepeatToggle;

const styles = StyleSheet.create({});
