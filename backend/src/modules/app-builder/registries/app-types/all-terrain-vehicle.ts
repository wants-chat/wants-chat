/**
 * All Terrain Vehicle App Type Definition
 *
 * Complete definition for all terrain vehicle applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ALL_TERRAIN_VEHICLE_APP_TYPE: AppTypeDefinition = {
  id: 'all-terrain-vehicle',
  name: 'All Terrain Vehicle',
  category: 'automotive',
  description: 'All Terrain Vehicle platform with comprehensive management features',
  icon: 'car',

  keywords: [
      "all terrain vehicle",
      "all",
      "terrain",
      "vehicle",
      "all software",
      "all app",
      "all platform",
      "all system",
      "all management",
      "automotive all"
  ],

  synonyms: [
      "All Terrain Vehicle platform",
      "All Terrain Vehicle software",
      "All Terrain Vehicle system",
      "all solution",
      "all service"
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
      "vehicle-inventory",
      "appointments",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "service-scheduling",
      "parts-catalog",
      "invoicing",
      "payments",
      "reviews"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'automotive',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'industrial',

  examplePrompts: [
      "Build a all terrain vehicle platform",
      "Create a all terrain vehicle app",
      "I need a all terrain vehicle management system",
      "Build a all terrain vehicle solution",
      "Create a all terrain vehicle booking system"
  ],
};
