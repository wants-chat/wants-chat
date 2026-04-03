/**
 * Regional Airline App Type Definition
 *
 * Complete definition for regional airline applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const REGIONAL_AIRLINE_APP_TYPE: AppTypeDefinition = {
  id: 'regional-airline',
  name: 'Regional Airline',
  category: 'services',
  description: 'Regional Airline platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "regional airline",
      "regional",
      "airline",
      "regional software",
      "regional app",
      "regional platform",
      "regional system",
      "regional management",
      "services regional"
  ],

  synonyms: [
      "Regional Airline platform",
      "Regional Airline software",
      "Regional Airline system",
      "regional solution",
      "regional service"
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
      "Build a regional airline platform",
      "Create a regional airline app",
      "I need a regional airline management system",
      "Build a regional airline solution",
      "Create a regional airline booking system"
  ],
};
