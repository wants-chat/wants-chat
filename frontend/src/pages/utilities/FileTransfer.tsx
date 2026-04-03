import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Download, File, X, CheckCircle, AlertCircle, FolderOpen } from 'lucide-react';
import Header from '../../components/landing/Header';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

interface FileItem {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}

const FileTransfer: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFileUpload = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: FileItem[] = Array.from(selectedFiles).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'uploading' as const,
    }));

    setFiles((prev) => [...prev, ...newFiles]);

    // Simulate upload progress
    newFiles.forEach((file) => {
      simulateUpload(file.id);
    });
  }, []);

  const simulateUpload = (fileId: string) => {
    const interval = setInterval(() => {
      setFiles((prev) =>
        prev.map((file) => {
          if (file.id === fileId) {
            const newProgress = Math.min(file.progress + Math.random() * 20, 100);
            if (newProgress >= 100) {
              clearInterval(interval);
              return { ...file, progress: 100, status: 'completed' as const };
            }
            return { ...file, progress: newProgress };
          }
          return file;
        })
      );
    }, 200);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileUpload(e.dataTransfer.files);
    },
    [handleFileUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const clearCompleted = () => {
    setFiles((prev) => prev.filter((file) => file.status !== 'completed'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900">
      <BackgroundEffects variant="subtle" />
      <Header />

      <div className="relative z-10 container mx-auto px-4 py-8 mt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                File Transfer
              </h1>
              <p className="text-gray-400">
                Upload and manage your files
              </p>
            </div>

            <div className="space-y-6">
              {/* Upload Zone */}
              <Card className="bg-slate-800/50 border-teal-500/30 backdrop-blur-xl">
                <CardContent className="p-6">
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`
                      relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
                      ${
                        isDragging
                          ? 'border-teal-400 bg-teal-900/30'
                          : 'border-teal-500/30 bg-gradient-to-br from-teal-900/10 to-cyan-900/10'
                      }
                    `}
                  >
                    <motion.div
                      animate={isDragging ? { scale: 1.05 } : { scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FolderOpen className="w-16 h-16 mx-auto mb-4 text-teal-400" />
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {isDragging ? 'Drop files here' : 'Drag & drop files here'}
                      </h3>
                      <p className="text-gray-400 mb-4">or</p>
                      <label htmlFor="file-upload">
                        <Button
                          asChild
                          className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                        >
                          <span className="cursor-pointer">
                            <Upload className="w-4 h-4 mr-2" />
                            Browse Files
                          </span>
                        </Button>
                      </label>
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFileUpload(e.target.files)}
                      />
                      <p className="text-sm text-gray-500 mt-4">
                        Support for all file types • Max 100MB per file
                      </p>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>

              {/* Files List */}
              {files.length > 0 && (
                <Card className="bg-slate-800/50 border-teal-500/30 backdrop-blur-xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-teal-400">
                        <File className="w-5 h-5" />
                        Files ({files.length})
                      </CardTitle>
                      {files.some((f) => f.status === 'completed') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearCompleted}
                          className="text-gray-400 hover:text-white"
                        >
                          Clear Completed
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <AnimatePresence>
                        {files.map((file) => (
                          <motion.div
                            key={file.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            className="bg-slate-700/30 rounded-lg p-4 border border-teal-500/20"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {file.status === 'completed' ? (
                                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                ) : file.status === 'error' ? (
                                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                                ) : (
                                  <Upload className="w-5 h-5 text-teal-400 flex-shrink-0 animate-pulse" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-white font-medium truncate">
                                    {file.name}
                                  </p>
                                  <p className="text-sm text-gray-400">
                                    {formatFileSize(file.size)}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(file.id)}
                                className="text-gray-400 hover:text-red-400 ml-2"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>

                            {/* Progress Bar */}
                            {file.status === 'uploading' && (
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs text-gray-400">
                                  <span>Uploading...</span>
                                  <span>{file.progress.toFixed(0)}%</span>
                                </div>
                                <div className="w-full bg-slate-600 rounded-full h-2 overflow-hidden">
                                  <motion.div
                                    className="h-full bg-gradient-to-r from-teal-500 to-cyan-500"
                                    style={{ width: `${file.progress}%` }}
                                    transition={{ duration: 0.3 }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Download Button for Completed */}
                            {file.status === 'completed' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full mt-2 text-teal-400 hover:text-teal-300 hover:bg-teal-900/30"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                            )}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FileTransfer;
