/**
 * Yoga Retreat App Type Definition
 *
 * Complete definition for yoga retreat applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const YOGA_RETREAT_APP_TYPE: AppTypeDefinition = {
  id: 'yoga-retreat',
  name: 'Yoga Retreat',
  category: 'fitness',
  description: 'Yoga Retreat platform with comprehensive management features',
  icon: 'lotus',

  keywords: [
      "yoga retreat",
      "yoga",
      "retreat",
      "yoga software",
      "yoga app",
      "yoga platform",
      "yoga system",
      "yoga management",
      "wellness yoga"
  ],

  synonyms: [
      "Yoga Retreat platform",
      "Yoga Retreat software",
      "Yoga Retreat system",
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
      "Build a yoga retreat platform",
      "Create a yoga retreat app",
      "I need a yoga retreat management system",
      "Build a yoga retreat solution",
      "Create a yoga retreat booking system"
  ],
};
