import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Flower2, Home, Calendar, CheckSquare, Clock, Sparkles, Info, Trash2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type HomeType = 'apartment' | 'small-house' | 'medium-house' | 'large-house';
type Priority = 'essential' | 'thorough' | 'complete';

interface CleaningTask {
  id: string;
  name: string;
  category: string;
  duration: number;
  priority: Priority;
  tips?: string;
}

interface SpringCleaningToolProps {
  uiConfig?: UIConfig;
}

export const SpringCleaningTool: React.FC<SpringCleaningToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [homeType, setHomeType] = useState<HomeType>('medium-house');
  const [priority, setPriority] = useState<Priority>('thorough');
  const [activeCategory, setActiveCategory] = useState<string>('kitchen');
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [daysAvailable, setDaysAvailable] = useState('7');
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;

      if (params.homeType) {
        setHomeType(params.homeType as HomeType);
        setIsPrefilled(true);
      }
      if (params.priority) {
        setPriority(params.priority as Priority);
        setIsPrefilled(true);
      }
      if (params.days !== undefined) {
        setDaysAvailable(String(params.days));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const homeTypes = {
    apartment: { name: 'Apartment', multiplier: 0.6 },
    'small-house': { name: 'Small House', multiplier: 0.8 },
    'medium-house': { name: 'Medium House', multiplier: 1 },
    'large-house': { name: 'Large House', multiplier: 1.4 },
  };

  const priorities = {
    essential: { name: 'Essential Only', description: 'Key tasks only - quick refresh' },
    thorough: { name: 'Thorough', description: 'Most tasks - good deep clean' },
    complete: { name: 'Complete', description: 'Everything - full spring cleaning' },
  };

  const categories = [
    { id: 'kitchen', name: 'Kitchen', icon: 'utensils' },
    { id: 'bathroom', name: 'Bathrooms', icon: 'bath' },
    { id: 'bedroom', name: 'Bedrooms', icon: 'bed' },
    { id: 'living', name: 'Living Areas', icon: 'sofa' },
    { id: 'outdoors', name: 'Outdoors', icon: 'sun' },
    { id: 'general', name: 'Whole Home', icon: 'home' },
  ];

  const allTasks: CleaningTask[] = [
    // Kitchen
    { id: 'k1', name: 'Deep clean refrigerator inside & out', category: 'kitchen', duration: 45, priority: 'essential', tips: 'Remove all items, check expiration dates, clean shelves' },
    { id: 'k2', name: 'Clean and organize freezer', category: 'kitchen', duration: 30, priority: 'thorough', tips: 'Defrost if needed, toss old items' },
    { id: 'k3', name: 'Clean oven and stovetop thoroughly', category: 'kitchen', duration: 60, priority: 'essential', tips: 'Use oven cleaner overnight for best results' },
    { id: 'k4', name: 'Clean microwave inside & out', category: 'kitchen', duration: 15, priority: 'essential', tips: 'Steam with lemon water for easy cleaning' },
    { id: 'k5', name: 'Empty and clean all cabinets', category: 'kitchen', duration: 90, priority: 'complete', tips: 'Check for expired spices and pantry items' },
    { id: 'k6', name: 'Clean dishwasher with vinegar cycle', category: 'kitchen', duration: 10, priority: 'thorough' },
    { id: 'k7', name: 'Descale coffee maker', category: 'kitchen', duration: 20, priority: 'thorough' },
    { id: 'k8', name: 'Clean range hood and filter', category: 'kitchen', duration: 30, priority: 'thorough', tips: 'Soak filter in degreaser' },
    { id: 'k9', name: 'Wipe down all small appliances', category: 'kitchen', duration: 20, priority: 'essential' },
    { id: 'k10', name: 'Clean garbage disposal', category: 'kitchen', duration: 10, priority: 'thorough', tips: 'Use ice cubes and citrus peels' },
    { id: 'k11', name: 'Organize pantry and food storage', category: 'kitchen', duration: 45, priority: 'complete' },
    { id: 'k12', name: 'Clean behind and under refrigerator', category: 'kitchen', duration: 30, priority: 'complete' },

    // Bathroom
    { id: 'b1', name: 'Deep clean toilet (inside, outside, behind)', category: 'bathroom', duration: 20, priority: 'essential' },
    { id: 'b2', name: 'Scrub shower/tub and tile grout', category: 'bathroom', duration: 45, priority: 'essential', tips: 'Use grout cleaner and let sit' },
    { id: 'b3', name: 'Clean exhaust fan', category: 'bathroom', duration: 15, priority: 'thorough' },
    { id: 'b4', name: 'Descale showerhead', category: 'bathroom', duration: 10, priority: 'thorough', tips: 'Soak in vinegar overnight' },
    { id: 'b5', name: 'Wash shower curtain/liner', category: 'bathroom', duration: 10, priority: 'thorough' },
    { id: 'b6', name: 'Organize medicine cabinet, check expirations', category: 'bathroom', duration: 20, priority: 'essential' },
    { id: 'b7', name: 'Clean and organize under sink', category: 'bathroom', duration: 20, priority: 'complete' },
    { id: 'b8', name: 'Wash bath mats and towels', category: 'bathroom', duration: 15, priority: 'essential' },
    { id: 'b9', name: 'Clean mirrors and glass', category: 'bathroom', duration: 10, priority: 'essential' },
    { id: 'b10', name: 'Replace old toothbrushes and razors', category: 'bathroom', duration: 5, priority: 'thorough' },

    // Bedroom
    { id: 'br1', name: 'Wash all bedding including mattress pad', category: 'bedroom', duration: 20, priority: 'essential' },
    { id: 'br2', name: 'Flip/rotate mattress', category: 'bedroom', duration: 15, priority: 'thorough' },
    { id: 'br3', name: 'Vacuum mattress', category: 'bedroom', duration: 15, priority: 'thorough', tips: 'Sprinkle baking soda first' },
    { id: 'br4', name: 'Deep clean closet, declutter clothes', category: 'bedroom', duration: 90, priority: 'essential', tips: 'Donate items not worn in 1 year' },
    { id: 'br5', name: 'Wash pillows', category: 'bedroom', duration: 15, priority: 'thorough' },
    { id: 'br6', name: 'Clean under bed', category: 'bedroom', duration: 20, priority: 'essential' },
    { id: 'br7', name: 'Dust ceiling fan and light fixtures', category: 'bedroom', duration: 15, priority: 'thorough' },
    { id: 'br8', name: 'Wash curtains or clean blinds', category: 'bedroom', duration: 30, priority: 'complete' },
    { id: 'br9', name: 'Organize dresser drawers', category: 'bedroom', duration: 30, priority: 'complete' },
    { id: 'br10', name: 'Clean nightstands and dust furniture', category: 'bedroom', duration: 20, priority: 'essential' },

    // Living Areas
    { id: 'l1', name: 'Deep clean upholstered furniture', category: 'living', duration: 45, priority: 'essential', tips: 'Vacuum with upholstery attachment' },
    { id: 'l2', name: 'Clean under sofa cushions', category: 'living', duration: 15, priority: 'essential' },
    { id: 'l3', name: 'Dust all decorative items', category: 'living', duration: 30, priority: 'thorough' },
    { id: 'l4', name: 'Clean TV screen and electronics', category: 'living', duration: 15, priority: 'thorough', tips: 'Use microfiber cloth only' },
    { id: 'l5', name: 'Wash throw blankets and pillow covers', category: 'living', duration: 15, priority: 'essential' },
    { id: 'l6', name: 'Clean lampshades', category: 'living', duration: 15, priority: 'complete' },
    { id: 'l7', name: 'Organize bookshelves', category: 'living', duration: 30, priority: 'complete' },
    { id: 'l8', name: 'Clean fireplace (if applicable)', category: 'living', duration: 45, priority: 'complete' },
    { id: 'l9', name: 'Dust and clean baseboards', category: 'living', duration: 30, priority: 'thorough' },
    { id: 'l10', name: 'Shampoo or deep clean carpets', category: 'living', duration: 90, priority: 'complete' },

    // Outdoors
    { id: 'o1', name: 'Clean outdoor furniture', category: 'outdoors', duration: 45, priority: 'essential' },
    { id: 'o2', name: 'Wash windows (exterior)', category: 'outdoors', duration: 60, priority: 'thorough' },
    { id: 'o3', name: 'Clean grill', category: 'outdoors', duration: 30, priority: 'thorough' },
    { id: 'o4', name: 'Power wash patio/deck', category: 'outdoors', duration: 90, priority: 'complete' },
    { id: 'o5', name: 'Clean garage floor', category: 'outdoors', duration: 60, priority: 'complete' },
    { id: 'o6', name: 'Clean out garden shed', category: 'outdoors', duration: 45, priority: 'complete' },
    { id: 'o7', name: 'Clear debris from gutters', category: 'outdoors', duration: 60, priority: 'thorough' },
    { id: 'o8', name: 'Clean front door and entryway', category: 'outdoors', duration: 20, priority: 'essential' },

    // Whole Home
    { id: 'g1', name: 'Wash windows (interior)', category: 'general', duration: 60, priority: 'essential' },
    { id: 'g2', name: 'Clean all light switches and door handles', category: 'general', duration: 20, priority: 'essential' },
    { id: 'g3', name: 'Replace HVAC filters', category: 'general', duration: 10, priority: 'essential' },
    { id: 'g4', name: 'Clean air vents throughout home', category: 'general', duration: 30, priority: 'thorough' },
    { id: 'g5', name: 'Test smoke/CO detectors, replace batteries', category: 'general', duration: 15, priority: 'essential' },
    { id: 'g6', name: 'Dust ceiling fans throughout', category: 'general', duration: 30, priority: 'thorough' },
    { id: 'g7', name: 'Clean all baseboards', category: 'general', duration: 60, priority: 'complete' },
    { id: 'g8', name: 'Wipe down all doors and door frames', category: 'general', duration: 45, priority: 'complete' },
    { id: 'g9', name: 'Clean and organize storage areas', category: 'general', duration: 90, priority: 'complete' },
    { id: 'g10', name: 'Deep clean floors (mop/polish)', category: 'general', duration: 60, priority: 'essential' },
  ];

  const filteredTasks = useMemo(() => {
    const priorityOrder: Record<Priority, number> = {
      essential: 1,
      thorough: 2,
      complete: 3,
    };

    return allTasks.filter(task => {
      const taskPriorityNum = priorityOrder[task.priority];
      const selectedPriorityNum = priorityOrder[priority];
      return task.category === activeCategory && taskPriorityNum <= selectedPriorityNum;
    });
  }, [activeCategory, priority]);

  const calculations = useMemo(() => {
    const homeMultiplier = homeTypes[homeType].multiplier;
    const priorityOrder: Record<Priority, number> = {
      essential: 1,
      thorough: 2,
      complete: 3,
    };
    const selectedPriorityNum = priorityOrder[priority];

    const applicableTasks = allTasks.filter(task =>
      priorityOrder[task.priority] <= selectedPriorityNum
    );

    const totalMinutes = Math.round(
      applicableTasks.reduce((sum, task) => sum + task.duration, 0) * homeMultiplier
    );

    const categoryBreakdown = categories.map(cat => {
      const catTasks = applicableTasks.filter(t => t.category === cat.id);
      return {
        ...cat,
        tasks: catTasks.length,
        minutes: Math.round(catTasks.reduce((sum, t) => sum + t.duration, 0) * homeMultiplier),
        completed: catTasks.filter(t => completedTasks.has(t.id)).length,
      };
    });

    const days = parseInt(daysAvailable) || 7;
    const minutesPerDay = Math.ceil(totalMinutes / days);

    const completedMinutes = Math.round(
      applicableTasks
        .filter(t => completedTasks.has(t.id))
        .reduce((sum, t) => sum + t.duration, 0) * homeMultiplier
    );

    const progressPercent = totalMinutes > 0
      ? Math.round((completedMinutes / totalMinutes) * 100)
      : 0;

    return {
      totalTasks: applicableTasks.length,
      totalMinutes,
      totalHours: Math.round(totalMinutes / 60 * 10) / 10,
      categoryBreakdown,
      minutesPerDay,
      hoursPerDay: Math.round(minutesPerDay / 60 * 10) / 10,
      completedTasks: completedTasks.size,
      completedMinutes,
      progressPercent,
    };
  }, [homeType, priority, daysAvailable, completedTasks]);

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const resetProgress = () => {
    setCompletedTasks(new Set());
  };

  const getCategoryCompleted = (categoryId: string) => {
    const catTasks = filteredTasks.filter(t => t.category === categoryId);
    const completed = catTasks.filter(t => completedTasks.has(t.id)).length;
    return { completed, total: catTasks.length };
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg"><Flower2 className="w-5 h-5 text-teal-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.springCleaning.springCleaningChecklist', 'Spring Cleaning Checklist')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.springCleaning.completeRoomByRoomSpring', 'Complete room-by-room spring cleaning guide')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span className="text-sm text-teal-500 font-medium">{t('tools.springCleaning.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Home Type */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Home className="w-4 h-4 inline mr-1" />
            {t('tools.springCleaning.homeSize', 'Home Size')}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(homeTypes) as HomeType[]).map((type) => (
              <button
                key={type}
                onClick={() => setHomeType(type)}
                className={`py-2 px-2 rounded-lg text-sm text-center ${
                  homeType === type
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {homeTypes[type].name}
              </button>
            ))}
          </div>
        </div>

        {/* Priority & Days */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.springCleaning.cleaningLevel', 'Cleaning Level')}
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              {(Object.keys(priorities) as Priority[]).map((p) => (
                <option key={p} value={p}>{priorities[p].name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Calendar className="w-4 h-4 inline mr-1" />
              {t('tools.springCleaning.daysAvailable', 'Days Available')}
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={daysAvailable}
              onChange={(e) => setDaysAvailable(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>
        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          {priorities[priority].description}
        </p>

        {/* Progress Overview */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.springCleaning.overallProgress', 'Overall Progress')}</span>
            <div className="flex items-center gap-2">
              <span className="text-teal-500 font-bold">{calculations.progressPercent}%</span>
              <button
                onClick={resetProgress}
                className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                title={t('tools.springCleaning.resetProgress', 'Reset progress')}
              >
                <Trash2 className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
          <div className={`h-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div
              className="h-3 rounded-full bg-teal-500 transition-all duration-300"
              style={{ width: `${calculations.progressPercent}%` }}
            />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.springCleaning.tasks', 'Tasks')}</div>
              <div className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {calculations.completedTasks}/{calculations.totalTasks}
              </div>
            </div>
            <div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.springCleaning.totalTime', 'Total Time')}</div>
              <div className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {calculations.totalHours}h
              </div>
            </div>
            <div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.springCleaning.perDay', 'Per Day')}</div>
              <div className="font-bold text-teal-500">
                {calculations.hoursPerDay}h
              </div>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="overflow-x-auto">
          <div className="flex gap-2 min-w-max pb-2">
            {categories.map((cat) => {
              const stats = calculations.categoryBreakdown.find(c => c.id === cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`py-2 px-4 rounded-lg text-sm flex items-center gap-2 whitespace-nowrap ${
                    activeCategory === cat.id
                      ? 'bg-teal-500 text-white'
                      : isDark
                      ? 'bg-gray-800 text-gray-300'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeCategory === cat.id
                      ? 'bg-white/20'
                      : isDark
                      ? 'bg-gray-700'
                      : 'bg-gray-200'
                  }`}>
                    {stats?.completed || 0}/{stats?.tasks || 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Task List */}
        <div className={`rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} p-4`}>
          <h4 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <CheckSquare className="w-4 h-4 inline mr-2" />
            {categories.find(c => c.id === activeCategory)?.name} Tasks
          </h4>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {filteredTasks.length === 0 ? (
              <p className={`text-sm text-center py-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {t('tools.springCleaning.noTasksForThisCategory', 'No tasks for this category at the selected priority level')}
              </p>
            ) : (
              filteredTasks.map((task) => (
                <label
                  key={task.id}
                  className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    completedTasks.has(task.id)
                      ? isDark
                        ? 'bg-teal-900/30'
                        : 'bg-teal-100'
                      : isDark
                      ? 'bg-gray-700/50 hover:bg-gray-700'
                      : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={completedTasks.has(task.id)}
                    onChange={() => toggleTask(task.id)}
                    className="w-5 h-5 mt-0.5 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
                  />
                  <div className="flex-1">
                    <span className={`${completedTasks.has(task.id) ? 'line-through opacity-60' : ''} ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {task.name}
                    </span>
                    {task.tips && (
                      <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        Tip: {task.tips}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      task.priority === 'essential'
                        ? 'bg-red-500/20 text-red-500'
                        : task.priority === 'thorough'
                        ? 'bg-yellow-500/20 text-yellow-500'
                        : 'bg-green-500/20 text-green-500'
                    }`}>
                      {task.priority}
                    </span>
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      <Clock className="w-3 h-3 inline mr-1" />
                      {task.duration}m
                    </span>
                  </div>
                </label>
              ))
            )}
          </div>
        </div>

        {/* Category Summary */}
        <div className={`rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} p-4`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.springCleaning.timeByArea', 'Time by Area')}</h4>
          <div className="space-y-2">
            {calculations.categoryBreakdown
              .filter(cat => cat.tasks > 0)
              .map((cat) => (
                <div
                  key={cat.id}
                  className={`flex items-center justify-between p-2 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-white'}`}
                >
                  <div className="flex items-center gap-2">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{cat.name}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                      {cat.completed}/{cat.tasks}
                    </span>
                  </div>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {Math.round(cat.minutes / 60 * 10) / 10}h
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.springCleaning.springCleaningTips', 'Spring Cleaning Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>- Start at the top of each room and work down</li>
                <li>- Tackle one room completely before moving to the next</li>
                <li>- Open windows for ventilation while cleaning</li>
                <li>- Have donation bags ready for decluttering</li>
                <li>- Take breaks every 2 hours to avoid fatigue</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpringCleaningTool;
