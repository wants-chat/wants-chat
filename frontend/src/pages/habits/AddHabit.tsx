// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Plus, X, Bell, Target } from 'lucide-react';
import Header from '../../components/landing/Header';
import { useAuth } from '../../contexts/AuthContext';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { GlassCard } from '../../components/ui/GlassCard';
import { useCreateHabit, CreateHabitData } from '../../hooks';
import { useHabit, useUpdateHabit } from '../../hooks/habits/useHabits';
import { toast } from '../../components/ui/sonner';
import { useConfirmation } from '../../hooks/useConfirmation';
import ConfirmationModal from '../../components/ui/confirmation-modal';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import type { HabitForm } from '../../types/habits';
import { HABIT_CATEGORIES, HABIT_COLORS, WEEK_DAYS, HABIT_UNITS } from '../../types/habits';
import {
  Flag,
  CalendarToday,
  NotificationsActive,
  Save,
  Check,
  Warning as AlertCircle
} from '@mui/icons-material';

// Types are imported from '../../types/habits'

const AddHabit: React.FC = () => {
  const navigate = useNavigate();
  const { id: habitId } = useParams<{ id: string }>();
  const isEditMode = !!habitId;
  const { isAuthenticated, user } = useAuth();
  const { mutate: createHabit, loading: creating, error: createError } = useCreateHabit();
  const { mutate: updateHabit, loading: updating, error: updateError } = useUpdateHabit();
  const { data: existingHabit, loading: loadingHabit, error: habitError } = useHabit(habitId || null);
  
  // Debug logging
  useEffect(() => {
    if (isEditMode) {
      console.log('Edit mode - Habit ID:', habitId);
      console.log('Loading habit:', loadingHabit);
      console.log('Habit data:', existingHabit);
      console.log('Habit error:', habitError);
    }
  }, [isEditMode, habitId, loadingHabit, existingHabit, habitError]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentReminder, setCurrentReminder] = useState('');

  // Confirmation modal hook
  const confirmation = useConfirmation();
  
  const [formData, setFormData] = useState<HabitForm>({
    name: '',
    category: '',
    description: '',
    time: '',
    reminders: [],
    priority: 'medium',
    frequency: [],
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    dailyGoal: '1',
    extraGoal: '',
    color: '#47bdff',
    goalType: 'measurable', // Always measurable
    targetValue: '',
    targetUnit: 'times'
  });

  const [errors, setErrors] = useState<Partial<HabitForm>>({});

  // Populate form with existing habit data when in edit mode
  useEffect(() => {
    if (isEditMode && existingHabit) {
      console.log('Existing habit data:', existingHabit);
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      // Use camelCase (API response) with fallback to snake_case (legacy)
      const frequencyType = existingHabit.frequencyType ?? existingHabit.frequency_type;
      const weeklyDays = existingHabit.weeklyDays ?? existingHabit.weekly_days;
      const reminderTime = existingHabit.reminderTime ?? existingHabit.reminder_time;
      const startDate = existingHabit.startDate ?? existingHabit.start_date;
      const endDate = existingHabit.endDate ?? existingHabit.end_date;
      const targetCount = existingHabit.targetCount ?? existingHabit.target_count;
      const targetValue = existingHabit.targetValue ?? existingHabit.target_value;
      const targetUnit = existingHabit.targetUnit ?? existingHabit.target_unit;

      // Convert weekly_days numbers back to day names if needed
      let frequency: string[] = [];
      if (frequencyType === 'daily') {
        frequency = [...dayNames]; // All days for daily habits
      } else if (frequencyType === 'weekly' && weeklyDays) {
        // Handle both array of numbers and array of strings
        const weeklyDaysArray = Array.isArray(weeklyDays)
          ? weeklyDays
          : JSON.parse(weeklyDays || '[]');
        frequency = weeklyDaysArray.map((dayNum: number | string) => {
          const index = typeof dayNum === 'number' ? dayNum : parseInt(String(dayNum));
          return dayNames[index] || 'Monday';
        });
      }

      setFormData({
        name: existingHabit.name || '',
        category: existingHabit.category || '',
        description: existingHabit.description || '',
        time: reminderTime || '',
        reminders: reminderTime ? [reminderTime] : [],
        priority: 'medium', // Priority not stored in backend, using default
        frequency: frequency,
        startDate: startDate ? new Date(startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        endDate: endDate ? new Date(endDate).toISOString().split('T')[0] : '',
        dailyGoal: targetCount?.toString() || '1',
        extraGoal: targetValue?.toString() || '',
        color: existingHabit.color || '#47bdff',
        goalType: 'measurable', // Always measurable
        targetValue: targetValue?.toString() || '1',
        targetUnit: targetUnit || 'times'
      });
    }
  }, [isEditMode, existingHabit]);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Use constants from types/habits
  const categories = [...HABIT_CATEGORIES];
  const habitColors = [...HABIT_COLORS];
  const weekDays = [...WEEK_DAYS];

  const handleInputChange = (field: keyof HabitForm, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const toggleWeekDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      frequency: prev.frequency.includes(day)
        ? prev.frequency.filter(d => d !== day)
        : [...prev.frequency, day]
    }));
  };

  const addReminder = () => {
    if (currentReminder && !formData.reminders.includes(currentReminder)) {
      handleInputChange('reminders', [...formData.reminders, currentReminder]);
      setCurrentReminder('');
    }
  };

  const removeReminder = (reminder: string) => {
    handleInputChange('reminders', formData.reminders.filter(r => r !== reminder));
  };

  const validateForm = () => {
    const newErrors: Partial<HabitForm> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Habit name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (formData.frequency.length === 0) {
      newErrors.frequency = ['Select at least one day'];
    }

    if (!formData.time) {
      newErrors.time = 'Preferred time is required';
    }

    // Always validate target value and unit (all habits are measurable)
    if (!formData.targetValue || parseFloat(formData.targetValue) <= 0) {
      newErrors.targetValue = 'Target value is required';
    }
    if (!formData.targetUnit) {
      newErrors.targetUnit = 'Unit is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // Determine frequency type based on selected days
      let frequency_type: 'daily' | 'weekly' | 'monthly' = 'daily';
      let weekly_days: number[] | undefined = undefined;
      
      if (formData.frequency.length === 7 || formData.frequency.length === 0) {
        frequency_type = 'daily';
      } else if (formData.frequency.length > 0) {
        frequency_type = 'weekly';
        // Convert day names to numbers (0=Sunday, 1=Monday, etc.)
        const dayMap: Record<string, number> = {
          'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
          'Thursday': 4, 'Friday': 5, 'Saturday': 6
        };
        weekly_days = formData.frequency.map(day => dayMap[day] ?? 1);
      }

      // Create habit data object - Always include target_value and target_unit
      const habitData: any = {
        name: formData.name,
        description: formData.description || undefined,
        frequency_type: frequency_type,
        target_count: parseInt(formData.dailyGoal) || 1,
        weekly_days: weekly_days, // For weekly habits (as numbers)
        // Always send target_value and target_unit (all habits are measurable)
        target_value: parseFloat(formData.targetValue) || 1,
        target_unit: formData.targetUnit || 'times',
        category: formData.category,
        color: formData.color || '#8b5cf6',
        icon: existingHabit?.icon || 'check-circle',
        reminder_enabled: !!formData.time,
        reminder_time: formData.time || undefined,
        start_date: formData.startDate,
        end_date: formData.endDate || undefined
      };

      if (isEditMode && habitId) {
        // Update existing habit
        await updateHabit({ id: habitId, data: habitData });
      } else {
        // Create new habit
        await createHabit(habitData);
      }
      
      setShowSuccess(true);
      toast.success(isEditMode ? 'Habit updated successfully!' : 'Habit created successfully!');
      setTimeout(() => {
        navigate('/habit-planner');
      }, 2000);
    } catch (error) {
      console.error(isEditMode ? 'Failed to update habit:' : 'Failed to create habit:', error);
      toast.error(isEditMode ? 'Failed to update habit. Please try again.' : 'Failed to create habit. Please try again.');
    }
  };

  const handleCancel = async () => {
    // Check if form has been modified
    const hasChanges = formData.name.trim() !== '' ||
                      formData.description.trim() !== '' ||
                      formData.category !== '' ||
                      formData.frequency.length > 0 ||
                      formData.reminders.length > 0;

    if (hasChanges && !isEditMode) {
      const confirmed = await confirmation.showConfirmation({
        title: 'Discard Changes',
        message: 'You have unsaved changes. Are you sure you want to leave without saving?',
        confirmText: 'Discard Changes',
        cancelText: 'Continue Editing',
        variant: 'default'
      });

      if (!confirmed) return;
    }

    navigate('/habit-planner');
  };

  // Show loading state when fetching existing habit
  if (isEditMode && loadingHabit) {
    return (
      <div className="min-h-screen relative">
        <BackgroundEffects />
        <Header />
        <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto"></div>
            <p className="mt-4 text-white/60">Loading habit details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if failed to fetch habit
  if (isEditMode && habitError) {
    return (
      <div className="min-h-screen relative">
        <BackgroundEffects />
        <Header />
        <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Failed to load habit</h2>
            <p className="text-white/60 mb-4">{habitError || 'Unable to fetch habit details'}</p>
            <Button onClick={() => navigate('/habit-planner')} className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600">
              Back to Habits
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects />
      <Header />
      <div className="relative z-10">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            className="border border-white/20 hover:bg-white/10"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Target className="h-6 w-6 text-teal-400" />
              {isEditMode ? 'Edit Habit' : 'Add New Habit'}
            </h1>
            <p className="text-sm text-white/60 mt-1">
              {isEditMode ? 'Update your habit details' : 'Create a new habit to track'}
            </p>
          </div>
        </div>

        {/* Not Authenticated */}
        {!isAuthenticated && (
          <Card className="rounded-2xl p-12 text-center bg-white/10 backdrop-blur-xl border border-white/20">
            <div className="flex flex-col items-center">
              <Target className="h-16 w-16 text-white/20 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Please log in
              </h3>
              <p className="text-white/60 mb-6">
                You need to be logged in to create habits.
              </p>
              <Button
                onClick={() => navigate('/login')}
                className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600"
              >
                Go to Login
              </Button>
            </div>
          </Card>
        )}

        {isAuthenticated && (
          <>
            {showSuccess && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-400" />
                  <div>
                    <h4 className="text-sm font-semibold text-green-300">Success!</h4>
                    <p className="text-sm text-green-400/80">
                      Habit has been {isEditMode ? 'updated' : 'created'} successfully. Redirecting...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Create/Update Error */}
            {(createError || updateError) && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <X className="h-5 w-5 text-red-400" />
                  <div>
                    <h4 className="text-sm font-semibold text-red-300">Error {isEditMode ? 'updating' : 'creating'} habit</h4>
                    <p className="text-sm text-red-400/80">{createError || updateError}</p>
                  </div>
                </div>
              </div>
            )}

        {/* Habit Details - Basic Info & Goals Combined */}
        <GlassCard className="mb-8">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-teal-400" />
              Habit Details
            </h3>
            <p className="text-sm text-white/60 mt-1">Define your habit and set your goals</p>
          </div>
          <div className="space-y-6">
            {/* Name & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name" className="text-sm font-semibold text-white">
                  Habit Name <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Morning Meditation"
                  className={`mt-1 h-12 rounded-xl bg-white/10 backdrop-blur-xl border-white/20 text-white placeholder:text-white/40 ${errors.name ? 'border-red-400' : ''}`}
                />
                {errors.name && <p className="text-sm text-red-400 mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="category" className="text-sm font-semibold text-white">
                  Category <span className="text-red-400">*</span>
                </Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger id="category" className={`mt-1 h-12 rounded-xl bg-white/10 backdrop-blur-xl border-white/20 text-white ${errors.category ? 'border-red-400' : ''}`}>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-teal-800/90 border-teal-400/30 text-white">
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat} className="text-white hover:bg-white/10">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-sm text-red-400 mt-1">{errors.category}</p>}
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-sm font-semibold text-white">
                Description
              </Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your habit and why it's important"
                className="mt-1 h-12 rounded-xl bg-white/10 backdrop-blur-xl border-white/20 text-white placeholder:text-white/40"
              />
            </div>

            {/* Target Goal - Always Measurable */}
            <div className="p-4 bg-teal-500/10 rounded-xl border border-teal-500/20">
              <Label className="text-sm font-semibold mb-3 block text-white">Target Goal</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="targetValue" className="text-sm text-white/60">
                    Target Value <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="targetValue"
                    type="number"
                    min="1"
                    step="1"
                    value={formData.targetValue}
                    onChange={(e) => handleInputChange('targetValue', e.target.value)}
                    placeholder="e.g., 4000"
                    className={`mt-1 h-12 rounded-xl bg-white/10 backdrop-blur-xl border-white/20 text-white placeholder:text-white/40 ${errors.targetValue ? 'border-red-400' : ''}`}
                  />
                  {errors.targetValue && <p className="text-sm text-red-400 mt-1">{errors.targetValue}</p>}
                </div>
                <div>
                  <Label htmlFor="targetUnit" className="text-sm text-white/60">
                    Unit <span className="text-red-400">*</span>
                  </Label>
                  <Select value={formData.targetUnit} onValueChange={(value) => handleInputChange('targetUnit', value)}>
                    <SelectTrigger id="targetUnit" className={`mt-1 h-12 rounded-xl bg-white/10 backdrop-blur-xl border-white/20 text-white ${errors.targetUnit ? 'border-red-400' : ''}`}>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent className="bg-teal-800/90 border-teal-400/30 text-white">
                      <div className="px-2 py-1.5 text-xs font-semibold text-white/40 uppercase">Count</div>
                      {HABIT_UNITS.count.map(unit => (
                        <SelectItem key={unit.value} value={unit.value} className="text-white hover:bg-white/10">{unit.label}</SelectItem>
                      ))}
                      <div className="px-2 py-1.5 text-xs font-semibold text-white/40 uppercase mt-2">Volume</div>
                      {HABIT_UNITS.volume.map(unit => (
                        <SelectItem key={unit.value} value={unit.value} className="text-white hover:bg-white/10">{unit.label}</SelectItem>
                      ))}
                      <div className="px-2 py-1.5 text-xs font-semibold text-white/40 uppercase mt-2">Distance</div>
                      {HABIT_UNITS.distance.map(unit => (
                        <SelectItem key={unit.value} value={unit.value} className="text-white hover:bg-white/10">{unit.label}</SelectItem>
                      ))}
                      <div className="px-2 py-1.5 text-xs font-semibold text-white/40 uppercase mt-2">Time</div>
                      {HABIT_UNITS.time.map(unit => (
                        <SelectItem key={unit.value} value={unit.value} className="text-white hover:bg-white/10">{unit.label}</SelectItem>
                      ))}
                      <div className="px-2 py-1.5 text-xs font-semibold text-white/40 uppercase mt-2">Weight/Calories</div>
                      {HABIT_UNITS.weight.map(unit => (
                        <SelectItem key={unit.value} value={unit.value} className="text-white hover:bg-white/10">{unit.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.targetUnit && <p className="text-sm text-red-400 mt-1">{errors.targetUnit}</p>}
                </div>
              </div>
              <p className="text-sm text-white/60 mt-3">
                Example: Drink <strong className="text-white">{formData.targetValue || '4000'} {formData.targetUnit || 'ml'}</strong> water daily
              </p>
            </div>

            {/* Color & Priority Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-semibold mb-3 block text-white">Habit Color</Label>
                <div className="flex gap-3 flex-wrap">
                  {habitColors.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleInputChange('color', color)}
                      className={`w-10 h-10 rounded-lg border-2 transition-all ${
                        formData.color === color ? 'border-white scale-110' : 'border-white/30'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="priority" className="text-sm font-semibold text-white">
                  Priority Level
                </Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value as 'low' | 'medium' | 'high')}>
                  <SelectTrigger id="priority" className="mt-1 h-12 rounded-xl bg-white/10 backdrop-blur-xl border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-teal-800/90 border-teal-400/30">
                    <SelectItem value="low" className="text-white hover:bg-white/10">
                      <div className="flex items-center gap-2">
                        <Flag className="h-4 w-4 text-green-400" />
                        Low Priority
                      </div>
                    </SelectItem>
                    <SelectItem value="medium" className="text-white hover:bg-white/10">
                      <div className="flex items-center gap-2">
                        <Flag className="h-4 w-4 text-yellow-400" />
                        Medium Priority
                      </div>
                    </SelectItem>
                    <SelectItem value="high" className="text-white hover:bg-white/10">
                      <div className="flex items-center gap-2">
                        <Flag className="h-4 w-4 text-red-400" />
                        High Priority
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Schedule & Frequency */}
        <GlassCard className="mb-8">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <CalendarToday className="h-5 w-5 text-teal-400" />
              Schedule & Frequency
            </h3>
            <p className="text-sm text-white/60 mt-1">When and how often to practice this habit</p>
          </div>
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-semibold mb-3 block text-white">
                Frequency <span className="text-red-400">*</span>
              </Label>
              <div className="flex gap-2 flex-wrap">
                {weekDays.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleWeekDay(day)}
                    className={`px-4 py-2 rounded-xl border-2 transition-all ${
                      formData.frequency.includes(day)
                        ? 'border-teal-400 bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                        : 'border-white/20 text-white/60 hover:border-teal-400 hover:text-white'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
              {errors.frequency && <p className="text-sm text-red-400 mt-1">{errors.frequency[0]}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="time" className="text-sm font-semibold text-white">
                  Preferred Time <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  className={`mt-1 h-12 rounded-xl bg-white/10 backdrop-blur-xl border-white/20 text-white ${errors.time ? 'border-red-400' : ''}`}
                />
                {errors.time && <p className="text-sm text-red-400 mt-1">{errors.time}</p>}
              </div>

              <div>
                <Label htmlFor="startDate" className="text-sm font-semibold text-white">
                  Start Date <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="mt-1 h-12 rounded-xl bg-white/10 backdrop-blur-xl border-white/20 text-white"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <Label htmlFor="endDate" className="text-sm font-semibold text-white">
                  End Date (Optional)
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className="mt-1 h-12 rounded-xl bg-white/10 backdrop-blur-xl border-white/20 text-white"
                  min={formData.startDate}
                />
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Reminders */}
        <GlassCard className="mb-8">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <NotificationsActive className="h-5 w-5 text-teal-400" />
              Reminders
            </h3>
            <p className="text-sm text-white/60 mt-1">Set reminder times for your habit</p>
          </div>
          <div>
            <div className="flex gap-2 mb-4">
              <Input
                type="time"
                value={currentReminder}
                onChange={(e) => setCurrentReminder(e.target.value)}
                placeholder="Add reminder time"
                className="flex-1 h-12 rounded-xl bg-white/10 backdrop-blur-xl border-white/20 text-white"
                onKeyPress={(e) => e.key === 'Enter' && addReminder()}
              />
              <Button
                type="button"
                onClick={addReminder}
                variant="outline"
                className="h-12 rounded-xl bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {formData.reminders.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.reminders.map(reminder => (
                  <Badge key={reminder} variant="secondary" className="flex items-center gap-1 py-1.5 bg-teal-500/20 text-teal-300 border-teal-500/30">
                    <Bell className="h-3 w-3" />
                    {reminder}
                    <button
                      type="button"
                      onClick={() => removeReminder(reminder)}
                      className="ml-1 hover:text-red-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </GlassCard>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="h-12 px-8 rounded-xl bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/20"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={creating || updating}
            className="h-12 px-8 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600 border-0"
          >
            {(creating || updating) ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditMode ? 'Update Habit' : 'Create Habit'}
              </>
            )}
          </Button>
          </div>
          </>
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
      </main>
      </div>
    </div>
  );
};

export default AddHabit;