import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Grid3X3,
  Zap,
  Monitor,
  Bell,
  CheckSquare,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  Settings,
  Volume2,
  Camera,
  Mic,
  MessageSquare,
  Gift,
  Users,
  Info
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';

type TabType = 'buttons' | 'actions' | 'scenes' | 'alerts' | 'overlay' | 'timer';

interface StreamButton {
  id: string;
  row: number;
  col: number;
  label: string;
  action: string;
  color: string;
  icon: string;
}

interface Scene {
  id: string;
  name: string;
  isActive: boolean;
  sources: string[];
}

interface Alert {
  id: string;
  type: 'follow' | 'subscribe' | 'donation' | 'raid' | 'bits';
  enabled: boolean;
  sound: string;
  duration: number;
}

interface OverlayItem {
  id: string;
  name: string;
  checked: boolean;
  category: 'required' | 'recommended' | 'optional';
}

const BUTTON_COLORS = ['#9333ea', '#3b82f6', '#22c55e', '#eab308', '#ef4444', '#ec4899', '#06b6d4', '#64748b'];
const BUTTON_ICONS = ['volume', 'camera', 'mic', 'message', 'gift', 'users', 'settings', 'zap'];

const COLUMNS = {
  buttons: ['id', 'row', 'col', 'label', 'action', 'color', 'icon'],
  actions: ['id', 'name', 'hotkey'],
  scenes: ['id', 'name', 'isActive', 'sources'],
  alerts: ['id', 'type', 'enabled', 'sound', 'duration'],
  overlayItems: ['id', 'name', 'checked', 'category'],
};

interface StreamDeckPlannerToolProps {
  uiConfig?: UIConfig;
}

