/**
 * Teacher Component Generators
 *
 * Generates teacher-related components for education/school applications.
 * Components: TeacherProfile, TeacherClasses
 */

export interface TeacherProfileOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateTeacherProfile(options: TeacherProfileOptions = {}): string {
  const { componentName = 'TeacherProfile', endpoint = '/teachers' } = options;

  return `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, User, Mail, Phone, Calendar, Award, BookOpen, Users, Clock, Briefcase } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: teacher, isLoading } = useQuery({
    queryKey: ['teacher', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!teacher) {
    return <div className="text-center py-12 text-gray-500">Teacher not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {teacher.avatar_url ? (
            <img src={teacher.avatar_url} alt={teacher.name} className="w-32 h-32 rounded-xl object-cover" />
          ) : (
            <div className="w-32 h-32 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <User className="w-16 h-16 text-blue-600" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{teacher.name}</h1>
                <p className="text-gray-500">{teacher.title || 'Teacher'}</p>
              </div>
              {teacher.status && (
                <span className={\`px-3 py-1 rounded-full text-sm font-medium \${
                  teacher.status === 'active'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }\`}>
                  {teacher.status}
                </span>
              )}
            </div>

            {teacher.department && (
              <div className="flex items-center gap-2 mt-3 text-gray-600 dark:text-gray-400">
                <Briefcase className="w-4 h-4" />
                <span>{teacher.department}</span>
              </div>
            )}

            {/* Subjects */}
            {teacher.subjects && teacher.subjects.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {teacher.subjects.map((subject: string, i: number) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact & Info Grid */}
      <div className="grid sm:grid-cols-2 gap-6">
        {/* Contact Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h2>
          <div className="space-y-4">
            {teacher.email && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Mail className="w-5 h-5" />
                <span>{teacher.email}</span>
              </div>
            )}
            {teacher.phone && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Phone className="w-5 h-5" />
                <span>{teacher.phone}</span>
              </div>
            )}
            {teacher.office && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Briefcase className="w-5 h-5" />
                <span>Office: {teacher.office}</span>
              </div>
            )}
            {teacher.office_hours && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Clock className="w-5 h-5" />
                <span>Office Hours: {teacher.office_hours}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Statistics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="w-10 h-10 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{teacher.classes_count || 0}</p>
              <p className="text-xs text-gray-500">Classes</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="w-10 h-10 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{teacher.students_count || 0}</p>
              <p className="text-xs text-gray-500">Students</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="w-10 h-10 mx-auto bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-2">
                <Calendar className="w-5 h-5 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{teacher.years_experience || 0}</p>
              <p className="text-xs text-gray-500">Years Exp.</p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="w-10 h-10 mx-auto bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-2">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{teacher.rating || 'N/A'}</p>
              <p className="text-xs text-gray-500">Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      {teacher.bio && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">About</h2>
          <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">{teacher.bio}</p>
        </div>
      )}

      {/* Education & Qualifications */}
      {teacher.qualifications && teacher.qualifications.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Qualifications</h2>
          <div className="space-y-4">
            {teacher.qualifications.map((qual: any, index: number) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{qual.degree || qual}</p>
                  {qual.institution && <p className="text-sm text-gray-500">{qual.institution}</p>}
                  {qual.year && <p className="text-sm text-gray-400">{qual.year}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Classes */}
      {teacher.classes && teacher.classes.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Current Classes</h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {teacher.classes.map((cls: any) => (
              <Link
                key={cls.id}
                to={\`/classes/\${cls.id}\`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{cls.name}</p>
                    <p className="text-sm text-gray-500">{cls.schedule || cls.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">{cls.students_count || 0} students</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export interface TeacherClassesOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateTeacherClasses(options: TeacherClassesOptions = {}): string {
  const { componentName = 'TeacherClasses', endpoint = '/classes' } = options;

  return `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, BookOpen, Users, Clock, Calendar, ChevronRight, MapPin } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  teacherId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ teacherId: propTeacherId }) => {
  const { id } = useParams<{ id: string }>();
  const teacherId = propTeacherId || id;

  const { data: classes, isLoading } = useQuery({
    queryKey: ['teacher-classes', teacherId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}?teacher_id=\${teacherId}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const getDayColor = (day: string) => {
    const colors: Record<string, string> = {
      monday: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      tuesday: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      wednesday: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      thursday: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      friday: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      saturday: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      sunday: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    };
    return colors[day?.toLowerCase()] || colors.monday;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Classes</h2>
        <span className="text-sm text-gray-500">{classes?.length || 0} classes</span>
      </div>

      {classes && classes.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls: any) => (
            <Link
              key={cls.id}
              to={\`/classes/\${cls.id}\`}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>

              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{cls.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{cls.subject || cls.code}</p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Users className="w-4 h-4" />
                  <span>{cls.students_count || 0} students</span>
                </div>
                {cls.schedule && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{cls.schedule}</span>
                  </div>
                )}
                {cls.room && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span>Room {cls.room}</span>
                  </div>
                )}
              </div>

              {cls.days && cls.days.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-4">
                  {cls.days.map((day: string, i: number) => (
                    <span
                      key={i}
                      className={\`px-2 py-0.5 rounded text-xs font-medium \${getDayColor(day)}\`}
                    >
                      {day.slice(0, 3)}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <BookOpen className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500">No classes assigned</p>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
