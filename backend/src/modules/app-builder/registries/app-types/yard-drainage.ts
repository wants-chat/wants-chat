/**
 * Yard Drainage App Type Definition
 *
 * Complete definition for yard drainage applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const YARD_DRAINAGE_APP_TYPE: AppTypeDefinition = {
  id: 'yard-drainage',
  name: 'Yard Drainage',
  category: 'services',
  description: 'Yard Drainage platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "yard drainage",
      "yard",
      "drainage",
      "yard software",
      "yard app",
      "yard platform",
      "yard system",
      "yard management",
      "services yard"
  ],

  synonyms: [
      "Yard Drainage platform",
      "Yard Drainage software",
      "Yard Drainage system",
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
      "Build a yard drainage platform",
      "Create a yard drainage app",
      "I need a yard drainage management system",
      "Build a yard drainage solution",
      "Create a yard drainage booking system"
  ],
};
