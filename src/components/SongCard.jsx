import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {colors} from '../constants/colors';
import {fontFamilies} from '../constants/fonts';
import {fontSize, spacing} from '../constants/dimensions';

const imageUrl =
  'https://ncsmusic.s3.eu-west-1.amazonaws.com/tracks/000/001/644/325x325/pretty-afternoon-1709859658-TKAtqZGQtZ.jpg';

const SongCard = () => {
  return (
    <TouchableOpacity style={styles.container}>
      <Image source={{uri: imageUrl}} style={styles.coverImage} />
      <Text style={styles.title}> Monster Go Home</Text>
      <Text style={styles.artist}> Alan Walker</Text>
    </TouchableOpacity>
  );
};

export default SongCard;

const styles = StyleSheet.create({
  container: {
    height: 350,
    width: 250,
  },
  coverImage: {
    width: 275,
    height: 275,
    borderRadius: 15,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fontFamilies.medium,
    textAlign: 'center',
    fontSize: fontSize.lg,
    paddingVertical: spacing.sm,
  },
  artist: {
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: fontSize.md,
    fontFamily: fontFamilies.regular,
  },
});
