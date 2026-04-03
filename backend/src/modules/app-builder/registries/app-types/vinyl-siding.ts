/**
 * Vinyl Siding App Type Definition
 *
 * Complete definition for vinyl siding applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VINYL_SIDING_APP_TYPE: AppTypeDefinition = {
  id: 'vinyl-siding',
  name: 'Vinyl Siding',
  category: 'services',
  description: 'Vinyl Siding platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "vinyl siding",
      "vinyl",
      "siding",
      "vinyl software",
      "vinyl app",
      "vinyl platform",
      "vinyl system",
      "vinyl management",
      "services vinyl"
  ],

  synonyms: [
      "Vinyl Siding platform",
      "Vinyl Siding software",
      "Vinyl Siding system",
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
      "Build a vinyl siding platform",
      "Create a vinyl siding app",
      "I need a vinyl siding management system",
      "Build a vinyl siding solution",
      "Create a vinyl siding booking system"
  ],
};
