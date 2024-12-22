import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import {colors} from '../constants/colors';
import Header from '../components/Header';
import {fontFamilies} from '../constants/fonts';
import {fontSize, spacing} from '../constants/dimensions';
import SongCard from '../components/SongCard';
import SongCardWithCategory from '../components/SongCardWithCategory';
import {SafeAreaView} from 'react-native-safe-area-context';
import FloatingPlayer from '../components/FloatingPlayer';
import {songsWithCategory} from '../data/songsWithCategory';
import TrackPlayer, {Event, useTrackPlayerEvents } from 'react-native-track-player';

const HomeScreen = () => {
  const [currentTrack, setCurrentTrack] = useState(null); // Track the current song

  // Listen for track changes and update Floating Player
  useTrackPlayerEvents([Event.PlaybackTrackChanged], async event => {
    if (event.nextTrack) {
      const track = await TrackPlayer.getTrack(event.nextTrack); // Get track details
      setCurrentTrack(track); // Update Floating Player
    }
  });
  return (
    <View style={styles.container}>
      <Header />
      <FlatList
        data={songsWithCategory}
        renderItem={({item}) => (
          <SongCardWithCategory
            item={item}
            onTrackSelect={track => setCurrentTrack(track)} // Pass callback
          />
        )}
        contentContainerStyle={{
          paddingBottom: 400,
        }}
      />
      {currentTrack && <FloatingPlayer track={currentTrack} />}
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
});
