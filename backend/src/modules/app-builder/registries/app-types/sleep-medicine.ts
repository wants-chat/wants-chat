/**
 * Sleep Medicine App Type Definition
 *
 * Complete definition for sleep medicine applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SLEEP_MEDICINE_APP_TYPE: AppTypeDefinition = {
  id: 'sleep-medicine',
  name: 'Sleep Medicine',
  category: 'services',
  description: 'Sleep Medicine platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "sleep medicine",
      "sleep",
      "medicine",
      "sleep software",
      "sleep app",
      "sleep platform",
      "sleep system",
      "sleep management",
      "services sleep"
  ],

  synonyms: [
      "Sleep Medicine platform",
      "Sleep Medicine software",
      "Sleep Medicine system",
      "sleep solution",
      "sleep service"
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
      "Build a sleep medicine platform",
      "Create a sleep medicine app",
      "I need a sleep medicine management system",
      "Build a sleep medicine solution",
      "Create a sleep medicine booking system"
  ],
};
