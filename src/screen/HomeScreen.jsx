import React, {useState, useEffect} from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import RNFS from 'react-native-fs';
import TrackPlayer, {useActiveTrack} from 'react-native-track-player';
import SongCard from '../components/SongCard';
import FloatingPlayer from '../components/FloatingPlayer';
import AddToPlaylistModal from '../components/AddToPlaylistModal';
import {useNavigation, useTheme} from '@react-navigation/native';
import Header from '../components/Header';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {iconSizes, spacing, fontSize} from '../constants/dimensions';
import {fontFamilies} from '../constants/fonts';
import useSongStore from '../store/songStore';

const HomeScreen = () => {
  const {colors} = useTheme();
  const navigation = useNavigation();
  const activeTrack = useActiveTrack();
  const [localSongs, setLocalSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSongForPlaylist, setSelectedSongForPlaylist] = useState(null);

  // Request storage permissions
  const requestPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const apiLevel = Platform.Version;

        if (apiLevel >= 33) {
          // For Android 13+
          const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
          );
          return result === PermissionsAndroid.RESULTS.GRANTED;
        } else {
          // For older versions
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          ]);

          return (
            granted['android.permission.READ_EXTERNAL_STORAGE'] ===
              PermissionsAndroid.RESULTS.GRANTED &&
            granted['android.permission.WRITE_EXTERNAL_STORAGE'] ===
              PermissionsAndroid.RESULTS.GRANTED
          );
        }
      }
      return true;
    } catch (err) {
      console.warn('Permission error:', err);
      return false;
    }
  };

  // Recursive function to scan directories for audio files
  const scanDirectories = async (directoryPath, audioFiles = []) => {
    try {
      const items = await RNFS.readDir(directoryPath);

      for (const item of items) {
        if (item.isDirectory()) {
          // Recursively scan subdirectories
          await scanDirectories(item.path, audioFiles);
        } else if (
          item.name.endsWith('.mp3') ||
          item.name.endsWith('.wav') ||
          item.name.endsWith('.m4a') ||
          item.name.endsWith('.flac')
        ) {
          // Add audio file
          audioFiles.push({
            url: 'file://' + item.path,
            title: item.name.replace(/\.[^/.]+$/, ''),
            artist: 'Unknown Artist',
            artwork: 'https://via.placeholder.com/150',
          });
        }
      }
      return audioFiles;
    } catch (err) {
      console.warn('Error scanning directory:', err);
      return [];
    }
  };

  // Scan all songs from root storage
  const loadAllSongs = async () => {
    try {
      setIsLoading(true);
      const permissionGranted = await requestPermission();
      if (!permissionGranted) {
        console.warn('Storage permission denied');
        return;
      }

      const basePaths = [
        RNFS.DownloadDirectoryPath,
        RNFS.DocumentDirectoryPath,
        RNFS.ExternalStorageDirectoryPath + '/Music',
        RNFS.ExternalStorageDirectoryPath,
      ];

      let allAudioFiles = [];

      for (const path of basePaths) {
        const audioFiles = await scanDirectories(path);
        allAudioFiles = [...allAudioFiles, ...audioFiles];
      }

      // Remove duplicate songs based on 'url'
      const uniqueSongs = allAudioFiles.filter(
        (song, index, self) =>
          index === self.findIndex(s => s.url === song.url),
      );

      setLocalSongs(uniqueSongs);
      useSongStore.getState().setSongs(uniqueSongs);

      await TrackPlayer.reset();
      await TrackPlayer.add(uniqueSongs);
    } catch (err) {
      console.warn('Error loading songs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Track Playback
  const handlePlayTrack = async track => {
    const index = localSongs.findIndex(song => song.url === track.url);

    await TrackPlayer.reset();
    await TrackPlayer.add(localSongs);
    await TrackPlayer.skip(index);
    await TrackPlayer.play();
  };

  useEffect(() => {
    loadAllSongs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Header />

      <View style={styles.headerContainer}>
        {/* Left Side: Title and Playlists shortcut */}
        <View style={styles.headerLeftRow}>
          <Text style={[styles.headerTitle, {color: colors.textPrimary}]}>
            All Songs
          </Text>
          <TouchableOpacity
            style={[
              styles.playlistShortcutBtn,
              {
                borderColor: colors.maximumTintColor + '44',
                backgroundColor: colors.maximumTintColor + '15',
              },
            ]}
            onPress={() => navigation.navigate('PLAYLISTS_SCREEN')}>
            <MaterialIcons
              name="queue-music"
              size={iconSizes.sm}
              color={colors.iconPrimary}
              style={{marginRight: 4}}
            />
            <Text
              style={[
                styles.playlistShortcutText,
                {color: colors.textPrimary},
              ]}>
              Playlists
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={loadAllSongs} disabled={isLoading}>
          {isLoading ? (
            <MaterialIcons
              name="hourglass-empty"
              size={26}
              color={colors.textPrimary}
            />
          ) : (
            <MaterialIcons
              name="refresh"
              size={26}
              color={colors.textPrimary}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Display Songs */}
      <FlatList
        data={localSongs}
        renderItem={({item}) => (
          <SongCard
            item={item}
            handlePlay={selectedTrack => handlePlayTrack(selectedTrack)}
            onOptionsPress={track => setSelectedSongForPlaylist(track)}
          />
        )}
        keyExtractor={(item, index) => `${item.url}_${index}`}
        contentContainerStyle={{paddingBottom: 100}}
      />

      {/* Floating Player */}
      {activeTrack && <FloatingPlayer />}

      {/* Add To Playlist Modal */}
      <AddToPlaylistModal
        visible={selectedSongForPlaylist !== null}
        onClose={() => setSelectedSongForPlaylist(null)}
        song={selectedSongForPlaylist}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontFamily: fontFamilies.bold,
  },
  playlistShortcutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xm,
  },
  playlistShortcutText: {
    fontSize: fontSize.sm,
    fontFamily: fontFamilies.medium,
  },
});
