/**
 * Solar Installation App Type Definition
 *
 * Complete definition for solar installation applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SOLAR_INSTALLATION_APP_TYPE: AppTypeDefinition = {
  id: 'solar-installation',
  name: 'Solar Installation',
  category: 'services',
  description: 'Solar Installation platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "solar installation",
      "solar",
      "installation",
      "solar software",
      "solar app",
      "solar platform",
      "solar system",
      "solar management",
      "services solar"
  ],

  synonyms: [
      "Solar Installation platform",
      "Solar Installation software",
      "Solar Installation system",
      "solar solution",
      "solar service"
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
      "Build a solar installation platform",
      "Create a solar installation app",
      "I need a solar installation management system",
      "Build a solar installation solution",
      "Create a solar installation booking system"
  ],
};
