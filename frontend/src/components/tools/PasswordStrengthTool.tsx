import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Eye, EyeOff, Check, X, AlertTriangle, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface StrengthCriteria {
  label: string;
  met: boolean;
}

interface StrengthAnalysis {
  score: number;
  label: string;
  criteria: StrengthCriteria[];
  entropy: number;
  crackTime: string;
  suggestions: string[];
}

const COMMON_PATTERNS = [
  '123', '234', '345', '456', '567', '678', '789', '890',
  'abc', 'bcd', 'cde', 'def', 'efg', 'fgh', 'ghi', 'hij',
  'ijk', 'jkl', 'klm', 'lmn', 'mno', 'nop', 'opq', 'pqr',
  'qrs', 'rst', 'stu', 'tuv', 'uvw', 'vwx', 'wxy', 'xyz',
  'password', 'qwerty', 'asdf', 'zxcv', 'letmein', 'welcome',
  'admin', 'login', 'pass', '1234', 'abcd', 'test'
];

const calculateEntropy = (password: string): number => {
  if (!password) return 0;

  let charsetSize = 0;
  if (/[a-z]/.test(password)) charsetSize += 26;
  if (/[A-Z]/.test(password)) charsetSize += 26;
  if (/[0-9]/.test(password)) charsetSize += 10;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) charsetSize += 32;

  if (charsetSize === 0) return 0;

  const entropy = password.length * Math.log2(charsetSize);
  return Math.round(entropy * 10) / 10;
};

const estimateCrackTime = (entropy: number): string => {
  // Assuming 10 billion guesses per second (modern GPU)
  const guessesPerSecond = 10_000_000_000;
  const possibleCombinations = Math.pow(2, entropy);
  const secondsToCrack = possibleCombinations / guessesPerSecond / 2; // Average case

  if (secondsToCrack < 1) return 'Instantly';
  if (secondsToCrack < 60) return `${Math.round(secondsToCrack)} seconds`;
  if (secondsToCrack < 3600) return `${Math.round(secondsToCrack / 60)} minutes`;
  if (secondsToCrack < 86400) return `${Math.round(secondsToCrack / 3600)} hours`;
  if (secondsToCrack < 2592000) return `${Math.round(secondsToCrack / 86400)} days`;
  if (secondsToCrack < 31536000) return `${Math.round(secondsToCrack / 2592000)} months`;
  if (secondsToCrack < 31536000 * 100) return `${Math.round(secondsToCrack / 31536000)} years`;
  if (secondsToCrack < 31536000 * 1000) return `${Math.round(secondsToCrack / 31536000)} years`;
  if (secondsToCrack < 31536000 * 1000000) return `${Math.round(secondsToCrack / (31536000 * 1000))}k years`;
  if (secondsToCrack < 31536000 * 1000000000) return `${Math.round(secondsToCrack / (31536000 * 1000000))}M years`;
  return 'Centuries+';
};

const hasCommonPattern = (password: string): boolean => {
  const lowerPassword = password.toLowerCase();
  return COMMON_PATTERNS.some(pattern => lowerPassword.includes(pattern));
};

