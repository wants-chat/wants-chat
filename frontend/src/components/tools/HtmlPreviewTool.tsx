import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Code, Eye, Trash2, FileCode, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface HtmlPreviewToolProps {
  uiConfig?: UIConfig;
}

const EXAMPLE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Example Page</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .card {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      padding: 20px;
      backdrop-filter: blur(10px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }
    h1 { margin-top: 0; }
    button {
      background: #0D9488;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
    }
    button:hover {
      background: #0F766E;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>Welcome to HTML Preview!</h1>
    <p>This is a live preview of your HTML code.</p>
    <button onclick="alert('Hello from the preview!')">Click Me</button>
  </div>
</body>
</html>`;

export const HtmlPreviewTool: React.FC<HtmlPreviewToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [htmlCode, setHtmlCode] = useState('');
  const [isPrefilled, setIsPrefilled] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      const codeContent = params.code || params.content || params.text || '';
      if (codeContent) {
        setHtmlCode(codeContent);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  useEffect(() => {
    updatePreview();
  }, [htmlCode]);

  const updatePreview = () => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(htmlCode);
        iframeDoc.close();
      }
    }
  };

  const loadExample = () => {
    setHtmlCode(EXAMPLE_HTML);
  };

  const clearCode = () => {
    setHtmlCode('');
  };

  return (
    <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        {t('tools.htmlPreview.htmlPreview', 'HTML Preview')}
      </h2>

      <div className="space-y-4">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.htmlPreview.codeLoadedFromAiResponse', 'Code loaded from AI response')}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={loadExample}
            className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] transition-colors font-medium"
          >
            <FileCode className="w-4 h-4" />
            {t('tools.htmlPreview.loadExample', 'Load Example')}
          </button>
          <button
            onClick={clearCode}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              theme === 'dark'
                ? 'bg-gray-700 text-white hover:bg-gray-600'
                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            {t('tools.htmlPreview.clear', 'Clear')}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* HTML Code Editor */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Code className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`} />
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.htmlPreview.htmlCode', 'HTML Code')}
              </label>
            </div>
            <textarea
              value={htmlCode}
              onChange={(e) => setHtmlCode(e.target.value)}
              placeholder={t('tools.htmlPreview.enterHtmlCodeHere', 'Enter HTML code here...')}
              className={`w-full h-[600px] p-4 rounded-lg font-mono text-sm border ${
                theme === 'dark'
                  ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400'
                  : 'bg-gray-50 text-gray-900 border-gray-300 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488] resize-none`}
            />
          </div>

          {/* Live Preview */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Eye className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`} />
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.htmlPreview.livePreview', 'Live Preview')}
              </label>
            </div>
            <div
              className={`w-full h-[600px] rounded-lg border overflow-hidden ${
                theme === 'dark'
                  ? 'bg-white border-gray-600'
                  : 'bg-white border-gray-300'
              }`}
            >
              {htmlCode ? (
                <iframe
                  ref={iframeRef}
                  className="w-full h-full"
                  title={t('tools.htmlPreview.htmlPreview2', 'HTML Preview')}
                  sandbox="allow-scripts allow-same-origin"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <Eye className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p>{t('tools.htmlPreview.enterHtmlCodeToSee', 'Enter HTML code to see the preview')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className={`p-4 rounded-lg border ${
          theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-300'
        }`}>
          <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <p className="font-semibold mb-2">{t('tools.htmlPreview.tips', 'Tips:')}</p>
            <ul className="list-disc list-inside space-y-1">
              <li>{t('tools.htmlPreview.thePreviewUpdatesAutomaticallyAs', 'The preview updates automatically as you type')}</li>
              <li>You can include CSS in &lt;style&gt; tags or inline</li>
              <li>{t('tools.htmlPreview.javascriptWillExecuteInThe', 'JavaScript will execute in the preview (use with caution)')}</li>
              <li>{t('tools.htmlPreview.thePreviewIsSandboxedFor', 'The preview is sandboxed for security')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
