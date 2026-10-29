import React, {useEffect, useState} from 'react';
import {
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
import FastImage from 'react-native-fast-image';
import {fontSize, spacing, radius} from '../constants/dimensions';
import {fontFamilies} from '../constants/fonts';
import Feather from 'react-native-vector-icons/Feather';
import {useNavigation, useTheme} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import TrackPlayer, {
  useProgress,
  useActiveTrack,
  useIsPlaying,
} from 'react-native-track-player';

const defaultArtworks = [
  'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80',
];

const FloatingPlayer = () => {
  const {colors} = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const activeTrack = useActiveTrack();
  const {playing} = useIsPlaying();
  const {duration, position} = useProgress();

  const [randomImage] = useState(
    defaultArtworks[Math.floor(Math.random() * defaultArtworks.length)],
  );

  // Rotation animation
  const rotate = useSharedValue(0);

  useEffect(() => {
    if (playing) {
      rotate.value = withRepeat(
        withTiming(360, {duration: 10000, easing: Easing.linear}),
        -1,
      );
    } else {
      rotate.value = withTiming(0, {duration: 600});
    }
  }, [playing, rotate]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{rotate: `${rotate.value}deg`}],
    };
  });

  const togglePlayback = async () => {
    if (playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  const handleNext = async () => {
    try {
      await TrackPlayer.skipToNext();
    } catch (e) {
      console.log('No next track');
    }
  };

  const handleOpenPlayer = () => {
    navigation.navigate('PLAYER_SCREEN', {track: activeTrack});
  };

  if (!activeTrack) {
    return null;
  }

  const progressPercent =
    duration > 0 ? Math.min(100, Math.max(0, (position / duration) * 100)) : 0;

  return (
    <View
      style={[
        styles.outerWrapper,
        {bottom: Math.max(insets.bottom, 10) + 6},
      ]}
      pointerEvents="box-none">
      <TouchableOpacity
        style={[
          styles.container,
          {
            backgroundColor: colors.surface || colors.card || '#111726',
            borderColor: colors.border || 'rgba(255,255,255,0.1)',
          },
        ]}
        activeOpacity={0.92}
        onPress={handleOpenPlayer}>
        {/* Progress Line */}
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${progressPercent}%`,
                backgroundColor: colors.primary || '#6366F1',
              },
            ]}
          />
        </View>

        {/* Content Row */}
        <View style={styles.innerContent}>
          {/* Column 1: Animated Vinyl Thumbnail */}
          <Animated.View style={[styles.artworkContainer, animatedStyle]}>
            <FastImage
              source={{uri: activeTrack.artwork || randomImage}}
              style={styles.artwork}
              resizeMode={FastImage.resizeMode.cover}
            />
            <View style={styles.vinylCenterHole} />
          </Animated.View>

          {/* Column 2: Song Info with Safe Bounds & Truncation */}
          <View style={styles.textContainer}>
            <Text
              style={[styles.title, {color: colors.textPrimary}]}
              numberOfLines={1}
              ellipsizeMode="tail">
              {activeTrack.title || 'Unknown Title'}
            </Text>
            <Text
              style={[styles.artist, {color: colors.textSecondary}]}
              numberOfLines={1}
              ellipsizeMode="tail">
              {activeTrack.artist && activeTrack.artist !== 'Unknown Artist'
                ? activeTrack.artist
                : 'Local Audio'}
            </Text>
          </View>

          {/* Column 3: Playback Controls */}
          <View style={styles.controlsRow}>
            <TouchableOpacity
              style={[
                styles.playPauseBtn,
                {backgroundColor: colors.primary || '#6366F1'},
              ]}
              activeOpacity={0.8}
              onPress={togglePlayback}
              hitSlop={{top: 10, bottom: 10, left: 8, right: 8}}>
              <Feather
                name={playing ? 'pause' : 'play'}
                size={18}
                color="#FFFFFF"
                style={!playing ? styles.playIconOffset : undefined}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.nextBtn}
              activeOpacity={0.7}
              onPress={handleNext}
              hitSlop={{top: 10, bottom: 10, left: 8, right: 8}}>
              <Feather
                name="skip-forward"
                size={20}
                color={colors.iconPrimary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default FloatingPlayer;

const styles = StyleSheet.create({
  outerWrapper: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    zIndex: 99,
  },
  container: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  progressBarTrack: {
    height: 2.5,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  progressBarFill: {
    height: '100%',
  },
  innerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs + 3,
    paddingHorizontal: spacing.md,
  },
  artworkContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
    flexShrink: 0,
  },
  artwork: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  vinylCenterHole: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#090D16',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm + 2,
    justifyContent: 'center',
  },
  title: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSize.sm,
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  artist: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSize.xs,
    letterSpacing: -0.1,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexShrink: 0,
  },
  playPauseBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  playIconOffset: {
    marginLeft: 2,
  },
  nextBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
