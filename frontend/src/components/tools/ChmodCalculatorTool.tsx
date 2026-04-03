import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, Copy, Check, Info, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface ChmodCalculatorToolProps {
  uiConfig?: UIConfig;
}

type PermissionType = 'read' | 'write' | 'execute';
type UserType = 'owner' | 'group' | 'others';

export const ChmodCalculatorTool: React.FC<ChmodCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Handle prefill data
  useEffect(() => {
    if (uiConfig?.prefillData) {
      const data = uiConfig.prefillData as ToolPrefillData;
      if (data.octal) setOctalInput(data.octal);
      setIsPrefilled(true);
    }
  }, [uiConfig]);

  const [permissions, setPermissions] = useState({
    owner: { read: true, write: true, execute: true },
    group: { read: true, write: false, execute: true },
    others: { read: true, write: false, execute: false },
  });
  const [octalInput, setOctalInput] = useState('');
  const [copied, setCopied] = useState('');

  const permissionBits: Record<PermissionType, number> = {
    read: 4,
    write: 2,
    execute: 1,
  };

  const togglePermission = (user: UserType, perm: PermissionType) => {
    setPermissions({
      ...permissions,
      [user]: {
        ...permissions[user],
        [perm]: !permissions[user][perm],
      },
    });
  };

  const result = useMemo(() => {
    const calculateOctal = (perms: { read: boolean; write: boolean; execute: boolean }) => {
      return (perms.read ? 4 : 0) + (perms.write ? 2 : 0) + (perms.execute ? 1 : 0);
    };

    const ownerOctal = calculateOctal(permissions.owner);
    const groupOctal = calculateOctal(permissions.group);
    const othersOctal = calculateOctal(permissions.others);

    const octal = `${ownerOctal}${groupOctal}${othersOctal}`;

    const symbolic = [
      permissions.owner.read ? 'r' : '-',
      permissions.owner.write ? 'w' : '-',
      permissions.owner.execute ? 'x' : '-',
      permissions.group.read ? 'r' : '-',
      permissions.group.write ? 'w' : '-',
      permissions.group.execute ? 'x' : '-',
      permissions.others.read ? 'r' : '-',
      permissions.others.write ? 'w' : '-',
      permissions.others.execute ? 'x' : '-',
    ].join('');

    return { octal, symbolic };
  }, [permissions]);

  const handleOctalInput = (value: string) => {
    setOctalInput(value);
    if (/^[0-7]{3}$/.test(value)) {
      const digits = value.split('').map(Number);
      setPermissions({
        owner: {
          read: (digits[0] & 4) !== 0,
          write: (digits[0] & 2) !== 0,
          execute: (digits[0] & 1) !== 0,
        },
        group: {
          read: (digits[1] & 4) !== 0,
          write: (digits[1] & 2) !== 0,
          execute: (digits[1] & 1) !== 0,
        },
        others: {
          read: (digits[2] & 4) !== 0,
          write: (digits[2] & 2) !== 0,
          execute: (digits[2] & 1) !== 0,
        },
      });
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(''), 2000);
  };

  const presets = [
    { name: 'Full Access', octal: '777', desc: 'All permissions for everyone' },
    { name: 'Owner Only', octal: '700', desc: 'Only owner has access' },
    { name: 'Standard File', octal: '644', desc: 'Owner read/write, others read' },
    { name: 'Standard Dir', octal: '755', desc: 'Owner full, others read/execute' },
    { name: 'Private File', octal: '600', desc: 'Owner read/write only' },
    { name: 'Script', octal: '755', desc: 'Executable by everyone' },
  ];

  const userLabels: Record<UserType, string> = {
    owner: 'Owner (u)',
    group: 'Group (g)',
    others: 'Others (o)',
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-violet-900/20' : 'bg-gradient-to-r from-white to-violet-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-500/10 rounded-lg">
            <Lock className="w-5 h-5 text-violet-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.chmodCalculator.chmodCalculator', 'Chmod Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.chmodCalculator.calculateUnixFilePermissions', 'Calculate Unix file permissions')}</p>
          </div>
        </div>
      </div>

      {isPrefilled && (
        <div className={`mx-6 mt-4 p-3 rounded-lg flex items-center gap-2 ${isDark ? 'bg-violet-900/20 border border-violet-800' : 'bg-violet-50 border border-violet-200'}`}>
          <Sparkles className="w-4 h-4 text-violet-500" />
          <span className={`text-sm ${isDark ? 'text-violet-400' : 'text-violet-700'}`}>
            {t('tools.chmodCalculator.preFilledBasedOnYour', 'Pre-filled based on your request')}
          </span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Preset Buttons */}
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handleOctalInput(preset.octal)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              title={preset.desc}
            >
              {preset.name} ({preset.octal})
            </button>
          ))}
        </div>

        {/* Octal Input */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.chmodCalculator.enterOctalValue', 'Enter Octal Value')}
          </label>
          <input
            type="text"
            value={octalInput}
            onChange={(e) => handleOctalInput(e.target.value.replace(/[^0-7]/g, '').slice(0, 3))}
            placeholder="e.g., 755"
            maxLength={3}
            className={`w-full px-4 py-3 rounded-lg border font-mono text-2xl text-center ${
              isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>

        {/* Permission Matrix */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <table className="w-full">
            <thead>
              <tr className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                <th className="text-left py-2"></th>
                <th className="text-center py-2">{t('tools.chmodCalculator.read4', 'Read (4)')}</th>
                <th className="text-center py-2">{t('tools.chmodCalculator.write2', 'Write (2)')}</th>
                <th className="text-center py-2">{t('tools.chmodCalculator.execute1', 'Execute (1)')}</th>
                <th className="text-center py-2">{t('tools.chmodCalculator.octal', 'Octal')}</th>
              </tr>
            </thead>
            <tbody>
              {(['owner', 'group', 'others'] as UserType[]).map((user) => {
                const userPerms = permissions[user];
                const octal = (userPerms.read ? 4 : 0) + (userPerms.write ? 2 : 0) + (userPerms.execute ? 1 : 0);
                return (
                  <tr key={user}>
                    <td className={`py-2 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {userLabels[user]}
                    </td>
                    {(['read', 'write', 'execute'] as PermissionType[]).map((perm) => (
                      <td key={perm} className="text-center py-2">
                        <button
                          onClick={() => togglePermission(user, perm)}
                          className={`w-10 h-10 rounded-lg transition-colors ${
                            permissions[user][perm]
                              ? 'bg-violet-500 text-white'
                              : isDark
                              ? 'bg-gray-700 text-gray-400'
                              : 'bg-gray-200 text-gray-500'
                          }`}
                        >
                          {perm === 'read' ? 'r' : perm === 'write' ? 'w' : 'x'}
                        </button>
                      </td>
                    ))}
                    <td className={`text-center py-2 text-xl font-mono font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {octal}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-xl ${isDark ? 'bg-violet-900/20 border-violet-800' : 'bg-violet-50 border-violet-100'} border`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.chmodCalculator.octal2', 'Octal')}</div>
                <div className={`text-3xl font-mono font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {result.octal}
                </div>
              </div>
              <button
                onClick={() => handleCopy(`chmod ${result.octal} filename`)}
                className={`p-2 rounded-lg transition-colors ${
                  copied.includes(result.octal) ? 'text-green-500' : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                {copied.includes(result.octal) ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className={`p-4 rounded-xl ${isDark ? 'bg-violet-900/20 border-violet-800' : 'bg-violet-50 border-violet-100'} border`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.chmodCalculator.symbolic', 'Symbolic')}</div>
                <div className={`text-3xl font-mono font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  -{result.symbolic}
                </div>
              </div>
              <button
                onClick={() => handleCopy(result.symbolic)}
                className={`p-2 rounded-lg transition-colors ${
                  copied === result.symbolic ? 'text-green-500' : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                {copied === result.symbolic ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Command */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.chmodCalculator.command', 'Command')}</span>
            <button
              onClick={() => handleCopy(`chmod ${result.octal} filename`)}
              className={`p-1 rounded transition-colors ${
                isDark ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <code className={`font-mono ${isDark ? 'text-violet-400' : 'text-violet-600'}`}>
            chmod {result.octal} filename
          </code>
        </div>

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex gap-2">
            <Info className={`w-5 h-5 flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>r</strong> = read (4), <strong>w</strong> = write (2), <strong>x</strong> = execute (1).
              Each digit is the sum of permissions. Common values: 755 (standard dir), 644 (standard file), 777 (full access).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChmodCalculatorTool;
