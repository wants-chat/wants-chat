/**
 * Process Serving App Type Definition
 *
 * Complete definition for process serving applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PROCESS_SERVING_APP_TYPE: AppTypeDefinition = {
  id: 'process-serving',
  name: 'Process Serving',
  category: 'services',
  description: 'Process Serving platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "process serving",
      "process",
      "serving",
      "process software",
      "process app",
      "process platform",
      "process system",
      "process management",
      "services process"
  ],

  synonyms: [
      "Process Serving platform",
      "Process Serving software",
      "Process Serving system",
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
      "Build a process serving platform",
      "Create a process serving app",
      "I need a process serving management system",
      "Build a process serving solution",
      "Create a process serving booking system"
  ],
};
