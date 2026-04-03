import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Ticket, Calculator, TrendingDown, Info, DollarSign, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type LotteryType = 'powerball' | 'megamillions' | 'pick3' | 'pick4' | 'custom';

interface LotteryConfig {
  name: string;
  mainPool: number;
  mainPicks: number;
  bonusPool: number;
  bonusPicks: number;
  ticketPrice: number;
  jackpotOdds: string;
}

interface LotteryOddsCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const LotteryOddsCalculatorTool: React.FC<LotteryOddsCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [lotteryType, setLotteryType] = useState<LotteryType>('powerball');
  const [ticketsBought, setTicketsBought] = useState('1');
  const [jackpotAmount, setJackpotAmount] = useState('500000000');

  // Custom lottery settings
  const [customMainPool, setCustomMainPool] = useState('49');
  const [customMainPicks, setCustomMainPicks] = useState('6');
  const [customBonusPool, setCustomBonusPool] = useState('0');
  const [customBonusPicks, setCustomBonusPicks] = useState('0');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.numbers && params.numbers.length > 0) {
        setTicketsBought(String(params.numbers[0]));
        setIsPrefilled(true);
      } else if (params.amount !== undefined) {
        setJackpotAmount(String(params.amount));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const lotteries: Record<LotteryType, LotteryConfig> = {
    powerball: {
      name: 'Powerball',
      mainPool: 69,
      mainPicks: 5,
      bonusPool: 26,
      bonusPicks: 1,
      ticketPrice: 2,
      jackpotOdds: '1 in 292,201,338',
    },
    megamillions: {
      name: 'Mega Millions',
      mainPool: 70,
      mainPicks: 5,
      bonusPool: 25,
      bonusPicks: 1,
      ticketPrice: 2,
      jackpotOdds: '1 in 302,575,350',
    },
    pick3: {
      name: 'Pick 3',
      mainPool: 10,
      mainPicks: 3,
      bonusPool: 0,
      bonusPicks: 0,
      ticketPrice: 1,
      jackpotOdds: '1 in 1,000',
    },
    pick4: {
      name: 'Pick 4',
      mainPool: 10,
      mainPicks: 4,
      bonusPool: 0,
      bonusPicks: 0,
      ticketPrice: 1,
      jackpotOdds: '1 in 10,000',
    },
    custom: {
      name: 'Custom Lottery',
      mainPool: parseInt(customMainPool) || 49,
      mainPicks: parseInt(customMainPicks) || 6,
      bonusPool: parseInt(customBonusPool) || 0,
      bonusPicks: parseInt(customBonusPicks) || 0,
      ticketPrice: 2,
      jackpotOdds: 'Calculated below',
    },
  };

  const factorial = (n: number): number => {
    if (n <= 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
  };

  const combinations = (n: number, r: number): number => {
    if (r > n) return 0;
    return factorial(n) / (factorial(r) * factorial(n - r));
  };

  const calculations = useMemo(() => {
    const config = lotteryType === 'custom'
      ? {
          ...lotteries.custom,
          mainPool: parseInt(customMainPool) || 49,
          mainPicks: parseInt(customMainPicks) || 6,
          bonusPool: parseInt(customBonusPool) || 0,
          bonusPicks: parseInt(customBonusPicks) || 0,
        }
      : lotteries[lotteryType];

    const tickets = parseInt(ticketsBought) || 1;
    const jackpot = parseFloat(jackpotAmount) || 0;

    // Calculate main ball combinations
    const mainCombinations = combinations(config.mainPool, config.mainPicks);

    // Calculate bonus ball combinations (if any)
    const bonusCombinations = config.bonusPool > 0 ? combinations(config.bonusPool, config.bonusPicks) : 1;

    // Total combinations
    const totalCombinations = mainCombinations * bonusCombinations;

    // Odds of winning with X tickets
    const oddsWithTickets = totalCombinations / tickets;
    const probabilityPercent = (tickets / totalCombinations) * 100;

    // Expected value calculation
    const expectedValue = (jackpot * (tickets / totalCombinations)) - (tickets * config.ticketPrice);

    // Time comparisons
    const secondsToMatch = totalCombinations; // If buying 1 ticket per second
    const years = secondsToMatch / (365.25 * 24 * 60 * 60);
    const lifetimes = years / 80; // Assuming 80-year lifespan

    // Money comparisons
    const costToGuarantee = totalCombinations * config.ticketPrice;
    const ticketsFor1Percent = Math.ceil(totalCombinations * 0.01);

    return {
      config,
      tickets,
      mainCombinations,
      bonusCombinations,
      totalCombinations,
      oddsWithTickets,
      probabilityPercent,
      expectedValue,
      years,
      lifetimes,
      costToGuarantee,
      ticketsFor1Percent,
    };
  }, [lotteryType, ticketsBought, jackpotAmount, customMainPool, customMainPicks, customBonusPool, customBonusPicks, lotteries]);

  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
  };

  const formatCurrency = (num: number): string => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
    return `$${num.toFixed(2)}`;
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-yellow-900/20' : 'bg-gradient-to-r from-white to-yellow-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg"><Ticket className="w-5 h-5 text-yellow-500" /></div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.lotteryOddsCalculator.lotteryOddsCalculator', 'Lottery Odds Calculator')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.lotteryOddsCalculator.understandYourRealChancesOf', 'Understand your real chances of winning')}</p>
            </div>
          </div>
          {isPrefilled && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0D9488]/10 rounded-lg border border-[#0D9488]/20">
              <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
              <span className="text-xs text-[#0D9488] font-medium">{t('tools.lotteryOddsCalculator.prefilled', 'Prefilled')}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Lottery Selection */}
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(lotteries) as LotteryType[]).map((type) => (
            <button
              key={type}
              onClick={() => setLotteryType(type)}
              className={`px-3 py-1.5 rounded-lg text-sm ${lotteryType === type ? 'bg-yellow-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {lotteries[type].name}
            </button>
          ))}
        </div>

        {/* Custom Settings */}
        {lotteryType === 'custom' && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.lotteryOddsCalculator.customLotterySettings', 'Custom Lottery Settings')}</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.lotteryOddsCalculator.mainPoolSize', 'Main Pool Size')}</label>
                <input
                  type="number"
                  value={customMainPool}
                  onChange={(e) => setCustomMainPool(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.lotteryOddsCalculator.numbersToPick', 'Numbers to Pick')}</label>
                <input
                  type="number"
                  value={customMainPicks}
                  onChange={(e) => setCustomMainPicks(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.lotteryOddsCalculator.bonusPool0IfNone', 'Bonus Pool (0 if none)')}</label>
                <input
                  type="number"
                  value={customBonusPool}
                  onChange={(e) => setCustomBonusPool(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.lotteryOddsCalculator.bonusPicks', 'Bonus Picks')}</label>
                <input
                  type="number"
                  value={customBonusPicks}
                  onChange={(e) => setCustomBonusPicks(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tickets & Jackpot */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Ticket className="w-4 h-4 inline mr-1" />
              {t('tools.lotteryOddsCalculator.ticketsBought', 'Tickets Bought')}
            </label>
            <input
              type="number"
              min="1"
              value={ticketsBought}
              onChange={(e) => setTicketsBought(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <DollarSign className="w-4 h-4 inline mr-1" />
              {t('tools.lotteryOddsCalculator.jackpotAmount', 'Jackpot Amount ($)')}
            </label>
            <input
              type="number"
              value={jackpotAmount}
              onChange={(e) => setJackpotAmount(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        {/* Odds Display */}
        <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} border`}>
          <TrendingDown className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.lotteryOddsCalculator.yourOddsOfWinningJackpot', 'Your Odds of Winning Jackpot')}</div>
          <div className="text-3xl font-bold text-yellow-500 my-2">
            1 in {formatNumber(calculations.oddsWithTickets)}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {calculations.probabilityPercent.toExponential(4)}% chance
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.lotteryOddsCalculator.totalCombinations', 'Total Combinations')}</div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {formatNumber(calculations.totalCombinations)}
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.lotteryOddsCalculator.expectedValue', 'Expected Value')}</div>
            <div className={`text-xl font-bold ${calculations.expectedValue >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatCurrency(calculations.expectedValue)}
            </div>
          </div>
        </div>

        {/* Perspective */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.lotteryOddsCalculator.puttingItInPerspective', 'Putting It In Perspective')}</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.lotteryOddsCalculator.ifYouBought1Ticket', 'If you bought 1 ticket/second...')}</span>
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{formatNumber(Math.round(calculations.years))} years</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.lotteryOddsCalculator.thatSAbout', 'That\'s about...')}</span>
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{formatNumber(Math.round(calculations.lifetimes))} lifetimes</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.lotteryOddsCalculator.costToBuyEveryCombo', 'Cost to buy every combo...')}</span>
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{formatCurrency(calculations.costToGuarantee)}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.lotteryOddsCalculator.ticketsFor1Chance', 'Tickets for 1% chance...')}</span>
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{formatNumber(calculations.ticketsFor1Percent)}</span>
            </div>
          </div>
        </div>

        {/* Comparison */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.lotteryOddsCalculator.youReMoreLikelyTo', 'You\'re more likely to:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>• Be struck by lightning (1 in 1.2 million)</li>
                <li>• Become a movie star (1 in 1.5 million)</li>
                <li>• Be killed by a vending machine (1 in 112 million)</li>
                <li>• Get hit by a meteorite (1 in 250 million)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LotteryOddsCalculatorTool;
