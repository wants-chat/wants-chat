/**
 * Calendar Component Generators
 * For scheduling, calendars, and time-based displays
 */

export interface CalendarsOptions {
  primaryColor?: string;
  secondaryColor?: string;
}

/**
 * Generate Calendar Accounting Component
 */
export function generateCalendarAccounting(options: CalendarsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface CalendarAccountingProps {
      events: Array<{
        id: string;
        date: string;
        type: 'deadline' | 'meeting' | 'filing' | 'payment';
        title: string;
        client?: string;
        priority: 'high' | 'normal' | 'low';
      }>;
      onSelectDate?: (date: string) => void;
      onSelectEvent?: (id: string) => void;
    }

    const CalendarAccounting: React.FC<CalendarAccountingProps> = ({ events, onSelectDate, onSelectEvent }) => {
      const [currentMonth, setCurrentMonth] = React.useState(new Date());

      const typeColors = {
        deadline: 'bg-red-500',
        meeting: 'bg-blue-500',
        filing: 'bg-green-500',
        payment: 'bg-yellow-500',
      };

      const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        return { firstDay, daysInMonth };
      };

      const { firstDay, daysInMonth } = getDaysInMonth(currentMonth);
      const monthYear = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

      const getEventsForDay = (day: number) => {
        const dateStr = \`\${currentMonth.getFullYear()}-\${String(currentMonth.getMonth() + 1).padStart(2, '0')}-\${String(day).padStart(2, '0')}\`;
        return events.filter(e => e.date === dateStr);
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-2 hover:bg-gray-100 rounded">
              ←
            </button>
            <h3 className="font-semibold text-lg">{monthYear}</h3>
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-2 hover:bg-gray-100 rounded">
              →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={\`empty-\${i}\`} className="h-20" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDay(day);
              return (
                <div
                  key={day}
                  className="h-20 border rounded p-1 hover:bg-gray-50 cursor-pointer"
                  onClick={() => onSelectDate?.(\`\${currentMonth.getFullYear()}-\${String(currentMonth.getMonth() + 1).padStart(2, '0')}-\${String(day).padStart(2, '0')}\`)}
                >
                  <p className="text-sm font-medium">{day}</p>
                  <div className="space-y-0.5 mt-1">
                    {dayEvents.slice(0, 2).map(event => (
                      <div
                        key={event.id}
                        className={\`text-xs text-white px-1 rounded truncate \${typeColors[event.type]}\`}
                        onClick={(e) => { e.stopPropagation(); onSelectEvent?.(event.id); }}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <p className="text-xs text-gray-500">+{dayEvents.length - 2} more</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-4 mt-4 pt-4 border-t text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500" /> Deadline</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500" /> Meeting</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500" /> Filing</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-500" /> Payment</span>
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Event Calendar Club Component
 */
export function generateEventCalendarClub(options: CalendarsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface EventCalendarClubProps {
      events: Array<{
        id: string;
        date: string;
        time: string;
        title: string;
        type: 'social' | 'sports' | 'meeting' | 'class' | 'tournament';
        location: string;
        spotsAvailable?: number;
      }>;
      onSelectEvent?: (id: string) => void;
      onRegister?: (id: string) => void;
    }

    const EventCalendarClub: React.FC<EventCalendarClubProps> = ({ events, onSelectEvent, onRegister }) => {
      const typeColors = {
        social: 'bg-purple-100 text-purple-800 border-purple-200',
        sports: 'bg-green-100 text-green-800 border-green-200',
        meeting: 'bg-blue-100 text-blue-800 border-blue-200',
        class: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        tournament: 'bg-red-100 text-red-800 border-red-200',
      };

      const groupedEvents = events.reduce((acc, event) => {
        if (!acc[event.date]) acc[event.date] = [];
        acc[event.date].push(event);
        return acc;
      }, {} as Record<string, typeof events>);

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-lg">Club Events</h3>
          </div>
          <div className="divide-y">
            {Object.entries(groupedEvents).map(([date, dateEvents]) => (
              <div key={date} className="p-4">
                <p className="text-sm font-medium text-gray-500 mb-3">{date}</p>
                <div className="space-y-3">
                  {dateEvents.map(event => (
                    <div
                      key={event.id}
                      className={\`p-3 rounded-lg border cursor-pointer hover:shadow-sm \${typeColors[event.type]}\`}
                      onClick={() => onSelectEvent?.(event.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <div className="flex items-center gap-3 mt-1 text-sm opacity-75">
                            <span>🕐 {event.time}</span>
                            <span>📍 {event.location}</span>
                          </div>
                        </div>
                        {event.spotsAvailable !== undefined && event.spotsAvailable > 0 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onRegister?.(event.id); }}
                            className="px-3 py-1 text-xs bg-white rounded border hover:bg-gray-50"
                          >
                            Register ({event.spotsAvailable} spots)
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
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
 * Generate Exam Calendar Component
 */
export function generateExamCalendar(options: CalendarsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface ExamCalendarProps {
      exams: Array<{
        id: string;
        date: string;
        time: string;
        subject: string;
        room: string;
        duration: string;
        type: 'midterm' | 'final' | 'quiz' | 'practical';
      }>;
      onSelectExam?: (id: string) => void;
    }

    const ExamCalendar: React.FC<ExamCalendarProps> = ({ exams, onSelectExam }) => {
      const typeColors = {
        midterm: 'bg-blue-100 text-blue-800',
        final: 'bg-red-100 text-red-800',
        quiz: 'bg-green-100 text-green-800',
        practical: 'bg-purple-100 text-purple-800',
      };

      const sortedExams = [...exams].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-lg">Exam Schedule</h3>
          </div>
          <div className="divide-y">
            {sortedExams.map(exam => (
              <div
                key={exam.id}
                className="p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelectExam?.(exam.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <p className="text-2xl font-bold" style={{ color: '${primaryColor}' }}>
                        {new Date(exam.date).getDate()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(exam.date).toLocaleString('default', { month: 'short' })}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">{exam.subject}</p>
                      <p className="text-sm text-gray-500">{exam.time} • {exam.duration}</p>
                    </div>
                  </div>
                  <span className={\`px-2 py-1 rounded text-xs font-medium \${typeColors[exam.type]}\`}>
                    {exam.type.charAt(0).toUpperCase() + exam.type.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 ml-16">📍 {exam.room}</p>
              </div>
            ))}
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Lesson Calendar Golf Component
 */
export function generateLessonCalendarGolf(options: CalendarsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface LessonCalendarGolfProps {
      lessons: Array<{
        id: string;
        date: string;
        time: string;
        instructor: string;
        student: string;
        type: 'private' | 'group' | 'clinic';
        duration: string;
        location: string;
        status: 'scheduled' | 'completed' | 'cancelled';
      }>;
      onSelectLesson?: (id: string) => void;
    }

    const LessonCalendarGolf: React.FC<LessonCalendarGolfProps> = ({ lessons, onSelectLesson }) => {
      const typeColors = {
        private: 'bg-blue-100 text-blue-800',
        group: 'bg-green-100 text-green-800',
        clinic: 'bg-purple-100 text-purple-800',
      };

      const statusColors = {
        scheduled: 'text-blue-600',
        completed: 'text-green-600',
        cancelled: 'text-red-600',
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-lg">Golf Lessons</h3>
          </div>
          <div className="divide-y">
            {lessons.map(lesson => (
              <div
                key={lesson.id}
                className="p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelectLesson?.(lesson.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">⛳</span>
                      <span className="font-medium">{lesson.student}</span>
                      <span className={\`px-2 py-0.5 rounded text-xs font-medium \${typeColors[lesson.type]}\`}>
                        {lesson.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 ml-7">with {lesson.instructor}</p>
                  </div>
                  <span className={\`text-sm font-medium \${statusColors[lesson.status]}\`}>
                    {lesson.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 ml-7">
                  <span>📅 {lesson.date}</span>
                  <span>🕐 {lesson.time}</span>
                  <span>⏱️ {lesson.duration}</span>
                  <span>📍 {lesson.location}</span>
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
 * Generate Lesson Calendar Music Component
 */
export function generateLessonCalendarMusic(options: CalendarsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface LessonCalendarMusicProps {
      lessons: Array<{
        id: string;
        date: string;
        time: string;
        instructor: string;
        student: string;
        instrument: string;
        duration: string;
        room: string;
        status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
      }>;
      onSelectLesson?: (id: string) => void;
    }

    const LessonCalendarMusic: React.FC<LessonCalendarMusicProps> = ({ lessons, onSelectLesson }) => {
      const instrumentIcons: Record<string, string> = {
        piano: '🎹',
        guitar: '🎸',
        violin: '🎻',
        drums: '🥁',
        voice: '🎤',
        default: '🎵',
      };

      const statusColors = {
        scheduled: 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
        rescheduled: 'bg-yellow-100 text-yellow-800',
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-lg">Music Lessons</h3>
          </div>
          <div className="divide-y">
            {lessons.map(lesson => (
              <div
                key={lesson.id}
                className="p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelectLesson?.(lesson.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{instrumentIcons[lesson.instrument.toLowerCase()] || instrumentIcons.default}</span>
                      <span className="font-medium">{lesson.student}</span>
                      <span className="text-sm text-gray-500">({lesson.instrument})</span>
                    </div>
                    <p className="text-sm text-gray-500 ml-7">with {lesson.instructor}</p>
                  </div>
                  <span className={\`px-2 py-1 rounded text-xs font-medium \${statusColors[lesson.status]}\`}>
                    {lesson.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 ml-7">
                  <span>📅 {lesson.date}</span>
                  <span>🕐 {lesson.time}</span>
                  <span>⏱️ {lesson.duration}</span>
                  <span>📍 {lesson.room}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    };
  `;
}
