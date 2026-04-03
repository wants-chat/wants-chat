import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Database, Copy, RefreshCw, Wand2, Settings, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface SqlFormatterToolProps {
  uiConfig?: UIConfig;
}

interface FormatOptions {
  indentSize: number;
  uppercase: boolean;
  lineBreakBeforeAnd: boolean;
  commaPosition: 'before' | 'after';
}

const keywords = {
  main: ['SELECT', 'FROM', 'WHERE', 'ORDER BY', 'GROUP BY', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'UNION ALL', 'INTERSECT', 'EXCEPT'],
  clause: ['AND', 'OR', 'ON', 'USING'],
  join: ['JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN', 'LEFT OUTER JOIN', 'RIGHT OUTER JOIN', 'FULL OUTER JOIN', 'CROSS JOIN', 'NATURAL JOIN'],
  dml: ['INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE'],
  ddl: ['CREATE', 'ALTER', 'DROP', 'TABLE', 'INDEX', 'VIEW', 'DATABASE', 'SCHEMA', 'CONSTRAINT', 'PRIMARY KEY', 'FOREIGN KEY', 'REFERENCES'],
  functions: ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'COALESCE', 'NULLIF', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'CAST', 'CONVERT', 'IFNULL', 'ISNULL'],
  other: ['AS', 'IN', 'NOT', 'NULL', 'IS', 'LIKE', 'BETWEEN', 'EXISTS', 'DISTINCT', 'ALL', 'ANY', 'SOME', 'ASC', 'DESC', 'NULLS', 'FIRST', 'LAST', 'WITH', 'RECURSIVE'],
};

const allKeywords = [...keywords.main, ...keywords.clause, ...keywords.join, ...keywords.dml, ...keywords.ddl, ...keywords.functions, ...keywords.other];

