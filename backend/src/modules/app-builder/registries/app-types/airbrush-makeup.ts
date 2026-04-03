/**
 * Airbrush Makeup App Type Definition
 *
 * Complete definition for airbrush makeup applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AIRBRUSH_MAKEUP_APP_TYPE: AppTypeDefinition = {
  id: 'airbrush-makeup',
  name: 'Airbrush Makeup',
  category: 'services',
  description: 'Airbrush Makeup platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "airbrush makeup",
      "airbrush",
      "makeup",
      "airbrush software",
      "airbrush app",
      "airbrush platform",
      "airbrush system",
      "airbrush management",
      "services airbrush"
  ],

  synonyms: [
      "Airbrush Makeup platform",
      "Airbrush Makeup software",
      "Airbrush Makeup system",
      "airbrush solution",
      "airbrush service"
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
      "Build a airbrush makeup platform",
      "Create a airbrush makeup app",
      "I need a airbrush makeup management system",
      "Build a airbrush makeup solution",
      "Create a airbrush makeup booking system"
  ],
};
