// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  Clock,
  Moon,
  Sun,
  TrendingUp,
  ChevronLeft,
  Save,
  RotateCcw,
} from 'lucide-react';
import Header from '../../components/landing/Header';
import { Breadcrumb } from '../../components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Progress } from '../../components/ui/progress';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { useToast } from '../../components/ui/use-toast';
import { SleepEfficiencyGauge } from '../../components/health/sleep';
import {
  useSleepGoal,
  useSleepGoalProgress,
  useCreateOrUpdateSleepGoal,
} from '../../hooks/health/useSleep';
import type { CreateSleepGoalRequest } from '../../types/health/sleep';

const SleepGoals: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { sleepGoal, isLoading: loadingGoal } = useSleepGoal();
  const { progress, isLoading: loadingProgress } = useSleepGoalProgress();
  const updateGoalMutation = useCreateOrUpdateSleepGoal();

  const [formData, setFormData] = useState<CreateSleepGoalRequest>({
    targetDurationMinutes: 480, // 8 hours
    targetBedtime: '22:30',
    targetWakeTime: '06:30',
    targetQualityScore: 75,
    targetEfficiency: 85,
    weekdaySchedule: {},
    weekendSchedule: {},
  });

  const [hasChanges, setHasChanges] = useState(false);

  // Populate form with existing goal
  useEffect(() => {
    if (sleepGoal) {
      setFormData({
        targetDurationMinutes: sleepGoal.targetDurationMinutes,
        targetBedtime: sleepGoal.targetBedtime || '22:30',
        targetWakeTime: sleepGoal.targetWakeTime || '06:30',
        targetQualityScore: sleepGoal.targetQualityScore,
        targetEfficiency: sleepGoal.targetEfficiency,
        weekdaySchedule: sleepGoal.weekdaySchedule || {},
        weekendSchedule: sleepGoal.weekendSchedule || {},
      });
    }
  }, [sleepGoal]);

  const handleChange = (field: keyof CreateSleepGoalRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateGoalMutation.mutateAsync(formData);
      toast({
        title: 'Goals saved',
        description: 'Your sleep goals have been updated.',
      });
      setHasChanges(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save goals.',
        variant: 'destructive',
      });
    }
  };

  const handleReset = () => {
    if (sleepGoal) {
      setFormData({
        targetDurationMinutes: sleepGoal.targetDurationMinutes,
        targetBedtime: sleepGoal.targetBedtime || '22:30',
        targetWakeTime: sleepGoal.targetWakeTime || '06:30',
        targetQualityScore: sleepGoal.targetQualityScore,
        targetEfficiency: sleepGoal.targetEfficiency,
        weekdaySchedule: sleepGoal.weekdaySchedule || {},
        weekendSchedule: sleepGoal.weekendSchedule || {},
      });
    }
    setHasChanges(false);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const isLoading = loadingGoal || loadingProgress;

  const breadcrumbItems = [
    { label: 'Health', href: '/health' },
    { label: 'Sleep Tracking', href: '/health/sleep' },
    { label: 'Goals', href: '/health/sleep-goals' },
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
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/health/sleep')}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Target className="w-6 h-6 text-emerald-400" />
                Sleep Goals
              </h1>
              <p className="text-white/60">Set targets for better sleep</p>
            </div>
          </div>
          {hasChanges && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-white/20"
                onClick={handleReset}
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-teal-500 to-cyan-500"
                onClick={handleSave}
                disabled={updateGoalMutation.isPending}
              >
                <Save className="w-4 h-4 mr-1" />
                Save Changes
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Goals Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Duration Goal */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-400" />
                  Sleep Duration
                </CardTitle>
                <CardDescription>
                  How much sleep do you want to get each night?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Target Duration</Label>
                    <span className="text-lg font-semibold text-teal-400">
                      {formatDuration(formData.targetDurationMinutes)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="300"
                    max="660"
                    step="15"
                    value={formData.targetDurationMinutes}
                    onChange={(e) =>
                      handleChange('targetDurationMinutes', parseInt(e.target.value))
                    }
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                  <div className="flex justify-between text-xs text-white/40">
                    <span>5h</span>
                    <span>8h (recommended)</span>
                    <span>11h</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Schedule Goal */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Moon className="w-5 h-5 text-purple-400" />
                  Sleep Schedule
                </CardTitle>
                <CardDescription>
                  Set your ideal bedtime and wake time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Moon className="w-4 h-4 text-indigo-400" />
                      Target Bedtime
                    </Label>
                    <Input
                      type="time"
                      value={formData.targetBedtime}
                      onChange={(e) => handleChange('targetBedtime', e.target.value)}
                      className="bg-white/5 border-white/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Sun className="w-4 h-4 text-amber-400" />
                      Target Wake Time
                    </Label>
                    <Input
                      type="time"
                      value={formData.targetWakeTime}
                      onChange={(e) => handleChange('targetWakeTime', e.target.value)}
                      className="bg-white/5 border-white/20"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quality Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-teal-400" />
                  Quality Targets
                </CardTitle>
                <CardDescription>
                  Set goals for sleep quality and efficiency
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Quality Score */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Target Quality Score</Label>
                    <span className="text-lg font-semibold text-teal-400">
                      {formData.targetQualityScore}/100
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    step="5"
                    value={formData.targetQualityScore}
                    onChange={(e) =>
                      handleChange('targetQualityScore', parseInt(e.target.value))
                    }
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                  <div className="flex justify-between text-xs text-white/40">
                    <span>50 (minimum)</span>
                    <span>75 (good)</span>
                    <span>100 (excellent)</span>
                  </div>
                </div>

                {/* Efficiency */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Target Efficiency</Label>
                    <span className="text-lg font-semibold text-teal-400">
                      {formData.targetEfficiency}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="70"
                    max="100"
                    step="5"
                    value={formData.targetEfficiency}
                    onChange={(e) =>
                      handleChange('targetEfficiency', parseInt(e.target.value))
                    }
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                  <div className="flex justify-between text-xs text-white/40">
                    <span>70%</span>
                    <span>85% (healthy)</span>
                    <span>100%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Progress */}
          <div className="space-y-6">
            {/* Current Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {loadingProgress ? (
                  <div className="animate-pulse space-y-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-12 bg-white/10 rounded" />
                    ))}
                  </div>
                ) : progress ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/70">Duration</span>
                        <span>{Math.round(progress.durationProgress || 0)}%</span>
                      </div>
                      <Progress
                        value={progress.durationProgress || 0}
                        className="h-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/70">Quality</span>
                        <span>{Math.round(progress.qualityProgress || 0)}%</span>
                      </div>
                      <Progress
                        value={progress.qualityProgress || 0}
                        className="h-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/70">Efficiency</span>
                        <span>{Math.round(progress.efficiencyProgress || 0)}%</span>
                      </div>
                      <Progress
                        value={progress.efficiencyProgress || 0}
                        className="h-2"
                      />
                    </div>

                    <div className="pt-4 border-t border-white/10">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-teal-400">
                          {progress.streakDays || 0}
                        </p>
                        <p className="text-sm text-white/60">day streak</p>
                      </div>
                      <div className="flex justify-between mt-4 text-sm">
                        <span className="text-white/60">Days Logged</span>
                        <span>
                          {progress.daysLogged || 0}/{progress.targetDays || 7}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-center text-white/40 py-8">
                    Start logging sleep to track your progress
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Efficiency Gauge */}
            <SleepEfficiencyGauge
              efficiency={progress?.efficiencyProgress || 0}
              targetEfficiency={formData.targetEfficiency}
              size="md"
            />

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Goal Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-white/70">
                  <li className="flex items-start gap-2">
                    <span className="text-teal-400">•</span>
                    Adults need 7-9 hours of sleep
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-400">•</span>
                    Consistency is more important than duration
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-400">•</span>
                    85%+ efficiency is considered healthy
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-400">•</span>
                    Start with realistic goals and adjust
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SleepGoals;