export const SqlFormatterTool: React.FC<SqlFormatterToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [sql, setSql] = useState('');
  const [formatted, setFormatted] = useState('');
  const [copied, setCopied] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState<FormatOptions>({
    indentSize: 2,
    uppercase: true,
    lineBreakBeforeAnd: true,
    commaPosition: 'after',
  });
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      const codeContent = params.code || params.content || params.text || '';
      if (codeContent) {
        setSql(codeContent);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const formatSql = () => {
    if (!sql.trim()) {
      setFormatted('');
      return;
    }

    try {
      let result = sql.trim();
      const indent = ' '.repeat(options.indentSize);

      // Normalize whitespace
      result = result.replace(/\s+/g, ' ');

      // Uppercase keywords if option enabled
      if (options.uppercase) {
        allKeywords.forEach(kw => {
          const regex = new RegExp(`\\b${kw.replace(/\s+/g, '\\s+')}\\b`, 'gi');
          result = result.replace(regex, kw.toUpperCase());
        });
      }

      // Add newlines before main keywords
      keywords.main.forEach(kw => {
        const kwPattern = options.uppercase ? kw.toUpperCase() : kw;
        result = result.replace(new RegExp(`\\s+${kwPattern}\\b`, 'g'), `\n${kwPattern}`);
        result = result.replace(new RegExp(`^${kwPattern}\\b`), kwPattern);
      });

      // Handle JOIN clauses
      keywords.join.forEach(kw => {
        const kwPattern = options.uppercase ? kw.toUpperCase() : kw;
        result = result.replace(new RegExp(`\\s+${kwPattern.replace(/\s+/g, '\\s+')}\\b`, 'gi'), `\n${kwPattern}`);
      });

      // Handle AND/OR
      if (options.lineBreakBeforeAnd) {
        keywords.clause.forEach(kw => {
          const kwPattern = options.uppercase ? kw.toUpperCase() : kw;
          result = result.replace(new RegExp(`\\s+${kwPattern}\\b`, 'gi'), `\n${indent}${kwPattern}`);
        });
      }

      // Format SELECT columns
      const selectMatch = result.match(/SELECT\s+(.*?)\s+FROM/is);
      if (selectMatch) {
        const columns = selectMatch[1];
        if (columns.includes(',')) {
          const formattedColumns = columns
            .split(',')
            .map(col => col.trim())
            .join(options.commaPosition === 'before' ? `\n${indent}, ` : `,\n${indent}`);
          result = result.replace(selectMatch[1], `\n${indent}${formattedColumns}\n`);
        }
      }

      // Indent after main keywords
      const lines = result.split('\n');
      const formattedLines: string[] = [];
      let currentIndent = 0;

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Decrease indent for closing parens
        if (trimmed.startsWith(')')) {
          currentIndent = Math.max(0, currentIndent - 1);
        }

        // Check if line starts with subclause
        const isSubclause = keywords.clause.some(kw =>
          trimmed.toUpperCase().startsWith(kw.toUpperCase())
        );
        const isJoin = keywords.join.some(kw =>
          trimmed.toUpperCase().startsWith(kw.toUpperCase())
        );

        let lineIndent = '';
        if (isSubclause) {
          lineIndent = indent.repeat(currentIndent + 1);
        } else if (isJoin) {
          lineIndent = indent.repeat(currentIndent);
        } else if (!keywords.main.some(kw => trimmed.toUpperCase().startsWith(kw.toUpperCase()))) {
          lineIndent = indent.repeat(currentIndent);
        }

        formattedLines.push(lineIndent + trimmed);

        // Increase indent after opening parens
        if (trimmed.includes('(') && !trimmed.includes(')')) {
          currentIndent++;
        }
      }

      setFormatted(formattedLines.join('\n'));
    } catch (error: any) {
      setFormatted(`Error: ${error.message}`);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setSql('');
    setFormatted('');
  };

  const sampleQueries = [
    {
      label: 'Simple SELECT',
      query: 'select id, name, email, created_at from users where status = "active" and age > 18 order by created_at desc limit 10',
    },
    {
      label: 'JOIN Query',
      query: 'select u.id, u.name, o.order_id, o.total from users u left join orders o on u.id = o.user_id where o.status = "completed" and o.total > 100',
    },
    {
      label: 'Subquery',
      query: 'select * from products where category_id in (select id from categories where active = 1) and price < (select avg(price) from products)',
    },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-cyan-900/20' : 'bg-gradient-to-r from-white to-cyan-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg">
            <Database className="w-5 h-5 text-cyan-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.sqlFormatter.sqlFormatter', 'SQL Formatter')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.sqlFormatter.formatAndBeautifySqlQueries', 'Format and beautify SQL queries')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.sqlFormatter.codeLoadedFromAiResponse', 'Code loaded from AI response')}</span>
          </div>
        )}

        {/* Sample Queries */}
        <div className="space-y-2">
          <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.sqlFormatter.tryASampleQuery', 'Try a sample query:')}
          </p>
          <div className="flex flex-wrap gap-2">
            {sampleQueries.map((sample) => (
              <button
                key={sample.label}
                onClick={() => setSql(sample.query)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {/* Options Toggle */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              isDark
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <Settings className="w-4 h-4" />
            Options
          </button>
        </div>

        {/* Format Options */}
        {showOptions && (
          <div className={`p-4 rounded-lg grid grid-cols-2 md:grid-cols-4 gap-4 ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.sqlFormatter.indentSize', 'Indent Size')}
              </label>
              <select
                value={options.indentSize}
                onChange={(e) => setOptions({ ...options, indentSize: Number(e.target.value) })}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value={2}>2 spaces</option>
                <option value={4}>4 spaces</option>
              </select>
            </div>

            <label className={`flex items-center gap-2 cursor-pointer ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <input
                type="checkbox"
                checked={options.uppercase}
                onChange={(e) => setOptions({ ...options, uppercase: e.target.checked })}
                className="w-4 h-4 rounded text-cyan-500"
              />
              <span className="text-sm">{t('tools.sqlFormatter.uppercaseKeywords', 'Uppercase Keywords')}</span>
            </label>

            <label className={`flex items-center gap-2 cursor-pointer ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <input
                type="checkbox"
                checked={options.lineBreakBeforeAnd}
                onChange={(e) => setOptions({ ...options, lineBreakBeforeAnd: e.target.checked })}
                className="w-4 h-4 rounded text-cyan-500"
              />
              <span className="text-sm">{t('tools.sqlFormatter.lineBreakBeforeAndOr', 'Line Break Before AND/OR')}</span>
            </label>

            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.sqlFormatter.commaPosition', 'Comma Position')}
              </label>
              <select
                value={options.commaPosition}
                onChange={(e) => setOptions({ ...options, commaPosition: e.target.value as 'before' | 'after' })}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="after">{t('tools.sqlFormatter.afterColumn', 'After column')}</option>
                <option value="before">{t('tools.sqlFormatter.beforeColumn', 'Before column')}</option>
              </select>
            </div>
          </div>
        )}

        {/* SQL Input */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.sqlFormatter.inputSql', 'Input SQL')}
          </label>
          <textarea
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            placeholder={t('tools.sqlFormatter.pasteYourSqlQueryHere', 'Paste your SQL query here...')}
            rows={8}
            className={`w-full px-4 py-3 rounded-lg border font-mono text-sm resize-none ${
              isDark
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={formatSql}
            className="flex-1 py-3 px-6 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            <Wand2 className="w-5 h-5" />
            {t('tools.sqlFormatter.formatSql', 'Format SQL')}
          </button>
          <button
            onClick={handleReset}
            className={`px-6 py-3 rounded-xl font-medium transition-colors ${
              isDark
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
            }`}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Formatted Output */}
        {formatted && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.sqlFormatter.formattedSql', 'Formatted SQL')}
              </label>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  copied
                    ? 'bg-green-500 text-white'
                    : isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <Copy className="w-4 h-4" />
                {copied ? t('tools.sqlFormatter.copied', 'Copied!') : t('tools.sqlFormatter.copy', 'Copy')}
              </button>
            </div>
            <pre className={`p-4 rounded-lg overflow-x-auto font-mono text-sm ${
              isDark ? 'bg-gray-800 text-cyan-300' : 'bg-gray-50 text-cyan-700'
            }`}>
              {formatted}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default SqlFormatterTool;
