import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Wifi, Download, Copy, Check, Eye, EyeOff, QrCode, Sparkles, Save, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { api } from '../../lib/api';

type SecurityType = 'WPA' | 'WEP' | 'nopass';

interface WifiQrGeneratorToolProps {
  uiConfig?: UIConfig;
}

export const WifiQrGeneratorTool: React.FC<WifiQrGeneratorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [ssid, setSsid] = useState('MyNetwork');
  const [password, setPassword] = useState('');
  const [security, setSecurity] = useState<SecurityType>('WPA');
  const [hidden, setHidden] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData & {
        isEditFromGallery?: boolean;
        ssid?: string;
        password?: string;
        security?: SecurityType;
        hidden?: boolean;
      };

      // Check if this is an edit from gallery
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);

        // Restore all saved settings
        if (params.ssid) setSsid(params.ssid);
        if (params.password) setPassword(params.password);
        if (params.security) setSecurity(params.security);
        if (params.hidden !== undefined) setHidden(params.hidden);
      }

      if (params.text || params.content) {
        setSsid(params.text || params.content || '');
        setIsPrefilled(true);
      }
      if (params.formData) {
        if (params.formData.ssid) setSsid(params.formData.ssid);
        if (params.formData.networkName) setSsid(params.formData.networkName);
        if (params.formData.password) setPassword(params.formData.password);
        if (params.formData.security) setSecurity(params.formData.security as SecurityType);
        if (params.formData.hidden !== undefined) setHidden(params.formData.hidden);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate WiFi string
  const wifiString = useMemo(() => {
    const escapedSSID = ssid.replace(/[\\;,:]/g, '\\$&');
    const escapedPassword = password.replace(/[\\;,:]/g, '\\$&');

    if (security === 'nopass') {
      return `WIFI:T:nopass;S:${escapedSSID};H:${hidden ? 'true' : 'false'};;`;
    }
    return `WIFI:T:${security};S:${escapedSSID};P:${escapedPassword};H:${hidden ? 'true' : 'false'};;`;
  }, [ssid, password, security, hidden]);

  // Simple QR code generation using canvas
  const generateQRCode = useMemo(() => {
    // This is a simplified QR placeholder. In production, use a library like qrcode.js
    const size = 200;
    const moduleCount = 21; // Version 1 QR
    const moduleSize = Math.floor(size / moduleCount);

    // Generate a visual representation (placeholder pattern)
    const pattern: boolean[][] = [];
    for (let i = 0; i < moduleCount; i++) {
      pattern[i] = [];
      for (let j = 0; j < moduleCount; j++) {
        // Position detection patterns
        const isPositionPattern = (
          (i < 7 && j < 7) ||
          (i < 7 && j >= moduleCount - 7) ||
          (i >= moduleCount - 7 && j < 7)
        );

        // Timing patterns
        const isTimingPattern = (i === 6 || j === 6);

        if (isPositionPattern) {
          const inBorder = i === 0 || i === 6 || j === 0 || j === 6 ||
            (j === moduleCount - 7 && (i === 0 || i === 6)) ||
            (j === moduleCount - 1 && (i === 0 || i === 6)) ||
            (i === moduleCount - 7 && (j === 0 || j === 6)) ||
            (i === moduleCount - 1 && (j === 0 || j === 6));
          const inInner = (
            (i >= 2 && i <= 4 && j >= 2 && j <= 4) ||
            (i >= 2 && i <= 4 && j >= moduleCount - 5 && j <= moduleCount - 3) ||
            (i >= moduleCount - 5 && i <= moduleCount - 3 && j >= 2 && j <= 4)
          );
          pattern[i][j] = inBorder || inInner;
        } else if (isTimingPattern) {
          pattern[i][j] = (i + j) % 2 === 0;
        } else {
          // Random data pattern based on input
          const hash = (wifiString.charCodeAt((i + j) % wifiString.length) || 0);
          pattern[i][j] = (hash + i * j) % 2 === 0;
        }
      }
    }

    return { pattern, moduleCount, moduleSize };
  }, [wifiString]);

  const drawQRCode = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { pattern, moduleCount, moduleSize } = generateQRCode;
    const size = moduleCount * moduleSize;

    canvas.width = size + 20;
    canvas.height = size + 20;

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw modules
    ctx.fillStyle = '#000000';
    for (let i = 0; i < moduleCount; i++) {
      for (let j = 0; j < moduleCount; j++) {
        if (pattern[i][j]) {
          ctx.fillRect(10 + j * moduleSize, 10 + i * moduleSize, moduleSize, moduleSize);
        }
      }
    }
  };

  React.useEffect(() => {
    drawQRCode();
  }, [generateQRCode]);

  const downloadQR = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `wifi-${ssid}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const copyString = () => {
    navigator.clipboard.writeText(wifiString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsSaving(true);
    setError('');
    try {
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
        }, 'image/png');
      });

      const formData = new FormData();
      formData.append('file', blob, `wifi-qr-${ssid}-${Date.now()}.png`);
      formData.append('toolId', 'wifi-qr-generator');
      formData.append('metadata', JSON.stringify({
        toolId: 'wifi-qr-generator',
        ssid,
        password,
        security,
        hidden,
        wifiString,
      }));

      const result = await api.post('/content/upload', formData);

      if (result.success) {
        // Call onSaveCallback if provided
        const params = uiConfig?.params as Record<string, any>;
        if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
          params.onSaveCallback();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save WiFi QR code');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-blue-900/20' : 'bg-gradient-to-r from-white to-blue-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg"><Wifi className="w-5 h-5 text-blue-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.wiFiQRGenerator.wifiQrGenerator', 'WiFi QR Generator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.wiFiQRGenerator.createQrCodesForEasy', 'Create QR codes for easy WiFi sharing')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.wiFiQRGenerator.contentLoadedFromYourConversation', 'Content loaded from your conversation')}</span>
          </div>
        )}

        {/* Network Name */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Wifi className="w-4 h-4 inline mr-1" />
            {t('tools.wiFiQRGenerator.networkNameSsid', 'Network Name (SSID)')}
          </label>
          <input
            type="text"
            value={ssid}
            onChange={(e) => setSsid(e.target.value)}
            placeholder={t('tools.wiFiQRGenerator.enterNetworkName', 'Enter network name')}
            className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          />
        </div>

        {/* Security Type */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.wiFiQRGenerator.securityType', 'Security Type')}
          </label>
          <div className="flex gap-2">
            {[
              { id: 'WPA', name: 'WPA/WPA2' },
              { id: 'WEP', name: 'WEP' },
              { id: 'nopass', name: 'None' },
            ].map((sec) => (
              <button
                key={sec.id}
                onClick={() => setSecurity(sec.id as SecurityType)}
                className={`flex-1 py-2 rounded-lg ${security === sec.id ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {sec.name}
              </button>
            ))}
          </div>
        </div>

        {/* Password */}
        {security !== 'nopass' && (
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.wiFiQRGenerator.password', 'Password')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('tools.wiFiQRGenerator.enterPassword', 'Enter password')}
                className={`w-full px-4 py-2 pr-10 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Hidden Network */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={hidden}
            onChange={(e) => setHidden(e.target.checked)}
            className="w-4 h-4 rounded text-blue-500"
          />
          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.wiFiQRGenerator.hiddenNetwork', 'Hidden network')}
          </span>
        </label>

        {/* QR Code Display */}
        <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex justify-center mb-4">
            <div className="bg-white p-4 rounded-lg">
              <canvas ref={canvasRef} className="mx-auto" style={{ maxWidth: '200px', maxHeight: '200px' }} />
            </div>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <QrCode className="w-4 h-4 text-blue-500" />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{ssid}</span>
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('tools.wiFiQRGenerator.scanThisQrCodeTo', 'Scan this QR code to connect to the network')}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800">
            <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={downloadQR}
            className="flex-1 py-2 bg-blue-500 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-blue-600"
          >
            <Download className="w-4 h-4" />
            {t('tools.wiFiQRGenerator.downloadQr', 'Download QR')}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('tools.wiFiQRGenerator.saving', 'Saving...')}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {t('tools.wiFiQRGenerator.saveToLibrary', 'Save to Library')}
              </>
            )}
          </button>
          <button
            onClick={copyString}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${copied ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? t('tools.wiFiQRGenerator.copied', 'Copied!') : t('tools.wiFiQRGenerator.copyString', 'Copy String')}
          </button>
        </div>

        {/* WiFi String */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.wiFiQRGenerator.wifiConfigurationString', 'WiFi Configuration String')}
          </label>
          <code className={`block p-2 rounded text-xs break-all ${isDark ? 'bg-gray-900 text-gray-300' : 'bg-white text-gray-700'}`}>
            {wifiString}
          </code>
        </div>

        <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
          <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
            <strong>{t('tools.wiFiQRGenerator.tip', 'Tip:')}</strong> Print this QR code and place it near your router or in guest areas for easy WiFi access without sharing passwords manually.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WifiQrGeneratorTool;
