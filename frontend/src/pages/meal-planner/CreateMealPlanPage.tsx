import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Plus, Clock, ChefHat } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useCreateMealPlan } from '../../hooks/useMealPlans';
import { CreateMealPlanDto } from '../../types/mealPlan';
import { toast } from '../../components/ui/use-toast';
import Header from '../../components/landing/Header';

const CreateMealPlanPage: React.FC = () => {
  const navigate = useNavigate();
  const [planName, setPlanName] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [selectedStartDate, setSelectedStartDate] = useState(new Date());

  const createMealPlan = useCreateMealPlan(() => {
    // On success, navigate back to meal planner
    navigate('/recipe-builder?tab=meal-plan');
  });

  // Initialize weekly meals structure
  const getWeekDates = (start: Date) => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates(selectedStartDate);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const handleCreatePlan = async () => {
    // Validate required fields
    if (!planName.trim()) {
      toast({
        title: 'Name Required',
        description: 'Please enter a name for your meal plan',
        variant: 'destructive',
      });
      return;
    }

    if (!planDescription.trim()) {
      toast({
        title: 'Description Required',
        description: 'Please enter a description for your meal plan',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Calculate end date (6 days after start date for a week)
      const endDate = new Date(selectedStartDate);
      endDate.setDate(endDate.getDate() + 6);

      const planData: CreateMealPlanDto = {
        name: planName.trim(),
        description: planDescription.trim(),
        planType: 'weekly',
        startDate: selectedStartDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        meals: [],
        tags: []
      };

      await createMealPlan.mutateAsync(planData);

      toast({
        title: 'Success',
        description: 'Meal plan created successfully!',
      });

      // Reset form
      setPlanName('');
      setPlanDescription('');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create meal plan',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900">
      <Header />

      {/* Page Title Bar */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/recipe-builder?tab=meal-plan')}
              className="rounded-full text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <ChefHat className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Create Meal Plan</h1>
                <p className="text-xs text-white/60">Plan your weekly meals</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
            <div className="p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2 text-white">Meal Plan Details</h2>
                <p className="text-white/60">
                  Enter the basic information for your meal plan
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">
                    Meal Plan Name *
                  </label>
                  <input
                    type="text"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    placeholder="e.g., Healthy Week Plan"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/50 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-white">
                    Description *
                  </label>
                  <textarea
                    value={planDescription}
                    onChange={(e) => setPlanDescription(e.target.value)}
                    placeholder="Add notes about this meal plan..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/50 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-white">
                    Week Start Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white" />
                    <input
                      type="date"
                      value={selectedStartDate.toISOString().split('T')[0]}
                      onChange={(e) => setSelectedStartDate(new Date(e.target.value))}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/50 focus:outline-none [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Week Preview */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
            <div className="p-8 space-y-6">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-white">
                  <Clock className="h-5 w-5 text-teal-400" />
                  Week Overview
                </h3>
                <p className="text-white/60 mb-6">
                  Your meal plan will cover the following week
                </p>
              </div>

              <div className="grid grid-cols-7 gap-4 text-center">
                {weekDates.map((date, index) => (
                  <div key={index} className="p-4 bg-white/10 border border-white/20 rounded-xl">
                    <div className="font-medium text-sm text-white">{dayNames[date.getDay()]}</div>
                    <div className="text-white/60 text-xs mt-1">
                      {date.getDate()}/{date.getMonth() + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Create Plan Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border-2 border-dashed border-white/20 hover:border-teal-400/50 transition-colors">
            <div className="p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mx-auto border border-teal-400/30">
                <Plus className="h-8 w-8 text-teal-400" />
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2 text-white">Create Your Meal Plan</h4>
                <p className="text-white/60 mb-6">
                  Create an empty meal plan and add recipes later through the edit functionality
                </p>
              </div>
              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => navigate('/recipe-builder?tab=meal-plan')}
                  className="px-8 bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePlan}
                  disabled={createMealPlan.loading}
                  className="px-8 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                >
                  {createMealPlan.loading ? 'Creating...' : 'Create Meal Plan'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateMealPlanPage;
