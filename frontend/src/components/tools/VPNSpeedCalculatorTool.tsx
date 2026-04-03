import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Shield,
  Wifi,
  Gauge,
  MapPin,
  Server,
  Sparkles,
  RefreshCw,
  ArrowRight,
  Download,
  Upload,
  Clock,
  AlertTriangle,
  CheckCircle,
  Info,
  Globe,
  Zap
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface VPNSpeedCalculatorToolProps {
  uiConfig?: UIConfig;
}

interface SpeedResult {
  originalDownload: number;
  originalUpload: number;
  originalPing: number;
  vpnDownload: number;
  vpnUpload: number;
  vpnPing: number;
  downloadReduction: number;
  uploadReduction: number;
  pingIncrease: number;
  serverDistance: number;
  protocol: string;
  encryption: string;
  calculatedAt: Date;
}

type VPNProtocol = 'wireguard' | 'openvpn' | 'ikev2' | 'l2tp';
type EncryptionLevel = 'aes128' | 'aes256' | 'chacha20';
type ServerLocation = 'nearby' | 'medium' | 'far' | 'intercontinental';

const PROTOCOL_OVERHEAD: Record<VPNProtocol, { speedImpact: number; pingImpact: number; name: string }> = {
  wireguard: { speedImpact: 3, pingImpact: 5, name: 'WireGuard' },
  openvpn: { speedImpact: 15, pingImpact: 20, name: 'OpenVPN' },
  ikev2: { speedImpact: 8, pingImpact: 10, name: 'IKEv2/IPSec' },
  l2tp: { speedImpact: 20, pingImpact: 25, name: 'L2TP/IPSec' },
};

const ENCRYPTION_OVERHEAD: Record<EncryptionLevel, { speedImpact: number; name: string }> = {
  aes128: { speedImpact: 2, name: 'AES-128' },
  aes256: { speedImpact: 5, name: 'AES-256' },
  chacha20: { speedImpact: 3, name: 'ChaCha20' },
};

const SERVER_DISTANCE: Record<ServerLocation, { distance: number; pingAdd: number; name: string }> = {
  nearby: { distance: 500, pingAdd: 10, name: 'Nearby (< 500 km)' },
  medium: { distance: 2000, pingAdd: 40, name: 'Medium (500-2000 km)' },
  far: { distance: 5000, pingAdd: 80, name: 'Far (2000-5000 km)' },
  intercontinental: { distance: 10000, pingAdd: 150, name: 'Intercontinental (5000+ km)' },
};

