import { ResolvedComponent } from '../../../types/resolved-component.interface';

// Common mock data

export const generateWhiteboardInterface = (
  resolved: ResolvedComponent,
  variant: 'basic' | 'collaborative' | 'advanced' = 'basic'
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

  const commonImports = `import React, { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';`;

  const variants = {
    basic: `
${commonImports}
import { StickyNote, Plus, Download, Trash2, Square, Circle, Type } from 'lucide-react';

interface StickyNote {
  id: number;
  content: string;
  color: string;
  x: number;
  y: number;
}

interface WhiteboardProps {
  ${dataName}?: any;
  className?: string;
  onExport?: () => void;
}

const Whiteboard: React.FC<WhiteboardProps> = ({ ${dataName}: propData, className, onExport }) => {
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

  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [selectedColor, setSelectedColor] = useState('#FEFCE8');
  const boardRef = useRef<HTMLDivElement>(null);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const whiteboardData = ${dataName} || {};

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const badgeText = ${getField('badgeText')};
  const addStickyNoteButton = ${getField('addStickyNoteButton')};
  const exportButton = ${getField('exportButton')};
  const clearButton = ${getField('clearButton')};
  const stickyNoteColors = ${getField('stickyNoteColors')};
  const initialNotes = ${getField('stickyNotes')};

  React.useEffect(() => {
    setNotes(initialNotes);
  }, []);

  const addStickyNote = () => {
    const newNote: StickyNote = {
      id: Date.now(),
      content: 'New note',
      color: selectedColor,
      x: Math.random() * 600 + 50,
      y: Math.random() * 400 + 50
    };
    setNotes([...notes, newNote]);
  };

  const updateNote = (id: number, content: string) => {
    setNotes(notes.map(note => note.id === id ? { ...note, content } : note));
  };

  const deleteNote = (id: number) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const handleClear = () => {
    setNotes([]);
  };

  const handleExport = () => {
    if (onExport) {
      onExport();
    } else {
      console.log('Export whiteboard');
    }
  };

  return (
    <div className={cn("max-w-7xl mx-auto space-y-4", className)}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <StickyNote className="h-5 w-5 text-yellow-600" />
                {title}
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
            </div>
            <Badge variant="secondary" className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-2 border-yellow-600 shadow-lg font-bold">{badgeText}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex-wrap">
              <div className="flex gap-2 items-center">
                {stickyNoteColors.map((color: any) => (
                  <button
                    key={color.value}
                    onClick={() => setSelectedColor(color.value)}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all shadow-lg hover:shadow-xl hover:scale-105",
                      selectedColor === color.value ? "border-yellow-500 scale-110 shadow-xl" : "border-gray-300"
                    )}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>

              <Button size="sm" onClick={addStickyNote} className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105">
                <Plus className="h-4 w-4 mr-1" />
                {addStickyNoteButton}
              </Button>

              <div className="ml-auto flex gap-2">
                <Button size="sm" variant="outline" onClick={handleClear} className="border-2 border-gray-300 dark:border-gray-600 hover:border-red-500 dark:hover:border-red-500 rounded-full font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105">
                  <Trash2 className="h-4 w-4 mr-1" />
                  {clearButton}
                </Button>
                <Button size="sm" variant="outline" onClick={handleExport} className="border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 rounded-full font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105">
                  <Download className="h-4 w-4 mr-1" />
                  {exportButton}
                </Button>
              </div>
            </div>

            <div
              ref={boardRef}
              className="relative border-2 border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-900 overflow-hidden shadow-xl"
              style={{ height: '600px' }}
            >
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="absolute w-48 h-48 p-4 shadow-xl hover:shadow-2xl rounded-xl cursor-move group transition-all hover:scale-105 border-2 border-gray-200"
                  style={{
                    backgroundColor: note.color,
                    left: note.x,
                    top: note.y
                  }}
                >
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4 text-gray-600 hover:text-red-600" />
                  </button>
                  <textarea
                    value={note.content}
                    onChange={(e) => updateNote(note.id, e.target.value)}
                    className="w-full h-full resize-none border-none outline-none text-sm"
                    style={{ backgroundColor: 'transparent' }}
                  />
                </div>
              ))}

              {notes.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <StickyNote className="h-16 w-16 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Add sticky notes to get started</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Whiteboard;
    `,

    collaborative: `
${commonImports}
import { StickyNote, Users, Plus, Download, Trash2, MousePointer2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface StickyNote {
  id: number;
  content: string;
  color: string;
  x: number;
  y: number;
}

interface Collaborator {
  id: number;
  name: string;
  color: string;
  x: number;
  y: number;
}

interface WhiteboardProps {
  ${dataName}?: any;
  className?: string;
  onExport?: () => void;
}

const Whiteboard: React.FC<WhiteboardProps> = ({ ${dataName}: propData, className, onExport }) => {
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

  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [selectedColor, setSelectedColor] = useState('#FEFCE8');

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const whiteboardData = ${dataName} || {};

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const badgeText = ${getField('badgeText')};
  const addStickyNoteButton = ${getField('addStickyNoteButton')};
  const exportButton = ${getField('exportButton')};
  const stickyNoteColors = ${getField('stickyNoteColors')};
  const initialNotes = ${getField('stickyNotes')};
  const initialCollaborators = ${getField('collaborators')};

  React.useEffect(() => {
    setNotes(initialNotes);
    setCollaborators(initialCollaborators);

    // Simulate cursor movement
    const interval = setInterval(() => {
      setCollaborators(prev =>
        prev.map(c => ({
          ...c,
          x: c.x + (Math.random() - 0.5) * 20,
          y: c.y + (Math.random() - 0.5) * 20
        }))
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const addStickyNote = () => {
    const newNote: StickyNote = {
      id: Date.now(),
      content: 'New note',
      color: selectedColor,
      x: Math.random() * 600 + 50,
      y: Math.random() * 400 + 50
    };
    setNotes([...notes, newNote]);
  };

  const updateNote = (id: number, content: string) => {
    setNotes(notes.map(note => note.id === id ? { ...note, content } : note));
  };

  const deleteNote = (id: number) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  return (
    <div className={cn("max-w-7xl mx-auto space-y-4", className)}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                {title}
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {collaborators.map((collab) => (
                  <Avatar key={collab.id} className="border-2 border-white" style={{ borderColor: collab.color }}>
                    <AvatarFallback style={{ backgroundColor: collab.color, color: 'white' }}>
                      {collab.name[0]}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <Badge variant="secondary" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-2 border-blue-700 shadow-lg font-bold">{badgeText}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex-wrap">
              <div className="flex gap-2 items-center">
                {stickyNoteColors.map((color: any) => (
                  <button
                    key={color.value}
                    onClick={() => setSelectedColor(color.value)}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all shadow-lg hover:shadow-xl hover:scale-105",
                      selectedColor === color.value ? "border-blue-500 scale-110 shadow-xl" : "border-gray-300"
                    )}
                    style={{ backgroundColor: color.value }}
                  />
                ))}
              </div>

              <Button size="sm" onClick={addStickyNote} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105">
                <Plus className="h-4 w-4 mr-1" />
                {addStickyNoteButton}
              </Button>

              <Button size="sm" variant="outline" onClick={onExport} className="ml-auto border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 rounded-full font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105">
                <Download className="h-4 w-4 mr-1" />
                {exportButton}
              </Button>
            </div>

            <div
              className="relative border-2 border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-900 overflow-hidden shadow-xl"
              style={{ height: '600px' }}
            >
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="absolute w-48 h-48 p-4 shadow-xl hover:shadow-2xl rounded-xl cursor-move group transition-all hover:scale-105 border-2 border-gray-200"
                  style={{
                    backgroundColor: note.color,
                    left: note.x,
                    top: note.y
                  }}
                >
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4 text-gray-600 hover:text-red-600" />
                  </button>
                  <textarea
                    value={note.content}
                    onChange={(e) => updateNote(note.id, e.target.value)}
                    className="w-full h-full resize-none border-none outline-none text-sm"
                    style={{ backgroundColor: 'transparent' }}
                  />
                </div>
              ))}

              {collaborators.map((collab) => (
                <div
                  key={collab.id}
                  className="absolute pointer-events-none transition-all duration-500"
                  style={{
                    left: collab.x,
                    top: collab.y
                  }}
                >
                  <MousePointer2 className="h-5 w-5" style={{ color: collab.color }} />
                  <div
                    className="mt-1 px-2 py-1 rounded-full text-xs text-white whitespace-nowrap shadow-lg font-bold border-2 border-white/20"
                    style={{ backgroundColor: collab.color }}
                  >
                    {collab.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Whiteboard;
    `,

    advanced: `
${commonImports}
import { StickyNote, Plus, Download, Trash2, Square, Circle, Type, ArrowRight, Undo, Redo, ZoomIn, ZoomOut } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface BoardElement {
  id: number;
  type: 'sticky' | 'text' | 'shape';
  content: string;
  color: string;
  x: number;
  y: number;
  shape?: 'rectangle' | 'circle' | 'arrow';
}

interface WhiteboardProps {
  ${dataName}?: any;
  className?: string;
  onExport?: () => void;
}

const Whiteboard: React.FC<WhiteboardProps> = ({ ${dataName}: propData, className, onExport }) => {
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

  const [elements, setElements] = useState<BoardElement[]>([]);
  const [selectedTool, setSelectedTool] = useState<'sticky' | 'text' | 'shape'>('sticky');
  const [selectedColor, setSelectedColor] = useState('#FEFCE8');
  const [selectedShape, setSelectedShape] = useState<'rectangle' | 'circle' | 'arrow'>('rectangle');
  const [zoom, setZoom] = useState(100);
  const [history, setHistory] = useState<BoardElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const whiteboardData = ${dataName} || {};

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const badgeText = ${getField('badgeText')};
  const addStickyNoteButton = ${getField('addStickyNoteButton')};
  const addTextBoxButton = ${getField('addTextBoxButton')};
  const addShapeButton = ${getField('addShapeButton')};
  const exportButton = ${getField('exportButton')};
  const clearButton = ${getField('clearButton')};
  const undoButton = ${getField('undoButton')};
  const redoButton = ${getField('redoButton')};
  const stickyNoteColors = ${getField('stickyNoteColors')};
  const initialNotes = ${getField('stickyNotes')};

  React.useEffect(() => {
    const initialElements = initialNotes.map((note: any) => ({
      ...note,
      type: 'sticky' as const
    }));
    setElements(initialElements);
    setHistory([initialElements]);
    setHistoryIndex(0);
  }, []);

  const saveToHistory = (newElements: BoardElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newElements);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const addElement = () => {
    const newElement: BoardElement = {
      id: Date.now(),
      type: selectedTool,
      content: selectedTool === 'sticky' ? 'New note' : selectedTool === 'text' ? 'Text box' : '',
      color: selectedColor,
      x: Math.random() * 600 + 50,
      y: Math.random() * 400 + 50,
      shape: selectedTool === 'shape' ? selectedShape : undefined
    };
    const newElements = [...elements, newElement];
    setElements(newElements);
    saveToHistory(newElements);
  };

  const updateElement = (id: number, content: string) => {
    const newElements = elements.map(el => el.id === id ? { ...el, content } : el);
    setElements(newElements);
  };

  const deleteElement = (id: number) => {
    const newElements = elements.filter(el => el.id !== id);
    setElements(newElements);
    saveToHistory(newElements);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(history[historyIndex + 1]);
    }
  };

  const handleClear = () => {
    setElements([]);
    saveToHistory([]);
  };

  const renderElement = (element: BoardElement) => {
    if (element.type === 'sticky') {
      return (
        <div
          key={element.id}
          className="absolute w-48 h-48 p-4 shadow-xl hover:shadow-2xl rounded-xl cursor-move group transition-all hover:scale-105 border-2 border-gray-200"
          style={{
            backgroundColor: element.color,
            left: element.x,
            top: element.y
          }}
        >
          <button
            onClick={() => deleteElement(element.id)}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="h-4 w-4 text-gray-600 hover:text-red-600" />
          </button>
          <textarea
            value={element.content}
            onChange={(e) => updateElement(element.id, e.target.value)}
            className="w-full h-full resize-none border-none outline-none text-sm"
            style={{ backgroundColor: 'transparent' }}
          />
        </div>
      );
    } else if (element.type === 'text') {
      return (
        <div
          key={element.id}
          className="absolute p-2 cursor-move group"
          style={{ left: element.x, top: element.y }}
        >
          <button
            onClick={() => deleteElement(element.id)}
            className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="h-4 w-4 text-gray-600 hover:text-red-600" />
          </button>
          <input
            value={element.content}
            onChange={(e) => updateElement(element.id, e.target.value)}
            className="border-none outline-none bg-transparent text-lg font-medium"
            style={{ color: element.color === '#FEFCE8' ? '#000' : element.color }}
          />
        </div>
      );
    } else if (element.type === 'shape') {
      return (
        <div
          key={element.id}
          className="absolute cursor-move group"
          style={{ left: element.x, top: element.y }}
        >
          <button
            onClick={() => deleteElement(element.id)}
            className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          >
            <Trash2 className="h-4 w-4 text-gray-600 hover:text-red-600" />
          </button>
          {element.shape === 'rectangle' && (
            <div className="w-32 h-24 border-4 rounded-xl shadow-lg" style={{ borderColor: element.color }} />
          )}
          {element.shape === 'circle' && (
            <div className="w-32 h-32 border-4 rounded-full shadow-lg" style={{ borderColor: element.color }} />
          )}
          {element.shape === 'arrow' && (
            <ArrowRight className="h-16 w-16 drop-shadow-lg" style={{ color: element.color }} />
          )}
        </div>
      );
    }
  };

  return (
    <div className={cn("max-w-7xl mx-auto space-y-4", className)}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <StickyNote className="h-5 w-5 text-indigo-600" />
                {title}
              </CardTitle>
            </div>
            <Badge variant="secondary" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-2 border-indigo-700 shadow-lg font-bold">{badgeText}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex-wrap">
              <div className="flex gap-1 border-r pr-2">
                <Button
                  size="sm"
                  variant={selectedTool === 'sticky' ? 'default' : 'ghost'}
                  onClick={() => setSelectedTool('sticky')}
                  className={selectedTool === 'sticky' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full shadow-lg font-bold' : 'rounded-full'}
                >
                  <StickyNote className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={selectedTool === 'text' ? 'default' : 'ghost'}
                  onClick={() => setSelectedTool('text')}
                  className={selectedTool === 'text' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full shadow-lg font-bold' : 'rounded-full'}
                >
                  <Type className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={selectedTool === 'shape' ? 'default' : 'ghost'}
                  onClick={() => setSelectedTool('shape')}
                  className={selectedTool === 'shape' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full shadow-lg font-bold' : 'rounded-full'}
                >
                  <Square className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex gap-1 border-r pr-2">
                {stickyNoteColors.slice(0, 5).map((color: any) => (
                  <button
                    key={color.value}
                    onClick={() => setSelectedColor(color.value)}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all shadow-lg hover:shadow-xl hover:scale-105",
                      selectedColor === color.value ? "border-indigo-500 scale-110 shadow-xl" : "border-gray-300"
                    )}
                    style={{ backgroundColor: color.value }}
                  />
                ))}
              </div>

              <Button size="sm" onClick={addElement} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>

              <div className="flex gap-1 border-l pl-2 ml-auto">
                <Button size="sm" variant="ghost" onClick={handleUndo} disabled={historyIndex <= 0} className="rounded-full hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all hover:scale-105">
                  <Undo className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="rounded-full hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all hover:scale-105">
                  <Redo className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setZoom(Math.max(zoom - 10, 50))} className="rounded-full hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all hover:scale-105">
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm px-2 py-1 font-bold">{zoom}%</span>
                <Button size="sm" variant="ghost" onClick={() => setZoom(Math.min(zoom + 10, 200))} className="rounded-full hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all hover:scale-105">
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={handleClear} className="rounded-full hover:bg-gradient-to-r hover:from-red-100 hover:to-red-200 dark:hover:from-red-900 dark:hover:to-red-800 transition-all hover:scale-105">
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={onExport} className="rounded-full hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-900 dark:hover:to-blue-800 transition-all hover:scale-105">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div
              className="relative border-2 border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-900 overflow-auto shadow-xl"
              style={{ height: '600px' }}
            >
              <div style={{ transform: \`scale(\${zoom / 100})\`, transformOrigin: 'top left', minWidth: '1200px', minHeight: '900px' }}>
                {elements.map(renderElement)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Whiteboard;
    `
  };

  return variants[variant] || variants.basic;
};
