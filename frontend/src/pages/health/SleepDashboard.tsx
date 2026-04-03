import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Moon,
  Calendar,
  Clock,
  Target,
  TrendingUp,
  AlarmClock,
  Bell,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import Header from '../../components/landing/Header';
import { Breadcrumb } from '../../components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { useToast } from '../../components/ui/use-toast';
import {
  SleepStatsCards,
  SleepQualityChart,
  SleepEfficiencyGauge,
  SleepLogCard,
  QualityScoreBadge,
} from '../../components/health/sleep';
import {
  useSleepLogs,
  useLatestSleepLog,
  useSleepSummary,
  useSleepGoal,
  useSleepGoalProgress,
  useSleepAlarms,
  useBedtimeReminders,
  useDeleteSleepLog,
} from '../../hooks/health/useSleep';
import { formatTime } from '../../types/health/sleep';

const SleepDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [period, setPeriod] = useState<'week' | 'month'>('week');

  // Data hooks
  const { sleepLogs, isLoading: logsLoading, refetch: refetchLogs, error: logsError } = useSleepLogs({ limit: 7 });
  const { latestSleepLog, isLoading: latestLoading, error: latestError } = useLatestSleepLog();
  const { summary, isLoading: summaryLoading, refetch: refetchSummary, error: summaryError } = useSleepSummary({ period });
  const { sleepGoal, error: goalError } = useSleepGoal();
  const { progress, isLoading: progressLoading, error: progressError } = useSleepGoalProgress();
  const { sleepAlarms, error: alarmsError } = useSleepAlarms();
  const { bedtimeReminders, error: remindersError } = useBedtimeReminders();
  const deleteSleepLogMutation = useDeleteSleepLog();

  // Debug logging
  console.log('Sleep Dashboard Data:', {
    sleepLogs,
    latestSleepLog,
    summary,
    sleepGoal,
    progress,
    sleepAlarms,
    bedtimeReminders,
    errors: {
      logsError,
      latestError,
      summaryError,
      goalError,
      progressError,
      alarmsError,
      remindersError,
    },
  });

  const isLoading = logsLoading || latestLoading || summaryLoading;

  // Transform data for chart
  const chartData = useMemo(() => {
    if (!sleepLogs) return [];
    return [...sleepLogs].reverse().map((log) => ({
      date: log.sleepDate,
      qualityScore: log.qualityScore || 0,
      duration: log.actualSleepMinutes || 0,
    }));
  }, [sleepLogs]);

  const handleDeleteLog = async (id: string) => {
    try {
      await deleteSleepLogMutation.mutateAsync(id);
      toast({
        title: 'Sleep log deleted',
        description: 'The sleep log has been removed.',
      });
      refetchLogs();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete sleep log.',
        variant: 'destructive',
      });
    }
  };

  const handleRefresh = () => {
    refetchLogs();
    refetchSummary();
  };

  // Active alarms and reminders count
  const activeAlarms = sleepAlarms?.filter((a) => a.isActive).length || 0;
  const activeReminders = bedtimeReminders?.filter((r) => r.isActive).length || 0;

  const breadcrumbItems = [
    { label: 'Health', href: '/health' },
    { label: 'Sleep Tracking', href: '/health/sleep' },
  ];

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects />
      <Header />

      {/* Breadcrumb Navigation */}
      <div className="bg-white/5 backdrop-blur-sm border-b border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500">
                <Moon className="w-6 h-6" />
              </div>
              Sleep Tracking
            </h1>
            <p className="text-white/60 mt-2">
              Monitor your sleep patterns and improve your rest quality
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="border-white/20"
              onClick={handleRefresh}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              onClick={() => navigate('/health/add-sleep-log')}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Log Sleep
            </Button>
          </div>
        </div>

        {/* Quick Actions - Highlighted at Top */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card
            className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 border-emerald-500/30 hover:border-emerald-400/50 transition-all cursor-pointer group"
            onClick={() => navigate('/health/sleep-goals')}
          >
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 shadow-lg shadow-emerald-500/30">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Sleep Goals</h3>
                  <p className="text-sm text-white/60">
                    {sleepGoal
                      ? `${Math.floor(sleepGoal.targetDurationMinutes / 60)}h ${sleepGoal.targetDurationMinutes % 60}m target`
                      : 'Set your sleep goals'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/70 group-hover:translate-x-1 transition-all" />
            </CardContent>
          </Card>

          <Card
            className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/30 hover:border-amber-400/50 transition-all cursor-pointer group"
            onClick={() => navigate('/health/sleep-alarms')}
          >
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30">
                  <AlarmClock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Smart Alarms</h3>
                  <p className="text-sm text-white/60">
                    {activeAlarms > 0
                      ? `${activeAlarms} active alarm${activeAlarms !== 1 ? 's' : ''}`
                      : 'Set wake-up alarms'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/70 group-hover:translate-x-1 transition-all" />
            </CardContent>
          </Card>

          <Card
            className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-indigo-500/30 hover:border-indigo-400/50 transition-all cursor-pointer group"
            onClick={() => navigate('/health/bedtime-reminders')}
          >
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/30">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Bedtime Reminders</h3>
                  <p className="text-sm text-white/60">
                    {activeReminders > 0
                      ? `${activeReminders} active reminder${activeReminders !== 1 ? 's' : ''}`
                      : 'Set bedtime reminders'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/70 group-hover:translate-x-1 transition-all" />
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Row */}
        <SleepStatsCards
          summary={summary}
          progress={progress}
          isLoading={isLoading}
        />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Latest Sleep & Efficiency */}
              <div className="space-y-6">
                {/* Latest Sleep */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>Last Night</span>
                      {latestSleepLog && (
                        <span className="text-sm font-normal text-white/60">
                          {new Date(latestSleepLog.sleepDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {latestLoading ? (
                      <div className="animate-pulse h-32 bg-white/10 rounded" />
                    ) : latestSleepLog ? (
                      <div className="flex items-center gap-6">
                        <QualityScoreBadge
                          score={latestSleepLog.qualityScore || 0}
                          size="lg"
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 text-white/70">
                            <Clock className="w-4 h-4" />
                            <span>
                              {Math.floor((latestSleepLog.actualSleepMinutes || 0) / 60)}h{' '}
                              {(latestSleepLog.actualSleepMinutes || 0) % 60}m
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-white/70">
                            <Moon className="w-4 h-4" />
                            <span>
                              {formatTime(
                                new Date(latestSleepLog.bedtime)
                                  .toTimeString()
                                  .substring(0, 5)
                              )}{' '}
                              -{' '}
                              {formatTime(
                                new Date(latestSleepLog.wakeTime)
                                  .toTimeString()
                                  .substring(0, 5)
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-white/70">
                            <TrendingUp className="w-4 h-4" />
                            <span>
                              {Math.round(latestSleepLog.efficiencyPercentage || 0)}%
                              efficiency
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-white/40">
                        <Moon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No sleep logged yet</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4 border-white/20"
                          onClick={() => navigate('/health/add-sleep-log')}
                        >
                          Log Your First Night
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Sleep Efficiency */}
                <SleepEfficiencyGauge
                  efficiency={summary?.averageEfficiency || 0}
                  targetEfficiency={sleepGoal?.targetEfficiency || 85}
                  size="md"
                />
              </div>

              {/* Center Column - Chart */}
              <div className="lg:col-span-2">
                <SleepQualityChart data={chartData} isLoading={isLoading} />
              </div>
            </div>

          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Sleep Logs</h2>
              <Button
                variant="outline"
                size="sm"
                className="border-white/20"
                onClick={() => navigate('/health/sleep-history')}
              >
                <Calendar className="w-4 h-4 mr-2" />
                View All
              </Button>
            </div>

            {logsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-20 bg-white/10 rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : sleepLogs && sleepLogs.length > 0 ? (
              <div className="space-y-4">
                {sleepLogs.map((log) => (
                  <SleepLogCard
                    key={log.id}
                    sleepLog={log}
                    onEdit={(id) => navigate(`/health/add-sleep-log?edit=${id}`)}
                    onDelete={handleDeleteLog}
                    onClick={(id) => navigate(`/health/sleep-history?log=${id}`)}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-16 text-center">
                  <Moon className="w-16 h-16 mx-auto mb-4 text-white/20" />
                  <h3 className="text-lg font-semibold mb-2">No Sleep Logs Yet</h3>
                  <p className="text-white/60 mb-6">
                    Start tracking your sleep to see patterns and insights.
                  </p>
                  <Button
                    onClick={() => navigate('/health/add-sleep-log')}
                    className="bg-gradient-to-r from-teal-500 to-cyan-500"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Log Your First Sleep
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6 mt-6">
            {/* Period Selector */}
            <div className="flex gap-2">
              <Button
                variant={period === 'week' ? 'default' : 'outline'}
                size="sm"
                className={period === 'week' ? 'bg-teal-500' : 'border-white/20'}
                onClick={() => setPeriod('week')}
              >
                Week
              </Button>
              <Button
                variant={period === 'month' ? 'default' : 'outline'}
                size="sm"
                className={period === 'month' ? 'bg-teal-500' : 'border-white/20'}
                onClick={() => setPeriod('month')}
              >
                Month
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Averages Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {period === 'week' ? 'Weekly' : 'Monthly'} Averages
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {summaryLoading ? (
                    <div className="animate-pulse space-y-3">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-8 bg-white/10 rounded" />
                      ))}
                    </div>
                  ) : summary ? (
                    <>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                        <span className="text-white/70">Average Sleep</span>
                        <span className="font-semibold">
                          {Math.floor((summary.averageSleepMinutes || 0) / 60)}h{' '}
                          {Math.round((summary.averageSleepMinutes || 0) % 60)}m
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                        <span className="text-white/70">Quality Score</span>
                        <span className="font-semibold">
                          {Math.round(summary.averageQualityScore || 0)}/100
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                        <span className="text-white/70">Sleep Efficiency</span>
                        <span className="font-semibold">
                          {Math.round(summary.averageEfficiency || 0)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                        <span className="text-white/70">Average Wake-ups</span>
                        <span className="font-semibold">
                          {(summary.averageWakeUps || 0).toFixed(1)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-white/40 text-center py-8">
                      Not enough data for insights
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Tips Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sleep Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {[
                      {
                        tip: 'Maintain a consistent sleep schedule',
                        icon: '🕐',
                      },
                      {
                        tip: 'Avoid screens 1 hour before bed',
                        icon: '📱',
                      },
                      {
                        tip: 'Keep your bedroom cool (65-68°F)',
                        icon: '❄️',
                      },
                      {
                        tip: 'Limit caffeine after 2 PM',
                        icon: '☕',
                      },
                      {
                        tip: 'Create a relaxing bedtime routine',
                        icon: '🧘',
                      },
                    ].map((item, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
                      >
                        <span className="text-xl">{item.icon}</span>
                        <span className="text-white/80">{item.tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Chart for period */}
            <SleepQualityChart data={chartData} isLoading={summaryLoading} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SleepDashboard;
