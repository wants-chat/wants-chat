/**
 * Seminary App Type Definition
 *
 * Complete definition for seminary applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SEMINARY_APP_TYPE: AppTypeDefinition = {
  id: 'seminary',
  name: 'Seminary',
  category: 'services',
  description: 'Seminary platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "seminary",
      "seminary software",
      "seminary app",
      "seminary platform",
      "seminary system",
      "seminary management",
      "services seminary"
  ],

  synonyms: [
      "Seminary platform",
      "Seminary software",
      "Seminary system",
      "seminary solution",
      "seminary service"
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
      "Build a seminary platform",
      "Create a seminary app",
      "I need a seminary management system",
      "Build a seminary solution",
      "Create a seminary booking system"
  ],
};
