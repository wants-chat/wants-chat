/**
 * Workwear App Type Definition
 *
 * Complete definition for workwear applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WORKWEAR_APP_TYPE: AppTypeDefinition = {
  id: 'workwear',
  name: 'Workwear',
  category: 'services',
  description: 'Workwear platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "workwear",
      "workwear software",
      "workwear app",
      "workwear platform",
      "workwear system",
      "workwear management",
      "services workwear"
  ],

  synonyms: [
      "Workwear platform",
      "Workwear software",
      "Workwear system",
      "workwear solution",
      "workwear service"
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
      "Build a workwear platform",
      "Create a workwear app",
      "I need a workwear management system",
      "Build a workwear solution",
      "Create a workwear booking system"
  ],
};
