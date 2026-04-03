/**
 * Project Consulting App Type Definition
 *
 * Complete definition for project consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PROJECT_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'project-consulting',
  name: 'Project Consulting',
  category: 'professional-services',
  description: 'Project Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "project consulting",
      "project",
      "consulting",
      "project software",
      "project app",
      "project platform",
      "project system",
      "project management",
      "consulting project"
  ],

  synonyms: [
      "Project Consulting platform",
      "Project Consulting software",
      "Project Consulting system",
      "project solution",
      "project service"
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
      "Build a project consulting platform",
      "Create a project consulting app",
      "I need a project consulting management system",
      "Build a project consulting solution",
      "Create a project consulting booking system"
  ],
};
