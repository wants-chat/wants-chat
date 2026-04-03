import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, RefreshCw, Plus, Trash2, CheckCircle, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface UuidGeneratorToolProps {
  uiConfig?: UIConfig;
}

interface UuidRecord {
  id: string;
  uuid: string;
  generatedAt: string;
}

const COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'uuid', header: 'UUID', type: 'string' },
  { key: 'generatedAt', header: 'Generated At', type: 'date' },
];

export const UuidGeneratorTool = ({ uiConfig }: UuidGeneratorToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [uuids, setUuids] = useState<string[]>([]);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [count, setCount] = useState<number>(5);
  const [copiedUuid, setCopiedUuid] = useState<string | null>(null);

  // UUID v4 generator using crypto.randomUUID or fallback
  const generateUUID = (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    // Fallback implementation for older browsers
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const handleGenerateSingle = () => {
    const newUuid = generateUUID();
    setUuids([newUuid, ...uuids]);
  };

  const handleGenerateMultiple = () => {
    const validCount = Math.min(Math.max(1, count), 100);
    const newUuids = Array.from({ length: validCount }, () => generateUUID());
    setUuids([...newUuids, ...uuids]);
  };

  const handleCopyUuid = async (uuid: string) => {
    try {
      await navigator.clipboard.writeText(uuid);
      setCopiedUuid(uuid);
      setTimeout(() => setCopiedUuid(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyAll = async () => {
    if (uuids.length === 0) return;
    try {
      await navigator.clipboard.writeText(uuids.join('\n'));
      setCopiedUuid('all');
      setTimeout(() => setCopiedUuid(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleClear = () => {
    setUuids([]);
  };

  const handleRemoveUuid = (index: number) => {
    setUuids(uuids.filter((_, i) => i !== index));
  };

  // Export handlers
  const getUuidRecords = (): UuidRecord[] => {
    return uuids.map((uuid, index) => ({
      id: `${index + 1}`,
      uuid,
      generatedAt: new Date().toISOString(),
    }));
  };

  const handleExportCSV = () => {
    const records = getUuidRecords();
    const csvContent = [
      COLUMNS.map(col => col.label).join(','),
      ...records.map(record =>
        COLUMNS.map(col => record[col.key as keyof UuidRecord] || '').join(',')
      ),
    ].join('\n');

    downloadFile(csvContent, 'uuids.csv', 'text/csv');
  };

  const handleExportJSON = () => {
    const records = getUuidRecords();
    const jsonContent = JSON.stringify(records, null, 2);
    downloadFile(jsonContent, 'uuids.json', 'application/json');
  };

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      // UUID generator can prefill count if specified
      if (params.numbers && params.numbers.length > 0) {
        const prefillCount = Math.min(Math.max(1, params.numbers[0]), 100);
        setCount(prefillCount);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  return (
    <div className={`max-w-4xl mx-auto p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        {t('tools.uuidGenerator.title')}
      </h2>

      <div className="space-y-6">
        {/* Generation Controls */}
        <div className="space-y-4">
          {/* Single UUID */}
          <div className="flex gap-3">
            <button
              onClick={handleGenerateSingle}
              className="flex items-center gap-2 px-6 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              {t('tools.uuidGenerator.generateSingle')}
            </button>
          </div>

          {/* Multiple UUIDs */}
          <div className="flex gap-3 items-center">
            <div className="flex items-center gap-3">
              <label
                className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}
              >
                {t('tools.uuidGenerator.count')}:
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                className={`w-24 px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
              />
            </div>
            <button
              onClick={handleGenerateMultiple}
              className="flex items-center gap-2 px-6 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              {t('tools.uuidGenerator.generateMultiple')}
            </button>
          </div>

          {/* Action Buttons */}
          {uuids.length > 0 && (
            <div className="flex gap-3">
              <button
                onClick={handleCopyAll}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors font-medium ${
                  copiedUuid === 'all'
                    ? 'bg-green-500 text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                {copiedUuid === 'all' ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    {t('tools.uuidGenerator.copiedAll')}
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    {t('tools.uuidGenerator.copyAll')} ({uuids.length})
                  </>
                )}
              </button>
              <ExportDropdown
                onExportCSV={handleExportCSV}
                onExportJSON={handleExportJSON}
                showImport={false}
                theme={theme}
              />
              <button
                onClick={handleClear}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors font-medium ${
                  theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                {t('tools.uuidGenerator.clearAll')}
              </button>
            </div>
          )}
        </div>

        {/* UUID List */}
        {uuids.length > 0 && (
          <div>
            <h3 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.uuidGenerator.generatedUuids')} ({uuids.length})
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {uuids.map((uuid, index) => (
                <div
                  key={`${uuid}-${index}`}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                  }`}
                >
                  <span
                    className={`font-mono text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}
                  >
                    {uuid}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyUuid(uuid)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors text-xs ${
                        copiedUuid === uuid
                          ? 'bg-green-500 text-white'
                          : theme === 'dark'
                          ? 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
                    >
                      {copiedUuid === uuid ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          {t('tools.uuidGenerator.copied')}
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          {t('tools.uuidGenerator.copy')}
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleRemoveUuid(index)}
                      className={`p-1 rounded-lg transition-colors ${
                        theme === 'dark'
                          ? 'hover:bg-gray-600 text-gray-400 hover:text-red-400'
                          : 'hover:bg-gray-200 text-gray-500 hover:text-red-500'
                      }`}
                      title="Remove UUID"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {uuids.length === 0 && (
          <div
            className={`text-center py-12 rounded-lg border-2 border-dashed ${
              theme === 'dark' ? 'border-gray-600 bg-gray-700/30' : 'border-gray-300 bg-gray-50'
            }`}
          >
            <RefreshCw
              className={`w-12 h-12 mx-auto mb-3 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}
            />
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.uuidGenerator.noUuids')}
            </p>
          </div>
        )}

        {/* Info Section */}
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.uuidGenerator.about')}
          </h3>
          <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {t('tools.uuidGenerator.aboutText')}
          </p>
          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            <p className="font-mono">Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx</p>
            <p className="mt-1">Example: {generateUUID()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
