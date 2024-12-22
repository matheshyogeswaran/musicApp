import {
  ActivityIndicator,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
//import {colors} from '../constants/colors';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import {fontSize, iconSizes, spacing} from '../constants/dimensions';
import {fontFamilies} from '../constants/fonts';
import PlayerRepeatToggle from '../components/PlayerRepeatToggle';
import PlayerShuffleToggle from '../components/PlayerShuffleToggle';
import PlayerProgressBar from '../components/PlayerProgressBar';
import {
  GotoNextButton,
  GotoPreviousButton,
  PlayPauseButton,
} from '../components/PlayerControls';
import {useNavigation, useTheme} from '@react-navigation/native';

import {useRoute} from '@react-navigation/native';
import TrackPlayer, {useActiveTrack} from 'react-native-track-player';
import useLikeSongs from '../store/likeStore';
import {isExist} from '../utills';

const PlayerScreen = () => {
  const {colors} = useTheme();
  const {likedSongs, addToLiked} = useLikeSongs();
  //console("liked songs",likedSongs);
  const activeTrack = useActiveTrack();
  console.log('active track', activeTrack);
  const navigation = useNavigation();
  const route = useRoute(); // Get route params
  const [isMute, setIsMute] = useState(false);

  useEffect(() => {
    setVolume();
  }, []);
  const setVolume = async () => {
    const volume = await TrackPlayer.getVolume();
    setIsMute(volume === 0 ? true : false);
  };

  const goBack = () => {
    // navigation.navigate('LIKE_SCREEN');
    navigation.goBack();
  };
  const handleToggleVolumn = () => {
    TrackPlayer.setVolume(isMute ? 1 : 0);
    setIsMute(!isMute);
  };

  if (!activeTrack) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        }}>
        <ActivityIndicator size={'large'} color={colors.iconPrimary} />
      </View>
    );
  }

  const isLiked = true;

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

      <View style={styles.coverImageContainer}>
        {/* Use track.artwork and track details dynamically */}
        <Image source={{uri: activeTrack?.artwork}} style={styles.coverImage} />
      </View>

      <View style={styles.titleRowHeartContainer}>
        <View style={styles.titleContainer}>
          {/* Display dynamic title and artist */}
          <Text style={[styles.title, {color: colors.textPrimary}]}>
            {activeTrack?.title}
          </Text>
          <Text style={[styles.artist, {color: colors.textSecondary}]}>
            {activeTrack?.artist}
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
          {/* <PlayerRepeatToggle /> */}
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
    // paddingHorizontal: spacing.lg,
    width: '100%',
  },
  headerText: {
    textAlign: 'center',
    fontSize: fontSize.lg,
    fontStyle: fontFamilies.medium,
    flex: 1,
  },
  coverImage: {
    height: 300,
    width: 300,
    borderRadius: 15,
  },
  coverImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.lg,
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
});
