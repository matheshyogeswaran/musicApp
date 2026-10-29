import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PLAYLIST_STORAGE_KEY = 'userPlaylists';

export const usePlaylistStore = create((set, get) => ({
  playlists: [],
  isLoading: false,

  loadPlaylists: async () => {
    try {
      set({isLoading: true});
      const raw = await AsyncStorage.getItem(PLAYLIST_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          set({playlists: parsed});
        }
      }
    } catch (error) {
      console.warn('Error loading playlists from AsyncStorage:', error);
    } finally {
      set({isLoading: false});
    }
  },

  createPlaylist: async name => {
    const trimmed = (name || '').trim();
    if (!trimmed) {
      return null;
    }

    const newPlaylist = {
      id: `pl_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: trimmed,
      createdAt: new Date().toISOString(),
      songs: [],
    };

    const current = get().playlists;
    const updated = [newPlaylist, ...current];
    set({playlists: updated});

    try {
      await AsyncStorage.setItem(PLAYLIST_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Error saving created playlist:', e);
    }
    return newPlaylist;
  },

  renamePlaylist: async (playlistId, newName) => {
    const trimmed = (newName || '').trim();
    if (!trimmed) {
      return false;
    }

    const current = get().playlists;
    const updated = current.map(p =>
      p.id === playlistId ? {...p, name: trimmed} : p,
    );
    set({playlists: updated});

    try {
      await AsyncStorage.setItem(PLAYLIST_STORAGE_KEY, JSON.stringify(updated));
      return true;
    } catch (e) {
      console.warn('Error renaming playlist:', e);
      return false;
    }
  },

  deletePlaylist: async playlistId => {
    const current = get().playlists;
    const updated = current.filter(p => p.id !== playlistId);
    set({playlists: updated});

    try {
      await AsyncStorage.setItem(PLAYLIST_STORAGE_KEY, JSON.stringify(updated));
      return true;
    } catch (e) {
      console.warn('Error deleting playlist:', e);
      return false;
    }
  },

  addSongToPlaylist: async (playlistId, song) => {
    if (!song || !song.url) {
      return {success: false, message: 'Invalid song'};
    }

    const current = get().playlists;
    const playlist = current.find(p => p.id === playlistId);
    if (!playlist) {
      return {success: false, message: 'Playlist not found'};
    }

    const alreadyInPlaylist = playlist.songs.some(s => s.url === song.url);
    if (alreadyInPlaylist) {
      return {success: false, message: 'Song is already in this playlist'};
    }

    const updated = current.map(p => {
      if (p.id === playlistId) {
        return {
          ...p,
          songs: [...p.songs, song],
        };
      }
      return p;
    });

    set({playlists: updated});
    try {
      await AsyncStorage.setItem(PLAYLIST_STORAGE_KEY, JSON.stringify(updated));
      return {success: true, message: `Added to "${playlist.name}"`};
    } catch (e) {
      console.warn('Error adding song to playlist:', e);
      return {success: false, message: 'Failed to save changes'};
    }
  },

  addMultipleSongsToPlaylist: async (playlistId, newSongs) => {
    if (!Array.isArray(newSongs) || newSongs.length === 0) {
      return 0;
    }

    const current = get().playlists;
    const playlist = current.find(p => p.id === playlistId);
    if (!playlist) {
      return 0;
    }

    const existingUrls = new Set(playlist.songs.map(s => s.url));
    const toAdd = newSongs.filter(s => !existingUrls.has(s.url));

    if (toAdd.length === 0) {
      return 0;
    }

    const updated = current.map(p => {
      if (p.id === playlistId) {
        return {
          ...p,
          songs: [...p.songs, ...toAdd],
        };
      }
      return p;
    });

    set({playlists: updated});
    try {
      await AsyncStorage.setItem(PLAYLIST_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Error adding multiple songs:', e);
    }
    return toAdd.length;
  },

  removeSongFromPlaylist: async (playlistId, songUrl) => {
    const current = get().playlists;
    const updated = current.map(p => {
      if (p.id === playlistId) {
        return {
          ...p,
          songs: p.songs.filter(s => s.url !== songUrl),
        };
      }
      return p;
    });

    set({playlists: updated});
    try {
      await AsyncStorage.setItem(PLAYLIST_STORAGE_KEY, JSON.stringify(updated));
      return true;
    } catch (e) {
      console.warn('Error removing song from playlist:', e);
      return false;
    }
  },

  isSongInPlaylist: (playlistId, songUrl) => {
    const playlist = get().playlists.find(p => p.id === playlistId);
    if (!playlist) {
      return false;
    }
    return playlist.songs.some(s => s.url === songUrl);
  },
}));

export default usePlaylistStore;
