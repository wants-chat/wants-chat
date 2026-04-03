/**
 * Yard Work App Type Definition
 *
 * Complete definition for yard work applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const YARD_WORK_APP_TYPE: AppTypeDefinition = {
  id: 'yard-work',
  name: 'Yard Work',
  category: 'services',
  description: 'Yard Work platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "yard work",
      "yard",
      "work",
      "yard software",
      "yard app",
      "yard platform",
      "yard system",
      "yard management",
      "services yard"
  ],

  synonyms: [
      "Yard Work platform",
      "Yard Work software",
      "Yard Work system",
      "yard solution",
      "yard service"
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
      "Build a yard work platform",
      "Create a yard work app",
      "I need a yard work management system",
      "Build a yard work solution",
      "Create a yard work booking system"
  ],
};
