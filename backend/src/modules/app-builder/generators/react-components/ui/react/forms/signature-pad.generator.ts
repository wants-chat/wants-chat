import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateSignaturePad = (
  resolved: ResolvedComponent,
  variant: 'canvas' | 'typed' | 'uploaded' = 'canvas'
) => {
  const dataSource = resolved.dataSource;

  const getField = (fieldName: string): string => {
    const mapping = resolved.fieldMappings.find(m => m.targetField === fieldName);
    if (mapping?.sourceField) {
      return `propData?.${mapping.sourceField}`;
    }
    // Return undefined/empty for missing data - let component handle gracefully
    // For ID fields
    if (fieldName === 'id' || fieldName.endsWith('Id')) {
      return `propData?.id || ${dataName}?._id`;
    }
    // For array fields
    if (fieldName.match(/items|steps|updates|timeline|list|array|images|products|users|orders|features|links|stats|statistics|metrics|categories|tags|members|avatars|methods|examples|reviews|comments|notifications|messages|events|courses|lessons|modules|posts|articles|videos|photos|data|results|activities|cards|testimonials|faqs|questions|answers|options|choices|variants|attributes|filters|transactions|invoices|payments|receipts|shipments|deliveries/i)) {
      return `propData?.${fieldName} || ([] as any[])`;
    }
    // For object fields
    if (fieldName.match(/address|metadata|config|settings|tracking|gallery/i)) {
      return `propData?.${fieldName} || ({} as any)`;
    }
    // For scalar values - return empty string as fallback
    return `propData?.${fieldName} || ''`;
  };

  // Parse data source for clean prop naming (sanitize to camelCase)
  const sanitizeVariableName = (name: string): string => {
    // Replace dots and underscores with camelCase
    return name
      .split(/[._]/)
      .map((part, index) => {
        if (index === 0) {
          return part;
        }
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join('');
  };

  const getDataPath = () => {
    if (!dataSource || dataSource.trim() === '') return 'data';
    const parts = dataSource.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart ? sanitizeVariableName(lastPart) : 'data';
  };

  const dataName = getDataPath();

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'data'}`;
  };

  const apiRoute = getApiRoute();

  const commonImports = `
import React, { useRef, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Pen, Undo, Redo, RotateCcw, Download, Save, Type, Upload, Check, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';`;

  const variants = {
    canvas: `
${commonImports}

interface SignaturePadCanvasProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onSave?: (signature: string) => void;
}

const SignaturePadCanvas: React.FC<SignaturePadCanvasProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className, onSave }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#000000');
  const [penWidth, setPenWidth] = useState(2);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [isSaved, setIsSaved] = useState(false);

  // Fetch data using useQuery
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: () => api.get<any>(\`${apiRoute}\`),
    enabled: !propData,
  });

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const signatureData = propData || fetchedData || {};

  const signatureLabel = ${getField('signatureLabel')};
  const signatureDescription = ${getField('signatureDescription')};
  const clearButtonText = ${getField('clearButtonText')};
  const undoButtonText = ${getField('undoButtonText')};
  const redoButtonText = ${getField('redoButtonText')};
  const saveButtonText = ${getField('saveButtonText')};
  const downloadButtonText = ${getField('downloadButtonText')};
  const penColors = ${getField('penColors')};
  const penWidths = ${getField('penWidths')};
  const savedMessage = ${getField('savedMessage')};

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

    // Set initial background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save initial state
    saveToHistory();
  }, []);

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(imageData);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
      setIsSaved(false);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
    setIsSaved(false);
  };

  const undo = () => {
    if (historyStep > 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const newStep = historyStep - 1;
      ctx.putImageData(history[newStep], 0, 0);
      setHistoryStep(newStep);
      setIsSaved(false);
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const newStep = historyStep + 1;
      ctx.putImageData(history[newStep], 0, 0);
      setHistoryStep(newStep);
      setIsSaved(false);
    }
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    onSave?.(dataUrl);
    setIsSaved(true);

    setTimeout(() => setIsSaved(false), 3000);
  };

  const downloadSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'signature.png';
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className={cn("max-w-3xl mx-auto p-6", className)}>
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {signatureLabel}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {signatureDescription}
        </p>
      </div>

      {/* Canvas */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-300 dark:border-gray-600 overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-64 cursor-crosshair touch-none"
        />
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Pen Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Pen Color
          </label>
          <div className="flex gap-2">
            {penColors.map((color: any) => (
              <button
                key={color.value}
                onClick={() => setPenColor(color.value)}
                className={\`w-10 h-10 rounded-lg border-2 transition-all \${
                  penColor === color.value
                    ? 'border-blue-500 scale-110'
                    : 'border-gray-300 dark:border-gray-600'
                }\`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Pen Width */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Pen Width
          </label>
          <div className="flex gap-2">
            {penWidths.map((width: any) => (
              <button
                key={width.value}
                onClick={() => setPenWidth(width.value)}
                className={\`px-4 py-2 rounded-lg border-2 transition-all \${
                  penWidth === width.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                }\`}
              >
                {width.name}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={undo}
            disabled={historyStep <= 0}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center gap-2"
          >
            <Undo className="h-4 w-4" />
            {undoButtonText}
          </button>

          <button
            onClick={redo}
            disabled={historyStep >= history.length - 1}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center gap-2"
          >
            <Redo className="h-4 w-4" />
            {redoButtonText}
          </button>

          <button
            onClick={clearCanvas}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            {clearButtonText}
          </button>

          <button
            onClick={downloadSignature}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {downloadButtonText}
          </button>

          <button
            onClick={saveSignature}
            className="ml-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
          >
            {isSaved ? (
              <>
                <Check className="h-4 w-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {saveButtonText}
              </>
            )}
          </button>
        </div>
      </div>

      {isSaved && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 text-center">
          {savedMessage}
        </div>
      )}
    </div>
  );
};

export default SignaturePadCanvas;
    `,

    typed: `
${commonImports}

interface SignaturePadTypedProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onSave?: (signature: string) => void;
}

const SignaturePadTyped: React.FC<SignaturePadTypedProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className, onSave }) => {
  const [signatureText, setSignatureText] = useState('');
  const [selectedFont, setSelectedFont] = useState('Dancing Script');
  const [fontSize, setFontSize] = useState(48);
  const [textColor, setTextColor] = useState('#000000');
  const [isSaved, setIsSaved] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fetch data using useQuery
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: () => api.get<any>(\`${apiRoute}\`),
    enabled: !propData,
  });

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const signatureData = propData || fetchedData || {};

  const signatureLabel = ${getField('signatureLabel')};
  const typedSignaturePlaceholder = ${getField('typedSignaturePlaceholder')};
  const fontLabel = ${getField('fontLabel')};
  const saveButtonText = ${getField('saveButtonText')};
  const downloadButtonText = ${getField('downloadButtonText')};
  const clearButtonText = ${getField('clearButtonText')};
  const fonts = ${getField('fonts')};
  const penColors = ${getField('penColors')};
  const savedMessage = ${getField('savedMessage')};

  useEffect(() => {
    renderSignature();
  }, [signatureText, selectedFont, fontSize, textColor]);

  const renderSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!signatureText) return;

    // Draw signature
    ctx.font = \`\${fontSize}px '\${selectedFont}', cursive\`;
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(signatureText, canvas.width / 2, canvas.height / 2);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !signatureText) return;

    const dataUrl = canvas.toDataURL('image/png');
    onSave?.(dataUrl);
    setIsSaved(true);

    setTimeout(() => setIsSaved(false), 3000);
  };

  const downloadSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !signatureText) return;

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'signature.png';
    link.href = dataUrl;
    link.click();
  };

  const clearSignature = () => {
    setSignatureText('');
    setIsSaved(false);
  };

  return (
    <div className={cn("max-w-3xl mx-auto p-6", className)}>
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {signatureLabel}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Type your name to create a signature
        </p>
      </div>

      {/* Text Input */}
      <div className="mb-6">
        <input
          type="text"
          value={signatureText}
          onChange={(e) => setSignatureText(e.target.value)}
          placeholder={typedSignaturePlaceholder}
          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
        />
      </div>

      {/* Preview Canvas */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-300 dark:border-gray-600 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={800}
          height={300}
          className="w-full h-48"
        />
      </div>

      {/* Font Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {fontLabel}
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {fonts.map((font: string) => (
            <button
              key={font}
              onClick={() => setSelectedFont(font)}
              className={\`px-4 py-3 border-2 rounded-lg transition-all \${
                selectedFont === font
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }\`}
              style={{ fontFamily: \`'\${font}', cursive\` }}
            >
              {font}
            </button>
          ))}
        </div>
      </div>

      {/* Color Picker */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Color
        </label>
        <div className="flex gap-2">
          {penColors.map((color: any) => (
            <button
              key={color.value}
              onClick={() => setTextColor(color.value)}
              className={\`w-10 h-10 rounded-lg border-2 transition-all \${
                textColor === color.value
                  ? 'border-blue-500 scale-110'
                  : 'border-gray-300 dark:border-gray-600'
              }\`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Font Size Slider */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Font Size: {fontSize}px
        </label>
        <input
          type="range"
          min="24"
          max="96"
          value={fontSize}
          onChange={(e) => setFontSize(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={clearSignature}
          disabled={!signatureText}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          {clearButtonText}
        </button>

        <button
          onClick={downloadSignature}
          disabled={!signatureText}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          {downloadButtonText}
        </button>

        <button
          onClick={saveSignature}
          disabled={!signatureText}
          className="ml-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-semibold rounded-lg transition-colors disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSaved ? (
            <>
              <Check className="h-4 w-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {saveButtonText}
            </>
          )}
        </button>
      </div>

      {isSaved && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 text-center">
          {savedMessage}
        </div>
      )}

      {/* Load Google Fonts */}
      <link
        href={\`https://fonts.googleapis.com/css2?family=\${fonts.map((f: string) => f.replace(' ', '+')).join('&family=')}&display=swap\`}
        rel="stylesheet"
      />
    </div>
  );
};

export default SignaturePadTyped;
    `,

    uploaded: `
${commonImports}

interface SignaturePadUploadedProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onSave?: (signature: string) => void;
}

const SignaturePadUploaded: React.FC<SignaturePadUploadedProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className, onSave }) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch data using useQuery
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: () => api.get<any>(\`${apiRoute}\`),
    enabled: !propData,
  });

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const signatureData = propData || fetchedData || {};

  const signatureLabel = ${getField('signatureLabel')};
  const uploadButtonText = ${getField('uploadButtonText')};
  const saveButtonText = ${getField('saveButtonText')};
  const downloadButtonText = ${getField('downloadButtonText')};
  const clearButtonText = ${getField('clearButtonText')};
  const savedMessage = ${getField('savedMessage')};
  const emptySignatureError = ${getField('emptySignatureError')};
  const acceptedFormats = ${getField('acceptedFormats')};
  const maxFileSize = ${getField('maxFileSize')};

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setIsSaved(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const saveSignature = () => {
    if (!uploadedImage) return;

    onSave?.(uploadedImage);
    setIsSaved(true);

    setTimeout(() => setIsSaved(false), 3000);
  };

  const downloadSignature = () => {
    if (!uploadedImage) return;

    const link = document.createElement('a');
    link.download = 'signature.png';
    link.href = uploadedImage;
    link.click();
  };

  const clearSignature = () => {
    setUploadedImage(null);
    setIsSaved(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn("max-w-3xl mx-auto p-6", className)}>
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {signatureLabel}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Upload an image of your signature
        </p>
      </div>

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={\`mb-6 border-2 border-dashed rounded-xl transition-all \${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
        }\`}
      >
        {uploadedImage ? (
          <div className="relative p-6">
            <img
              src={uploadedImage}
              alt="Signature"
              className="max-w-full h-48 mx-auto object-contain"
            />
            <button
              onClick={clearSignature}
              className="absolute top-4 right-4 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Upload className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Drop your signature image here
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              or click to browse
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedFormats}
              onChange={handleFileInput}
              className="hidden"
              id="signature-upload"
            />
            <label
              htmlFor="signature-upload"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg cursor-pointer transition-colors"
            >
              <Upload className="h-5 w-5" />
              {uploadButtonText}
            </label>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Supported formats: PNG, JPG, JPEG (max {maxFileSize})
            </p>
          </div>
        )}
      </div>

      {/* Preview and Info */}
      {uploadedImage && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
              <Check className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Signature Uploaded
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Your signature image has been uploaded successfully. You can now save or download it.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={clearSignature}
          disabled={!uploadedImage}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          {clearButtonText}
        </button>

        <button
          onClick={downloadSignature}
          disabled={!uploadedImage}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          {downloadButtonText}
        </button>

        <button
          onClick={saveSignature}
          disabled={!uploadedImage}
          className="ml-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-semibold rounded-lg transition-colors disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSaved ? (
            <>
              <Check className="h-4 w-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {saveButtonText}
            </>
          )}
        </button>
      </div>

      {isSaved && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 text-center">
          {savedMessage}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
          Tips for best results:
        </h4>
        <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
          <li>• Use a white background for your signature</li>
          <li>• Sign with a dark pen or marker</li>
          <li>• Take a clear, well-lit photo</li>
          <li>• Crop the image to remove extra space</li>
        </ul>
      </div>
    </div>
  );
};

export default SignaturePadUploaded;
    `
  };

  return variants[variant] || variants.canvas;
};
