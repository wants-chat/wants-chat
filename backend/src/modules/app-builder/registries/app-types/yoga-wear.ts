/**
 * Yoga Wear App Type Definition
 *
 * Complete definition for yoga wear applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const YOGA_WEAR_APP_TYPE: AppTypeDefinition = {
  id: 'yoga-wear',
  name: 'Yoga Wear',
  category: 'fitness',
  description: 'Yoga Wear platform with comprehensive management features',
  icon: 'lotus',

  keywords: [
      "yoga wear",
      "yoga",
      "wear",
      "yoga software",
      "yoga app",
      "yoga platform",
      "yoga system",
      "yoga management",
      "wellness yoga"
  ],

  synonyms: [
      "Yoga Wear platform",
      "Yoga Wear software",
      "Yoga Wear system",
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
      "Build a yoga wear platform",
      "Create a yoga wear app",
      "I need a yoga wear management system",
      "Build a yoga wear solution",
      "Create a yoga wear booking system"
  ],
};
