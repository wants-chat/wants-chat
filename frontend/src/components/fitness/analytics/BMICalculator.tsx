import React from 'react';
import { BMIData } from '../../../types/fitness';

interface BMICalculatorProps {
  weight: number; // in kg
  height: number; // in cm
}

const BMICalculator: React.FC<BMICalculatorProps> = ({ weight, height }) => {
  const calculateBMI = (): BMIData => {
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    
    let category: BMIData['category'];
    if (bmi < 18.5) {
      category = 'underweight';
    } else if (bmi < 25) {
      category = 'normal';
    } else if (bmi < 30) {
      category = 'overweight';
    } else {
      category = 'obese';
    }

    return {
      value: Math.round(bmi * 10) / 10,
      category,
      date: new Date(),
    };
  };

  const bmiData = calculateBMI();

  const getCategoryColor = (category: BMIData['category']) => {
    switch (category) {
      case 'underweight':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900';
      case 'normal':
        return 'text-green-600 bg-green-100 dark:bg-green-900';
      case 'overweight':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900';
      case 'obese':
        return 'text-red-600 bg-red-100 dark:bg-red-900';
    }
  };

  const getBMIAdvice = (category: BMIData['category']) => {
    switch (category) {
      case 'underweight':
        return 'Consider increasing caloric intake with nutritious foods';
      case 'normal':
        return 'Great job! Maintain your current healthy lifestyle';
      case 'overweight':
        return 'Focus on balanced nutrition and regular exercise';
      case 'obese':
        return 'Consult with a healthcare professional for personalized advice';
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
      <h3 className="text-lg font-semibold mb-4 text-white">
        BMI Calculator
      </h3>
      
      <div className="text-center mb-4">
        <div className="text-4xl font-bold text-white">
          {bmiData.value}
        </div>
        <div className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(bmiData.category)}`}>
          {bmiData.category.charAt(0).toUpperCase() + bmiData.category.slice(1)}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-white/60">Height:</span>
          <span className="font-medium text-white">{height} cm</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60">Weight:</span>
          <span className="font-medium text-white">{weight} kg</span>
        </div>
      </div>

      <div className="mt-4 p-3 bg-white/5 rounded-lg">
        <p className="text-sm text-white/80">
          {getBMIAdvice(bmiData.category)}
        </p>
      </div>

      <div className="mt-4 space-y-1">
        <div className="text-xs text-white/60">BMI Categories:</div>
        <div className="grid grid-cols-2 gap-2 text-xs text-white/60">
          <div>• Underweight: &lt; 18.5</div>
          <div>• Normal: 18.5 - 24.9</div>
          <div>• Overweight: 25.0 - 29.9</div>
          <div>• Obese: ≥ 30.0</div>
        </div>
      </div>
    </div>
  );
};

export default BMICalculator;