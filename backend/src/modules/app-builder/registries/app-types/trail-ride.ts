/**
 * Trail Ride App Type Definition
 *
 * Complete definition for trail ride applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRAIL_RIDE_APP_TYPE: AppTypeDefinition = {
  id: 'trail-ride',
  name: 'Trail Ride',
  category: 'services',
  description: 'Trail Ride platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "trail ride",
      "trail",
      "ride",
      "trail software",
      "trail app",
      "trail platform",
      "trail system",
      "trail management",
      "services trail"
  ],

  synonyms: [
      "Trail Ride platform",
      "Trail Ride software",
      "Trail Ride system",
      "trail solution",
      "trail service"
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
      "Build a trail ride platform",
      "Create a trail ride app",
      "I need a trail ride management system",
      "Build a trail ride solution",
      "Create a trail ride booking system"
  ],
};
