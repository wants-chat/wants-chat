/**
 * Vinyl Fencing App Type Definition
 *
 * Complete definition for vinyl fencing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VINYL_FENCING_APP_TYPE: AppTypeDefinition = {
  id: 'vinyl-fencing',
  name: 'Vinyl Fencing',
  category: 'services',
  description: 'Vinyl Fencing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "vinyl fencing",
      "vinyl",
      "fencing",
      "vinyl software",
      "vinyl app",
      "vinyl platform",
      "vinyl system",
      "vinyl management",
      "services vinyl"
  ],

  synonyms: [
      "Vinyl Fencing platform",
      "Vinyl Fencing software",
      "Vinyl Fencing system",
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
      "Build a vinyl fencing platform",
      "Create a vinyl fencing app",
      "I need a vinyl fencing management system",
      "Build a vinyl fencing solution",
      "Create a vinyl fencing booking system"
  ],
};
