import React from 'react';
import { Card } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import Icon from '@mdi/react';
import { 
  mdiGenderMale,
  mdiGenderFemale,
  mdiGenderTransgender
} from '@mdi/js';
import { OnboardingData } from '../../../pages/calories-tracker/onboarding';

interface MetricsInputProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
}

const MetricsInput: React.FC<MetricsInputProps> = ({ data, onUpdate }) => {
  const genders = [
    { id: 'male' as const, label: 'Male', icon: mdiGenderMale },
    { id: 'female' as const, label: 'Female', icon: mdiGenderFemale },
    { id: 'other' as const, label: 'Other', icon: mdiGenderTransgender }
  ];

  const handleNumberInput = (field: keyof OnboardingData, value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    onUpdate({ [field]: numValue });
  };

  const getBMICategory = (weight: number, height: number): string => {
    const bmi = weight / Math.pow(height / 100, 2);
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  const getCurrentBMI = (): string => {
    if (data.currentWeight && data.height) {
      const bmi = data.currentWeight / Math.pow(data.height / 100, 2);
      return bmi.toFixed(1);
    }
    return '--';
  };

  const getTargetBMI = (): string => {
    if (data.targetWeight && data.height) {
      const bmi = data.targetWeight / Math.pow(data.height / 100, 2);
      return bmi.toFixed(1);
    }
    return '--';
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-white mb-2">
          Tell us about yourself
        </h2>
        <p className="text-white/60">
          This information helps us calculate your personalized calorie needs
        </p>
      </div>

      <div className="space-y-6">
        {/* Gender Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-white">Gender</Label>
          <div className="grid grid-cols-3 gap-3">
            {genders.map((gender) => (
              <Button
                key={gender.id}
                onClick={() => onUpdate({ gender: gender.id })}
                className={`h-12 flex items-center gap-2 transition-all duration-300 ${
                  data.gender === gender.id
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-transparent shadow-lg shadow-teal-500/30'
                    : 'bg-white/5 border-2 border-white/10 text-white hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <Icon path={gender.icon} size={0.8} />
                <span className="text-sm">{gender.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Age Input */}
        <div className="space-y-2">
          <Label htmlFor="age" className="text-sm font-medium text-white">
            Age (years)
          </Label>
          <Input
            id="age"
            type="number"
            placeholder="Enter your age"
            value={data.age || ''}
            onChange={(e) => handleNumberInput('age', e.target.value)}
            min="13"
            max="120"
            className="text-lg"
          />
          <p className="text-xs text-white/60">
            Must be at least 13 years old
          </p>
        </div>

        {/* Height and Weight Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Height Input */}
          <div className="space-y-2">
            <Label htmlFor="height" className="text-sm font-medium text-white">
              Height (cm)
            </Label>
            <Input
              id="height"
              type="number"
              placeholder="Enter height"
              value={data.height || ''}
              onChange={(e) => handleNumberInput('height', e.target.value)}
              min="100"
              max="300"
              className="text-lg"
            />
            <p className="text-xs text-white/60">
              Example: 175 cm (5'9")
            </p>
          </div>

          {/* Current Weight Input */}
          <div className="space-y-2">
            <Label htmlFor="currentWeight" className="text-sm font-medium text-white">
              Current Weight (kg)
            </Label>
            <Input
              id="currentWeight"
              type="number"
              placeholder="Enter weight"
              value={data.currentWeight || ''}
              onChange={(e) => handleNumberInput('currentWeight', e.target.value)}
              min="20"
              max="500"
              step="0.1"
              className="text-lg"
            />
            <p className="text-xs text-white/60">
              Current BMI: {getCurrentBMI()}
            </p>
          </div>
        </div>

        {/* Target Weight */}
        <div className="space-y-2">
          <Label htmlFor="targetWeight" className="text-sm font-medium text-white">
            Target Weight (kg)
          </Label>
          <Input
            id="targetWeight"
            type="number"
            placeholder="Enter target weight"
            value={data.targetWeight || ''}
            onChange={(e) => handleNumberInput('targetWeight', e.target.value)}
            min="20"
            max="500"
            step="0.1"
            className="text-lg"
          />
          <p className="text-xs text-white/60">
            Target BMI: {getTargetBMI()}
          </p>
        </div>

        {/* BMI Information Card */}
        {data.currentWeight && data.height && (
          <Card className="p-4 bg-gradient-to-r from-cyan-500/10 to-teal-500/10 border border-cyan-500/20">
            <div className="space-y-3">
              <h3 className="font-medium text-white">Health Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-white/60">Current BMI</p>
                  <p className="text-lg font-semibold text-white">
                    {getCurrentBMI()} - {getBMICategory(data.currentWeight, data.height)}
                  </p>
                </div>

                {data.targetWeight && (
                  <div>
                    <p className="text-sm text-white/60">Target BMI</p>
                    <p className="text-lg font-semibold text-white">
                      {getTargetBMI()} - {getBMICategory(data.targetWeight, data.height)}
                    </p>
                  </div>
                )}
              </div>

              <div className="text-xs text-cyan-300">
                <strong>Note:</strong> BMI is a general indicator. Consult healthcare professionals for personalized advice.
              </div>
            </div>
          </Card>
        )}

        {/* Weight Difference Display */}
        {data.currentWeight && data.targetWeight && (
          <Card className="p-4 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/20">
            <div className="text-center space-y-2">
              <p className="text-sm text-white/60">Weight Change Goal</p>
              <p className="text-2xl font-bold text-teal-400">
                {data.targetWeight > data.currentWeight ? '+' : ''}
                {(data.targetWeight - data.currentWeight).toFixed(1)} kg
              </p>
              <p className="text-xs text-white/60">
                {data.targetWeight > data.currentWeight ? 'Weight gain target' : 'Weight loss target'}
              </p>
            </div>
          </Card>
        )}
      </div>

      <div className="bg-amber-500/10 p-4 rounded-lg border border-amber-500/20">
        <p className="text-sm text-white/80">
          <strong className="text-amber-400">Privacy:</strong> Your personal information is stored locally and used only for
          calculating your personalized nutrition plan. We never share your data.
        </p>
      </div>
    </div>
  );
};

export default MetricsInput;