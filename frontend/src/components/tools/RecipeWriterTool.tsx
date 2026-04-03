import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChefHat, Loader2, Copy, Check, RefreshCw, Clock, Users, Sparkles, Save, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface RecipeWriterToolProps {
  uiConfig?: UIConfig;
}

const cuisineTypes = [
  { value: 'any', label: 'Any Cuisine' },
  { value: 'italian', label: 'Italian' },
  { value: 'mexican', label: 'Mexican' },
  { value: 'indian', label: 'Indian' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'thai', label: 'Thai' },
  { value: 'french', label: 'French' },
  { value: 'mediterranean', label: 'Mediterranean' },
  { value: 'american', label: 'American' },
  { value: 'korean', label: 'Korean' },
  { value: 'middle-eastern', label: 'Middle Eastern' },
];

const mealTypes = [
  { value: 'main', label: 'Main Course' },
  { value: 'appetizer', label: 'Appetizer' },
  { value: 'dessert', label: 'Dessert' },
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'snack', label: 'Snack' },
  { value: 'side', label: 'Side Dish' },
  { value: 'soup', label: 'Soup' },
  { value: 'salad', label: 'Salad' },
  { value: 'beverage', label: 'Beverage' },
];

const dietaryOptions = [
  { value: 'none', label: 'No Restrictions' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'gluten-free', label: 'Gluten-Free' },
  { value: 'keto', label: 'Keto' },
  { value: 'paleo', label: 'Paleo' },
  { value: 'dairy-free', label: 'Dairy-Free' },
  { value: 'low-carb', label: 'Low Carb' },
  { value: 'halal', label: 'Halal' },
  { value: 'kosher', label: 'Kosher' },
];

const difficultyLevels = [
  { value: 'easy', label: 'Easy (Beginner)' },
  { value: 'medium', label: 'Medium (Intermediate)' },
  { value: 'hard', label: 'Hard (Advanced)' },
];

const servingSizes = ['1', '2', '4', '6', '8', '10', '12'];

