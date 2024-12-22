import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
//import {colors} from '../constants/colors';
import {fontSize, iconSizes, spacing} from '../constants/dimensions';
import {fontFamilies} from '../constants/fonts';
import {
  GotoNextButton,
  GotoPreviousButton,
  PlayPauseButton,
} from './PlayerControls';
import {useSharedValue} from 'react-native-reanimated';
import {Slider} from 'react-native-awesome-slider';
import MovingText from './MovingText';
import {useNavigation, useTheme} from '@react-navigation/native';
import TrackPlayer, {useProgress} from 'react-native-track-player';

const imageUrl =
  'https://ncsmusic.s3.eu-west-1.amazonaws.com/tracks/000/001/653/325x325/lost-my-love-1711587650-eideDUfU5z.jpg';

const FloatingPlayer = ({track}) => {
  const {colors}=useTheme();
  const {duration, position} = useProgress();
  const navigation = useNavigation();
  const progress = useSharedValue(0.2);
  const min = useSharedValue(0);
  const max = useSharedValue(1);
  const isSliding = useSharedValue(false);

  if (!isSliding.value) {
    progress.value = duration > 0 ? position / duration : 0;
  }

  const handleOpenPlayerScreen = () => {
    navigation.navigate('PLAYER_SCREEN', {track});
  };
  return (
    <View>
      <View style={{zIndex: 1}}>
        <Slider
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
            disableMinTrackTintColor: colors.maximumTintColor,
            maximumTrackTintColor: colors.maximumTintColor,
          }}
          renderBubble={() => <View />}
        />
      </View>
      <TouchableOpacity
        style={styles.container}
        activeOpacity={0.85}
        onPress={handleOpenPlayerScreen}>
        <Image source={{uri: track?.artwork}} style={styles.coverImage} />
        <View style={styles.titleContainer}>
          <MovingText
            text={track?.title}
            animationThreshold={10}
            style={[styles.title,{color: colors.textPrimary,}]}
          />
          {/* <Text style={styles.title}>Minnale minnale with anurith</Text> */}
          <Text style={[styles.artist,{color: colors.textSecondary,}]}>{track?.artist}</Text>
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
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : 0,
  },
  coverImage: {
    height: 60,
    width: 60,
    resizeMode: 'cover',
  },
  titleContainer: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    overflow: 'hidden',
    marginLeft: spacing.sm,
    marginRight: spacing.lg,
  },
  title: {
    
    fontSize: fontSize.lg,
    fontFamily: fontFamilies.medium,
  },
  artist: {
    
    fontSize: fontSize.md,
  },
  playerControlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingRight: spacing.lg,
  },
});
