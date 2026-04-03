import React, { useState, useEffect } from 'react';
import Icon from '@mdi/react';
import {
  mdiScale,
  mdiRuler,
  mdiCalculator,
  mdiTrendingUp,
  mdiTrendingDown,
  mdiMinus,
  mdiPencil,
  mdiCheck,
  mdiClose,
  mdiRefresh,
  mdiDumbbell,
  mdiPlay,
  mdiEye
} from '@mdi/js';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { UserFitnessProfile, BMIData } from '../../../types/fitness';
import { bodyMeasurementsApiService } from '../../../services/bodyMeasurementsApi';
import { useConfirm } from '../../../contexts/ConfirmDialogContext';

interface FitnessMetricsProps {
  profile: UserFitnessProfile;
  currentBMI?: BMIData;
  weightHistory?: { date: Date; weight: number }[];
  currentPlan?: {
    name: string;
    duration: number;
    daysCompleted: number;
    totalDays: number;
    difficulty: string;
    nextWorkoutDate?: Date;
  };
  onUpdateMetrics?: (updates: { height?: number; weight?: number; targetWeight?: number }) => void;
  onQuickWeightUpdate?: (weight: number) => void;
  onViewPlan?: () => void;
  onStartWorkout?: () => void;
  loading?: boolean;
  error?: any;
}

