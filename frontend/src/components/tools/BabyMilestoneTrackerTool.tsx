import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Baby, Star, Check, Clock, Camera, Heart, Brain, Hand, MessageCircle, Users, Info, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface BabyMilestoneTrackerToolProps {
  uiConfig?: UIConfig;
}

type MilestoneCategory = 'motor' | 'cognitive' | 'social' | 'language';

interface Milestone {
  id: string;
  name: string;
  description: string;
  ageMonths: number;
  category: MilestoneCategory;
  importance: 'critical' | 'important' | 'normal';
}

const milestones: Milestone[] = [
  // Motor milestones
  { id: 'm1', name: 'Lifts head briefly', description: 'When on tummy, lifts head briefly', ageMonths: 1, category: 'motor', importance: 'normal' },
  { id: 'm2', name: 'Holds head steady', description: 'Can hold head steady when held upright', ageMonths: 2, category: 'motor', importance: 'important' },
  { id: 'm3', name: 'Pushes up on arms', description: 'When on tummy, pushes up on arms', ageMonths: 3, category: 'motor', importance: 'normal' },
  { id: 'm4', name: 'Rolls over', description: 'Rolls from tummy to back and back to tummy', ageMonths: 4, category: 'motor', importance: 'important' },
  { id: 'm5', name: 'Sits with support', description: 'Sits with support, holds head steady', ageMonths: 4, category: 'motor', importance: 'normal' },
  { id: 'm6', name: 'Sits without support', description: 'Sits without support for short periods', ageMonths: 6, category: 'motor', importance: 'critical' },
  { id: 'm7', name: 'Crawls', description: 'Crawls on hands and knees', ageMonths: 9, category: 'motor', importance: 'important' },
  { id: 'm8', name: 'Pulls to stand', description: 'Pulls self up to standing position', ageMonths: 9, category: 'motor', importance: 'important' },
  { id: 'm9', name: 'Cruises furniture', description: 'Walks while holding onto furniture', ageMonths: 10, category: 'motor', importance: 'normal' },
  { id: 'm10', name: 'First steps', description: 'Takes first independent steps', ageMonths: 12, category: 'motor', importance: 'critical' },
  { id: 'm11', name: 'Walks well', description: 'Walks steadily without falling often', ageMonths: 15, category: 'motor', importance: 'important' },
  { id: 'm12', name: 'Runs', description: 'Runs with good coordination', ageMonths: 24, category: 'motor', importance: 'normal' },

  // Cognitive milestones
  { id: 'c1', name: 'Follows moving objects', description: 'Eyes follow moving objects', ageMonths: 1, category: 'cognitive', importance: 'important' },
  { id: 'c2', name: 'Recognizes familiar faces', description: 'Recognizes parents and caregivers', ageMonths: 2, category: 'cognitive', importance: 'important' },
  { id: 'c3', name: 'Reaches for objects', description: 'Reaches for and grasps objects', ageMonths: 4, category: 'cognitive', importance: 'normal' },
  { id: 'c4', name: 'Object permanence begins', description: 'Looks for partially hidden objects', ageMonths: 6, category: 'cognitive', importance: 'important' },
  { id: 'c5', name: 'Transfers objects', description: 'Passes objects from hand to hand', ageMonths: 6, category: 'cognitive', importance: 'normal' },
  { id: 'c6', name: 'Pincer grasp', description: 'Uses thumb and finger to pick up small objects', ageMonths: 9, category: 'cognitive', importance: 'critical' },
  { id: 'c7', name: 'Understands "no"', description: 'Responds to "no" and simple commands', ageMonths: 9, category: 'cognitive', importance: 'important' },
  { id: 'c8', name: 'Points to show interest', description: 'Points at objects to show interest', ageMonths: 12, category: 'cognitive', importance: 'critical' },
  { id: 'c9', name: 'Stacks blocks', description: 'Can stack 2-4 blocks', ageMonths: 15, category: 'cognitive', importance: 'normal' },
  { id: 'c10', name: 'Sorts shapes', description: 'Can sort shapes and colors', ageMonths: 24, category: 'cognitive', importance: 'normal' },

  // Social milestones
  { id: 's1', name: 'Social smile', description: 'Smiles in response to others', ageMonths: 2, category: 'social', importance: 'critical' },
  { id: 's2', name: 'Laughs', description: 'Laughs out loud', ageMonths: 4, category: 'social', importance: 'normal' },
  { id: 's3', name: 'Stranger anxiety', description: 'Shows anxiety around strangers', ageMonths: 6, category: 'social', importance: 'normal' },
  { id: 's4', name: 'Plays peek-a-boo', description: 'Enjoys and participates in peek-a-boo', ageMonths: 9, category: 'social', importance: 'normal' },
  { id: 's5', name: 'Waves bye-bye', description: 'Waves goodbye', ageMonths: 10, category: 'social', importance: 'important' },
  { id: 's6', name: 'Imitates actions', description: 'Imitates actions like clapping', ageMonths: 12, category: 'social', importance: 'important' },
  { id: 's7', name: 'Parallel play', description: 'Plays alongside other children', ageMonths: 18, category: 'social', importance: 'normal' },
  { id: 's8', name: 'Shows empathy', description: 'Shows concern when others are upset', ageMonths: 24, category: 'social', importance: 'normal' },

  // Language milestones
  { id: 'l1', name: 'Coos', description: 'Makes cooing sounds', ageMonths: 2, category: 'language', importance: 'normal' },
  { id: 'l2', name: 'Babbles', description: 'Babbles with consonant sounds (ba-ba, da-da)', ageMonths: 6, category: 'language', importance: 'important' },
  { id: 'l3', name: 'Responds to name', description: 'Turns when name is called', ageMonths: 7, category: 'language', importance: 'critical' },
  { id: 'l4', name: 'First words', description: 'Says first meaningful words (mama, dada)', ageMonths: 12, category: 'language', importance: 'critical' },
  { id: 'l5', name: 'Follows simple directions', description: 'Follows one-step directions', ageMonths: 12, category: 'language', importance: 'important' },
  { id: 'l6', name: '10+ words', description: 'Uses 10 or more words', ageMonths: 18, category: 'language', importance: 'important' },
  { id: 'l7', name: 'Two-word phrases', description: 'Combines two words together', ageMonths: 24, category: 'language', importance: 'critical' },
  { id: 'l8', name: '50+ words', description: 'Uses 50 or more words', ageMonths: 24, category: 'language', importance: 'important' },
];

