/**
 * Prenatal Yoga App Type Definition
 *
 * Complete definition for prenatal yoga applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PRENATAL_YOGA_APP_TYPE: AppTypeDefinition = {
  id: 'prenatal-yoga',
  name: 'Prenatal Yoga',
  category: 'fitness',
  description: 'Prenatal Yoga platform with comprehensive management features',
  icon: 'lotus',

  keywords: [
      "prenatal yoga",
      "prenatal",
      "yoga",
      "prenatal software",
      "prenatal app",
      "prenatal platform",
      "prenatal system",
      "prenatal management",
      "wellness prenatal"
  ],

  synonyms: [
      "Prenatal Yoga platform",
      "Prenatal Yoga software",
      "Prenatal Yoga system",
      "prenatal solution",
      "prenatal service"
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
      "Build a prenatal yoga platform",
      "Create a prenatal yoga app",
      "I need a prenatal yoga management system",
      "Build a prenatal yoga solution",
      "Create a prenatal yoga booking system"
  ],
};
