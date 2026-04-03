/**
 * Pipeline App Type Definition
 *
 * Complete definition for pipeline applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PIPELINE_APP_TYPE: AppTypeDefinition = {
  id: 'pipeline',
  name: 'Pipeline',
  category: 'services',
  description: 'Pipeline platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "pipeline",
      "pipeline software",
      "pipeline app",
      "pipeline platform",
      "pipeline system",
      "pipeline management",
      "services pipeline"
  ],

  synonyms: [
      "Pipeline platform",
      "Pipeline software",
      "Pipeline system",
      "pipeline solution",
      "pipeline service"
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
      "Build a pipeline platform",
      "Create a pipeline app",
      "I need a pipeline management system",
      "Build a pipeline solution",
      "Create a pipeline booking system"
  ],
};
