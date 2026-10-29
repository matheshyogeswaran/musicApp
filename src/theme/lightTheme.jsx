import {DefaultTheme} from '@react-navigation/native';
import {colors} from '../constants/colors';

export const lightTheme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    ...colors.light,
  },
};

export default lightTheme;
