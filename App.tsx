import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DrawerNavigation from './src/navigation/DrawerNavigation';



const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        {/* <StackNavigation /> */}
        <DrawerNavigation/>
      </NavigationContainer>
    </GestureHandlerRootView>
  )
}

export default App;

const styles = StyleSheet.create({})