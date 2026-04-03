import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, DollarSign, Plus, Trash2, Download, Calculator, FileText } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { useConfirmDialog } from '../ui/ConfirmDialog';

interface BillableHoursCalculatorToolProps {
  uiConfig?: UIConfig;
}

interface TimeEntry {
  id: string;
  date: string;
  client: string;
  matter: string;
  description: string;
  startTime: string;
  endTime: string;
  hours: number;
  rate: number;
  billable: boolean;
  category: string;
}

interface ClientSummary {
  client: string;
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  totalAmount: number;
}

const BILLING_INCREMENTS = [
  { value: 0.1, label: '6 minutes (0.1)' },
  { value: 0.25, label: '15 minutes (0.25)' },
  { value: 0.5, label: '30 minutes (0.5)' },
  { value: 1, label: '1 hour' },
];

const TASK_CATEGORIES = [
  'Research',
  'Document Drafting',
  'Document Review',
  'Client Meeting',
  'Court Appearance',
  'Deposition',
  'Discovery',
  'Correspondence',
  'Travel',
  'Administrative',
  'Other',
];

export default function BillableHoursCalculatorTool({ uiConfig }: BillableHoursCalculatorToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [defaultRate, setDefaultRate] = useState<number>(350);
  const [billingIncrement, setBillingIncrement] = useState<number>(0.1);
  const [currentEntry, setCurrentEntry] = useState<Partial<TimeEntry>>({
    date: new Date().toISOString().split('T')[0],
    client: '',
    matter: '',
    description: '',
    startTime: '',
    endTime: '',
    rate: 350,
    billable: true,
    category: 'Research',
  });
  const [activeView, setActiveView] = useState<'entries' | 'summary' | 'invoice'>('entries');
  const [filterClient, setFilterClient] = useState<string>('');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');

  const calculateHours = (startTime: string, endTime: string): number => {
    if (!startTime || !endTime) return 0;

    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    let diffMinutes = endMinutes - startMinutes;
    if (diffMinutes < 0) diffMinutes += 24 * 60; // Handle overnight

    const hours = diffMinutes / 60;

    // Round to billing increment
    return Math.ceil(hours / billingIncrement) * billingIncrement;
  };

  const addEntry = () => {
    if (!currentEntry.client || !currentEntry.startTime || !currentEntry.endTime) {
      setValidationMessage('Please fill in client name, start time, and end time');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const hours = calculateHours(currentEntry.startTime!, currentEntry.endTime!);

    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      date: currentEntry.date!,
      client: currentEntry.client!,
      matter: currentEntry.matter || 'General',
      description: currentEntry.description || '',
      startTime: currentEntry.startTime!,
      endTime: currentEntry.endTime!,
      hours,
      rate: currentEntry.rate || defaultRate,
      billable: currentEntry.billable!,
      category: currentEntry.category || 'Other',
    };

    setEntries(prev => [...prev, newEntry].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ));

    // Reset form but keep some fields
    setCurrentEntry(prev => ({
      ...prev,
      description: '',
      startTime: prev.endTime,
      endTime: '',
    }));
  };

  const removeEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const toggleBillable = (id: string) => {
    setEntries(prev =>
      prev.map(e => (e.id === id ? { ...e, billable: !e.billable } : e))
    );
  };

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      if (filterClient && !entry.client.toLowerCase().includes(filterClient.toLowerCase())) {
        return false;
      }
      if (filterDateFrom && entry.date < filterDateFrom) {
        return false;
      }
      if (filterDateTo && entry.date > filterDateTo) {
        return false;
      }
      return true;
    });
  }, [entries, filterClient, filterDateFrom, filterDateTo]);

  const clientSummaries = useMemo((): ClientSummary[] => {
    const summaryMap = new Map<string, ClientSummary>();

    filteredEntries.forEach(entry => {
      const existing = summaryMap.get(entry.client) || {
        client: entry.client,
        totalHours: 0,
        billableHours: 0,
        nonBillableHours: 0,
        totalAmount: 0,
      };

      existing.totalHours += entry.hours;
      if (entry.billable) {
        existing.billableHours += entry.hours;
        existing.totalAmount += entry.hours * entry.rate;
      } else {
        existing.nonBillableHours += entry.hours;
      }

      summaryMap.set(entry.client, existing);
    });

    return Array.from(summaryMap.values()).sort((a, b) => b.totalAmount - a.totalAmount);
  }, [filteredEntries]);

  const totals = useMemo(() => {
    return filteredEntries.reduce(
      (acc, entry) => ({
        totalHours: acc.totalHours + entry.hours,
        billableHours: acc.billableHours + (entry.billable ? entry.hours : 0),
        nonBillableHours: acc.nonBillableHours + (entry.billable ? 0 : entry.hours),
        totalAmount: acc.totalAmount + (entry.billable ? entry.hours * entry.rate : 0),
      }),
      { totalHours: 0, billableHours: 0, nonBillableHours: 0, totalAmount: 0 }
    );
  }, [filteredEntries]);

  const exportTimesheet = () => {
    const csv = [
      ['Date', 'Client', 'Matter', 'Category', 'Description', 'Start', 'End', 'Hours', 'Rate', 'Amount', 'Billable'].join(','),
      ...filteredEntries.map(e => [
        e.date,
        `"${e.client}"`,
        `"${e.matter}"`,
        e.category,
        `"${e.description}"`,
        e.startTime,
        e.endTime,
        e.hours.toFixed(2),
        e.rate,
        (e.billable ? e.hours * e.rate : 0).toFixed(2),
        e.billable ? 'Yes' : 'No',
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timesheet_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const uniqueClients = useMemo(() => {
    return [...new Set(entries.map(e => e.client))];
  }, [entries]);

  const previewHours = useMemo(() => {
    if (currentEntry.startTime && currentEntry.endTime) {
      return calculateHours(currentEntry.startTime, currentEntry.endTime);
    }
    return 0;
  }, [currentEntry.startTime, currentEntry.endTime, billingIncrement]);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-6xl mx-auto">
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{t('tools.billableHoursCalculator.billableHoursCalculator', 'Billable Hours Calculator')}</h1>
                  <p className="text-teal-100 text-sm mt-1">{t('tools.billableHoursCalculator.trackTimeAndGenerateInvoices', 'Track time and generate invoices')}</p>
                </div>
              </div>
              <div className="text-right text-white">
                <div className="text-2xl font-bold">{formatCurrency(totals.totalAmount)}</div>
                <div className="text-teal-100 text-sm">{totals.billableHours.toFixed(1)} billable hours</div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Settings Bar */}
            <div className={`flex flex-wrap gap-4 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div>
                <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.billableHoursCalculator.defaultRateHr', 'Default Rate ($/hr)')}
                </label>
                <input
                  type="number"
                  value={defaultRate}
                  onChange={(e) => setDefaultRate(parseFloat(e.target.value) || 0)}
                  className={`w-28 px-3 py-1.5 rounded-lg border text-sm ${
                    isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-teal-500`}
                />
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.billableHoursCalculator.billingIncrement', 'Billing Increment')}
                </label>
                <select
                  value={billingIncrement}
                  onChange={(e) => setBillingIncrement(parseFloat(e.target.value))}
                  className={`px-3 py-1.5 rounded-lg border text-sm ${
                    isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-teal-500`}
                >
                  {BILLING_INCREMENTS.map((inc) => (
                    <option key={inc.value} value={inc.value}>{inc.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1" />
              <button
                onClick={exportTimesheet}
                disabled={entries.length === 0}
                className="flex items-center gap-2 px-4 py-1.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg text-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                {t('tools.billableHoursCalculator.exportCsv', 'Export CSV')}
              </button>
            </div>

            {/* Add Entry Form */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.billableHoursCalculator.addTimeEntry', 'Add Time Entry')}</h3>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.billableHoursCalculator.date2', 'Date')}
                  </label>
                  <input
                    type="date"
                    value={currentEntry.date}
                    onChange={(e) => setCurrentEntry(prev => ({ ...prev, date: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-teal-500`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.billableHoursCalculator.client', 'Client *')}
                  </label>
                  <input
                    type="text"
                    value={currentEntry.client || ''}
                    onChange={(e) => setCurrentEntry(prev => ({ ...prev, client: e.target.value }))}
                    placeholder={t('tools.billableHoursCalculator.clientName', 'Client name')}
                    list="clients"
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-teal-500`}
                  />
                  <datalist id="clients">
                    {uniqueClients.map(client => (
                      <option key={client} value={client} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.billableHoursCalculator.matter', 'Matter')}
                  </label>
                  <input
                    type="text"
                    value={currentEntry.matter || ''}
                    onChange={(e) => setCurrentEntry(prev => ({ ...prev, matter: e.target.value }))}
                    placeholder={t('tools.billableHoursCalculator.caseMatterName', 'Case/Matter name')}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-teal-500`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.billableHoursCalculator.category', 'Category')}
                  </label>
                  <select
                    value={currentEntry.category}
                    onChange={(e) => setCurrentEntry(prev => ({ ...prev, category: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-teal-500`}
                  >
                    {TASK_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.billableHoursCalculator.startTime', 'Start Time *')}
                  </label>
                  <input
                    type="time"
                    value={currentEntry.startTime || ''}
                    onChange={(e) => setCurrentEntry(prev => ({ ...prev, startTime: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-teal-500`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.billableHoursCalculator.endTime', 'End Time *')}
                  </label>
                  <input
                    type="time"
                    value={currentEntry.endTime || ''}
                    onChange={(e) => setCurrentEntry(prev => ({ ...prev, endTime: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-teal-500`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.billableHoursCalculator.rateHr', 'Rate ($/hr)')}
                  </label>
                  <input
                    type="number"
                    value={currentEntry.rate}
                    onChange={(e) => setCurrentEntry(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-teal-500`}
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={currentEntry.billable}
                      onChange={(e) => setCurrentEntry(prev => ({ ...prev, billable: e.target.checked }))}
                      className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                    />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.billableHoursCalculator.billable', 'Billable')}</span>
                  </label>
                </div>
              </div>

              <div className="mt-4">
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.billableHoursCalculator.description2', 'Description')}
                </label>
                <input
                  type="text"
                  value={currentEntry.description || ''}
                  onChange={(e) => setCurrentEntry(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={t('tools.billableHoursCalculator.briefDescriptionOfWorkPerformed', 'Brief description of work performed...')}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-teal-500`}
                />
              </div>

              <div className="mt-4 flex items-center justify-between">
                {previewHours > 0 && (
                  <div className={`flex items-center gap-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="flex items-center gap-2">
                      <Calculator className="w-4 h-4" />
                      <span className="font-medium">{previewHours.toFixed(2)} hours</span>
                    </span>
                    <span className="text-teal-600 font-medium">
                      = {formatCurrency(previewHours * (currentEntry.rate || 0))}
                    </span>
                  </div>
                )}
                <button
                  onClick={addEntry}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('tools.billableHoursCalculator.addEntry', 'Add Entry')}
                </button>
              </div>
            </div>

            {/* View Tabs */}
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
              {(['entries', 'summary', 'invoice'] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => setActiveView(view)}
                  className={`px-4 py-2 font-medium text-sm capitalize transition-colors ${
                    activeView === view
                      ? 'text-teal-600 border-b-2 border-teal-600'
                      : isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {view === 'entries' ? 'Time Entries' : view === 'summary' ? t('tools.billableHoursCalculator.clientSummary', 'Client Summary') : t('tools.billableHoursCalculator.invoicePreview', 'Invoice Preview')}
                </button>
              ))}
            </div>

            {/* Filters */}
            {activeView === 'entries' && entries.length > 0 && (
              <div className="flex flex-wrap gap-4">
                <div>
                  <input
                    type="text"
                    value={filterClient}
                    onChange={(e) => setFilterClient(e.target.value)}
                    placeholder={t('tools.billableHoursCalculator.filterByClient', 'Filter by client...')}
                    className={`px-3 py-2 rounded-lg border text-sm ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-teal-500`}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                    className={`px-3 py-2 rounded-lg border text-sm ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-teal-500`}
                  />
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>to</span>
                  <input
                    type="date"
                    value={filterDateTo}
                    onChange={(e) => setFilterDateTo(e.target.value)}
                    className={`px-3 py-2 rounded-lg border text-sm ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-teal-500`}
                  />
                </div>
                {(filterClient || filterDateFrom || filterDateTo) && (
                  <button
                    onClick={() => {
                      setFilterClient('');
                      setFilterDateFrom('');
                      setFilterDateTo('');
                    }}
                    className={`text-sm ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {t('tools.billableHoursCalculator.clearFilters', 'Clear filters')}
                  </button>
                )}
              </div>
            )}

            {/* Time Entries View */}
            {activeView === 'entries' && (
              <div className="space-y-3">
                {filteredEntries.length === 0 ? (
                  <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('tools.billableHoursCalculator.noTimeEntriesYetAdd', 'No time entries yet. Add your first entry above.')}</p>
                  </div>
                ) : (
                  filteredEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className={`p-4 rounded-lg border ${
                        entry.billable
                          ? isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                          : isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {entry.client}
                            </span>
                            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              - {entry.matter}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                            }`}>
                              {entry.category}
                            </span>
                            {!entry.billable && (
                              <span className="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                                {t('tools.billableHoursCalculator.nonBillable2', 'Non-billable')}
                              </span>
                            )}
                          </div>
                          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {entry.description || 'No description'}
                          </p>
                          <div className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {new Date(entry.date).toLocaleDateString()} | {entry.startTime} - {entry.endTime}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {entry.hours.toFixed(2)} hrs
                          </div>
                          <div className={`text-sm ${entry.billable ? 'text-teal-600' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {entry.billable ? formatCurrency(entry.hours * entry.rate) : '--'}
                          </div>
                          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            @ ${entry.rate}/hr
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => toggleBillable(entry.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              entry.billable
                                ? 'text-teal-600 hover:bg-teal-100 dark:hover:bg-teal-900/30'
                                : isDark ? 'text-gray-400 hover:bg-gray-600' : 'text-gray-400 hover:bg-gray-100'
                            }`}
                            title={entry.billable ? t('tools.billableHoursCalculator.markNonBillable', 'Mark non-billable') : t('tools.billableHoursCalculator.markBillable', 'Mark billable')}
                          >
                            <DollarSign className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeEntry(entry.id)}
                            className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Client Summary View */}
            {activeView === 'summary' && (
              <div className="space-y-4">
                {clientSummaries.length === 0 ? (
                  <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('tools.billableHoursCalculator.noEntriesToSummarize', 'No entries to summarize.')}</p>
                  </div>
                ) : (
                  clientSummaries.map((summary) => (
                    <div
                      key={summary.client}
                      className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
                    >
                      <div className="flex justify-between items-center">
                        <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {summary.client}
                        </h4>
                        <div className="text-xl font-bold text-teal-600">
                          {formatCurrency(summary.totalAmount)}
                        </div>
                      </div>
                      <div className={`mt-2 grid grid-cols-3 gap-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        <div>
                          <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.billableHoursCalculator.totalHours', 'Total Hours:')}</span>
                          {summary.totalHours.toFixed(2)}
                        </div>
                        <div>
                          <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.billableHoursCalculator.billable2', 'Billable:')}</span>
                          {summary.billableHours.toFixed(2)}
                        </div>
                        <div>
                          <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.billableHoursCalculator.nonBillable', 'Non-Billable:')}</span>
                          {summary.nonBillableHours.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {/* Totals */}
                {clientSummaries.length > 0 && (
                  <div className={`p-4 rounded-lg border-2 ${isDark ? 'bg-teal-900/20 border-teal-700' : 'bg-teal-50 border-teal-200'}`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.billableHoursCalculator.grandTotal', 'Grand Total')}</div>
                        <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {totals.billableHours.toFixed(2)} billable hours | {totals.nonBillableHours.toFixed(2)} non-billable
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-teal-600">
                        {formatCurrency(totals.totalAmount)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Invoice Preview */}
            {activeView === 'invoice' && (
              <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                <div className="text-center mb-6">
                  <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.billableHoursCalculator.invoice', 'INVOICE')}</h2>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                    Date: {new Date().toLocaleDateString()}
                  </p>
                </div>

                {clientSummaries.map((summary) => (
                  <div key={summary.client} className="mb-6">
                    <h3 className={`font-semibold text-lg mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {summary.client}
                    </h3>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className={`border-b ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                          <th className={`text-left py-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.billableHoursCalculator.date', 'Date')}</th>
                          <th className={`text-left py-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.billableHoursCalculator.description', 'Description')}</th>
                          <th className={`text-right py-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.billableHoursCalculator.hours', 'Hours')}</th>
                          <th className={`text-right py-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.billableHoursCalculator.rate', 'Rate')}</th>
                          <th className={`text-right py-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.billableHoursCalculator.amount', 'Amount')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEntries
                          .filter(e => e.client === summary.client && e.billable)
                          .map((entry) => (
                            <tr key={entry.id} className={`border-b ${isDark ? 'border-gray-600' : 'border-gray-100'}`}>
                              <td className={`py-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {new Date(entry.date).toLocaleDateString()}
                              </td>
                              <td className={`py-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {entry.description || entry.category}
                              </td>
                              <td className={`text-right py-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {entry.hours.toFixed(2)}
                              </td>
                              <td className={`text-right py-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                ${entry.rate}
                              </td>
                              <td className={`text-right py-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {formatCurrency(entry.hours * entry.rate)}
                              </td>
                            </tr>
                          ))}
                        <tr className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          <td colSpan={4} className="text-right py-2">{t('tools.billableHoursCalculator.subtotal', 'Subtotal:')}</td>
                          <td className="text-right py-2">{formatCurrency(summary.totalAmount)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ))}

                <div className={`mt-6 pt-4 border-t-2 ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.billableHoursCalculator.totalDue', 'Total Due:')}</span>
                    <span className="text-2xl font-bold text-teal-600">{formatCurrency(totals.totalAmount)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {validationMessage && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg animate-fade-in">
          {validationMessage}
        </div>
      )}
      <ConfirmDialog />
    </div>
  );
}
