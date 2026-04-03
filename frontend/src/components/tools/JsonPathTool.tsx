import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FileJson, Copy, Search, Check, ChevronRight, ChevronDown, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface JsonNode {
  key: string;
  value: any;
  path: string;
  type: string;
  expanded?: boolean;
}

interface JsonPathToolProps {
  uiConfig?: UIConfig;
}

export const JsonPathTool: React.FC<JsonPathToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [jsonInput, setJsonInput] = useState('');
  const [jsonPath, setJsonPath] = useState('');
  const [parsedJson, setParsedJson] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['$']));
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.code || params.text || params.content) {
        setJsonInput(params.code || params.text || params.content || '');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const sampleJson = `{
  "store": {
    "name": "Book Store",
    "books": [
      {
        "title": "The Great Gatsby",
        "author": "F. Scott Fitzgerald",
        "price": 12.99
      },
      {
        "title": "1984",
        "author": "George Orwell",
        "price": 9.99
      }
    ],
    "location": {
      "city": "New York",
      "country": "USA"
    }
  }
}`;

  const parseJson = () => {
    if (!jsonInput.trim()) {
      setError('Please enter JSON data');
      setParsedJson(null);
      return;
    }

    try {
      const parsed = JSON.parse(jsonInput);
      setParsedJson(parsed);
      setError(null);
      setExpandedPaths(new Set(['$']));
    } catch (e: any) {
      setError(`Invalid JSON: ${e.message}`);
      setParsedJson(null);
    }
  };

  const evaluatePath = () => {
    if (!parsedJson) {
      setResult(null);
      return;
    }

    if (!jsonPath.trim() || jsonPath === '$') {
      setResult(parsedJson);
      return;
    }

    try {
      const path = jsonPath.startsWith('$') ? jsonPath.slice(1) : jsonPath;
      let current: any = parsedJson;

      // Parse path segments
      const segments = path.match(/\.?([^.\[\]]+)|\[(\d+|'[^']*'|"[^"]*")\]/g);

      if (!segments) {
        setResult(parsedJson);
        return;
      }

      for (const segment of segments) {
        if (current === undefined || current === null) break;

        if (segment.startsWith('[')) {
          // Array index or quoted key
          const inner = segment.slice(1, -1);
          if (inner.startsWith("'") || inner.startsWith('"')) {
            // Quoted key
            const key = inner.slice(1, -1);
            current = current[key];
          } else {
            // Numeric index
            const index = parseInt(inner, 10);
            current = current[index];
          }
        } else {
          // Dot notation
          const key = segment.startsWith('.') ? segment.slice(1) : segment;
          current = current[key];
        }
      }

      setResult(current);
    } catch (e: any) {
      setResult(undefined);
    }
  };

  useMemo(() => {
    evaluatePath();
  }, [jsonPath, parsedJson]);

  const toggleExpand = (path: string) => {
    const newExpanded = new Set(expandedPaths);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedPaths(newExpanded);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handlePathClick = (path: string) => {
    setJsonPath(path);
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'string': return 'text-green-500';
      case 'number': return 'text-blue-500';
      case 'boolean': return 'text-purple-500';
      case 'null': return 'text-gray-500';
      case 'array': return 'text-orange-500';
      case 'object': return 'text-yellow-500';
      default: return isDark ? 'text-gray-300' : 'text-gray-700';
    }
  };

  const getType = (value: any): string => {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  };

  const renderValue = (value: any, path: string, key: string, depth: number = 0): React.ReactNode => {
    const type = getType(value);
    const isExpandable = type === 'object' || type === 'array';
    const isExpanded = expandedPaths.has(path);
    const indent = depth * 16;

    return (
      <div key={path} style={{ marginLeft: indent }}>
        <div
          className={`flex items-center py-1 px-2 rounded cursor-pointer hover:${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
          onClick={() => isExpandable ? toggleExpand(path) : handlePathClick(path)}
        >
          {isExpandable ? (
            <button onClick={(e) => { e.stopPropagation(); toggleExpand(path); }} className="mr-1">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>
          ) : (
            <span className="w-5" />
          )}

          <span className={`font-mono text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {key !== '' && (
              <>
                <span className="text-pink-500">"{key}"</span>
                <span className="text-gray-500">: </span>
              </>
            )}
            {isExpandable ? (
              <span className={getTypeColor(type)}>
                {type === 'array' ? `Array(${value.length})` : `Object(${Object.keys(value).length})`}
              </span>
            ) : (
              <span className={getTypeColor(type)}>
                {type === 'string' ? `"${value}"` : String(value)}
              </span>
            )}
          </span>

          <button
            onClick={(e) => { e.stopPropagation(); handlePathClick(path); }}
            className={`ml-auto opacity-0 group-hover:opacity-100 px-2 py-0.5 text-xs rounded transition-opacity ${
              isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
            }`}
          >
            {path}
          </button>
        </div>

        {isExpandable && isExpanded && (
          <div>
            {type === 'array' ? (
              value.map((item: any, index: number) =>
                renderValue(item, `${path}[${index}]`, String(index), depth + 1)
              )
            ) : (
              Object.entries(value).map(([k, v]) =>
                renderValue(v, `${path}.${k}`, k, depth + 1)
              )
            )}
          </div>
        )}
      </div>
    );
  };

  const commonPaths = [
    { path: '$', label: 'Root' },
    { path: '$.store', label: 'Store' },
    { path: '$.store.books', label: 'Books array' },
    { path: '$.store.books[0]', label: 'First book' },
    { path: '$.store.books[0].title', label: 'First book title' },
    { path: '$.store.location.city', label: 'City' },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <FileJson className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.jsonPath.jsonPathExplorer', 'JSON Path Explorer')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.jsonPath.navigateAndQueryJsonData', 'Navigate and query JSON data with JSONPath')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.jsonPath.contentLoadedFromYourConversation', 'Content loaded from your conversation')}</span>
          </div>
        )}
        {/* JSON Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.jsonPath.jsonData', 'JSON Data')}
            </label>
            <button
              onClick={() => { setJsonInput(sampleJson); }}
              className={`text-sm px-3 py-1 rounded-lg transition-colors ${
                isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {t('tools.jsonPath.loadSample', 'Load Sample')}
            </button>
          </div>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder={t('tools.jsonPath.pasteYourJsonHere', 'Paste your JSON here...')}
            rows={8}
            className={`w-full px-4 py-3 rounded-lg border font-mono text-sm resize-none ${
              isDark
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
          />
          <button
            onClick={parseJson}
            className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            {t('tools.jsonPath.parseJson', 'Parse JSON')}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {parsedJson && (
          <>
            {/* JSONPath Input */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.jsonPath.jsonpathQuery', 'JSONPath Query')}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={jsonPath}
                  onChange={(e) => setJsonPath(e.target.value)}
                  placeholder={t('tools.jsonPath.orStoreBooks0Title', '$. or $.store.books[0].title')}
                  className={`flex-1 px-4 py-2.5 rounded-lg border font-mono ${
                    isDark
                      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {commonPaths.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => setJsonPath(item.path)}
                    className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                      jsonPath === item.path
                        ? 'bg-teal-500 text-white'
                        : isDark
                        ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tree View */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.jsonPath.jsonTreeClickToSelect', 'JSON Tree (Click to select path)')}
                </label>
                <div className={`p-4 rounded-lg border max-h-80 overflow-auto ${
                  isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
                }`}>
                  {renderValue(parsedJson, '$', '', 0)}
                </div>
              </div>

              {/* Result */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.jsonPath.queryResult', 'Query Result')}
                  </label>
                  {result !== undefined && (
                    <button
                      onClick={() => handleCopy(JSON.stringify(result, null, 2), 'result')}
                      className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                        copied === 'result'
                          ? 'bg-green-500 text-white'
                          : isDark
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {copied === 'result' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copied === 'result' ? t('tools.jsonPath.copied', 'Copied!') : t('tools.jsonPath.copy', 'Copy')}
                    </button>
                  )}
                </div>
                <pre className={`p-4 rounded-lg border max-h-80 overflow-auto font-mono text-sm ${
                  isDark ? 'bg-gray-800/50 border-gray-700 text-teal-300' : 'bg-gray-50 border-gray-200 text-teal-700'
                }`}>
                  {result === undefined ? (
                    <span className="text-gray-500">{t('tools.jsonPath.noMatchFound', 'No match found')}</span>
                  ) : (
                    JSON.stringify(result, null, 2)
                  )}
                </pre>
              </div>
            </div>

            {/* Path Syntax Help */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.jsonPath.pathSyntax', 'Path Syntax')}</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <code className="text-teal-500">$</code>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.jsonPath.rootElement', 'Root element')}</p>
                </div>
                <div>
                  <code className="text-teal-500">.key</code>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.jsonPath.childProperty', 'Child property')}</p>
                </div>
                <div>
                  <code className="text-teal-500">[0]</code>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.jsonPath.arrayIndex', 'Array index')}</p>
                </div>
                <div>
                  <code className="text-teal-500">['key']</code>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('tools.jsonPath.bracketNotation', 'Bracket notation')}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default JsonPathTool;
