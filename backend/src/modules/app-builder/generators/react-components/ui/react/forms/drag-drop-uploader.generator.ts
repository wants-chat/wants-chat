import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateDragDropUploader = (
  resolved: ResolvedComponent,
  variant: 'zone' | 'grid' | 'list' = 'zone'
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
import React, { useState, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Upload, X, FileText, CheckCircle, GripVertical, Trash2, CheckSquare, Square, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';`;

  const variants = {
    zone: `
${commonImports}

interface DragDropUploaderProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onUpload?: (files: File[]) => void;
}

interface FileItem {
  id: string;
  file: File;
  progress: number;
  uploading: boolean;
  complete: boolean;
  selected: boolean;
}

const DragDropUploader: React.FC<DragDropUploaderProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className, onUpload }) => {
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

  const data = propData || fetchedData || {};
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const dropZoneTitle = ${getField('dropZoneTitle')};
  const dropZoneSubtitle = ${getField('dropZoneSubtitle')};
  const uploadAllButtonText = ${getField('uploadAllButtonText')};
  const removeAllButtonText = ${getField('removeAllButtonText')};
  const reorderHintText = ${getField('reorderHintText')};
  const filesReadyText = ${getField('filesReadyText')};
  const dragActiveText = ${getField('dragActiveText')};
  const uploadingText = ${getField('uploadingText')};
  const completeText = ${getField('completeText')};
  const removeText = ${getField('removeText')};
  const acceptedFileTypes = ${getField('acceptedFileTypes')};
  const fileSizeLabel = ${getField('fileSizeLabel')};
  const totalFilesLabel = ${getField('totalFilesLabel')};
  const totalSizeLabel = ${getField('totalSizeLabel')};

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getTotalSize = () => {
    return files.reduce((total, item) => total + item.file.size, 0);
  };

  const simulateUpload = (id: string) => {
    const interval = setInterval(() => {
      setFiles(prev => {
        const index = prev.findIndex(f => f.id === id);
        if (index === -1) {
          clearInterval(interval);
          return prev;
        }

        const updated = [...prev];
        if (updated[index].progress >= 100) {
          clearInterval(interval);
          updated[index] = {
            ...updated[index],
            progress: 100,
            uploading: false,
            complete: true
          };
          return updated;
        }

        updated[index] = {
          ...updated[index],
          progress: updated[index].progress + 10
        };
        return updated;
      });
    }, 200);
  };

  const handleFileSelect = (selectedFiles: FileList | File[]) => {
    const newFiles = Array.from(selectedFiles).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      uploading: false,
      complete: false,
      selected: false
    }));

    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files);
    }
  };

  const handleUploadAll = () => {
    files.forEach(item => {
      if (!item.uploading && !item.complete) {
        setFiles(prev =>
          prev.map(f => f.id === item.id ? { ...f, uploading: true } : f)
        );
        simulateUpload(item.id);
      }
    });

    if (onUpload) {
      onUpload(files.map(f => f.file));
    }
  };

  const handleRemoveFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleRemoveAll = () => {
    setFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleItemDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleItemDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newFiles = [...files];
    const draggedItem = newFiles[draggedIndex];
    newFiles.splice(draggedIndex, 1);
    newFiles.splice(index, 0, draggedItem);

    setFiles(newFiles);
    setDraggedIndex(index);
  };

  const handleItemDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className={cn("w-full max-w-4xl mx-auto p-6", className)}>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileInputChange}
        accept={acceptedFileTypes}
        className="hidden"
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all mb-6",
          isDragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105"
            : "border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600"
        )}
      >
        <div className="flex flex-col items-center">
          <Upload className={cn(
            "w-16 h-16 mb-4 transition-all",
            isDragging ? "text-blue-500 scale-110" : "text-gray-400"
          )} />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {isDragging ? dragActiveText : dropZoneTitle}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">{dropZoneSubtitle}</p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">{totalFilesLabel}</span> {files.length} •
              <span className="font-medium ml-2">{totalSizeLabel}</span> {formatFileSize(getTotalSize())}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleUploadAll}
                disabled={files.every(f => f.complete)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {uploadAllButtonText}
              </button>
              <button
                onClick={handleRemoveAll}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors"
              >
                {removeAllButtonText}
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <GripVertical className="w-3 h-3" />
            {reorderHintText}
          </p>

          <div className="space-y-2">
            {files.map((item: any, index: number) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleItemDragStart(e, index)}
                onDragOver={(e) => handleItemDragOver(e, index)}
                onDragEnd={handleItemDragEnd}
                className={cn(
                  "flex items-center gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-move transition-all",
                  draggedIndex === index ? "opacity-50 scale-95" : "hover:shadow-md"
                )}
              >
                <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <FileText className="w-6 h-6 text-blue-500 flex-shrink-0" />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {item.file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {fileSizeLabel} {formatFileSize(item.file.size)}
                  </p>

                  {item.uploading && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                        <span>{uploadingText}...</span>
                        <span>{item.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: \`\${item.progress}%\` }}
                        />
                      </div>
                    </div>
                  )}

                  {item.complete && (
                    <div className="flex items-center gap-2 mt-1 text-green-600 dark:text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs font-medium">{completeText}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleRemoveFile(item.id)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  disabled={item.uploading}
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DragDropUploader;
    `,

    grid: `
${commonImports}

interface DragDropUploaderProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onUpload?: (files: File[]) => void;
}

interface FileItem {
  id: string;
  file: File;
  progress: number;
  uploading: boolean;
  complete: boolean;
  preview?: string;
}

const DragDropUploader: React.FC<DragDropUploaderProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className, onUpload }) => {
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

  const data = propData || fetchedData || {};
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const uploadAllButtonText = ${getField('uploadAllButtonText')};
  const removeAllButtonText = ${getField('removeAllButtonText')};
  const acceptedFileTypes = ${getField('acceptedFileTypes')};

  const createPreview = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        resolve('');
      }
    });
  };

  const simulateUpload = (id: string) => {
    const interval = setInterval(() => {
      setFiles(prev => {
        const index = prev.findIndex(f => f.id === id);
        if (index === -1) {
          clearInterval(interval);
          return prev;
        }

        const updated = [...prev];
        if (updated[index].progress >= 100) {
          clearInterval(interval);
          updated[index] = { ...updated[index], progress: 100, uploading: false, complete: true };
          return updated;
        }

        updated[index] = { ...updated[index], progress: updated[index].progress + 10 };
        return updated;
      });
    }, 200);
  };

  const handleFileSelect = async (selectedFiles: FileList | File[]) => {
    for (const file of Array.from(selectedFiles)) {
      const preview = await createPreview(file);
      setFiles(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        file,
        progress: 0,
        uploading: false,
        complete: false,
        preview
      }]);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, []);

  const handleItemDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleItemDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    setFiles(prev => {
      const draggedIndex = prev.findIndex(f => f.id === draggedId);
      const targetIndex = prev.findIndex(f => f.id === targetId);
      const newFiles = [...prev];
      const [draggedItem] = newFiles.splice(draggedIndex, 1);
      newFiles.splice(targetIndex, 0, draggedItem);
      return newFiles;
    });
  };

  const handleUploadAll = () => {
    files.forEach(item => {
      if (!item.uploading && !item.complete) {
        setFiles(prev => prev.map(f => f.id === item.id ? { ...f, uploading: true } : f));
        simulateUpload(item.id);
      }
    });
    if (onUpload) onUpload(files.map(f => f.file));
  };

  return (
    <div className={cn("w-full max-w-6xl mx-auto p-6", className)}>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
        accept={acceptedFileTypes}
        className="hidden"
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all mb-6",
          isDragging ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-700"
        )}
      >
        <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p className="text-base font-medium text-gray-900 dark:text-white">Drop files or click to browse</p>
      </div>

      {files.length > 0 && (
        <>
          <div className="flex justify-between mb-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">{files.length} files</span>
            <div className="flex gap-2">
              <button onClick={handleUploadAll} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg">
                {uploadAllButtonText}
              </button>
              <button onClick={() => setFiles([])} className="px-4 py-2 border text-sm rounded-lg">
                {removeAllButtonText}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map(item => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleItemDragStart(item.id)}
                onDragOver={(e) => handleItemDragOver(e, item.id)}
                onDragEnd={() => setDraggedId(null)}
                className="relative group cursor-move"
              >
                <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                  {item.preview ? (
                    <img src={item.preview} alt={item.file.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  {item.uploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white text-sm">{item.progress}%</span>
                    </div>
                  )}
                  {item.complete && (
                    <CheckCircle className="absolute top-2 right-2 w-6 h-6 text-green-500 bg-white rounded-full" />
                  )}
                  <button
                    onClick={() => setFiles(prev => prev.filter(f => f.id !== item.id))}
                    className="absolute top-2 left-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 truncate">{item.file.name}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default DragDropUploader;
    `,

    list: `
${commonImports}

interface DragDropUploaderProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onUpload?: (files: File[]) => void;
}

interface FileItem {
  id: string;
  file: File;
  progress: number;
  uploading: boolean;
  complete: boolean;
  selected: boolean;
}

const DragDropUploader: React.FC<DragDropUploaderProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className, onUpload }) => {
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

  const data = propData || fetchedData || {};
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const uploadAllButtonText = ${getField('uploadAllButtonText')};
  const removeSelectedText = ${getField('removeSelectedText')};
  const selectAllText = ${getField('selectAllText')};
  const acceptedFileTypes = ${getField('acceptedFileTypes')};

  const simulateUpload = (id: string) => {
    const interval = setInterval(() => {
      setFiles(prev => {
        const index = prev.findIndex(f => f.id === id);
        if (index === -1) {
          clearInterval(interval);
          return prev;
        }
        const updated = [...prev];
        if (updated[index].progress >= 100) {
          clearInterval(interval);
          updated[index] = { ...updated[index], progress: 100, uploading: false, complete: true };
          return updated;
        }
        updated[index] = { ...updated[index], progress: updated[index].progress + 10 };
        return updated;
      });
    }, 200);
  };

  const handleFileSelect = (selectedFiles: FileList | File[]) => {
    const newFiles = Array.from(selectedFiles).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      uploading: false,
      complete: false,
      selected: false
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleUploadAll = () => {
    files.forEach(item => {
      if (!item.uploading && !item.complete) {
        setFiles(prev => prev.map(f => f.id === item.id ? { ...f, uploading: true } : f));
        simulateUpload(item.id);
      }
    });
    if (onUpload) onUpload(files.map(f => f.file));
  };

  const toggleSelect = (id: string) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, selected: !f.selected } : f));
  };

  const toggleSelectAll = () => {
    const allSelected = files.every(f => f.selected);
    setFiles(prev => prev.map(f => ({ ...f, selected: !allSelected })));
  };

  const removeSelected = () => {
    setFiles(prev => prev.filter(f => !f.selected));
  };

  return (
    <div className={cn("w-full max-w-3xl mx-auto p-6", className)}>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
        accept={acceptedFileTypes}
        className="hidden"
      />

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files) handleFileSelect(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all mb-6",
          isDragging ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300"
        )}
      >
        <Upload className="w-10 h-10 mx-auto mb-2 text-gray-400" />
        <p className="text-gray-600 dark:text-gray-400">Drop files or click</p>
      </div>

      {files.length > 0 && (
        <>
          <div className="flex justify-between mb-4">
            <button onClick={toggleSelectAll} className="text-sm text-blue-600">{selectAllText}</button>
            <div className="flex gap-2">
              <button onClick={handleUploadAll} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg">
                {uploadAllButtonText}
              </button>
              <button onClick={removeSelected} className="px-4 py-2 border text-sm rounded-lg">
                {removeSelectedText}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {files.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <button onClick={() => toggleSelect(item.id)}>
                  {item.selected ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5 text-gray-400" />}
                </button>
                <FileText className="w-5 h-5 text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.file.name}</p>
                  {item.uploading && (
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                      <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: \`\${item.progress}%\` }} />
                    </div>
                  )}
                  {item.complete && <CheckCircle className="w-4 h-4 text-green-500" />}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default DragDropUploader;
    `
  };

  return variants[variant] || variants.zone;
};
