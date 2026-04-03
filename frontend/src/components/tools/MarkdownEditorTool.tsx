import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Copy, Download, Eye, Edit3, Bold, Italic, Link, List, ListOrdered, Quote, Code, Heading, Image as ImageIcon, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface MarkdownEditorToolProps {
  uiConfig?: UIConfig;
}

export const MarkdownEditorTool: React.FC<MarkdownEditorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [markdown, setMarkdown] = useState(`# Welcome to Markdown Editor

This is a **live preview** markdown editor. Start typing to see the magic!

## Features

- Real-time preview
- Toolbar for quick formatting
- Export to HTML
- Dark mode support

### Code Example

\`\`\`javascript
const greeting = "Hello, World!";
console.log(greeting);
\`\`\`

### Table Example

| Feature | Status |
|---------|--------|
| Preview | ✅ |
| Export | ✅ |
| Toolbar | ✅ |

> This is a blockquote. Perfect for highlighting important information.

---

[Visit wants.chat](https://wants.chat) for more tools!
`);
  const [copied, setCopied] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.text || params.content || params.code) {
        setMarkdown(params.text || params.content || params.code || '');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const insertText = (before: string, after: string = '', placeholder: string = '') => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdown.substring(start, end) || placeholder;

    const newText = markdown.substring(0, start) + before + selectedText + after + markdown.substring(end);
    setMarkdown(newText);

    // Set cursor position
    setTimeout(() => {
      textarea.focus();
      const newPos = start + before.length + (selectedText === placeholder ? 0 : selectedText.length);
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const toolbarActions = [
    { icon: Bold, action: () => insertText('**', '**', 'bold text'), title: 'Bold' },
    { icon: Italic, action: () => insertText('*', '*', 'italic text'), title: 'Italic' },
    { icon: Heading, action: () => insertText('## ', '', 'Heading'), title: 'Heading' },
    { icon: Link, action: () => insertText('[', '](url)', 'link text'), title: 'Link' },
    { icon: ImageIcon, action: () => insertText('![', '](url)', 'alt text'), title: 'Image' },
    { icon: Code, action: () => insertText('`', '`', 'code'), title: 'Inline Code' },
    { icon: Quote, action: () => insertText('> ', '', 'quote'), title: 'Quote' },
    { icon: List, action: () => insertText('- ', '', 'list item'), title: 'Bullet List' },
    { icon: ListOrdered, action: () => insertText('1. ', '', 'list item'), title: 'Numbered List' },
  ];

  const parseMarkdown = (md: string): string => {
    let html = md;

    // Code blocks (must be before inline code)
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
      return `<pre class="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto my-4"><code class="language-${lang}">${escapeHtml(code.trim())}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');

    // Headers
    html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-6 mb-2">$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-8 mb-3">$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>');

    // Bold and Italic
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-500 hover:underline" target="_blank" rel="noopener">$1</a>');

    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4" />');

    // Blockquotes
    html = html.replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-blue-500 pl-4 py-2 my-4 italic bg-blue-50 dark:bg-blue-900/20 rounded-r">$1</blockquote>');

    // Horizontal rules
    html = html.replace(/^---$/gm, '<hr class="my-8 border-gray-300 dark:border-gray-600" />');

    // Tables
    html = html.replace(/^\|(.+)\|$/gm, (match, content) => {
      const cells = content.split('|').map((cell: string) => cell.trim());
      const isHeader = cells.every((cell: string) => cell.match(/^-+$/));
      if (isHeader) return '';

      const cellTag = 'td';
      const cellsHtml = cells.map((cell: string) => `<${cellTag} class="border border-gray-300 dark:border-gray-600 px-4 py-2">${cell}</${cellTag}>`).join('');
      return `<tr>${cellsHtml}</tr>`;
    });

    // Wrap tables
    html = html.replace(/(<tr>[\s\S]*?<\/tr>)+/g, (match) => {
      return `<table class="w-full border-collapse my-4"><tbody>${match}</tbody></table>`;
    });

    // Lists
    html = html.replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>');
    html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>');

    // Wrap list items
    html = html.replace(/(<li class="ml-4 list-disc">[\s\S]*?<\/li>)+/g, (match) => {
      return `<ul class="my-4">${match}</ul>`;
    });
    html = html.replace(/(<li class="ml-4 list-decimal">[\s\S]*?<\/li>)+/g, (match) => {
      return `<ol class="my-4">${match}</ol>`;
    });

    // Paragraphs
    html = html.split('\n\n').map(block => {
      if (block.startsWith('<') || block.trim() === '') return block;
      return `<p class="my-4">${block.replace(/\n/g, '<br/>')}</p>`;
    }).join('\n');

    return html;
  };

  const escapeHtml = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const htmlOutput = useMemo(() => parseMarkdown(markdown), [markdown]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownloadHtml = () => {
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Export</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="max-w-3xl mx-auto p-8">
${htmlOutput}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'markdown-export.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadMd = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-slate-900/20' : 'bg-gradient-to-r from-white to-slate-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-500/10 rounded-lg">
              <FileText className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.markdownEditor.markdownEditor', 'Markdown Editor')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.markdownEditor.writeAndPreviewMarkdownIn', 'Write and preview Markdown in real-time')}</p>
            </div>
            {isPrefilled && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0D9488]/10 rounded-lg border border-[#0D9488]/20">
                <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
                <span className="text-xs text-[#0D9488] font-medium">{t('tools.markdownEditor.prefilled', 'Prefilled')}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex rounded-lg overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <button
                onClick={() => setViewMode('edit')}
                className={`px-3 py-1.5 text-sm flex items-center gap-1 transition-colors ${
                  viewMode === 'edit'
                    ? 'bg-slate-500 text-white'
                    : isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Edit3 className="w-4 h-4" />
                {t('tools.markdownEditor.edit', 'Edit')}
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1.5 text-sm transition-colors ${
                  viewMode === 'split'
                    ? 'bg-slate-500 text-white'
                    : isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t('tools.markdownEditor.split', 'Split')}
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1.5 text-sm flex items-center gap-1 transition-colors ${
                  viewMode === 'preview'
                    ? 'bg-slate-500 text-white'
                    : isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Eye className="w-4 h-4" />
                {t('tools.markdownEditor.preview', 'Preview')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      {viewMode !== 'preview' && (
        <div className={`px-4 py-2 border-b ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-100 bg-gray-50'}`}>
          <div className="flex flex-wrap gap-1">
            {toolbarActions.map((item, index) => (
              <button
                key={index}
                onClick={item.action}
                title={item.title}
                className={`p-2 rounded transition-colors ${
                  isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'
                }`}
              >
                <item.icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-6">
        <div className={`grid gap-6 ${viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          {/* Editor */}
          {viewMode !== 'preview' && (
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.markdownEditor.markdown', 'Markdown')}
              </label>
              <textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                placeholder={t('tools.markdownEditor.writeYourMarkdownHere', 'Write your markdown here...')}
                className={`w-full h-[500px] px-4 py-3 rounded-lg border font-mono text-sm resize-none ${
                  isDark
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-slate-500 focus:border-transparent`}
              />
            </div>
          )}

          {/* Preview */}
          {viewMode !== 'edit' && (
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.markdownEditor.preview2', 'Preview')}
              </label>
              <div
                className={`h-[500px] px-4 py-3 rounded-lg border overflow-auto prose ${isDark ? 'prose-invert' : ''} max-w-none ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
                dangerouslySetInnerHTML={{ __html: htmlOutput }}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => handleCopy(markdown, 'md')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
              copied === 'md'
                ? 'bg-green-500 text-white'
                : isDark
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <Copy className="w-4 h-4" />
            {copied === 'md' ? t('tools.markdownEditor.copied', 'Copied!') : t('tools.markdownEditor.copyMarkdown', 'Copy Markdown')}
          </button>
          <button
            onClick={() => handleCopy(htmlOutput, 'html')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
              copied === 'html'
                ? 'bg-green-500 text-white'
                : isDark
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <Copy className="w-4 h-4" />
            {copied === 'html' ? t('tools.markdownEditor.copied2', 'Copied!') : t('tools.markdownEditor.copyHtml', 'Copy HTML')}
          </button>
          <button
            onClick={handleDownloadMd}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
              isDark
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <Download className="w-4 h-4" />
            {t('tools.markdownEditor.downloadMd', 'Download .md')}
          </button>
          <button
            onClick={handleDownloadHtml}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
              isDark
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <Download className="w-4 h-4" />
            {t('tools.markdownEditor.downloadHtml', 'Download HTML')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarkdownEditorTool;
