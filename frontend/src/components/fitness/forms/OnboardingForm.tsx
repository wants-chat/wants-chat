import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '../../ui/button';
import { cn } from '../../../lib/utils';

interface OnboardingFormProps {
  onComplete: (data: OnboardingData) => void;
  isLoading?: boolean;
}

export interface OnboardingData {
  gender: 'male' | 'female' | 'other';
  age: number;
  height: number;
  weight: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  fitnessGoal: 'lose_weight' | 'gain_muscle' | 'maintain' | 'improve_fitness';
  targetWeight?: number;
}

const OnboardingForm: React.FC<OnboardingFormProps> = ({ onComplete, isLoading = false }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({
    gender: 'male',
    age: 25,
    height: 170,
    weight: 70,
    activityLevel: 'moderate',
    fitnessGoal: 'improve_fitness',
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete(formData);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const updateFormData = (data: Partial<OnboardingData>) => {
    setFormData({ ...formData, ...data });
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-white/60">
            Step {step} of {totalSteps}
          </span>
          <span className="text-sm text-white/60">
            {Math.round((step / totalSteps) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Steps */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg p-8">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">
              Let's get to know you
            </h2>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Gender
              </label>
              <div className="grid grid-cols-3 gap-4">
                {(['male', 'female', 'other'] as const).map((gender) => (
                  <button
                    key={gender}
                    onClick={() => updateFormData({ gender })}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all capitalize text-white",
                      formData.gender === gender
                        ? "border-teal-400 bg-teal-500/20"
                        : "border-white/20 bg-white/5 hover:border-teal-400/50"
                    )}
                  >
                    {gender}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Age
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => updateFormData({ age: parseInt(e.target.value) || 0 })}
                className="w-full p-3 border border-white/20 rounded-lg bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2"
                min="10"
                max="100"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">
              Your physical stats
            </h2>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Height (cm)
              </label>
              <input
                type="number"
                value={formData.height}
                onChange={(e) => updateFormData({ height: parseInt(e.target.value) || 0 })}
                className="w-full p-3 border border-white/20 rounded-lg bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2"
                min="100"
                max="250"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => updateFormData({ weight: parseInt(e.target.value) || 0 })}
                className="w-full p-3 border border-white/20 rounded-lg bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2"
                min="30"
                max="300"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">
              Activity level
            </h2>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-4">
                How active are you?
              </label>
              <div className="space-y-3">
                {[
                  { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
                  { value: 'light', label: 'Lightly Active', desc: 'Exercise 1-3 days/week' },
                  { value: 'moderate', label: 'Moderately Active', desc: 'Exercise 3-5 days/week' },
                  { value: 'active', label: 'Active', desc: 'Exercise 6-7 days/week' },
                  { value: 'very_active', label: 'Very Active', desc: 'Exercise 2x per day' },
                ].map((level) => (
                  <button
                    key={level.value}
                    onClick={() => updateFormData({ activityLevel: level.value as any })}
                    className={cn(
                      "w-full p-4 rounded-lg border-2 transition-all text-left",
                      formData.activityLevel === level.value
                        ? "border-teal-400 bg-teal-500/20"
                        : "border-white/20 bg-white/5 hover:border-teal-400/50"
                    )}
                  >
                    <div className="font-medium text-white">{level.label}</div>
                    <div className="text-sm text-white/60">{level.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">
              What's your fitness goal?
            </h2>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-4">
                Select your primary goal
              </label>
              <div className="space-y-3">
                {[
                  { value: 'lose_weight', label: 'Lose Weight', emoji: '🔥' },
                  { value: 'gain_muscle', label: 'Gain Muscle', emoji: '💪' },
                  { value: 'maintain', label: 'Maintain Current Weight', emoji: '⚖️' },
                  { value: 'improve_fitness', label: 'Improve Overall Fitness', emoji: '🏃' },
                ].map((goal) => (
                  <button
                    key={goal.value}
                    onClick={() => updateFormData({ fitnessGoal: goal.value as any })}
                    className={cn(
                      "w-full p-4 rounded-lg border-2 transition-all text-left flex items-center gap-3",
                      formData.fitnessGoal === goal.value
                        ? "border-teal-400 bg-teal-500/20"
                        : "border-white/20 bg-white/5 hover:border-teal-400/50"
                    )}
                  >
                    <span className="text-2xl">{goal.emoji}</span>
                    <span className="font-medium text-white">{goal.label}</span>
                  </button>
                ))}
              </div>
            </div>
            {(formData.fitnessGoal === 'lose_weight' || formData.fitnessGoal === 'gain_muscle') && (
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Target Weight (kg)
                </label>
                <input
                  type="number"
                  value={formData.targetWeight || ''}
                  onChange={(e) => updateFormData({ targetWeight: parseInt(e.target.value) || undefined })}
                  className="w-full p-3 border border-white/20 rounded-lg bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2"
                  placeholder="Enter your target weight"
                />
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            onClick={handlePrev}
            variant="outline"
            disabled={step === 1 || isLoading}
            className="border-white/20 bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={isLoading}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Profile...
              </>
            ) : (
              step === totalSteps ? 'Complete' : 'Next'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingForm;