import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Receipt, Users, Plus, Trash2, Calculator, Copy, Check, Sparkles, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import type { ColumnConfig } from '../../lib/toolDataUtils';

// Column configuration for export
const COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'subtotal', header: 'Subtotal', type: 'currency' },
  { key: 'tax', header: 'Tax', type: 'currency' },
  { key: 'tip', header: 'Tip', type: 'currency' },
  { key: 'total', header: 'Total', type: 'currency' },
];

interface BillItem {
  name: string;
  price: number;
}

interface Person {
  id: string;
  name: string;
  items: BillItem[];
}

// Column configuration for people data export
const PEOPLE_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'name', header: 'Person Name', type: 'string' },
  { key: 'itemCount', header: 'Item Count', type: 'number' },
  { key: 'subtotal', header: 'Subtotal', type: 'currency' },
];

interface SplitBillToolProps {
  uiConfig?: UIConfig;
}

const DEFAULT_PEOPLE: Person[] = [
  { id: '1', name: 'Person 1', items: [] },
  { id: '2', name: 'Person 2', items: [] },
];

export const SplitBillTool: React.FC<SplitBillToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Use the useToolData hook for backend persistence of people data
  const {
    data: people,
    setData: setPeople,
    addItem: addPerson,
    updateItem: updatePersonById,
    deleteItem: deletePerson,
    exportCSV: exportPeopleCSV,
    exportExcel: exportPeopleExcel,
    exportJSON: exportPeopleJSON,
    exportPDF: exportPeoplePDF,
    importCSV,
    importJSON,
    copyToClipboard: copyPeopleToClipboard,
    print: printPeople,
    isLoading,
    isSaving,
    isSynced,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<Person>('split-bill', DEFAULT_PEOPLE, PEOPLE_COLUMNS);

  const [mode, setMode] = useState<'equal' | 'itemized'>('equal');
  const [totalBill, setTotalBill] = useState('100');
  const [tipPercent, setTipPercent] = useState(18);
  const [numPeople, setNumPeople] = useState(4);
  const [taxPercent, setTaxPercent] = useState(8);
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      let hasChanges = false;

      // Prefill total amount
      if (params.total || params.amount) {
        setTotalBill(String(params.total || params.amount));
        hasChanges = true;
      }

      // Prefill number of people
      if (params.people) {
        setNumPeople(params.people);
        // Update people array to match
        const newPeople: Person[] = [];
        for (let i = 0; i < params.people; i++) {
          newPeople.push({
            id: String(i + 1),
            name: `Person ${i + 1}`,
            items: []
          });
        }
        setPeople(newPeople);
        hasChanges = true;
      }

      // Prefill tip percentage
      if (params.tipPercentage) {
        setTipPercent(params.tipPercentage);
        hasChanges = true;
      }

      if (hasChanges) {
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const equalSplitCalc = useMemo(() => {
    const bill = parseFloat(totalBill) || 0;
    const tipAmount = bill * (tipPercent / 100);
    const taxAmount = bill * (taxPercent / 100);
    const total = bill + tipAmount + taxAmount;
    const perPerson = total / numPeople;

    return {
      subtotal: bill,
      tip: tipAmount,
      tax: taxAmount,
      total,
      perPerson,
    };
  }, [totalBill, tipPercent, taxPercent, numPeople]);

  const itemizedCalc = useMemo(() => {
    const results = people.map((person) => {
      const subtotal = person.items.reduce((sum, item) => sum + item.price, 0);
      const tax = subtotal * (taxPercent / 100);
      const tip = subtotal * (tipPercent / 100);
      const total = subtotal + tax + tip;
      return { ...person, subtotal, tax, tip, total };
    });

    const grandTotal = results.reduce((sum, r) => sum + r.total, 0);
    return { results, grandTotal };
  }, [people, taxPercent, tipPercent]);

  // Prepare export data based on current mode
  const exportData = useMemo(() => {
    if (mode === 'equal') {
      // For equal split, generate one row per person with equal amounts
      const perPersonData = [];
      for (let i = 1; i <= numPeople; i++) {
        perPersonData.push({
          name: `Person ${i}`,
          subtotal: equalSplitCalc.subtotal / numPeople,
          tax: equalSplitCalc.tax / numPeople,
          tip: equalSplitCalc.tip / numPeople,
          total: equalSplitCalc.perPerson,
        });
      }
      return perPersonData;
    } else {
      // For itemized split, use the calculated results
      return itemizedCalc.results.map((r) => ({
        name: r.name,
        subtotal: r.subtotal,
        tax: r.tax,
        tip: r.tip,
        total: r.total,
      }));
    }
  }, [mode, numPeople, equalSplitCalc, itemizedCalc.results]);

  // Export handlers - these use the computed exportData with totals
  const handleExportCSV = () => {
    // We use a custom approach for export since exportData has computed values
    const blob = new Blob([generateExportContent('csv')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bill-split.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    // Excel export - similar to CSV but with xlsx extension
    const blob = new Blob([generateExportContent('csv')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bill-split.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const data = {
      mode,
      tipPercent,
      taxPercent,
      exportedAt: new Date().toISOString(),
      summary: exportData,
      grandTotal: mode === 'equal' ? equalSplitCalc.total : itemizedCalc.grandTotal,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bill-split.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    // For PDF, we'll use the print functionality as a workaround
    handlePrint();
  };

  const handlePrint = () => {
    const content = generateExportContent('print');
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Bill Split Summary</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f5f5f5; }
              h1 { color: #333; }
              .summary { margin-top: 20px; padding: 10px; background: #f9f9f9; }
            </style>
          </head>
          <body>
            <h1>Bill Split Summary</h1>
            <p>${mode === 'equal' ? `Equal Split (${numPeople} people)` : 'Itemized Split'} - Tip: ${tipPercent}%, Tax: ${taxPercent}%</p>
            ${content}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleCopyToClipboard = async () => {
    const content = exportData.map(row =>
      `${row.name}\t$${row.subtotal.toFixed(2)}\t$${row.tax.toFixed(2)}\t$${row.tip.toFixed(2)}\t$${row.total.toFixed(2)}`
    ).join('\n');
    const header = 'Name\tSubtotal\tTax\tTip\tTotal';
    await navigator.clipboard.writeText(`${header}\n${content}`);
    return true;
  };

  const generateExportContent = (format: 'csv' | 'print') => {
    const header = ['Name', 'Subtotal', 'Tax', 'Tip', 'Total'];
    const rows = exportData.map(row => [
      row.name,
      `$${row.subtotal.toFixed(2)}`,
      `$${row.tax.toFixed(2)}`,
      `$${row.tip.toFixed(2)}`,
      `$${row.total.toFixed(2)}`,
    ]);

    if (format === 'csv') {
      return [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    // Print format - HTML table
    return `
      <table>
        <thead><tr>${header.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>
      <div class="summary">
        <strong>Grand Total: $${(mode === 'equal' ? equalSplitCalc.total : itemizedCalc.grandTotal).toFixed(2)}</strong>
      </div>
    `;
  };

  const handleAddPerson = () => {
    const newPerson: Person = {
      id: Date.now().toString(),
      name: `Person ${people.length + 1}`,
      items: [],
    };
    addPerson(newPerson);
  };

  const handleRemovePerson = (id: string) => {
    if (people.length > 1) {
      deletePerson(id);
    }
  };

  const handleUpdatePersonName = (id: string, name: string) => {
    updatePersonById(id, { name });
  };

  const handleAddItem = (personId: string, itemName: string, price: number) => {
    const person = people.find((p) => p.id === personId);
    if (person) {
      updatePersonById(personId, {
        items: [...person.items, { name: itemName, price }],
      });
    }
  };

  const handleRemoveItem = (personId: string, itemIndex: number) => {
    const person = people.find((p) => p.id === personId);
    if (person) {
      updatePersonById(personId, {
        items: person.items.filter((_, i) => i !== itemIndex),
      });
    }
  };

  const copyResult = () => {
    let text = '';
    if (mode === 'equal') {
      text = `Bill Split (Equal)\nSubtotal: $${equalSplitCalc.subtotal.toFixed(2)}\nTip (${tipPercent}%): $${equalSplitCalc.tip.toFixed(2)}\nTax (${taxPercent}%): $${equalSplitCalc.tax.toFixed(2)}\nTotal: $${equalSplitCalc.total.toFixed(2)}\nPer Person (${numPeople}): $${equalSplitCalc.perPerson.toFixed(2)}`;
    } else {
      text = itemizedCalc.results.map((r) =>
        `${r.name}: $${r.total.toFixed(2)}`
      ).join('\n');
      text += `\nGrand Total: $${itemizedCalc.grandTotal.toFixed(2)}`;
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [selectedPerson, setSelectedPerson] = useState(people[0]?.id || '');

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-green-900/20' : 'bg-gradient-to-r from-white to-green-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg"><Receipt className="w-5 h-5 text-green-500" /></div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.splitBill.billSplitter', 'Bill Splitter')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.splitBill.splitBillsEquallyOrBy', 'Split bills equally or by items')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WidgetEmbedButton toolSlug="split-bill" toolName="Split Bill" />

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
              onExportCSV={handleExportCSV}
              onExportExcel={handleExportExcel}
              onExportJSON={handleExportJSON}
              onExportPDF={handleExportPDF}
              onPrint={handlePrint}
              onCopyToClipboard={handleCopyToClipboard}
              showImport={false}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-xl border border-green-500/20">
            <Sparkles className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-500 font-medium">{t('tools.splitBill.prefilledFromAiResponse', 'Prefilled from AI response')}</span>
          </div>
        )}

        {/* Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setMode('equal')}
            className={`flex-1 py-2 rounded-lg ${mode === 'equal' ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            <Calculator className="w-4 h-4 inline mr-2" /> Equal Split
          </button>
          <button
            onClick={() => setMode('itemized')}
            className={`flex-1 py-2 rounded-lg ${mode === 'itemized' ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            <Users className="w-4 h-4 inline mr-2" /> By Items
          </button>
        </div>

        {/* Tip & Tax */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.splitBill.tip', 'Tip %')}</label>
            <div className="flex gap-2">
              {[15, 18, 20, 25].map((t) => (
                <button
                  key={t}
                  onClick={() => setTipPercent(t)}
                  className={`flex-1 py-2 rounded-lg text-sm ${tipPercent === t ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  {t}%
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.splitBill.tax', 'Tax %')}</label>
            <input
              type="number"
              value={taxPercent}
              onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        {mode === 'equal' ? (
          <>
            {/* Equal Split Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.splitBill.billTotal', 'Bill Total')}</label>
                <div className="relative">
                  <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                  <input
                    type="number"
                    value={totalBill}
                    onChange={(e) => setTotalBill(e.target.value)}
                    className={`w-full pl-8 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.splitBill.numberOfPeople', 'Number of People')}</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setNumPeople(Math.max(1, numPeople - 1))}
                    className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
                  >-</button>
                  <span className={`flex-1 text-center text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{numPeople}</span>
                  <button
                    onClick={() => setNumPeople(numPeople + 1)}
                    className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
                  >+</button>
                </div>
              </div>
            </div>

            {/* Equal Split Results */}
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.splitBill.subtotal', 'Subtotal')}</span>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>${equalSplitCalc.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Tip ({tipPercent}%)</span>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>${equalSplitCalc.tip.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Tax ({taxPercent}%)</span>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>${equalSplitCalc.tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-medium">
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>{t('tools.splitBill.total', 'Total')}</span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>${equalSplitCalc.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Per Person */}
            <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.splitBill.eachPersonPays', 'Each person pays')}</div>
              <div className="text-5xl font-bold text-green-500 my-2">
                ${equalSplitCalc.perPerson.toFixed(2)}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                per person ({numPeople} people)
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Itemized Split */}
            <div className="space-y-4">
              {/* Add Item Form */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="grid grid-cols-4 gap-2">
                  <select
                    value={selectedPerson}
                    onChange={(e) => setSelectedPerson(e.target.value)}
                    className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  >
                    {people.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder={t('tools.splitBill.itemName', 'Item name')}
                    className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                  <input
                    type="number"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    placeholder={t('tools.splitBill.price', 'Price')}
                    className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                  <button
                    onClick={() => {
                      if (newItemName && newItemPrice) {
                        handleAddItem(selectedPerson, newItemName, parseFloat(newItemPrice));
                        setNewItemName('');
                        setNewItemPrice('');
                      }
                    }}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* People & Items */}
              {itemizedCalc.results.map((person) => (
                <div key={person.id} className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <input
                      type="text"
                      value={person.name}
                      onChange={(e) => handleUpdatePersonName(person.id, e.target.value)}
                      className={`font-medium bg-transparent border-b ${isDark ? 'text-white border-gray-600' : 'text-gray-900 border-gray-300'}`}
                    />
                    <button onClick={() => handleRemovePerson(person.id)} className="text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    {person.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{item.name}</span>
                        <div className="flex items-center gap-2">
                          <span>${item.price.toFixed(2)}</span>
                          <button onClick={() => handleRemoveItem(person.id, idx)} className="text-red-400">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className={`mt-2 pt-2 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} flex justify-between font-medium`}>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>{t('tools.splitBill.total2', 'Total')}</span>
                    <span className="text-green-500">${person.total.toFixed(2)}</span>
                  </div>
                </div>
              ))}

              <button
                onClick={handleAddPerson}
                className={`w-full py-2 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 ${isDark ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-500'}`}
              >
                <Plus className="w-4 h-4" /> Add Person
              </button>
            </div>
          </>
        )}

        {/* Copy Button */}
        <button
          onClick={copyResult}
          className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 ${copied ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? t('tools.splitBill.copied', 'Copied!') : t('tools.splitBill.copySummary', 'Copy Summary')}
        </button>
      </div>
    </div>
  );
};

export default SplitBillTool;
