/**
 * Staff Augmentation App Type Definition
 *
 * Complete definition for staff augmentation applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STAFF_AUGMENTATION_APP_TYPE: AppTypeDefinition = {
  id: 'staff-augmentation',
  name: 'Staff Augmentation',
  category: 'services',
  description: 'Staff Augmentation platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "staff augmentation",
      "staff",
      "augmentation",
      "staff software",
      "staff app",
      "staff platform",
      "staff system",
      "staff management",
      "services staff"
  ],

  synonyms: [
      "Staff Augmentation platform",
      "Staff Augmentation software",
      "Staff Augmentation system",
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
      "Build a staff augmentation platform",
      "Create a staff augmentation app",
      "I need a staff augmentation management system",
      "Build a staff augmentation solution",
      "Create a staff augmentation booking system"
  ],
};
