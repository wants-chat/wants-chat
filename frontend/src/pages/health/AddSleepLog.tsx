// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Moon, Sun, Clock, Save, X, ChevronLeft, AlertCircle } from 'lucide-react';
import Header from '../../components/landing/Header';
import { Breadcrumb } from '../../components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { useToast } from '../../components/ui/use-toast';
import {
  EnvironmentTracker,
  DisturbanceLogger,
  QualityScoreBadge,
} from '../../components/health/sleep';
import {
  useSleepLog,
  useCreateSleepLog,
  useUpdateSleepLog,
} from '../../hooks/health/useSleep';
import type {
  NoiseLevel,
  LightLevel,
  TemperatureComfort,
  MoodBefore,
  MoodAfter,
  SleepDisturbance,
  CreateSleepLogRequest,
} from '../../types/health/sleep';

const moodBeforeOptions: { value: MoodBefore; label: string; icon: string }[] = [
  { value: 'relaxed', label: 'Relaxed', icon: '😌' },
  { value: 'neutral', label: 'Neutral', icon: '😐' },
  { value: 'tired', label: 'Tired', icon: '😴' },
  { value: 'energetic', label: 'Energetic', icon: '⚡' },
  { value: 'anxious', label: 'Anxious', icon: '😰' },
  { value: 'stressed', label: 'Stressed', icon: '😓' },
];

const moodAfterOptions: { value: MoodAfter; label: string; icon: string }[] = [
  { value: 'refreshed', label: 'Refreshed', icon: '😊' },
  { value: 'energetic', label: 'Energetic', icon: '⚡' },
  { value: 'neutral', label: 'Neutral', icon: '😐' },
  { value: 'tired', label: 'Tired', icon: '😴' },
  { value: 'groggy', label: 'Groggy', icon: '🥱' },
];

