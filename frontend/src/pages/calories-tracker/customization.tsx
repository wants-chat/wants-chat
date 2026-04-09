// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import Header from '../../components/landing/Header';
import Icon from '@mdi/react';
import { 
  mdiArrowLeft,
  mdiArrowRight,
  mdiAlert,
  mdiCheckCircle,
  mdiRestore,
  mdiContentSave
} from '@mdi/js';
import MacroSlider from '../../components/calories-tracker/customization/MacroSlider';
import CalorieBalance from '../../components/calories-tracker/customization/CalorieBalance';
import NutrientPreview from '../../components/calories-tracker/customization/NutrientPreview';

interface CustomPlan {
  name: string;
  carbs: number;
  protein: number;
  fat: number;
  dailyCalories: number;
}

const MacronutrientCustomization: React.FC = () => {
  const navigate = useNavigate();
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [customPlan, setCustomPlan] = useState<CustomPlan>({
    name: '',
    carbs: 50,
    protein: 20,
    fat: 30,
    dailyCalories: 2000
  });
  const [isValidBalance, setIsValidBalance] = useState(true);
  const [showMicronutrients, setShowMicronutrients] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem('caloriesTrackerOnboarding');
    if (data) {
      const parsedData = JSON.parse(data);
      setOnboardingData(parsedData);
      
      // If coming from plan selection, use those macros as starting point
      if (parsedData.selectedPlan) {
        setCustomPlan(prev => ({
          ...prev,
          name: `Custom ${parsedData.selectedPlan.name}`,
          carbs: parsedData.selectedPlan.carbs,
          protein: parsedData.selectedPlan.protein,
          fat: parsedData.selectedPlan.fat,
          dailyCalories: parsedData.dailyCalories || 2000
        }));
      } else {
        setCustomPlan(prev => ({
          ...prev,
          dailyCalories: parsedData.dailyCalories || 2000
        }));
      }
    }
  }, []);

  useEffect(() => {
    const total = customPlan.carbs + customPlan.protein + customPlan.fat;
    setIsValidBalance(Math.abs(total - 100) < 0.1);
  }, [customPlan.carbs, customPlan.protein, customPlan.fat]);

  const handleMacroChange = (macro: keyof CustomPlan, value: number) => {
    if (macro === 'dailyCalories') {
      setCustomPlan(prev => ({
        ...prev,
        dailyCalories: value
      }));
      return;
    }

    // Auto-balance macros to maintain 100% total
    setCustomPlan(prev => {
      const newPlan = { ...prev };
      const oldValue = prev[macro as 'carbs' | 'protein' | 'fat'];
      const difference = value - oldValue;
      
      // Update the changed macro
      newPlan[macro as 'carbs' | 'protein' | 'fat'] = value;
      
      // Distribute the difference among the other two macros
      const otherMacros = (['carbs', 'protein', 'fat'] as const).filter(m => m !== macro);
      const halfDifference = difference / 2;
      
      otherMacros.forEach(otherMacro => {
        const currentValue = prev[otherMacro];
        const newValue = Math.max(5, Math.min(70, currentValue - halfDifference));
        newPlan[otherMacro] = newValue;
      });
      
      // Ensure total is exactly 100%
      const total = newPlan.carbs + newPlan.protein + newPlan.fat;
      if (Math.abs(total - 100) > 0.1) {
        const adjustment = (100 - total) / otherMacros.length;
        otherMacros.forEach(otherMacro => {
          newPlan[otherMacro] = Math.round((newPlan[otherMacro] + adjustment) * 10) / 10;
        });
      }
      
      return newPlan;
    });
  };

  const handleAutoBalance = () => {
    const total = customPlan.carbs + customPlan.protein + customPlan.fat;
    if (total !== 100) {
      const difference = 100 - total;
      const adjustment = difference / 3;
      
      setCustomPlan(prev => ({
        ...prev,
        carbs: Math.max(5, Math.min(75, prev.carbs + adjustment)),
        protein: Math.max(10, Math.min(40, prev.protein + adjustment)),
        fat: Math.max(15, Math.min(70, prev.fat + adjustment))
      }));
    }
  };

  const handleResetToRecommended = () => {
    if (onboardingData?.selectedPlan) {
      setCustomPlan(prev => ({
        ...prev,
        carbs: onboardingData.selectedPlan.carbs,
        protein: onboardingData.selectedPlan.protein,
        fat: onboardingData.selectedPlan.fat
      }));
    } else {
      // Default balanced plan
      setCustomPlan(prev => ({
        ...prev,
        carbs: 50,
        protein: 20,
        fat: 30
      }));
    }
  };

  const calculateMacroGrams = (percentage: number, totalCalories: number, caloriesPerGram: number) => {
    return Math.round((percentage / 100) * totalCalories / caloriesPerGram);
  };

  const getMacroRecommendation = (macro: string, value: number): { status: 'warning' | 'good' | 'error'; text: string } => {
    switch (macro) {
      case 'carbs':
        if (value < 20) return { status: 'warning' as const, text: 'Very low carbs - ensure adequate energy' };
        if (value > 65) return { status: 'warning' as const, text: 'High carbs - may affect weight loss' };
        return { status: 'good' as const, text: 'Good carbohydrate range' };
      case 'protein':
        if (value < 15) return { status: 'error' as const, text: 'Too low - risk of muscle loss' };
        if (value > 35) return { status: 'warning' as const, text: 'Very high - may stress kidneys' };
        return { status: 'good' as const, text: 'Optimal protein range' };
      case 'fat':
        if (value < 20) return { status: 'warning' as const, text: 'Low fat - may affect hormones' };
        if (value > 50) return { status: 'warning' as const, text: 'High fat - ensure balance' };
        return { status: 'good' as const, text: 'Healthy fat range' };
      default:
        return { status: 'good' as const, text: '' };
    }
  };

  const handleContinue = () => {
    if (!isValidBalance) {
      handleAutoBalance();
      return;
    }

    const finalData = {
      ...onboardingData,
      customPlan: customPlan,
      finalMacros: {
        carbs: customPlan.carbs,
        protein: customPlan.protein,
        fat: customPlan.fat,
        carbsGrams: calculateMacroGrams(customPlan.carbs, customPlan.dailyCalories, 4),
        proteinGrams: calculateMacroGrams(customPlan.protein, customPlan.dailyCalories, 4),
        fatGrams: calculateMacroGrams(customPlan.fat, customPlan.dailyCalories, 9)
      }
    };

    localStorage.setItem('caloriesTrackerOnboarding', JSON.stringify(finalData));
    navigate('/calories-tracker/dashboard');
  };

  const carbsGrams = calculateMacroGrams(customPlan.carbs, customPlan.dailyCalories, 4);
  const proteinGrams = calculateMacroGrams(customPlan.protein, customPlan.dailyCalories, 4);
  const fatGrams = calculateMacroGrams(customPlan.fat, customPlan.dailyCalories, 9);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-background">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/calories-tracker/plan-selection')}
            >
              <Icon path={mdiArrowLeft} size={1} />
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Step 3 of 3</p>
            </div>
            
            <div className="w-10 h-10" />
          </div>
          
          <div className="space-y-4">
            <Progress value={100} className="h-2" />
            
            <div className="text-center">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Customize Your Macros
              </h1>
              <p className="text-muted-foreground">
                Fine-tune your macronutrient distribution to match your preferences
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Plan Name */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Plan Details</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetToRecommended}
                  >
                    <Icon path={mdiRestore} size={0.6} className="mr-1" />
                    Reset
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="planName">Plan Name</Label>
                  <Input
                    id="planName"
                    placeholder="My Custom Plan"
                    value={customPlan.name}
                    onChange={(e) => setCustomPlan(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
              </div>
            </Card>

            {/* Calorie Balance */}
            <CalorieBalance 
              dailyCalories={customPlan.dailyCalories}
              onCaloriesChange={(calories) => handleMacroChange('dailyCalories', calories)}
            />

            {/* Macro Sliders */}
            <Card className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Macronutrient Distribution</h2>
                  {!isValidBalance && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAutoBalance}
                      className="text-orange-600"
                    >
                      Auto Balance
                    </Button>
                  )}
                </div>

                {!isValidBalance && (
                  <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <Icon path={mdiAlert} size={0.8} className="text-orange-600" />
                    <span className="text-sm text-orange-800">
                      Macros must total 100%. Current total: {(customPlan.carbs + customPlan.protein + customPlan.fat).toFixed(1)}%
                    </span>
                  </div>
                )}

                <div className="space-y-6">
                  <MacroSlider
                    label="Carbohydrates"
                    value={customPlan.carbs}
                    onChange={(value) => handleMacroChange('carbs', value)}
                    min={5}
                    max={75}
                    color="emerald"
                    grams={carbsGrams}
                    recommendation={getMacroRecommendation('carbs', customPlan.carbs)}
                  />

                  <MacroSlider
                    label="Protein"
                    value={customPlan.protein}
                    onChange={(value) => handleMacroChange('protein', value)}
                    min={10}
                    max={40}
                    color="blue"
                    grams={proteinGrams}
                    recommendation={getMacroRecommendation('protein', customPlan.protein)}
                  />

                  <MacroSlider
                    label="Fat"
                    value={customPlan.fat}
                    onChange={(value) => handleMacroChange('fat', value)}
                    min={15}
                    max={70}
                    color="orange"
                    grams={fatGrams}
                    recommendation={getMacroRecommendation('fat', customPlan.fat)}
                  />
                </div>
              </div>
            </Card>

            {/* Micronutrients Toggle */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Micronutrient Targets</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMicronutrients(!showMicronutrients)}
                  >
                    {showMicronutrients ? 'Hide' : 'Show'} Details
                  </Button>
                </div>

                {showMicronutrients && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-secondary/20 rounded-lg">
                        <h4 className="font-medium text-foreground mb-2">Fiber</h4>
                        <p className="text-2xl font-bold text-emerald-600">25-35g</p>
                        <p className="text-xs text-muted-foreground">Daily recommendation</p>
                      </div>
                      
                      <div className="p-4 bg-secondary/20 rounded-lg">
                        <h4 className="font-medium text-foreground mb-2">Sodium</h4>
                        <p className="text-2xl font-bold text-orange-600">&lt;2300mg</p>
                        <p className="text-xs text-muted-foreground">Daily limit</p>
                      </div>
                      
                      <div className="p-4 bg-secondary/20 rounded-lg">
                        <h4 className="font-medium text-foreground mb-2">Added Sugars</h4>
                        <p className="text-2xl font-bold text-red-600">&lt;10%</p>
                        <p className="text-xs text-muted-foreground">Of daily calories</p>
                      </div>
                      
                      <div className="p-4 bg-secondary/20 rounded-lg">
                        <h4 className="font-medium text-foreground mb-2">Saturated Fat</h4>
                        <p className="text-2xl font-bold text-purple-600">&lt;10%</p>
                        <p className="text-xs text-muted-foreground">Of daily calories</p>
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <strong>Note:</strong> These are general recommendations. Individual needs may vary based on health conditions and goals.
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-6">
            <NutrientPreview
              dailyCalories={customPlan.dailyCalories}
              carbs={customPlan.carbs}
              protein={customPlan.protein}
              fat={customPlan.fat}
              carbsGrams={carbsGrams}
              proteinGrams={proteinGrams}
              fatGrams={fatGrams}
            />

            {/* Save Plan */}
            <Card className="p-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Ready to Start?</h3>
                <p className="text-sm text-muted-foreground">
                  Your personalized nutrition plan is ready. You can always adjust these settings later in your profile.
                </p>
                
                <div className="space-y-2">
                  <Button 
                    className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-primary-foreground"
                    onClick={handleContinue}
                    disabled={!isValidBalance}
                  >
                    <Icon path={mdiCheckCircle} size={0.8} className="mr-2" />
                    Complete Setup
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      const planData = { ...customPlan, timestamp: Date.now() };
                      const savedPlans = JSON.parse(localStorage.getItem('savedCaloriePlans') || '[]');
                      savedPlans.push(planData);
                      localStorage.setItem('savedCaloriePlans', JSON.stringify(savedPlans));
                    }}
                  >
                    <Icon path={mdiContentSave} size={0.8} className="mr-2" />
                    Save Plan
                  </Button>
                </div>
              </div>
            </Card>

            {/* Help */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Need Help?</h3>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p><strong>Carbs:</strong> Primary energy source, especially important for brain and muscle function.</p>
                  <p><strong>Protein:</strong> Essential for muscle maintenance, repair, and satiety.</p>
                  <p><strong>Fat:</strong> Important for hormone production, nutrient absorption, and satiety.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => navigate('/calories-tracker/plan-selection')}
          >
            <Icon path={mdiArrowLeft} size={0.8} className="mr-2" />
            Back to Plans
          </Button>
          
          <Button
            onClick={handleContinue}
            disabled={!isValidBalance}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-primary-foreground"
          >
            Start Tracking
            <Icon path={mdiArrowRight} size={0.8} className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MacronutrientCustomization;