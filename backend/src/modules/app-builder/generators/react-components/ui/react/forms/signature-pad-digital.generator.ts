import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateSignaturePad = (
  resolved: ResolvedComponent,
  variant: 'canvas' | 'typed' | 'upload' = 'canvas'
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
import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, Loader2 } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';`;

  const variants = {
    canvas: `
${commonImports}
import { PenTool, Eraser, Undo, Redo, Download, Save, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { Label } from '@/components/ui/label';

interface SignaturePadProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onSave?: (signature: string) => void;
  onClear?: () => void;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className, onSave, onClear }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [thickness, setThickness] = useState(2);
  const [saved, setSaved] = useState(false);

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

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const badgeText = ${getField('badgeText')};
  const signHereLabel = ${getField('signHereLabel')};
  const drawYourSignatureLabel = ${getField('drawYourSignatureLabel')};
  const clearButton = ${getField('clearButton')};
  const saveButton = ${getField('saveButton')};
  const downloadButton = ${getField('downloadButton')};
  const colorLabel = ${getField('colorLabel')};
  const colors = ${getField('colors')};
  const thicknessLabel = ${getField('thicknessLabel')};
  const thicknesses = ${getField('thicknesses')};
  const savedMessage = ${getField('savedMessage')};

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      setIsDrawing(true);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = color;
      ctx.lineWidth = thickness;
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setSaved(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setSaved(false);
    if (onClear) {
      onClear();
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      setSaved(true);
      if (onSave) {
        onSave(dataUrl);
      }
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'signature.png';
      link.href = dataUrl;
      link.click();
    }
  };

  return (
    <div className={cn("max-w-3xl mx-auto space-y-6", className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <PenTool className="h-5 w-5 text-blue-600" />
                {title}
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{subtitle}</p>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-600">{badgeText}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-1 space-y-4">
              <div className="space-y-2">
                <Label>{colorLabel}</Label>
                <div className="grid grid-cols-2 gap-2">
                  {colors.map((c: any) => (
                    <button
                      key={c.value}
                      onClick={() => setColor(c.value)}
                      className={cn(
                        "h-10 rounded border-2 transition-all",
                        color === c.value ? "border-blue-500 scale-110" : "border-gray-300"
                      )}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>{thicknessLabel}</Label>
                <div className="space-y-2">
                  {thicknesses.map((t: any) => (
                    <button
                      key={t.value}
                      onClick={() => setThickness(t.value)}
                      className={cn(
                        "w-full p-2 rounded border text-sm transition-all",
                        thickness === t.value
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-300 hover:bg-gray-50"
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="md:col-span-3 space-y-4">
              <div className="space-y-2">
                <Label>{signHereLabel}</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 bg-white dark:bg-gray-900">
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={300}
                    className="w-full cursor-crosshair bg-white"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                </div>
                <p className="text-xs text-gray-500 text-center">{drawYourSignatureLabel}</p>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleClear} variant="outline" className="flex-1">
                  <Eraser className="h-4 w-4 mr-2" />
                  {clearButton}
                </Button>
                <Button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  {saved ? <Check className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  {saved ? savedMessage : saveButton}
                </Button>
                <Button onClick={handleDownload} variant="outline">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignaturePad;
    `,

    typed: `
${commonImports}
import { Type, Save, Download, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SignaturePadProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onSave?: (signature: string, text: string, font: string) => void;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className, onSave }) => {
  const [signatureText, setSignatureText] = useState('');
  const [font, setFont] = useState('Brush Script MT, cursive');
  const [color, setColor] = useState('#000000');
  const [saved, setSaved] = useState(false);
  const signatureRef = useRef<HTMLDivElement>(null);

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

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const badgeText = ${getField('badgeText')};
  const typeSignatureLabel = ${getField('typeSignatureLabel')};
  const typePlaceholder = ${getField('typePlaceholder')};
  const fontLabel = ${getField('fontLabel')};
  const fonts = ${getField('fonts')};
  const colorLabel = ${getField('colorLabel')};
  const colors = ${getField('colors')};
  const saveButton = ${getField('saveButton')};
  const downloadButton = ${getField('downloadButton')};
  const savedMessage = ${getField('savedMessage')};

  const handleSave = () => {
    if (signatureText.trim()) {
      setSaved(true);
      if (onSave) {
        onSave(signatureText, signatureText, font);
      }
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleDownload = () => {
    // Create a canvas with the signature
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = \`60px \${font}\`;
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(signatureText, canvas.width / 2, canvas.height / 2);

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'signature.png';
      link.href = dataUrl;
      link.click();
    }
  };

  return (
    <div className={cn("max-w-3xl mx-auto space-y-6", className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5 text-purple-600" />
                {title}
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{subtitle}</p>
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-600">{badgeText}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signature-text">{typeSignatureLabel}</Label>
              <Input
                id="signature-text"
                value={signatureText}
                onChange={(e) => setSignatureText(e.target.value)}
                placeholder={typePlaceholder}
                className="text-lg"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{fontLabel}</Label>
                <Select value={font} onValueChange={setFont}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fonts.map((f: any) => (
                      <SelectItem key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{colorLabel}</Label>
                <div className="grid grid-cols-4 gap-2">
                  {colors.map((c: any) => (
                    <button
                      key={c.value}
                      onClick={() => setColor(c.value)}
                      className={cn(
                        "h-10 rounded border-2 transition-all",
                        color === c.value ? "border-purple-500 scale-110" : "border-gray-300"
                      )}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-white dark:bg-gray-900 min-h-[200px] flex items-center justify-center">
            {signatureText ? (
              <div
                ref={signatureRef}
                className="text-center"
                style={{
                  fontFamily: font,
                  fontSize: '60px',
                  color: color
                }}
              >
                {signatureText}
              </div>
            ) : (
              <p className="text-gray-400">Preview will appear here</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={!signatureText.trim()}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {saved ? <Check className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              {saved ? savedMessage : saveButton}
            </Button>
            <Button onClick={handleDownload} disabled={!signatureText.trim()} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              {downloadButton}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignaturePad;
    `,

    upload: `
${commonImports}
import { Upload, Save, Download, Check, X, FileImage } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SignaturePadProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onSave?: (signature: string, type: string) => void;
  onUpload?: (file: File) => void;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className, onSave, onUpload }) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
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

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const badgeText = ${getField('badgeText')};
  const uploadLabel = ${getField('uploadLabel')};
  const uploadPlaceholder = ${getField('uploadPlaceholder')};
  const selectImageButton = ${getField('selectImageButton')};
  const signHereLabel = ${getField('signHereLabel')};
  const clearButton = ${getField('clearButton')};
  const saveButton = ${getField('saveButton')};
  const downloadButton = ${getField('downloadButton')};
  const savedMessage = ${getField('savedMessage')};
  const applyButton = ${getField('applyButton')};

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);

      if (onUpload) {
        onUpload(file);
      }
    }
  };

  const handleRemove = () => {
    setUploadedImage(null);
    setSaved(false);
  };

  const handleSave = () => {
    if (uploadedImage) {
      setSaved(true);
      if (onSave) {
        onSave(uploadedImage, 'upload');
      }
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleDownload = () => {
    if (uploadedImage) {
      const link = document.createElement('a');
      link.download = 'signature.png';
      link.href = uploadedImage;
      link.click();
    }
  };

  // Canvas drawing handlers (same as canvas variant)
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      setIsDrawing(true);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleCanvasClear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const handleCanvasSave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      setSaved(true);
      if (onSave) {
        onSave(dataUrl, 'draw');
      }
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className={cn("max-w-3xl mx-auto space-y-6", className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-green-600" />
                {title}
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{subtitle}</p>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-600">{badgeText}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upload">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload Signature</TabsTrigger>
              <TabsTrigger value="draw">Draw Signature</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signature-upload">{uploadLabel}</Label>

                {!uploadedImage ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-green-500 transition-colors">
                    <FileImage className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-4">{uploadPlaceholder}</p>
                    <Input
                      id="signature-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="max-w-xs mx-auto"
                    />
                  </div>
                ) : (
                  <div className="relative border-2 border-gray-300 rounded-lg p-8 bg-white dark:bg-gray-900">
                    <img
                      src={uploadedImage}
                      alt="Signature"
                      className="max-w-full h-auto mx-auto"
                      style={{ maxHeight: '200px' }}
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={handleRemove}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {uploadedImage && (
                <div className="flex gap-2">
                  <Button onClick={handleSave} className="flex-1 bg-green-600 hover:bg-green-700">
                    {saved ? <Check className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    {saved ? savedMessage : saveButton}
                  </Button>
                  <Button onClick={handleDownload} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    {downloadButton}
                  </Button>
                  <Button onClick={handleRemove} variant="outline">
                    {selectImageButton}
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="draw" className="space-y-4">
              <div className="space-y-2">
                <Label>{signHereLabel}</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 bg-white dark:bg-gray-900">
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={200}
                    className="w-full cursor-crosshair bg-white"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCanvasClear} variant="outline" className="flex-1">
                  {clearButton}
                </Button>
                <Button onClick={handleCanvasSave} className="flex-1 bg-green-600 hover:bg-green-700">
                  <Save className="h-4 w-4 mr-2" />
                  {saveButton}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignaturePad;
    `
  };

  return variants[variant] || variants.canvas;
};
