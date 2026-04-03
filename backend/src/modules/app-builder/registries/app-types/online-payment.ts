/**
 * Online Payment App Type Definition
 *
 * Complete definition for online payment applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ONLINE_PAYMENT_APP_TYPE: AppTypeDefinition = {
  id: 'online-payment',
  name: 'Online Payment',
  category: 'services',
  description: 'Online Payment platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "online payment",
      "online",
      "payment",
      "online software",
      "online app",
      "online platform",
      "online system",
      "online management",
      "services online"
  ],

  synonyms: [
      "Online Payment platform",
      "Online Payment software",
      "Online Payment system",
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
      "Build a online payment platform",
      "Create a online payment app",
      "I need a online payment management system",
      "Build a online payment solution",
      "Create a online payment booking system"
  ],
};
