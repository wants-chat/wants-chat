/**
 * Real Estate Training App Type Definition
 *
 * Complete definition for real estate training applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const REAL_ESTATE_TRAINING_APP_TYPE: AppTypeDefinition = {
  id: 'real-estate-training',
  name: 'Real Estate Training',
  category: 'education',
  description: 'Real Estate Training platform with comprehensive management features',
  icon: 'certificate',

  keywords: [
      "real estate training",
      "real",
      "estate",
      "training",
      "real software",
      "real app",
      "real platform",
      "real system",
      "real management",
      "education real"
  ],

  synonyms: [
      "Real Estate Training platform",
      "Real Estate Training software",
      "Real Estate Training system",
      "real solution",
      "real service"
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
          "name": "Instructor",
          "level": 40,
          "isDefault": false,
          "accessibleSections": [
              "admin"
          ],
          "defaultRoute": "/admin/dashboard"
      },
      {
          "id": "user",
          "name": "Student",
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
      "course-management",
      "enrollment",
      "calendar",
      "certificates",
      "notifications"
  ],

  optionalFeatures: [
      "lms",
      "assignments",
      "payments",
      "attendance",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'education',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'professional',

  examplePrompts: [
      "Build a real estate training platform",
      "Create a real estate training app",
      "I need a real estate training management system",
      "Build a real estate training solution",
      "Create a real estate training booking system"
  ],
};
