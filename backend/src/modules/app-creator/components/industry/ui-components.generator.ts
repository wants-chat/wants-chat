/**
 * UI Component Generators
 * For generic UI elements like badges, assets, maps, etc.
 */

export interface UIComponentsOptions {
  primaryColor?: string;
  secondaryColor?: string;
}

/**
 * Generate Asset Browser Component
 */
export function generateAssetBrowser(options: UIComponentsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface AssetBrowserProps {
      assets: Array<{
        id: string;
        name: string;
        type: 'image' | 'video' | 'document' | 'audio';
        url: string;
        thumbnail?: string;
        size: string;
        uploadedAt: string;
      }>;
      selectedIds?: string[];
      onSelect?: (id: string) => void;
      onUpload?: () => void;
      onDelete?: (id: string) => void;
    }

    const AssetBrowser: React.FC<AssetBrowserProps> = ({ assets, selectedIds = [], onSelect, onUpload, onDelete }) => {
      const typeIcons = {
        image: '🖼️',
        video: '🎥',
        document: '📄',
        audio: '🎵',
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold">Assets</h3>
            {onUpload && (
              <button
                onClick={onUpload}
                className="px-3 py-1 text-sm text-white rounded hover:opacity-90"
                style={{ backgroundColor: '${primaryColor}' }}
              >
                + Upload
              </button>
            )}
          </div>
          <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className={\`relative group rounded-lg border overflow-hidden cursor-pointer \${
                  selectedIds.includes(asset.id) ? 'ring-2' : ''
                }\`}
                style={{ '--tw-ring-color': '${primaryColor}' } as any}
                onClick={() => onSelect?.(asset.id)}
              >
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  {asset.thumbnail ? (
                    <img src={asset.thumbnail} alt={asset.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">{typeIcons[asset.type]}</span>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-sm font-medium truncate">{asset.name}</p>
                  <p className="text-xs text-gray-500">{asset.size}</p>
                </div>
                {onDelete && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(asset.id); }}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                  >
                    ✕
                  </button>
                )}
                {selectedIds.includes(asset.id) && (
                  <div
                    className="absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                    style={{ backgroundColor: '${primaryColor}' }}
                  >
                    ✓
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Badge List Component
 */
export function generateBadgeList(options: UIComponentsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface BadgeListProps {
      badges: Array<{
        id: string;
        name: string;
        description: string;
        icon: string;
        earnedAt?: string;
        isLocked?: boolean;
        progress?: number;
      }>;
      onSelect?: (id: string) => void;
    }

    const BadgeList: React.FC<BadgeListProps> = ({ badges, onSelect }) => {
      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Badges & Achievements</h3>
          </div>
          <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={\`p-4 rounded-lg border text-center cursor-pointer hover:shadow-md transition-shadow \${
                  badge.isLocked ? 'opacity-50' : ''
                }\`}
                onClick={() => !badge.isLocked && onSelect?.(badge.id)}
              >
                <div className={\`text-4xl mb-2 \${badge.isLocked ? 'grayscale' : ''}\`}>
                  {badge.isLocked ? '🔒' : badge.icon}
                </div>
                <p className="font-medium text-sm">{badge.name}</p>
                <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
                {badge.earnedAt && (
                  <p className="text-xs text-green-600 mt-2">Earned {badge.earnedAt}</p>
                )}
                {badge.isLocked && badge.progress !== undefined && (
                  <div className="mt-2">
                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: \`\${badge.progress}%\`, backgroundColor: '${primaryColor}' }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{badge.progress}%</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Location Map Component
 */
export function generateLocationMap(options: UIComponentsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface LocationMapProps {
      locations: Array<{
        id: string;
        name: string;
        address: string;
        lat: number;
        lng: number;
        type?: string;
      }>;
      selectedId?: string;
      onSelect?: (id: string) => void;
      center?: { lat: number; lng: number };
      zoom?: number;
    }

    const LocationMap: React.FC<LocationMapProps> = ({
      locations,
      selectedId,
      onSelect,
      center,
      zoom = 12
    }) => {
      // Note: In production, integrate with a real map library like Mapbox or Google Maps
      return (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="h-64 bg-gray-200 relative flex items-center justify-center">
            <p className="text-gray-500">Map View</p>
            <p className="text-xs text-gray-400 absolute bottom-2">
              {locations.length} locations • Center: {center?.lat.toFixed(4)}, {center?.lng.toFixed(4)}
            </p>
          </div>
          <div className="max-h-48 overflow-y-auto divide-y">
            {locations.map((loc) => (
              <button
                key={loc.id}
                onClick={() => onSelect?.(loc.id)}
                className={\`w-full p-3 text-left hover:bg-gray-50 \${
                  selectedId === loc.id ? 'bg-blue-50' : ''
                }\`}
              >
                <p className="font-medium text-sm">{loc.name}</p>
                <p className="text-xs text-gray-500">{loc.address}</p>
                {loc.type && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{loc.type}</span>}
              </button>
            ))}
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Map Section Component
 */
export function generateMapSection(options: UIComponentsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface MapSectionProps {
      address: string;
      coordinates?: { lat: number; lng: number };
      title?: string;
      showDirections?: boolean;
      onGetDirections?: () => void;
    }

    const MapSection: React.FC<MapSectionProps> = ({
      address,
      coordinates,
      title = 'Location',
      showDirections = true,
      onGetDirections
    }) => {
      return (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="h-48 bg-gray-200 flex items-center justify-center">
            <div className="text-center">
              <span className="text-4xl">📍</span>
              <p className="text-gray-500 mt-2">Map View</p>
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-semibold mb-2">{title}</h3>
            <p className="text-sm text-gray-600">{address}</p>
            {coordinates && (
              <p className="text-xs text-gray-400 mt-1">
                {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
              </p>
            )}
            {showDirections && (
              <button
                onClick={onGetDirections}
                className="mt-3 w-full px-4 py-2 text-white rounded-lg hover:opacity-90"
                style={{ backgroundColor: '${primaryColor}' }}
              >
                Get Directions
              </button>
            )}
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Page Header Component
 */
export function generatePageHeader(options: UIComponentsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface PageHeaderProps {
      title: string;
      subtitle?: string;
      breadcrumbs?: Array<{ label: string; href?: string }>;
      actions?: React.ReactNode;
      backLink?: { label: string; href: string };
    }

    const PageHeader: React.FC<PageHeaderProps> = ({
      title,
      subtitle,
      breadcrumbs,
      actions,
      backLink
    }) => {
      return (
        <div className="mb-6">
          {breadcrumbs && (
            <nav className="mb-2">
              <ol className="flex items-center gap-2 text-sm">
                {breadcrumbs.map((crumb, i) => (
                  <li key={i} className="flex items-center gap-2">
                    {crumb.href ? (
                      <a href={crumb.href} className="text-gray-500 hover:text-gray-700">{crumb.label}</a>
                    ) : (
                      <span className="text-gray-900">{crumb.label}</span>
                    )}
                    {i < breadcrumbs.length - 1 && <span className="text-gray-400">/</span>}
                  </li>
                ))}
              </ol>
            </nav>
          )}
          {backLink && (
            <a href={backLink.href} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2">
              ← {backLink.label}
            </a>
          )}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{title}</h1>
              {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
            </div>
            {actions && <div className="flex gap-2">{actions}</div>}
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Process Section Component
 */
export function generateProcessSection(options: UIComponentsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface ProcessSectionProps {
      title?: string;
      steps: Array<{
        number: number;
        title: string;
        description: string;
        icon?: string;
      }>;
    }

    const ProcessSection: React.FC<ProcessSectionProps> = ({ title = 'How It Works', steps }) => {
      return (
        <section className="py-12">
          <h2 className="text-2xl font-bold text-center mb-8">{title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="text-center">
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-xl font-bold"
                  style={{ backgroundColor: '${primaryColor}' }}
                >
                  {step.icon || step.number}
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </section>
      );
    };
  `;
}

/**
 * Generate Reply Form Component
 */
export function generateReplyForm(options: UIComponentsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface ReplyFormProps {
      placeholder?: string;
      onSubmit?: (content: string) => void;
      onCancel?: () => void;
      isSubmitting?: boolean;
      minRows?: number;
    }

    const ReplyForm: React.FC<ReplyFormProps> = ({
      placeholder = 'Write your reply...',
      onSubmit,
      onCancel,
      isSubmitting = false,
      minRows = 3
    }) => {
      const [content, setContent] = React.useState('');

      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (content.trim()) {
          onSubmit?.(content);
          setContent('');
        }
      };

      return (
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            rows={minRows}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 resize-none"
            style={{ '--tw-ring-color': '${primaryColor}' } as any}
            disabled={isSubmitting}
          />
          <div className="flex justify-end gap-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={!content.trim() || isSubmitting}
              className="px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '${primaryColor}' }}
            >
              {isSubmitting ? 'Posting...' : 'Post Reply'}
            </button>
          </div>
        </form>
      );
    };
  `;
}

/**
 * Generate Report List Component
 */
export function generateReportList(options: UIComponentsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface ReportListProps {
      reports: Array<{
        id: string;
        name: string;
        type: string;
        generatedAt: string;
        status: 'ready' | 'generating' | 'failed';
        fileSize?: string;
      }>;
      onDownload?: (id: string) => void;
      onRegenerate?: (id: string) => void;
      onDelete?: (id: string) => void;
    }

    const ReportList: React.FC<ReportListProps> = ({ reports, onDownload, onRegenerate, onDelete }) => {
      const statusColors = {
        ready: 'bg-green-100 text-green-800',
        generating: 'bg-blue-100 text-blue-800',
        failed: 'bg-red-100 text-red-800',
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Reports</h3>
          </div>
          <div className="divide-y">
            {reports.map((report) => (
              <div key={report.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📊</span>
                  <div>
                    <p className="font-medium">{report.name}</p>
                    <p className="text-sm text-gray-500">
                      {report.type} • {report.generatedAt}
                      {report.fileSize && \` • \${report.fileSize}\`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={\`px-2 py-1 rounded text-xs font-medium \${statusColors[report.status]}\`}>
                    {report.status}
                  </span>
                  {report.status === 'ready' && onDownload && (
                    <button
                      onClick={() => onDownload(report.id)}
                      className="px-3 py-1 text-sm text-white rounded hover:opacity-90"
                      style={{ backgroundColor: '${primaryColor}' }}
                    >
                      Download
                    </button>
                  )}
                  {report.status === 'failed' && onRegenerate && (
                    <button
                      onClick={() => onRegenerate(report.id)}
                      className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                    >
                      Retry
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(report.id)}
                      className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Subforum List Component
 */
export function generateSubforumList(options: UIComponentsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface SubforumListProps {
      subforums: Array<{
        id: string;
        name: string;
        description: string;
        icon?: string;
        threadCount: number;
        postCount: number;
        lastPost?: {
          title: string;
          author: string;
          time: string;
        };
      }>;
      onSelect?: (id: string) => void;
    }

    const SubforumList: React.FC<SubforumListProps> = ({ subforums, onSelect }) => {
      return (
        <div className="bg-white rounded-lg shadow-sm border divide-y">
          {subforums.map((forum) => (
            <div
              key={forum.id}
              className="p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => onSelect?.(forum.id)}
            >
              <div className="flex items-start gap-4">
                <div className="text-2xl">{forum.icon || '💬'}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold" style={{ color: '${primaryColor}' }}>{forum.name}</h4>
                  <p className="text-sm text-gray-500 line-clamp-2">{forum.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span>{forum.threadCount} threads</span>
                    <span>{forum.postCount} posts</span>
                  </div>
                </div>
                {forum.lastPost && (
                  <div className="text-right text-sm hidden md:block">
                    <p className="text-gray-600 truncate max-w-[200px]">{forum.lastPost.title}</p>
                    <p className="text-xs text-gray-400">by {forum.lastPost.author} • {forum.lastPost.time}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    };
  `;
}

/**
 * Generate Task Detail Component
 */
export function generateTaskDetail(options: UIComponentsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface TaskDetailProps {
      task: {
        id: string;
        title: string;
        description: string;
        status: 'todo' | 'in-progress' | 'review' | 'done';
        priority: 'low' | 'medium' | 'high' | 'urgent';
        assignee?: { name: string; avatar?: string };
        dueDate?: string;
        tags?: string[];
        subtasks?: Array<{ id: string; title: string; completed: boolean }>;
        attachments?: Array<{ name: string; url: string }>;
        comments?: Array<{ author: string; content: string; time: string }>;
      };
      onStatusChange?: (status: string) => void;
      onEdit?: () => void;
    }

    const TaskDetail: React.FC<TaskDetailProps> = ({ task, onStatusChange, onEdit }) => {
      const statusColors = {
        'todo': 'bg-gray-100 text-gray-800',
        'in-progress': 'bg-blue-100 text-blue-800',
        'review': 'bg-yellow-100 text-yellow-800',
        'done': 'bg-green-100 text-green-800',
      };

      const priorityColors = {
        low: 'text-gray-500',
        medium: 'text-blue-500',
        high: 'text-orange-500',
        urgent: 'text-red-500',
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">{task.title}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className={\`px-2 py-1 rounded text-xs font-medium \${statusColors[task.status]}\`}>
                    {task.status}
                  </span>
                  <span className={\`text-sm font-medium \${priorityColors[task.priority]}\`}>
                    {task.priority} priority
                  </span>
                </div>
              </div>
              {onEdit && (
                <button onClick={onEdit} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                  Edit
                </button>
              )}
            </div>
            <p className="text-gray-600">{task.description}</p>
          </div>

          <div className="p-6 grid grid-cols-2 gap-6 border-b">
            {task.assignee && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Assignee</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    {task.assignee.avatar ? (
                      <img src={task.assignee.avatar} alt="" className="w-full h-full rounded-full" />
                    ) : (
                      task.assignee.name.charAt(0)
                    )}
                  </div>
                  <span>{task.assignee.name}</span>
                </div>
              </div>
            )}
            {task.dueDate && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Due Date</p>
                <p className="font-medium">{task.dueDate}</p>
              </div>
            )}
          </div>

          {task.subtasks && task.subtasks.length > 0 && (
            <div className="p-6 border-b">
              <p className="text-sm text-gray-500 mb-2">Subtasks</p>
              <div className="space-y-2">
                {task.subtasks.map((subtask) => (
                  <label key={subtask.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={subtask.completed}
                      readOnly
                      className="rounded"
                    />
                    <span className={\`text-sm \${subtask.completed ? 'line-through text-gray-400' : ''}\`}>
                      {subtask.title}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {task.tags && task.tags.length > 0 && (
            <div className="px-6 py-4">
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag, i) => (
                  <span key={i} className="px-2 py-1 bg-gray-100 rounded text-sm">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    };
  `;
}

/**
 * Generate Group Members Component
 */
export function generateGroupMembers(options: UIComponentsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface GroupMembersProps {
      members: Array<{
        id: string;
        name: string;
        avatar?: string;
        role: 'admin' | 'moderator' | 'member';
        joinedAt: string;
        isOnline?: boolean;
      }>;
      onSelect?: (id: string) => void;
      onRemove?: (id: string) => void;
      canManage?: boolean;
    }

    const GroupMembers: React.FC<GroupMembersProps> = ({ members, onSelect, onRemove, canManage = false }) => {
      const roleColors = {
        admin: 'bg-red-100 text-red-800',
        moderator: 'bg-purple-100 text-purple-800',
        member: 'bg-gray-100 text-gray-800',
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Members ({members.length})</h3>
          </div>
          <div className="divide-y">
            {members.map((member) => (
              <div
                key={member.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => onSelect?.(member.id)}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">{member.name.charAt(0)}</div>
                      )}
                    </div>
                    {member.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-xs text-gray-500">Joined {member.joinedAt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={\`px-2 py-0.5 rounded text-xs font-medium \${roleColors[member.role]}\`}>
                    {member.role}
                  </span>
                  {canManage && member.role === 'member' && onRemove && (
                    <button
                      onClick={() => onRemove(member.id)}
                      className="text-red-500 hover:bg-red-50 px-2 py-1 rounded text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Class Students Component
 */
export function generateClassStudents(options: UIComponentsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface ClassStudentsProps {
      students: Array<{
        id: string;
        name: string;
        avatar?: string;
        email: string;
        attendance: number;
        grade?: string;
        status: 'active' | 'inactive' | 'dropped';
      }>;
      onSelect?: (id: string) => void;
      onMessage?: (id: string) => void;
    }

    const ClassStudents: React.FC<ClassStudentsProps> = ({ students, onSelect, onMessage }) => {
      const statusColors = {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-yellow-100 text-yellow-800',
        dropped: 'bg-red-100 text-red-800',
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold">Students ({students.length})</h3>
          </div>
          <div className="divide-y">
            {students.map((student) => (
              <div key={student.id} className="p-4 flex items-center justify-between">
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => onSelect?.(student.id)}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                    {student.avatar ? (
                      <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        {student.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-gray-500">{student.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm">Attendance: {student.attendance}%</p>
                    {student.grade && <p className="text-sm text-gray-500">Grade: {student.grade}</p>}
                  </div>
                  <span className={\`px-2 py-1 rounded text-xs font-medium \${statusColors[student.status]}\`}>
                    {student.status}
                  </span>
                  {onMessage && (
                    <button
                      onClick={() => onMessage(student.id)}
                      className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                    >
                      Message
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Pending Items Component
 */
export function generatePendingItems(options: UIComponentsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface PendingItemsProps {
      items: Array<{
        id: string;
        title: string;
        type: string;
        submittedAt: string;
        submittedBy: string;
        priority?: 'low' | 'normal' | 'high';
      }>;
      onApprove?: (id: string) => void;
      onReject?: (id: string) => void;
      onView?: (id: string) => void;
    }

    const PendingItems: React.FC<PendingItemsProps> = ({ items, onApprove, onReject, onView }) => {
      const priorityColors = {
        low: 'text-gray-500',
        normal: 'text-blue-500',
        high: 'text-red-500',
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Pending Approval ({items.length})</h3>
          </div>
          <div className="divide-y">
            {items.map((item) => (
              <div key={item.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="cursor-pointer" onClick={() => onView?.(item.id)}>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{item.title}</p>
                      {item.priority && (
                        <span className={\`text-xs \${priorityColors[item.priority]}\`}>
                          {item.priority} priority
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {item.type} • Submitted by {item.submittedBy} • {item.submittedAt}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {onReject && (
                      <button
                        onClick={() => onReject(item.id)}
                        className="px-3 py-1 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50"
                      >
                        Reject
                      </button>
                    )}
                    {onApprove && (
                      <button
                        onClick={() => onApprove(item.id)}
                        className="px-3 py-1 text-sm text-white rounded hover:opacity-90"
                        style={{ backgroundColor: '${primaryColor}' }}
                      >
                        Approve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    };
  `;
}
