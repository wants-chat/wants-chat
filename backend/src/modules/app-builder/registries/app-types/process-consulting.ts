/**
 * Process Consulting App Type Definition
 *
 * Complete definition for process consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PROCESS_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'process-consulting',
  name: 'Process Consulting',
  category: 'professional-services',
  description: 'Process Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "process consulting",
      "process",
      "consulting",
      "process software",
      "process app",
      "process platform",
      "process system",
      "process management",
      "consulting process"
  ],

  synonyms: [
      "Process Consulting platform",
      "Process Consulting software",
      "Process Consulting system",
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
      "clients",
      "projects",
      "calendar",
      "notifications"
  ],

  optionalFeatures: [
      "invoicing",
      "contracts",
      "documents",
      "time-tracking",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'consulting',

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'professional',

  examplePrompts: [
      "Build a process consulting platform",
      "Create a process consulting app",
      "I need a process consulting management system",
      "Build a process consulting solution",
      "Create a process consulting booking system"
  ],
};
