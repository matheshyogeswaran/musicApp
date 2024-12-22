import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
//import {colors} from '../constants/colors';
import {fontFamilies} from '../constants/fonts';
import {fontSize, spacing} from '../constants/dimensions';
import TrackPlayer from 'react-native-track-player';
import { useTheme } from '@react-navigation/native';

const imageUrl =
  'https://ncsmusic.s3.eu-west-1.amazonaws.com/tracks/000/001/644/325x325/pretty-afternoon-1709859658-TKAtqZGQtZ.jpg';

const SongCard = ({item, containerStyle, imageStyle ,handlePlay}) => {

  const {colors} =useTheme();
  // const handlePlay = async item => {
  //   // console.log('item', item);
  //   await TrackPlayer.add(item);
  //   await TrackPlayer.play();
  // };
  return (
    <TouchableOpacity
      style={[styles.container, containerStyle]}
      onPress={() => handlePlay(item)}>
      <Image
        source={{uri: item?.artwork}}
        style={[styles.coverImage, imageStyle]}
      />
      <Text style={[styles.title,{color: colors.textPrimary}]} numberOfLines={1}>
        {item?.title}
      </Text>
      <Text style={[styles.artist,{color: colors.textSecondary,}]} numberOfLines={1}>
        {item?.artist}
      </Text>
    </TouchableOpacity>
  );
};

export default SongCard;

const styles = StyleSheet.create({
  container: {
    // height: 350,
    //width: 250,
  },
  coverImage: {
    width: 275,
    height: 275,
    borderRadius: 15,
  },
  title: {
    
    fontFamily: fontFamilies.medium,
    textAlign: 'center',
    fontSize: fontSize.lg,
    paddingVertical: spacing.sm,
  },
  artist: {
    
    textAlign: 'center',
    fontSize: fontSize.md,
    fontFamily: fontFamilies.regular,
  },
});
