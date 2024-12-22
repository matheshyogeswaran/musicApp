import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
//import {colors} from '../constants/colors';
import AntDesign from 'react-native-vector-icons/AntDesign';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import {fontSize, iconSizes, spacing} from '../constants/dimensions';
import {fontFamilies} from '../constants/fonts';
import SongCard from '../components/SongCard';
import FloatingPlayer from '../components/FloatingPlayer';
import useLikeSongs from '../store/likeStore';
import {useNavigation, useTheme} from '@react-navigation/native';
import TrackPlayer from 'react-native-track-player';

const LikeScreen = () => {
  const {colors} = useTheme();
  const navigation = useNavigation();
  const {likedSongs, addToLiked} = useLikeSongs();
  const [currentTrack, setCurrentTrack] = useState(null);

  const handleGoBack = () => {
    navigation.goBack();
  };
  const handlePlayTrack = async (selectedTrack, songs = likedSongs) => {
    //const songs = item.songs;
    console.log('seleted song-------', selectedTrack);
    setCurrentTrack(selectedTrack);
    //make a queue and play songs
    const trackIndex = songs.findIndex(
      track => track.url === selectedTrack.url,
    );
    console.log('track', trackIndex);
    //if track not exist
    if (trackIndex === -1) {
      return;
    }
    const beforeTracks = songs.slice(0, trackIndex);
    console.log('before', beforeTracks);

    const afterTracks = songs.slice(trackIndex + 1);
    console.log('after', afterTracks);

    await TrackPlayer.reset();
    await TrackPlayer.add(selectedTrack);
    await TrackPlayer.add(afterTracks);
    await TrackPlayer.add(beforeTracks);
    await TrackPlayer.play();
  };
  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={handleGoBack}>
          <AntDesign
            name={'arrowleft'}
            size={iconSizes.md}
            color={colors.iconPrimary}
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <SimpleLineIcons
            name={'equalizer'}
            size={iconSizes.md}
            color={colors.iconPrimary}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        ListHeaderComponent={
          <Text style={[styles.title, {color: colors.textPrimary}]}>
            Liked Songs
          </Text>
        }
        data={likedSongs}
        renderItem={({item}) => (
          <SongCard
            containerStyle={{width: '46%'}}
            imageStyle={{
              height: 160,
              width: 160,
            }}
            item={item}
            handlePlay={item => handlePlayTrack(item)}
          />
        )}
        numColumns={2}
        contentContainerStyle={{
          paddingBottom: 400,
          paddingHorizontal: 20,
        }}
        columnWrapperStyle={{
          justifyContent: 'space-between',
          marginVertical: spacing.lg,
        }}
      />
      {currentTrack && <FloatingPlayer track={currentTrack} />}
    </View>
  );
};

export default LikeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginTop: Platform.OS === 'ios' ? spacing.xl : 0,
  },
  title: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSize.xl,
    paddingTop: spacing.sm,
    //padding: spacing.lg,
  },
});
