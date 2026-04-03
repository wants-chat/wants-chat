import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Copy,
  Plus,
  Search,
  Star,
  Trash2,
  Edit3,
  Key,
  Globe,
  User,
  Shield,
  Settings,
  RefreshCw,
  X,
  Check,
  AlertCircle,
  Clock,
  Filter,
  SortAsc,
  FolderOpen,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import SyncStatus from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import useToolData from '../../hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

// Types
interface PasswordEntry {
  id: string;
  name: string;
  username: string;
  password: string;
  url: string;
  category: Category;
  notes: string;
  isFavorite: boolean;
  dateAdded: string;
  lastModified: string;
}

type Category = 'Social' | 'Email' | 'Banking' | 'Shopping' | 'Work' | 'Entertainment' | 'Other';

interface VaultData {
  entries: PasswordEntry[];
  settings: VaultSettings;
}

interface VaultSettings {
  autoLockTimeout: number; // in minutes
  clearClipboardTimeout: number; // in seconds
}

type SortOption = 'name' | 'dateAdded' | 'lastModified';

// Simple encryption using XOR with master password
const encrypt = (data: string, key: string): string => {
  let result = '';
  for (let i = 0; i < data.length; i++) {
    result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return btoa(result);
};

const decrypt = (data: string, key: string): string => {
  try {
    const decoded = atob(data);
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  } catch {
    return '';
  }
};

// Hash function for master password verification
const hashPassword = (password: string): string => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return btoa(hash.toString() + password.length.toString());
};

const STORAGE_KEY = 'password_vault_data';
const MASTER_HASH_KEY = 'password_vault_master_hash';

const CATEGORIES: Category[] = ['Social', 'Email', 'Banking', 'Shopping', 'Work', 'Entertainment', 'Other'];

const CATEGORY_COLORS: Record<Category, string> = {
  Social: 'bg-blue-500',
  Email: 'bg-red-500',
  Banking: 'bg-green-500',
  Shopping: 'bg-purple-500',
  Work: 'bg-orange-500',
  Entertainment: 'bg-pink-500',
  Other: 'bg-gray-500',
};

// Column configuration for exports (excluding sensitive password data)
const COLUMNS: ColumnConfig[] = [
  { key: 'name', header: 'Name', type: 'string' },
  { key: 'username', header: 'Username', type: 'string' },
  { key: 'url', header: 'URL', type: 'string' },
  { key: 'category', header: 'Category', type: 'string' },
  { key: 'notes', header: 'Notes', type: 'string' },
  { key: 'isFavorite', header: 'Favorite', type: 'boolean' },
  { key: 'dateAdded', header: 'Date Added', type: 'date' },
  { key: 'lastModified', header: 'Last Modified', type: 'date' },
];

interface PasswordVaultToolProps {
  uiConfig?: UIConfig;
}

