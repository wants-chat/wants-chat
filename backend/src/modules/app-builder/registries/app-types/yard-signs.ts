/**
 * Yard Signs App Type Definition
 *
 * Complete definition for yard signs applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const YARD_SIGNS_APP_TYPE: AppTypeDefinition = {
  id: 'yard-signs',
  name: 'Yard Signs',
  category: 'services',
  description: 'Yard Signs platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "yard signs",
      "yard",
      "signs",
      "yard software",
      "yard app",
      "yard platform",
      "yard system",
      "yard management",
      "services yard"
  ],

  synonyms: [
      "Yard Signs platform",
      "Yard Signs software",
      "Yard Signs system",
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
      "Build a yard signs platform",
      "Create a yard signs app",
      "I need a yard signs management system",
      "Build a yard signs solution",
      "Create a yard signs booking system"
  ],
};
