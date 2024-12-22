import {StyleSheet, Text, View, TouchableOpacity, Platform} from 'react-native';
import React from 'react';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import AntDesign from 'react-native-vector-icons/AntDesign';
// import {colors} from '../constants/colors';
import {iconSizes, spacing} from '../constants/dimensions';
import {SafeAreaView} from 'react-native-safe-area-context';
import { useNavigation, useTheme } from '@react-navigation/native';
const Header = () => {
  const {colors} = useTheme();

  const navigation = useNavigation();
  const toggleDrawer =()=>{
    navigation.toggleDrawer();


  }
  return (
    <SafeAreaView style={[styles.safeArea,{ backgroundColor: colors.background}]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleDrawer}>
          <FontAwesome5
            name={'grip-lines'}
            color={colors.iconPrimary}
            size={iconSizes.md}
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <AntDesign
            name={'search1'}
            color={colors.iconPrimary}
            size={iconSizes.md}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Header;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Platform.OS === 'ios' ? spacing.xl : 0,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  safeArea: {
   
  },
});
