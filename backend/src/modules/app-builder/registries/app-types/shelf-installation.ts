/**
 * Shelf Installation App Type Definition
 *
 * Complete definition for shelf installation applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SHELF_INSTALLATION_APP_TYPE: AppTypeDefinition = {
  id: 'shelf-installation',
  name: 'Shelf Installation',
  category: 'services',
  description: 'Shelf Installation platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "shelf installation",
      "shelf",
      "installation",
      "shelf software",
      "shelf app",
      "shelf platform",
      "shelf system",
      "shelf management",
      "services shelf"
  ],

  synonyms: [
      "Shelf Installation platform",
      "Shelf Installation software",
      "Shelf Installation system",
      "shelf solution",
      "shelf service"
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
      "scheduling",
      "invoicing",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "inventory",
      "payments",
      "reviews",
      "clients",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'practical',

  examplePrompts: [
      "Build a shelf installation platform",
      "Create a shelf installation app",
      "I need a shelf installation management system",
      "Build a shelf installation solution",
      "Create a shelf installation booking system"
  ],
};
