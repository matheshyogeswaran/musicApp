import {useCallback, useEffect, useState} from 'react';
import TrackPlayer from 'react-native-track-player';

export const usePlayerRepeatMode = () => {
  const [repeatMode, setRepeatMode] = useState(null);
  const changeRepeatMode = useCallback(async repeatMode => {
    await TrackPlayer.setRepeatMode(repeatMode);
    setRepeatMode(repeatMode);
  }, []);

  useEffect(() => {
    TrackPlayer.getRepeatMode().then(setRepeatMode);
  }, []);

  return {repeatMode, changeRepeatMode};
};
