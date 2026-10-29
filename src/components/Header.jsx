import {StyleSheet, Text, View, TouchableOpacity, Platform} from 'react-native';
import React from 'react';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {iconSizes, spacing, fontSize, radius} from '../constants/dimensions';
import {fontFamilies} from '../constants/fonts';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useTheme} from '@react-navigation/native';

const Header = ({onSearchPress, isSearchActive = false, rightAction}) => {
  const {colors} = useTheme();
  const navigation = useNavigation();

  const toggleDrawer = () => {
    navigation.toggleDrawer();
  };

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safeArea, {backgroundColor: colors.background}]}>
      <View style={styles.header}>
        {/* Drawer button */}
        <TouchableOpacity
          style={[
            styles.iconButton,
            {
              backgroundColor: colors.surfaceElevated || colors.maximumTintColor + '22',
              borderColor: colors.border || colors.maximumTintColor + '33',
            },
          ]}
          activeOpacity={0.7}
          onPress={toggleDrawer}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Feather name="menu" color={colors.iconPrimary} size={iconSizes.sm} />
        </TouchableOpacity>

        {/* Brand / Logo */}
        <View style={styles.brandContainer}>
          <View
            style={[
              styles.brandIconDot,
              {backgroundColor: colors.primary || '#6366F1'},
            ]}>
            <MaterialIcons name="graphic-eq" size={14} color="#FFFFFF" />
          </View>
          <Text style={[styles.brandText, {color: colors.textPrimary}]}>
            Trackly
          </Text>
        </View>

        {/* Right Action */}
        <View style={styles.rightContainer}>
          {rightAction ? (
            rightAction
          ) : onSearchPress ? (
            <TouchableOpacity
              style={[
                styles.iconButton,
                isSearchActive && {
                  backgroundColor: colors.primary || '#6366F1',
                  borderColor: colors.primary || '#6366F1',
                },
                !isSearchActive && {
                  backgroundColor: colors.surfaceElevated || colors.maximumTintColor + '22',
                  borderColor: colors.border || colors.maximumTintColor + '33',
                },
              ]}
              activeOpacity={0.7}
              onPress={onSearchPress}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <Feather
                name={isSearchActive ? 'x' : 'search'}
                color={isSearchActive ? '#FFFFFF' : colors.iconPrimary}
                size={iconSizes.sm}
              />
            </TouchableOpacity>
          ) : (
            <View style={styles.rightPlaceholder} />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Header;

const styles = StyleSheet.create({
  safeArea: {
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: Platform.OS === 'ios' ? spacing.xs : spacing.sm,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  brandIconDot: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSize.lg,
    letterSpacing: -0.5,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightPlaceholder: {
    width: 38,
  },
});
