import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import caloriesApi from '../../services/caloriesApi';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import Icon from '@mdi/react';
import {
  mdiArrowLeft,
  mdiCheckCircle,
  mdiClockOutline,
  mdiCalendarMonth,
  mdiFire,
  mdiClose
} from '@mdi/js';

interface FastingSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  targetDuration: number;
  actualDuration?: number;
  completed: boolean;
  planId: string;
  planName?: string;
}

interface FastingPlan {
  id: string;
  name: string;
}

const FastingHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [sessions, setSessions] = useState<FastingSession[]>([]);
  const [plans, setPlans] = useState<FastingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalFasts: 0,
    completedFasts: 0,
    totalHours: 0,
    currentStreak: 0
  });

  useEffect(() => {
    loadData();
  }, [isAuthenticated]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (isAuthenticated) {
        // Load plans
        const plansResponse = await caloriesApi.getFastingPlans();
        if (plansResponse && plansResponse.plans) {
          setPlans(plansResponse.plans);
        }

        // Load all history (increased limit)
        const historyResponse = await caloriesApi.getFastingHistory({ limit: 100 });
        if (historyResponse && historyResponse.sessions) {
          const mappedSessions = historyResponse.sessions.map((session: any) => {
            const actualDur = parseFloat(session.actualDuration || session.actual_duration);
            return {
              id: session.id,
              startTime: new Date(session.startTime || session.start_time),
              endTime: (session.endTime || session.end_time) ? new Date(session.endTime || session.end_time) : undefined,
              targetDuration: parseFloat(session.targetDuration || session.target_duration) || 16,
              actualDuration: isNaN(actualDur) ? 0 : actualDur,
              completed: session.completed || false,
              planId: session.planId || session.plan_id,
              planName: session.planName || session.plan_name
            };
          });
          setSessions(mappedSessions);

          // Calculate stats
          const completed = mappedSessions.filter((s: FastingSession) => s.completed);
          const totalHours = mappedSessions.reduce((sum: number, s: FastingSession) => {
            const duration = s.actualDuration || 0;
            return sum + (isNaN(duration) ? 0 : duration);
          }, 0);

          setStats({
            totalFasts: mappedSessions.length,
            completedFasts: completed.length,
            totalHours: isNaN(totalHours) ? 0 : Math.round(totalHours * 10) / 10,
            currentStreak: 0 // Will be loaded from stats endpoint
          });
        }

        // Load streak from stats
        const statsResponse = await caloriesApi.getFastingStats();
        if (statsResponse && statsResponse.stats) {
          setStats(prev => ({
            ...prev,
            currentStreak: statsResponse.stats.current_streak || 0
          }));
        }
      } else {
        // Load from localStorage
        const savedHistory = localStorage.getItem('fastingHistory');
        if (savedHistory) {
          const history = JSON.parse(savedHistory);
          const mappedSessions = history.map((session: any) => {
            const actualDur = parseFloat(session.actualDuration || session.actual_duration);
            return {
              id: session.id,
              startTime: new Date(session.startTime || session.start_time),
              targetDuration: parseFloat(session.targetDuration || session.target_duration) || 16,
              actualDuration: isNaN(actualDur) ? 0 : actualDur,
              completed: session.completed || false,
              planId: session.planId || session.plan_id,
              planName: session.planName || session.plan_name
            };
          });
          setSessions(mappedSessions);

          const completed = mappedSessions.filter((s: FastingSession) => s.completed);
          const totalHours = mappedSessions.reduce((sum: number, s: FastingSession) => {
            const duration = s.actualDuration || 0;
            return sum + (isNaN(duration) ? 0 : duration);
          }, 0);

          setStats({
            totalFasts: mappedSessions.length,
            completedFasts: completed.length,
            totalHours: isNaN(totalHours) ? 0 : Math.round(totalHours * 10) / 10,
            currentStreak: calculateStreak(mappedSessions)
          });
        }
      }
    } catch (error) {
      console.error('Failed to load fasting history:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (history: FastingSession[]) => {
    const sortedHistory = [...history]
      .filter(s => s.completed)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedHistory.length; i++) {
      const sessionDate = new Date(sortedHistory[i].startTime);
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

  const getPlanName = (session: FastingSession) => {
    if (session.planName) return session.planName;
    const plan = plans.find(p => p.id === session.planId);
    return plan?.name || 'Unknown Plan';
  };

  const formatDuration = (hours: number | undefined) => {
    if (hours === undefined || hours === null || isNaN(hours)) return '-';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-white/10 rounded" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-white/10 rounded-lg" />
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-20 bg-white/10 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button size="sm" onClick={() => navigate('/calories-tracker/fasting')} className="bg-white/10 border border-white/20 text-white hover:bg-white/20">
          <Icon path={mdiArrowLeft} size={0.8} className="mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-white">Fasting History</h1>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center bg-white/5 border border-white/10">
          <Icon path={mdiCalendarMonth} size={1.2} className="text-teal-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{stats.totalFasts}</p>
          <p className="text-xs text-white/60">Total Fasts</p>
        </Card>

        <Card className="p-4 text-center bg-white/5 border border-white/10">
          <Icon path={mdiCheckCircle} size={1.2} className="text-emerald-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{stats.completedFasts}</p>
          <p className="text-xs text-white/60">Completed</p>
        </Card>

        <Card className="p-4 text-center bg-white/5 border border-white/10">
          <Icon path={mdiClockOutline} size={1.2} className="text-blue-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{isNaN(stats.totalHours) ? 0 : stats.totalHours}h</p>
          <p className="text-xs text-white/60">Total Hours</p>
        </Card>

        <Card className="p-4 text-center bg-white/5 border border-white/10">
          <Icon path={mdiFire} size={1.2} className="text-orange-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{stats.currentStreak}</p>
          <p className="text-xs text-white/60">Day Streak</p>
        </Card>
      </div>

      {/* History List */}
      <Card className="p-6 bg-white/5 border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4">All Fasting Sessions</h2>

        {sessions.length > 0 ? (
          <div className="space-y-3">
            {sessions
              .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
              .map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-white">{getPlanName(session)}</p>
                      {session.completed ? (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <Icon path={mdiCheckCircle} size={0.5} className="mr-1" />
                          Completed
                        </Badge>
                      ) : (
                        <Badge className="bg-white/10 text-white/70 border border-white/20">
                          <Icon path={mdiClose} size={0.5} className="mr-1" />
                          Cancelled
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-white/60">
                      {formatDate(session.startTime)} at {formatTime(session.startTime)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-white">
                      {formatDuration(session.actualDuration)}
                    </p>
                    <p className="text-xs text-white/60">
                      Target: {session.targetDuration}h
                    </p>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-12 text-white/60">
            <Icon path={mdiClockOutline} size={3} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium text-white">No fasting history yet</p>
            <p className="text-sm mb-4">Start your first fast to track your progress</p>
            <Button onClick={() => navigate('/calories-tracker/fasting')} className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600">
              Start Fasting
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default FastingHistoryPage;
