import {StyleSheet, Text, View} from 'react-native';
import React, {createContext, useState} from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import StackNavigation from './StackNavigation';
import CustomDrawerContent from './CustomDrawerContent';
import {useNavigation} from '@react-navigation/native';

const Drawer = createDrawerNavigator();
export const AuthContext = createContext();
const DrawerNavigation = () => {
  const navigation = useNavigation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  return (
    <AuthContext.Provider value={{isAuthenticated, setIsAuthenticated}}>
      <Drawer.Navigator
        screenOptions={{
          headerShown: false,
          drawerType: 'slide',
          swipeEdgeWidth: 0,
          overlayColor: 'transparent',
        }}
        drawerContent={props => <CustomDrawerContent {...props} />}>
        <Drawer.Screen name="DRAWER_HOME" component={StackNavigation} />
      </Drawer.Navigator>
    </AuthContext.Provider>
  );
};

export default DrawerNavigation;

const styles = StyleSheet.create({});
