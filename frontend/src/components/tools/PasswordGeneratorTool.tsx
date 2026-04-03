import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, RefreshCw, Shield, AlertCircle, Sparkles } from 'lucide-react';
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

interface PasswordGeneratorToolProps {
  uiConfig?: UIConfig;
}

const COLUMNS: ColumnConfig[] = [
  { key: 'password', header: 'Password' },
  { key: 'strength', header: 'Strength' },
  { key: 'length', header: 'Length' },
  { key: 'generatedAt', header: 'Generated At', type: 'date' },
];

export const PasswordGeneratorTool = ({ uiConfig }: PasswordGeneratorToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [length, setLength] = useState(16);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [password, setPassword] = useState('');
  const [passwords, setPasswords] = useState<string[]>([]);
  const [multipleCount, setMultipleCount] = useState(1);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const getPasswordStrength = (pwd: string): { strength: string; color: string } => {
    if (!pwd) return { strength: '', color: '' };

    let score = 0;

    // Length score
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (pwd.length >= 16) score++;

    // Variety score
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;

    if (score <= 2) return { strength: 'Weak', color: 'text-red-500' };
    if (score <= 4) return { strength: 'Medium', color: 'text-yellow-500' };
    if (score <= 5) return { strength: 'Strong', color: 'text-green-500' };
    return { strength: 'Very Strong', color: 'text-green-600' };
  };

  const generatePassword = (len: number = length): string => {
    setError('');

    if (!includeUppercase && !includeLowercase && !includeNumbers && !includeSymbols) {
      setError('Please select at least one character type');
      return '';
    }

    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let charset = '';
    let requiredChars = '';

    if (includeUppercase) {
      charset += uppercase;
      requiredChars += uppercase[Math.floor(Math.random() * uppercase.length)];
    }
    if (includeLowercase) {
      charset += lowercase;
      requiredChars += lowercase[Math.floor(Math.random() * lowercase.length)];
    }
    if (includeNumbers) {
      charset += numbers;
      requiredChars += numbers[Math.floor(Math.random() * numbers.length)];
    }
    if (includeSymbols) {
      charset += symbols;
      requiredChars += symbols[Math.floor(Math.random() * symbols.length)];
    }

    let generatedPassword = requiredChars;
    const remainingLength = len - requiredChars.length;

    for (let i = 0; i < remainingLength; i++) {
      generatedPassword += charset[Math.floor(Math.random() * charset.length)];
    }

    // Shuffle the password
    generatedPassword = generatedPassword
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');

    return generatedPassword;
  };

  const handleGenerate = () => {
    const pwd = generatePassword();
    if (pwd) {
      setPassword(pwd);
      setPasswords([pwd]);
    }
  };

  const handleGenerateMultiple = () => {
    const count = Math.min(Math.max(1, multipleCount), 20);
    const pwds: string[] = [];

    for (let i = 0; i < count; i++) {
      const pwd = generatePassword();
      if (pwd) {
        pwds.push(pwd);
      }
    }

    if (pwds.length > 0) {
      setPasswords(pwds);
      setPassword(pwds[0]);
    }
  };

  const handleCopy = async (text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyAll = async () => {
    if (passwords.length === 0) return;
    try {
      await navigator.clipboard.writeText(passwords.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleClear = () => {
    setPassword('');
    setPasswords([]);
    setError('');
  };

  const getPasswordsForExport = () => {
    return passwords.map((pwd) => ({
      password: pwd,
      strength: getPasswordStrength(pwd).strength,
      length: pwd.length,
      generatedAt: new Date(),
    }));
  };

  const handleExportCSV = () => {
    const data = getPasswordsForExport();
    exportToCSV(data, COLUMNS, { filename: 'passwords' });
  };

  const handleExportExcel = () => {
    const data = getPasswordsForExport();
    exportToExcel(data, COLUMNS, { filename: 'passwords' });
  };

  const handleExportJSON = () => {
    const data = getPasswordsForExport();
    exportToJSON(data, { filename: 'passwords' });
  };

  const handleExportPDF = async () => {
    const data = getPasswordsForExport();
    await exportToPDF(data, COLUMNS, {
      filename: 'passwords',
      title: 'Generated Passwords',
      subtitle: 'Export of generated passwords with strength indicators',
    });
  };

  const handlePrint = () => {
    const data = getPasswordsForExport();
    printData(data, COLUMNS, { title: 'Generated Passwords' });
  };

  const handleCopyToClipboard = async () => {
    const data = getPasswordsForExport();
    return await copyUtil(data, COLUMNS, 'tab');
  };

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      // Password generator can prefill length if specified
      if (params.numbers && params.numbers.length > 0) {
        const prefillLength = Math.min(Math.max(8, params.numbers[0]), 128);
        setLength(prefillLength);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const strength = getPasswordStrength(password);

  return (
    <div className={`max-w-4xl mx-auto p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.passwordGenerator.passwordGenerator', 'Password Generator')}
        </h2>
        {passwords.length > 0 && (
          <ExportDropdown
            onExportCSV={handleExportCSV}
            onExportExcel={handleExportExcel}
            onExportJSON={handleExportJSON}
            onExportPDF={handleExportPDF}
            onPrint={handlePrint}
            onCopyToClipboard={handleCopyToClipboard}
            showImport={false}
            theme={theme}
          />
        )}
      </div>

      <div className="space-y-6">
        {/* Generated Password Display */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.passwordGenerator.generatedPassword', 'Generated Password')}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={password}
              readOnly
              placeholder={t('tools.passwordGenerator.clickGenerateToCreateA', 'Click \'Generate\' to create a password')}
              className={`flex-1 px-4 py-3 rounded-lg border font-mono text-lg ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none`}
            />
            {password && (
              <button
                onClick={() => handleCopy(password)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                  copied
                    ? 'bg-green-500 text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                <Copy className="w-5 h-5" />
                {copied ? t('tools.passwordGenerator.copied', 'Copied!') : t('tools.passwordGenerator.copy', 'Copy')}
              </button>
            )}
          </div>

          {/* Password Strength Indicator */}
          {password && (
            <div className="mt-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-gray-500" />
              <span className={`text-sm font-medium ${strength.color}`}>
                Strength: {strength.strength}
              </span>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
          </div>
        )}

        {/* Length Slider */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            Password Length: {length}
            {isPrefilled && (
              <span className="ml-2 inline-flex items-center gap-1 text-xs text-[#0D9488]">
                <Sparkles className="w-3 h-3" />
                {t('tools.passwordGenerator.prefilledFromAi', 'Prefilled from AI')}
              </span>
            )}
          </label>
          <input
            type="range"
            min="8"
            max="128"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-[#0D9488]"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>8</span>
            <span>128</span>
          </div>
        </div>

        {/* Character Type Toggles */}
        <div className="space-y-3">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.passwordGenerator.includeCharacters', 'Include Characters')}
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includeUppercase}
                onChange={(e) => setIncludeUppercase(e.target.checked)}
                className="w-5 h-5 rounded accent-[#0D9488] cursor-pointer"
              />
              <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                {t('tools.passwordGenerator.uppercaseAZ', 'Uppercase (A-Z)')}
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includeLowercase}
                onChange={(e) => setIncludeLowercase(e.target.checked)}
                className="w-5 h-5 rounded accent-[#0D9488] cursor-pointer"
              />
              <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                {t('tools.passwordGenerator.lowercaseAZ', 'Lowercase (a-z)')}
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includeNumbers}
                onChange={(e) => setIncludeNumbers(e.target.checked)}
                className="w-5 h-5 rounded accent-[#0D9488] cursor-pointer"
              />
              <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                {t('tools.passwordGenerator.numbers09', 'Numbers (0-9)')}
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includeSymbols}
                onChange={(e) => setIncludeSymbols(e.target.checked)}
                className="w-5 h-5 rounded accent-[#0D9488] cursor-pointer"
              />
              <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                {t('tools.passwordGenerator.symbols', 'Symbols (!@#$...)')}
              </span>
            </label>
          </div>
        </div>

        {/* Multiple Passwords */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.passwordGenerator.generateMultiplePasswords', 'Generate Multiple Passwords')}
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              max="20"
              value={multipleCount}
              onChange={(e) => setMultipleCount(Number(e.target.value))}
              className={`w-24 px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            />
            <button
              onClick={handleGenerateMultiple}
              className="flex items-center gap-2 px-6 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Generate {multipleCount} Password{multipleCount !== 1 ? 's' : ''}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleGenerate}
            className="flex items-center gap-2 px-6 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            {t('tools.passwordGenerator.generatePassword', 'Generate Password')}
          </button>
          <button
            onClick={handleClear}
            className={`px-6 py-2 rounded-lg transition-colors font-medium ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            {t('tools.passwordGenerator.clear', 'Clear')}
          </button>
        </div>

        {/* Multiple Passwords Display */}
        {passwords.length > 1 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                Generated Passwords ({passwords.length})
              </label>
              <button
                onClick={handleCopyAll}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors text-sm ${
                  copied
                    ? 'bg-green-500 text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                <Copy className="w-4 h-4" />
                {copied ? t('tools.passwordGenerator.copiedAll', 'Copied All!') : t('tools.passwordGenerator.copyAll', 'Copy All')}
              </button>
            </div>
            <div className={`p-4 rounded-lg border ${
              theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'
            }`}>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {passwords.map((pwd, index) => (
                  <div key={index} className="flex items-center justify-between group">
                    <code className={`flex-1 font-mono text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                      {pwd}
                    </code>
                    <button
                      onClick={() => handleCopy(pwd)}
                      className={`ml-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                        theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                      }`}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.passwordGenerator.passwordSecurityTips', 'Password Security Tips')}
          </h3>
          <ul className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            <li>{t('tools.passwordGenerator.useAtLeast16Characters', 'Use at least 16 characters for strong passwords')}</li>
            <li>{t('tools.passwordGenerator.includeAMixOfUppercase', 'Include a mix of uppercase, lowercase, numbers, and symbols')}</li>
            <li>{t('tools.passwordGenerator.neverReusePasswordsAcrossDifferent', 'Never reuse passwords across different accounts')}</li>
            <li>{t('tools.passwordGenerator.useAPasswordManagerTo', 'Use a password manager to store your passwords securely')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
