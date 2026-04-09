// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Badge } from '../../components/ui/badge';
import Header from '../../components/landing/Header';
import Icon from '@mdi/react';
import {
  mdiArrowLeft,
  mdiArrowRight,
  mdiHeart,
  mdiLeaf,
  mdiSnowflake,
  mdiBrain,
  mdiShieldCheck,
  mdiFoodDrumstick,
  mdiScaleBalance,
  mdiCheckCircle,
  mdiInformation
} from '@mdi/js';
import BackgroundEffects from '../../components/ui/BackgroundEffects';

interface DietPlan {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  carbs: number;
  protein: number;
  fat: number;
  icon: string;
  color: string;
  iconColor: string;
  benefits: string[];
  sampleMeals: {
    breakfast: string;
    lunch: string;
    dinner: string;
    snack: string;
  };
  restrictions: string[];
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  popularity: number;
  recommended?: boolean;
}

const DietPlanSelection: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [onboardingData, setOnboardingData] = useState<any>(null);

  useEffect(() => {
    const data = localStorage.getItem('caloriesTrackerOnboarding');
    if (data) {
      setOnboardingData(JSON.parse(data));
    }
  }, []);

  const dietPlans: DietPlan[] = [
    {
      id: 'balanced',
      name: 'Balanced Diet',
      description: 'A well-rounded approach to nutrition that includes all food groups in healthy proportions.',
      shortDescription: 'Sustainable, balanced nutrition for long-term health',
      carbs: 50,
      protein: 20,
      fat: 30,
      icon: mdiScaleBalance,
      color: 'from-emerald-500/10 to-green-500/10 border-emerald-200',
      iconColor: 'text-emerald-600',
      benefits: [
        'Easy to follow and maintain',
        'Includes all food groups',
        'Sustainable long-term',
        'Good for beginners',
        'Flexible meal options'
      ],
      sampleMeals: {
        breakfast: 'Oatmeal with berries and nuts',
        lunch: 'Grilled chicken salad with quinoa',
        dinner: 'Salmon with sweet potato and vegetables',
        snack: 'Greek yogurt with fruit'
      },
      restrictions: ['Moderate portions', 'Limit processed foods'],
      difficulty: 'Easy',
      popularity: 95,
      recommended: true
    },
    {
      id: 'keto',
      name: 'Keto Diet',
      description: 'Very low-carbohydrate, high-fat diet that puts your body into ketosis for fat burning.',
      shortDescription: 'High-fat, very low-carb for rapid weight loss',
      carbs: 5,
      protein: 25,
      fat: 70,
      icon: mdiLeaf,
      color: 'from-purple-500/10 to-pink-500/10 border-purple-200',
      iconColor: 'text-purple-600',
      benefits: [
        'Rapid initial weight loss',
        'Reduced appetite',
        'Improved mental clarity',
        'Better blood sugar control',
        'Increased energy levels'
      ],
      sampleMeals: {
        breakfast: 'Eggs and avocado with bacon',
        lunch: 'Keto chicken Caesar salad',
        dinner: 'Steak with buttered vegetables',
        snack: 'Cheese and nuts'
      },
      restrictions: ['Very low carbs (<20g)', 'No grains or sugar', 'Limited fruits'],
      difficulty: 'Challenging',
      popularity: 78
    },
    {
      id: 'mediterranean',
      name: 'Mediterranean',
      description: 'Traditional eating pattern of countries bordering the Mediterranean Sea, emphasizing whole foods.',
      shortDescription: 'Heart-healthy diet rich in olive oil and fresh foods',
      carbs: 45,
      protein: 20,
      fat: 35,
      icon: mdiHeart,
      color: 'from-blue-500/10 to-cyan-500/10 border-blue-200',
      iconColor: 'text-blue-600',
      benefits: [
        'Heart-healthy',
        'Anti-inflammatory',
        'Brain health benefits',
        'Rich in antioxidants',
        'Enjoyable and flavorful'
      ],
      sampleMeals: {
        breakfast: 'Greek yogurt with honey and nuts',
        lunch: 'Mediterranean chickpea salad',
        dinner: 'Grilled fish with olive oil and herbs',
        snack: 'Hummus with vegetables'
      },
      restrictions: ['Limit red meat', 'Use olive oil as main fat'],
      difficulty: 'Easy',
      popularity: 88
    },
    {
      id: 'nordic',
      name: 'Nordic Diet',
      description: 'Based on traditional foods of Nordic countries, emphasizing seasonal and local ingredients.',
      shortDescription: 'Sustainable Nordic foods with seasonal ingredients',
      carbs: 45,
      protein: 25,
      fat: 30,
      icon: mdiSnowflake,
      color: 'from-cyan-500/10 to-blue-500/10 border-cyan-200',
      iconColor: 'text-cyan-600',
      benefits: [
        'Environmentally sustainable',
        'High in omega-3s',
        'Rich in fiber',
        'Anti-inflammatory',
        'Supports local foods'
      ],
      sampleMeals: {
        breakfast: 'Rye bread with smoked fish',
        lunch: 'Barley soup with root vegetables',
        dinner: 'Salmon with rapeseed oil and cabbage',
        snack: 'Berries and nuts'
      },
      restrictions: ['Emphasize local/seasonal foods', 'Limit imported foods'],
      difficulty: 'Moderate',
      popularity: 65
    },
    {
      id: 'mind',
      name: 'MIND Diet',
      description: 'Combination of Mediterranean and DASH diets, specifically designed to support brain health.',
      shortDescription: 'Brain-healthy diet combining Mediterranean and DASH',
      carbs: 50,
      protein: 20,
      fat: 30,
      icon: mdiBrain,
      color: 'from-indigo-500/10 to-purple-500/10 border-indigo-200',
      iconColor: 'text-indigo-600',
      benefits: [
        'Supports brain health',
        'May reduce dementia risk',
        'Heart-healthy',
        'Anti-inflammatory',
        'Easy to follow'
      ],
      sampleMeals: {
        breakfast: 'Blueberry spinach smoothie',
        lunch: 'Walnut and berry salad',
        dinner: 'Salmon with leafy greens',
        snack: 'Almonds and berries'
      },
      restrictions: ['Limit red meat and butter', 'Emphasize brain foods'],
      difficulty: 'Easy',
      popularity: 72
    },
    {
      id: 'dash',
      name: 'DASH Diet',
      description: 'Dietary Approaches to Stop Hypertension, designed to help lower blood pressure.',
      shortDescription: 'Designed to lower blood pressure and improve heart health',
      carbs: 55,
      protein: 18,
      fat: 27,
      icon: mdiShieldCheck,
      color: 'from-red-500/10 to-orange-500/10 border-red-200',
      iconColor: 'text-red-600',
      benefits: [
        'Lowers blood pressure',
        'Reduces heart disease risk',
        'Rich in nutrients',
        'Sustainable approach',
        'Backed by research'
      ],
      sampleMeals: {
        breakfast: 'Whole grain cereal with low-fat milk',
        lunch: 'Turkey and vegetable wrap',
        dinner: 'Lean beef with quinoa and vegetables',
        snack: 'Low-fat yogurt with fruit'
      },
      restrictions: ['Low sodium', 'Limited saturated fats'],
      difficulty: 'Moderate',
      popularity: 81
    },
    {
      id: 'paleo',
      name: 'Paleo Diet',
      description: 'Based on foods presumed to be eaten by early humans, excluding processed foods and grains.',
      shortDescription: 'Whole foods approach excluding grains and processed items',
      carbs: 35,
      protein: 25,
      fat: 40,
      icon: mdiFoodDrumstick,
      color: 'from-orange-500/10 to-yellow-500/10 border-orange-200',
      iconColor: 'text-orange-600',
      benefits: [
        'Eliminates processed foods',
        'High in protein',
        'Anti-inflammatory',
        'May improve metabolism',
        'Focus on whole foods'
      ],
      sampleMeals: {
        breakfast: 'Eggs with vegetables cooked in coconut oil',
        lunch: 'Grilled chicken with sweet potato',
        dinner: 'Grass-fed beef with roasted vegetables',
        snack: 'Nuts and seeds'
      },
      restrictions: ['No grains', 'No legumes', 'No dairy', 'No processed foods'],
      difficulty: 'Challenging',
      popularity: 69
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-emerald-500/20 text-emerald-400';
      case 'Moderate':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'Challenging':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-white/10 text-white/80';
    }
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleContinue = () => {
    if (selectedPlan) {
      const selectedPlanData = dietPlans.find(plan => plan.id === selectedPlan);
      const updatedData = {
        ...onboardingData,
        selectedPlan: selectedPlanData
      };
      localStorage.setItem('caloriesTrackerOnboarding', JSON.stringify(updatedData));
      navigate('/calories-tracker/customization');
    }
  };

  const handleCustomize = () => {
    navigate('/calories-tracker/customization');
  };

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects variant="subtle" />
      <Header />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/calories-tracker/onboarding')}
              className="text-white hover:bg-white/10"
            >
              <Icon path={mdiArrowLeft} size={1} />
            </Button>

            <div className="text-center">
              <p className="text-sm text-white/60">Step 2 of 3</p>
            </div>

            <div className="w-10 h-10" />
          </div>

          <div className="space-y-4">
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full" style={{ width: '66.6%' }} />
            </div>

            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-2">
                Choose Your Diet Plan
              </h1>
              <p className="text-white/60">
                Select a scientifically-backed approach that fits your lifestyle
              </p>
            </div>
          </div>
        </div>

        {/* Your Daily Targets */}
        {onboardingData && (
          <Card className="p-6 mb-8 bg-teal-500/20 border border-teal-400/30">
            <div className="text-center space-y-4">
              <h2 className="text-lg font-semibold text-white">Your Daily Targets</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-teal-400">{onboardingData.dailyCalories}</p>
                  <p className="text-sm text-white/60">Calories/day</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{onboardingData.bmr}</p>
                  <p className="text-sm text-white/60">BMR</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{onboardingData.tdee}</p>
                  <p className="text-sm text-white/60">TDEE</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Diet Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {dietPlans.map((plan) => (
            <Card
              key={plan.id}
              className={`
                p-6 cursor-pointer transition-all duration-200 border-2 bg-white/10 backdrop-blur-xl
                ${selectedPlan === plan.id
                  ? 'border-teal-400 shadow-lg'
                  : 'border-white/20 hover:border-teal-400/50 hover:shadow-lg'
                }
              `}
              onClick={() => handlePlanSelect(plan.id)}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${
                      selectedPlan === plan.id
                        ? 'bg-teal-500/20'
                        : 'bg-white/10'
                    }`}>
                      <Icon
                        path={plan.icon}
                        size={1.5}
                        className={selectedPlan === plan.id ? 'text-teal-400' : 'text-white/70'}
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        {plan.name}
                        {plan.recommended && (
                          <Badge className="bg-emerald-500/20 text-emerald-400">Recommended</Badge>
                        )}
                      </h3>
                      <p className="text-sm text-white/60 mt-1">
                        {plan.shortDescription}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Badge className={getDifficultyColor(plan.difficulty)}>
                      {plan.difficulty}
                    </Badge>
                    <div className="text-xs text-white/60">
                      {plan.popularity}% popular
                    </div>
                  </div>
                </div>

                {/* Macronutrient Breakdown */}
                <div className="space-y-3">
                  <h4 className="font-medium text-white">Macronutrient Distribution</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-emerald-400">{plan.carbs}%</div>
                      <div className="text-xs text-white/60">Carbs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-cyan-400">{plan.protein}%</div>
                      <div className="text-xs text-white/60">Protein</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-400">{plan.fat}%</div>
                      <div className="text-xs text-white/60">Fat</div>
                    </div>
                  </div>

                  {/* Visual Progress Bars */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs w-12 text-white/60">Carbs</span>
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${plan.carbs}%` }}
                        />
                      </div>
                      <span className="text-xs w-8 text-right text-white">{plan.carbs}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs w-12 text-white/60">Protein</span>
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                          style={{ width: `${plan.protein}%` }}
                        />
                      </div>
                      <span className="text-xs w-8 text-right text-white">{plan.protein}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs w-12 text-white/60">Fat</span>
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500 rounded-full transition-all duration-500"
                          style={{ width: `${plan.fat}%` }}
                        />
                      </div>
                      <span className="text-xs w-8 text-right text-white">{plan.fat}%</span>
                    </div>
                  </div>
                </div>

                {/* Benefits */}
                <div className="space-y-2">
                  <h4 className="font-medium text-white text-sm">Key Benefits</h4>
                  <div className="flex flex-wrap gap-1">
                    {plan.benefits.slice(0, 3).map((benefit, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-white/10 text-white/80">
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Sample Day */}
                <div className="space-y-2">
                  <h4 className="font-medium text-white text-sm">Sample Day</h4>
                  <div className="text-xs text-white/60 space-y-1">
                    <div><strong className="text-white/80">Breakfast:</strong> {plan.sampleMeals.breakfast}</div>
                    <div><strong className="text-white/80">Lunch:</strong> {plan.sampleMeals.lunch}</div>
                  </div>
                </div>

                {/* Selection Indicator */}
                {selectedPlan === plan.id && (
                  <div className="flex items-center justify-center gap-2 pt-2 border-t border-teal-400/30">
                    <Icon path={mdiCheckCircle} size={0.8} className="text-teal-400" />
                    <span className="text-sm font-medium text-teal-400">Selected</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Custom Plan Option */}
        <Card className="p-6 mb-8 bg-white/5 backdrop-blur-xl border-2 border-dashed border-white/30 hover:border-teal-400/50 hover:shadow-lg transition-all duration-200 cursor-pointer" onClick={handleCustomize}>
          <div className="text-center space-y-4">
            <Icon path={mdiInformation} size={2} className="text-white/60 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-white">Create Custom Plan</h3>
              <p className="text-sm text-white/60">
                Want more control? Customize your own macronutrient distribution
              </p>
            </div>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              Customize Macros
              <Icon path={mdiArrowRight} size={0.8} className="ml-2" />
            </Button>
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => navigate('/calories-tracker/onboarding')}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Icon path={mdiArrowLeft} size={0.8} className="mr-2" />
            Back
          </Button>

          <Button
            onClick={handleContinue}
            disabled={!selectedPlan}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white disabled:opacity-50"
          >
            Continue
            <Icon path={mdiArrowRight} size={0.8} className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DietPlanSelection;