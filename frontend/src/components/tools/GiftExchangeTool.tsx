import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Gift, Plus, X, Shuffle, RotateCcw, Sparkles, Download, Eye, EyeOff, Mail, Copy, Check } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface Participant {
  id: string;
  name: string;
  email?: string;
  exclusions: string[]; // Names of people they can't be matched with
}

interface Assignment {
  giver: string;
  receiver: string;
  revealed: boolean;
}

interface GiftExchangeToolProps {
  uiConfig?: UIConfig;
}

export const GiftExchangeTool: React.FC<GiftExchangeToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [eventName, setEventName] = useState('Secret Santa');
  const [budget, setBudget] = useState('');
  const [exchangeDate, setExchangeDate] = useState('');
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [showBulkInput, setShowBulkInput] = useState(false);
  const [bulkInput, setBulkInput] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params && !isPrefilled) {
      const params = uiConfig.params as ToolPrefillData & {
        participants?: string[];
        eventName?: string;
        budget?: string;
        exchangeDate?: string;
      };
      if (params.participants) {
        setParticipants(params.participants.map((name, idx) => ({
          id: `p-${idx}`,
          name,
          exclusions: [],
        })));
      }
      if (params.eventName) setEventName(params.eventName);
      if (params.budget) setBudget(params.budget);
      if (params.exchangeDate) setExchangeDate(params.exchangeDate);
      if (params.text) {
        const names = params.text.split(/[,\n]/).map(n => n.trim()).filter(n => n);
        if (names.length > 0) {
          setParticipants(names.map((name, idx) => ({
            id: `p-${idx}`,
            name,
            exclusions: [],
          })));
        }
      }
      setIsPrefilled(true);
    }
  }, [uiConfig?.params, isPrefilled]);

  const addParticipant = useCallback(() => {
    if (newName.trim() && !participants.some(p => p.name === newName.trim())) {
      setParticipants(prev => [...prev, {
        id: `p-${Date.now()}`,
        name: newName.trim(),
        email: newEmail.trim() || undefined,
        exclusions: [],
      }]);
      setNewName('');
      setNewEmail('');
    }
  }, [newName, newEmail, participants]);

  const removeParticipant = useCallback((id: string) => {
    const participant = participants.find(p => p.id === id);
    if (participant) {
      setParticipants(prev => prev
        .filter(p => p.id !== id)
        .map(p => ({
          ...p,
          exclusions: p.exclusions.filter(e => e !== participant.name),
        }))
      );
      setAssignments([]);
    }
  }, [participants]);

  const addBulkParticipants = useCallback(() => {
    const lines = bulkInput.split('\n').map(l => l.trim()).filter(l => l);
    const newParticipants: Participant[] = [];

    lines.forEach((line, idx) => {
      // Support format: "Name, email@example.com" or just "Name"
      const parts = line.split(',').map(p => p.trim());
      const name = parts[0];
      const email = parts[1] && parts[1].includes('@') ? parts[1] : undefined;

      if (name && !participants.some(p => p.name === name) && !newParticipants.some(p => p.name === name)) {
        newParticipants.push({
          id: `p-${Date.now()}-${idx}`,
          name,
          email,
          exclusions: [],
        });
      }
    });

    if (newParticipants.length > 0) {
      setParticipants(prev => [...prev, ...newParticipants]);
      setBulkInput('');
      setShowBulkInput(false);
    }
  }, [bulkInput, participants]);

  const toggleExclusion = useCallback((participantId: string, excludeName: string) => {
    setParticipants(prev => prev.map(p => {
      if (p.id === participantId) {
        const exclusions = p.exclusions.includes(excludeName)
          ? p.exclusions.filter(e => e !== excludeName)
          : [...p.exclusions, excludeName];
        return { ...p, exclusions };
      }
      return p;
    }));
    setAssignments([]);
  }, []);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const generateAssignments = useCallback(() => {
    if (participants.length < 2) {
      setError('Need at least 2 participants');
      return;
    }

    setError(null);
    const names = participants.map(p => p.name);

    // Try to find valid assignments (with retry limit)
    for (let attempt = 0; attempt < 1000; attempt++) {
      const shuffled = shuffleArray(names);
      const newAssignments: Assignment[] = [];
      let valid = true;

      for (let i = 0; i < shuffled.length; i++) {
        const giver = shuffled[i];
        const receiver = shuffled[(i + 1) % shuffled.length];

        // Check if this assignment is valid
        const giverParticipant = participants.find(p => p.name === giver);
        if (giver === receiver || giverParticipant?.exclusions.includes(receiver)) {
          valid = false;
          break;
        }

        newAssignments.push({
          giver,
          receiver,
          revealed: false,
        });
      }

      if (valid) {
        setAssignments(newAssignments);
        return;
      }
    }

    setError('Could not generate valid assignments with current exclusions. Try removing some exclusions.');
  }, [participants]);

  const revealAssignment = useCallback((giver: string) => {
    setAssignments(prev => prev.map(a =>
      a.giver === giver ? { ...a, revealed: true } : a
    ));
  }, []);

  const hideAssignment = useCallback((giver: string) => {
    setAssignments(prev => prev.map(a =>
      a.giver === giver ? { ...a, revealed: false } : a
    ));
  }, []);

  const copyAssignment = useCallback((assignment: Assignment) => {
    const text = `${eventName}\n\nHello ${assignment.giver}!\n\nYou are ${assignment.receiver}'s Secret Santa!${budget ? `\n\nBudget: ${budget}` : ''}${exchangeDate ? `\nExchange Date: ${exchangeDate}` : ''}\n\nHappy gifting!`;
    navigator.clipboard.writeText(text);
    setCopied(assignment.giver);
    setTimeout(() => setCopied(null), 2000);
  }, [eventName, budget, exchangeDate]);

  const exportAssignments = useCallback(() => {
    let text = `${eventName}\n${'='.repeat(eventName.length)}\n\n`;

    if (budget) text += `Budget: ${budget}\n`;
    if (exchangeDate) text += `Exchange Date: ${exchangeDate}\n`;
    text += '\n';

    text += 'Assignments:\n';
    assignments.forEach(a => {
      text += `  ${a.giver} -> ${a.receiver}\n`;
    });

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${eventName.toLowerCase().replace(/\s+/g, '-')}-assignments.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [assignments, eventName, budget, exchangeDate]);

  const clearAll = useCallback(() => {
    setAssignments([]);
    setError(null);
  }, []);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-red-900/20' : 'bg-gradient-to-r from-white to-red-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <Gift className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.giftExchange.giftExchangeGenerator', 'Gift Exchange Generator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.giftExchange.organizeSecretSantaOrGift', 'Organize Secret Santa or gift exchanges')}</p>
          </div>
        </div>
      </div>

      {/* Prefill indicator */}
      {isPrefilled && (
        <div className="mx-6 mt-4 flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.giftExchange.settingsLoadedFromYourConversation', 'Settings loaded from your conversation')}</span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Event Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.giftExchange.eventName', 'Event Name')}
            </label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder={t('tools.giftExchange.secretSanta', 'Secret Santa...')}
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-red-500`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.giftExchange.budgetOptional', 'Budget (optional)')}
            </label>
            <input
              type="text"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="$25"
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-red-500`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.giftExchange.exchangeDateOptional', 'Exchange Date (optional)')}
            </label>
            <input
              type="date"
              value={exchangeDate}
              onChange={(e) => setExchangeDate(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-red-500`}
            />
          </div>
        </div>

        {/* Add Participant */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Add Participants ({participants.length})
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addParticipant()}
              placeholder={t('tools.giftExchange.name', 'Name')}
              className={`flex-1 px-4 py-3 rounded-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-red-500`}
            />
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addParticipant()}
              placeholder={t('tools.giftExchange.emailOptional', 'Email (optional)')}
              className={`flex-1 px-4 py-3 rounded-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-red-500`}
            />
            <button
              onClick={addParticipant}
              disabled={!newName.trim()}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                newName.trim()
                  ? 'bg-red-500 hover:bg-red-600 text-white'
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
            className={`text-sm ${isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'}`}
          >
            {showBulkInput ? t('tools.giftExchange.hideBulkInput', 'Hide bulk input') : t('tools.giftExchange.addMultipleParticipants', 'Add multiple participants')}
          </button>
        </div>

        {/* Bulk Input */}
        {showBulkInput && (
          <div className="space-y-2">
            <textarea
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              placeholder={t('tools.giftExchange.enterOneParticipantPerLine', 'Enter one participant per line (optional: Name, email@example.com)')}
              rows={4}
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-red-500`}
            />
            <button
              onClick={addBulkParticipants}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {t('tools.giftExchange.addAll', 'Add All')}
            </button>
          </div>
        )}

        {/* Participants List with Exclusions */}
        {participants.length > 0 && (
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.giftExchange.participantsExclusions', 'Participants & Exclusions')}
            </h4>
            <div className="space-y-3">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white border border-gray-200'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {participant.name}
                      </span>
                      {participant.email && (
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          ({participant.email})
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => removeParticipant(participant.id)}
                      className="text-red-500 hover:text-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {participants.length > 1 && (
                    <div className="flex flex-wrap gap-1">
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {t('tools.giftExchange.canTBeMatchedWith', 'Can\'t be matched with:')}
                      </span>
                      {participants
                        .filter(p => p.id !== participant.id)
                        .map(other => (
                          <button
                            key={other.id}
                            onClick={() => toggleExclusion(participant.id, other.name)}
                            className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                              participant.exclusions.includes(other.name)
                                ? 'bg-red-500/20 text-red-500 border border-red-500/50'
                                : isDark
                                ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                          >
                            {other.name}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500">
            {error}
          </div>
        )}

        {/* Generate Button */}
        <div className="flex gap-3">
          <button
            onClick={generateAssignments}
            disabled={participants.length < 2}
            className={`flex-1 py-4 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-bold text-lg rounded-xl transition-all shadow-lg shadow-red-500/30 flex items-center justify-center gap-2 ${
              participants.length < 2 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Shuffle className="w-5 h-5" />
            {t('tools.giftExchange.generateAssignments', 'Generate Assignments')}
          </button>
          {assignments.length > 0 && (
            <>
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
            </>
          )}
        </div>

        {/* Assignments */}
        {assignments.length > 0 && (
          <div className="space-y-3">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.giftExchange.secretAssignments', 'Secret Assignments')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {assignments.map((assignment) => (
                <div
                  key={assignment.giver}
                  className={`p-4 rounded-xl border ${
                    isDark
                      ? 'bg-gray-800 border-gray-700'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {assignment.giver}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Gift className={`w-4 h-4 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
                        {assignment.revealed ? (
                          <span className={`font-bold ${isDark ? 'text-red-400' : 'text-red-500'}`}>
                            {assignment.receiver}
                          </span>
                        ) : (
                          <span className={`italic ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            Hidden
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => assignment.revealed ? hideAssignment(assignment.giver) : revealAssignment(assignment.giver)}
                        className={`p-2 rounded-lg transition-colors ${
                          isDark
                            ? 'hover:bg-gray-700 text-gray-400'
                            : 'hover:bg-gray-100 text-gray-500'
                        }`}
                        title={assignment.revealed ? t('tools.giftExchange.hide', 'Hide') : t('tools.giftExchange.reveal', 'Reveal')}
                      >
                        {assignment.revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => copyAssignment(assignment)}
                        className={`p-2 rounded-lg transition-colors ${
                          isDark
                            ? 'hover:bg-gray-700 text-gray-400'
                            : 'hover:bg-gray-100 text-gray-500'
                        }`}
                        title={t('tools.giftExchange.copyMessage', 'Copy message')}
                      >
                        {copied === assignment.giver ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.giftExchange.tip', 'Tip:')}</strong> Set exclusions if certain people shouldn't be matched (e.g., couples, family members). Click the eye icon to reveal individual assignments without spoiling others.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GiftExchangeTool;
