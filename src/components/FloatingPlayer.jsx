import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {colors} from '../constants/colors';
import {fontSize, iconSizes, spacing} from '../constants/dimensions';
import {fontFamilies} from '../constants/fonts';
import {
  GotoNextButton,
  GotoPreviousButton,
  PlayPauseButton,
} from './PlayerControls';
import {useSharedValue} from 'react-native-reanimated';
import {Slider} from 'react-native-awesome-slider';

const imageUrl =
  'https://ncsmusic.s3.eu-west-1.amazonaws.com/tracks/000/001/653/325x325/lost-my-love-1711587650-eideDUfU5z.jpg';
const FloatingPlayer = () => {
  const progress = useSharedValue(30);
  const min = useSharedValue(0);
  const max = useSharedValue(100);
  return (
    <View>
      <View style={{zIndex:1}}>
        <Slider
          progress={progress}
          minimumValue={min}
          maximumValue={max}
          theme={{
            disableMinTrackTintColor: colors.maximumTintColor,
            maximumTrackTintColor: colors.maximumTintColor,
          }}
        />
      </View>
      <TouchableOpacity style={styles.container} activeOpacity={0.85}>
        <Image source={{uri: imageUrl}} style={styles.coverImage} />
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Minnale minnale</Text>
          <Text style={styles.artist}>Alan Walker</Text>
        </View>
        <View style={styles.playerControlContainer}>
          <GotoPreviousButton size={iconSizes.md} />
          <PlayPauseButton size={iconSizes.lg} />
          <GotoNextButton size={iconSizes.md} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default FloatingPlayer;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coverImage: {
    height: 60,
    width: 60,
    resizeMode: 'cover',
  },
  titleContainer: {
    flex: 1,
    paddingHorizontal: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontFamily: fontFamilies.medium,
  },
  artist: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  playerControlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingRight: spacing.lg,
  },
});
