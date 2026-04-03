import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Check, X, Minus, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

interface Feature {
  key: string;
  wants: boolean | 'partial';
  chatGPT: boolean | 'partial';
  claude: boolean | 'partial';
  perplexity: boolean | 'partial';
  manus: boolean | 'partial';
  gemini: boolean | 'partial';
  copilot: boolean | 'partial';
}

const featureData: Feature[] = [
  { key: 'aiChat', wants: true, chatGPT: true, claude: true, perplexity: true, manus: true, gemini: true, copilot: true },
  { key: 'appBuilder', wants: true, chatGPT: false, claude: false, perplexity: false, manus: false, gemini: false, copilot: false },
  { key: 'dataAnalysis', wants: true, chatGPT: 'partial', claude: 'partial', perplexity: false, manus: 'partial', gemini: 'partial', copilot: 'partial' },
  { key: 'deepResearch', wants: true, chatGPT: 'partial', claude: false, perplexity: true, manus: 'partial', gemini: 'partial', copilot: 'partial' },
  { key: 'interactiveLearning', wants: true, chatGPT: 'partial', claude: 'partial', perplexity: false, manus: false, gemini: 'partial', copilot: false },
  { key: 'contextualTools', wants: true, chatGPT: false, claude: false, perplexity: false, manus: false, gemini: false, copilot: false },
  { key: 'fileProcessing', wants: true, chatGPT: 'partial', claude: 'partial', perplexity: false, manus: 'partial', gemini: 'partial', copilot: 'partial' },
  { key: 'workflowAutomation', wants: true, chatGPT: false, claude: false, perplexity: false, manus: true, gemini: false, copilot: 'partial' },
  { key: 'webScreenshot', wants: true, chatGPT: false, claude: false, perplexity: 'partial', manus: true, gemini: false, copilot: false },
  { key: 'contextIntelligence', wants: true, chatGPT: 'partial', claude: 'partial', perplexity: false, manus: 'partial', gemini: 'partial', copilot: 'partial' },
  { key: 'planningGoals', wants: true, chatGPT: false, claude: false, perplexity: false, manus: 'partial', gemini: false, copilot: false },
  { key: 'writingAssistance', wants: true, chatGPT: true, claude: true, perplexity: 'partial', manus: 'partial', gemini: true, copilot: true },
  { key: 'multiAgent', wants: true, chatGPT: false, claude: false, perplexity: false, manus: true, gemini: false, copilot: false },
  { key: 'apiIntegrations', wants: true, chatGPT: 'partial', claude: false, perplexity: false, manus: 'partial', gemini: 'partial', copilot: 'partial' },
  { key: 'aiModelSupport', wants: true, chatGPT: false, claude: false, perplexity: 'partial', manus: 'partial', gemini: false, copilot: false },
  { key: 'industryTools', wants: true, chatGPT: false, claude: false, perplexity: false, manus: false, gemini: false, copilot: false },
  { key: 'realtimeCollab', wants: true, chatGPT: 'partial', claude: false, perplexity: false, manus: false, gemini: 'partial', copilot: 'partial' },
];

interface CompetitorInfo {
  key: keyof Omit<Feature, 'key'>;
  nameKey: string;
}

const competitorData: CompetitorInfo[] = [
  { key: 'wants', nameKey: 'wants' },
  { key: 'chatGPT', nameKey: 'chatGPT' },
  { key: 'claude', nameKey: 'claude' },
  { key: 'perplexity', nameKey: 'perplexity' },
  { key: 'manus', nameKey: 'manus' },
  { key: 'gemini', nameKey: 'gemini' },
  { key: 'copilot', nameKey: 'copilot' },
];

