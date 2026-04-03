/**
 * Antenna Installation App Type Definition
 *
 * Complete definition for antenna installation applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ANTENNA_INSTALLATION_APP_TYPE: AppTypeDefinition = {
  id: 'antenna-installation',
  name: 'Antenna Installation',
  category: 'services',
  description: 'Antenna Installation platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "antenna installation",
      "antenna",
      "installation",
      "antenna software",
      "antenna app",
      "antenna platform",
      "antenna system",
      "antenna management",
      "services antenna"
  ],

  synonyms: [
      "Antenna Installation platform",
      "Antenna Installation software",
      "Antenna Installation system",
      "antenna solution",
      "antenna service"
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
      "Build a antenna installation platform",
      "Create a antenna installation app",
      "I need a antenna installation management system",
      "Build a antenna installation solution",
      "Create a antenna installation booking system"
  ],
};
