/**
 * Accident Reconstruction App Type Definition
 *
 * Complete definition for accident reconstruction applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ACCIDENT_RECONSTRUCTION_APP_TYPE: AppTypeDefinition = {
  id: 'accident-reconstruction',
  name: 'Accident Reconstruction',
  category: 'construction',
  description: 'Accident Reconstruction platform with comprehensive management features',
  icon: 'hammer',

  keywords: [
      "accident reconstruction",
      "accident",
      "reconstruction",
      "accident software",
      "accident app",
      "accident platform",
      "accident system",
      "accident management",
      "construction accident"
  ],

  synonyms: [
      "Accident Reconstruction platform",
      "Accident Reconstruction software",
      "Accident Reconstruction system",
      "accident solution",
      "accident service"
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
      "Build a accident reconstruction platform",
      "Create a accident reconstruction app",
      "I need a accident reconstruction management system",
      "Build a accident reconstruction solution",
      "Create a accident reconstruction booking system"
  ],
};
