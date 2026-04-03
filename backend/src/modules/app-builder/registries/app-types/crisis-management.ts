/**
 * Crisis Management App Type Definition
 *
 * Complete definition for crisis management applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CRISIS_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'crisis-management',
  name: 'Crisis Management',
  category: 'services',
  description: 'Crisis Management platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "crisis management",
      "crisis",
      "management",
      "crisis software",
      "crisis app",
      "crisis platform",
      "crisis system",
      "services crisis"
  ],

  synonyms: [
      "Crisis Management platform",
      "Crisis Management software",
      "Crisis Management system",
      "crisis solution",
      "crisis service"
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
      "Build a crisis management platform",
      "Create a crisis management app",
      "I need a crisis management management system",
      "Build a crisis management solution",
      "Create a crisis management booking system"
  ],
};
