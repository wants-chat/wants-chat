import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Plus, Copy, Check, Clock, Key, Trash2 } from 'lucide-react';
import Header from '../../components/landing/Header';
import BackgroundEffects from '../../components/ui/BackgroundEffects';
import { useConfirm } from '../../contexts/ConfirmDialogContext';

interface Account {
  id: string;
  name: string;
  issuer: string;
  secret: string;
  color: string;
}

const TwoFactorAuth: React.FC = () => {
  const { confirm, alert } = useConfirm();
  const [accounts, setAccounts] = useState<Account[]>([
    {
      id: '1',
      name: 'example@email.com',
      issuer: 'Google',
      secret: 'JBSWY3DPEHPK3PXP',
      color: 'from-blue-500 to-indigo-500',
    },
  ]);

  const [currentCodes, setCurrentCodes] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(30);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: '',
    issuer: '',
    secret: '',
  });

  // TOTP Algorithm Implementation
  const generateTOTP = (secret: string, timeStep: number = 30): string => {
    // This is a simplified TOTP implementation
    // In production, use a proper TOTP library like 'otpauth' or 'speakeasy'

    const time = Math.floor(Date.now() / 1000 / timeStep);

    // Simple hash function for demonstration
    const hash = (secret + time).split('').reduce((acc, char) => {
      return ((acc << 5) - acc + char.charCodeAt(0)) | 0;
    }, 0);

    // Generate 6-digit code
    const code = Math.abs(hash) % 1000000;
    return code.toString().padStart(6, '0');
  };

  // Update codes every second
  useEffect(() => {
    const updateCodes = () => {
      const codes: Record<string, string> = {};
      accounts.forEach(account => {
        codes[account.id] = generateTOTP(account.secret);
      });
      setCurrentCodes(codes);

      // Update time left
      const secondsLeft = 30 - (Math.floor(Date.now() / 1000) % 30);
      setTimeLeft(secondsLeft);
    };

    updateCodes();
    const interval = setInterval(updateCodes, 1000);

    return () => clearInterval(interval);
  }, [accounts]);

  const copyToClipboard = (code: string, accountId: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(accountId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddAccount = async () => {
    if (!newAccount.name || !newAccount.issuer || !newAccount.secret) {
      await alert({
        title: 'Missing Fields',
        message: 'Please fill all fields',
        variant: 'warning'
      });
      return;
    }

    const colors = [
      'from-blue-500 to-indigo-500',
      'from-purple-500 to-pink-500',
      'from-teal-500 to-cyan-500',
      'from-orange-500 to-red-500',
      'from-green-500 to-emerald-500',
    ];

    const newAcct: Account = {
      id: Date.now().toString(),
      ...newAccount,
      color: colors[Math.floor(Math.random() * colors.length)],
    };

    setAccounts([...accounts, newAcct]);
    setNewAccount({ name: '', issuer: '', secret: '' });
    setShowAddForm(false);
  };

  const handleDeleteAccount = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Account',
      message: 'Are you sure you want to delete this account?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive'
    });
    if (confirmed) {
      setAccounts(accounts.filter(acc => acc.id !== id));
    }
  };

  const progressPercentage = (timeLeft / 30) * 100;

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects variant="subtle" />
      <Header />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Two-Factor Authenticator
              </h1>
              <p className="text-slate-400 text-sm">Secure your accounts with TOTP codes</p>
            </div>
          </div>
        </motion.div>

        {/* Timer Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-teal-400/30 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="w-5 h-5 text-teal-400" />
                <span className="font-medium">Time Remaining</span>
              </div>
              <span className="text-2xl font-bold text-teal-400">{timeLeft}s</span>
            </div>

            {/* Progress Bar */}
            <div className="bg-slate-700/50 rounded-full h-3 overflow-hidden">
              <motion.div
                animate={{ width: `${progressPercentage}%` }}
                className={`h-full transition-all duration-1000 ${
                  timeLeft <= 5
                    ? 'bg-gradient-to-r from-red-500 to-rose-500'
                    : 'bg-gradient-to-r from-teal-500 to-cyan-500'
                }`}
              />
            </div>
          </div>
        </motion.div>

        {/* Add Account Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-500/50"
          >
            <Plus className="w-5 h-5" />
            Add New Account
          </button>
        </motion.div>

        {/* Add Account Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-teal-400/30 p-6"
          >
            <h3 className="text-lg font-bold text-white mb-4">Add New Account</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Account Name</label>
                <input
                  type="text"
                  placeholder="e.g., john@example.com"
                  value={newAccount.name}
                  onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Issuer</label>
                <input
                  type="text"
                  placeholder="e.g., Google, GitHub, AWS"
                  value={newAccount.issuer}
                  onChange={(e) => setNewAccount({ ...newAccount, issuer: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Secret Key</label>
                <input
                  type="text"
                  placeholder="e.g., JBSWY3DPEHPK3PXP"
                  value={newAccount.secret}
                  onChange={(e) => setNewAccount({ ...newAccount, secret: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-teal-500 focus:outline-none font-mono"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAddAccount}
                  className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold py-3 rounded-lg transition-all"
                >
                  Add Account
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Accounts List */}
        <div className="space-y-4">
          {accounts.map((account, index) => (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-teal-400/30 p-6 shadow-xl hover:border-teal-400/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className={`p-3 bg-gradient-to-br ${account.color} rounded-xl`}>
                    <Key className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{account.issuer}</h3>
                    <p className="text-sm text-slate-400">{account.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteAccount(account.id)}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-all group"
                >
                  <Trash2 className="w-5 h-5 text-slate-400 group-hover:text-red-400" />
                </button>
              </div>

              {/* TOTP Code Display */}
              <div className="bg-slate-900/50 rounded-xl p-6 mb-3">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-4xl font-bold text-teal-400 tracking-wider">
                    {currentCodes[account.id]?.slice(0, 3) || '000'}{' '}
                    <span className="text-cyan-400">{currentCodes[account.id]?.slice(3) || '000'}</span>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => copyToClipboard(currentCodes[account.id] || '', account.id)}
                    className="p-3 bg-teal-500/20 hover:bg-teal-500/30 rounded-lg transition-all"
                  >
                    {copiedId === account.id ? (
                      <Check className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Copy className="w-5 h-5 text-teal-400" />
                    )}
                  </motion.button>
                </div>
              </div>

              <p className="text-xs text-slate-500 text-center">
                Code refreshes every 30 seconds
              </p>
            </motion.div>
          ))}
        </div>

        {accounts.length === 0 && !showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Shield className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-400 mb-2">No Accounts Yet</h3>
            <p className="text-slate-500">Add your first account to generate TOTP codes</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TwoFactorAuth;
