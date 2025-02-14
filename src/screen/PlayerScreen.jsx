import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
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
} from 'react-native-reanimated';
import FastImage from 'react-native-fast-image'; // Optimized for performance
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import {fontSize, iconSizes, spacing} from '../constants/dimensions';
import {fontFamilies} from '../constants/fonts';
import PlayerShuffleToggle from '../components/PlayerShuffleToggle';
import PlayerProgressBar from '../components/PlayerProgressBar';
import {
  GotoNextButton,
  GotoPreviousButton,
  PlayPauseButton,
} from '../components/PlayerControls';
import {useNavigation, useTheme} from '@react-navigation/native';
import TrackPlayer, {
  useActiveTrack,
  usePlaybackState,
  State,
} from 'react-native-track-player';
import useLikeSongs from '../store/likeStore';
import {isExist} from '../utills';

// Array of Random Images
const randomImages = [
  'https://thumbs.dreamstime.com/b/vinyl-record-disc-black-lp-album-isolated-long-play-disk-blank-orange-label-40595108.jpg',
  'https://th.bing.com/th/id/R.a209ea09bd65cde41b7160ea5e6fd277?rik=jqvwc3pz%2fgLdKA&pid=ImgRaw&r=0',
];

const PlayerScreen = () => {
  const {colors} = useTheme();
  const {likedSongs, addToLiked} = useLikeSongs();
  const activeTrack = useActiveTrack();
  const navigation = useNavigation();
  const [isMute, setIsMute] = useState(false);
  const playbackState = usePlaybackState(); // Get playback state
  // Generate a random image on load
  const [randomImage, setRandomImage] = useState(
    randomImages[Math.floor(Math.random() * randomImages.length)],
  );

  // Animation Values
  const rotate = useSharedValue(0);

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

  const setVolume = async () => {
    const volume = await TrackPlayer.getVolume();
    setIsMute(volume === 0 ? true : false);
  };

  const goBack = () => {
    navigation.goBack();
  };

  const handleToggleVolumn = () => {
    TrackPlayer.setVolume(isMute ? 1 : 0);
    setIsMute(!isMute);
  };

  // Image rotation animation
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{rotate: `${rotate.value}deg`}],
    };
  });

  const stopAnimation = () => {
    rotate.value = withTiming(0, {duration: 500}); // Reset rotation when paused
  };

  if (!activeTrack) {
    return (
      <View style={[styles.centered, {backgroundColor: colors.background}]}>
        <ActivityIndicator size={'large'} color={colors.iconPrimary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={goBack}>
          <AntDesign
            name={'arrowleft'}
            size={iconSizes.md}
            color={colors.iconPrimary}
          />
        </TouchableOpacity>
        <Text style={[styles.headerText, {color: colors.textPrimary}]}>
          Playing Now
        </Text>
      </View>

      {/* Animated Cover Image */}
      <View style={styles.coverImageContainer}>
        <Animated.View style={[styles.animatedCover, animatedStyle]}>
          <FastImage
            source={{uri: randomImage}} // Use random image
            style={styles.coverImage}
            resizeMode={FastImage.resizeMode.cover}
          />
        </Animated.View>
      </View>

      {/* Track Title & Artist */}
      <View style={styles.titleRowHeartContainer}>
        <View style={styles.titleContainer}>
          <Text
            style={[styles.title, {color: colors.textPrimary}]}
            numberOfLines={1} // Limits to one line
            ellipsizeMode="tail" // Adds "..." when text overflows
          >
            {activeTrack?.title}
          </Text>

          <Text style={[styles.artist, {color: colors.textSecondary}]}>
            {activeTrack?.artist || 'Unknown Artist'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => addToLiked(activeTrack)}>
          <AntDesign
            name={isExist(likedSongs, activeTrack) ? 'heart' : 'hearto'}
            color={colors.iconSecondary}
            size={iconSizes.md}
          />
        </TouchableOpacity>
      </View>

      {/* Player Controls */}
      <View style={styles.playerControlContainer}>
        <TouchableOpacity
          style={styles.volumnWrapper}
          onPress={handleToggleVolumn}>
          <Feather
            name={isMute ? 'volume-x' : 'volume-1'}
            size={iconSizes.md}
            color={colors.iconPrimary}
          />
        </TouchableOpacity>
        <View style={styles.repeatWrapper}>
          <PlayerShuffleToggle />
        </View>
      </View>

      <PlayerProgressBar />

      <View style={styles.playPauseContainer}>
        <GotoPreviousButton size={iconSizes.xl} />
        <PlayPauseButton size={iconSizes.xl} />
        <GotoNextButton size={iconSizes.xl} />
      </View>
    </View>
  );
};

export default PlayerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing.lg,
    padding: spacing.lg,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? spacing.xl : 0,
    width: '100%',
  },
  headerText: {
    textAlign: 'center',
    fontSize: fontSize.lg,
    fontStyle: fontFamilies.medium,
    flex: 1,
  },
  coverImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.lg,
  },
  animatedCover: {
    borderRadius: 150,
    borderWidth: 5,
    borderColor: '#FFD700', // Golden border
  },
  coverImage: {
    height: 300,
    width: 300,
    borderRadius: 150,
  },
  title: {
    fontSize: fontSize.xl,
    fontFamily: fontFamilies.medium,
  },
  artist: {
    fontSize: fontSize.md,
    fontFamily: fontFamilies.regular,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRowHeartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerControlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  volumnWrapper: {
    flex: 1,
  },
  repeatWrapper: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  playPauseContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xl,
    marginTop: spacing.lg,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