export const RecipeWriterTool: React.FC<RecipeWriterToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [dishName, setDishName] = useState('');
  const [cuisine, setCuisine] = useState('any');
  const [mealType, setMealType] = useState('main');
  const [dietary, setDietary] = useState('none');
  const [difficulty, setDifficulty] = useState('medium');
  const [servings, setServings] = useState('4');
  const [keyIngredients, setKeyIngredients] = useState('');
  const [excludeIngredients, setExcludeIngredients] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Handle prefill from conversation or gallery edit
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasPrefill = false;

      // If editing from gallery, restore all saved fields
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        // Restore form fields
        if (params.dishName) {
          setDishName(params.dishName);
          hasPrefill = true;
        }
        if (params.cuisine) {
          setCuisine(params.cuisine);
          hasPrefill = true;
        }
        if (params.mealType) {
          setMealType(params.mealType);
          hasPrefill = true;
        }
        if (params.dietary) {
          setDietary(params.dietary);
          hasPrefill = true;
        }
        if (params.difficulty) {
          setDifficulty(params.difficulty);
          hasPrefill = true;
        }
        if (params.servings) {
          setServings(params.servings);
          hasPrefill = true;
        }
        if (params.keyIngredients) {
          setKeyIngredients(params.keyIngredients);
          hasPrefill = true;
        }
        if (params.excludeIngredients) {
          setExcludeIngredients(params.excludeIngredients);
          hasPrefill = true;
        }
        if (params.additionalNotes) {
          setAdditionalNotes(params.additionalNotes);
          hasPrefill = true;
        }
        // Restore the generated recipe
        if (params.text) {
          setRecipe(params.text);
          hasPrefill = true;
        }
      } else {
        setIsEditFromGallery(false);
        // Original prefill logic for conversation context
        if (params.text || params.content) {
          setDishName(params.text || params.content || '');
          hasPrefill = true;
        }
      }

      setIsPrefilled(hasPrefill);
    }
  }, [uiConfig?.params]);

  const handleGenerate = async () => {
    if (!dishName.trim()) {
      setError('Please enter a dish name or description');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const cuisineLabel = cuisineTypes.find(c => c.value === cuisine)?.label;
      const mealLabel = mealTypes.find(m => m.value === mealType)?.label;
      const dietaryLabel = dietaryOptions.find(d => d.value === dietary)?.label;
      const difficultyLabel = difficultyLevels.find(d => d.value === difficulty)?.label;

      const prompt = `Create a complete, detailed recipe for: ${dishName}

Recipe Requirements:
- Cuisine: ${cuisineLabel}
- Meal Type: ${mealLabel}
- Dietary: ${dietaryLabel}
- Difficulty: ${difficultyLabel}
- Servings: ${servings}
${keyIngredients ? `- Must include these ingredients: ${keyIngredients}` : ''}
${excludeIngredients ? `- Must NOT include: ${excludeIngredients}` : ''}
${additionalNotes ? `- Additional notes: ${additionalNotes}` : ''}

Please provide:

**RECIPE NAME**: [Creative name for the dish]

**DESCRIPTION**: [2-3 sentence appetizing description]

**PREP TIME**: [X minutes]
**COOK TIME**: [X minutes]
**TOTAL TIME**: [X minutes]
**SERVINGS**: ${servings}
**DIFFICULTY**: ${difficultyLabel}

**INGREDIENTS**:
[List all ingredients with precise measurements, organized by component if applicable]

**INSTRUCTIONS**:
[Step-by-step numbered instructions, detailed enough for the skill level]

**CHEF'S TIPS**:
[3-4 helpful tips for best results]

**NUTRITION INFO** (per serving, approximate):
- Calories: X
- Protein: Xg
- Carbs: Xg
- Fat: Xg

**VARIATIONS**:
[2-3 ways to customize the recipe]

**STORAGE**:
[How to store leftovers and for how long]

Make the recipe authentic, practical, and delicious!`;

      const response = await api.post('/ai/text/generate', {
        prompt,
        systemMessage: 'You are a professional chef and recipe developer. Create detailed, accurate, and delicious recipes that are easy to follow. Include precise measurements and clear instructions.',
        temperature: 0.8,
        maxTokens: 2500,
      });

      if (response.success && response.data?.text) {
        setRecipe(response.data.text);
      } else {
        setError(response.error || 'Failed to generate recipe');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (recipe) {
      await navigator.clipboard.writeText(recipe);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSave = async () => {
    if (!recipe) return;

    setIsSaving(true);
    try {
      await api.post('/content', {
        contentType: 'text',
        url: '',
        title: `Recipe: ${dishName}`,
        prompt: `Recipe for ${dishName}`,
        metadata: {
          text: recipe,
          toolId: 'recipe-writer',
          dishName,
          cuisine,
          mealType,
          dietary,
          difficulty,
          servings,
          keyIngredients,
          excludeIngredients,
          additionalNotes,
        },
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);

      // Call the save callback to refresh the gallery if provided
      const params = uiConfig?.params as Record<string, any>;
      if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
        params.onSaveCallback();
      }
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
      <div className={`bg-gradient-to-r ${theme === 'dark' ? 'from-gray-800 to-orange-900/20' : 'from-white to-orange-50'} px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <ChefHat className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('tools.recipeWriter.title')}</h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.recipeWriter.description')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">
              {isEditFromGallery
                ? t('tools.common.contentRestoredFromGallery')
                : t('tools.common.contentLoadedFromConversation')}
            </span>
          </div>
        )}

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.recipeWriter.whatToCook')} *</label>
          <input
            type="text"
            value={dishName}
            onChange={(e) => setDishName(e.target.value)}
            placeholder={t('tools.recipeWriter.dishNamePlaceholder')}
            className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.recipeWriter.cuisine')}</label>
            <select
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {cuisineTypes.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.recipeWriter.mealType')}</label>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {mealTypes.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.recipeWriter.dietary')}</label>
            <select
              value={dietary}
              onChange={(e) => setDietary(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {dietaryOptions.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.recipeWriter.difficulty')}</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {difficultyLevels.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <Users className="w-4 h-4 inline mr-1" /> {t('tools.recipeWriter.servings')}
            </label>
            <select
              value={servings}
              onChange={(e) => setServings(e.target.value)}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            >
              {servingSizes.map((s) => (
                <option key={s} value={s}>{s} {parseInt(s) === 1 ? t('tools.recipeWriter.serving') : t('tools.recipeWriter.servingsPlural')}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.recipeWriter.mustInclude')}</label>
            <input
              type="text"
              value={keyIngredients}
              onChange={(e) => setKeyIngredients(e.target.value)}
              placeholder={t('tools.recipeWriter.mustIncludePlaceholder')}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.recipeWriter.exclude')}</label>
            <input
              type="text"
              value={excludeIngredients}
              onChange={(e) => setExcludeIngredients(e.target.value)}
              placeholder={t('tools.recipeWriter.excludePlaceholder')}
              className={`w-full px-4 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.recipeWriter.additionalNotes')}</label>
          <textarea
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder={t('tools.recipeWriter.additionalNotesPlaceholder')}
            rows={2}
            className={`w-full px-4 py-3 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-xl`}
          />
        </div>

        {error && <div className={`p-4 ${theme === 'dark' ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'} rounded-xl text-sm`}>{error}</div>}

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !dishName.trim()}
          className="w-full py-3 px-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChefHat className="w-5 h-5" />}
          {isGenerating ? t('tools.recipeWriter.creatingRecipe') : t('tools.recipeWriter.generateRecipe')}
        </button>

        {recipe && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                <Clock className="w-4 h-4" /> {t('tools.recipeWriter.yourRecipe')}
                <span className={`text-xs px-2 py-0.5 rounded-full ${theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                  {t('tools.recipeWriter.editable')}
                </span>
              </h4>
              <div className="flex gap-2 items-center">
                {saveSuccess && (
                  <span className="flex items-center gap-1 text-green-500 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    {t('tools.common.saved')}
                  </span>
                )}
                {isSaving && (
                  <span className="flex items-center gap-1 text-gray-500 text-sm">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {t('tools.common.saving')}
                  </span>
                )}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className={`flex items-center gap-2 px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg text-sm`}
                >
                  <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  {t('tools.recipeWriter.regenerate')}
                </button>
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-2 px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg text-sm`}
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? t('tools.common.copied') : t('tools.common.copy')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`flex items-center gap-2 px-3 py-2 ${theme === 'dark' ? 'bg-orange-900/30 hover:bg-orange-900/50 text-orange-300' : 'bg-orange-50 hover:bg-orange-100 text-orange-700'} rounded-lg text-sm disabled:opacity-50`}
                >
                  <Save className="w-4 h-4" />
                  {t('tools.common.save')}
                </button>
              </div>
            </div>
            <textarea
              value={recipe}
              onChange={(e) => setRecipe(e.target.value)}
              rows={12}
              className={`w-full p-4 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-gray-200' : 'border-gray-200 bg-gray-50 text-gray-700'} rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all resize-y leading-relaxed`}
              placeholder={t('tools.recipeWriter.recipeAppearHere')}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeWriterTool;
