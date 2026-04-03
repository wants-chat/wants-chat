import React, { useState, useEffect } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';

interface BMICalculatorProps {
  initialWeight?: number;
  initialHeight?: number;
  onSave?: (weight: number, height: number, bmi: number) => void;
}

const FunctionalBMICalculator: React.FC<BMICalculatorProps> = ({
  initialWeight = 70,
  initialHeight = 175,
  onSave
}) => {
  const [weight, setWeight] = useState(initialWeight);
  const [height, setHeight] = useState(initialHeight);
  const [bmi, setBmi] = useState(0);
  const [category, setCategory] = useState('');
  const [targetWeight, setTargetWeight] = useState(65);
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');

  const calculateBMI = () => {
    if (weight > 0 && height > 0) {
      let bmiValue;
      if (unit === 'metric') {
        const heightInM = height / 100;
        bmiValue = weight / (heightInM * heightInM);
      } else {
        // Imperial formula: (weight in lbs / (height in inches)²) × 703
        bmiValue = (weight / (height * height)) * 703;
      }
      setBmi(Math.round(bmiValue * 10) / 10);
      
      // Determine category
      if (bmiValue < 18.5) setCategory('Underweight');
      else if (bmiValue < 25) setCategory('Normal');
      else if (bmiValue < 30) setCategory('Overweight');
      else setCategory('Obese');
    }
  };

  useEffect(() => {
    calculateBMI();
  }, [weight, height, unit]);

  const getIdealWeight = () => {
    if (unit === 'metric') {
      const heightInM = height / 100;
      const minIdeal = 18.5 * heightInM * heightInM;
      const maxIdeal = 24.9 * heightInM * heightInM;
      return { min: Math.round(minIdeal), max: Math.round(maxIdeal) };
    } else {
      const minIdeal = (18.5 * height * height) / 703;
      const maxIdeal = (24.9 * height * height) / 703;
      return { min: Math.round(minIdeal), max: Math.round(maxIdeal) };
    }
  };

  const getCategoryColor = () => {
    switch (category) {
      case 'Underweight': return 'text-primary border-primary bg-primary/10';
      case 'Normal': return 'text-emerald-600 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/20';
      case 'Overweight': return 'text-muted-foreground border-muted bg-muted/20';
      case 'Obese': return 'text-destructive border-destructive bg-destructive/10';
      default: return 'text-muted-foreground border-muted bg-muted/20';
    }
  };

  const getHealthAdvice = () => {
    switch (category) {
      case 'Underweight':
        return {
          title: 'Consider Gaining Weight',
          tips: [
            'Increase caloric intake with nutritious foods',
            'Add strength training to build muscle mass',
            'Eat protein-rich foods at every meal',
            'Consider consulting a nutritionist'
          ]
        };
      case 'Normal':
        return {
          title: 'Maintain Your Healthy Weight',
          tips: [
            'Continue balanced diet and regular exercise',
            'Stay active with at least 150 minutes of exercise weekly',
            'Monitor your weight regularly',
            'Keep up the great work!'
          ]
        };
      case 'Overweight':
        return {
          title: 'Consider Losing Some Weight',
          tips: [
            'Create a moderate caloric deficit',
            'Increase physical activity to 300 minutes weekly',
            'Focus on whole foods and portion control',
            'Track your food intake and exercise'
          ]
        };
      case 'Obese':
        return {
          title: 'Weight Loss Recommended',
          tips: [
            'Consult with healthcare professionals',
            'Start with low-impact exercises',
            'Make gradual, sustainable diet changes',
            'Set realistic weight loss goals (1-2 lbs/week)'
          ]
        };
      default:
        return { title: '', tips: [] };
    }
  };

  const idealWeight = getIdealWeight();
  const advice = getHealthAdvice();
  const weightDifference = weight - ((idealWeight.min + idealWeight.max) / 2);

  return (
    <Card className="p-6 bg-card border">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">BMI Calculator</h3>
        <p className="text-sm text-muted-foreground">Calculate your Body Mass Index and get personalized health insights</p>
      </div>

      {/* Unit Toggle */}
      <div className="flex gap-2 mb-4">
        <Button
          size="sm"
          variant={unit === 'metric' ? 'default' : 'outline'}
          onClick={() => setUnit('metric')}
          className="flex-1"
        >
          Metric (kg/cm)
        </Button>
        <Button
          size="sm"
          variant={unit === 'imperial' ? 'default' : 'outline'}
          onClick={() => setUnit('imperial')}
          className="flex-1"
        >
          Imperial (lbs/in)
        </Button>
      </div>

      {/* Input Fields */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Weight ({unit === 'metric' ? 'kg' : 'lbs'})
          </label>
          <Input
            type="number"
            value={weight}
            onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
            step="0.1"
            className="text-lg"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Height ({unit === 'metric' ? 'cm' : 'in'})
          </label>
          <Input
            type="number"
            value={height}
            onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
            className="text-lg"
          />
        </div>
      </div>

      {/* BMI Result */}
      <div className="text-center p-6 bg-secondary/20 rounded-lg mb-6">
        <div className="text-4xl font-bold text-foreground mb-2">{bmi}</div>
        <Badge className={`${getCategoryColor()} px-3 py-1`}>
          {category}
        </Badge>
        <p className="text-sm text-muted-foreground mt-2">Body Mass Index</p>
      </div>

      {/* BMI Scale Visual */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Underweight</span>
          <span>Normal</span>
          <span>Overweight</span>
          <span>Obese</span>
        </div>
        <div className="h-3 bg-gradient-to-r from-primary via-emerald-500 via-muted to-destructive rounded-full relative">
          <div 
            className="absolute w-4 h-4 bg-foreground rounded-full -top-0.5 shadow-lg transition-all duration-300"
            style={{ left: `${Math.min(Math.max((bmi - 15) / 25 * 100, 0), 100)}%`, transform: 'translateX(-50%)' }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>15</span>
          <span>18.5</span>
          <span>25</span>
          <span>30</span>
          <span>40</span>
        </div>
      </div>

      {/* Ideal Weight Range */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Ideal Weight Range</p>
          <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
            {idealWeight.min} - {idealWeight.max} {unit === 'metric' ? 'kg' : 'lbs'}
          </p>
        </div>
        <div className="p-3 bg-primary/10 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Weight Difference</p>
          <p className="text-lg font-semibold text-primary">
            {weightDifference > 0 ? '+' : ''}{Math.round(weightDifference)} {unit === 'metric' ? 'kg' : 'lbs'}
          </p>
        </div>
      </div>

      {/* Health Advice */}
      <div className="mb-6">
        <h4 className="font-medium text-foreground mb-3">{advice.title}</h4>
        <div className="space-y-2">
          {advice.tips.map((tip, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Target Weight */}
      <div className="mb-4">
        <label className="text-sm font-medium text-muted-foreground mb-2 block">
          Set Target Weight ({unit === 'metric' ? 'kg' : 'lbs'})
        </label>
        <div className="flex gap-2">
          <Input
            type="number"
            value={targetWeight}
            onChange={(e) => setTargetWeight(parseFloat(e.target.value) || 0)}
            step="0.1"
            className="flex-1"
          />
          <Button 
            onClick={() => onSave?.(weight, height, bmi)}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
          >
            Save Goals
          </Button>
        </div>
      </div>

      {/* Progress to Target */}
      {targetWeight > 0 && (
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress to Target</span>
            <span className="font-medium text-foreground">
              {Math.abs(weight - targetWeight).toFixed(1)} {unit === 'metric' ? 'kg' : 'lbs'} to go
            </span>
          </div>
          <Progress 
            value={Math.max(0, Math.min(100, (1 - Math.abs(weight - targetWeight) / Math.abs(initialWeight - targetWeight)) * 100))} 
            className="h-2"
          />
        </div>
      )}
    </Card>
  );
};

export default FunctionalBMICalculator;