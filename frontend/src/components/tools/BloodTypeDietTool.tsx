import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Apple, Ban, Dumbbell, User, Info } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type BloodType = 'A' | 'B' | 'AB' | 'O';

interface BloodTypeInfo {
  name: string;
  beneficialFoods: string[];
  foodsToAvoid: string[];
  exerciseRecommendations: string[];
  personalityTraits: string[];
  description: string;
}

interface BloodTypeDietToolProps {
  uiConfig?: UIConfig;
}

export const BloodTypeDietTool: React.FC<BloodTypeDietToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [selectedBloodType, setSelectedBloodType] = useState<BloodType>('A');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      // Blood type can be prefilled from text content
      if (params.texts && params.texts.length > 0) {
        const bloodTypeMatch = params.texts[0].toUpperCase().match(/^(A|B|AB|O)$/);
        if (bloodTypeMatch) {
          setSelectedBloodType(bloodTypeMatch[0] as BloodType);
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);

  const bloodTypeData: Record<BloodType, BloodTypeInfo> = {
    A: {
      name: 'Type A - The Agrarian',
      beneficialFoods: [
        'Vegetables (leafy greens, broccoli, carrots)',
        'Fruits (berries, apples, figs)',
        'Whole grains (oats, rice, quinoa)',
        'Legumes (lentils, black beans, soybeans)',
        'Tofu and tempeh',
        'Fish (salmon, sardines, cod)',
        'Olive oil',
        'Green tea',
      ],
      foodsToAvoid: [
        'Red meat (beef, lamb, pork)',
        'Dairy products (milk, cheese, butter)',
        'Kidney beans and lima beans',
        'Wheat (in excess)',
        'Potatoes and tomatoes',
        'Oranges and tangerines',
        'Shellfish',
        'Processed foods',
      ],
      exerciseRecommendations: [
        'Yoga and tai chi',
        'Pilates',
        'Light walking',
        'Swimming',
        'Golf',
        'Stretching exercises',
        'Meditation and deep breathing',
        'Gentle cycling',
      ],
      personalityTraits: [
        'Organized and methodical',
        'Creative and artistic',
        'Sensitive and empathetic',
        'Detail-oriented',
        'Calm under pressure',
        'Reserved and patient',
        'Cooperative team player',
        'Perfectionist tendencies',
      ],
      description: 'Type A individuals thrive on a plant-based diet. They tend to have sensitive immune systems and benefit from calming exercises that reduce stress.',
    },
    B: {
      name: 'Type B - The Nomad',
      beneficialFoods: [
        'Green vegetables (kale, broccoli)',
        'Eggs',
        'Low-fat dairy (yogurt, cheese)',
        'Lamb and mutton',
        'Fish (salmon, flounder, halibut)',
        'Olive oil',
        'Oatmeal and rice',
        'Bananas and grapes',
      ],
      foodsToAvoid: [
        'Chicken',
        'Corn and corn products',
        'Lentils',
        'Peanuts and sesame seeds',
        'Tomatoes',
        'Wheat and buckwheat',
        'Shellfish',
        'Processed foods with additives',
      ],
      exerciseRecommendations: [
        'Tennis and other racquet sports',
        'Hiking',
        'Cycling',
        'Swimming',
        'Martial arts',
        'Golf',
        'Moderate aerobics',
        'Walking and jogging',
      ],
      personalityTraits: [
        'Flexible and adaptable',
        'Creative and original',
        'Strong-willed',
        'Balanced and practical',
        'Independent thinker',
        'Goal-oriented',
        'Passionate and enthusiastic',
        'Social and outgoing',
      ],
      description: 'Type B individuals have a tolerant digestive system and can enjoy a varied diet. They benefit from activities that challenge both mind and body.',
    },
    AB: {
      name: 'Type AB - The Enigma',
      beneficialFoods: [
        'Tofu and soy products',
        'Seafood (salmon, tuna, sardines)',
        'Dairy (yogurt, kefir)',
        'Green vegetables',
        'Eggs',
        'Grapes and plums',
        'Rice and oats',
        'Walnuts and peanuts',
      ],
      foodsToAvoid: [
        'Red meat (beef, pork)',
        'Chicken',
        'Kidney beans and lima beans',
        'Corn',
        'Buckwheat',
        'Seeds (sesame, sunflower)',
        'Oranges and bananas',
        'Caffeine and alcohol',
      ],
      exerciseRecommendations: [
        'Yoga',
        'Tai chi',
        'Cycling',
        'Swimming',
        'Brisk walking',
        'Dancing',
        'Light strength training',
        'Pilates',
      ],
      personalityTraits: [
        'Rational and calm',
        'Adaptable and diplomatic',
        'Complex and multi-faceted',
        'Spiritual and intuitive',
        'Empathetic and compassionate',
        'Charming and sociable',
        'Indecisive at times',
        'Strong sense of self',
      ],
      description: 'Type AB combines characteristics of both A and B types. They have a sensitive digestive tract and benefit from a mix of calming and moderate physical activities.',
    },
    O: {
      name: 'Type O - The Hunter',
      beneficialFoods: [
        'Lean red meat (beef, lamb, venison)',
        'Poultry (chicken, turkey)',
        'Fish (cod, herring, mackerel)',
        'Vegetables (spinach, broccoli, kale)',
        'Fruits (plums, figs, prunes)',
        'Olive oil',
        'Walnuts and pumpkin seeds',
        'Kelp and seaweed',
      ],
      foodsToAvoid: [
        'Wheat and gluten products',
        'Dairy products',
        'Corn',
        'Kidney beans and lentils',
        'Cabbage and Brussels sprouts',
        'Oranges and strawberries',
        'Potatoes',
        'Coffee (in excess)',
      ],
      exerciseRecommendations: [
        'High-intensity interval training (HIIT)',
        'Running and jogging',
        'Weight training',
        'CrossFit',
        'Martial arts',
        'Boxing',
        'Cycling',
        'Competitive sports',
      ],
      personalityTraits: [
        'Confident and strong-willed',
        'Natural leader',
        'Energetic and athletic',
        'Focused and determined',
        'Optimistic and resilient',
        'Direct and practical',
        'Competitive nature',
        'Self-reliant and independent',
      ],
      description: 'Type O individuals have a robust digestive system that processes meat efficiently. They thrive on intense physical exercise and a protein-rich diet.',
    },
  };

  const currentData = bloodTypeData[selectedBloodType];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-red-900/20' : 'bg-gradient-to-r from-white to-red-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/10 rounded-lg"><Heart className="w-5 h-5 text-red-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.bloodTypeDiet.bloodTypeDietGuide', 'Blood Type Diet Guide')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.bloodTypeDiet.personalizedNutritionBasedOnYour', 'Personalized nutrition based on your blood type')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Blood Type Selection */}
        <div className="grid grid-cols-4 gap-2">
          {(['A', 'B', 'AB', 'O'] as BloodType[]).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedBloodType(type)}
              className={`py-3 px-4 rounded-lg text-lg font-bold ${selectedBloodType === type ? 'bg-red-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Blood Type Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border`}>
          <h4 className={`font-medium text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{currentData.name}</h4>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {currentData.description}
          </p>
        </div>

        {/* Beneficial Foods */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-3">
            <Apple className="w-5 h-5 text-green-500" />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.bloodTypeDiet.beneficialFoods', 'Beneficial Foods')}</span>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {currentData.beneficialFoods.map((food, index) => (
              <li key={index} className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} flex items-start gap-2`}>
                <span className="text-green-500 mt-0.5">+</span>
                {food}
              </li>
            ))}
          </ul>
        </div>

        {/* Foods to Avoid */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-3">
            <Ban className="w-5 h-5 text-red-500" />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.bloodTypeDiet.foodsToAvoid', 'Foods to Avoid')}</span>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {currentData.foodsToAvoid.map((food, index) => (
              <li key={index} className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} flex items-start gap-2`}>
                <span className="text-red-500 mt-0.5">-</span>
                {food}
              </li>
            ))}
          </ul>
        </div>

        {/* Exercise Recommendations */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-3">
            <Dumbbell className="w-5 h-5 text-blue-500" />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.bloodTypeDiet.exerciseRecommendations', 'Exercise Recommendations')}</span>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {currentData.exerciseRecommendations.map((exercise, index) => (
              <li key={index} className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} flex items-start gap-2`}>
                <span className="text-blue-500 mt-0.5">*</span>
                {exercise}
              </li>
            ))}
          </ul>
        </div>

        {/* Personality Traits */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-3">
            <User className="w-5 h-5 text-purple-500" />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.bloodTypeDiet.personalityTraits', 'Personality Traits')}</span>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {currentData.personalityTraits.map((trait, index) => (
              <li key={index} className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} flex items-start gap-2`}>
                <span className="text-purple-500 mt-0.5">~</span>
                {trait}
              </li>
            ))}
          </ul>
        </div>

        {/* Disclaimer */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.bloodTypeDiet.disclaimer', 'Disclaimer:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>* This information is based on the Blood Type Diet theory by Dr. Peter D'Adamo</li>
                <li>* Scientific evidence supporting blood type diets is limited</li>
                <li>* Always consult a healthcare professional before making dietary changes</li>
                <li>* Individual nutritional needs vary based on many factors beyond blood type</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BloodTypeDietTool;
