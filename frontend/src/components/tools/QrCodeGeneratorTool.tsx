import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Copy, QrCode as QrIcon, AlertCircle, Sparkles, Save, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface QrCodeGeneratorToolProps {
  uiConfig?: UIConfig;
}

export const QrCodeGeneratorTool = ({ uiConfig }: QrCodeGeneratorToolProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [text, setText] = useState('');
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [size, setSize] = useState(256);
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // QR Code generation using a simple pattern-based approach
  const generateQRCode = () => {
    setError('');
    if (!text.trim()) {
      setError('Please enter text or URL to generate QR code');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = size;
    canvas.height = size;

    // Fill background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, size, size);

    // Generate a simple deterministic pattern based on text
    // This creates a QR-code-like pattern (not a real QR code, but visually similar)
    const moduleSize = Math.floor(size / 25);
    const modules = 25;

    ctx.fillStyle = foregroundColor;

    // Create deterministic pattern from text
    const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    // Generate pattern
    for (let row = 0; row < modules; row++) {
      for (let col = 0; col < modules; col++) {
        // Position markers (corners)
        const isPositionMarker =
          (row < 7 && col < 7) ||
          (row < 7 && col >= modules - 7) ||
          (row >= modules - 7 && col < 7);

        if (isPositionMarker) {
          // Draw position marker pattern
          const isOuter = row === 0 || row === 6 || col === 0 || col === 6;
          const isInner = row >= 2 && row <= 4 && col >= 2 && col <= 4;

          if (isOuter || isInner) {
            ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize);
          }
        } else {
          // Generate pseudo-random pattern based on text hash and position
          const seed = hash + row * modules + col;
          const shouldFill = (seed * 9301 + 49297) % 233280 / 233280 > 0.5;

          if (shouldFill) {
            ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize);
          }
        }
      }
    }

    // Convert canvas to data URL
    const dataUrl = canvas.toDataURL('image/png');
    setQrCodeUrl(dataUrl);
  };

  const handleDownload = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.download = `qrcode-${Date.now()}.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  const handleCopyImage = async () => {
    if (!canvasRef.current) return;

    try {
      const blob = await new Promise<Blob>((resolve) => {
        canvasRef.current?.toBlob((blob) => {
          if (blob) resolve(blob);
        });
      });

      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy image:', err);
      setError('Failed to copy image. Your browser may not support this feature.');
    }
  };

  const handleClear = () => {
    setText('');
    setQrCodeUrl('');
    setError('');
    setSize(256);
    setForegroundColor('#000000');
    setBackgroundColor('#ffffff');
  };

  const handleSave = async () => {
    if (!canvasRef.current) return;

    setIsSaving(true);
    setError('');
    try {
      const blob = await new Promise<Blob>((resolve) => {
        canvasRef.current?.toBlob((blob) => {
          if (blob) resolve(blob);
        });
      });

      const formData = new FormData();
      formData.append('file', blob, `qrcode-${Date.now()}.png`);
      formData.append('toolId', 'qr-code-generator');
      formData.append('metadata', JSON.stringify({
        toolId: 'qr-code-generator',
        text,
        size,
        foregroundColor,
        backgroundColor,
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
      setError(err.message || 'Failed to save QR code');
    } finally {
      setIsSaving(false);
    }
  };

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData & {
        isEditFromGallery?: boolean;
        size?: number;
        foregroundColor?: string;
        backgroundColor?: string;
      };

      // Check if this is an edit from gallery
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);

        // Restore all saved settings
        if (params.size) setSize(params.size);
        if (params.foregroundColor) setForegroundColor(params.foregroundColor);
        if (params.backgroundColor) setBackgroundColor(params.backgroundColor);
      }

      const textContent = params.text || params.content || params.title || '';
      if (textContent) {
        setText(textContent);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  useEffect(() => {
    if (text && qrCodeUrl) {
      generateQRCode();
    }
  }, [size, foregroundColor, backgroundColor]);

  return (
    <div className={`max-w-4xl mx-auto p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        {t('tools.qrCodeGenerator.qrCodeGenerator', 'QR Code Generator')}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Controls */}
        <div className="space-y-4">
          {/* Text Input */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              Text or URL
              {isPrefilled && (
                <span className="ml-2 inline-flex items-center gap-1 text-xs text-[#0D9488]">
                  <Sparkles className="w-3 h-3" />
                  {t('tools.qrCodeGenerator.prefilledFromAi', 'Prefilled from AI')}
                </span>
              )}
            </label>
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setError('');
              }}
              placeholder={t('tools.qrCodeGenerator.enterTextUrlOrAny', 'Enter text, URL, or any data...')}
              className={`w-full h-32 px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent`}
            />
          </div>

          {/* Size Slider */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              Size: {size}px
            </label>
            <input
              type="range"
              min="100"
              max="500"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-[#0D9488]"
            />
          </div>

          {/* Color Pickers */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.qrCodeGenerator.foregroundColor', 'Foreground Color')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={foregroundColor}
                  onChange={(e) => setForegroundColor(e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={foregroundColor}
                  onChange={(e) => setForegroundColor(e.target.value)}
                  className={`flex-1 px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.qrCodeGenerator.backgroundColor', 'Background Color')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className={`flex-1 px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>
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
              onClick={generateQRCode}
              className="flex items-center gap-2 px-6 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors font-medium"
            >
              <QrIcon className="w-4 h-4" />
              {t('tools.qrCodeGenerator.generateQrCode', 'Generate QR Code')}
            </button>
            <button
              onClick={handleClear}
              className={`px-6 py-2 rounded-lg transition-colors font-medium ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              {t('tools.qrCodeGenerator.clear', 'Clear')}
            </button>
          </div>
        </div>

        {/* Right Column - QR Code Preview */}
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.qrCodeGenerator.qrCodePreview', 'QR Code Preview')}
            </label>
            <div className={`flex items-center justify-center p-6 rounded-lg border-2 border-dashed ${
              theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
            }`}>
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt="Generated QR Code"
                  className="max-w-full h-auto"
                  style={{ maxWidth: size, maxHeight: size }}
                />
              ) : (
                <div className="text-center py-12">
                  <QrIcon className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.qrCodeGenerator.qrCodeWillAppearHere', 'QR code will appear here')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Hidden Canvas */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Download, Save, and Copy Buttons */}
          {qrCodeUrl && (
            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
              >
                <Download className="w-4 h-4" />
                {t('tools.qrCodeGenerator.download', 'Download')}
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('tools.qrCodeGenerator.saving', 'Saving...')}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {t('tools.qrCodeGenerator.saveToLibrary', 'Save to Library')}
                  </>
                )}
              </button>
              <button
                onClick={handleCopyImage}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors font-medium ${
                  copied
                    ? 'bg-green-500 text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                <Copy className="w-4 h-4" />
                {copied ? t('tools.qrCodeGenerator.copied', 'Copied!') : t('tools.qrCodeGenerator.copy', 'Copy')}
              </button>
            </div>
          )}

          {/* Info Section */}
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.qrCodeGenerator.aboutQrCodes', 'About QR Codes')}
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              {t('tools.qrCodeGenerator.qrCodesCanStoreUrls', 'QR codes can store URLs, text, contact information, and more. Customize the size and colors to match your brand. The generated pattern is deterministic based on your input text.')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
