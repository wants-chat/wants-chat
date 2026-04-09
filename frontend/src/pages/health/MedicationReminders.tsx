// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/landing/Header';
import { Breadcrumb } from '../../components/ui/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import ConfirmationModal from '../../components/ui/confirmation-modal';
import { useConfirmation } from '../../hooks/useConfirmation';
import { usePrescriptions, useReminders, useCreateReminder } from '../../hooks/useServices';
import { notificationService } from '../../services/notificationService';
import { toast } from '../../components/ui/sonner';
import {
  ChevronLeft,
  Medication as PillIcon,
  Schedule as ScheduleIcon,
  NotificationsActive as ReminderIcon,
  Add as Plus,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  AlarmOn as AlarmIcon,
  Today as TodayIcon,
  AccessTime as TimeIcon,
  Repeat as RepeatIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

interface MedicationReminder {
  id: string;
  medicationName: string;
  dosage: string;
  reminderTimes: string[];
  frequency: 'daily' | 'twice-daily' | 'three-times' | 'four-times' | 'weekly' | 'custom';
  isActive: boolean;
  nextReminder?: string;
  lastTaken?: string;
  reminderSound: boolean;
  vibration: boolean;
  customDays?: string[];
  // Link to backend reminder
  backendReminderId?: string;
}

const MedicationReminders: React.FC = () => {
  const navigate = useNavigate();
  const confirmation = useConfirmation();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<MedicationReminder | null>(null);
  const [reminders, setReminders] = useState<MedicationReminder[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch prescriptions to get medication list
  const prescriptionsQuery = usePrescriptions({ status: 'active' });

  // Fetch existing medication reminders
  const remindersQueryParams = useMemo(() => ({ type: 'medication' }), []);
  const remindersQuery = useReminders(remindersQueryParams);

  // Create reminder mutation
  const createReminderMutation = useCreateReminder();

  // Process prescriptions and reminders data
  useEffect(() => {
    if (remindersQuery.data?.data) {
      const backendReminders = remindersQuery.data.data;

      // Map backend reminders to UI format
      const mappedReminders: MedicationReminder[] = backendReminders.map((r: any) => {
        // Parse recurrence to get frequency
        let frequency: MedicationReminder['frequency'] = 'daily';
        let reminderTimes: string[] = ['08:00'];

        if (r.recurrence) {
          if (r.recurrence.pattern === 'daily') {
            // Check metadata for actual times
            if (r.metadata?.reminderTimes) {
              reminderTimes = r.metadata.reminderTimes;
              if (reminderTimes.length === 1) frequency = 'daily';
              else if (reminderTimes.length === 2) frequency = 'twice-daily';
              else if (reminderTimes.length === 3) frequency = 'three-times';
              else if (reminderTimes.length === 4) frequency = 'four-times';
              else frequency = 'custom';
            }
          } else if (r.recurrence.pattern === 'weekly') {
            frequency = 'weekly';
          } else {
            frequency = 'custom';
          }
        }

        // Calculate next reminder time
        let nextReminder: string | undefined;
        if (r.nextTrigger) {
          const next = new Date(r.nextTrigger);
          const today = new Date();
          const isToday = next.toDateString() === today.toDateString();
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          const isTomorrow = next.toDateString() === tomorrow.toDateString();

          const timeStr = next.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
          if (isToday) nextReminder = `Today ${timeStr}`;
          else if (isTomorrow) nextReminder = `Tomorrow ${timeStr}`;
          else nextReminder = next.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + ` ${timeStr}`;
        }

        return {
          id: r.id,
          backendReminderId: r.id,
          medicationName: r.title || r.metadata?.medicationName || 'Unknown Medication',
          dosage: r.metadata?.dosage || '',
          reminderTimes: r.metadata?.reminderTimes || reminderTimes,
          frequency,
          isActive: r.isActive,
          nextReminder,
          lastTaken: r.completedAt ? new Date(r.completedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : undefined,
          reminderSound: r.notificationSettings?.sound ?? true,
          vibration: r.notificationSettings?.vibration ?? true,
          customDays: r.recurrence?.daysOfWeek?.map((d: number) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d])
        };
      });

      setReminders(mappedReminders);
    }
  }, [remindersQuery.data]);
  
  const [formData, setFormData] = useState({
    medicationName: '',
    dosage: '',
    frequency: 'daily' as MedicationReminder['frequency'],
    reminderTimes: ['08:00'],
    reminderSound: true,
    vibration: true,
    customDays: [] as string[]
  });

  const frequencyOptions = [
    { value: 'daily', label: 'Once Daily', times: 1 },
    { value: 'twice-daily', label: 'Twice Daily', times: 2 },
    { value: 'three-times', label: 'Three Times Daily', times: 3 },
    { value: 'four-times', label: 'Four Times Daily', times: 4 },
    { value: 'weekly', label: 'Weekly', times: 1 },
    { value: 'custom', label: 'Custom Schedule', times: 0 }
  ];

  const toggleReminder = async (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (!reminder || !reminder.backendReminderId) {
      // Local-only toggle for new reminders
      setReminders(prev => prev.map(r =>
        r.id === id ? { ...r, isActive: !r.isActive } : r
      ));
      return;
    }

    try {
      await notificationService.updateReminder(reminder.backendReminderId, {
        isActive: !reminder.isActive
      });
      setReminders(prev => prev.map(r =>
        r.id === id ? { ...r, isActive: !r.isActive } : r
      ));
      toast.success(`Reminder ${reminder.isActive ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      toast.error('Failed to update reminder status');
      console.error('Toggle reminder error:', error);
    }
  };

  const deleteReminder = async (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return;

    const confirmed = await confirmation.showConfirmation({
      title: 'Delete Medication Reminder',
      message: `Are you sure you want to delete the reminder for "${reminder.medicationName}"? This action cannot be undone.`,
      confirmText: 'Delete Reminder',
      cancelText: 'Cancel',
      variant: 'danger'
    });

    if (confirmed) {
      try {
        if (reminder.backendReminderId) {
          await notificationService.deleteReminder(reminder.backendReminderId);
        }
        setReminders(prev => prev.filter(r => r.id !== id));
        toast.success('Reminder deleted successfully');
      } catch (error) {
        toast.error('Failed to delete reminder');
        console.error('Delete reminder error:', error);
      }
    }
  };

  const handleEdit = (reminder: MedicationReminder) => {
    setEditingReminder(reminder);
    setFormData({
      medicationName: reminder.medicationName,
      dosage: reminder.dosage,
      frequency: reminder.frequency,
      reminderTimes: reminder.reminderTimes,
      reminderSound: reminder.reminderSound,
      vibration: reminder.vibration,
      customDays: reminder.customDays || []
    });
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Calculate the first scheduled time for today or tomorrow
      const now = new Date();
      const firstTime = formData.reminderTimes[0];
      const [hours, minutes] = firstTime.split(':').map(Number);
      const scheduledFor = new Date();
      scheduledFor.setHours(hours, minutes, 0, 0);

      // If the time has passed today, schedule for tomorrow
      if (scheduledFor <= now) {
        scheduledFor.setDate(scheduledFor.getDate() + 1);
      }

      // Determine recurrence pattern
      let recurrence: any = undefined;
      if (formData.frequency !== 'custom') {
        recurrence = {
          pattern: formData.frequency === 'weekly' ? 'weekly' : 'daily',
          interval: 1,
        };
        if (formData.frequency === 'weekly' && formData.customDays.length > 0) {
          recurrence.daysOfWeek = formData.customDays.map(day =>
            ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(day)
          );
        }
      }

      const reminderPayload = {
        title: formData.medicationName,
        description: `Take ${formData.dosage} of ${formData.medicationName}`,
        type: 'medication' as const,
        scheduledFor,
        isRecurring: formData.frequency !== 'custom',
        recurrence,
        isActive: true,
        priority: 'high' as const,
        category: 'health',
        tags: ['medication', 'health'],
        notificationSettings: {
          enabled: true,
          sound: formData.reminderSound,
          vibration: formData.vibration,
          push: true,
          email: false,
          sms: false,
          advanceNotice: 5
        },
        metadata: {
          medicationName: formData.medicationName,
          dosage: formData.dosage,
          reminderTimes: formData.reminderTimes,
          frequency: formData.frequency
        }
      };

      if (editingReminder?.backendReminderId) {
        // Update existing reminder
        await notificationService.updateReminder(editingReminder.backendReminderId, reminderPayload);
        toast.success('Reminder updated successfully');
      } else {
        // Create new reminder
        await createReminderMutation.mutate(reminderPayload);
        toast.success('Reminder created successfully');
      }

      // Refetch reminders to get updated data
      remindersQuery.refetch();
      resetForm();
    } catch (error) {
      toast.error('Failed to save reminder');
      console.error('Submit reminder error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      medicationName: '',
      dosage: '',
      frequency: 'daily',
      reminderTimes: ['08:00'],
      reminderSound: true,
      vibration: true,
      customDays: []
    });
    setShowAddForm(false);
    setEditingReminder(null);
  };

  const updateReminderTimes = (frequency: MedicationReminder['frequency']) => {
    let times: string[] = [];
    switch (frequency) {
      case 'daily':
        times = ['08:00'];
        break;
      case 'twice-daily':
        times = ['08:00', '20:00'];
        break;
      case 'three-times':
        times = ['08:00', '14:00', '20:00'];
        break;
      case 'four-times':
        times = ['08:00', '12:00', '16:00', '20:00'];
        break;
      case 'weekly':
        times = ['08:00'];
        break;
      default:
        times = ['08:00'];
    }
    setFormData(prev => ({ ...prev, reminderTimes: times }));
  };

  const breadcrumbItems = [
    { label: 'Health Manager', href: '/health' },
    { label: 'Medications', href: '/health/medications' },
    { label: 'Reminders', icon: ReminderIcon }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <Header />

      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-white via-white to-primary/5 dark:from-gray-800 dark:via-gray-800 dark:to-primary/10 border-l-4 border-primary p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Medication Reminders 🔔
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Never miss a dose with smart medication alerts
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => remindersQuery.refetch()}
                variant="outline"
                className="rounded-xl"
                disabled={remindersQuery.loading}
              >
                <RefreshIcon className={`h-4 w-4 mr-2 ${remindersQuery.loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={() => setShowAddForm(true)}
                className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                style={{ backgroundColor: 'rgb(71, 189, 255)', color: 'white' }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Reminder
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-l-4 border-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 dark:text-green-400 mb-1">Active Reminders</p>
                  <p className="text-3xl font-bold text-green-800 dark:text-green-300">
                    {reminders.filter(r => r.isActive).length}
                  </p>
                </div>
                <ReminderIcon className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl bg-gradient-to-r from-blue-50 to-primary/10 dark:from-blue-900/20 dark:to-primary/20 border-l-4 border-primary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-primary mb-1">Today's Doses</p>
                  <p className="text-3xl font-bold text-primary">
                    {reminders.reduce((total, r) => r.isActive ? total + r.reminderTimes.length : total, 0)}
                  </p>
                </div>
                <TodayIcon className="h-8 w-8" style={{ color: 'rgb(71, 189, 255)' }} />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-l-4 border-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-700 dark:text-orange-400 mb-1">Next Reminder</p>
                  <p className="text-lg font-bold text-orange-800 dark:text-orange-300">
                    {reminders.find(r => r.isActive && r.nextReminder)?.nextReminder || 'None'}
                  </p>
                </div>
                <TimeIcon className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-l-4 border-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700 dark:text-purple-400 mb-1">Medications</p>
                  <p className="text-3xl font-bold text-purple-800 dark:text-purple-300">
                    {reminders.length}
                  </p>
                </div>
                <PillIcon className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reminders List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Reminders</h2>

          {remindersQuery.loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading reminders...</p>
              </div>
            </div>
          ) : remindersQuery.error ? (
            <Card className="rounded-2xl p-8 text-center">
              <p className="text-red-600 dark:text-red-400 mb-4">Failed to load reminders</p>
              <Button onClick={() => remindersQuery.refetch()} className="rounded-xl">
                <RefreshIcon className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </Card>
          ) : reminders.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {reminders.map((reminder) => (
                <Card 
                  key={reminder.id} 
                  className={`rounded-2xl hover:shadow-xl transition-all duration-300 border-2 ${
                    reminder.isActive ? 'border-green-200 bg-green-50/30 dark:bg-green-900/10' : 'border-gray-200'
                  }`}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${reminder.isActive ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                          <PillIcon className={`h-6 w-6 ${reminder.isActive ? 'text-green-600' : 'text-gray-500'}`} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {reminder.medicationName}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {reminder.dosage} • {frequencyOptions.find(f => f.value === reminder.frequency)?.label}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          reminder.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                        }`}
                      >
                        {reminder.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Reminder Times */}
                    <div className="p-4 rounded-xl bg-white/50 dark:bg-gray-900/20">
                      <div className="flex items-center gap-2 mb-3">
                        <AlarmIcon className="h-4 w-4 text-primary" />
                        <p className="font-semibold text-gray-900 dark:text-white">Reminder Times</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {reminder.reminderTimes.map((time, index) => (
                          <Badge key={index} variant="outline" className="bg-primary/10 text-primary border-primary/30">
                            {time}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Settings */}
                    <div className="flex justify-between items-center p-4 rounded-xl bg-white/50 dark:bg-gray-900/20">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${reminder.reminderSound ? 'bg-green-500' : 'bg-gray-400'}`} />
                          <span className="text-sm text-gray-600 dark:text-gray-400">Sound</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${reminder.vibration ? 'bg-green-500' : 'bg-gray-400'}`} />
                          <span className="text-sm text-gray-600 dark:text-gray-400">Vibration</span>
                        </div>
                      </div>
                    </div>

                    {/* Next Reminder & Last Taken */}
                    {reminder.isActive && (
                      <div className="space-y-2 p-4 rounded-xl bg-primary/5">
                        {reminder.nextReminder && (
                          <div className="flex items-center gap-2">
                            <ScheduleIcon className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">Next: {reminder.nextReminder}</span>
                          </div>
                        )}
                        {reminder.lastTaken && (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-white" />
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Last taken: {reminder.lastTaken}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleReminder(reminder.id)}
                        className={`flex-1 rounded-xl ${
                          reminder.isActive ? 'border-red-300 hover:bg-red-50 text-red-600' : 'border-green-300 hover:bg-green-50 text-green-600'
                        }`}
                      >
                        {reminder.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(reminder)}
                        className="flex-1 rounded-xl border-primary/30 hover:bg-primary/10 text-primary"
                      >
                        <EditIcon className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteReminder(reminder.id)}
                        className="px-3 rounded-xl border-destructive/30 hover:bg-destructive/10 text-destructive"
                      >
                        <DeleteIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="rounded-2xl p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="p-4 rounded-full mx-auto w-20 h-20 flex items-center justify-center mb-6" 
                     style={{ backgroundColor: 'rgb(71, 189, 255, 0.1)' }}>
                  <ReminderIcon className="h-10 w-10" style={{ color: 'rgb(71, 189, 255)' }} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Reminders Set
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Set up medication reminders to never miss a dose
                </p>
                <Button 
                  onClick={() => setShowAddForm(true)}
                  className="rounded-xl px-6"
                  style={{ backgroundColor: 'rgb(71, 189, 255)', color: 'white' }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Reminder
                </Button>
              </div>
            </Card>
          )}
        </div>
      </main>

      {/* Add/Edit Reminder Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <ReminderIcon className="h-5 w-5" style={{ color: 'rgb(71, 189, 255)' }} />
                  {editingReminder ? 'Edit Reminder' : 'Add New Reminder'}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetForm}
                >
                  <CloseIcon className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="medicationName">Medication Name *</Label>
                    <Input
                      id="medicationName"
                      value={formData.medicationName}
                      onChange={(e) => setFormData(prev => ({ ...prev, medicationName: e.target.value }))}
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dosage">Dosage *</Label>
                    <Input
                      id="dosage"
                      value={formData.dosage}
                      onChange={(e) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
                      placeholder="e.g., 10mg, 1 tablet"
                      required
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <Label>Frequency *</Label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => {
                      const frequency = e.target.value as MedicationReminder['frequency'];
                      setFormData(prev => ({ ...prev, frequency }));
                      updateReminderTimes(frequency);
                    }}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    {frequencyOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Reminder Times</Label>
                  <div className="space-y-2">
                    {formData.reminderTimes.map((time, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          type="time"
                          value={time}
                          onChange={(e) => {
                            const newTimes = [...formData.reminderTimes];
                            newTimes[index] = e.target.value;
                            setFormData(prev => ({ ...prev, reminderTimes: newTimes }));
                          }}
                          className="rounded-xl"
                        />
                        {formData.reminderTimes.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              const newTimes = formData.reminderTimes.filter((_, i) => i !== index);
                              setFormData(prev => ({ ...prev, reminderTimes: newTimes }));
                            }}
                            className="rounded-xl"
                          >
                            <DeleteIcon className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="reminderSound"
                      checked={formData.reminderSound}
                      onChange={(e) => setFormData(prev => ({ ...prev, reminderSound: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="reminderSound">Sound Alert</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="vibration"
                      checked={formData.vibration}
                      onChange={(e) => setFormData(prev => ({ ...prev, vibration: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="vibration">Vibration</Label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="flex-1 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 rounded-xl"
                    style={{ backgroundColor: 'rgb(71, 189, 255)', color: 'white' }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Saving...
                      </div>
                    ) : (
                      editingReminder ? 'Update Reminder' : 'Create Reminder'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmation.isOpen}
        onClose={confirmation.handleCancel}
        onConfirm={confirmation.handleConfirm}
        title={confirmation.title}
        message={confirmation.message}
        confirmText={confirmation.confirmText}
        cancelText={confirmation.cancelText}
        variant={confirmation.variant}
        icon={confirmation.icon}
      />
    </div>
  );
};

export default MedicationReminders;