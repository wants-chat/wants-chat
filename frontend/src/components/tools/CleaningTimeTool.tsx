import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Home, Sparkles, Plus, Minus, Info, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type CleaningLevel = 'light' | 'regular' | 'deep';

interface Room {
  id: string;
  name: string;
  baseTime: { light: number; regular: number; deep: number };
  icon: string;
}

interface CleaningTimeToolProps {
  uiConfig?: UIConfig;
}

export const CleaningTimeTool: React.FC<CleaningTimeToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [cleaningLevel, setCleaningLevel] = useState<CleaningLevel>('regular');
  const [roomCounts, setRoomCounts] = useState<Record<string, number>>({
    bedroom: 2,
    bathroom: 1,
    kitchen: 1,
    livingRoom: 1,
    diningRoom: 1,
    office: 0,
    laundry: 1,
    garage: 0,
    basement: 0,
    hallway: 1,
  });
  const [experienceLevel, setExperienceLevel] = useState<'beginner' | 'intermediate' | 'expert'>('intermediate');
  const [hasClutter, setHasClutter] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;

      if (params.cleaningLevel) {
        setCleaningLevel(params.cleaningLevel as CleaningLevel);
        setIsPrefilled(true);
      }
      if (params.rooms) {
        setRoomCounts(prev => ({ ...prev, ...params.rooms }));
        setIsPrefilled(true);
      }
      if (params.bedrooms !== undefined) {
        setRoomCounts(prev => ({ ...prev, bedroom: Number(params.bedrooms) }));
        setIsPrefilled(true);
      }
      if (params.bathrooms !== undefined) {
        setRoomCounts(prev => ({ ...prev, bathroom: Number(params.bathrooms) }));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const rooms: Room[] = [
    { id: 'bedroom', name: 'Bedroom', baseTime: { light: 10, regular: 20, deep: 45 }, icon: 'bed' },
    { id: 'bathroom', name: 'Bathroom', baseTime: { light: 10, regular: 20, deep: 40 }, icon: 'bath' },
    { id: 'kitchen', name: 'Kitchen', baseTime: { light: 15, regular: 30, deep: 60 }, icon: 'utensils' },
    { id: 'livingRoom', name: 'Living Room', baseTime: { light: 10, regular: 25, deep: 50 }, icon: 'sofa' },
    { id: 'diningRoom', name: 'Dining Room', baseTime: { light: 8, regular: 15, deep: 30 }, icon: 'table' },
    { id: 'office', name: 'Office/Study', baseTime: { light: 8, regular: 15, deep: 35 }, icon: 'desk' },
    { id: 'laundry', name: 'Laundry Room', baseTime: { light: 5, regular: 10, deep: 25 }, icon: 'washing' },
    { id: 'garage', name: 'Garage', baseTime: { light: 10, regular: 25, deep: 60 }, icon: 'car' },
    { id: 'basement', name: 'Basement', baseTime: { light: 15, regular: 30, deep: 75 }, icon: 'stairs' },
    { id: 'hallway', name: 'Hallway/Stairs', baseTime: { light: 5, regular: 10, deep: 20 }, icon: 'door' },
  ];

  const updateRoomCount = (roomId: string, delta: number) => {
    setRoomCounts(prev => ({
      ...prev,
      [roomId]: Math.max(0, Math.min(10, (prev[roomId] || 0) + delta)),
    }));
  };

  const calculations = useMemo(() => {
    const experienceMultiplier = {
      beginner: 1.3,
      intermediate: 1.0,
      expert: 0.75,
    }[experienceLevel];

    const clutterMultiplier = hasClutter ? 1.25 : 1.0;

    let totalMinutes = 0;
    const roomBreakdown: { name: string; count: number; time: number }[] = [];

    rooms.forEach(room => {
      const count = roomCounts[room.id] || 0;
      if (count > 0) {
        const baseTime = room.baseTime[cleaningLevel];
        const roomTime = Math.round(baseTime * count * experienceMultiplier * clutterMultiplier);
        totalMinutes += roomTime;
        roomBreakdown.push({
          name: room.name,
          count,
          time: roomTime,
        });
      }
    });

    const totalRooms = Object.values(roomCounts).reduce((sum, count) => sum + count, 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return {
      totalMinutes,
      hours,
      minutes,
      totalRooms,
      roomBreakdown,
      timeFormatted: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
    };
  }, [roomCounts, cleaningLevel, experienceLevel, hasClutter]);

  const cleaningLevels = {
    light: { name: 'Light Clean', description: 'Quick tidy, surface dusting, vacuum high-traffic areas' },
    regular: { name: 'Regular Clean', description: 'Standard cleaning, vacuuming, mopping, bathroom cleaning' },
    deep: { name: 'Deep Clean', description: 'Thorough cleaning including baseboards, appliances, windows' },
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg"><Clock className="w-5 h-5 text-teal-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.cleaningTime.cleaningTimeEstimator', 'Cleaning Time Estimator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.cleaningTime.estimateHowLongCleaningWill', 'Estimate how long cleaning will take')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span className="text-sm text-teal-500 font-medium">{t('tools.cleaningTime.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Cleaning Level Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.cleaningTime.cleaningLevel', 'Cleaning Level')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(cleaningLevels) as CleaningLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => setCleaningLevel(level)}
                className={`py-3 px-3 rounded-lg text-sm flex flex-col items-center gap-1 ${
                  cleaningLevel === level
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <span className="font-medium">{cleaningLevels[level].name}</span>
              </button>
            ))}
          </div>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {cleaningLevels[cleaningLevel].description}
          </p>
        </div>

        {/* Room Counts */}
        <div className="space-y-3">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Home className="w-4 h-4 inline mr-1" />
            {t('tools.cleaningTime.numberOfRooms', 'Number of Rooms')}
          </label>
          <div className="grid grid-cols-2 gap-3">
            {rooms.map((room) => (
              <div
                key={room.id}
                className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
              >
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{room.name}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateRoomCount(room.id, -1)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className={`w-8 text-center font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {roomCounts[room.id]}
                  </span>
                  <button
                    onClick={() => updateRoomCount(room.id, 1)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Experience Level & Options */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.cleaningTime.experienceLevel', 'Experience Level')}
            </label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value as 'beginner' | 'intermediate' | 'expert')}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              <option value="beginner">{t('tools.cleaningTime.beginner30', 'Beginner (+30%)')}</option>
              <option value="intermediate">{t('tools.cleaningTime.intermediate', 'Intermediate')}</option>
              <option value="expert">{t('tools.cleaningTime.expert25', 'Expert (-25%)')}</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.cleaningTime.clutterLevel', 'Clutter Level')}
            </label>
            <button
              onClick={() => setHasClutter(!hasClutter)}
              className={`w-full py-2 rounded-lg ${hasClutter ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {hasClutter ? t('tools.cleaningTime.cluttered25', 'Cluttered (+25%)') : t('tools.cleaningTime.tidy', 'Tidy')}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.cleaningTime.estimatedCleaningTime', 'Estimated Cleaning Time')}</div>
          <div className="text-5xl font-bold text-teal-500 my-2">
            {calculations.timeFormatted}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {calculations.totalRooms} room{calculations.totalRooms !== 1 ? 's' : ''} | {cleaningLevels[cleaningLevel].name}
          </div>
        </div>

        {/* Room Breakdown */}
        {calculations.roomBreakdown.length > 0 && (
          <div className={`rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} p-4`}>
            <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.cleaningTime.timeBreakdownByRoom', 'Time Breakdown by Room')}
            </h4>
            <div className="space-y-2">
              {calculations.roomBreakdown.map((room, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-2 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-white'}`}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-500" />
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                      {room.name} {room.count > 1 ? `(x${room.count})` : ''}
                    </span>
                  </div>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {room.time} min
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Schedule */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.cleaningTime.suggestedApproach', 'Suggested Approach')}</h4>
          <div className={`text-sm space-y-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {calculations.totalMinutes <= 60 && (
              <p>{t('tools.cleaningTime.thisIsAManageableSingle', 'This is a manageable single session. Perfect for a focused cleaning sprint!')}</p>
            )}
            {calculations.totalMinutes > 60 && calculations.totalMinutes <= 180 && (
              <p>{t('tools.cleaningTime.considerBreakingThisInto2', 'Consider breaking this into 2-3 sessions with short breaks in between.')}</p>
            )}
            {calculations.totalMinutes > 180 && (
              <p>{t('tools.cleaningTime.thisIsABigJob', 'This is a big job! Break it up over 2-3 days or consider getting help.')}</p>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.cleaningTime.timeSavingTips', 'Time-Saving Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>- Gather all supplies before starting</li>
                <li>- Work room by room, not task by task</li>
                <li>- Use a timer to stay focused</li>
                <li>- Play music or podcasts to make it enjoyable</li>
                <li>- Declutter first, then clean</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CleaningTimeTool;
