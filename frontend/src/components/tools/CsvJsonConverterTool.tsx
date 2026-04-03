import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Check, AlertCircle, ArrowLeftRight, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type ConversionMode = 'csv-to-json' | 'json-to-csv';

interface CsvJsonConverterToolProps {
  uiConfig?: UIConfig;
}

export const CsvJsonConverterTool: React.FC<CsvJsonConverterToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [mode, setMode] = useState<ConversionMode>('csv-to-json');
  const [input, setInput] = useState('Name,Age,City\nJohn Doe,30,New York\nJane Smith,25,Los Angeles\nBob Johnson,35,Chicago');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      const textContent = params.text || params.content || params.code || '';
      if (textContent) {
        setInput(textContent);
        // Try to detect if it's JSON or CSV
        if (textContent.trim().startsWith('[') || textContent.trim().startsWith('{')) {
          setMode('json-to-csv');
        } else {
          setMode('csv-to-json');
        }
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  useEffect(() => {
    convert();
  }, [input, mode]);

  const convert = () => {
    try {
      setError('');
      if (mode === 'csv-to-json') {
        const json = csvToJson(input);
        setOutput(JSON.stringify(json, null, 2));
      } else {
        const csv = jsonToCsv(input);
        setOutput(csv);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
      setOutput('');
    }
  };

  const csvToJson = (csv: string): any[] => {
    const lines = csv.trim().split('\n');
    if (lines.length === 0) {
      throw new Error('CSV is empty');
    }

    const headers = lines[0].split(',').map((h) => h.trim());
    const result: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      const values = parseCsvLine(line);
      if (values.length !== headers.length) {
        throw new Error(`Line ${i + 1} has ${values.length} values but expected ${headers.length}`);
      }

      const obj: any = {};
      headers.forEach((header, index) => {
        const value = values[index].trim();
        // Try to parse as number
        const numValue = Number(value);
        obj[header] = isNaN(numValue) ? value : numValue;
      });
      result.push(obj);
    }

    return result;
  };

  const jsonToCsv = (json: string): string => {
    const data = JSON.parse(json);

    if (!Array.isArray(data)) {
      throw new Error('JSON must be an array of objects');
    }

    if (data.length === 0) {
      return '';
    }

    // Extract headers from first object
    const headers = Object.keys(data[0]);
    const csvLines: string[] = [];

    // Add header row
    csvLines.push(headers.join(','));

    // Add data rows
    data.forEach((obj) => {
      const values = headers.map((header) => {
        const value = obj[header];
        if (value === null || value === undefined) {
          return '';
        }
        // Wrap in quotes if contains comma or quotes
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      });
      csvLines.push(values.join(','));
    });

    return csvLines.join('\n');
  };

  const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current);
    return result;
  };

  const handleCopy = async () => {
    if (output) {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleMode = () => {
    const newMode = mode === 'csv-to-json' ? 'json-to-csv' : 'csv-to-json';
    setMode(newMode);

    // Swap input and output
    if (output && !error) {
      setInput(output);
    } else if (newMode === 'json-to-csv') {
      setInput('[\n  {"Name": "John Doe", "Age": 30, "City": "New York"},\n  {"Name": "Jane Smith", "Age": 25, "City": "Los Angeles"}\n]');
    } else {
      setInput('Name,Age,City\nJohn Doe,30,New York\nJane Smith,25,Los Angeles');
    }
  };

  return (
    <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        {t('tools.csvJsonConverter.csvJsonConverter', 'CSV ↔ JSON Converter')}
      </h2>

      <div className="space-y-4">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.csvJsonConverter.contentLoadedFromAiResponse', 'Content loaded from AI response')}</span>
          </div>
        )}

        {/* Mode Toggle */}
        <div className="flex items-center justify-center gap-3">
          <div
            className={`px-6 py-2 rounded-lg font-semibold ${
              mode === 'csv-to-json'
                ? 'bg-[#0D9488] text-white'
                : theme === 'dark'
                ? 'bg-gray-700 text-gray-300'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {t('tools.csvJsonConverter.csvJson', 'CSV → JSON')}
          </div>
          <button
            onClick={toggleMode}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'bg-gray-700 text-white hover:bg-gray-600'
                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
            }`}
          >
            <ArrowLeftRight className="w-5 h-5" />
          </button>
          <div
            className={`px-6 py-2 rounded-lg font-semibold ${
              mode === 'json-to-csv'
                ? 'bg-[#0D9488] text-white'
                : theme === 'dark'
                ? 'bg-gray-700 text-gray-300'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {t('tools.csvJsonConverter.jsonCsv', 'JSON → CSV')}
          </div>
        </div>

        {/* Input */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Input {mode === 'csv-to-json' ? t('tools.csvJsonConverter.csv', 'CSV') : t('tools.csvJsonConverter.json', 'JSON')}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'csv-to-json' ? t('tools.csvJsonConverter.nameAgeCityNjohn30', 'Name,Age,City\\nJohn,30,NYC') : t('tools.csvJsonConverter.nNameJohnAge30', '[\\n  {"name": "John", "age": 30}\\n]')}
            className={`w-full h-64 p-3 rounded-lg font-mono text-sm border ${
              theme === 'dark'
                ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400'
                : 'bg-gray-50 text-gray-900 border-gray-300 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800 dark:text-red-300">{error}</div>
          </div>
        )}

        {/* Output */}
        {output && !error && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Output {mode === 'csv-to-json' ? t('tools.csvJsonConverter.json2', 'JSON') : t('tools.csvJsonConverter.csv2', 'CSV')}
              </label>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    {t('tools.csvJsonConverter.copied', 'Copied!')}
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    {t('tools.csvJsonConverter.copy', 'Copy')}
                  </>
                )}
              </button>
            </div>
            <textarea
              value={output}
              readOnly
              className={`w-full h-64 p-3 rounded-lg font-mono text-sm border ${
                theme === 'dark'
                  ? 'bg-gray-700 text-white border-gray-600'
                  : 'bg-gray-50 text-gray-900 border-gray-300'
              } focus:outline-none`}
            />
          </div>
        )}

        {/* Info */}
        <div className={`p-4 rounded-lg border ${
          theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-300'
        }`}>
          <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <p className="font-semibold mb-2">
              {mode === 'csv-to-json' ? t('tools.csvJsonConverter.csvToJson', 'CSV to JSON:') : t('tools.csvJsonConverter.jsonToCsv', 'JSON to CSV:')}
            </p>
            <ul className="list-disc list-inside space-y-1">
              {mode === 'csv-to-json' ? (
                <>
                  <li>{t('tools.csvJsonConverter.firstRowIsTreatedAs', 'First row is treated as headers')}</li>
                  <li>{t('tools.csvJsonConverter.numbersAreAutomaticallyDetected', 'Numbers are automatically detected')}</li>
                  <li>{t('tools.csvJsonConverter.supportsQuotedValuesWithCommas', 'Supports quoted values with commas')}</li>
                  <li>{t('tools.csvJsonConverter.emptyLinesAreSkipped', 'Empty lines are skipped')}</li>
                </>
              ) : (
                <>
                  <li>{t('tools.csvJsonConverter.jsonMustBeAnArray', 'JSON must be an array of objects')}</li>
                  <li>{t('tools.csvJsonConverter.headersAreExtractedFromFirst', 'Headers are extracted from first object')}</li>
                  <li>{t('tools.csvJsonConverter.valuesWithCommasAreAutomatically', 'Values with commas are automatically quoted')}</li>
                  <li>{t('tools.csvJsonConverter.nullUndefinedValuesBecomeEmpty', 'Null/undefined values become empty strings')}</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
