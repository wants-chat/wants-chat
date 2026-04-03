/**
 * Online Mentoring App Type Definition
 *
 * Complete definition for online mentoring applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ONLINE_MENTORING_APP_TYPE: AppTypeDefinition = {
  id: 'online-mentoring',
  name: 'Online Mentoring',
  category: 'professional-services',
  description: 'Online Mentoring platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "online mentoring",
      "online",
      "mentoring",
      "online software",
      "online app",
      "online platform",
      "online system",
      "online management",
      "consulting online"
  ],

  synonyms: [
      "Online Mentoring platform",
      "Online Mentoring software",
      "Online Mentoring system",
      "online solution",
      "online service"
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
      "Build a online mentoring platform",
      "Create a online mentoring app",
      "I need a online mentoring management system",
      "Build a online mentoring solution",
      "Create a online mentoring booking system"
  ],
};
