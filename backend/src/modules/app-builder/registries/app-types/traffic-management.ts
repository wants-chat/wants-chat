/**
 * Traffic Management App Type Definition
 *
 * Complete definition for traffic management applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRAFFIC_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'traffic-management',
  name: 'Traffic Management',
  category: 'services',
  description: 'Traffic Management platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "traffic management",
      "traffic",
      "management",
      "traffic software",
      "traffic app",
      "traffic platform",
      "traffic system",
      "services traffic"
  ],

  synonyms: [
      "Traffic Management platform",
      "Traffic Management software",
      "Traffic Management system",
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
      "Build a traffic management platform",
      "Create a traffic management app",
      "I need a traffic management management system",
      "Build a traffic management solution",
      "Create a traffic management booking system"
  ],
};
