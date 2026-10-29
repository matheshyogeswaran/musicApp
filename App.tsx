import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
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
    console.log('Track player initialized');
  };

  useSetupPlayer({ onLoad });

  const activeTheme = isDarkMode ? darkTheme : lightTheme;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={activeTheme.colors.background}
        />
        <NavigationContainer theme={activeTheme}>
          <DrawerNavigation />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