const ComparisonTable: React.FC = () => {
  const { t } = useTranslation();
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);

  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      checkScrollPosition();
      return () => container.removeEventListener('scroll', checkScrollPosition);
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const renderIcon = (value: boolean | 'partial', isWants: boolean = false) => {
    if (value === true) {
      return (
        <div className={`flex items-center justify-center ${isWants ? 'text-emerald-400' : 'text-emerald-500'}`}>
          <Check className="w-5 h-5 md:w-6 md:h-6" />
        </div>
      );
    }
    if (value === 'partial') {
      return (
        <div className="flex items-center justify-center text-amber-500">
          <Minus className="w-5 h-5 md:w-6 md:h-6" />
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center text-gray-600">
        <X className="w-5 h-5 md:w-6 md:h-6" />
      </div>
    );
  };

  return (
    <section className="py-20 bg-gray-950 relative overflow-hidden">
      {/* Background - matching login page */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <motion.div
        className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl"
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium mb-4">
            {t('landing.comparison.badge')}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('landing.comparison.title')}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"> {t('landing.comparison.titleHighlight')}</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            {t('landing.comparison.subtitle')}
          </p>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto relative"
        >
          {/* Scroll Indicators */}
          <div className="md:hidden flex items-center justify-center gap-2 mb-4 text-gray-400 text-sm">
            <ChevronLeft className="w-4 h-4" />
            <span>{t('landing.comparison.scrollToCompare')}</span>
            <ChevronRight className="w-4 h-4" />
          </div>

          {/* Scroll Buttons */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-gray-900/90 border border-gray-700 rounded-full p-2 shadow-lg hover:bg-gray-800 transition-colors md:hidden"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
          )}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-gray-900/90 border border-gray-700 rounded-full p-2 shadow-lg hover:bg-gray-800 transition-colors md:hidden"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          )}

          {/* Gradient fade indicators */}
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-950 to-transparent z-10 pointer-events-none md:hidden" />
          )}
          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-950 to-transparent z-10 pointer-events-none md:hidden" />
          )}

          <div
            ref={scrollContainerRef}
            className="overflow-x-auto rounded-2xl border border-gray-800 bg-gray-900/50 backdrop-blur-xl dark-scrollbar-auto"
          >
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left p-4 md:p-6 text-white font-semibold sticky left-0 bg-gray-900/95 backdrop-blur-sm z-10 min-w-[180px]">
                    {t('landing.comparison.features')}
                  </th>
                  {competitorData.map((competitor) => (
                    <th key={competitor.key} className="p-3 md:p-4 text-center min-w-[100px]">
                      {competitor.key === 'wants' ? (
                        <div className="relative">
                          <div className="absolute -inset-2 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-xl blur-lg" />
                          <div className="relative bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-xl px-2 py-2 md:px-4 md:py-3 border border-teal-500/30">
                            <div className="flex items-center justify-center gap-1 md:gap-2 mb-1">
                              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />
                              <span className="text-white font-bold text-sm md:text-lg">{t(`landing.comparison.competitors.${competitor.nameKey}.name`)}</span>
                            </div>
                            <span className="text-[10px] md:text-xs text-emerald-400">{t(`landing.comparison.competitors.${competitor.nameKey}.subtitle`)}</span>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-white font-semibold mb-1 text-sm md:text-base">{t(`landing.comparison.competitors.${competitor.nameKey}.name`)}</div>
                          <span className="text-[10px] md:text-xs text-gray-400">{t(`landing.comparison.competitors.${competitor.nameKey}.subtitle`)}</span>
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {featureData.map((feature, index) => (
                  <motion.tr
                    key={feature.key}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-gray-800/50 hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="p-4 md:p-6 text-white/90 text-sm md:text-base sticky left-0 bg-gray-900/95 backdrop-blur-sm z-10">
                      {t(`landing.comparison.featureNames.${feature.key}`)}
                    </td>
                    {competitorData.map((competitor) => (
                      <td
                        key={competitor.key}
                        className={`p-3 md:p-4 ${competitor.key === 'wants' ? 'bg-gradient-to-br from-emerald-500/5 to-cyan-500/5' : ''}`}
                      >
                        {renderIcon(feature[competitor.key], competitor.key === 'wants')}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-800">
                  <td className="p-4 md:p-6 text-white font-semibold sticky left-0 bg-gray-900/95 backdrop-blur-sm z-10 text-sm md:text-base">
                    {t('landing.comparison.uniqueValue')}
                  </td>
                  {competitorData.map((competitor) => (
                    <td
                      key={competitor.key}
                      className={`p-3 md:p-4 ${competitor.key === 'wants' ? 'bg-gradient-to-br from-emerald-500/5 to-cyan-500/5' : ''}`}
                    >
                      <div className="flex items-center justify-center">
                        {competitor.key === 'wants' ? (
                          <span className="text-sm md:text-lg font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent whitespace-nowrap">
                            {t(`landing.comparison.competitors.${competitor.nameKey}.uniqueValue`)}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs md:text-sm whitespace-nowrap">
                            {t(`landing.comparison.competitors.${competitor.nameKey}.uniqueValue`)}
                          </span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Legend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4 md:gap-6"
          >
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-400" />
              <span className="text-gray-400 text-sm">{t('landing.comparison.fullSupport')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Minus className="w-5 h-5 text-amber-500" />
              <span className="text-gray-400 text-sm">{t('landing.comparison.partialLimited')}</span>
            </div>
            <div className="flex items-center gap-2">
              <X className="w-5 h-5 text-gray-600" />
              <span className="text-gray-400 text-sm">{t('landing.comparison.notAvailable')}</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default ComparisonTable;
