import { useState, useEffect, useRef } from 'react';
import { toast } from '../ui/sonner';
import { TEST_AUDIO_URLS } from '../../constants/testAudio';

interface AudioManagerProps {
  sessionData: any;
  volume: number;
  onCurrentTimeChange: (time: number) => void;
  onDurationChange: (duration: number) => void;
  onPlayingStateChange: (playing: boolean) => void;
  onShowMoodAfter: () => void;
}

export const useAudioManager = ({
  sessionData,
  volume,
  onCurrentTimeChange,
  onDurationChange,
  onPlayingStateChange,
  onShowMoodAfter
}: AudioManagerProps) => {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(900); // 15 minutes default
  const [usingFallbackAudio, setUsingFallbackAudio] = useState(false);
  const fallbackAttempted = useRef(false);

  // Initialize audio when session data is available
  useEffect(() => {
    if (!sessionData) {
      return;
    }

    // Set duration from session data
    if (sessionData.duration) {
      const newDuration = sessionData.duration * 60;
      setDuration(newDuration);
      onDurationChange(newDuration);
    }

    // Use the audio URL from the API response directly
    // Backend returns 'file_url' field
    console.log('🎵 AudioManager: sessionData received:', JSON.stringify(sessionData, null, 2));
    let audioUrl = sessionData.audioUrl || sessionData.file_url;
    console.log('🎵 AudioManager: extracted audioUrl:', audioUrl);

    // If no URL is provided, use test audio as fallback
    if (!audioUrl) {
      console.log('⚠️ No audio URL provided, using test audio fallback');
      if (TEST_AUDIO_URLS.length > 0) {
        audioUrl = TEST_AUDIO_URLS[0].url;
        setUsingFallbackAudio(true);
        fallbackAttempted.current = true;
      } else {
        console.error('No audio URL provided and no fallback available');
        return;
      }
    }

    // Check if URL is a known placeholder/invalid URL
    const isPlaceholderUrl = audioUrl.includes('example.com') ||
                             audioUrl.includes('placeholder');

    console.log('🎵 AudioManager: Original URL:', audioUrl);
    console.log('🎵 AudioManager: isPlaceholderUrl:', isPlaceholderUrl);

    if (isPlaceholderUrl && TEST_AUDIO_URLS.length > 0) {
      console.log('🔄 Detected placeholder URL, using test audio instead');
      audioUrl = TEST_AUDIO_URLS[0].url;
      setUsingFallbackAudio(true);
      fallbackAttempted.current = true;
    }

    console.log('🎵 AudioManager: Final URL being used:', audioUrl);

    // For S3 URLs, extract the base URL without query parameters
    if (audioUrl && audioUrl.includes('appatonce.s3.us-east-1.amazonaws.com')) {
      const baseUrl = audioUrl.split('?')[0];
      audioUrl = baseUrl;
    }

    if (audioUrl) {
      // Clean up any existing audio first
      if (audio) {
        audio.pause();
        audio.src = '';
        setAudio(null);
      }

      const audioElement = new Audio();
      audioElement.preload = 'metadata';
      audioElement.volume = volume;

      // For S3 URLs with signed parameters, don't set crossOrigin
      const isS3Url =
        audioUrl.includes('s3.amazonaws.com') ||
        audioUrl.includes('appatonce.s3') ||
        audioUrl.includes('s3.us-east-1.amazonaws.com');

      // Check if it's from cdn.fluxez.com
      const isFluxezCDN = audioUrl.includes('cdn.fluxez.com');

      // Check if it's a test audio URL (soundhelix, etc.) - these may not support CORS
      const isTestAudio = audioUrl.includes('soundhelix.com') ||
                          audioUrl.includes('sample-videos.com');

      // Don't set crossOrigin for S3 signed URLs, Fluxez CDN, or test audio as it can cause CORS issues
      // Setting crossOrigin to 'anonymous' requires the server to return Access-Control-Allow-Origin header
      if (!isS3Url && !isFluxezCDN && !isTestAudio) {
        audioElement.crossOrigin = 'anonymous';
      }

      // Set up event listeners
      const handleLoadedMetadata = () => {
        if (audioElement.duration && !isNaN(audioElement.duration)) {
          const newDuration = audioElement.duration;
          setDuration(newDuration);
          onDurationChange(newDuration);
        }
      };

      const handleTimeUpdate = () => {
        const newTime = audioElement.currentTime;
        console.log('⏱️ timeupdate:', newTime);
        setCurrentTime(newTime);
        onCurrentTimeChange(newTime);
      };

      const handleEnded = async () => {
        onPlayingStateChange(false);

        // Always show mood tracker when audio ends to let user complete the session properly
        // This prevents duplicate session creation and ensures proper session completion flow
        onShowMoodAfter();
      };

      let errorHandled = false;
      const handleError = (e: Event) => {
        if (errorHandled) return;
        errorHandled = true;
        console.error('Audio loading error:', e);
        const target = e.target as HTMLAudioElement;
        if (target && target.error) {
          console.error('Failed to load audio from URL:', target.src);
          console.error('Audio error details:', target.error);
          console.error('Error code:', target.error.code);
          console.error('Error message:', target.error.message);

          // For S3 CORS issues, suggest alternative solutions
          if (target.error.code === 4 && isS3Url) {
            console.error(
              'S3 CORS issue detected. The audio file exists but cannot be accessed due to CORS policy.',
            );
          }

          // Try fallback audio if not already attempted
          if (!fallbackAttempted.current && TEST_AUDIO_URLS.length > 0) {
            fallbackAttempted.current = true;
            console.log('🔄 Attempting to use fallback test audio...');
            const fallbackUrl = TEST_AUDIO_URLS[0].url;
            target.src = fallbackUrl;
            target.load();
            setUsingFallbackAudio(true);
            toast.info('Using test audio - original audio unavailable');
          }
        }
      };

      const handleCanPlay = () => {
        // Audio is ready to play
      };

      const handleLoadStart = () => {
        // Audio loading started
      };

      const handleLoadedData = () => {
        // Audio data loaded
      };

      audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
      audioElement.addEventListener('timeupdate', handleTimeUpdate);
      audioElement.addEventListener('ended', handleEnded);
      audioElement.addEventListener('error', handleError);
      audioElement.addEventListener('canplay', handleCanPlay);
      audioElement.addEventListener('loadstart', handleLoadStart);
      audioElement.addEventListener('loadeddata', handleLoadedData);

      audioElement.src = audioUrl;
      audioElement.load();
      setAudio(audioElement);

      return () => {
        audioElement.pause();
        audioElement.src = '';
        audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audioElement.removeEventListener('timeupdate', handleTimeUpdate);
        audioElement.removeEventListener('ended', handleEnded);
        audioElement.removeEventListener('error', handleError);
        audioElement.removeEventListener('canplay', handleCanPlay);
        audioElement.removeEventListener('loadstart', handleLoadStart);
        audioElement.removeEventListener('loadeddata', handleLoadedData);
      };
    }
  }, [sessionData]);

  // Update audio volume when volume state changes
  useEffect(() => {
    if (audio) {
      audio.volume = volume;
    }
  }, [audio, volume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, [audio]);

  const play = async () => {
    console.log('🎵 play() called, audio element:', !!audio);
    if (audio) {
      console.log('🎵 Audio state:', {
        src: audio.src,
        readyState: audio.readyState,
        paused: audio.paused,
        currentTime: audio.currentTime,
        duration: audio.duration,
        networkState: audio.networkState,
        error: audio.error
      });
      try {
        await audio.play();
        console.log('✅ audio.play() succeeded');
        return true;
      } catch (error) {
        console.error('❌ audio.play() failed:', error);
        if (error instanceof Error && error.name === 'NotAllowedError') {
          toast.error('Click play again to start audio');
        } else if (error instanceof Error) {
          toast.error(`Audio failed to play: ${error.message}`);
        } else {
          toast.error('Audio failed to play');
        }
        return false;
      }
    }
    console.warn('⚠️ No audio element available');
    return false;
  };

  const pause = () => {
    if (audio) {
      audio.pause();
    }
  };

  const skipForward = (seconds: number = 30) => {
    if (audio) {
      const newTime = Math.min(audio.currentTime + seconds, duration);
      audio.currentTime = newTime;
      setCurrentTime(newTime);
      onCurrentTimeChange(newTime);
    } else {
      const newTime = Math.min(currentTime + seconds, duration);
      setCurrentTime(newTime);
      onCurrentTimeChange(newTime);
    }
  };

  const skipBackward = (seconds: number = 10) => {
    if (audio) {
      const newTime = Math.max(audio.currentTime - seconds, 0);
      audio.currentTime = newTime;
      setCurrentTime(newTime);
      onCurrentTimeChange(newTime);
    } else {
      const newTime = Math.max(currentTime - seconds, 0);
      setCurrentTime(newTime);
      onCurrentTimeChange(newTime);
    }
  };

  const seekTo = (time: number) => {
    if (audio && duration > 0) {
      audio.currentTime = time;
      setCurrentTime(time);
      onCurrentTimeChange(time);
    }
  };

  return {
    audio,
    currentTime,
    duration,
    usingFallbackAudio,
    play,
    pause,
    skipForward,
    skipBackward,
    seekTo
  };
};