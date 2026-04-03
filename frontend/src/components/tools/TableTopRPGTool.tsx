import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dices, Shield, Heart, Zap, Users, RotateCcw, Plus, Trash2, ChevronUp, ChevronDown, Info, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import type { ColumnConfig } from '../../lib/toolDataUtils';

type DieType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';

interface Character {
  id: string;
  name: string;
  initiative: number;
  maxHp: number;
  currentHp: number;
  armorClass: number;
  conditions: string[];
  isActive: boolean;
}

interface DiceRoll {
  die: DieType;
  result: number;
  modifier: number;
  total: number;
  timestamp: number;
}

const CONDITIONS = [
  'Blinded',
  'Charmed',
  'Deafened',
  'Frightened',
  'Grappled',
  'Incapacitated',
  'Invisible',
  'Paralyzed',
  'Petrified',
  'Poisoned',
  'Prone',
  'Restrained',
  'Stunned',
  'Unconscious',
  'Exhaustion',
  'Concentration',
];

const DICE: DieType[] = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];

// Column configuration for export
const CHARACTER_COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'initiative', header: 'Initiative', type: 'number' },
  { key: 'currentHp', header: 'Current HP', type: 'number' },
  { key: 'maxHp', header: 'Max HP', type: 'number' },
  { key: 'armorClass', header: 'Armor Class', type: 'number' },
  { key: 'conditions', header: 'Conditions', type: 'string', format: (value: string[]) => value?.join(', ') || '' },
  { key: 'isActive', header: 'Active', type: 'boolean' },
];

const ROLL_HISTORY_COLUMNS: ColumnConfig[] = [
  { key: 'die', header: 'Die Type', type: 'string' },
  { key: 'result', header: 'Result', type: 'number' },
  { key: 'modifier', header: 'Modifier', type: 'number' },
  { key: 'total', header: 'Total', type: 'number' },
  { key: 'timestamp', header: 'Time', type: 'date' },
];

const getDieMax = (die: DieType): number => {
  const values: Record<DieType, number> = {
    d4: 4,
    d6: 6,
    d8: 8,
    d10: 10,
    d12: 12,
    d20: 20,
    d100: 100,
  };
  return values[die];
};

interface TableTopRPGToolProps {
  uiConfig?: UIConfig;
}

