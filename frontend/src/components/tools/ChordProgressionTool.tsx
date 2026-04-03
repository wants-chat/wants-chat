import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Music, Piano, Disc, Layers, Info, Play, Plus, X, Shuffle, Save, Loader2, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { useToolData } from '../../hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

type MusicalKey = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';
type Mode = 'major' | 'minor';
type Genre = 'pop' | 'jazz' | 'rock' | 'blues' | 'classical' | 'rnb';

interface ProgressionPattern {
  name: string;
  numerals: string[];
  description: string;
  genre: string[];
}

interface ChordInfo {
  numeral: string;
  name: string;
  notes: string[];
  voicing: string;
}

const ALL_NOTES: MusicalKey[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
const MINOR_SCALE_INTERVALS = [0, 2, 3, 5, 7, 8, 10];

const PROGRESSION_PATTERNS: ProgressionPattern[] = [
  { name: 'I-IV-V-I', numerals: ['I', 'IV', 'V', 'I'], description: 'Classic rock/pop progression', genre: ['pop', 'rock'] },
  { name: 'I-V-vi-IV', numerals: ['I', 'V', 'vi', 'IV'], description: 'The "pop punk" progression', genre: ['pop', 'rock'] },
  { name: 'ii-V-I', numerals: ['ii', 'V', 'I'], description: 'Essential jazz cadence', genre: ['jazz'] },
  { name: 'I-vi-IV-V', numerals: ['I', 'vi', 'IV', 'V'], description: '50s doo-wop progression', genre: ['pop', 'rnb'] },
  { name: 'I-IV-vi-V', numerals: ['I', 'IV', 'vi', 'V'], description: 'Emotional ballad progression', genre: ['pop', 'rnb'] },
  { name: 'vi-IV-I-V', numerals: ['vi', 'IV', 'I', 'V'], description: 'Minor feel pop progression', genre: ['pop'] },
  { name: 'I-IV-I-V', numerals: ['I', 'IV', 'I', 'V'], description: '12-bar blues foundation', genre: ['blues', 'rock'] },
  { name: 'I-bVII-IV-I', numerals: ['I', 'bVII', 'IV', 'I'], description: 'Classic rock sound', genre: ['rock'] },
  { name: 'i-VI-III-VII', numerals: ['i', 'VI', 'III', 'VII'], description: 'Epic minor progression', genre: ['rock', 'classical'] },
  { name: 'I-iii-vi-ii-V', numerals: ['I', 'iii', 'vi', 'ii', 'V'], description: 'Circle of fifths descent', genre: ['jazz', 'classical'] },
  { name: 'i-iv-v-i', numerals: ['i', 'iv', 'v', 'i'], description: 'Natural minor progression', genre: ['classical', 'rock'] },
  { name: 'I-V-vi-iii-IV', numerals: ['I', 'V', 'vi', 'iii', 'IV'], description: 'Canon in D style', genre: ['classical', 'pop'] },
];

const GENRE_PATTERNS: Record<Genre, string[]> = {
  pop: ['I-V-vi-IV', 'I-IV-vi-V', 'vi-IV-I-V'],
  jazz: ['ii-V-I', 'I-iii-vi-ii-V', 'iii-VI-ii-V'],
  rock: ['I-IV-V-I', 'I-bVII-IV-I', 'i-VI-III-VII'],
  blues: ['I-IV-I-V', 'I-I-I-I', 'I-IV-I-V'],
  classical: ['I-IV-V-I', 'I-V-vi-iii-IV', 'i-iv-v-i'],
  rnb: ['I-vi-IV-V', 'I-IV-vi-V', 'ii-V-I'],
};

const VOICING_SUGGESTIONS: Record<string, string[]> = {
  major: ['Root position (1-3-5)', 'First inversion (3-5-1)', 'Add9 (1-3-5-9)', 'Sus4 (1-4-5)'],
  minor: ['Root position (1-b3-5)', 'First inversion (b3-5-1)', 'Minor7 (1-b3-5-b7)', 'Add9 (1-b3-5-9)'],
  dominant: ['Root (1-3-5-b7)', 'Shell voicing (1-3-b7)', 'Dom9 (1-3-5-b7-9)', '13th (1-3-b7-13)'],
  diminished: ['Root (1-b3-b5)', 'Dim7 (1-b3-b5-bb7)', 'Half-dim (1-b3-b5-b7)'],
};

interface ChordProgressionToolProps {
  uiConfig?: UIConfig;
}

const COLUMNS: ColumnConfig[] = [
  { key: 'key', header: 'Key' },
  { key: 'mode', header: 'Mode' },
  { key: 'numeral', header: 'Roman Numeral' },
  { key: 'chordName', header: 'Chord' },
  { key: 'notes', header: 'Notes' },
  { key: 'voicing', header: 'Voicing' },
];

export const ChordProgressionTool: React.FC<ChordProgressionToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [selectedKey, setSelectedKey] = useState<MusicalKey>('C');
  const [mode, setMode] = useState<Mode>('major');
  const [selectedGenre, setSelectedGenre] = useState<Genre | 'all'>('all');
  const [customProgression, setCustomProgression] = useState<string[]>([]);
  const [selectedPattern, setSelectedPattern] = useState<ProgressionPattern | null>(null);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { saveToolData } = useToolData();

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.prefillData && !isPrefilled) {
      const data = uiConfig.prefillData;
      if (data.key && ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].includes(data.key as string)) {
        setSelectedKey(data.key as MusicalKey);
      }
      if (data.mode && ['major', 'minor'].includes(data.mode as string)) {
        setMode(data.mode as Mode);
      }
      if (data.genre && ['pop', 'jazz', 'rock', 'blues', 'classical', 'rnb', 'all'].includes(data.genre as string)) {
        setSelectedGenre(data.genre as Genre | 'all');
      }
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  const scaleNotes = useMemo(() => {
    const keyIndex = ALL_NOTES.indexOf(selectedKey);
    const intervals = mode === 'major' ? MAJOR_SCALE_INTERVALS : MINOR_SCALE_INTERVALS;
    return intervals.map((interval) => ALL_NOTES[(keyIndex + interval) % 12]);
  }, [selectedKey, mode]);

  const getChordFromNumeral = (numeral: string): ChordInfo => {
    const numeralMap: Record<string, { degree: number; quality: string; suffix: string }> = {
      'I': { degree: 0, quality: 'major', suffix: '' },
      'i': { degree: 0, quality: 'minor', suffix: 'm' },
      'II': { degree: 1, quality: 'major', suffix: '' },
      'ii': { degree: 1, quality: 'minor', suffix: 'm' },
      'III': { degree: 2, quality: 'major', suffix: '' },
      'iii': { degree: 2, quality: 'minor', suffix: 'm' },
      'IV': { degree: 3, quality: 'major', suffix: '' },
      'iv': { degree: 3, quality: 'minor', suffix: 'm' },
      'V': { degree: 4, quality: 'dominant', suffix: '' },
      'v': { degree: 4, quality: 'minor', suffix: 'm' },
      'VI': { degree: 5, quality: 'major', suffix: '' },
      'vi': { degree: 5, quality: 'minor', suffix: 'm' },
      'VII': { degree: 6, quality: 'major', suffix: '' },
      'vii': { degree: 6, quality: 'diminished', suffix: 'dim' },
      'bVII': { degree: 6, quality: 'major', suffix: '' },
    };

    const info = numeralMap[numeral] || { degree: 0, quality: 'major', suffix: '' };
    const keyIndex = ALL_NOTES.indexOf(selectedKey);
    const intervals = mode === 'major' ? MAJOR_SCALE_INTERVALS : MINOR_SCALE_INTERVALS;

    let rootIndex: number;
    if (numeral === 'bVII') {
      rootIndex = (keyIndex + 10) % 12;
    } else {
      rootIndex = (keyIndex + intervals[info.degree]) % 12;
    }

    const root = ALL_NOTES[rootIndex];
    const chordName = root + info.suffix;

    // Calculate chord notes based on quality
    let chordIntervals: number[];
    switch (info.quality) {
      case 'minor':
        chordIntervals = [0, 3, 7];
        break;
      case 'diminished':
        chordIntervals = [0, 3, 6];
        break;
      case 'dominant':
        chordIntervals = [0, 4, 7, 10];
        break;
      default:
        chordIntervals = [0, 4, 7];
    }

    const notes = chordIntervals.map((i) => ALL_NOTES[(rootIndex + i) % 12]);

    return {
      numeral,
      name: chordName,
      notes,
      voicing: VOICING_SUGGESTIONS[info.quality]?.[0] || 'Root position',
    };
  };

  const filteredPatterns = useMemo(() => {
    if (selectedGenre === 'all') return PROGRESSION_PATTERNS;
    return PROGRESSION_PATTERNS.filter((p) => p.genre.includes(selectedGenre));
  }, [selectedGenre]);

  const currentProgressionChords = useMemo(() => {
    const numerals = selectedPattern?.numerals || customProgression;
    return numerals.map((numeral) => getChordFromNumeral(numeral));
  }, [selectedPattern, customProgression, selectedKey, mode]);

  const addToProgression = (numeral: string) => {
    if (customProgression.length < 8) {
      setCustomProgression([...customProgression, numeral]);
      setSelectedPattern(null);
    }
  };

  const removeFromProgression = (index: number) => {
    setCustomProgression(customProgression.filter((_, i) => i !== index));
  };

  const clearProgression = () => {
    setCustomProgression([]);
    setSelectedPattern(null);
  };

  const randomizeProgression = () => {
    const patterns = filteredPatterns;
    const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
    setSelectedPattern(randomPattern);
    setCustomProgression([]);
  };

  // Prepare data for export
  const exportData = useMemo(() => {
    return currentProgressionChords.map((chord) => ({
      key: selectedKey,
      mode: mode.charAt(0).toUpperCase() + mode.slice(1),
      numeral: chord.numeral,
      chordName: chord.name,
      notes: chord.notes.join(' - '),
      voicing: chord.voicing,
    }));
  }, [currentProgressionChords, selectedKey, mode]);

  // Export handlers
  const handleExportCSV = () => {
    exportToCSV(exportData, COLUMNS, { filename: 'chord-progression' });
  };

  const handleExportExcel = () => {
    exportToExcel(exportData, COLUMNS, { filename: 'chord-progression' });
  };

  const handleExportJSON = () => {
    exportToJSON(exportData, { filename: 'chord-progression' });
  };

  const handleExportPDF = async () => {
    await exportToPDF(exportData, COLUMNS, {
      filename: 'chord-progression',
      title: `${selectedKey} ${mode.charAt(0).toUpperCase() + mode.slice(1)} Chord Progression`,
    });
  };

  const handlePrint = () => {
    printData(exportData, COLUMNS, {
      title: `${selectedKey} ${mode.charAt(0).toUpperCase() + mode.slice(1)} Chord Progression`,
    });
  };

  const handleCopyToClipboard = async () => {
    return copyUtil(exportData, COLUMNS, 'tab');
  };

  const availableNumerals = mode === 'major'
    ? ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii']
    : ['i', 'ii', 'III', 'iv', 'v', 'VI', 'VII'];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-purple-900/20' : 'bg-gradient-to-r from-white to-purple-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg"><Music className="w-5 h-5 text-purple-500" /></div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.chordProgression.chordProgressionBuilder', 'Chord Progression Builder')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.chordProgression.buildAndExploreChordProgressions', 'Build and explore chord progressions')}</p>
            </div>
          </div>
          {currentProgressionChords.length > 0 && (
            <ExportDropdown
              onExportCSV={handleExportCSV}
              onExportExcel={handleExportExcel}
              onExportJSON={handleExportJSON}
              onExportPDF={handleExportPDF}
              onPrint={handlePrint}
              onCopyToClipboard={handleCopyToClipboard}
              showImport={false}
              theme={isDark ? 'dark' : 'light'}
            />
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Key and Mode Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.chordProgression.key', 'Key')}
            </label>
            <div className="grid grid-cols-6 gap-1">
              {ALL_NOTES.map((note) => (
                <button
                  key={note}
                  onClick={() => setSelectedKey(note)}
                  className={`py-2 px-2 rounded-lg text-sm font-medium ${selectedKey === note ? 'bg-purple-500 text-white' : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {note}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.chordProgression.mode', 'Mode')}
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setMode('major')}
                className={`flex-1 py-2 rounded-lg ${mode === 'major' ? 'bg-purple-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {t('tools.chordProgression.major', 'Major')}
              </button>
              <button
                onClick={() => setMode('minor')}
                className={`flex-1 py-2 rounded-lg ${mode === 'minor' ? 'bg-purple-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {t('tools.chordProgression.minor', 'Minor')}
              </button>
            </div>
          </div>
        </div>

        {/* Scale Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedKey} {mode.charAt(0).toUpperCase() + mode.slice(1)} Scale</h4>
            <Piano className="w-4 h-4 text-purple-500" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {scaleNotes.map((note, i) => (
              <span key={i} className={`px-3 py-1 rounded-full text-sm font-medium ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'}`}>
                {note}
              </span>
            ))}
          </div>
        </div>

        {/* Genre Filter */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Disc className="w-4 h-4 inline mr-1" />
            {t('tools.chordProgression.genrePatterns', 'Genre Patterns')}
          </label>
          <div className="flex flex-wrap gap-2">
            {(['all', 'pop', 'jazz', 'rock', 'blues', 'classical', 'rnb'] as const).map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-3 py-1 rounded-full text-sm ${selectedGenre === genre ? 'bg-purple-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {genre === 'all' ? 'All' : genre === 'rnb' ? 'R&B' : genre.charAt(0).toUpperCase() + genre.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Common Progressions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.chordProgression.commonProgressions', 'Common Progressions')}
            </label>
            <button
              onClick={randomizeProgression}
              className={`flex items-center gap-1 px-2 py-1 rounded text-sm ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <Shuffle className="w-3 h-3" />
              {t('tools.chordProgression.random', 'Random')}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {filteredPatterns.map((pattern) => (
              <button
                key={pattern.name}
                onClick={() => {
                  setSelectedPattern(pattern);
                  setCustomProgression([]);
                }}
                className={`p-3 rounded-lg text-left ${selectedPattern?.name === pattern.name ? 'bg-purple-500 text-white' : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <div className="font-medium text-sm">{pattern.name}</div>
                <div className={`text-xs ${selectedPattern?.name === pattern.name ? 'text-purple-100' : isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  {pattern.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Progression Builder */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Layers className="w-4 h-4 inline mr-1" />
              {t('tools.chordProgression.buildCustomProgression', 'Build Custom Progression')}
            </label>
            {customProgression.length > 0 && (
              <button
                onClick={clearProgression}
                className={`text-sm ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {t('tools.chordProgression.clear', 'Clear')}
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {availableNumerals.map((numeral) => (
              <button
                key={numeral}
                onClick={() => addToProgression(numeral)}
                disabled={customProgression.length >= 8}
                className={`px-3 py-2 rounded-lg text-sm flex items-center gap-1 ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50'}`}
              >
                <Plus className="w-3 h-3" />
                {numeral}
              </button>
            ))}
          </div>
          {customProgression.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {customProgression.map((numeral, index) => (
                <div
                  key={index}
                  className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${isDark ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700'}`}
                >
                  {numeral}
                  <button onClick={() => removeFromProgression(index)}>
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Current Progression Display */}
        {currentProgressionChords.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 text-purple-500" />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Your Progression in {selectedKey} {mode}</span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {currentProgressionChords.map((chord, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
                >
                  <div className={`text-xs mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {chord.numeral}
                  </div>
                  <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {chord.name}
                  </div>
                  <div className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {chord.notes.join(' - ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Voicing Suggestions */}
        {currentProgressionChords.length > 0 && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.chordProgression.voicingSuggestions', 'Voicing Suggestions')}</h4>
            <div className="space-y-2">
              {currentProgressionChords.slice(0, 4).map((chord, index) => {
                const quality = chord.name.includes('m') && !chord.name.includes('maj')
                  ? (chord.name.includes('dim') ? 'diminished' : 'minor')
                  : 'major';
                const voicings = VOICING_SUGGESTIONS[quality] || VOICING_SUGGESTIONS.major;
                return (
                  <div key={index} className="flex items-start gap-3">
                    <span className={`font-medium min-w-[60px] ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                      {chord.name}:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {voicings.slice(0, 3).map((voicing, vi) => (
                        <span
                          key={vi}
                          className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}
                        >
                          {voicing}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.chordProgression.tips', 'Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>- Uppercase numerals (I, IV, V) are major chords</li>
                <li>- Lowercase numerals (ii, iii, vi) are minor chords</li>
                <li>- Try different inversions for smoother voice leading</li>
                <li>- The V chord often leads back to the I chord (resolution)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChordProgressionTool;
