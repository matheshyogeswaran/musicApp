import React, {useState} from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {useTheme} from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {fontSize, iconSizes, spacing} from '../constants/dimensions';
import {fontFamilies} from '../constants/fonts';
import usePlaylistStore from '../store/playlistStore';

const AddToPlaylistModal = ({visible, onClose, song}) => {
  const {colors} = useTheme();
  const {playlists, createPlaylist, addSongToPlaylist, removeSongFromPlaylist} =
    usePlaylistStore();

  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  if (!song) {
    return null;
  }

  const showFeedback = msg => {
    setFeedbackMessage(msg);
    setTimeout(() => {
      setFeedbackMessage('');
    }, 2500);
  };

  const handleCreateAndAdd = async () => {
    const trimmed = newPlaylistName.trim();
    if (!trimmed) {
      return;
    }
    const created = await createPlaylist(trimmed);
    if (created) {
      await addSongToPlaylist(created.id, song);
      setNewPlaylistName('');
      setIsCreating(false);
      showFeedback(`Added to "${trimmed}"`);
    }
  };

  const handleTogglePlaylist = async playlist => {
    const isAlreadyIn = playlist.songs.some(s => s.url === song.url);
    if (isAlreadyIn) {
      await removeSongFromPlaylist(playlist.id, song.url);
      showFeedback(`Removed from "${playlist.name}"`);
    } else {
      const result = await addSongToPlaylist(playlist.id, song);
      showFeedback(result.message);
    }
  };

  const handleClose = () => {
    setIsCreating(false);
    setNewPlaylistName('');
    setFeedbackMessage('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modalContainer,
                {backgroundColor: colors.background, borderColor: colors.maximumTintColor + '44'},
              ]}>
              {/* Header */}
              <View style={styles.headerRow}>
                <View style={styles.headerLeft}>
                  <MaterialIcons
                    name="queue-music"
                    size={iconSizes.md}
                    color={colors.iconPrimary}
                    style={{marginRight: spacing.sm}}
                  />
                  <Text style={[styles.headerTitle, {color: colors.textPrimary}]}>
                    Add to Playlist
                  </Text>
                </View>
                <TouchableOpacity onPress={handleClose} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                  <AntDesign
                    name="close"
                    size={iconSizes.md}
                    color={colors.iconSecondary}
                  />
                </TouchableOpacity>
              </View>

              {/* Song Preview */}
              <View
                style={[
                  styles.songPreview,
                  {backgroundColor: colors.maximumTintColor + '1A'},
                ]}>
                <MaterialIcons
                  name="audiotrack"
                  size={iconSizes.sm}
                  color={colors.iconSecondary}
                  style={{marginRight: spacing.sm}}
                />
                <View style={{flex: 1}}>
                  <Text
                    style={[styles.songTitle, {color: colors.textPrimary}]}
                    numberOfLines={1}>
                    {song.title || 'Unknown Title'}
                  </Text>
                  <Text
                    style={[styles.songArtist, {color: colors.textSecondary}]}
                    numberOfLines={1}>
                    {song.artist && song.artist !== 'Unknown Artist'
                      ? song.artist
                      : 'Local Audio'}
                  </Text>
                </View>
              </View>

              {/* Feedback Alert */}
              {feedbackMessage !== '' && (
                <View style={styles.feedbackContainer}>
                  <Text style={styles.feedbackText}>{feedbackMessage}</Text>
                </View>
              )}

              {/* Create Playlist Section */}
              {isCreating ? (
                <View
                  style={[
                    styles.createInputContainer,
                    {borderColor: colors.maximumTintColor + '55'},
                  ]}>
                  <TextInput
                    style={[styles.input, {color: colors.textPrimary}]}
                    placeholder="Enter playlist name"
                    placeholderTextColor={colors.textSecondary}
                    value={newPlaylistName}
                    onChangeText={setNewPlaylistName}
                    autoFocus={true}
                  />
                  <View style={styles.createButtonsRow}>
                    <TouchableOpacity
                      style={[styles.btn, styles.cancelBtn]}
                      onPress={() => {
                        setIsCreating(false);
                        setNewPlaylistName('');
                      }}>
                      <Text style={[styles.btnText, {color: colors.textSecondary}]}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.btn,
                        styles.confirmBtn,
                        !newPlaylistName.trim() && {opacity: 0.5},
                      ]}
                      disabled={!newPlaylistName.trim()}
                      onPress={handleCreateAndAdd}>
                      <Text style={styles.confirmBtnText}>Create & Add</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.newPlaylistButton,
                    {borderColor: colors.maximumTintColor + '44'},
                  ]}
                  onPress={() => setIsCreating(true)}>
                  <AntDesign
                    name="pluscircleo"
                    size={iconSizes.sm}
                    color={colors.iconPrimary}
                    style={{marginRight: spacing.sm}}
                  />
                  <Text
                    style={[styles.newPlaylistText, {color: colors.textPrimary}]}>
                    Create New Playlist
                  </Text>
                </TouchableOpacity>
              )}

              {/* Playlists List */}
              <View style={styles.listContainer}>
                {playlists.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text
                      style={[styles.emptyText, {color: colors.textSecondary}]}>
                      No playlists yet. Create your first one above!
                    </Text>
                  </View>
                ) : (
                  <FlatList
                    data={playlists}
                    keyExtractor={item => item.id}
                    keyboardShouldPersistTaps="handled"
                    renderItem={({item}) => {
                      const isAdded = item.songs.some(s => s.url === song.url);
                      return (
                        <TouchableOpacity
                          style={[
                            styles.playlistItem,
                            {borderBottomColor: colors.maximumTintColor + '22'},
                          ]}
                          onPress={() => handleTogglePlaylist(item)}>
                          <View style={styles.playlistItemLeft}>
                            <View
                              style={[
                                styles.playlistIconBox,
                                {backgroundColor: colors.maximumTintColor + '22'},
                              ]}>
                              <MaterialIcons
                                name="playlist-play"
                                size={iconSizes.md}
                                color={colors.iconPrimary}
                              />
                            </View>
                            <View style={styles.playlistItemInfo}>
                              <Text
                                style={[
                                  styles.playlistName,
                                  {color: colors.textPrimary},
                                ]}
                                numberOfLines={1}>
                                {item.name}
                              </Text>
                              <Text
                                style={[
                                  styles.playlistSongsCount,
                                  {color: colors.textSecondary},
                                ]}>
                                {item.songs.length}{' '}
                                {item.songs.length === 1 ? 'song' : 'songs'}
                              </Text>
                            </View>
                          </View>
                          {isAdded ? (
                            <AntDesign
                              name="checkcircle"
                              size={iconSizes.md}
                              color="#1DB954"
                            />
                          ) : (
                            <MaterialIcons
                              name="add-circle-outline"
                              size={iconSizes.md}
                              color={colors.iconSecondary}
                            />
                          )}
                        </TouchableOpacity>
                      );
                    }}
                  />
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default AddToPlaylistModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContainer: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontFamily: fontFamilies.bold,
  },
  songPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  songTitle: {
    fontSize: fontSize.md,
    fontFamily: fontFamilies.medium,
  },
  songArtist: {
    fontSize: fontSize.sm,
    fontFamily: fontFamilies.regular,
  },
  feedbackContainer: {
    backgroundColor: '#1DB95422',
    borderColor: '#1DB954',
    borderWidth: 1,
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  feedbackText: {
    color: '#1DB954',
    fontSize: fontSize.sm,
    fontFamily: fontFamilies.medium,
  },
  newPlaylistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: spacing.md,
  },
  newPlaylistText: {
    fontSize: fontSize.md,
    fontFamily: fontFamilies.medium,
  },
  createInputContainer: {
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  input: {
    fontSize: fontSize.md,
    fontFamily: fontFamilies.regular,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  createButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  btn: {
    paddingVertical: spacing.xm,
    paddingHorizontal: spacing.md,
    borderRadius: 6,
  },
  cancelBtn: {},
  confirmBtn: {
    backgroundColor: '#1DB954',
  },
  btnText: {
    fontSize: fontSize.sm,
    fontFamily: fontFamilies.medium,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize.sm,
    fontFamily: fontFamilies.bold,
  },
  listContainer: {
    maxHeight: 260,
  },
  emptyContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSize.sm,
    fontFamily: fontFamilies.regular,
    textAlign: 'center',
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  playlistItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  playlistIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  playlistItemInfo: {
    flex: 1,
  },
  playlistName: {
    fontSize: fontSize.md,
    fontFamily: fontFamilies.medium,
  },
  playlistSongsCount: {
    fontSize: fontSize.sm,
    fontFamily: fontFamilies.regular,
  },
});
