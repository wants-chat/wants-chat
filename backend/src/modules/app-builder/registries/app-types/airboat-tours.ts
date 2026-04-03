/**
 * Airboat Tours App Type Definition
 *
 * Complete definition for airboat tours applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AIRBOAT_TOURS_APP_TYPE: AppTypeDefinition = {
  id: 'airboat-tours',
  name: 'Airboat Tours',
  category: 'services',
  description: 'Airboat Tours platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "airboat tours",
      "airboat",
      "tours",
      "airboat software",
      "airboat app",
      "airboat platform",
      "airboat system",
      "airboat management",
      "services airboat"
  ],

  synonyms: [
      "Airboat Tours platform",
      "Airboat Tours software",
      "Airboat Tours system",
      "airboat solution",
      "airboat service"
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
      "Build a airboat tours platform",
      "Create a airboat tours app",
      "I need a airboat tours management system",
      "Build a airboat tours solution",
      "Create a airboat tours booking system"
  ],
};
