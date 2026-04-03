/**
 * Lists and Timelines Component Generators
 * For displaying lists, timelines, and scheduled items
 */

export interface ListsOptions {
  primaryColor?: string;
  secondaryColor?: string;
}

/**
 * Generate Case Timeline Lawfirm Component
 */
export function generateCaseTimelineLawfirm(options: ListsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface CaseTimelineLawfirmProps {
      events: Array<{
        id: string;
        date: string;
        type: 'filing' | 'hearing' | 'meeting' | 'deadline' | 'document' | 'note';
        title: string;
        description: string;
        user?: string;
        attachments?: string[];
      }>;
    }

    const CaseTimelineLawfirm: React.FC<CaseTimelineLawfirmProps> = ({ events }) => {
      const getIcon = (type: string) => {
        switch (type) {
          case 'filing': return '📄';
          case 'hearing': return '⚖️';
          case 'meeting': return '👥';
          case 'deadline': return '⏰';
          case 'document': return '📋';
          case 'note': return '📝';
          default: return '•';
        }
      };

      const typeColors = {
        filing: 'bg-blue-100 text-blue-800',
        hearing: 'bg-purple-100 text-purple-800',
        meeting: 'bg-green-100 text-green-800',
        deadline: 'bg-red-100 text-red-800',
        document: 'bg-yellow-100 text-yellow-800',
        note: 'bg-gray-100 text-gray-800',
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="font-semibold mb-4">Case Timeline</h3>
          <div className="space-y-4">
            {events.map((event, index) => (
              <div key={event.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                    {getIcon(event.type)}
                  </div>
                  {index < events.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-200 mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={\`px-2 py-0.5 rounded text-xs font-medium \${typeColors[event.type]}\`}>
                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </span>
                    <span className="text-sm text-gray-500">{event.date}</span>
                  </div>
                  <p className="font-medium">{event.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                  {event.user && (
                    <p className="text-xs text-gray-500 mt-2">By: {event.user}</p>
                  )}
                  {event.attachments && event.attachments.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {event.attachments.map((att, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-gray-100 rounded">
                          📎 {att}
                        </span>
                      ))}
                    </div>
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
 * Generate Deadline List Accounting Component
 */
export function generateDeadlineListAccounting(options: ListsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface DeadlineListAccountingProps {
      deadlines: Array<{
        id: string;
        title: string;
        client: string;
        dueDate: string;
        type: string;
        priority: 'urgent' | 'high' | 'normal' | 'low';
        status: 'pending' | 'in-progress' | 'completed';
        assignee: string;
      }>;
      onSelect?: (id: string) => void;
    }

    const DeadlineListAccounting: React.FC<DeadlineListAccountingProps> = ({ deadlines, onSelect }) => {
      const priorityColors = {
        urgent: 'border-l-4 border-l-red-500',
        high: 'border-l-4 border-l-orange-500',
        normal: 'border-l-4 border-l-blue-500',
        low: 'border-l-4 border-l-green-500',
      };

      const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        'in-progress': 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
      };

      const getDaysUntil = (date: string) => {
        const diff = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (diff < 0) return { text: \`\${Math.abs(diff)} days overdue\`, color: 'text-red-600' };
        if (diff === 0) return { text: 'Due today', color: 'text-orange-600' };
        if (diff === 1) return { text: 'Due tomorrow', color: 'text-yellow-600' };
        return { text: \`\${diff} days left\`, color: 'text-gray-600' };
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-lg">Upcoming Deadlines</h3>
          </div>
          <div className="divide-y">
            {deadlines.map((deadline) => {
              const daysInfo = getDaysUntil(deadline.dueDate);
              return (
                <div
                  key={deadline.id}
                  className={\`p-4 hover:bg-gray-50 cursor-pointer \${priorityColors[deadline.priority]}\`}
                  onClick={() => onSelect?.(deadline.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{deadline.title}</h4>
                      <p className="text-sm text-gray-500">{deadline.client}</p>
                    </div>
                    <span className={\`px-2 py-1 rounded-full text-xs font-medium \${statusColors[deadline.status]}\`}>
                      {deadline.status.replace('-', ' ').replace(/\\b\\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4 text-gray-600">
                      <span>📋 {deadline.type}</span>
                      <span>👤 {deadline.assignee}</span>
                    </div>
                    <span className={\`font-medium \${daysInfo.color}\`}>{daysInfo.text}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Deadline List Lawfirm Component
 */
export function generateDeadlineListLawfirm(options: ListsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface DeadlineListLawfirmProps {
      deadlines: Array<{
        id: string;
        title: string;
        caseNumber: string;
        caseName: string;
        dueDate: string;
        type: 'court' | 'filing' | 'discovery' | 'meeting' | 'other';
        priority: 'critical' | 'high' | 'normal';
        attorney: string;
      }>;
      onSelect?: (id: string) => void;
    }

    const DeadlineListLawfirm: React.FC<DeadlineListLawfirmProps> = ({ deadlines, onSelect }) => {
      const typeIcons = {
        court: '⚖️',
        filing: '📄',
        discovery: '🔍',
        meeting: '👥',
        other: '📋',
      };

      const priorityColors = {
        critical: 'bg-red-100 text-red-800 border-red-200',
        high: 'bg-orange-100 text-orange-800 border-orange-200',
        normal: 'bg-blue-100 text-blue-800 border-blue-200',
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-lg">Legal Deadlines</h3>
          </div>
          <div className="divide-y">
            {deadlines.map((deadline) => (
              <div
                key={deadline.id}
                className="p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelect?.(deadline.id)}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{typeIcons[deadline.type]}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">{deadline.title}</h4>
                      <span className={\`px-2 py-1 rounded border text-xs font-medium \${priorityColors[deadline.priority]}\`}>
                        {deadline.priority.charAt(0).toUpperCase() + deadline.priority.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Case: {deadline.caseNumber} - {deadline.caseName}
                    </p>
                    <div className="flex items-center justify-between mt-2 text-sm">
                      <span className="text-gray-600">👤 {deadline.attorney}</span>
                      <span className="font-medium" style={{ color: '${primaryColor}' }}>
                        📅 {deadline.dueDate}
                      </span>
                    </div>
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

/**
 * Generate Estimate List Pending Component
 */
export function generateEstimateListPending(options: ListsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface EstimateListPendingProps {
      estimates: Array<{
        id: string;
        estimateNumber: string;
        customer: string;
        description: string;
        amount: number;
        createdDate: string;
        expiryDate: string;
        daysRemaining: number;
      }>;
      onSelect?: (id: string) => void;
      onConvert?: (id: string) => void;
    }

    const EstimateListPending: React.FC<EstimateListPendingProps> = ({ estimates, onSelect, onConvert }) => {
      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-lg">Pending Estimates</h3>
          </div>
          <div className="divide-y">
            {estimates.map((estimate) => (
              <div
                key={estimate.id}
                className="p-4 hover:bg-gray-50"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="cursor-pointer" onClick={() => onSelect?.(estimate.id)}>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{estimate.estimateNumber}</h4>
                      {estimate.daysRemaining <= 3 && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                          Expiring soon
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{estimate.customer}</p>
                  </div>
                  <p className="text-lg font-bold" style={{ color: '${primaryColor}' }}>
                    \${estimate.amount.toLocaleString()}
                  </p>
                </div>
                <p className="text-sm text-gray-600 mb-2 line-clamp-1">{estimate.description}</p>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Created: {estimate.createdDate} • Expires: {estimate.expiryDate}
                  </div>
                  <button
                    onClick={() => onConvert?.(estimate.id)}
                    className="px-3 py-1 text-sm text-white rounded hover:opacity-90"
                    style={{ backgroundColor: '${primaryColor}' }}
                  >
                    Convert to Invoice
                  </button>
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
 * Generate Appointment List Today Rehab Component
 */
export function generateAppointmentListTodayRehab(options: ListsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface AppointmentListTodayRehabProps {
      appointments: Array<{
        id: string;
        time: string;
        patient: string;
        therapist: string;
        type: string;
        duration: string;
        room: string;
        status: 'scheduled' | 'checked-in' | 'in-progress' | 'completed' | 'no-show';
      }>;
      onSelect?: (id: string) => void;
      onCheckIn?: (id: string) => void;
    }

    const AppointmentListTodayRehab: React.FC<AppointmentListTodayRehabProps> = ({ appointments, onSelect, onCheckIn }) => {
      const statusColors = {
        scheduled: 'bg-blue-100 text-blue-800',
        'checked-in': 'bg-yellow-100 text-yellow-800',
        'in-progress': 'bg-purple-100 text-purple-800',
        completed: 'bg-green-100 text-green-800',
        'no-show': 'bg-red-100 text-red-800',
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-lg">Today's Appointments</h3>
          </div>
          <div className="divide-y">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="p-4 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelect?.(apt.id)}>
                    <span className="text-xl font-bold" style={{ color: '${primaryColor}' }}>{apt.time}</span>
                    <div>
                      <p className="font-medium">{apt.patient}</p>
                      <p className="text-sm text-gray-500">{apt.type} • {apt.duration}</p>
                    </div>
                  </div>
                  <span className={\`px-2 py-1 rounded-full text-xs font-medium \${statusColors[apt.status]}\`}>
                    {apt.status.replace('-', ' ').replace(/\\b\\w/g, l => l.toUpperCase())}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="text-gray-600">
                    <span>👤 {apt.therapist}</span>
                    <span className="ml-4">📍 {apt.room}</span>
                  </div>
                  {apt.status === 'scheduled' && (
                    <button
                      onClick={() => onCheckIn?.(apt.id)}
                      className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                    >
                      Check In
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
 * Generate Lesson List Today Driving Component
 */
export function generateLessonListTodayDriving(options: ListsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface LessonListTodayDrivingProps {
      lessons: Array<{
        id: string;
        time: string;
        student: string;
        instructor: string;
        type: string;
        vehicle: string;
        duration: string;
        pickupLocation: string;
        status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
      }>;
      onSelect?: (id: string) => void;
    }

    const LessonListTodayDriving: React.FC<LessonListTodayDrivingProps> = ({ lessons, onSelect }) => {
      const statusColors = {
        scheduled: 'bg-blue-100 text-blue-800',
        'in-progress': 'bg-yellow-100 text-yellow-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-lg">Today's Driving Lessons</h3>
          </div>
          <div className="divide-y">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelect?.(lesson.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold" style={{ color: '${primaryColor}' }}>{lesson.time}</span>
                    <div>
                      <p className="font-medium">{lesson.student}</p>
                      <p className="text-sm text-gray-500">{lesson.type} • {lesson.duration}</p>
                    </div>
                  </div>
                  <span className={\`px-2 py-1 rounded-full text-xs font-medium \${statusColors[lesson.status]}\`}>
                    {lesson.status.replace('-', ' ').replace(/\\b\\w/g, l => l.toUpperCase())}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>👤 {lesson.instructor}</span>
                  <span>🚗 {lesson.vehicle}</span>
                  <span>📍 {lesson.pickupLocation}</span>
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
 * Generate Flight List Today Component
 */
export function generateFlightListToday(options: ListsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface FlightListTodayProps {
      flights: Array<{
        id: string;
        flightNumber: string;
        origin: string;
        destination: string;
        departureTime: string;
        arrivalTime: string;
        aircraft: string;
        pilot: string;
        passengers: number;
        status: 'scheduled' | 'boarding' | 'departed' | 'in-flight' | 'landed' | 'cancelled' | 'delayed';
      }>;
      onSelect?: (id: string) => void;
    }

    const FlightListToday: React.FC<FlightListTodayProps> = ({ flights, onSelect }) => {
      const statusColors = {
        scheduled: 'bg-blue-100 text-blue-800',
        boarding: 'bg-yellow-100 text-yellow-800',
        departed: 'bg-purple-100 text-purple-800',
        'in-flight': 'bg-indigo-100 text-indigo-800',
        landed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
        delayed: 'bg-orange-100 text-orange-800',
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-lg">Today's Flights</h3>
          </div>
          <div className="divide-y">
            {flights.map((flight) => (
              <div
                key={flight.id}
                className="p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelect?.(flight.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✈️</span>
                    <div>
                      <p className="font-medium">{flight.flightNumber}</p>
                      <p className="text-sm text-gray-500">{flight.aircraft}</p>
                    </div>
                  </div>
                  <span className={\`px-2 py-1 rounded-full text-xs font-medium \${statusColors[flight.status]}\`}>
                    {flight.status.replace('-', ' ').replace(/\\b\\w/g, l => l.toUpperCase())}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{flight.origin}</span>
                  <span className="flex-1 border-t border-dashed relative">
                    <span className="absolute left-1/2 -translate-x-1/2 -top-2 text-gray-400 text-xs">
                      {flight.departureTime} → {flight.arrivalTime}
                    </span>
                  </span>
                  <span className="font-medium">{flight.destination}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>👤 {flight.pilot}</span>
                  <span>👥 {flight.passengers} passengers</span>
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
 * Generate Exam List Today Component
 */
export function generateExamListToday(options: ListsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface ExamListTodayProps {
      exams: Array<{
        id: string;
        time: string;
        patient: string;
        type: string;
        doctor: string;
        room: string;
        duration: string;
        status: 'scheduled' | 'waiting' | 'in-progress' | 'completed';
        notes?: string;
      }>;
      onSelect?: (id: string) => void;
    }

    const ExamListToday: React.FC<ExamListTodayProps> = ({ exams, onSelect }) => {
      const statusColors = {
        scheduled: 'bg-blue-100 text-blue-800',
        waiting: 'bg-yellow-100 text-yellow-800',
        'in-progress': 'bg-purple-100 text-purple-800',
        completed: 'bg-green-100 text-green-800',
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-lg">Today's Examinations</h3>
          </div>
          <div className="divide-y">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelect?.(exam.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold" style={{ color: '${primaryColor}' }}>{exam.time}</span>
                    <div>
                      <p className="font-medium">{exam.patient}</p>
                      <p className="text-sm text-gray-500">{exam.type} • {exam.duration}</p>
                    </div>
                  </div>
                  <span className={\`px-2 py-1 rounded-full text-xs font-medium \${statusColors[exam.status]}\`}>
                    {exam.status.replace('-', ' ').replace(/\\b\\w/g, l => l.toUpperCase())}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>👨‍⚕️ {exam.doctor}</span>
                  <span>📍 {exam.room}</span>
                </div>
                {exam.notes && (
                  <p className="text-xs text-gray-500 mt-2 italic">{exam.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    };
  `;
}
