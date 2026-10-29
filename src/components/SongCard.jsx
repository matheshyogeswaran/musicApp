import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {fontFamilies} from '../constants/fonts';
import {fontSize, iconSizes, spacing, radius} from '../constants/dimensions';
import {useTheme} from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useActiveTrack, useIsPlaying} from 'react-native-track-player';
import useLikeSongs from '../store/likeStore';
import {isExist} from '../utills';

const SongCard = ({
  item,
  handlePlay,
  onOptionsPress,
  onRemove,
  showRemove = false,
  containerStyle,
  index,
}) => {
  const {colors} = useTheme();
  const activeTrack = useActiveTrack();
  const {playing} = useIsPlaying();
  const {likedSongs, addToLiked} = useLikeSongs();

  const isCurrentTrack = activeTrack?.url === item?.url;
  const isPlayingThisTrack = isCurrentTrack && playing;
  const isLiked = isExist(likedSongs, item);

  return (
    <View
      style={[
        styles.container,
        isCurrentTrack && {
          backgroundColor: colors.surfaceElevated || colors.maximumTintColor + '15',
          borderRadius: radius.md,
        },
        containerStyle,
      ]}>
      {/* Tap to play */}
      <TouchableOpacity
        style={styles.mainTouchable}
        onPress={() => handlePlay && handlePlay(item)}
        activeOpacity={0.65}>
        {/* Track Thumbnail */}
        <View
          style={[
            styles.thumbnail,
            {
              backgroundColor: isCurrentTrack
                ? (colors.primary || '#6366F1') + '22'
                : colors.surfaceElevated || colors.maximumTintColor + '22',
              borderColor: isCurrentTrack
                ? colors.primary || '#6366F1'
                : colors.border || colors.maximumTintColor + '33',
            },
          ]}>
          {isPlayingThisTrack ? (
            <MaterialIcons
              name="graphic-eq"
              size={iconSizes.sm}
              color={colors.primary || '#6366F1'}
            />
          ) : isCurrentTrack ? (
            <MaterialIcons
              name="play-arrow"
              size={iconSizes.sm}
              color={colors.primary || '#6366F1'}
            />
          ) : typeof index === 'number' ? (
            <Text
              style={[
                styles.indexText,
                {color: colors.textSecondary},
              ]}>
              {index + 1}
            </Text>
          ) : (
            <Feather
              name="music"
              size={iconSizes.xs}
              color={colors.iconSecondary}
            />
          )}
        </View>

        {/* Title and Artist Info */}
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.title,
              {
                color: isCurrentTrack
                  ? colors.primary || '#6366F1'
                  : colors.textPrimary,
              },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail">
            {item?.title || 'Unknown Track'}
          </Text>
          <View style={styles.metaRow}>
            {isCurrentTrack && (
              <View
                style={[
                  styles.playingBadge,
                  {backgroundColor: (colors.primary || '#6366F1') + '1A'},
                ]}>
                <Text
                  style={[
                    styles.playingBadgeText,
                    {color: colors.primary || '#6366F1'},
                  ]}>
                  {isPlayingThisTrack ? 'Playing' : 'Paused'}
                </Text>
              </View>
            )}
            <Text
              style={[styles.artist, {color: colors.textSecondary}]}
              numberOfLines={1}
              ellipsizeMode="tail">
              {item?.artist && item?.artist !== 'Unknown Artist'
                ? item.artist
                : 'Local Audio'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Action buttons on the right */}
      <View style={styles.rightActions}>
        {/* Quick like button */}
        {!showRemove && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => addToLiked(item)}
            hitSlop={{top: 10, bottom: 10, left: 8, right: 8}}>
            <Feather
              name="heart"
              size={18}
              color={isLiked ? '#EF4444' : colors.iconSecondary}
              style={isLiked && styles.heartFilled}
            />
          </TouchableOpacity>
        )}

        {/* Remove or Options */}
        {showRemove && onRemove ? (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onRemove(item)}
            hitSlop={{top: 10, bottom: 10, left: 8, right: 8}}>
            <Feather name="trash-2" size={18} color="#EF4444" />
          </TouchableOpacity>
        ) : onOptionsPress ? (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onOptionsPress(item)}
            hitSlop={{top: 10, bottom: 10, left: 8, right: 8}}>
            <Feather
              name="more-vertical"
              size={18}
              color={colors.iconSecondary}
            />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

export default SongCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
    marginVertical: 1,
  },
  mainTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: spacing.sm,
  },
  thumbnail: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    flexShrink: 0,
  },
  indexText: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSize.sm,
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSize.md,
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  playingBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.xs,
  },
  playingBadgeText: {
    fontFamily: fontFamilies.bold,
    fontSize: 10,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  artist: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSize.sm,
    flexShrink: 1,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flexShrink: 0,
  },
  actionBtn: {
    padding: spacing.xs + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartFilled: {
    color: '#EF4444',
  },
});