const categoryInfo = {
  motor: { name: 'Motor Skills', icon: Hand, color: 'blue' },
  cognitive: { name: 'Cognitive', icon: Brain, color: 'purple' },
  social: { name: 'Social-Emotional', icon: Users, color: 'pink' },
  language: { name: 'Language', icon: MessageCircle, color: 'green' },
};

export const BabyMilestoneTrackerTool: React.FC<BabyMilestoneTrackerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [birthDate, setBirthDate] = useState('');
  const [completedMilestones, setCompletedMilestones] = useState<Set<string>>(new Set());
  const [completionDates, setCompletionDates] = useState<{ [key: string]: string }>({});
  const [expandedCategory, setExpandedCategory] = useState<MilestoneCategory | null>('motor');
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.content) {
        const dateMatch = params.content.match(/\d{4}-\d{2}-\d{2}/);
        if (dateMatch) {
          setBirthDate(dateMatch[0]);
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);

  const babyAgeMonths = useMemo(() => {
    if (!birthDate) return 0;
    const birth = new Date(birthDate);
    const today = new Date();
    const months = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
    return Math.max(0, months);
  }, [birthDate]);

  const toggleMilestone = (id: string) => {
    setCompletedMilestones((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        const newDates = { ...completionDates };
        delete newDates[id];
        setCompletionDates(newDates);
      } else {
        next.add(id);
        setCompletionDates((prev) => ({
          ...prev,
          [id]: new Date().toISOString().split('T')[0],
        }));
      }
      return next;
    });
  };

  const getMilestoneStatus = (milestone: Milestone) => {
    if (completedMilestones.has(milestone.id)) return 'completed';
    if (babyAgeMonths >= milestone.ageMonths + 3) return 'delayed';
    if (babyAgeMonths >= milestone.ageMonths) return 'due';
    return 'upcoming';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return isDark ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200';
      case 'delayed':
        return isDark ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200';
      case 'due':
        return isDark ? 'bg-yellow-900/30 border-yellow-700' : 'bg-yellow-50 border-yellow-200';
      default:
        return isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200';
    }
  };

  const getCategoryColor = (category: MilestoneCategory) => {
    const colors = {
      motor: isDark ? 'text-blue-400' : 'text-blue-600',
      cognitive: isDark ? 'text-purple-400' : 'text-purple-600',
      social: isDark ? 'text-pink-400' : 'text-pink-600',
      language: isDark ? 'text-green-400' : 'text-green-600',
    };
    return colors[category];
  };

  const stats = useMemo(() => {
    const byCategory: { [key: string]: { completed: number; total: number } } = {
      motor: { completed: 0, total: 0 },
      cognitive: { completed: 0, total: 0 },
      social: { completed: 0, total: 0 },
      language: { completed: 0, total: 0 },
    };

    const relevantMilestones = milestones.filter((m) => m.ageMonths <= babyAgeMonths + 6);

    relevantMilestones.forEach((m) => {
      byCategory[m.category].total++;
      if (completedMilestones.has(m.id)) {
        byCategory[m.category].completed++;
      }
    });

    const totalCompleted = Object.values(byCategory).reduce((sum, c) => sum + c.completed, 0);
    const totalRelevant = Object.values(byCategory).reduce((sum, c) => sum + c.total, 0);

    return { byCategory, totalCompleted, totalRelevant };
  }, [babyAgeMonths, completedMilestones]);

  const groupedMilestones = useMemo(() => {
    return {
      motor: milestones.filter((m) => m.category === 'motor'),
      cognitive: milestones.filter((m) => m.category === 'cognitive'),
      social: milestones.filter((m) => m.category === 'social'),
      language: milestones.filter((m) => m.category === 'language'),
    };
  }, []);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-2xl mx-auto">
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
          {/* Header */}
          <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#0D9488]/10 rounded-lg">
                <Star className="w-5 h-5 text-[#0D9488]" />
              </div>
              <div>
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.babyMilestoneTracker.babyMilestoneTracker', 'Baby Milestone Tracker')}
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.babyMilestoneTracker.trackDevelopmentalMilestones', 'Track developmental milestones')}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Prefill indicator */}
            {isPrefilled && (
              <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
                <Sparkles className="w-4 h-4 text-[#0D9488]" />
                <span className="text-sm text-[#0D9488] font-medium">
                  {t('tools.babyMilestoneTracker.dateLoadedFromYourConversation', 'Date loaded from your conversation')}
                </span>
              </div>
            )}

            {/* Birth Date Input */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.babyMilestoneTracker.babySBirthDate', 'Baby\'s Birth Date')}
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>

            {birthDate && (
              <>
                {/* Baby Age */}
                <div className={`p-4 rounded-xl text-center ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.babyMilestoneTracker.babySAge', 'Baby\'s Age')}
                  </div>
                  <div className="text-3xl font-bold text-[#0D9488]">
                    {babyAgeMonths} months
                  </div>
                </div>

                {/* Progress Overview */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.babyMilestoneTracker.overallProgress', 'Overall Progress')}
                    </span>
                    <span className="text-[#0D9488] font-bold">
                      {stats.totalCompleted}/{stats.totalRelevant} milestones
                    </span>
                  </div>
                  <div className={`h-3 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#0D9488] to-[#0F766E] transition-all"
                      style={{ width: `${stats.totalRelevant > 0 ? (stats.totalCompleted / stats.totalRelevant) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Category Stats */}
                <div className="grid grid-cols-2 gap-3">
                  {(Object.keys(categoryInfo) as MilestoneCategory[]).map((category) => {
                    const info = categoryInfo[category];
                    const stat = stats.byCategory[category];
                    const Icon = info.icon;
                    const progress = stat.total > 0 ? (stat.completed / stat.total) * 100 : 0;

                    return (
                      <div
                        key={category}
                        className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className={`w-4 h-4 ${getCategoryColor(category)}`} />
                          <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {info.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`flex-1 h-2 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                            <div
                              className={`h-full rounded-full transition-all ${
                                category === 'motor' ? 'bg-blue-500' :
                                category === 'cognitive' ? 'bg-purple-500' :
                                category === 'social' ? 'bg-pink-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {stat.completed}/{stat.total}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Milestone Categories */}
                <div className="space-y-3">
                  {(Object.keys(categoryInfo) as MilestoneCategory[]).map((category) => {
                    const info = categoryInfo[category];
                    const Icon = info.icon;
                    const categoryMilestones = groupedMilestones[category];

                    return (
                      <div
                        key={category}
                        className={`rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
                      >
                        <button
                          onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                          className="w-full flex items-center justify-between p-4"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`w-5 h-5 ${getCategoryColor(category)}`} />
                            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {info.name}
                            </span>
                          </div>
                          {expandedCategory === category ? (
                            <ChevronUp className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          ) : (
                            <ChevronDown className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          )}
                        </button>

                        {expandedCategory === category && (
                          <div className={`p-4 pt-0 space-y-2`}>
                            {categoryMilestones.map((milestone) => {
                              const status = getMilestoneStatus(milestone);
                              const isCompleted = completedMilestones.has(milestone.id);

                              return (
                                <div
                                  key={milestone.id}
                                  className={`p-3 rounded-lg border ${getStatusColor(status)}`}
                                >
                                  <div className="flex items-start gap-3">
                                    <button
                                      onClick={() => toggleMilestone(milestone.id)}
                                      className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                        isCompleted
                                          ? 'bg-green-500 border-green-500 text-white'
                                          : isDark
                                          ? 'border-gray-500 hover:border-green-500'
                                          : 'border-gray-300 hover:border-green-500'
                                      }`}
                                    >
                                      {isCompleted && <Check className="w-3 h-3" />}
                                    </button>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                          {milestone.name}
                                        </span>
                                        {milestone.importance === 'critical' && (
                                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                        )}
                                      </div>
                                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {milestone.description}
                                      </p>
                                      <div className="flex items-center gap-3 mt-1">
                                        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                          Expected: {milestone.ageMonths} months
                                        </span>
                                        {status === 'delayed' && !isCompleted && (
                                          <span className="text-xs text-red-500">
                                            {t('tools.babyMilestoneTracker.discussWithPediatrician', 'Discuss with pediatrician')}
                                          </span>
                                        )}
                                        {isCompleted && completionDates[milestone.id] && (
                                          <span className="text-xs text-green-500">
                                            Achieved: {completionDates[milestone.id]}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Tips */}
            <div className={`p-4 rounded-lg border-l-4 border-[#0D9488] ${isDark ? 'bg-gray-700' : 'bg-teal-50'}`}>
              <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.babyMilestoneTracker.tipsForParents', 'Tips for Parents')}
              </h4>
              <ul className="space-y-1 text-sm">
                <li className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  {t('tools.babyMilestoneTracker.everyBabyDevelopsAtTheir', '• Every baby develops at their own pace - ranges are normal')}
                </li>
                <li className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  {t('tools.babyMilestoneTracker.prematureBabiesMayReachMilestones', '• Premature babies may reach milestones later (adjust for gestational age)')}
                </li>
                <li className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  {t('tools.babyMilestoneTracker.criticalMilestonesMarkedWithStar', '• Critical milestones (marked with star) warrant discussion if missed')}
                </li>
                <li className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  {t('tools.babyMilestoneTracker.regularWellBabyVisitsHelp', '• Regular well-baby visits help track development')}
                </li>
              </ul>
            </div>

            {/* Info Note */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <div className="flex items-start gap-2">
                <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.babyMilestoneTracker.theseMilestonesAreGeneralGuidelines', 'These milestones are general guidelines based on typical development. If you have concerns about your child\'s development, please consult with your pediatrician. Early intervention can be very beneficial.')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BabyMilestoneTrackerTool;
