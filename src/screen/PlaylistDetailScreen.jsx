import React, {useState} from 'react';
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
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import TrackPlayer, {useActiveTrack} from 'react-native-track-player';
import {fontSize, iconSizes, spacing} from '../constants/dimensions';
import {fontFamilies} from '../constants/fonts';
import usePlaylistStore from '../store/playlistStore';
import useSongStore from '../store/songStore';
import SongCard from '../components/SongCard';
import FloatingPlayer from '../components/FloatingPlayer';

const PlaylistDetailScreen = () => {
  const {colors} = useTheme();
  const navigation = useNavigation();
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

  // Rename modal
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState(playlist?.name || '');

  // Add songs modal
  const [isAddSongsOpen, setIsAddSongsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 3-dots menu modal
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!playlist) {
    return (
      <View style={[styles.container, styles.centered, {backgroundColor: colors.background}]}>
        <Text style={[styles.notFoundText, {color: colors.textPrimary}]}>
          Playlist not found
        </Text>
        <TouchableOpacity
          style={styles.backHomeBtn}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backHomeBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Playback handlers
  const handlePlaySong = async (track, index) => {
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
    if (!playlist.songs || playlist.songs.length === 0) {
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
    if (!playlist.songs || playlist.songs.length === 0) {
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
          onPress: () => removeSongFromPlaylist(playlist.id, track.url),
        },
      ],
    );
  };

  const handleDeletePlaylist = () => {
    setIsMenuOpen(false);
    Alert.alert(
      'Delete Playlist',
      `Are you sure you want to delete "${playlist.name}"?`,
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

  // Filter songs for the add-songs picker modal
  const filteredLocalSongs = allLocalSongs.filter(song => {
    const query = searchQuery.toLowerCase();
    const titleMatch = (song.title || '').toLowerCase().includes(query);
    const artistMatch = (song.artist || '').toLowerCase().includes(query);
    return titleMatch || artistMatch;
  });

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <AntDesign
            name="arrowleft"
            size={iconSizes.md}
            color={colors.iconPrimary}
          />
        </TouchableOpacity>
        <Text
          style={[styles.headerTitle, {color: colors.textPrimary}]}
          numberOfLines={1}>
          {playlist.name}
        </Text>
        <TouchableOpacity
          onPress={() => setIsMenuOpen(true)}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <MaterialIcons
            name="more-vert"
            size={iconSizes.md}
            color={colors.iconPrimary}
          />
        </TouchableOpacity>
      </View>

      {/* Playlist Hero Banner */}
      <View style={styles.heroContainer}>
        <View
          style={[
            styles.heroArtwork,
            {backgroundColor: colors.maximumTintColor + '22'},
          ]}>
          <MaterialIcons
            name="library-music"
            size={48}
            color={colors.iconPrimary}
          />
        </View>

        <Text
          style={[styles.heroTitle, {color: colors.textPrimary}]}
          numberOfLines={2}>
          {playlist.name}
        </Text>
        <Text style={[styles.heroSubtitle, {color: colors.textSecondary}]}>
          {playlist.songs.length}{' '}
          {playlist.songs.length === 1 ? 'song' : 'songs'}
        </Text>

        {/* Action Buttons */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={[
              styles.playAllBtn,
              playlist.songs.length === 0 && {opacity: 0.5},
            ]}
            disabled={playlist.songs.length === 0}
            onPress={handlePlayAll}>
            <MaterialIcons
              name="play-arrow"
              size={iconSizes.md}
              color="#FFFFFF"
            />
            <Text style={styles.playAllBtnText}>Play All</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryBtn,
              {borderColor: colors.maximumTintColor + '44'},
              playlist.songs.length === 0 && {opacity: 0.5},
            ]}
            disabled={playlist.songs.length === 0}
            onPress={handleShufflePlay}>
            <MaterialIcons
              name="shuffle"
              size={iconSizes.sm}
              color={colors.iconPrimary}
            />
            <Text
              style={[styles.secondaryBtnText, {color: colors.textPrimary}]}>
              Shuffle
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryBtn,
              {borderColor: colors.maximumTintColor + '44'},
            ]}
            onPress={() => setIsAddSongsOpen(true)}>
            <AntDesign
              name="plus"
              size={iconSizes.sm}
              color={colors.iconPrimary}
            />
            <Text
              style={[styles.secondaryBtnText, {color: colors.textPrimary}]}>
              Add Songs
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Song List or Empty State */}
      {playlist.songs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons
            name="music-off"
            size={56}
            color={colors.iconSecondary}
            style={{marginBottom: spacing.md}}
          />
          <Text style={[styles.emptyTitle, {color: colors.textPrimary}]}>
            This playlist is empty
          </Text>
          <Text style={[styles.emptySubtitle, {color: colors.textSecondary}]}>
            Add local songs from your library to start listening.
          </Text>
          <TouchableOpacity
            style={styles.emptyAddBtn}
            onPress={() => setIsAddSongsOpen(true)}>
            <AntDesign
              name="plus"
              size={iconSizes.sm}
              color="#FFFFFF"
              style={{marginRight: spacing.sm}}
            />
            <Text style={styles.emptyAddBtnText}>Add Songs from Device</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={playlist.songs}
          keyExtractor={(item, index) => `${item.url}_${index}`}
          contentContainerStyle={{paddingBottom: 120}}
          renderItem={({item, index}) => (
            <SongCard
              item={item}
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
            <Text style={[styles.pickerTitle, {color: colors.textPrimary}]}>
              Add Songs
            </Text>
            <TouchableOpacity
              style={styles.pickerDoneBtn}
              onPress={() => setIsAddSongsOpen(false)}>
              <Text style={styles.pickerDoneText}>Done</Text>
            </TouchableOpacity>
          </View>

          {/* Search Box */}
          <View
            style={[
              styles.searchBox,
              {
                backgroundColor: colors.maximumTintColor + '1A',
                borderColor: colors.maximumTintColor + '33',
              },
            ]}>
            <AntDesign
              name="search1"
              size={iconSizes.sm}
              color={colors.iconSecondary}
              style={{marginRight: spacing.sm}}
            />
            <TextInput
              style={[styles.searchInput, {color: colors.textPrimary}]}
              placeholder="Search local songs..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <AntDesign
                  name="closecircle"
                  size={iconSizes.sm}
                  color={colors.iconSecondary}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Songs List */}
          <FlatList
            data={filteredLocalSongs}
            keyExtractor={(item, index) => `${item.url}_picker_${index}`}
            contentContainerStyle={{paddingBottom: 60}}
            ListEmptyComponent={
              <View style={styles.pickerEmpty}>
                <Text
                  style={[styles.pickerEmptyText, {color: colors.textSecondary}]}>
                  {allLocalSongs.length === 0
                    ? 'No local songs found on device yet.'
                    : 'No songs matched your search.'}
                </Text>
              </View>
            }
            renderItem={({item}) => {
              const isAlreadyAdded = playlist.songs.some(
                s => s.url === item.url,
              );
              return (
                <View
                  style={[
                    styles.pickerItem,
                    {borderBottomColor: colors.maximumTintColor + '22'},
                  ]}>
                  <View style={styles.pickerItemLeft}>
                    <View
                      style={[
                        styles.pickerIconWrapper,
                        {backgroundColor: colors.maximumTintColor + '22'},
                      ]}>
                      <MaterialIcons
                        name="music-note"
                        size={iconSizes.sm}
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
                      <AntDesign
                        name="checkcircle"
                        size={iconSizes.md}
                        color="#1DB954"
                      />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.addBtnCircle}
                      onPress={() => addSongToPlaylist(playlist.id, item)}>
                      <MaterialIcons
                        name="add-circle-outline"
                        size={iconSizes.md}
                        color={colors.iconPrimary}
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
                  {backgroundColor: colors.background, borderColor: colors.maximumTintColor + '44'},
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
                  <MaterialIcons
                    name="edit"
                    size={iconSizes.md}
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
                  <MaterialIcons
                    name="delete-outline"
                    size={iconSizes.md}
                    color="#FF5252"
                    style={{marginRight: spacing.md}}
                  />
                  <Text style={[styles.menuRowText, {color: '#FF5252'}]}>
                    Delete Playlist
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Rename Playlist Modal */}
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
                  {backgroundColor: colors.background, borderColor: colors.maximumTintColor + '44'},
                ]}>
                <Text style={[styles.dialogTitle, {color: colors.textPrimary}]}>
                  Rename Playlist
                </Text>
                <TextInput
                  style={[
                    styles.dialogInput,
                    {
                      color: colors.textPrimary,
                      borderColor: colors.maximumTintColor + '55',
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
                      !renameValue.trim() && {opacity: 0.5},
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
  },
  notFoundText: {
    fontSize: fontSize.lg,
    fontFamily: fontFamilies.bold,
    marginBottom: spacing.md,
  },
  backHomeBtn: {
    backgroundColor: '#1DB954',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 20,
  },
  backHomeBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
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
  headerTitle: {
    fontSize: fontSize.lg,
    fontFamily: fontFamilies.bold,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.sm,
  },
  heroContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  heroArtwork: {
    width: 90,
    height: 90,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  heroTitle: {
    fontSize: fontSize.xl,
    fontFamily: fontFamilies.bold,
    textAlign: 'center',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: fontSize.sm,
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
    backgroundColor: '#1DB954',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    gap: 4,
  },
  playAllBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize.sm,
    fontFamily: fontFamilies.bold,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    gap: 4,
  },
  secondaryBtnText: {
    fontSize: fontSize.sm,
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
    marginBottom: spacing.lg,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1DB954',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 20,
  },
  emptyAddBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize.sm,
    fontFamily: fontFamilies.bold,
  },
  pickerContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 44 : 16,
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
  },
  pickerDoneBtn: {
    backgroundColor: '#1DB954',
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: 16,
  },
  pickerDoneText: {
    color: '#FFFFFF',
    fontSize: fontSize.sm,
    fontFamily: fontFamilies.bold,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    fontFamily: fontFamilies.regular,
  },
  pickerEmpty: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  pickerEmptyText: {
    fontSize: fontSize.md,
    fontFamily: fontFamilies.regular,
    textAlign: 'center',
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
  },
  pickerItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  pickerIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  pickerTextContainer: {
    flex: 1,
  },
  pickerSongTitle: {
    fontSize: fontSize.md,
    fontFamily: fontFamilies.medium,
  },
  pickerSongArtist: {
    fontSize: fontSize.sm,
    fontFamily: fontFamilies.regular,
  },
  addedBadge: {
    padding: spacing.sm,
  },
  addBtnCircle: {
    padding: spacing.sm,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalBox: {
    width: '100%',
    borderRadius: 16,
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
    borderRadius: 10,
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
    backgroundColor: '#1DB954',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
  },
  dialogBtnText: {
    fontSize: fontSize.md,
    fontFamily: fontFamilies.medium,
  },
  dialogCreateBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontFamily: fontFamilies.bold,
  },
  menuBox: {
    width: '85%',
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
  },
  menuTitle: {
    fontSize: fontSize.md,
    fontFamily: fontFamilies.bold,
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  menuRowText: {
    fontSize: fontSize.md,
    fontFamily: fontFamilies.medium,
  },
});
