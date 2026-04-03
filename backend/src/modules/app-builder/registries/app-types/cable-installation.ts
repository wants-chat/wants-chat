/**
 * Cable Installation App Type Definition
 *
 * Complete definition for cable installation applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CABLE_INSTALLATION_APP_TYPE: AppTypeDefinition = {
  id: 'cable-installation',
  name: 'Cable Installation',
  category: 'services',
  description: 'Cable Installation platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "cable installation",
      "cable",
      "installation",
      "cable software",
      "cable app",
      "cable platform",
      "cable system",
      "cable management",
      "services cable"
  ],

  synonyms: [
      "Cable Installation platform",
      "Cable Installation software",
      "Cable Installation system",
      "cable solution",
      "cable service"
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
      "Build a cable installation platform",
      "Create a cable installation app",
      "I need a cable installation management system",
      "Build a cable installation solution",
      "Create a cable installation booking system"
  ],
};
