import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Heart, Activity, Droplets, Moon, Calculator, Scale, Ruler, Gauge } from 'lucide-react';
import Icon from '@mdi/react';
import { mdiScaleBalance, mdiHumanMaleHeight } from '@mdi/js';

interface HealthOverviewProps {
  initialWeight?: number;
  initialHeight?: number;
  onUpdateMeasurements?: (weight: number, height: number, bmi: number) => void;
}

const HealthOverview: React.FC<HealthOverviewProps> = ({
  initialWeight = 70,
  initialHeight = 175,
  onUpdateMeasurements
}) => {
  const [weight, setWeight] = useState(initialWeight);
  const [height, setHeight] = useState(initialHeight);
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');

  // Calculate BMI
  const calculateBMI = () => {
    if (weight > 0 && height > 0) {
      let bmiValue;
      if (unit === 'metric') {
        const heightInM = height / 100;
        bmiValue = weight / (heightInM * heightInM);
      } else {
        bmiValue = (weight / (height * height)) * 703;
      }
      return Math.round(bmiValue * 10) / 10;
    }
    return 0;
  };

  const bmi = calculateBMI();

  const getBMICategory = (bmiValue: number) => {
    if (bmiValue < 18.5) return 'Underweight';
    if (bmiValue < 25) return 'Normal';
    if (bmiValue < 30) return 'Overweight';
    return 'Obese';
  };

  const getBMIColor = (category: string) => {
    switch (category) {
      case 'Underweight': return 'text-amber-400 bg-amber-500/20';
      case 'Normal': return 'text-emerald-400 bg-emerald-500/20';
      case 'Overweight': return 'text-orange-400 bg-orange-500/20';
      case 'Obese': return 'text-red-400 bg-red-500/20';
      default: return 'text-white/60 bg-white/10';
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
      case 'good': return 'text-emerald-400 bg-emerald-500/20';
      case 'warning': return 'text-amber-400 bg-amber-500/20';
      case 'critical': return 'text-red-400 bg-red-500/20';
      default: return 'text-white/60 bg-white/10';
    }
  };

  const getIdealWeight = () => {
    if (height > 0) {
      const heightInM = height / 100;
      // Using BMI 22 as ideal
      return Math.round(22 * heightInM * heightInM);
    }
    return 0;
  };

  const handleCalculate = () => {
    const newBmi = calculateBMI();
    onUpdateMeasurements?.(weight, height, newBmi);
  };

  return (
    <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">Health Overview</h3>
        <p className="text-sm text-white/60">Track your vital health metrics and BMI</p>
      </div>

      {/* Health Metrics Section */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {healthMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-1.5 rounded ${getStatusColor(metric.status)}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <Badge className="text-xs bg-white/10 border border-white/20 text-white/80">
                  {metric.optimal}
                </Badge>
              </div>
              <p className="text-sm font-medium text-white">
                {metric.value} {metric.unit}
              </p>
              <p className="text-xs text-white/60">{metric.label}</p>
            </div>
          );
        })}
      </div>

      {/* BMI Calculator Section */}
      <div className="space-y-4">
        <h4 className="text-base font-semibold text-white">BMI Calculator</h4>

        {/* Unit Toggle */}
        <div className="flex items-center justify-center gap-4 p-3 bg-white/5 rounded-lg">
          <Button
            size="sm"
            onClick={() => setUnit('metric')}
            className={unit === 'metric'
              ? "h-8 bg-gradient-to-r from-teal-500 to-cyan-500 text-white"
              : "h-8 bg-white/10 border border-white/20 text-white hover:scale-105 transition-all duration-200"
            }
          >
            Metric
          </Button>
          <Button
            size="sm"
            onClick={() => setUnit('imperial')}
            className={unit === 'imperial'
              ? "h-8 bg-gradient-to-r from-teal-500 to-cyan-500 text-white"
              : "h-8 bg-white/10 border border-white/20 text-white hover:scale-105 transition-all duration-200"
            }
          >
            Imperial
          </Button>
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-white/60 mb-2 block">
              Weight ({unit === 'metric' ? 'kg' : 'lbs'})
            </label>
            <div className="relative">
              <Icon path={mdiScaleBalance} size={0.8} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
              <Input
                type="number"
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                step="0.1"
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:ring-teal-500/50"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-white/60 mb-2 block">
              Height ({unit === 'metric' ? 'cm' : 'inches'})
            </label>
            <div className="relative">
              <Icon path={mdiHumanMaleHeight} size={0.8} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
              <Input
                type="number"
                value={height}
                onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:ring-teal-500/50"
              />
            </div>
          </div>
        </div>

        <Button
          onClick={handleCalculate}
          className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
        >
          <Calculator className="h-4 w-4 mr-2" />
          Calculate BMI
        </Button>

        {/* BMI Result */}
        {bmi > 0 && (
          <>
            <div className="text-center p-6 bg-gradient-to-br from-teal-500/20 to-cyan-500/10 rounded-lg">
              <p className="text-sm text-white/60 mb-2">Your BMI</p>
              <div className="text-4xl font-bold text-white mb-2">{bmi}</div>
              <Badge className={`${getBMIColor(bmiCategory)} mb-2`}>
                {bmiCategory}
              </Badge>
              <p className="text-xs text-white/60">
                Ideal weight range: {getIdealWeight() - 5} - {getIdealWeight() + 5} {unit === 'metric' ? 'kg' : 'lbs'}
              </p>
            </div>

            {/* BMI Scale */}
            <div>
              <div className="flex justify-between text-xs text-white/60 mb-2">
                <span>Underweight</span>
                <span>Normal</span>
                <span>Overweight</span>
                <span>Obese</span>
              </div>
              <div className="h-2 bg-gradient-to-r from-amber-500 via-emerald-500 via-orange-500 to-red-500 rounded-full relative">
                <div
                  className="absolute w-3 h-3 bg-white rounded-full -top-0.5 shadow-lg transition-all duration-300"
                  style={{ left: `${Math.min(Math.max((bmi - 15) / 25 * 100, 0), 100)}%`, transform: 'translateX(-50%)' }}
                />
              </div>
              <div className="flex justify-between text-xs text-white/60 mt-1">
                <span>15</span>
                <span>18.5</span>
                <span>25</span>
                <span>30</span>
                <span>40</span>
              </div>
            </div>

            {/* Health Advice */}
            <div className="p-4 bg-white/5 rounded-lg">
              <h4 className="text-sm font-medium text-white mb-2">Health Advice</h4>
              <div className="space-y-1">
                {bmiCategory === 'Normal' ? (
                  <>
                    <p className="text-xs text-white/60">• Great job maintaining a healthy weight!</p>
                    <p className="text-xs text-white/60">• Continue with balanced diet and regular exercise</p>
                    <p className="text-xs text-white/60">• Monitor your BMI monthly to stay on track</p>
                  </>
                ) : bmiCategory === 'Underweight' ? (
                  <>
                    <p className="text-xs text-white/60">• Consider increasing caloric intake with healthy foods</p>
                    <p className="text-xs text-white/60">• Focus on protein-rich and nutrient-dense meals</p>
                    <p className="text-xs text-white/60">• Consult a nutritionist for a personalized meal plan</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-white/60">• Aim for gradual weight loss (0.5-1 kg per week)</p>
                    <p className="text-xs text-white/60">• Increase physical activity to at least 150 min/week</p>
                    <p className="text-xs text-white/60">• Focus on portion control and whole foods</p>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};

export default HealthOverview;