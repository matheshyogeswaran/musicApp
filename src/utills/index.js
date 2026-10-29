export const formatSecondsToMinute = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const formatedMinutes = String(minutes).padStart(2, '0');
  const formetedSeconds = String(remainingSeconds).padStart(2, '0');
  return `${formatedMinutes}:${formetedSeconds}`;
};

export const isExist = (songs, track) => {
  if (!Array.isArray(songs) || !track || !track.url) {
    return false;
  }
  return songs.some((song) => song && song.url === track.url);
};
