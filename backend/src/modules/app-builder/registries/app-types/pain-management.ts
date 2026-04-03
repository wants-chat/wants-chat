/**
 * Pain Management App Type Definition
 *
 * Complete definition for pain management applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PAIN_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'pain-management',
  name: 'Pain Management',
  category: 'services',
  description: 'Pain Management platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "pain management",
      "pain",
      "management",
      "pain software",
      "pain app",
      "pain platform",
      "pain system",
      "services pain"
  ],

  synonyms: [
      "Pain Management platform",
      "Pain Management software",
      "Pain Management system",
      "pain solution",
      "pain service"
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
      "Build a pain management platform",
      "Create a pain management app",
      "I need a pain management management system",
      "Build a pain management solution",
      "Create a pain management booking system"
  ],
};
