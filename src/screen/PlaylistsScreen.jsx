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
import {useNavigation, useTheme} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useActiveTrack} from 'react-native-track-player';
import {fontSize, spacing, radius} from '../constants/dimensions';
import {fontFamilies} from '../constants/fonts';
import usePlaylistStore from '../store/playlistStore';
import FloatingPlayer from '../components/FloatingPlayer';

const PlaylistsScreen = () => {
  const {colors} = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const activeTrack = useActiveTrack();
  const {playlists, createPlaylist, renamePlaylist, deletePlaylist} =
    usePlaylistStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [renameTarget, setRenameTarget] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [selectedPlaylistForMenu, setSelectedPlaylistForMenu] = useState(null);

  const handleCreateSubmit = async () => {
    const trimmed = createName.trim();
    if (!trimmed) {
      return;
    }
    const created = await createPlaylist(trimmed);
    setCreateName('');
    setIsCreateModalOpen(false);
    if (created) {
      navigation.navigate('PLAYLIST_DETAIL_SCREEN', {playlistId: created.id});
    }
  };

  const handleRenameSubmit = async () => {
    if (!renameTarget) {
      return;
    }
    const trimmed = renameValue.trim();
    if (!trimmed) {
      return;
    }
    await renamePlaylist(renameTarget.id, trimmed);
    setRenameTarget(null);
    setRenameValue('');
  };

  const handleDeleteConfirm = playlist => {
    Alert.alert(
      'Delete Playlist',
      `Are you sure you want to delete "${playlist.name}"? This action cannot be undone.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deletePlaylist(playlist.id),
        },
      ],
    );
  };

  const openRenameModal = playlist => {
    setSelectedPlaylistForMenu(null);
    setRenameTarget(playlist);
    setRenameValue(playlist.name);
  };

  const openDeletePrompt = playlist => {
    setSelectedPlaylistForMenu(null);
    handleDeleteConfirm(playlist);
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      {/* Top Header */}
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

        <Text style={[styles.headerTitle, {color: colors.textPrimary}]}>
          Playlists
        </Text>

        <TouchableOpacity
          style={[
            styles.createPill,
            {backgroundColor: colors.primary || '#6366F1'},
          ]}
          activeOpacity={0.8}
          onPress={() => setIsCreateModalOpen(true)}>
          <Feather name="plus" size={16} color="#FFFFFF" />
          <Text style={styles.createPillText}>New</Text>
        </TouchableOpacity>
      </View>

      {/* Subtitle / Counter */}
      <View style={styles.subHeader}>
        <Text style={[styles.statsText, {color: colors.textSecondary}]}>
          {playlists.length} {playlists.length === 1 ? 'playlist' : 'playlists'} in library
        </Text>
      </View>

      {/* Empty State or List */}
      {playlists.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View
            style={[
              styles.emptyIconCircle,
              {
                backgroundColor: (colors.primary || '#6366F1') + '15',
                borderColor: (colors.primary || '#6366F1') + '33',
              },
            ]}>
            <MaterialIcons
              name="queue-music"
              size={56}
              color={colors.primary || '#6366F1'}
            />
          </View>
          <Text style={[styles.emptyTitle, {color: colors.textPrimary}]}>
            No Playlists Yet
          </Text>
          <Text style={[styles.emptySubtitle, {color: colors.textSecondary}]}>
            Create your first playlist to organize and enjoy your favorite tracks.
          </Text>
          <TouchableOpacity
            style={[
              styles.emptyButton,
              {backgroundColor: colors.primary || '#6366F1'},
            ]}
            activeOpacity={0.85}
            onPress={() => setIsCreateModalOpen(true)}>
            <Feather
              name="plus"
              size={18}
              color="#FFFFFF"
              style={{marginRight: spacing.xs}}
            />
            <Text style={styles.emptyButtonText}>Create Playlist</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={playlists}
          keyExtractor={item => item.id}
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingBottom: activeTrack ? insets.bottom + 110 : insets.bottom + 40,
          }}
          renderItem={({item}) => (
            <TouchableOpacity
              style={[
                styles.playlistCard,
                {
                  backgroundColor: colors.surface || colors.card || '#111726',
                  borderColor: colors.border || 'rgba(255,255,255,0.08)',
                },
              ]}
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate('PLAYLIST_DETAIL_SCREEN', {
                  playlistId: item.id,
                })
              }>
              <View
                style={[
                  styles.cardIconBox,
                  {
                    backgroundColor: (colors.primary || '#6366F1') + '1A',
                  },
                ]}>
                <MaterialIcons
                  name="library-music"
                  size={24}
                  color={colors.primary || '#6366F1'}
                />
              </View>

              <View style={styles.cardDetails}>
                <Text
                  style={[styles.playlistCardName, {color: colors.textPrimary}]}
                  numberOfLines={1}>
                  {item.name}
                </Text>
                <Text
                  style={[
                    styles.playlistCardMeta,
                    {color: colors.textSecondary},
                  ]}>
                  {item.songs.length}{' '}
                  {item.songs.length === 1 ? 'track' : 'tracks'}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.cardOptionsBtn}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                onPress={() => setSelectedPlaylistForMenu(item)}>
                <Feather
                  name="more-vertical"
                  size={18}
                  color={colors.iconSecondary}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Floating Mini Player */}
      {activeTrack && <FloatingPlayer />}

      {/* Create Modal */}
      <Modal
        visible={isCreateModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsCreateModalOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setIsCreateModalOpen(false)}>
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
                  New Playlist
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
                  placeholder="Playlist name"
                  placeholderTextColor={colors.textSecondary}
                  value={createName}
                  onChangeText={setCreateName}
                  autoFocus={true}
                />
                <View style={styles.dialogActions}>
                  <TouchableOpacity
                    style={styles.dialogCancelBtn}
                    onPress={() => {
                      setIsCreateModalOpen(false);
                      setCreateName('');
                    }}>
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
                      !createName.trim() && styles.dialogBtnDisabled,
                    ]}
                    disabled={!createName.trim()}
                    onPress={handleCreateSubmit}>
                    <Text style={styles.dialogCreateBtnText}>Create</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Rename Modal */}
      <Modal
        visible={renameTarget !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setRenameTarget(null)}>
        <TouchableWithoutFeedback onPress={() => setRenameTarget(null)}>
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
                  placeholder="Enter playlist name"
                  placeholderTextColor={colors.textSecondary}
                  value={renameValue}
                  onChangeText={setRenameValue}
                  autoFocus={true}
                />
                <View style={styles.dialogActions}>
                  <TouchableOpacity
                    style={styles.dialogCancelBtn}
                    onPress={() => setRenameTarget(null)}>
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
                      !renameValue.trim() && styles.dialogBtnDisabled,
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

      {/* 3-Dots Menu Modal */}
      <Modal
        visible={selectedPlaylistForMenu !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedPlaylistForMenu(null)}>
        <TouchableWithoutFeedback
          onPress={() => setSelectedPlaylistForMenu(null)}>
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
                  {selectedPlaylistForMenu?.name}
                </Text>

                <TouchableOpacity
                  style={styles.menuRow}
                  onPress={() => openRenameModal(selectedPlaylistForMenu)}>
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
                  onPress={() => openDeletePrompt(selectedPlaylistForMenu)}>
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
    </View>
  );
};

export default PlaylistsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontSize: fontSize.xl,
    fontFamily: fontFamilies.bold,
    letterSpacing: -0.4,
  },
  createPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.full,
    gap: 4,
  },
  createPillText: {
    color: '#FFFFFF',
    fontSize: fontSize.xs,
    fontFamily: fontFamilies.bold,
  },
  subHeader: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  statsText: {
    fontSize: fontSize.xs,
    fontFamily: fontFamilies.regular,
  },
  playlistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  cardIconBox: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  cardDetails: {
    flex: 1,
  },
  playlistCardName: {
    fontSize: fontSize.md,
    fontFamily: fontFamilies.semiBold,
    marginBottom: 3,
  },
  playlistCardMeta: {
    fontSize: fontSize.xs,
    fontFamily: fontFamilies.regular,
  },
  cardOptionsBtn: {
    padding: spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: 80,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontFamily: fontFamilies.bold,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: fontSize.sm,
    fontFamily: fontFamilies.regular,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.sm,
    fontFamily: fontFamilies.bold,
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
  dialogBtnDisabled: {
    opacity: 0.5,
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
