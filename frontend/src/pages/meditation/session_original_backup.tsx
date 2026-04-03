import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import {
  Clock,
} from 'lucide-react';
import Icon from '@mdi/react';
import { mdiMeditation } from '@mdi/js';
import { useTheme } from '../../contexts/ThemeContext';
import { useMeditation } from '../../hooks';
import {
  meditationService,
  FeaturedCategory,
  FeaturedSubOption,
} from '../../services/meditationService';
import SimpleMoodTracker from '../../components/meditation/SimpleMoodTracker';
import {
  getValidSessionType,
  MEDITATION_ENVIRONMENTS,
  MEDITATION_DIFFICULTY_LEVELS,
} from '../../constants/meditation';

// Import extracted components
import { SessionHeader } from '../../components/meditation/SessionHeader';
import { SessionInfo } from '../../components/meditation/SessionInfo';
import { BreathingCircle } from '../../components/meditation/BreathingCircle';
import { MeditationControls } from '../../components/meditation/MeditationControls';
import { VolumeControl } from '../../components/meditation/VolumeControl';

const MeditationSession: React.FC = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(900); // 15 minutes default
  const [isLiked, setIsLiked] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [volume, setVolume] = useState(0.8);
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showMoodBefore, setShowMoodBefore] = useState(false);
  const [showMoodAfter, setShowMoodAfter] = useState(false);
  const [moodBefore, setMoodBefore] = useState<number | undefined>();
  const [moodAfter, setMoodAfter] = useState<number | undefined>();

  // Get meditation data for dynamic routing
  const { featured, audioLibrary } = useMeditation();

  // Try to get enhanced featured data from session storage first
  const [enhancedFeatured, setEnhancedFeatured] = useState<FeaturedCategory[]>([]);

  useEffect(() => {
    // Check session storage for enhanced data
    const storedFeatured = sessionStorage.getItem('meditationFeatured');
    if (storedFeatured) {
      try {
        const parsed = JSON.parse(storedFeatured);
        setEnhancedFeatured(parsed);
      } catch (e) {
        setEnhancedFeatured(featured);
      }
    } else {
      setEnhancedFeatured(featured);
    }
  }, [featured]);

  // Extract params for all route patterns
  const id = params.id; // For featured sessions or direct audio ID
  const categoryId = params.categoryId; // For dynamic meditation routes
  const subOptionId = params.subOptionId;
  const durationParam = params.duration;
  const programId = params.programId; // For program routes
  const sessionId = params.sessionId; // For program session routes
  const audioId = params.audioId; // For direct audio ID in program sessions

  // Check if this is a quick session route
  const isQuickSession = categoryId === 'quick' && subOptionId === 'session';

  // Check if this is a program session route (has programId and sessionId params)
  const isProgramSession = !!(programId && sessionId);
  
  // Check if this is a direct audio route (/meditation/player/{audio_id})
  const isDirectAudioRoute = id && !categoryId && !subOptionId && !programId;

  // Get session data from API or featured content
  const getSessionData = async () => {
    setLoading(true);

    try {
      // Handle direct audio route first (/meditation/player/{audio_id})
      if (isDirectAudioRoute && id) {
        try {
          const audioData = await meditationService.getAudioById(id);
          return {
            title: audioData.title || 'Meditation Session',
            instructor: audioData.narrator || 'Featured Instructor',
            description: audioData.description || `Listen to ${audioData.title}`,
            audioUrl: audioData.file_url,
            duration: Math.round((audioData.duration_seconds || 600) / 60),
            audioId: audioData.id,
            category: audioData.category,
            type: audioData.type || 'meditation',
            tags: audioData.tags || [],
            language: audioData.language || 'en',
            isPremium: audioData.is_premium || false,
            isFavorited: audioData.is_favorited || false,
            playCount: audioData.play_count || 0,
          };
        } catch (error) {
          console.error('Failed to fetch audio by direct ID:', error);
          throw error;
        }
      }
      
      // Handle program session route with audio ID
      if (isProgramSession && programId && sessionId) {

        try {
          // Fetch program session details
          const sessionData = await meditationService.getProgramSession(programId, sessionId);
          
          // If audio ID is provided, fetch audio data separately
          let audioData = null;
          if (audioId || sessionData.audio_id) {
            const audioIdToFetch = audioId || sessionData.audio_id;
            try {
              audioData = await meditationService.getAudioById(audioIdToFetch);
            } catch (error) {
            }
          }

          return {
            title: sessionData.title || 'Program Session',
            instructor: audioData?.narrator || sessionData.narrator || 'Program Instructor',
            description: sessionData.description || `Session ${sessionId} from program`,
            audioUrl: audioData?.file_url || sessionData.audio?.url || sessionData.audio?.file_url || null,
            duration: sessionData.duration_minutes || (audioData ? Math.round(audioData.duration_seconds / 60) : 15),
            audioId: audioId || sessionData.audio_id || sessionData.id,
            category: 'program',
            type: 'program-session',
            programId: programId,
            sessionId: sessionId,
            sessionNumber: sessionData.session_number,
            instructions: sessionData.instructions,
            focusPoints: sessionData.focus_points,
            isLocked: sessionData.is_locked,
            canAccess: sessionData.can_access,
            userCompleted: sessionData.user_completed,
            nextSessionId: sessionData.next_session_id,
          };
        } catch (error) {
          console.error('Failed to fetch program session:', error);
          throw error;
        }
      }

      // Check if subOptionId is a UUID (audio ID)
      const isAudioId =
        subOptionId &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(subOptionId);

      // If it's an audio ID, fetch directly using the audio ID API
      if (isAudioId) {

        try {
          const audioData = await meditationService.getAudioById(subOptionId);

          const sessionData = {
            title: audioData.title || 'Meditation Session',
            instructor: audioData.narrator || 'Featured Instructor',
            description: audioData.description || `Listen to ${audioData.title}`,
            audioUrl: audioData.file_url,
            duration: Math.round((audioData.duration_seconds || 600) / 60),
            audioId: audioData.id,
            category: audioData.category,
            type: audioData.type || 'meditation',
            tags: audioData.tags || [],
            language: audioData.language || 'en',
            isPremium: audioData.is_premium || false,
            isFavorited: audioData.is_favorited || false,
            playCount: audioData.play_count || 0,
            lastPlayed: audioData.last_played,
            fileSizeMb: audioData.file_size_mb || 0,
            createdAt: audioData.created_at,
          };


          return sessionData;
        } catch (error) {
          console.error('Failed to fetch audio by ID:', error);

          // Fallback: try to get from stored data
          const storedAudio = sessionStorage.getItem('quickSessionAudio');
          if (storedAudio) {
            try {
              const audioData = JSON.parse(storedAudio);
                return {
                title: audioData.title,
                instructor: audioData.narrator || 'Featured Instructor',
                description: audioData.description || `Listen to ${audioData.title}`,
                audioUrl: audioData.audioUrl || audioData.file_url,
                duration: audioData.duration || (durationParam ? parseInt(durationParam) : 10),
                audioId: audioData.id,
                category: audioData.category,
                type: audioData.type,
              };
            } catch (e) {
              }
          }
        }
      }

      // Handle quick sessions first
      if (isQuickSession && durationParam) {
        const s3AudioUrl =
          'https://appatonce.s3.us-east-1.amazonaws.com/projects/cmes06tn90000oa01ord6ipi5/meditation-audio/14d75eb0-afdf-4248-9864-b63439670269-1756892185060-1756892180440-Body-Scan-Meditation.mp3';
        const duration = (durationParam ? parseInt(durationParam) : 0) || 10;

        // Map duration to actual session titles from index.tsx
        const quickSessions = {
          5: { title: 'Quick Calm', description: 'A quick meditation to find your center' },
          10: { title: 'Focus Boost', description: 'Sharpen your focus and mental clarity' },
          15: { title: 'Stress Relief', description: 'Release tension and find calm' },
        };

        const sessionInfo = quickSessions[duration as keyof typeof quickSessions] || {
          title: `${duration}-Minute Session`,
          description: `${duration} minute meditation session`,
        };

        return {
          title: `${sessionInfo.title} (${duration} min)`,
          instructor: 'Featured Instructor',
          description: sessionInfo.description,
          audioUrl: s3AudioUrl,
          duration: duration,
        };
      }

      // Handle dynamic meditation routes - use enhanced data if available
      const dataToUse = enhancedFeatured.length > 0 ? enhancedFeatured : featured;

      if (categoryId && subOptionId && durationParam && dataToUse.length > 0) {
        const category = dataToUse.find((cat: FeaturedCategory) => cat.id === categoryId);

        if (category) {
          const subOption = category.subOptions?.find(
            (sub: FeaturedSubOption) => sub.id === subOptionId,
          );

          if (subOption) {
            const session: any = subOption.sessions?.find(
              (s) => s.duration === (durationParam ? parseInt(durationParam) : 0),
            );
            if (session) {
              // Use the actual audio URL from the session
              let finalAudioUrl = session.audioUrl;

              // Check if URL is valid
              const isValidUrl =
                finalAudioUrl &&
                (finalAudioUrl.includes('s3.amazonaws.com') ||
                  finalAudioUrl.includes('s3.us-east-1.amazonaws.com') ||
                  finalAudioUrl.includes('appatonce.s3') ||
                  finalAudioUrl.startsWith('http'));

              // Use the audio URL from the session if valid
              if (!isValidUrl) {
                // Fallback URL only if the session URL is invalid
                const s3AudioUrl =
                  'https://appatonce.s3.us-east-1.amazonaws.com/projects/cmes06tn90000oa01ord6ipi5/meditation-audio/14d75eb0-afdf-4248-9864-b63439670269-1756892185060-1756892180440-Body-Scan-Meditation.mp3';
                finalAudioUrl = s3AudioUrl;
              }

              return {
                title: session.title,
                instructor: session.narrator || 'Featured Instructor',
                description: subOption.description,
                audioUrl: finalAudioUrl,
                duration: session.duration || (durationParam ? parseInt(durationParam) : 0) || 10,
              };
            }
          }
        }

        // Fallback for dynamic sessions - use specified S3 audio
        const requestedMinutes = (durationParam ? parseInt(durationParam) : 0) || 10;
        const s3AudioUrl =
          'https://appatonce.s3.us-east-1.amazonaws.com/projects/cmes06tn90000oa01ord6ipi5/meditation-audio/14d75eb0-afdf-4248-9864-b63439670269-1756892185060-1756892180440-Body-Scan-Meditation.mp3';

        // Create more specific titles based on the route parameters
        const titleMap: Record<string, Record<string, string>> = {
          'after-work': {
            stressed: `${requestedMinutes}-minute stress relief`,
            overwhelmed: `${requestedMinutes}-minute mental reset`,
            energized: `${requestedMinutes}-minute energy balance`,
          },
        };

        const categoryMap = titleMap[categoryId];
        const specificTitle =
          (categoryMap && categoryMap[subOptionId]) ||
          `${subOptionId
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase())} (${requestedMinutes} min)`;

        return {
          title: specificTitle,
          instructor: 'Featured Instructor',
          description: `${requestedMinutes} minute guided meditation for ${subOptionId.replace(
            /-/g,
            ' ',
          )}`,
          audioUrl: s3AudioUrl,
          duration: requestedMinutes,
        };
      }

      // Handle featured sessions by ID
      if (id) {
        // You could fetch specific session data here if needed
        // const session = await meditationService.getMeditationSession(id);
        // return session;

        // For now, use fallback data
        return getFallbackSessionById(id);
      }

      // Default session
      return getFallbackSessionById('1');
    } catch (error) {
      console.error('Error fetching session data:', error);
      // Try to recover by using fallback data
      return getFallbackSessionById('1');
    } finally {
      setLoading(false);
    }
  };

  // Fallback session data with specified S3 audio
  const getFallbackSessionById = (sessionId: string) => {
    // Use the specified S3 audio URL for all fallback sessions
    const s3AudioUrl =
      'https://appatonce.s3.us-east-1.amazonaws.com/projects/cmes06tn90000oa01ord6ipi5/meditation-audio/14d75eb0-afdf-4248-9864-b63439670269-1756892185060-1756892180440-Body-Scan-Meditation.mp3';

    const sessionsById: Record<string, any> = {
      '1': {
        title: 'Body Scan Meditation',
        instructor: 'Sarah Chen',
        description: 'A relaxing full-body scan to release tension and find peace',
        audioUrl: s3AudioUrl,
        duration: 15,
      },
      '2': {
        title: 'Breathing Awareness',
        instructor: 'Sarah Chen',
        description: 'Focus on your natural breath rhythm',
        audioUrl: s3AudioUrl,
        duration: 10,
      },
      '3': {
        title: 'Sleep Meditation',
        instructor: 'Dr. Emily Sleep',
        description: 'Gentle guidance to help you drift into peaceful sleep',
        audioUrl: s3AudioUrl,
        duration: 20,
      },
      '4': {
        title: 'Morning Energy',
        instructor: 'Mike Johnson',
        description: 'Energize your body and mind for the day ahead',
        audioUrl: s3AudioUrl,
        duration: 10,
      },
      '5': {
        title: 'Stress Relief',
        instructor: 'Michael Calm',
        description: 'Quick stress relief for busy moments',
        audioUrl: s3AudioUrl,
        duration: 5,
      },
    };

    return sessionsById[sessionId] || sessionsById['1'];
  };

  // Load session data when component mounts or params change
  useEffect(() => {
    const loadSession = async () => {
      try {
        setLoading(true);
        const data = await getSessionData();
        setSessionData(data);
      } catch (error) {
        console.error('Failed to load session data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [categoryId, subOptionId, durationParam, id, programId, sessionId, audioId]);

  // Initialize audio when session data is available
  useEffect(() => {
    if (!sessionData) {
      return;
    }


    // Set duration from session data
    if (sessionData.duration) {
      setDuration(sessionData.duration * 60);
    }

    // Use the audio URL from the API response directly
    let audioUrl = sessionData.audioUrl;

    // Only use fallback if no URL is provided
    if (!audioUrl) {
      const defaultS3AudioUrl =
        'https://appatonce.s3.us-east-1.amazonaws.com/projects/cmes06tn90000oa01ord6ipi5/meditation-audio/14d75eb0-afdf-4248-9864-b63439670269-1756892185060-1756892180440-Body-Scan-Meditation.mp3';
      audioUrl = defaultS3AudioUrl;
    }

    // For S3 URLs, extract the base URL without query parameters
    // The files are publicly accessible without authentication
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
      audioElement.preload = 'metadata'; // Change to metadata to avoid full download on error
      audioElement.volume = volume;

      // Check if browser supports the audio format
      const canPlayMp3 = audioElement.canPlayType('audio/mpeg');
      const canPlayMp4 = audioElement.canPlayType('audio/mp4');
      const canPlayWav = audioElement.canPlayType('audio/wav');

      // For S3 URLs with signed parameters, don't set crossOrigin
      const isS3Url =
        audioUrl.includes('s3.amazonaws.com') ||
        audioUrl.includes('appatonce.s3') ||
        audioUrl.includes('s3.us-east-1.amazonaws.com');

      // Don't set crossOrigin for S3 signed URLs as it can cause CORS issues
      if (!isS3Url) {
        audioElement.crossOrigin = 'anonymous';
      }


      // Set up event listeners
      const handleLoadedMetadata = () => {
        if (audioElement.duration && !isNaN(audioElement.duration)) {
          setDuration(audioElement.duration);
        }
      };

      const handleTimeUpdate = () => {
        setCurrentTime(audioElement.currentTime);
      };

      const handleEnded = async () => {
        setIsPlaying(false);
        
        // Auto-complete session with default values if session exists
        if (currentSessionId) {
          try {
            const actualDurationMinutes = Math.floor(currentTime / 60);
            
            // Complete the general meditation session
            await meditationService.completeMeditationSession(currentSessionId, {
              mood_after: moodAfter || 7, // Default to 7 if not set
              actual_duration_minutes: actualDurationMinutes,
              completion_rating: 5, // Default rating
              distractions: [],
              insights: `Completed ${sessionData?.title} session - full duration`
            });
            
            
            // If this is a program session, also complete the program session
            if (sessionData?.type === 'program-session' && sessionData.programId && sessionData.sessionId) {
              const durationSeconds = Math.floor(currentTime);
              await meditationService.completeProgramSession(sessionData.programId, sessionData.sessionId, {
                duration_seconds: durationSeconds,
                mood_before: moodBefore || 5,
                mood_after: moodAfter || 7,
                rating: 5,
                notes: `Auto-completed full session - ${Math.floor(durationSeconds / 60)} minutes`
              });
              
            }
            
            // Navigate to history after auto-completion
            setTimeout(() => navigate('/meditation/history'), 2000);
            
          } catch (error) {
            // Show mood tracker as fallback
            setShowMoodAfter(true);
          }
        } else {
          // Show mood tracker when audio ends (if no session to complete)
          setShowMoodAfter(true);
        }
      };

      let errorHandled = false; // Prevent infinite error loop
      const handleError = (e: Event) => {
        if (errorHandled) return; // Prevent handling the same error multiple times
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
            console.error('Suggested solutions:');
            console.error('1. Configure CORS on the S3 bucket');
            console.error('2. Create a backend proxy endpoint for audio streaming');
            console.error('3. Serve audio files from the same domain');
          }
        }
      };

      const handleCanPlay = () => {
      };

      const handleLoadStart = () => {
      };

      const handleLoadedData = () => {
      };

      audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
      audioElement.addEventListener('timeupdate', handleTimeUpdate);
      audioElement.addEventListener('ended', handleEnded);
      audioElement.addEventListener('error', handleError);
      audioElement.addEventListener('canplay', handleCanPlay);
      audioElement.addEventListener('loadstart', handleLoadStart);
      audioElement.addEventListener('loadeddata', handleLoadedData);

      // Use the direct S3 URL without authentication parameters

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
  }, [sessionData]); // Remove volume from deps to avoid recreation

  // Update audio volume when volume state changes
  useEffect(() => {
    if (audio) {
      audio.volume = volume;
    }
  }, [audio, volume]);

  // Start meditation session with API
  const startMeditationSession = async () => {
    console.log('🎯 startMeditationSession called');
    console.log('📊 Session data available:', !!sessionData);
    console.log('📋 Current session data:', {
      sessionData: sessionData ? {
        title: sessionData.title,
        type: sessionData.type,
        duration: sessionData.duration,
        audioId: sessionData.audioId,
        programId: sessionData.programId,
        sessionId: sessionData.sessionId
      } : null,
      categoryId,
      subOptionId,
      audioId,
      programId,
      sessionId,
      isProgramSession
    });

    if (!sessionData) {
      console.warn('⚠️ No session data available, cannot create session');
      return;
    }

    try {
      // For program sessions, use 'guided' as the session type instead of 'program'
      const sessionType = sessionData.type === 'program-session' 
        ? 'guided' // Use 'guided' for program sessions since API doesn't accept 'program'
        : getValidSessionType(categoryId);

      const sessionPayload = {
        session_type: sessionType,
        duration_minutes: sessionData.duration,
        mood_before: moodBefore,
        guided_audio_id: sessionData.audioId || audioId || undefined,
        notes: `${sessionData.title} session`,
        technique: sessionData.type === 'program-session' ? 'guided' : (sessionData.type || 'guided'),
        environment: MEDITATION_ENVIRONMENTS.INDOOR,
        difficulty_level: MEDITATION_DIFFICULTY_LEVELS.BEGINNER,
        background_sounds: [],
        tags: [
          categoryId || 'general',
          subOptionId || 'meditation', 
          sessionData.category,
          sessionData.type === 'program-session' ? 'program' : null, // Add 'program' as a tag instead
          ...(sessionData.tags || [])
        ].filter(Boolean)
      };

      console.log('📤 Sending session creation request with mood_before:', moodBefore);
      console.log('📋 Full session payload:', sessionPayload);
      
      // Use the startMeditationSession API which accepts session_type
      const sessionResponse = await meditationService.startMeditationSession(sessionPayload);
      
      setCurrentSessionId(sessionResponse.id);
    } catch (error) {
      // Continue anyway - don't block the UI
    }
  };

  // Complete meditation session with API
  const completeMeditationSession = async (rating?: number) => {
    // Show mood after tracking if not already shown
    if (!moodAfter && !showMoodAfter) {
      setShowMoodAfter(true);
      return; // Wait for user to select mood
    }

    try {
      // If no session was started, create one now before completing
      let sessionIdToComplete = currentSessionId;
      if (!sessionIdToComplete && sessionData) {
        try {
          // For program sessions, use 'guided' as the session type instead of 'program'
          const sessionType = sessionData.type === 'program-session' 
            ? 'guided' // Use 'guided' for program sessions since API doesn't accept 'program'
            : getValidSessionType(categoryId);

          const sessionResponse = await meditationService.startMeditationSession({
            session_type: sessionType,
            duration_minutes: sessionData.duration,
            mood_before: moodBefore || 5,
            guided_audio_id: sessionData.audioId || audioId || undefined,
            notes: `${sessionData.title} session`,
            technique: sessionData.type === 'program-session' ? 'guided' : (sessionData.type || 'guided'),
            environment: MEDITATION_ENVIRONMENTS.INDOOR,
            difficulty_level: MEDITATION_DIFFICULTY_LEVELS.BEGINNER,
            background_sounds: [],
            tags: [
              categoryId || 'general',
              subOptionId || 'meditation',
              sessionData.category,
              sessionData.type === 'program-session' ? 'program' : null, // Add 'program' as a tag instead
              ...(sessionData.tags || [])
            ].filter(Boolean)
          });
          sessionIdToComplete = sessionResponse.id;
        } catch (error) {
        }
      }

      // Complete the general meditation session
      if (sessionIdToComplete) {
        const actualDurationMinutes = Math.floor(currentTime / 60);
        console.log(`🏁 Completing session ${sessionIdToComplete} with duration: ${actualDurationMinutes} minutes (${currentTime} seconds)`);
        
        await meditationService.completeMeditationSession(sessionIdToComplete, {
          mood_after: moodAfter || 7,
          actual_duration_minutes: actualDurationMinutes,
          completion_rating: rating || 5,
          distractions: [],
          insights: `Completed ${sessionData?.title} session`
        });
        
        console.log(`✅ Successfully completed meditation session ${sessionIdToComplete}`);
      }
      
      // If this is a program session, also complete the program session
      if (sessionData?.type === 'program-session' && sessionData.programId && sessionData.sessionId) {
        try {
          const durationSeconds = Math.floor(currentTime);
          console.log(`🏆 Completing program session - Program: ${sessionData.programId}, Session: ${sessionData.sessionId}, Duration: ${durationSeconds} seconds`);
          
          await meditationService.completeProgramSession(sessionData.programId, sessionData.sessionId, {
            duration_seconds: durationSeconds,
            mood_before: moodBefore || 5,
            mood_after: moodAfter || 7,
            rating: rating || 5,
            notes: `Completed session with ${Math.floor(durationSeconds / 60)} minutes`
          });
          
          console.log(`✅ Successfully completed program session: ${sessionData.programId}/${sessionData.sessionId}`);
        } catch (error) {
          console.error('❌ Failed to complete program session:', error);
        }
      }
      
      // Navigate to history after completion
      setTimeout(() => navigate('/meditation/history'), 2000);
    } catch (error) {
      console.error('Failed to complete meditation session:', error);
      // Silent fail
    }
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, [audio]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
        audio.pause();
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

        audio.play().catch((error) => {
          // Simple error handling without retries
          if (error.name === 'NotAllowedError') {
            // Browser autoplay policy - need user interaction
            alert('Click play again to start audio');
          } else {
            alert(`Audio failed to play: ${error.message}`);
          }
          setIsPlaying(false);
        });
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

  const skipForward = () => {
    if (audio) {
      const newTime = Math.min(audio.currentTime + 30, duration);
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    } else {
      setCurrentTime(Math.min(currentTime + 30, duration));
    }
  };

  const skipBackward = () => {
    if (audio) {
      const newTime = Math.max(audio.currentTime - 10, 0);
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    } else {
      setCurrentTime(Math.max(currentTime - 10, 0));
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audio && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentClicked = clickX / rect.width;
      const newTime = percentClicked * duration;

      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const progress = (currentTime / duration) * 100;

  const { theme, toggleTheme } = useTheme();

  // Add loading/error state
  if (loading || !sessionData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-4">Loading meditation session...</h2>
          <p className="text-muted-foreground">Preparing your meditation experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <SessionHeader
        category={sessionData?.category}
        isLiked={isLiked}
        theme={theme}
        onNavigateBack={() => navigate('/meditation')}
        onToggleLike={() => setIsLiked(!isLiked)}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                onSkipForward={skipForward}
                onSkipBackward={skipBackward}
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
                  className="w-full"
                  onClick={() => {
                    // Pause audio if playing
                    if (audio && isPlaying) {
                      audio.pause();
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
                    <Icon path={mdiMeditation} size={0.8} className="text-primary" />
                    <span className="text-sm font-medium">Focus Mode</span>
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
      {showMoodBefore && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 max-w-md w-full">
            <SimpleMoodTracker
              title="How are you feeling before this session?"
              value={moodBefore}
              onChange={setMoodBefore}
            />
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  console.log('🚫 User skipped mood before selection');
                  setMoodBefore(5); // Default mood when skipped
                  setShowMoodBefore(false);
                  togglePlayPause();
                }}
              >
                Skip
              </Button>
              <Button
                className="flex-1"
                disabled={!moodBefore}
                onClick={() => {
                  console.log('✅ User selected mood before:', moodBefore);
                  setShowMoodBefore(false);
                  togglePlayPause();
                }}
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mood After Modal */}
      {showMoodAfter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 max-w-md w-full">
            <SimpleMoodTracker
              title="How are you feeling after this session?"
              value={moodAfter}
              onChange={setMoodAfter}
            />
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowMoodAfter(false);
                  completeMeditationSession(5);
                }}
              >
                Skip
              </Button>
              <Button
                className="flex-1"
                disabled={!moodAfter}
                onClick={() => {
                  setShowMoodAfter(false);
                  completeMeditationSession(5);
                }}
              >
                Complete Session
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeditationSession;
