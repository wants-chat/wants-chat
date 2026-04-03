/**
 * Speaking Engagements App Type Definition
 *
 * Complete definition for speaking engagements applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPEAKING_ENGAGEMENTS_APP_TYPE: AppTypeDefinition = {
  id: 'speaking-engagements',
  name: 'Speaking Engagements',
  category: 'services',
  description: 'Speaking Engagements platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "speaking engagements",
      "speaking",
      "engagements",
      "speaking software",
      "speaking app",
      "speaking platform",
      "speaking system",
      "speaking management",
      "services speaking"
  ],

  synonyms: [
      "Speaking Engagements platform",
      "Speaking Engagements software",
      "Speaking Engagements system",
      "speaking solution",
      "speaking service"
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
      "Build a speaking engagements platform",
      "Create a speaking engagements app",
      "I need a speaking engagements management system",
      "Build a speaking engagements solution",
      "Create a speaking engagements booking system"
  ],
};
