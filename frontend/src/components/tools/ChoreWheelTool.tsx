import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Home, Plus, X, Shuffle, RotateCcw, Sparkles, Download, Check, Calendar, Users } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface Person {
  id: string;
  name: string;
  color: string;
}

interface Chore {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  assignedTo: string | null;
}

interface ChoreAssignment {
  choreId: string;
  choreName: string;
  personName: string;
  personColor: string;
}

const PERSON_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-cyan-500',
  'bg-yellow-500',
  'bg-red-500',
];

const DEFAULT_CHORES = [
  { name: 'Dishes', frequency: 'daily' as const },
  { name: 'Vacuum', frequency: 'weekly' as const },
  { name: 'Laundry', frequency: 'weekly' as const },
  { name: 'Trash', frequency: 'weekly' as const },
  { name: 'Bathroom', frequency: 'weekly' as const },
  { name: 'Kitchen', frequency: 'weekly' as const },
];

interface ChoreWheelToolProps {
  uiConfig?: UIConfig;
}

export const ChoreWheelTool: React.FC<ChoreWheelToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [people, setPeople] = useState<Person[]>([]);
  const [chores, setChores] = useState<Chore[]>([]);
  const [newPersonName, setNewPersonName] = useState('');
  const [newChoreName, setNewChoreName] = useState('');
  const [newChoreFrequency, setNewChoreFrequency] = useState<'daily' | 'weekly' | 'biweekly' | 'monthly'>('weekly');
  const [assignments, setAssignments] = useState<ChoreAssignment[]>([]);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [householdName, setHouseholdName] = useState('Our Household');

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData & {
        people?: string[];
        chores?: string[];
        householdName?: string;
      };
      if (params.people) {
        setPeople(params.people.map((name, idx) => ({
          id: `p-${idx}`,
          name,
          color: PERSON_COLORS[idx % PERSON_COLORS.length],
        })));
      }
      if (params.householdName) setHouseholdName(params.householdName);
      if (params.text) {
        const names = params.text.split(/[,\n]/).map(n => n.trim()).filter(n => n);
        if (names.length > 0) {
          setPeople(names.map((name, idx) => ({
            id: `p-${idx}`,
            name,
            color: PERSON_COLORS[idx % PERSON_COLORS.length],
          })));
        }
      }
      setIsPrefilled(true);
    }
  }, [uiConfig?.params, isPrefilled]);

  const addPerson = useCallback(() => {
    if (newPersonName.trim() && !people.some(p => p.name === newPersonName.trim())) {
      setPeople(prev => [...prev, {
        id: `p-${Date.now()}`,
        name: newPersonName.trim(),
        color: PERSON_COLORS[prev.length % PERSON_COLORS.length],
      }]);
      setNewPersonName('');
    }
  }, [newPersonName, people]);

  const removePerson = useCallback((id: string) => {
    setPeople(prev => prev.filter(p => p.id !== id));
    setAssignments([]);
  }, []);

  const addChore = useCallback(() => {
    if (newChoreName.trim() && !chores.some(c => c.name === newChoreName.trim())) {
      setChores(prev => [...prev, {
        id: `c-${Date.now()}`,
        name: newChoreName.trim(),
        frequency: newChoreFrequency,
        assignedTo: null,
      }]);
      setNewChoreName('');
    }
  }, [newChoreName, newChoreFrequency, chores]);

  const removeChore = useCallback((id: string) => {
    setChores(prev => prev.filter(c => c.id !== id));
    setAssignments([]);
  }, []);

  const addDefaultChores = useCallback(() => {
    const newChores: Chore[] = DEFAULT_CHORES
      .filter(dc => !chores.some(c => c.name === dc.name))
      .map((dc, idx) => ({
        id: `c-default-${Date.now()}-${idx}`,
        name: dc.name,
        frequency: dc.frequency,
        assignedTo: null,
      }));
    setChores(prev => [...prev, ...newChores]);
  }, [chores]);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const assignChores = useCallback(() => {
    if (people.length === 0 || chores.length === 0) return;

    setIsSpinning(true);
    setRotation(prev => prev + 1440 + Math.random() * 720);

    setTimeout(() => {
      const shuffledChores = shuffleArray(chores);
      const newAssignments: ChoreAssignment[] = [];

      shuffledChores.forEach((chore, idx) => {
        const person = people[idx % people.length];
        newAssignments.push({
          choreId: chore.id,
          choreName: chore.name,
          personName: person.name,
          personColor: person.color,
        });
      });

      setAssignments(newAssignments);
      setChores(prev => prev.map(c => {
        const assignment = newAssignments.find(a => a.choreId === c.id);
        return { ...c, assignedTo: assignment?.personName || null };
      }));
      setIsSpinning(false);
    }, 2000);
  }, [people, chores]);

  const rotateAssignments = useCallback(() => {
    if (assignments.length === 0 || people.length < 2) return;

    setIsSpinning(true);
    setRotation(prev => prev + 360);

    setTimeout(() => {
      // Rotate person assignments by one position
      const rotatedPeople = [...people.slice(1), people[0]];

      const newAssignments = assignments.map((assignment, idx) => {
        const newPerson = rotatedPeople[idx % rotatedPeople.length];
        return {
          ...assignment,
          personName: newPerson.name,
          personColor: newPerson.color,
        };
      });

      setAssignments(newAssignments);
      setChores(prev => prev.map(c => {
        const assignment = newAssignments.find(a => a.choreId === c.id);
        return { ...c, assignedTo: assignment?.personName || null };
      }));
      setIsSpinning(false);
    }, 1000);
  }, [assignments, people]);

  const exportAssignments = useCallback(() => {
    let text = `${householdName} - Chore Assignments\n${'='.repeat(householdName.length + 20)}\n\n`;

    // Group by person
    const byPerson: Record<string, string[]> = {};
    assignments.forEach(a => {
      if (!byPerson[a.personName]) byPerson[a.personName] = [];
      byPerson[a.personName].push(a.choreName);
    });

    Object.entries(byPerson).forEach(([name, choreList]) => {
      text += `${name}:\n`;
      choreList.forEach(chore => {
        text += `  - ${chore}\n`;
      });
      text += '\n';
    });

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chore-assignments.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [assignments, householdName]);

  const clearAssignments = useCallback(() => {
    setAssignments([]);
    setChores(prev => prev.map(c => ({ ...c, assignedTo: null })));
  }, []);

  const getFrequencyLabel = (freq: string) => {
    switch (freq) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'biweekly': return 'Bi-weekly';
      case 'monthly': return 'Monthly';
      default: return freq;
    }
  };

  const getFrequencyColor = (freq: string) => {
    switch (freq) {
      case 'daily': return isDark ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-700';
      case 'weekly': return isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700';
      case 'biweekly': return isDark ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700';
      case 'monthly': return isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700';
      default: return isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <Home className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.choreWheel.choreWheel', 'Chore Wheel')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.choreWheel.fairlyAssignHouseholdChores', 'Fairly assign household chores')}</p>
          </div>
        </div>
      </div>

      {/* Prefill indicator */}
      {isPrefilled && (
        <div className="mx-6 mt-4 flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.choreWheel.settingsLoadedFromYourConversation', 'Settings loaded from your conversation')}</span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Household Name */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.choreWheel.householdName', 'Household Name')}
          </label>
          <input
            type="text"
            value={householdName}
            onChange={(e) => setHouseholdName(e.target.value)}
            placeholder={t('tools.choreWheel.ourHousehold', 'Our Household')}
            className={`w-full px-4 py-3 rounded-lg border ${
              isDark
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
            } focus:outline-none focus:ring-2 focus:ring-teal-500`}
          />
        </div>

        {/* Add People */}
        <div className="space-y-2">
          <label className={`flex items-center gap-2 text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Users className="w-4 h-4" />
            Household Members ({people.length})
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newPersonName}
              onChange={(e) => setNewPersonName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addPerson()}
              placeholder={t('tools.choreWheel.addMember', 'Add member...')}
              className={`flex-1 px-4 py-3 rounded-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-teal-500`}
            />
            <button
              onClick={addPerson}
              disabled={!newPersonName.trim()}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                newPersonName.trim()
                  ? 'bg-teal-500 hover:bg-teal-600 text-white'
                  : isDark
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* People List */}
          {people.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {people.map((person) => (
                <div
                  key={person.id}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                    isDark ? 'bg-gray-700' : 'bg-gray-100'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${person.color}`} />
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {person.name}
                  </span>
                  <button
                    onClick={() => removePerson(person.id)}
                    className="hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Chores */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className={`flex items-center gap-2 text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Calendar className="w-4 h-4" />
              Chores ({chores.length})
            </label>
            <button
              onClick={addDefaultChores}
              className={`text-sm ${isDark ? 'text-teal-400 hover:text-teal-300' : 'text-teal-600 hover:text-teal-700'}`}
            >
              {t('tools.choreWheel.addDefaults', '+ Add defaults')}
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newChoreName}
              onChange={(e) => setNewChoreName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addChore()}
              placeholder={t('tools.choreWheel.addChore', 'Add chore...')}
              className={`flex-1 px-4 py-3 rounded-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-teal-500`}
            />
            <select
              value={newChoreFrequency}
              onChange={(e) => setNewChoreFrequency(e.target.value as any)}
              className={`px-3 py-3 rounded-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-teal-500`}
            >
              <option value="daily">{t('tools.choreWheel.daily', 'Daily')}</option>
              <option value="weekly">{t('tools.choreWheel.weekly', 'Weekly')}</option>
              <option value="biweekly">{t('tools.choreWheel.biWeekly', 'Bi-weekly')}</option>
              <option value="monthly">{t('tools.choreWheel.monthly', 'Monthly')}</option>
            </select>
            <button
              onClick={addChore}
              disabled={!newChoreName.trim()}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                newChoreName.trim()
                  ? 'bg-teal-500 hover:bg-teal-600 text-white'
                  : isDark
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Chores List */}
          {chores.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {chores.map((chore) => (
                <div
                  key={chore.id}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                    isDark ? 'bg-gray-700' : 'bg-gray-100'
                  }`}
                >
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {chore.name}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getFrequencyColor(chore.frequency)}`}>
                    {getFrequencyLabel(chore.frequency)}
                  </span>
                  <button
                    onClick={() => removeChore(chore.id)}
                    className="hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Wheel Visualization */}
        {people.length > 0 && (
          <div className="flex justify-center py-4">
            <div
              className="relative w-48 h-48"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? t('tools.choreWheel.transform2sCubicBezier0', 'transform 2s cubic-bezier(0.17, 0.67, 0.12, 0.99)') : 'none',
              }}
            >
              {people.map((person, idx) => {
                const angle = (360 / people.length) * idx;
                const skew = 90 - (360 / people.length);
                return (
                  <div
                    key={person.id}
                    className={`absolute top-0 left-1/2 w-1/2 h-1/2 origin-bottom-left ${person.color}`}
                    style={{
                      transform: `rotate(${angle}deg) skewY(-${skew}deg)`,
                      clipPath: 'polygon(0 0, 100% 0, 100% 100%)',
                    }}
                  />
                );
              })}
              <div className={`absolute inset-[25%] rounded-full ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-inner flex items-center justify-center`}>
                <Home className={`w-8 h-8 ${isDark ? 'text-teal-400' : 'text-teal-500'}`} />
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={assignChores}
            disabled={people.length === 0 || chores.length === 0 || isSpinning}
            className={`flex-1 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold text-lg rounded-xl transition-all shadow-lg shadow-teal-500/30 flex items-center justify-center gap-2 ${
              people.length === 0 || chores.length === 0 || isSpinning ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Shuffle className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
            {isSpinning ? t('tools.choreWheel.spinning', 'Spinning...') : t('tools.choreWheel.assignChores', 'Assign Chores')}
          </button>
          {assignments.length > 0 && (
            <>
              <button
                onClick={rotateAssignments}
                disabled={isSpinning}
                className={`px-4 py-4 rounded-xl transition-colors ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                title={t('tools.choreWheel.rotateAssignments', 'Rotate assignments')}
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button
                onClick={exportAssignments}
                className={`px-4 py-4 rounded-xl transition-colors ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <Download className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Assignments Display */}
        {assignments.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.choreWheel.thisWeekSAssignments', 'This Week\'s Assignments')}
              </h4>
              <button
                onClick={clearAssignments}
                className={`text-sm ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {t('tools.choreWheel.clear', 'Clear')}
              </button>
            </div>

            {/* Group by person */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {people.map((person) => {
                const personChores = assignments.filter(a => a.personName === person.name);
                if (personChores.length === 0) return null;

                return (
                  <div
                    key={person.id}
                    className={`p-4 rounded-xl border ${
                      isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-4 h-4 rounded-full ${person.color}`} />
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {person.name}
                      </span>
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        ({personChores.length} chores)
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {personChores.map((assignment) => {
                        const chore = chores.find(c => c.id === assignment.choreId);
                        return (
                          <li
                            key={assignment.choreId}
                            className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                          >
                            <Check className="w-4 h-4 text-teal-500" />
                            <span>{assignment.choreName}</span>
                            {chore && (
                              <span className={`text-xs px-1.5 py-0.5 rounded ${getFrequencyColor(chore.frequency)}`}>
                                {getFrequencyLabel(chore.frequency)}
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.choreWheel.tip', 'Tip:')}</strong> Use "Rotate" to shift all assignments to the next person - perfect for weekly rotation! Chores are distributed as evenly as possible among household members.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChoreWheelTool;
