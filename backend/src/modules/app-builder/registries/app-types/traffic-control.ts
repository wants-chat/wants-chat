/**
 * Traffic Control App Type Definition
 *
 * Complete definition for traffic control applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRAFFIC_CONTROL_APP_TYPE: AppTypeDefinition = {
  id: 'traffic-control',
  name: 'Traffic Control',
  category: 'services',
  description: 'Traffic Control platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "traffic control",
      "traffic",
      "control",
      "traffic software",
      "traffic app",
      "traffic platform",
      "traffic system",
      "traffic management",
      "services traffic"
  ],

  synonyms: [
      "Traffic Control platform",
      "Traffic Control software",
      "Traffic Control system",
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
      "Build a traffic control platform",
      "Create a traffic control app",
      "I need a traffic control management system",
      "Build a traffic control solution",
      "Create a traffic control booking system"
  ],
};
