/**
 * Virtual Training App Type Definition
 *
 * Complete definition for virtual training applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VIRTUAL_TRAINING_APP_TYPE: AppTypeDefinition = {
  id: 'virtual-training',
  name: 'Virtual Training',
  category: 'education',
  description: 'Virtual Training platform with comprehensive management features',
  icon: 'certificate',

  keywords: [
      "virtual training",
      "virtual",
      "training",
      "virtual software",
      "virtual app",
      "virtual platform",
      "virtual system",
      "virtual management",
      "education virtual"
  ],

  synonyms: [
      "Virtual Training platform",
      "Virtual Training software",
      "Virtual Training system",
      "virtual solution",
      "virtual service"
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
      "Build a virtual training platform",
      "Create a virtual training app",
      "I need a virtual training management system",
      "Build a virtual training solution",
      "Create a virtual training booking system"
  ],
};
