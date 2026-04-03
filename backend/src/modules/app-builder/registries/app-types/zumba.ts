/**
 * Zumba App Type Definition
 *
 * Complete definition for zumba applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ZUMBA_APP_TYPE: AppTypeDefinition = {
  id: 'zumba',
  name: 'Zumba',
  category: 'services',
  description: 'Zumba platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "zumba",
      "zumba software",
      "zumba app",
      "zumba platform",
      "zumba system",
      "zumba management",
      "services zumba"
  ],

  synonyms: [
      "Zumba platform",
      "Zumba software",
      "Zumba system",
      "zumba solution",
      "zumba service"
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
      "Build a zumba platform",
      "Create a zumba app",
      "I need a zumba management system",
      "Build a zumba solution",
      "Create a zumba booking system"
  ],
};
