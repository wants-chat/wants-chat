import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Calendar,
  Dumbbell,
  Target,
  Clock,
  ChevronRight,
  Edit,
  Plus,
  Check
} from 'lucide-react';
import Icon from '@mdi/react';
import { mdiTrophy } from '@mdi/js';
import { Button } from '../../components/ui/button';
import { PlanDuration } from '../../types/fitness';
import { cn } from '../../lib/utils';
import { useWorkoutPlans } from '../../hooks/fitness/useWorkoutPlansNew';
import { toast } from '../../components/ui/sonner';

const WorkoutPlans: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentMode = searchParams.get('mode') || localStorage.getItem('workoutMode');
  const [selectedDuration, setSelectedDuration] = useState<PlanDuration | null>(null);
  
  // Helper function to create URLs with mode parameter
  const createUrlWithMode = (baseUrl: string) => {
    if (currentMode) {
      const separator = baseUrl.includes('?') ? '&' : '?';
      return `${baseUrl}${separator}mode=${currentMode}`;
    }
    return baseUrl;
  };
  
  // Duration-filtered workout plans (only API call we need)
  const {
    workoutPlans: filteredPlans,
    loading: isLoadingFilteredPlans,
    error: filteredPlansError,
    fetchWorkoutPlans: fetchFilteredPlans,
    createWorkoutPlan
  } = useWorkoutPlans(undefined, false); // Don't auto-fetch on mount

  // Fetch workout plans filtered by duration when duration is selected
  useEffect(() => {
    if (selectedDuration) {
      fetchFilteredPlans({ 
        page: 1, 
        limit: 10, 
        duration: selectedDuration,
        plan_type: currentMode as 'gym' | 'home' 
      });
    }
  }, [selectedDuration, fetchFilteredPlans, currentMode]);

  const durations: { value: PlanDuration; label: string; description: string }[] = [
    { value: 7, label: '7 Days', description: 'Quick start program' },
    { value: 15, label: '15 Days', description: 'Build initial habits' },
    { value: 30, label: '30 Days', description: 'Transform your routine' },
    { value: 90, label: '3 Months', description: 'See real results' },
    { value: 180, label: '6 Months', description: 'Complete transformation' },
  ];

  const handleCreateCustom = () => {
    if (!selectedDuration) {
      toast.error('Please select a duration first');
      return;
    }
    navigate(createUrlWithMode(`/fitness/custom-plan?duration=${selectedDuration}`));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2 text-white">Workout Plans</h1>
        <p className="text-white/60">
          Choose a plan that fits your schedule and goals
        </p>
      </div>

      {/* Duration Selection */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-white">Select Duration</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {durations.map((duration) => (
            <button
              key={duration.value}
              onClick={() => setSelectedDuration(duration.value)}
              className={cn(
                "p-4 rounded-xl border-2 transition-all text-center",
                selectedDuration === duration.value
                  ? "border-teal-400 bg-teal-500/20"
                  : "border-white/20 hover:border-teal-400/50 bg-white/10 backdrop-blur-xl"
              )}
            >
              <Calendar className="h-6 w-6 mx-auto mb-2 text-teal-400" />
              <div className="font-semibold text-white">{duration.label}</div>
              <div className="text-xs text-white/60 mt-1">
                {duration.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {!selectedDuration && (
        <div className="text-center py-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
          <Calendar className="h-12 w-12 mx-auto text-white/40 mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-white">Select a Duration</h2>
          <p className="text-white/60">
            Choose a workout plan duration above to see AI-recommended plans tailored to your goals.
          </p>
        </div>
      )}

      {selectedDuration && (
        <>
          {/* Duration-Filtered Workout Plans */}
          <div>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-teal-400" />
                <h2 className="text-xl font-semibold text-white">Available {selectedDuration}-Day {currentMode ? (currentMode.charAt(0).toUpperCase() + currentMode.slice(1)) : ''} Plans</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoadingFilteredPlans ? (
                  // Skeleton loading for filtered plans
                  [...Array(3)].map((_, index) => (
                    <div key={index} className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 animate-pulse">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-white/20 rounded-lg"></div>
                        <div className="h-6 bg-teal-500/30 rounded-full w-20"></div>
                      </div>
                      <div className="h-6 bg-white/20 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-white/10 rounded w-full mb-4"></div>
                      <div className="space-y-2 mb-4">
                        <div className="h-4 bg-white/10 rounded w-2/3"></div>
                        <div className="h-4 bg-white/10 rounded w-1/2"></div>
                        <div className="h-4 bg-white/10 rounded w-3/4"></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="h-8 bg-teal-500/30 rounded w-24"></div>
                        <div className="w-5 h-5 bg-white/20 rounded"></div>
                      </div>
                    </div>
                  ))
                ) : filteredPlansError ? (
                  // Error state
                  <div className="col-span-full text-center py-8">
                    <p className="text-red-400 mb-4">Failed to load {selectedDuration}-day workout plans</p>
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={() => fetchFilteredPlans({ page: 1, limit: 10, duration: selectedDuration, plan_type: currentMode as 'gym' | 'home' })}>
                      Try Again
                    </Button>
                  </div>
                ) : filteredPlans.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <p className="text-white/60">No {selectedDuration}-day plans available</p>
                  </div>
                ) : (
                  filteredPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className="group relative bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 hover:shadow-xl transition-all hover:scale-105 cursor-pointer"
                      onClick={() => navigate(createUrlWithMode(`/fitness/custom-plan/${plan.id}`))}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 rounded-lg bg-teal-500/20">
                            <Icon path={mdiTrophy} size={1} className="text-teal-400" />
                          </div>
                          <span className="text-xs bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-3 py-1 rounded-full font-medium">
                            {selectedDuration} Days
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold mb-2 text-white">{plan.name}</h3>
                        <p className="text-sm text-white/60 mb-4">
                          {plan.description || 'Workout plan'}
                        </p>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-white/80">
                            <Calendar className="h-4 w-4 text-teal-400" />
                            <span>{plan.workouts.length} workouts over {plan.duration} days</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-white/80">
                            <Target className="h-4 w-4 text-teal-400" />
                            <span>{plan.difficulty} • {plan.category}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-white/60">
                            <Clock className="h-4 w-4" />
                            <span>Created {new Date(plan.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-white/60 group-hover:bg-gradient-to-r group-hover:from-teal-500 group-hover:to-cyan-500 group-hover:text-white"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            View Plan
                          </Button>
                          <ChevronRight className="h-5 w-5 text-white/40 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </div>
                  ))
                )}
                
                {/* Create Custom Plan Card */}
                <div
                  className="group relative bg-white/5 backdrop-blur-xl rounded-2xl border-2 border-dashed border-white/30 p-6 hover:border-teal-400 transition-all cursor-pointer"
                  onClick={handleCreateCustom}
                >
                  <div className="relative text-center">
                    <div className="p-3 rounded-lg bg-white/10 mb-4 mx-auto w-fit">
                      <Plus className="h-6 w-6 text-white/60" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-white">Create Custom Plan</h3>
                    <p className="text-sm text-white/60">
                      Build your own {selectedDuration}-day workout plan from scratch
                    </p>
                  </div>
                </div>
              </div>
            </div>


          {/* Features */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
            <h3 className="text-lg font-semibold mb-4 text-white">What's Included</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-teal-400 mt-0.5" />
                <div>
                  <div className="font-medium text-white">Personalized Schedule</div>
                  <div className="text-sm text-white/60">
                    Workouts planned for your selected duration
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-teal-400 mt-0.5" />
                <div>
                  <div className="font-medium text-white">Exercise Instructions</div>
                  <div className="text-sm text-white/60">
                    Detailed guides for every movement
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-teal-400 mt-0.5" />
                <div>
                  <div className="font-medium text-white">Progress Tracking</div>
                  <div className="text-sm text-white/60">
                    Monitor your improvements over time
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WorkoutPlans;