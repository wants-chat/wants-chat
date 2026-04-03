/**
 * Baby Photography App Type Definition
 *
 * Complete definition for baby photography applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BABY_PHOTOGRAPHY_APP_TYPE: AppTypeDefinition = {
  id: 'baby-photography',
  name: 'Baby Photography',
  category: 'services',
  description: 'Baby Photography platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "baby photography",
      "baby",
      "photography",
      "baby software",
      "baby app",
      "baby platform",
      "baby system",
      "baby management",
      "services baby"
  ],

  synonyms: [
      "Baby Photography platform",
      "Baby Photography software",
      "Baby Photography system",
      "baby solution",
      "baby service"
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
      "Build a baby photography platform",
      "Create a baby photography app",
      "I need a baby photography management system",
      "Build a baby photography solution",
      "Create a baby photography booking system"
  ],
};
