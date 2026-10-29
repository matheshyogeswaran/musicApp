import {DefaultTheme} from '@react-navigation/native';
import {colors} from '../constants/colors';

export const darkTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    ...colors.dark,
  },
};

export default darkTheme;
