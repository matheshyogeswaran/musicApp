import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {colors} from '../constants/colors';
import Header from '../components/Header';
import { fontFamilies } from '../constants/fonts';

const HomeScreen = () => {
  return (
    <View style={styles.container}>
     <Header/>
      <Text style={styles.headingText}>Recommended for you</Text>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  headingText:{
    fontSize:25,
    color:colors.textPrimary,
    fontFamily: fontFamilies.bold,
  }

});
