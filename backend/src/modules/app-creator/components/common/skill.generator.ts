/**
 * Skill Generator
 *
 * Generates skill-related components:
 * - SkillList: Display skills with progress and levels
 */

import { pascalCase, snakeCase } from 'change-case';
import pluralize from 'pluralize';

export interface SkillListOptions {
  componentName?: string;
  entity?: string;
  endpoint?: string;
  queryKey?: string;
  showProgress?: boolean;
  showLevel?: boolean;
  showXP?: boolean;
  showEndorsements?: boolean;
  groupByCategory?: boolean;
  editable?: boolean;
}

/**
 * Generate a SkillList component
 */
export function generateSkillList(options: SkillListOptions = {}): string {
  const {
    componentName = 'SkillList',
    entity = 'skill',
    showProgress = true,
    showLevel = true,
    showXP = true,
    showEndorsements = false,
    groupByCategory = true,
    editable = false,
  } = options;

  const tableName = snakeCase(pluralize.plural(entity));
  const endpoint = options.endpoint || `/${tableName}`;
  const queryKey = options.queryKey || tableName;

  return `import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Plus,
  Star,
  Award,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  Users,
  Loader2,
  X,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface Skill {
  id: string;
  name: string;
  description?: string;
  category?: string;
  icon?: string;
  level?: number;
  maxLevel?: number;
  xp?: number;
  xpToNextLevel?: number;
  progress?: number;
  endorsements?: number;
  isVerified?: boolean;
  acquiredAt?: string;
  lastUsedAt?: string;
}

interface ${componentName}Props {
  skills?: Skill[];
  userId?: string;
  className?: string;
  onSkillClick?: (skill: Skill) => void;
  onAddSkill?: () => void;
}

const LEVEL_COLORS: Record<number, string> = {
  1: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  2: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  3: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  4: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  5: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
};

const LEVEL_NAMES: Record<number, string> = {
  1: 'Beginner',
  2: 'Intermediate',
  3: 'Advanced',
  4: 'Expert',
  5: 'Master',
};

const ${componentName}: React.FC<${componentName}Props> = ({
  skills: propSkills,
  userId,
  className,
  onSkillClick,
  onAddSkill,
}) => {
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [editingSkill, setEditingSkill] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; skill: Skill | null }>({ open: false, skill: null });

  const { data: fetchedSkills, isLoading } = useQuery({
    queryKey: ['${queryKey}', userId],
    queryFn: async () => {
      try {
        const url = userId ? \`${endpoint}?userId=\${userId}\` : '${endpoint}';
        const response = await api.get<any>(url);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch skills:', err);
        return [];
      }
    },
    enabled: !propSkills,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(\`${endpoint}/\${id}\`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${queryKey}'] });
    },
  });

  const skills = propSkills || fetchedSkills || [];

  const filteredSkills = useMemo(() => {
    if (!searchQuery.trim()) return skills;
    const query = searchQuery.toLowerCase();
    return skills.filter((skill: Skill) =>
      skill.name.toLowerCase().includes(query) ||
      skill.category?.toLowerCase().includes(query)
    );
  }, [skills, searchQuery]);

  const groupedSkills = useMemo(() => {
    if (!${groupByCategory}) return { 'All Skills': filteredSkills };

    const groups: Record<string, Skill[]> = {};
    filteredSkills.forEach((skill: Skill) => {
      const category = skill.category || 'Other';
      if (!groups[category]) groups[category] = [];
      groups[category].push(skill);
    });

    // Sort by number of skills
    return Object.fromEntries(
      Object.entries(groups).sort((a, b) => b[1].length - a[1].length)
    );
  }, [filteredSkills]);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.skill) return;
    try {
      await deleteMutation.mutateAsync(deleteModal.skill.id);
    } catch (error) {
      console.error('Delete failed:', error);
    }
    setDeleteModal({ open: false, skill: null });
  };

  const formatXP = (xp?: number) => {
    if (!xp) return '0';
    if (xp >= 1000) return (xp / 1000).toFixed(1) + 'K';
    return xp.toString();
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <div className={cn('space-y-4', className)}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Skills</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {skills.length} skill{skills.length !== 1 ? 's' : ''} acquired
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 w-56"
              />
            </div>
            ${editable ? `{onAddSkill && (
              <button
                onClick={onAddSkill}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add Skill
              </button>
            )}` : ''}
          </div>
        </div>

        {/* Skills Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <Award className="w-5 h-5" />
              <span className="text-sm font-medium">Total Skills</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{skills.length}</div>
          </div>
          ${showLevel ? `<div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-purple-600 mb-2">
              <Star className="w-5 h-5" />
              <span className="text-sm font-medium">Expert Level</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {skills.filter((s: Skill) => (s.level || 1) >= 4).length}
            </div>
          </div>` : ''}
          ${showXP ? `<div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-medium">Total XP</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatXP(skills.reduce((sum: number, s: Skill) => sum + (s.xp || 0), 0))}
            </div>
          </div>` : ''}
          ${showEndorsements ? `<div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-orange-600 mb-2">
              <Users className="w-5 h-5" />
              <span className="text-sm font-medium">Endorsements</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {skills.reduce((sum: number, s: Skill) => sum + (s.endorsements || 0), 0)}
            </div>
          </div>` : ''}
        </div>

        {/* Skills List */}
        {Object.keys(groupedSkills).length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No skills found</p>
            ${editable ? `{onAddSkill && (
              <button
                onClick={onAddSkill}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add Your First Skill
              </button>
            )}` : ''}
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedSkills).map(([category, categorySkills]) => {
              const isExpanded = expandedCategories.has(category) || Object.keys(groupedSkills).length === 1;

              return (
                <div
                  key={category}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  {/* Category Header */}
                  ${groupByCategory ? `<button
                    onClick={() => toggleCategory(category)}
                    className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 dark:text-white">{category}</span>
                      <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                        {(categorySkills as Skill[]).length}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </button>` : ''}

                  {/* Skills */}
                  {(isExpanded || !${groupByCategory}) && (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                      {(categorySkills as Skill[]).map((skill: Skill) => (
                        <div
                          key={skill.id}
                          onClick={() => onSkillClick?.(skill)}
                          className={cn(
                            'p-4 transition-colors',
                            onSkillClick && 'hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer'
                          )}
                        >
                          <div className="flex items-start gap-4">
                            {/* Icon */}
                            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                              {skill.icon ? (
                                <span className="text-2xl">{skill.icon}</span>
                              ) : (
                                <Award className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {skill.name}
                                </h4>
                                {skill.isVerified && (
                                  <Check className="w-4 h-4 text-green-500" />
                                )}
                                ${showLevel ? `{skill.level && (
                                  <span className={cn(
                                    'px-2 py-0.5 text-xs font-medium rounded-full',
                                    LEVEL_COLORS[skill.level] || LEVEL_COLORS[1]
                                  )}>
                                    {LEVEL_NAMES[skill.level] || \`Level \${skill.level}\`}
                                  </span>
                                )}` : ''}
                              </div>

                              {skill.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">
                                  {skill.description}
                                </p>
                              )}

                              ${showProgress ? `{/* Progress Bar */}
                              {skill.progress !== undefined && (
                                <div className="mt-2">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-gray-500">
                                      Progress to next level
                                    </span>
                                    <span className="text-xs font-medium text-gray-900 dark:text-white">
                                      {skill.progress}%
                                    </span>
                                  </div>
                                  <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-blue-600 rounded-full transition-all duration-300"
                                      style={{ width: \`\${skill.progress}%\` }}
                                    />
                                  </div>
                                </div>
                              )}` : ''}

                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                ${showXP ? `{skill.xp !== undefined && (
                                  <span className="flex items-center gap-1">
                                    <Star className="w-3 h-3" />
                                    {formatXP(skill.xp)} XP
                                  </span>
                                )}` : ''}
                                ${showEndorsements ? `{skill.endorsements !== undefined && skill.endorsements > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {skill.endorsements} endorsement{skill.endorsements !== 1 ? 's' : ''}
                                  </span>
                                )}` : ''}
                              </div>
                            </div>

                            ${editable ? `{/* Actions */}
                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => setEditingSkill(skill.id)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                              >
                                <Edit2 className="w-4 h-4 text-gray-500" />
                              </button>
                              <button
                                onClick={() => setDeleteModal({ open: true, skill })}
                                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>` : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      ${editable ? `{/* Delete Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteModal({ open: false, skill: null })} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Delete Skill</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Are you sure you want to remove "{deleteModal.skill?.name}" from your skills?
                </p>
              </div>
              <button onClick={() => setDeleteModal({ open: false, skill: null })} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteModal({ open: false, skill: null })} className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                Cancel
              </button>
              <button onClick={handleDeleteConfirm} disabled={deleteMutation.isPending} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}` : ''}
    </>
  );
};

export default ${componentName};
`;
}

/**
 * Generate skill components for a specific domain
 */
export function generateSkillComponents(domain: string): { list: string } {
  const pascalDomain = pascalCase(domain);

  return {
    list: generateSkillList({
      componentName: `${pascalDomain}SkillList`,
      entity: `${domain}Skill`,
    }),
  };
}
