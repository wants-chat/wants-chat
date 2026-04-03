/**
 * Yoga Apparel App Type Definition
 *
 * Complete definition for yoga apparel applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const YOGA_APPAREL_APP_TYPE: AppTypeDefinition = {
  id: 'yoga-apparel',
  name: 'Yoga Apparel',
  category: 'fitness',
  description: 'Yoga Apparel platform with comprehensive management features',
  icon: 'lotus',

  keywords: [
      "yoga apparel",
      "yoga",
      "apparel",
      "yoga software",
      "yoga app",
      "yoga platform",
      "yoga system",
      "yoga management",
      "wellness yoga"
  ],

  synonyms: [
      "Yoga Apparel platform",
      "Yoga Apparel software",
      "Yoga Apparel system",
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
      "Build a yoga apparel platform",
      "Create a yoga apparel app",
      "I need a yoga apparel management system",
      "Build a yoga apparel solution",
      "Create a yoga apparel booking system"
  ],
};
