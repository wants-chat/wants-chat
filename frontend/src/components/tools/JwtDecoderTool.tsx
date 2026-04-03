import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Key, Copy, AlertTriangle, CheckCircle, Clock, User, Shield, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface JwtDecoderToolProps {
  uiConfig?: UIConfig;
}

interface DecodedJwt {
  header: Record<string, any>;
  payload: Record<string, any>;
  signature: string;
  isValid: boolean;
  isExpired: boolean;
  expiresAt?: Date;
  issuedAt?: Date;
}

export const JwtDecoderTool: React.FC<JwtDecoderToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [token, setToken] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      const codeContent = params.code || params.content || params.text || '';
      if (codeContent) {
        setToken(codeContent);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const decoded = useMemo((): DecodedJwt | null => {
    if (!token.trim()) return null;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      const [headerB64, payloadB64, signature] = parts;

      // Decode base64url
      const decodeBase64Url = (str: string) => {
        const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
        return JSON.parse(atob(padded));
      };

      const header = decodeBase64Url(headerB64);
      const payload = decodeBase64Url(payloadB64);

      // Check expiration
      const now = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp ? payload.exp < now : false;
      const expiresAt = payload.exp ? new Date(payload.exp * 1000) : undefined;
      const issuedAt = payload.iat ? new Date(payload.iat * 1000) : undefined;

      return {
        header,
        payload,
        signature,
        isValid: true,
        isExpired,
        expiresAt,
        issuedAt,
      };
    } catch (e) {
      return {
        header: {},
        payload: {},
        signature: '',
        isValid: false,
        isExpired: false,
      };
    }
  }, [token]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatJson = (obj: Record<string, any>) => JSON.stringify(obj, null, 2);

  const getClaimLabel = (key: string): string => {
    const claims: Record<string, string> = {
      iss: 'Issuer',
      sub: 'Subject',
      aud: 'Audience',
      exp: 'Expiration Time',
      nbf: 'Not Before',
      iat: 'Issued At',
      jti: 'JWT ID',
      name: 'Name',
      email: 'Email',
      role: 'Role',
      roles: 'Roles',
      permissions: 'Permissions',
      scope: 'Scope',
    };
    return claims[key] || key;
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-emerald-900/20' : 'bg-gradient-to-r from-white to-emerald-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Key className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.jwtDecoder.jwtDecoder', 'JWT Decoder')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.jwtDecoder.decodeAndInspectJsonWeb', 'Decode and inspect JSON Web Tokens')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.jwtDecoder.codeLoadedFromAiResponse', 'Code loaded from AI response')}</span>
          </div>
        )}

        {/* Token Input */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.jwtDecoder.pasteYourJwtToken', 'Paste your JWT token')}
          </label>
          <textarea
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder={t('tools.jwtDecoder.eyjhbgcioijiuzi1niisinr5cci6ikpxvcj9', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')}
            rows={4}
            className={`w-full px-4 py-3 rounded-lg border font-mono text-sm resize-none ${
              isDark
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
          />
        </div>

        {/* Status Banner */}
        {decoded && (
          <div className={`p-4 rounded-xl flex items-center gap-3 ${
            !decoded.isValid
              ? 'bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800'
              : decoded.isExpired
              ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800'
              : 'bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800'
          }`}>
            {!decoded.isValid ? (
              <>
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span className="text-red-600 dark:text-red-400 font-medium">{t('tools.jwtDecoder.invalidJwtFormat', 'Invalid JWT format')}</span>
              </>
            ) : decoded.isExpired ? (
              <>
                <Clock className="w-5 h-5 text-yellow-500" />
                <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                  Token expired on {decoded.expiresAt?.toLocaleString()}
                </span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-green-600 dark:text-green-400 font-medium">
                  Valid token{decoded.expiresAt && ` (expires ${decoded.expiresAt.toLocaleString()})`}
                </span>
              </>
            )}
          </div>
        )}

        {/* Decoded Content */}
        {decoded?.isValid && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Header */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className={`font-medium flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Shield className="w-4 h-4 text-blue-500" />
                  {t('tools.jwtDecoder.header', 'Header')}
                </h4>
                <button
                  onClick={() => handleCopy(formatJson(decoded.header), 'header')}
                  className={`flex items-center gap-1 px-2 py-1 text-xs rounded ${
                    copied === 'header'
                      ? 'bg-green-500 text-white'
                      : isDark
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <Copy className="w-3 h-3" />
                  {copied === 'header' ? t('tools.jwtDecoder.copied', 'Copied!') : t('tools.jwtDecoder.copy', 'Copy')}
                </button>
              </div>
              <pre className={`p-4 rounded-lg text-sm font-mono overflow-x-auto ${
                isDark ? 'bg-gray-800 text-emerald-300' : 'bg-gray-50 text-emerald-700'
              }`}>
                {formatJson(decoded.header)}
              </pre>
            </div>

            {/* Payload */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className={`font-medium flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <User className="w-4 h-4 text-purple-500" />
                  {t('tools.jwtDecoder.payload', 'Payload')}
                </h4>
                <button
                  onClick={() => handleCopy(formatJson(decoded.payload), 'payload')}
                  className={`flex items-center gap-1 px-2 py-1 text-xs rounded ${
                    copied === 'payload'
                      ? 'bg-green-500 text-white'
                      : isDark
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <Copy className="w-3 h-3" />
                  {copied === 'payload' ? t('tools.jwtDecoder.copied2', 'Copied!') : t('tools.jwtDecoder.copy2', 'Copy')}
                </button>
              </div>
              <pre className={`p-4 rounded-lg text-sm font-mono overflow-x-auto ${
                isDark ? 'bg-gray-800 text-purple-300' : 'bg-gray-50 text-purple-700'
              }`}>
                {formatJson(decoded.payload)}
              </pre>
            </div>
          </div>
        )}

        {/* Claims Table */}
        {decoded?.isValid && Object.keys(decoded.payload).length > 0 && (
          <div className="space-y-3">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.jwtDecoder.claims', 'Claims')}
            </h4>
            <div className={`rounded-lg border overflow-hidden ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <table className="w-full">
                <thead className={isDark ? 'bg-gray-800' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.jwtDecoder.claim', 'Claim')}
                    </th>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.jwtDecoder.value', 'Value')}
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {Object.entries(decoded.payload).map(([key, value]) => (
                    <tr key={key} className={isDark ? 'bg-gray-900' : 'bg-white'}>
                      <td className={`px-4 py-3 text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                        <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded mr-2">
                          {key}
                        </span>
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                          {getClaimLabel(key)}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-sm font-mono ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {key === 'exp' || key === 'iat' || key === 'nbf'
                          ? new Date(Number(value) * 1000).toLocaleString()
                          : typeof value === 'object'
                          ? JSON.stringify(value)
                          : String(value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Signature */}
        {decoded?.isValid && (
          <div className="space-y-3">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.jwtDecoder.signature', 'Signature')}
            </h4>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <code className={`text-sm font-mono break-all ${isDark ? 'text-orange-300' : 'text-orange-600'}`}>
                {decoded.signature}
              </code>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('tools.jwtDecoder.noteSignatureVerificationRequiresThe', 'Note: Signature verification requires the secret key, which is not done client-side for security.')}
            </p>
          </div>
        )}

        {/* Info */}
        {!token && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.jwtDecoder.whatIsAJwt', 'What is a JWT?')}</strong> JSON Web Token (JWT) is a compact, URL-safe means of representing claims
              to be transferred between two parties. The claims in a JWT are encoded as a JSON object that is used
              as the payload of a JSON Web Signature (JWS) structure.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JwtDecoderTool;
