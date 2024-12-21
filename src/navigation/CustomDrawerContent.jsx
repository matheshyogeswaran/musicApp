import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from '@react-navigation/drawer';
import {colors} from '../constants/colors';
import {fontSize, iconSizes, spacing} from '../constants/dimensions';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Octicons from 'react-native-vector-icons/Octicons';
import {fontFamilies} from '../constants/fonts';
const CustomDrawerContent = props => {
  const isDarkMode = true;
  const toggleDrawer = () => {
    props.navigation.toggleDrawer();
  };
  return (
    <DrawerContentScrollView style={styles.container}>
      <View style={styles.headerIconContainer}>
        <TouchableOpacity onPress={toggleDrawer}>
          <AntDesign
            name={'close'}
            color={colors.iconPrimary}
            size={iconSizes.md}
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <Octicons
            name={isDarkMode ? 'sun' : 'moon'}
            color={colors.iconPrimary}
            size={iconSizes.md}
          />
        </TouchableOpacity>
      </View>

      {/* menu */}
      <View style={styles.drawerItemContainer}>
        <DrawerItem
          label={'Profile'}
          icon={() => (
            <FontAwesome
              name={'user'}
              color={colors.iconSecondary}
              size={iconSizes.md}
            />
          )}
          labelStyle={styles.labelStyle}
          style={styles.drawerItem}
        />
        <DrawerItem
          label={'Liked Songs'}
          icon={() => (
            <AntDesign
              name={'hearto'}
              color={colors.iconSecondary}
              size={iconSizes.md}
            />
          )}
          labelStyle={styles.labelStyle}
          style={styles.drawerItem}
          onPress={() => {
            props.navigation.navigate('DRAWER_HOME', {
              screen: 'LIKE_SCREEN', // Specify the screen inside the nested StackNavigator
            });
          }}
        />
        <DrawerItem
          label={'Language'}
          icon={() => (
            <FontAwesome
              name={'language'}
              color={colors.iconSecondary}
              size={iconSizes.md}
            />
          )}
          labelStyle={styles.labelStyle}
          style={styles.drawerItem}
          onPress={() => {
            props.navigation.navigate('LIKE_SCREEN');
          }}
        />
        <DrawerItem
          label={'Contact us'}
          icon={() => (
            <FontAwesome
              name={'envelope-o'}
              color={colors.iconSecondary}
              size={iconSizes.md}
            />
          )}
          labelStyle={styles.labelStyle}
          style={styles.drawerItem}
          onPress={() => {
            props.navigation.navigate('LIKE_SCREEN');
          }}
        />
        <DrawerItem
          label={'FAQs'}
          icon={() => (
            <FontAwesome
              name={'question-circle-o'}
              color={colors.iconSecondary}
              size={iconSizes.md}
            />
          )}
          labelStyle={styles.labelStyle}
          style={styles.drawerItem}
          onPress={() => {
            props.navigation.navigate('LIKE_SCREEN');
          }}
        />
        <DrawerItem
          label={'Settings'}
          icon={() => (
            <FontAwesome
              name={'cog'}
              color={colors.iconSecondary}
              size={iconSizes.md}
            />
          )}
          labelStyle={styles.labelStyle}
          style={styles.drawerItem}
          onPress={() => {
            props.navigation.navigate('LIKE_SCREEN');
          }}
        />
      </View>
    </DrawerContentScrollView>
  );
};

export default CustomDrawerContent;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  headerIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  drawerItemContainer: {
    marginVertical: spacing.xl,
  },
  labelStyle: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    fontFamily: fontFamilies.medium,
  },
  drawerItem: {
    marginVertical: spacing.sm,
  },
});
