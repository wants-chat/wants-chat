/**
 * Spring Water App Type Definition
 *
 * Complete definition for spring water applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPRING_WATER_APP_TYPE: AppTypeDefinition = {
  id: 'spring-water',
  name: 'Spring Water',
  category: 'services',
  description: 'Spring Water platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "spring water",
      "spring",
      "water",
      "spring software",
      "spring app",
      "spring platform",
      "spring system",
      "spring management",
      "services spring"
  ],

  synonyms: [
      "Spring Water platform",
      "Spring Water software",
      "Spring Water system",
      "spring solution",
      "spring service"
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
      "Build a spring water platform",
      "Create a spring water app",
      "I need a spring water management system",
      "Build a spring water solution",
      "Create a spring water booking system"
  ],
};
