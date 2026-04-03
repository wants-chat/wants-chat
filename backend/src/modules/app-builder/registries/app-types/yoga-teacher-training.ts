/**
 * Yoga Teacher Training App Type Definition
 *
 * Complete definition for yoga teacher training applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const YOGA_TEACHER_TRAINING_APP_TYPE: AppTypeDefinition = {
  id: 'yoga-teacher-training',
  name: 'Yoga Teacher Training',
  category: 'fitness',
  description: 'Yoga Teacher Training platform with comprehensive management features',
  icon: 'lotus',

  keywords: [
      "yoga teacher training",
      "yoga",
      "teacher",
      "training",
      "yoga software",
      "yoga app",
      "yoga platform",
      "yoga system",
      "yoga management",
      "wellness yoga"
  ],

  synonyms: [
      "Yoga Teacher Training platform",
      "Yoga Teacher Training software",
      "Yoga Teacher Training system",
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
      "Build a yoga teacher training platform",
      "Create a yoga teacher training app",
      "I need a yoga teacher training management system",
      "Build a yoga teacher training solution",
      "Create a yoga teacher training booking system"
  ],
};
