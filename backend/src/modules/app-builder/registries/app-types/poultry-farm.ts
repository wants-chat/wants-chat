/**
 * Poultry Farm App Type Definition
 *
 * Complete definition for poultry farm applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const POULTRY_FARM_APP_TYPE: AppTypeDefinition = {
  id: 'poultry-farm',
  name: 'Poultry Farm',
  category: 'services',
  description: 'Poultry Farm platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "poultry farm",
      "poultry",
      "farm",
      "poultry software",
      "poultry app",
      "poultry platform",
      "poultry system",
      "poultry management",
      "services poultry"
  ],

  synonyms: [
      "Poultry Farm platform",
      "Poultry Farm software",
      "Poultry Farm system",
      "poultry solution",
      "poultry service"
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
      "Build a poultry farm platform",
      "Create a poultry farm app",
      "I need a poultry farm management system",
      "Build a poultry farm solution",
      "Create a poultry farm booking system"
  ],
};
