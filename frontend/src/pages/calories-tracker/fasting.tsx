// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import caloriesApi from '../../services/caloriesApi';
import FastingTimer from '../../components/calories-tracker/fasting/FastingTimer';
import PlanSelector, { FastingPlan } from '../../components/calories-tracker/fasting/PlanSelector';
import FastingStats from '../../components/calories-tracker/fasting/FastingStats';
import FastingHistory, { FastingSession } from '../../components/calories-tracker/fasting/FastingHistory';
import FastingBenefits from '../../components/calories-tracker/fasting/FastingBenefits';
import { FastingPageSkeleton } from '../../components/calories-tracker/skeletons';

const FastingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSession, setCurrentSession] = useState<FastingSession | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [fastingHistory, setFastingHistory] = useState<FastingSession[]>([]);
  const [fastingPlans, setFastingPlans] = useState<FastingPlan[]>([]);
  const [streakDays, setStreakDays] = useState(0);
  const [completedFasts, setCompletedFasts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load fasting plans
  useEffect(() => {
    const loadFastingPlans = async () => {
      if (isAuthenticated) {
        try {
          const response = await caloriesApi.getFastingPlans();
          if (response && response.plans && response.plans.length > 0) {
            setFastingPlans(response.plans);
            // Set the first plan as default if no plan is selected
            if (!selectedPlan) {
              setSelectedPlan(response.plans[0].id);
            }
          }
        } catch (error) {
          console.error('Failed to load fasting plans:', error);
          // Fall back to default plans
          setDefaultPlans();
        }
      } else {
        setDefaultPlans();
      }
    };

    loadFastingPlans();
  }, [isAuthenticated]);

  // Load current session and stats
  useEffect(() => {
    const loadFastingData = async () => {
      if (isAuthenticated) {
        try {
          setLoading(true);
          
          // Load current session
          const sessionResponse = await caloriesApi.getCurrentFastingSession();
          if (sessionResponse && sessionResponse.session) {
            // Map API response to component format (handle both camelCase and snake_case)
            const s = sessionResponse.session;
            const mappedSession: FastingSession = {
              id: s.id,
              startTime: new Date(s.startTime || s.start_time),
              targetDuration: s.targetDuration || s.target_duration || 16,
              actualDuration: s.actualDuration || s.actual_duration,
              completed: s.completed || false,
              planId: s.planId || s.plan_id,
              planName: s.planName || s.plan_name
            };
            setCurrentSession(mappedSession);
            setIsTimerActive(true);
            setSelectedPlan(s.planId || s.plan_id);
          }

          // Load history
          const historyResponse = await caloriesApi.getFastingHistory({ limit: 10 });
          if (historyResponse && historyResponse.sessions) {
            // Map API response to component format (handle both camelCase and snake_case)
            const mappedSessions = historyResponse.sessions.map((session: any) => ({
              id: session.id,
              startTime: new Date(session.startTime || session.start_time),
              targetDuration: session.targetDuration || session.target_duration || 16,
              actualDuration: session.actualDuration || session.actual_duration,
              completed: session.completed || false,
              planId: session.plan_id,
              planName: session.plan_name
            }));
            setFastingHistory(mappedSessions);
          }

          // Load stats
          const statsResponse = await caloriesApi.getFastingStats();
          if (statsResponse && statsResponse.stats) {
            setStreakDays(statsResponse.stats.current_streak || 0);
            setCompletedFasts(statsResponse.stats.completed_sessions || 0);
          } else {
            setStreakDays(0);
            setCompletedFasts(0);
          }
        } catch (error) {
          console.error('Failed to load fasting data:', error);
          // Fall back to localStorage
          loadLocalData();
        } finally {
          setLoading(false);
        }
      } else {
        loadLocalData();
        setLoading(false);
      }
    };

    loadFastingData();
  }, [isAuthenticated]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isTimerActive && !isPaused && currentSession) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - currentSession.startTime.getTime()) / 1000);
        setElapsedTime(elapsed);

        // Auto-complete if target duration reached
        if (elapsed >= currentSession.targetDuration * 3600) {
          completeFast();
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isTimerActive, isPaused, currentSession]);

  const setDefaultPlans = () => {
    // For non-authenticated users, we don't have access to backend plans
    // Set empty plans array - the UI will handle this appropriately
    setFastingPlans([]);
  };

  const loadLocalData = () => {
    // Load from localStorage for non-authenticated users
    const savedHistory = localStorage.getItem('fastingHistory');
    if (savedHistory) {
      const history = JSON.parse(savedHistory);
      // Convert to API format
      const convertedHistory = history.map((session: any) => ({
        ...session,
        start_time: session.start_time || session.startTime,
        target_duration: session.target_duration || session.targetDuration,
        actual_duration: session.actual_duration || session.actualDuration,
        plan_id: session.plan_id || session.planId,
        status: session.status || (session.completed ? 'completed' : 'cancelled')
      }));
      setFastingHistory(convertedHistory);
    }

    const savedSession = localStorage.getItem('currentFastingSession');
    if (savedSession) {
      const session = JSON.parse(savedSession);
      const convertedSession = {
        ...session,
        start_time: session.start_time || session.startTime,
        target_duration: session.target_duration || session.targetDuration,
        plan_id: session.plan_id || session.planId,
        status: 'active' as const
      };
      setCurrentSession(convertedSession);
      setIsTimerActive(true);
      setSelectedPlan(convertedSession.plan_id);
    }

    // Calculate streak from local data
    if (savedHistory) {
      const history = JSON.parse(savedHistory);
      const streak = calculateLocalStreak(history);
      setStreakDays(streak);
      setCompletedFasts(history.filter((s: any) => s.completed).length);
    }
  };

  const calculateLocalStreak = (history: any[]) => {
    const sortedHistory = [...history]
      .filter(s => s.completed)
      .sort((a, b) => new Date(b.startTime || b.start_time).getTime() - new Date(a.startTime || a.start_time).getTime());
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedHistory.length; i++) {
      const sessionDate = new Date(sortedHistory[i].startTime || sortedHistory[i].start_time);
      sessionDate.setHours(0, 0, 0, 0);
      
      const dayDiff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dayDiff === streak) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const startFast = async () => {
    const plan = fastingPlans.find(p => p.id === selectedPlan);
    if (!plan) return;

    setError('');

    if (isAuthenticated) {
      try {
        const response = await caloriesApi.startFastingSession({
          plan_id: selectedPlan,
          target_duration: plan.duration,
          start_time: new Date().toISOString()
        });

        if (response && response.session) {
          // Map API response to component format (handle both camelCase and snake_case)
          const s = response.session;
          const mappedSession: FastingSession = {
            id: s.id,
            startTime: new Date(s.startTime || s.start_time),
            targetDuration: s.targetDuration || s.target_duration || plan.duration,
            actualDuration: s.actualDuration || s.actual_duration,
            completed: s.completed || false,
            planId: s.planId || s.plan_id,
            planName: s.planName || s.plan_name || plan.name
          };
          setCurrentSession(mappedSession);
          setIsTimerActive(true);
          setIsPaused(false);
          setElapsedTime(0);
        }
      } catch (error: any) {
        console.error('Failed to start fasting session:', error);
        if (error.code === 'SESSION_ALREADY_ACTIVE') {
          setError('You already have an active fasting session');
        } else {
          // Fall back to local storage
          startLocalFast(plan);
        }
      }
    } else {
      startLocalFast(plan);
    }
  };

  const startLocalFast = (plan: FastingPlan) => {
    const session: FastingSession = {
      id: Date.now().toString(),
      startTime: new Date(),
      targetDuration: plan.duration,
      completed: false,
      planId: selectedPlan,
      planName: plan.name
    };

    setCurrentSession(session);
    setIsTimerActive(true);
    setIsPaused(false);
    setElapsedTime(0);

    // Save to localStorage  
    localStorage.setItem('currentFastingSession', JSON.stringify({
      id: session.id,
      startTime: session.startTime.toISOString(),
      targetDuration: session.targetDuration,
      completed: session.completed,
      planId: session.planId,
      planName: session.planName
    }));
  };

  const pauseFast = () => {
    setIsPaused(!isPaused);
  };

  const stopFast = async () => {
    if (!currentSession) return;

    const actualDuration = elapsedTime / 3600;

    if (isAuthenticated && currentSession.id) {
      try {
        await caloriesApi.cancelFastingSession(currentSession.id, {
          end_time: new Date().toISOString(),
          actual_duration: actualDuration
        });

        // Refresh history
        const historyResponse = await caloriesApi.getFastingHistory({ limit: 10 });
        if (historyResponse && historyResponse.sessions) {
          // Map API response to component format (handle both camelCase and snake_case)
          const mappedSessions = historyResponse.sessions.map((session: any) => ({
            id: session.id,
            startTime: new Date(session.startTime || session.start_time),
            targetDuration: session.targetDuration || session.target_duration || 16,
            actualDuration: session.actualDuration || session.actual_duration,
            completed: session.completed || false,
            planId: session.planId || session.plan_id,
            planName: session.planName || session.plan_name
          }));
          setFastingHistory(mappedSessions);
        }

        // Refresh stats
        const statsResponse = await caloriesApi.getFastingStats();
        if (statsResponse && statsResponse.stats) {
          setStreakDays(statsResponse.stats.current_streak || 0);
          setCompletedFasts(statsResponse.stats.completed_sessions || 0);
        }
      } catch (error) {
        console.error('Failed to cancel fasting session:', error);
        stopLocalFast(actualDuration);
      }
    } else {
      stopLocalFast(actualDuration);
    }

    resetTimer();
  };

  const stopLocalFast = (actualDuration: number) => {
    if (currentSession) {
      const updatedSession: FastingSession = {
        ...currentSession,
        actualDuration: actualDuration,
        completed: false
      };

      // Save to localStorage with both formats for compatibility
      const history = JSON.parse(localStorage.getItem('fastingHistory') || '[]');
      const localSession = {
        ...updatedSession,
        startTime: updatedSession.startTime,
        targetDuration: updatedSession.targetDuration,
        actualDuration: updatedSession.actualDuration,
        planId: updatedSession.planId
      };
      const newHistory = [...history, localSession];
      setFastingHistory(newHistory);
      localStorage.setItem('fastingHistory', JSON.stringify(newHistory));
    }
  };

  const completeFast = async () => {
    if (!currentSession) return;

    const actualDuration = elapsedTime / 3600;

    if (isAuthenticated && currentSession.id) {
      try {
        await caloriesApi.completeFastingSession(currentSession.id, {
          end_time: new Date().toISOString(),
          actual_duration: actualDuration
        });

        // Refresh history and stats
        const historyResponse = await caloriesApi.getFastingHistory({ limit: 10 });
        if (historyResponse && historyResponse.sessions) {
          // Map API response to component format (handle both camelCase and snake_case)
          const mappedSessions = historyResponse.sessions.map((session: any) => ({
            id: session.id,
            startTime: new Date(session.startTime || session.start_time),
            targetDuration: session.targetDuration || session.target_duration || 16,
            actualDuration: session.actualDuration || session.actual_duration,
            completed: session.completed || false,
            planId: session.planId || session.plan_id,
            planName: session.planName || session.plan_name
          }));
          setFastingHistory(mappedSessions);
        }

        const statsResponse = await caloriesApi.getFastingStats();
        if (statsResponse && statsResponse.stats) {
          setStreakDays(statsResponse.stats.current_streak || 0);
          setCompletedFasts(statsResponse.stats.completed_sessions || 0);
        }
      } catch (error) {
        console.error('Failed to complete fasting session:', error);
        completeLocalFast(actualDuration);
      }
    } else {
      completeLocalFast(actualDuration);
    }

    resetTimer();
  };

  const completeLocalFast = (actualDuration: number) => {
    if (currentSession) {
      const updatedSession: FastingSession = {
        ...currentSession,
        actualDuration: actualDuration,
        completed: true
      };

      // Save to localStorage with both formats for compatibility
      const history = JSON.parse(localStorage.getItem('fastingHistory') || '[]');
      const localSession = {
        ...updatedSession,
        startTime: updatedSession.startTime,
        targetDuration: updatedSession.targetDuration,
        actualDuration: updatedSession.actualDuration,
        planId: updatedSession.planId
      };
      const newHistory = [...history, localSession];
      setFastingHistory(newHistory);
      localStorage.setItem('fastingHistory', JSON.stringify(newHistory));

      // Update local stats
      setCompletedFasts(prev => prev + 1);
      const newStreak = calculateLocalStreak(newHistory);
      setStreakDays(newStreak);
    }
  };

  const resetTimer = () => {
    setIsTimerActive(false);
    setIsPaused(false);
    setCurrentSession(null);
    setElapsedTime(0);
    localStorage.removeItem('currentFastingSession');
  };

  const currentPlan = fastingPlans.find(p => p.id === selectedPlan);

  if (loading) {
    return <FastingPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Timer Section */}
      {isTimerActive && currentSession && currentPlan ? (
        <FastingTimer
          planName={currentPlan.name}
          startTime={currentSession.startTime}
          elapsedTime={elapsedTime}
          targetDuration={currentSession.targetDuration}
          isPaused={isPaused}
          onPause={pauseFast}
          onStop={stopFast}
        />
      ) : (
        <>
          {/* Plan Selection */}
          <PlanSelector
            plans={fastingPlans}
            selectedPlan={selectedPlan}
            onSelectPlan={setSelectedPlan}
            onStartFast={startFast}
          />

          {/* Stats Overview */}
          <FastingStats
            streakDays={streakDays}
            completedFasts={completedFasts}
          />
        </>
      )}

      {/* Recent History */}
      <FastingHistory
        sessions={fastingHistory}
        plans={fastingPlans.map(p => ({ id: p.id, name: p.name }))}
        onViewAll={() => navigate('/calories-tracker/fasting/history')}
      />

      {/* Info Section */}
      <FastingBenefits />
    </div>
  );
};

export default FastingPage;