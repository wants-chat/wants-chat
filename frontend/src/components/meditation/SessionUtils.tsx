export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const handleProgressClick = (
  e: React.MouseEvent<HTMLDivElement>,
  duration: number,
  onSeek: (time: number) => void
) => {
  if (duration > 0) {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentClicked = clickX / rect.width;
    const newTime = percentClicked * duration;
    onSeek(newTime);
  }
};

export const calculateProgress = (currentTime: number, duration: number): number => {
  return duration > 0 ? (currentTime / duration) * 100 : 0;
};