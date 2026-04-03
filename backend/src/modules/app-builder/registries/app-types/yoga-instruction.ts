/**
 * Yoga Instruction App Type Definition
 *
 * Complete definition for yoga instruction applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const YOGA_INSTRUCTION_APP_TYPE: AppTypeDefinition = {
  id: 'yoga-instruction',
  name: 'Yoga Instruction',
  category: 'fitness',
  description: 'Yoga Instruction platform with comprehensive management features',
  icon: 'lotus',

  keywords: [
      "yoga instruction",
      "yoga",
      "instruction",
      "yoga software",
      "yoga app",
      "yoga platform",
      "yoga system",
      "yoga management",
      "wellness yoga"
  ],

  synonyms: [
      "Yoga Instruction platform",
      "Yoga Instruction software",
      "Yoga Instruction system",
      "yoga solution",
      "yoga service"
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
          "name": "Owner",
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
          "name": "Trainer",
          "level": 40,
          "isDefault": false,
          "accessibleSections": [
              "admin"
          ],
          "defaultRoute": "/admin/dashboard"
      },
      {
          "id": "user",
          "name": "Member",
          "level": 10,
          "isDefault": true,
          "accessibleSections": [
              "frontend"
          ],
          "defaultRoute": "/dashboard"
      }
  ],

  defaultFeatures: [
      "user-auth",
      "class-scheduling",
      "reservations",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "membership-plans",
      "payments",
      "trainer-booking",
      "gallery",
      "reviews"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'wellness',

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'calm',

  examplePrompts: [
      "Build a yoga instruction platform",
      "Create a yoga instruction app",
      "I need a yoga instruction management system",
      "Build a yoga instruction solution",
      "Create a yoga instruction booking system"
  ],
};
