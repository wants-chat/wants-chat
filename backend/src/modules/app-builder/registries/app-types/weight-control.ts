/**
 * Weight Control App Type Definition
 *
 * Complete definition for weight control applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WEIGHT_CONTROL_APP_TYPE: AppTypeDefinition = {
  id: 'weight-control',
  name: 'Weight Control',
  category: 'services',
  description: 'Weight Control platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "weight control",
      "weight",
      "control",
      "weight software",
      "weight app",
      "weight platform",
      "weight system",
      "weight management",
      "services weight"
  ],

  synonyms: [
      "Weight Control platform",
      "Weight Control software",
      "Weight Control system",
      "weight solution",
      "weight service"
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
      "Build a weight control platform",
      "Create a weight control app",
      "I need a weight control management system",
      "Build a weight control solution",
      "Create a weight control booking system"
  ],
};
