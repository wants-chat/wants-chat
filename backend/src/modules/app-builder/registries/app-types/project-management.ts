/**
 * Project Management App Type Definition
 *
 * Complete definition for project management applications like Trello, Asana, Monday.
 * High-demand app type for teams and businesses.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PROJECT_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'project-management',
  name: 'Project Management',
  category: 'business',
  description: 'Team project management with tasks, boards, timelines, and collaboration features',
  icon: 'clipboard-list',

  // ─────────────────────────────────────────────────────────────
  // DETECTION - Keywords and synonyms for matching
  // ─────────────────────────────────────────────────────────────
  keywords: [
    'project management',
    'task management',
    'project tracker',
    'kanban',
    'board',
    'tasks',
    'project',
    'team management',
    'workflow',
    'sprint',
    'agile',
    'scrum',
    'trello',
    'asana',
    'monday',
    'jira',
    'milestone',
    'gantt',
    'timeline',
    'backlog',
    'todo list',
    'task board',
    'project planning',
    'team collaboration',
  ],

  synonyms: [
    'task tracker',
    'project tracker',
    'work management',
    'team tasks',
    'project board',
    'kanban board',
    'sprint board',
    'issue tracker',
    'work tracker',
    'collaboration tool',
  ],

  negativeKeywords: [
    'ecommerce',
    'shopping',
    'store',
    'blog only',
    'portfolio',
    'landing page',
  ],

  // ─────────────────────────────────────────────────────────────
  // STRUCTURE - Sections and roles
  // ─────────────────────────────────────────────────────────────
  sections: [
    {
      id: 'frontend',
      name: 'Workspace',
      enabled: true,
      basePath: '/',
      layout: 'admin',
      description: 'Main workspace for project and task management',
    },
    {
      id: 'admin',
      name: 'Admin Panel',
      enabled: true,
      basePath: '/admin',
      requiredRole: 'admin',
      layout: 'admin',
      description: 'Workspace and team administration',
    },
  ],

  roles: [
    {
      id: 'admin',
      name: 'Workspace Admin',
      level: 100,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/dashboard',
    },
    {
      id: 'manager',
      name: 'Project Manager',
      level: 50,
      isDefault: false,
      accessibleSections: ['frontend'],
      defaultRoute: '/dashboard',
    },
    {
      id: 'member',
      name: 'Team Member',
      level: 20,
      isDefault: true,
      accessibleSections: ['frontend'],
      defaultRoute: '/dashboard',
    },
    {
      id: 'guest',
      name: 'Guest',
      level: 10,
      isDefault: false,
      accessibleSections: ['frontend'],
      defaultRoute: '/projects',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // FEATURES - Default and optional
  // ─────────────────────────────────────────────────────────────
  defaultFeatures: [
    'user-auth',
    'tasks',
    'comments',
    'file-upload',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'time-tracking',
    'reporting',
  ],

  incompatibleFeatures: [
    'shopping-cart',
    'checkout',
    'product-catalog',
  ],

  // ─────────────────────────────────────────────────────────────
  // CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'complex',
  industry: 'business',

  // ─────────────────────────────────────────────────────────────
  // TEMPLATE CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a project management app like Trello',
    'Create a task management system for teams',
    'I need a kanban board application',
    'Build a team collaboration tool with tasks and projects',
    'Create an agile project tracker with sprints',
    'I want to build a work management platform',
    'Make a task board for my team',
  ],
};
