import { useState } from 'react';
import Header from '../../components/landing/Header';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Copy, Check, FileText, Type, Calculator, Eye } from 'lucide-react';

export default function TextTools() {
  const [copied, setCopied] = useState<string | null>(null);

  // JSON Formatter State
  const [jsonInput, setJsonInput] = useState('');
  const [jsonOutput, setJsonOutput] = useState('');

  // Case Converter State
  const [caseInput, setCaseInput] = useState('');
  const [caseOutput, setCaseOutput] = useState('');

  // Word Counter State
  const [counterText, setCounterText] = useState('');
  const [wordStats, setWordStats] = useState({ words: 0, chars: 0, lines: 0, sentences: 0 });

  // Markdown Preview State
  const [markdownInput, setMarkdownInput] = useState('');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonOutput(JSON.stringify(parsed, null, 2));
    } catch (error) {
      setJsonOutput('Invalid JSON: ' + (error as Error).message);
    }
  };

  const minifyJSON = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonOutput(JSON.stringify(parsed));
    } catch (error) {
      setJsonOutput('Invalid JSON: ' + (error as Error).message);
    }
  };

  const convertCase = (type: string) => {
    let result = caseInput;
    switch (type) {
      case 'upper':
        result = caseInput.toUpperCase();
        break;
      case 'lower':
        result = caseInput.toLowerCase();
        break;
      case 'title':
        result = caseInput.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
        break;
      case 'sentence':
        result = caseInput.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
        break;
      case 'camel':
        result = caseInput.replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) =>
          index === 0 ? letter.toLowerCase() : letter.toUpperCase()
        ).replace(/\s+/g, '');
        break;
      case 'snake':
        result = caseInput.toLowerCase().replace(/\s+/g, '_');
        break;
      case 'kebab':
        result = caseInput.toLowerCase().replace(/\s+/g, '-');
        break;
    }
    setCaseOutput(result);
  };

  const countWords = (text: string) => {
    setCounterText(text);
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const lines = text.split('\n').length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
    setWordStats({ words, chars, lines, sentences });
  };

  const renderMarkdown = (md: string): string => {
    let html = md;
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-4 mb-2">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-4 mb-2">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-4 mb-2">$1</h1>');
    // Bold
    html = html.replace(/\*\*(.*)\*\*/gim, '<strong class="font-bold">$1</strong>');
    // Italic
    html = html.replace(/\*(.*)\*/gim, '<em class="italic">$1</em>');
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-teal-400 hover:underline">$1</a>');
    // Line breaks
    html = html.replace(/\n/gim, '<br />');
    return html;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <BackgroundEffects />
      <Header />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              Text Tools
            </h1>
            <p className="text-gray-400">Powerful text manipulation and formatting utilities</p>
          </div>

          <Tabs defaultValue="json" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 backdrop-blur-sm">
              <TabsTrigger value="json" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500">
                <FileText className="w-4 h-4 mr-2" />
                JSON
              </TabsTrigger>
              <TabsTrigger value="case" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500">
                <Type className="w-4 h-4 mr-2" />
                Case
              </TabsTrigger>
              <TabsTrigger value="counter" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500">
                <Calculator className="w-4 h-4 mr-2" />
                Counter
              </TabsTrigger>
              <TabsTrigger value="markdown" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500">
                <Eye className="w-4 h-4 mr-2" />
                Markdown
              </TabsTrigger>
            </TabsList>

            <TabsContent value="json" className="space-y-4 mt-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">JSON Formatter</h2>
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder='{"name":"John","age":30}'
                  className="w-full h-48 bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-white font-mono text-sm focus:border-teal-500 focus:outline-none"
                />
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={formatJSON}
                    className="px-6 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                  >
                    Format
                  </button>
                  <button
                    onClick={minifyJSON}
                    className="px-6 py-2 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                  >
                    Minify
                  </button>
                </div>
                {jsonOutput && (
                  <div className="mt-4 relative">
                    <textarea
                      value={jsonOutput}
                      readOnly
                      className="w-full h-48 bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-white font-mono text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(jsonOutput, 'json')}
                      className="absolute top-4 right-4 p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      {copied === 'json' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="case" className="space-y-4 mt-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Case Converter</h2>
                <textarea
                  value={caseInput}
                  onChange={(e) => setCaseInput(e.target.value)}
                  placeholder="Enter your text here"
                  className="w-full h-32 bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-white focus:border-teal-500 focus:outline-none"
                />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  <button onClick={() => convertCase('upper')} className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-sm">
                    UPPER CASE
                  </button>
                  <button onClick={() => convertCase('lower')} className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-sm">
                    lower case
                  </button>
                  <button onClick={() => convertCase('title')} className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-sm">
                    Title Case
                  </button>
                  <button onClick={() => convertCase('sentence')} className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-sm">
                    Sentence case
                  </button>
                  <button onClick={() => convertCase('camel')} className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-sm">
                    camelCase
                  </button>
                  <button onClick={() => convertCase('snake')} className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-sm">
                    snake_case
                  </button>
                  <button onClick={() => convertCase('kebab')} className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-sm">
                    kebab-case
                  </button>
                </div>
                {caseOutput && (
                  <div className="mt-4 relative">
                    <textarea
                      value={caseOutput}
                      readOnly
                      className="w-full h-32 bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-white"
                    />
                    <button
                      onClick={() => copyToClipboard(caseOutput, 'case')}
                      className="absolute top-4 right-4 p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      {copied === 'case' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="counter" className="space-y-4 mt-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Word Counter</h2>
                <textarea
                  value={counterText}
                  onChange={(e) => countWords(e.target.value)}
                  placeholder="Type or paste your text here..."
                  className="w-full h-48 bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-white focus:border-teal-500 focus:outline-none"
                />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-lg p-4 border border-teal-500/30">
                    <div className="text-3xl font-bold text-teal-400">{wordStats.words}</div>
                    <div className="text-sm text-gray-400 mt-1">Words</div>
                  </div>
                  <div className="bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-lg p-4 border border-teal-500/30">
                    <div className="text-3xl font-bold text-teal-400">{wordStats.chars}</div>
                    <div className="text-sm text-gray-400 mt-1">Characters</div>
                  </div>
                  <div className="bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-lg p-4 border border-teal-500/30">
                    <div className="text-3xl font-bold text-teal-400">{wordStats.lines}</div>
                    <div className="text-sm text-gray-400 mt-1">Lines</div>
                  </div>
                  <div className="bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-lg p-4 border border-teal-500/30">
                    <div className="text-3xl font-bold text-teal-400">{wordStats.sentences}</div>
                    <div className="text-sm text-gray-400 mt-1">Sentences</div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="markdown" className="space-y-4 mt-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Markdown Preview</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Markdown Input</label>
                    <textarea
                      value={markdownInput}
                      onChange={(e) => setMarkdownInput(e.target.value)}
                      placeholder="# Heading&#10;**Bold** *Italic*&#10;[Link](https://example.com)"
                      className="w-full h-96 bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-white font-mono text-sm focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Preview</label>
                    <div
                      className="w-full h-96 bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-white overflow-auto"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(markdownInput) }}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
