/**
 * Safety Training App Type Definition
 *
 * Complete definition for safety training applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SAFETY_TRAINING_APP_TYPE: AppTypeDefinition = {
  id: 'safety-training',
  name: 'Safety Training',
  category: 'education',
  description: 'Safety Training platform with comprehensive management features',
  icon: 'certificate',

  keywords: [
      "safety training",
      "safety",
      "training",
      "safety software",
      "safety app",
      "safety platform",
      "safety system",
      "safety management",
      "education safety"
  ],

  synonyms: [
      "Safety Training platform",
      "Safety Training software",
      "Safety Training system",
      "safety solution",
      "safety service"
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
      "Build a safety training platform",
      "Create a safety training app",
      "I need a safety training management system",
      "Build a safety training solution",
      "Create a safety training booking system"
  ],
};
