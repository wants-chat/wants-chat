import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Moon,
  Plus,
  ChevronLeft,
  Bell,
  Clock,
  X,
  Save,
  AlertTriangle,
  Check,
} from 'lucide-react';
import Header from '../../components/landing/Header';
import { Breadcrumb } from '../../components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { useToast } from '../../components/ui/use-toast';
import { useConfirm } from '../../contexts/ConfirmDialogContext';
import { BedtimeReminderCard } from '../../components/health/sleep';
import {
  useBedtimeReminders,
  useCreateBedtimeReminder,
  useUpdateBedtimeReminder,
  useToggleBedtimeReminder,
  useDeleteBedtimeReminder,
} from '../../hooks/health/useSleep';
import { useBedtimeReminderScheduler } from '../../hooks/health/useBedtimeReminderScheduler';
import { cn } from '../../lib/utils';
import type { BedtimeReminder, CreateBedtimeReminderRequest } from '../../types/health/sleep';

const daysOfWeek = [
  { value: 'mon', label: 'M' },
  { value: 'tue', label: 'T' },
  { value: 'wed', label: 'W' },
  { value: 'thu', label: 'T' },
  { value: 'fri', label: 'F' },
  { value: 'sat', label: 'S' },
  { value: 'sun', label: 'S' },
];

const windDownOptions = [
  { value: 'reading', label: 'Reading', icon: '📖' },
  { value: 'meditation', label: 'Meditation', icon: '🧘' },
  { value: 'stretching', label: 'Stretching', icon: '🤸' },
  { value: 'journaling', label: 'Journaling', icon: '📝' },
  { value: 'music', label: 'Relaxing Music', icon: '🎵' },
  { value: 'bath', label: 'Warm Bath', icon: '🛁' },
  { value: 'tea', label: 'Herbal Tea', icon: '🍵' },
  { value: 'breathing', label: 'Deep Breathing', icon: '🌬️' },
];

