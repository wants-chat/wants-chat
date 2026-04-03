import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy, File, ExternalLink, Wand2, Loader2, X, Send } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../contexts/ThemeContext';

interface CodeViewerProps {
  content: string;
  language: string;
  filePath: string;
  isLoading?: boolean;
  // Optional editing props
  appId?: string;
  codeType?: 'frontend' | 'backend' | 'mobile';
  onEditWithAI?: (filePath: string, instruction: string) => void;
  isEditing?: boolean;
  editProgress?: string;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  content,
  language,
  filePath,
  isLoading = false,
  appId,
  codeType,
  onEditWithAI,
  isEditing = false,
  editProgress,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const isDark = theme === 'dark';
  const [copied, setCopied] = useState(false);
  const [showEditInput, setShowEditInput] = useState(false);
  const [editInstruction, setEditInstruction] = useState('');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEditSubmit = () => {
    if (editInstruction.trim() && onEditWithAI) {
      onEditWithAI(filePath, editInstruction);
      setEditInstruction('');
      setShowEditInput(false);
    }
  };

  const fileName = filePath.split('/').pop() || filePath;

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col">
        {/* Header skeleton */}
        <div
          className={cn(
            'flex items-center justify-between px-4 py-2 border-b',
            isDark ? 'bg-[#21252b] border-white/10' : 'bg-slate-100 border-slate-200'
          )}
        >
          <div className={cn('h-4 w-32 rounded animate-pulse', isDark ? 'bg-white/10' : 'bg-slate-200')} />
          <div className={cn('h-6 w-16 rounded animate-pulse', isDark ? 'bg-white/10' : 'bg-slate-200')} />
        </div>
        {/* Code skeleton */}
        <div className="flex-1 p-4 space-y-2 overflow-hidden">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div
              key={i}
              className={cn('h-4 rounded animate-pulse', isDark ? 'bg-white/5' : 'bg-slate-100')}
              style={{ width: `${40 + Math.random() * 50}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div
        className={cn(
          'flex-1 flex items-center justify-center',
          isDark ? 'text-slate-400' : 'text-slate-500'
        )}
      >
        <div className="text-center">
          <File className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">{t('codeViewer.selectFile')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header with file path and buttons */}
      <div
        className={cn(
          'flex items-center justify-between px-4 py-2 border-b flex-shrink-0',
          isDark ? 'bg-[#21252b] border-white/10' : 'bg-slate-100 border-slate-200'
        )}
      >
        <div className="flex items-center gap-2 text-sm min-w-0">
          <File className={cn('w-4 h-4 flex-shrink-0', isDark ? 'text-slate-400' : 'text-slate-500')} />
          <span className={cn('truncate', isDark ? 'text-slate-300' : 'text-slate-700')}>
            {filePath}
          </span>
          <span
            className={cn(
              'text-xs px-1.5 py-0.5 rounded uppercase font-medium flex-shrink-0',
              isDark ? 'bg-white/10 text-slate-400' : 'bg-slate-200 text-slate-500'
            )}
          >
            {language}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Edit with AI button */}
          {onEditWithAI && (
            <button
              onClick={() => setShowEditInput(!showEditInput)}
              disabled={isEditing}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-all flex-shrink-0',
                showEditInput
                  ? isDark
                    ? 'bg-violet-500/20 text-violet-400'
                    : 'bg-violet-100 text-violet-600'
                  : isDark
                    ? 'hover:bg-violet-500/10 text-violet-400 hover:text-violet-300'
                    : 'hover:bg-violet-50 text-violet-500 hover:text-violet-600',
                isEditing && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isEditing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{t('codeViewer.editing')}</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>{t('codeViewer.editWithAI')}</span>
                </>
              )}
            </button>
          )}
          {/* Copy button */}
          <button
            onClick={handleCopy}
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-all flex-shrink-0',
              isDark
                ? 'hover:bg-white/10 text-slate-400 hover:text-slate-200'
                : 'hover:bg-slate-200 text-slate-500 hover:text-slate-700'
            )}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-500" />
                <span className="text-green-500">{t('codeViewer.copied')}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{t('codeViewer.copy')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Edit instruction input */}
      {showEditInput && (
        <div
          className={cn(
            'flex items-center gap-2 px-4 py-2 border-b',
            isDark ? 'bg-[#1a1d23] border-white/10' : 'bg-slate-50 border-slate-200'
          )}
        >
          <input
            type="text"
            value={editInstruction}
            onChange={(e) => setEditInstruction(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleEditSubmit()}
            placeholder={t('codeViewer.editPlaceholder')}
            className={cn(
              'flex-1 px-3 py-1.5 rounded text-sm outline-none',
              isDark
                ? 'bg-[#282c34] text-white placeholder-slate-500 border border-white/10 focus:border-violet-500/50'
                : 'bg-white text-slate-900 placeholder-slate-400 border border-slate-200 focus:border-violet-400'
            )}
            autoFocus
          />
          <button
            onClick={handleEditSubmit}
            disabled={!editInstruction.trim() || isEditing}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all',
              editInstruction.trim() && !isEditing
                ? isDark
                  ? 'bg-violet-600 text-white hover:bg-violet-500'
                  : 'bg-violet-500 text-white hover:bg-violet-600'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            )}
          >
            <Send className="w-3.5 h-3.5" />
            {t('codeViewer.apply')}
          </button>
          <button
            onClick={() => {
              setShowEditInput(false);
              setEditInstruction('');
            }}
            className={cn(
              'p-1.5 rounded transition-all',
              isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-200 text-slate-500'
            )}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Edit progress indicator */}
      {isEditing && editProgress && (
        <div
          className={cn(
            'flex items-center gap-2 px-4 py-2 border-b text-xs',
            isDark ? 'bg-violet-500/10 border-white/10 text-violet-400' : 'bg-violet-50 border-slate-200 text-violet-600'
          )}
        >
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          {editProgress}
        </div>
      )}

      {/* Code content */}
      <div className="flex-1 overflow-auto">
        <SyntaxHighlighter
          language={language}
          style={isDark ? oneDark : oneLight}
          customStyle={{
            margin: 0,
            padding: '1rem',
            fontSize: '0.8125rem',
            lineHeight: '1.5',
            background: isDark ? '#282c34' : '#fafafa',
            height: '100%',
            minHeight: '100%',
          }}
          showLineNumbers
          lineNumberStyle={{
            minWidth: '3em',
            paddingRight: '1em',
            color: isDark ? '#4b5263' : '#9ca3af',
            userSelect: 'none',
          }}
          wrapLines
          wrapLongLines
        >
          {content}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeViewer;
