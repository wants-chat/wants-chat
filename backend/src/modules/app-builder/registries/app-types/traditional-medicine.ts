/**
 * Traditional Medicine App Type Definition
 *
 * Complete definition for traditional medicine applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRADITIONAL_MEDICINE_APP_TYPE: AppTypeDefinition = {
  id: 'traditional-medicine',
  name: 'Traditional Medicine',
  category: 'services',
  description: 'Traditional Medicine platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "traditional medicine",
      "traditional",
      "medicine",
      "traditional software",
      "traditional app",
      "traditional platform",
      "traditional system",
      "traditional management",
      "services traditional"
  ],

  synonyms: [
      "Traditional Medicine platform",
      "Traditional Medicine software",
      "Traditional Medicine system",
      "traditional solution",
      "traditional service"
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
      "Build a traditional medicine platform",
      "Create a traditional medicine app",
      "I need a traditional medicine management system",
      "Build a traditional medicine solution",
      "Create a traditional medicine booking system"
  ],
};
