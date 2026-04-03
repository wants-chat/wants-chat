/**
 * Artesian Well App Type Definition
 *
 * Complete definition for artesian well applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ARTESIAN_WELL_APP_TYPE: AppTypeDefinition = {
  id: 'artesian-well',
  name: 'Artesian Well',
  category: 'services',
  description: 'Artesian Well platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "artesian well",
      "artesian",
      "well",
      "artesian software",
      "artesian app",
      "artesian platform",
      "artesian system",
      "artesian management",
      "services artesian"
  ],

  synonyms: [
      "Artesian Well platform",
      "Artesian Well software",
      "Artesian Well system",
      "artesian solution",
      "artesian service"
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
      "Build a artesian well platform",
      "Create a artesian well app",
      "I need a artesian well management system",
      "Build a artesian well solution",
      "Create a artesian well booking system"
  ],
};
