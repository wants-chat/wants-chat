import { useState, useEffect } from 'react';
import { Copy, Lock, Unlock, AlertCircle, Sparkles, Eye, EyeOff, RefreshCw, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface EncryptionToolProps {
  uiConfig?: UIConfig;
}

type EncryptionMethod = 'aes' | 'caesar' | 'base64' | 'xor';

// Simple Caesar cipher implementation
const caesarCipher = (text: string, shift: number, decrypt: boolean = false): string => {
  const actualShift = decrypt ? (26 - (shift % 26)) : (shift % 26);
  return text.split('').map(char => {
    if (char.match(/[a-z]/i)) {
      const base = char.charCodeAt(0) < 97 ? 65 : 97;
      return String.fromCharCode(((char.charCodeAt(0) - base + actualShift) % 26) + base);
    }
    return char;
  }).join('');
};

// XOR encryption
const xorEncrypt = (text: string, key: string): string => {
  if (!key) return text;
  return text.split('').map((char, i) => {
    const keyChar = key.charCodeAt(i % key.length);
    return String.fromCharCode(char.charCodeAt(0) ^ keyChar);
  }).join('');
};

// Convert string to hex for XOR display
const stringToHex = (str: string): string => {
  return str.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
};

const hexToString = (hex: string): string => {
  const result = [];
  for (let i = 0; i < hex.length; i += 2) {
    result.push(String.fromCharCode(parseInt(hex.substr(i, 2), 16)));
  }
  return result.join('');
};

// AES-like simple encryption (for demonstration - not cryptographically secure)
const simpleAES = async (text: string, password: string, decrypt: boolean): Promise<string> => {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    // Create key from password
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('salt123'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    if (decrypt) {
      // Decrypt
      const encryptedData = Uint8Array.from(atob(text), c => c.charCodeAt(0));
      const iv = encryptedData.slice(0, 12);
      const ciphertext = encryptedData.slice(12);

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        ciphertext
      );

      return new TextDecoder().decode(decrypted);
    } else {
      // Encrypt
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        data
      );

      // Combine IV and ciphertext
      const combined = new Uint8Array(iv.length + new Uint8Array(encrypted).length);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);

      return btoa(String.fromCharCode(...combined));
    }
  } catch (error) {
    throw new Error(decrypt ? 'Decryption failed. Check your password.' : 'Encryption failed.');
  }
};

