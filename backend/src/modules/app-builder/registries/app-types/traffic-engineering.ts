/**
 * Traffic Engineering App Type Definition
 *
 * Complete definition for traffic engineering applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRAFFIC_ENGINEERING_APP_TYPE: AppTypeDefinition = {
  id: 'traffic-engineering',
  name: 'Traffic Engineering',
  category: 'services',
  description: 'Traffic Engineering platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "traffic engineering",
      "traffic",
      "engineering",
      "traffic software",
      "traffic app",
      "traffic platform",
      "traffic system",
      "traffic management",
      "services traffic"
  ],

  synonyms: [
      "Traffic Engineering platform",
      "Traffic Engineering software",
      "Traffic Engineering system",
      "traffic solution",
      "traffic service"
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
      "Build a traffic engineering platform",
      "Create a traffic engineering app",
      "I need a traffic engineering management system",
      "Build a traffic engineering solution",
      "Create a traffic engineering booking system"
  ],
};
