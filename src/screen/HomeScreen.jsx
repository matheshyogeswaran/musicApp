import React, {useState, useEffect, useMemo} from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import RNFS from 'react-native-fs';
import DocumentPicker, {types, isCancel} from 'react-native-document-picker';
import TrackPlayer, {useActiveTrack} from 'react-native-track-player';
import SongCard from '../components/SongCard';
import FloatingPlayer from '../components/FloatingPlayer';
import AddToPlaylistModal from '../components/AddToPlaylistModal';
import {useNavigation, useTheme} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Header from '../components/Header';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {spacing, fontSize, radius} from '../constants/dimensions';
import {fontFamilies} from '../constants/fonts';
import useSongStore from '../store/songStore';
import usePlaylistStore from '../store/playlistStore';
import useLikeSongs from '../store/likeStore';
import {recommendedSongs} from '../data/songs';

const HomeScreen = () => {
  const {colors} = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const activeTrack = useActiveTrack();
  const {playlists} = usePlaylistStore();
  const {likedSongs} = useLikeSongs();

  const [localSongs, setLocalSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSongForPlaylist, setSelectedSongForPlaylist] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'PLAYLISTS' | 'LIKED'

  // Request storage permissions
  const requestPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const apiLevel = Platform.Version;

        if (apiLevel >= 33) {
          const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
          );
          return result === PermissionsAndroid.RESULTS.GRANTED;
        } else {
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

  // Recursive directory scanner
  const scanDirectories = async (directoryPath, audioFiles = []) => {
    try {
      if (!directoryPath) {
        return audioFiles;
      }
      const dirExists = await RNFS.exists(directoryPath);
      if (!dirExists) {
        return audioFiles;
      }

      const items = await RNFS.readDir(directoryPath);

      for (const item of items) {
        if (item.isDirectory()) {
          await scanDirectories(item.path, audioFiles);
        } else {
          const lowerName = (item.name || '').toLowerCase();
          const isAudio =
            lowerName.endsWith('.mp3') ||
            lowerName.endsWith('.wav') ||
            lowerName.endsWith('.m4a') ||
            lowerName.endsWith('.flac') ||
            lowerName.endsWith('.aac') ||
            lowerName.endsWith('.aiff') ||
            lowerName.endsWith('.caf');

          if (isAudio) {
            const cleanPath = item.path.replace(/^file:\/\//, '');
            // Encode the path for iOS AVPlayer so spaces/special characters don't break playback
            const safeUrl =
              Platform.OS === 'ios'
                ? 'file://' + encodeURI(cleanPath)
                : 'file://' + cleanPath;

            audioFiles.push({
              url: safeUrl,
              title: item.name.replace(/\.[^/.]+$/, ''),
              artist: 'Local Audio',
              artwork:
                'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80',
            });
          }
        }
      }
      return audioFiles;
    } catch (err) {
      return audioFiles;
    }
  };

  // Load songs from device storage
  const loadAllSongs = async () => {
    try {
      setIsLoading(true);
      const permissionGranted = await requestPermission();
      if (!permissionGranted) {
        setIsLoading(false);
        return;
      }

      let basePaths = [];
      if (Platform.OS === 'ios') {
        const musicDir = `${RNFS.DocumentDirectoryPath}/Music`;
        try {
          const exists = await RNFS.exists(musicDir);
          if (!exists) {
            await RNFS.mkdir(musicDir);
          }
        } catch (e) {
          console.warn('Could not create Music dir on iOS:', e);
        }

        basePaths = [
          RNFS.DocumentDirectoryPath,
          musicDir,
          RNFS.MainBundlePath,
        ].filter(Boolean);
      } else {
        basePaths = [
          RNFS.DownloadDirectoryPath,
          RNFS.DocumentDirectoryPath,
          `${RNFS.DocumentDirectoryPath}/Music`,
          RNFS.ExternalStorageDirectoryPath + '/Music',
          RNFS.ExternalStorageDirectoryPath,
        ].filter(Boolean);
      }

      let allAudioFiles = [];
      for (const path of basePaths) {
        const audioFiles = await scanDirectories(path);
        allAudioFiles = [...allAudioFiles, ...audioFiles];
      }

      const uniqueSongs = allAudioFiles.filter(
        (song, index, self) =>
          index === self.findIndex(s => s.url === song.url),
      );

      setLocalSongs(uniqueSongs);
      useSongStore.getState().setSongs(uniqueSongs);

      if (uniqueSongs.length > 0) {
        await TrackPlayer.reset();
        await TrackPlayer.add(uniqueSongs);
      }
    } catch (err) {
      console.warn('Error scanning songs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Import audio files from Files app / iCloud Drive / Storage
  const handleImportAudio = async () => {
    try {
      const results = await DocumentPicker.pick({
        type: [types.audio],
        allowMultiSelection: true,
        copyTo: 'cachesDirectory',
      });

      if (!results || results.length === 0) {
        return;
      }

      setIsLoading(true);
      const musicDir = `${RNFS.DocumentDirectoryPath}/Music`;
      const exists = await RNFS.exists(musicDir);
      if (!exists) {
        await RNFS.mkdir(musicDir);
      }

      let importedCount = 0;
      for (const file of results) {
        const fileName = file.name || `imported_${Date.now()}.mp3`;
        const destPath = `${musicDir}/${fileName}`;
        const sourcePath = file.fileCopyUri || file.uri;
        if (sourcePath) {
          const cleanSource = decodeURIComponent(
            sourcePath.replace(/^file:\/\//, ''),
          );
          try {
            await RNFS.copyFile(cleanSource, destPath);
            importedCount++;
          } catch (copyErr) {
            console.warn('Error copying imported file:', copyErr);
          }
        }
      }

      await loadAllSongs();
      if (importedCount > 0) {
        Alert.alert(
          'Import Successful',
          `Added ${importedCount} ${
            importedCount === 1 ? 'track' : 'tracks'
          } to your local library.`,
        );
      }
    } catch (err) {
      if (isCancel(err)) {
        // User closed picker without selecting
      } else {
        console.warn('Error picking audio document:', err);
        Alert.alert(
          'Import Notice',
          'Could not import the selected audio file. Please try again.',
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load sample offline tracks for immediate playback
  const handleLoadSampleTracks = async () => {
    try {
      setIsLoading(true);
      const musicDir = `${RNFS.DocumentDirectoryPath}/Music`;
      const exists = await RNFS.exists(musicDir);
      if (!exists) {
        await RNFS.mkdir(musicDir);
      }

      const samples = recommendedSongs.slice(0, 3);
      for (const track of samples) {
        const safeName =
          track.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() + '.mp3';
        const dest = `${musicDir}/${safeName}`;
        const already = await RNFS.exists(dest);
        if (!already) {
          try {
            await RNFS.downloadFile({
              fromUrl: track.url,
              toFile: dest,
            }).promise;
          } catch (dlErr) {
            console.warn('Download sample error:', dlErr);
          }
        }
      }

      await loadAllSongs();
    } catch (err) {
      console.warn('Error loading sample tracks:', err);
      setLocalSongs(recommendedSongs);
      useSongStore.getState().setSongs(recommendedSongs);
      await TrackPlayer.reset();
      await TrackPlayer.add(recommendedSongs);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllSongs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter songs by search query
  const filteredSongs = useMemo(() => {
    if (!searchQuery.trim()) {
      return localSongs;
    }
    const query = searchQuery.toLowerCase().trim();
    return localSongs.filter(song => {
      const titleMatch = (song.title || '').toLowerCase().includes(query);
      const artistMatch = (song.artist || '').toLowerCase().includes(query);
      return titleMatch || artistMatch;
    });
  }, [localSongs, searchQuery]);

  // Handle Playback
  const handlePlayTrack = async track => {
    if (!track || !track.url) {
      return;
    }
    const queue = filteredSongs.length > 0 ? filteredSongs : localSongs;
    const index = queue.findIndex(song => song?.url === track.url);

    await TrackPlayer.reset();
    await TrackPlayer.add(queue);
    await TrackPlayer.skip(index >= 0 ? index : 0);
    await TrackPlayer.play();
  };

  // Shuffle Play All
  const handleShuffleAll = async () => {
    if (localSongs.length === 0) {
      return;
    }
    const shuffled = [...localSongs].sort(() => Math.random() - 0.5);
    await TrackPlayer.reset();
    await TrackPlayer.add(shuffled);
    await TrackPlayer.skip(0);
    await TrackPlayer.play();
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      {/* Modern Top Header */}
      <Header
        isSearchActive={isSearchActive}
        onSearchPress={() => {
          setIsSearchActive(!isSearchActive);
          if (isSearchActive) {
            setSearchQuery('');
          }
        }}
      />

      {/* Expandable Search Input Bar */}
      {isSearchActive && (
        <View
          style={[
            styles.searchBarContainer,
            {
              backgroundColor:
                colors.surfaceElevated || colors.maximumTintColor + '1A',
              borderColor: colors.border || 'rgba(255,255,255,0.08)',
            },
          ]}>
          <Feather
            name="search"
            size={16}
            color={colors.iconSecondary}
            style={{marginRight: spacing.sm}}
          />
          <TextInput
            style={[styles.searchInput, {color: colors.textPrimary}]}
            placeholder="Search titles or artists..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={true}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x-circle" size={16} color={colors.iconSecondary} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Hero Card Banner */}
      {!isSearchActive && (
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: colors.surface || colors.card || '#111726',
              borderColor: colors.border || 'rgba(255,255,255,0.08)',
            },
          ]}>
          <View style={styles.heroLeft}>
            <Text style={[styles.heroBadge, {color: colors.primary || '#6366F1'}]}>
              LOCAL LIBRARY
            </Text>
            <Text style={[styles.heroTitle, {color: colors.textPrimary}]}>
              Your Music
            </Text>
            <Text style={[styles.heroSubtitle, {color: colors.textSecondary}]}>
              {localSongs.length}{' '}
              {localSongs.length === 1 ? 'audio file' : 'audio files'} discovered
            </Text>
          </View>

          <View style={styles.heroActions}>
            <TouchableOpacity
              style={[
                styles.shuffleBtn,
                {backgroundColor: colors.primary || '#6366F1'},
                localSongs.length === 0 && styles.btnDisabled,
              ]}
              disabled={localSongs.length === 0}
              activeOpacity={0.8}
              onPress={handleShuffleAll}>
              <Feather
                name="shuffle"
                size={15}
                color="#FFFFFF"
                style={styles.iconSpacingSm}
              />
              <Text style={styles.shuffleBtnText}>Shuffle</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.importBtn,
                {
                  backgroundColor:
                    colors.surfaceElevated || colors.maximumTintColor + '22',
                  borderColor: colors.border || 'rgba(255,255,255,0.1)',
                },
              ]}
              onPress={handleImportAudio}
              activeOpacity={0.8}>
              <Feather
                name="folder-plus"
                size={16}
                color={colors.primary || '#6366F1'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.refreshBtn,
                {
                  backgroundColor:
                    colors.surfaceElevated || colors.maximumTintColor + '22',
                  borderColor: colors.border || 'rgba(255,255,255,0.1)',
                },
              ]}
              disabled={isLoading}
              onPress={loadAllSongs}>
              {isLoading ? (
                <ActivityIndicator
                  size="small"
                  color={colors.primary || '#6366F1'}
                />
              ) : (
                <Feather
                  name="refresh-cw"
                  size={16}
                  color={colors.iconPrimary}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Filter Tabs Navigation */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[
            styles.tabPill,
            activeTab === 'ALL'
              ? {backgroundColor: colors.primary || '#6366F1'}
              : [
                  styles.tabPillInactive,
                  {
                    backgroundColor:
                      colors.surfaceElevated || colors.maximumTintColor + '15',
                    borderColor: colors.border || 'rgba(255,255,255,0.06)',
                  },
                ],
          ]}
          onPress={() => setActiveTab('ALL')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'ALL'
                ? styles.tabTextActive
                : {color: colors.textSecondary},
            ]}>
            All Songs ({localSongs.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabPill,
            styles.tabPillInactive,
            {
              backgroundColor:
                colors.surfaceElevated || colors.maximumTintColor + '15',
              borderColor: colors.border || 'rgba(255,255,255,0.06)',
            },
          ]}
          onPress={() => navigation.navigate('PLAYLISTS_SCREEN')}>
          <MaterialIcons
            name="queue-music"
            size={16}
            color={colors.textSecondary}
            style={styles.iconSpacingXs}
          />
          <Text style={[styles.tabText, {color: colors.textSecondary}]}>
            Playlists ({playlists.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabPill,
            styles.tabPillInactive,
            {
              backgroundColor:
                colors.surfaceElevated || colors.maximumTintColor + '15',
              borderColor: colors.border || 'rgba(255,255,255,0.06)',
            },
          ]}
          onPress={() => navigation.navigate('LIKE_SCREEN')}>
          <Feather
            name="heart"
            size={14}
            color={colors.textSecondary}
            style={styles.iconSpacingXs}
          />
          <Text style={[styles.tabText, {color: colors.textSecondary}]}>
            Liked ({likedSongs.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Songs List */}
      <FlatList
        data={filteredSongs}
        keyExtractor={(item, index) => `${item.url}_${index}`}
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingBottom: activeTrack ? insets.bottom + 110 : insets.bottom + 40,
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {isLoading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator
                  size="large"
                  color={colors.primary || '#6366F1'}
                />
                <Text
                  style={[
                    styles.emptySubtitle,
                    {color: colors.textSecondary, marginTop: spacing.md},
                  ]}>
                  Scanning device audio files...
                </Text>
              </View>
            ) : (
              <View style={styles.emptyBox}>
                <Feather
                  name={searchQuery ? 'search' : 'music'}
                  size={48}
                  color={colors.iconSecondary}
                  style={{marginBottom: spacing.md}}
                />
                <Text style={[styles.emptyTitle, {color: colors.textPrimary}]}>
                  {searchQuery ? 'No Results Found' : 'No Local Songs Found'}
                </Text>
                <Text
                  style={[styles.emptySubtitle, {color: colors.textSecondary}]}>
                  {searchQuery
                    ? `No songs matched "${searchQuery}". Check the spelling.`
                    : Platform.OS === 'ios'
                    ? 'Import audio files from your Files app / iCloud Drive, transfer via Finder, or load sample tracks.'
                    : 'Ensure audio files are in Downloads, Music, or import directly from device files.'}
                </Text>

                {!searchQuery && (
                  <View style={styles.emptyActionButtons}>
                    <TouchableOpacity
                      style={[
                        styles.emptyPrimaryBtn,
                        {backgroundColor: colors.primary || '#6366F1'},
                      ]}
                      onPress={handleImportAudio}
                      activeOpacity={0.8}>
                      <Feather
                        name="folder-plus"
                        size={16}
                        color="#FFFFFF"
                        style={styles.iconSpacingSm}
                      />
                      <Text style={styles.emptyPrimaryBtnText}>
                        Import from Files
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.emptySecondaryBtn,
                        {
                          backgroundColor:
                            colors.surfaceElevated ||
                            colors.maximumTintColor + '22',
                          borderColor:
                            colors.border || 'rgba(255,255,255,0.1)',
                        },
                      ]}
                      onPress={handleLoadSampleTracks}
                      activeOpacity={0.8}>
                      <Feather
                        name="download-cloud"
                        size={15}
                        color={colors.primary || '#6366F1'}
                        style={styles.iconSpacingXs}
                      />
                      <Text
                        style={[
                          styles.emptySecondaryBtnText,
                          {color: colors.textPrimary},
                        ]}>
                        Load Sample Tracks
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.emptyGhostBtn,
                        {
                          borderColor:
                            colors.border || 'rgba(255,255,255,0.08)',
                        },
                      ]}
                      onPress={loadAllSongs}
                      activeOpacity={0.8}>
                      <Feather
                        name="refresh-cw"
                        size={14}
                        color={colors.textSecondary}
                        style={styles.iconSpacingXs}
                      />
                      <Text
                        style={[
                          styles.emptyGhostBtnText,
                          {color: colors.textSecondary},
                        ]}>
                        Rescan Storage
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
        }
        renderItem={({item, index}) => (
          <SongCard
            item={item}
            index={index}
            handlePlay={selectedTrack => handlePlayTrack(selectedTrack)}
            onOptionsPress={track => setSelectedSongForPlaylist(track)}
          />
        )}
      />

      {/* Floating Mini Player */}
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
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    fontFamily: fontFamilies.regular,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  heroLeft: {
    flex: 1,
  },
  heroBadge: {
    fontFamily: fontFamilies.bold,
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 2,
  },
  heroTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSize.xl,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  shuffleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
  },
  shuffleBtnText: {
    color: '#FFFFFF',
    fontFamily: fontFamilies.bold,
    fontSize: fontSize.sm,
  },
  importBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    gap: spacing.xs + 2,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
  },
  tabPillInactive: {
    borderWidth: 1,
  },
  tabText: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSize.xs,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  iconSpacingSm: {
    marginRight: 6,
  },
  iconSpacingXs: {
    marginRight: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: spacing.xl,
  },
  loadingBox: {
    alignItems: 'center',
  },
  emptyBox: {
    alignItems: 'center',
    width: '100%',
  },
  emptyTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSize.lg,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  emptyActionButtons: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.full,
    width: '80%',
    maxWidth: 260,
  },
  emptyPrimaryBtnText: {
    color: '#FFFFFF',
    fontFamily: fontFamilies.bold,
    fontSize: fontSize.sm,
  },
  emptySecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    borderWidth: 1,
    width: '80%',
    maxWidth: 260,
  },
  emptySecondaryBtnText: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSize.sm,
  },
  emptyGhostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    marginTop: spacing.xs,
  },
  emptyGhostBtnText: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSize.xs,
  },
});
