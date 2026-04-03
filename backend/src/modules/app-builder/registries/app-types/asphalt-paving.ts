/**
 * Asphalt Paving App Type Definition
 *
 * Complete definition for asphalt paving applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ASPHALT_PAVING_APP_TYPE: AppTypeDefinition = {
  id: 'asphalt-paving',
  name: 'Asphalt Paving',
  category: 'services',
  description: 'Asphalt Paving platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "asphalt paving",
      "asphalt",
      "paving",
      "asphalt software",
      "asphalt app",
      "asphalt platform",
      "asphalt system",
      "asphalt management",
      "services asphalt"
  ],

  synonyms: [
      "Asphalt Paving platform",
      "Asphalt Paving software",
      "Asphalt Paving system",
      "asphalt solution",
      "asphalt service"
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
      "Build a asphalt paving platform",
      "Create a asphalt paving app",
      "I need a asphalt paving management system",
      "Build a asphalt paving solution",
      "Create a asphalt paving booking system"
  ],
};
