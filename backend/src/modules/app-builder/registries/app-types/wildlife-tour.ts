/**
 * Wildlife Tour App Type Definition
 *
 * Complete definition for wildlife tour applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WILDLIFE_TOUR_APP_TYPE: AppTypeDefinition = {
  id: 'wildlife-tour',
  name: 'Wildlife Tour',
  category: 'services',
  description: 'Wildlife Tour platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "wildlife tour",
      "wildlife",
      "tour",
      "wildlife software",
      "wildlife app",
      "wildlife platform",
      "wildlife system",
      "wildlife management",
      "services wildlife"
  ],

  synonyms: [
      "Wildlife Tour platform",
      "Wildlife Tour software",
      "Wildlife Tour system",
      "wildlife solution",
      "wildlife service"
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
      "Build a wildlife tour platform",
      "Create a wildlife tour app",
      "I need a wildlife tour management system",
      "Build a wildlife tour solution",
      "Create a wildlife tour booking system"
  ],
};
