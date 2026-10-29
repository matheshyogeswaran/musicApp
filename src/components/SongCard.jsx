import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {fontFamilies} from '../constants/fonts';
import {fontSize, iconSizes, spacing} from '../constants/dimensions';
import {useTheme} from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const SongCard = ({
  item,
  handlePlay,
  onOptionsPress,
  onRemove,
  showRemove = false,
  containerStyle,
}) => {
  const {colors} = useTheme();

  return (
    <View
      style={[
        styles.container,
        {borderBottomColor: colors.maximumTintColor + '22'},
        containerStyle,
      ]}>
      <TouchableOpacity
        style={styles.songContent}
        onPress={() => handlePlay && handlePlay(item)}
        activeOpacity={0.7}>
        <View
          style={[
            styles.iconWrapper,
            {backgroundColor: colors.maximumTintColor + '22'},
          ]}>
          <MaterialIcons
            name="music-note"
            size={iconSizes.sm}
            color={colors.iconSecondary}
          />
        </View>

        <View style={styles.textContainer}>
          <Text
            style={[styles.title, {color: colors.textPrimary}]}
            numberOfLines={1}>
            {item?.title || 'Unknown Title'}
          </Text>
          <Text
            style={[styles.artist, {color: colors.textSecondary}]}
            numberOfLines={1}>
            {item?.artist && item?.artist !== 'Unknown Artist'
              ? item.artist
              : 'Local Audio'}
          </Text>
        </View>
      </TouchableOpacity>

      {showRemove && onRemove ? (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onRemove(item)}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <MaterialIcons
            name="delete-outline"
            size={iconSizes.md}
            color="#FF5252"
          />
        </TouchableOpacity>
      ) : onOptionsPress ? (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onOptionsPress(item)}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <MaterialIcons
            name="more-vert"
            size={iconSizes.md}
            color={colors.iconSecondary}
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default SongCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
  },
  songContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSize.md,
    marginBottom: 2,
  },
  artist: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSize.sm,
  },
  actionButton: {
    padding: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
