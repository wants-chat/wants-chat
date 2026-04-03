/**
 * General Medicine App Type Definition
 *
 * Complete definition for general medicine applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const GENERAL_MEDICINE_APP_TYPE: AppTypeDefinition = {
  id: 'general-medicine',
  name: 'General Medicine',
  category: 'services',
  description: 'General Medicine platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "general medicine",
      "general",
      "medicine",
      "general software",
      "general app",
      "general platform",
      "general system",
      "general management",
      "services general"
  ],

  synonyms: [
      "General Medicine platform",
      "General Medicine software",
      "General Medicine system",
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
      "Build a general medicine platform",
      "Create a general medicine app",
      "I need a general medicine management system",
      "Build a general medicine solution",
      "Create a general medicine booking system"
  ],
};
