/**
 * Blood Bank App Type Definition
 *
 * Complete definition for blood bank applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BLOOD_BANK_APP_TYPE: AppTypeDefinition = {
  id: 'blood-bank',
  name: 'Blood Bank',
  category: 'services',
  description: 'Blood Bank platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "blood bank",
      "blood",
      "bank",
      "blood software",
      "blood app",
      "blood platform",
      "blood system",
      "blood management",
      "services blood"
  ],

  synonyms: [
      "Blood Bank platform",
      "Blood Bank software",
      "Blood Bank system",
      "blood solution",
      "blood service"
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
      "Build a blood bank platform",
      "Create a blood bank app",
      "I need a blood bank management system",
      "Build a blood bank solution",
      "Create a blood bank booking system"
  ],
};
