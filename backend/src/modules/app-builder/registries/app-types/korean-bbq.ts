/**
 * Korean Bbq App Type Definition
 *
 * Complete definition for korean bbq applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const KOREAN_BBQ_APP_TYPE: AppTypeDefinition = {
  id: 'korean-bbq',
  name: 'Korean Bbq',
  category: 'services',
  description: 'Korean Bbq platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "korean bbq",
      "korean",
      "bbq",
      "korean software",
      "korean app",
      "korean platform",
      "korean system",
      "korean management",
      "services korean"
  ],

  synonyms: [
      "Korean Bbq platform",
      "Korean Bbq software",
      "Korean Bbq system",
      "korean solution",
      "korean service"
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
      "Build a korean bbq platform",
      "Create a korean bbq app",
      "I need a korean bbq management system",
      "Build a korean bbq solution",
      "Create a korean bbq booking system"
  ],
};
