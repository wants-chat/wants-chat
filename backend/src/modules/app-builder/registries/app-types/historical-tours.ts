/**
 * Historical Tours App Type Definition
 *
 * Complete definition for historical tours applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HISTORICAL_TOURS_APP_TYPE: AppTypeDefinition = {
  id: 'historical-tours',
  name: 'Historical Tours',
  category: 'services',
  description: 'Historical Tours platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "historical tours",
      "historical",
      "tours",
      "historical software",
      "historical app",
      "historical platform",
      "historical system",
      "historical management",
      "services historical"
  ],

  synonyms: [
      "Historical Tours platform",
      "Historical Tours software",
      "Historical Tours system",
      "historical solution",
      "historical service"
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
      "Build a historical tours platform",
      "Create a historical tours app",
      "I need a historical tours management system",
      "Build a historical tours solution",
      "Create a historical tours booking system"
  ],
};
