import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Flame, Activity, Clock, Scale, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface Exercise {
  name: string;
  metValue: number;
  category: string;
}

interface CaloriesBurnedToolProps {
  uiConfig?: UIConfig;
}

export const CaloriesBurnedTool: React.FC<CaloriesBurnedToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [weight, setWeight] = useState('70');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');
  const [duration, setDuration] = useState('30');
  const [selectedExercise, setSelectedExercise] = useState('running_moderate');
  const [category, setCategory] = useState('all');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;

      if (params.weight !== undefined) {
        setWeight(String(params.weight));
        setIsPrefilled(true);
      }
      if (params.duration !== undefined) {
        setDuration(String(params.duration));
        setIsPrefilled(true);
      }
      if (params.exercise) {
        setSelectedExercise(String(params.exercise));
        setIsPrefilled(true);
      }
      if (params.category) {
        setCategory(String(params.category));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const exercises: Record<string, Exercise> = {
    // Cardio
    walking_slow: { name: 'Walking (Slow)', metValue: 2.5, category: 'cardio' },
    walking_moderate: { name: 'Walking (Moderate)', metValue: 3.5, category: 'cardio' },
    walking_brisk: { name: 'Walking (Brisk)', metValue: 4.5, category: 'cardio' },
    running_moderate: { name: 'Running (5 mph)', metValue: 8.3, category: 'cardio' },
    running_fast: { name: 'Running (7 mph)', metValue: 11.0, category: 'cardio' },
    running_sprint: { name: 'Running (10 mph)', metValue: 14.5, category: 'cardio' },
    cycling_light: { name: 'Cycling (Light)', metValue: 4.0, category: 'cardio' },
    cycling_moderate: { name: 'Cycling (Moderate)', metValue: 6.8, category: 'cardio' },
    cycling_vigorous: { name: 'Cycling (Vigorous)', metValue: 10.0, category: 'cardio' },
    swimming_light: { name: 'Swimming (Light)', metValue: 5.0, category: 'cardio' },
    swimming_moderate: { name: 'Swimming (Moderate)', metValue: 7.0, category: 'cardio' },
    jump_rope: { name: 'Jump Rope', metValue: 11.0, category: 'cardio' },
    elliptical: { name: 'Elliptical', metValue: 5.0, category: 'cardio' },
    rowing: { name: 'Rowing Machine', metValue: 7.0, category: 'cardio' },
    stair_climbing: { name: 'Stair Climbing', metValue: 8.0, category: 'cardio' },
    // Strength
    weight_light: { name: 'Weight Training (Light)', metValue: 3.0, category: 'strength' },
    weight_moderate: { name: 'Weight Training (Moderate)', metValue: 5.0, category: 'strength' },
    weight_vigorous: { name: 'Weight Training (Vigorous)', metValue: 6.0, category: 'strength' },
    pushups: { name: 'Push-ups', metValue: 3.8, category: 'strength' },
    situps: { name: 'Sit-ups', metValue: 3.8, category: 'strength' },
    pullups: { name: 'Pull-ups', metValue: 8.0, category: 'strength' },
    squats: { name: 'Squats', metValue: 5.0, category: 'strength' },
    // Sports
    basketball: { name: 'Basketball', metValue: 6.5, category: 'sports' },
    soccer: { name: 'Soccer', metValue: 7.0, category: 'sports' },
    tennis: { name: 'Tennis', metValue: 7.3, category: 'sports' },
    badminton: { name: 'Badminton', metValue: 5.5, category: 'sports' },
    volleyball: { name: 'Volleyball', metValue: 4.0, category: 'sports' },
    golf: { name: 'Golf (Walking)', metValue: 4.5, category: 'sports' },
    boxing: { name: 'Boxing', metValue: 7.8, category: 'sports' },
    martial_arts: { name: 'Martial Arts', metValue: 10.3, category: 'sports' },
    // Other
    yoga: { name: 'Yoga', metValue: 2.5, category: 'other' },
    pilates: { name: 'Pilates', metValue: 3.0, category: 'other' },
    stretching: { name: 'Stretching', metValue: 2.3, category: 'other' },
    dancing: { name: 'Dancing', metValue: 5.0, category: 'other' },
    hiking: { name: 'Hiking', metValue: 6.0, category: 'other' },
    gardening: { name: 'Gardening', metValue: 3.5, category: 'other' },
    cleaning: { name: 'House Cleaning', metValue: 3.0, category: 'other' },
  };

  const categories = ['all', 'cardio', 'strength', 'sports', 'other'];

  const filteredExercises = useMemo(() => {
    return Object.entries(exercises).filter(([_, exercise]) =>
      category === 'all' || exercise.category === category
    );
  }, [category]);

  const calculation = useMemo(() => {
    const weightKg = weightUnit === 'lb' ? parseFloat(weight) * 0.453592 : parseFloat(weight);
    const durationHours = parseFloat(duration) / 60;
    const exercise = exercises[selectedExercise];

    if (!exercise || isNaN(weightKg) || isNaN(durationHours)) {
      return { calories: 0, perMinute: 0, perHour: 0 };
    }

    // Calories = MET × weight (kg) × time (hours)
    const calories = exercise.metValue * weightKg * durationHours;
    const perMinute = calories / parseFloat(duration);
    const perHour = exercise.metValue * weightKg;

    return { calories, perMinute, perHour };
  }, [weight, weightUnit, duration, selectedExercise]);

  const equivalents = useMemo(() => {
    const cal = calculation.calories;
    return [
      { item: 'Apple', amount: (cal / 95).toFixed(1), emoji: '🍎' },
      { item: 'Banana', amount: (cal / 105).toFixed(1), emoji: '🍌' },
      { item: 'Pizza Slice', amount: (cal / 285).toFixed(1), emoji: '🍕' },
      { item: 'Chocolate Bar', amount: (cal / 230).toFixed(1), emoji: '🍫' },
      { item: 'Glass of Wine', amount: (cal / 125).toFixed(1), emoji: '🍷' },
      { item: 'Beer', amount: (cal / 150).toFixed(1), emoji: '🍺' },
    ];
  }, [calculation.calories]);

  const exercise = exercises[selectedExercise];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-orange-900/20' : 'bg-gradient-to-r from-white to-orange-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-lg"><Flame className="w-5 h-5 text-orange-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.caloriesBurned.caloriesBurnedCalculator', 'Calories Burned Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.caloriesBurned.estimateCaloriesBurnedDuringExercise', 'Estimate calories burned during exercise')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Input Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Scale className="w-4 h-4 inline mr-1" /> Weight
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
              <select
                value={weightUnit}
                onChange={(e) => setWeightUnit(e.target.value as 'kg' | 'lb')}
                className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              >
                <option value="kg">kg</option>
                <option value="lb">lb</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Clock className="w-4 h-4 inline mr-1" /> Duration (minutes)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        {/* Quick Duration Buttons */}
        <div className="flex gap-2">
          {[15, 30, 45, 60, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d.toString())}
              className={`flex-1 py-2 rounded-lg text-sm ${parseInt(duration) === d ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {d}min
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm capitalize ${category === cat ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Exercise Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Activity className="w-4 h-4 inline mr-1" /> Exercise
          </label>
          <select
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          >
            {filteredExercises.map(([key, ex]) => (
              <option key={key} value={key}>{ex.name}</option>
            ))}
          </select>
        </div>

        {/* Results */}
        <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50 border-orange-200'} border`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {exercise?.name} for {duration} minutes
          </div>
          <div className="text-5xl font-bold text-orange-500 my-2">
            {Math.round(calculation.calories)}
          </div>
          <div className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.caloriesBurned.caloriesBurned', 'calories burned')}</div>
          <div className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            ({calculation.perMinute.toFixed(1)} cal/min • {Math.round(calculation.perHour)} cal/hour)
          </div>
        </div>

        {/* Food Equivalents */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.caloriesBurned.thatSEquivalentTo', 'That\'s equivalent to:')}</h4>
          <div className="grid grid-cols-3 gap-2">
            {equivalents.map((eq) => (
              <div key={eq.item} className="text-center">
                <div className="text-2xl">{eq.emoji}</div>
                <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{eq.amount}</div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{eq.item}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.caloriesBurned.note', 'Note:')}</strong> This is an estimate based on MET values. Actual calories burned may vary based on intensity, fitness level, and individual metabolism.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CaloriesBurnedTool;
