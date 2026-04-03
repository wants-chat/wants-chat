/**
 * Online Coaching App Type Definition
 *
 * Complete definition for online coaching applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ONLINE_COACHING_APP_TYPE: AppTypeDefinition = {
  id: 'online-coaching',
  name: 'Online Coaching',
  category: 'professional-services',
  description: 'Online Coaching platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "online coaching",
      "online",
      "coaching",
      "online software",
      "online app",
      "online platform",
      "online system",
      "online management",
      "consulting online"
  ],

  synonyms: [
      "Online Coaching platform",
      "Online Coaching software",
      "Online Coaching system",
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
      "Build a online coaching platform",
      "Create a online coaching app",
      "I need a online coaching management system",
      "Build a online coaching solution",
      "Create a online coaching booking system"
  ],
};
