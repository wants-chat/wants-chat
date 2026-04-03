import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Wheat, Clock, Scale, Droplet, Info, AlertCircle, CheckCircle, Trash2, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type FeedingRatio = '1:1:1' | '1:2:2' | '1:5:5';
type FlourType = 'all-purpose' | 'bread' | 'whole-wheat' | 'rye' | 'spelt';

interface RatioConfig {
  name: string;
  starterPart: number;
  flourPart: number;
  waterPart: number;
  description: string;
  nextFeedingHours: number;
}

interface FlourConfig {
  name: string;
  hydration: number;
  notes: string;
}

interface SourdoughStarterToolProps {
  uiConfig?: UIConfig;
}

export const SourdoughStarterTool: React.FC<SourdoughStarterToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [starterAmount, setStarterAmount] = useState('50');
  const [feedingRatio, setFeedingRatio] = useState<FeedingRatio>('1:1:1');
  const [flourType, setFlourType] = useState<FlourType>('all-purpose');
  const [lastFeedingTime, setLastFeedingTime] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState<string>('');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount) {
        setStarterAmount(params.amount.toString());
        setIsPrefilled(true);
      }
      if (params.formData) {
        if (params.formData.starterAmount) setStarterAmount(params.formData.starterAmount.toString());
        if (params.formData.feedingRatio) setFeedingRatio(params.formData.feedingRatio as FeedingRatio);
        if (params.formData.flourType) setFlourType(params.formData.flourType as FlourType);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const ratios: Record<FeedingRatio, RatioConfig> = {
    '1:1:1': {
      name: 'Standard (1:1:1)',
      starterPart: 1,
      flourPart: 1,
      waterPart: 1,
      description: 'Equal parts starter, flour, and water. Best for daily feeding or active starters.',
      nextFeedingHours: 12,
    },
    '1:2:2': {
      name: 'Moderate (1:2:2)',
      starterPart: 1,
      flourPart: 2,
      waterPart: 2,
      description: 'Double the flour and water. Good for slower fermentation or warmer environments.',
      nextFeedingHours: 16,
    },
    '1:5:5': {
      name: 'Extended (1:5:5)',
      starterPart: 1,
      flourPart: 5,
      waterPart: 5,
      description: 'High dilution for long fermentation. Ideal for overnight or when away.',
      nextFeedingHours: 24,
    },
  };

  const flourTypes: Record<FlourType, FlourConfig> = {
    'all-purpose': {
      name: 'All-Purpose',
      hydration: 100,
      notes: 'Most common choice. Produces mild, versatile starter.',
    },
    'bread': {
      name: 'Bread Flour',
      hydration: 100,
      notes: 'Higher protein content. Creates stronger gluten structure.',
    },
    'whole-wheat': {
      name: 'Whole Wheat',
      hydration: 100,
      notes: 'Rich in nutrients. Ferments faster, more complex flavor.',
    },
    'rye': {
      name: 'Rye',
      hydration: 100,
      notes: 'Very active fermentation. Produces tangy, robust starter.',
    },
    'spelt': {
      name: 'Spelt',
      hydration: 100,
      notes: 'Ancient grain. Mild, slightly nutty flavor profile.',
    },
  };

  const ratioConfig = ratios[feedingRatio];
  const flourConfig = flourTypes[flourType];

  const calculations = useMemo(() => {
    const starter = parseFloat(starterAmount) || 0;
    const { starterPart, flourPart, waterPart } = ratioConfig;

    const flourNeeded = (starter / starterPart) * flourPart;
    const waterNeeded = (starter / starterPart) * waterPart;
    const totalWeight = starter + flourNeeded + waterNeeded;
    const discardAmount = totalWeight - starter; // Amount you could discard before feeding

    // Calculate hydration percentage (water / flour * 100)
    const hydration = (waterNeeded / flourNeeded) * 100;

    return {
      starter: starter.toFixed(0),
      flour: flourNeeded.toFixed(0),
      water: waterNeeded.toFixed(0),
      total: totalWeight.toFixed(0),
      discard: discardAmount.toFixed(0),
      hydration: hydration.toFixed(0),
    };
  }, [starterAmount, ratioConfig]);

  // Calculate baking readiness based on time since last feeding
  const bakingReadiness = useMemo(() => {
    if (!lastFeedingTime) return { ready: false, status: 'unknown', message: 'Set last feeding time to track readiness' };

    const hoursSinceFeeding = (Date.now() - lastFeedingTime.getTime()) / (1000 * 60 * 60);
    const peakHours = ratioConfig.nextFeedingHours * 0.5; // Peak is around halfway to next feeding

    if (hoursSinceFeeding < peakHours * 0.5) {
      return { ready: false, status: 'early', message: 'Not ready yet. Starter is still developing.' };
    } else if (hoursSinceFeeding >= peakHours * 0.5 && hoursSinceFeeding <= peakHours * 1.5) {
      return { ready: true, status: 'peak', message: 'Perfect! Starter is at peak activity.' };
    } else if (hoursSinceFeeding <= ratioConfig.nextFeedingHours) {
      return { ready: true, status: 'good', message: 'Good to use, but past peak. Still active.' };
    } else {
      return { ready: false, status: 'overdue', message: 'Needs feeding. May be less active.' };
    }
  }, [lastFeedingTime, ratioConfig.nextFeedingHours]);

  // Countdown timer effect
  useEffect(() => {
    if (!lastFeedingTime) {
      setCountdown('--:--:--');
      return;
    }

    const updateCountdown = () => {
      const nextFeeding = new Date(lastFeedingTime.getTime() + ratioConfig.nextFeedingHours * 60 * 60 * 1000);
      const now = new Date();
      const diff = nextFeeding.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown('Feed now!');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [lastFeedingTime, ratioConfig.nextFeedingHours]);

  const handleFeedNow = () => {
    setLastFeedingTime(new Date());
  };

  const healthTips = [
    'Store at room temperature (70-75°F/21-24°C) for daily use',
    'A healthy starter doubles in size within 4-8 hours after feeding',
    'Look for lots of bubbles and a pleasant, tangy aroma',
    'Use the float test: drop a spoonful in water; if it floats, it\'s ready',
    'Feed consistently at the same time each day for best results',
    'If neglected, refresh with several feedings before baking',
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-orange-900/20' : 'bg-gradient-to-r from-white to-orange-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-lg"><Wheat className="w-5 h-5 text-orange-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.sourdoughStarter.sourdoughStarterManager', 'Sourdough Starter Manager')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.sourdoughStarter.trackFeedingsAndCalculateRatios', 'Track feedings and calculate ratios')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.sourdoughStarter.contentLoadedFromYourConversation', 'Content loaded from your conversation')}</span>
          </div>
        )}

        {/* Starter Amount Input */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Scale className="w-4 h-4 inline mr-1" />
            {t('tools.sourdoughStarter.starterAmountGrams', 'Starter Amount (grams)')}
          </label>
          <div className="flex gap-2">
            {[25, 50, 100, 150, 200].map((n) => (
              <button
                key={n}
                onClick={() => setStarterAmount(n.toString())}
                className={`flex-1 py-2 rounded-lg ${parseInt(starterAmount) === n ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {n}g
              </button>
            ))}
          </div>
          <input
            type="number"
            value={starterAmount}
            onChange={(e) => setStarterAmount(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            placeholder={t('tools.sourdoughStarter.enterStarterAmount', 'Enter starter amount')}
          />
        </div>

        {/* Feeding Ratio Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.sourdoughStarter.feedingRatio', 'Feeding Ratio')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(ratios) as FeedingRatio[]).map((r) => (
              <button
                key={r}
                onClick={() => setFeedingRatio(r)}
                className={`py-2 px-3 rounded-lg text-sm ${feedingRatio === r ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {r}
              </button>
            ))}
          </div>
          <div className={`p-3 rounded-lg ${isDark ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50 border-orange-200'} border`}>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{ratioConfig.description}</p>
          </div>
        </div>

        {/* Flour Type Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.sourdoughStarter.flourType', 'Flour Type')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(flourTypes) as FlourType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFlourType(f)}
                className={`py-2 px-3 rounded-lg text-sm ${flourType === f ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {flourTypes[f].name}
              </button>
            ))}
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{flourConfig.notes}</p>
        </div>

        {/* Feeding Calculations */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Wheat className="w-4 h-4 text-orange-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.sourdoughStarter.flourNeeded', 'Flour Needed')}</span>
            </div>
            <div className="text-3xl font-bold text-orange-500">{calculations.flour}g</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {flourConfig.name}
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Droplet className="w-4 h-4 text-blue-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.sourdoughStarter.waterNeeded', 'Water Needed')}</span>
            </div>
            <div className="text-3xl font-bold text-blue-500">{calculations.water}g</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {calculations.hydration}% hydration
            </div>
          </div>
        </div>

        {/* Total Weight */}
        <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.sourdoughStarter.totalAfterFeeding', 'Total after feeding')}</div>
          <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {calculations.total}g
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>at {feedingRatio} ratio</div>
        </div>

        {/* Discard Amount */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border`}>
          <div className="flex items-center gap-2 mb-2">
            <Trash2 className="w-4 h-4 text-red-500" />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.sourdoughStarter.discardAmount', 'Discard Amount')}</span>
          </div>
          <div className="text-2xl font-bold text-red-500">{calculations.discard}g</div>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Optional: Remove this amount before feeding to maintain {calculations.starter}g starter.
          </p>
        </div>

        {/* Next Feeding Countdown */}
        <div className="space-y-3">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Clock className="w-4 h-4 inline mr-1" />
            {t('tools.sourdoughStarter.nextFeedingCountdown', 'Next Feeding Countdown')}
          </label>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-4xl font-mono font-bold ${countdown === 'Feed now!' ? 'text-red-500' : isDark ? 'text-white' : 'text-gray-900'}`}>
              {countdown}
            </div>
            <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {lastFeedingTime
                ? `Last fed: ${lastFeedingTime.toLocaleTimeString()} (${ratioConfig.nextFeedingHours}h cycle)`
                : 'Click "Feed Now" when you feed your starter'}
            </p>
          </div>
          <button
            onClick={handleFeedNow}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
          >
            {t('tools.sourdoughStarter.feedNow', 'Feed Now')}
          </button>
        </div>

        {/* Baking Readiness Indicator */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-3">
            {bakingReadiness.status === 'peak' ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : bakingReadiness.status === 'good' ? (
              <CheckCircle className="w-5 h-5 text-yellow-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-gray-500" />
            )}
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.sourdoughStarter.bakingReadiness', 'Baking Readiness')}</span>
          </div>
          <div className={`flex items-center gap-2 mb-2`}>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              bakingReadiness.status === 'peak'
                ? 'bg-green-500/20 text-green-500'
                : bakingReadiness.status === 'good'
                ? 'bg-yellow-500/20 text-yellow-500'
                : bakingReadiness.status === 'early'
                ? 'bg-blue-500/20 text-blue-500'
                : bakingReadiness.status === 'overdue'
                ? 'bg-red-500/20 text-red-500'
                : isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'
            }`}>
              {bakingReadiness.ready ? t('tools.sourdoughStarter.readyToBake', 'Ready to Bake') : t('tools.sourdoughStarter.notReady', 'Not Ready')}
            </div>
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{bakingReadiness.message}</p>
        </div>

        {/* Starter Health Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.sourdoughStarter.starterHealthTips', 'Starter Health Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                {healthTips.map((tip, index) => (
                  <li key={index}>• {tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SourdoughStarterTool;
