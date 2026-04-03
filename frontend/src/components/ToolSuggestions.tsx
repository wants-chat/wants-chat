/**
 * Tool Suggestions Component
 * Shows relevant tools based on search query, file type, or current context
 */

import React from 'react';
import { Wrench, ChevronRight, Sparkles } from 'lucide-react';
import { toolSuggestionService, ToolSuggestion } from '../services/toolSuggestionService';
import { getToolIcon } from '../lib/toolIcons';
import { UIConfig } from './ContextualUI';

interface ToolSuggestionsProps {
  // Query-based suggestions
  query?: string;
  // File-based suggestions
  fileType?: string;
  fileName?: string;
  // Related tool suggestions
  currentToolId?: string;
  // Configuration
  maxTools?: number;
  showTitle?: boolean;
  title?: string;
  compact?: boolean;
  // Callbacks
  onToolSelect: (config: UIConfig) => void;
  // Theme
  theme?: 'light' | 'dark';
}

export const ToolSuggestions: React.FC<ToolSuggestionsProps> = ({
  query,
  fileType,
  fileName,
  currentToolId,
  maxTools = 6,
  showTitle = true,
  title,
  compact = false,
  onToolSelect,
  theme = 'light',
}) => {
  // Get suggestions based on props
  let suggestions: ToolSuggestion[] = [];
  let suggestionTitle = title || 'Suggested Tools';

  if (currentToolId) {
    // Related tools for current tool
    suggestions = toolSuggestionService.getRelatedTools(currentToolId, maxTools);
    suggestionTitle = title || 'Related Tools';
  } else if (fileType) {
    // File-based suggestions
    const result = toolSuggestionService.getToolsForFileType(fileType, maxTools);
    suggestions = result.tools;
    const fileCategory = fileType.split('/')[0];
    suggestionTitle = title || `${fileCategory.charAt(0).toUpperCase() + fileCategory.slice(1)} Tools`;
    if (fileName) {
      suggestionTitle = title || `Tools for ${fileName}`;
    }
  } else if (query && query.length > 2) {
    // Query-based suggestions
    const result = toolSuggestionService.searchTools(query, maxTools);
    suggestions = result.tools;
    suggestionTitle = title || 'Suggested Tools';
  }

  if (suggestions.length === 0) {
    return null;
  }

  const handleToolClick = (suggestion: ToolSuggestion) => {
    const config: UIConfig = {
      type: suggestion.tool.type,
      toolId: suggestion.tool.id,
      title: suggestion.tool.title,
      description: suggestion.tool.description,
    };
    onToolSelect(config);
  };

  const isDark = theme === 'dark';

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => {
          const ToolIcon = getToolIcon(suggestion.tool.icon);
          return (
            <button
              key={suggestion.tool.id}
              onClick={() => handleToolClick(suggestion)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all hover:scale-105 ${
                isDark
                  ? 'bg-white/10 hover:bg-white/20 text-white'
                  : 'bg-[#0D9488]/10 hover:bg-[#0D9488]/20 text-[#0D9488]'
              }`}
            >
              <ToolIcon className="w-4 h-4" />
              <span>{suggestion.tool.title}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`rounded-lg border ${isDark ? 'bg-[#1a1a1a] border-gray-700' : 'bg-white border-gray-200'}`}>
      {showTitle && (
        <div className={`flex items-center gap-2 px-4 py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <Wrench className={`w-4 h-4 ${isDark ? 'text-[#0D9488]' : 'text-[#0D9488]'}`} />
          <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {suggestionTitle}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-[#0D9488]/20 text-[#0D9488]' : 'bg-[#0D9488]/10 text-[#0D9488]'}`}>
            {suggestions.length} tools
          </span>
        </div>
      )}
      <div className="p-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
        {suggestions.map((suggestion) => {
          const ToolIcon = getToolIcon(suggestion.tool.icon);
          return (
            <button
              key={suggestion.tool.id}
              onClick={() => handleToolClick(suggestion)}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all group text-left ${
                isDark
                  ? 'hover:bg-white/5'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className={`p-2 rounded-lg ${isDark ? 'bg-[#0D9488]/20' : 'bg-[#0D9488]/10'}`}>
                <ToolIcon className="w-4 h-4 text-[#0D9488]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {suggestion.tool.title}
                </div>
                <div className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {suggestion.tool.description}
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
            </button>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Enhanced Tool Chip for showing in chat messages with pre-fill status
 */
interface ToolChipProps {
  toolId: string;
  title: string;
  icon?: string;
  onClick: () => void;
  theme?: 'light' | 'dark';
  // Enhanced props for pre-filled data
  prefillValues?: Record<string, any>;
  extractedFields?: Array<{
    fieldName: string;
    value: any;
    confidence: number;
    source: string;
  }>;
  readinessPercentage?: number;
  isLoading?: boolean;
}

export const ToolChip: React.FC<ToolChipProps> = ({
  toolId: _toolId,
  title,
  icon,
  onClick,
  theme = 'light',
  prefillValues,
  extractedFields,
  readinessPercentage: _readinessPercentage,
  isLoading = false,
}) => {
  // _toolId and _readinessPercentage are intentionally unused - they're part of the interface for consistency
  const ToolIcon = getToolIcon(icon || 'wrench');
  const isDark = theme === 'dark';
  const hasPrefill = prefillValues && Object.keys(prefillValues).length > 0;
  const prefillCount = extractedFields?.length || 0;

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
        isLoading ? 'opacity-70 cursor-wait' : 'hover:scale-105'
      } ${
        hasPrefill
          ? isDark
            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30'
            : 'bg-green-500/10 text-green-600 hover:bg-green-500/20 border border-green-500/20'
          : isDark
            ? 'bg-[#0D9488]/20 text-[#0D9488] hover:bg-[#0D9488]/30'
            : 'bg-[#0D9488]/10 text-[#0D9488] hover:bg-[#0D9488]/20'
      }`}
    >
      <ToolIcon className="w-3 h-3" />
      <span>{title}</span>
      {hasPrefill && prefillCount > 0 && (
        <span className={`px-1.5 py-0.5 text-[10px] rounded-full ${
          isDark ? 'bg-green-500/30' : 'bg-green-500/20'
        }`}>
          {prefillCount} ready
        </span>
      )}
    </button>
  );
};

/**
 * Enhanced Tool Chip Card - larger format for prominent display
 */
interface EnhancedToolChipCardProps {
  toolId: string;
  title: string;
  description?: string;
  icon?: string;
  onClick: () => void;
  theme?: 'light' | 'dark';
  prefillValues?: Record<string, any>;
  extractedFields?: Array<{
    fieldName: string;
    value: any;
    confidence: number;
    source: string;
  }>;
  attachmentMappings?: Array<{
    attachmentUrl: string;
    targetField: string;
  }>;
  readinessPercentage?: number;
  isLoading?: boolean;
}

export const EnhancedToolChipCard: React.FC<EnhancedToolChipCardProps> = ({
  toolId: _toolId,
  title,
  description,
  icon,
  onClick,
  theme = 'light',
  prefillValues,
  extractedFields,
  attachmentMappings,
  readinessPercentage,
  isLoading = false,
}) => {
  // _toolId is intentionally unused - it's part of the interface for consistency with ToolChip
  const ToolIcon = getToolIcon(icon || 'wrench');
  const isDark = theme === 'dark';
  const hasPrefill = prefillValues && Object.keys(prefillValues).length > 0;
  const prefillCount = extractedFields?.length || 0;
  const hasAttachments = attachmentMappings && attachmentMappings.length > 0;

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`flex flex-col items-start gap-1.5 p-3 rounded-xl border transition-all text-left w-full ${
        isLoading ? 'opacity-70 cursor-wait' : 'hover:scale-[1.02] cursor-pointer'
      } ${
        hasPrefill
          ? isDark
            ? 'border-green-500/30 bg-green-500/5 hover:border-green-500/50 hover:bg-green-500/10'
            : 'border-green-500/20 bg-green-500/5 hover:border-green-500/40 hover:bg-green-500/10'
          : isDark
            ? 'border-gray-700 bg-[#1a1a1a] hover:border-[#0D9488]/50 hover:bg-[#0D9488]/5'
            : 'border-gray-200 bg-white hover:border-[#0D9488]/50 hover:bg-[#0D9488]/5'
      }`}
    >
      <div className="flex items-center gap-2 w-full">
        <div className={`p-1.5 rounded-lg ${
          hasPrefill
            ? isDark ? 'bg-green-500/20' : 'bg-green-500/10'
            : isDark ? 'bg-[#0D9488]/20' : 'bg-[#0D9488]/10'
        }`}>
          <ToolIcon className={`w-4 h-4 ${hasPrefill ? 'text-green-500' : 'text-[#0D9488]'}`} />
        </div>
        <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </span>

        {/* Pre-filled badge */}
        {hasPrefill && (
          <span className={`ml-auto px-2 py-0.5 text-xs rounded-full flex items-center gap-1 ${
            isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-500/15 text-green-600'
          }`}>
            <Sparkles className="w-3 h-3" />
            {prefillCount} field{prefillCount !== 1 ? 's' : ''} ready
          </span>
        )}
      </div>

      {/* Description */}
      {description && (
        <p className={`text-xs line-clamp-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {description}
        </p>
      )}

      {/* Show pre-filled values preview (max 3) */}
      {hasPrefill && extractedFields && extractedFields.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {extractedFields.slice(0, 3).map((field, idx) => (
            <span
              key={idx}
              className={`px-1.5 py-0.5 text-xs rounded ${
                isDark ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-600'
              }`}
              title={`${field.fieldName}: ${String(field.value)} (${Math.round(field.confidence * 100)}% confidence)`}
            >
              {field.fieldName}: {String(field.value).substring(0, 20)}{String(field.value).length > 20 ? '...' : ''}
            </span>
          ))}
          {extractedFields.length > 3 && (
            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              +{extractedFields.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Attachment indicator */}
      {hasAttachments && (
        <div className={`flex items-center gap-1 text-xs mt-1 ${
          isDark ? 'text-blue-400' : 'text-blue-500'
        }`}>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          {attachmentMappings!.length} file{attachmentMappings!.length !== 1 ? 's' : ''} attached
        </div>
      )}

      {/* Readiness indicator */}
      {readinessPercentage !== undefined && readinessPercentage > 0 && (
        <div className="w-full mt-2">
          <div className={`h-1 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                readinessPercentage >= 80 ? 'bg-green-500' :
                readinessPercentage >= 50 ? 'bg-yellow-500' : 'bg-[#0D9488]'
              }`}
              style={{ width: `${readinessPercentage}%` }}
            />
          </div>
          <p className={`text-[10px] mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {readinessPercentage}% ready to use
          </p>
        </div>
      )}
    </button>
  );
};

/**
 * Related Tools Panel - Shows at bottom of tool modal
 */
interface RelatedToolsPanelProps {
  currentToolId: string;
  onToolSelect: (config: UIConfig) => void;
  theme?: 'light' | 'dark';
}

export const RelatedToolsPanel: React.FC<RelatedToolsPanelProps> = ({
  currentToolId,
  onToolSelect,
  theme = 'light',
}) => {
  const relatedTools = toolSuggestionService.getRelatedTools(currentToolId, 4);
  const isDark = theme === 'dark';

  if (relatedTools.length === 0) {
    return null;
  }

  const handleToolClick = (suggestion: ToolSuggestion) => {
    const config: UIConfig = {
      type: suggestion.tool.type,
      toolId: suggestion.tool.id,
      title: suggestion.tool.title,
      description: suggestion.tool.description,
    };
    onToolSelect(config);
  };

  return (
    <div className={`border-t ${isDark ? 'border-gray-700 bg-[#0a0a0a]' : 'border-gray-200 bg-gray-50'} px-4 py-3`}>
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-[#0D9488]" />
        <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Related Tools
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {relatedTools.map((suggestion) => {
          const ToolIcon = getToolIcon(suggestion.tool.icon);
          return (
            <button
              key={suggestion.tool.id}
              onClick={() => handleToolClick(suggestion)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all hover:scale-105 ${
                isDark
                  ? 'bg-white/5 hover:bg-white/10 text-white'
                  : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
              }`}
            >
              <ToolIcon className="w-4 h-4 text-[#0D9488]" />
              <span>{suggestion.tool.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ToolSuggestions;
