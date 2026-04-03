/**
 * University App Type Definition
 *
 * Complete definition for university applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const UNIVERSITY_APP_TYPE: AppTypeDefinition = {
  id: 'university',
  name: 'University',
  category: 'services',
  description: 'University platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "university",
      "university software",
      "university app",
      "university platform",
      "university system",
      "university management",
      "services university"
  ],

  synonyms: [
      "University platform",
      "University software",
      "University system",
      "university solution",
      "university service"
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
      "Build a university platform",
      "Create a university app",
      "I need a university management system",
      "Build a university solution",
      "Create a university booking system"
  ],
};
