/**
 * Employee Benefits App Type Definition
 *
 * Complete definition for employee benefits applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const EMPLOYEE_BENEFITS_APP_TYPE: AppTypeDefinition = {
  id: 'employee-benefits',
  name: 'Employee Benefits',
  category: 'services',
  description: 'Employee Benefits platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "employee benefits",
      "employee",
      "benefits",
      "employee software",
      "employee app",
      "employee platform",
      "employee system",
      "employee management",
      "services employee"
  ],

  synonyms: [
      "Employee Benefits platform",
      "Employee Benefits software",
      "Employee Benefits system",
      "employee solution",
      "employee service"
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
      "Build a employee benefits platform",
      "Create a employee benefits app",
      "I need a employee benefits management system",
      "Build a employee benefits solution",
      "Create a employee benefits booking system"
  ],
};
