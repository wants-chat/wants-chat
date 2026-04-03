/**
 * Recruitment Candidates Component Generators
 *
 * Generates components for candidate management including filters,
 * placement pipeline, and interview scheduling.
 */

export interface CandidatesRecruitmentOptions {
  componentName?: string;
  endpoint?: string;
}

/**
 * Generate CandidateFilters component
 * Advanced filtering for candidate search and management
 */
export function generateCandidateFilters(options: CandidatesRecruitmentOptions = {}): string {
  const { componentName = 'CandidateFilters' } = options;

  return `import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  X,
  MapPin,
  Briefcase,
  GraduationCap,
  Star,
  Calendar,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface FilterState {
  search: string;
  status: string[];
  stage: string[];
  location: string;
  experience: string;
  education: string;
  skills: string[];
  rating: number | null;
  appliedDateFrom: string;
  appliedDateTo: string;
  source: string;
  jobId: string;
}

interface ${componentName}Props {
  filters: Partial<FilterState>;
  onChange: (filters: Partial<FilterState>) => void;
  jobs?: Array<{ id: string; title: string }>;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ filters, onChange, jobs = [], className }) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  const statusOptions = [
    { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    { value: 'screening', label: 'Screening', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
    { value: 'interviewing', label: 'Interviewing', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    { value: 'offered', label: 'Offered', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    { value: 'hired', label: 'Hired', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    { value: 'withdrawn', label: 'Withdrawn', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400' },
  ];

  const stageOptions = [
    'Application Review',
    'Phone Screen',
    'Technical Interview',
    'Hiring Manager Interview',
    'Panel Interview',
    'Final Interview',
    'Reference Check',
    'Background Check',
    'Offer',
  ];

  const experienceOptions = [
    { value: '0-1', label: '0-1 years' },
    { value: '1-3', label: '1-3 years' },
    { value: '3-5', label: '3-5 years' },
    { value: '5-10', label: '5-10 years' },
    { value: '10+', label: '10+ years' },
  ];

  const educationOptions = [
    'High School',
    'Associate Degree',
    'Bachelor\'s Degree',
    'Master\'s Degree',
    'PhD',
    'Other',
  ];

  const sourceOptions = [
    'LinkedIn',
    'Indeed',
    'Company Website',
    'Referral',
    'Job Board',
    'Recruiter',
    'Other',
  ];

  const handleAddSkill = () => {
    if (skillInput.trim() && !(filters.skills || []).includes(skillInput.trim())) {
      onChange({ ...filters, skills: [...(filters.skills || []), skillInput.trim()] });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    onChange({ ...filters, skills: (filters.skills || []).filter((s) => s !== skill) });
  };

  const handleClearAll = () => {
    onChange({
      search: '',
      status: [],
      stage: [],
      location: '',
      experience: '',
      education: '',
      skills: [],
      rating: null,
      appliedDateFrom: '',
      appliedDateTo: '',
      source: '',
      jobId: '',
    });
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (Array.isArray(value)) return value.length > 0;
    if (value === null) return false;
    return value && value !== '';
  }).length;

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 \${className || ''}\`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Filter Candidates</h3>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                {activeFiltersCount} active
              </span>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <button
              onClick={handleClearAll}
              className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={filters.search || ''}
              onChange={(e) => onChange({ ...filters, search: e.target.value })}
              placeholder="Search by name, email, or resume content..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white placeholder-gray-500"
            />
          </div>

          {jobs.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Briefcase className="w-4 h-4 inline mr-1" /> Job Position
              </label>
              <select
                value={filters.jobId || ''}
                onChange={(e) => onChange({ ...filters, jobId: e.target.value })}
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
              >
                <option value="">All Positions</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>{job.title}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((status) => (
                <button
                  key={status.value}
                  onClick={() => {
                    const current = filters.status || [];
                    const updated = current.includes(status.value)
                      ? current.filter((s) => s !== status.value)
                      : [...current, status.value];
                    onChange({ ...filters, status: updated });
                  }}
                  className={\`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors \${
                    (filters.status || []).includes(status.value)
                      ? status.color
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }\`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" /> Location
              </label>
              <input
                type="text"
                value={filters.location || ''}
                onChange={(e) => onChange({ ...filters, location: e.target.value })}
                placeholder="City, State, or Remote"
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white placeholder-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Briefcase className="w-4 h-4 inline mr-1" /> Experience
              </label>
              <select
                value={filters.experience || ''}
                onChange={(e) => onChange({ ...filters, experience: e.target.value })}
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
              >
                <option value="">Any Experience</option>
                {experienceOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Advanced Filters
            {isAdvancedOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {isAdvancedOpen && (
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pipeline Stage</label>
                <div className="flex flex-wrap gap-2">
                  {stageOptions.map((stage) => (
                    <button
                      key={stage}
                      onClick={() => {
                        const current = filters.stage || [];
                        const updated = current.includes(stage)
                          ? current.filter((s) => s !== stage)
                          : [...current, stage];
                        onChange({ ...filters, stage: updated });
                      }}
                      className={\`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors \${
                        (filters.stage || []).includes(stage)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }\`}
                    >
                      {stage}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <GraduationCap className="w-4 h-4 inline mr-1" /> Education
                  </label>
                  <select
                    value={filters.education || ''}
                    onChange={(e) => onChange({ ...filters, education: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
                  >
                    <option value="">Any Education</option>
                    {educationOptions.map((edu) => (
                      <option key={edu} value={edu}>{edu}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Source</label>
                  <select
                    value={filters.source || ''}
                    onChange={(e) => onChange({ ...filters, source: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
                  >
                    <option value="">All Sources</option>
                    {sourceOptions.map((src) => (
                      <option key={src} value={src}>{src}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Skills</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                    placeholder="Add a skill..."
                    className="flex-1 p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white placeholder-gray-500"
                  />
                  <button
                    onClick={handleAddSkill}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                {(filters.skills || []).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {(filters.skills || []).map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                      >
                        {skill}
                        <button onClick={() => handleRemoveSkill(skill)}>
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Star className="w-4 h-4 inline mr-1" /> Minimum Rating
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => onChange({ ...filters, rating: filters.rating === rating ? null : rating })}
                      className={\`p-2 rounded-lg transition-colors \${
                        (filters.rating || 0) >= rating
                          ? 'text-yellow-500'
                          : 'text-gray-300 dark:text-gray-600'
                      }\`}
                    >
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" /> Applied From
                  </label>
                  <input
                    type="date"
                    value={filters.appliedDateFrom || ''}
                    onChange={(e) => onChange({ ...filters, appliedDateFrom: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" /> Applied To
                  </label>
                  <input
                    type="date"
                    value={filters.appliedDateTo || ''}
                    onChange={(e) => onChange({ ...filters, appliedDateTo: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate PlacementPipeline component
 * Kanban-style pipeline for tracking candidates through stages
 */
export function generatePlacementPipeline(options: CandidatesRecruitmentOptions = {}): string {
  const { componentName = 'PlacementPipeline', endpoint = '/recruitment/candidates' } = options;

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Loader2,
  User,
  Mail,
  Phone,
  MapPin,
  MoreHorizontal,
  Eye,
  Calendar,
  MessageSquare,
  Star,
  GripVertical,
  ChevronRight
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ${componentName}Props {
  jobId?: string;
  className?: string;
  onCandidateSelect?: (candidate: any) => void;
}

const pipelineStages = [
  { id: 'new', name: 'New Applications', color: 'blue' },
  { id: 'screening', name: 'Screening', color: 'yellow' },
  { id: 'interview', name: 'Interview', color: 'purple' },
  { id: 'assessment', name: 'Assessment', color: 'orange' },
  { id: 'offer', name: 'Offer', color: 'emerald' },
  { id: 'hired', name: 'Hired', color: 'green' },
];

const ${componentName}: React.FC<${componentName}Props> = ({ jobId, className, onCandidateSelect }) => {
  const queryClient = useQueryClient();
  const [draggedCandidate, setDraggedCandidate] = useState<any>(null);

  const { data: candidates, isLoading } = useQuery({
    queryKey: ['pipeline-candidates', jobId],
    queryFn: async () => {
      const params = jobId ? \`?job_id=\${jobId}\` : '';
      const response = await api.get<any>('${endpoint}' + params);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const updateStageMutation = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) =>
      api.put(\`${endpoint}/\${id}\`, { stage }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline-candidates'] });
      toast.success('Candidate moved to new stage');
    },
    onError: () => toast.error('Failed to update candidate stage'),
  });

  const handleDragStart = (e: React.DragEvent, candidate: any) => {
    setDraggedCandidate(candidate);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    if (draggedCandidate && draggedCandidate.stage !== stageId) {
      updateStageMutation.mutate({ id: draggedCandidate.id, stage: stageId });
    }
    setDraggedCandidate(null);
  };

  const getStageColor = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string }> = {
      blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-500', text: 'text-blue-600 dark:text-blue-400' },
      yellow: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-500', text: 'text-yellow-600 dark:text-yellow-400' },
      purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-500', text: 'text-purple-600 dark:text-purple-400' },
      orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-500', text: 'text-orange-600 dark:text-orange-400' },
      emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
      green: { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-500', text: 'text-green-600 dark:text-green-400' },
    };
    return colors[color] || colors.blue;
  };

  const getCandidatesByStage = (stageId: string) =>
    candidates?.filter((c: any) => c.stage === stageId) || [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className={\`overflow-x-auto \${className || ''}\`}>
      <div className="flex gap-4 min-w-max p-4">
        {pipelineStages.map((stage) => {
          const stageColors = getStageColor(stage.color);
          const stageCandidates = getCandidatesByStage(stage.id);

          return (
            <div
              key={stage.id}
              className="w-80 flex-shrink-0"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              <div className={\`rounded-t-lg p-4 border-t-4 \${stageColors.border} \${stageColors.bg}\`}>
                <div className="flex items-center justify-between">
                  <h3 className={\`font-semibold \${stageColors.text}\`}>{stage.name}</h3>
                  <span className="px-2 py-1 bg-white dark:bg-gray-800 rounded-full text-xs font-medium text-gray-600 dark:text-gray-400">
                    {stageCandidates.length}
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-b-lg p-3 min-h-[500px] space-y-3">
                {stageCandidates.map((candidate: any) => (
                  <div
                    key={candidate.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, candidate)}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                    onClick={() => onCandidateSelect?.(candidate)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <GripVertical className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {candidate.avatar ? (
                              <img
                                src={candidate.avatar}
                                alt={candidate.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                                {candidate.name?.charAt(0) || 'C'}
                              </div>
                            )}
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                                {candidate.name}
                              </h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {candidate.position || candidate.job_title}
                              </p>
                            </div>
                          </div>
                          <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                            <MoreHorizontal className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>

                        {candidate.rating && (
                          <div className="flex items-center gap-1 mt-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={\`w-3.5 h-3.5 \${
                                  i < candidate.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300 dark:text-gray-600'
                                }\`}
                              />
                            ))}
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2 mt-3 text-xs text-gray-500 dark:text-gray-400">
                          {candidate.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {candidate.email.length > 20 ? candidate.email.slice(0, 20) + '...' : candidate.email}
                            </span>
                          )}
                          {candidate.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {candidate.location}
                            </span>
                          )}
                        </div>

                        {candidate.skills && candidate.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {candidate.skills.slice(0, 3).map((skill: string, i: number) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs"
                              >
                                {skill}
                              </span>
                            ))}
                            {candidate.skills.length > 3 && (
                              <span className="px-2 py-0.5 text-gray-500 text-xs">
                                +{candidate.skills.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                          <button className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </button>
                          <button className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                            <Calendar className="w-3.5 h-3.5" />
                            Schedule
                          </button>
                          <button className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                            <MessageSquare className="w-3.5 h-3.5" />
                            Note
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {stageCandidates.length === 0 && (
                  <div className="text-center py-8 text-gray-400 dark:text-gray-600">
                    <User className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">No candidates</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate InterviewSchedule component
 * Calendar-based interview scheduling interface
 */
export function generateInterviewSchedule(options: CandidatesRecruitmentOptions = {}): string {
  const { componentName = 'InterviewSchedule', endpoint = '/recruitment/interviews' } = options;

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Loader2,
  Calendar,
  Clock,
  User,
  Users,
  Video,
  MapPin,
  Plus,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Check,
  X,
  Phone,
  Building2
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ${componentName}Props {
  className?: string;
  candidateId?: string;
  jobId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className, candidateId, jobId }) => {
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<'week' | 'month'>('week');
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const { data: interviews, isLoading } = useQuery({
    queryKey: ['interviews', currentDate.toISOString(), candidateId, jobId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (candidateId) params.append('candidate_id', candidateId);
      if (jobId) params.append('job_id', jobId);
      params.append('month', (currentDate.getMonth() + 1).toString());
      params.append('year', currentDate.getFullYear().toString());
      const response = await api.get<any>(\`${endpoint}?\${params.toString()}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const updateInterviewMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.put(\`${endpoint}/\${id}\`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      toast.success('Interview updated');
    },
    onError: () => toast.error('Failed to update interview'),
  });

  const cancelInterviewMutation = useMutation({
    mutationFn: (id: string) => api.delete(\`${endpoint}/\${id}\`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      toast.success('Interview cancelled');
    },
    onError: () => toast.error('Failed to cancel interview'),
  });

  const interviewTypeConfig: Record<string, { icon: React.FC<any>; color: string }> = {
    video: { icon: Video, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
    phone: { icon: Phone, color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
    onsite: { icon: Building2, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
    panel: { icon: Users, color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
  };

  const statusConfig: Record<string, { color: string; label: string }> = {
    scheduled: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', label: 'Scheduled' },
    confirmed: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', label: 'Confirmed' },
    completed: { color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400', label: 'Completed' },
    cancelled: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', label: 'Cancelled' },
    rescheduled: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Rescheduled' },
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    const startPadding = firstDay.getDay();
    for (let i = startPadding - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i));
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    const endPadding = 6 - lastDay.getDay();
    for (let i = 1; i <= endPadding; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  };

  const getWeekDays = (date: Date) => {
    const days: Date[] = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }

    return days;
  };

  const getInterviewsForDate = (date: Date) => {
    return (interviews || []).filter((interview: any) => {
      const interviewDate = new Date(interview.scheduled_at || interview.date);
      return interviewDate.toDateString() === date.toDateString();
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (view === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const isToday = (date: Date) => date.toDateString() === new Date().toDateString();
  const isCurrentMonth = (date: Date) => date.getMonth() === currentDate.getMonth();

  const days = view === 'week' ? getWeekDays(currentDate) : getDaysInMonth(currentDate);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 \${className || ''}\`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Interview Schedule
            </h3>
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setView('week')}
                className={\`px-3 py-1 text-sm rounded-md transition-colors \${
                  view === 'week'
                    ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400'
                }\`}
              >
                Week
              </button>
              <button
                onClick={() => setView('month')}
                className={\`px-3 py-1 text-sm rounded-md transition-colors \${
                  view === 'month'
                    ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400'
                }\`}
              >
                Month
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
            >
              Today
            </button>
            <div className="flex items-center">
              <button
                onClick={() => navigateDate('prev')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <span className="px-3 font-medium text-gray-900 dark:text-white min-w-[180px] text-center">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <button
                onClick={() => navigateDate('next')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Schedule Interview
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="py-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
            >
              {day}
            </div>
          ))}
        </div>
      </div>

      <div className="p-4">
        <div className={\`grid grid-cols-7 gap-1 \${view === 'month' ? 'auto-rows-fr' : ''}\`}>
          {days.map((day, index) => {
            const dayInterviews = getInterviewsForDate(day);
            const isCurrentMonthDay = isCurrentMonth(day);

            return (
              <div
                key={index}
                onClick={() => setSelectedDate(day)}
                className={\`min-h-[100px] p-2 border border-gray-100 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors \${
                  !isCurrentMonthDay ? 'bg-gray-50/50 dark:bg-gray-900/30' : ''
                } \${isToday(day) ? 'ring-2 ring-blue-500' : ''} \${
                  selectedDate?.toDateString() === day.toDateString() ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }\`}
              >
                <div className={\`text-sm font-medium mb-1 \${
                  isToday(day)
                    ? 'text-blue-600 dark:text-blue-400'
                    : isCurrentMonthDay
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-400 dark:text-gray-600'
                }\`}>
                  {day.getDate()}
                </div>
                <div className="space-y-1">
                  {dayInterviews.slice(0, 3).map((interview: any) => {
                    const typeConfig = interviewTypeConfig[interview.type] || interviewTypeConfig.video;
                    const TypeIcon = typeConfig.icon;

                    return (
                      <div
                        key={interview.id}
                        className={\`flex items-center gap-1 px-1.5 py-1 rounded text-xs \${typeConfig.color}\`}
                        title={\`\${interview.candidate_name} - \${interview.time}\`}
                      >
                        <TypeIcon className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{interview.candidate_name || 'Interview'}</span>
                      </div>
                    );
                  })}
                  {dayInterviews.length > 3 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 pl-1">
                      +{dayInterviews.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedDate && getInterviewsForDate(selectedDate).length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">
            Interviews on {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h4>
          <div className="space-y-3">
            {getInterviewsForDate(selectedDate).map((interview: any) => {
              const typeConfig = interviewTypeConfig[interview.type] || interviewTypeConfig.video;
              const TypeIcon = typeConfig.icon;
              const status = statusConfig[interview.status] || statusConfig.scheduled;

              return (
                <div
                  key={interview.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className={\`w-10 h-10 rounded-lg flex items-center justify-center \${typeConfig.color}\`}>
                      <TypeIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-medium text-gray-900 dark:text-white">
                          {interview.candidate_name}
                        </h5>
                        <span className={\`px-2 py-0.5 rounded-full text-xs font-medium \${status.color}\`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {interview.time || '10:00 AM'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {interview.interviewers?.join(', ') || 'TBD'}
                        </span>
                        {interview.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {interview.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {interview.status === 'scheduled' && (
                      <button
                        onClick={() => updateInterviewMutation.mutate({ id: interview.id, status: 'confirmed' })}
                        className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                        title="Confirm"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => cancelInterviewMutation.mutate(interview.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
