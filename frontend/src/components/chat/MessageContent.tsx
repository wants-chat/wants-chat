import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../lib/utils';
import { Check, Copy, Loader2, Download, ExternalLink, BarChart2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Tool suggestion from backend with optional pre-filled data
export interface SuggestedTool {
  toolId: string;
  title: string;
  description: string;
  category: string;
  type: string;
  icon: string;
  // Pre-fill data for enhanced tool chips
  prefillValues?: Record<string, any>;
  extractedFields?: Array<{
    fieldName: string;
    value: any;
    confidence: number;
    source: string;
  }>;
  attachmentMappings?: Array<{
    attachmentUrl: string;
    targetField: string;
  }>;
  readyToUse?: boolean;
  readinessPercentage?: number;
}

interface MessageContentProps {
  content: string;
  className?: string;
  enableTypewriter?: boolean;
  typewriterSpeed?: number; // Characters per second
  onTypewriterComplete?: () => void;
  onTypewriterTick?: () => void; // Called periodically during typewriter for scrolling
  suggestedTools?: SuggestedTool[]; // Tools that can be made clickable
  onToolClick?: (tool: SuggestedTool) => void; // Callback when a tool is clicked
  loadingToolId?: string | null; // Tool currently being loaded
}

interface CodeBlockProps {
  language: string;
  value: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, value }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Map common language aliases
  const languageMap: Record<string, string> = {
    js: 'javascript',
    ts: 'typescript',
    py: 'python',
    rb: 'ruby',
    sh: 'bash',
    shell: 'bash',
    yml: 'yaml',
    md: 'markdown',
    dockerfile: 'docker',
    tf: 'hcl',
  };

  const normalizedLanguage = languageMap[language?.toLowerCase()] || language?.toLowerCase() || 'text';

  return (
    <div className={cn(
      'relative group rounded-lg overflow-hidden my-3',
      isDark ? 'bg-[#282c34]' : 'bg-[#fafafa] border border-slate-200'
    )}>
      {/* Header with language and copy button */}
      <div className={cn(
        'flex items-center justify-between px-4 py-2 text-xs',
        isDark ? 'bg-[#21252b] text-slate-400' : 'bg-slate-100 text-slate-500'
      )}>
        <span className="font-medium uppercase tracking-wide">
          {normalizedLanguage}
        </span>
        <button
          onClick={handleCopy}
          className={cn(
            'flex items-center gap-1.5 px-2 py-1 rounded transition-all duration-200',
            isDark
              ? 'hover:bg-[#2c313a] text-slate-400 hover:text-slate-200'
              : 'hover:bg-slate-200 text-slate-500 hover:text-slate-700'
          )}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-500" />
              <span className="text-green-500">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <SyntaxHighlighter
        language={normalizedLanguage}
        style={isDark ? oneDark : oneLight}
        customStyle={{
          margin: 0,
          padding: '1rem',
          fontSize: '0.875rem',
          lineHeight: '1.5',
          background: isDark ? '#282c34' : '#fafafa',
        }}
        showLineNumbers={value.split('\n').length > 3}
        lineNumberStyle={{
          minWidth: '2.5em',
          paddingRight: '1em',
          color: isDark ? '#4b5263' : '#9ca3af',
          userSelect: 'none',
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

// Inline code component
const InlineCode: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <code className={cn(
      'px-1.5 py-0.5 rounded text-sm font-mono',
      isDark
        ? 'bg-[#2a2a2a] text-[#e06c75]'
        : 'bg-slate-100 text-[#e45649]'
    )}>
      {children}
    </code>
  );
};

// Chart configuration interface - supports both simple and complex formats
interface ChartConfig {
  type: 'bar' | 'line' | 'area' | 'pie';
  title?: string;
  // Simple format
  data?: any[];
  xKey?: string;
  yKey?: string;
  nameKey?: string;  // For pie charts
  valueKey?: string; // For pie charts
  series?: string[]; // For multi-series: ["revenue", "expenses"]
  // Complex format
  xAxis?: {
    label: string;
    data: (string | number)[];
  };
  seriesData?: {
    name: string;
    data: number[];
    color?: string;
  }[];
}

// Chart component for rendering inline charts
const ChartBlock: React.FC<{ config: ChartConfig }> = ({ config }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const chartRef = React.useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = React.useState(false);

  // Download chart as PNG or PDF
  const handleDownload = async (format: 'png' | 'pdf' = 'png') => {
    if (!chartRef.current || isDownloading) return;

    setIsDownloading(true);
    try {
      // Dynamic import to reduce bundle size
      const html2canvas = (await import('html2canvas')).default;

      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
      });

      const fileName = (config.title || 'chart').replace(/[^a-zA-Z0-9]/g, '-');

      if (format === 'pdf') {
        const { jsPDF } = await import('jspdf');
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [canvas.width, canvas.height],
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`${fileName}.pdf`);
      } else {
        const link = document.createElement('a');
        link.download = `${fileName}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    } catch (error) {
      console.error('Failed to download chart:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Transform data for Recharts - handle both simple and complex formats
  let chartData: any[];
  let seriesNames: string[];

  if (config.data) {
    // Simple format - data is already an array of objects
    chartData = config.data;
    // Determine series names
    if (config.series) {
      seriesNames = config.series;
    } else if (config.yKey) {
      seriesNames = [config.yKey];
    } else if (config.valueKey) {
      seriesNames = [config.valueKey];
    } else {
      // Auto-detect numeric keys from first data item
      const firstItem = config.data[0] || {};
      const xKey = config.xKey || config.nameKey || 'name';
      seriesNames = Object.keys(firstItem).filter(k => k !== xKey && typeof firstItem[k] === 'number');
    }
  } else if (config.xAxis && config.seriesData) {
    // Complex format - transform to simple format
    chartData = config.xAxis.data.map((xValue, index) => {
      const dataPoint: any = { name: xValue };
      config.seriesData!.forEach((series) => {
        dataPoint[series.name] = series.data[index];
      });
      return dataPoint;
    });
    seriesNames = config.seriesData.map(s => s.name);
  } else {
    // Fallback - empty data
    chartData = [];
    seriesNames = [];
  }

  const xKey = config.xKey || config.nameKey || 'name';

  // Default colors if not specified
  const defaultColors = ['#0D9488', '#F59E0B', '#EF4444', '#8B5CF6', '#10B981', '#EC4899'];

  const renderChart = () => {
    switch (config.type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
              <XAxis
                dataKey={xKey}
                tick={{ fill: isDark ? '#9CA3AF' : '#6B7280', fontSize: 12 }}
                tickLine={{ stroke: isDark ? '#4B5563' : '#D1D5DB' }}
              />
              <YAxis
                tick={{ fill: isDark ? '#9CA3AF' : '#6B7280', fontSize: 12 }}
                tickLine={{ stroke: isDark ? '#4B5563' : '#D1D5DB' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                  border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
                  borderRadius: '8px',
                  color: isDark ? '#F3F4F6' : '#1F2937',
                }}
              />
              <Legend />
              {seriesNames.map((seriesName, idx) => (
                <Line
                  key={seriesName}
                  type="monotone"
                  dataKey={seriesName}
                  stroke={defaultColors[idx % defaultColors.length]}
                  strokeWidth={2}
                  dot={{ fill: defaultColors[idx % defaultColors.length], r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
              <XAxis
                dataKey={xKey}
                tick={{ fill: isDark ? '#9CA3AF' : '#6B7280', fontSize: 12 }}
              />
              <YAxis tick={{ fill: isDark ? '#9CA3AF' : '#6B7280', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                  border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
                  borderRadius: '8px',
                }}
              />
              <Legend />
              {seriesNames.map((seriesName, idx) => (
                <Area
                  key={seriesName}
                  type="monotone"
                  dataKey={seriesName}
                  stroke={defaultColors[idx % defaultColors.length]}
                  fill={defaultColors[idx % defaultColors.length]}
                  fillOpacity={0.3}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        // For pie chart, use the nameKey and first series or valueKey
        const nameKeyPie = config.nameKey || xKey;
        const valueKeyPie = config.valueKey || seriesNames[0] || 'value';
        const pieData = chartData.map(item => ({
          name: item[nameKeyPie],
          value: item[valueKeyPie] || 0,
        }));
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={defaultColors[index % defaultColors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'bar':
      default:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
              <XAxis
                dataKey={xKey}
                tick={{ fill: isDark ? '#9CA3AF' : '#6B7280', fontSize: 12 }}
                tickLine={{ stroke: isDark ? '#4B5563' : '#D1D5DB' }}
              />
              <YAxis
                tick={{ fill: isDark ? '#9CA3AF' : '#6B7280', fontSize: 12 }}
                tickLine={{ stroke: isDark ? '#4B5563' : '#D1D5DB' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                  border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
                  borderRadius: '8px',
                  color: isDark ? '#F3F4F6' : '#1F2937',
                }}
              />
              <Legend />
              {seriesNames.map((seriesName, idx) => (
                <Bar
                  key={seriesName}
                  dataKey={seriesName}
                  fill={defaultColors[idx % defaultColors.length]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className={cn(
      'my-4 p-4 rounded-xl border',
      isDark ? 'bg-[#1a1a1a] border-gray-700' : 'bg-white border-gray-200'
    )}>
      {config.title && (
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-[#0D9488]" />
            <h3 className={cn(
              'font-semibold',
              isDark ? 'text-white' : 'text-gray-900'
            )}>
              {config.title}
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleDownload('png')}
              disabled={isDownloading}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-l-lg text-sm font-medium transition-colors',
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700',
                isDownloading && 'opacity-50 cursor-not-allowed'
              )}
              title="Download as PNG"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">PNG</span>
            </button>
            <button
              onClick={() => handleDownload('pdf')}
              disabled={isDownloading}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-r-lg text-sm font-medium transition-colors border-l',
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200',
                isDownloading && 'opacity-50 cursor-not-allowed'
              )}
              title="Download as PDF"
            >
              <span className="hidden sm:inline">PDF</span>
            </button>
          </div>
        </div>
      )}
      <div ref={chartRef}>
        {renderChart()}
      </div>
    </div>
  );
};

// Image component with download support for screenshots
const ImageWithDownload: React.FC<{ src?: string; alt?: string }> = ({ src, alt }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!src) return null;

  // Check if this is a screenshot from our CDN
  const isScreenshot = src.includes('cdn.wants.chat/screenshots') || src.includes('/screenshots/');

  // Generate filename from URL or use default
  const getFilename = () => {
    try {
      const urlParts = src.split('/');
      const lastPart = urlParts[urlParts.length - 1];
      // Remove query params if any
      const filename = lastPart.split('?')[0];
      return filename || `screenshot-${Date.now()}.png`;
    } catch {
      return `screenshot-${Date.now()}.png`;
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      // Fetch the image and create a blob URL for download
      const response = await fetch(src);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = getFilename();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up blob URL
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
    } catch (error) {
      // Fallback: open in new tab if download fails
      window.open(src, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="relative group my-3 inline-block max-w-full">
      <img
        src={src}
        alt={alt || 'Image'}
        className={cn(
          'max-w-full h-auto rounded-lg shadow-md',
          isDark ? 'border border-slate-700' : 'border border-slate-200'
        )}
        loading="lazy"
      />
      {/* Overlay with actions on hover */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center gap-2">
        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D9488] text-white text-sm font-medium rounded-lg hover:bg-[#0B7A70] transition-colors"
          title="Download image"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 text-slate-800 text-sm font-medium rounded-lg hover:bg-white transition-colors"
          title="Open in new tab"
        >
          <ExternalLink className="w-4 h-4" />
          Open
        </a>
      </div>
    </div>
  );
};

export const MessageContent: React.FC<MessageContentProps> = ({
  content,
  className,
  enableTypewriter = false,
  typewriterSpeed = 80,
  onTypewriterComplete,
  onTypewriterTick,
  suggestedTools = [],
  onToolClick,
  loadingToolId,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Create a map of tool titles (lowercase) to tool objects for quick lookup
  const toolsMap = React.useMemo(() => {
    const map = new Map<string, SuggestedTool>();
    suggestedTools.forEach((tool) => {
      map.set(tool.title.toLowerCase(), tool);
    });
    return map;
  }, [suggestedTools]);
  const [displayedContent, setDisplayedContent] = useState(enableTypewriter ? '' : content);
  const [isTyping, setIsTyping] = useState(enableTypewriter);
  const indexRef = useRef(0);
  const lastContentRef = useRef(content);

  useEffect(() => {
    // If content changes, reset typewriter
    if (content !== lastContentRef.current) {
      lastContentRef.current = content;
      if (enableTypewriter) {
        indexRef.current = 0;
        setDisplayedContent('');
        setIsTyping(true);
      } else {
        setDisplayedContent(content);
      }
    }
  }, [content, enableTypewriter]);

  useEffect(() => {
    if (!enableTypewriter || !isTyping) return;

    const intervalMs = 1000 / typewriterSpeed;
    const charsPerTick = Math.max(1, Math.floor(typewriterSpeed / 40));
    let tickCount = 0;

    const timer = setInterval(() => {
      if (indexRef.current < content.length) {
        const nextIndex = Math.min(indexRef.current + charsPerTick, content.length);
        setDisplayedContent(content.slice(0, nextIndex));
        indexRef.current = nextIndex;

        // Call onTypewriterTick every 5 ticks for smooth scrolling
        tickCount++;
        if (tickCount % 5 === 0) {
          onTypewriterTick?.();
        }
      } else {
        setIsTyping(false);
        clearInterval(timer);
        onTypewriterComplete?.();
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [content, enableTypewriter, isTyping, typewriterSpeed, onTypewriterComplete, onTypewriterTick]);

  const contentToRender = enableTypewriter ? displayedContent : content;

  // Parse content for :::chart blocks (handles both direct and wrapped in code fences)
  const parseContentWithCharts = React.useMemo(() => {
    // Match :::chart blocks - handles both direct and wrapped in code fences
    // Pattern 1: Direct :::chart\n{...}\n:::
    // Pattern 2: ```\n:::chart\n{...}\n:::\n```
    const chartRegex = /(?:```\n?)?:::chart\s*\n([\s\S]*?)\n:::(?:\n?```)?/g;
    const parts: { type: 'text' | 'chart'; content: string; config?: ChartConfig }[] = [];
    let lastIndex = 0;
    let match;
    let processedContent = contentToRender;

    while ((match = chartRegex.exec(processedContent)) !== null) {
      // Add text before the chart
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: processedContent.slice(lastIndex, match.index) });
      }

      // Parse and add the chart
      try {
        // Clean up the JSON - remove any extra whitespace
        const jsonStr = match[1].trim();
        const chartConfig = JSON.parse(jsonStr) as ChartConfig;
        parts.push({ type: 'chart', content: '', config: chartConfig });
      } catch (e) {
        console.error('Failed to parse chart config:', e, match[1]);
        // If JSON parsing fails, treat as text
        parts.push({ type: 'text', content: match[0] });
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text after last chart
    if (lastIndex < processedContent.length) {
      parts.push({ type: 'text', content: processedContent.slice(lastIndex) });
    }

    return parts.length > 0 ? parts : [{ type: 'text' as const, content: contentToRender }];
  }, [contentToRender]);

  // Render a markdown section
  const renderMarkdown = (text: string, key: number) => (
    <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Code blocks
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const value = String(children).replace(/\n$/, '');

            // Check if it's a code block (has language or multiple lines)
            if (!inline && (match || value.includes('\n'))) {
              return <CodeBlock language={language} value={value} />;
            }

            // Inline code
            return <InlineCode>{children}</InlineCode>;
          },

          // Paragraphs
          p({ children }) {
            return <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>;
          },

          // Headings
          h1({ children }) {
            return <h1 className={cn(
              'text-xl font-bold mb-3 mt-4',
              isDark ? 'text-white' : 'text-slate-900'
            )}>{children}</h1>;
          },
          h2({ children }) {
            return <h2 className={cn(
              'text-lg font-bold mb-2 mt-3',
              isDark ? 'text-white' : 'text-slate-900'
            )}>{children}</h2>;
          },
          h3({ children }) {
            return <h3 className={cn(
              'text-base font-semibold mb-2 mt-3',
              isDark ? 'text-white' : 'text-slate-900'
            )}>{children}</h3>;
          },

          // Lists
          ul({ children }) {
            return <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>;
          },
          li({ children }) {
            return <li className="leading-relaxed">{children}</li>;
          },

          // Links
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0D9488] hover:underline"
              >
                {children}
              </a>
            );
          },

          // Blockquotes
          blockquote({ children }) {
            return (
              <blockquote className={cn(
                'border-l-4 pl-4 my-3 italic',
                isDark
                  ? 'border-slate-600 text-slate-300'
                  : 'border-slate-300 text-slate-600'
              )}>
                {children}
              </blockquote>
            );
          },

          // Horizontal rule
          hr() {
            return <hr className={cn(
              'my-4',
              isDark ? 'border-slate-700' : 'border-slate-200'
            )} />;
          },

          // Tables
          table({ children }) {
            return (
              <div className="overflow-x-auto my-3">
                <table className={cn(
                  'min-w-full border-collapse text-sm',
                  isDark ? 'border-slate-700' : 'border-slate-200'
                )}>
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return <thead className={cn(
              isDark ? 'bg-[#2a2a2a]' : 'bg-slate-50'
            )}>{children}</thead>;
          },
          th({ children }) {
            return <th className={cn(
              'border px-3 py-2 text-left font-semibold',
              isDark ? 'border-slate-700' : 'border-slate-200'
            )}>{children}</th>;
          },
          td({ children }) {
            return <td className={cn(
              'border px-3 py-2',
              isDark ? 'border-slate-700' : 'border-slate-200'
            )}>{children}</td>;
          },

          // Strong and emphasis - check if it's a clickable tool
          strong({ children }) {
            const text = React.Children.toArray(children).join('');
            const tool = toolsMap.get(text.toLowerCase());

            if (tool && onToolClick) {
              const isLoading = loadingToolId === tool.toolId;
              return (
                <button
                  onClick={() => onToolClick(tool)}
                  disabled={isLoading || !!loadingToolId}
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-sm font-semibold transition-all',
                    isLoading
                      ? 'opacity-70 cursor-wait'
                      : loadingToolId
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:scale-105 cursor-pointer',
                    isDark
                      ? 'bg-[#0D9488]/20 text-[#0D9488] hover:bg-[#0D9488]/30'
                      : 'bg-[#0D9488]/10 text-[#0D9488] hover:bg-[#0D9488]/20'
                  )}
                >
                  {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                  {text}
                </button>
              );
            }

            return <strong className="font-semibold">{children}</strong>;
          },
          em({ children }) {
            return <em className="italic">{children}</em>;
          },

          // Pre (fallback for code blocks without language)
          pre({ children }) {
            return <>{children}</>;
          },

          // Images - with download support for screenshots
          img({ src, alt }) {
            return <ImageWithDownload src={src} alt={alt} />;
          },
        }}
      >
        {text}
      </ReactMarkdown>
  );

  return (
    <div className={cn('prose prose-sm max-w-none dark:prose-invert dark:text-slate-100', className)}>
      {parseContentWithCharts.map((part, index) => {
        if (part.type === 'chart' && part.config) {
          return <ChartBlock key={`chart-${index}`} config={part.config} />;
        }
        return (
          <React.Fragment key={`text-${index}`}>
            {renderMarkdown(part.content, index)}
          </React.Fragment>
        );
      })}
      {/* Typing cursor indicator */}
      {enableTypewriter && isTyping && (
        <span className="inline-block w-0.5 h-4 ml-0.5 bg-current animate-pulse" />
      )}
    </div>
  );
};

export default MessageContent;
