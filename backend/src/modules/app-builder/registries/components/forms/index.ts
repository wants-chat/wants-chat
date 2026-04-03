/**
 * Form Components Registry Index
 */

export { LOGIN_FORM_COMPONENT } from './login-form';
export { REGISTER_FORM_COMPONENT } from './register-form';
export { CONTACT_FORM_COMPONENT } from './contact-form';
export { PROFILE_FORM_COMPONENT } from './profile-form';
export { PRODUCT_FORM_COMPONENT } from './product-form';

import { ComponentDefinition } from '../../../interfaces/component.interface';
import { LOGIN_FORM_COMPONENT } from './login-form';
import { REGISTER_FORM_COMPONENT } from './register-form';
import { CONTACT_FORM_COMPONENT } from './contact-form';
import { PROFILE_FORM_COMPONENT } from './profile-form';
import { PRODUCT_FORM_COMPONENT } from './product-form';

export const FORM_COMPONENTS: ComponentDefinition[] = [
  LOGIN_FORM_COMPONENT,
  REGISTER_FORM_COMPONENT,
  CONTACT_FORM_COMPONENT,
  PROFILE_FORM_COMPONENT,
  PRODUCT_FORM_COMPONENT,
];
