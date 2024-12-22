import { StyleSheet, Text, View } from 'react-native';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DrawerNavigation from './src/navigation/DrawerNavigation';
import TrackPlayer from 'react-native-track-player';
import { useSetupPlayer } from './src/hooks/useSetupTrackPlayer';
import useLikeSongs from './src/store/likeStore';
import { darkTheme } from './src/theme/darkTheme';
import { lightTheme } from './src/theme/lightTheme';
import { useThemeStore } from './src/store/themeStore';



const App = () => {
  const { loadLikeSongs } = useLikeSongs();
  const { isDarkMode, toggleTheme } = useThemeStore((state) => state);

  useEffect(() => {
    loadLikeSongs(); // Load liked songs on app start
  }, []);

  // const setupPlayer = async () => { await TrackPlayer.setupPlayer()}

  // useEffect(() => {
  //   setupPlayer();
  //   console.log("track setup success")
  // }, [])
  const onLoad = () => {

    console.log("track player .....")


  }
  useSetupPlayer({ onLoad });
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer theme={isDarkMode ? darkTheme : lightTheme}>
        {/* <StackNavigation /> */}
        <DrawerNavigation />
      </NavigationContainer>
    </GestureHandlerRootView>
  )
}

export default App;

const styles = StyleSheet.create({})