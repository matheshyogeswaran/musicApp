import {StyleSheet, Text, View} from 'react-native';
import React, {createContext, useContext, useEffect, useState} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from '../screen/HomeScreen';
import LikeScreen from '../screen/LikeScreen';
import PlayerScreen from '../screen/PlayerScreen';
import Signup from '../screen/Signup';
import Signin from '../screen/Signin';
import auth from '@react-native-firebase/auth';
import {AuthContext} from './DrawerNavigation';

const Stack = createNativeStackNavigator();
const StackNavigation = () => {
  const {isAuthenticated, setIsAuthenticated} = useContext(AuthContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      setIsAuthenticated(!!user);
      setLoading(false);
    });

    return unsubscribe; // Clean up the listener on unmount
  }, []);

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="HOME_SCREEN" component={HomeScreen} />
          <Stack.Screen name="LIKE_SCREEN" component={LikeScreen} />
          <Stack.Screen name="PLAYER_SCREEN" component={PlayerScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="SIGN_IN" component={Signin} />
          <Stack.Screen name="SIGN_UP" component={Signup} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default StackNavigation;

const styles = StyleSheet.create({});
