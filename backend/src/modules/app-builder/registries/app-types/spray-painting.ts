/**
 * Spray Painting App Type Definition
 *
 * Complete definition for spray painting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPRAY_PAINTING_APP_TYPE: AppTypeDefinition = {
  id: 'spray-painting',
  name: 'Spray Painting',
  category: 'construction',
  description: 'Spray Painting platform with comprehensive management features',
  icon: 'hammer',

  keywords: [
      "spray painting",
      "spray",
      "painting",
      "spray software",
      "spray app",
      "spray platform",
      "spray system",
      "spray management",
      "construction spray"
  ],

  synonyms: [
      "Spray Painting platform",
      "Spray Painting software",
      "Spray Painting system",
      "spray solution",
      "spray service"
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
      "Build a spray painting platform",
      "Create a spray painting app",
      "I need a spray painting management system",
      "Build a spray painting solution",
      "Create a spray painting booking system"
  ],
};