const AddSleepLog: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  // Fetch existing log if editing
  const { sleepLog: existingLog, isLoading: loadingLog } = useSleepLog(editId || '');
  const createMutation = useCreateSleepLog();
  const updateMutation = useUpdateSleepLog();

  // Form state
  const [formData, setFormData] = useState<Partial<CreateSleepLogRequest>>({
    sleepDate: new Date().toISOString().split('T')[0],
    bedtime: '',
    wakeTime: '',
    sleepLatencyMinutes: undefined,
    wokeUpCount: 0,
    disturbances: [],
    noiseLevel: undefined,
    lightLevel: undefined,
    temperatureComfort: undefined,
    moodBefore: undefined,
    moodAfter: undefined,
    notes: '',
    tags: [],
  });

  const [newTag, setNewTag] = useState('');

  // Populate form when editing
  useEffect(() => {
    if (existingLog && editId) {
      setFormData({
        sleepDate: existingLog.sleepDate,
        bedtime: new Date(existingLog.bedtime).toTimeString().substring(0, 5),
        wakeTime: new Date(existingLog.wakeTime).toTimeString().substring(0, 5),
        sleepLatencyMinutes: existingLog.sleepLatencyMinutes,
        wokeUpCount: existingLog.wokeUpCount,
        disturbances: existingLog.disturbances,
        noiseLevel: existingLog.noiseLevel,
        lightLevel: existingLog.lightLevel,
        temperatureComfort: existingLog.temperatureComfort,
        moodBefore: existingLog.moodBefore,
        moodAfter: existingLog.moodAfter,
        notes: existingLog.notes,
        tags: existingLog.tags,
      });
    }
  }, [existingLog, editId]);

  // Calculate estimated values
  const calculatedValues = useMemo(() => {
    if (!formData.bedtime || !formData.wakeTime) return null;

    const bedtime = new Date(`${formData.sleepDate}T${formData.bedtime}`);
    let wakeTime = new Date(`${formData.sleepDate}T${formData.wakeTime}`);

    // If wake time is before bedtime, it's the next day
    if (wakeTime <= bedtime) {
      wakeTime.setDate(wakeTime.getDate() + 1);
    }

    const timeInBedMinutes = Math.round((wakeTime.getTime() - bedtime.getTime()) / 60000);
    const sleepLatency = formData.sleepLatencyMinutes || 0;
    const actualSleepMinutes = Math.max(0, timeInBedMinutes - sleepLatency);
    const efficiency = timeInBedMinutes > 0 ? (actualSleepMinutes / timeInBedMinutes) * 100 : 0;

    // Calculate quality score based on sleep hours (more responsive)
    const sleepHours = actualSleepMinutes / 60;
    let qualityScore = 0;

    // Duration factor (40% weight) - optimal is 7-9 hours
    if (sleepHours >= 7 && sleepHours <= 9) {
      qualityScore += 40; // Optimal sleep
    } else if (sleepHours >= 6 && sleepHours < 7) {
      qualityScore += 30; // Slightly low
    } else if (sleepHours > 9 && sleepHours <= 10) {
      qualityScore += 35; // Slightly high
    } else if (sleepHours >= 5 && sleepHours < 6) {
      qualityScore += 20; // Low
    } else if (sleepHours > 10) {
      qualityScore += 25; // Too much
    } else if (sleepHours >= 4 && sleepHours < 5) {
      qualityScore += 10; // Very low
    } else {
      qualityScore += 5; // Critically low (< 4 hours)
    }

    // Efficiency factor (30% weight)
    qualityScore += (efficiency / 100) * 30;

    // Wake-ups penalty (20% weight)
    const wakeUps = formData.wokeUpCount || 0;
    if (wakeUps === 0) {
      qualityScore += 20;
    } else if (wakeUps === 1) {
      qualityScore += 15;
    } else if (wakeUps === 2) {
      qualityScore += 10;
    } else if (wakeUps <= 4) {
      qualityScore += 5;
    }
    // More than 4 wake-ups = 0 bonus

    // Environment/mood bonus (10% weight) - if they filled these in
    if (formData.noiseLevel === 'silent' || formData.noiseLevel === 'quiet') {
      qualityScore += 3;
    }
    if (formData.lightLevel === 'dark' || formData.lightLevel === 'dim') {
      qualityScore += 3;
    }
    if (formData.temperatureComfort === 'comfortable' || formData.temperatureComfort === 'cool') {
      qualityScore += 4;
    }

    // Clamp between 0-100
    qualityScore = Math.max(0, Math.min(100, Math.round(qualityScore)));

    // Format times for display
    const formatTimeDisplay = (date: Date) => {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    return {
      timeInBedMinutes,
      actualSleepMinutes,
      efficiency: Math.round(efficiency),
      qualityScore,
      bedtimeDisplay: formatTimeDisplay(bedtime),
      wakeTimeDisplay: formatTimeDisplay(wakeTime),
    };
  }, [formData.bedtime, formData.wakeTime, formData.sleepDate, formData.sleepLatencyMinutes, formData.wokeUpCount, formData.noiseLevel, formData.lightLevel, formData.temperatureComfort]);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handleSubmit = async () => {
    console.log('handleSubmit called', formData);

    if (!formData.bedtime || !formData.wakeTime) {
      toast({
        title: 'Missing required fields',
        description: 'Please enter bedtime and wake time.',
        variant: 'destructive',
      });
      return;
    }

    // Construct full datetime strings
    const bedtimeDate = new Date(`${formData.sleepDate}T${formData.bedtime}`);
    let wakeTimeDate = new Date(`${formData.sleepDate}T${formData.wakeTime}`);
    if (wakeTimeDate <= bedtimeDate) {
      wakeTimeDate.setDate(wakeTimeDate.getDate() + 1);
    }

    const submitData: CreateSleepLogRequest = {
      sleepDate: formData.sleepDate!,
      bedtime: bedtimeDate.toISOString(),
      wakeTime: wakeTimeDate.toISOString(),
      sleepLatencyMinutes: formData.sleepLatencyMinutes,
      wokeUpCount: formData.wokeUpCount || 0,
      disturbances: formData.disturbances || [],
      noiseLevel: formData.noiseLevel,
      lightLevel: formData.lightLevel,
      temperatureComfort: formData.temperatureComfort,
      moodBefore: formData.moodBefore,
      moodAfter: formData.moodAfter,
      notes: formData.notes,
      tags: formData.tags,
    };

    console.log('Submitting sleep log:', submitData);

    try {
      if (editId) {
        console.log('Updating sleep log with id:', editId);
        await updateMutation.mutateAsync({ id: editId, data: submitData });
        toast({
          title: 'Sleep log updated',
          description: 'Your sleep log has been updated successfully.',
        });
      } else {
        console.log('Creating new sleep log');
        const result = await createMutation.mutateAsync(submitData);
        console.log('Create result:', result);
        toast({
          title: 'Sleep logged!',
          description: 'Your sleep has been recorded successfully.',
        });
      }
      navigate('/health/sleep');
    } catch (error: any) {
      console.error('Error saving sleep log:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save sleep log.',
        variant: 'destructive',
      });
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), newTag.trim()],
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((t) => t !== tag) || [],
    });
  };

  const isSubmitting = createMutation.loading || updateMutation.loading;

  const breadcrumbItems = [
    { label: 'Health', href: '/health' },
    { label: 'Sleep Tracking', href: '/health/sleep' },
    { label: editId ? 'Edit Sleep Log' : 'Log Sleep', href: '#' },
  ];

  if (loadingLog && editId) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full" />
      </div>
    );
  }

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
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/health/sleep')}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {editId ? 'Edit Sleep Log' : 'Log Your Sleep'}
            </h1>
            <p className="text-white/60">
              {editId ? 'Update your sleep entry' : 'Record last night\'s sleep'}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Date & Time Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sleep Times</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Date */}
                  <div className="space-y-2">
                    <Label>Sleep Date</Label>
                    <Input
                      type="date"
                      value={formData.sleepDate}
                      onChange={(e) =>
                        setFormData({ ...formData, sleepDate: e.target.value })
                      }
                      className="bg-white/5 border-white/20 dark-date-input"
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>

                  {/* Bedtime & Wake Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Moon className="w-4 h-4 text-indigo-400" />
                        Bedtime
                      </Label>
                      <Input
                        type="time"
                        value={formData.bedtime}
                        onChange={(e) =>
                          setFormData({ ...formData, bedtime: e.target.value })
                        }
                        className="bg-white/5 border-white/20 dark-date-input"
                        style={{ colorScheme: 'dark' }}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Sun className="w-4 h-4 text-amber-400" />
                        Wake Time
                      </Label>
                      <Input
                        type="time"
                        value={formData.wakeTime}
                        onChange={(e) =>
                          setFormData({ ...formData, wakeTime: e.target.value })
                        }
                        className="bg-white/5 border-white/20 dark-date-input"
                        style={{ colorScheme: 'dark' }}
                        required
                      />
                    </div>
                  </div>

                  {/* Sleep Latency & Wake-ups */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-teal-400" />
                        Time to Fall Asleep (min)
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        max="180"
                        value={formData.sleepLatencyMinutes || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            sleepLatencyMinutes: e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          })
                        }
                        placeholder="15"
                        className="bg-white/5 border-white/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Times Woke Up</Label>
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        value={formData.wokeUpCount || 0}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            wokeUpCount: parseInt(e.target.value) || 0,
                          })
                        }
                        className="bg-white/5 border-white/20"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mood Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Mood</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Mood Before */}
                  <div className="space-y-2">
                    <Label>How did you feel before bed?</Label>
                    <div className="flex flex-wrap gap-2">
                      {moodBeforeOptions.map((option) => (
                        <Button
                          key={option.value}
                          type="button"
                          variant={
                            formData.moodBefore === option.value
                              ? 'default'
                              : 'outline'
                          }
                          size="sm"
                          className={
                            formData.moodBefore === option.value
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 border-transparent'
                              : 'border-white/20'
                          }
                          onClick={() =>
                            setFormData({ ...formData, moodBefore: option.value })
                          }
                        >
                          {option.icon} {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Mood After */}
                  <div className="space-y-2">
                    <Label>How do you feel now?</Label>
                    <div className="flex flex-wrap gap-2">
                      {moodAfterOptions.map((option) => (
                        <Button
                          key={option.value}
                          type="button"
                          variant={
                            formData.moodAfter === option.value
                              ? 'default'
                              : 'outline'
                          }
                          size="sm"
                          className={
                            formData.moodAfter === option.value
                              ? 'bg-gradient-to-r from-teal-500 to-cyan-500 border-transparent'
                              : 'border-white/20'
                          }
                          onClick={() =>
                            setFormData({ ...formData, moodAfter: option.value })
                          }
                        >
                          {option.icon} {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Environment Tracker */}
              <EnvironmentTracker
                noiseLevel={formData.noiseLevel}
                lightLevel={formData.lightLevel}
                temperatureComfort={formData.temperatureComfort}
                onNoiseChange={(level) =>
                  setFormData({ ...formData, noiseLevel: level })
                }
                onLightChange={(level) =>
                  setFormData({ ...formData, lightLevel: level })
                }
                onTemperatureChange={(level) =>
                  setFormData({ ...formData, temperatureComfort: level })
                }
              />

              {/* Disturbances */}
              <DisturbanceLogger
                disturbances={formData.disturbances || []}
                onDisturbancesChange={(disturbances) =>
                  setFormData({
                    ...formData,
                    disturbances,
                    wokeUpCount: disturbances.length,
                  })
                }
              />

              {/* Notes & Tags */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notes & Tags</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Notes (optional)</Label>
                    <Textarea
                      value={formData.notes || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      placeholder="Any thoughts about your sleep..."
                      className="bg-white/5 border-white/20 min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                        placeholder="Add a tag..."
                        className="bg-white/5 border-white/20"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddTag}
                        className="border-white/20"
                      >
                        Add
                      </Button>
                    </div>
                    {formData.tags && formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            {tag}
                            <X className="w-3 h-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Preview */}
            <div className="lg:sticky lg:top-4 lg:self-start">
              {/* Estimated Quality */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sleep Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  {calculatedValues ? (
                    <div className="space-y-6">
                      <div className="flex justify-center">
                        <QualityScoreBadge
                          score={calculatedValues.qualityScore}
                          size="lg"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                          <span className="text-white/70">In Bed</span>
                          <span className="font-semibold text-sm">
                            {calculatedValues.bedtimeDisplay} - {calculatedValues.wakeTimeDisplay}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                          <span className="text-white/70">Time in Bed</span>
                          <span className="font-semibold">
                            {formatDuration(calculatedValues.timeInBedMinutes)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                          <span className="text-white/70">Actual Sleep</span>
                          <span className="font-semibold">
                            {formatDuration(calculatedValues.actualSleepMinutes)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                          <span className="text-white/70">Efficiency</span>
                          <span className="font-semibold">
                            {calculatedValues.efficiency}%
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-white/40 text-center">
                        Final quality score will be calculated after saving
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-white/40">
                      <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
                      <p>Enter bedtime and wake time to see your sleep summary</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 mt-4">
                <Button
                  type="button"
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500"
                  disabled={isSubmitting || !formData.bedtime || !formData.wakeTime}
                  onClick={handleSubmit}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting
                    ? 'Saving...'
                    : editId
                    ? 'Update Sleep Log'
                    : 'Save Sleep Log'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-white/20"
                  onClick={() => navigate('/health/sleep')}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddSleepLog;