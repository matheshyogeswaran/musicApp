import { StyleSheet, Text, View } from 'react-native';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DrawerNavigation from './src/navigation/DrawerNavigation';
import TrackPlayer from 'react-native-track-player';



const App = () => {
  const setupPlayer = async () => { await TrackPlayer.setupPlayer()}

  useEffect(() => {
    setupPlayer();
    console.log("track setup success")
  }, [])
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        {/* <StackNavigation /> */}
        <DrawerNavigation />
      </NavigationContainer>
    </GestureHandlerRootView>
  )
}

export default App;

const styles = StyleSheet.create({})