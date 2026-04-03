/**
 * First Aid Training App Type Definition
 *
 * Complete definition for first aid training applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FIRST_AID_TRAINING_APP_TYPE: AppTypeDefinition = {
  id: 'first-aid-training',
  name: 'First Aid Training',
  category: 'education',
  description: 'First Aid Training platform with comprehensive management features',
  icon: 'certificate',

  keywords: [
      "first aid training",
      "first",
      "aid",
      "training",
      "first software",
      "first app",
      "first platform",
      "first system",
      "first management",
      "education first"
  ],

  synonyms: [
      "First Aid Training platform",
      "First Aid Training software",
      "First Aid Training system",
      "first solution",
      "first service"
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
      "Build a first aid training platform",
      "Create a first aid training app",
      "I need a first aid training management system",
      "Build a first aid training solution",
      "Create a first aid training booking system"
  ],
};
