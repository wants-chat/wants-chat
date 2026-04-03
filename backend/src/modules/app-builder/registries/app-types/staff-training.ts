/**
 * Staff Training App Type Definition
 *
 * Complete definition for staff training applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STAFF_TRAINING_APP_TYPE: AppTypeDefinition = {
  id: 'staff-training',
  name: 'Staff Training',
  category: 'education',
  description: 'Staff Training platform with comprehensive management features',
  icon: 'certificate',

  keywords: [
      "staff training",
      "staff",
      "training",
      "staff software",
      "staff app",
      "staff platform",
      "staff system",
      "staff management",
      "education staff"
  ],

  synonyms: [
      "Staff Training platform",
      "Staff Training software",
      "Staff Training system",
      "staff solution",
      "staff service"
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
      "Build a staff training platform",
      "Create a staff training app",
      "I need a staff training management system",
      "Build a staff training solution",
      "Create a staff training booking system"
  ],
};