export const TableTopRPGTool: React.FC<TableTopRPGToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Use the useToolData hook for backend persistence of characters
  const {
    data: characters,
    setData: setCharacters,
    addItem: addCharacterItem,
    updateItem: updateCharacterItem,
    deleteItem: deleteCharacterItem,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    importCSV,
    importJSON,
    copyToClipboard,
    print,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Character>('tabletop-rpg', [], CHARACTER_COLUMNS);

  // Dice Roller State
  const [selectedDie, setSelectedDie] = useState<DieType>('d20');

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.prefillData && !isPrefilled) {
      const data = uiConfig.prefillData;
      if (data.dieType && DICE.includes(data.dieType as DieType)) {
        setSelectedDie(data.dieType as DieType);
      }
      if (data.diceCount) {
        setDiceCount(Number(data.diceCount));
      }
      if (data.modifier !== undefined) {
        setModifier(Number(data.modifier));
      }
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);
  const [diceCount, setDiceCount] = useState(1);
  const [modifier, setModifier] = useState(0);
  const [rollHistory, setRollHistory] = useState<DiceRoll[]>([]);

  // Character/Initiative Tracker State
  const [newCharName, setNewCharName] = useState('');
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [combatActive, setCombatActive] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<'dice' | 'initiative' | 'characters'>('dice');

  // Dice Rolling
  const rollDice = () => {
    const results: DiceRoll[] = [];
    const max = getDieMax(selectedDie);

    for (let i = 0; i < diceCount; i++) {
      const result = Math.floor(Math.random() * max) + 1;
      results.push({
        die: selectedDie,
        result,
        modifier: i === 0 ? modifier : 0, // Only add modifier once
        total: result + (i === 0 ? modifier : 0),
        timestamp: Date.now() + i,
      });
    }

    setRollHistory((prev) => [...results, ...prev].slice(0, 20));
  };

  const totalRoll = useMemo(() => {
    if (rollHistory.length === 0) return null;
    const recentRolls = rollHistory.filter(
      (r) => r.timestamp >= rollHistory[0].timestamp - 100
    );
    return recentRolls.reduce((sum, r) => sum + r.result, 0) + modifier;
  }, [rollHistory, modifier]);

  // Character Management
  const addCharacter = () => {
    if (!newCharName.trim()) return;
    const newChar: Character = {
      id: Date.now().toString(),
      name: newCharName,
      initiative: 0,
      maxHp: 10,
      currentHp: 10,
      armorClass: 10,
      conditions: [],
      isActive: true,
    };
    addCharacterItem(newChar);
    setNewCharName('');
  };

  const removeCharacter = (id: string) => {
    deleteCharacterItem(id);
  };

  const updateCharacter = (id: string, updates: Partial<Character>) => {
    updateCharacterItem(id, updates);
  };

  const rollInitiativeForAll = () => {
    characters.forEach((c) => {
      updateCharacterItem(c.id, { initiative: Math.floor(Math.random() * 20) + 1 });
    });
  };

  const sortedCharacters = useMemo(() => {
    return [...characters].sort((a, b) => b.initiative - a.initiative);
  }, [characters]);

  const nextTurn = () => {
    if (sortedCharacters.length === 0) return;
    setCurrentTurnIndex((prev) => (prev + 1) % sortedCharacters.length);
  };

  const prevTurn = () => {
    if (sortedCharacters.length === 0) return;
    setCurrentTurnIndex((prev) =>
      prev === 0 ? sortedCharacters.length - 1 : prev - 1
    );
  };

  const toggleCondition = (charId: string, condition: string) => {
    const char = characters.find((c) => c.id === charId);
    if (!char) return;
    const hasCondition = char.conditions.includes(condition);
    updateCharacterItem(charId, {
      conditions: hasCondition
        ? char.conditions.filter((cond) => cond !== condition)
        : [...char.conditions, condition],
    });
  };

  const getHpColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage > 50) return 'text-green-500';
    if (percentage > 25) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-purple-900/20' : 'bg-gradient-to-r from-white to-purple-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Dices className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.tableTopRPG.tabletopRpgTools', 'Tabletop RPG Tools')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tableTopRPG.diceRollerInitiativeCharacterTracking', 'Dice roller, initiative & character tracking')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="table-top-r-p-g" toolName="Table Top R P G" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
              theme={isDark ? 'dark' : 'light'}
              size="sm"
            />
            <ExportDropdown
              onExportCSV={() => exportCSV({ filename: 'rpg-characters' })}
              onExportExcel={() => exportExcel({ filename: 'rpg-characters' })}
              onExportJSON={() => exportJSON({ filename: 'rpg-characters' })}
              onExportPDF={() => exportPDF({ filename: 'rpg-characters', title: 'RPG Characters', subtitle: 'Character Roster & Stats' })}
              onPrint={() => print('RPG Characters')}
              onCopyToClipboard={() => copyToClipboard('tab')}
              onImportCSV={async (file) => { await importCSV(file); }}
              onImportJSON={async (file) => { await importJSON(file); }}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Tab Selection */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setActiveTab('dice')}
            className={`py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-2 ${activeTab === 'dice' ? 'bg-purple-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            <Dices className="w-4 h-4" />
            {t('tools.tableTopRPG.dice', 'Dice')}
          </button>
          <button
            onClick={() => setActiveTab('initiative')}
            className={`py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-2 ${activeTab === 'initiative' ? 'bg-purple-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            <Users className="w-4 h-4" />
            {t('tools.tableTopRPG.initiative', 'Initiative')}
          </button>
          <button
            onClick={() => setActiveTab('characters')}
            className={`py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-2 ${activeTab === 'characters' ? 'bg-purple-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            <Shield className="w-4 h-4" />
            {t('tools.tableTopRPG.characters', 'Characters')}
          </button>
        </div>

        {/* Dice Roller Tab */}
        {activeTab === 'dice' && (
          <div className="space-y-4">
            {/* Die Selection */}
            <div className="grid grid-cols-7 gap-2">
              {DICE.map((die) => (
                <button
                  key={die}
                  onClick={() => setSelectedDie(die)}
                  className={`py-3 px-2 rounded-lg text-sm font-bold ${selectedDie === die ? 'bg-purple-500 text-white' : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {die}
                </button>
              ))}
            </div>

            {/* Dice Count & Modifier */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.tableTopRPG.numberOfDice', 'Number of Dice')}
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDiceCount(Math.max(1, diceCount - 1))}
                    className={`p-2 rounded-lg ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={diceCount}
                    onChange={(e) => setDiceCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className={`flex-1 px-4 py-2 rounded-lg border text-center ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                  <button
                    onClick={() => setDiceCount(diceCount + 1)}
                    className={`p-2 rounded-lg ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.tableTopRPG.modifier', 'Modifier')}
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setModifier(modifier - 1)}
                    className={`p-2 rounded-lg ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={modifier}
                    onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
                    className={`flex-1 px-4 py-2 rounded-lg border text-center ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                  <button
                    onClick={() => setModifier(modifier + 1)}
                    className={`p-2 rounded-lg ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Roll Button */}
            <button
              onClick={rollDice}
              className="w-full py-4 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-lg text-lg transition-colors flex items-center justify-center gap-2"
            >
              <Dices className="w-5 h-5" />
              Roll {diceCount}{selectedDie}{modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ''}
            </button>

            {/* Current Roll Result */}
            {totalRoll !== null && (
              <div className={`p-6 rounded-lg text-center ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.tableTopRPG.totalRoll', 'Total Roll')}</div>
                <div className="text-5xl font-bold text-purple-500">{totalRoll}</div>
                {diceCount > 1 && (
                  <div className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Individual: {rollHistory.slice(0, diceCount).map(r => r.result).join(', ')}
                    {modifier !== 0 && ` (${modifier > 0 ? '+' : ''}${modifier})`}
                  </div>
                )}
              </div>
            )}

            {/* Roll History */}
            {rollHistory.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.tableTopRPG.rollHistory', 'Roll History')}</span>
                  <button
                    onClick={() => setRollHistory([])}
                    className={`text-xs ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {t('tools.tableTopRPG.clear', 'Clear')}
                  </button>
                </div>
                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} max-h-32 overflow-y-auto`}>
                  <div className="flex flex-wrap gap-2">
                    {rollHistory.slice(0, 20).map((roll, idx) => (
                      <span
                        key={roll.timestamp}
                        className={`px-2 py-1 rounded text-sm ${idx < diceCount ? 'bg-purple-500/20 text-purple-400' : isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'}`}
                      >
                        {roll.die}: {roll.result}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Initiative Tracker Tab */}
        {activeTab === 'initiative' && (
          <div className="space-y-4">
            {/* Add Character */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newCharName}
                onChange={(e) => setNewCharName(e.target.value)}
                placeholder={t('tools.tableTopRPG.characterName', 'Character name...')}
                onKeyPress={(e) => e.key === 'Enter' && addCharacter()}
                className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 placeholder-gray-400'}`}
              />
              <button
                onClick={addCharacter}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Combat Controls */}
            {characters.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={rollInitiativeForAll}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-2 ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  <Dices className="w-4 h-4" />
                  {t('tools.tableTopRPG.rollAllInitiative', 'Roll All Initiative')}
                </button>
                <button
                  onClick={() => setCombatActive(!combatActive)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm ${combatActive ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                >
                  {combatActive ? t('tools.tableTopRPG.endCombat', 'End Combat') : t('tools.tableTopRPG.startCombat', 'Start Combat')}
                </button>
              </div>
            )}

            {/* Turn Navigation */}
            {combatActive && sortedCharacters.length > 0 && (
              <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border`}>
                <div className="flex items-center justify-between">
                  <button
                    onClick={prevTurn}
                    className={`p-2 rounded-lg ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                  >
                    <ChevronUp className="w-5 h-5" />
                  </button>
                  <div className="text-center">
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.tableTopRPG.currentTurn', 'Current Turn')}</div>
                    <div className="text-xl font-bold text-purple-500">
                      {sortedCharacters[currentTurnIndex]?.name || 'No one'}
                    </div>
                  </div>
                  <button
                    onClick={nextTurn}
                    className={`p-2 rounded-lg ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Character List */}
            <div className="space-y-2">
              {sortedCharacters.map((char, idx) => (
                <div
                  key={char.id}
                  className={`p-3 rounded-lg border ${combatActive && idx === currentTurnIndex ? 'border-purple-500 bg-purple-500/10' : isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        {char.initiative}
                      </div>
                      <div>
                        <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{char.name}</div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className={getHpColor(char.currentHp, char.maxHp)}>
                            <Heart className="w-3 h-3 inline" /> {char.currentHp}/{char.maxHp}
                          </span>
                          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                            <Shield className="w-3 h-3 inline" /> AC {char.armorClass}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={char.initiative}
                        onChange={(e) => updateCharacter(char.id, { initiative: parseInt(e.target.value) || 0 })}
                        className={`w-16 px-2 py-1 rounded border text-center text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                      <button
                        onClick={() => removeCharacter(char.id)}
                        className="p-1 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {/* Conditions */}
                  {char.conditions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {char.conditions.map((cond) => (
                        <span
                          key={cond}
                          className="px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-400"
                        >
                          {cond}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {characters.length === 0 && (
              <div className={`p-8 text-center rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <Users className={`w-12 h-12 mx-auto mb-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.tableTopRPG.addCharactersToTrackInitiative', 'Add characters to track initiative')}</p>
              </div>
            )}
          </div>
        )}

        {/* Characters Tab (HP & Conditions) */}
        {activeTab === 'characters' && (
          <div className="space-y-4">
            {characters.length === 0 ? (
              <div className={`p-8 text-center rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <Shield className={`w-12 h-12 mx-auto mb-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.tableTopRPG.addCharactersInInitiativeTab', 'Add characters in Initiative tab first')}</p>
              </div>
            ) : (
              characters.map((char) => (
                <div
                  key={char.id}
                  className={`p-4 rounded-lg border ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{char.name}</h4>
                    <div className={`text-2xl font-bold ${getHpColor(char.currentHp, char.maxHp)}`}>
                      {char.currentHp}/{char.maxHp} HP
                    </div>
                  </div>

                  {/* HP Controls */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <label className={`block text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.tableTopRPG.currentHp', 'Current HP')}
                      </label>
                      <div className="flex gap-1">
                        <button
                          onClick={() => updateCharacter(char.id, { currentHp: Math.max(0, char.currentHp - 1) })}
                          className="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                        >
                          -1
                        </button>
                        <button
                          onClick={() => updateCharacter(char.id, { currentHp: Math.max(0, char.currentHp - 5) })}
                          className="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                        >
                          -5
                        </button>
                        <input
                          type="number"
                          value={char.currentHp}
                          onChange={(e) => updateCharacter(char.id, { currentHp: Math.max(0, parseInt(e.target.value) || 0) })}
                          className={`flex-1 px-2 py-1 rounded border text-center ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        />
                        <button
                          onClick={() => updateCharacter(char.id, { currentHp: Math.min(char.maxHp, char.currentHp + 5) })}
                          className="px-3 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => updateCharacter(char.id, { currentHp: Math.min(char.maxHp, char.currentHp + 1) })}
                          className="px-3 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30"
                        >
                          +1
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className={`block text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.tableTopRPG.maxHpAc', 'Max HP / AC')}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={char.maxHp}
                          onChange={(e) => {
                            const newMax = Math.max(1, parseInt(e.target.value) || 1);
                            updateCharacter(char.id, {
                              maxHp: newMax,
                              currentHp: Math.min(char.currentHp, newMax)
                            });
                          }}
                          placeholder={t('tools.tableTopRPG.maxHp', 'Max HP')}
                          className={`flex-1 px-2 py-1 rounded border text-center ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        />
                        <input
                          type="number"
                          value={char.armorClass}
                          onChange={(e) => updateCharacter(char.id, { armorClass: parseInt(e.target.value) || 10 })}
                          placeholder="AC"
                          className={`w-16 px-2 py-1 rounded border text-center ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* HP Bar */}
                  <div className={`h-3 rounded-full overflow-hidden mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className={`h-full transition-all duration-300 ${
                        char.currentHp / char.maxHp > 0.5
                          ? 'bg-green-500'
                          : char.currentHp / char.maxHp > 0.25
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.max(0, Math.min(100, (char.currentHp / char.maxHp) * 100))}%` }}
                    />
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => updateCharacter(char.id, { currentHp: char.maxHp })}
                      className={`flex-1 py-1 px-2 rounded text-sm ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                      <RotateCcw className="w-3 h-3 inline mr-1" />
                      {t('tools.tableTopRPG.fullHeal', 'Full Heal')}
                    </button>
                    <button
                      onClick={() => updateCharacter(char.id, { currentHp: 0 })}
                      className={`flex-1 py-1 px-2 rounded text-sm ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                      <Zap className="w-3 h-3 inline mr-1" />
                      {t('tools.tableTopRPG.down', 'Down')}
                    </button>
                    <button
                      onClick={() => updateCharacter(char.id, { conditions: [] })}
                      className={`flex-1 py-1 px-2 rounded text-sm ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                      {t('tools.tableTopRPG.clearConditions', 'Clear Conditions')}
                    </button>
                  </div>

                  {/* Conditions */}
                  <div>
                    <label className={`block text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.tableTopRPG.conditions', 'Conditions')}
                    </label>
                    <div className="flex flex-wrap gap-1">
                      {CONDITIONS.map((cond) => (
                        <button
                          key={cond}
                          onClick={() => toggleCondition(char.id, cond)}
                          className={`px-2 py-1 rounded-full text-xs transition-colors ${
                            char.conditions.includes(cond)
                              ? 'bg-red-500 text-white'
                              : isDark
                              ? 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                        >
                          {cond}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.tableTopRPG.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>{t('tools.tableTopRPG.useTheInitiativeTabTo', 'Use the Initiative tab to manage turn order')}</li>
                <li>{t('tools.tableTopRPG.rollInitiativeForAllCharacters', 'Roll initiative for all characters at once')}</li>
                <li>{t('tools.tableTopRPG.trackHpAndConditionsIn', 'Track HP and conditions in the Characters tab')}</li>
                <li>{t('tools.tableTopRPG.diceRollsAreSavedIn', 'Dice rolls are saved in history for reference')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableTopRPGTool;
