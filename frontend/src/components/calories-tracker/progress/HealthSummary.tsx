import React from 'react';
import { Card } from '../../ui/card';
import Icon from '@mdi/react';
import { 
  mdiHeartPulse, 
  mdiScaleBalance, 
  mdiTrendingUp, 
  mdiCalendarMonth,
  mdiChartLine,
  mdiTarget,
  mdiWater,
  mdiFire
} from '@mdi/js';

interface HealthSummaryProps {
  weightData: {
    currentWeight: number;
    startWeight: number;
    goalWeight: number;
    weightChange: number;
  };
  calorieStats: {
    avgDaily: number;
    onTarget: number;
    totalDays: number;
  };
}

const HealthSummary: React.FC<HealthSummaryProps> = ({
  weightData,
  calorieStats
}) => {
  const { currentWeight, startWeight, goalWeight, weightChange } = weightData;
  const { avgDaily, onTarget, totalDays } = calorieStats;

  // Helper function to safely format numbers
  const safeToFixed = (value: number, decimals: number = 1): string => {
    if (value === null || value === undefined || isNaN(value) || !isFinite(value)) return '0';
    return value.toFixed(decimals);
  };

  // Calculate health metrics with safe defaults
  const bmi = currentWeight && currentWeight > 0 ? currentWeight / ((170 / 100) ** 2) : 0; // Using default height
  const weightDiff = (startWeight || 0) - (goalWeight || 0);
  const weightProgress = weightDiff !== 0 ? Math.abs((weightChange || 0) / weightDiff) * 100 : 0;
  const isWeightLoss = (goalWeight || 0) < (startWeight || 0);
  const remainingWeight = Math.abs((currentWeight || 0) - (goalWeight || 0));
  
  // BMI category
  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { text: 'Underweight', color: 'text-blue-600' };
    if (bmi < 25) return { text: 'Normal', color: 'text-green-600' };
    if (bmi < 30) return { text: 'Overweight', color: 'text-orange-600' };
    return { text: 'Obese', color: 'text-red-600' };
  };
  
  const bmiCategory = getBMICategory(bmi);

  return (
    <Card className="p-6 bg-white/5 border border-white/10">
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Icon path={mdiHeartPulse} size={1} className="text-teal-400" />
          Health Summary
        </h3>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* BMI */}
          <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Icon path={mdiScaleBalance} size={0.8} className="text-blue-400" />
              <span className="text-sm font-medium text-blue-400">BMI</span>
            </div>
            <p className="text-xl font-bold text-blue-400">{safeToFixed(bmi)}</p>
            <p className="text-xs text-white/60">{bmiCategory.text}</p>
          </div>

          {/* Weight Progress */}
          <div className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Icon path={mdiChartLine} size={0.8} className="text-emerald-400" />
              <span className="text-sm font-medium text-emerald-400">Progress</span>
            </div>
            <p className="text-xl font-bold text-emerald-400">{safeToFixed(Math.min(weightProgress, 100), 0)}%</p>
            <p className="text-xs text-white/60">{safeToFixed(remainingWeight)}kg to go</p>
          </div>

          {/* Calorie Consistency */}
          <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Icon path={mdiTarget} size={0.8} className="text-orange-400" />
              <span className="text-sm font-medium text-orange-400">On Target</span>
            </div>
            <p className="text-xl font-bold text-orange-400">{onTarget || 0}%</p>
            <p className="text-xs text-white/60">Days in range</p>
          </div>

          {/* Tracking Days */}
          <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Icon path={mdiCalendarMonth} size={0.8} className="text-purple-400" />
              <span className="text-sm font-medium text-purple-400">Active Days</span>
            </div>
            <p className="text-xl font-bold text-purple-400">{totalDays || 0}</p>
            <p className="text-xs text-white/60">Tracking days</p>
          </div>
        </div>

        {/* Health Insights */}
        <div className="space-y-4">
          <h4 className="font-medium text-white">Health Insights</h4>

          <div className="space-y-3">
            {/* Weight Trend */}
            <div className="flex items-start gap-3 p-3 bg-white/5 border border-white/10 rounded-lg">
              <div className="p-2 bg-teal-500/20 rounded-full">
                <Icon
                  path={isWeightLoss ? mdiTrendingUp : mdiTrendingUp}
                  size={0.8}
                  className={weightChange !== 0 ? 'text-teal-400' : 'text-white/40'}
                />
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">
                  {weightChange === 0
                    ? 'Weight Maintained'
                    : `${safeToFixed(Math.abs(weightChange || 0))}kg ${(weightChange || 0) > 0 ? 'Gained' : 'Lost'}`
                  }
                </p>
                <p className="text-sm text-white/60">
                  {weightChange === 0
                    ? 'Your weight has remained stable'
                    : `Since starting your ${isWeightLoss ? 'weight loss' : 'weight gain'} journey`
                  }
                </p>
              </div>
            </div>

            {/* Calorie Tracking Insight */}
            <div className="flex items-start gap-3 p-3 bg-white/5 border border-white/10 rounded-lg">
              <div className="p-2 bg-teal-500/20 rounded-full">
                <Icon path={mdiFire} size={0.8} className="text-teal-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">Average Daily Intake</p>
                <p className="text-sm text-white/60">
                  {avgDaily > 0
                    ? `${safeToFixed(avgDaily, 0)} calories per day on average`
                    : 'Start logging calories to see your average intake'
                  }
                </p>
              </div>
            </div>

            {/* BMI Insight */}
            <div className="flex items-start gap-3 p-3 bg-white/5 border border-white/10 rounded-lg">
              <div className="p-2 bg-teal-500/20 rounded-full">
                <Icon path={mdiScaleBalance} size={0.8} className="text-teal-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">BMI Status</p>
                <p className="text-sm text-white/60">
                  Your BMI of {safeToFixed(bmi)} is in the {bmiCategory.text.toLowerCase()} range
                  {bmi >= 18.5 && bmi < 25 ? '. Keep up the great work!' : '. Consider consulting a healthcare professional.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default HealthSummary;