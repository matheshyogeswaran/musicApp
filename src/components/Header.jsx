import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React from 'react';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {colors} from '../constants/colors';
import {iconSizes, spacing} from '../constants/dimensions';
const Header = () => {
  return (
    <View>
      <View style={styles.header}>
        <TouchableOpacity>
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
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
});
