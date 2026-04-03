/**
 * Solar System App Type Definition
 *
 * Complete definition for solar system applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SOLAR_SYSTEM_APP_TYPE: AppTypeDefinition = {
  id: 'solar-system',
  name: 'Solar System',
  category: 'services',
  description: 'Solar System platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "solar system",
      "solar",
      "system",
      "solar software",
      "solar app",
      "solar platform",
      "solar management",
      "services solar"
  ],

  synonyms: [
      "Solar System platform",
      "Solar System software",
      "Solar System system",
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
      "Build a solar system platform",
      "Create a solar system app",
      "I need a solar system management system",
      "Build a solar system solution",
      "Create a solar system booking system"
  ],
};
