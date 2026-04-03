import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Music, Piano, Circle, ArrowRight, Info, Hash, BookOpen } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type ActiveTab = 'scales' | 'chords' | 'intervals' | 'circle' | 'keysig' | 'relative';

type ScaleType = 'major' | 'naturalMinor' | 'harmonicMinor' | 'melodicMinor' | 'pentatonicMajor' | 'pentatonicMinor' | 'blues' | 'dorian' | 'phrygian' | 'lydian' | 'mixolydian' | 'locrian';

type ChordType = 'major' | 'minor' | 'diminished' | 'augmented' | 'major7' | 'minor7' | 'dominant7' | 'diminished7' | 'halfDiminished7' | 'sus2' | 'sus4' | 'add9';

interface ScaleConfig {
  name: string;
  intervals: number[];
  description: string;
}

interface ChordConfig {
  name: string;
  intervals: number[];
  symbol: string;
  description: string;
}

interface IntervalInfo {
  semitones: number;
  name: string;
  quality: string;
}

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

interface MusicTheoryToolProps {
  uiConfig?: UIConfig;
}

export const MusicTheoryTool: React.FC<MusicTheoryToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [activeTab, setActiveTab] = useState<ActiveTab>('scales');
  const [selectedRoot, setSelectedRoot] = useState('C');
  const [selectedScale, setSelectedScale] = useState<ScaleType>('major');
  const [selectedChord, setSelectedChord] = useState<ChordType>('major');
  const [intervalNote1, setIntervalNote1] = useState('C');
  const [intervalNote2, setIntervalNote2] = useState('E');
  const [useFlats, setUseFlats] = useState(false);

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.prefillData && !isPrefilled) {
      const data = uiConfig.prefillData;
      if (data.root && ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].includes(data.root as string)) {
        setSelectedRoot(data.root as string);
      }
      if (data.scale) {
        setSelectedScale(data.scale as ScaleType);
      }
      if (data.tab && ['scales', 'chords', 'intervals', 'circle', 'keysig', 'relative'].includes(data.tab as string)) {
        setActiveTab(data.tab as ActiveTab);
      }
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  const scales: Record<ScaleType, ScaleConfig> = {
    major: { name: 'Major', intervals: [0, 2, 4, 5, 7, 9, 11], description: 'Bright, happy sound' },
    naturalMinor: { name: 'Natural Minor', intervals: [0, 2, 3, 5, 7, 8, 10], description: 'Sad, melancholic sound' },
    harmonicMinor: { name: 'Harmonic Minor', intervals: [0, 2, 3, 5, 7, 8, 11], description: 'Exotic, Middle Eastern flavor' },
    melodicMinor: { name: 'Melodic Minor', intervals: [0, 2, 3, 5, 7, 9, 11], description: 'Jazz minor scale' },
    pentatonicMajor: { name: 'Pentatonic Major', intervals: [0, 2, 4, 7, 9], description: 'Simple, universal sound' },
    pentatonicMinor: { name: 'Pentatonic Minor', intervals: [0, 3, 5, 7, 10], description: 'Blues and rock foundation' },
    blues: { name: 'Blues', intervals: [0, 3, 5, 6, 7, 10], description: 'Adds blue note to pentatonic' },
    dorian: { name: 'Dorian', intervals: [0, 2, 3, 5, 7, 9, 10], description: 'Minor with raised 6th' },
    phrygian: { name: 'Phrygian', intervals: [0, 1, 3, 5, 7, 8, 10], description: 'Spanish/Flamenco flavor' },
    lydian: { name: 'Lydian', intervals: [0, 2, 4, 6, 7, 9, 11], description: 'Dreamy, floating quality' },
    mixolydian: { name: 'Mixolydian', intervals: [0, 2, 4, 5, 7, 9, 10], description: 'Dominant 7th sound' },
    locrian: { name: 'Locrian', intervals: [0, 1, 3, 5, 6, 8, 10], description: 'Diminished, unstable' },
  };

  const chords: Record<ChordType, ChordConfig> = {
    major: { name: 'Major', intervals: [0, 4, 7], symbol: '', description: 'Bright, stable' },
    minor: { name: 'Minor', intervals: [0, 3, 7], symbol: 'm', description: 'Sad, dark' },
    diminished: { name: 'Diminished', intervals: [0, 3, 6], symbol: 'dim', description: 'Tense, unstable' },
    augmented: { name: 'Augmented', intervals: [0, 4, 8], symbol: 'aug', description: 'Mysterious, unresolved' },
    major7: { name: 'Major 7th', intervals: [0, 4, 7, 11], symbol: 'maj7', description: 'Smooth, jazzy' },
    minor7: { name: 'Minor 7th', intervals: [0, 3, 7, 10], symbol: 'm7', description: 'Mellow, soulful' },
    dominant7: { name: 'Dominant 7th', intervals: [0, 4, 7, 10], symbol: '7', description: 'Bluesy, needs resolution' },
    diminished7: { name: 'Diminished 7th', intervals: [0, 3, 6, 9], symbol: 'dim7', description: 'Very tense' },
    halfDiminished7: { name: 'Half-Diminished 7th', intervals: [0, 3, 6, 10], symbol: 'm7b5', description: 'Jazz ii chord in minor' },
    sus2: { name: 'Suspended 2nd', intervals: [0, 2, 7], symbol: 'sus2', description: 'Open, ambiguous' },
    sus4: { name: 'Suspended 4th', intervals: [0, 5, 7], symbol: 'sus4', description: 'Needs resolution' },
    add9: { name: 'Add 9', intervals: [0, 4, 7, 14], symbol: 'add9', description: 'Rich, colorful' },
  };

  const intervals: IntervalInfo[] = [
    { semitones: 0, name: 'Unison', quality: 'Perfect' },
    { semitones: 1, name: 'Minor 2nd', quality: 'Minor' },
    { semitones: 2, name: 'Major 2nd', quality: 'Major' },
    { semitones: 3, name: 'Minor 3rd', quality: 'Minor' },
    { semitones: 4, name: 'Major 3rd', quality: 'Major' },
    { semitones: 5, name: 'Perfect 4th', quality: 'Perfect' },
    { semitones: 6, name: 'Tritone', quality: 'Augmented/Diminished' },
    { semitones: 7, name: 'Perfect 5th', quality: 'Perfect' },
    { semitones: 8, name: 'Minor 6th', quality: 'Minor' },
    { semitones: 9, name: 'Major 6th', quality: 'Major' },
    { semitones: 10, name: 'Minor 7th', quality: 'Minor' },
    { semitones: 11, name: 'Major 7th', quality: 'Major' },
    { semitones: 12, name: 'Octave', quality: 'Perfect' },
  ];

  const circleOfFifths = [
    { major: 'C', minor: 'Am', sharps: 0, flats: 0 },
    { major: 'G', minor: 'Em', sharps: 1, flats: 0 },
    { major: 'D', minor: 'Bm', sharps: 2, flats: 0 },
    { major: 'A', minor: 'F#m', sharps: 3, flats: 0 },
    { major: 'E', minor: 'C#m', sharps: 4, flats: 0 },
    { major: 'B', minor: 'G#m', sharps: 5, flats: 0 },
    { major: 'F#', minor: 'D#m', sharps: 6, flats: 0 },
    { major: 'Db', minor: 'Bbm', sharps: 0, flats: 5 },
    { major: 'Ab', minor: 'Fm', sharps: 0, flats: 4 },
    { major: 'Eb', minor: 'Cm', sharps: 0, flats: 3 },
    { major: 'Bb', minor: 'Gm', sharps: 0, flats: 2 },
    { major: 'F', minor: 'Dm', sharps: 0, flats: 1 },
  ];

  const keySignatures: Record<string, { sharps: string[]; flats: string[] }> = {
    'C': { sharps: [], flats: [] },
    'G': { sharps: ['F#'], flats: [] },
    'D': { sharps: ['F#', 'C#'], flats: [] },
    'A': { sharps: ['F#', 'C#', 'G#'], flats: [] },
    'E': { sharps: ['F#', 'C#', 'G#', 'D#'], flats: [] },
    'B': { sharps: ['F#', 'C#', 'G#', 'D#', 'A#'], flats: [] },
    'F#': { sharps: ['F#', 'C#', 'G#', 'D#', 'A#', 'E#'], flats: [] },
    'C#': { sharps: ['F#', 'C#', 'G#', 'D#', 'A#', 'E#', 'B#'], flats: [] },
    'F': { sharps: [], flats: ['Bb'] },
    'Bb': { sharps: [], flats: ['Bb', 'Eb'] },
    'Eb': { sharps: [], flats: ['Bb', 'Eb', 'Ab'] },
    'Ab': { sharps: [], flats: ['Bb', 'Eb', 'Ab', 'Db'] },
    'Db': { sharps: [], flats: ['Bb', 'Eb', 'Ab', 'Db', 'Gb'] },
    'Gb': { sharps: [], flats: ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'] },
    'Cb': { sharps: [], flats: ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Fb'] },
  };

  const notesList = useFlats ? NOTES_FLAT : NOTES;

  const getNoteIndex = (note: string): number => {
    let idx = NOTES.indexOf(note);
    if (idx === -1) idx = NOTES_FLAT.indexOf(note);
    return idx;
  };

  const getNote = (rootIndex: number, interval: number): string => {
    const idx = (rootIndex + interval) % 12;
    return notesList[idx];
  };

  const scaleNotes = useMemo(() => {
    const rootIndex = getNoteIndex(selectedRoot);
    const scaleConfig = scales[selectedScale];
    return scaleConfig.intervals.map(interval => getNote(rootIndex, interval));
  }, [selectedRoot, selectedScale, useFlats]);

  const chordNotes = useMemo(() => {
    const rootIndex = getNoteIndex(selectedRoot);
    const chordConfig = chords[selectedChord];
    return chordConfig.intervals.map(interval => getNote(rootIndex, interval % 12));
  }, [selectedRoot, selectedChord, useFlats]);

  const intervalResult = useMemo(() => {
    const idx1 = getNoteIndex(intervalNote1);
    const idx2 = getNoteIndex(intervalNote2);
    let semitones = (idx2 - idx1 + 12) % 12;
    return intervals.find(i => i.semitones === semitones) || intervals[0];
  }, [intervalNote1, intervalNote2]);

  const getRelativeMinor = (majorKey: string): string => {
    const idx = getNoteIndex(majorKey);
    return getNote(idx, 9); // 9 semitones up = relative minor
  };

  const getRelativeMajor = (minorKey: string): string => {
    const idx = getNoteIndex(minorKey);
    return getNote(idx, 3); // 3 semitones up = relative major
  };

  const tabs: { id: ActiveTab; name: string; icon: React.ReactNode }[] = [
    { id: 'scales', name: 'Scales', icon: <Music className="w-4 h-4" /> },
    { id: 'chords', name: 'Chords', icon: <Piano className="w-4 h-4" /> },
    { id: 'intervals', name: 'Intervals', icon: <ArrowRight className="w-4 h-4" /> },
    { id: 'circle', name: 'Circle of 5ths', icon: <Circle className="w-4 h-4" /> },
    { id: 'keysig', name: 'Key Signatures', icon: <Hash className="w-4 h-4" /> },
    { id: 'relative', name: 'Relative Keys', icon: <BookOpen className="w-4 h-4" /> },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-purple-900/20' : 'bg-gradient-to-r from-white to-purple-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg"><Music className="w-5 h-5 text-purple-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.musicTheory.musicTheoryTool', 'Music Theory Tool')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.musicTheory.learnScalesChordsIntervalsAnd', 'Learn scales, chords, intervals, and more')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Tab Selection */}
        <div className="grid grid-cols-3 gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm ${activeTab === tab.id ? 'bg-purple-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Flat/Sharp Toggle */}
        <div className="flex items-center justify-end gap-2">
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.musicTheory.useFlats', 'Use Flats')}</span>
          <button
            onClick={() => setUseFlats(!useFlats)}
            className={`w-12 h-6 rounded-full transition-colors ${useFlats ? 'bg-purple-500' : isDark ? 'bg-gray-700' : 'bg-gray-300'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${useFlats ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>

        {/* Scale Builder Tab */}
        {activeTab === 'scales' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.musicTheory.rootNote', 'Root Note')}</label>
                <select
                  value={selectedRoot}
                  onChange={(e) => setSelectedRoot(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  {notesList.map((note) => (
                    <option key={note} value={note}>{note}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.musicTheory.scaleType', 'Scale Type')}</label>
                <select
                  value={selectedScale}
                  onChange={(e) => setSelectedScale(e.target.value as ScaleType)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  {(Object.keys(scales) as ScaleType[]).map((scale) => (
                    <option key={scale} value={scale}>{scales[scale].name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border`}>
              <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedRoot} {scales[selectedScale].name} Scale</h4>
              <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{scales[selectedScale].description}</p>
              <div className="flex flex-wrap gap-2">
                {scaleNotes.map((note, idx) => (
                  <div
                    key={idx}
                    className={`w-12 h-12 flex items-center justify-center rounded-lg font-bold ${idx === 0 ? 'bg-purple-500 text-white' : isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900 border'}`}
                  >
                    {note}
                  </div>
                ))}
              </div>
              <div className={`mt-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Degrees: {scaleNotes.map((_, idx) => idx + 1).join(' - ')}
              </div>
            </div>
          </div>
        )}

        {/* Chord Constructor Tab */}
        {activeTab === 'chords' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.musicTheory.rootNote2', 'Root Note')}</label>
                <select
                  value={selectedRoot}
                  onChange={(e) => setSelectedRoot(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  {notesList.map((note) => (
                    <option key={note} value={note}>{note}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.musicTheory.chordType', 'Chord Type')}</label>
                <select
                  value={selectedChord}
                  onChange={(e) => setSelectedChord(e.target.value as ChordType)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  {(Object.keys(chords) as ChordType[]).map((chord) => (
                    <option key={chord} value={chord}>{chords[chord].name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border`}>
              <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {selectedRoot}{chords[selectedChord].symbol}
              </h4>
              <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{chords[selectedChord].description}</p>
              <div className="flex flex-wrap gap-2">
                {chordNotes.map((note, idx) => (
                  <div
                    key={idx}
                    className={`w-12 h-12 flex items-center justify-center rounded-lg font-bold ${idx === 0 ? 'bg-purple-500 text-white' : isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900 border'}`}
                  >
                    {note}
                  </div>
                ))}
              </div>
              <div className={`mt-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Intervals: {chords[selectedChord].intervals.map(i => i === 0 ? 'R' : i).join(' - ')}
              </div>
            </div>
          </div>
        )}

        {/* Interval Calculator Tab */}
        {activeTab === 'intervals' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.musicTheory.firstNote', 'First Note')}</label>
                <select
                  value={intervalNote1}
                  onChange={(e) => setIntervalNote1(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  {notesList.map((note) => (
                    <option key={note} value={note}>{note}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.musicTheory.secondNote', 'Second Note')}</label>
                <select
                  value={intervalNote2}
                  onChange={(e) => setIntervalNote2(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  {notesList.map((note) => (
                    <option key={note} value={note}>{note}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border`}>
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className={`w-16 h-16 flex items-center justify-center rounded-lg font-bold text-xl ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900 border'}`}>
                  {intervalNote1}
                </div>
                <ArrowRight className="w-6 h-6 text-purple-500" />
                <div className={`w-16 h-16 flex items-center justify-center rounded-lg font-bold text-xl ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900 border'}`}>
                  {intervalNote2}
                </div>
              </div>
              <div className="text-2xl font-bold text-purple-500 mb-1">{intervalResult.name}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {intervalResult.semitones} semitones | {intervalResult.quality}
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.musicTheory.allIntervalsReference', 'All Intervals Reference')}</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {intervals.map((interval) => (
                  <div key={interval.semitones} className={`flex justify-between py-1 px-2 rounded ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{interval.name}</span>
                    <span className={isDark ? 'text-gray-500' : 'text-gray-500'}>{interval.semitones}st</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Circle of Fifths Tab */}
        {activeTab === 'circle' && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border`}>
              <h4 className={`font-medium mb-3 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.musicTheory.circleOfFifths', 'Circle of Fifths')}</h4>
              <div className="relative w-64 h-64 mx-auto">
                {circleOfFifths.map((key, idx) => {
                  const angle = (idx * 30 - 90) * (Math.PI / 180);
                  const x = 50 + 40 * Math.cos(angle);
                  const y = 50 + 40 * Math.sin(angle);
                  const xInner = 50 + 25 * Math.cos(angle);
                  const yInner = 50 + 25 * Math.sin(angle);
                  return (
                    <React.Fragment key={key.major}>
                      <div
                        className={`absolute w-10 h-10 flex items-center justify-center rounded-full font-bold text-sm bg-purple-500 text-white transform -translate-x-1/2 -translate-y-1/2`}
                        style={{ left: `${x}%`, top: `${y}%` }}
                      >
                        {key.major}
                      </div>
                      <div
                        className={`absolute w-8 h-8 flex items-center justify-center rounded-full text-xs ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'} transform -translate-x-1/2 -translate-y-1/2`}
                        style={{ left: `${xInner}%`, top: `${yInner}%` }}
                      >
                        {key.minor}
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.musicTheory.sharpKeys', 'Sharp Keys')}</h4>
                {circleOfFifths.filter(k => k.sharps > 0).map((key) => (
                  <div key={key.major} className={`flex justify-between py-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span>{key.major} / {key.minor}</span>
                    <span>{key.sharps}#</span>
                  </div>
                ))}
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.musicTheory.flatKeys', 'Flat Keys')}</h4>
                {circleOfFifths.filter(k => k.flats > 0).map((key) => (
                  <div key={key.major} className={`flex justify-between py-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span>{key.major} / {key.minor}</span>
                    <span>{key.flats}b</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Key Signatures Tab */}
        {activeTab === 'keysig' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.musicTheory.selectKey', 'Select Key')}</label>
              <select
                value={selectedRoot}
                onChange={(e) => setSelectedRoot(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              >
                {Object.keys(keySignatures).map((key) => (
                  <option key={key} value={key}>{key} Major</option>
                ))}
              </select>
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border`}>
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedRoot} Major Key Signature</h4>
              {keySignatures[selectedRoot]?.sharps.length > 0 && (
                <div className="mb-3">
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.musicTheory.sharps', 'Sharps:')}</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {keySignatures[selectedRoot].sharps.map((note) => (
                      <span key={note} className="px-3 py-1 bg-purple-500 text-white rounded-lg text-sm font-medium">{note}</span>
                    ))}
                  </div>
                </div>
              )}
              {keySignatures[selectedRoot]?.flats.length > 0 && (
                <div className="mb-3">
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.musicTheory.flats', 'Flats:')}</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {keySignatures[selectedRoot].flats.map((note) => (
                      <span key={note} className="px-3 py-1 bg-purple-500 text-white rounded-lg text-sm font-medium">{note}</span>
                    ))}
                  </div>
                </div>
              )}
              {keySignatures[selectedRoot]?.sharps.length === 0 && keySignatures[selectedRoot]?.flats.length === 0 && (
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.musicTheory.noSharpsOrFlatsAll', 'No sharps or flats - all natural notes!')}</p>
              )}
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.musicTheory.orderOfSharpsFlats', 'Order of Sharps & Flats')}</h4>
              <div className="space-y-2">
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>{t('tools.musicTheory.sharps2', 'Sharps:')}</strong> F - C - G - D - A - E - B (Father Charles Goes Down And Ends Battle)
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>{t('tools.musicTheory.flats2', 'Flats:')}</strong> B - E - A - D - G - C - F (Battle Ends And Down Goes Charles' Father)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Relative Major/Minor Tab */}
        {activeTab === 'relative' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('tools.musicTheory.selectKey2', 'Select Key')}</label>
              <select
                value={selectedRoot}
                onChange={(e) => setSelectedRoot(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              >
                {notesList.map((note) => (
                  <option key={note} value={note}>{note}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border`}>
                <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.musicTheory.ifMajorKey', 'If Major Key')}</h4>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-500 mb-2">{selectedRoot} Major</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.musicTheory.relativeMinor', 'Relative Minor:')}</div>
                  <div className="text-2xl font-bold text-purple-400">{getRelativeMinor(selectedRoot)}m</div>
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.musicTheory.ifMinorKey', 'If Minor Key')}</h4>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-500 mb-2">{selectedRoot}m</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.musicTheory.relativeMajor', 'Relative Major:')}</div>
                  <div className="text-2xl font-bold text-purple-400">{getRelativeMajor(selectedRoot)}</div>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <div className="flex items-start gap-2">
                <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>{t('tools.musicTheory.howToFindRelativeKeys', 'How to find relative keys:')}</strong>
                  <ul className="mt-1 space-y-1">
                    <li>{t('tools.musicTheory.relativeMinorGoDown3', 'Relative Minor: Go down 3 semitones from major key (or up 9)')}</li>
                    <li>{t('tools.musicTheory.relativeMajorGoUp3', 'Relative Major: Go up 3 semitones from minor key')}</li>
                    <li>{t('tools.musicTheory.bothShareTheSameKey', 'Both share the same key signature!')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tips Section */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.musicTheory.musicTheoryTips', 'Music Theory Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>{t('tools.musicTheory.aSemitoneIsTheSmallest', 'A semitone is the smallest interval between two notes')}</li>
                <li>{t('tools.musicTheory.majorScalesFollowWW', 'Major scales follow: W-W-H-W-W-W-H pattern')}</li>
                <li>{t('tools.musicTheory.chordsAreBuiltByStacking', 'Chords are built by stacking thirds')}</li>
                <li>{t('tools.musicTheory.theCircleOf5thsShows', 'The Circle of 5ths shows key relationships')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicTheoryTool;
