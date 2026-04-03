import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import {
  Clock,
} from 'lucide-react';
import Icon from '@mdi/react';
import { mdiMeditation, mdiArrowLeft } from '@mdi/js';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import Header from '../../components/landing/Header';

// Import extracted components
import { SessionInfo } from '../../components/meditation/SessionInfo';
import { BreathingCircle } from '../../components/meditation/BreathingCircle';
import { MeditationControls } from '../../components/meditation/MeditationControls';
import { VolumeControl } from '../../components/meditation/VolumeControl';
import { MoodTrackingModal } from '../../components/meditation/MoodTrackingModal';

// Import new modular hooks
import { useSessionDataManager } from '../../components/meditation/SessionDataManager';
import { useAudioManager } from '../../components/meditation/AudioManager';
import { useSessionManager } from '../../components/meditation/SessionManager';
import { formatTime, handleProgressClick as handleProgressClickUtil, calculateProgress } from '../../components/meditation/SessionUtils';

const MeditationSession: React.FC = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(900); // 15 minutes default
  const [isLiked, setIsLiked] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [showMoodBefore, setShowMoodBefore] = useState(false);
  const [showMoodAfter, setShowMoodAfter] = useState(false);

  // Use the new modular hooks
  const {
    sessionData,
    loading,
    error,
    categoryId,
    subOptionId,
    audioId,
    programId,
    sessionId,
    isProgramSession
  } = useSessionDataManager();

  const {
    currentSessionId,
    moodBefore,
    moodAfter,
    setMoodBefore,
    setMoodAfter,
    startMeditationSession,
    completeMeditationSession
  } = useSessionManager({
    sessionData,
    categoryId,
    subOptionId,
    audioId,
    programId,
    sessionId
  });

  const {
    audio,
    play: audioPlay,
    pause: audioPause,
    skipForward,
    skipBackward,
    seekTo
  } = useAudioManager({
    sessionData,
    volume,
    onCurrentTimeChange: setCurrentTime,
    onDurationChange: setDuration,
    onPlayingStateChange: setIsPlaying,
    onShowMoodAfter: () => setShowMoodAfter(true)
  });


  const togglePlayPause = async () => {
    console.log('🎮 togglePlayPause called:', {
      isPlaying,
      currentTime,
      currentSessionId,
      hasAudio: !!audio,
      isProgramSession,
      programId,
      sessionId,
      sessionDataType: sessionData?.type,
      moodBefore,
      showMoodBefore
    });

    if (audio) {
      if (isPlaying) {
        console.log('⏸️ Pausing audio');
        audioPause();
      } else {
        // First play: Show mood before selection BEFORE creating session
        if (currentTime === 0 && !currentSessionId && !moodBefore && !showMoodBefore) {
          console.log('🎭 Showing mood before selection first');
          setShowMoodBefore(true);
          return; // Don't start audio yet, wait for mood selection
        }
        
        // Create session when we have mood or user skipped mood selection
        if (currentTime === 0 && !currentSessionId) {
          console.log('🚀 Creating session before starting audio', { moodBefore });
          await startMeditationSession();
        } else {
          console.log('⏭️ Resuming audio (session already created or time > 0)');
        }

        const playSuccess = await audioPlay();
        if (!playSuccess) {
          setIsPlaying(false);
          return;
        }
      }
      setIsPlaying(!isPlaying);
    } else {
      // Fallback for sessions without audio
      console.log('📻 No audio element, fallback flow');
      
      // First play: Show mood before selection BEFORE creating session
      if (!isPlaying && currentTime === 0 && !currentSessionId && !moodBefore && !showMoodBefore) {
        console.log('🎭 Showing mood before selection first (fallback)');
        setShowMoodBefore(true);
        return; // Don't start session yet, wait for mood selection
      }
      
      if (!isPlaying && currentTime === 0 && !currentSessionId) {
        console.log('🚀 Creating session in fallback flow', { moodBefore });
        await startMeditationSession();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSkipForward = () => {
    skipForward(30);
  };

  const handleSkipBackward = () => {
    skipBackward(10);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    handleProgressClickUtil(e, duration, seekTo);
  };

  const progress = calculateProgress(currentTime, duration);

  // Add loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-4 text-white">Loading meditation session...</h2>
          <p className="text-white/60">Preparing your meditation experience...</p>
        </div>
      </div>
    );
  }

  // Add error state
  if (error || !sessionData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-red-400 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-white">Unable to Load Session</h2>
          <p className="text-white/60 mb-6">{error || 'Session data could not be loaded. Please try again.'}</p>
          <div className="space-x-4">
            <Button variant="outline" onClick={() => navigate(-1)} className="border-white/20 text-white hover:bg-white/10">
              Go Back
            </Button>
            <Button onClick={() => navigate('/meditation')} className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white">
              Browse Meditations
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects variant="subtle" />

      <div className="relative z-10">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/meditation')}
          className="mb-6 text-white/70 hover:text-white"
        >
          <Icon path={mdiArrowLeft} size={0.8} className="mr-2" />
          Back to Meditation
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Session Info */}
          <div className="lg:col-span-1">
            <SessionInfo
              title={sessionData?.title}
              instructor={sessionData?.instructor}
              description={sessionData?.description}
              duration={duration}
              currentTime={currentTime}
            />
          </div>

          {/* Center Column - Player */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              {/* Visual Element - Breathing Circle */}
              <BreathingCircle isPlaying={isPlaying} />

              {/* Meditation Controls */}
              <MeditationControls
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={duration}
                onPlayPause={togglePlayPause}
                onSkipForward={handleSkipForward}
                onSkipBackward={handleSkipBackward}
                onProgressClick={handleProgressClick}
                formatTime={formatTime}
              />
            </Card>

            {/* Additional Controls */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* End Session Button */}
              <Card className="p-4 sm:col-span-2">
                <Button
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10"
                  onClick={() => {
                    // Pause audio if playing
                    if (audio && isPlaying) {
                      audioPause();
                      setIsPlaying(false);
                    }
                    // Show mood tracker to complete session
                    setShowMoodAfter(true);
                  }}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  End Session Early
                </Button>
              </Card>
              <VolumeControl
                volume={volume}
                onVolumeChange={handleVolumeChange}
              />

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon path={mdiMeditation} size={0.8} className="text-teal-400" />
                    <span className="text-sm font-medium text-white">Focus Mode</span>
                  </div>
                  <Button variant="outline" size="sm" className="h-8">
                    Enable
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Mood Before Modal */}
      <MoodTrackingModal
        isVisible={showMoodBefore}
        title="How are you feeling before this session?"
        mood={moodBefore}
        onMoodChange={setMoodBefore}
        onSkip={() => {
          console.log('🚫 User skipped mood before selection');
          setMoodBefore(5); // Default mood when skipped
          setShowMoodBefore(false);
          togglePlayPause();
        }}
        onContinue={() => {
          console.log('✅ User selected mood before:', moodBefore);
          setShowMoodBefore(false);
          togglePlayPause();
        }}
        disabled={!moodBefore}
      />

      {/* Mood After Modal */}
      <MoodTrackingModal
        isVisible={showMoodAfter}
        title="How are you feeling after this session?"
        mood={moodAfter}
        onMoodChange={setMoodAfter}
        onSkip={() => {
          setShowMoodAfter(false);
          completeMeditationSession(5, currentTime);
        }}
        onContinue={() => {
          setShowMoodAfter(false);
          completeMeditationSession(5, currentTime);
        }}
        continueText="Complete Session"
        disabled={!moodAfter}
      />
      </div>
    </div>
  );
};

export default MeditationSession;