const BedtimeReminders: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [showDialog, setShowDialog] = useState(false);
  const [editingReminder, setEditingReminder] = useState<BedtimeReminder | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  const { bedtimeReminders, isLoading, refetch } = useBedtimeReminders();
  const createMutation = useCreateBedtimeReminder();
  const updateMutation = useUpdateBedtimeReminder();
  const toggleMutation = useToggleBedtimeReminder();
  const deleteMutation = useDeleteBedtimeReminder();

  // Bedtime reminder scheduler - checks and triggers reminders
  const {
    activeReminder,
    isShowing,
    dismissReminder,
    windDownLabels,
  } = useBedtimeReminderScheduler({
    reminders: bedtimeReminders || [],
    enabled: true,
    onReminderTriggered: (reminder) => {
      toast({
        title: 'Bedtime Reminder',
        description: `${reminder.name || 'Time for bed!'} - Start winding down!`,
      });
    },
  });

  const [formData, setFormData] = useState<Partial<CreateBedtimeReminderRequest>>({
    name: '',
    reminderTime: '21:30',
    advanceNoticeMinutes: 30,
    daysActive: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
    windDownSuggestions: [],
    notificationType: 'push',
  });

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (editingReminder) {
      setFormData({
        name: editingReminder.name || '',
        reminderTime: editingReminder.reminderTime,
        advanceNoticeMinutes: editingReminder.advanceNoticeMinutes || 30,
        daysActive: editingReminder.daysActive || [],
        windDownSuggestions: editingReminder.windDownSuggestions || [],
        notificationType: editingReminder.notificationType || 'push',
      });
    } else {
      setFormData({
        name: '',
        reminderTime: '21:30',
        advanceNoticeMinutes: 30,
        daysActive: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
        windDownSuggestions: [],
        notificationType: 'push',
      });
    }
  }, [editingReminder]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  const handleDayToggle = (day: string) => {
    const current = formData.daysActive || [];
    const updated = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day];
    setFormData({ ...formData, daysActive: updated });
  };

  const handleSuggestionToggle = (suggestion: string) => {
    const current = formData.windDownSuggestions || [];
    const updated = current.includes(suggestion)
      ? current.filter((s) => s !== suggestion)
      : [...current, suggestion];
    setFormData({ ...formData, windDownSuggestions: updated });
  };

  const handleSave = async () => {
    if (!formData.reminderTime) {
      toast({
        title: 'Missing time',
        description: 'Please enter a reminder time.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const data: CreateBedtimeReminderRequest = {
        name: formData.name,
        reminderTime: formData.reminderTime,
        advanceNoticeMinutes: formData.advanceNoticeMinutes || 30,
        daysActive: formData.daysActive || [],
        windDownSuggestions: formData.windDownSuggestions || [],
        notificationType: formData.notificationType || 'push',
      };

      if (editingReminder) {
        await updateMutation.mutateAsync({ id: editingReminder.id, data });
        toast({
          title: 'Reminder updated',
          description: 'Your bedtime reminder has been updated.',
        });
      } else {
        await createMutation.mutateAsync(data);
        toast({
          title: 'Reminder created',
          description: 'Your bedtime reminder has been set.',
        });
      }
      setShowDialog(false);
      setEditingReminder(null);
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save reminder.',
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
        description: 'Failed to toggle reminder.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Reminder',
      message: 'Are you sure you want to delete this reminder?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive'
    });

    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: 'Reminder deleted',
        description: 'The reminder has been removed.',
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete reminder.',
        variant: 'destructive',
      });
    }
  };

  const activeCount = bedtimeReminders?.filter((r) => r.isActive).length || 0;

  const breadcrumbItems = [
    { label: 'Health', href: '/health' },
    { label: 'Sleep Tracking', href: '/health/sleep' },
    { label: 'Bedtime Reminders', href: '/health/bedtime-reminders' },
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
                <Moon className="w-6 h-6 text-purple-400" />
                Bedtime Reminders
              </h1>
              <p className="text-white/60">
                {activeCount} active reminder{activeCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              setEditingReminder(null);
              setShowDialog(true);
            }}
            className="bg-gradient-to-r from-teal-500 to-cyan-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Reminder
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
                  Allow browser notifications to receive bedtime reminders.
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

        {/* Reminders List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-24 bg-white/10 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : bedtimeReminders && bedtimeReminders.length > 0 ? (
          <div className="space-y-4">
            {bedtimeReminders.map((reminder) => (
              <BedtimeReminderCard
                key={reminder.id}
                reminder={reminder}
                onToggle={handleToggle}
                onEdit={(id) => {
                  const rem = bedtimeReminders.find((r) => r.id === id);
                  if (rem) {
                    setEditingReminder(rem);
                    setShowDialog(true);
                  }
                }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <Moon className="w-16 h-16 mx-auto mb-4 text-white/20" />
              <h3 className="text-lg font-semibold mb-2">No Reminders Set</h3>
              <p className="text-white/60 mb-6">
                Create a bedtime reminder to help you maintain a consistent sleep schedule.
              </p>
              <Button
                onClick={() => setShowDialog(true)}
                className="bg-gradient-to-r from-teal-500 to-cyan-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Reminder
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Wind Down Tips */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Wind Down Tips</CardTitle>
            <CardDescription>
              A good bedtime routine helps signal your body it's time to sleep
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {windDownOptions.map((option) => (
                <div
                  key={option.value}
                  className="p-4 rounded-lg bg-white/5 text-center"
                >
                  <span className="text-2xl block mb-2">{option.icon}</span>
                  <span className="text-sm text-white/70">{option.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto bg-teal-800/95 backdrop-blur-xl border-teal-400/30">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingReminder ? 'Edit Reminder' : 'Create Bedtime Reminder'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label className="text-white/70">Name (optional)</Label>
                <Input
                  value={formData.name || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Evening Routine"
                  className="bg-white/5 border-white/20"
                />
              </div>

              {/* Reminder Time */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-white/70">
                  <Clock className="w-4 h-4 text-purple-400" />
                  Reminder Time
                </Label>
                <Input
                  type="time"
                  value={formData.reminderTime || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, reminderTime: e.target.value })
                  }
                  className="bg-white/5 border-white/20"
                  required
                />
              </div>

              {/* Advance Notice */}
              <div className="space-y-2">
                <Label className="text-white/70">Advance Notice (minutes before bedtime)</Label>
                <Input
                  type="number"
                  min="5"
                  max="120"
                  value={formData.advanceNoticeMinutes || 30}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      advanceNoticeMinutes: parseInt(e.target.value) || 30,
                    })
                  }
                  className="bg-white/5 border-white/20"
                />
              </div>

              {/* Days Active */}
              <div className="space-y-2">
                <Label className="text-white/70">Repeat</Label>
                <div className="flex gap-2">
                  {daysOfWeek.map((day, index) => (
                    <Button
                      key={day.value}
                      type="button"
                      variant="outline"
                      size="icon"
                      className={cn(
                        'w-9 h-9 rounded-full',
                        formData.daysActive?.includes(day.value)
                          ? 'bg-gradient-to-r from-teal-500 to-cyan-500 border-transparent text-white'
                          : 'border-white/20 text-white/60 hover:border-white/40',
                        index >= 5 && !formData.daysActive?.includes(day.value) && 'border-purple-500/30'
                      )}
                      onClick={() => handleDayToggle(day.value)}
                    >
                      {day.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Wind Down Suggestions */}
              <div className="space-y-2">
                <Label className="text-white/70">Wind Down Suggestions</Label>
                <p className="text-xs text-white/50 mb-2">
                  Select activities to include in your reminder
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {windDownOptions.map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      variant="outline"
                      className={cn(
                        'justify-start h-auto py-2',
                        formData.windDownSuggestions?.includes(option.value)
                          ? 'bg-teal-500/30 border-teal-400 text-white'
                          : 'border-white/20 hover:border-white/40'
                      )}
                      onClick={() => handleSuggestionToggle(option.value)}
                    >
                      <span className="mr-2">{option.icon}</span>
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-white/20 hover:bg-white/10"
                  onClick={() => {
                    setShowDialog(false);
                    setEditingReminder(null);
                  }}
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500"
                  onClick={handleSave}
                  disabled={createMutation.loading || updateMutation.loading}
                >
                  <Save className="w-4 h-4 mr-1" />
                  {editingReminder ? 'Update' : 'Save'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Bedtime Reminder Dialog */}
        <Dialog open={isShowing} onOpenChange={() => {}}>
          <DialogContent className="max-w-sm bg-gradient-to-br from-indigo-900/95 to-purple-900/95 border-purple-500/50">
            <div className="text-center py-6">
              {/* Animated moon icon */}
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-purple-400/30 rounded-full animate-ping" />
                <div className="relative p-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 animate-pulse">
                  <Moon className="w-12 h-12 text-white" />
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

              {/* Reminder name */}
              <h2 className="text-xl font-semibold text-purple-200 mb-2">
                {activeReminder?.name || 'Bedtime Reminder'}
              </h2>
              <p className="text-purple-200/70 mb-4">
                Time to start winding down for bed!
              </p>

              {/* Wind Down Suggestions */}
              {activeReminder?.windDownSuggestions && activeReminder.windDownSuggestions.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm text-purple-300/80 mb-3">Suggested activities:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {activeReminder.windDownSuggestions.map((suggestion) => {
                      const info = windDownLabels[suggestion];
                      if (!info) return null;
                      return (
                        <span
                          key={suggestion}
                          className="px-3 py-1.5 rounded-full bg-white/10 text-sm text-white"
                        >
                          {info.icon} {info.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Dismiss button */}
              <Button
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500"
                onClick={dismissReminder}
              >
                <Check className="w-4 h-4 mr-2" />
                Got it!
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default BedtimeReminders;
