/**
 * Tourist Information App Type Definition
 *
 * Complete definition for tourist information applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TOURIST_INFORMATION_APP_TYPE: AppTypeDefinition = {
  id: 'tourist-information',
  name: 'Tourist Information',
  category: 'services',
  description: 'Tourist Information platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "tourist information",
      "tourist",
      "information",
      "tourist software",
      "tourist app",
      "tourist platform",
      "tourist system",
      "tourist management",
      "services tourist"
  ],

  synonyms: [
      "Tourist Information platform",
      "Tourist Information software",
      "Tourist Information system",
      "tourist solution",
      "tourist service"
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
      "Build a tourist information platform",
      "Create a tourist information app",
      "I need a tourist information management system",
      "Build a tourist information solution",
      "Create a tourist information booking system"
  ],
};
