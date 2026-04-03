import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Quote, Copy, Check, Book, Globe, Newspaper, Video, FileText } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface CitationGeneratorToolProps {
  uiConfig?: UIConfig;
}

type SourceType = 'book' | 'website' | 'journal' | 'video' | 'other';
type CitationStyle = 'apa' | 'mla' | 'chicago' | 'harvard';

interface SourceData {
  type: SourceType;
  title: string;
  authors: string;
  year: string;
  publisher: string;
  url: string;
  accessDate: string;
  journalName: string;
  volume: string;
  issue: string;
  pages: string;
  doi: string;
  channelName: string;
}

export const CitationGeneratorTool: React.FC<CitationGeneratorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isPrefilled, setIsPrefilled] = useState(false);
  const [style, setStyle] = useState<CitationStyle>('apa');
  const [source, setSource] = useState<SourceData>({
    type: 'book',
    title: '',
    authors: '',
    year: '',
    publisher: '',
    url: '',
    accessDate: new Date().toISOString().split('T')[0],
    journalName: '',
    volume: '',
    issue: '',
    pages: '',
    doi: '',
    channelName: '',
  });
  const [copied, setCopied] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.prefillData && !isPrefilled) {
      const data = uiConfig.prefillData as ToolPrefillData;
      if (data.style) setStyle(data.style as CitationStyle);
      if (data.sourceType) setSource(prev => ({ ...prev, type: data.sourceType as SourceType }));
      if (data.title) setSource(prev => ({ ...prev, title: data.title as string }));
      if (data.authors) setSource(prev => ({ ...prev, authors: data.authors as string }));
      if (data.year) setSource(prev => ({ ...prev, year: data.year as string }));
      if (data.publisher) setSource(prev => ({ ...prev, publisher: data.publisher as string }));
      if (data.url) setSource(prev => ({ ...prev, url: data.url as string }));
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  const sourceTypes: { type: SourceType; label: string; icon: any }[] = [
    { type: 'book', label: 'Book', icon: Book },
    { type: 'website', label: 'Website', icon: Globe },
    { type: 'journal', label: 'Journal', icon: Newspaper },
    { type: 'video', label: 'Video', icon: Video },
    { type: 'other', label: 'Other', icon: FileText },
  ];

  const formatAuthors = (authors: string, style: CitationStyle): string => {
    if (!authors.trim()) return '';

    const authorList = authors.split(',').map(a => a.trim());

    switch (style) {
      case 'apa':
        if (authorList.length === 1) {
          const parts = authorList[0].split(' ');
          const lastName = parts.pop() || '';
          const initials = parts.map(p => p.charAt(0).toUpperCase() + '.').join(' ');
          return `${lastName}, ${initials}`;
        } else if (authorList.length === 2) {
          return authorList.map(a => {
            const parts = a.split(' ');
            const lastName = parts.pop() || '';
            const initials = parts.map(p => p.charAt(0).toUpperCase() + '.').join(' ');
            return `${lastName}, ${initials}`;
          }).join(' & ');
        } else {
          const formatted = authorList.slice(0, -1).map(a => {
            const parts = a.split(' ');
            const lastName = parts.pop() || '';
            const initials = parts.map(p => p.charAt(0).toUpperCase() + '.').join(' ');
            return `${lastName}, ${initials}`;
          });
          const lastAuthor = authorList[authorList.length - 1].split(' ');
          const lastName = lastAuthor.pop() || '';
          const initials = lastAuthor.map(p => p.charAt(0).toUpperCase() + '.').join(' ');
          return `${formatted.join(', ')}, & ${lastName}, ${initials}`;
        }

      case 'mla':
        if (authorList.length === 1) {
          const parts = authorList[0].split(' ');
          const lastName = parts.pop() || '';
          return `${lastName}, ${parts.join(' ')}`;
        } else if (authorList.length <= 2) {
          return authorList.map((a, i) => {
            const parts = a.split(' ');
            const lastName = parts.pop() || '';
            if (i === 0) return `${lastName}, ${parts.join(' ')}`;
            return `${parts.join(' ')} ${lastName}`;
          }).join(', and ');
        } else {
          const parts = authorList[0].split(' ');
          const lastName = parts.pop() || '';
          return `${lastName}, ${parts.join(' ')}, et al.`;
        }

      case 'chicago':
      case 'harvard':
      default:
        return authorList.join(', ');
    }
  };

  const formatDate = (date: string, style: CitationStyle): string => {
    if (!date) return '';
    const d = new Date(date);
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];

    switch (style) {
      case 'mla':
        return `${d.getDate()} ${months[d.getMonth()].slice(0, 3)}. ${d.getFullYear()}`;
      default:
        return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    }
  };

  const generateCitation = (): string => {
    const authors = formatAuthors(source.authors, style);
    const year = source.year || 'n.d.';
    const title = source.title || 'Untitled';

    switch (source.type) {
      case 'book':
        switch (style) {
          case 'apa':
            return `${authors} (${year}). *${title}*. ${source.publisher}.`;
          case 'mla':
            return `${authors}. *${title}*. ${source.publisher}, ${year}.`;
          case 'chicago':
            return `${authors}. *${title}*. ${source.publisher ? source.publisher + ', ' : ''}${year}.`;
          case 'harvard':
            return `${authors} (${year}) *${title}*. ${source.publisher}.`;
        }
        break;

      case 'website':
        const accessDate = formatDate(source.accessDate, style);
        switch (style) {
          case 'apa':
            return `${authors} (${year}). ${title}. Retrieved ${accessDate}, from ${source.url}`;
          case 'mla':
            return `${authors}. "${title}." *${source.publisher || 'Website'}*, ${year}, ${source.url}. Accessed ${accessDate}.`;
          case 'chicago':
            return `${authors}. "${title}." ${source.publisher || 'Website'}. Accessed ${accessDate}. ${source.url}.`;
          case 'harvard':
            return `${authors} (${year}) '${title}', ${source.publisher || 'Website'}. Available at: ${source.url} (Accessed: ${accessDate}).`;
        }
        break;

      case 'journal':
        switch (style) {
          case 'apa':
            return `${authors} (${year}). ${title}. *${source.journalName}*, ${source.volume}(${source.issue}), ${source.pages}.${source.doi ? ` https://doi.org/${source.doi}` : ''}`;
          case 'mla':
            return `${authors}. "${title}." *${source.journalName}*, vol. ${source.volume}, no. ${source.issue}, ${year}, pp. ${source.pages}.${source.doi ? ` DOI: ${source.doi}.` : ''}`;
          case 'chicago':
            return `${authors}. "${title}." *${source.journalName}* ${source.volume}, no. ${source.issue} (${year}): ${source.pages}.${source.doi ? ` https://doi.org/${source.doi}.` : ''}`;
          case 'harvard':
            return `${authors} (${year}) '${title}', *${source.journalName}*, ${source.volume}(${source.issue}), pp. ${source.pages}.${source.doi ? ` doi: ${source.doi}.` : ''}`;
        }
        break;

      case 'video':
        switch (style) {
          case 'apa':
            return `${source.channelName || authors} (${year}). *${title}* [Video]. YouTube. ${source.url}`;
          case 'mla':
            return `"${title}." YouTube, uploaded by ${source.channelName || authors}, ${year}, ${source.url}.`;
          case 'chicago':
            return `${source.channelName || authors}. "${title}." YouTube video, ${year}. ${source.url}.`;
          case 'harvard':
            return `${source.channelName || authors} (${year}) *${title}*. [Online Video]. Available at: ${source.url}.`;
        }
        break;

      default:
        switch (style) {
          case 'apa':
            return `${authors} (${year}). ${title}.${source.url ? ` ${source.url}` : ''}`;
          case 'mla':
            return `${authors}. "${title}." ${year}.${source.url ? ` ${source.url}.` : ''}`;
          case 'chicago':
            return `${authors}. "${title}." ${year}.${source.url ? ` ${source.url}.` : ''}`;
          case 'harvard':
            return `${authors} (${year}) '${title}'.${source.url ? ` Available at: ${source.url}.` : ''}`;
        }
    }

    return '';
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateCitation());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const citation = generateCitation();

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-amber-900/20' : 'bg-gradient-to-r from-white to-amber-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <Quote className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.citationGenerator.citationGenerator', 'Citation Generator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.citationGenerator.generateCitationsInApaMla', 'Generate citations in APA, MLA, Chicago, or Harvard style')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Citation Style */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.citationGenerator.citationStyle', 'Citation Style')}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['apa', 'mla', 'chicago', 'harvard'] as CitationStyle[]).map((s) => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                className={`py-2 px-4 rounded-lg text-sm font-medium uppercase transition-colors ${
                  style === s
                    ? 'bg-amber-500 text-white'
                    : isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Source Type */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.citationGenerator.sourceType', 'Source Type')}
          </label>
          <div className="grid grid-cols-5 gap-2">
            {sourceTypes.map((s) => (
              <button
                key={s.type}
                onClick={() => setSource({ ...source, type: s.type })}
                className={`py-3 px-4 rounded-lg text-sm font-medium transition-colors flex flex-col items-center gap-1 ${
                  source.type === s.type
                    ? 'bg-amber-500 text-white'
                    : isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <s.icon className="w-5 h-5" />
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Source Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Author(s) <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>(comma separated)</span>
            </label>
            <input
              type="text"
              value={source.authors}
              onChange={(e) => setSource({ ...source, authors: e.target.value })}
              placeholder={t('tools.citationGenerator.johnSmithJaneDoe', 'John Smith, Jane Doe')}
              className={`w-full px-4 py-2.5 rounded-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.citationGenerator.year', 'Year')}
            </label>
            <input
              type="text"
              value={source.year}
              onChange={(e) => setSource({ ...source, year: e.target.value })}
              placeholder="2024"
              className={`w-full px-4 py-2.5 rounded-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.citationGenerator.title', 'Title')}
            </label>
            <input
              type="text"
              value={source.title}
              onChange={(e) => setSource({ ...source, title: e.target.value })}
              placeholder={t('tools.citationGenerator.enterTitle', 'Enter title...')}
              className={`w-full px-4 py-2.5 rounded-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {(source.type === 'book' || source.type === 'website') && (
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.citationGenerator.publisherWebsiteName', 'Publisher / Website Name')}
              </label>
              <input
                type="text"
                value={source.publisher}
                onChange={(e) => setSource({ ...source, publisher: e.target.value })}
                placeholder={t('tools.citationGenerator.publisherName', 'Publisher name...')}
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  isDark
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
          )}

          {source.type === 'website' && (
            <>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.citationGenerator.url', 'URL')}
                </label>
                <input
                  type="url"
                  value={source.url}
                  onChange={(e) => setSource({ ...source, url: e.target.value })}
                  placeholder={t('tools.citationGenerator.https', 'https://...')}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    isDark
                      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.citationGenerator.accessDate', 'Access Date')}
                </label>
                <input
                  type="date"
                  value={source.accessDate}
                  onChange={(e) => setSource({ ...source, accessDate: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    isDark
                      ? 'bg-gray-800 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </>
          )}

          {source.type === 'journal' && (
            <>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.citationGenerator.journalName', 'Journal Name')}
                </label>
                <input
                  type="text"
                  value={source.journalName}
                  onChange={(e) => setSource({ ...source, journalName: e.target.value })}
                  placeholder={t('tools.citationGenerator.journalOf', 'Journal of...')}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    isDark
                      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.citationGenerator.volume', 'Volume')}</label>
                  <input
                    type="text"
                    value={source.volume}
                    onChange={(e) => setSource({ ...source, volume: e.target.value })}
                    placeholder="12"
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.citationGenerator.issue', 'Issue')}</label>
                  <input
                    type="text"
                    value={source.issue}
                    onChange={(e) => setSource({ ...source, issue: e.target.value })}
                    placeholder="3"
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.citationGenerator.pages', 'Pages')}</label>
                  <input
                    type="text"
                    value={source.pages}
                    onChange={(e) => setSource({ ...source, pages: e.target.value })}
                    placeholder="45-67"
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.citationGenerator.doiOptional', 'DOI (optional)')}
                </label>
                <input
                  type="text"
                  value={source.doi}
                  onChange={(e) => setSource({ ...source, doi: e.target.value })}
                  placeholder={t('tools.citationGenerator.101000Xyz123', '10.1000/xyz123')}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    isDark
                      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
            </>
          )}

          {source.type === 'video' && (
            <>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.citationGenerator.channelName', 'Channel Name')}
                </label>
                <input
                  type="text"
                  value={source.channelName}
                  onChange={(e) => setSource({ ...source, channelName: e.target.value })}
                  placeholder={t('tools.citationGenerator.channelName2', 'Channel name...')}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    isDark
                      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.citationGenerator.videoUrl', 'Video URL')}
                </label>
                <input
                  type="url"
                  value={source.url}
                  onChange={(e) => setSource({ ...source, url: e.target.value })}
                  placeholder={t('tools.citationGenerator.httpsYoutubeCom', 'https://youtube.com/...')}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    isDark
                      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
            </>
          )}
        </div>

        {/* Generated Citation */}
        {source.title && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Generated Citation ({style.toUpperCase()})
              </label>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  copied
                    ? 'bg-green-500 text-white'
                    : isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? t('tools.citationGenerator.copied', 'Copied!') : t('tools.citationGenerator.copy', 'Copy')}
              </button>
            </div>
            <div className={`p-4 rounded-xl ${isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-100'} border`}>
              <p className={`${isDark ? 'text-white' : 'text-gray-900'}`} dangerouslySetInnerHTML={{
                __html: citation.replace(/\*(.*?)\*/g, '<em>$1</em>')
              }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CitationGeneratorTool;
