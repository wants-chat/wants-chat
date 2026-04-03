/**
 * Siding Installation App Type Definition
 *
 * Complete definition for siding installation applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SIDING_INSTALLATION_APP_TYPE: AppTypeDefinition = {
  id: 'siding-installation',
  name: 'Siding Installation',
  category: 'services',
  description: 'Siding Installation platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "siding installation",
      "siding",
      "installation",
      "siding software",
      "siding app",
      "siding platform",
      "siding system",
      "siding management",
      "services siding"
  ],

  synonyms: [
      "Siding Installation platform",
      "Siding Installation software",
      "Siding Installation system",
      "siding solution",
      "siding service"
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
      "Build a siding installation platform",
      "Create a siding installation app",
      "I need a siding installation management system",
      "Build a siding installation solution",
      "Create a siding installation booking system"
  ],
};
