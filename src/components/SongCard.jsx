import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fontFamilies } from '../constants/fonts';
import { fontSize, spacing } from '../constants/dimensions';
import { useTheme } from '@react-navigation/native';

const SongCard = ({ item, handlePlay }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => handlePlay(item)}>
      <View style={styles.textContainer}>
        <Text
          style={[styles.title, { color: colors.textPrimary }]}
          numberOfLines={1}>
          {item?.title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default SongCard;

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  textContainer: {
    justifyContent: 'center',
  },
  title: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSize.lg,
  },
});
