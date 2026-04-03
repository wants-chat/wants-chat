/**
 * Aerial Yoga App Type Definition
 *
 * Complete definition for aerial yoga applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AERIAL_YOGA_APP_TYPE: AppTypeDefinition = {
  id: 'aerial-yoga',
  name: 'Aerial Yoga',
  category: 'fitness',
  description: 'Aerial Yoga platform with comprehensive management features',
  icon: 'lotus',

  keywords: [
      "aerial yoga",
      "aerial",
      "yoga",
      "aerial software",
      "aerial app",
      "aerial platform",
      "aerial system",
      "aerial management",
      "wellness aerial"
  ],

  synonyms: [
      "Aerial Yoga platform",
      "Aerial Yoga software",
      "Aerial Yoga system",
      "aerial solution",
      "aerial service"
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
      "Build a aerial yoga platform",
      "Create a aerial yoga app",
      "I need a aerial yoga management system",
      "Build a aerial yoga solution",
      "Create a aerial yoga booking system"
  ],
};
