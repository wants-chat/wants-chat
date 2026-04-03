/**
 * FileUploadPopup Component
 * Shows a modal for uploading files with drag-drop, preview, and tool suggestions
 */

import React, { useState, useCallback, useRef } from 'react';
import { X, Upload, FileImage, FileText, FileAudio, FileVideo, File, Trash2, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../contexts/ThemeContext';
import { toolSuggestionService } from '../../services/toolSuggestionService';
import { toolPrefillService } from '../../services/toolPrefillService';
import { UIConfig } from '../ContextualUI';
import { api } from '../../lib/api';

// Export for use in ChatPage
export interface UploadedFileInfo {
  id: string;
  file: File;
  preview?: string;
  uploading: boolean;
  uploaded: boolean;
  url?: string;
  error?: string;
  mimeType: string;
}

interface FileUploadPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTool: (config: UIConfig, file?: UploadedFileInfo) => void;
  onFilesAttached?: (files: UploadedFileInfo[]) => void; // Called when Done is clicked
}

export const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return FileImage;
  if (mimeType.startsWith('video/')) return FileVideo;
  if (mimeType.startsWith('audio/')) return FileAudio;
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return FileText;
  return File;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const FileUploadPopup: React.FC<FileUploadPopupProps> = ({
  isOpen,
  onClose,
  onOpenTool,
  onFilesAttached,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [files, setFiles] = useState<UploadedFileInfo[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    addFiles(selectedFiles);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const addFiles = (newFiles: File[]) => {
    const fileInfos: UploadedFileInfo[] = newFiles.map(file => {
      const info: UploadedFileInfo = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        uploading: false,
        uploaded: false,
        mimeType: file.type,
      };

      // Create preview for images
      if (file.type.startsWith('image/')) {
        info.preview = URL.createObjectURL(file);
      }

      return info;
    });

    setFiles(prev => [...prev, ...fileInfos]);

    // Auto-upload files
    fileInfos.forEach(uploadFile);
  };

  const uploadFile = async (fileInfo: UploadedFileInfo) => {
    setFiles(prev => prev.map(f =>
      f.id === fileInfo.id ? { ...f, uploading: true } : f
    ));

    try {
      const formData = new FormData();
      formData.append('file', fileInfo.file);
      formData.append('public', 'true');
      formData.append('path', 'chat-uploads');

      // Don't set Content-Type header - browser sets it automatically with boundary for FormData
      const response = await api.post('/storage/upload', formData);

      setFiles(prev => prev.map(f =>
        f.id === fileInfo.id
          ? { ...f, uploading: false, uploaded: true, url: response.file?.url || response.url }
          : f
      ));
    } catch (error: any) {
      console.error('Upload failed:', error);
      setFiles(prev => prev.map(f =>
        f.id === fileInfo.id
          ? { ...f, uploading: false, error: error.message || 'Upload failed' }
          : f
      ));
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const handleClose = () => {
    // Clean up previews only if not attaching files
    files.forEach(f => {
      if (f.preview) URL.revokeObjectURL(f.preview);
    });
    setFiles([]);
    onClose();
  };

  const handleDone = () => {
    // Pass uploaded files to parent for attachment to chat
    const uploadedFiles = files.filter(f => f.uploaded && f.url);
    if (uploadedFiles.length > 0 && onFilesAttached) {
      onFilesAttached(uploadedFiles);
    }
    // Don't clean up previews - parent will use them
    setFiles([]);
    onClose();
  };

  // Get unique file types for tool suggestions
  const fileTypes = [...new Set(files.map(f => f.file.type))];
  const allSuggestions = fileTypes.flatMap(type =>
    toolSuggestionService.getToolsForFileType(type, 6).tools
  );
  // Remove duplicates
  const uniqueSuggestions = allSuggestions.filter((s, i, arr) =>
    arr.findIndex(x => x.tool.id === s.tool.id) === i
  ).slice(0, 8);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className={cn(
        "relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl",
        isDark ? 'bg-[#1a1a1a]' : 'bg-white'
      )}>
        {/* Header */}
        <div className={cn(
          "flex items-center justify-between px-6 py-4 border-b",
          isDark ? 'border-gray-700' : 'border-gray-200'
        )}>
          <h2 className={cn(
            "text-lg font-semibold",
            isDark ? 'text-white' : 'text-gray-900'
          )}>
            Upload Files
          </h2>
          <button
            onClick={handleClose}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
            )}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
              isDragging
                ? 'border-[#0D9488] bg-[#0D9488]/10'
                : isDark
                  ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/50'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.json,.xml"
            />
            <Upload className={cn(
              "w-12 h-12 mx-auto mb-4",
              isDragging ? 'text-[#0D9488]' : isDark ? 'text-gray-500' : 'text-gray-400'
            )} />
            <p className={cn(
              "text-lg font-medium mb-2",
              isDark ? 'text-white' : 'text-gray-900'
            )}>
              {isDragging ? 'Drop files here' : 'Drag and drop files here'}
            </p>
            <p className={cn(
              "text-sm",
              isDark ? 'text-gray-400' : 'text-gray-500'
            )}>
              or click to browse (Images, PDFs, Documents, Audio, Video)
            </p>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className={cn(
                "text-sm font-medium",
                isDark ? 'text-gray-300' : 'text-gray-700'
              )}>
                Files ({files.length})
              </h3>
              {files.map(fileInfo => {
                const FileIcon = getFileIcon(fileInfo.file.type);
                return (
                  <div
                    key={fileInfo.id}
                    className={cn(
                      "flex items-center gap-4 p-3 rounded-xl border",
                      isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
                    )}
                  >
                    {/* Preview or Icon */}
                    <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      {fileInfo.preview ? (
                        <img
                          src={fileInfo.preview}
                          alt={fileInfo.file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FileIcon className="w-6 h-6 text-gray-500" />
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-medium truncate",
                        isDark ? 'text-white' : 'text-gray-900'
                      )}>
                        {fileInfo.file.name}
                      </p>
                      <p className={cn(
                        "text-xs",
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      )}>
                        {formatFileSize(fileInfo.file.size)}
                        {fileInfo.error && (
                          <span className="text-red-500 ml-2">{fileInfo.error}</span>
                        )}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2">
                      {fileInfo.uploading && (
                        <Loader2 className="w-5 h-5 text-[#0D9488] animate-spin" />
                      )}
                      {fileInfo.uploaded && (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-500">
                          Uploaded
                        </span>
                      )}
                      <button
                        onClick={() => removeFile(fileInfo.id)}
                        className={cn(
                          "p-1.5 rounded-lg transition-colors",
                          isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'
                        )}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tool Suggestions */}
          {uniqueSuggestions.length > 0 && (
            <div className="mt-6">
              <h3 className={cn(
                "text-sm font-medium mb-3",
                isDark ? 'text-gray-300' : 'text-gray-700'
              )}>
                Suggested Tools for Your Files
              </h3>
              <div className="flex flex-wrap gap-2">
                {uniqueSuggestions.map(suggestion => (
                  <button
                    key={suggestion.tool.id}
                    onClick={() => {
                      // Find the first uploaded file that matches this tool's category
                      const uploadedFile = files.find(f => f.uploaded && f.url);

                      // Create prefill data from the uploaded file
                      const prefillData = uploadedFile
                        ? toolPrefillService.createFromFile(
                            uploadedFile.file,
                            uploadedFile.url,
                            uploadedFile.preview
                          )
                        : {};

                      onOpenTool({
                        type: suggestion.tool.type as any, // Type from toolsData is string
                        toolId: suggestion.tool.id,
                        title: suggestion.tool.title,
                        description: suggestion.tool.description,
                        params: prefillData, // Pass prefill data with file info
                      }, uploadedFile);
                      handleClose();
                    }}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105",
                      isDark
                        ? 'bg-[#0D9488]/20 text-[#0D9488] hover:bg-[#0D9488]/30'
                        : 'bg-[#0D9488]/10 text-[#0D9488] hover:bg-[#0D9488]/20'
                    )}
                  >
                    {suggestion.tool.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={cn(
          "flex items-center justify-between px-6 py-4 border-t",
          isDark ? 'border-gray-700' : 'border-gray-200'
        )}>
          <p className={cn(
            "text-xs",
            isDark ? 'text-gray-500' : 'text-gray-400'
          )}>
            {files.some(f => f.file.type.startsWith('image/')) &&
              "Images will be sent to vision-capable AI models"}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                isDark
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              Cancel
            </button>
            {files.length > 0 && files.some(f => f.uploaded) && (
              <button
                onClick={handleDone}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-[#0D9488] text-white hover:bg-[#0D9488]/90 transition-colors"
              >
                Attach to Chat
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploadPopup;
