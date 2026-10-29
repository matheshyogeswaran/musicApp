import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from '../screen/HomeScreen';
import LikeScreen from '../screen/LikeScreen';
import PlayerScreen from '../screen/PlayerScreen';
import PlaylistsScreen from '../screen/PlaylistsScreen';
import PlaylistDetailScreen from '../screen/PlaylistDetailScreen';

const Stack = createNativeStackNavigator();

const StackNavigation = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="HOME_SCREEN">
      <Stack.Screen name="HOME_SCREEN" component={HomeScreen} />
      <Stack.Screen name="LIKE_SCREEN" component={LikeScreen} />
      <Stack.Screen name="PLAYER_SCREEN" component={PlayerScreen} />
      <Stack.Screen name="PLAYLISTS_SCREEN" component={PlaylistsScreen} />
      <Stack.Screen
        name="PLAYLIST_DETAIL_SCREEN"
        component={PlaylistDetailScreen}
      />
    </Stack.Navigator>
  );
};

export default StackNavigation;
