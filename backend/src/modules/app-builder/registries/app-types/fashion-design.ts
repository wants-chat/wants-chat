/**
 * Fashion Design App Type Definition
 *
 * Complete definition for fashion design applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FASHION_DESIGN_APP_TYPE: AppTypeDefinition = {
  id: 'fashion-design',
  name: 'Fashion Design',
  category: 'services',
  description: 'Fashion Design platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "fashion design",
      "fashion",
      "design",
      "fashion software",
      "fashion app",
      "fashion platform",
      "fashion system",
      "fashion management",
      "services fashion"
  ],

  synonyms: [
      "Fashion Design platform",
      "Fashion Design software",
      "Fashion Design system",
      "fashion solution",
      "fashion service"
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
      "Build a fashion design platform",
      "Create a fashion design app",
      "I need a fashion design management system",
      "Build a fashion design solution",
      "Create a fashion design booking system"
  ],
};
