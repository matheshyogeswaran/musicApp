import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  Easing,
  useSharedValue,
  withTiming,
  withRepeat,
  useAnimatedStyle,
} from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {fontSize, spacing, radius} from '../constants/dimensions';
import {fontFamilies} from '../constants/fonts';
import PlayerShuffleToggle from '../components/PlayerShuffleToggle';
import PlayerRepeatToggle from '../components/PlayerRepeatToggle';
import PlayerProgressBar from '../components/PlayerProgressBar';
import {
  GotoNextButton,
  GotoPreviousButton,
  PlayPauseButton,
} from '../components/PlayerControls';
import {useNavigation, useRoute, useTheme} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import TrackPlayer, {
  useActiveTrack,
  useIsPlaying,
} from 'react-native-track-player';
import useLikeSongs from '../store/likeStore';
import {isExist} from '../utills';
import AddToPlaylistModal from '../components/AddToPlaylistModal';

const albumArtworks = [
  'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&q=80',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80',
  'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&q=80',
];

const PlayerScreen = () => {
  const {colors} = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const {width, height} = useWindowDimensions();

  const trackPlayerTrack = useActiveTrack();
  const activeTrack = trackPlayerTrack || route.params?.track;
  const {playing} = useIsPlaying();
  const {likedSongs, addToLiked} = useLikeSongs();

  const [isMute, setIsMute] = useState(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [randomImage] = useState(
    albumArtworks[Math.floor(Math.random() * albumArtworks.length)],
  );

  // Responsive artwork sizing: proportional to screen height & width
  const artworkSize = Math.round(Math.min(width - 64, height * 0.36, 290));
  const vinylCenterSize = Math.round(artworkSize * 0.18);
  const vinylDotSize = Math.round(vinylCenterSize * 0.3);

  // Rotation animation for vinyl record
  const rotate = useSharedValue(0);

  useEffect(() => {
    if (playing) {
      rotate.value = withRepeat(
        withTiming(360, {duration: 12000, easing: Easing.linear}),
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

  const handleToggleVolume = async () => {
    const nextMute = !isMute;
    try {
      await TrackPlayer.setVolume(nextMute ? 0 : 1);
    } catch (e) {
      console.log('Error setting volume', e);
    }
    setIsMute(nextMute);
  };

  // If no track is currently selected or playing
  if (!activeTrack || !activeTrack.url) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            paddingTop: insets.top + spacing.xs,
            paddingBottom: Math.max(insets.bottom, 12) + spacing.xs,
          },
        ]}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={[
              styles.headerBtn,
              {
                backgroundColor:
                  colors.surfaceElevated || colors.maximumTintColor + '22',
                borderColor: colors.border || 'rgba(255,255,255,0.08)',
              },
            ]}
            onPress={() => navigation.goBack()}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Feather name="chevron-down" size={22} color={colors.iconPrimary} />
          </TouchableOpacity>

          <View
            style={[
              styles.nowPlayingPill,
              {
                backgroundColor:
                  colors.surfaceElevated || colors.maximumTintColor + '22',
                borderColor: colors.border || 'rgba(255,255,255,0.08)',
              },
            ]}>
            <Text
              style={[
                styles.nowPlayingText,
                {color: colors.primary || '#6366F1'},
              ]}>
              NOW PLAYING
            </Text>
          </View>

          <View style={styles.headerPlaceholder} />
        </View>

        {/* Empty state container */}
        <View style={styles.emptyContainer}>
          <View
            style={[
              styles.emptyIconCircle,
              {
                backgroundColor: (colors.primary || '#6366F1') + '15',
                borderColor: (colors.primary || '#6366F1') + '30',
              },
            ]}>
            <Feather
              name="music"
              size={36}
              color={colors.primary || '#6366F1'}
            />
          </View>
          <Text style={[styles.emptyTitle, {color: colors.textPrimary}]}>
            No Song Playing
          </Text>
          <Text style={[styles.emptySub, {color: colors.textSecondary}]}>
            Select a song from your local audio library or a playlist to start listening.
          </Text>
          <TouchableOpacity
            style={[
              styles.emptyActionBtn,
              {backgroundColor: colors.primary || '#6366F1'},
            ]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}>
            <Text style={styles.emptyActionBtnText}>Browse Library</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerSpacing} />
      </View>
    );
  }

  const isLiked = isExist(likedSongs, activeTrack);
  const artworkSource = activeTrack.artwork
    ? typeof activeTrack.artwork === 'string'
      ? {uri: activeTrack.artwork}
      : activeTrack.artwork
    : {uri: randomImage};

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + spacing.xs,
          paddingBottom: Math.max(insets.bottom, 12) + spacing.xs,
        },
      ]}>
      {/* Top Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={[
            styles.headerBtn,
            {
              backgroundColor:
                colors.surfaceElevated || colors.maximumTintColor + '22',
              borderColor: colors.border || 'rgba(255,255,255,0.08)',
            },
          ]}
          onPress={() => navigation.goBack()}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Feather name="chevron-down" size={22} color={colors.iconPrimary} />
        </TouchableOpacity>

        <View
          style={[
            styles.nowPlayingPill,
            {
              backgroundColor:
                colors.surfaceElevated || colors.maximumTintColor + '22',
              borderColor: colors.border || 'rgba(255,255,255,0.08)',
            },
          ]}>
          <Text
            style={[
              styles.nowPlayingText,
              {color: colors.primary || '#6366F1'},
            ]}>
            NOW PLAYING
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.headerBtn,
            {
              backgroundColor:
                colors.surfaceElevated || colors.maximumTintColor + '22',
              borderColor: colors.border || 'rgba(255,255,255,0.08)',
            },
          ]}
          onPress={() => setIsPlaylistModalOpen(true)}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Feather name="plus" size={18} color={colors.iconPrimary} />
        </TouchableOpacity>
      </View>

      {/* Album Artwork with Vinyl Rotation */}
      <View style={styles.artworkSection}>
        <View
          style={[
            styles.artworkShadowCard,
            {
              width: artworkSize,
              height: artworkSize,
              borderRadius: artworkSize / 2,
              shadowColor: colors.primary || '#6366F1',
              backgroundColor: colors.surface || colors.card || '#111726',
            },
          ]}>
          <Animated.View
            style={[
              styles.animatedCover,
              {
                width: artworkSize,
                height: artworkSize,
                borderRadius: artworkSize / 2,
              },
              animatedStyle,
            ]}>
            <FastImage
              source={artworkSource}
              style={{width: artworkSize, height: artworkSize}}
              resizeMode={FastImage.resizeMode.cover}
            />
            {/* Center Vinyl Spindle Hole */}
            <View
              style={[
                styles.vinylCenterHole,
                {
                  width: vinylCenterSize,
                  height: vinylCenterSize,
                  borderRadius: vinylCenterSize / 2,
                },
              ]}>
              <View
                style={[
                  styles.vinylInnerDot,
                  {
                    width: vinylDotSize,
                    height: vinylDotSize,
                    borderRadius: vinylDotSize / 2,
                    backgroundColor: colors.primary || '#6366F1',
                  },
                ]}
              />
            </View>
          </Animated.View>
        </View>
      </View>

      {/* Song Details & Actions */}
      <View style={styles.metaSection}>
        <View style={styles.titleColumn}>
          <Text
            style={[styles.trackTitle, {color: colors.textPrimary}]}
            numberOfLines={1}
            ellipsizeMode="tail">
            {activeTrack.title || 'Unknown Title'}
          </Text>
          <Text
            style={[styles.trackArtist, {color: colors.textSecondary}]}
            numberOfLines={1}
            ellipsizeMode="tail">
            {activeTrack.artist && activeTrack.artist !== 'Unknown Artist'
              ? activeTrack.artist
              : 'Local Audio'}
          </Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[
              styles.actionIconBtn,
              {
                backgroundColor:
                  colors.surfaceElevated || colors.maximumTintColor + '22',
                borderColor: colors.border || 'rgba(255,255,255,0.08)',
              },
            ]}
            onPress={() => setIsPlaylistModalOpen(true)}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <MaterialIcons
              name="playlist-add"
              color={colors.iconPrimary}
              size={22}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionIconBtn,
              {
                backgroundColor: isLiked
                  ? '#EF44441A'
                  : colors.surfaceElevated || colors.maximumTintColor + '22',
                borderColor: isLiked
                  ? '#EF444455'
                  : colors.border || 'rgba(255,255,255,0.08)',
              },
            ]}
            onPress={() => addToLiked(activeTrack)}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <Feather
              name="heart"
              color={isLiked ? '#EF4444' : colors.iconSecondary}
              size={20}
              style={isLiked ? styles.heartFilled : undefined}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrubbable Progress Bar */}
      <View style={styles.progressSection}>
        <PlayerProgressBar />
      </View>

      {/* Main Playback Controls */}
      <View style={styles.controlsRow}>
        <PlayerShuffleToggle size={22} />
        <GotoPreviousButton size={26} />
        <PlayPauseButton size={64} />
        <GotoNextButton size={26} />
        <PlayerRepeatToggle size={22} />
      </View>

      {/* Bottom Utility Row */}
      <View style={styles.footerRow}>
        <TouchableOpacity
          style={styles.volumeToggle}
          onPress={handleToggleVolume}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Feather
            name={isMute ? 'volume-x' : 'volume-2'}
            size={18}
            color={isMute ? '#EF4444' : colors.iconSecondary}
          />
          <Text
            style={[
              styles.volumeText,
              {color: isMute ? '#EF4444' : colors.textSecondary},
            ]}>
            {isMute ? 'Muted' : 'Volume'}
          </Text>
        </TouchableOpacity>

        <View style={styles.deviceIndicator}>
          <Feather
            name="speaker"
            size={14}
            color={colors.primary || '#6366F1'}
            style={styles.speakerIcon}
          />
          <Text
            style={[
              styles.deviceText,
              {color: colors.primary || '#6366F1'},
            ]}>
            Device Speaker
          </Text>
        </View>
      </View>

      {/* Add To Playlist Modal */}
      <AddToPlaylistModal
        visible={isPlaylistModalOpen}
        onClose={() => setIsPlaylistModalOpen(false)}
        song={activeTrack}
      />
    </View>
  );
};

