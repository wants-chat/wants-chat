/**
 * College Prep App Type Definition
 *
 * Complete definition for college prep applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const COLLEGE_PREP_APP_TYPE: AppTypeDefinition = {
  id: 'college-prep',
  name: 'College Prep',
  category: 'services',
  description: 'College Prep platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "college prep",
      "college",
      "prep",
      "college software",
      "college app",
      "college platform",
      "college system",
      "college management",
      "services college"
  ],

  synonyms: [
      "College Prep platform",
      "College Prep software",
      "College Prep system",
      "college solution",
      "college service"
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
      "Build a college prep platform",
      "Create a college prep app",
      "I need a college prep management system",
      "Build a college prep solution",
      "Create a college prep booking system"
  ],
};
