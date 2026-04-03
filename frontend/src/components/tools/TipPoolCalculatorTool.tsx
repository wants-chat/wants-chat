'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Coins,
  Plus,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Loader2,
  DollarSign,
  Users,
  Clock,
  Calculator,
  Percent,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { UIConfig } from '../ContextualUI';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';

interface TipPoolCalculatorToolProps {
  uiConfig?: UIConfig;
}

type DistributionMethod = 'equal' | 'hours' | 'points' | 'custom';

interface PoolMember {
  id: string;
  name: string;
  role: string;
  hoursWorked: number;
  pointValue: number;
  customPercent: number;
  tipShare: number;
  createdAt: string;
  updatedAt: string;
}

interface TipPoolSession {
  id: string;
  date: string;
  shiftName: string;
  totalTips: number;
  cashTips: number;
  cardTips: number;
  distributionMethod: DistributionMethod;
  members: PoolMember[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const ROLES = ['Server', 'Bartender', 'Busser', 'Host', 'Food Runner', 'Barback', 'Expo'];

const ROLE_POINTS: Record<string, number> = {
  Server: 1.0,
  Bartender: 1.0,
  Busser: 0.5,
  Host: 0.3,
  'Food Runner': 0.5,
  Barback: 0.5,
  Expo: 0.4,
};

const TIP_POOL_COLUMNS: ColumnConfig[] = [
  { key: 'date', header: 'Date', type: 'string' },
  { key: 'shiftName', header: 'Shift', type: 'string' },
  { key: 'totalTips', header: 'Total Tips', type: 'currency' },
  { key: 'distributionMethod', header: 'Method', type: 'string' },
];

export const TipPoolCalculatorTool: React.FC<TipPoolCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const {
    data: sessions,
    setData: setSessions,
    addItem,
    updateItem,
    deleteItem,
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
  } = useToolData<TipPoolSession>('tip-pool-calculator', [], TIP_POOL_COLUMNS);

  const [showAddForm, setShowAddForm] = useState(true);
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());

  const [currentSession, setCurrentSession] = useState<Partial<TipPoolSession>>({
    date: new Date().toISOString().split('T')[0],
    shiftName: 'Dinner',
    totalTips: 0,
    cashTips: 0,
    cardTips: 0,
    distributionMethod: 'hours',
    members: [],
    notes: '',
  });

  const [newMember, setNewMember] = useState({
    name: '',
    role: 'Server',
    hoursWorked: 0,
    customPercent: 0,
  });

  const calculateDistribution = (session: Partial<TipPoolSession>): PoolMember[] => {
    const members = session.members || [];
    const totalTips = session.totalTips || 0;
    const method = session.distributionMethod || 'hours';

    if (members.length === 0 || totalTips === 0) {
      return members.map((m) => ({ ...m, tipShare: 0 }));
    }

    switch (method) {
      case 'equal': {
        const share = totalTips / members.length;
        return members.map((m) => ({ ...m, tipShare: share }));
      }
      case 'hours': {
        const totalHours = members.reduce((sum, m) => sum + m.hoursWorked, 0);
        if (totalHours === 0) {
          return members.map((m) => ({ ...m, tipShare: 0 }));
        }
        return members.map((m) => ({
          ...m,
          tipShare: (m.hoursWorked / totalHours) * totalTips,
        }));
      }
      case 'points': {
        const totalPoints = members.reduce((sum, m) => sum + (m.pointValue * m.hoursWorked), 0);
        if (totalPoints === 0) {
          return members.map((m) => ({ ...m, tipShare: 0 }));
        }
        return members.map((m) => ({
          ...m,
          tipShare: ((m.pointValue * m.hoursWorked) / totalPoints) * totalTips,
        }));
      }
      case 'custom': {
        return members.map((m) => ({
          ...m,
          tipShare: (m.customPercent / 100) * totalTips,
        }));
      }
      default:
        return members;
    }
  };

  const calculatedMembers = useMemo(() => {
    return calculateDistribution(currentSession);
  }, [currentSession]);

  const stats = useMemo(() => {
    const totalTipsAllTime = sessions.reduce((sum, s) => sum + s.totalTips, 0);
    const totalSessions = sessions.length;
    const avgTipsPerSession = totalSessions > 0 ? totalTipsAllTime / totalSessions : 0;
    const todaysSessions = sessions.filter((s) =>
      s.date === new Date().toISOString().split('T')[0]
    );
    const todaysTips = todaysSessions.reduce((sum, s) => sum + s.totalTips, 0);

    return { totalTipsAllTime, totalSessions, avgTipsPerSession, todaysTips };
  }, [sessions]);

