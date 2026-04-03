/**
 * Horse Boarding App Type Definition
 *
 * Complete definition for horse boarding applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HORSE_BOARDING_APP_TYPE: AppTypeDefinition = {
  id: 'horse-boarding',
  name: 'Horse Boarding',
  category: 'services',
  description: 'Horse Boarding platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "horse boarding",
      "horse",
      "boarding",
      "horse software",
      "horse app",
      "horse platform",
      "horse system",
      "horse management",
      "services horse"
  ],

  synonyms: [
      "Horse Boarding platform",
      "Horse Boarding software",
      "Horse Boarding system",
      "horse solution",
      "horse service"
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
      "Build a horse boarding platform",
      "Create a horse boarding app",
      "I need a horse boarding management system",
      "Build a horse boarding solution",
      "Create a horse boarding booking system"
  ],
};
