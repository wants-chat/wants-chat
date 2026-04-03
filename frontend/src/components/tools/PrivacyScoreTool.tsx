import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Globe,
  Cookie,
  Eye,
  Lock,
  Fingerprint,
  Share2,
  Server,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Info
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface PrivacyScoreToolProps {
  uiConfig?: UIConfig;
}

interface PrivacyCheck {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'pass' | 'warn' | 'fail' | 'unknown';
  details: string;
  weight: number;
}

interface AnalysisResult {
  url: string;
  score: number;
  grade: string;
  checks: PrivacyCheck[];
  recommendations: string[];
  analyzedAt: Date;
}

// Simulated privacy analysis based on URL patterns
const analyzeWebsite = (url: string): AnalysisResult => {
  const domain = url.toLowerCase().replace(/^https?:\/\//, '').split('/')[0];

  // Determine characteristics based on domain patterns
  const isHTTPS = url.startsWith('https://');
  const isKnownTracker = /facebook|google|amazon|twitter|tiktok|meta\.com/.test(domain);
  const isKnownPrivate = /duckduckgo|proton|signal|tutanota|brave/.test(domain);
  const isGov = /\.gov$/.test(domain);
  const isEdu = /\.edu$/.test(domain);
  const hasPrivacyFocus = /privacy|secure|encrypted/.test(domain);

  // Generate random but consistent checks based on domain hash
  const hash = domain.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const rand = (seed: number) => ((hash + seed) % 100) / 100;

  const checks: PrivacyCheck[] = [
    {
      id: 'https',
      name: 'HTTPS Encryption',
      description: 'Secure connection using TLS/SSL',
      icon: <Lock className="w-5 h-5" />,
      status: isHTTPS ? 'pass' : 'fail',
      details: isHTTPS
        ? 'Site uses HTTPS encryption to protect data in transit'
        : 'Site does not use HTTPS - data is transmitted in plain text',
      weight: 20,
    },
    {
      id: 'trackers',
      name: 'Third-Party Trackers',
      description: 'External tracking scripts and pixels',
      icon: <Eye className="w-5 h-5" />,
      status: isKnownPrivate ? 'pass' : isKnownTracker ? 'fail' : rand(1) > 0.5 ? 'warn' : 'pass',
      details: isKnownPrivate
        ? 'Minimal or no third-party trackers detected'
        : isKnownTracker
        ? 'Multiple advertising and analytics trackers found'
        : rand(1) > 0.5 ? 'Some third-party trackers detected' : 'Limited tracking scripts detected',
      weight: 15,
    },
    {
      id: 'cookies',
      name: 'Cookie Usage',
      description: 'How the site uses browser cookies',
      icon: <Cookie className="w-5 h-5" />,
      status: isKnownPrivate ? 'pass' : isKnownTracker ? 'fail' : rand(2) > 0.4 ? 'warn' : 'pass',
      details: isKnownPrivate
        ? 'Only essential cookies used'
        : isKnownTracker
        ? 'Extensive tracking cookies including cross-site trackers'
        : rand(2) > 0.4 ? 'Uses both essential and analytics cookies' : 'Minimal cookie usage',
      weight: 15,
    },
    {
      id: 'fingerprinting',
      name: 'Browser Fingerprinting',
      description: 'Canvas, WebGL, and audio fingerprinting',
      icon: <Fingerprint className="w-5 h-5" />,
      status: isKnownPrivate ? 'pass' : isKnownTracker ? 'fail' : rand(3) > 0.6 ? 'warn' : 'pass',
      details: isKnownPrivate
        ? 'No fingerprinting techniques detected'
        : isKnownTracker
        ? 'Active fingerprinting detected for user identification'
        : rand(3) > 0.6 ? 'Some fingerprinting scripts present' : 'No significant fingerprinting detected',
      weight: 10,
    },
    {
      id: 'datasharing',
      name: 'Data Sharing',
      description: 'Sharing data with third parties',
      icon: <Share2 className="w-5 h-5" />,
      status: isKnownPrivate || isGov || isEdu ? 'pass' : isKnownTracker ? 'fail' : rand(4) > 0.5 ? 'warn' : 'pass',
      details: isKnownPrivate || isGov || isEdu
        ? 'Limited data sharing with third parties'
        : isKnownTracker
        ? 'Extensive data sharing with advertising networks'
        : rand(4) > 0.5 ? 'Data may be shared with analytics providers' : 'Minimal data sharing detected',
      weight: 15,
    },
    {
      id: 'privacypolicy',
      name: 'Privacy Policy',
      description: 'Presence and clarity of privacy policy',
      icon: <Info className="w-5 h-5" />,
      status: isKnownTracker || isGov || isEdu || isKnownPrivate ? 'pass' : rand(5) > 0.3 ? 'pass' : 'warn',
      details: 'Privacy policy page detected and accessible',
      weight: 10,
    },
    {
      id: 'dataretention',
      name: 'Data Retention',
      description: 'How long user data is stored',
      icon: <Server className="w-5 h-5" />,
      status: isKnownPrivate ? 'pass' : isKnownTracker ? 'warn' : rand(6) > 0.4 ? 'warn' : 'pass',
      details: isKnownPrivate
        ? 'Short data retention periods disclosed'
        : isKnownTracker
        ? 'Data may be retained for extended periods'
        : 'Data retention policy could not be determined',
      weight: 10,
    },
    {
      id: 'jurisdiction',
      name: 'Data Jurisdiction',
      description: 'Where user data is processed',
      icon: <Globe className="w-5 h-5" />,
      status: isGov || hasPrivacyFocus ? 'pass' : rand(7) > 0.5 ? 'warn' : 'pass',
      details: isGov
        ? 'Data processed in compliance with local regulations'
        : 'Data may be processed in multiple jurisdictions',
      weight: 5,
    },
  ];

  // Calculate score
  let totalWeight = 0;
  let earnedPoints = 0;

  checks.forEach(check => {
    totalWeight += check.weight;
    if (check.status === 'pass') earnedPoints += check.weight;
    else if (check.status === 'warn') earnedPoints += check.weight * 0.5;
  });

  const score = Math.round((earnedPoints / totalWeight) * 100);

  // Determine grade
  let grade: string;
  if (score >= 90) grade = 'A+';
  else if (score >= 80) grade = 'A';
  else if (score >= 70) grade = 'B';
  else if (score >= 60) grade = 'C';
  else if (score >= 50) grade = 'D';
  else grade = 'F';

  // Generate recommendations
  const recommendations: string[] = [];
  checks.forEach(check => {
    if (check.status === 'fail') {
      if (check.id === 'https') recommendations.push('Enable HTTPS encryption on your website');
      if (check.id === 'trackers') recommendations.push('Consider using privacy-respecting analytics alternatives');
      if (check.id === 'cookies') recommendations.push('Review and minimize cookie usage');
      if (check.id === 'fingerprinting') recommendations.push('Remove browser fingerprinting scripts');
      if (check.id === 'datasharing') recommendations.push('Limit data sharing with third parties');
    } else if (check.status === 'warn') {
      if (check.id === 'trackers') recommendations.push('Audit third-party scripts for privacy compliance');
      if (check.id === 'cookies') recommendations.push('Implement granular cookie consent');
      if (check.id === 'dataretention') recommendations.push('Publish clear data retention policies');
    }
  });

  if (recommendations.length === 0) {
    recommendations.push('This website follows good privacy practices');
  }

  return {
    url,
    score,
    grade,
    checks,
    recommendations,
    analyzedAt: new Date(),
  };
};

export const PrivacyScoreTool = ({ uiConfig }: PrivacyScoreToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [url, setUrl] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      const urlContent = params.url || params.text || params.content || '';
      if (urlContent) {
        setUrl(urlContent);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const handleAnalyze = async () => {
    setError('');

    if (!url.trim()) {
      setError('Please enter a website URL');
      return;
    }

    // Validate URL format
    let validUrl = url.trim();
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = 'https://' + validUrl;
    }

    try {
      new URL(validUrl);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    setIsAnalyzing(true);

    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const analysisResult = analyzeWebsite(validUrl);
    setResult(analysisResult);
    setIsAnalyzing(false);
  };

  const getStatusIcon = (status: PrivacyCheck['status']) => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warn': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'fail': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-gray-400" />;
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-500';
    if (grade === 'B') return 'text-blue-500';
    if (grade === 'C') return 'text-yellow-500';
    if (grade === 'D') return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-7 h-7 text-teal-500" />
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.privacyScore.websitePrivacyScoreChecker', 'Website Privacy Score Checker')}
        </h2>
      </div>

      <div className="space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span className="text-sm text-teal-500 font-medium">{t('tools.privacyScore.urlLoadedFromAiResponse', 'URL loaded from AI response')}</span>
          </div>
        )}

        {/* URL Input */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.privacyScore.websiteUrl', 'Website URL')}
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Globe className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                placeholder={t('tools.privacyScore.enterWebsiteUrlEG', 'Enter website URL (e.g., example.com)')}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              />
            </div>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white rounded-lg transition-colors font-medium"
            >
              {isAnalyzing ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              {isAnalyzing ? t('tools.privacyScore.analyzing', 'Analyzing...') : t('tools.privacyScore.analyze', 'Analyze')}
            </button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-500">{error}</p>
          )}
        </div>

        {/* Results */}
        {result && (
          <>
            {/* Score Card */}
            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Score Circle */}
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke={isDark ? '#374151' : '#e5e7eb'}
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke={result.score >= 80 ? '#22c55e' : result.score >= 60 ? '#eab308' : result.score >= 40 ? '#f97316' : '#ef4444'}
                      strokeWidth="12"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${(result.score / 100) * 352} 352`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-3xl font-bold ${getGradeColor(result.grade)}`}>
                      {result.grade}
                    </span>
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {result.score}/100
                    </span>
                  </div>
                </div>

                {/* Summary */}
                <div className="flex-1 text-center sm:text-left">
                  <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Privacy Score: {result.score}/100
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-teal-500"
                    >
                      {result.url}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                  <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Analyzed at {result.analyzedAt.toLocaleTimeString()}
                  </p>
                </div>

                {/* Score Bar */}
                <div className="w-full sm:w-48">
                  <div className={`h-3 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-200'} overflow-hidden`}>
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getScoreColor(result.score)}`}
                      style={{ width: `${result.score}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Checks */}
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.privacyScore.privacyChecks', 'Privacy Checks')}
              </h3>
              <div className="grid gap-3">
                {result.checks.map((check) => (
                  <div
                    key={check.id}
                    className={`p-4 rounded-lg border ${
                      isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-600' : 'bg-gray-100'}`}>
                        {check.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {check.name}
                          </h4>
                          {getStatusIcon(check.status)}
                        </div>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {check.details}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-teal-900/20 border border-teal-700/30' : 'bg-teal-50 border border-teal-200'}`}>
              <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-teal-300' : 'text-teal-800'}`}>
                {t('tools.privacyScore.recommendations', 'Recommendations')}
              </h3>
              <ul className={`space-y-2 ${isDark ? 'text-teal-200/80' : 'text-teal-700'}`}>
                {result.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* Info Box */}
        {!result && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <h3 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.privacyScore.whatWeCheck', 'What We Check')}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: <Lock className="w-5 h-5" />, label: 'HTTPS' },
                { icon: <Eye className="w-5 h-5" />, label: 'Trackers' },
                { icon: <Cookie className="w-5 h-5" />, label: 'Cookies' },
                { icon: <Fingerprint className="w-5 h-5" />, label: 'Fingerprinting' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg ${isDark ? 'bg-gray-600' : 'bg-white'}`}
                >
                  <div className="text-teal-500">{item.icon}</div>
                  <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <p className={`text-xs text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          This is a simulated privacy analysis for educational purposes.
          For comprehensive privacy audits, use dedicated security tools.
        </p>
      </div>
    </div>
  );
};

export default PrivacyScoreTool;
