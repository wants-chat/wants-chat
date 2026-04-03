import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, Clock, Home, Sparkles, Info, Box, CheckCircle, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type RoomType = 'bedroom' | 'bathroom' | 'kitchen' | 'livingRoom' | 'office' | 'garage' | 'basement' | 'attic' | 'closet';
type ClutterLevel = 'minimal' | 'moderate' | 'heavy' | 'extreme';
type DeclutterApproach = 'quick' | 'thorough' | 'deep';

interface RoomConfig {
  name: string;
  baseTimeMinutes: number;
  icon: string;
}

interface DeclutterCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const DeclutterCalculatorTool: React.FC<DeclutterCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [selectedRooms, setSelectedRooms] = useState<RoomType[]>(['bedroom', 'closet']);
  const [clutterLevel, setClutterLevel] = useState<ClutterLevel>('moderate');
  const [approach, setApproach] = useState<DeclutterApproach>('thorough');
  const [yearsAccumulated, setYearsAccumulated] = useState('3');
  const [hasHelp, setHasHelp] = useState(false);
  const [helpers, setHelpers] = useState('1');
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;

      if (params.rooms && Array.isArray(params.rooms)) {
        setSelectedRooms(params.rooms as RoomType[]);
        setIsPrefilled(true);
      }
      if (params.clutterLevel) {
        setClutterLevel(params.clutterLevel as ClutterLevel);
        setIsPrefilled(true);
      }
      if (params.approach) {
        setApproach(params.approach as DeclutterApproach);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const rooms: Record<RoomType, RoomConfig> = {
    bedroom: { name: 'Bedroom', baseTimeMinutes: 120, icon: 'bed' },
    bathroom: { name: 'Bathroom', baseTimeMinutes: 45, icon: 'bath' },
    kitchen: { name: 'Kitchen', baseTimeMinutes: 180, icon: 'utensils' },
    livingRoom: { name: 'Living Room', baseTimeMinutes: 150, icon: 'sofa' },
    office: { name: 'Home Office', baseTimeMinutes: 120, icon: 'desk' },
    garage: { name: 'Garage', baseTimeMinutes: 300, icon: 'car' },
    basement: { name: 'Basement', baseTimeMinutes: 360, icon: 'stairs' },
    attic: { name: 'Attic', baseTimeMinutes: 240, icon: 'home' },
    closet: { name: 'Closet', baseTimeMinutes: 90, icon: 'shirt' },
  };

  const clutterLevels = {
    minimal: { name: 'Minimal', multiplier: 0.5, description: 'Just need to organize' },
    moderate: { name: 'Moderate', multiplier: 1, description: 'Some items to sort through' },
    heavy: { name: 'Heavy', multiplier: 1.75, description: 'Lots of items accumulated' },
    extreme: { name: 'Extreme', multiplier: 2.5, description: 'Major overhaul needed' },
  };

  const approaches = {
    quick: { name: 'Quick Pass', multiplier: 0.5, description: 'Surface level, obvious items only' },
    thorough: { name: 'Thorough', multiplier: 1, description: 'Go through everything' },
    deep: { name: 'Deep Purge', multiplier: 1.5, description: 'Minimize aggressively' },
  };

  const toggleRoom = (room: RoomType) => {
    setSelectedRooms(prev =>
      prev.includes(room)
        ? prev.filter(r => r !== room)
        : [...prev, room]
    );
  };

  const calculations = useMemo(() => {
    const years = parseFloat(yearsAccumulated) || 1;
    const yearMultiplier = 1 + (Math.min(years, 20) * 0.1);
    const clutterMultiplier = clutterLevels[clutterLevel].multiplier;
    const approachMultiplier = approaches[approach].multiplier;
    const helperCount = hasHelp ? Math.max(1, parseInt(helpers) || 1) + 1 : 1;

    // Calculate base time for all selected rooms
    let totalBaseMinutes = selectedRooms.reduce((sum, room) => sum + rooms[room].baseTimeMinutes, 0);

    // Apply multipliers
    const adjustedMinutes = Math.round(
      (totalBaseMinutes * clutterMultiplier * approachMultiplier * yearMultiplier) / helperCount
    );

    const hours = Math.floor(adjustedMinutes / 60);
    const minutes = adjustedMinutes % 60;

    // Calculate room breakdown
    const roomBreakdown = selectedRooms.map(room => {
      const roomMinutes = Math.round(
        (rooms[room].baseTimeMinutes * clutterMultiplier * approachMultiplier * yearMultiplier) / helperCount
      );
      return {
        name: rooms[room].name,
        minutes: roomMinutes,
        hours: Math.floor(roomMinutes / 60),
        remainingMinutes: roomMinutes % 60,
      };
    });

    // Estimate items to process
    const itemsPerRoom = {
      minimal: 50,
      moderate: 150,
      heavy: 300,
      extreme: 500,
    }[clutterLevel];
    const estimatedItems = selectedRooms.length * itemsPerRoom;

    // Estimate donation/trash bags
    const bagsPerRoom = {
      minimal: 1,
      moderate: 3,
      heavy: 6,
      extreme: 10,
    }[clutterLevel];
    const estimatedBags = selectedRooms.length * bagsPerRoom;

    // Calculate sessions needed (3-hour max sessions)
    const sessionsNeeded = Math.ceil(adjustedMinutes / 180);

    // Suggested schedule
    let schedule: string[];
    if (adjustedMinutes <= 180) {
      schedule = ['Complete in one session'];
    } else if (adjustedMinutes <= 360) {
      schedule = ['Session 1: First half of rooms', 'Session 2: Remaining rooms + review'];
    } else {
      schedule = [
        'Session 1: Start with smallest rooms',
        'Session 2-' + (sessionsNeeded - 1) + ': Tackle larger rooms',
        'Final session: Review and organize kept items',
      ];
    }

    return {
      totalMinutes: adjustedMinutes,
      hours,
      minutes,
      timeFormatted: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
      roomBreakdown,
      estimatedItems,
      estimatedBags,
      sessionsNeeded,
      schedule,
      donationValue: estimatedItems * 2.5, // Rough estimate $2.50 per item average
    };
  }, [selectedRooms, clutterLevel, approach, yearsAccumulated, hasHelp, helpers]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg"><Trash2 className="w-5 h-5 text-teal-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.declutterCalculator.declutterTimeEstimator', 'Declutter Time Estimator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.declutterCalculator.planYourDeclutteringProject', 'Plan your decluttering project')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span className="text-sm text-teal-500 font-medium">{t('tools.declutterCalculator.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Room Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Home className="w-4 h-4 inline mr-1" />
            {t('tools.declutterCalculator.selectRoomsToDeclutter', 'Select Rooms to Declutter')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(rooms) as RoomType[]).map((room) => (
              <button
                key={room}
                onClick={() => toggleRoom(room)}
                className={`py-2 px-3 rounded-lg text-sm text-center ${
                  selectedRooms.includes(room)
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {rooms[room].name}
              </button>
            ))}
          </div>
        </div>

        {/* Clutter Level */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.declutterCalculator.clutterLevel', 'Clutter Level')}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(clutterLevels) as ClutterLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => setClutterLevel(level)}
                className={`py-2 px-2 rounded-lg text-sm text-center ${
                  clutterLevel === level
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {clutterLevels[level].name}
              </button>
            ))}
          </div>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {clutterLevels[clutterLevel].description}
          </p>
        </div>

        {/* Approach */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.declutterCalculator.declutteringApproach', 'Decluttering Approach')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(approaches) as DeclutterApproach[]).map((app) => (
              <button
                key={app}
                onClick={() => setApproach(app)}
                className={`py-3 px-3 rounded-lg text-sm flex flex-col items-center gap-1 ${
                  approach === app
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <span className="font-medium">{approaches[app].name}</span>
                <span className={`text-xs ${approach === app ? 'text-white/80' : isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {approaches[app].description}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Additional Options */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Clock className="w-4 h-4 inline mr-1" />
              {t('tools.declutterCalculator.yearsOfAccumulation', 'Years of Accumulation')}
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={yearsAccumulated}
              onChange={(e) => setYearsAccumulated(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.declutterCalculator.gettingHelp', 'Getting Help?')}
            </label>
            <button
              onClick={() => setHasHelp(!hasHelp)}
              className={`w-full py-2 rounded-lg ${hasHelp ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {hasHelp ? t('tools.declutterCalculator.yesWithHelp', 'Yes, with help') : t('tools.declutterCalculator.noSolo', 'No, solo')}
            </button>
          </div>
        </div>

        {hasHelp && (
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.declutterCalculator.numberOfHelpers', 'Number of Helpers')}
            </label>
            <input
              type="number"
              min="1"
              max="5"
              value={helpers}
              onChange={(e) => setHelpers(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        )}

        {/* Result */}
        <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'} border`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.declutterCalculator.estimatedTotalTime', 'Estimated Total Time')}</div>
          <div className="text-5xl font-bold text-teal-500 my-2">
            {calculations.timeFormatted}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {selectedRooms.length} room{selectedRooms.length !== 1 ? 's' : ''} | {calculations.sessionsNeeded} session{calculations.sessionsNeeded !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.declutterCalculator.estItems', 'Est. Items')}</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {calculations.estimatedItems}+
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.declutterCalculator.estBags', 'Est. Bags')}</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {calculations.estimatedBags}
            </div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.declutterCalculator.donationValue', 'Donation Value')}</div>
            <div className="text-2xl font-bold text-teal-500">
              ${Math.round(calculations.donationValue)}
            </div>
          </div>
        </div>

        {/* Room Breakdown */}
        {calculations.roomBreakdown.length > 0 && (
          <div className={`rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} p-4`}>
            <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Box className="w-4 h-4 inline mr-2" />
              {t('tools.declutterCalculator.timeByRoom', 'Time by Room')}
            </h4>
            <div className="space-y-2">
              {calculations.roomBreakdown.map((room, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-2 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-white'}`}
                >
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{room.name}</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {room.hours > 0 ? `${room.hours}h ${room.remainingMinutes}m` : `${room.minutes}m`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Schedule */}
        <div className={`rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} p-4`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <CheckCircle className="w-4 h-4 inline mr-2 text-teal-500" />
            {t('tools.declutterCalculator.suggestedSchedule', 'Suggested Schedule')}
          </h4>
          <ul className="space-y-2">
            {calculations.schedule.map((step, index) => (
              <li
                key={index}
                className={`flex items-start gap-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                <span className="text-teal-500 font-medium">{index + 1}.</span>
                {step}
              </li>
            ))}
          </ul>
        </div>

        {/* Warning for large projects */}
        {calculations.totalMinutes > 480 && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} border`}>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 text-yellow-500" />
              <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <strong>{t('tools.declutterCalculator.largeProjectAlert', 'Large Project Alert:')}</strong> This is a significant undertaking. Consider:
                <ul className="mt-1 space-y-1">
                  <li>- Breaking it into weekend sessions</li>
                  <li>- Starting with one room at a time</li>
                  <li>- Hiring a professional organizer</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.declutterCalculator.declutteringTips', 'Decluttering Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>- Use the "four box method": Keep, Donate, Trash, Relocate</li>
                <li>- Handle each item only once</li>
                <li>- Set a timer for each session (max 3 hours)</li>
                <li>- Take before/after photos for motivation</li>
                <li>- Schedule donation pickup before you start</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeclutterCalculatorTool;
