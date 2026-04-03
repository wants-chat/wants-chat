import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlarmClock,
  Plus,
  ChevronLeft,
  Bell,
  BellOff,
  Clock,
  Edit,
  Trash2,
  MoreVertical,
  Settings2,
  AlertTriangle,
  X,
  Timer,
} from 'lucide-react';
import Header from '../../components/landing/Header';
import { Breadcrumb } from '../../components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { useToast } from '../../components/ui/use-toast';
import { useConfirm } from '../../contexts/ConfirmDialogContext';
import { SmartAlarmConfig } from '../../components/health/sleep';
import {
  useSleepAlarms,
  useCreateSleepAlarm,
  useUpdateSleepAlarm,
  useToggleSleepAlarm,
  useDeleteSleepAlarm,
  useOptimalWakeTime,
} from '../../hooks/health/useSleep';
import { useAlarmScheduler } from '../../hooks/health/useAlarmScheduler';
import { formatTime } from '../../types/health/sleep';
import { cn } from '../../lib/utils';
import type { SleepAlarm, CreateSleepAlarmRequest } from '../../types/health/sleep';

const daysMap: Record<string, string> = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
};

const SleepAlarms: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [showDialog, setShowDialog] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<SleepAlarm | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  const { sleepAlarms, isLoading, refetch } = useSleepAlarms();
  const createMutation = useCreateSleepAlarm();
  const updateMutation = useUpdateSleepAlarm();
  const toggleMutation = useToggleSleepAlarm();
  const deleteMutation = useDeleteSleepAlarm();
  const { calculateOptimalWakeTime, optimalWakeTime } = useOptimalWakeTime();

  // Alarm scheduler - checks and triggers alarms
  const {
    activeAlarm,
    isRinging,
    snoozeCount,
    dismissAlarm,
    snoozeAlarm,
    testSound,
  } = useAlarmScheduler({
    alarms: sleepAlarms || [],
    enabled: true,
    onAlarmTriggered: (alarm) => {
      toast({
        title: 'Alarm!',
        description: `${alarm.name || 'Wake up!'} - Time to get up!`,
      });
    },
  });

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  const handleSaveAlarm = async (alarmData: Partial<SleepAlarm>) => {
    try {
      const data: CreateSleepAlarmRequest = {
        name: alarmData.name,
        wakeWindowStart: alarmData.wakeWindowStart!,
        wakeWindowEnd: alarmData.wakeWindowEnd!,
        daysActive: alarmData.daysActive || ['mon', 'tue', 'wed', 'thu', 'fri'],
        isSmartAlarm: alarmData.isSmartAlarm ?? true,
        gradualVolume: alarmData.gradualVolume ?? true,
        snoozeEnabled: alarmData.snoozeEnabled ?? true,
        snoozeDurationMinutes: alarmData.snoozeDurationMinutes || 9,
        maxSnoozes: alarmData.maxSnoozes || 3,
        soundType: alarmData.soundType || 'gentle',
        vibrationEnabled: alarmData.vibrationEnabled ?? true,
      };

      if (editingAlarm) {
        await updateMutation.mutateAsync({ id: editingAlarm.id, data });
        toast({
          title: 'Alarm updated',
          description: 'Your smart alarm has been updated.',
        });
      } else {
        await createMutation.mutateAsync(data);
        toast({
          title: 'Alarm created',
          description: 'Your smart alarm has been set.',
        });
      }
      setShowDialog(false);
      setEditingAlarm(null);
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save alarm.',
        variant: 'destructive',
      });
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleMutation.mutateAsync(id);
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to toggle alarm.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Alarm',
      message: 'Are you sure you want to delete this alarm?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive'
    });

    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: 'Alarm deleted',
        description: 'The alarm has been removed.',
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete alarm.',
        variant: 'destructive',
      });
    }
  };

  const formatDaysActive = (days: string[]) => {
    if (days.length === 7) return 'Every day';
    if (days.length === 5 && !days.includes('sat') && !days.includes('sun')) {
      return 'Weekdays';
    }
    if (days.length === 2 && days.includes('sat') && days.includes('sun')) {
      return 'Weekends';
    }
    return days.map((d) => daysMap[d] || d).join(', ');
  };

  const activeCount = sleepAlarms?.filter((a) => a.isActive).length || 0;

  const breadcrumbItems = [
    { label: 'Health', href: '/health' },
    { label: 'Sleep Tracking', href: '/health/sleep' },
    { label: 'Smart Alarms', href: '/health/sleep-alarms' },
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
                <AlarmClock className="w-6 h-6 text-amber-400" />
                Smart Alarms
              </h1>
              <p className="text-white/60">
                {activeCount} active alarm{activeCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              setEditingAlarm(null);
              setShowDialog(true);
            }}
            className="bg-gradient-to-r from-teal-500 to-cyan-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Alarm
          </Button>
        </div>

        {/* Notification Warning */}
        {notificationPermission !== 'granted' && (
          <Card className="mb-6 border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-4 flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-200">
                  Enable Notifications
                </h3>
                <p className="text-sm text-amber-200/70 mt-1">
                  Allow browser notifications to receive alarm alerts. Without this,
                  alarms may not work when the app is in the background.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
                  onClick={requestNotificationPermission}
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Enable Notifications
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alarms List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-24 bg-white/10 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : sleepAlarms && sleepAlarms.length > 0 ? (
          <div className="space-y-4">
            {sleepAlarms.map((alarm) => (
              <Card
                key={alarm.id}
                className={cn(
                  'transition-all duration-200',
                  !alarm.isActive && 'opacity-50'
                )}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div
                        className={cn(
                          'p-3 rounded-xl',
                          alarm.isActive
                            ? 'bg-gradient-to-br from-amber-500 to-orange-500'
                            : 'bg-white/10'
                        )}
                      >
                        <AlarmClock className="w-6 h-6 text-white" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white text-lg">
                            {alarm.name || 'Smart Alarm'}
                          </h3>
                          {alarm.isSmartAlarm && (
                            <Badge variant="secondary" className="text-xs bg-teal-500/20 text-teal-300">
                              <Settings2 className="w-3 h-3 mr-1" />
                              Smart
                            </Badge>
                          )}
                          {!alarm.isActive && (
                            <Badge variant="secondary" className="text-xs">
                              Off
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-2xl font-bold text-white">
                            {formatTime(alarm.wakeWindowStart)} -{' '}
                            {formatTime(alarm.wakeWindowEnd)}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs border-white/20">
                            {formatDaysActive(alarm.daysActive || [])}
                          </Badge>
                          {alarm.snoozeEnabled && (
                            <Badge variant="outline" className="text-xs border-white/20">
                              Snooze: {alarm.snoozeDurationMinutes}min
                            </Badge>
                          )}
                          {alarm.gradualVolume && (
                            <Badge variant="outline" className="text-xs border-white/20">
                              Gradual Volume
                            </Badge>
                          )}
                        </div>

                        {alarm.optimalWakeTime && (
                          <div className="mt-3 p-2 rounded-lg bg-teal-500/10 border border-teal-500/30 inline-flex items-center gap-2">
                            <Clock className="w-4 h-4 text-teal-400" />
                            <span className="text-sm text-teal-300">
                              Optimal: <strong>{formatTime(alarm.optimalWakeTime)}</strong>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={alarm.isActive}
                        onCheckedChange={() => handleToggle(alarm.id)}
                      />

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 z-50">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingAlarm(alarm);
                              setShowDialog(true);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(alarm.id)}
                            className="text-red-400 focus:text-red-300"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <AlarmClock className="w-16 h-16 mx-auto mb-4 text-white/20" />
              <h3 className="text-lg font-semibold mb-2">No Alarms Set</h3>
              <p className="text-white/60 mb-6">
                Create a smart alarm to wake up at the optimal time in your sleep cycle.
              </p>
              <Button
                onClick={() => setShowDialog(true)}
                className="bg-gradient-to-r from-teal-500 to-cyan-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Alarm
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Smart Alarm Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-teal-400" />
              How Smart Alarms Work
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <span>
                  Set a wake window (e.g., 7:00 - 7:30 AM) rather than a fixed time
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <span>
                  The alarm calculates optimal wake times based on 90-minute sleep cycles
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <span>
                  Waking between cycles helps you feel more refreshed and less groggy
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto bg-teal-800/95 backdrop-blur-xl border-teal-400/30">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingAlarm ? 'Edit Alarm' : 'Create Smart Alarm'}
              </DialogTitle>
            </DialogHeader>
            <SmartAlarmConfig
              alarm={editingAlarm || undefined}
              onSave={handleSaveAlarm}
              onCancel={() => {
                setShowDialog(false);
                setEditingAlarm(null);
              }}
              optimalWakeTime={optimalWakeTime}
              isLoading={createMutation.loading || updateMutation.loading}
            />
          </DialogContent>
        </Dialog>

        {/* Alarm Ringing Dialog */}
        <Dialog open={isRinging} onOpenChange={() => {}}>
          <DialogContent className="max-w-sm bg-gradient-to-br from-amber-900/95 to-orange-900/95 border-amber-500/50">
            <div className="text-center py-6">
              {/* Animated alarm icon */}
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-amber-400/30 rounded-full animate-ping" />
                <div className="relative p-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 animate-pulse">
                  <AlarmClock className="w-12 h-12 text-white" />
                </div>
              </div>

              {/* Time display */}
              <div className="text-5xl font-bold text-white mb-2">
                {new Date().toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })}
              </div>

              {/* Alarm name */}
              <h2 className="text-xl font-semibold text-amber-200 mb-2">
                {activeAlarm?.name || 'Wake Up!'}
              </h2>
              <p className="text-amber-200/70 mb-6">
                Time to start your day!
              </p>

              {/* Snooze count indicator */}
              {snoozeCount > 0 && (
                <div className="mb-4 flex items-center justify-center gap-2 text-sm text-amber-300/80">
                  <Timer className="w-4 h-4" />
                  <span>Snoozed {snoozeCount} time{snoozeCount !== 1 ? 's' : ''}</span>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3">
                {activeAlarm?.snoozeEnabled && snoozeCount < (activeAlarm?.maxSnoozes || 3) && (
                  <Button
                    variant="outline"
                    className="flex-1 border-amber-500/50 text-amber-200 hover:bg-amber-500/20"
                    onClick={snoozeAlarm}
                  >
                    <Timer className="w-4 h-4 mr-2" />
                    Snooze ({activeAlarm?.snoozeDurationMinutes || 9}min)
                  </Button>
                )}
                <Button
                  className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500"
                  onClick={dismissAlarm}
                >
                  <X className="w-4 h-4 mr-2" />
                  Dismiss
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default SleepAlarms;
