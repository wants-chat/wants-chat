/**
 * Virtual Assistant App Type Definition
 *
 * Complete definition for virtual assistant applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VIRTUAL_ASSISTANT_APP_TYPE: AppTypeDefinition = {
  id: 'virtual-assistant',
  name: 'Virtual Assistant',
  category: 'services',
  description: 'Virtual Assistant platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "virtual assistant",
      "virtual",
      "assistant",
      "virtual software",
      "virtual app",
      "virtual platform",
      "virtual system",
      "virtual management",
      "services virtual"
  ],

  synonyms: [
      "Virtual Assistant platform",
      "Virtual Assistant software",
      "Virtual Assistant system",
      "virtual solution",
      "virtual service"
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
      "Build a virtual assistant platform",
      "Create a virtual assistant app",
      "I need a virtual assistant management system",
      "Build a virtual assistant solution",
      "Create a virtual assistant booking system"
  ],
};
