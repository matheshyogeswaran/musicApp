import { useEffect, useRef } from "react";
import TrackPlayer, { Capability, RatingType, RepeatMode } from "react-native-track-player"

const setupPlayer = async () => {
    await TrackPlayer.setupPlayer({
        maxCacheSize: 1024 * 10,
    });
    await TrackPlayer.updateOptions({
        ratingType: RatingType.Heart,
        capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
            Capability.Stop,
        ],
        compactCapabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
        ],
    });
    await TrackPlayer.setRepeatMode(RepeatMode.Queue);
};

export const useSetupPlayer = ({ onLoad }) => {
    const isInitialized = useRef(false);
    useEffect(() => {
        setupPlayer().then(() => {
            isInitialized.current = true;
            console.log("setup player done")
            onLoad();
        })
            .catch((error) => {
                isInitialized.current = false;
                console.log("errpr", error);
            })
    }, [])

}