import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { Heart, Activity, Droplets, Moon, Calculator, Scale, Ruler, Edit2 } from 'lucide-react';

interface CompactHealthOverviewProps {
  initialWeight?: number;
  initialHeight?: number;
  onUpdateMeasurements?: (weight: number, height: number, bmi: number) => void;
}

const CompactHealthOverview: React.FC<CompactHealthOverviewProps> = ({
  initialWeight = 70,
  initialHeight = 175,
  onUpdateMeasurements
}) => {
  const [weight, setWeight] = useState(initialWeight);
  const [height, setHeight] = useState(initialHeight);
  const [isEditing, setIsEditing] = useState(false);
  const [tempWeight, setTempWeight] = useState(weight);
  const [tempHeight, setTempHeight] = useState(height);

  // Calculate BMI
  const calculateBMI = (w: number, h: number) => {
    const heightInM = h / 100;
    return Math.round((w / (heightInM * heightInM)) * 10) / 10;
  };

  const bmi = calculateBMI(weight, height);

  const getBMICategory = (bmiValue: number) => {
    if (bmiValue < 18.5) return 'Underweight';
    if (bmiValue < 25) return 'Normal';
    if (bmiValue < 30) return 'Overweight';
    return 'Obese';
  };

  const getBMIColor = (category: string) => {
    switch (category) {
      case 'Underweight': return 'text-primary bg-primary/10';
      case 'Normal': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20';
      case 'Overweight': return 'text-muted-foreground bg-muted/20';
      case 'Obese': return 'text-destructive bg-destructive/10';
      default: return 'text-muted-foreground bg-muted/20';
    }
  };

  const bmiCategory = getBMICategory(bmi);

  // Health metrics data
  const healthMetrics = [
    {
      id: 'heart-rate',
      label: 'Heart Rate',
      value: 72,
      unit: 'bpm',
      status: 'good',
      icon: Heart,
      optimal: '60-80'
    },
    {
      id: 'blood-pressure',
      label: 'Blood Pressure',
      value: '120/80',
      unit: 'mmHg',
      status: 'good',
      icon: Activity,
      optimal: '< 120/80'
    },
    {
      id: 'hydration',
      label: 'Hydration',
      value: 75,
      unit: '%',
      status: 'warning',
      icon: Droplets,
      optimal: '> 80%'
    },
    {
      id: 'sleep',
      label: 'Sleep',
      value: 7.5,
      unit: 'hrs',
      status: 'good',
      icon: Moon,
      optimal: '7-9 hrs'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20';
      case 'warning': return 'text-primary bg-primary/10';
      case 'critical': return 'text-destructive bg-destructive/10';
      default: return 'text-muted-foreground bg-muted/10';
    }
  };

  const handleSave = () => {
    setWeight(tempWeight);
    setHeight(tempHeight);
    const newBmi = calculateBMI(tempWeight, tempHeight);
    onUpdateMeasurements?.(tempWeight, tempHeight, newBmi);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempWeight(weight);
    setTempHeight(height);
    setIsEditing(false);
  };

  return (
    <Card className="p-6 bg-card border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Health Overview</h3>
          <p className="text-sm text-muted-foreground">Track your vital health metrics and BMI</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
          className="h-8"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      </div>

      {/* BMI Section */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="col-span-1 p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg text-center">
          <p className="text-xs text-muted-foreground mb-1">BMI</p>
          <p className="text-2xl font-bold text-foreground">{bmi}</p>
          <Badge className={`${getBMIColor(bmiCategory)} text-xs mt-1`}>
            {bmiCategory}
          </Badge>
        </div>
        
        {isEditing ? (
          <div className="col-span-2 grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Weight (kg)
              </label>
              <Input
                type="number"
                value={tempWeight}
                onChange={(e) => setTempWeight(parseFloat(e.target.value) || 0)}
                step="0.1"
                className="h-8"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Height (cm)
              </label>
              <Input
                type="number"
                value={tempHeight}
                onChange={(e) => setTempHeight(parseFloat(e.target.value) || 0)}
                className="h-8"
              />
            </div>
            <div className="col-span-2 flex gap-2">
              <Button onClick={handleSave} size="sm" className="flex-1 h-7 text-xs bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
                Save
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm" className="flex-1 h-7 text-xs">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="col-span-2 grid grid-cols-2 gap-3">
            <div className="p-3 bg-secondary/10 rounded-lg text-center">
              <Scale className="h-4 w-4 mx-auto mb-1 text-primary" />
              <p className="text-sm font-semibold text-foreground">{weight} kg</p>
              <p className="text-xs text-muted-foreground">Weight</p>
            </div>
            <div className="p-3 bg-secondary/10 rounded-lg text-center">
              <Ruler className="h-4 w-4 mx-auto mb-1 text-primary" />
              <p className="text-sm font-semibold text-foreground">{height} cm</p>
              <p className="text-xs text-muted-foreground">Height</p>
            </div>
          </div>
        )}
      </div>

      {/* Health Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        {healthMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.id} className="p-3 rounded-lg bg-secondary/10 border border-border">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-1.5 rounded ${getStatusColor(metric.status)}`}>
                  <Icon className="h-3 w-3" />
                </div>
                <Badge variant="outline" className="text-xs">
                  {metric.optimal}
                </Badge>
              </div>
              <p className="text-sm font-medium text-foreground">
                {metric.value} {metric.unit}
              </p>
              <p className="text-xs text-muted-foreground">{metric.label}</p>
            </div>
          );
        })}
      </div>

      {/* Compact Health Tips */}
      <div className="mt-4 p-3 bg-secondary/10 rounded-lg">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Quick tip:</span> {
            bmiCategory === 'Normal' 
              ? 'Great job maintaining a healthy weight! Continue with balanced diet and exercise.'
              : bmiCategory === 'Underweight'
              ? 'Consider increasing caloric intake with nutrient-dense foods.'
              : 'Focus on gradual weight loss through diet and increased physical activity.'
          }
        </p>
      </div>
    </Card>
  );
};

export default CompactHealthOverview;