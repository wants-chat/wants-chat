/**
 * Train Station App Type Definition
 *
 * Complete definition for train station applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRAIN_STATION_APP_TYPE: AppTypeDefinition = {
  id: 'train-station',
  name: 'Train Station',
  category: 'services',
  description: 'Train Station platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "train station",
      "train",
      "station",
      "train software",
      "train app",
      "train platform",
      "train system",
      "train management",
      "services train"
  ],

  synonyms: [
      "Train Station platform",
      "Train Station software",
      "Train Station system",
      "train solution",
      "train service"
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
      "Build a train station platform",
      "Create a train station app",
      "I need a train station management system",
      "Build a train station solution",
      "Create a train station booking system"
  ],
};
