import React, { useState } from 'react';
import Icon from '@mdi/react';
import { 
  mdiCalendar,
  mdiChevronLeft,
  mdiChevronRight,
  mdiFire,
  mdiTrophy,
  mdiClockOutline,
  mdiDumbbell,
  mdiTarget,
  mdiRefresh,
  mdiShare,
  mdiChartLine,
  mdiTrendingUp,
  mdiClose,
  mdiPlus,
  mdiEye,
  mdiPlay
} from '@mdi/js';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Workout } from '../../../types/fitness';

interface WorkoutHistoryEntry extends Workout {
  intensity: 'low' | 'medium' | 'high';
  caloriesBurned?: number;
  personalRecords?: number;
  weightRecorded?: number;
  bodyFatPercentage?: number;
  restingHeartRate?: number;
  bloodPressure?: { systolic: number; diastolic: number };
  mood?: 'excellent' | 'good' | 'average' | 'poor';
  energyLevel?: 'high' | 'medium' | 'low';
  sleepHours?: number;
  waterIntake?: number; // in liters
}

interface WorkoutHistoryProps {
  workouts: WorkoutHistoryEntry[];
  currentStreak: number;
  longestStreak: number;
  totalWorkouts: number;
  onViewWorkout?: (workoutId: string) => void;
  onAddWorkout?: (date: Date) => void;
  weightHistory?: { date: Date; weight: number }[];
  loading?: boolean;
  error?: string | null;
}

