/**
 * Total Quality App Type Definition
 *
 * Complete definition for total quality applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TOTAL_QUALITY_APP_TYPE: AppTypeDefinition = {
  id: 'total-quality',
  name: 'Total Quality',
  category: 'services',
  description: 'Total Quality platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "total quality",
      "total",
      "quality",
      "total software",
      "total app",
      "total platform",
      "total system",
      "total management",
      "services total"
  ],

  synonyms: [
      "Total Quality platform",
      "Total Quality software",
      "Total Quality system",
      "total solution",
      "total service"
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
      "Build a total quality platform",
      "Create a total quality app",
      "I need a total quality management system",
      "Build a total quality solution",
      "Create a total quality booking system"
  ],
};
