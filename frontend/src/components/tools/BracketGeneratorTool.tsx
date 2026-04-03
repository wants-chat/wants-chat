import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Trophy, Plus, X, Shuffle, RotateCcw, Sparkles, Download, ChevronRight } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface Match {
  id: string;
  round: number;
  position: number;
  participant1: string | null;
  participant2: string | null;
  winner: string | null;
}

interface BracketGeneratorToolProps {
  uiConfig?: UIConfig;
}

export const BracketGeneratorTool: React.FC<BracketGeneratorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [participants, setParticipants] = useState<string[]>([]);
  const [newParticipant, setNewParticipant] = useState('');
  const [matches, setMatches] = useState<Match[]>([]);
  const [bracketGenerated, setBracketGenerated] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [tournamentName, setTournamentName] = useState('Tournament');
  const [showBulkInput, setShowBulkInput] = useState(false);
  const [bulkInput, setBulkInput] = useState('');

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData & {
        participants?: string[];
        tournamentName?: string;
      };
      if (params.participants) setParticipants(params.participants);
      if (params.tournamentName) setTournamentName(params.tournamentName);
      if (params.text) {
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
    setBracketGenerated(false);
    setMatches([]);
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

  const getNextPowerOfTwo = (n: number): number => {
    return Math.pow(2, Math.ceil(Math.log2(n)));
  };

  const generateBracket = useCallback(() => {
    if (participants.length < 2) return;

    const shuffled = shuffleArray(participants);
    const bracketSize = getNextPowerOfTwo(shuffled.length);
    const numRounds = Math.log2(bracketSize);
    const newMatches: Match[] = [];

    // Add byes if needed
    const paddedParticipants: (string | null)[] = [...shuffled];
    while (paddedParticipants.length < bracketSize) {
      paddedParticipants.push(null);
    }

    // Create first round matches
    for (let i = 0; i < bracketSize / 2; i++) {
      const p1 = paddedParticipants[i * 2];
      const p2 = paddedParticipants[i * 2 + 1];

      // If one participant is a bye, the other automatically advances
      let winner: string | null = null;
      if (p1 && !p2) winner = p1;
      if (p2 && !p1) winner = p2;

      newMatches.push({
        id: `r1-m${i}`,
        round: 1,
        position: i,
        participant1: p1,
        participant2: p2,
        winner,
      });
    }

    // Create subsequent rounds (empty matches)
    for (let round = 2; round <= numRounds; round++) {
      const matchesInRound = Math.pow(2, numRounds - round);
      for (let i = 0; i < matchesInRound; i++) {
        newMatches.push({
          id: `r${round}-m${i}`,
          round,
          position: i,
          participant1: null,
          participant2: null,
          winner: null,
        });
      }
    }

    // Propagate automatic wins from byes
    propagateWinners(newMatches);

    setMatches(newMatches);
    setBracketGenerated(true);
  }, [participants]);

  const propagateWinners = (matchList: Match[]) => {
    const rounds = [...new Set(matchList.map(m => m.round))].sort((a, b) => a - b);

    for (const round of rounds) {
      const roundMatches = matchList.filter(m => m.round === round);

      for (const match of roundMatches) {
        if (match.winner) {
          // Find next round match
          const nextRound = round + 1;
          const nextPosition = Math.floor(match.position / 2);
          const nextMatch = matchList.find(m => m.round === nextRound && m.position === nextPosition);

          if (nextMatch) {
            if (match.position % 2 === 0) {
              nextMatch.participant1 = match.winner;
            } else {
              nextMatch.participant2 = match.winner;
            }

            // Check if next match now has auto-winner
            if (nextMatch.participant1 && !nextMatch.participant2) {
              nextMatch.winner = nextMatch.participant1;
            } else if (!nextMatch.participant1 && nextMatch.participant2) {
              nextMatch.winner = nextMatch.participant2;
            }
          }
        }
      }
    }
  };

  const selectWinner = useCallback((matchId: string, winner: string) => {
    setMatches(prevMatches => {
      const newMatches = prevMatches.map(m => {
        if (m.id === matchId) {
          return { ...m, winner };
        }
        return m;
      });

      // Propagate winner to next round
      const match = newMatches.find(m => m.id === matchId);
      if (match) {
        const nextRound = match.round + 1;
        const nextPosition = Math.floor(match.position / 2);
        const nextMatch = newMatches.find(m => m.round === nextRound && m.position === nextPosition);

        if (nextMatch) {
          if (match.position % 2 === 0) {
            nextMatch.participant1 = winner;
          } else {
            nextMatch.participant2 = winner;
          }
          // Clear any existing winner if participants changed
          if (nextMatch.winner && nextMatch.winner !== nextMatch.participant1 && nextMatch.winner !== nextMatch.participant2) {
            nextMatch.winner = null;
          }
        }
      }

      return newMatches;
    });
  }, []);

  const clearBracket = useCallback(() => {
    setMatches([]);
    setBracketGenerated(false);
  }, []);

  const exportBracket = useCallback(() => {
    const rounds = [...new Set(matches.map(m => m.round))].sort((a, b) => a - b);
    let text = `${tournamentName}\n${'='.repeat(tournamentName.length)}\n\n`;

    for (const round of rounds) {
      const roundMatches = matches.filter(m => m.round === round);
      const roundName = round === rounds[rounds.length - 1] ? 'Finals' :
        round === rounds[rounds.length - 2] ? 'Semi-Finals' :
          `Round ${round}`;

      text += `${roundName}:\n`;
      for (const match of roundMatches) {
        const p1 = match.participant1 || 'TBD';
        const p2 = match.participant2 || 'BYE';
        const winner = match.winner ? ` -> Winner: ${match.winner}` : '';
        text += `  ${p1} vs ${p2}${winner}\n`;
      }
      text += '\n';
    }

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tournamentName.toLowerCase().replace(/\s+/g, '-')}-bracket.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [matches, tournamentName]);

  const rounds = useMemo(() => {
    return [...new Set(matches.map(m => m.round))].sort((a, b) => a - b);
  }, [matches]);

  const champion = useMemo(() => {
    if (rounds.length === 0) return null;
    const finalMatch = matches.find(m => m.round === rounds[rounds.length - 1]);
    return finalMatch?.winner || null;
  }, [matches, rounds]);

  const getRoundName = (round: number) => {
    if (round === rounds[rounds.length - 1]) return 'Finals';
    if (round === rounds[rounds.length - 2]) return 'Semi-Finals';
    if (round === rounds[rounds.length - 3]) return 'Quarter-Finals';
    return `Round ${round}`;
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-amber-900/20' : 'bg-gradient-to-r from-white to-amber-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <Trophy className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.bracketGenerator.tournamentBracket', 'Tournament Bracket')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.bracketGenerator.createEliminationTournamentBrackets', 'Create elimination tournament brackets')}</p>
          </div>
        </div>
      </div>

      {/* Prefill indicator */}
      {isPrefilled && (
        <div className="mx-6 mt-4 flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.bracketGenerator.participantsLoadedFromYourConversation', 'Participants loaded from your conversation')}</span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {!bracketGenerated ? (
          <>
            {/* Tournament Name */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.bracketGenerator.tournamentName', 'Tournament Name')}
              </label>
              <input
                type="text"
                value={tournamentName}
                onChange={(e) => setTournamentName(e.target.value)}
                placeholder={t('tools.bracketGenerator.enterTournamentName', 'Enter tournament name...')}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDark
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-amber-500`}
              />
            </div>

            {/* Add Participant */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Participants ({participants.length})
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newParticipant}
                  onChange={(e) => setNewParticipant(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addParticipant()}
                  placeholder={t('tools.bracketGenerator.addParticipant', 'Add participant...')}
                  className={`flex-1 px-4 py-3 rounded-lg border ${
                    isDark
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  } focus:outline-none focus:ring-2 focus:ring-amber-500`}
                />
                <button
                  onClick={addParticipant}
                  disabled={!newParticipant.trim()}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                    newParticipant.trim()
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
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
                className={`text-sm ${isDark ? 'text-amber-400 hover:text-amber-300' : 'text-amber-600 hover:text-amber-700'}`}
              >
                {showBulkInput ? t('tools.bracketGenerator.hideBulkInput', 'Hide bulk input') : t('tools.bracketGenerator.addMultipleParticipants', 'Add multiple participants')}
              </button>
            </div>

            {/* Bulk Input */}
            {showBulkInput && (
              <div className="space-y-2">
                <textarea
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  placeholder={t('tools.bracketGenerator.enterNamesSeparatedByCommas', 'Enter names separated by commas or new lines...')}
                  rows={3}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDark
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  } focus:outline-none focus:ring-2 focus:ring-amber-500`}
                />
                <button
                  onClick={addBulkParticipants}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isDark
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {t('tools.bracketGenerator.addAll', 'Add All')}
                </button>
              </div>
            )}

            {/* Participants List */}
            {participants.length > 0 && (
              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex flex-wrap gap-2">
                  {participants.map((person, idx) => (
                    <div
                      key={person}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                        isDark
                          ? 'bg-gray-700 text-gray-200'
                          : 'bg-white text-gray-700 border border-gray-200'
                      }`}
                    >
                      <span className="text-xs font-medium text-amber-500">{idx + 1}</span>
                      <span className="text-sm font-medium">{person}</span>
                      <button
                        onClick={() => removeParticipant(person)}
                        className="hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={generateBracket}
              disabled={participants.length < 2}
              className={`w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-lg rounded-xl transition-all shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 ${
                participants.length < 2 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Shuffle className="w-5 h-5" />
              {t('tools.bracketGenerator.generateBracket', 'Generate Bracket')}
            </button>

            {participants.length < 2 && (
              <p className={`text-sm text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('tools.bracketGenerator.addAtLeast2Participants', 'Add at least 2 participants to generate a bracket')}
              </p>
            )}
          </>
        ) : (
          <>
            {/* Tournament Header */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {tournamentName}
                </h4>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {participants.length} participants - {rounds.length} rounds
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={exportBracket}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isDark
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  {t('tools.bracketGenerator.export', 'Export')}
                </button>
                <button
                  onClick={clearBracket}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isDark
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <RotateCcw className="w-4 h-4" />
                  {t('tools.bracketGenerator.reset', 'Reset')}
                </button>
              </div>
            </div>

            {/* Champion Display */}
            {champion && (
              <div className={`p-6 rounded-xl text-center ${
                isDark ? 'bg-gradient-to-br from-amber-900/50 to-orange-900/50 border border-amber-700' : 'bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200'
              }`}>
                <Trophy className={`w-12 h-12 mx-auto mb-2 ${isDark ? 'text-amber-400' : 'text-amber-500'}`} />
                <p className={`text-sm ${isDark ? 'text-amber-300' : 'text-amber-600'}`}>{t('tools.bracketGenerator.champion', 'Champion')}</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{champion}</p>
              </div>
            )}

            {/* Bracket Display */}
            <div className="overflow-x-auto">
              <div className="flex gap-8 min-w-max py-4">
                {rounds.map((round) => {
                  const roundMatches = matches.filter(m => m.round === round);
                  return (
                    <div key={round} className="flex flex-col gap-4">
                      <h5 className={`text-sm font-semibold text-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {getRoundName(round)}
                      </h5>
                      <div className="flex flex-col justify-around flex-1 gap-4">
                        {roundMatches.map((match) => (
                          <div
                            key={match.id}
                            className={`p-3 rounded-lg border min-w-[200px] ${
                              isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            {/* Participant 1 */}
                            <button
                              onClick={() => match.participant1 && match.participant2 && selectWinner(match.id, match.participant1)}
                              disabled={!match.participant1 || !match.participant2}
                              className={`w-full p-2 rounded flex items-center justify-between transition-colors ${
                                match.winner === match.participant1
                                  ? 'bg-green-500/20 text-green-500'
                                  : match.participant1 && match.participant2
                                  ? isDark
                                    ? 'hover:bg-gray-700 text-gray-200'
                                    : 'hover:bg-gray-100 text-gray-700'
                                  : isDark
                                  ? 'text-gray-500'
                                  : 'text-gray-400'
                              }`}
                            >
                              <span className="font-medium truncate">
                                {match.participant1 || 'TBD'}
                              </span>
                              {match.winner === match.participant1 && (
                                <ChevronRight className="w-4 h-4 text-green-500" />
                              )}
                            </button>

                            <div className={`text-center text-xs py-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                              vs
                            </div>

                            {/* Participant 2 */}
                            <button
                              onClick={() => match.participant1 && match.participant2 && selectWinner(match.id, match.participant2)}
                              disabled={!match.participant1 || !match.participant2}
                              className={`w-full p-2 rounded flex items-center justify-between transition-colors ${
                                match.winner === match.participant2
                                  ? 'bg-green-500/20 text-green-500'
                                  : match.participant1 && match.participant2
                                  ? isDark
                                    ? 'hover:bg-gray-700 text-gray-200'
                                    : 'hover:bg-gray-100 text-gray-700'
                                  : isDark
                                  ? 'text-gray-500'
                                  : 'text-gray-400'
                              }`}
                            >
                              <span className="font-medium truncate">
                                {match.participant2 || (match.participant1 ? t('tools.bracketGenerator.bye', 'BYE') : t('tools.bracketGenerator.tbd', 'TBD'))}
                              </span>
                              {match.winner === match.participant2 && (
                                <ChevronRight className="w-4 h-4 text-green-500" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.bracketGenerator.tip', 'Tip:')}</strong> Click on a participant's name to select them as the winner of that match. Winners automatically advance to the next round.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BracketGeneratorTool;
