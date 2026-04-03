import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useMeditation } from '../../hooks';
import { meditationService, FeaturedCategory, FeaturedSubOption } from '../../services/meditationService';
import { TEST_AUDIO_URLS } from '../../constants/testAudio';

interface SessionDataManagerProps {
  onSessionDataLoaded: (data: any) => void;
  onLoadingChange: (loading: boolean) => void;
}

export const useSessionDataManager = () => {
  const params = useParams();
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { featured } = useMeditation();

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
  const id = params.id;
  const categoryId = params.categoryId;
  const subOptionId = params.subOptionId;
  const durationParam = params.duration;
  const programId = params.programId;
  const sessionId = params.sessionId;
  const audioId = params.audioId;

  // Check if this is a quick session route
  const isQuickSession = categoryId === 'quick' && subOptionId === 'session';

  // Check if this is a program session route
  const isProgramSession = !!(programId && sessionId);
  
  // Check if this is a direct audio route
  const isDirectAudioRoute = id && !categoryId && !subOptionId && !programId;

  // No fallback session data - return null if not found
  const getFallbackSessionById = (sessionId: string) => {
    console.error(`Session with ID ${sessionId} not found and no fallback available`);
    return null;
  };

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
        let sessionData = null;

        // Try to fetch session data
        try {
          sessionData = await meditationService.getProgramSession(programId, sessionId);
        } catch (error: any) {
          const errorMessage = error?.message || '';

          // If not enrolled, try to auto-enroll and retry once
          if (errorMessage.includes('not enrolled') || errorMessage.includes('User not enrolled')) {
            console.log('Auto-enrolling user in program...');
            try {
              await meditationService.enrollInMeditationProgram(programId);
              console.log('Auto-enrollment successful, retrying session fetch...');
              // Retry fetching session data after enrollment
              sessionData = await meditationService.getProgramSession(programId, sessionId);
            } catch (enrollError: any) {
              const enrollErrorMessage = enrollError?.message || '';
              // If enrollment fails due to duplicate key, the user might have an inactive enrollment
              // Try fetching the session anyway - backend may need to be updated
              if (enrollErrorMessage.includes('duplicate key') || enrollErrorMessage.includes('Already enrolled')) {
                console.log('User already has an enrollment (possibly inactive). Showing error to user.');
                throw new Error('Your enrollment in this program may be inactive. Please go to the program page and re-enroll.');
              }
              console.error('Auto-enrollment failed:', enrollError);
              throw new Error('Unable to enroll in program. Please try again.');
            }
          } else {
            console.error('Failed to fetch program session:', error);
            throw error;
          }
        }

        if (!sessionData) {
          throw new Error('Session data could not be loaded');
        }

        // If audio ID is provided, fetch audio data separately
        let audioData = null;
        if (audioId || sessionData.audio_id) {
          const audioIdToFetch = audioId || sessionData.audio_id;
          try {
            audioData = await meditationService.getAudioById(audioIdToFetch);
          } catch (error) {
            // Continue without audio data
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
              // Continue to other fallbacks
            }
          }
        }
      }

      // Handle quick sessions - use test audio as fallback
      if (isQuickSession && durationParam) {
        const duration = parseInt(durationParam);

        // Quick session definitions with test audio fallback
        const quickSessions: { [key: number]: { title: string; description: string } } = {
          5: { title: '5-Minute Quick Calm', description: 'A brief moment of peace and relaxation' },
          10: { title: '10-Minute Mindfulness', description: 'A focused meditation for clarity and calm' },
          15: { title: '15-Minute Deep Relaxation', description: 'A deeper journey into relaxation' },
          20: { title: '20-Minute Full Session', description: 'A complete meditation experience' },
        };

        const sessionInfo = quickSessions[duration] || {
          title: `${duration}-Minute Meditation`,
          description: `A ${duration}-minute meditation session`
        };

        // Use test audio for quick sessions
        const testAudio = TEST_AUDIO_URLS[0];

        return {
          title: sessionInfo.title,
          instructor: 'Guided Meditation',
          description: sessionInfo.description,
          audioUrl: testAudio.url,
          duration: duration,
          category: 'quick',
          type: 'quick-session',
          tags: ['quick', 'meditation'],
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
                console.error('Invalid audio URL and no fallback available');
                throw new Error('No valid audio URL found');
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

        // No fallback for dynamic sessions
        console.error('Session data not found and no fallback available');
        throw new Error('Session data not available');
      }

      // Handle featured sessions by ID
      if (id) {
        return getFallbackSessionById(id);
      }

      // No default session
      throw new Error('No session data found');
    } catch (error) {
      console.error('Error fetching session data:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Load session data when component mounts or params change
  useEffect(() => {
    const loadSession = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getSessionData();
        setSessionData(data);
      } catch (error: any) {
        console.error('Failed to load session data:', error);
        // Set error message based on error type
        const errorMessage = error?.message || 'Failed to load session data';
        if (errorMessage.includes('not enrolled')) {
          setError('You are not enrolled in this program. Please enroll first.');
        } else if (errorMessage.includes('not found')) {
          setError('Session not found. It may have been removed or the link is invalid.');
        } else {
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [categoryId, subOptionId, durationParam, id, programId, sessionId, audioId]);

  return {
    sessionData,
    loading,
    error,
    categoryId,
    subOptionId,
    audioId,
    programId,
    sessionId,
    isProgramSession,
    isDirectAudioRoute,
    isQuickSession
  };
};