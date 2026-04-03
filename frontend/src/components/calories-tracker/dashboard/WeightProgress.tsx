import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Progress } from '../../ui/progress';
import { Scale, TrendingDown, TrendingUp, Target } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../../ui/dialog';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { useAuth } from '../../../contexts/AuthContext';
import caloriesApi from '../../../services/caloriesApi';

interface WeightProgressProps {
  currentWeight: number;
  targetWeight: number;
  startWeight: number;
  onWeightLogged?: () => void;
}

const WeightProgress: React.FC<WeightProgressProps> = ({
  currentWeight,
  targetWeight,
  startWeight,
  onWeightLogged
}) => {
  const { isAuthenticated } = useAuth();
  const [showWeightDialog, setShowWeightDialog] = useState(false);
  const [weight, setWeight] = useState(currentWeight?.toString() || '');
  const [isLogging, setIsLogging] = useState(false);
  const totalToLose = startWeight - targetWeight;
  const alreadyLost = startWeight - currentWeight;
  const progress = totalToLose > 0 ? (alreadyLost / totalToLose) * 100 : 0;
  const remaining = currentWeight - targetWeight;
  const isGaining = targetWeight > startWeight;

  const getWeeklyChange = () => {
    // Weekly change calculation should come from actual weight data
    return 0; // No data available
  };

  const getProjectedDate = () => {
    const weeklyChange = Math.abs(getWeeklyChange());
    if (weeklyChange === 0) return null;
    
    const weeksRemaining = Math.abs(remaining) / weeklyChange;
    const projectedDate = new Date();
    projectedDate.setDate(projectedDate.getDate() + weeksRemaining * 7);
    
    return projectedDate;
  };

  return (
    <Card className="p-6 bg-white/5 border border-white/10">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Scale className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Weight Progress</h3>
              <p className="text-sm text-white/60">
                {isGaining ? 'Gaining journey' : 'Weight loss journey'}
              </p>
            </div>
          </div>
        </div>

        {/* Weight Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-white/60">Start</p>
            <p className="text-xl font-bold text-white">{startWeight}</p>
            <p className="text-xs text-white/60">kg</p>
          </div>
          <div className="border-x border-white/10">
            <p className="text-sm text-white/60">Current</p>
            <p className="text-xl font-bold text-teal-400">{currentWeight}</p>
            <p className="text-xs text-white/60">kg</p>
          </div>
          <div>
            <p className="text-sm text-white/60">Goal</p>
            <p className="text-xl font-bold text-white">{targetWeight}</p>
            <p className="text-xs text-white/60">kg</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Progress</span>
            <span className="text-sm font-medium text-teal-400">
              {Math.round(progress)}%
            </span>
          </div>

          <Progress value={progress} className="h-3" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {alreadyLost > 0 ? (
                <TrendingDown className="h-4 w-4 text-emerald-400" />
              ) : (
                <TrendingUp className="h-4 w-4 text-orange-400" />
              )}
              <span className="text-sm font-medium text-white">
                {Math.abs(alreadyLost).toFixed(1)}kg {alreadyLost > 0 ? 'lost' : 'gained'}
              </span>
            </div>
            <span className="text-sm text-white/60">
              {Math.abs(remaining).toFixed(1)}kg to go
            </span>
          </div>
        </div>

        {/* Weekly Change */}
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Weekly change</span>
            <span className={`text-sm font-medium ${getWeeklyChange() < 0 ? 'text-emerald-400' : 'text-orange-400'}`}>
              {getWeeklyChange() > 0 ? '+' : ''}{getWeeklyChange()}kg/week
            </span>
          </div>

          {getProjectedDate() && (
            <div className="mt-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60">Projected goal date</span>
                <span className="text-xs font-medium text-white">
                  {getProjectedDate()?.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Log Weight Button */}
        <Button
          className="w-full bg-white/10 border border-white/20 text-white hover:bg-white/20"
          onClick={() => setShowWeightDialog(true)}
        >
          <Scale className="h-4 w-4 mr-2" />
          Log Today's Weight
        </Button>
      </div>

      {/* Weight Entry Dialog */}
      <Dialog open={showWeightDialog} onOpenChange={setShowWeightDialog}>
        <DialogContent className="sm:max-w-md bg-gray-900 border border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">Log Your Weight</DialogTitle>
            <DialogDescription className="text-white/60">
              Enter your current weight to track your progress.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="weight" className="text-white">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="30"
                max="300"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Enter your weight"
              />
            </div>

            <div className="text-sm text-white/60">
              <p>Current weight: {currentWeight} kg</p>
              <p>Target weight: {targetWeight} kg</p>
            </div>
          </div>

          <DialogFooter>
            <Button
              className="bg-white/10 border border-white/20 text-white hover:bg-white/20"
              onClick={() => {
                setShowWeightDialog(false);
                setWeight(currentWeight?.toString() || '');
              }}
              disabled={isLogging}
            >
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
              onClick={async () => {
                const weightValue = parseFloat(weight);
                if (isNaN(weightValue) || weightValue < 30 || weightValue > 300) {
                  return;
                }

                setIsLogging(true);
                try {
                  if (isAuthenticated) {
                    // Log weight via API
                    await caloriesApi.logWeightEntry({
                      weight_kg: weightValue,
                      date: new Date().toISOString().split('T')[0]
                    });
                  } else {
                    // Save to localStorage for non-authenticated users
                    const weightHistory = JSON.parse(localStorage.getItem('weightHistory') || '[]');
                    weightHistory.push({
                      date: new Date().toISOString(),
                      weight: weightValue
                    });
                    localStorage.setItem('weightHistory', JSON.stringify(weightHistory));

                    // Update current weight in onboarding data
                    const onboardingData = localStorage.getItem('caloriesTrackerOnboarding');
                    if (onboardingData) {
                      const data = JSON.parse(onboardingData);
                      data.currentWeight = weightValue;
                      localStorage.setItem('caloriesTrackerOnboarding', JSON.stringify(data));
                    }
                  }

                  // Call callback to refresh data
                  if (onWeightLogged) {
                    onWeightLogged();
                  }

                  setShowWeightDialog(false);
                  setWeight(currentWeight?.toString() || '');
                } catch (error) {
                  console.error('Failed to log weight:', error);
                } finally {
                  setIsLogging(false);
                }
              }}
              disabled={isLogging || !weight || parseFloat(weight) === currentWeight}
            >
              {isLogging ? 'Logging...' : 'Log Weight'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default WeightProgress;