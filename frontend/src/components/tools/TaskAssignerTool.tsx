import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Shuffle, Plus, Trash2, RefreshCw, Copy, Check, ClipboardList, UserPlus, Info } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface TaskAssignerToolProps {
  uiConfig?: UIConfig;
}

interface Person {
  id: string;
  name: string;
  color: string;
}

interface Task {
  id: string;
  name: string;
  assignee?: Person;
}

interface Assignment {
  task: Task;
  person: Person;
}

const defaultColors = [
  '#14b8a6', '#f97316', '#8b5cf6', '#ec4899', '#06b6d4',
  '#84cc16', '#f59e0b', '#6366f1', '#ef4444', '#22c55e',
];

export const TaskAssignerTool: React.FC<TaskAssignerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [people, setPeople] = useState<Person[]>([
    { id: '1', name: 'Alice', color: defaultColors[0] },
    { id: '2', name: 'Bob', color: defaultColors[1] },
  ]);
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', name: 'Do the dishes' },
    { id: '2', name: 'Take out trash' },
    { id: '3', name: 'Vacuum living room' },
    { id: '4', name: 'Cook dinner' },
  ]);
  const [newPersonName, setNewPersonName] = useState('');
  const [newTaskName, setNewTaskName] = useState('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [fairMode, setFairMode] = useState(true);
  const [copied, setCopied] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;

      if (params.people && Array.isArray(params.people)) {
        const newPeople = params.people.map((name: string, idx: number) => ({
          id: `prefill-person-${idx}`,
          name,
          color: defaultColors[idx % defaultColors.length],
        }));
        setPeople(newPeople);
      }

      if (params.tasks && Array.isArray(params.tasks)) {
        const newTasks = params.tasks.map((name: string, idx: number) => ({
          id: `prefill-task-${idx}`,
          name,
        }));
        setTasks(newTasks);
      }
    }
  }, [uiConfig?.params]);

  const addPerson = () => {
    if (!newPersonName.trim()) return;

    const person: Person = {
      id: `person-${Date.now()}`,
      name: newPersonName.trim(),
      color: defaultColors[people.length % defaultColors.length],
    };

    setPeople((prev) => [...prev, person]);
    setNewPersonName('');
  };

  const removePerson = (id: string) => {
    setPeople((prev) => prev.filter((p) => p.id !== id));
    setAssignments((prev) => prev.filter((a) => a.person.id !== id));
  };

  const addTask = () => {
    if (!newTaskName.trim()) return;

    const task: Task = {
      id: `task-${Date.now()}`,
      name: newTaskName.trim(),
    };

    setTasks((prev) => [...prev, task]);
    setNewTaskName('');
  };

  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setAssignments((prev) => prev.filter((a) => a.task.id !== id));
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const assignTasks = useCallback(() => {
    if (people.length === 0 || tasks.length === 0) return;

    setIsAssigning(true);
    setAssignments([]);

    // Simulate animation
    let step = 0;
    const maxSteps = tasks.length;
    const shuffledTasks = shuffleArray(tasks);

    const assignInterval = setInterval(() => {
      if (step >= maxSteps) {
        clearInterval(assignInterval);
        setIsAssigning(false);
        return;
      }

      const task = shuffledTasks[step];
      let assignee: Person;

      if (fairMode) {
        // Fair mode: distribute tasks as evenly as possible
        const currentAssignments = assignments.concat(
          shuffledTasks.slice(0, step).map((t, i) => ({
            task: t,
            person: people[i % people.length],
          }))
        );

        const assignmentCounts = new Map<string, number>();
        people.forEach((p) => assignmentCounts.set(p.id, 0));
        currentAssignments.forEach((a) => {
          assignmentCounts.set(a.person.id, (assignmentCounts.get(a.person.id) || 0) + 1);
        });

        // Find person with least assignments
        const sortedPeople = [...people].sort(
          (a, b) => (assignmentCounts.get(a.id) || 0) - (assignmentCounts.get(b.id) || 0)
        );
        assignee = sortedPeople[0];
      } else {
        // Random mode: completely random assignment
        assignee = people[Math.floor(Math.random() * people.length)];
      }

      setAssignments((prev) => [...prev, { task, person: assignee }]);
      step++;
    }, 300);
  }, [people, tasks, fairMode, assignments]);

  const copyAssignments = async () => {
    const text = assignments
      .map((a) => `${a.task.name}: ${a.person.name}`)
      .join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const clearAll = () => {
    setAssignments([]);
  };

  const getAssignmentsByPerson = () => {
    const byPerson = new Map<string, Assignment[]>();
    people.forEach((p) => byPerson.set(p.id, []));
    assignments.forEach((a) => {
      const current = byPerson.get(a.person.id) || [];
      byPerson.set(a.person.id, [...current, a]);
    });
    return byPerson;
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg"><Users className="w-5 h-5 text-teal-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.taskAssigner.randomTaskAssigner', 'Random Task Assigner')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.taskAssigner.fairlyDistributeTasksAmongTeam', 'Fairly distribute tasks among team members')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* People Section */}
        <div className="space-y-3">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <UserPlus className="w-4 h-4 inline mr-1" /> People ({people.length})
          </label>

          <div className="flex flex-wrap gap-2">
            {people.map((person) => (
              <div
                key={person.id}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                style={{ backgroundColor: `${person.color}20` }}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: person.color }}
                />
                <span className={isDark ? 'text-gray-200' : 'text-gray-700'}>{person.name}</span>
                <button
                  onClick={() => removePerson(person.id)}
                  className={`${isDark ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-500'}`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder={t('tools.taskAssigner.addPerson', 'Add person...')}
              value={newPersonName}
              onChange={(e) => setNewPersonName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addPerson()}
              className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 placeholder-gray-400'}`}
            />
            <button
              onClick={addPerson}
              disabled={!newPersonName.trim()}
              className={`px-4 py-2 rounded-lg ${newPersonName.trim() ? 'bg-teal-500 text-white hover:bg-teal-600' : isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'}`}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="space-y-3">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <ClipboardList className="w-4 h-4 inline mr-1" /> Tasks ({tasks.length})
          </label>

          <div className="space-y-2">
            {tasks.map((task) => {
              const assignment = assignments.find((a) => a.task.id === task.id);
              return (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                  style={assignment ? { borderLeftColor: assignment.person.color, borderLeftWidth: '4px' } : {}}
                >
                  <div className="flex items-center gap-3">
                    <span className={isDark ? 'text-gray-200' : 'text-gray-700'}>{task.name}</span>
                    {assignment && (
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: assignment.person.color }}
                      >
                        {assignment.person.name}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => removeTask(task.id)}
                    className={`${isDark ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-500'}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder={t('tools.taskAssigner.addTask', 'Add task...')}
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
              className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 placeholder-gray-400'}`}
            />
            <button
              onClick={addTask}
              disabled={!newTaskName.trim()}
              className={`px-4 py-2 rounded-lg ${newTaskName.trim() ? 'bg-teal-500 text-white hover:bg-teal-600' : isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'}`}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Fair Mode Toggle */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={fairMode}
              onChange={(e) => setFairMode(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
            />
            <div>
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.taskAssigner.fairDistributionMode', 'Fair Distribution Mode')}
              </span>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {fairMode
                  ? t('tools.taskAssigner.tasksWillBeDistributedAs', 'Tasks will be distributed as evenly as possible') : t('tools.taskAssigner.tasksWillBeAssignedCompletely', 'Tasks will be assigned completely randomly')}
              </p>
            </div>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={clearAll}
            disabled={assignments.length === 0}
            className={`px-4 py-2 rounded-lg text-sm ${assignments.length === 0 ? isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400' : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {t('tools.taskAssigner.clear', 'Clear')}
          </button>
          <button
            onClick={assignTasks}
            disabled={people.length === 0 || tasks.length === 0 || isAssigning}
            className={`flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${
              people.length === 0 || tasks.length === 0
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-teal-500 text-white hover:bg-teal-600'
            } ${isAssigning ? 'animate-pulse' : ''}`}
          >
            {isAssigning ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Shuffle className="w-5 h-5" />
            )}
            {isAssigning ? t('tools.taskAssigner.assigning', 'Assigning...') : t('tools.taskAssigner.assignTasks', 'Assign Tasks')}
          </button>
        </div>

        {/* Assignments Summary */}
        {assignments.length > 0 && (
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.taskAssigner.taskAssignments', 'Task Assignments')}
              </h4>
              <button
                onClick={copyAssignments}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    {t('tools.taskAssigner.copied', 'Copied!')}
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    {t('tools.taskAssigner.copy', 'Copy')}
                  </>
                )}
              </button>
            </div>

            <div className="space-y-4">
              {Array.from(getAssignmentsByPerson().entries()).map(([personId, personAssignments]) => {
                const person = people.find((p) => p.id === personId);
                if (!person || personAssignments.length === 0) return null;

                return (
                  <div key={personId}>
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: person.color }}
                      />
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {person.name}
                      </span>
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        ({personAssignments.length} task{personAssignments.length !== 1 ? 's' : ''})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 ml-5">
                      {personAssignments.map((assignment) => (
                        <span
                          key={assignment.task.id}
                          className={`px-3 py-1 rounded-full text-sm ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-700'}`}
                        >
                          {assignment.task.name}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Task Templates */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.taskAssigner.quickAddCommonTasks', 'Quick Add: Common Tasks')}
          </h4>
          <div className="flex flex-wrap gap-2">
            {['Wash dishes', 'Vacuum', 'Laundry', 'Groceries', 'Cook', 'Clean bathroom', 'Mow lawn', 'Walk dog'].map((taskName) => (
              <button
                key={taskName}
                onClick={() => {
                  if (!tasks.some((t) => t.name === taskName)) {
                    setTasks((prev) => [...prev, { id: `quick-${Date.now()}-${taskName}`, name: taskName }]);
                  }
                }}
                disabled={tasks.some((t) => t.name === taskName)}
                className={`px-3 py-1 rounded-full text-sm ${
                  tasks.some((t) => t.name === taskName)
                    ? isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-300 text-gray-500'
                    : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                + {taskName}
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.taskAssigner.howItWorks', 'How it works:')}</strong> Add people and tasks, then click "Assign Tasks" to randomly distribute
              the work. Enable "Fair Distribution Mode" to ensure everyone gets roughly the same number of tasks.
              Re-run anytime for a new assignment!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskAssignerTool;
