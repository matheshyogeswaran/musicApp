import {TouchableOpacity} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import {iconSizes} from '../constants/dimensions';
import {colors} from '../constants/colors';

export const GotoPreviousButton = ({size = iconSizes.xl}) => {
  return (
    <TouchableOpacity activeOpacity={0.85}>
      <FontAwesome6 name={'backward'} size={size} color={colors.iconPrimary} />
    </TouchableOpacity>
  );
};

export const PlayPauseButton = ({size = iconSizes.lg}) => {
    const isPlaying =false;
  return (
    <TouchableOpacity activeOpacity={0.85}>
      <FontAwesome6
        name={isPlaying ? 'pause' : 'play'}
        size={size}
        color={colors.iconPrimary}
      />
    </TouchableOpacity>
  );
};

export const GotoNextButton = ({size = iconSizes.xl}) => {
  return (
    <TouchableOpacity activeOpacity={0.85}>
      <FontAwesome6 name={'forward'} size={size} color={colors.iconPrimary} />
    </TouchableOpacity>
  );
};
