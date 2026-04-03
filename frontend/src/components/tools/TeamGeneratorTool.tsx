import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Plus, X, Shuffle, RotateCcw, Sparkles, Copy, Check, Download } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface Team {
  id: string;
  name: string;
  members: string[];
  color: string;
}

const TEAM_COLORS = [
  'from-red-500 to-rose-600',
  'from-blue-500 to-indigo-600',
  'from-green-500 to-emerald-600',
  'from-yellow-500 to-amber-600',
  'from-purple-500 to-violet-600',
  'from-pink-500 to-fuchsia-600',
  'from-cyan-500 to-teal-600',
  'from-orange-500 to-red-600',
];

const TEAM_BG_COLORS = [
  'bg-red-500/10 border-red-500/30',
  'bg-blue-500/10 border-blue-500/30',
  'bg-green-500/10 border-green-500/30',
  'bg-yellow-500/10 border-yellow-500/30',
  'bg-purple-500/10 border-purple-500/30',
  'bg-pink-500/10 border-pink-500/30',
  'bg-cyan-500/10 border-cyan-500/30',
  'bg-orange-500/10 border-orange-500/30',
];

interface TeamGeneratorToolProps {
  uiConfig?: UIConfig;
}

export const TeamGeneratorTool: React.FC<TeamGeneratorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [participants, setParticipants] = useState<string[]>([]);
  const [newParticipant, setNewParticipant] = useState('');
  const [teamCount, setTeamCount] = useState(2);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [copied, setCopied] = useState(false);
  const [bulkInput, setBulkInput] = useState('');
  const [showBulkInput, setShowBulkInput] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData & {
        participants?: string[];
        teamCount?: number;
      };
      if (params.participants) setParticipants(params.participants);
      if (params.teamCount) setTeamCount(params.teamCount);
      if (params.text) {
        // Parse names from text (comma or newline separated)
        const names = params.text.split(/[,\n]/).map(n => n.trim()).filter(n => n);
        if (names.length > 0) setParticipants(names);
      }
      setIsPrefilled(true);
    }
  }, [uiConfig?.params, isPrefilled]);

  const addParticipant = useCallback(() => {
    if (newParticipant.trim() && !participants.includes(newParticipant.trim())) {
      setParticipants(prev => [...prev, newParticipant.trim()]);
      setNewParticipant('');
    }
  }, [newParticipant, participants]);

  const removeParticipant = useCallback((name: string) => {
    setParticipants(prev => prev.filter(p => p !== name));
  }, []);

  const addBulkParticipants = useCallback(() => {
    const names = bulkInput.split(/[,\n]/).map(n => n.trim()).filter(n => n && !participants.includes(n));
    if (names.length > 0) {
      setParticipants(prev => [...prev, ...names]);
      setBulkInput('');
      setShowBulkInput(false);
    }
  }, [bulkInput, participants]);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const generateTeams = useCallback(() => {
    if (participants.length < teamCount) return;

    setIsGenerating(true);

    // Shuffle animation
    let animCount = 0;
    const maxAnim = 10;
    const interval = setInterval(() => {
      const shuffled = shuffleArray(participants);
      const tempTeams: Team[] = [];

      for (let i = 0; i < teamCount; i++) {
        tempTeams.push({
          id: `team-${i}`,
          name: `Team ${i + 1}`,
          members: [],
          color: TEAM_COLORS[i % TEAM_COLORS.length],
        });
      }

      shuffled.forEach((person, idx) => {
        tempTeams[idx % teamCount].members.push(person);
      });

      setTeams(tempTeams);
      animCount++;

      if (animCount >= maxAnim) {
        clearInterval(interval);
        setIsGenerating(false);
      }
    }, 100);
  }, [participants, teamCount]);

  const copyTeams = useCallback(() => {
    const text = teams.map(team =>
      `${team.name}:\n${team.members.map(m => `  - ${m}`).join('\n')}`
    ).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [teams]);

  const exportTeams = useCallback(() => {
    const text = teams.map(team =>
      `${team.name}:\n${team.members.map(m => `  - ${m}`).join('\n')}`
    ).join('\n\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'teams.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [teams]);

  const clearAll = useCallback(() => {
    setParticipants([]);
    setTeams([]);
    setNewParticipant('');
  }, []);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-blue-900/20' : 'bg-gradient-to-r from-white to-blue-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.teamGenerator.teamGenerator', 'Team Generator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.teamGenerator.randomlyAssignPeopleToBalanced', 'Randomly assign people to balanced teams')}</p>
          </div>
        </div>
      </div>

      {/* Prefill indicator */}
      {isPrefilled && (
        <div className="mx-6 mt-4 flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.teamGenerator.participantsLoadedFromYourConversation', 'Participants loaded from your conversation')}</span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Add Participant */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Add Participants ({participants.length})
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newParticipant}
              onChange={(e) => setNewParticipant(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addParticipant()}
              placeholder={t('tools.teamGenerator.enterAName', 'Enter a name...')}
              className={`flex-1 px-4 py-3 rounded-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <button
              onClick={addParticipant}
              disabled={!newParticipant.trim()}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                newParticipant.trim()
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : isDark
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => setShowBulkInput(!showBulkInput)}
            className={`text-sm ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
          >
            {showBulkInput ? t('tools.teamGenerator.hideBulkInput', 'Hide bulk input') : t('tools.teamGenerator.addMultipleNamesAtOnce', 'Add multiple names at once')}
          </button>
        </div>

        {/* Bulk Input */}
        {showBulkInput && (
          <div className="space-y-2">
            <textarea
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              placeholder={t('tools.teamGenerator.enterNamesSeparatedByCommas', 'Enter names separated by commas or new lines...')}
              rows={3}
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <button
              onClick={addBulkParticipants}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {t('tools.teamGenerator.addAllNames', 'Add All Names')}
            </button>
          </div>
        )}

        {/* Participants List */}
        {participants.length > 0 && (
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex flex-wrap gap-2">
              {participants.map((person) => (
                <div
                  key={person}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                    isDark
                      ? 'bg-gray-700 text-gray-200'
                      : 'bg-white text-gray-700 border border-gray-200'
                  }`}
                >
                  <span className="text-sm font-medium">{person}</span>
                  <button
                    onClick={() => removeParticipant(person)}
                    className={`hover:text-red-500 transition-colors`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Team Count */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.teamGenerator.numberOfTeams', 'Number of Teams')}
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="2"
              max={Math.min(8, Math.max(2, participants.length))}
              value={teamCount}
              onChange={(e) => setTeamCount(parseInt(e.target.value))}
              className="flex-1 h-2 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className={`text-2xl font-bold w-12 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {teamCount}
            </span>
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            ~{Math.floor(participants.length / teamCount)} members per team
            {participants.length % teamCount !== 0 && ` (${participants.length % teamCount} team(s) will have +1)`}
          </p>
        </div>

        {/* Generate Button */}
        <div className="flex gap-3">
          <button
            onClick={generateTeams}
            disabled={participants.length < teamCount || isGenerating}
            className={`flex-1 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold text-lg rounded-xl transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 ${
              participants.length < teamCount || isGenerating ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Shuffle className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? t('tools.teamGenerator.shuffling', 'Shuffling...') : t('tools.teamGenerator.generateTeams', 'Generate Teams')}
          </button>
          {participants.length > 0 && (
            <button
              onClick={clearAll}
              className={`px-4 py-4 rounded-xl transition-colors ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Generated Teams */}
        {teams.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.teamGenerator.generatedTeams', 'Generated Teams')}
              </h4>
              <div className="flex gap-2">
                <button
                  onClick={copyTeams}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    isDark
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? t('tools.teamGenerator.copied', 'Copied!') : t('tools.teamGenerator.copy', 'Copy')}
                </button>
                <button
                  onClick={exportTeams}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    isDark
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  {t('tools.teamGenerator.export', 'Export')}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teams.map((team, idx) => (
                <div
                  key={team.id}
                  className={`p-4 rounded-xl border ${TEAM_BG_COLORS[idx % TEAM_BG_COLORS.length]}`}
                >
                  <div className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${team.color} text-white text-sm font-bold mb-3`}>
                    {team.name}
                  </div>
                  <ul className="space-y-1">
                    {team.members.map((member, memberIdx) => (
                      <li
                        key={memberIdx}
                        className={`flex items-center gap-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
                      >
                        <span className="w-6 h-6 rounded-full bg-gradient-to-r ${team.color} flex items-center justify-center text-xs text-white font-medium">
                          {memberIdx + 1}
                        </span>
                        {member}
                      </li>
                    ))}
                  </ul>
                  <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.teamGenerator.tip', 'Tip:')}</strong> Teams are randomly shuffled using a fair algorithm. Click "Generate Teams" again to reshuffle. Perfect for sports, group projects, or game nights!
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeamGeneratorTool;
