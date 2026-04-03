/**
 * Process Improvement App Type Definition
 *
 * Complete definition for process improvement applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PROCESS_IMPROVEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'process-improvement',
  name: 'Process Improvement',
  category: 'services',
  description: 'Process Improvement platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "process improvement",
      "process",
      "improvement",
      "process software",
      "process app",
      "process platform",
      "process system",
      "process management",
      "services process"
  ],

  synonyms: [
      "Process Improvement platform",
      "Process Improvement software",
      "Process Improvement system",
      "process solution",
      "process service"
  ],

  negativeKeywords: ['blog', 'portfolio'],

  sections: [
      {
          "id": "frontend",
          "name": "Public Portal",
          "enabled": true,
          "basePath": "/",
          "layout": "public",
          "description": "Public-facing interface"
      },
      {
          "id": "admin",
          "name": "Admin Dashboard",
          "enabled": true,
          "basePath": "/admin",
          "requiredRole": "staff",
          "layout": "admin",
          "description": "Administrative interface"
      }
  ],

  roles: [
      {
          "id": "admin",
          "name": "Administrator",
          "level": 100,
          "isDefault": false,
          "accessibleSections": [
              "frontend",
              "admin"
          ],
          "defaultRoute": "/admin/dashboard"
      },
      {
          "id": "staff",
          "name": "Staff",
          "level": 40,
          "isDefault": false,
          "accessibleSections": [
              "admin"
          ],
          "defaultRoute": "/admin/dashboard"
      },
      {
          "id": "user",
          "name": "User",
          "level": 10,
          "isDefault": true,
          "accessibleSections": [
              "frontend"
          ],
          "defaultRoute": "/"
      }
  ],

  defaultFeatures: [
      "user-auth",
      "appointments",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "reviews",
      "messaging",
      "documents",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a process improvement platform",
      "Create a process improvement app",
      "I need a process improvement management system",
      "Build a process improvement solution",
      "Create a process improvement booking system"
  ],
};
