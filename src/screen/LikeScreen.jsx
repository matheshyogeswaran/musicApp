import React, {useState} from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {fontSize, spacing, radius} from '../constants/dimensions';
import {fontFamilies} from '../constants/fonts';
import SongCard from '../components/SongCard';
import FloatingPlayer from '../components/FloatingPlayer';
import AddToPlaylistModal from '../components/AddToPlaylistModal';
import useLikeSongs from '../store/likeStore';
import {useNavigation, useTheme} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import TrackPlayer, {useActiveTrack} from 'react-native-track-player';

const LikeScreen = () => {
  const {colors} = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const activeTrack = useActiveTrack();
  const {likedSongs} = useLikeSongs();
  const [selectedSongForPlaylist, setSelectedSongForPlaylist] = useState(null);

  const handlePlayTrack = async (selectedTrack, songs = likedSongs) => {
    if (!selectedTrack || !selectedTrack.url) {
      return;
    }
    const trackIndex = songs.findIndex(
      track => track?.url === selectedTrack.url,
    );
    if (trackIndex === -1) {
      return;
    }

    await TrackPlayer.reset();
    await TrackPlayer.add(songs);
    await TrackPlayer.skip(trackIndex);
    await TrackPlayer.play();
  };

  const handlePlayAll = async () => {
    if (likedSongs.length === 0) {
      return;
    }
    await TrackPlayer.reset();
    await TrackPlayer.add(likedSongs);
    await TrackPlayer.skip(0);
    await TrackPlayer.play();
  };

  const handleShuffleAll = async () => {
    if (likedSongs.length === 0) {
      return;
    }
    const shuffled = [...likedSongs].sort(() => Math.random() - 0.5);
    await TrackPlayer.reset();
    await TrackPlayer.add(shuffled);
    await TrackPlayer.skip(0);
    await TrackPlayer.play();
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      {/* Top Header */}
      <View style={styles.headerContainer}>
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
          Liked Songs
        </Text>

        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* Subtitle / Counter */}
      <View style={styles.subHeader}>
        <Text style={[styles.statsText, {color: colors.textSecondary}]}>
          {likedSongs.length} {likedSongs.length === 1 ? 'favorite track' : 'favorite tracks'}
        </Text>
      </View>

      {/* Quick Play & Shuffle Actions */}
      {likedSongs.length > 0 && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              {backgroundColor: colors.primary || '#6366F1'},
            ]}
            activeOpacity={0.8}
            onPress={handlePlayAll}>
            <Feather name="play" size={16} color="#FFFFFF" style={styles.iconMargin} />
            <Text style={styles.actionBtnText}>Play All</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionBtnSecondary,
              {
                backgroundColor: colors.surfaceElevated || colors.maximumTintColor + '15',
                borderColor: colors.border || 'rgba(255,255,255,0.08)',
              },
            ]}
            activeOpacity={0.7}
            onPress={handleShuffleAll}>
            <Feather
              name="shuffle"
              size={15}
              color={colors.iconPrimary}
              style={styles.iconMargin}
            />
            <Text style={[styles.actionBtnSecText, {color: colors.textPrimary}]}>
              Shuffle
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* List or Empty State */}
      {likedSongs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Feather name="heart" size={48} color="#EF4444" />
          </View>
          <Text style={[styles.emptyTitle, {color: colors.textPrimary}]}>
            No Liked Songs Yet
          </Text>
          <Text style={[styles.emptySubtitle, {color: colors.textSecondary}]}>
            Tap the heart icon on any song to save it to your favorites.
          </Text>
          <TouchableOpacity
            style={[
              styles.exploreBtn,
              {backgroundColor: colors.primary || '#6366F1'},
            ]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('HOME_SCREEN')}>
            <Text style={styles.exploreBtnText}>Discover Songs</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={likedSongs}
          keyExtractor={(item, index) => `${item.url}_${index}`}
          contentContainerStyle={{
            paddingHorizontal: spacing.md,
            paddingBottom: activeTrack ? insets.bottom + 110 : insets.bottom + 40,
          }}
          renderItem={({item, index}) => (
            <SongCard
              item={item}
              index={index}
              handlePlay={selectedTrack => handlePlayTrack(selectedTrack)}
              onOptionsPress={track => setSelectedSongForPlaylist(track)}
            />
          )}
        />
      )}

      {/* Floating Player */}
      {activeTrack && <FloatingPlayer />}

      {/* Add to Playlist Modal */}
      <AddToPlaylistModal
        visible={selectedSongForPlaylist !== null}
        onClose={() => setSelectedSongForPlaylist(null)}
        song={selectedSongForPlaylist}
      />
    </View>
  );
};

export default LikeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
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
  headerRightPlaceholder: {
    width: 38,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontFamily: fontFamilies.bold,
    letterSpacing: -0.4,
  },
  subHeader: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  statsText: {
    fontSize: fontSize.xs,
    fontFamily: fontFamilies.regular,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  iconMargin: {
    marginRight: 6,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize.xs,
    fontFamily: fontFamilies.bold,
  },
  actionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
  },
  actionBtnSecText: {
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
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1,
    backgroundColor: '#EF444415',
    borderColor: '#EF444433',
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
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  exploreBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.full,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize.sm,
    fontFamily: fontFamilies.bold,
  },
});
