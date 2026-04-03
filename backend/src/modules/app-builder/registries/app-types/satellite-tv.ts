/**
 * Satellite Tv App Type Definition
 *
 * Complete definition for satellite tv applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SATELLITE_TV_APP_TYPE: AppTypeDefinition = {
  id: 'satellite-tv',
  name: 'Satellite Tv',
  category: 'services',
  description: 'Satellite Tv platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "satellite tv",
      "satellite",
      "satellite software",
      "satellite app",
      "satellite platform",
      "satellite system",
      "satellite management",
      "services satellite"
  ],

  synonyms: [
      "Satellite Tv platform",
      "Satellite Tv software",
      "Satellite Tv system",
      "satellite solution",
      "satellite service"
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
      "Build a satellite tv platform",
      "Create a satellite tv app",
      "I need a satellite tv management system",
      "Build a satellite tv solution",
      "Create a satellite tv booking system"
  ],
};
