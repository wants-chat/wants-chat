/**
 * General Practice App Type Definition
 *
 * Complete definition for general practice applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const GENERAL_PRACTICE_APP_TYPE: AppTypeDefinition = {
  id: 'general-practice',
  name: 'General Practice',
  category: 'services',
  description: 'General Practice platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "general practice",
      "general",
      "practice",
      "general software",
      "general app",
      "general platform",
      "general system",
      "general management",
      "services general"
  ],

  synonyms: [
      "General Practice platform",
      "General Practice software",
      "General Practice system",
      "general solution",
      "general service"
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
      "Build a general practice platform",
      "Create a general practice app",
      "I need a general practice management system",
      "Build a general practice solution",
      "Create a general practice booking system"
  ],
};
