/**
 * Geothermal App Type Definition
 *
 * Complete definition for geothermal applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const GEOTHERMAL_APP_TYPE: AppTypeDefinition = {
  id: 'geothermal',
  name: 'Geothermal',
  category: 'services',
  description: 'Geothermal platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "geothermal",
      "geothermal software",
      "geothermal app",
      "geothermal platform",
      "geothermal system",
      "geothermal management",
      "services geothermal"
  ],

  synonyms: [
      "Geothermal platform",
      "Geothermal software",
      "Geothermal system",
      "geothermal solution",
      "geothermal service"
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
      "Build a geothermal platform",
      "Create a geothermal app",
      "I need a geothermal management system",
      "Build a geothermal solution",
      "Create a geothermal booking system"
  ],
};
