import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Hash, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface HashGeneratorToolProps {
  uiConfig?: UIConfig;
}

interface HashResults {
  md5: string;
  sha1: string;
  sha256: string;
  sha512: string;
}

export const HashGeneratorTool = ({
  uiConfig }: HashGeneratorToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState<HashResults | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      const codeContent = params.code || params.content || params.text || '';
      if (codeContent) {
        setInput(codeContent);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Simple MD5 implementation
  const md5 = (str: string): string => {
    const rotateLeft = (n: number, s: number) => (n << s) | (n >>> (32 - s));
    const addUnsigned = (x: number, y: number) => {
      const lsw = (x & 0xffff) + (y & 0xffff);
      const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
      return (msw << 16) | (lsw & 0xffff);
    };

    const utf8Encode = (str: string) => {
      return unescape(encodeURIComponent(str));
    };

    const convertToWordArray = (str: string) => {
      const wordArray: number[] = [];
      const strLen = str.length;
      for (let i = 0; i < strLen - 3; i += 4) {
        wordArray.push(
          str.charCodeAt(i) |
            (str.charCodeAt(i + 1) << 8) |
            (str.charCodeAt(i + 2) << 16) |
            (str.charCodeAt(i + 3) << 24)
        );
      }
      return wordArray;
    };

    const F = (x: number, y: number, z: number) => (x & y) | (~x & z);
    const G = (x: number, y: number, z: number) => (x & z) | (y & ~z);
    const H = (x: number, y: number, z: number) => x ^ y ^ z;
    const I = (x: number, y: number, z: number) => y ^ (x | ~z);

    const FF = (a: number, b: number, c: number, d: number, x: number, s: number, ac: number) => {
      a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
      return addUnsigned(rotateLeft(a, s), b);
    };

    const GG = (a: number, b: number, c: number, d: number, x: number, s: number, ac: number) => {
      a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
      return addUnsigned(rotateLeft(a, s), b);
    };

    const HH = (a: number, b: number, c: number, d: number, x: number, s: number, ac: number) => {
      a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
      return addUnsigned(rotateLeft(a, s), b);
    };

    const II = (a: number, b: number, c: number, d: number, x: number, s: number, ac: number) => {
      a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
      return addUnsigned(rotateLeft(a, s), b);
    };

    const wordToHex = (n: number) => {
      let hex = '';
      for (let i = 0; i <= 3; i++) {
        hex += ((n >>> (i * 8 + 4)) & 0x0f).toString(16) + ((n >>> (i * 8)) & 0x0f).toString(16);
      }
      return hex;
    };

    const encoded = utf8Encode(str);
    const msgLen = encoded.length;
    const wordArray: number[] = [];

    for (let i = 0; i < msgLen; i++) {
      wordArray[i >>> 2] |= (encoded.charCodeAt(i) & 0xff) << ((i % 4) * 8);
    }

    wordArray[msgLen >>> 2] |= 0x80 << ((msgLen % 4) * 8);
    wordArray[(((msgLen + 8) >>> 6) << 4) + 14] = msgLen * 8;

    let a = 0x67452301;
    let b = 0xefcdab89;
    let c = 0x98badcfe;
    let d = 0x10325476;

    for (let i = 0; i < wordArray.length; i += 16) {
      const aa = a;
      const bb = b;
      const cc = c;
      const dd = d;

      a = FF(a, b, c, d, wordArray[i + 0], 7, 0xd76aa478);
      d = FF(d, a, b, c, wordArray[i + 1], 12, 0xe8c7b756);
      c = FF(c, d, a, b, wordArray[i + 2], 17, 0x242070db);
      b = FF(b, c, d, a, wordArray[i + 3], 22, 0xc1bdceee);
      a = FF(a, b, c, d, wordArray[i + 4], 7, 0xf57c0faf);
      d = FF(d, a, b, c, wordArray[i + 5], 12, 0x4787c62a);
      c = FF(c, d, a, b, wordArray[i + 6], 17, 0xa8304613);
      b = FF(b, c, d, a, wordArray[i + 7], 22, 0xfd469501);
      a = FF(a, b, c, d, wordArray[i + 8], 7, 0x698098d8);
      d = FF(d, a, b, c, wordArray[i + 9], 12, 0x8b44f7af);
      c = FF(c, d, a, b, wordArray[i + 10], 17, 0xffff5bb1);
      b = FF(b, c, d, a, wordArray[i + 11], 22, 0x895cd7be);
      a = FF(a, b, c, d, wordArray[i + 12], 7, 0x6b901122);
      d = FF(d, a, b, c, wordArray[i + 13], 12, 0xfd987193);
      c = FF(c, d, a, b, wordArray[i + 14], 17, 0xa679438e);
      b = FF(b, c, d, a, wordArray[i + 15], 22, 0x49b40821);
      a = GG(a, b, c, d, wordArray[i + 1], 5, 0xf61e2562);
      d = GG(d, a, b, c, wordArray[i + 6], 9, 0xc040b340);
      c = GG(c, d, a, b, wordArray[i + 11], 14, 0x265e5a51);
      b = GG(b, c, d, a, wordArray[i + 0], 20, 0xe9b6c7aa);
      a = GG(a, b, c, d, wordArray[i + 5], 5, 0xd62f105d);
      d = GG(d, a, b, c, wordArray[i + 10], 9, 0x02441453);
      c = GG(c, d, a, b, wordArray[i + 15], 14, 0xd8a1e681);
      b = GG(b, c, d, a, wordArray[i + 4], 20, 0xe7d3fbc8);
      a = GG(a, b, c, d, wordArray[i + 9], 5, 0x21e1cde6);
      d = GG(d, a, b, c, wordArray[i + 14], 9, 0xc33707d6);
      c = GG(c, d, a, b, wordArray[i + 3], 14, 0xf4d50d87);
      b = GG(b, c, d, a, wordArray[i + 8], 20, 0x455a14ed);
      a = GG(a, b, c, d, wordArray[i + 13], 5, 0xa9e3e905);
      d = GG(d, a, b, c, wordArray[i + 2], 9, 0xfcefa3f8);
      c = GG(c, d, a, b, wordArray[i + 7], 14, 0x676f02d9);
      b = GG(b, c, d, a, wordArray[i + 12], 20, 0x8d2a4c8a);
      a = HH(a, b, c, d, wordArray[i + 5], 4, 0xfffa3942);
      d = HH(d, a, b, c, wordArray[i + 8], 11, 0x8771f681);
      c = HH(c, d, a, b, wordArray[i + 11], 16, 0x6d9d6122);
      b = HH(b, c, d, a, wordArray[i + 14], 23, 0xfde5380c);
      a = HH(a, b, c, d, wordArray[i + 1], 4, 0xa4beea44);
      d = HH(d, a, b, c, wordArray[i + 4], 11, 0x4bdecfa9);
      c = HH(c, d, a, b, wordArray[i + 7], 16, 0xf6bb4b60);
      b = HH(b, c, d, a, wordArray[i + 10], 23, 0xbebfbc70);
      a = HH(a, b, c, d, wordArray[i + 13], 4, 0x289b7ec6);
      d = HH(d, a, b, c, wordArray[i + 0], 11, 0xeaa127fa);
      c = HH(c, d, a, b, wordArray[i + 3], 16, 0xd4ef3085);
      b = HH(b, c, d, a, wordArray[i + 6], 23, 0x04881d05);
      a = HH(a, b, c, d, wordArray[i + 9], 4, 0xd9d4d039);
      d = HH(d, a, b, c, wordArray[i + 12], 11, 0xe6db99e5);
      c = HH(c, d, a, b, wordArray[i + 15], 16, 0x1fa27cf8);
      b = HH(b, c, d, a, wordArray[i + 2], 23, 0xc4ac5665);
      a = II(a, b, c, d, wordArray[i + 0], 6, 0xf4292244);
      d = II(d, a, b, c, wordArray[i + 7], 10, 0x432aff97);
      c = II(c, d, a, b, wordArray[i + 14], 15, 0xab9423a7);
      b = II(b, c, d, a, wordArray[i + 5], 21, 0xfc93a039);
      a = II(a, b, c, d, wordArray[i + 12], 6, 0x655b59c3);
      d = II(d, a, b, c, wordArray[i + 3], 10, 0x8f0ccc92);
      c = II(c, d, a, b, wordArray[i + 10], 15, 0xffeff47d);
      b = II(b, c, d, a, wordArray[i + 1], 21, 0x85845dd1);
      a = II(a, b, c, d, wordArray[i + 8], 6, 0x6fa87e4f);
      d = II(d, a, b, c, wordArray[i + 15], 10, 0xfe2ce6e0);
      c = II(c, d, a, b, wordArray[i + 6], 15, 0xa3014314);
      b = II(b, c, d, a, wordArray[i + 13], 21, 0x4e0811a1);
      a = II(a, b, c, d, wordArray[i + 4], 6, 0xf7537e82);
      d = II(d, a, b, c, wordArray[i + 11], 10, 0xbd3af235);
      c = II(c, d, a, b, wordArray[i + 2], 15, 0x2ad7d2bb);
      b = II(b, c, d, a, wordArray[i + 9], 21, 0xeb86d391);

      a = addUnsigned(a, aa);
      b = addUnsigned(b, bb);
      c = addUnsigned(c, cc);
      d = addUnsigned(d, dd);
    }

    return wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
  };

  const arrayBufferToHex = (buffer: ArrayBuffer): string => {
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const handleGenerate = async () => {
    setError('');
    if (!input.trim()) {
      setError('Please enter text to hash');
      return;
    }

    setLoading(true);
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(input);

      const [sha1Buffer, sha256Buffer, sha512Buffer] = await Promise.all([
        crypto.subtle.digest('SHA-1', data),
        crypto.subtle.digest('SHA-256', data),
        crypto.subtle.digest('SHA-512', data),
      ]);

      const md5Hash = md5(input);

      setHashes({
        md5: md5Hash,
        sha1: arrayBufferToHex(sha1Buffer),
        sha256: arrayBufferToHex(sha256Buffer),
        sha512: arrayBufferToHex(sha512Buffer),
      });
    } catch (err) {
      setError('Failed to generate hashes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (hash: string, hashType: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedHash(hashType);
      setTimeout(() => setCopiedHash(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyAll = async () => {
    if (!hashes) return;
    try {
      const allHashes = `MD5: ${hashes.md5}\nSHA-1: ${hashes.sha1}\nSHA-256: ${hashes.sha256}\nSHA-512: ${hashes.sha512}`;
      await navigator.clipboard.writeText(allHashes);
      setCopiedHash('all');
      setTimeout(() => setCopiedHash(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleClear = () => {
    setInput('');
    setHashes(null);
    setError('');
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        {t('tools.hashGenerator.hashGenerator', 'Hash Generator')}
      </h2>

      <div className="space-y-4">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.hashGenerator.codeLoadedFromAiResponse', 'Code loaded from AI response')}</span>
          </div>
        )}

        {/* Input Section */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.hashGenerator.inputText', 'Input Text')}
          </label>
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError('');
            }}
            placeholder={t('tools.hashGenerator.enterTextToGenerateHashes', 'Enter text to generate hashes...')}
            className={`w-full h-32 px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
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
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Hash className="w-4 h-4" />
            {loading ? t('tools.hashGenerator.generating', 'Generating...') : t('tools.hashGenerator.generateHashes', 'Generate Hashes')}
          </button>
          {hashes && (
            <button
              onClick={handleCopyAll}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors font-medium ${
                copiedHash === 'all'
                  ? 'bg-green-500 text-white'
                  : theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              {copiedHash === 'all' ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  {t('tools.hashGenerator.copiedAll', 'Copied All!')}
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  {t('tools.hashGenerator.copyAll', 'Copy All')}
                </>
              )}
            </button>
          )}
          <button
            onClick={handleClear}
            className={`px-6 py-2 rounded-lg transition-colors font-medium ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            {t('tools.hashGenerator.clear', 'Clear')}
          </button>
        </div>

        {/* Hash Results */}
        {hashes && (
          <div className="space-y-3">
            {/* MD5 */}
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.hashGenerator.md5', 'MD5')}
                </h3>
                <button
                  onClick={() => handleCopy(hashes.md5, 'md5')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors text-xs ${
                    copiedHash === 'md5'
                      ? 'bg-green-500 text-white'
                      : theme === 'dark'
                      ? 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  {copiedHash === 'md5' ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedHash === 'md5' ? t('tools.hashGenerator.copied', 'Copied!') : t('tools.hashGenerator.copy', 'Copy')}
                </button>
              </div>
              <p
                className={`text-sm font-mono break-all ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {hashes.md5}
              </p>
            </div>

            {/* SHA-1 */}
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.hashGenerator.sha1', 'SHA-1')}
                </h3>
                <button
                  onClick={() => handleCopy(hashes.sha1, 'sha1')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors text-xs ${
                    copiedHash === 'sha1'
                      ? 'bg-green-500 text-white'
                      : theme === 'dark'
                      ? 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  {copiedHash === 'sha1' ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedHash === 'sha1' ? t('tools.hashGenerator.copied2', 'Copied!') : t('tools.hashGenerator.copy2', 'Copy')}
                </button>
              </div>
              <p
                className={`text-sm font-mono break-all ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {hashes.sha1}
              </p>
            </div>

            {/* SHA-256 */}
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.hashGenerator.sha256', 'SHA-256')}
                </h3>
                <button
                  onClick={() => handleCopy(hashes.sha256, 'sha256')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors text-xs ${
                    copiedHash === 'sha256'
                      ? 'bg-green-500 text-white'
                      : theme === 'dark'
                      ? 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  {copiedHash === 'sha256' ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedHash === 'sha256' ? t('tools.hashGenerator.copied3', 'Copied!') : t('tools.hashGenerator.copy3', 'Copy')}
                </button>
              </div>
              <p
                className={`text-sm font-mono break-all ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {hashes.sha256}
              </p>
            </div>

            {/* SHA-512 */}
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.hashGenerator.sha512', 'SHA-512')}
                </h3>
                <button
                  onClick={() => handleCopy(hashes.sha512, 'sha512')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors text-xs ${
                    copiedHash === 'sha512'
                      ? 'bg-green-500 text-white'
                      : theme === 'dark'
                      ? 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  {copiedHash === 'sha512' ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedHash === 'sha512' ? t('tools.hashGenerator.copied4', 'Copied!') : t('tools.hashGenerator.copy4', 'Copy')}
                </button>
              </div>
              <p
                className={`text-sm font-mono break-all ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {hashes.sha512}
              </p>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.hashGenerator.aboutHashFunctions', 'About Hash Functions')}
          </h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Hash functions convert data into fixed-size strings. They're one-way (cannot be reversed) and commonly used
            for data integrity verification, password storage, and digital signatures.
          </p>
        </div>
      </div>
    </div>
  );
};
