'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileJson,
  Printer,
  Copy,
  Upload,
  ChevronDown,
  Check,
  X,
  Loader2,
} from 'lucide-react';

export interface ExportDropdownProps {
  onExportCSV?: () => void;
  onExportExcel?: () => void;
  onExportJSON?: () => void;
  onExportPDF?: () => Promise<void>;
  onPrint?: () => void;
  onCopyToClipboard?: () => Promise<boolean>;
  onImportCSV?: (file: File) => Promise<void>;
  onImportJSON?: (file: File) => Promise<void>;
  disabled?: boolean;
  showImport?: boolean;
  className?: string;
  theme?: 'light' | 'dark';
}

export function ExportDropdown({
  onExportCSV,
  onExportExcel,
  onExportJSON,
  onExportPDF,
  onPrint,
  onCopyToClipboard,
  onImportCSV,
  onImportJSON,
  disabled = false,
  showImport = true,
  className = '',
  theme = 'light',
}: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importType, setImportType] = useState<'csv' | 'json'>('csv');

  const isDark = theme === 'dark';

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportPDF = async () => {
    if (!onExportPDF) return;
    setIsLoading(true);
    try {
      await onExportPDF();
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  const handleCopy = async () => {
    if (!onCopyToClipboard) return;
    try {
      const success = await onCopyToClipboard();
      if (success) {
        setCopySuccess(true);
        // Keep dropdown open briefly to show success, then close
        setTimeout(() => {
          setCopySuccess(false);
          setIsOpen(false);
        }, 800);
      } else {
        // Copy failed - close dropdown
        setIsOpen(false);
        alert('Failed to copy to clipboard');
      }
    } catch (error) {
      console.error('Copy error:', error);
      setIsOpen(false);
      alert('Failed to copy to clipboard');
    }
  };

  const handleImportClick = (type: 'csv' | 'json') => {
    setImportType(type);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      if (importType === 'csv' && onImportCSV) {
        await onImportCSV(file);
      } else if (importType === 'json' && onImportJSON) {
        await onImportJSON(file);
      }
    } finally {
      setIsLoading(false);
      setIsOpen(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const menuItemClass = `
    flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left
    transition-colors duration-150
    ${isDark
      ? 'hover:bg-gray-700 text-gray-200'
      : 'hover:bg-gray-100 text-gray-700'
    }
  `;

  const dividerClass = `my-1 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`;

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      {/* Hidden file input for imports */}
      <input
        ref={fileInputRef}
        type="file"
        accept={importType === 'csv' ? '.csv' : '.json'}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || isLoading}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
          transition-all duration-200
          ${disabled || isLoading
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:shadow-md active:scale-95'
          }
          ${isDark
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
          }
        `}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        <span>Export</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`
            absolute right-0 mt-2 w-56 rounded-lg shadow-xl z-50
            border overflow-hidden
            ${isDark
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
            }
          `}
        >
          {/* Export Section */}
          <div className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Export As
          </div>

          {onExportCSV && (
            <button
              onClick={() => { onExportCSV(); setIsOpen(false); }}
              className={menuItemClass}
            >
              <FileText className="w-4 h-4 text-green-500" />
              <span>CSV File</span>
              <span className={`ml-auto text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>.csv</span>
            </button>
          )}

          {onExportExcel && (
            <button
              onClick={() => { onExportExcel(); setIsOpen(false); }}
              className={menuItemClass}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Excel File</span>
              <span className={`ml-auto text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>.xls</span>
            </button>
          )}

          {onExportJSON && (
            <button
              onClick={() => { onExportJSON(); setIsOpen(false); }}
              className={menuItemClass}
            >
              <FileJson className="w-4 h-4 text-yellow-500" />
              <span>JSON File</span>
              <span className={`ml-auto text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>.json</span>
            </button>
          )}

          {onExportPDF && (
            <button
              onClick={handleExportPDF}
              className={menuItemClass}
            >
              <FileText className="w-4 h-4 text-red-500" />
              <span>PDF Document</span>
              <span className={`ml-auto text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>.pdf</span>
            </button>
          )}

          <div className={dividerClass} />

          {/* Quick Actions */}
          {onPrint && (
            <button
              onClick={() => { onPrint(); setIsOpen(false); }}
              className={menuItemClass}
            >
              <Printer className="w-4 h-4 text-purple-500" />
              <span>Print</span>
            </button>
          )}

          {onCopyToClipboard && (
            <button
              onClick={handleCopy}
              className={menuItemClass}
            >
              {copySuccess ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-blue-500" />
              )}
              <span>{copySuccess ? 'Copied!' : 'Copy to Clipboard'}</span>
            </button>
          )}

          {/* Import Section */}
          {showImport && (onImportCSV || onImportJSON) && (
            <>
              <div className={dividerClass} />
              <div className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Import From
              </div>

              {onImportCSV && (
                <button
                  onClick={() => handleImportClick('csv')}
                  className={menuItemClass}
                >
                  <Upload className="w-4 h-4 text-green-500" />
                  <span>Import CSV</span>
                </button>
              )}

              {onImportJSON && (
                <button
                  onClick={() => handleImportClick('json')}
                  className={menuItemClass}
                >
                  <Upload className="w-4 h-4 text-yellow-500" />
                  <span>Import JSON</span>
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ExportDropdown;
