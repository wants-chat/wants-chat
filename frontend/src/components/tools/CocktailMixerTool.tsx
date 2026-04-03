import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Wine, Users, Beaker, GlassWater, Leaf, RefreshCw, Info } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type CocktailType = 'margarita' | 'mojito' | 'oldFashioned' | 'martini' | 'cosmopolitan' | 'whiskeySour' | 'pinaColada' | 'negroni';

interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  substitutes?: string[];
}

interface CocktailConfig {
  name: string;
  ingredients: Ingredient[];
  glassware: string;
  garnish: string[];
  instructions: string[];
  description: string;
  strength: 'Light' | 'Medium' | 'Strong';
  taste: string;
}

interface CocktailMixerToolProps {
  uiConfig?: UIConfig;
}

export const CocktailMixerTool: React.FC<CocktailMixerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [selectedCocktail, setSelectedCocktail] = useState<CocktailType>('margarita');
  const [servings, setServings] = useState(1);
  const [showSubstitutes, setShowSubstitutes] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.prefillData && !isPrefilled) {
      const data = uiConfig.prefillData;
      if (data.cocktail) setSelectedCocktail(data.cocktail as CocktailType);
      if (data.servings) setServings(Number(data.servings));
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  const cocktails: Record<CocktailType, CocktailConfig> = {
    margarita: {
      name: 'Margarita',
      ingredients: [
        { name: 'Tequila', amount: 2, unit: 'oz', substitutes: ['Mezcal', 'Blanco Tequila'] },
        { name: 'Lime Juice', amount: 1, unit: 'oz', substitutes: ['Lemon Juice'] },
        { name: 'Triple Sec', amount: 1, unit: 'oz', substitutes: ['Cointreau', 'Grand Marnier', 'Orange Liqueur'] },
        { name: 'Agave Syrup', amount: 0.5, unit: 'oz', substitutes: ['Simple Syrup', 'Honey Syrup'] },
      ],
      glassware: 'Rocks glass or Margarita glass',
      garnish: ['Lime wheel', 'Salt rim'],
      instructions: ['Rim glass with salt', 'Shake all ingredients with ice', 'Strain into glass over fresh ice', 'Garnish with lime wheel'],
      description: 'Classic tangy and refreshing Mexican cocktail',
      strength: 'Medium',
      taste: 'Citrusy, Sweet, Tangy',
    },
    mojito: {
      name: 'Mojito',
      ingredients: [
        { name: 'White Rum', amount: 2, unit: 'oz', substitutes: ['Silver Rum', 'Cachaca'] },
        { name: 'Fresh Lime Juice', amount: 1, unit: 'oz', substitutes: ['Bottled Lime Juice'] },
        { name: 'Simple Syrup', amount: 0.75, unit: 'oz', substitutes: ['Sugar', 'Agave'] },
        { name: 'Fresh Mint Leaves', amount: 8, unit: 'leaves', substitutes: ['Basil (for variation)'] },
        { name: 'Soda Water', amount: 2, unit: 'oz', substitutes: ['Sparkling Water', 'Tonic Water'] },
      ],
      glassware: 'Highball glass',
      garnish: ['Mint sprig', 'Lime wheel'],
      instructions: ['Muddle mint leaves gently with simple syrup', 'Add rum and lime juice', 'Fill with ice and shake lightly', 'Top with soda water', 'Garnish with mint sprig'],
      description: 'Refreshing Cuban highball with mint',
      strength: 'Light',
      taste: 'Minty, Citrusy, Refreshing',
    },
    oldFashioned: {
      name: 'Old Fashioned',
      ingredients: [
        { name: 'Bourbon', amount: 2, unit: 'oz', substitutes: ['Rye Whiskey', 'Brandy'] },
        { name: 'Sugar Cube', amount: 1, unit: 'cube', substitutes: ['Simple Syrup (0.25 oz)', 'Demerara Syrup'] },
        { name: 'Angostura Bitters', amount: 2, unit: 'dashes', substitutes: ['Orange Bitters', 'Aromatic Bitters'] },
        { name: 'Water', amount: 1, unit: 'splash' },
      ],
      glassware: 'Rocks glass (Old Fashioned glass)',
      garnish: ['Orange peel', 'Luxardo cherry'],
      instructions: ['Muddle sugar with bitters and water', 'Add bourbon and stir', 'Add large ice cube', 'Express orange peel over drink', 'Garnish with orange peel and cherry'],
      description: 'Timeless whiskey cocktail, simple and elegant',
      strength: 'Strong',
      taste: 'Boozy, Oaky, Slightly Sweet',
    },
    martini: {
      name: 'Martini',
      ingredients: [
        { name: 'Gin', amount: 2.5, unit: 'oz', substitutes: ['Vodka (for Vodka Martini)'] },
        { name: 'Dry Vermouth', amount: 0.5, unit: 'oz', substitutes: ['Lillet Blanc', 'Blanc Vermouth'] },
      ],
      glassware: 'Martini glass (Coupe)',
      garnish: ['Lemon twist', 'Olives'],
      instructions: ['Stir gin and vermouth with ice', 'Strain into chilled martini glass', 'Garnish with lemon twist or olives'],
      description: 'The king of cocktails, sophisticated and dry',
      strength: 'Strong',
      taste: 'Dry, Herbal, Crisp',
    },
    cosmopolitan: {
      name: 'Cosmopolitan',
      ingredients: [
        { name: 'Vodka Citron', amount: 1.5, unit: 'oz', substitutes: ['Regular Vodka', 'Lemon Vodka'] },
        { name: 'Triple Sec', amount: 1, unit: 'oz', substitutes: ['Cointreau', 'Orange Liqueur'] },
        { name: 'Lime Juice', amount: 0.5, unit: 'oz' },
        { name: 'Cranberry Juice', amount: 1, unit: 'oz', substitutes: ['Pomegranate Juice'] },
      ],
      glassware: 'Martini glass',
      garnish: ['Lime wheel', 'Orange twist'],
      instructions: ['Shake all ingredients with ice', 'Strain into chilled martini glass', 'Garnish with lime wheel'],
      description: 'Stylish pink cocktail with citrus notes',
      strength: 'Medium',
      taste: 'Tart, Fruity, Citrusy',
    },
    whiskeySour: {
      name: 'Whiskey Sour',
      ingredients: [
        { name: 'Bourbon', amount: 2, unit: 'oz', substitutes: ['Rye Whiskey', 'Irish Whiskey'] },
        { name: 'Fresh Lemon Juice', amount: 0.75, unit: 'oz' },
        { name: 'Simple Syrup', amount: 0.75, unit: 'oz', substitutes: ['Honey Syrup', 'Maple Syrup'] },
        { name: 'Egg White', amount: 1, unit: 'piece', substitutes: ['Aquafaba (vegan)', 'Skip for classic version'] },
      ],
      glassware: 'Rocks glass or Coupe',
      garnish: ['Angostura bitters drops', 'Cherry', 'Orange slice'],
      instructions: ['Dry shake all ingredients without ice', 'Add ice and shake again', 'Strain into glass', 'Add bitters drops on foam for design'],
      description: 'Classic sour with silky foam',
      strength: 'Medium',
      taste: 'Tart, Sweet, Velvety',
    },
    pinaColada: {
      name: 'Pina Colada',
      ingredients: [
        { name: 'White Rum', amount: 2, unit: 'oz', substitutes: ['Dark Rum', 'Spiced Rum'] },
        { name: 'Coconut Cream', amount: 1.5, unit: 'oz', substitutes: ['Cream of Coconut', 'Coconut Milk'] },
        { name: 'Pineapple Juice', amount: 3, unit: 'oz', substitutes: ['Fresh Pineapple (blended)'] },
        { name: 'Ice', amount: 1, unit: 'cup' },
      ],
      glassware: 'Hurricane glass or Poco Grande',
      garnish: ['Pineapple wedge', 'Maraschino cherry', 'Umbrella'],
      instructions: ['Blend all ingredients with ice until smooth', 'Pour into glass', 'Garnish with pineapple and cherry'],
      description: 'Tropical frozen paradise in a glass',
      strength: 'Light',
      taste: 'Sweet, Creamy, Tropical',
    },
    negroni: {
      name: 'Negroni',
      ingredients: [
        { name: 'Gin', amount: 1, unit: 'oz', substitutes: ['Bourbon (Boulevardier)', 'Mezcal'] },
        { name: 'Campari', amount: 1, unit: 'oz', substitutes: ['Aperol (for Aperol Spritz style)', 'Cappelletti'] },
        { name: 'Sweet Vermouth', amount: 1, unit: 'oz', substitutes: ['Cocchi Vermouth di Torino', 'Punt e Mes'] },
      ],
      glassware: 'Rocks glass',
      garnish: ['Orange peel'],
      instructions: ['Add all ingredients to rocks glass with ice', 'Stir until well chilled', 'Express orange peel over drink', 'Garnish with orange peel'],
      description: 'Bitter Italian aperitivo, perfectly balanced',
      strength: 'Strong',
      taste: 'Bitter, Herbal, Complex',
    },
  };

  const config = cocktails[selectedCocktail];

  const scaledIngredients = useMemo(() => {
    return config.ingredients.map((ing) => ({
      ...ing,
      scaledAmount: (ing.amount * servings).toFixed(ing.amount % 1 === 0 ? 0 : 2),
    }));
  }, [config.ingredients, servings]);

  const totalVolume = useMemo(() => {
    const total = scaledIngredients.reduce((sum, ing) => {
      if (ing.unit === 'oz') {
        return sum + parseFloat(ing.scaledAmount);
      }
      return sum;
    }, 0);
    return total.toFixed(1);
  }, [scaledIngredients]);

  const strengthColors = {
    Light: 'text-green-500',
    Medium: 'text-amber-500',
    Strong: 'text-red-500',
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-purple-900/20' : 'bg-gradient-to-r from-white to-purple-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg"><Wine className="w-5 h-5 text-purple-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.cocktailMixer.cocktailMixer', 'Cocktail Mixer')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cocktailMixer.mixPerfectCocktailsWithScaling', 'Mix perfect cocktails with scaling for parties')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Cocktail Selection */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.keys(cocktails) as CocktailType[]).map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCocktail(c)}
              className={`py-2 px-3 rounded-lg text-sm transition-colors ${selectedCocktail === c ? 'bg-purple-500 text-white' : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {cocktails[c].name}
            </button>
          ))}
        </div>

        {/* Cocktail Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className={`font-medium text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{config.name}</h4>
            <span className={`font-bold ${strengthColors[config.strength]}`}>{config.strength}</span>
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{config.description}</p>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            <span className="font-medium">{t('tools.cocktailMixer.taste', 'Taste:')}</span> {config.taste}
          </p>
        </div>

        {/* Batch Scaling */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Users className="w-4 h-4 inline mr-1" />
            {t('tools.cocktailMixer.numberOfServings', 'Number of Servings')}
          </label>
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 4, 6, 8, 10, 12].map((n) => (
              <button
                key={n}
                onClick={() => setServings(n)}
                className={`py-2 px-4 rounded-lg ${servings === n ? 'bg-purple-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {n}
              </button>
            ))}
          </div>
          <input
            type="number"
            min="1"
            max="50"
            value={servings}
            onChange={(e) => setServings(Math.max(1, parseInt(e.target.value) || 1))}
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          />
        </div>

        {/* Ingredients List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Beaker className="w-4 h-4 inline mr-2" />
              Ingredients {servings > 1 && `(x${servings})`}
            </h4>
            <button
              onClick={() => setShowSubstitutes(!showSubstitutes)}
              className={`flex items-center gap-1 text-sm ${isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'}`}
            >
              <RefreshCw className="w-4 h-4" />
              {showSubstitutes ? t('tools.cocktailMixer.hide', 'Hide') : t('tools.cocktailMixer.show', 'Show')} Substitutes
            </button>
          </div>
          <div className={`rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
            {scaledIngredients.map((ing, index) => (
              <div
                key={index}
                className={`p-3 ${index !== scaledIngredients.length - 1 ? (isDark ? 'border-b border-gray-700' : 'border-b border-gray-200') : ''} ${isDark ? 'bg-gray-800' : 'bg-white'}`}
              >
                <div className="flex justify-between items-center">
                  <span className={isDark ? 'text-gray-200' : 'text-gray-800'}>{ing.name}</span>
                  <span className="font-bold text-purple-500">
                    {ing.scaledAmount} {ing.unit}
                  </span>
                </div>
                {showSubstitutes && ing.substitutes && (
                  <div className={`mt-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <span className="font-medium">{t('tools.cocktailMixer.substitutes', 'Substitutes:')}</span> {ing.substitutes.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className={`text-right text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Total liquid volume: ~{totalVolume} oz ({(parseFloat(totalVolume) * 29.57).toFixed(0)} ml)
          </div>
        </div>

        {/* Glassware & Garnish */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <GlassWater className="w-4 h-4 text-blue-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.cocktailMixer.glassware', 'Glassware')}</span>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{config.glassware}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Leaf className="w-4 h-4 text-green-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.cocktailMixer.garnish', 'Garnish')}</span>
            </div>
            <ul className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {config.garnish.map((g, i) => (
                <li key={i}>- {g}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Instructions */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.cocktailMixer.instructions', 'Instructions')}</h4>
          <ol className={`space-y-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {config.instructions.map((step, index) => (
              <li key={index} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 text-white text-sm flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="text-sm">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.cocktailMixer.proTips', 'Pro Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>- Always use fresh citrus juice for best flavor</li>
                <li>- Chill your glasses in the freezer before serving</li>
                <li>- When scaling for parties, prep ingredients in advance</li>
                <li>- Taste and adjust sweetness to preference</li>
                <li>- For batch cocktails, add ice just before serving</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CocktailMixerTool;
