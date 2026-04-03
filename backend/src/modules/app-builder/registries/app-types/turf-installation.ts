/**
 * Turf Installation App Type Definition
 *
 * Complete definition for turf installation applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TURF_INSTALLATION_APP_TYPE: AppTypeDefinition = {
  id: 'turf-installation',
  name: 'Turf Installation',
  category: 'services',
  description: 'Turf Installation platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "turf installation",
      "turf",
      "installation",
      "turf software",
      "turf app",
      "turf platform",
      "turf system",
      "turf management",
      "services turf"
  ],

  synonyms: [
      "Turf Installation platform",
      "Turf Installation software",
      "Turf Installation system",
      "turf solution",
      "turf service"
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
      "Build a turf installation platform",
      "Create a turf installation app",
      "I need a turf installation management system",
      "Build a turf installation solution",
      "Create a turf installation booking system"
  ],
};