export default PlayerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerPlaceholder: {
    width: 38,
  },
  nowPlayingPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  nowPlayingText: {
    fontFamily: fontFamilies.bold,
    fontSize: 10,
    letterSpacing: 1.5,
  },
  artworkSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xs,
  },
  artworkShadowCard: {
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  animatedCover: {
    borderWidth: 5,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  vinylCenterHole: {
    position: 'absolute',
    backgroundColor: '#090D16',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vinylInnerDot: {},
  metaSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  titleColumn: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
    overflow: 'hidden',
    paddingRight: spacing.md,
  },
  trackTitle: {
    fontSize: fontSize.xl,
    fontFamily: fontFamilies.bold,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  trackArtist: {
    fontSize: fontSize.sm,
    fontFamily: fontFamilies.regular,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 0,
  },
  actionIconBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartFilled: {
    color: '#EF4444',
  },
  progressSection: {
    paddingHorizontal: spacing.xs,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.xs,
  },
  volumeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  volumeText: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSize.xs,
  },
  deviceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  speakerIcon: {
    marginRight: 4,
  },
  deviceText: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSize.xs,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontFamily: fontFamilies.bold,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: fontSize.sm,
    fontFamily: fontFamilies.regular,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  emptyActionBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
  },
  emptyActionBtnText: {
    color: '#FFFFFF',
    fontFamily: fontFamilies.bold,
    fontSize: fontSize.sm,
  },
  footerSpacing: {
    height: 40,
  },
});