const analyzePassword = (password: string): StrengthAnalysis => {
  const criteria: StrengthCriteria[] = [
    { label: 'Minimum 8 characters', met: password.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Contains number', met: /[0-9]/.test(password) },
    { label: 'Contains special character (!@#$%^&*)', met: /[!@#$%^&*]/.test(password) },
    { label: 'No common patterns (123, abc, password, qwerty)', met: !hasCommonPattern(password) },
  ];

  const metCount = criteria.filter(c => c.met).length;
  const entropy = calculateEntropy(password);

  // Calculate score based on criteria met and length bonus
  let score = (metCount / criteria.length) * 70;

  // Length bonus (up to 20 points)
  if (password.length > 8) {
    score += Math.min((password.length - 8) * 2, 20);
  }

  // Entropy bonus (up to 10 points)
  if (entropy > 40) {
    score += Math.min((entropy - 40) / 4, 10);
  }

  // Penalty for common patterns
  if (hasCommonPattern(password)) {
    score = Math.max(score - 20, 0);
  }

  score = Math.min(Math.round(score), 100);

  // Determine label
  let label: string;
  if (score < 20) label = 'Very Weak';
  else if (score < 40) label = 'Weak';
  else if (score < 60) label = 'Fair';
  else if (score < 80) label = 'Strong';
  else label = 'Very Strong';

  // Generate suggestions
  const suggestions: string[] = [];
  if (!criteria[0].met) suggestions.push('Add more characters to reach at least 8');
  if (!criteria[1].met) suggestions.push('Include at least one uppercase letter (A-Z)');
  if (!criteria[2].met) suggestions.push('Include at least one lowercase letter (a-z)');
  if (!criteria[3].met) suggestions.push('Include at least one number (0-9)');
  if (!criteria[4].met) suggestions.push('Add a special character like !@#$%^&*');
  if (!criteria[5].met) suggestions.push('Avoid common patterns like "123", "abc", or "password"');
  if (password.length < 12 && metCount >= 4) suggestions.push('Consider using 12+ characters for extra security');
  if (suggestions.length === 0 && score < 100) suggestions.push('Your password is strong! Consider making it longer for maximum security.');

  return {
    score,
    label,
    criteria,
    entropy,
    crackTime: estimateCrackTime(entropy),
    suggestions,
  };
};

const getStrengthColor = (score: number, isDark: boolean): string => {
  if (score < 20) return isDark ? '#ef4444' : '#dc2626'; // Red
  if (score < 40) return isDark ? '#f97316' : '#ea580c'; // Orange
  if (score < 60) return isDark ? '#eab308' : '#ca8a04'; // Yellow
  if (score < 80) return isDark ? '#84cc16' : '#65a30d'; // Light green
  return isDark ? '#22c55e' : '#16a34a'; // Green
};

interface PasswordStrengthToolProps {
  uiConfig?: UIConfig;
}

export const PasswordStrengthTool: React.FC<PasswordStrengthToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.text || params.content) {
        setPassword(params.text || params.content || '');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const analysis = useMemo(() => analyzePassword(password), [password]);
  const strengthColor = useMemo(() => getStrengthColor(analysis.score, isDark), [analysis.score, isDark]);

  return (
    <div
      style={{
        padding: '24px',
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        borderRadius: '12px',
        border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
        maxWidth: '500px',
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Shield
            size={28}
            style={{ color: isDark ? '#60a5fa' : '#3b82f6' }}
          />
          <h2
            style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: 600,
              color: isDark ? '#f9fafb' : '#111827',
            }}
          >
            {t('tools.passwordStrength.passwordStrengthChecker', 'Password Strength Checker')}
          </h2>
        </div>
        {isPrefilled && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              backgroundColor: 'rgba(13, 148, 136, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(13, 148, 136, 0.2)',
            }}
          >
            <Sparkles size={14} style={{ color: '#0D9488' }} />
            <span style={{ fontSize: '12px', color: '#0D9488', fontWeight: 500 }}>{t('tools.passwordStrength.prefilled', 'Prefilled')}</span>
          </div>
        )}
      </div>

      {/* Password Input */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('tools.passwordStrength.enterYourPassword', 'Enter your password')}
          style={{
            width: '100%',
            padding: '12px 48px 12px 16px',
            fontSize: '16px',
            borderRadius: '8px',
            border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
            backgroundColor: isDark ? '#374151' : '#f9fafb',
            color: isDark ? '#f9fafb' : '#111827',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isDark ? '#9ca3af' : '#6b7280',
          }}
          aria-label={showPassword ? t('tools.passwordStrength.hidePassword', 'Hide password') : t('tools.passwordStrength.showPassword', 'Show password')}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      {/* Strength Meter */}
      {password && (
        <>
          <div style={{ marginBottom: '16px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}
            >
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: isDark ? '#d1d5db' : '#4b5563',
                }}
              >
                Strength: <span style={{ color: strengthColor }}>{analysis.label}</span>
              </span>
              <span
                style={{
                  fontSize: '14px',
                  color: isDark ? '#9ca3af' : '#6b7280',
                }}
              >
                {analysis.score}/100
              </span>
            </div>
            <div
              style={{
                height: '8px',
                borderRadius: '4px',
                backgroundColor: isDark ? '#374151' : '#e5e7eb',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${analysis.score}%`,
                  backgroundColor: strengthColor,
                  borderRadius: '4px',
                  transition: 'width 0.3s ease, background-color 0.3s ease',
                }}
              />
            </div>
          </div>

          {/* Entropy and Crack Time */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: isDark ? '#374151' : '#f3f4f6',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  color: isDark ? '#9ca3af' : '#6b7280',
                  marginBottom: '4px',
                }}
              >
                {t('tools.passwordStrength.entropy', 'Entropy')}
              </div>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: isDark ? '#f9fafb' : '#111827',
                }}
              >
                {analysis.entropy} bits
              </div>
            </div>
            <div
              style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: isDark ? '#374151' : '#f3f4f6',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  color: isDark ? '#9ca3af' : '#6b7280',
                  marginBottom: '4px',
                }}
              >
                {t('tools.passwordStrength.estCrackTime', 'Est. Crack Time')}
              </div>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: isDark ? '#f9fafb' : '#111827',
                }}
              >
                {analysis.crackTime}
              </div>
            </div>
          </div>

          {/* Criteria Checklist */}
          <div style={{ marginBottom: '20px' }}>
            <h3
              style={{
                margin: '0 0 12px 0',
                fontSize: '14px',
                fontWeight: 600,
                color: isDark ? '#d1d5db' : '#374151',
              }}
            >
              {t('tools.passwordStrength.requirements', 'Requirements')}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {analysis.criteria.map((criterion, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  {criterion.met ? (
                    <Check
                      size={18}
                      style={{ color: isDark ? '#22c55e' : '#16a34a', flexShrink: 0 }}
                    />
                  ) : (
                    <X
                      size={18}
                      style={{ color: isDark ? '#ef4444' : '#dc2626', flexShrink: 0 }}
                    />
                  )}
                  <span
                    style={{
                      fontSize: '14px',
                      color: criterion.met
                        ? (isDark ? '#9ca3af' : '#6b7280')
                        : (isDark ? '#d1d5db' : '#374151'),
                      textDecoration: criterion.met ? 'line-through' : 'none',
                    }}
                  >
                    {criterion.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Suggestions */}
          {analysis.suggestions.length > 0 && (
            <div
              style={{
                padding: '16px',
                borderRadius: '8px',
                backgroundColor: isDark ? '#422006' : '#fef3c7',
                border: `1px solid ${isDark ? '#854d0e' : '#fcd34d'}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px',
                }}
              >
                <AlertTriangle
                  size={18}
                  style={{ color: isDark ? '#fbbf24' : '#d97706' }}
                />
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: isDark ? '#fcd34d' : '#92400e',
                  }}
                >
                  {t('tools.passwordStrength.suggestions', 'Suggestions')}
                </span>
              </div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                {analysis.suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    style={{
                      fontSize: '13px',
                      color: isDark ? '#fef3c7' : '#78350f',
                    }}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!password && (
        <div
          style={{
            textAlign: 'center',
            padding: '32px 16px',
            color: isDark ? '#9ca3af' : '#6b7280',
          }}
        >
          <Shield
            size={48}
            style={{
              marginBottom: '12px',
              opacity: 0.5,
              color: isDark ? '#6b7280' : '#9ca3af',
            }}
          />
          <p style={{ margin: 0, fontSize: '14px' }}>
            {t('tools.passwordStrength.enterAPasswordToCheck', 'Enter a password to check its strength')}
          </p>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthTool;