export const PasswordVaultTool: React.FC<PasswordVaultToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);

  // Auth state
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [isLocked, setIsLocked] = useState(true);
  const [masterPassword, setMasterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showMasterPassword, setShowMasterPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // Vault state - using useToolData hook for backend sync
  const {
    data: entries,
    setData: setEntries,
    addItem,
    updateItem,
    deleteItem,
    isLoading,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<PasswordEntry>(
    'password-vault',
    [],
    COLUMNS
  );

  const [settings, setSettings] = useState<VaultSettings>({
    autoLockTimeout: 5,
    clearClipboardTimeout: 30,
  });

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);
  const [showChangeMasterModal, setShowChangeMasterModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<PasswordEntry | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    url: '',
    category: 'Other' as Category,
    notes: '',
  });
  const [showFormPassword, setShowFormPassword] = useState(false);

  // Apply prefill data from uiConfig.params
  useEffect(() => {
    if (uiConfig?.params && !isLocked) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.title || params.email) {
        // Use available ToolPrefillData properties to prefill form
        setFormData({
          name: params.title || '',
          username: params.email || '',
          password: '',
          url: params.metadata?.url || '',
          category: (params.type as Category) || 'Other',
          notes: params.description || '',
        });
        setShowAddModal(true);
        setIsPrefilled(true);
      } else if (params.text || params.content) {
        setSearchQuery(params.text || params.content || '');
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params, isLocked]);

  // Handle prefill from gallery edit (uiConfig.params)
  useEffect(() => {
    const params = uiConfig?.params as Record<string, any>;
    if (params?.isEditFromGallery && !isLocked) {
      // Restore form state from saved params
      if (params.formData) setFormData(params.formData);
      if (params.searchQuery) setSearchQuery(params.searchQuery);
      if (params.selectedCategory) setSelectedCategory(params.selectedCategory);
      if (params.sortBy) setSortBy(params.sortBy);
      if (params.showFavoritesOnly !== undefined) setShowFavoritesOnly(params.showFavoritesOnly);
      setIsEditFromGallery(true);
    }
  }, [uiConfig?.params, isLocked]);

  // Password generator state
  const [genLength, setGenLength] = useState(16);
  const [genUppercase, setGenUppercase] = useState(true);
  const [genLowercase, setGenLowercase] = useState(true);
  const [genNumbers, setGenNumbers] = useState(true);
  const [genSymbols, setGenSymbols] = useState(true);
  const [genExcludeAmbiguous, setGenExcludeAmbiguous] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');

  // Auto-lock timer
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Check if first time user
  useEffect(() => {
    const storedHash = localStorage.getItem(MASTER_HASH_KEY);
    setIsFirstTime(!storedHash);
  }, []);

  // Auto-lock on inactivity
  useEffect(() => {
    if (isLocked) return;

    const checkInactivity = () => {
      const now = Date.now();
      const inactiveMinutes = (now - lastActivity) / (1000 * 60);
      if (inactiveMinutes >= settings.autoLockTimeout) {
        handleLock();
      }
    };

    const interval = setInterval(checkInactivity, 10000); // Check every 10 seconds

    const resetTimer = () => setLastActivity(Date.now());
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);
    window.addEventListener('click', resetTimer);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      window.removeEventListener('click', resetTimer);
    };
  }, [isLocked, lastActivity, settings.autoLockTimeout]);

  // Load and decrypt vault data
  const loadVault = useCallback((password: string): boolean => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) {
      setEntries([]);
      return true;
    }

    try {
      const decrypted = decrypt(storedData, password);
      const data: VaultData = JSON.parse(decrypted);
      setEntries(data.entries || []);
      if (data.settings) {
        setSettings(data.settings);
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  // Save and encrypt vault data
  const saveVault = useCallback((entriesToSave: PasswordEntry[], settingsToSave: VaultSettings, password: string) => {
    const data: VaultData = {
      entries: entriesToSave,
      settings: settingsToSave,
    };
    const encrypted = encrypt(JSON.stringify(data), password);
    localStorage.setItem(STORAGE_KEY, encrypted);
  }, []);

  // Handle master password setup
  const handleSetupMaster = () => {
    setAuthError('');

    if (masterPassword.length < 8) {
      setAuthError('Master password must be at least 8 characters');
      return;
    }

    if (masterPassword !== confirmPassword) {
      setAuthError('Passwords do not match');
      return;
    }

    const hash = hashPassword(masterPassword);
    localStorage.setItem(MASTER_HASH_KEY, hash);
    setIsFirstTime(false);
    setIsLocked(false);
    setConfirmPassword('');
    saveVault([], settings, masterPassword);
  };

  // Handle unlock
  const handleUnlock = () => {
    setAuthError('');
    const storedHash = localStorage.getItem(MASTER_HASH_KEY);
    const inputHash = hashPassword(masterPassword);

    if (storedHash !== inputHash) {
      setAuthError('Incorrect master password');
      return;
    }

    if (!loadVault(masterPassword)) {
      setAuthError('Failed to decrypt vault data');
      return;
    }

    setIsLocked(false);
    setLastActivity(Date.now());
  };

  // Handle lock
  const handleLock = () => {
    setIsLocked(true);
    setMasterPassword('');
    setEntries([]);
    setVisiblePasswords(new Set());
  };

  // Handle change master password
  const handleChangeMaster = (oldPassword: string, newPassword: string, confirmNew: string) => {
    const storedHash = localStorage.getItem(MASTER_HASH_KEY);
    const inputHash = hashPassword(oldPassword);

    if (storedHash !== inputHash) {
      return 'Incorrect current password';
    }

    if (newPassword.length < 8) {
      return 'New password must be at least 8 characters';
    }

    if (newPassword !== confirmNew) {
      return 'New passwords do not match';
    }

    // Re-encrypt with new password
    const newHash = hashPassword(newPassword);
    localStorage.setItem(MASTER_HASH_KEY, newHash);
    saveVault(entries, settings, newPassword);
    setMasterPassword(newPassword);
    return null;
  };

  // Copy to clipboard with auto-clear
  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);

      // Clear clipboard after timeout
      setTimeout(async () => {
        try {
          const currentClipboard = await navigator.clipboard.readText();
          if (currentClipboard === text) {
            await navigator.clipboard.writeText('');
          }
        } catch {
          // Clipboard access may be denied
        }
      }, settings.clearClipboardTimeout * 1000);
    } catch {
      console.error('Failed to copy');
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Get password strength
  const getPasswordStrength = (password: string): { strength: string; color: string; percentage: number } => {
    if (!password) return { strength: '', color: '', percentage: 0 };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 2) return { strength: 'Weak', color: 'bg-red-500', percentage: 25 };
    if (score <= 4) return { strength: 'Medium', color: 'bg-yellow-500', percentage: 50 };
    if (score <= 5) return { strength: 'Strong', color: 'bg-green-500', percentage: 75 };
    return { strength: 'Very Strong', color: 'bg-green-600', percentage: 100 };
  };

  // Generate password
  const generatePassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const ambiguous = 'lI1O0';

    let charset = '';
    let requiredChars = '';

    if (genUppercase) {
      let chars = uppercase;
      if (genExcludeAmbiguous) chars = chars.replace(/[IO]/g, '');
      charset += chars;
      if (chars.length > 0) requiredChars += chars[Math.floor(Math.random() * chars.length)];
    }
    if (genLowercase) {
      let chars = lowercase;
      if (genExcludeAmbiguous) chars = chars.replace(/[l]/g, '');
      charset += chars;
      if (chars.length > 0) requiredChars += chars[Math.floor(Math.random() * chars.length)];
    }
    if (genNumbers) {
      let chars = numbers;
      if (genExcludeAmbiguous) chars = chars.replace(/[10]/g, '');
      charset += chars;
      if (chars.length > 0) requiredChars += chars[Math.floor(Math.random() * chars.length)];
    }
    if (genSymbols) {
      charset += symbols;
      requiredChars += symbols[Math.floor(Math.random() * symbols.length)];
    }

    if (!charset) {
      setGeneratedPassword('');
      return;
    }

    let password = requiredChars;
    const remainingLength = genLength - requiredChars.length;

    for (let i = 0; i < remainingLength; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    // Shuffle
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    setGeneratedPassword(password);
  };

  // Add/Edit entry
  const handleSaveEntry = () => {
    if (!formData.name.trim() || !formData.password.trim()) {
      return;
    }

    const now = new Date().toISOString();

    if (editingEntry) {
      // Use hook's updateItem method
      updateItem(editingEntry.id, {
        ...formData,
        lastModified: now,
      });
      saveVault(
        entries.map(e =>
          e.id === editingEntry.id
            ? { ...e, ...formData, lastModified: now }
            : e
        ),
        settings,
        masterPassword
      );
    } else {
      const newEntry: PasswordEntry = {
        id: Date.now().toString(),
        ...formData,
        isFavorite: false,
        dateAdded: now,
        lastModified: now,
      };
      // Use hook's addItem method
      addItem(newEntry);
      saveVault([...entries, newEntry], settings, masterPassword);
    }

    resetForm();
    setShowAddModal(false);
    setEditingEntry(null);

    // Call onSaveCallback if editing from gallery
    const params = uiConfig?.params as Record<string, any>;
    if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
      params.onSaveCallback();
    }
  };

  // Delete entry
  const handleDeleteEntry = async (id: string) => {
    const entry = entries.find(e => e.id === id);
    const confirmed = await confirm({
      title: 'Delete Password Entry',
      message: `Are you sure you want to delete "${entry?.name || 'this entry'}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });

    if (!confirmed) return;

    // Use hook's deleteItem method
    deleteItem(id);
    saveVault(
      entries.filter(e => e.id !== id),
      settings,
      masterPassword
    );
  };

  // Toggle favorite
  const handleToggleFavorite = (id: string) => {
    // Use hook's updateItem method
    const entry = entries.find(e => e.id === id);
    if (entry) {
      updateItem(id, { isFavorite: !entry.isFavorite });
      const updatedEntries = entries.map(e =>
        e.id === id ? { ...e, isFavorite: !e.isFavorite } : e
      );
      saveVault(updatedEntries, settings, masterPassword);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      username: '',
      password: '',
      url: '',
      category: 'Other',
      notes: '',
    });
    setShowFormPassword(false);
  };

  // Open edit modal
  const openEditModal = (entry: PasswordEntry) => {
    setEditingEntry(entry);
    setFormData({
      name: entry.name,
      username: entry.username,
      password: entry.password,
      url: entry.url,
      category: entry.category,
      notes: entry.notes,
    });
    setShowAddModal(true);
  };

  // Filter and sort entries
  const filteredEntries = entries
    .filter(entry => {
      const matchesSearch =
        entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.username.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || entry.category === selectedCategory;
      const matchesFavorite = !showFavoritesOnly || entry.isFavorite;
      return matchesSearch && matchesCategory && matchesFavorite;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'dateAdded':
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        case 'lastModified':
          return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
        default:
          return 0;
      }
    });

  // Prepare export data (excluding passwords for security)
  const exportData = useMemo(() => {
    return filteredEntries.map(entry => ({
      name: entry.name,
      username: entry.username,
      url: entry.url,
      category: entry.category,
      notes: entry.notes,
      isFavorite: entry.isFavorite,
      dateAdded: entry.dateAdded,
      lastModified: entry.lastModified,
    }));
  }, [filteredEntries]);

  const hasExportData = exportData.length > 0;

  // Render lock screen
  if (isFirstTime) {
    return (
      <div className={`max-w-md mx-auto p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="text-center mb-6">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <Shield className="w-8 h-8 text-[#0D9488]" />
          </div>
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.passwordVault.setUpPasswordVault', 'Set Up Password Vault')}
          </h2>
          <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('tools.passwordVault.createAMasterPasswordTo', 'Create a master password to secure your vault')}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.passwordVault.masterPassword', 'Master Password')}
            </label>
            <div className="relative">
              <input
                type={showMasterPassword ? 'text' : 'password'}
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
                placeholder={t('tools.passwordVault.enterMasterPassword', 'Enter master password')}
                className={`w-full px-4 py-3 pr-12 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
              <button
                type="button"
                onClick={() => setShowMasterPassword(!showMasterPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
              >
                {showMasterPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {masterPassword && (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getPasswordStrength(masterPassword).color} transition-all`}
                      style={{ width: `${getPasswordStrength(masterPassword).percentage}%` }}
                    />
                  </div>
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {getPasswordStrength(masterPassword).strength}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.passwordVault.confirmPassword', 'Confirm Password')}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('tools.passwordVault.confirmMasterPassword', 'Confirm master password')}
              className={`w-full px-4 py-3 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
            />
          </div>

          {authError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="text-sm text-red-700 dark:text-red-300">{authError}</span>
            </div>
          )}

          <button
            onClick={handleSetupMaster}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors font-medium"
          >
            <Lock className="w-5 h-5" />
            {t('tools.passwordVault.createVault', 'Create Vault')}
          </button>
        </div>

        <p className={`mt-4 text-xs text-center ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
          Your data is stored locally and encrypted with your master password.
          If you forget it, your data cannot be recovered.
        </p>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className={`max-w-md mx-auto p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="text-center mb-6">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <Lock className="w-8 h-8 text-[#0D9488]" />
          </div>
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.passwordVault.unlockVault', 'Unlock Vault')}
          </h2>
          <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('tools.passwordVault.enterYourMasterPasswordTo', 'Enter your master password to access your passwords')}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.passwordVault.masterPassword2', 'Master Password')}
            </label>
            <div className="relative">
              <input
                type={showMasterPassword ? 'text' : 'password'}
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                placeholder={t('tools.passwordVault.enterMasterPassword2', 'Enter master password')}
                className={`w-full px-4 py-3 pr-12 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
              <button
                type="button"
                onClick={() => setShowMasterPassword(!showMasterPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
              >
                {showMasterPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {authError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="text-sm text-red-700 dark:text-red-300">{authError}</span>
            </div>
          )}

          <button
            onClick={handleUnlock}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors font-medium"
          >
            <Unlock className="w-5 h-5" />
            {t('tools.passwordVault.unlock', 'Unlock')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.passwordVault.passwordVault', 'Password Vault')}
          </h2>
          {isPrefilled && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0D9488]/10 rounded-lg border border-[#0D9488]/20">
              <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
              <span className="text-xs text-[#0D9488] font-medium">{t('tools.passwordVault.prefilled', 'Prefilled')}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Sync Status */}
          <WidgetEmbedButton toolSlug="password-vault" toolName="Password Vault" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            syncError={syncError}
            onForceSync={forceSync}
            theme={theme === 'dark' ? 'dark' : 'light'}
            showLabel={true}
            size="sm"
          />
          {hasExportData && (
            <ExportDropdown
              onExportCSV={() => exportToCSV(exportData, COLUMNS, { filename: 'password-vault' })}
              onExportExcel={() => exportToExcel(exportData, COLUMNS, { filename: 'password-vault' })}
              onExportJSON={() => exportToJSON(exportData, { filename: 'password-vault' })}
              onExportPDF={async () => {
                await exportToPDF(exportData, COLUMNS, {
                  filename: 'password-vault',
                  title: 'Password Vault',
                  subtitle: `${exportData.length} password${exportData.length !== 1 ? 's' : ''} (passwords excluded for security)`,
                });
              }}
              onPrint={() => printData(exportData, COLUMNS, { title: 'Password Vault' })}
              onCopyToClipboard={() => copyUtil(exportData, COLUMNS, 'tab')}
              showImport={false}
              theme={theme === 'dark' ? 'dark' : 'light'}
            />
          )}
          <button
            onClick={() => setShowSettingsModal(true)}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
            }`}
            title={t('tools.passwordVault.settings', 'Settings')}
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={handleLock}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            <Lock className="w-4 h-4" />
            {t('tools.passwordVault.lock', 'Lock')}
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('tools.passwordVault.searchByNameOrUsername', 'Search by name or username...')}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
          />
        </div>

        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as Category | 'All')}
            className={`px-3 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
          >
            <option value="All">{t('tools.passwordVault.allCategories', 'All Categories')}</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className={`px-3 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
          >
            <option value="name">{t('tools.passwordVault.sortByName', 'Sort by Name')}</option>
            <option value="dateAdded">{t('tools.passwordVault.sortByDateAdded', 'Sort by Date Added')}</option>
            <option value="lastModified">{t('tools.passwordVault.sortByLastModified', 'Sort by Last Modified')}</option>
          </select>

          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`p-2 rounded-lg border transition-colors ${
              showFavoritesOnly
                ? 'bg-yellow-500 border-yellow-500 text-white'
                : theme === 'dark'
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                : 'border-gray-300 text-gray-600 hover:bg-gray-100'
            }`}
            title={t('tools.passwordVault.showFavoritesOnly', 'Show favorites only')}
          >
            <Star className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Add Button */}
      <button
        onClick={() => {
          resetForm();
          setEditingEntry(null);
          setShowAddModal(true);
        }}
        className="w-full mb-6 flex items-center justify-center gap-2 px-6 py-3 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors font-medium"
      >
        <Plus className="w-5 h-5" />
        {t('tools.passwordVault.addNewPassword', 'Add New Password')}
      </button>

      {/* Entries List */}
      {filteredEntries.length === 0 ? (
        <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">{t('tools.passwordVault.noPasswordsFound', 'No passwords found')}</p>
          <p className="text-sm mt-1">
            {entries.length === 0 ? t('tools.passwordVault.addYourFirstPasswordTo', 'Add your first password to get started') : t('tools.passwordVault.tryAdjustingYourSearchOr', 'Try adjusting your search or filters')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEntries.map(entry => (
            <div
              key={entry.id}
              className={`p-4 rounded-lg border ${
                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${CATEGORY_COLORS[entry.category]}`}>
                    <Key className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {entry.name}
                      </h3>
                      {entry.isFavorite && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                    </div>
                    <div className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      <User className="w-3 h-3" />
                      <span className="truncate">{entry.username || 'No username'}</span>
                    </div>
                    {entry.url && (
                      <div className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Globe className="w-3 h-3" />
                        <a
                          href={entry.url.startsWith('http') ? entry.url : `https://${entry.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate hover:text-[#0D9488]"
                        >
                          {entry.url}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <div className={`font-mono text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {visiblePasswords.has(entry.id) ? entry.password : '••••••••••••'}
                        </div>
                        <button
                          onClick={() => togglePasswordVisibility(entry.id)}
                          className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                        >
                          {visiblePasswords.has(entry.id) ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleCopy(entry.password, `pwd-${entry.id}`)}
                          className={`p-1 rounded ${
                            copiedId === `pwd-${entry.id}`
                              ? 'text-green-500'
                              : theme === 'dark'
                              ? 'hover:bg-gray-600'
                              : 'hover:bg-gray-200'
                          }`}
                        >
                          {copiedId === `pwd-${entry.id}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 mt-2 text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      <span className={`px-2 py-0.5 rounded ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                        {entry.category}
                      </span>
                      <span className="ml-2">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {new Date(entry.lastModified).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={() => handleToggleFavorite(entry.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      entry.isFavorite
                        ? 'text-yellow-500'
                        : theme === 'dark'
                        ? 'text-gray-400 hover:bg-gray-600'
                        : 'text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    <Star className={`w-5 h-5 ${entry.isFavorite ? 'fill-yellow-500' : ''}`} />
                  </button>
                  <button
                    onClick={() => openEditModal(entry)}
                    className={`p-2 rounded-lg transition-colors ${
                      theme === 'dark' ? 'text-gray-400 hover:bg-gray-600' : 'text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
                    className={`p-2 rounded-lg transition-colors text-red-500 ${
                      theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                    }`}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md rounded-lg shadow-xl ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } max-h-[90vh] overflow-y-auto`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {editingEntry ? t('tools.passwordVault.editPassword', 'Edit Password') : t('tools.passwordVault.addNewPassword2', 'Add New Password')}
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingEntry(null);
                    resetForm();
                  }}
                  className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.passwordVault.name', 'Name *')}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t('tools.passwordVault.eGGoogleFacebook', 'e.g., Google, Facebook')}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.passwordVault.usernameEmail', 'Username / Email')}
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder={t('tools.passwordVault.usernameExampleCom', 'username@example.com')}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.passwordVault.password', 'Password *')}
                  </label>
                  <div className="relative">
                    <input
                      type={showFormPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder={t('tools.passwordVault.enterPassword', 'Enter password')}
                      className={`w-full px-4 py-2 pr-20 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setShowFormPassword(!showFormPassword)}
                        className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                      >
                        {showFormPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowGeneratorModal(true)}
                        className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                        title={t('tools.passwordVault.generatePassword', 'Generate password')}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getPasswordStrength(formData.password).color} transition-all`}
                            style={{ width: `${getPasswordStrength(formData.password).percentage}%` }}
                          />
                        </div>
                        <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {getPasswordStrength(formData.password).strength}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.passwordVault.url', 'URL')}
                  </label>
                  <input
                    type="text"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder={t('tools.passwordVault.httpsExampleCom', 'https://example.com')}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.passwordVault.category', 'Category')}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.passwordVault.notes', 'Notes')}
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder={t('tools.passwordVault.additionalNotes', 'Additional notes...')}
                    rows={3}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingEntry(null);
                      resetForm();
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors font-medium ${
                      theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    {t('tools.passwordVault.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={handleSaveEntry}
                    disabled={!formData.name.trim() || !formData.password.trim()}
                    className="flex-1 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingEntry ? t('tools.passwordVault.saveChanges', 'Save Changes') : t('tools.passwordVault.addPassword', 'Add Password')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Generator Modal */}
      {showGeneratorModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md rounded-lg shadow-xl ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.passwordVault.passwordGenerator', 'Password Generator')}
                </h3>
                <button
                  onClick={() => setShowGeneratorModal(false)}
                  className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.passwordVault.generatedPassword', 'Generated Password')}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={generatedPassword}
                      readOnly
                      placeholder={t('tools.passwordVault.clickGenerate', 'Click generate')}
                      className={`flex-1 px-4 py-2 font-mono rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-gray-50 border-gray-300 text-gray-900'
                      }`}
                    />
                    <button
                      onClick={() => handleCopy(generatedPassword, 'gen')}
                      disabled={!generatedPassword}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        copiedId === 'gen'
                          ? 'bg-green-500 text-white'
                          : theme === 'dark'
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      } disabled:opacity-50`}
                    >
                      {copiedId === 'gen' ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                  {generatedPassword && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getPasswordStrength(generatedPassword).color} transition-all`}
                            style={{ width: `${getPasswordStrength(generatedPassword).percentage}%` }}
                          />
                        </div>
                        <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {getPasswordStrength(generatedPassword).strength}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    Length: {genLength}
                  </label>
                  <input
                    type="range"
                    min="8"
                    max="64"
                    value={genLength}
                    onChange={(e) => setGenLength(Number(e.target.value))}
                    className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-[#0D9488]"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>8</span>
                    <span>64</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    {t('tools.passwordVault.includeCharacters', 'Include Characters')}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={genUppercase}
                        onChange={(e) => setGenUppercase(e.target.checked)}
                        className="w-4 h-4 rounded accent-[#0D9488]"
                      />
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {t('tools.passwordVault.uppercaseAZ', 'Uppercase (A-Z)')}
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={genLowercase}
                        onChange={(e) => setGenLowercase(e.target.checked)}
                        className="w-4 h-4 rounded accent-[#0D9488]"
                      />
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {t('tools.passwordVault.lowercaseAZ', 'Lowercase (a-z)')}
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={genNumbers}
                        onChange={(e) => setGenNumbers(e.target.checked)}
                        className="w-4 h-4 rounded accent-[#0D9488]"
                      />
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {t('tools.passwordVault.numbers09', 'Numbers (0-9)')}
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={genSymbols}
                        onChange={(e) => setGenSymbols(e.target.checked)}
                        className="w-4 h-4 rounded accent-[#0D9488]"
                      />
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {t('tools.passwordVault.symbols', 'Symbols (!@#$...)')}
                      </span>
                    </label>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer mt-2">
                    <input
                      type="checkbox"
                      checked={genExcludeAmbiguous}
                      onChange={(e) => setGenExcludeAmbiguous(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#0D9488]"
                    />
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {t('tools.passwordVault.excludeAmbiguousLI1', 'Exclude ambiguous (l, I, 1, O, 0)')}
                    </span>
                  </label>
                </div>

                <button
                  onClick={generatePassword}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors font-medium"
                >
                  <RefreshCw className="w-4 h-4" />
                  {t('tools.passwordVault.generate', 'Generate')}
                </button>

                {generatedPassword && (
                  <button
                    onClick={() => {
                      setFormData({ ...formData, password: generatedPassword });
                      setShowGeneratorModal(false);
                    }}
                    className={`w-full px-4 py-2 rounded-lg transition-colors font-medium ${
                      theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    {t('tools.passwordVault.useThisPassword', 'Use This Password')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md rounded-lg shadow-xl ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.passwordVault.vaultSettings', 'Vault Settings')}
                </h3>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    Auto-lock timeout: {settings.autoLockTimeout} minutes
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={settings.autoLockTimeout}
                    onChange={(e) => {
                      const newSettings = { ...settings, autoLockTimeout: Number(e.target.value) };
                      setSettings(newSettings);
                      saveVault(entries, newSettings, masterPassword);
                    }}
                    className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-[#0D9488]"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 min</span>
                    <span>30 min</span>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    Clear clipboard after: {settings.clearClipboardTimeout} seconds
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="120"
                    step="10"
                    value={settings.clearClipboardTimeout}
                    onChange={(e) => {
                      const newSettings = { ...settings, clearClipboardTimeout: Number(e.target.value) };
                      setSettings(newSettings);
                      saveVault(entries, newSettings, masterPassword);
                    }}
                    className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-[#0D9488]"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>10s</span>
                    <span>120s</span>
                  </div>
                </div>

                <hr className={theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} />

                <button
                  onClick={() => {
                    setShowSettingsModal(false);
                    setShowChangeMasterModal(true);
                  }}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                    theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  <Key className="w-4 h-4" />
                  {t('tools.passwordVault.changeMasterPassword', 'Change Master Password')}
                </button>

                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    <strong>{t('tools.passwordVault.vaultStatistics', 'Vault Statistics')}</strong>
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Total entries: {entries.length}
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Favorites: {entries.filter(e => e.isFavorite).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Master Password Modal */}
      {showChangeMasterModal && (
        <ChangeMasterPasswordModal
          theme={theme}
          onClose={() => setShowChangeMasterModal(false)}
          onSubmit={handleChangeMaster}
        />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog />

      {/* Info Section */}
      <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          {t('tools.passwordVault.securityNotice', 'Security Notice')}
        </h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Your passwords are stored locally in your browser and encrypted with your master password.
          This vault uses simple encryption for convenience. For high-security needs, consider a dedicated password manager.
        </p>
      </div>
    </div>
  );
};

// Change Master Password Modal Component
const ChangeMasterPasswordModal = ({
  theme,
  onClose,
  onSubmit,
}: {
  theme: string;
  onClose: () => void;
  onSubmit: (old: string, newPwd: string, confirm: string) => string | null;
}) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = () => {
    const result = onSubmit(oldPassword, newPassword, confirmPassword);
    if (result) {
      setError(result);
    } else {
      setSuccess(true);
      setTimeout(onClose, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className={`w-full max-w-md rounded-lg shadow-xl ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.passwordVault.changeMasterPassword2', 'Change Master Password')}
            </h3>
            <button
              onClick={onClose}
              className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {success ? (
            <div className="flex items-center gap-2 p-4 rounded-lg bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-800">
              <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-green-700 dark:text-green-300">{t('tools.passwordVault.masterPasswordChangedSuccessfully', 'Master password changed successfully!')}</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.passwordVault.currentPassword', 'Current Password')}
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.passwordVault.newPassword', 'New Password')}
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('tools.passwordVault.confirmNewPassword', 'Confirm New Password')}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={onClose}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors font-medium ${
                    theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  {t('tools.passwordVault.cancel2', 'Cancel')}
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors font-medium"
                >
                  {t('tools.passwordVault.changePassword', 'Change Password')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasswordVaultTool;
