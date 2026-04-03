/**
 * Ale House App Type Definition
 *
 * Complete definition for ale house applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ALE_HOUSE_APP_TYPE: AppTypeDefinition = {
  id: 'ale-house',
  name: 'Ale House',
  category: 'services',
  description: 'Ale House platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "ale house",
      "ale",
      "house",
      "ale software",
      "ale app",
      "ale platform",
      "ale system",
      "ale management",
      "services ale"
  ],

  synonyms: [
      "Ale House platform",
      "Ale House software",
      "Ale House system",
      "ale solution",
      "ale service"
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
      "Build a ale house platform",
      "Create a ale house app",
      "I need a ale house management system",
      "Build a ale house solution",
      "Create a ale house booking system"
  ],
};
