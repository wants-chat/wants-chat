/**
 * Vinyl Flooring App Type Definition
 *
 * Complete definition for vinyl flooring applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VINYL_FLOORING_APP_TYPE: AppTypeDefinition = {
  id: 'vinyl-flooring',
  name: 'Vinyl Flooring',
  category: 'construction',
  description: 'Vinyl Flooring platform with comprehensive management features',
  icon: 'hammer',

  keywords: [
      "vinyl flooring",
      "vinyl",
      "flooring",
      "vinyl software",
      "vinyl app",
      "vinyl platform",
      "vinyl system",
      "vinyl management",
      "construction vinyl"
  ],

  synonyms: [
      "Vinyl Flooring platform",
      "Vinyl Flooring software",
      "Vinyl Flooring system",
      "vinyl solution",
      "vinyl service"
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
      "Build a vinyl flooring platform",
      "Create a vinyl flooring app",
      "I need a vinyl flooring management system",
      "Build a vinyl flooring solution",
      "Create a vinyl flooring booking system"
  ],
};
