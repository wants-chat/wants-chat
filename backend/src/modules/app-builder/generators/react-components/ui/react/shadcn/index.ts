// Import all shadcn/ui component generators
import { generateButton } from './button';
import { generateInput } from './input';
import { generateCard } from './card';
import { generateDialog } from './dialog';
import { generateLabel } from './label';
import { generateCheckbox } from './checkbox';
import { generateSelect } from './select';
import { generateTextarea } from './textarea';
import { generateBadge } from './badge';
import { generateAvatar } from './avatar';
import { generateSeparator } from './separator';
import { generateDropdownMenu } from './dropdown-menu';
import { generateAlert } from './alert';
import { generateAlertDialog } from './alert-dialog';
import { generateSonner } from './sonner';
import { generateTable } from './table';
import { generateScrollArea } from './scroll-area';
import { generateRadioGroup } from './radio-group';
import { generateSlider } from './slider';
import { generateAccordion } from './accordion';
import { generateTabs } from './tabs';
import { generateSheet } from './sheet';
import { generateCollapsible } from './collapsible';
import { generateProgress } from './progress';
import { generateSwitch } from './switch';

// Export component generators (for react-frontend-generator.service.ts)
export { generateButtonComponent } from './button.generator';
export { generateCardComponent } from './card.generator';
export { generateInputComponent } from './input.generator';
export { generateLabelComponent } from './label.generator';
export { generateTableComponent } from './table.generator';
export { generateDropdownMenuComponent } from './dropdown-menu.generator';
export { generateTextareaComponent } from './textarea.generator';
export { generateBadgeComponent } from './badge.generator';
export { generateSeparatorComponent } from './separator.generator';
export { generateSelectComponent } from './select.generator';
export { generateTabsComponent } from './tabs.generator';
export { generateAvatarComponent } from './avatar.generator';
export { generateCheckboxComponent } from './checkbox.generator';
export { generateSliderComponent } from './slider.generator';
export { generateSheetComponent } from './sheet.generator';
export { generateCollapsibleComponent } from './collapsible.generator';
export { generateDialogComponent } from './dialog.generator';

// Export all generators
export {
  generateButton,
  generateInput,
  generateCard,
  generateDialog,
  generateLabel,
  generateCheckbox,
  generateSelect,
  generateTextarea,
  generateBadge,
  generateAvatar,
  generateSeparator,
  generateDropdownMenu,
  generateAlert,
  generateAlertDialog,
  generateSonner,
  generateTable,
  generateScrollArea,
  generateRadioGroup,
  generateSlider,
  generateAccordion,
  generateTabs,
  generateSheet,
  generateCollapsible,
  generateProgress,
  generateSwitch,
};

/**
 * Map of all shadcn/ui component generators
 * Key: component name (lowercase)
 * Value: generator function
 */
export const shadcnGenerators = {
  button: generateButton,
  input: generateInput,
  card: generateCard,
  dialog: generateDialog,
  label: generateLabel,
  checkbox: generateCheckbox,
  select: generateSelect,
  textarea: generateTextarea,
  badge: generateBadge,
  avatar: generateAvatar,
  separator: generateSeparator,
  'dropdown-menu': generateDropdownMenu,
  dropdown: generateDropdownMenu, // alias
  alert: generateAlert,
  'alert-dialog': generateAlertDialog,
  modal: generateDialog, // alias
  sonner: generateSonner,
  table: generateTable,
  'scroll-area': generateScrollArea,
  'radio-group': generateRadioGroup,
  slider: generateSlider,
  accordion: generateAccordion,
  tabs: generateTabs,
  sheet: generateSheet,
  collapsible: generateCollapsible,
  progress: generateProgress,
  switch: generateSwitch,
};

/**
 * Get a shadcn/ui component generator by name
 */
export function getShadcnGenerator(componentName: string) {
  const name = componentName.toLowerCase().replace(/_/g, '-');
  return shadcnGenerators[name];
}