export const EncryptionTool = ({ uiConfig }: EncryptionToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [method, setMethod] = useState<EncryptionMethod>('aes');
  const [caesarShift, setCaesarShift] = useState(3);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      const content = params.text || params.content || '';
      if (content) {
        setInput(content);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(result);
  };

  const handleEncrypt = async () => {
    setError('');
    if (!input.trim()) {
      setError('Please enter text to encrypt');
      return;
    }
    if ((method === 'aes' || method === 'xor') && !password) {
      setError('Please enter a password/key');
      return;
    }

    setIsProcessing(true);
    try {
      let result = '';
      switch (method) {
        case 'aes':
          result = await simpleAES(input, password, false);
          break;
        case 'caesar':
          result = caesarCipher(input, caesarShift, false);
          break;
        case 'base64':
          result = btoa(unescape(encodeURIComponent(input)));
          break;
        case 'xor':
          result = stringToHex(xorEncrypt(input, password));
          break;
      }
      setOutput(result);
    } catch (err: any) {
      setError(err.message || 'Encryption failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecrypt = async () => {
    setError('');
    if (!input.trim()) {
      setError('Please enter text to decrypt');
      return;
    }
    if ((method === 'aes' || method === 'xor') && !password) {
      setError('Please enter a password/key');
      return;
    }

    setIsProcessing(true);
    try {
      let result = '';
      switch (method) {
        case 'aes':
          result = await simpleAES(input, password, true);
          break;
        case 'caesar':
          result = caesarCipher(input, caesarShift, true);
          break;
        case 'base64':
          result = decodeURIComponent(escape(atob(input)));
          break;
        case 'xor':
          result = xorEncrypt(hexToString(input), password);
          break;
      }
      setOutput(result);
    } catch (err: any) {
      setError(err.message || 'Decryption failed. Check your input and password.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  const methodInfo: Record<EncryptionMethod, { name: string; description: string; secure: boolean }> = {
    aes: {
      name: 'AES-256-GCM',
      description: 'Industry-standard encryption used by governments and banks.',
      secure: true,
    },
    caesar: {
      name: 'Caesar Cipher',
      description: 'Classic substitution cipher. Educational use only.',
      secure: false,
    },
    base64: {
      name: 'Base64 Encoding',
      description: 'Not encryption - just encoding. Anyone can decode.',
      secure: false,
    },
    xor: {
      name: 'XOR Cipher',
      description: 'Simple bitwise operation. Weak without perfect key.',
      secure: false,
    },
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-7 h-7 text-teal-500" />
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.encryption.textEncryptionTool', 'Text Encryption Tool')}
        </h2>
      </div>

      <div className="space-y-4">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span className="text-sm text-teal-500 font-medium">{t('tools.encryption.contentLoadedFromAiResponse', 'Content loaded from AI response')}</span>
          </div>
        )}

        {/* Method Selection */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.encryption.encryptionMethod', 'Encryption Method')}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.keys(methodInfo) as EncryptionMethod[]).map((m) => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  method === m
                    ? 'bg-teal-500 text-white border-teal-500'
                    : isDark
                    ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                }`}
              >
                {methodInfo[m].name}
              </button>
            ))}
          </div>
          <div className={`mt-2 flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              methodInfo[method].secure
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
            }`}>
              {methodInfo[method].secure ? t('tools.encryption.secure', 'Secure') : t('tools.encryption.educational', 'Educational')}
            </span>
            {methodInfo[method].description}
          </div>
        </div>

        {/* Password/Key Input */}
        {(method === 'aes' || method === 'xor') && (
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.encryption.passwordKey', 'Password / Key')}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('tools.encryption.enterEncryptionPassword', 'Enter encryption password...')}
                  className={`w-full px-4 py-2 pr-10 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                onClick={generateRandomPassword}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
                title={t('tools.encryption.generateRandomPassword', 'Generate random password')}
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Caesar Shift */}
        {method === 'caesar' && (
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Shift Amount: {caesarShift}
            </label>
            <input
              type="range"
              min="1"
              max="25"
              value={caesarShift}
              onChange={(e) => setCaesarShift(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
            />
          </div>
        )}

        {/* Input Section */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.encryption.inputText', 'Input Text')}
          </label>
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError('');
            }}
            placeholder={t('tools.encryption.enterTextToEncryptOr', 'Enter text to encrypt or decrypt...')}
            className={`w-full h-32 px-4 py-2 rounded-lg border font-mono text-sm ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleEncrypt}
            disabled={isProcessing}
            className="flex items-center gap-2 px-6 py-2 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white rounded-lg transition-colors font-medium"
          >
            <Lock className="w-4 h-4" />
            {isProcessing ? t('tools.encryption.processing', 'Processing...') : t('tools.encryption.encrypt', 'Encrypt')}
          </button>
          <button
            onClick={handleDecrypt}
            disabled={isProcessing}
            className="flex items-center gap-2 px-6 py-2 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white rounded-lg transition-colors font-medium"
          >
            <Unlock className="w-4 h-4" />
            {isProcessing ? t('tools.encryption.processing2', 'Processing...') : t('tools.encryption.decrypt', 'Decrypt')}
          </button>
          <button
            onClick={handleClear}
            className={`px-6 py-2 rounded-lg transition-colors font-medium ${
              isDark
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            {t('tools.encryption.clear', 'Clear')}
          </button>
        </div>

        {/* Output Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.encryption.output', 'Output')}
            </label>
            {output && (
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors text-sm ${
                  copied
                    ? 'bg-green-500 text-white'
                    : isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                <Copy className="w-4 h-4" />
                {copied ? t('tools.encryption.copied', 'Copied!') : t('tools.encryption.copy', 'Copy')}
              </button>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            placeholder={t('tools.encryption.resultWillAppearHere', 'Result will appear here...')}
            className={`w-full h-32 px-4 py-2 rounded-lg border font-mono text-sm ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none`}
          />
        </div>

        {/* Security Notice */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-amber-900/20 border border-amber-700/30' : 'bg-amber-50 border border-amber-200'}`}>
          <h3 className={`text-sm font-semibold mb-2 ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
            {t('tools.encryption.securityNotice', 'Security Notice')}
          </h3>
          <ul className={`text-sm space-y-1 ${isDark ? 'text-amber-200/80' : 'text-amber-700'}`}>
            <li>- This tool processes data locally in your browser</li>
            <li>- Only AES-256-GCM provides real cryptographic security</li>
            <li>- Never share your encryption password with anyone</li>
            <li>- For sensitive data, use dedicated encryption software</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EncryptionTool;
