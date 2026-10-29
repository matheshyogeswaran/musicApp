import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DrawerNavigation from './src/navigation/DrawerNavigation';
import { useSetupPlayer } from './src/hooks/useSetupTrackPlayer';
import useLikeSongs from './src/store/likeStore';
import usePlaylistStore from './src/store/playlistStore';
import { darkTheme } from './src/theme/darkTheme';
import { lightTheme } from './src/theme/lightTheme';
import { useThemeStore } from './src/store/themeStore';

const App = () => {
  const { loadLikeSongs } = useLikeSongs();
  const { loadPlaylists } = usePlaylistStore();
  const { isDarkMode } = useThemeStore((state) => state);

  useEffect(() => {
    loadLikeSongs();
    loadPlaylists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onLoad = () => {
    console.log('track player ready');
  };

  useSetupPlayer({ onLoad });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer theme={isDarkMode ? darkTheme : lightTheme}>
        <DrawerNavigation />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default App;
