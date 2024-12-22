import {StyleSheet, Text, View, FlatList} from 'react-native';
import React from 'react';
import SongCard from './SongCard';
import {fontSize, spacing} from '../constants/dimensions';
import {colors} from '../constants/colors';
import {fontFamilies} from '../constants/fonts';
import TrackPlayer from 'react-native-track-player';

const SongCardWithCategory = ({item,onTrackSelect}) => {
  //create a function that will play in queue
  const handlePlayTrack = async (selectedTrack) => {
    const songs =item.songs;
    console.log('seleted song-------', selectedTrack);
    //make a queue and play songs
    const trackIndex = songs.findIndex(
      track => track.url === selectedTrack.url,
    );
    console.log('track', trackIndex);
    //if track not exist
    if(trackIndex === -1){
      return;
    }
    const beforeTracks = songs.slice(0,trackIndex);
    console.log("before",beforeTracks);

    const afterTracks = songs.slice(trackIndex+1);
    console.log("after",afterTracks)

    await TrackPlayer.reset();
    await TrackPlayer.add(selectedTrack);
    await TrackPlayer.add(afterTracks);
    await TrackPlayer.add(beforeTracks);
    await TrackPlayer.play();
    onTrackSelect(selectedTrack);

  };
  return (
    <View style={styles.container}>
      <Text style={styles.headingText}>{item.title}</Text>
      <FlatList
        data={item.songs}
        renderItem={({item}) => (
          <SongCard
            item={item}
            handlePlay={selectedTrack => {
              console.log('select', selectedTrack);
              handlePlayTrack(selectedTrack);
            }}
          />
        )}
        horizontal={true}
        ItemSeparatorComponent={<View style={{marginHorizontal: spacing.lg}} />}
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
        }}
      />
    </View>
  );
};

export default SongCardWithCategory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headingText: {
    fontSize: fontSize.xl,
    color: colors.textPrimary,
    fontFamily: fontFamilies.bold,
    marginVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
});