const WorkoutHistory: React.FC<WorkoutHistoryProps> = ({
  workouts,
  currentStreak,
  longestStreak,
  totalWorkouts,
  onViewWorkout,
  onAddWorkout,
  weightHistory = [],
  loading = false,
  error = null
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedDayForDetails, setSelectedDayForDetails] = useState<Date | null>(null);
  
  // Safeguard function to prevent future date selection
  const safeSetSelectedDay = (date: Date) => {
    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (selectedDate <= todayDate) {
      setSelectedDayForDetails(date);
    }
  };

  // Calendar helpers
  const today = new Date();
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get workouts for a specific date (all entries including health-only)
  const getWorkoutsForDate = (date: Date) => {
    return workouts.filter(workout => 
      workout.date.toDateString() === date.toDateString()
    );
  };

  // Get actual workouts (with duration > 0) for calendar display
  const getActualWorkoutsForDate = (date: Date) => {
    return workouts.filter(workout => 
      workout.date.toDateString() === date.toDateString() && workout.duration > 0
    );
  };

  // Get weight record for a specific date
  const getWeightForDate = (date: Date) => {
    return weightHistory.find(record => 
      record.date.toDateString() === date.toDateString()
    );
  };

  // Get all data for a specific date
  const getDateData = (date: Date) => {
    const workoutsForDay = getWorkoutsForDate(date);
    const weightRecord = getWeightForDate(date);
    
    // Aggregate data from workouts
    const totalCalories = workoutsForDay.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
    const totalDuration = workoutsForDay.reduce((sum, w) => sum + w.duration, 0);
    const avgHeartRate = workoutsForDay.length > 0 ? 
      workoutsForDay.reduce((sum, w) => sum + (w.restingHeartRate || 0), 0) / workoutsForDay.length : 0;
    
    return {
      workouts: workoutsForDay,
      weight: weightRecord?.weight || workoutsForDay[0]?.weightRecorded,
      totalCalories,
      totalDuration,
      avgHeartRate: avgHeartRate > 0 ? Math.round(avgHeartRate) : null,
      mood: workoutsForDay[0]?.mood,
      energyLevel: workoutsForDay[0]?.energyLevel,
      sleepHours: workoutsForDay[0]?.sleepHours,
      waterIntake: workoutsForDay[0]?.waterIntake
    };
  };

  // Get intensity color
  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'low': return 'bg-emerald-500';
      case 'medium': return 'bg-teal-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-white/20';
    }
  };

  // Navigation
  const previousMonth = () => {
    setSelectedDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setSelectedDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Recent workouts for list view
  const recentWorkouts = workouts
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 10);

  // Show loading state
  if (loading) {
    return (
      <Card className="p-4 bg-white/10 backdrop-blur-xl border border-white/20">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-4"></div>
            <p className="text-white/60">Loading workout history...</p>
          </div>
        </div>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card className="p-4 bg-white/10 backdrop-blur-xl border border-white/20">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <Icon path={mdiRefresh} size={1} className="text-red-400" />
            </div>
            <h4 className="font-semibold mb-2">Unable to load workout history</h4>
            <p className="text-white/60 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-white/10 border border-white/20 text-white hover:bg-white/20">
              <Icon path={mdiRefresh} size={0.6} className="mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-white/10 backdrop-blur-xl border border-white/20">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon path={mdiCalendar} size={0.8} className="text-teal-400" />
          <h3 className="font-semibold text-white">Workout History</h3>
        </div>
        
        {/* View Toggle */}
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            onClick={() => setViewMode('calendar')}
            className={`h-7 px-2 text-xs ${viewMode === 'calendar' ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'}`}
          >
            Calendar
          </Button>
          <Button
            size="sm"
            onClick={() => setViewMode('list')}
            className={`h-7 px-2 text-xs ${viewMode === 'list' ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'}`}
          >
            Recent
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <div className="text-center p-2 bg-white/5 border border-white/10 rounded-lg">
          <Icon path={mdiFire} size={0.7} className="text-red-400 mx-auto mb-1" />
          <div className="text-lg font-bold text-white">{currentStreak}</div>
          <div className="text-xs text-white/60">Streak</div>
        </div>
        
        <div className="text-center p-2 bg-white/5 border border-white/10 rounded-lg">
          <Icon path={mdiTrophy} size={0.7} className="text-teal-400 mx-auto mb-1" />
          <div className="text-lg font-bold text-white">{longestStreak}</div>
          <div className="text-xs text-white/60">Best</div>
        </div>
        
        <div className="text-center p-2 bg-white/5 border border-white/10 rounded-lg">
          <Icon path={mdiDumbbell} size={0.7} className="text-emerald-500 mx-auto mb-1" />
          <div className="text-lg font-bold text-white">{totalWorkouts}</div>
          <div className="text-xs text-white/60">Total</div>
        </div>

        <div className="text-center p-2 bg-white/5 border border-white/10 rounded-lg">
          <Icon path={mdiChartLine} size={0.7} className="text-teal-400 mx-auto mb-1" />
          <div className="text-lg font-bold text-white">
            {workouts.length > 0 ? Math.round(workouts.reduce((sum, w) => sum + w.duration, 0) / workouts.length) : 0}
          </div>
          <div className="text-xs text-white/60">Avg Min</div>
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="mb-4 p-3 bg-white/5 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-white">This Week</h4>
          <div className="flex items-center gap-1">
            <Icon path={mdiTrendingUp} size={0.5} className="text-emerald-500" />
            <span className="text-xs text-emerald-400 dark:text-emerald-400 font-medium">
              {(() => {
                const thisWeekWorkouts = workouts.filter(w => {
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return w.date >= weekAgo;
                }).length;
                const lastWeekWorkouts = workouts.filter(w => {
                  const twoWeeksAgo = new Date();
                  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return w.date >= twoWeeksAgo && w.date < weekAgo;
                }).length;
                const change = thisWeekWorkouts - lastWeekWorkouts;
                return change > 0 ? `+${change}` : change === 0 ? '=' : change.toString();
              })()}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-white/60">Workouts: </span>
            <span className="font-medium text-white">
              {workouts.filter(w => {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return w.date >= weekAgo;
              }).length}
            </span>
          </div>
          <div>
            <span className="text-white/60">Time: </span>
            <span className="font-medium text-white">
              {Math.round(workouts.filter(w => {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return w.date >= weekAgo;
              }).reduce((sum, w) => sum + w.duration, 0) / 60 * 10) / 10}h
            </span>
          </div>
          <div>
            <span className="text-white/60">Intensity: </span>
            <span className="font-medium text-white">
              {(() => {
                const thisWeekWorkouts = workouts.filter(w => {
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return w.date >= weekAgo;
                });
                if (thisWeekWorkouts.length === 0) return 'None';
                const avgIntensity = thisWeekWorkouts.reduce((sum, w) => {
                  return sum + (w.intensity === 'high' ? 3 : w.intensity === 'medium' ? 2 : 1);
                }, 0) / thisWeekWorkouts.length;
                return avgIntensity >= 2.5 ? 'High' : avgIntensity >= 1.5 ? 'Med' : 'Low';
              })()}
            </span>
          </div>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <>
          {/* Calendar Navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button size="sm" onClick={previousMonth} className="bg-white/10 border border-white/20 text-white hover:bg-white/20">
              <Icon path={mdiChevronLeft} size={0.8} />
            </Button>

            <h4 className="text-lg font-semibold text-white">
              {monthNames[currentMonth]} {currentYear}
            </h4>

            <Button size="sm" onClick={nextMonth} className="bg-white/10 border border-white/20 text-white hover:bg-white/20">
              <Icon path={mdiChevronRight} size={0.8} />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="space-y-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-2">
              {dayNames.map(day => (
                <div key={day} className="text-center text-sm font-medium text-white/60 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-2">
              {/* Empty cells for days before month starts */}
              {Array.from({ length: firstDayOfWeek }, (_, i) => (
                <div key={`empty-${i}`} className="h-12"></div>
              ))}
              
              {/* Days of the month */}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const date = new Date(currentYear, currentMonth, day);
                const workoutsForDay = getWorkoutsForDate(date);
                const isToday = date.toDateString() === today.toDateString();
                const isSelected = selectedDayForDetails?.toDateString() === date.toDateString();
                // Compare dates without time to avoid timezone issues
                const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                const currentDate = new Date(currentYear, currentMonth, day);
                const isFuture = currentDate > todayDate;
                
                return (
                  <div
                    key={day}
                    className={`
                      relative h-12 rounded-lg border-2 transition-all
                      ${isFuture 
                        ? 'cursor-not-allowed opacity-40 border-white/10 bg-white/5' 
                        : 'cursor-pointer hover:border-teal-500/30'
                      }
                      ${!isFuture && isSelected 
                        ? 'border-teal-500 bg-teal-500/20 shadow-md' 
                        : !isFuture && isToday 
                        ? 'border-teal-500 bg-teal-500/20' 
                        : !isFuture 
                        ? 'border-white/20' 
                        : ''
                      }
                    `}
                    onClick={() => {
                      // Only allow selecting past dates and today
                      if (!isFuture) {
                        safeSetSelectedDay(date);
                      }
                    }}
                  >
                    <div className={`absolute top-1 left-2 text-sm font-medium ${
                      isFuture ? 'text-white/30' : 'text-white'
                    }`}>
                      {day}
                    </div>
                    
                    {/* Future date indicator */}
                    {isFuture && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-1 h-1 bg-white/30 rounded-full"></div>
                      </div>
                    )}
                    
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span>Low Intensity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-teal-500"></div>
              <span>Medium Intensity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>High Intensity</span>
            </div>
          </div>

          {/* Selected Day Details */}
          {selectedDayForDetails && (
            <div className="mt-8 p-6 bg-gradient-to-br from-white/5 to-white/10 rounded-xl border border-teal-500/20 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-500/20 rounded-lg">
                    <Icon path={mdiCalendar} size={1} className="text-teal-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl text-white">
                      {selectedDayForDetails.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric'
                      })}
                    </h4>
                    <p className="text-sm text-white/60">
                      {selectedDayForDetails.getFullYear()}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => setSelectedDayForDetails(null)}
                  className="bg-white/10 border border-teal-500/30 hover:border-teal-500 text-teal-400 hover:bg-teal-500/20"
                >
                  <Icon path={mdiClose} size={0.6} className="mr-1" />
                  Close
                </Button>
              </div>
              
              {(() => {
                const dateData = getDateData(selectedDayForDetails);
                // Check if selected date is in the future
                const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                const selectedDate = new Date(selectedDayForDetails.getFullYear(), selectedDayForDetails.getMonth(), selectedDayForDetails.getDate());
                const isFutureDate = selectedDate > todayDate;
                
                if (dateData.workouts.length === 0) {
                  return (
                    <div className="text-center py-6">
                      <Icon path={mdiCalendar} size={2} className="text-white/30 mx-auto mb-3" />
                      <p className="text-white/60 mb-4">
                        {isFutureDate ? 'Future date - no data available' : 'No activity recorded for this date'}
                      </p>
                      {!isFutureDate && (
                        <Button 
                          size="sm" 
                          className="bg-teal-500 text-white"
                          onClick={() => onAddWorkout?.(selectedDayForDetails)}
                        >
                          <Icon path={mdiPlus} size={0.6} className="mr-1" />
                          Add Workout
                        </Button>
                      )}
                    </div>
                  );
                }
                
                return (
                  <div className="space-y-4">
                    {/* Daily Summary Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-gradient-to-br from-teal-500/10 to-teal-500/20 p-4 rounded-xl border border-teal-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon path={mdiDumbbell} size={0.7} className="text-teal-400" />
                          <span className="text-xs font-medium text-white/60 uppercase tracking-wide">Workouts</span>
                        </div>
                        <div className="text-2xl font-bold text-teal-400">{dateData.workouts.length}</div>
                      </div>
                      <div className="bg-gradient-to-br from-red-500/10 to-red-500/20 p-4 rounded-xl border border-red-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon path={mdiFire} size={0.7} className="text-red-400" />
                          <span className="text-xs font-medium text-white/60 uppercase tracking-wide">Calories</span>
                        </div>
                        <div className="text-2xl font-bold text-red-400">{dateData.totalCalories}</div>
                      </div>
                      <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/20 p-4 rounded-xl border border-emerald-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon path={mdiClockOutline} size={0.7} className="text-emerald-400" />
                          <span className="text-xs font-medium text-white/60 uppercase tracking-wide">Duration</span>
                        </div>
                        <div className="text-2xl font-bold text-emerald-400">{(dateData.totalDuration / 60).toFixed(2)}h</div>
                      </div>
                      {dateData.weight && (
                        <div className="bg-gradient-to-br from-teal-500/10 to-teal-500/20 p-4 rounded-xl border border-teal-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon path={mdiTarget} size={0.7} className="text-teal-400" />
                            <span className="text-xs font-medium text-white/60 uppercase tracking-wide">Weight</span>
                          </div>
                          <div className="text-2xl font-bold text-teal-400">{dateData.weight?.toFixed(2)}</div>
                        </div>
                      )}
                    </div>

                    {/* Additional Health Data */}
                    {(dateData.mood || dateData.energyLevel || dateData.sleepHours || dateData.waterIntake || dateData.avgHeartRate) && (
                      <div className="p-4 bg-white/5 rounded-lg border border-white/20">
                        <h5 className="font-medium mb-3 text-sm">Health Metrics</h5>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                          {dateData.mood && (
                            <div className="flex items-center gap-2">
                              <span className="text-white/60">Mood:</span>
                              <Badge className="text-xs capitalize bg-white/10 text-white border border-white/20">{dateData.mood}</Badge>
                            </div>
                          )}
                          {dateData.energyLevel && (
                            <div className="flex items-center gap-2">
                              <span className="text-white/60">Energy:</span>
                              <Badge className="text-xs capitalize bg-white/10 text-white border border-white/20">{dateData.energyLevel}</Badge>
                            </div>
                          )}
                          {dateData.sleepHours && (
                            <div className="flex items-center gap-2">
                              <span className="text-white/60">Sleep:</span>
                              <span className="font-medium">{dateData.sleepHours?.toFixed(2)}h</span>
                            </div>
                          )}
                          {dateData.waterIntake && (
                            <div className="flex items-center gap-2">
                              <span className="text-white/60">Water:</span>
                              <span className="font-medium">{dateData.waterIntake?.toFixed(2)}L</span>
                            </div>
                          )}
                          {dateData.avgHeartRate && (
                            <div className="flex items-center gap-2">
                              <span className="text-white/60">Avg HR:</span>
                              <span className="font-medium">{dateData.avgHeartRate} bpm</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Workout Details */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                          <Icon path={mdiDumbbell} size={0.8} className="text-emerald-400" />
                        </div>
                        <h5 className="font-bold text-lg text-white">Workout Sessions ({dateData.workouts.length})</h5>
                      </div>
                      {dateData.workouts.map((workout, index) => (
                        <div 
                          key={workout.id}
                          className="p-6 bg-gradient-to-br from-white/5 to-white/10 rounded-xl border border-white/20 shadow-sm hover:shadow-md transition-all duration-300"
                        >
                          {/* Workout Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-teal-500/20 rounded-lg">
                                <Icon path={mdiPlay} size={0.8} className="text-teal-400" />
                              </div>
                              <div>
                                <h6 className="font-bold text-lg text-white">{workout.name}</h6>
                                <p className="text-sm text-white/60">
                                  Session {index + 1} of {dateData.workouts.length}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={`text-xs font-medium ${
                                workout.intensity === 'high' ? 'bg-red-500/10 text-red-400 border-destructive/20' :
                                workout.intensity === 'medium' ? 'bg-teal-500/20 text-teal-400 border-teal-500/20' :
                                'bg-emerald-500/10 text-emerald-400 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                              }`}>
                                {workout.intensity.toUpperCase()}
                              </Badge>
                              {workout.personalRecords && workout.personalRecords > 0 && (
                                <Badge variant="outline" className="text-xs font-medium bg-gradient-to-r from-primary/10 to-primary/20 text-teal-400 border-teal-500/20">
                                  🏆 {workout.personalRecords} PR{workout.personalRecords > 1 ? 's' : ''}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {/* Workout Stats */}
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                            <div className="bg-white/5 border border-white/10 p-3 rounded-lg flex items-center gap-2">
                              <Icon path={mdiClockOutline} size={0.6} className="text-teal-400" />
                              <div>
                                <div className="font-bold text-sm">{workout.duration} min</div>
                                <div className="text-xs text-white/60">Duration</div>
                              </div>
                            </div>
                            <div className="bg-white/5 border border-white/10 p-3 rounded-lg flex items-center gap-2">
                              <Icon path={mdiDumbbell} size={0.6} className="text-emerald-400" />
                              <div>
                                <div className="font-bold text-sm">{workout.exercises?.length || 8} exercises</div>
                                <div className="text-xs text-white/60">Exercises</div>
                              </div>
                            </div>
                            {workout.caloriesBurned && (
                              <div className="bg-white/5 border border-white/10 p-3 rounded-lg flex items-center gap-2">
                                <Icon path={mdiFire} size={0.6} className="text-red-400" />
                                <div>
                                  <div className="font-bold text-sm">{workout.caloriesBurned} cal</div>
                                  <div className="text-xs text-white/60">Burned</div>
                                </div>
                              </div>
                            )}
                            {workout.restingHeartRate && (
                              <div className="bg-white/5 border border-white/10 p-3 rounded-lg flex items-center gap-2">
                                <Icon path={mdiTarget} size={0.6} className="text-teal-400" />
                                <div>
                                  <div className="font-bold text-sm">{workout.restingHeartRate} bpm</div>
                                  <div className="text-xs text-white/60">Avg HR</div>
                                </div>
                              </div>
                            )}
                          </div>

                          {workout.notes && (
                            <div className="bg-gradient-to-r from-teal-500/10 to-teal-500/20 p-4 rounded-lg border-l-4 border-teal-500">
                              <div className="flex items-start gap-2">
                                <Icon path={mdiShare} size={0.6} className="text-teal-400 mt-0.5" />
                                <div>
                                  <h6 className="font-medium text-sm text-white mb-1">Workout Notes</h6>
                                  <p className="text-sm text-white/60 italic">
                                    "{workout.notes}"
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </>
      ) : (
        /* List View */
        <div className="space-y-4">
          {recentWorkouts.length > 0 ? (
            recentWorkouts.map((workout) => (
              <div
                key={workout.id}
                className="p-4 border border-white/20 rounded-lg transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold">{workout.name}</h4>
                    <Badge variant="outline" className={`text-xs ${
                      workout.intensity === 'high' ? 'bg-red-500/10 text-red-400 border-destructive/20' :
                      workout.intensity === 'medium' ? 'bg-teal-500/20 text-teal-400 border-teal-500/20' :
                      'bg-emerald-500/10 text-emerald-400 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                    }`}>
                      {workout.intensity} intensity
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-white/60">
                      {workout.date.toLocaleDateString()}
                    </div>
                    {onViewWorkout && (
                      <Button
                        size="sm"
                        onClick={() => onViewWorkout(workout.id)}
                        className="h-7 px-2 text-xs bg-white/10 border border-white/20 text-white hover:bg-white/20"
                      >
                        <Icon path={mdiEye} size={0.5} className="mr-1" />
                        View
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Icon path={mdiClockOutline} size={0.6} className="text-white/60" />
                    <span>{workout.duration} min</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Icon path={mdiDumbbell} size={0.6} className="text-white/60" />
                    <span>{workout.exercises.length} exercises</span>
                  </div>
                  
                  {workout.caloriesBurned && (
                    <div className="flex items-center gap-2">
                      <Icon path={mdiFire} size={0.6} className="text-white/60" />
                      <span>{workout.caloriesBurned} cal</span>
                    </div>
                  )}
                  
                  {workout.personalRecords && workout.personalRecords > 0 && (
                    <div className="flex items-center gap-2">
                      <Icon path={mdiTrophy} size={0.6} className="text-white/60" />
                      <span>{workout.personalRecords} PRs</span>
                    </div>
                  )}
                </div>
                
                {workout.notes && (
                  <p className="text-sm text-white/60 mt-2 italic">
                    "{workout.notes}"
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Icon path={mdiTarget} size={2} className="text-white/30 mx-auto mb-4" />
              <h4 className="font-semibold mb-2">No workouts yet</h4>
              <p className="text-white/60">
                Complete your first workout to start tracking your progress!
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default WorkoutHistory;