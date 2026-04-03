/**
 * Pool Construction App Type Definition
 *
 * Complete definition for pool construction applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const POOL_CONSTRUCTION_APP_TYPE: AppTypeDefinition = {
  id: 'pool-construction',
  name: 'Pool Construction',
  category: 'construction',
  description: 'Pool Construction platform with comprehensive management features',
  icon: 'hammer',

  keywords: [
      "pool construction",
      "pool",
      "construction",
      "pool software",
      "pool app",
      "pool platform",
      "pool system",
      "pool management",
      "construction pool"
  ],

  synonyms: [
      "Pool Construction platform",
      "Pool Construction software",
      "Pool Construction system",
      "pool solution",
      "pool service"
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
      "Build a pool construction platform",
      "Create a pool construction app",
      "I need a pool construction management system",
      "Build a pool construction solution",
      "Create a pool construction booking system"
  ],
};
