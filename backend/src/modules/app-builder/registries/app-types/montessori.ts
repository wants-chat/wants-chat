/**
 * Montessori App Type Definition
 *
 * Complete definition for montessori applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MONTESSORI_APP_TYPE: AppTypeDefinition = {
  id: 'montessori',
  name: 'Montessori',
  category: 'services',
  description: 'Montessori platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "montessori",
      "montessori software",
      "montessori app",
      "montessori platform",
      "montessori system",
      "montessori management",
      "services montessori"
  ],

  synonyms: [
      "Montessori platform",
      "Montessori software",
      "Montessori system",
      "montessori solution",
      "montessori service"
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
      "Build a montessori platform",
      "Create a montessori app",
      "I need a montessori management system",
      "Build a montessori solution",
      "Create a montessori booking system"
  ],
};
