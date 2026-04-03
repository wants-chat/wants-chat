import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Code, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface MarkdownPreviewToolProps {
  uiConfig?: UIConfig;
}

export const MarkdownPreviewTool: React.FC<MarkdownPreviewToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [input, setInput] = useState('# Welcome to Markdown Preview\n\nStart typing to see the **live preview**!\n\n## Features\n\n- Headers\n- **Bold** and *italic* text\n- [Links](https://example.com)\n- Code blocks\n- Lists and Tables\n\n```javascript\nconst hello = "world";\n```\n\n## Table Example\n\n| Name | Age | City |\n|------|-----|------|\n| John | 30 | NYC |\n| Jane | 25 | LA |\n| Bob | 35 | Chicago |\n\n1. Ordered lists\n2. Also supported\n');
  const [html, setHtml] = useState('');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      const codeContent = params.code || params.content || params.text || '';
      if (codeContent) {
        setInput(codeContent);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  useEffect(() => {
    setHtml(markdownToHtml(input));
  }, [input]);

  const markdownToHtml = (markdown: string): string => {
    let html = markdown;

    // Tables - process before other elements
    // Match table pattern: header row, separator row, and body rows
    html = html.replace(/^(\|.+\|)\s*\n(\|[-:\s|]+\|)\s*\n((?:\|.+\|\s*\n?)+)/gm, (match) => {
      const lines = match.trim().split('\n');
      if (lines.length < 3) return match;

      // Parse header row
      const headerRow = lines[0];
      const headers = headerRow.split('|').slice(1, -1).map((h: string) => h.trim());
      const headerHtml = headers.map((h: string) => `<th>${h}</th>`).join('');

      // Skip separator row (lines[1]) and parse body rows
      const bodyRows = lines.slice(2);
      const rowsHtml = bodyRows.map((row: string) => {
        const cells = row.split('|').slice(1, -1).map((c: string) => c.trim());
        return `<tr>${cells.map((c: string) => `<td>${c}</td>`).join('')}</tr>`;
      }).join('');

      return `<table><thead><tr>${headerHtml}</tr></thead><tbody>${rowsHtml}</tbody></table>`;
    });

    // Headers (h1-h6)
    html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
    html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
    html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre><code class="language-${lang || 'plaintext'}">${escapeHtml(code.trim())}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

    // Unordered lists
    html = html.replace(/^\s*[-*+]\s+(.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, (match) => {
      return '<ul>' + match + '</ul>';
    });

    // Ordered lists
    html = html.replace(/^\s*(\d+)\.\s+(.+)$/gm, '<li>$2</li>');
    html = html.replace(/(<li>.*<\/li>)/s, (match) => {
      if (!match.includes('<ul>')) {
        return '<ol>' + match + '</ol>';
      }
      return match;
    });

    // Blockquotes
    html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');

    // Horizontal rules
    html = html.replace(/^---$/gm, '<hr />');
    html = html.replace(/^\*\*\*$/gm, '<hr />');

    // Paragraphs
    html = html.split('\n\n').map(block => {
      if (
        !block.startsWith('<h') &&
        !block.startsWith('<ul>') &&
        !block.startsWith('<ol>') &&
        !block.startsWith('<pre>') &&
        !block.startsWith('<blockquote>') &&
        !block.startsWith('<hr') &&
        !block.startsWith('<table') &&
        !block.startsWith('<li>') &&
        block.trim() !== ''
      ) {
        return `<p>${block}</p>`;
      }
      return block;
    }).join('\n');

    // Line breaks - but not inside HTML tags (tables, pre, etc.)
    // First, protect content inside tags by replacing newlines in specific elements
    html = html.replace(/<table[\s\S]*?<\/table>/g, (match) => match.replace(/\n/g, ''));
    html = html.replace(/<pre[\s\S]*?<\/pre>/g, (match) => match.replace(/\n/g, '&#10;'));
    html = html.replace(/<ul[\s\S]*?<\/ul>/g, (match) => match.replace(/\n/g, ''));
    html = html.replace(/<ol[\s\S]*?<\/ol>/g, (match) => match.replace(/\n/g, ''));

    // Now apply line breaks to remaining content
    html = html.replace(/\n/g, '<br />');

    return html;
  };

  const escapeHtml = (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  return (
    <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        {t('tools.markdownPreview.markdownPreview', 'Markdown Preview')}
      </h2>

      {/* Prefill Indicator */}
      {isPrefilled && (
        <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
          <Sparkles className="w-4 h-4 text-[#0D9488]" />
          <span className="text-sm text-[#0D9488] font-medium">{t('tools.markdownPreview.codeLoadedFromAiResponse', 'Code loaded from AI response')}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Editor */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Code className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`} />
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.markdownPreview.markdownEditor', 'Markdown Editor')}
            </label>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('tools.markdownPreview.enterMarkdownHere', 'Enter markdown here...')}
            className={`w-full h-[600px] p-4 rounded-lg font-mono text-sm border ${
              theme === 'dark'
                ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400'
                : 'bg-gray-50 text-gray-900 border-gray-300 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-[#0D9488] resize-none`}
          />
        </div>

        {/* Preview */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Eye className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`} />
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.markdownPreview.livePreview', 'Live Preview')}
            </label>
          </div>
          <div
            className={`w-full h-[600px] p-4 rounded-lg border overflow-auto ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600'
                : 'bg-gray-50 border-gray-300'
            } markdown-preview`}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>

      <style>{`
        .markdown-preview {
          line-height: 1.6;
        }
        .markdown-preview h1 {
          font-size: 2em;
          font-weight: bold;
          margin-bottom: 0.5em;
          color: ${theme === 'dark' ? '#ffffff' : '#1a202c'};
        }
        .markdown-preview h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin-top: 1em;
          margin-bottom: 0.5em;
          color: ${theme === 'dark' ? '#ffffff' : '#1a202c'};
        }
        .markdown-preview h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin-top: 1em;
          margin-bottom: 0.5em;
          color: ${theme === 'dark' ? '#ffffff' : '#1a202c'};
        }
        .markdown-preview h4,
        .markdown-preview h5,
        .markdown-preview h6 {
          font-size: 1em;
          font-weight: bold;
          margin-top: 1em;
          margin-bottom: 0.5em;
          color: ${theme === 'dark' ? '#ffffff' : '#1a202c'};
        }
        .markdown-preview p {
          margin-bottom: 1em;
          color: ${theme === 'dark' ? '#e5e7eb' : '#374151'};
        }
        .markdown-preview strong {
          font-weight: bold;
        }
        .markdown-preview em {
          font-style: italic;
        }
        .markdown-preview a {
          color: #0D9488;
          text-decoration: underline;
        }
        .markdown-preview a:hover {
          color: #0F766E;
        }
        .markdown-preview code {
          background-color: ${theme === 'dark' ? '#374151' : '#e5e7eb'};
          padding: 0.2em 0.4em;
          border-radius: 0.25em;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
          color: ${theme === 'dark' ? '#f9fafb' : '#1f2937'};
        }
        .markdown-preview pre {
          background-color: ${theme === 'dark' ? '#1f2937' : '#f3f4f6'};
          padding: 1em;
          border-radius: 0.5em;
          overflow-x: auto;
          margin-bottom: 1em;
        }
        .markdown-preview pre code {
          background-color: transparent;
          padding: 0;
          color: ${theme === 'dark' ? '#f9fafb' : '#1f2937'};
        }
        .markdown-preview ul,
        .markdown-preview ol {
          margin-left: 2em;
          margin-bottom: 1em;
          color: ${theme === 'dark' ? '#e5e7eb' : '#374151'};
        }
        .markdown-preview ul {
          list-style-type: disc;
        }
        .markdown-preview ol {
          list-style-type: decimal;
        }
        .markdown-preview li {
          margin-bottom: 0.25em;
        }
        .markdown-preview blockquote {
          border-left: 4px solid #0D9488;
          padding-left: 1em;
          margin-left: 0;
          margin-bottom: 1em;
          color: ${theme === 'dark' ? '#9ca3af' : '#6b7280'};
          font-style: italic;
        }
        .markdown-preview hr {
          border: none;
          border-top: 2px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'};
          margin: 2em 0;
        }
        .markdown-preview img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5em;
        }
        .markdown-preview table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1em;
        }
        .markdown-preview th,
        .markdown-preview td {
          border: 1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'};
          padding: 0.5em 1em;
          text-align: left;
          color: ${theme === 'dark' ? '#e5e7eb' : '#374151'};
        }
        .markdown-preview th {
          background-color: ${theme === 'dark' ? '#374151' : '#f3f4f6'};
          font-weight: bold;
          color: ${theme === 'dark' ? '#ffffff' : '#1a202c'};
        }
        .markdown-preview tr:nth-child(even) {
          background-color: ${theme === 'dark' ? '#1f2937' : '#f9fafb'};
        }
      `}</style>
    </div>
  );
};
