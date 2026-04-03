/**
 * Salsa Dancing App Type Definition
 *
 * Complete definition for salsa dancing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SALSA_DANCING_APP_TYPE: AppTypeDefinition = {
  id: 'salsa-dancing',
  name: 'Salsa Dancing',
  category: 'services',
  description: 'Salsa Dancing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "salsa dancing",
      "salsa",
      "dancing",
      "salsa software",
      "salsa app",
      "salsa platform",
      "salsa system",
      "salsa management",
      "services salsa"
  ],

  synonyms: [
      "Salsa Dancing platform",
      "Salsa Dancing software",
      "Salsa Dancing system",
      "salsa solution",
      "salsa service"
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
      "Build a salsa dancing platform",
      "Create a salsa dancing app",
      "I need a salsa dancing management system",
      "Build a salsa dancing solution",
      "Create a salsa dancing booking system"
  ],
};
