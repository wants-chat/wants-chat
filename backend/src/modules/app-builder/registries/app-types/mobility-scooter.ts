/**
 * Mobility Scooter App Type Definition
 *
 * Complete definition for mobility scooter applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MOBILITY_SCOOTER_APP_TYPE: AppTypeDefinition = {
  id: 'mobility-scooter',
  name: 'Mobility Scooter',
  category: 'services',
  description: 'Mobility Scooter platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "mobility scooter",
      "mobility",
      "scooter",
      "mobility software",
      "mobility app",
      "mobility platform",
      "mobility system",
      "mobility management",
      "services mobility"
  ],

  synonyms: [
      "Mobility Scooter platform",
      "Mobility Scooter software",
      "Mobility Scooter system",
      "mobility solution",
      "mobility service"
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
      "Build a mobility scooter platform",
      "Create a mobility scooter app",
      "I need a mobility scooter management system",
      "Build a mobility scooter solution",
      "Create a mobility scooter booking system"
  ],
};
