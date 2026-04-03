/**
 * Spray Tan App Type Definition
 *
 * Complete definition for spray tan applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPRAY_TAN_APP_TYPE: AppTypeDefinition = {
  id: 'spray-tan',
  name: 'Spray Tan',
  category: 'services',
  description: 'Spray Tan platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "spray tan",
      "spray",
      "tan",
      "spray software",
      "spray app",
      "spray platform",
      "spray system",
      "spray management",
      "services spray"
  ],

  synonyms: [
      "Spray Tan platform",
      "Spray Tan software",
      "Spray Tan system",
      "spray solution",
      "spray service"
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
      "Build a spray tan platform",
      "Create a spray tan app",
      "I need a spray tan management system",
      "Build a spray tan solution",
      "Create a spray tan booking system"
  ],
};
