/**
 * Senior Housing App Type Definition
 *
 * Complete definition for senior housing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SENIOR_HOUSING_APP_TYPE: AppTypeDefinition = {
  id: 'senior-housing',
  name: 'Senior Housing',
  category: 'services',
  description: 'Senior Housing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "senior housing",
      "senior",
      "housing",
      "senior software",
      "senior app",
      "senior platform",
      "senior system",
      "senior management",
      "services senior"
  ],

  synonyms: [
      "Senior Housing platform",
      "Senior Housing software",
      "Senior Housing system",
      "senior solution",
      "senior service"
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
      "Build a senior housing platform",
      "Create a senior housing app",
      "I need a senior housing management system",
      "Build a senior housing solution",
      "Create a senior housing booking system"
  ],
};
