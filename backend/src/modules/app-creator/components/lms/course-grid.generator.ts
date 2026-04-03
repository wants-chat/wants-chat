/**
 * Course Grid Component Generator
 *
 * Generates course listing components for LMS applications.
 */

export interface CourseGridOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateCourseGrid(options: CourseGridOptions = {}): string {
  const { componentName = 'CourseGrid', endpoint = '/courses' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, BookOpen, Clock, Users, Star } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  category?: string;
  search?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ category, search }) => {
  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses', category, search],
    queryFn: async () => {
      let url = '${endpoint}';
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search) params.append('search', search);
      if (params.toString()) url += '?' + params.toString();
      const response = await api.get<any>(url);
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

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {courses && courses.length > 0 ? (
        courses.map((course: any) => (
          <Link
            key={course.id}
            to={\`/courses/\${course.id}\`}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
          >
            {course.thumbnail_url && (
              <img src={course.thumbnail_url} alt={course.title} className="w-full h-40 object-cover" />
            )}
            <div className="p-4">
              {course.category && (
                <span className="text-xs font-medium text-blue-600 uppercase">{course.category}</span>
              )}
              <h3 className="font-semibold text-gray-900 dark:text-white mt-1 line-clamp-2">{course.title}</h3>
              {course.instructor_name && (
                <p className="text-sm text-gray-500 mt-1">by {course.instructor_name}</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                {course.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {course.duration}
                  </span>
                )}
                {course.lessons_count && (
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {course.lessons_count} lessons
                  </span>
                )}
                {course.students_count && (
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {course.students_count}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                {course.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-medium text-gray-900 dark:text-white">{course.rating}</span>
                    {course.reviews_count && (
                      <span className="text-gray-500">({course.reviews_count})</span>
                    )}
                  </div>
                )}
                {course.price !== undefined && (
                  <span className="font-bold text-green-600">
                    {course.price === 0 ? 'Free' : \`$\${course.price}\`}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))
      ) : (
        <div className="col-span-full text-center py-12 text-gray-500">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          No courses found
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateCourseFilters(options: { componentName?: string } = {}): string {
  const componentName = options.componentName || 'CourseFilters';

  return `import React from 'react';
import { Search, Filter } from 'lucide-react';

interface ${componentName}Props {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  categories?: string[];
}

const ${componentName}: React.FC<${componentName}Props> = ({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  categories = ['All', 'Development', 'Design', 'Business', 'Marketing', 'Personal Development'],
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat === 'All' ? '' : cat)}
              className={\`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors \${
                (cat === 'All' && !category) || category === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }\`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateEnrolledCourses(options: { componentName?: string; endpoint?: string } = {}): string {
  const { componentName = 'EnrolledCourses', endpoint = '/enrollments' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, BookOpen, Play, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { data: enrollments, isLoading } = useQuery({
    queryKey: ['enrollments'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
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

  return (
    <div className="space-y-4">
      {enrollments && enrollments.length > 0 ? (
        enrollments.map((enrollment: any) => (
          <Link
            key={enrollment.id}
            to={\`/courses/\${enrollment.course_id}/learn\`}
            className="flex gap-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
          >
            {enrollment.course?.thumbnail_url && (
              <img
                src={enrollment.course.thumbnail_url}
                alt={enrollment.course.title}
                className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {enrollment.course?.title || 'Course'}
              </h3>
              {enrollment.course?.instructor_name && (
                <p className="text-sm text-gray-500">by {enrollment.course.instructor_name}</p>
              )}
              <div className="mt-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-medium text-gray-900 dark:text-white">{enrollment.progress || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: \`\${enrollment.progress || 0}%\` }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center">
              {enrollment.progress === 100 ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Play className="w-5 h-5 text-blue-600" />
                </div>
              )}
            </div>
          </Link>
        ))
      ) : (
        <div className="text-center py-12 text-gray-500">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          You haven't enrolled in any courses yet
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
