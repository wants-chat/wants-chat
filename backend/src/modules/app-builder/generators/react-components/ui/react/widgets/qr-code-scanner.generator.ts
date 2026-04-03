import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateQRCodeScanner = (
  resolved: ResolvedComponent,
  variant: 'camera' | 'upload' | 'continuous' = 'camera'
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
import React, { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';`;

  const variants = {
    camera: `
${commonImports}
import { Camera, QrCode, Copy, Check, Flashlight, RefreshCw, Sparkles, Loader2 } from 'lucide-react';

interface QRCodeScannerProps {
  ${dataName}?: any;
  className?: string;
  onScan?: (data: string) => void;
  onError?: (error: string) => void;
  title?: string;
  showManualEntry?: boolean;
  showRecentCheckIns?: boolean;
  data?: any;
  onPostClick?: (item: any) => void;
  onReadMore?: (itemId: string | number, item: any) => void;
  onCategoryClick?: (category: string) => void;
  onAuthorClick?: (authorName: string) => void;
  onReadArticle?: (itemId: string | number, item: any) => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ ${dataName}: propData, className, onScan, onError }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [flashOn, setFlashOn] = useState(false);
  const [copied, setCopied] = useState(false);
  const videoRef = useRef<HTMLDivElement>(null);

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

  const scannerData = ${dataName} || {};

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const badgeText = ${getField('badgeText')};
  const startScanButton = ${getField('startScanButton')};
  const stopScanButton = ${getField('stopScanButton')};
  const toggleFlashButton = ${getField('toggleFlashButton')};
  const switchCameraButton = ${getField('switchCameraButton')};
  const scanResultLabel = ${getField('scanResultLabel')};
  const noResultMessage = ${getField('noResultMessage')};
  const scanSuccessMessage = ${getField('scanSuccessMessage')};
  const copyButton = ${getField('copyButton')};
  const cameraAccessMessage = ${getField('cameraAccessMessage')};
  const scanningMessage = ${getField('scanningMessage')};

  const handleStartScan = async () => {
    try {
      setIsScanning(true);
      // Simulate camera access
      setTimeout(() => {
        // Simulate successful scan after 2 seconds
        const mockData = 'https://fluxez.com';
        setScanResult(mockData);
        if (onScan) {
          onScan(mockData);
        }
      }, 2000);
    } catch (err) {
      setIsScanning(false);
      if (onError) {
        onError('Failed to access camera');
      }
    }
  };

  const handleStopScan = () => {
    setIsScanning(false);
  };

  const handleCopy = () => {
    if (scanResult) {
      navigator.clipboard.writeText(scanResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleFlash = () => {
    setFlashOn(!flashOn);
  };

  return (
    <div className={cn("max-w-2xl mx-auto space-y-6", className)}>
      <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-md">
                  <QrCode className="h-5 w-5 text-white" />
                </div>
                <span className="bg-gradient-to-r from-gray-900 to-green-600 bg-clip-text text-transparent dark:from-white dark:to-green-400">{title}</span>
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{subtitle}</p>
            </div>
            <Badge variant="secondary" className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 font-semibold flex items-center gap-1"><Sparkles className="w-3 h-3" />{badgeText}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            ref={videoRef}
            className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden"
          >
            {isScanning ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="w-64 h-64 border-4 border-green-500 rounded-xl relative shadow-2xl animate-pulse">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-lg"></div>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full">
                        <Camera className="h-16 w-16 text-green-400 animate-pulse" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <Sparkles className="h-4 w-4 text-green-400 animate-pulse" />
                    <p className="text-white text-sm font-semibold">{scanningMessage}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <div className="p-6 bg-gradient-to-r from-gray-700/20 to-gray-600/20 rounded-2xl mb-4 inline-block">
                    <Camera className="h-24 w-24 mx-auto" />
                  </div>
                  <p className="text-sm font-medium">Camera preview will appear here</p>
                </div>
              </div>
            )}

            {isScanning && (
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  size="sm"
                  variant={flashOn ? "default" : "outline"}
                  onClick={toggleFlash}
                  className={flashOn ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 shadow-lg" : "border-2"}
                >
                  <Flashlight className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" className="border-2 transition-all duration-300 hover:scale-110">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {!isScanning ? (
              <Button onClick={handleStartScan} className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 font-bold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                <Camera className="h-4 w-4 mr-2" />
                {startScanButton}
              </Button>
            ) : (
              <Button onClick={handleStopScan} className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 font-bold shadow-md hover:shadow-lg transition-all duration-300">
                {stopScanButton}
              </Button>
            )}
          </div>

          {scanResult && (
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 shadow-lg animate-in fade-in duration-500">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-md">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{scanSuccessMessage}</span>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{scanResultLabel}:</p>
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 break-all">
                    <code className="text-sm font-mono">{scanResult}</code>
                  </div>
                </div>

                <Button onClick={handleCopy} className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 font-bold shadow-md hover:shadow-lg transition-all duration-300">
                  {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copied ? 'Copied!' : copyButton}
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QRCodeScanner;
    `,

    upload: `
${commonImports}
import { Upload, QrCode, Copy, Check, FileImage, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface QRCodeScannerProps {
  ${dataName}?: any;
  className?: string;
  onScan?: (data: string, file: File) => void;
  onError?: (error: string) => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ ${dataName}: propData, className, onScan, onError }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
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

  const scannerData = ${dataName} || {};

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const badgeText = ${getField('badgeText')};
  const uploadButton = ${getField('uploadButton')};
  const selectFileButton = ${getField('selectFileButton')};
  const scanResultLabel = ${getField('scanResultLabel')};
  const noResultMessage = ${getField('noResultMessage')};
  const scanSuccessMessage = ${getField('scanSuccessMessage')};
  const copyButton = ${getField('copyButton')};
  const processingMessage = ${getField('processingMessage')};

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setScanResult(null);

    // Simulate QR code scanning
    setTimeout(() => {
      const mockData = 'https://fluxez.com/qr-scanned';
      setScanResult(mockData);
      setIsProcessing(false);

      if (onScan) {
        onScan(mockData, selectedFile);
      }
    }, 1500);
  };

  const handleCopy = () => {
    if (scanResult) {
      navigator.clipboard.writeText(scanResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setScanResult(null);
  };

  return (
    <div className={cn("max-w-2xl mx-auto space-y-6", className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-blue-600" />
                {title}
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{subtitle}</p>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-600">{badgeText}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label htmlFor="qr-upload">Upload QR Code Image</Label>

            {!imagePreview ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors">
                <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-4">Drag and drop or click to upload</p>
                <Input
                  id="qr-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="max-w-xs mx-auto"
                />
              </div>
            ) : (
              <div className="relative">
                <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                  <img
                    src={imagePreview}
                    alt="QR Code"
                    className="max-w-full h-auto mx-auto rounded"
                    style={{ maxHeight: '400px' }}
                  />
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={handleReset}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {imagePreview && !scanResult && (
            <Button
              onClick={handleScan}
              disabled={isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <QrCode className="h-4 w-4 mr-2" />
              {isProcessing ? processingMessage : uploadButton}
            </Button>
          )}

          {scanResult && (
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">{scanSuccessMessage}</span>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{scanResultLabel}:</p>
                  <div className="p-3 bg-white dark:bg-gray-800 rounded border break-all">
                    <code className="text-sm">{scanResult}</code>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleCopy} variant="outline" className="flex-1">
                    {copied ? <Check className="h-4 w-4 mr-2 text-green-600" /> : <Copy className="h-4 w-4 mr-2" />}
                    {copied ? 'Copied!' : copyButton}
                  </Button>
                  <Button onClick={handleReset} variant="outline">
                    {selectFileButton}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QRCodeScanner;
    `,

    continuous: `
${commonImports}
import { Camera, QrCode, History, Trash2, Copy, ExternalLink, Share2, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ScanHistoryItem {
  id: number;
  data: string;
  type: string;
  timestamp: string;
  icon: string;
}

interface QRCodeScannerProps {
  ${dataName}?: any;
  className?: string;
  onScan?: (data: string) => void;
  onHistoryAction?: (action: string, item: ScanHistoryItem) => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ ${dataName}: propData, className, onScan, onHistoryAction }) => {
  const [isScanning, setIsScanning] = useState(true);
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);

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

  const scannerData = ${dataName} || {};

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const badgeText = ${getField('badgeText')};
  const historyTitle = ${getField('historyTitle')};
  const clearHistoryButton = ${getField('clearHistoryButton')};
  const emptyHistoryMessage = ${getField('emptyHistoryMessage')};
  const copyButton = ${getField('copyButton')};
  const openButton = ${getField('openButton')};
  const shareButton = ${getField('shareButton')};
  const deleteButton = ${getField('deleteButton')};
  const scanningMessage = ${getField('scanningMessage')};
  const initialHistory = ${getField('scanHistory')};

  React.useEffect(() => {
    setHistory(initialHistory);

    // Simulate continuous scanning
    if (isScanning) {
      const interval = setInterval(() => {
        // Randomly add a new scan (10% chance every 3 seconds)
        if (Math.random() < 0.1) {
          const newScan: ScanHistoryItem = {
            id: Date.now(),
            data: \`https://example.com/\${Math.random().toString(36).substr(2, 9)}\`,
            type: 'URL',
            timestamp: 'Just now',
            icon: 'Link'
          };
          setHistory(prev => [newScan, ...prev]);
          if (onScan) {
            onScan(newScan.data);
          }
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isScanning]);

  const handleCopy = (item: ScanHistoryItem) => {
    navigator.clipboard.writeText(item.data);
    if (onHistoryAction) {
      onHistoryAction('copy', item);
    }
  };

  const handleOpen = (item: ScanHistoryItem) => {
    if (onHistoryAction) {
      onHistoryAction('open', item);
    } else {
      console.log('Open:', item.data);
    }
  };

  const handleShare = (item: ScanHistoryItem) => {
    if (onHistoryAction) {
      onHistoryAction('share', item);
    } else {
      console.log('Share:', item.data);
    }
  };

  const handleDelete = (id: number) => {
    setHistory(prev => prev.filter((item: any) => item.id !== id));
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'URL': return 'text-blue-600 bg-blue-100';
      case 'Contact': return 'text-green-600 bg-green-100';
      case 'WiFi': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className={cn("max-w-4xl mx-auto space-y-6", className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-orange-600" />
                {title}
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{subtitle}</p>
            </div>
            <Badge variant="secondary" className="bg-orange-100 text-orange-600">{badgeText}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="relative aspect-square bg-gray-900 rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="w-64 h-64 border-4 border-orange-500 rounded-lg relative">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-orange-400"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-orange-400"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-orange-400"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-orange-400"></div>

                      <div className="absolute inset-0 flex items-center justify-center">
                        <Camera className="h-16 w-16 text-orange-400 opacity-50 animate-pulse" />
                      </div>

                      <div className="absolute inset-x-0 top-1/2 h-0.5 bg-orange-500 animate-scan"></div>
                    </div>
                    <p className="text-white text-sm text-center mt-4">{scanningMessage}</p>
                  </div>
                </div>

                {isScanning && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-red-500 animate-pulse">LIVE</Badge>
                  </div>
                )}
              </div>

              <Button
                onClick={() => setIsScanning(!isScanning)}
                className={cn(
                  "w-full",
                  isScanning ? "bg-red-600 hover:bg-red-700" : "bg-orange-600 hover:bg-orange-700"
                )}
              >
                <Camera className="h-4 w-4 mr-2" />
                {isScanning ? 'Stop Scanning' : 'Start Scanning'}
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <History className="h-5 w-5 text-orange-600" />
                  {historyTitle}
                </h3>
                {history.length > 0 && (
                  <Button size="sm" variant="outline" onClick={handleClearHistory}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    {clearHistoryButton}
                  </Button>
                )}
              </div>

              <ScrollArea className="h-[400px] rounded-lg border">
                {history.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <QrCode className="h-16 w-16 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">{emptyHistoryMessage}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    {history.map((item) => (
                      <Card key={item.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary" className={cn("text-xs", getTypeColor(item.type))}>
                                  {item.type}
                                </Badge>
                                <span className="text-xs text-gray-500">{item.timestamp}</span>
                              </div>
                              <p className="text-sm text-gray-700 dark:text-gray-300 break-all line-clamp-2">
                                {item.data}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>

                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="flex-1" onClick={() => handleCopy(item)}>
                              <Copy className="h-3 w-3 mr-1" />
                              {copyButton}
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1" onClick={() => handleOpen(item)}>
                              <ExternalLink className="h-3 w-3 mr-1" />
                              {openButton}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleShare(item)}>
                              <Share2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </CardContent>
      </Card>
</div>
  );
};

export default QRCodeScanner;
    `
  };

  return variants[variant] || variants.camera;
};
