import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PenTool, Download, RotateCcw, Palette, Minus, Plus, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface SignatureGeneratorToolProps {
  uiConfig?: UIConfig;
}

export const SignatureGeneratorTool: React.FC<SignatureGeneratorToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(3);
  const [hasSignature, setHasSignature] = useState(false);

  const colors = [
    { value: '#000000', label: 'Black' },
    { value: '#1E40AF', label: 'Blue' },
    { value: '#DC2626', label: 'Red' },
    { value: '#059669', label: 'Green' },
    { value: '#7C3AED', label: 'Purple' },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    // Set initial styles
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;

    // Fill with white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const downloadSignature = (format: 'png' | 'jpg') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    if (format === 'png') {
      link.download = 'signature.png';
      link.href = canvas.toDataURL('image/png');
    } else {
      link.download = 'signature.jpg';
      link.href = canvas.toDataURL('image/jpeg', 0.9);
    }
    link.click();
  };

  const downloadTransparent = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a temporary canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // Get original canvas data
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Make white pixels transparent
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] > 240 && data[i + 1] > 240 && data[i + 2] > 240) {
        data[i + 3] = 0; // Set alpha to 0
      }
    }

    tempCtx.putImageData(imageData, 0, 0);

    const link = document.createElement('a');
    link.download = 'signature-transparent.png';
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-amber-900/20' : 'bg-gradient-to-r from-white to-amber-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <PenTool className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.signatureGenerator.signatureGenerator', 'Signature Generator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.signatureGenerator.createYourDigitalSignature', 'Create your digital signature')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Controls */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Color Selection */}
            <div className="flex items-center gap-3">
              <Palette className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <div className="flex gap-2">
                {colors.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setColor(c.value)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                      color === c.value ? 'border-amber-500 scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c.value }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            {/* Line Width */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setLineWidth(Math.max(1, lineWidth - 1))}
                className={`p-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className={`text-sm font-medium min-w-[60px] text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {lineWidth}px
              </span>
              <button
                onClick={() => setLineWidth(Math.min(10, lineWidth + 1))}
                className={`p-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Clear Button */}
            <button
              onClick={clearCanvas}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              {t('tools.signatureGenerator.clear', 'Clear')}
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-64 border-2 border-dashed rounded-xl cursor-crosshair touch-none"
            style={{
              borderColor: isDark ? '#374151' : '#E5E7EB',
              backgroundColor: '#FFFFFF',
            }}
          />
          {!hasSignature && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-gray-400 text-lg">{t('tools.signatureGenerator.drawYourSignatureHere', 'Draw your signature here')}</p>
            </div>
          )}
        </div>

        {/* Download Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => downloadSignature('png')}
            disabled={!hasSignature}
            className="px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            {t('tools.signatureGenerator.downloadPng', 'Download PNG')}
          </button>
          <button
            onClick={() => downloadSignature('jpg')}
            disabled={!hasSignature}
            className={`px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors ${
              isDark
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Download className="w-4 h-4" />
            {t('tools.signatureGenerator.downloadJpg', 'Download JPG')}
          </button>
          <button
            onClick={downloadTransparent}
            disabled={!hasSignature}
            className={`px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors ${
              isDark
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Download className="w-4 h-4" />
            {t('tools.signatureGenerator.transparent', 'Transparent')}
          </button>
        </div>

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.signatureGenerator.tips', 'Tips:')}</strong> Draw your signature using your mouse or touchscreen.
            Use a stylus on tablets for best results. The transparent PNG option removes
            the white background, perfect for overlaying on documents.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignatureGeneratorTool;
