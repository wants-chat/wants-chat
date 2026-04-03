import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bird, Leaf, Home, Calendar, Calculator, Shield, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface BirdFeedingGuideToolProps {
  uiConfig?: UIConfig;
}

type BirdSpecies = 'cardinal' | 'bluejay' | 'finch' | 'sparrow' | 'hummingbird' | 'woodpecker' | 'chickadee' | 'robin';
type Season = 'spring' | 'summer' | 'fall' | 'winter';

interface BirdConfig {
  name: string;
  preferredSeeds: string[];
  feederTypes: string[];
  feedingTips: string;
  pestNotes: string;
  dailyAmount: number; // grams per bird per day
}

interface SeasonalTip {
  title: string;
  tips: string[];
}

export const BirdFeedingGuideTool: React.FC<BirdFeedingGuideToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.toolPrefillData && !isPrefilled) {
      const prefillData = uiConfig.toolPrefillData;
      if (prefillData.selectedBird) setSelectedBird(prefillData.selectedBird as BirdSpecies);
      if (prefillData.season) setSeason(prefillData.season as Season);
      if (prefillData.birdCount) setBirdCount(String(prefillData.birdCount));
      if (prefillData.daysToFeed) setDaysToFeed(String(prefillData.daysToFeed));
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  const [selectedBird, setSelectedBird] = useState<BirdSpecies>('cardinal');
  const [season, setSeason] = useState<Season>('spring');
  const [birdCount, setBirdCount] = useState('5');
  const [daysToFeed, setDaysToFeed] = useState('7');
  const [showPestTips, setShowPestTips] = useState(false);

  const birds: Record<BirdSpecies, BirdConfig> = {
    cardinal: {
      name: 'Northern Cardinal',
      preferredSeeds: ['Sunflower seeds (black oil)', 'Safflower seeds', 'Peanuts', 'Cracked corn'],
      feederTypes: ['Platform feeder', 'Hopper feeder', 'Ground feeding'],
      feedingTips: 'Cardinals prefer feeders with sturdy perches. They are ground feeders and appreciate scattered seeds below feeders.',
      pestNotes: 'Safflower seeds deter squirrels while still attracting cardinals.',
      dailyAmount: 25,
    },
    bluejay: {
      name: 'Blue Jay',
      preferredSeeds: ['Peanuts (in shell)', 'Sunflower seeds', 'Suet', 'Acorns'],
      feederTypes: ['Platform feeder', 'Peanut feeder', 'Suet cage'],
      feedingTips: 'Blue jays are intelligent and enjoy foraging. Offer whole peanuts for enrichment.',
      pestNotes: 'Use weight-activated feeders to prevent jays from dominating smaller bird feeders.',
      dailyAmount: 30,
    },
    finch: {
      name: 'Goldfinch / House Finch',
      preferredSeeds: ['Nyjer (thistle) seeds', 'Sunflower chips', 'Millet'],
      feederTypes: ['Tube feeder', 'Sock feeder', 'Finch feeder'],
      feedingTips: 'Finches prefer hanging feeders. Clean nyjer feeders regularly as seeds can spoil.',
      pestNotes: 'Small feeding ports naturally exclude larger birds and squirrels.',
      dailyAmount: 10,
    },
    sparrow: {
      name: 'House Sparrow',
      preferredSeeds: ['Millet', 'Cracked corn', 'Bread crumbs', 'Mixed seeds'],
      feederTypes: ['Ground feeding', 'Platform feeder', 'Hopper feeder'],
      feedingTips: 'Sparrows are social and feed in groups. Scatter seeds on the ground or use open feeders.',
      pestNotes: 'Consider using feeders with small openings if you want to limit sparrow access.',
      dailyAmount: 12,
    },
    hummingbird: {
      name: 'Hummingbird',
      preferredSeeds: ['Sugar water (4:1 ratio)', 'No red dye needed'],
      feederTypes: ['Nectar feeder', 'Window feeder', 'Hanging feeder'],
      feedingTips: 'Change nectar every 2-3 days in summer. Clean feeders with hot water weekly. Never use honey or artificial sweeteners.',
      pestNotes: 'Use ant moats and bee guards. Position feeders in shade to slow fermentation.',
      dailyAmount: 15, // mL of nectar
    },
    woodpecker: {
      name: 'Woodpecker',
      preferredSeeds: ['Suet', 'Peanuts', 'Sunflower seeds', 'Fruit'],
      feederTypes: ['Suet cage', 'Log feeder', 'Platform feeder'],
      feedingTips: 'Woodpeckers need tail props for feeding. Use suet feeders with tail supports.',
      pestNotes: 'Use suet cages within wire cages to prevent raccoon access.',
      dailyAmount: 35,
    },
    chickadee: {
      name: 'Black-capped Chickadee',
      preferredSeeds: ['Sunflower seeds', 'Peanuts', 'Suet', 'Nyjer'],
      feederTypes: ['Tube feeder', 'Hopper feeder', 'Suet cage'],
      feedingTips: 'Chickadees cache food for later. They prefer feeders near cover for quick escapes.',
      pestNotes: 'Weight-sensitive feeders work well as chickadees are very light.',
      dailyAmount: 8,
    },
    robin: {
      name: 'American Robin',
      preferredSeeds: ['Mealworms', 'Berries', 'Chopped fruit', 'Suet'],
      feederTypes: ['Platform feeder', 'Ground feeding', 'Mealworm dish'],
      feedingTips: 'Robins primarily eat worms and fruit. Offer mealworms and berry bushes.',
      pestNotes: 'Keep feeding areas clean to prevent attracting unwanted pests.',
      dailyAmount: 20,
    },
  };

  const seasonalTips: Record<Season, SeasonalTip> = {
    spring: {
      title: 'Spring Feeding',
      tips: [
        'Increase protein-rich foods as birds prepare for breeding',
        'Offer calcium sources like crushed eggshells',
        'Keep feeders clean as wet weather can cause mold',
        'Add nesting materials nearby (cotton, pet fur, twigs)',
      ],
    },
    summer: {
      title: 'Summer Feeding',
      tips: [
        'Provide fresh water daily - birds need it for drinking and bathing',
        'Reduce suet in hot weather as it can melt and spoil',
        'Offer fresh fruit for orioles and tanagers',
        'Clean feeders more frequently to prevent bacteria growth',
      ],
    },
    fall: {
      title: 'Fall Feeding',
      tips: [
        'Increase seed quantities as birds build fat reserves',
        'Offer high-energy foods like sunflower and peanuts',
        'Watch for migrating species passing through',
        'Clean and repair feeders before winter',
      ],
    },
    winter: {
      title: 'Winter Feeding',
      tips: [
        'Provide high-fat foods like suet and peanut butter',
        'Keep feeders full - birds rely heavily on feeders in winter',
        'Brush snow off feeders after storms',
        'Offer unfrozen water with a heated bird bath',
      ],
    },
  };

  const pestDeterrentTips = [
    { pest: 'Squirrels', solution: 'Use baffles, caged feeders, or safflower seeds. Mount feeders on poles away from trees.' },
    { pest: 'Raccoons', solution: 'Bring feeders in at night. Use pole-mounted feeders with baffles.' },
    { pest: 'Bears', solution: 'Remove feeders from spring to fall in bear country. Use bear-resistant poles.' },
    { pest: 'Rats/Mice', solution: 'Clean up spilled seed daily. Use no-waste seed mixes. Elevate feeders.' },
    { pest: 'Ants', solution: 'Use ant moats for hummingbird feeders. Apply petroleum jelly to poles.' },
    { pest: 'Starlings/Grackles', solution: 'Use tube feeders with short perches. Offer safflower instead of sunflower.' },
    { pest: 'Hawks', solution: 'Place feeders near shrubs for cover. Pause feeding for a few days if a hawk frequents your yard.' },
    { pest: 'Cats', solution: 'Keep feeders at least 10 feet from cover where cats can hide. Use pole-mounted feeders.' },
  ];

  const config = birds[selectedBird];
  const seasonalConfig = seasonalTips[season];

  const calculations = useMemo(() => {
    const count = parseFloat(birdCount) || 0;
    const days = parseFloat(daysToFeed) || 0;
    const dailyTotal = count * config.dailyAmount;
    const totalAmount = dailyTotal * days;
    const totalOz = totalAmount / 28.35;
    const totalLbs = totalOz / 16;

    return {
      dailyTotal: dailyTotal.toFixed(0),
      totalAmount: totalAmount.toFixed(0),
      totalOz: totalOz.toFixed(1),
      totalLbs: totalLbs.toFixed(2),
    };
  }, [birdCount, daysToFeed, config.dailyAmount]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-emerald-900/20' : 'bg-gradient-to-r from-white to-emerald-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg"><Bird className="w-5 h-5 text-emerald-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.birdFeedingGuide.wildBirdFeedingGuide', 'Wild Bird Feeding Guide')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.birdFeedingGuide.speciesSpecificFeedingRecommendations', 'Species-specific feeding recommendations')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Bird Species Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.birdFeedingGuide.selectBirdSpecies', 'Select Bird Species')}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.keys(birds) as BirdSpecies[]).map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBird(b)}
                className={`py-2 px-3 rounded-lg text-sm transition-colors ${selectedBird === b ? 'bg-emerald-500 text-white' : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {birds[b].name.split(' ').slice(-1)[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Bird Info Card */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-emerald-900/20 border-emerald-800' : 'bg-emerald-50 border-emerald-200'} border`}>
          <div className="flex items-center justify-between mb-3">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{config.name}</h4>
            <span className="text-emerald-500 font-bold text-sm">{config.dailyAmount}g/day</span>
          </div>
          <p className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{config.feedingTips}</p>
        </div>

        {/* Preferred Seeds */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-emerald-500" />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.birdFeedingGuide.preferredSeedsFood', 'Preferred Seeds & Food')}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {config.preferredSeeds.map((seed, index) => (
              <span
                key={index}
                className={`px-3 py-1 rounded-full text-sm ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {seed}
              </span>
            ))}
          </div>
        </div>

        {/* Feeder Types */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Home className="w-4 h-4 text-blue-500" />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.birdFeedingGuide.recommendedFeederTypes', 'Recommended Feeder Types')}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {config.feederTypes.map((feeder, index) => (
              <span
                key={index}
                className={`px-3 py-1 rounded-full text-sm ${isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-700'}`}
              >
                {feeder}
              </span>
            ))}
          </div>
        </div>

        {/* Season Selection */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-orange-500" />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.birdFeedingGuide.seasonalFeedingTips', 'Seasonal Feeding Tips')}</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(seasonalTips) as Season[]).map((s) => (
              <button
                key={s}
                onClick={() => setSeason(s)}
                className={`py-2 px-3 rounded-lg text-sm capitalize transition-colors ${season === s ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <h5 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{seasonalConfig.title}</h5>
            <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {seasonalConfig.tips.map((tip, index) => (
                <li key={index}>• {tip}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Quantity Calculator */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-purple-500" />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.birdFeedingGuide.seedQuantityCalculator', 'Seed Quantity Calculator')}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {t('tools.birdFeedingGuide.estimatedBirdsVisiting', 'Estimated Birds Visiting')}
              </label>
              <input
                type="number"
                value={birdCount}
                onChange={(e) => setBirdCount(e.target.value)}
                min="1"
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {t('tools.birdFeedingGuide.daysToSupply', 'Days to Supply')}
              </label>
              <input
                type="number"
                value={daysToFeed}
                onChange={(e) => setDaysToFeed(e.target.value)}
                min="1"
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.birdFeedingGuide.dailyAmount', 'Daily Amount')}</div>
              <div className="text-2xl font-bold text-purple-500">{calculations.dailyTotal}g</div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.birdFeedingGuide.perDayForAllBirds', 'per day for all birds')}</div>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.birdFeedingGuide.totalNeeded', 'Total Needed')}</div>
              <div className="text-2xl font-bold text-emerald-500">{calculations.totalLbs} lbs</div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{calculations.totalAmount}g / {calculations.totalOz} oz</div>
            </div>
          </div>
        </div>

        {/* Pest Deterrent Tips */}
        <div className="space-y-2">
          <button
            onClick={() => setShowPestTips(!showPestTips)}
            className={`w-full flex items-center justify-between p-4 rounded-lg transition-colors ${isDark ? 'bg-gray-800 hover:bg-gray-750' : 'bg-gray-50 hover:bg-gray-100'}`}
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.birdFeedingGuide.pestDeterrentTips', 'Pest Deterrent Tips')}</span>
            </div>
            {showPestTips ? (
              <ChevronUp className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            ) : (
              <ChevronDown className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            )}
          </button>
          {showPestTips && (
            <div className={`p-4 rounded-lg space-y-3 ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              {pestDeterrentTips.map((item, index) => (
                <div key={index} className="space-y-1">
                  <span className={`font-medium text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>{item.pest}</span>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{item.solution}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Species-specific Pest Note */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>Tip for {config.name}:</strong>
              <p className="mt-1">{config.pestNotes}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BirdFeedingGuideTool;
