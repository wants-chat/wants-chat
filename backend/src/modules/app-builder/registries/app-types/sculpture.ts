/**
 * Sculpture App Type Definition
 *
 * Complete definition for sculpture applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SCULPTURE_APP_TYPE: AppTypeDefinition = {
  id: 'sculpture',
  name: 'Sculpture',
  category: 'services',
  description: 'Sculpture platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "sculpture",
      "sculpture software",
      "sculpture app",
      "sculpture platform",
      "sculpture system",
      "sculpture management",
      "services sculpture"
  ],

  synonyms: [
      "Sculpture platform",
      "Sculpture software",
      "Sculpture system",
      "sculpture solution",
      "sculpture service"
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
      "Build a sculpture platform",
      "Create a sculpture app",
      "I need a sculpture management system",
      "Build a sculpture solution",
      "Create a sculpture booking system"
  ],
};
