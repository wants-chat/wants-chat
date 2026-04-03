/**
 * Sleep Consulting App Type Definition
 *
 * Complete definition for sleep consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SLEEP_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'sleep-consulting',
  name: 'Sleep Consulting',
  category: 'professional-services',
  description: 'Sleep Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "sleep consulting",
      "sleep",
      "consulting",
      "sleep software",
      "sleep app",
      "sleep platform",
      "sleep system",
      "sleep management",
      "consulting sleep"
  ],

  synonyms: [
      "Sleep Consulting platform",
      "Sleep Consulting software",
      "Sleep Consulting system",
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
      "clients",
      "projects",
      "calendar",
      "notifications"
  ],

  optionalFeatures: [
      "invoicing",
      "contracts",
      "documents",
      "time-tracking",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'consulting',

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'professional',

  examplePrompts: [
      "Build a sleep consulting platform",
      "Create a sleep consulting app",
      "I need a sleep consulting management system",
      "Build a sleep consulting solution",
      "Create a sleep consulting booking system"
  ],
};
