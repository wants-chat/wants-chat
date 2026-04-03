import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateQRCodeGenerator = (
  resolved: ResolvedComponent,
  variant: 'simple' | 'advanced' | 'branded' = 'simple'
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
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';`;

  const variants = {
    simple: `
${commonImports}
import { QrCode, Download, Copy, Check, Loader2 } from 'lucide-react';

interface QRCodeGeneratorProps {
  ${dataName}?: any;
  className?: string;
  onGenerate?: (data: string) => void;
  onDownload?: (data: string) => void;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ ${dataName}: propData, className, onGenerate, onDownload }) => {
  const [inputValue, setInputValue] = useState('');
  const [qrGenerated, setQrGenerated] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const qrData = ${dataName} || {};

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const badgeText = ${getField('badgeText')};
  const inputPlaceholder = ${getField('inputPlaceholder')};
  const defaultInputValue = ${getField('defaultInputValue')};
  const generateButton = ${getField('generateButton')};
  const downloadButton = ${getField('downloadButton')};
  const copyButton = ${getField('copyButton')};
  const generatedMessage = ${getField('generatedMessage')};
  const copiedMessage = ${getField('copiedMessage')};

  useEffect(() => {
    setInputValue(defaultInputValue);
  }, []);

  const handleGenerate = () => {
    if (inputValue.trim()) {
      setQrGenerated(true);
      if (onGenerate) {
        onGenerate(inputValue);
      }
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload(inputValue);
    } else {
      console.log('Download QR code for:', inputValue);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inputValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("max-w-2xl mx-auto space-y-6", className)}>
      <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-md">
                  <QrCode className="h-5 w-5 text-white" />
                </div>
                <span className="bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent dark:from-white dark:to-blue-400">{title}</span>
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{subtitle}</p>
            </div>
            <Badge variant="secondary" className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 font-semibold">{badgeText}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="qr-input" className="font-semibold">Enter Text or URL</Label>
            <div className="flex gap-2">
              <Input
                id="qr-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={inputPlaceholder}
                className="flex-1 border-2 transition-all duration-300 focus:border-blue-400 dark:focus:border-purple-500"
              />
              <Button onClick={handleCopy} variant="outline" size="icon" className="border-2 transition-all duration-300 hover:scale-110">
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Button onClick={handleGenerate} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-bold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
            <QrCode className="h-4 w-4 mr-2" />
            {generateButton}
          </Button>

          {qrGenerated && (
            <div className="space-y-4 animate-in fade-in duration-500">
              <div className="flex items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                <div className="w-64 h-64 bg-white p-6 rounded-xl shadow-2xl flex items-center justify-center border-2 border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <QrCode className="h-48 w-48 text-gray-900 mx-auto" />
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="p-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-sm font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{generatedMessage}</p>
                </div>
                <Button onClick={handleDownload} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-bold shadow-md hover:shadow-lg transition-all duration-300">
                  <Download className="h-4 w-4 mr-2" />
                  {downloadButton}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QRCodeGenerator;
    `,

    advanced: `
${commonImports}
import { QrCode, Download, RefreshCw, Palette, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface QRCodeGeneratorProps {
  ${dataName}?: any;
  className?: string;
  onGenerate?: (config: any) => void;
  onDownload?: (config: any) => void;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ ${dataName}: propData, className, onGenerate, onDownload }) => {
  const [inputValue, setInputValue] = useState('');
  const [size, setSize] = useState(256);
  const [errorLevel, setErrorLevel] = useState('M');
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [qrGenerated, setQrGenerated] = useState(false);

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const qrData = ${dataName} || {};

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const badgeText = ${getField('badgeText')};
  const inputPlaceholder = ${getField('inputPlaceholder')};
  const defaultInputValue = ${getField('defaultInputValue')};
  const sizeLabel = ${getField('sizeLabel')};
  const sizes = ${getField('sizes')};
  const errorCorrectionLabel = ${getField('errorCorrectionLabel')};
  const errorLevels = ${getField('errorLevels')};
  const foregroundColorLabel = ${getField('foregroundColorLabel')};
  const backgroundColorLabel = ${getField('backgroundColorLabel')};
  const generateButton = ${getField('generateButton')};
  const downloadButton = ${getField('downloadButton')};
  const resetButton = ${getField('resetButton')};

  useEffect(() => {
    setInputValue(defaultInputValue);
  }, []);

  const handleGenerate = () => {
    if (inputValue.trim()) {
      const config = { data: inputValue, size, errorLevel, fgColor, bgColor };
      setQrGenerated(true);
      if (onGenerate) {
        onGenerate(config);
      }
    }
  };

  const handleDownload = () => {
    const config = { data: inputValue, size, errorLevel, fgColor, bgColor };
    if (onDownload) {
      onDownload(config);
    } else {
      console.log('Download QR code with config:', config);
    }
  };

  const handleReset = () => {
    setInputValue(defaultInputValue);
    setSize(256);
    setErrorLevel('M');
    setFgColor('#000000');
    setBgColor('#FFFFFF');
    setQrGenerated(false);
  };

  return (
    <div className={cn("max-w-4xl mx-auto space-y-6", className)}>
      <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg shadow-md">
                  <QrCode className="h-5 w-5 text-white" />
                </div>
                <span className="bg-gradient-to-r from-gray-900 to-purple-600 bg-clip-text text-transparent dark:from-white dark:to-purple-400">{title}</span>
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{subtitle}</p>
            </div>
            <Badge variant="secondary" className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 font-semibold flex items-center gap-1"><Sparkles className="w-3 h-3" />{badgeText}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="qr-input">Enter Text or URL</Label>
                <Input
                  id="qr-input"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={inputPlaceholder}
                />
              </div>

              <div className="space-y-2">
                <Label>{sizeLabel}</Label>
                <Select value={String(size)} onValueChange={(val) => setSize(Number(val))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sizes.map((s: any) => (
                      <SelectItem key={s.value} value={String(s.value)}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{errorCorrectionLabel}</Label>
                <Select value={errorLevel} onValueChange={setErrorLevel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {errorLevels.map((level: any) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label} - {level.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fg-color">{foregroundColorLabel}</Label>
                  <div className="flex gap-2">
                    <Input
                      id="fg-color"
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bg-color">{backgroundColorLabel}</Label>
                  <div className="flex gap-2">
                    <Input
                      id="bg-color"
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleGenerate} className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 font-bold shadow-md hover:shadow-lg transition-all duration-300">
                  <QrCode className="h-4 w-4 mr-2" />
                  {generateButton}
                </Button>
                <Button onClick={handleReset} variant="outline" className="border-2 transition-all duration-300 hover:scale-110">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {qrGenerated && (
                <div className="space-y-4 animate-in fade-in duration-500">
                  <div className="flex items-center justify-center p-8 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-800">
                    <div
                      className="p-6 rounded-xl shadow-2xl border-2 border-gray-200 dark:border-gray-700"
                      style={{ backgroundColor: bgColor }}
                    >
                      <QrCode
                        className="mx-auto"
                        style={{
                          width: size,
                          height: size,
                          color: fgColor
                        }}
                      />
                    </div>
                  </div>

                  <Button onClick={handleDownload} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 font-bold shadow-md hover:shadow-lg transition-all duration-300">
                    <Download className="h-4 w-4 mr-2" />
                    {downloadButton}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRCodeGenerator;
    `,

    branded: `
${commonImports}
import { QrCode, Download, Upload, Palette, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface QRCodeGeneratorProps {
  ${dataName}?: any;
  className?: string;
  onGenerate?: (config: any) => void;
  onDownload?: (config: any) => void;
  onLogoUpload?: (file: File) => void;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ ${dataName}: propData, className, onGenerate, onDownload, onLogoUpload }) => {
  const [inputValue, setInputValue] = useState('');
  const [size, setSize] = useState(512);
  const [errorLevel, setErrorLevel] = useState('H');
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [logoSize, setLogoSize] = useState(0.2);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [qrGenerated, setQrGenerated] = useState(false);

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const qrData = ${dataName} || {};

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const badgeText = ${getField('badgeText')};
  const inputPlaceholder = ${getField('inputPlaceholder')};
  const defaultInputValue = ${getField('defaultInputValue')};
  const sizeLabel = ${getField('sizeLabel')};
  const sizes = ${getField('sizes')};
  const errorCorrectionLabel = ${getField('errorCorrectionLabel')};
  const errorLevels = ${getField('errorLevels')};
  const logoLabel = ${getField('logoLabel')};
  const logoPlaceholder = ${getField('logoPlaceholder')};
  const logoSizeLabel = ${getField('logoSizeLabel')};
  const logoSizes = ${getField('logoSizes')};
  const generateButton = ${getField('generateButton')};
  const downloadButton = ${getField('downloadButton')};
  const presets = ${getField('presets')};

  useEffect(() => {
    setInputValue(defaultInputValue);
  }, []);

  const handleGenerate = () => {
    if (inputValue.trim()) {
      const config = { data: inputValue, size, errorLevel, fgColor, bgColor, logo: logoPreview, logoSize };
      setQrGenerated(true);
      if (onGenerate) {
        onGenerate(config);
      }
    }
  };

  const handleDownload = () => {
    const config = { data: inputValue, size, errorLevel, fgColor, bgColor, logo: logoPreview, logoSize };
    if (onDownload) {
      onDownload(config);
    } else {
      console.log('Download branded QR code with config:', config);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      if (onLogoUpload) {
        onLogoUpload(file);
      }
    }
  };

  const applyPreset = (preset: any) => {
    setFgColor(preset.fg);
    setBgColor(preset.bg);
  };

  return (
    <div className={cn("max-w-5xl mx-auto space-y-6", className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-indigo-600" />
                {title}
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{subtitle}</p>
            </div>
            <Badge variant="secondary" className="bg-indigo-100 text-indigo-600">{badgeText}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Tabs defaultValue="content">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="style">Style</TabsTrigger>
                  <TabsTrigger value="logo">Logo</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="qr-input">Enter Text or URL</Label>
                    <Input
                      id="qr-input"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={inputPlaceholder}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{sizeLabel}</Label>
                      <Select value={String(size)} onValueChange={(val) => setSize(Number(val))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {sizes.map((s: any) => (
                            <SelectItem key={s.value} value={String(s.value)}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>{errorCorrectionLabel}</Label>
                      <Select value={errorLevel} onValueChange={setErrorLevel}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {errorLevels.map((level: any) => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="style" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Color Presets</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {presets.map((preset: any) => (
                        <button
                          key={preset.name}
                          onClick={() => applyPreset(preset)}
                          className="p-3 rounded-lg border-2 border-gray-200 hover:border-indigo-500 transition-colors"
                          style={{ backgroundColor: preset.bg }}
                        >
                          <div className="w-full h-12 rounded flex items-center justify-center" style={{ backgroundColor: preset.fg }}>
                            <Palette className="h-6 w-6" style={{ color: preset.bg }} />
                          </div>
                          <p className="text-xs mt-1 font-medium">{preset.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fg-color-branded">Foreground Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="fg-color-branded"
                          type="color"
                          value={fgColor}
                          onChange={(e) => setFgColor(e.target.value)}
                          className="w-16 h-10"
                        />
                        <Input value={fgColor} readOnly className="flex-1" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bg-color-branded">Background Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="bg-color-branded"
                          type="color"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="w-16 h-10"
                        />
                        <Input value={bgColor} readOnly className="flex-1" />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="logo" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="logo-upload">{logoLabel}</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      {logoPreview ? (
                        <div className="space-y-4">
                          <img src={logoPreview} alt="Logo preview" className="w-24 h-24 mx-auto object-contain" />
                          <Button variant="outline" onClick={() => setLogoPreview(null)}>Remove Logo</Button>
                        </div>
                      ) : (
                        <div>
                          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-sm text-gray-600 mb-4">{logoPlaceholder}</p>
                          <Input
                            id="logo-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="max-w-xs mx-auto"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {logoPreview && (
                    <div className="space-y-2">
                      <Label>{logoSizeLabel}</Label>
                      <Select value={String(logoSize)} onValueChange={(val) => setLogoSize(Number(val))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {logoSizes.map((s: any) => (
                            <SelectItem key={s.value} value={String(s.value)}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <Button onClick={handleGenerate} className="w-full bg-indigo-600 hover:bg-indigo-700">
                <QrCode className="h-4 w-4 mr-2" />
                {generateButton}
              </Button>
            </div>

            <div className="space-y-4">
              <div className="sticky top-6">
                <div className="flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg min-h-[400px]">
                  {qrGenerated ? (
                    <div className="relative p-6 rounded-lg shadow-xl" style={{ backgroundColor: bgColor }}>
                      <QrCode
                        className="mx-auto"
                        style={{
                          width: Math.min(size, 300),
                          height: Math.min(size, 300),
                          color: fgColor
                        }}
                      />
                      {logoPreview && (
                        <img
                          src={logoPreview}
                          alt="Logo"
                          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-1 rounded"
                          style={{
                            width: \`\${Math.min(size, 300) * logoSize}px\`,
                            height: \`\${Math.min(size, 300) * logoSize}px\`
                          }}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-gray-400">
                      <QrCode className="h-24 w-24 mx-auto mb-4" />
                      <p className="text-sm">Preview will appear here</p>
                    </div>
                  )}
                </div>

                {qrGenerated && (
                  <Button onClick={handleDownload} className="w-full mt-4" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    {downloadButton}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRCodeGenerator;
    `
  };

  return variants[variant] || variants.simple;
};
