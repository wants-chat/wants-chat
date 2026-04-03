/**
 * Golf Instruction App Type Definition
 *
 * Complete definition for golf instruction applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const GOLF_INSTRUCTION_APP_TYPE: AppTypeDefinition = {
  id: 'golf-instruction',
  name: 'Golf Instruction',
  category: 'services',
  description: 'Golf Instruction platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "golf instruction",
      "golf",
      "instruction",
      "golf software",
      "golf app",
      "golf platform",
      "golf system",
      "golf management",
      "services golf"
  ],

  synonyms: [
      "Golf Instruction platform",
      "Golf Instruction software",
      "Golf Instruction system",
      "golf solution",
      "golf service"
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
      "Build a golf instruction platform",
      "Create a golf instruction app",
      "I need a golf instruction management system",
      "Build a golf instruction solution",
      "Create a golf instruction booking system"
  ],
};
