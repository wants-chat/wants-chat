/**
 * Remote Work App Type Definition
 *
 * Complete definition for remote work applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const REMOTE_WORK_APP_TYPE: AppTypeDefinition = {
  id: 'remote-work',
  name: 'Remote Work',
  category: 'services',
  description: 'Remote Work platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "remote work",
      "remote",
      "work",
      "remote software",
      "remote app",
      "remote platform",
      "remote system",
      "remote management",
      "services remote"
  ],

  synonyms: [
      "Remote Work platform",
      "Remote Work software",
      "Remote Work system",
      "remote solution",
      "remote service"
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
      "Build a remote work platform",
      "Create a remote work app",
      "I need a remote work management system",
      "Build a remote work solution",
      "Create a remote work booking system"
  ],
};
