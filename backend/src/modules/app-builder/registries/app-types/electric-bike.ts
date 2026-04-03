/**
 * Electric Bike App Type Definition
 *
 * Complete definition for electric bike applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ELECTRIC_BIKE_APP_TYPE: AppTypeDefinition = {
  id: 'electric-bike',
  name: 'Electric Bike',
  category: 'construction',
  description: 'Electric Bike platform with comprehensive management features',
  icon: 'hammer',

  keywords: [
      "electric bike",
      "electric",
      "bike",
      "electric software",
      "electric app",
      "electric platform",
      "electric system",
      "electric management",
      "construction electric"
  ],

  synonyms: [
      "Electric Bike platform",
      "Electric Bike software",
      "Electric Bike system",
      "electric solution",
      "electric service"
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
      "projects",
      "project-bids",
      "daily-logs",
      "calendar",
      "notifications"
  ],

  optionalFeatures: [
      "subcontractor-mgmt",
      "material-takeoffs",
      "invoicing",
      "documents",
      "site-safety"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'construction',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'industrial',

  examplePrompts: [
      "Build a electric bike platform",
      "Create a electric bike app",
      "I need a electric bike management system",
      "Build a electric bike solution",
      "Create a electric bike booking system"
  ],
};
