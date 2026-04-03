import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock, Key, Copy, Check, AlertCircle } from 'lucide-react';
import Header from '../../components/landing/Header';
import BackgroundEffects from '../../components/ui/BackgroundEffects';

type CipherMethod = 'caesar' | 'reverse' | 'atbash' | 'aes';

interface CipherOption {
  id: CipherMethod;
  name: string;
  description: string;
  color: string;
  icon: string;
}

const Ciphertext: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [selectedCipher, setSelectedCipher] = useState<CipherMethod>('caesar');
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [caesarShift, setCaesarShift] = useState(3);
  const [aesKey, setAesKey] = useState('');
  const [copied, setCopied] = useState(false);

  const cipherOptions: CipherOption[] = [
    {
      id: 'caesar',
      name: 'Caesar Cipher',
      description: 'Classic shift cipher with customizable shift value',
      color: 'from-blue-500 to-indigo-500',
      icon: '🔤',
    },
    {
      id: 'reverse',
      name: 'Reverse Cipher',
      description: 'Simply reverses the text',
      color: 'from-purple-500 to-pink-500',
      icon: '🔄',
    },
    {
      id: 'atbash',
      name: 'Atbash Cipher',
      description: 'Substitution cipher where A↔Z, B↔Y, etc.',
      color: 'from-teal-500 to-cyan-500',
      icon: '🔀',
    },
    {
      id: 'aes',
      name: 'AES Encryption',
      description: 'Advanced Encryption Standard (Placeholder)',
      color: 'from-orange-500 to-red-500',
      icon: '🔐',
    },
  ];

  // Caesar Cipher Implementation
  const caesarCipher = (text: string, shift: number, decrypt: boolean = false): string => {
    const actualShift = decrypt ? -shift : shift;

    return text
      .split('')
      .map(char => {
        if (char.match(/[a-z]/i)) {
          const code = char.charCodeAt(0);
          const isUpperCase = code >= 65 && code <= 90;
          const base = isUpperCase ? 65 : 97;

          const shifted = ((code - base + actualShift + 26) % 26) + base;
          return String.fromCharCode(shifted);
        }
        return char;
      })
      .join('');
  };

  // Reverse Cipher Implementation
  const reverseCipher = (text: string): string => {
    return text.split('').reverse().join('');
  };

  // Atbash Cipher Implementation
  const atbashCipher = (text: string): string => {
    return text
      .split('')
      .map(char => {
        if (char.match(/[a-z]/i)) {
          const code = char.charCodeAt(0);
          const isUpperCase = code >= 65 && code <= 90;
          const base = isUpperCase ? 65 : 97;

          const reversed = base + (25 - (code - base));
          return String.fromCharCode(reversed);
        }
        return char;
      })
      .join('');
  };

  // AES Placeholder (would require crypto library in production)
  const aesPlaceholder = (text: string, key: string, decrypt: boolean = false): string => {
    if (!key) {
      return 'Please provide an encryption key';
    }

    // This is a placeholder - in production, use Web Crypto API or crypto-js
    const simpleHash = (str: string) => {
      return str.split('').reduce((acc, char) => {
        return ((acc << 5) - acc + char.charCodeAt(0)) | 0;
      }, 0);
    };

    const keyHash = Math.abs(simpleHash(key));

    if (decrypt) {
      return `[AES Decrypted with key: ${key}] ${text}`;
    } else {
      return `[AES Encrypted: ${keyHash}] ${text}`;
    }
  };

  const handleProcess = () => {
    let result = '';

    switch (selectedCipher) {
      case 'caesar':
        result = caesarCipher(inputText, caesarShift, mode === 'decrypt');
        break;
      case 'reverse':
        result = reverseCipher(inputText);
        break;
      case 'atbash':
        result = atbashCipher(inputText);
        break;
      case 'aes':
        result = aesPlaceholder(inputText, aesKey, mode === 'decrypt');
        break;
      default:
        result = inputText;
    }

    setOutputText(result);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const swapTexts = () => {
    setInputText(outputText);
    setOutputText(inputText);
    setMode(mode === 'encrypt' ? 'decrypt' : 'encrypt');
  };

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects variant="subtle" />
      <Header />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Ciphertext Encoder
              </h1>
              <p className="text-slate-400 text-sm">Encrypt and decrypt text using various cipher methods</p>
            </div>
          </div>
        </motion.div>

        {/* Mode Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-teal-400/30 p-2 inline-flex gap-2">
            <button
              onClick={() => setMode('encrypt')}
              className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                mode === 'encrypt'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Lock className="w-4 h-4" />
              Encrypt
            </button>
            <button
              onClick={() => setMode('decrypt')}
              className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                mode === 'decrypt'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Unlock className="w-4 h-4" />
              Decrypt
            </button>
          </div>
        </motion.div>

        {/* Cipher Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h2 className="text-lg font-bold text-white mb-4">Select Cipher Method</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cipherOptions.map((cipher, index) => (
              <motion.div
                key={cipher.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                onClick={() => setSelectedCipher(cipher.id)}
                className={`bg-slate-800/50 backdrop-blur-xl rounded-xl border p-4 cursor-pointer transition-all ${
                  selectedCipher === cipher.id
                    ? 'border-teal-500 bg-teal-500/10 shadow-lg shadow-teal-500/20'
                    : 'border-teal-400/30 hover:border-teal-400/50'
                }`}
              >
                <div className="text-4xl mb-3">{cipher.icon}</div>
                <h3 className="font-bold text-white mb-1">{cipher.name}</h3>
                <p className="text-xs text-slate-400">{cipher.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Cipher Settings */}
        {selectedCipher === 'caesar' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-teal-400/30 p-6"
          >
            <label className="block text-sm font-medium text-slate-300 mb-3">Shift Value: {caesarShift}</label>
            <input
              type="range"
              min="1"
              max="25"
              value={caesarShift}
              onChange={(e) => setCaesarShift(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-2">
              <span>1</span>
              <span>13 (ROT13)</span>
              <span>25</span>
            </div>
          </motion.div>
        )}

        {selectedCipher === 'aes' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-teal-400/30 p-6"
          >
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-400">
                This is a placeholder implementation. In production, use Web Crypto API or crypto-js library for real AES encryption.
              </p>
            </div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Encryption Key</label>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="Enter encryption key"
                value={aesKey}
                onChange={(e) => setAesKey(e.target.value)}
                className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-teal-500 focus:outline-none"
              />
              <div className="p-3 bg-teal-500/20 rounded-lg">
                <Key className="w-5 h-5 text-teal-400" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Input/Output Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6"
        >
          {/* Input */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-teal-400/30 p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-teal-400" />
              Input Text
            </h3>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter text to encrypt or decrypt..."
              className="w-full h-64 bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none resize-none font-mono"
            />
          </div>

          {/* Output */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-teal-400/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Unlock className="w-5 h-5 text-cyan-400" />
                Output Text
              </h3>
              {outputText && (
                <button
                  onClick={copyToClipboard}
                  className="p-2 bg-teal-500/20 hover:bg-teal-500/30 rounded-lg transition-all"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-teal-400" />
                  )}
                </button>
              )}
            </div>
            <textarea
              value={outputText}
              readOnly
              placeholder="Encrypted/decrypted text will appear here..."
              className="w-full h-64 bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 resize-none font-mono"
            />
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button
            onClick={handleProcess}
            disabled={!inputText}
            className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-teal-500/50 flex items-center justify-center gap-2"
          >
            {mode === 'encrypt' ? (
              <>
                <Lock className="w-5 h-5" />
                Encrypt Text
              </>
            ) : (
              <>
                <Unlock className="w-5 h-5" />
                Decrypt Text
              </>
            )}
          </button>

          <button
            onClick={swapTexts}
            disabled={!outputText}
            className="sm:w-auto bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <span className="transform rotate-90">⇄</span>
            Swap
          </button>

          <button
            onClick={() => {
              setInputText('');
              setOutputText('');
            }}
            className="sm:w-auto bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold py-4 px-6 rounded-xl transition-all"
          >
            Clear All
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Ciphertext;
