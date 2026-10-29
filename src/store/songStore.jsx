import {create} from 'zustand';

export const useSongStore = create(set => ({
  songs: [],
  isLoading: false,
  setSongs: songs => set({songs}),
  setIsLoading: isLoading => set({isLoading}),
}));

export default useSongStore;
