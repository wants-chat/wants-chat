import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Activity } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const CompactBMICalculator: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(170);
  const [bmi, setBmi] = useState(0);
  const [displayBmi, setDisplayBmi] = useState(0);
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [isCalculating, setIsCalculating] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);

  const calculateBMI = () => {
    if (weight > 0 && height > 0) {
      setIsCalculating(true);
      setDisplayBmi(0);

      let bmiValue;
      if (unit === 'metric') {
        const heightInM = height / 100;
        bmiValue = weight / (heightInM * heightInM);
      } else {
        bmiValue = (weight / (height * height)) * 703;
      }

      const finalBmi = Math.round(bmiValue * 10) / 10;

      // Animate BMI counter
      const duration = 1500; // 1.5 seconds
      const steps = 60;
      const increment = finalBmi / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        const newValue = Math.min(increment * currentStep, finalBmi);
        setDisplayBmi(Math.round(newValue * 10) / 10);

        if (currentStep >= steps) {
          clearInterval(timer);
          setBmi(finalBmi);
          setIsCalculating(false);
          setHasCalculated(true);

          // Set category after animation
          if (finalBmi < 18.5) setCategory('Underweight');
          else if (finalBmi < 25) setCategory('Normal');
          else if (finalBmi < 30) setCategory('Overweight');
          else setCategory('Obese');
        }
      }, duration / steps);
    }
  };

  const getCategoryColor = () => {
    switch (category) {
      case 'Underweight': return 'text-blue-600 border-blue-600 bg-blue-50 dark:bg-blue-950/20';
      case 'Normal': return 'text-emerald-600 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/20';
      case 'Overweight': return 'text-amber-600 border-amber-600 bg-amber-50 dark:bg-amber-950/20';
      case 'Obese': return 'text-red-600 border-red-600 bg-red-50 dark:bg-red-950/20';
      default: return 'text-gray-600 border-gray-600 bg-gray-50 dark:bg-gray-950/20';
    }
  };

  const getHealthSuggestion = () => {
    switch (category) {
      case 'Underweight':
        return {
          emoji: '🥗',
          title: 'Build Up Your Strength',
          text: 'Focus on nutritious, calorie-dense foods and strength training to gain healthy weight.'
        };
      case 'Normal':
        return {
          emoji: '🎯',
          title: 'Keep Up The Great Work!',
          text: 'You\'re in the healthy range! Maintain with balanced nutrition and regular exercise.'
        };
      case 'Overweight':
        return {
          emoji: '🏃',
          title: 'Time To Get Active',
          text: 'Create a moderate calorie deficit and increase your physical activity gradually.'
        };
      case 'Obese':
        return {
          emoji: '💪',
          title: 'Start Your Journey',
          text: 'Consult healthcare professionals for a personalized, sustainable weight management plan.'
        };
      default:
        return {
          emoji: '📊',
          title: 'Calculate Your BMI',
          text: 'Enter your weight and height to get personalized health insights.'
        };
    }
  };

  const getIdealWeight = () => {
    if (unit === 'metric') {
      const heightInM = height / 100;
      const minIdeal = 18.5 * heightInM * heightInM;
      const maxIdeal = 24.9 * heightInM * heightInM;
      return `${Math.round(minIdeal)} - ${Math.round(maxIdeal)} kg`;
    } else {
      const minIdeal = (18.5 * height * height) / 703;
      const maxIdeal = (24.9 * height * height) / 703;
      return `${Math.round(minIdeal)} - ${Math.round(maxIdeal)} lbs`;
    }
  };

  const suggestion = getHealthSuggestion();

  return (
    <Card className="p-4 h-full flex flex-col bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
      <div className="mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-[#47bdff] to-teal-500 rounded-lg">
            <Activity className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-base font-bold text-white">BMI Calculator</h3>
        </div>
      </div>

      {/* Unit Toggle */}
      <div className="flex gap-2 mb-4 p-1.5 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
        <Button
          size="sm"
          onClick={() => setUnit('metric')}
          className={`flex-1 h-10 text-sm font-bold transition-all rounded-lg ${
            unit === 'metric'
              ? 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg'
              : 'bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 text-white/60'
          }`}
        >
          Metric (kg/cm)
        </Button>
        <Button
          size="sm"
          onClick={() => setUnit('imperial')}
          className={`flex-1 h-10 text-sm font-bold transition-all rounded-lg ${
            unit === 'imperial'
              ? 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg'
              : 'bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 text-white/60'
          }`}
        >
          Imperial (lbs/in)
        </Button>
      </div>

      {/* Input Fields */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-sm font-bold text-white mb-2 block flex items-center gap-1.5">
            <span className="text-lg">⚖️</span> Weight ({unit === 'metric' ? 'kg' : 'lbs'})
          </label>
          <Input
            type="number"
            value={weight}
            onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
            step="0.1"
            className="h-12 text-base font-semibold bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder:text-white/60 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg shadow-md transition-all"
          />
        </div>
        <div>
          <label className="text-sm font-bold text-white mb-2 block flex items-center gap-1.5">
            <span className="text-lg">📏</span> Height ({unit === 'metric' ? 'cm' : 'in'})
          </label>
          <Input
            type="number"
            value={height}
            onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
            className="h-12 text-base font-semibold bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder:text-white/60 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg shadow-md transition-all"
          />
        </div>
      </div>

      {/* Calculate Button */}
      <Button
        onClick={calculateBMI}
        disabled={isCalculating || weight <= 0 || height <= 0}
        className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isCalculating ? (
          <>
            <Activity className="h-5 w-5 mr-2 animate-spin" />
            Calculating...
          </>
        ) : (
          <>
            <span className="mr-2 text-xl">📊</span>
            Calculate BMI
          </>
        )}
      </Button>

      {/* BMI Result with Animated Meter */}
      <div className="p-4 bg-white/10 backdrop-blur-xl rounded-xl mb-3 border border-white/20 shadow-md">
        {/* BMI Display */}
        <div className="text-center mb-3">
          <div className="text-xs font-semibold text-white/60 mb-2 uppercase tracking-wide">Your BMI</div>
          <div className="text-5xl font-bold text-white mb-2 transition-all duration-300">
            {hasCalculated ? displayBmi : '--'}
          </div>
          {hasCalculated && category && (
            <Badge className={`${getCategoryColor()} px-3 py-1 text-xs font-semibold shadow-md animate-fade-in`}>
              {category}
            </Badge>
          )}
        </div>

        {/* Animated BMI Meter */}
        {hasCalculated && (
          <div className="space-y-2 animate-fade-in">
            <div className="flex justify-between text-xs text-white/60">
              <span>15</span>
              <span>18.5</span>
              <span>25</span>
              <span>30</span>
              <span>40</span>
            </div>
            <div className="relative h-4 bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 via-orange-400 to-red-400 rounded-full overflow-hidden">
              {/* Animated indicator */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-lg transition-all duration-1500 ease-out"
                style={{
                  left: `${Math.min(Math.max(((displayBmi - 15) / 25) * 100, 0), 100)}%`,
                  boxShadow: '0 0 10px rgba(255,255,255,0.8)'
                }}
              />
            </div>
            <div className="flex justify-between text-xs font-medium text-white/60">
              <span>Underweight</span>
              <span>Normal</span>
              <span>Overweight</span>
              <span>Obese</span>
            </div>
          </div>
        )}

        {!hasCalculated && (
          <div className="text-center text-xs text-white/60 py-4">
            Enter your details and click Calculate BMI
          </div>
        )}
      </div>

      {/* Health Suggestion with Illustration */}
      {hasCalculated && category && (
        <div className="bg-white/10 backdrop-blur-xl rounded-lg p-4 mb-3 border border-white/20 shadow-md animate-fade-in">
          {/* Illustration */}
          <div className="flex justify-center mb-3">
            <div className="text-6xl animate-bounce-slow">
              {category === 'Underweight' && '🥤'}
              {category === 'Normal' && '💪'}
              {category === 'Overweight' && '🏃'}
              {category === 'Obese' && '🧘'}
              {!category && '📊'}
            </div>
          </div>

          {/* Suggestion Text */}
          <div className="text-center">
            <h4 className="font-bold text-sm text-white mb-2">{suggestion.title}</h4>
            <p className="text-xs text-white/60 leading-relaxed">
              {suggestion.text}
            </p>
          </div>
        </div>
      )}

      {!hasCalculated && (
        <div className="bg-white/10 backdrop-blur-xl rounded-lg p-4 mb-3 border border-white/20 shadow-md flex items-center justify-center min-h-[120px]">
          <div className="text-center">
            <div className="text-5xl mb-2">📊</div>
            <p className="text-xs text-white/60">Calculate your BMI to get personalized insights</p>
          </div>
        </div>
      )}

      {/* CTA Button - Moved to bottom */}
      <Button
        className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
        onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
      >
        <span className="mr-2 text-xl">🚀</span>
        {isAuthenticated ? 'Go to Dashboard' : 'Start Journey'}
      </Button>
    </Card>
  );
};

export default CompactBMICalculator;