  const handleAddMember = () => {
    if (!newMember.name || !newMember.hoursWorked) return;

    const member: PoolMember = {
      id: `member-${Date.now()}`,
      name: newMember.name,
      role: newMember.role,
      hoursWorked: newMember.hoursWorked,
      pointValue: ROLE_POINTS[newMember.role] || 1.0,
      customPercent: newMember.customPercent,
      tipShare: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCurrentSession({
      ...currentSession,
      members: [...(currentSession.members || []), member],
    });
    setNewMember({ name: '', role: 'Server', hoursWorked: 0, customPercent: 0 });
  };

  const handleRemoveMember = (memberId: string) => {
    setCurrentSession({
      ...currentSession,
      members: (currentSession.members || []).filter((m) => m.id !== memberId),
    });
  };

  const handleUpdateMember = (memberId: string, updates: Partial<PoolMember>) => {
    setCurrentSession({
      ...currentSession,
      members: (currentSession.members || []).map((m) =>
        m.id === memberId ? { ...m, ...updates } : m
      ),
    });
  };

  const handleSaveSession = () => {
    if (!currentSession.totalTips || !(currentSession.members?.length)) return;

    const finalMembers = calculateDistribution(currentSession);

    const session: TipPoolSession = {
      id: `session-${Date.now()}`,
      date: currentSession.date || new Date().toISOString().split('T')[0],
      shiftName: currentSession.shiftName || 'Shift',
      totalTips: currentSession.totalTips || 0,
      cashTips: currentSession.cashTips || 0,
      cardTips: currentSession.cardTips || 0,
      distributionMethod: currentSession.distributionMethod || 'hours',
      members: finalMembers,
      notes: currentSession.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addItem(session);
    setCurrentSession({
      date: new Date().toISOString().split('T')[0],
      shiftName: 'Dinner',
      totalTips: 0,
      cashTips: 0,
      cardTips: 0,
      distributionMethod: 'hours',
      members: [],
      notes: '',
    });
  };

  const toggleSessionExpand = (id: string) => {
    const newExpanded = new Set(expandedSessions);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSessions(newExpanded);
  };

  const handleReset = async () => {
    const confirmed = await confirm({
      title: 'Confirm',
      message: 'Are you sure you want to clear all tip pool sessions?',
      confirmText: 'Yes',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      setSessions([]);
    }
  };

  const totalCustomPercent = useMemo(() => {
    return (currentSession.members || []).reduce((sum, m) => sum + (m.customPercent || 0), 0);
  }, [currentSession.members]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#0D9488]/10 rounded-xl">
                  <Coins className="w-6 h-6 text-[#0D9488]" />
                </div>
                <div>
                  <CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>
                    {t('tools.tipPoolCalculator.tipPoolCalculator', 'Tip Pool Calculator')}
                  </CardTitle>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.tipPoolCalculator.calculateAndDistributePooledTips', 'Calculate and distribute pooled tips among staff')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <WidgetEmbedButton toolSlug="tip-pool-calculator" toolName="Tip Pool Calculator" />

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
                  onExportCSV={() => exportCSV({ filename: 'tip-pool' })}
                  onExportExcel={() => exportExcel({ filename: 'tip-pool' })}
                  onExportJSON={() => exportJSON({ filename: 'tip-pool' })}
                  onExportPDF={() => exportPDF({
                    filename: 'tip-pool',
                    title: 'Tip Pool Records',
                    subtitle: `${sessions.length} sessions`,
                  })}
                  onPrint={() => print('Tip Pool Records')}
                  onCopyToClipboard={() => copyToClipboard('tab')}
                  onImportCSV={async (file) => { await importCSV(file); }}
                  onImportJSON={async (file) => { await importJSON(file); }}
                  theme={isDark ? 'dark' : 'light'}
                  disabled={sessions.length === 0}
                />
                <button
                  onClick={handleReset}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-red-500 ${
                    isDark ? 'hover:bg-red-900/20' : 'hover:bg-red-50'
                  }`}
                >
                  <RefreshCw className="w-4 h-4" />
                  {t('tools.tipPoolCalculator.reset', 'Reset')}
                </button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tipPoolCalculator.todaySTips', 'Today\'s Tips')}</div>
            <div className="text-2xl font-bold text-green-500">${stats.todaysTips.toFixed(2)}</div>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tipPoolCalculator.allTimeTips', 'All-Time Tips')}</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              ${stats.totalTipsAllTime.toFixed(2)}
            </div>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tipPoolCalculator.totalSessions', 'Total Sessions')}</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalSessions}</div>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tipPoolCalculator.avgPerSession', 'Avg Per Session')}</div>
            <div className="text-2xl font-bold text-[#0D9488]">${stats.avgTipsPerSession.toFixed(2)}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calculator Form */}
          <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardHeader>
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setShowAddForm(!showAddForm)}
              >
                <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Calculator className="w-5 h-5 text-[#0D9488]" />
                  {t('tools.tipPoolCalculator.newTipPoolSession', 'New Tip Pool Session')}
                </CardTitle>
                {showAddForm ? (
                  <ChevronUp className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                ) : (
                  <ChevronDown className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                )}
              </div>
            </CardHeader>
            {showAddForm && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.tipPoolCalculator.date', 'Date')}
                    </label>
                    <input
                      type="date"
                      value={currentSession.date}
                      onChange={(e) => setCurrentSession({ ...currentSession, date: e.target.value })}
                      className={`w-full px-4 py-2 border ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white'
                          : 'border-gray-200 bg-white text-gray-900'
                      } rounded-lg`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.tipPoolCalculator.shift', 'Shift')}
                    </label>
                    <select
                      value={currentSession.shiftName}
                      onChange={(e) => setCurrentSession({ ...currentSession, shiftName: e.target.value })}
                      className={`w-full px-4 py-2 border ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white'
                          : 'border-gray-200 bg-white text-gray-900'
                      } rounded-lg`}
                    >
                      <option>{t('tools.tipPoolCalculator.breakfast', 'Breakfast')}</option>
                      <option>{t('tools.tipPoolCalculator.lunch', 'Lunch')}</option>
                      <option>{t('tools.tipPoolCalculator.dinner', 'Dinner')}</option>
                      <option>{t('tools.tipPoolCalculator.lateNight', 'Late Night')}</option>
                      <option>{t('tools.tipPoolCalculator.double', 'Double')}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.tipPoolCalculator.cashTips', 'Cash Tips ($)')}
                    </label>
                    <input
                      type="number"
                      value={currentSession.cashTips || ''}
                      onChange={(e) => {
                        const cash = parseFloat(e.target.value) || 0;
                        setCurrentSession({
                          ...currentSession,
                          cashTips: cash,
                          totalTips: cash + (currentSession.cardTips || 0),
                        });
                      }}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className={`w-full px-4 py-2 border ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                          : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                      } rounded-lg`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.tipPoolCalculator.cardTips', 'Card Tips ($)')}
                    </label>
                    <input
                      type="number"
                      value={currentSession.cardTips || ''}
                      onChange={(e) => {
                        const card = parseFloat(e.target.value) || 0;
                        setCurrentSession({
                          ...currentSession,
                          cardTips: card,
                          totalTips: (currentSession.cashTips || 0) + card,
                        });
                      }}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className={`w-full px-4 py-2 border ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400'
                          : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                      } rounded-lg`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.tipPoolCalculator.totalTips', 'Total Tips')}
                    </label>
                    <div className={`px-4 py-2 border rounded-lg text-2xl font-bold text-green-500 ${
                      isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-100'
                    }`}>
                      ${(currentSession.totalTips || 0).toFixed(2)}
                    </div>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.tipPoolCalculator.distributionMethod', 'Distribution Method')}
                  </label>
                  <select
                    value={currentSession.distributionMethod}
                    onChange={(e) => setCurrentSession({ ...currentSession, distributionMethod: e.target.value as DistributionMethod })}
                    className={`w-full px-4 py-2 border ${
                      isDark
                        ? 'border-gray-600 bg-gray-700 text-white'
                        : 'border-gray-200 bg-white text-gray-900'
                    } rounded-lg`}
                  >
                    <option value="equal">{t('tools.tipPoolCalculator.equalSplit', 'Equal Split')}</option>
                    <option value="hours">{t('tools.tipPoolCalculator.byHoursWorked', 'By Hours Worked')}</option>
                    <option value="points">{t('tools.tipPoolCalculator.pointSystemByRole', 'Point System (by role)')}</option>
                    <option value="custom">{t('tools.tipPoolCalculator.customPercentage', 'Custom Percentage')}</option>
                  </select>
                </div>

                {/* Add Team Members */}
                <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <Users className="w-4 h-4 inline mr-2" />
                    {t('tools.tipPoolCalculator.teamMembers', 'Team Members')}
                  </h4>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    <input
                      type="text"
                      value={newMember.name}
                      onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                      placeholder={t('tools.tipPoolCalculator.name', 'Name')}
                      className={`px-3 py-2 border ${
                        isDark
                          ? 'border-gray-600 bg-gray-600 text-white placeholder:text-gray-400'
                          : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                      } rounded-lg text-sm`}
                    />
                    <select
                      value={newMember.role}
                      onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                      className={`px-3 py-2 border ${
                        isDark
                          ? 'border-gray-600 bg-gray-600 text-white'
                          : 'border-gray-200 bg-white text-gray-900'
                      } rounded-lg text-sm`}
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={newMember.hoursWorked || ''}
                      onChange={(e) => setNewMember({ ...newMember, hoursWorked: parseFloat(e.target.value) || 0 })}
                      placeholder={t('tools.tipPoolCalculator.hours', 'Hours')}
                      min="0"
                      step="0.5"
                      className={`px-3 py-2 border ${
                        isDark
                          ? 'border-gray-600 bg-gray-600 text-white placeholder:text-gray-400'
                          : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                      } rounded-lg text-sm`}
                    />
                    <button
                      onClick={handleAddMember}
                      disabled={!newMember.name || !newMember.hoursWorked}
                      className="px-3 py-2 bg-[#0D9488] text-white rounded-lg disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Members List with Calculated Tips */}
                  {calculatedMembers.length > 0 && (
                    <div className="space-y-2">
                      {calculatedMembers.map((member) => (
                        <div
                          key={member.id}
                          className={`flex items-center justify-between p-3 rounded ${
                            isDark ? 'bg-gray-600' : 'bg-white'
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {member.name}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded ${isDark ? 'bg-gray-500 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                                {member.role}
                              </span>
                            </div>
                            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {member.hoursWorked} hrs
                              {currentSession.distributionMethod === 'points' && (
                                <span> x {member.pointValue} pts</span>
                              )}
                            </div>
                          </div>
                          {currentSession.distributionMethod === 'custom' && (
                            <input
                              type="number"
                              value={member.customPercent || ''}
                              onChange={(e) => handleUpdateMember(member.id, { customPercent: parseFloat(e.target.value) || 0 })}
                              placeholder="%"
                              min="0"
                              max="100"
                              className={`w-16 px-2 py-1 border ${
                                isDark
                                  ? 'border-gray-500 bg-gray-500 text-white'
                                  : 'border-gray-200 bg-gray-50 text-gray-900'
                              } rounded text-sm text-center mr-2`}
                            />
                          )}
                          <div className="text-lg font-bold text-green-500">
                            ${member.tipShare.toFixed(2)}
                          </div>
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="ml-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 p-1 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {currentSession.distributionMethod === 'custom' && (
                        <div className={`text-sm text-right ${totalCustomPercent !== 100 ? 'text-red-500' : 'text-green-500'}`}>
                          Total: {totalCustomPercent}% {totalCustomPercent !== 100 && '(should be 100%)'}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSaveSession}
                  disabled={!currentSession.totalTips || !(currentSession.members?.length)}
                  className="w-full py-3 px-6 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] hover:from-[#2DD4BF] hover:to-[#0D9488] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Coins className="w-5 h-5" />
                  {t('tools.tipPoolCalculator.saveTipPoolSession', 'Save Tip Pool Session')}
                </button>
              </CardContent>
            )}
          </Card>

          {/* Previous Sessions */}
          <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <Clock className="w-5 h-5 text-[#0D9488]" />
                Previous Sessions ({sessions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Coins className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t('tools.tipPoolCalculator.noTipPoolSessions', 'No tip pool sessions')}</p>
                  <p className="text-sm mt-1">{t('tools.tipPoolCalculator.createASessionToGet', 'Create a session to get started')}</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {sessions
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((session) => (
                      <div
                        key={session.id}
                        className={`rounded-xl border ${
                          isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div
                          className="p-4 cursor-pointer"
                          onClick={() => toggleSessionExpand(session.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {new Date(session.date).toLocaleDateString()}
                                </span>
                                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {session.shiftName}
                                </span>
                              </div>
                              <div className="text-lg font-bold text-green-500">
                                ${session.totalTips.toFixed(2)}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {session.members.length} staff
                              </span>
                              <button
                                onClick={(e) => { e.stopPropagation(); deleteItem(session.id); }}
                                className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              {expandedSessions.has(session.id) ? (
                                <ChevronUp className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                              ) : (
                                <ChevronDown className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                              )}
                            </div>
                          </div>
                        </div>

                        {expandedSessions.has(session.id) && (
                          <div className={`px-4 pb-4 border-t ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                            <div className="mt-3 space-y-2">
                              {session.members.map((member) => (
                                <div key={member.id} className="flex justify-between text-sm">
                                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                                    {member.name} ({member.role}) - {member.hoursWorked}hrs
                                  </span>
                                  <span className="font-medium text-green-500">
                                    ${member.tipShare.toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <ConfirmDialog />
    </div>
  );
};

export default TipPoolCalculatorTool;
