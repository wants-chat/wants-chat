import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../contexts/ThemeContext';
import { FileTreeItem } from '../../services/appFilesService';

interface FileTreeProps {
  items: FileTreeItem[];
  selectedFile: string | null;
  onSelectFile: (filePath: string) => void;
  isLoading?: boolean;
}

interface TreeNodeProps {
  item: FileTreeItem;
  depth: number;
  selectedFile: string | null;
  onSelectFile: (filePath: string) => void;
  expandedFolders: Set<string>;
  toggleFolder: (path: string) => void;
}

const getFileIcon = (fileName: string): { color: string; bgColor: string } => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  const iconColors: Record<string, { color: string; bgColor: string }> = {
    ts: { color: '#3178c6', bgColor: 'rgba(49, 120, 198, 0.15)' },
    tsx: { color: '#3178c6', bgColor: 'rgba(49, 120, 198, 0.15)' },
    js: { color: '#f7df1e', bgColor: 'rgba(247, 223, 30, 0.15)' },
    jsx: { color: '#61dafb', bgColor: 'rgba(97, 218, 251, 0.15)' },
    json: { color: '#cbcb41', bgColor: 'rgba(203, 203, 65, 0.15)' },
    css: { color: '#264de4', bgColor: 'rgba(38, 77, 228, 0.15)' },
    scss: { color: '#cc6699', bgColor: 'rgba(204, 102, 153, 0.15)' },
    html: { color: '#e34c26', bgColor: 'rgba(227, 76, 38, 0.15)' },
    md: { color: '#083fa1', bgColor: 'rgba(8, 63, 161, 0.15)' },
    sql: { color: '#f29111', bgColor: 'rgba(242, 145, 17, 0.15)' },
    yaml: { color: '#cb171e', bgColor: 'rgba(203, 23, 30, 0.15)' },
    yml: { color: '#cb171e', bgColor: 'rgba(203, 23, 30, 0.15)' },
  };

  return iconColors[ext] || { color: '#6b7280', bgColor: 'rgba(107, 114, 128, 0.15)' };
};

const TreeNode: React.FC<TreeNodeProps> = ({
  item,
  depth,
  selectedFile,
  onSelectFile,
  expandedFolders,
  toggleFolder,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isExpanded = expandedFolders.has(item.path);
  const isSelected = selectedFile === item.path;
  const fileIconStyle = item.type === 'file' ? getFileIcon(item.name) : null;

  const handleClick = () => {
    if (item.type === 'folder') {
      toggleFolder(item.path);
    } else {
      onSelectFile(item.path);
    }
  };

  return (
    <div>
      <div
        onClick={handleClick}
        className={cn(
          'flex items-center gap-1 py-1 px-2 cursor-pointer rounded text-sm transition-colors',
          isSelected
            ? isDark
              ? 'bg-[#0D9488]/20 text-[#0D9488]'
              : 'bg-teal-50 text-teal-700'
            : isDark
            ? 'hover:bg-white/5 text-slate-300'
            : 'hover:bg-slate-100 text-slate-700'
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {/* Expand/Collapse Icon for folders */}
        {item.type === 'folder' ? (
          isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          )
        ) : (
          <span className="w-3.5" /> // Spacer for alignment
        )}

        {/* File/Folder Icon */}
        {item.type === 'folder' ? (
          isExpanded ? (
            <FolderOpen className="w-4 h-4 text-amber-500 flex-shrink-0" />
          ) : (
            <Folder className="w-4 h-4 text-amber-500 flex-shrink-0" />
          )
        ) : (
          <div
            className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: fileIconStyle?.bgColor }}
          >
            <File className="w-3 h-3" style={{ color: fileIconStyle?.color }} />
          </div>
        )}

        {/* Name */}
        <span className="truncate">{item.name}</span>
      </div>

      {/* Children */}
      {item.type === 'folder' && isExpanded && item.children && (
        <div>
          {item.children.map((child) => (
            <TreeNode
              key={child.path}
              item={child}
              depth={depth + 1}
              selectedFile={selectedFile}
              onSelectFile={onSelectFile}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const FileTree: React.FC<FileTreeProps> = ({
  items,
  selectedFile,
  onSelectFile,
  isLoading = false,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // Auto-expand first level folders on mount
  useEffect(() => {
    if (items && items.length > 0) {
      const firstLevelFolders = items
        .filter((item) => item.type === 'folder')
        .map((item) => item.path);
      setExpandedFolders(new Set(firstLevelFolders));
    }
  }, [items]);

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={cn(
              'h-6 rounded animate-pulse',
              isDark ? 'bg-white/5' : 'bg-slate-100'
            )}
            style={{ width: `${60 + Math.random() * 30}%` }}
          />
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div
        className={cn(
          'p-4 text-center text-sm',
          isDark ? 'text-slate-400' : 'text-slate-500'
        )}
      >
        No files found
      </div>
    );
  }

  return (
    <div className="py-2 overflow-y-auto">
      {items.map((item) => (
        <TreeNode
          key={item.path}
          item={item}
          depth={0}
          selectedFile={selectedFile}
          onSelectFile={onSelectFile}
          expandedFolders={expandedFolders}
          toggleFolder={toggleFolder}
        />
      ))}
    </div>
  );
};

export default FileTree;
