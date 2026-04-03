import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { meditationService } from '../../services/meditationService';
import {
  getValidSessionType,
  MEDITATION_ENVIRONMENTS,
  MEDITATION_DIFFICULTY_LEVELS,
} from '../../constants/meditation';
import { toast } from '../ui/sonner';

interface SessionManagerProps {
  sessionData: any;
  categoryId?: string;
  subOptionId?: string;
  audioId?: string;
  programId?: string;
  sessionId?: string;
}

export const useSessionManager = ({
  sessionData,
  categoryId,
  subOptionId,
  audioId,
  programId,
  sessionId
}: SessionManagerProps) => {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [moodBefore, setMoodBefore] = useState<number | undefined>();
  const [moodAfter, setMoodAfter] = useState<number | undefined>();
  const navigate = useNavigate();

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
      sessionId
    });

    if (!sessionData) {
      console.warn('⚠️ No session data available, cannot create session');
      return;
    }

    try {
      // For program sessions, use 'guided' as the session type instead of 'program'
      // For direct audio routes, categoryId may be undefined, so use sessionData.category as fallback
      const categoryToUse = categoryId || sessionData.category;
      const sessionType = sessionData.type === 'program-session'
        ? 'guided' // Use 'guided' for program sessions since API doesn't accept 'program'
        : getValidSessionType(categoryToUse);

      const sessionPayload = {
        session_type: sessionType,
        duration_minutes: sessionData.duration || 10, // Default to 10 minutes if duration is missing
        mood_before: moodBefore,
        guided_audio_id: sessionData.audioId || audioId || undefined,
        title: sessionData.title || 'Meditation Session',
        notes: sessionData.description || `${sessionData.title} session`,
        technique: sessionData.type === 'program-session' ? 'guided' : (sessionData.type || 'guided'),
        environment: MEDITATION_ENVIRONMENTS.INDOOR,
        difficulty_level: MEDITATION_DIFFICULTY_LEVELS.BEGINNER,
        background_sounds: [],
        tags: [
          categoryToUse || 'general',
          subOptionId || 'meditation',
          sessionData.type === 'program-session' ? 'program' : null,
          ...(sessionData.tags || [])
        ].filter(Boolean)
      };

      console.log('📤 Sending session creation request with mood_before:', moodBefore);
      console.log('📋 Full session payload:', sessionPayload);
      
      // Use the startMeditationSession API which accepts session_type
      const sessionResponse = await meditationService.startMeditationSession(sessionPayload);
      
      setCurrentSessionId(sessionResponse.id);
      return sessionResponse.id;
    } catch (error) {
      console.error('Failed to start meditation session:', error);
      toast.error('Failed to start meditation session. Continuing with offline mode.');
      // Continue anyway - don't block the UI
      return null;
    }
  };

  // Complete meditation session with API
  const completeMeditationSession = async (rating?: number, currentTime?: number) => {
    // Show mood after tracking if not already shown and no mood is set
    if (!moodAfter) {
      console.log('⚠️ No mood after set, cannot complete session yet');
      return false;
    }

    try {
      // If no session was started, create one now before completing
      let sessionIdToComplete = currentSessionId;
      if (!sessionIdToComplete && sessionData) {
        try {
          // For program sessions, use 'guided' as the session type instead of 'program'
          // For direct audio routes, categoryId may be undefined, so use sessionData.category as fallback
          const categoryToUse = categoryId || sessionData.category;
          const sessionType = sessionData.type === 'program-session'
            ? 'guided' // Use 'guided' for program sessions since API doesn't accept 'program'
            : getValidSessionType(categoryToUse);

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
              categoryToUse || 'general',
              subOptionId || 'meditation',
              sessionData.type === 'program-session' ? 'program' : null,
              ...(sessionData.tags || [])
            ].filter(Boolean)
          });
          sessionIdToComplete = sessionResponse.id;
        } catch (error) {
          console.error('Failed to create session before completing:', error);
          toast.error('Failed to record session data, but your meditation is still complete!');
        }
      }

      // Complete the general meditation session
      if (sessionIdToComplete) {
        // Ensure actualDurationMinutes is at least 1 (validation requires minimum 1)
        const actualDurationMinutes = Math.max(1, Math.floor((currentTime || 0) / 60));
        console.log(`🏁 Completing session ${sessionIdToComplete} with duration: ${actualDurationMinutes} minutes (${currentTime} seconds)`);

        await meditationService.completeMeditationSession(sessionIdToComplete, {
          mood_after: moodAfter || 7,
          actual_duration_minutes: actualDurationMinutes,
          completion_rating: rating || 5,
          distractions: [],
          insights: `Completed ${sessionData?.title} session`
        });
        
        console.log(`✅ Successfully completed meditation session ${sessionIdToComplete}`);
        toast.success('Meditation session completed successfully!');
      }
      
      // If this is a program session, also complete the program session
      if (sessionData?.type === 'program-session' && sessionData.programId && sessionData.sessionId) {
        try {
          const durationSeconds = Math.floor(currentTime || 0);
          console.log(`🏆 Completing program session - Program: ${sessionData.programId}, Session: ${sessionData.sessionId}, Duration: ${durationSeconds} seconds`);
          
          await meditationService.completeProgramSession(sessionData.programId, sessionData.sessionId, {
            duration_seconds: durationSeconds,
            mood_before: moodBefore || 5,
            mood_after: moodAfter || 7,
            rating: rating || 5,
            notes: `Completed session with ${Math.floor(durationSeconds / 60)} minutes`
          });
          
          console.log(`✅ Successfully completed program session: ${sessionData.programId}/${sessionData.sessionId}`);
          toast.success('Program session completed successfully!');
        } catch (error) {
          console.error('❌ Failed to complete program session:', error);
          toast.error('Failed to record program progress, but your meditation is complete!');
        }
      }
      
      // Navigate to history after completion
      setTimeout(() => navigate('/meditation/history'), 2000);
      return true;
    } catch (error) {
      console.error('Failed to complete meditation session:', error);
      toast.error('Failed to save meditation session, but your practice is complete!');
      return false;
    }
  };

  return {
    currentSessionId,
    moodBefore,
    moodAfter,
    setMoodBefore,
    setMoodAfter,
    startMeditationSession,
    completeMeditationSession
  };
};