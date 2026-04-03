/**
 * Review Management App Type Definition
 *
 * Complete definition for review management applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const REVIEW_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'review-management',
  name: 'Review Management',
  category: 'services',
  description: 'Review Management platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "review management",
      "review",
      "management",
      "review software",
      "review app",
      "review platform",
      "review system",
      "services review"
  ],

  synonyms: [
      "Review Management platform",
      "Review Management software",
      "Review Management system",
      "review solution",
      "review service"
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
      "Build a review management platform",
      "Create a review management app",
      "I need a review management management system",
      "Build a review management solution",
      "Create a review management booking system"
  ],
};
