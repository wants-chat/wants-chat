import React from 'react';
import { Button } from '../../ui/button';
import { Upload, X, CloudUpload, InsertDriveFile, Delete, Warning as AlertCircle } from '@mui/icons-material';
import { ReportFile } from '../../../types/health';

interface MedicalReportsUploadSectionProps {
  reports: ReportFile[];
  isDragging: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onRemoveReport: (id: string) => void;
  formatFileSize: (bytes: number) => string;
}

const MedicalReportsUploadSection: React.FC<MedicalReportsUploadSectionProps> = ({
  reports,
  isDragging,
  fileInputRef,
  onFileSelect,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onRemoveReport,
  formatFileSize
}) => {
  return (
    <div className="mb-8 rounded-2xl bg-white/5 border border-white/10 border-l-4 border-l-teal-500">
      <div className="p-6 pb-2">
        <h3 className="flex items-center gap-3 text-xl font-bold text-white">
          <CloudUpload className="h-6 w-6 text-teal-400" />
          Medical Reports
        </h3>
        <p className="text-base text-white/60 mt-1">
          Upload medical reports, test results, X-rays, or other relevant documents
        </p>
      </div>
      <div className="p-6 pt-4">
        {/* Drag and Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            isDragging
              ? 'border-teal-500 bg-teal-500/10'
              : 'border-white/20 hover:border-teal-500/50 hover:bg-white/5'
          }`}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf"
            onChange={onFileSelect}
            className="hidden"
          />

          <div className="flex flex-col items-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              isDragging ? 'bg-teal-500/20' : 'bg-white/10'
            }`}>
              <CloudUpload className={`h-8 w-8 ${
                isDragging ? 'text-teal-400' : 'text-white/40'
              }`} />
            </div>

            <h3 className="text-lg font-semibold mb-2 text-white">
              {isDragging ? 'Drop your files here' : 'Drag & Drop medical reports'}
            </h3>

            <p className="text-sm text-white/60 mb-4">
              or click to browse from your device
            </p>

            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl bg-transparent border-white/20 text-white hover:bg-white/10"
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose Files
            </Button>

            <p className="text-xs text-white/40 mt-4">
              Supported formats: JPG, PNG, GIF, WebP, PDF (Max 10MB per file)
            </p>
          </div>
        </div>

        {/* Uploaded Reports Preview */}
        {reports.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-white/80 mb-3">
              Uploaded Reports ({reports.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="relative group border border-white/10 rounded-xl overflow-hidden bg-white/5 hover:border-teal-500/30 transition-all"
                >
                  {/* Preview */}
                  {report.file.type.startsWith('image/') ? (
                    <div className="aspect-[4/3] relative">
                      <img
                        src={report.preview}
                        alt={report.file.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => onRemoveReport(report.id)}
                          className="text-white hover:bg-red-500/20"
                        >
                          <Delete className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-[4/3] flex flex-col items-center justify-center bg-white/5">
                      <InsertDriveFile className="h-12 w-12 text-white/40 mb-2" />
                      <span className="text-xs text-white/50">PDF Document</span>
                    </div>
                  )}

                  {/* File Info */}
                  <div className="p-3 border-t border-white/10">
                    <p className="text-xs font-medium text-white truncate">
                      {report.file.name}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-white/50">
                        {formatFileSize(report.file.size)}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveReport(report.id)}
                        className="h-6 w-6 text-red-400 hover:bg-red-500/20"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5" />
                <div className="text-xs text-yellow-300">
                  <strong>Note:</strong> These documents will be stored securely with your medical record.
                  Ensure you have permission to upload any medical documents.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalReportsUploadSection;
