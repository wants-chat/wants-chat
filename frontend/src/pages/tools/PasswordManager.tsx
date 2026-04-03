import React, { useState, useEffect } from 'react';
import { Key, Plus, Search, Copy, Edit2, Trash2, Eye, EyeOff, RefreshCw, Shield } from 'lucide-react';
import Header from '../../components/landing/Header';
import BackgroundEffects from '../../components/ui/BackgroundEffects';
import { useConfirm } from '../../contexts/ConfirmDialogContext';

interface Password {
  id: string;
  title: string;
  username: string;
  password: string;
  url?: string;
  category: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const categories = ['Social', 'Email', 'Banking', 'Shopping', 'Work', 'Entertainment', 'Other'];

const PasswordManager: React.FC = () => {
  const { confirm } = useConfirm();
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showModal, setShowModal] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [editingPassword, setEditingPassword] = useState<Password | null>(null);
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    username: '',
    password: '',
    url: '',
    category: 'Other',
    notes: '',
  });

  // Password generator state
  const [generatorOptions, setGeneratorOptions] = useState({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  const [generatedPassword, setGeneratedPassword] = useState('');

  // Load passwords from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('passwordManager');
    if (stored) {
      try {
        setPasswords(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading passwords:', error);
      }
    }
  }, []);

  // Save passwords to localStorage whenever they change
  useEffect(() => {
    if (passwords.length > 0) {
      localStorage.setItem('passwordManager', JSON.stringify(passwords));
    }
  }, [passwords]);

  // Generate password
  const generatePassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let chars = '';
    if (generatorOptions.uppercase) chars += uppercase;
    if (generatorOptions.lowercase) chars += lowercase;
    if (generatorOptions.numbers) chars += numbers;
    if (generatorOptions.symbols) chars += symbols;

    if (chars === '') chars = lowercase;

    let password = '';
    for (let i = 0; i < generatorOptions.length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    setGeneratedPassword(password);
    return password;
  };

  // Use generated password
  const useGeneratedPassword = () => {
    setFormData({ ...formData, password: generatedPassword });
    setShowGenerator(false);
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingPassword) {
      // Update existing password
      setPasswords(passwords.map(p =>
        p.id === editingPassword.id
          ? { ...formData, id: p.id, createdAt: p.createdAt, updatedAt: new Date().toISOString() }
          : p
      ));
    } else {
      // Add new password
      const newPassword: Password = {
        ...formData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setPasswords([...passwords, newPassword]);
    }

    resetForm();
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      username: '',
      password: '',
      url: '',
      category: 'Other',
      notes: '',
    });
    setEditingPassword(null);
    setShowModal(false);
    setShowGenerator(false);
    setGeneratedPassword('');
  };

  // Edit password
  const handleEdit = (password: Password) => {
    setEditingPassword(password);
    setFormData({
      title: password.title,
      username: password.username,
      password: password.password,
      url: password.url || '',
      category: password.category,
      notes: password.notes || '',
    });
    setShowModal(true);
  };

  // Delete password
  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Password',
      message: 'Are you sure you want to delete this password?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive'
    });
    if (confirmed) {
      setPasswords(passwords.filter(p => p.id !== id));
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Toggle password visibility
  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter passwords
  const filteredPasswords = passwords.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-cyan-900">
      <BackgroundEffects />
      <Header />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 text-teal-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Password Manager</h1>
          <p className="text-teal-200">Securely store and manage your passwords</p>
        </div>

        {/* Controls */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-300 w-5 h-5" />
              <input
                type="text"
                placeholder="Search passwords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-teal-300/50 focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>

            {/* Add button */}
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-teal-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Add Password
            </button>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === 'All'
                  ? 'bg-teal-500 text-white'
                  : 'bg-white/10 text-teal-200 hover:bg-white/20'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-teal-500 text-white'
                    : 'bg-white/10 text-teal-200 hover:bg-white/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Password list */}
        {filteredPasswords.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 text-center border border-white/20">
            <Key className="w-16 h-16 text-teal-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No passwords found</h3>
            <p className="text-teal-200 mb-6">Start by adding your first password</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPasswords.map(password => (
              <div
                key={password.id}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">{password.title}</h3>
                    <span className="inline-block px-3 py-1 bg-teal-500/30 text-teal-200 rounded-full text-xs font-medium">
                      {password.category}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(password)}
                      className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
                    >
                      <Edit2 className="w-4 h-4 text-teal-300" />
                    </button>
                    <button
                      onClick={() => handleDelete(password.id)}
                      className="p-2 bg-white/10 rounded-lg hover:bg-red-500/20 transition-all"
                    >
                      <Trash2 className="w-4 h-4 text-red-300" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-teal-300 mb-1 block">Username</label>
                    <div className="flex items-center gap-2">
                      <p className="text-white flex-1 truncate">{password.username}</p>
                      <button
                        onClick={() => copyToClipboard(password.username, `username-${password.id}`)}
                        className="p-1.5 bg-white/10 rounded hover:bg-white/20 transition-all"
                      >
                        <Copy className={`w-4 h-4 ${copiedId === `username-${password.id}` ? 'text-green-400' : 'text-teal-300'}`} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-teal-300 mb-1 block">Password</label>
                    <div className="flex items-center gap-2">
                      <p className="text-white flex-1 font-mono text-sm truncate">
                        {showPasswords[password.id] ? password.password : '••••••••'}
                      </p>
                      <button
                        onClick={() => togglePasswordVisibility(password.id)}
                        className="p-1.5 bg-white/10 rounded hover:bg-white/20 transition-all"
                      >
                        {showPasswords[password.id] ? (
                          <EyeOff className="w-4 h-4 text-teal-300" />
                        ) : (
                          <Eye className="w-4 h-4 text-teal-300" />
                        )}
                      </button>
                      <button
                        onClick={() => copyToClipboard(password.password, `password-${password.id}`)}
                        className="p-1.5 bg-white/10 rounded hover:bg-white/20 transition-all"
                      >
                        <Copy className={`w-4 h-4 ${copiedId === `password-${password.id}` ? 'text-green-400' : 'text-teal-300'}`} />
                      </button>
                    </div>
                  </div>

                  {password.url && (
                    <div>
                      <label className="text-xs text-teal-300 mb-1 block">URL</label>
                      <a
                        href={password.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-300 hover:text-cyan-200 text-sm truncate block"
                      >
                        {password.url}
                      </a>
                    </div>
                  )}

                  {password.notes && (
                    <div>
                      <label className="text-xs text-teal-300 mb-1 block">Notes</label>
                      <p className="text-white/70 text-sm">{password.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-teal-500/30">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-2xl font-bold text-white">
                  {editingPassword ? 'Edit Password' : 'Add New Password'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-teal-300 mb-2">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-teal-300/50 focus:outline-none focus:ring-2 focus:ring-teal-400"
                    placeholder="e.g., Gmail Account"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-teal-300 mb-2">Username *</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-teal-300/50 focus:outline-none focus:ring-2 focus:ring-teal-400"
                    placeholder="username or email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-teal-300 mb-2">Password *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-teal-300/50 focus:outline-none focus:ring-2 focus:ring-teal-400 font-mono"
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGenerator(!showGenerator)}
                      className="px-4 py-3 bg-teal-500/20 border border-teal-500 rounded-xl hover:bg-teal-500/30 transition-all"
                    >
                      <RefreshCw className="w-5 h-5 text-teal-300" />
                    </button>
                  </div>
                </div>

                {/* Password Generator */}
                {showGenerator && (
                  <div className="bg-white/5 rounded-xl p-4 space-y-4 border border-white/10">
                    <h3 className="text-sm font-semibold text-white">Password Generator</h3>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm text-teal-300">Length: {generatorOptions.length}</label>
                      </div>
                      <input
                        type="range"
                        min="8"
                        max="32"
                        value={generatorOptions.length}
                        onChange={(e) => setGeneratorOptions({ ...generatorOptions, length: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                        <input
                          type="checkbox"
                          checked={generatorOptions.uppercase}
                          onChange={(e) => setGeneratorOptions({ ...generatorOptions, uppercase: e.target.checked })}
                          className="w-4 h-4 rounded border-teal-500 text-teal-500 focus:ring-teal-400"
                        />
                        Uppercase (A-Z)
                      </label>
                      <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                        <input
                          type="checkbox"
                          checked={generatorOptions.lowercase}
                          onChange={(e) => setGeneratorOptions({ ...generatorOptions, lowercase: e.target.checked })}
                          className="w-4 h-4 rounded border-teal-500 text-teal-500 focus:ring-teal-400"
                        />
                        Lowercase (a-z)
                      </label>
                      <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                        <input
                          type="checkbox"
                          checked={generatorOptions.numbers}
                          onChange={(e) => setGeneratorOptions({ ...generatorOptions, numbers: e.target.checked })}
                          className="w-4 h-4 rounded border-teal-500 text-teal-500 focus:ring-teal-400"
                        />
                        Numbers (0-9)
                      </label>
                      <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                        <input
                          type="checkbox"
                          checked={generatorOptions.symbols}
                          onChange={(e) => setGeneratorOptions({ ...generatorOptions, symbols: e.target.checked })}
                          className="w-4 h-4 rounded border-teal-500 text-teal-500 focus:ring-teal-400"
                        />
                        Symbols (!@#$)
                      </label>
                    </div>

                    {generatedPassword && (
                      <div className="bg-white/10 rounded-lg p-3">
                        <p className="text-white font-mono text-sm break-all">{generatedPassword}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={generatePassword}
                        className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all font-medium"
                      >
                        Generate
                      </button>
                      {generatedPassword && (
                        <button
                          type="button"
                          onClick={useGeneratedPassword}
                          className="flex-1 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-all font-medium"
                        >
                          Use This Password
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-teal-300 mb-2">URL</label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-teal-300/50 focus:outline-none focus:ring-2 focus:ring-teal-400"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-teal-300 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-teal-300 mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-teal-300/50 focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
                    placeholder="Additional notes..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-6 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-teal-600 hover:to-cyan-600 transition-all shadow-lg"
                  >
                    {editingPassword ? 'Update' : 'Add'} Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PasswordManager;
