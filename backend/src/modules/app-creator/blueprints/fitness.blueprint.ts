import { Blueprint } from './blueprint.interface';

/**
 * Fitness/Gym Blueprint
 *
 * Defines the structure for a fitness/gym application:
 * - Memberships
 * - Classes/Workouts
 * - Trainers
 * - Workout tracking
 * - Progress monitoring
 */
export const fitnessBlueprint: Blueprint = {
  appType: 'fitness',
  description: 'Fitness app with memberships, classes, trainers, and workout tracking',

  coreEntities: ['member', 'trainer', 'class', 'membership', 'workout', 'exercise', 'progress'],

  commonFields: {
    timestamps: true,
    softDelete: true,
    userOwnership: true,
  },

  pages: [
    // Home/Landing
    {
      path: '/',
      name: 'Home',
      layout: 'landing',
      sections: [
        {
          id: 'hero',
          component: 'hero',
          position: 'full',
          props: {
            title: 'Transform Your Body',
            subtitle: 'Join our fitness community and achieve your goals',
            primaryCTA: 'Join Now',
            primaryCTALink: '/membership',
            secondaryCTA: 'View Classes',
            secondaryCTALink: '/classes',
          },
        },
        {
          id: 'membership-plans',
          component: 'membership-plans',
          entity: 'membership',
          position: 'main',
          props: {
            title: 'Membership Plans',
          },
        },
        {
          id: 'featured-classes',
          component: 'class-grid',
          entity: 'class',
          position: 'main',
          props: {
            title: 'Popular Classes',
            limit: 6,
            featured: true,
          },
        },
        {
          id: 'trainers',
          component: 'trainer-grid',
          entity: 'trainer',
          position: 'main',
          props: {
            title: 'Our Trainers',
            limit: 4,
          },
        },
      ],
    },
    // Classes
    {
      path: '/classes',
      name: 'Classes',
      layout: 'two-column',
      sections: [
        {
          id: 'class-filters',
          component: 'class-filters',
          position: 'sidebar',
        },
        {
          id: 'class-schedule',
          component: 'class-schedule',
          entity: 'class',
          position: 'main',
        },
      ],
    },
    // Class Detail
    {
      path: '/classes/:id',
      name: 'Class Detail',
      layout: 'single-column',
      sections: [
        {
          id: 'class-detail',
          component: 'class-detail',
          entity: 'class',
          position: 'main',
        },
        {
          id: 'book-class',
          component: 'book-class-form',
          position: 'main',
        },
      ],
    },
    // Trainers
    {
      path: '/trainers',
      name: 'Trainers',
      layout: 'single-column',
      sections: [
        {
          id: 'trainers-grid',
          component: 'trainer-grid',
          entity: 'trainer',
          position: 'main',
        },
      ],
    },
    // Trainer Profile
    {
      path: '/trainers/:id',
      name: 'Trainer Profile',
      layout: 'single-column',
      sections: [
        {
          id: 'trainer-profile',
          component: 'trainer-profile',
          entity: 'trainer',
          position: 'main',
        },
        {
          id: 'trainer-classes',
          component: 'class-grid',
          entity: 'class',
          position: 'main',
          props: {
            title: 'Classes by this Trainer',
          },
        },
      ],
    },
    // Membership
    {
      path: '/membership',
      name: 'Membership',
      layout: 'single-column',
      sections: [
        {
          id: 'membership-plans',
          component: 'membership-plans',
          entity: 'membership',
          position: 'main',
        },
      ],
    },
    // Member Dashboard
    {
      path: '/dashboard',
      name: 'Dashboard',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
          props: {
            links: [
              { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
              { label: 'My Workouts', path: '/dashboard/workouts', icon: 'Dumbbell' },
              { label: 'My Classes', path: '/dashboard/classes', icon: 'Calendar' },
              { label: 'Progress', path: '/dashboard/progress', icon: 'TrendingUp' },
              { label: 'Membership', path: '/dashboard/membership', icon: 'CreditCard' },
            ],
          },
        },
        {
          id: 'workout-stats',
          component: 'workout-stats',
          position: 'main',
        },
        {
          id: 'upcoming-classes',
          component: 'upcoming-classes',
          entity: 'class',
          position: 'main',
          props: {
            title: 'Upcoming Classes',
          },
        },
        {
          id: 'recent-workouts',
          component: 'workout-list',
          entity: 'workout',
          position: 'main',
          props: {
            title: 'Recent Workouts',
            limit: 5,
          },
        },
      ],
    },
    // My Workouts
    {
      path: '/dashboard/workouts',
      name: 'My Workouts',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'workout-list',
          component: 'workout-list',
          entity: 'workout',
          position: 'main',
          props: {
            title: 'My Workouts',
            showCreate: true,
          },
        },
      ],
    },
    // Log Workout
    {
      path: '/dashboard/workouts/log',
      name: 'Log Workout',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'workout-form',
          component: 'workout-form',
          entity: 'workout',
          position: 'main',
        },
      ],
    },
    // Progress
    {
      path: '/dashboard/progress',
      name: 'Progress',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'progress-charts',
          component: 'progress-charts',
          entity: 'progress',
          position: 'main',
        },
        {
          id: 'progress-log',
          component: 'progress-log',
          entity: 'progress',
          position: 'main',
        },
      ],
    },
  ],

  endpoints: [
    // Classes
    { method: 'GET', path: '/classes', entity: 'class', operation: 'list' },
    { method: 'GET', path: '/classes/:id', entity: 'class', operation: 'get' },
    { method: 'POST', path: '/classes/:id/book', entity: 'class', operation: 'custom', requiresAuth: true },

    // Trainers
    { method: 'GET', path: '/trainers', entity: 'trainer', operation: 'list' },
    { method: 'GET', path: '/trainers/:id', entity: 'trainer', operation: 'get' },
    { method: 'GET', path: '/trainers/:id/classes', entity: 'class', operation: 'list' },

    // Memberships
    { method: 'GET', path: '/memberships', entity: 'membership', operation: 'list' },
    { method: 'POST', path: '/memberships/subscribe', entity: 'membership', operation: 'create', requiresAuth: true },

    // Workouts
    { method: 'GET', path: '/workouts', entity: 'workout', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/workouts/:id', entity: 'workout', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/workouts', entity: 'workout', operation: 'create', requiresAuth: true },

    // Exercises
    { method: 'GET', path: '/exercises', entity: 'exercise', operation: 'list' },

    // Progress
    { method: 'GET', path: '/progress', entity: 'progress', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/progress', entity: 'progress', operation: 'create', requiresAuth: true },
  ],

  entityConfig: {
    member: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'date_of_birth', type: 'date' },
        { name: 'gender', type: 'enum' },
        { name: 'avatar_url', type: 'image' },
        { name: 'height', type: 'decimal' },
        { name: 'weight', type: 'decimal' },
        { name: 'fitness_goals', type: 'json' },
        { name: 'health_conditions', type: 'json' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'user' },
        { type: 'hasMany', target: 'workout' },
        { type: 'hasMany', target: 'progress' },
      ],
    },
    trainer: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'avatar_url', type: 'image' },
        { name: 'bio', type: 'text' },
        { name: 'specializations', type: 'json' },
        { name: 'certifications', type: 'json' },
        { name: 'experience_years', type: 'integer' },
        { name: 'rating', type: 'decimal' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'class' },
      ],
    },
    class: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'type', type: 'enum', required: true },
        { name: 'difficulty', type: 'enum' },
        { name: 'duration_minutes', type: 'integer', required: true },
        { name: 'max_participants', type: 'integer' },
        { name: 'current_participants', type: 'integer' },
        { name: 'schedule', type: 'json' },
        { name: 'image_url', type: 'image' },
        { name: 'calories_burn', type: 'integer' },
        { name: 'equipment_needed', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'trainer' },
      ],
    },
    membership: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'duration_months', type: 'integer', required: true },
        { name: 'features', type: 'json' },
        { name: 'class_access', type: 'json' },
        { name: 'trainer_sessions', type: 'integer' },
        { name: 'is_popular', type: 'boolean' },
      ],
      relationships: [],
    },
    workout: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'date', type: 'date', required: true },
        { name: 'duration_minutes', type: 'integer' },
        { name: 'calories_burned', type: 'integer' },
        { name: 'exercises', type: 'json', required: true },
        { name: 'notes', type: 'text' },
        { name: 'mood', type: 'enum' },
        { name: 'intensity', type: 'enum' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'member' },
        { type: 'belongsTo', target: 'user' },
      ],
    },
    exercise: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'muscle_group', type: 'enum' },
        { name: 'equipment', type: 'string' },
        { name: 'instructions', type: 'json' },
        { name: 'image_url', type: 'image' },
        { name: 'video_url', type: 'url' },
      ],
      relationships: [],
    },
    progress: {
      defaultFields: [
        { name: 'date', type: 'date', required: true },
        { name: 'weight', type: 'decimal' },
        { name: 'body_fat', type: 'decimal' },
        { name: 'measurements', type: 'json' },
        { name: 'photos', type: 'json' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'member' },
        { type: 'belongsTo', target: 'user' },
      ],
    },
  },
};

export default fitnessBlueprint;
