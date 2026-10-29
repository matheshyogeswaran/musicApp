import React, {useState, useMemo} from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {useNavigation, useRoute, useTheme} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import TrackPlayer, {useActiveTrack} from 'react-native-track-player';
import {fontSize, spacing, radius} from '../constants/dimensions';
import {fontFamilies} from '../constants/fonts';
import usePlaylistStore from '../store/playlistStore';
import useSongStore from '../store/songStore';
import SongCard from '../components/SongCard';
import FloatingPlayer from '../components/FloatingPlayer';

const PlaylistDetailScreen = () => {
  const {colors} = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const activeTrack = useActiveTrack();
  const {playlistId} = route.params || {};

  const {
    playlists,
    renamePlaylist,
    deletePlaylist,
    removeSongFromPlaylist,
    addSongToPlaylist,
  } = usePlaylistStore();

  const allLocalSongs = useSongStore(state => state.songs);
  const playlist = playlists.find(p => p.id === playlistId);

  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState(playlist?.name || '');
  const [isAddSongsOpen, setIsAddSongsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Playback handlers
  const handlePlaySong = async (track, index) => {
    if (!playlist?.songs) {
      return;
    }
    try {
      await TrackPlayer.reset();
      await TrackPlayer.add(playlist.songs);
      await TrackPlayer.skip(index);
      await TrackPlayer.play();
    } catch (e) {
      console.warn('Error playing playlist song:', e);
    }
  };

  const handlePlayAll = async () => {
    if (!playlist?.songs || playlist.songs.length === 0) {
      return;
    }
    try {
      await TrackPlayer.reset();
      await TrackPlayer.add(playlist.songs);
      await TrackPlayer.skip(0);
      await TrackPlayer.play();
    } catch (e) {
      console.warn('Error playing all songs:', e);
    }
  };

  const handleShufflePlay = async () => {
    if (!playlist?.songs || playlist.songs.length === 0) {
      return;
    }
    try {
      const shuffled = [...playlist.songs].sort(() => Math.random() - 0.5);
      await TrackPlayer.reset();
      await TrackPlayer.add(shuffled);
      await TrackPlayer.skip(0);
      await TrackPlayer.play();
    } catch (e) {
      console.warn('Error shuffling playlist:', e);
    }
  };

  const handleRemoveSong = track => {
    Alert.alert(
      'Remove Song',
      `Remove "${track.title}" from this playlist?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            if (track?.url) {
              removeSongFromPlaylist(playlist.id, track.url);
            }
          },
        },
      ],
    );
  };

  const handleDeletePlaylist = () => {
    setIsMenuOpen(false);
    Alert.alert(
      'Delete Playlist',
      `Are you sure you want to delete "${playlist.name}"? This cannot be undone.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deletePlaylist(playlist.id);
            navigation.goBack();
          },
        },
      ],
    );
  };

  const handleRenameSubmit = async () => {
    const trimmed = renameValue.trim();
    if (!trimmed) {
      return;
    }
    await renamePlaylist(playlist.id, trimmed);
    setIsRenameOpen(false);
  };

  const filteredLocalSongs = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      return allLocalSongs;
    }
    return allLocalSongs.filter(song => {
      const titleMatch = (song.title || '').toLowerCase().includes(query);
      const artistMatch = (song.artist || '').toLowerCase().includes(query);
      return titleMatch || artistMatch;
    });
  }, [allLocalSongs, searchQuery]);

  if (!playlist) {
    return (
      <View style={[styles.container, styles.centered, {backgroundColor: colors.background}]}>
        <Text style={[styles.notFoundText, {color: colors.textPrimary}]}>
          Playlist not found
        </Text>
        <TouchableOpacity
          style={[styles.backHomeBtn, {backgroundColor: colors.primary || '#6366F1'}]}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backHomeBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[
            styles.headerBtn,
            {
              backgroundColor: colors.surfaceElevated || colors.maximumTintColor + '22',
              borderColor: colors.border || 'rgba(255,255,255,0.08)',
            },
          ]}
          onPress={() => navigation.goBack()}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Feather name="arrow-left" size={20} color={colors.iconPrimary} />
        </TouchableOpacity>

        <Text
          style={[styles.headerTitle, {color: colors.textPrimary}]}
          numberOfLines={1}>
          {playlist.name}
        </Text>

        <TouchableOpacity
          style={[
            styles.headerBtn,
            {
              backgroundColor: colors.surfaceElevated || colors.maximumTintColor + '22',
              borderColor: colors.border || 'rgba(255,255,255,0.08)',
            },
          ]}
          onPress={() => setIsMenuOpen(true)}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Feather name="more-vertical" size={18} color={colors.iconPrimary} />
        </TouchableOpacity>
      </View>

      {/* Playlist Hero Section */}
      <View style={styles.heroContainer}>
        <View
          style={[
            styles.heroArtwork,
            {
              backgroundColor: (colors.primary || '#6366F1') + '1A',
              borderColor: (colors.primary || '#6366F1') + '33',
            },
          ]}>
          <MaterialIcons
            name="library-music"
            size={42}
            color={colors.primary || '#6366F1'}
          />
        </View>

        <Text
          style={[styles.heroTitle, {color: colors.textPrimary}]}
          numberOfLines={2}>
          {playlist.name}
        </Text>
        <Text style={[styles.heroSubtitle, {color: colors.textSecondary}]}>
          {playlist.songs.length}{' '}
          {playlist.songs.length === 1 ? 'track' : 'tracks'}
        </Text>

        {/* Action Controls */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={[
              styles.playAllBtn,
              {backgroundColor: colors.primary || '#6366F1'},
              playlist.songs.length === 0 && styles.btnDisabled,
            ]}
            disabled={playlist.songs.length === 0}
            activeOpacity={0.8}
            onPress={handlePlayAll}>
            <Feather name="play" size={16} color="#FFFFFF" style={styles.iconMarginSm} />
            <Text style={styles.playAllBtnText}>Play All</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryBtn,
              {
                backgroundColor: colors.surfaceElevated || colors.maximumTintColor + '15',
                borderColor: colors.border || 'rgba(255,255,255,0.08)',
              },
              playlist.songs.length === 0 && styles.btnDisabled,
            ]}
            disabled={playlist.songs.length === 0}
            activeOpacity={0.7}
            onPress={handleShufflePlay}>
            <Feather
              name="shuffle"
              size={15}
              color={colors.iconPrimary}
              style={styles.iconMarginXs}
            />
            <Text
              style={[styles.secondaryBtnText, {color: colors.textPrimary}]}>
              Shuffle
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryBtn,
              {
                backgroundColor: colors.surfaceElevated || colors.maximumTintColor + '15',
                borderColor: colors.border || 'rgba(255,255,255,0.08)',
              },
            ]}
            activeOpacity={0.7}
            onPress={() => setIsAddSongsOpen(true)}>
            <Feather
              name="plus"
              size={15}
              color={colors.iconPrimary}
              style={styles.iconMarginXs}
            />
            <Text
              style={[styles.secondaryBtnText, {color: colors.textPrimary}]}>
              Add Tracks
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Song List */}
      {playlist.songs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather
            name="music"
            size={48}
            color={colors.iconSecondary}
            style={{marginBottom: spacing.md}}
          />
          <Text style={[styles.emptyTitle, {color: colors.textPrimary}]}>
            This Playlist is Empty
          </Text>
          <Text style={[styles.emptySubtitle, {color: colors.textSecondary}]}>
            Add tracks from your local audio library to begin listening.
          </Text>
          <TouchableOpacity
            style={[
              styles.emptyAddBtn,
              {backgroundColor: colors.primary || '#6366F1'},
            ]}
            activeOpacity={0.85}
            onPress={() => setIsAddSongsOpen(true)}>
            <Feather
              name="plus"
              size={16}
              color="#FFFFFF"
              style={{marginRight: spacing.xs}}
            />
            <Text style={styles.emptyAddBtnText}>Add Songs from Library</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={playlist.songs}
          keyExtractor={(item, index) => `${item.url}_${index}`}
          contentContainerStyle={{
            paddingHorizontal: spacing.md,
            paddingBottom: activeTrack ? insets.bottom + 110 : insets.bottom + 40,
          }}
          renderItem={({item, index}) => (
            <SongCard
              item={item}
              index={index}
              handlePlay={() => handlePlaySong(item, index)}
              showRemove={true}
              onRemove={handleRemoveSong}
            />
          )}
        />
      )}

      {/* Bottom Floating Player */}
      {activeTrack && <FloatingPlayer />}

      {/* Add Songs Picker Modal */}
      <Modal
        visible={isAddSongsOpen}
        animationType="slide"
        onRequestClose={() => setIsAddSongsOpen(false)}>
        <View
          style={[styles.pickerContainer, {backgroundColor: colors.background}]}>
          {/* Picker Header */}
          <View style={styles.pickerHeader}>
            <View>
              <Text style={[styles.pickerTitle, {color: colors.textPrimary}]}>
                Add Songs
              </Text>
              <Text style={[styles.pickerSubtitle, {color: colors.textSecondary}]}>
                {playlist.name}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.pickerDoneBtn,
                {backgroundColor: colors.primary || '#6366F1'},
              ]}
              onPress={() => setIsAddSongsOpen(false)}>
              <Text style={styles.pickerDoneText}>Done</Text>
            </TouchableOpacity>
          </View>

          {/* Search Box */}
          <View
            style={[
              styles.searchBox,
              {
                backgroundColor: colors.surfaceElevated || colors.maximumTintColor + '1A',
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
              placeholder="Search by title or artist..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Feather
                  name="x-circle"
                  size={16}
                  color={colors.iconSecondary}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Songs List */}
          <FlatList
            data={filteredLocalSongs}
            keyExtractor={(item, index) => `${item.url}_picker_${index}`}
            contentContainerStyle={{paddingBottom: 80, paddingHorizontal: spacing.sm}}
            ListEmptyComponent={
              <View style={styles.pickerEmpty}>
                <Text
                  style={[styles.pickerEmptyText, {color: colors.textSecondary}]}>
                  {allLocalSongs.length === 0
                    ? 'No local audio files found on device.'
                    : 'No songs matched your search.'}
                </Text>
              </View>
            }
            renderItem={({item}) => {
              const isAlreadyAdded = item?.url
                ? playlist.songs.some(s => s?.url === item.url)
                : false;
              return (
                <View
                  style={[
                    styles.pickerItem,
                    {
                      borderBottomColor:
                        colors.border || 'rgba(255,255,255,0.06)',
                    },
                  ]}>
                  <View style={styles.pickerItemLeft}>
                    <View
                      style={[
                        styles.pickerIconWrapper,
                        {
                          backgroundColor:
                            colors.surfaceElevated ||
                            colors.maximumTintColor + '22',
                        },
                      ]}>
                      <Feather
                        name="music"
                        size={16}
                        color={colors.iconSecondary}
                      />
                    </View>
                    <View style={styles.pickerTextContainer}>
                      <Text
                        style={[
                          styles.pickerSongTitle,
                          {color: colors.textPrimary},
                        ]}
                        numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text
                        style={[
                          styles.pickerSongArtist,
                          {color: colors.textSecondary},
                        ]}
                        numberOfLines={1}>
                        {item.artist && item.artist !== 'Unknown Artist'
                          ? item.artist
                          : 'Local Audio'}
                      </Text>
                    </View>
                  </View>

                  {isAlreadyAdded ? (
                    <TouchableOpacity
                      style={styles.addedBadge}
                      onPress={() => removeSongFromPlaylist(playlist.id, item.url)}>
                      <Feather
                        name="check-circle"
                        size={20}
                        color={colors.primary || '#6366F1'}
                      />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.addBtnCircle}
                      onPress={() => addSongToPlaylist(playlist.id, item)}>
                      <Feather
                        name="plus-circle"
                        size={20}
                        color={colors.iconSecondary}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              );
            }}
          />
        </View>
      </Modal>

      {/* Menu Modal (3 dots) */}
      <Modal
        visible={isMenuOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsMenuOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setIsMenuOpen(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.menuBox,
                  {
                    backgroundColor: colors.surface || colors.card || '#111726',
                    borderColor: colors.border || 'rgba(255,255,255,0.1)',
                  },
                ]}>
                <Text
                  style={[styles.menuTitle, {color: colors.textPrimary}]}
                  numberOfLines={1}>
                  {playlist.name}
                </Text>

                <TouchableOpacity
                  style={styles.menuRow}
                  onPress={() => {
                    setIsMenuOpen(false);
                    setRenameValue(playlist.name);
                    setIsRenameOpen(true);
                  }}>
                  <Feather
                    name="edit-2"
                    size={18}
                    color={colors.iconPrimary}
                    style={{marginRight: spacing.md}}
                  />
                  <Text
                    style={[styles.menuRowText, {color: colors.textPrimary}]}>
                    Rename Playlist
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuRow}
                  onPress={handleDeletePlaylist}>
                  <Feather
                    name="trash-2"
                    size={18}
                    color="#EF4444"
                    style={styles.deleteIcon}
                  />
                  <Text style={[styles.menuRowText, styles.deleteText]}>
                    Delete Playlist
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Rename Modal */}
      <Modal
        visible={isRenameOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsRenameOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setIsRenameOpen(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.modalBox,
                  {
                    backgroundColor: colors.surface || colors.card || '#111726',
                    borderColor: colors.border || 'rgba(255,255,255,0.1)',
                  },
                ]}>
                <Text style={[styles.dialogTitle, {color: colors.textPrimary}]}>
                  Rename Playlist
                </Text>
                <TextInput
                  style={[
                    styles.dialogInput,
                    {
                      color: colors.textPrimary,
                      backgroundColor: colors.surfaceElevated || colors.maximumTintColor + '1A',
                      borderColor: colors.border || 'rgba(255,255,255,0.1)',
                    },
                  ]}
                  value={renameValue}
                  onChangeText={setRenameValue}
                  autoFocus={true}
                />
                <View style={styles.dialogActions}>
                  <TouchableOpacity
                    style={styles.dialogCancelBtn}
                    onPress={() => setIsRenameOpen(false)}>
                    <Text
                      style={[
                        styles.dialogBtnText,
                        {color: colors.textSecondary},
                      ]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.dialogCreateBtn,
                      {backgroundColor: colors.primary || '#6366F1'},
                      !renameValue.trim() && styles.btnDisabled,
                    ]}
                    disabled={!renameValue.trim()}
                    onPress={handleRenameSubmit}>
                    <Text style={styles.dialogCreateBtnText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default PlaylistDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  notFoundText: {
    fontSize: fontSize.lg,
    fontFamily: fontFamilies.bold,
    marginBottom: spacing.md,
  },
  backHomeBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.full,
  },
  backHomeBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize.sm,
    fontFamily: fontFamilies.bold,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? spacing.xl : spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: fontSize.md,
    fontFamily: fontFamilies.bold,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.sm,
    letterSpacing: -0.3,
  },
  heroContainer: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  heroArtwork: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  heroTitle: {
    fontSize: fontSize.xl,
    fontFamily: fontFamilies.bold,
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: 2,
  },
  heroSubtitle: {
    fontSize: fontSize.xs,
    fontFamily: fontFamilies.regular,
    marginBottom: spacing.md,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  playAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
  },
  playAllBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize.xs,
    fontFamily: fontFamilies.bold,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
  },
  secondaryBtnText: {
    fontSize: fontSize.xs,
    fontFamily: fontFamilies.medium,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: 80,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontFamily: fontFamilies.bold,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: fontSize.sm,
    fontFamily: fontFamilies.regular,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
  },
  emptyAddBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize.sm,
    fontFamily: fontFamilies.bold,
  },
  pickerContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  pickerTitle: {
    fontSize: fontSize.xl,
    fontFamily: fontFamilies.bold,
    letterSpacing: -0.4,
  },
  pickerSubtitle: {
    fontSize: fontSize.xs,
    fontFamily: fontFamilies.regular,
    marginTop: 2,
  },
  pickerDoneBtn: {
    paddingVertical: 7,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
  },
  pickerDoneText: {
    color: '#FFFFFF',
    fontSize: fontSize.xs,
    fontFamily: fontFamilies.bold,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.sm,
    fontFamily: fontFamilies.regular,
  },
  pickerEmpty: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  pickerEmptyText: {
    fontSize: fontSize.sm,
    fontFamily: fontFamilies.regular,
    textAlign: 'center',
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
  },
  pickerItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  pickerIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  pickerTextContainer: {
    flex: 1,
  },
  pickerSongTitle: {
    fontSize: fontSize.sm,
    fontFamily: fontFamilies.medium,
  },
  pickerSongArtist: {
    fontSize: fontSize.xs,
    fontFamily: fontFamilies.regular,
    marginTop: 2,
  },
  addedBadge: {
    padding: spacing.xs,
  },
  addBtnCircle: {
    padding: spacing.xs,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalBox: {
    width: '100%',
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
  },
  dialogTitle: {
    fontSize: fontSize.lg,
    fontFamily: fontFamilies.bold,
    marginBottom: spacing.md,
  },
  dialogInput: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    fontFamily: fontFamilies.regular,
    marginBottom: spacing.lg,
  },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
  dialogCancelBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  dialogCreateBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  iconMarginSm: {
    marginRight: 6,
  },
  iconMarginXs: {
    marginRight: 4,
  },
  dialogBtnText: {
    fontSize: fontSize.sm,
    fontFamily: fontFamilies.medium,
  },
  dialogCreateBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize.sm,
    fontFamily: fontFamilies.bold,
  },
  menuBox: {
    width: '85%',
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
  },
  menuTitle: {
    fontSize: fontSize.md,
    fontFamily: fontFamilies.bold,
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
  },
  deleteIcon: {
    marginRight: spacing.md,
  },
  menuRowText: {
    fontSize: fontSize.md,
    fontFamily: fontFamilies.medium,
  },
  deleteText: {
    color: '#EF4444',
  },
});
