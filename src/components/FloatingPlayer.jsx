import React, {useEffect, useState} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useSharedValue,
  withTiming,
  withRepeat,
  useAnimatedStyle,
  withPause,
} from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';
import {fontSize, iconSizes, spacing} from '../constants/dimensions';
import {fontFamilies} from '../constants/fonts';
import {
  GotoNextButton,
  GotoPreviousButton,
  PlayPauseButton,
} from './PlayerControls';
import {Slider} from 'react-native-awesome-slider';
import MovingText from './MovingText';
import {useNavigation, useTheme} from '@react-navigation/native';
import TrackPlayer, {useProgress, useActiveTrack, State, usePlaybackState} from 'react-native-track-player';

// Random image URLs
const randomImages = [
  'https://thumbs.dreamstime.com/b/vinyl-record-disc-black-lp-album-isolated-long-play-disk-blank-orange-label-40595108.jpg',
  'https://th.bing.com/th/id/R.a209ea09bd65cde41b7160ea5e6fd277?rik=jqvwc3pz%2fgLdKA&pid=ImgRaw&r=0',
  'https://ncsmusic.s3.eu-west-1.amazonaws.com/tracks/000/001/653/325x325/lost-my-love-1711587650-eideDUfU5z.jpg',
];

const FloatingPlayer = () => {
  const {colors} = useTheme();
  const {duration, position} = useProgress();
  const playbackState = usePlaybackState(); // Get playback state
  const navigation = useNavigation();

  // Active Track Information
  const activeTrack = useActiveTrack();

  // Progress Slider Values
  const progress = useSharedValue(0.2);
  const min = useSharedValue(0);
  const max = useSharedValue(1);
  const isSliding = useSharedValue(false);

  // Handle Progress Bar
  if (!isSliding.value) {
    progress.value = duration > 0 ? position / duration : 0;
  }

  // Animation for rotating album artwork
  const rotate = useSharedValue(0);

  // Generate a random image initially
  const [randomImage, setRandomImage] = useState(
    randomImages[Math.floor(Math.random() * randomImages.length)],
  );

  useEffect(() => {
    // Start infinite rotation animation
    const startAnimation = () => {
      rotate.value = withRepeat(
        withTiming(360, {duration: 10000, easing: Easing.linear}), // 10s for full rotation
        -1, // Infinite loop
      );
    };

    const stopAnimation = () => {
      rotate.value = withTiming(0, {duration: 500}); // Reset rotation when paused
    };

    // Manage animation based on playback state
    if (playbackState.state === State.Playing) {
      startAnimation();
    } else {
      stopAnimation();
    }
  }, [playbackState.state, rotate]);

  // Rotating animation style
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{rotate: `${rotate.value}deg`}],
    };
  });

  // Handle Next Song Change Random Image
  useEffect(() => {
    if (activeTrack) {
      setRandomImage(
        randomImages[Math.floor(Math.random() * randomImages.length)],
      );
    }
  }, [activeTrack]);

  // Handle Player Screen Open
  const handleOpenPlayerScreen = () => {
    navigation.navigate('PLAYER_SCREEN', {track: activeTrack}); // Pass active track
  };

  return (
    <View>
      {/* Slider for Progress */}
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

      {/* Floating Player */}
      <TouchableOpacity
        style={styles.container}
        activeOpacity={0.85}
        onPress={handleOpenPlayerScreen}>
        {/* Animated Album Artwork */}
        <Animated.View style={[styles.animatedCover, animatedStyle]}>
          <FastImage
            source={{uri: randomImage}} // Use random image
            style={styles.coverImage}
            resizeMode={FastImage.resizeMode.cover}
          />
        </Animated.View>
        <View style={styles.titleContainer}>
          {/* Title */}
          <MovingText
            text={activeTrack?.title || 'Unknown Title'}
            animationThreshold={10}
            style={[styles.title, {color: colors.textPrimary}]}
          />
          {/* Artist */}
          <Text style={[styles.artist, {color: colors.textSecondary}]}>
            {activeTrack?.artist || 'Unknown Artist'}
          </Text>
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
    marginTop: spacing.sm,
  },
  animatedCover: {
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FFD700', // Golden border
  },
  coverImage: {
    height: 60,
    width: 60,
    borderRadius: 30,
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
