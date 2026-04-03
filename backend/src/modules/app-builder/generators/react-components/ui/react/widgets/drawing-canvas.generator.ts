import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateDrawingCanvas = (
  resolved: ResolvedComponent,
  variant: 'freehand' | 'shapes' | 'whiteboard' = 'freehand'
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
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';`;

  const variants = {
    freehand: `
${commonImports}
import { Pencil, Eraser, Undo, Redo, Trash2, Download, Save, Check, Loader2 } from 'lucide-react';

interface DrawingCanvasProps {
  ${dataName}?: any;
  className?: string;
  onSave?: (canvas: string) => void;
  onExport?: (canvas: string) => void;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ ${dataName}: propData, className, onSave, onExport }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(4);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [saved, setSaved] = useState(false);

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

  const canvasData = ${dataName} || {};

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const badgeText = ${getField('badgeText')};
  const toolsLabel = ${getField('toolsLabel')};
  const penTool = ${getField('penTool')};
  const eraserTool = ${getField('eraserTool')};
  const colorLabel = ${getField('colorLabel')};
  const brushSizeLabel = ${getField('brushSizeLabel')};
  const colors = ${getField('colors')};
  const brushSizes = ${getField('brushSizes')};
  const undoButton = ${getField('undoButton')};
  const redoButton = ${getField('redoButton')};
  const clearButton = ${getField('clearButton')};
  const saveButton = ${getField('saveButton')};
  const downloadButton = ${getField('downloadButton')};
  const savedMessage = ${getField('savedMessage')};

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        saveToHistory();
      }
    }
  }, []);

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push(imageData);
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
      }
    }
  };

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
      if (tool === 'pen') {
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
        ctx.globalCompositeOperation = 'source-over';
      } else {
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = brushSize * 2;
        ctx.globalCompositeOperation = 'destination-out';
      }
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
    }
  };

  const handleUndo = () => {
    if (historyStep > 0) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.putImageData(history[historyStep - 1], 0, 0);
          setHistoryStep(historyStep - 1);
        }
      }
    }
  };

  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.putImageData(history[historyStep + 1], 0, 0);
          setHistoryStep(historyStep + 1);
        }
      }
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        saveToHistory();
      }
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
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'drawing.png';
      link.href = dataUrl;
      link.click();
    }
  };

  return (
    <div className={cn("max-w-6xl mx-auto space-y-6", className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Pencil className="h-5 w-5 text-blue-600" />
                {title}
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{subtitle}</p>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-600">{badgeText}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <div className="space-y-3">
                <Label>{toolsLabel}</Label>
                <div className="space-y-2">
                  <Button
                    variant={tool === 'pen' ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => setTool('pen')}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    {penTool}
                  </Button>
                  <Button
                    variant={tool === 'eraser' ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => setTool('eraser')}
                  >
                    <Eraser className="h-4 w-4 mr-2" />
                    {eraserTool}
                  </Button>
                </div>
              </div>

              {tool === 'pen' && (
                <div className="space-y-3">
                  <Label>{colorLabel}</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {colors.map((c: string) => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className={cn(
                          "h-10 rounded border-2 transition-all",
                          color === c ? "border-blue-500 scale-110" : "border-gray-300"
                        )}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Label>{brushSizeLabel}: {brushSize}px</Label>
                <Slider
                  value={[brushSize]}
                  onValueChange={(vals) => setBrushSize(vals[0])}
                  min={1}
                  max={20}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Button onClick={handleUndo} disabled={historyStep <= 0} variant="outline" className="w-full">
                  <Undo className="h-4 w-4 mr-2" />
                  {undoButton}
                </Button>
                <Button onClick={handleRedo} disabled={historyStep >= history.length - 1} variant="outline" className="w-full">
                  <Redo className="h-4 w-4 mr-2" />
                  {redoButton}
                </Button>
                <Button onClick={handleClear} variant="outline" className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  {clearButton}
                </Button>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-4">
              <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={600}
                  className="w-full cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  {saved ? <Check className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  {saved ? savedMessage : saveButton}
                </Button>
                <Button onClick={handleDownload} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  {downloadButton}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DrawingCanvas;
    `,

    shapes: `
${commonImports}
import { Square, Circle, Triangle, Star, ArrowRight, Pencil, Type, Undo, Redo, Download, Save, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DrawingCanvasProps {
  ${dataName}?: any;
  className?: string;
  onSave?: (canvas: string) => void;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ ${dataName}: propData, className, onSave }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [color, setColor] = useState('#0000FF');
  const [fillColor, setFillColor] = useState('#E0E7FF');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [fill, setFill] = useState(true);

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

  const canvasData = ${dataName} || {};

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const badgeText = ${getField('badgeText')};
  const shapesLabel = ${getField('shapesLabel')};
  const shapes = ${getField('shapes')};
  const colorLabel = ${getField('colorLabel')};
  const fillLabel = ${getField('fillLabel')};
  const colors = ${getField('colors')};
  const undoButton = ${getField('undoButton')};
  const redoButton = ${getField('redoButton')};
  const clearButton = ${getField('clearButton')};
  const saveButton = ${getField('saveButton')};
  const downloadButton = ${getField('downloadButton')};

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  const drawShape = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedShape) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = color;
    ctx.fillStyle = fillColor;
    ctx.lineWidth = strokeWidth;

    const size = 60;

    switch (selectedShape) {
      case 'Rectangle':
        if (fill) ctx.fillRect(x - size / 2, y - size / 2, size, size);
        ctx.strokeRect(x - size / 2, y - size / 2, size, size);
        break;
      case 'Circle':
        ctx.beginPath();
        ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        if (fill) ctx.fill();
        ctx.stroke();
        break;
      case 'Triangle':
        ctx.beginPath();
        ctx.moveTo(x, y - size / 2);
        ctx.lineTo(x - size / 2, y + size / 2);
        ctx.lineTo(x + size / 2, y + size / 2);
        ctx.closePath();
        if (fill) ctx.fill();
        ctx.stroke();
        break;
      case 'Star':
        drawStar(ctx, x, y, 5, size / 2, size / 4);
        if (fill) ctx.fill();
        ctx.stroke();
        break;
    }
  };

  const drawStar = (ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) => {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas && onSave) {
      onSave(canvas.toDataURL('image/png'));
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'shapes-drawing.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const getShapeIcon = (iconName: string) => {
    const icons: any = { Square, Circle, Triangle, Star, ArrowRight };
    return icons[iconName] || Square;
  };

  return (
    <div className={cn("max-w-6xl mx-auto space-y-6", className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Square className="h-5 w-5 text-purple-600" />
                {title}
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{subtitle}</p>
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-600">{badgeText}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <div className="space-y-3">
                <Label>{shapesLabel}</Label>
                <div className="space-y-2">
                  {shapes.map((shape: any) => {
                    const Icon = getShapeIcon(shape.icon);
                    return (
                      <Button
                        key={shape.name}
                        variant={selectedShape === shape.name ? 'default' : 'outline'}
                        className="w-full justify-start"
                        onClick={() => setSelectedShape(shape.name)}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {shape.name}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <Label>{colorLabel}</Label>
                <div className="grid grid-cols-5 gap-2">
                  {colors.slice(0, 10).map((c: string) => (
                    <button
                      key={c}
                      onClick={() => {
                        setColor(c);
                        setFillColor(c + '40');
                      }}
                      className={cn(
                        "h-10 rounded border-2 transition-all",
                        color === c ? "border-purple-500 scale-110" : "border-gray-300"
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="fill-shapes"
                  checked={fill}
                  onChange={(e) => setFill(e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="fill-shapes">{fillLabel}</Label>
              </div>

              <div className="space-y-2">
                <Button onClick={handleClear} variant="outline" className="w-full">
                  {clearButton}
                </Button>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-4">
              <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={600}
                  className="w-full cursor-crosshair"
                  onClick={drawShape}
                />
              </div>
              <p className="text-sm text-gray-500 text-center">
                {selectedShape ? \`Click on the canvas to add \${selectedShape}\` : 'Select a shape from the sidebar'}
              </p>

              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex-1 bg-purple-600 hover:bg-purple-700">
                  <Save className="h-4 w-4 mr-2" />
                  {saveButton}
                </Button>
                <Button onClick={handleDownload} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  {downloadButton}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DrawingCanvas;
    `,

    whiteboard: `
${commonImports}
import { Pencil, Square, Circle, Type, Eraser, Undo, Redo, Download, Save, ZoomIn, ZoomOut, Move, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DrawingCanvasProps {
  ${dataName}?: any;
  className?: string;
  onSave?: (canvas: string) => void;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ ${dataName}: propData, className, onSave }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<string>('pen');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(2);
  const [zoom, setZoom] = useState(100);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

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

  const canvasData = ${dataName} || {};

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const badgeText = ${getField('badgeText')};
  const toolsLabel = ${getField('toolsLabel')};
  const penTool = ${getField('penTool')};
  const eraserTool = ${getField('eraserTool')};
  const rectangleTool = ${getField('rectangleTool')};
  const circleTool = ${getField('circleTool')};
  const textTool = ${getField('textTool')};
  const colorLabel = ${getField('colorLabel')};
  const colors = ${getField('colors')};
  const undoButton = ${getField('undoButton')};
  const redoButton = ${getField('redoButton')};
  const clearButton = ${getField('clearButton')};
  const saveButton = ${getField('saveButton')};
  const exportButton = ${getField('exportButton')};

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setStartPos({ x, y });
    setIsDrawing(true);

    const ctx = canvas.getContext('2d');
    if (ctx && tool === 'pen') {
      ctx.beginPath();
      ctx.moveTo(x, y);
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
    if (!ctx) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';

    if (tool === 'pen') {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (tool === 'rectangle') {
      const width = x - startPos.x;
      const height = y - startPos.y;
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.strokeRect(startPos.x, startPos.y, width, height);
    } else if (tool === 'circle') {
      const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2));
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.beginPath();
      ctx.arc(startPos.x, startPos.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const handleZoomIn = () => setZoom(Math.min(zoom + 10, 200));
  const handleZoomOut = () => setZoom(Math.max(zoom - 10, 50));

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas && onSave) {
      onSave(canvas.toDataURL('image/png'));
    }
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'whiteboard.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  return (
    <div className={cn("max-w-7xl mx-auto space-y-4", className)}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Square className="h-5 w-5 text-green-600" />
                {title}
              </CardTitle>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-600">{badgeText}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg flex-wrap">
              <div className="flex gap-1 border-r pr-2">
                <Button size="sm" variant={tool === 'pen' ? 'default' : 'ghost'} onClick={() => setTool('pen')}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="sm" variant={tool === 'eraser' ? 'default' : 'ghost'} onClick={() => setTool('eraser')}>
                  <Eraser className="h-4 w-4" />
                </Button>
                <Button size="sm" variant={tool === 'rectangle' ? 'default' : 'ghost'} onClick={() => setTool('rectangle')}>
                  <Square className="h-4 w-4" />
                </Button>
                <Button size="sm" variant={tool === 'circle' ? 'default' : 'ghost'} onClick={() => setTool('circle')}>
                  <Circle className="h-4 w-4" />
                </Button>
                <Button size="sm" variant={tool === 'text' ? 'default' : 'ghost'} onClick={() => setTool('text')}>
                  <Type className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex gap-1 border-r pr-2">
                {colors.slice(0, 6).map((c: string) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={cn(
                      "w-8 h-8 rounded border-2",
                      color === c ? "border-green-500" : "border-gray-300"
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              <div className="flex gap-1 border-r pr-2">
                <Button size="sm" variant="ghost" onClick={handleZoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm px-2 py-1">{zoom}%</span>
                <Button size="sm" variant="ghost" onClick={handleZoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex gap-1 border-r pr-2">
                <Button size="sm" variant="ghost">
                  <Undo className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Redo className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={handleClear}>
                  {clearButton}
                </Button>
                <Button size="sm" variant="ghost" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-1" />
                  {saveButton}
                </Button>
                <Button size="sm" variant="ghost" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-1" />
                  {exportButton}
                </Button>
              </div>
            </div>

            <div className="border-2 border-gray-300 rounded-lg overflow-auto bg-gray-100 dark:bg-gray-900" style={{ height: '600px' }}>
              <div className="inline-block min-w-full min-h-full" style={{ transform: \`scale(\${zoom / 100})\`, transformOrigin: 'top left' }}>
                <canvas
                  ref={canvasRef}
                  width={1600}
                  height={1200}
                  className="cursor-crosshair bg-white"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DrawingCanvas;
    `
  };

  return variants[variant] || variants.freehand;
};