export const StreamDeckPlannerTool: React.FC<StreamDeckPlannerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [activeTab, setActiveTab] = useState<TabType>('buttons');

  // Handle prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.prefillData && !isPrefilled) {
      const data = uiConfig.prefillData;
      if (data.gridRows) {
        setGridRows(Number(data.gridRows));
      }
      if (data.gridCols) {
        setGridCols(Number(data.gridCols));
      }
      setIsPrefilled(true);
    }
  }, [uiConfig, isPrefilled]);

  // Button Layout State
  const [gridRows, setGridRows] = useState(3);
  const [gridCols, setGridCols] = useState(5);
  const [buttons, setButtons] = useState<StreamButton[]>([]);
  const [selectedButton, setSelectedButton] = useState<string | null>(null);

  // Actions State
  const [actions, setActions] = useState<{id: string; name: string; hotkey: string}[]>([
    { id: '1', name: 'Switch to Game Scene', hotkey: 'F1' },
    { id: '2', name: 'Switch to BRB Scene', hotkey: 'F2' },
    { id: '3', name: 'Toggle Mute', hotkey: 'F3' },
    { id: '4', name: 'Start Recording', hotkey: 'F4' },
  ]);
  const [newActionName, setNewActionName] = useState('');
  const [newActionHotkey, setNewActionHotkey] = useState('');

  // Scenes State
  const [scenes, setScenes] = useState<Scene[]>([
    { id: '1', name: 'Starting Soon', isActive: false, sources: ['Background', 'Music', 'Countdown Timer'] },
    { id: '2', name: 'Main Game', isActive: true, sources: ['Game Capture', 'Webcam', 'Overlay', 'Chat'] },
    { id: '3', name: 'BRB', isActive: false, sources: ['BRB Image', 'Music'] },
    { id: '4', name: 'Just Chatting', isActive: false, sources: ['Webcam Full', 'Chat', 'Alerts'] },
    { id: '5', name: 'Ending', isActive: false, sources: ['End Screen', 'Music', 'Follow Goal'] },
  ]);
  const [newSceneName, setNewSceneName] = useState('');

  // Alerts State
  const [alerts, setAlerts] = useState<Alert[]>([
    { id: '1', type: 'follow', enabled: true, sound: 'chime.mp3', duration: 5 },
    { id: '2', type: 'subscribe', enabled: true, sound: 'fanfare.mp3', duration: 8 },
    { id: '3', type: 'donation', enabled: true, sound: 'coins.mp3', duration: 10 },
    { id: '4', type: 'raid', enabled: true, sound: 'horn.mp3', duration: 15 },
    { id: '5', type: 'bits', enabled: true, sound: 'sparkle.mp3', duration: 6 },
  ]);

  // Overlay Checklist State
  const [overlayItems, setOverlayItems] = useState<OverlayItem[]>([
    { id: '1', name: 'Webcam frame/border', checked: false, category: 'required' },
    { id: '2', name: 'Chat overlay widget', checked: false, category: 'required' },
    { id: '3', name: 'Alert box positioned', checked: false, category: 'required' },
    { id: '4', name: 'Stream labels (recent follow, etc.)', checked: false, category: 'recommended' },
    { id: '5', name: 'Goal widget', checked: false, category: 'recommended' },
    { id: '6', name: 'Social media handles', checked: false, category: 'recommended' },
    { id: '7', name: 'Now playing music widget', checked: false, category: 'optional' },
    { id: '8', name: 'Event list widget', checked: false, category: 'optional' },
    { id: '9', name: 'Countdown/schedule overlay', checked: false, category: 'optional' },
    { id: '10', name: 'Branded lower third', checked: false, category: 'optional' },
  ]);

  // Timer State
  const [timerMinutes, setTimerMinutes] = useState(5);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [initialTime, setInitialTime] = useState(300); // 5 minutes in seconds

  // Initialize buttons based on grid size
  useEffect(() => {
    const newButtons: StreamButton[] = [];
    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        const existingButton = buttons.find(b => b.row === row && b.col === col);
        if (existingButton) {
          newButtons.push(existingButton);
        } else {
          newButtons.push({
            id: `${row}-${col}`,
            row,
            col,
            label: '',
            action: '',
            color: '#64748b',
            icon: '',
          });
        }
      }
    }
    setButtons(newButtons);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridRows, gridCols]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && (timerMinutes > 0 || timerSeconds > 0)) {
      interval = setInterval(() => {
        if (timerSeconds > 0) {
          setTimerSeconds(prev => prev - 1);
        } else if (timerMinutes > 0) {
          setTimerMinutes(prev => prev - 1);
          setTimerSeconds(59);
        }
      }, 1000);
    } else if (timerMinutes === 0 && timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerMinutes, timerSeconds]);

  const updateButton = useCallback((id: string, updates: Partial<StreamButton>) => {
    setButtons(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  }, []);

  const addAction = () => {
    if (newActionName.trim()) {
      setActions(prev => [...prev, {
        id: Date.now().toString(),
        name: newActionName.trim(),
        hotkey: newActionHotkey.trim(),
      }]);
      setNewActionName('');
      setNewActionHotkey('');
    }
  };

  const removeAction = (id: string) => {
    setActions(prev => prev.filter(a => a.id !== id));
  };

  const addScene = () => {
    if (newSceneName.trim()) {
      setScenes(prev => [...prev, {
        id: Date.now().toString(),
        name: newSceneName.trim(),
        isActive: false,
        sources: [],
      }]);
      setNewSceneName('');
    }
  };

  const setActiveScene = (id: string) => {
    setScenes(prev => prev.map(s => ({ ...s, isActive: s.id === id })));
  };

  const removeScene = (id: string) => {
    setScenes(prev => prev.filter(s => s.id !== id));
  };

  const toggleAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  };

  const updateAlertDuration = (id: string, duration: number) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, duration } : a));
  };

  const toggleOverlayItem = (id: string) => {
    setOverlayItems(prev => prev.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const resetTimer = () => {
    const totalSeconds = initialTime;
    setTimerMinutes(Math.floor(totalSeconds / 60));
    setTimerSeconds(totalSeconds % 60);
    setIsTimerRunning(false);
  };

  const setTimerPreset = (minutes: number) => {
    setInitialTime(minutes * 60);
    setTimerMinutes(minutes);
    setTimerSeconds(0);
    setIsTimerRunning(false);
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'follow': return <Users className="w-4 h-4" />;
      case 'subscribe': return <Gift className="w-4 h-4" />;
      case 'donation': return <MessageSquare className="w-4 h-4" />;
      case 'raid': return <Zap className="w-4 h-4" />;
      case 'bits': return <Gift className="w-4 h-4" />;
    }
  };

  const getButtonIcon = (iconName: string) => {
    switch (iconName) {
      case 'volume': return <Volume2 className="w-4 h-4" />;
      case 'camera': return <Camera className="w-4 h-4" />;
      case 'mic': return <Mic className="w-4 h-4" />;
      case 'message': return <MessageSquare className="w-4 h-4" />;
      case 'gift': return <Gift className="w-4 h-4" />;
      case 'users': return <Users className="w-4 h-4" />;
      case 'settings': return <Settings className="w-4 h-4" />;
      case 'zap': return <Zap className="w-4 h-4" />;
      default: return null;
    }
  };

  const tabs = [
    { id: 'buttons' as TabType, label: 'Button Layout', icon: Grid3X3 },
    { id: 'actions' as TabType, label: 'Actions', icon: Zap },
    { id: 'scenes' as TabType, label: 'Scenes', icon: Monitor },
    { id: 'alerts' as TabType, label: 'Alerts', icon: Bell },
    { id: 'overlay' as TabType, label: 'Overlay', icon: CheckSquare },
    { id: 'timer' as TabType, label: 'Timer', icon: Timer },
  ];

  const checkedCount = overlayItems.filter(item => item.checked).length;
  const progressPercent = (checkedCount / overlayItems.length) * 100;

  // Export handlers
  const handleExportJSON = () => {
    const data = {
      buttons,
      actions,
      scenes,
      alerts,
      overlayItems,
      gridRows,
      gridCols,
    };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `stream-deck-plan-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    // Export buttons
    csvContent += 'BUTTONS\n';
    csvContent += COLUMNS.buttons.join(',') + '\n';
    buttons.forEach(button => {
      csvContent += COLUMNS.buttons.map(col => {
        const value = button[col as keyof StreamButton];
        return typeof value === 'string' ? `"${value}"` : value;
      }).join(',') + '\n';
    });
    csvContent += '\n';

    // Export actions
    csvContent += 'ACTIONS\n';
    csvContent += COLUMNS.actions.join(',') + '\n';
    actions.forEach(action => {
      csvContent += COLUMNS.actions.map(col => {
        const value = action[col as keyof typeof action];
        return typeof value === 'string' ? `"${value}"` : value;
      }).join(',') + '\n';
    });
    csvContent += '\n';

    // Export scenes
    csvContent += 'SCENES\n';
    csvContent += COLUMNS.scenes.join(',') + '\n';
    scenes.forEach(scene => {
      csvContent += [
        scene.id,
        `"${scene.name}"`,
        scene.isActive,
        `"${(scene.sources || []).join(';')}"`,
      ].join(',') + '\n';
    });
    csvContent += '\n';

    // Export alerts
    csvContent += 'ALERTS\n';
    csvContent += COLUMNS.alerts.join(',') + '\n';
    alerts.forEach(alert => {
      csvContent += [
        alert.id,
        alert.type,
        alert.enabled,
        `"${alert.sound}"`,
        alert.duration,
      ].join(',') + '\n';
    });
    csvContent += '\n';

    // Export overlay items
    csvContent += 'OVERLAY\n';
    csvContent += COLUMNS.overlayItems.join(',') + '\n';
    overlayItems.forEach(item => {
      csvContent += [
        item.id,
        `"${item.name}"`,
        item.checked,
        item.category,
      ].join(',') + '\n';
    });

    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `stream-deck-plan-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-purple-900/20' : 'bg-gradient-to-r from-white to-purple-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Grid3X3 className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.streamDeckPlanner.streamDeckPlanner', 'Stream Deck Planner')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.streamDeckPlanner.planYourStreamingSetupAnd', 'Plan your streaming setup and button layouts')}</p>
            </div>
          </div>
          <ExportDropdown
            onExportJSON={handleExportJSON}
            onExportCSV={handleExportCSV}
            showImport={false}
            theme={isDark ? 'dark' : 'light'}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex overflow-x-auto border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? `${isDark ? 'text-purple-400 border-b-2 border-purple-400' : 'text-purple-600 border-b-2 border-purple-600'}`
                : `${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'}`
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6 space-y-6">
        {/* Button Layout Tab */}
        {activeTab === 'buttons' && (
          <div className="space-y-6">
            {/* Grid Size Controls */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.streamDeckPlanner.rows', 'Rows')}
                </label>
                <select
                  value={gridRows}
                  onChange={(e) => setGridRows(Number(e.target.value))}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  {[2, 3, 4, 5].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.streamDeckPlanner.columns', 'Columns')}
                </label>
                <select
                  value={gridCols}
                  onChange={(e) => setGridCols(Number(e.target.value))}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  {[3, 4, 5, 6, 8].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Button Grid */}
            <div
              className={`grid gap-2 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
              style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
            >
              {buttons.map(button => (
                <button
                  key={button.id}
                  onClick={() => setSelectedButton(button.id === selectedButton ? null : button.id)}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center p-2 transition-all ${
                    selectedButton === button.id ? 'ring-2 ring-purple-500' : ''
                  }`}
                  style={{ backgroundColor: button.color }}
                >
                  {button.icon && (
                    <span className="text-white">{getButtonIcon(button.icon)}</span>
                  )}
                  <span className="text-xs text-white text-center truncate w-full mt-1">
                    {button.label || `${button.row + 1}-${button.col + 1}`}
                  </span>
                </button>
              ))}
            </div>

            {/* Button Editor */}
            {selectedButton && (
              <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border`}>
                <h4 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.streamDeckPlanner.editButton', 'Edit Button')}
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      Label
                    </label>
                    <input
                      type="text"
                      value={buttons.find(b => b.id === selectedButton)?.label || ''}
                      onChange={(e) => updateButton(selectedButton, { label: e.target.value })}
                      placeholder={t('tools.streamDeckPlanner.buttonLabel', 'Button label')}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('tools.streamDeckPlanner.action', 'Action')}
                    </label>
                    <select
                      value={buttons.find(b => b.id === selectedButton)?.action || ''}
                      onChange={(e) => updateButton(selectedButton, { action: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    >
                      <option value="">{t('tools.streamDeckPlanner.selectAction', 'Select action...')}</option>
                      {actions.map(action => (
                        <option key={action.id} value={action.id}>{action.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('tools.streamDeckPlanner.color', 'Color')}
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {BUTTON_COLORS.map(color => (
                        <button
                          key={color}
                          onClick={() => updateButton(selectedButton, { color })}
                          className={`w-8 h-8 rounded-lg ${buttons.find(b => b.id === selectedButton)?.color === color ? 'ring-2 ring-white' : ''}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('tools.streamDeckPlanner.icon', 'Icon')}
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {BUTTON_ICONS.map(icon => (
                        <button
                          key={icon}
                          onClick={() => updateButton(selectedButton, { icon })}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            buttons.find(b => b.id === selectedButton)?.icon === icon
                              ? 'bg-purple-500 text-white'
                              : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {getButtonIcon(icon)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions Tab */}
        {activeTab === 'actions' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newActionName}
                onChange={(e) => setNewActionName(e.target.value)}
                placeholder={t('tools.streamDeckPlanner.actionName', 'Action name')}
                className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
              <input
                type="text"
                value={newActionHotkey}
                onChange={(e) => setNewActionHotkey(e.target.value)}
                placeholder={t('tools.streamDeckPlanner.hotkey', 'Hotkey')}
                className={`w-24 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
              <button
                onClick={addAction}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {actions.map(action => (
                <div
                  key={action.id}
                  className={`flex items-center justify-between p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
                >
                  <div className="flex items-center gap-3">
                    <Zap className="w-4 h-4 text-purple-500" />
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>{action.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {action.hotkey && (
                      <kbd className={`px-2 py-1 rounded text-xs font-mono ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                        {action.hotkey}
                      </kbd>
                    )}
                    <button
                      onClick={() => removeAction(action.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scenes Tab */}
        {activeTab === 'scenes' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newSceneName}
                onChange={(e) => setNewSceneName(e.target.value)}
                placeholder={t('tools.streamDeckPlanner.newSceneName', 'New scene name')}
                className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
              <button
                onClick={addScene}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t('tools.streamDeckPlanner.addScene', 'Add Scene')}
              </button>
            </div>

            <div className="space-y-2">
              {scenes.map(scene => (
                <div
                  key={scene.id}
                  className={`p-4 rounded-lg border ${
                    scene.isActive
                      ? `${isDark ? 'bg-purple-900/30 border-purple-700' : 'bg-purple-50 border-purple-300'}`
                      : `${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Monitor className={`w-4 h-4 ${scene.isActive ? 'text-purple-500' : isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{scene.name}</span>
                      {scene.isActive && (
                        <span className="px-2 py-0.5 text-xs bg-purple-500 text-white rounded-full">{t('tools.streamDeckPlanner.live', 'LIVE')}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!scene.isActive && (
                        <button
                          onClick={() => setActiveScene(scene.id)}
                          className="px-3 py-1 text-sm bg-purple-500 text-white rounded hover:bg-purple-600"
                        >
                          {t('tools.streamDeckPlanner.setActive', 'Set Active')}
                        </button>
                      )}
                      <button
                        onClick={() => removeScene(scene.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {scene.sources.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {scene.sources.map((source, idx) => (
                        <span
                          key={idx}
                          className={`px-2 py-0.5 text-xs rounded ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}
                        >
                          {source}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            {alerts.map(alert => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`p-2 rounded-lg ${alert.enabled ? 'bg-purple-500/20 text-purple-500' : isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'}`}>
                      {getAlertIcon(alert.type)}
                    </span>
                    <span className={`font-medium capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {alert.type}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleAlert(alert.id)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium ${
                      alert.enabled
                        ? 'bg-purple-500 text-white'
                        : isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {alert.enabled ? t('tools.streamDeckPlanner.enabled', 'Enabled') : t('tools.streamDeckPlanner.disabled', 'Disabled')}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t('tools.streamDeckPlanner.sound', 'Sound')}
                    </label>
                    <div className={`px-3 py-2 rounded text-sm ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                      {alert.sound}
                    </div>
                  </div>
                  <div>
                    <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t('tools.streamDeckPlanner.durationSeconds', 'Duration (seconds)')}
                    </label>
                    <input
                      type="number"
                      value={alert.duration}
                      onChange={(e) => updateAlertDuration(alert.id, Number(e.target.value))}
                      className={`w-full px-3 py-2 rounded text-sm ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'} border`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Overlay Checklist Tab */}
        {activeTab === 'overlay' && (
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.streamDeckPlanner.setupProgress', 'Setup Progress')}</span>
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {checkedCount}/{overlayItems.length} completed
                </span>
              </div>
              <div className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}>
                <div
                  className="h-full bg-purple-500 rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Required Items */}
            <div>
              <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                {t('tools.streamDeckPlanner.required', 'Required')}
              </h4>
              <div className="space-y-2">
                {overlayItems.filter(item => item.category === 'required').map(item => (
                  <label
                    key={item.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${isDark ? 'bg-gray-800 hover:bg-gray-750' : 'bg-gray-100 hover:bg-gray-150'}`}
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleOverlayItem(item.id)}
                      className="w-5 h-5 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                    />
                    <span className={`${item.checked ? 'line-through opacity-60' : ''} ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {item.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Recommended Items */}
            <div>
              <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                {t('tools.streamDeckPlanner.recommended', 'Recommended')}
              </h4>
              <div className="space-y-2">
                {overlayItems.filter(item => item.category === 'recommended').map(item => (
                  <label
                    key={item.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${isDark ? 'bg-gray-800 hover:bg-gray-750' : 'bg-gray-100 hover:bg-gray-150'}`}
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleOverlayItem(item.id)}
                      className="w-5 h-5 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                    />
                    <span className={`${item.checked ? 'line-through opacity-60' : ''} ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {item.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Optional Items */}
            <div>
              <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                {t('tools.streamDeckPlanner.optional', 'Optional')}
              </h4>
              <div className="space-y-2">
                {overlayItems.filter(item => item.category === 'optional').map(item => (
                  <label
                    key={item.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${isDark ? 'bg-gray-800 hover:bg-gray-750' : 'bg-gray-100 hover:bg-gray-150'}`}
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleOverlayItem(item.id)}
                      className="w-5 h-5 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                    />
                    <span className={`${item.checked ? 'line-through opacity-60' : ''} ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {item.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Timer Tab */}
        {activeTab === 'timer' && (
          <div className="space-y-6">
            {/* Timer Display */}
            <div className={`text-center p-8 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <div className={`text-6xl font-mono font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
              </div>
              <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.streamDeckPlanner.startingSoonTimer', 'Starting Soon Timer')}
              </p>
            </div>

            {/* Timer Controls */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${
                  isTimerRunning
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                    : 'bg-purple-500 text-white hover:bg-purple-600'
                }`}
              >
                {isTimerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                {isTimerRunning ? t('tools.streamDeckPlanner.pause', 'Pause') : t('tools.streamDeckPlanner.start', 'Start')}
              </button>
              <button
                onClick={resetTimer}
                className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
              >
                <RotateCcw className="w-5 h-5" />
                {t('tools.streamDeckPlanner.reset', 'Reset')}
              </button>
            </div>

            {/* Presets */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.streamDeckPlanner.quickPresets', 'Quick Presets')}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 3, 5, 10, 15, 20, 30, 60].map(min => (
                  <button
                    key={min}
                    onClick={() => setTimerPreset(min)}
                    className={`py-2 rounded-lg text-sm ${
                      initialTime === min * 60
                        ? 'bg-purple-500 text-white'
                        : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {min}m
                  </button>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <div className="flex items-start gap-2">
                <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>{t('tools.streamDeckPlanner.tips', 'Tips:')}</strong>
                  <ul className="mt-1 space-y-1">
                    <li>{t('tools.streamDeckPlanner.use510MinutesFor', 'Use 5-10 minutes for a "Starting Soon" screen')}</li>
                    <li>{t('tools.streamDeckPlanner.enableCountdownVisibilityInYour', 'Enable countdown visibility in your streaming software')}</li>
                    <li>{t('tools.streamDeckPlanner.considerAddingBackgroundMusicDuring', 'Consider adding background music during countdown')}</li>
                    <li>{t('tools.streamDeckPlanner.useThisTimeForFinal', 'Use this time for final audio/video checks')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StreamDeckPlannerTool;
