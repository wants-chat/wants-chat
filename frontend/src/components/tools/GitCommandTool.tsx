import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GitBranch, Copy, Check, Search, Command, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface GitCommand {
  name: string;
  command: string;
  description: string;
  category: string;
}

interface GitCommandToolProps {
  uiConfig?: UIConfig;
  prefillData?: ToolPrefillData;
}

export const GitCommandTool: React.FC<GitCommandToolProps> = ({ uiConfig, prefillData }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [search, setSearch] = useState('');

  // Apply prefill data
  useEffect(() => {
    if (prefillData?.params) {
      if (prefillData.params.search) setSearch(prefillData.params.search);
      if (prefillData.params.category) setCategory(prefillData.params.category);
      setIsPrefilled(true);
    }
  }, [prefillData]);
  const [category, setCategory] = useState('all');
  const [copied, setCopied] = useState('');

  const commands: GitCommand[] = [
    // Setup
    { name: 'Initialize Repository', command: 'git init', description: 'Create a new local repository', category: 'setup' },
    { name: 'Clone Repository', command: 'git clone <url>', description: 'Clone a remote repository', category: 'setup' },
    { name: 'Set Username', command: 'git config --global user.name "<name>"', description: 'Set your Git username', category: 'setup' },
    { name: 'Set Email', command: 'git config --global user.email "<email>"', description: 'Set your Git email', category: 'setup' },
    // Basic
    { name: 'Check Status', command: 'git status', description: 'Show the working tree status', category: 'basic' },
    { name: 'Add Files', command: 'git add <file>', description: 'Add file to staging area', category: 'basic' },
    { name: 'Add All', command: 'git add .', description: 'Add all changes to staging', category: 'basic' },
    { name: 'Commit', command: 'git commit -m "<message>"', description: 'Commit staged changes', category: 'basic' },
    { name: 'Commit All', command: 'git commit -am "<message>"', description: 'Add and commit all tracked files', category: 'basic' },
    { name: 'View Log', command: 'git log --oneline', description: 'View commit history (compact)', category: 'basic' },
    { name: 'Show Diff', command: 'git diff', description: 'Show unstaged changes', category: 'basic' },
    // Branches
    { name: 'List Branches', command: 'git branch', description: 'List all local branches', category: 'branches' },
    { name: 'Create Branch', command: 'git branch <name>', description: 'Create a new branch', category: 'branches' },
    { name: 'Switch Branch', command: 'git checkout <branch>', description: 'Switch to a branch', category: 'branches' },
    { name: 'Create & Switch', command: 'git checkout -b <name>', description: 'Create and switch to new branch', category: 'branches' },
    { name: 'Delete Branch', command: 'git branch -d <name>', description: 'Delete a merged branch', category: 'branches' },
    { name: 'Merge Branch', command: 'git merge <branch>', description: 'Merge branch into current', category: 'branches' },
    { name: 'Rename Branch', command: 'git branch -m <old> <new>', description: 'Rename a branch', category: 'branches' },
    // Remote
    { name: 'Add Remote', command: 'git remote add origin <url>', description: 'Add a remote repository', category: 'remote' },
    { name: 'List Remotes', command: 'git remote -v', description: 'List remote repositories', category: 'remote' },
    { name: 'Push', command: 'git push origin <branch>', description: 'Push branch to remote', category: 'remote' },
    { name: 'Push (Set Upstream)', command: 'git push -u origin <branch>', description: 'Push and set upstream', category: 'remote' },
    { name: 'Pull', command: 'git pull', description: 'Fetch and merge from remote', category: 'remote' },
    { name: 'Fetch', command: 'git fetch', description: 'Fetch from remote without merge', category: 'remote' },
    // Undo
    { name: 'Unstage File', command: 'git reset HEAD <file>', description: 'Unstage a file', category: 'undo' },
    { name: 'Discard Changes', command: 'git checkout -- <file>', description: 'Discard file changes', category: 'undo' },
    { name: 'Undo Commit', command: 'git reset --soft HEAD~1', description: 'Undo last commit, keep changes', category: 'undo' },
    { name: 'Hard Reset', command: 'git reset --hard HEAD~1', description: 'Undo commit and discard changes', category: 'undo' },
    { name: 'Revert Commit', command: 'git revert <commit>', description: 'Create new commit undoing changes', category: 'undo' },
    // Stash
    { name: 'Stash Changes', command: 'git stash', description: 'Temporarily store changes', category: 'stash' },
    { name: 'Stash with Message', command: 'git stash save "<message>"', description: 'Stash with description', category: 'stash' },
    { name: 'List Stashes', command: 'git stash list', description: 'List all stashes', category: 'stash' },
    { name: 'Apply Stash', command: 'git stash apply', description: 'Apply most recent stash', category: 'stash' },
    { name: 'Pop Stash', command: 'git stash pop', description: 'Apply and remove stash', category: 'stash' },
  ];

  const categories = ['all', 'setup', 'basic', 'branches', 'remote', 'undo', 'stash'];

  const filteredCommands = commands.filter(cmd => {
    const matchesSearch = cmd.name.toLowerCase().includes(search.toLowerCase()) ||
                         cmd.command.toLowerCase().includes(search.toLowerCase()) ||
                         cmd.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || cmd.category === category;
    return matchesSearch && matchesCategory;
  });

  const handleCopy = (command: string) => {
    navigator.clipboard.writeText(command);
    setCopied(command);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-orange-900/20' : 'bg-gradient-to-r from-white to-orange-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-lg"><GitBranch className="w-5 h-5 text-orange-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.gitCommand.gitCommandsReference', 'Git Commands Reference')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.gitCommand.quickReferenceForCommonGit', 'Quick reference for common Git commands')}</p>
          </div>
        </div>
      </div>

      {/* Prefill Indicator */}
      {isPrefilled && (
        <div className={`mx-6 mt-4 flex items-center gap-2 text-sm ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
          <Sparkles className="w-4 h-4" />
          <span>{t('tools.gitCommand.preFilledFromYourRequest', 'Pre-filled from your request')}</span>
        </div>
      )}

      <div className="p-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('tools.gitCommand.searchCommands', 'Search commands...')} className={`w-full pl-10 pr-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setCategory(cat)} className={`px-3 py-1.5 rounded-lg text-sm capitalize ${category === cat ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Commands List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredCommands.map((cmd, idx) => (
            <div key={idx} className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} group`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Command className={`w-4 h-4 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{cmd.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'}`}>{cmd.category}</span>
                  </div>
                  <code className={`block mt-1 text-sm font-mono ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>{cmd.command}</code>
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{cmd.description}</p>
                </div>
                <button onClick={() => handleCopy(cmd.command)} className={`p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${copied === cmd.command ? 'text-green-500' : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-700'}`}>
                  {copied === cmd.command ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredCommands.length === 0 && (
          <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            No commands found matching "{search}"
          </div>
        )}

        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>{t('tools.gitCommand.tip', 'Tip:')}</strong> Replace &lt;placeholders&gt; with your actual values. Click any command to copy it.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GitCommandTool;
