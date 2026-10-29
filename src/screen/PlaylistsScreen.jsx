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
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useActiveTrack} from 'react-native-track-player';
import {fontSize, iconSizes, spacing} from '../constants/dimensions';
import {fontFamilies} from '../constants/fonts';
import usePlaylistStore from '../store/playlistStore';
import FloatingPlayer from '../components/FloatingPlayer';

const PlaylistsScreen = () => {
  const {colors} = useTheme();
  const navigation = useNavigation();
  const activeTrack = useActiveTrack();
  const {playlists, createPlaylist, renamePlaylist, deletePlaylist} =
    usePlaylistStore();

  // Create Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createName, setCreateName] = useState('');

  // Rename Modal state
  const [renameTarget, setRenameTarget] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  // Action Menu state (3-dots modal)
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
      `Are you sure you want to delete "${playlist.name}"?`,
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
        <Text style={[styles.headerTitle, {color: colors.textPrimary}]}>
          Playlists
        </Text>
        <TouchableOpacity
          style={[styles.createPill, {backgroundColor: '#1DB954'}]}
          onPress={() => setIsCreateModalOpen(true)}>
          <AntDesign name="plus" size={iconSizes.sm} color="#FFFFFF" />
          <Text style={styles.createPillText}>New</Text>
        </TouchableOpacity>
      </View>

      {/* Sub-header info */}
      <View style={styles.subHeader}>
        <Text style={[styles.statsText, {color: colors.textSecondary}]}>
          {playlists.length} {playlists.length === 1 ? 'Playlist' : 'Playlists'}
        </Text>
      </View>

      {/* List or Empty State */}
      {playlists.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View
            style={[
              styles.emptyIconCircle,
              {backgroundColor: colors.maximumTintColor + '22'},
            ]}>
            <MaterialIcons
              name="queue-music"
              size={64}
              color={colors.iconSecondary}
            />
          </View>
          <Text style={[styles.emptyTitle, {color: colors.textPrimary}]}>
            No Playlists Yet
          </Text>
          <Text style={[styles.emptySubtitle, {color: colors.textSecondary}]}>
            Create custom playlists to organize your favorite songs and listen to
            them anytime.
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => setIsCreateModalOpen(true)}>
            <AntDesign
              name="plus"
              size={iconSizes.sm}
              color="#FFFFFF"
              style={{marginRight: spacing.sm}}
            />
            <Text style={styles.emptyButtonText}>Create Playlist</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={playlists}
          keyExtractor={item => item.id}
          contentContainerStyle={{paddingBottom: 120, paddingHorizontal: spacing.lg}}
          renderItem={({item}) => (
            <TouchableOpacity
              style={[
                styles.playlistCard,
                {borderBottomColor: colors.maximumTintColor + '22'},
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
                  {backgroundColor: colors.maximumTintColor + '22'},
                ]}>
                <MaterialIcons
                  name="library-music"
                  size={iconSizes.lg}
                  color={colors.iconPrimary}
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
                  {item.songs.length === 1 ? 'song' : 'songs'}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.cardOptionsBtn}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                onPress={() => setSelectedPlaylistForMenu(item)}>
                <MaterialIcons
                  name="more-vert"
                  size={iconSizes.md}
                  color={colors.iconSecondary}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Floating Player */}
      {activeTrack && <FloatingPlayer />}

      {/* Create Playlist Modal */}
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
                  {backgroundColor: colors.background, borderColor: colors.maximumTintColor + '44'},
                ]}>
                <Text style={[styles.dialogTitle, {color: colors.textPrimary}]}>
                  New Playlist
                </Text>
                <TextInput
                  style={[
                    styles.dialogInput,
                    {
                      color: colors.textPrimary,
                      borderColor: colors.maximumTintColor + '55',
                    },
                  ]}
                  placeholder="Give your playlist a name"
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
                      !createName.trim() && {opacity: 0.5},
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

      {/* Rename Playlist Modal */}
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

      {/* Options Menu Modal (3 dots) */}
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
                  {backgroundColor: colors.background, borderColor: colors.maximumTintColor + '44'},
                ]}>
                <Text
                  style={[styles.menuTitle, {color: colors.textPrimary}]}
                  numberOfLines={1}>
                  {selectedPlaylistForMenu?.name}
                </Text>

                <TouchableOpacity
                  style={styles.menuRow}
                  onPress={() => openRenameModal(selectedPlaylistForMenu)}>
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
                  onPress={() => openDeletePrompt(selectedPlaylistForMenu)}>
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
  headerTitle: {
    fontSize: fontSize.xl,
    fontFamily: fontFamilies.bold,
  },
  createPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xm,
    borderRadius: 20,
    gap: 4,
  },
  createPillText: {
    color: '#FFFFFF',
    fontSize: fontSize.sm,
    fontFamily: fontFamilies.bold,
  },
  subHeader: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  statsText: {
    fontSize: fontSize.sm,
    fontFamily: fontFamilies.medium,
  },
  playlistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  cardIconBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  cardDetails: {
    flex: 1,
  },
  playlistCardName: {
    fontSize: fontSize.md,
    fontFamily: fontFamilies.medium,
    marginBottom: 4,
  },
  playlistCardMeta: {
    fontSize: fontSize.sm,
    fontFamily: fontFamilies.regular,
  },
  cardOptionsBtn: {
    padding: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: 80,
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontFamily: fontFamilies.bold,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: fontSize.md,
    fontFamily: fontFamilies.regular,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1DB954',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 25,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontFamily: fontFamilies.bold,
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
