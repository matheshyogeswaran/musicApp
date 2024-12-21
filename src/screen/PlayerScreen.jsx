import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import {colors} from '../constants/colors';
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
import { useNavigation } from '@react-navigation/native';

const imageUrl =
  'https://ncsmusic.s3.eu-west-1.amazonaws.com/tracks/000/001/644/325x325/pretty-afternoon-1709859658-TKAtqZGQtZ.jpg';
const PlayerScreen = () => {

  const navigation = useNavigation();
  const goBack = ()=>{
    navigation.navigate('LIKE_SCREEN');
  }
  const isLiked = true;
  const isMute = false;
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={goBack}>
          <AntDesign
            name={'arrowleft'}
            size={iconSizes.md}
            color={colors.iconPrimary}
          />
        </TouchableOpacity>
        <Text style={styles.headerText}>Playing Now</Text>
      </View>

      <View style={styles.coverImageContainer}>
        <Image source={{uri: imageUrl}} style={styles.coverImage} />
      </View>

      {/* render title and artist */}
      <View style={styles.titleRowHeartContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Beliver</Text>
          <Text style={styles.artist}>IMAGINE DRAGON</Text>
        </View>
        <TouchableOpacity>
          <AntDesign
            name={isLiked ? 'heart' : 'hearto'}
            color={colors.iconSecondary}
            size={iconSizes.md}
          />
        </TouchableOpacity>
      </View>

      {/* Player Control */}
      <View style={styles.playerControlContainer}>
        <TouchableOpacity style={styles.volumnWrapper}>
          <Feather
            name={isMute ? 'volume-x' : 'volume-1'}
            size={iconSizes.md}
            color={colors.iconPrimary}
          />
        </TouchableOpacity>
        <View style={styles.repeatWrapper}>
          <PlayerRepeatToggle />
          <PlayerShuffleToggle />
        </View>
      </View>

      {/* player progress bar */}
      <PlayerProgressBar />

      <View style={styles.playPauseContainer}>
        <GotoPreviousButton size={iconSizes.xl} />
        <PlayPauseButton size={iconSizes.xl} />
        <GotoNextButton size={iconSizes.xl}/>
      </View>
    </View>
  );
};

export default PlayerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    color: colors.textPrimary,
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
    color: colors.textPrimary,
    fontSize: fontSize.xl,
    fontFamily: fontFamilies.medium,
  },
  artist: {
    color: colors.textSecondary,
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
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
    gap:spacing.xl,
    marginTop:spacing.lg,
  },
});