const FitnessMetrics: React.FC<FitnessMetricsProps> = ({
  profile,
  currentBMI,
  weightHistory = [],
  currentPlan,
  onUpdateMetrics,
  onQuickWeightUpdate,
  onViewPlan,
  loading = false,
  error = null,
  onStartWorkout
}) => {
  const { alert } = useConfirm();
  const [isEditing, setIsEditing] = useState(false);
  const [editedMetrics, setEditedMetrics] = useState({
    height: profile.height || 0,
    weight: profile.weight || 0,
    targetWeight: profile.targetWeight || profile.weight || 0,
    bodyFat: 0, // Will be loaded from body measurements API
    chest: 0,
    waist: 0,
    hips: 0,
    biceps: 0,
    thighs: 0,
    calves: 0
  });
  const [quickWeight, setQuickWeight] = useState(profile.weight || 0);

  // Load latest body measurements when component mounts
  useEffect(() => {
    const loadBodyMeasurements = async () => {
      try {
        const latestMeasurements = await bodyMeasurementsApiService.getLatestMeasurements();
        
        setEditedMetrics(prev => ({
          ...prev,
          bodyFat: latestMeasurements.bodyFat || 0,
          chest: latestMeasurements.chest || 0,
          waist: latestMeasurements.waist || 0,
          hips: latestMeasurements.hips || 0,
          biceps: latestMeasurements.biceps || 0,
          thighs: latestMeasurements.thighs || 0,
          calves: latestMeasurements.calves || 0
        }));
      } catch (error) {
        console.error('Error loading body measurements:', error);
        // Continue with default values if API fails
      }
    };

    loadBodyMeasurements();
  }, []);

  const calculateBMI = (weight: number, height: number) => {
    const heightInM = height / 100;
    return weight / (heightInM * heightInM);
  };

  const getBMICategory = (bmi: number): BMIData['category'] => {
    if (bmi < 18.5) return 'underweight';
    if (bmi < 25) return 'normal';
    if (bmi < 30) return 'overweight';
    return 'obese';
  };

  const getBMIColor = (category: BMIData['category']) => {
    switch (category) {
      case 'underweight':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'normal':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'overweight':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'obese':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
    }
  };

  const getWeightTrend = () => {
    if (weightHistory.length < 2) return null;
    
    const recent = weightHistory.slice(-2);
    const change = recent[1].weight - recent[0].weight;
    
    if (Math.abs(change) < 0.1) return { trend: 'stable', change: 0, icon: mdiMinus };
    return {
      trend: change > 0 ? 'up' : 'down',
      change: Math.abs(change),
      icon: change > 0 ? mdiTrendingUp : mdiTrendingDown
    };
  };

  const handleSave = async () => {
    try {
      // Call profile API for height, weight, targetWeight
      const profileUpdates = {
        height: editedMetrics.height,
        weight: editedMetrics.weight,
        targetWeight: editedMetrics.targetWeight
      };
      onUpdateMetrics?.(profileUpdates);

      // Call body measurements API for weight, bodyFat, chest, waist, hips, biceps, thighs, calves
      const bodyMeasurementsData: any = {};
      
      if (editedMetrics.weight > 0) bodyMeasurementsData.weight = editedMetrics.weight;
      if (editedMetrics.bodyFat > 0) bodyMeasurementsData.bodyFat = editedMetrics.bodyFat;
      if (editedMetrics.chest > 0) bodyMeasurementsData.chest = editedMetrics.chest;
      if (editedMetrics.waist > 0) bodyMeasurementsData.waist = editedMetrics.waist;
      if (editedMetrics.hips > 0) bodyMeasurementsData.hips = editedMetrics.hips;
      if (editedMetrics.biceps > 0) bodyMeasurementsData.biceps = editedMetrics.biceps;
      if (editedMetrics.thighs > 0) bodyMeasurementsData.thighs = editedMetrics.thighs;
      if (editedMetrics.calves > 0) bodyMeasurementsData.calves = editedMetrics.calves;

      // Only call body measurements API if there are measurements to save
      if (Object.keys(bodyMeasurementsData).length > 0) {
        await bodyMeasurementsApiService.createBodyMeasurement({
          ...bodyMeasurementsData,
          measurementDate: new Date().toISOString(),
          notes: 'Updated from fitness profile'
        });
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving metrics:', error);
      await alert({
        title: 'Error Saving Metrics',
        message: 'Failed to save some measurements. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleCancel = () => {
    // Reset to original values (will reload body measurements from API)
    setEditedMetrics({
      height: profile.height || 0,
      weight: profile.weight || 0,
      targetWeight: profile.targetWeight || profile.weight || 0,
      bodyFat: editedMetrics.bodyFat, // Keep loaded values
      chest: editedMetrics.chest,
      waist: editedMetrics.waist,
      hips: editedMetrics.hips,
      biceps: editedMetrics.biceps,
      thighs: editedMetrics.thighs,
      calves: editedMetrics.calves
    });
    setIsEditing(false);
  };

  const handleQuickUpdate = () => {
    onQuickWeightUpdate?.(quickWeight);
  };

  const currentCalculatedBMI = calculateBMI(profile.weight, profile.height);
  const bmiCategory = getBMICategory(currentCalculatedBMI);
  const weightTrend = getWeightTrend();

  const targetWeightDiff = profile.targetWeight ? profile.weight - profile.targetWeight : 0;
  const progressToTarget = profile.targetWeight ? 
    Math.min(100, Math.max(0, (1 - Math.abs(targetWeightDiff) / Math.abs(profile.targetWeight - profile.weight)) * 100)) : 0;

  // Show loading state
  if (loading) {
    return (
      <Card className="p-5 bg-white/10 backdrop-blur-xl border border-white/20">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-white/60">Loading fitness metrics...</p>
          </div>
        </div>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card className="p-5 bg-white/10 backdrop-blur-xl border border-white/20">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <Icon path={mdiRefresh} size={1} className="text-red-400" />
            </div>
            <h4 className="font-semibold mb-2">Unable to load fitness metrics</h4>
            <p className="text-white/60 mb-4">{error.message || 'Failed to load profile data'}</p>
            <Button onClick={() => window.location.reload()} className="bg-white/10 border border-white/20 text-white hover:scale-105 transition-all duration-200">
              <Icon path={mdiRefresh} size={0.6} className="mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5 bg-white/10 backdrop-blur-xl border border-white/20">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Icon path={mdiScale} size={0.8} className="text-teal-400" />
          <h3 className="font-semibold text-white">Fitness Metrics</h3>
        </div>
        
        {!isEditing ? (
          <Button
            size="sm"
            onClick={() => setIsEditing(true)}
            className="h-8 px-3 bg-white/10 border border-white/20 text-white hover:scale-105 transition-all duration-200"
          >
            <Icon path={mdiPencil} size={0.6} className="mr-1 text-teal-400" />
            Edit
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleSave} className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white h-8 px-3">
              <Icon path={mdiCheck} size={0.6} className="mr-1" />
              Save
            </Button>
            <Button size="sm" onClick={handleCancel} className="h-8 px-3 bg-white/10 border border-white/20 text-white hover:scale-105 transition-all duration-200">
              <Icon path={mdiClose} size={0.6} className="mr-1" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {/* Current Weight */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-white/60">Weight</label>
          
          {isEditing ? (
            <div className="space-y-1">
              <Input
                type="number"
                value={editedMetrics.weight}
                onChange={(e) => setEditedMetrics({
                  ...editedMetrics,
                  weight: parseFloat(e.target.value) || 0
                })}
                step="0.1"
                className="text-lg font-bold h-8"
              />
              <span className="text-xs text-white/60">kg</span>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold text-white">{profile.weight?.toFixed(1) || '0.0'}</span>
                <span className="text-xs text-white/60">kg</span>
                {weightTrend && (
                  <Icon 
                    path={weightTrend.icon} 
                    size={0.5} 
                    className={
                      weightTrend.trend === 'up' ? 'text-red-400' :
                      weightTrend.trend === 'down' ? 'text-emerald-500' : 'text-white/40'
                    } 
                  />
                )}
              </div>
              
              {/* Quick Weight Update */}
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  value={quickWeight}
                  onChange={(e) => setQuickWeight(parseFloat(e.target.value) || 0)}
                  step="0.1"
                  className="text-xs h-6 flex-1"
                  placeholder="Update"
                />
                <Button size="sm" onClick={handleQuickUpdate} className="h-6 w-6 p-0">
                  <Icon path={mdiRefresh} size={0.4} />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Height */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-white/60">Height</label>
          
          {isEditing ? (
            <div className="space-y-1">
              <Input
                type="number"
                value={editedMetrics.height}
                onChange={(e) => setEditedMetrics({
                  ...editedMetrics,
                  height: parseFloat(e.target.value) || 0
                })}
                className="text-lg font-bold h-8"
              />
              <span className="text-xs text-white/60">cm</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold text-white">{profile.height}</span>
              <span className="text-xs text-white/60">cm</span>
            </div>
          )}
        </div>

        {/* BMI */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-white/60">BMI</label>
          
          <div className="space-y-1">
            <span className="text-lg font-bold text-white">{currentCalculatedBMI.toFixed(1)}</span>
            <Badge className={`text-xs px-2 py-0 ${getBMIColor(bmiCategory)}`}>
              {bmiCategory.charAt(0).toUpperCase() + bmiCategory.slice(1)}
            </Badge>
          </div>
        </div>

        {/* Target Weight */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-white/60">Target</label>
          
          {isEditing ? (
            <div className="space-y-1">
              <Input
                type="number"
                value={editedMetrics.targetWeight}
                onChange={(e) => setEditedMetrics({
                  ...editedMetrics,
                  targetWeight: parseFloat(e.target.value) || 0
                })}
                step="0.1"
                className="text-lg font-bold h-8"
              />
              <span className="text-xs text-white/60">kg</span>
            </div>
          ) : profile.targetWeight ? (
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold text-white">{profile.targetWeight.toFixed(1)}</span>
                <span className="text-xs text-white/60">kg</span>
              </div>
              
              {/* Progress to Target */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/60">Progress</span>
                  <span className="font-medium text-teal-400">
                    {targetWeightDiff > 0 ? `-${Math.abs(targetWeightDiff).toFixed(1)}` : `+${Math.abs(targetWeightDiff).toFixed(1)}`}kg
                  </span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressToTarget}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-white/60 text-xs">
              No target set
            </div>
          )}
        </div>

      </div>

      {/* Second row for body measurements */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
        {/* Body Fat Percentage */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-white/60">Body Fat</label>
          
          {isEditing ? (
            <div className="space-y-1">
              <Input
                type="number"
                value={editedMetrics.bodyFat}
                onChange={(e) => setEditedMetrics({
                  ...editedMetrics,
                  bodyFat: parseFloat(e.target.value) || 0
                })}
                step="0.1"
                className="text-lg font-bold h-8"
              />
              <span className="text-xs text-white/60">%</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold text-white">{editedMetrics.bodyFat.toFixed(1)}</span>
              <span className="text-xs text-white/60">%</span>
            </div>
          )}
        </div>

        {/* Chest */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-white/60">Chest</label>
          
          {isEditing ? (
            <div className="space-y-1">
              <Input
                type="number"
                value={editedMetrics.chest}
                onChange={(e) => setEditedMetrics({
                  ...editedMetrics,
                  chest: parseFloat(e.target.value) || 0
                })}
                step="0.1"
                className="text-lg font-bold h-8"
              />
              <span className="text-xs text-white/60">cm</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold text-white">{editedMetrics.chest.toFixed(1)}</span>
              <span className="text-xs text-white/60">cm</span>
            </div>
          )}
        </div>

        {/* Waist */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-white/60">Waist</label>
          
          {isEditing ? (
            <div className="space-y-1">
              <Input
                type="number"
                value={editedMetrics.waist}
                onChange={(e) => setEditedMetrics({
                  ...editedMetrics,
                  waist: parseFloat(e.target.value) || 0
                })}
                step="0.1"
                className="text-lg font-bold h-8"
              />
              <span className="text-xs text-white/60">cm</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold text-white">{editedMetrics.waist.toFixed(1)}</span>
              <span className="text-xs text-white/60">cm</span>
            </div>
          )}
        </div>
      </div>

      {/* Third row for remaining measurements */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
        {/* Hips */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-white/60">Hips</label>
          
          {isEditing ? (
            <div className="space-y-1">
              <Input
                type="number"
                value={editedMetrics.hips}
                onChange={(e) => setEditedMetrics({
                  ...editedMetrics,
                  hips: parseFloat(e.target.value) || 0
                })}
                step="0.1"
                className="text-lg font-bold h-8"
              />
              <span className="text-xs text-white/60">cm</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold text-white">{editedMetrics.hips.toFixed(1)}</span>
              <span className="text-xs text-white/60">cm</span>
            </div>
          )}
        </div>

        {/* Biceps */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-white/60">Biceps</label>
          
          {isEditing ? (
            <div className="space-y-1">
              <Input
                type="number"
                value={editedMetrics.biceps}
                onChange={(e) => setEditedMetrics({
                  ...editedMetrics,
                  biceps: parseFloat(e.target.value) || 0
                })}
                step="0.1"
                className="text-lg font-bold h-8"
              />
              <span className="text-xs text-white/60">cm</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold text-white">{editedMetrics.biceps.toFixed(1)}</span>
              <span className="text-xs text-white/60">cm</span>
            </div>
          )}
        </div>

        {/* Thighs */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-white/60">Thighs</label>
          
          {isEditing ? (
            <div className="space-y-1">
              <Input
                type="number"
                value={editedMetrics.thighs}
                onChange={(e) => setEditedMetrics({
                  ...editedMetrics,
                  thighs: parseFloat(e.target.value) || 0
                })}
                step="0.1"
                className="text-lg font-bold h-8"
              />
              <span className="text-xs text-white/60">cm</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold text-white">{editedMetrics.thighs.toFixed(1)}</span>
              <span className="text-xs text-white/60">cm</span>
            </div>
          )}
        </div>

        {/* Calves */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-white/60">Calves</label>
          
          {isEditing ? (
            <div className="space-y-1">
              <Input
                type="number"
                value={editedMetrics.calves}
                onChange={(e) => setEditedMetrics({
                  ...editedMetrics,
                  calves: parseFloat(e.target.value) || 0
                })}
                step="0.1"
                className="text-lg font-bold h-8"
              />
              <span className="text-xs text-white/60">cm</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold text-white">{editedMetrics.calves.toFixed(1)}</span>
              <span className="text-xs text-white/60">cm</span>
            </div>
          )}
        </div>
      </div>

      {/* Compact BMI Reference */}
      <div className="mt-5 p-3 bg-white/5 rounded-lg">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            <span className="text-white/60">Underweight</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-white/60">Normal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            <span className="text-white/60">Overweight</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-white/60">Obese</span>
          </div>
        </div>
      </div>

      {/* Current Plan Section */}
      {currentPlan && (
        <div className="mt-5">
          <div className="p-4 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-lg border border-teal-500/30">
            {/* Plan Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-teal-500/20">
                <Icon path={mdiDumbbell} size={0.8} className="text-teal-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-base text-white">{currentPlan.name}</h4>
                <p className="text-xs text-white/60">Current active plan</p>
              </div>
            </div>

            {/* Plan Details & Progress in one row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-teal-500/20 text-teal-400 border border-teal-500/30 text-xs">
                  {currentPlan.difficulty}
                </Badge>
                <Badge className="text-teal-400 border border-teal-500/30 bg-teal-500/10 text-xs">
                  {currentPlan.duration} days
                </Badge>
                <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs">
                  Active
                </Badge>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-sm font-medium text-teal-400">
                  {currentPlan.daysCompleted}/{currentPlan.totalDays}
                </div>
                <div className="text-xs text-white/60">
                  {Math.round((currentPlan.daysCompleted / currentPlan.totalDays) * 100)}%
                </div>
              </div>
            </div>

            {/* Compact Progress Bar */}
            <div className="mb-4">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all duration-300"
                  style={{ width: `${(currentPlan.daysCompleted / currentPlan.totalDays) * 100}%` }}
                />
              </div>
            </div>

            {/* Action Buttons & Next Workout */}
            <div className="flex items-center justify-between">
              <div className="text-xs">
                <p className="text-white/60 mb-1">Next workout</p>
                <p className="font-medium">
                  {currentPlan.nextWorkoutDate 
                    ? currentPlan.nextWorkoutDate.toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })
                    : 'Today'
                  }
                </p>
              </div>
              
              <div className="flex gap-2">
                {onStartWorkout && (
                  <Button 
                    size="sm" 
                    onClick={onStartWorkout}
                    className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white h-8 px-3"
                  >
                    <Icon path={mdiPlay} size={0.5} className="mr-1" />
                    Start
                  </Button>
                )}
                
                {onViewPlan && (
                  <Button
                    size="sm"
                    onClick={onViewPlan}
                    className="h-8 px-3 bg-white/10 border border-white/20 text-white hover:scale-105 transition-all duration-200"
                  >
                    <Icon path={mdiEye} size={0.5} className="mr-1" />
                    View
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default FitnessMetrics;