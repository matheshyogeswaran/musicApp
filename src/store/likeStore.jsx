import { create } from 'zustand';
import { isExist } from '../utills';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useLikeSongs = create((set) => ({
  likedSongs: [],
  addToLiked: (newSong) => {
    if (!newSong || !newSong.url) {
      return;
    }
    set((state) => {
      // Check if the song is already in the likedSongs array
      const isAlreadyExist = isExist(state.likedSongs, newSong);
      const updatedSongs = isAlreadyExist
        ? state.likedSongs.filter((item) => item && item.url !== newSong.url)
        : [newSong, ...state.likedSongs];

      AsyncStorage.setItem('likedSongs', JSON.stringify(updatedSongs));

      return {
        likedSongs: updatedSongs,
      };
    });
  },
  loadLikeSongs: async () => {
    try {
      const likedSongs = await AsyncStorage.getItem('likedSongs');
      if (likedSongs) {
        set({ likedSongs: JSON.parse(likedSongs) });
      }
    } catch (error) {
      console.log('Error loading liked songs', error);
    }
  },
}));

export default useLikeSongs;
