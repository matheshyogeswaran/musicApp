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
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {fontSize, spacing, radius} from '../constants/dimensions';
import {fontFamilies} from '../constants/fonts';
import usePlaylistStore from '../store/playlistStore';

const AddToPlaylistModal = ({visible, onClose, song}) => {
  const {colors} = useTheme();
  const insets = useSafeAreaInsets();
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
    }, 2400);
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
    if (!song || !song.url) {
      return;
    }
    const isAlreadyIn = playlist.songs.some(s => s?.url === song.url);
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
      animationType="slide"
      onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modalSheet,
                {
                  backgroundColor: colors.surface || colors.card || '#111726',
                  borderColor: colors.border || 'rgba(255,255,255,0.1)',
                  paddingBottom: Math.max(insets.bottom, 16) + spacing.sm,
                },
              ]}>
              {/* Drag Handle Indicator */}
              <View style={styles.dragHandleContainer}>
                <View
                  style={[
                    styles.dragHandle,
                    {backgroundColor: colors.borderStrong || 'rgba(255,255,255,0.2)'},
                  ]}
                />
              </View>

              {/* Header */}
              <View style={styles.headerRow}>
                <View>
                  <Text style={[styles.headerTitle, {color: colors.textPrimary}]}>
                    Add to Playlist
                  </Text>
                  <Text
                    style={[styles.headerSubtitle, {color: colors.textSecondary}]}>
                    Select playlists to include this track
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.closeBtn,
                    {backgroundColor: colors.surfaceElevated || colors.maximumTintColor + '22'},
                  ]}
                  onPress={handleClose}
                  hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                  <Feather name="x" size={18} color={colors.iconPrimary} />
                </TouchableOpacity>
              </View>

              {/* Song Preview Card */}
              <View
                style={[
                  styles.songPreview,
                  {
                    backgroundColor: colors.surfaceElevated || colors.maximumTintColor + '15',
                    borderColor: colors.border || 'rgba(255,255,255,0.08)',
                  },
                ]}>
                <View
                  style={[
                    styles.songIconBox,
                    {backgroundColor: (colors.primary || '#6366F1') + '22'},
                  ]}>
                  <Feather
                    name="music"
                    size={16}
                    color={colors.primary || '#6366F1'}
                  />
                </View>
                <View style={styles.songMeta}>
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

              {/* Feedback Pill */}
              {feedbackMessage !== '' && (
                <View
                  style={[
                    styles.feedbackBanner,
                    {backgroundColor: (colors.primary || '#6366F1') + '1A'},
                  ]}>
                  <Feather
                    name="check-circle"
                    size={14}
                    color={colors.primary || '#6366F1'}
                    style={{marginRight: 6}}
                  />
                  <Text
                    style={[
                      styles.feedbackText,
                      {color: colors.primary || '#6366F1'},
                    ]}>
                    {feedbackMessage}
                  </Text>
                </View>
              )}

              {/* Create Playlist Section */}
              {isCreating ? (
                <View
                  style={[
                    styles.createInputContainer,
                    {
                      backgroundColor: colors.surfaceElevated || colors.maximumTintColor + '1A',
                      borderColor: colors.border || 'rgba(255,255,255,0.1)',
                    },
                  ]}>
                  <TextInput
                    style={[styles.input, {color: colors.textPrimary}]}
                    placeholder="Playlist name"
                    placeholderTextColor={colors.textSecondary}
                    value={newPlaylistName}
                    onChangeText={setNewPlaylistName}
                    autoFocus={true}
                  />
                  <View style={styles.createButtonsRow}>
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={() => {
                        setIsCreating(false);
                        setNewPlaylistName('');
                      }}>
                      <Text
                        style={[
                          styles.cancelBtnText,
                          {color: colors.textSecondary},
                        ]}>
                        Cancel
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.confirmBtn,
                        {
                          backgroundColor: colors.primary || '#6366F1',
                          opacity: newPlaylistName.trim() ? 1 : 0.5,
                        },
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
                    {
                      borderColor: colors.primary || '#6366F1',
                      backgroundColor: (colors.primary || '#6366F1') + '12',
                    },
                  ]}
                  activeOpacity={0.75}
                  onPress={() => setIsCreating(true)}>
                  <Feather
                    name="plus"
                    size={18}
                    color={colors.primary || '#6366F1'}
                    style={{marginRight: spacing.xs}}
                  />
                  <Text
                    style={[
                      styles.newPlaylistText,
                      {color: colors.primary || '#6366F1'},
                    ]}>
                    New Playlist
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
                      const isAdded = song?.url
                        ? item.songs.some(s => s?.url === song.url)
                        : false;
                      return (
                        <TouchableOpacity
                          style={[
                            styles.playlistItem,
                            {
                              borderBottomColor:
                                colors.border || 'rgba(255,255,255,0.06)',
                            },
                          ]}
                          activeOpacity={0.7}
                          onPress={() => handleTogglePlaylist(item)}>
                          <View style={styles.playlistItemLeft}>
                            <View
                              style={[
                                styles.playlistIconBox,
                                {
                                  backgroundColor:
                                    colors.surfaceElevated ||
                                    colors.maximumTintColor + '22',
                                },
                              ]}>
                              <MaterialIcons
                                name="library-music"
                                size={18}
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

                          <View
                            style={[
                              styles.checkCircle,
                              isAdded
                                ? {
                                    backgroundColor:
                                      colors.primary || '#6366F1',
                                    borderColor: colors.primary || '#6366F1',
                                  }
                                : {
                                    borderColor:
                                      colors.borderStrong ||
                                      'rgba(255,255,255,0.3)',
                                  },
                            ]}>
                            {isAdded && (
                              <Feather name="check" size={14} color="#FFFFFF" />
                            )}
                          </View>
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
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    maxHeight: '82%',
    borderWidth: 1,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontFamily: fontFamilies.bold,
  },
  headerSubtitle: {
    fontSize: fontSize.xs,
    fontFamily: fontFamilies.regular,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  songPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  songIconBox: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  songMeta: {
    flex: 1,
  },
  songTitle: {
    fontSize: fontSize.sm,
    fontFamily: fontFamilies.semiBold,
  },
  songArtist: {
    fontSize: fontSize.xs,
    fontFamily: fontFamilies.regular,
    marginTop: 2,
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
  },
  feedbackText: {
    fontSize: fontSize.xs,
    fontFamily: fontFamilies.medium,
  },
  newPlaylistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  newPlaylistText: {
    fontSize: fontSize.sm,
    fontFamily: fontFamilies.semiBold,
  },
  createInputContainer: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  input: {
    fontSize: fontSize.md,
    fontFamily: fontFamilies.regular,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  createButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  cancelBtn: {
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
  },
  cancelBtnText: {
    fontSize: fontSize.sm,
    fontFamily: fontFamilies.medium,
  },
  confirmBtn: {
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize.sm,
    fontFamily: fontFamilies.bold,
  },
  listContainer: {
    maxHeight: 280,
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
    borderRadius: radius.sm,
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
    fontSize: fontSize.xs,
    fontFamily: fontFamilies.regular,
    marginTop: 2,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