export const VPNSpeedCalculatorTool = ({ uiConfig }: VPNSpeedCalculatorToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [downloadSpeed, setDownloadSpeed] = useState<string>('100');
  const [uploadSpeed, setUploadSpeed] = useState<string>('20');
  const [currentPing, setCurrentPing] = useState<string>('15');
  const [protocol, setProtocol] = useState<VPNProtocol>('wireguard');
  const [encryption, setEncryption] = useState<EncryptionLevel>('aes256');
  const [serverLocation, setServerLocation] = useState<ServerLocation>('nearby');
  const [result, setResult] = useState<SpeedResult | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.downloadSpeed) setDownloadSpeed(params.downloadSpeed.toString());
      if (params.uploadSpeed) setUploadSpeed(params.uploadSpeed.toString());
      if (params.ping) setCurrentPing(params.ping.toString());
      setIsPrefilled(true);
    }
  }, [uiConfig?.params]);

  const calculateVPNSpeed = () => {
    const download = parseFloat(downloadSpeed) || 0;
    const upload = parseFloat(uploadSpeed) || 0;
    const ping = parseFloat(currentPing) || 0;

    if (download <= 0 || upload <= 0 || ping <= 0) {
      return;
    }

    setIsCalculating(true);

    // Simulate calculation delay
    setTimeout(() => {
      const protocolData = PROTOCOL_OVERHEAD[protocol];
      const encryptionData = ENCRYPTION_OVERHEAD[encryption];
      const locationData = SERVER_DISTANCE[serverLocation];

      // Calculate speed reduction
      const totalSpeedImpact = protocolData.speedImpact + encryptionData.speedImpact;

      // Add some randomness for realism (5-10% variance)
      const variance = 0.95 + Math.random() * 0.1;

      const downloadReduction = totalSpeedImpact * variance;
      const uploadReduction = (totalSpeedImpact + 2) * variance; // Upload typically affected slightly more

      const vpnDownload = Math.max(download * (1 - downloadReduction / 100), download * 0.5);
      const vpnUpload = Math.max(upload * (1 - uploadReduction / 100), upload * 0.5);

      // Calculate ping increase
      const pingIncrease = protocolData.pingImpact + locationData.pingAdd;
      const vpnPing = ping + pingIncrease;

      setResult({
        originalDownload: download,
        originalUpload: upload,
        originalPing: ping,
        vpnDownload: Math.round(vpnDownload * 10) / 10,
        vpnUpload: Math.round(vpnUpload * 10) / 10,
        vpnPing: Math.round(vpnPing),
        downloadReduction: Math.round(downloadReduction * 10) / 10,
        uploadReduction: Math.round(uploadReduction * 10) / 10,
        pingIncrease: Math.round(pingIncrease),
        serverDistance: locationData.distance,
        protocol: protocolData.name,
        encryption: encryptionData.name,
        calculatedAt: new Date(),
      });

      setIsCalculating(false);
    }, 800);
  };

  const getSpeedRating = (reduction: number): { label: string; color: string } => {
    if (reduction < 5) return { label: 'Excellent', color: 'text-green-500' };
    if (reduction < 10) return { label: 'Good', color: 'text-blue-500' };
    if (reduction < 20) return { label: 'Moderate', color: 'text-yellow-500' };
    if (reduction < 30) return { label: 'Significant', color: 'text-orange-500' };
    return { label: 'High', color: 'text-red-500' };
  };

  const getLatencyRating = (ping: number): { label: string; color: string } => {
    if (ping < 50) return { label: 'Excellent', color: 'text-green-500' };
    if (ping < 100) return { label: 'Good', color: 'text-blue-500' };
    if (ping < 150) return { label: 'Moderate', color: 'text-yellow-500' };
    if (ping < 200) return { label: 'High', color: 'text-orange-500' };
    return { label: 'Very High', color: 'text-red-500' };
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-7 h-7 text-teal-500" />
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {t('tools.vpnSpeedCalculator.title')}
        </h2>
      </div>

      <div className="space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span className="text-sm text-teal-500 font-medium">{t('tools.vpnSpeedCalculator.settingsLoaded')}</span>
          </div>
        )}

        {/* Current Speed Inputs */}
        <div>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.vpnSpeedCalculator.currentSpeed')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <Download className="w-4 h-4 inline mr-1" />
                {t('tools.vpnSpeedCalculator.download')}
              </label>
              <input
                type="number"
                value={downloadSpeed}
                onChange={(e) => setDownloadSpeed(e.target.value)}
                min="1"
                max="10000"
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-teal-500`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <Upload className="w-4 h-4 inline mr-1" />
                {t('tools.vpnSpeedCalculator.upload')}
              </label>
              <input
                type="number"
                value={uploadSpeed}
                onChange={(e) => setUploadSpeed(e.target.value)}
                min="1"
                max="10000"
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-teal-500`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <Clock className="w-4 h-4 inline mr-1" />
                {t('tools.vpnSpeedCalculator.ping')}
              </label>
              <input
                type="number"
                value={currentPing}
                onChange={(e) => setCurrentPing(e.target.value)}
                min="1"
                max="1000"
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-teal-500`}
              />
            </div>
          </div>
        </div>

        {/* VPN Settings */}
        <div>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.vpnSpeedCalculator.vpnConfiguration')}
          </h3>

          {/* Protocol Selection */}
          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <Wifi className="w-4 h-4 inline mr-1" />
              {t('tools.vpnSpeedCalculator.vpnProtocol')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.entries(PROTOCOL_OVERHEAD) as [VPNProtocol, typeof PROTOCOL_OVERHEAD[VPNProtocol]][]).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setProtocol(key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    protocol === key
                      ? 'bg-teal-500 text-white border-teal-500'
                      : isDark
                      ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {value.name}
                </button>
              ))}
            </div>
          </div>

          {/* Encryption Selection */}
          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <Shield className="w-4 h-4 inline mr-1" />
              {t('tools.vpnSpeedCalculator.encryption')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(ENCRYPTION_OVERHEAD) as [EncryptionLevel, typeof ENCRYPTION_OVERHEAD[EncryptionLevel]][]).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setEncryption(key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    encryption === key
                      ? 'bg-teal-500 text-white border-teal-500'
                      : isDark
                      ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {value.name}
                </button>
              ))}
            </div>
          </div>

          {/* Server Location Selection */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <MapPin className="w-4 h-4 inline mr-1" />
              {t('tools.vpnSpeedCalculator.serverDistance')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.entries(SERVER_DISTANCE) as [ServerLocation, typeof SERVER_DISTANCE[ServerLocation]][]).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setServerLocation(key)}
                  className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors border ${
                    serverLocation === key
                      ? 'bg-teal-500 text-white border-teal-500'
                      : isDark
                      ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {value.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calculate Button */}
        <button
          onClick={calculateVPNSpeed}
          disabled={isCalculating}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white rounded-lg transition-colors font-medium"
        >
          {isCalculating ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <Gauge className="w-5 h-5" />
          )}
          {isCalculating ? t('tools.vpnSpeedCalculator.calculating') : t('tools.vpnSpeedCalculator.calculate')}
        </button>

        {/* Results */}
        {result && (
          <>
            {/* Speed Comparison */}
            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.vpnSpeedCalculator.estimatedSpeed')}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Download Speed */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Download className="w-5 h-5 text-teal-500" />
                    <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.vpnSpeedCalculator.downloadLabel')}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xl font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'} line-through`}>
                      {result.originalDownload}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {result.vpnDownload}
                    </span>
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Mbps</span>
                  </div>
                  <div className={`text-sm ${getSpeedRating(result.downloadReduction).color}`}>
                    -{result.downloadReduction}% ({getSpeedRating(result.downloadReduction).label})
                  </div>
                </div>

                {/* Upload Speed */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Upload className="w-5 h-5 text-teal-500" />
                    <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.vpnSpeedCalculator.uploadLabel')}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xl font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'} line-through`}>
                      {result.originalUpload}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {result.vpnUpload}
                    </span>
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Mbps</span>
                  </div>
                  <div className={`text-sm ${getSpeedRating(result.uploadReduction).color}`}>
                    -{result.uploadReduction}% ({getSpeedRating(result.uploadReduction).label})
                  </div>
                </div>

                {/* Ping/Latency */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-5 h-5 text-teal-500" />
                    <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.vpnSpeedCalculator.latency')}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xl font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'} line-through`}>
                      {result.originalPing}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {result.vpnPing}
                    </span>
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>ms</span>
                  </div>
                  <div className={`text-sm ${getLatencyRating(result.vpnPing).color}`}>
                    +{result.pingIncrease}ms ({getLatencyRating(result.vpnPing).label})
                  </div>
                </div>
              </div>

              {/* Configuration Summary */}
              <div className={`mt-4 p-3 rounded-lg ${isDark ? 'bg-gray-600/50' : 'bg-gray-100'}`}>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Wifi className="w-4 h-4 text-teal-500" />
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{result.protocol}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4 text-teal-500" />
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{result.encryption}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe className="w-4 h-4 text-teal-500" />
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>~{result.serverDistance} km</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-teal-900/20 border border-teal-700/30' : 'bg-teal-50 border border-teal-200'}`}>
              <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-teal-300' : 'text-teal-800'}`}>
                <Zap className="w-4 h-4" />
                {t('tools.vpnSpeedCalculator.optimizationTips')}
              </h3>
              <ul className={`space-y-2 ${isDark ? 'text-teal-200/80' : 'text-teal-700'}`}>
                {protocol !== 'wireguard' && (
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {t('tools.vpnSpeedCalculator.tipWireGuard')}
                  </li>
                )}
                {serverLocation !== 'nearby' && (
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {t('tools.vpnSpeedCalculator.tipCloserServer')}
                  </li>
                )}
                {result.vpnPing > 100 && (
                  <li className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {t('tools.vpnSpeedCalculator.tipHighLatency')}
                  </li>
                )}
                <li className="flex items-start gap-2 text-sm">
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {t('tools.vpnSpeedCalculator.tipActualSpeeds')}
                </li>
              </ul>
            </div>
          </>
        )}

        {/* Info Box */}
        {!result && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <h3 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.vpnSpeedCalculator.about')}
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.vpnSpeedCalculator.aboutText')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VPNSpeedCalculatorTool;
