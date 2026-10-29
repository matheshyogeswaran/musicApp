import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import StackNavigation from './StackNavigation';
import CustomDrawerContent from './CustomDrawerContent';

const Drawer = createDrawerNavigator();

const renderCustomDrawer = props => <CustomDrawerContent {...props} />;

const DrawerNavigation = () => {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        swipeEdgeWidth: 20,
        overlayColor: 'rgba(0, 0, 0, 0.55)',
        drawerStyle: {
          width: '80%',
        },
      }}
      drawerContent={renderCustomDrawer}>
      <Drawer.Screen name="DRAWER_HOME" component={StackNavigation} />
    </Drawer.Navigator>
  );
};

export default DrawerNavigation;
