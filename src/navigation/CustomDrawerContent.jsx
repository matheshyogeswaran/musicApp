import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import {DrawerContentScrollView} from '@react-navigation/drawer';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {fontSize, spacing, radius} from '../constants/dimensions';
import {fontFamilies} from '../constants/fonts';
import {useTheme} from '@react-navigation/native';
import {useThemeStore} from '../store/themeStore';
import usePlaylistStore from '../store/playlistStore';
import useLikeSongs from '../store/likeStore';
import useSongStore from '../store/songStore';

const CustomDrawerContent = props => {
  const {colors} = useTheme();
  const {isDarkMode, toggleTheme} = useThemeStore();
  const {playlists} = usePlaylistStore();
  const {likedSongs} = useLikeSongs();
  const {songs} = useSongStore();

  const navigateTo = screenName => {
    props.navigation.closeDrawer();
    props.navigation.navigate('DRAWER_HOME', {
      screen: screenName,
    });
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.scrollContent}
      style={[styles.container, {backgroundColor: colors.background}]}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View
            style={[
              styles.logoBadge,
              {backgroundColor: colors.primary || '#6366F1'},
            ]}>
            <MaterialIcons name="graphic-eq" size={20} color="#FFFFFF" />
          </View>
          <View>
            <Text style={[styles.brandName, {color: colors.textPrimary}]}>
              Trackly
            </Text>
            <Text style={[styles.brandTagline, {color: colors.textSecondary}]}>
              Local Music Player
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.closeBtn,
            {
              backgroundColor: colors.surfaceElevated || colors.maximumTintColor + '22',
              borderColor: colors.border || 'rgba(255,255,255,0.08)',
            },
          ]}
          onPress={() => props.navigation.closeDrawer()}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Feather name="x" size={18} color={colors.iconPrimary} />
        </TouchableOpacity>
      </View>

      {/* Theme Switch Card */}
      <View
        style={[
          styles.themeCard,
          {
            backgroundColor: colors.surface || colors.card || '#111726',
            borderColor: colors.border || 'rgba(255,255,255,0.08)',
          },
        ]}>
        <View style={styles.themeLeft}>
          <Feather
            name={isDarkMode ? 'moon' : 'sun'}
            size={16}
            color={colors.primary || '#6366F1'}
            style={{marginRight: spacing.sm}}
          />
          <Text style={[styles.themeLabel, {color: colors.textPrimary}]}>
            {isDarkMode ? 'Dark Mode' : 'Light Mode'}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.themeSwitchPill,
            {
              backgroundColor: (colors.primary || '#6366F1') + '22',
              borderColor: colors.primary || '#6366F1',
            },
          ]}
          activeOpacity={0.7}
          onPress={() => toggleTheme()}>
          <Text
            style={[
              styles.themeSwitchText,
              {color: colors.primary || '#6366F1'},
            ]}>
            Switch
          </Text>
        </TouchableOpacity>
      </View>

      {/* Navigation Items */}
      <View style={styles.menuContainer}>
        <Text style={[styles.sectionTitle, {color: colors.textSecondary}]}>
          LIBRARY
        </Text>

        {/* All Songs */}
        <TouchableOpacity
          style={[
            styles.navItem,
            {borderBottomColor: colors.border || 'rgba(255,255,255,0.06)'},
          ]}
          activeOpacity={0.7}
          onPress={() => navigateTo('HOME_SCREEN')}>
          <View style={styles.navItemLeft}>
            <View
              style={[
                styles.navIconBox,
                {backgroundColor: colors.surfaceElevated || colors.maximumTintColor + '15'},
              ]}>
              <Feather name="music" size={16} color={colors.iconPrimary} />
            </View>
            <Text style={[styles.navItemLabel, {color: colors.textPrimary}]}>
              All Songs
            </Text>
          </View>
          <View
            style={[
              styles.countBadge,
              {backgroundColor: colors.surfaceElevated || colors.maximumTintColor + '22'},
            ]}>
            <Text style={[styles.countBadgeText, {color: colors.textSecondary}]}>
              {songs.length}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Playlists */}
        <TouchableOpacity
          style={[
            styles.navItem,
            {borderBottomColor: colors.border || 'rgba(255,255,255,0.06)'},
          ]}
          activeOpacity={0.7}
          onPress={() => navigateTo('PLAYLISTS_SCREEN')}>
          <View style={styles.navItemLeft}>
            <View
              style={[
                styles.navIconBox,
                {backgroundColor: colors.surfaceElevated || colors.maximumTintColor + '15'},
              ]}>
              <MaterialIcons
                name="queue-music"
                size={18}
                color={colors.iconPrimary}
              />
            </View>
            <Text style={[styles.navItemLabel, {color: colors.textPrimary}]}>
              Playlists
            </Text>
          </View>
          <View
            style={[
              styles.countBadge,
              {backgroundColor: colors.surfaceElevated || colors.maximumTintColor + '22'},
            ]}>
            <Text style={[styles.countBadgeText, {color: colors.textSecondary}]}>
              {playlists.length}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Liked Songs */}
        <TouchableOpacity
          style={[
            styles.navItem,
            {borderBottomColor: colors.border || 'rgba(255,255,255,0.06)'},
          ]}
          activeOpacity={0.7}
          onPress={() => navigateTo('LIKE_SCREEN')}>
          <View style={styles.navItemLeft}>
            <View style={[styles.navIconBox, styles.heartIconBox]}>
              <Feather name="heart" size={16} color="#EF4444" />
            </View>
            <Text style={[styles.navItemLabel, {color: colors.textPrimary}]}>
              Liked Songs
            </Text>
          </View>
          <View
            style={[
              styles.countBadge,
              {backgroundColor: colors.surfaceElevated || colors.maximumTintColor + '22'},
            ]}>
            <Text style={[styles.countBadgeText, {color: colors.textSecondary}]}>
              {likedSongs.length}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Now Playing shortcut */}
        <TouchableOpacity
          style={[
            styles.navItem,
            {borderBottomColor: colors.border || 'rgba(255,255,255,0.06)'},
          ]}
          activeOpacity={0.7}
          onPress={() => navigateTo('PLAYER_SCREEN')}>
          <View style={styles.navItemLeft}>
            <View
              style={[
                styles.navIconBox,
                {backgroundColor: (colors.primary || '#6366F1') + '1A'},
              ]}>
              <Feather
                name="play-circle"
                size={16}
                color={colors.primary || '#6366F1'}
              />
            </View>
            <Text style={[styles.navItemLabel, {color: colors.textPrimary}]}>
              Now Playing
            </Text>
          </View>
          <Feather
            name="chevron-right"
            size={16}
            color={colors.iconSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Footer Info */}
      <View style={styles.footerContainer}>
        <View
          style={[
            styles.footerBox,
            {
              backgroundColor: colors.surface || colors.card || '#111726',
              borderColor: colors.border || 'rgba(255,255,255,0.08)',
            },
          ]}>
          <Text style={[styles.footerVersion, {color: colors.textPrimary}]}>
            Trackly Music v1.6
          </Text>
          <Text style={[styles.footerSubtitle, {color: colors.textSecondary}]}>
            High-Fidelity Offline Audio Player
          </Text>
        </View>
      </View>
    </DrawerContentScrollView>
  );
};

export default CustomDrawerContent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? spacing.md : spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.md,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSize.lg,
    letterSpacing: -0.4,
  },
  brandTagline: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSize.xs,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginVertical: spacing.md,
  },
  themeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeLabel: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSize.sm,
  },
  themeSwitchPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  themeSwitchText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSize.xs,
  },
  menuContainer: {
    marginVertical: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: 10,
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: 1,
  },
  navItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  navIconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartIconBox: {
    backgroundColor: '#EF444415',
  },
  navItemLabel: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSize.md,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  countBadgeText: {
    fontFamily: fontFamilies.bold,
    fontSize: 11,
  },
  footerContainer: {
    marginTop: 'auto',
    paddingTop: spacing.xl,
  },
  footerBox: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  footerVersion: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSize.xs,
    marginBottom: 2,
  },
  footerSubtitle: {
    fontFamily: fontFamilies.regular,
    fontSize: 11,
  },
});
