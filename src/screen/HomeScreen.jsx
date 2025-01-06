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
import TrackPlayer from 'react-native-track-player';
import SongCard from '../components/SongCard';
import FloatingPlayer from '../components/FloatingPlayer';
import {useTheme} from '@react-navigation/native';
import Header from '../components/Header';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
const HomeScreen = () => {
  const {colors} = useTheme();
  const [localSongs, setLocalSongs] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Loading state

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
          item.name.endsWith('.mp3') || // Supported formats
          item.name.endsWith('.wav') ||
          item.name.endsWith('.m4a') ||
          item.name.endsWith('.flac')
        ) {
          // Add audio file
          audioFiles.push({
            url: 'file://' + item.path, // Local file URI
            title: item.name.replace(/\.[^/.]+$/, ''), // Remove file extension
            artist: 'Unknown Artist', // Default artist
            artwork: 'https://via.placeholder.com/150', // Default artwork
          });
        }
      }
      return audioFiles;
    } catch (err) {
      console.warn('Error scanning directory:', err);
      return [];
    }
  };

  // Scan all songs from the root storage
  const loadAllSongs = async () => {
    try {
      setIsLoading(true);
      const permissionGranted = await requestPermission();
      if (!permissionGranted) {
        console.warn('Storage permission denied');
        return;
      }

      const basePaths = [
        RNFS.DownloadDirectoryPath, // Downloads folder
        RNFS.DocumentDirectoryPath, // App-specific files
        RNFS.ExternalStorageDirectoryPath + '/Music', // Music folder
        RNFS.ExternalStorageDirectoryPath, // Root directory (External Storage)
      ];

      let allAudioFiles = [];

      for (const path of basePaths) {
        const audioFiles = await scanDirectories(path);
        allAudioFiles = [...allAudioFiles, ...audioFiles]; // Merge songs from all folders
      }

      // **Remove duplicate songs based on 'url'**
      const uniqueSongs = allAudioFiles.filter(
        (song, index, self) =>
          index === self.findIndex(s => s.url === song.url), // Compare by 'url'
      );

      setLocalSongs(uniqueSongs); // Update state with unique songs
      await TrackPlayer.reset(); // Clear existing track queue
      await TrackPlayer.add(uniqueSongs); // Add only unique songs to the player
    } catch (err) {
      console.warn('Error loading songs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Track Playback
  const handlePlayTrack = async track => {
    const index = localSongs.findIndex(song => song.url === track.url);

    await TrackPlayer.reset(); // Clear the previous queue
    await TrackPlayer.add(localSongs); // Add all songs to the queue
    await TrackPlayer.skip(index); // Start playing the selected track
    await TrackPlayer.play(); // Play the track
    setCurrentTrack(track);
  };

  useEffect(() => {
    loadAllSongs(); // Load songs on initial render
  }, []);

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Header />
      <View style={styles.headerContainer}>
        {/* Left Side: Title */}
        <Text style={[styles.headerTitle, {color: colors.textPrimary}]}>
          All Songs
        </Text>

        <TouchableOpacity onPress={loadAllSongs} disabled={isLoading}>
          {isLoading ? (
            <MaterialIcons
              name="hourglass-empty" // Loading icon
              size={28}
              color={colors.textPrimary}
            />
          ) : (
            <MaterialIcons
              name="refresh" // Refresh icon
              size={28}
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
          />
        )}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{paddingBottom: 100}}
      />

      {currentTrack && <FloatingPlayer track={currentTrack} />}
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addButton: {
    padding: 16,
    backgroundColor: '#1DB954',
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerContainer: {
    flexDirection: 'row', // Horizontal layout
    alignItems: 'center', // Center vertically
    justifyContent: 'space-between', // Space between left and right items
    padding: 16, // Padding for spacing
    marginTop: Platform.OS === 'ios' ? 50 : 20, // Handle status bar space
  },
  headerTitle: {
    fontSize: 20, // Title font size
    fontWeight: 'bold', // Bold text
  },
});
