import { DocumentFormat } from '../dto/document.dto';

export interface DocumentTemplate {
  name: string;
  description: string;
  format: DocumentFormat;
  variables: string[];
  content: string;
  options?: Record<string, any>;
}

/**
 * Invoice Template
 */
export const invoiceTemplate: DocumentTemplate = {
  name: 'invoice',
  description: 'Professional invoice template with itemized billing',
  format: DocumentFormat.PDF,
  variables: [
    'companyName',
    'companyAddress',
    'companyEmail',
    'companyPhone',
    'clientName',
    'clientAddress',
    'clientEmail',
    'invoiceNumber',
    'invoiceDate',
    'dueDate',
    'items', // Array of { description, quantity, unitPrice, total }
    'subtotal',
    'taxRate',
    'taxAmount',
    'total',
    'notes',
    'paymentTerms',
  ],
  content: `
# INVOICE

**Invoice Number:** {{invoiceNumber}}
**Date:** {{invoiceDate}}
**Due Date:** {{dueDate}}

---

## From
**{{companyName}}**
{{companyAddress}}
Email: {{companyEmail}}
Phone: {{companyPhone}}

## Bill To
**{{clientName}}**
{{clientAddress}}
Email: {{clientEmail}}

---

## Items

| Description | Quantity | Unit Price | Total |
|-------------|----------|------------|-------|
{{#each items}}
| {{description}} | {{quantity}} | {{unitPrice}} | {{total}} |
{{/each}}

---

| | |
|---|---|
| **Subtotal** | {{subtotal}} |
| **Tax ({{taxRate}}%)** | {{taxAmount}} |
| **Total** | **{{total}}** |

---

### Payment Terms
{{paymentTerms}}

### Notes
{{notes}}

Thank you for your business!
`,
  options: {
    pageSize: 'A4',
    margins: { top: 72, bottom: 72, left: 72, right: 72 },
  },
};

/**
 * Report Template
 */
export const reportTemplate: DocumentTemplate = {
  name: 'report',
  description: 'Business report template with executive summary and sections',
  format: DocumentFormat.PDF,
  variables: [
    'title',
    'subtitle',
    'author',
    'date',
    'executiveSummary',
    'sections', // Array of { title, content }
    'conclusions',
    'recommendations',
  ],
  content: `
# {{title}}

**{{subtitle}}**

Prepared by: {{author}}
Date: {{date}}

---

## Executive Summary

{{executiveSummary}}

---

{{#each sections}}
## {{title}}

{{content}}

{{/each}}

---

## Conclusions

{{conclusions}}

---

## Recommendations

{{recommendations}}
`,
  options: {
    pageSize: 'A4',
    tableOfContents: true,
    margins: { top: 72, bottom: 72, left: 72, right: 72 },
  },
};

/**
 * Resume/CV Template
 */
export const resumeTemplate: DocumentTemplate = {
  name: 'resume',
  description: 'Professional resume/CV template',
  format: DocumentFormat.DOCX,
  variables: [
    'fullName',
    'title',
    'email',
    'phone',
    'location',
    'linkedIn',
    'website',
    'summary',
    'experience', // Array of { company, title, dates, location, achievements }
    'education', // Array of { institution, degree, dates, details }
    'skills', // Array of strings
    'certifications', // Array of { name, issuer, date }
  ],
  content: `
# {{fullName}}

**{{title}}**

{{email}} | {{phone}} | {{location}}
{{#if linkedIn}}LinkedIn: {{linkedIn}}{{/if}}
{{#if website}}Website: {{website}}{{/if}}

---

## Professional Summary

{{summary}}

---

## Experience

{{#each experience}}
### {{title}}
**{{company}}** | {{location}}
*{{dates}}*

{{#each achievements}}
- {{this}}
{{/each}}

{{/each}}

---

## Education

{{#each education}}
### {{degree}}
**{{institution}}**
*{{dates}}*
{{#if details}}{{details}}{{/if}}

{{/each}}

---

## Skills

{{#each skills}}
- {{this}}
{{/each}}

{{#if certifications}}
---

## Certifications

{{#each certifications}}
- **{{name}}** - {{issuer}} ({{date}})
{{/each}}
{{/if}}
`,
  options: {
    pageSize: 'A4',
    margins: { top: 54, bottom: 54, left: 54, right: 54 },
  },
};

/**
 * Meeting Minutes Template
 */
export const meetingMinutesTemplate: DocumentTemplate = {
  name: 'meeting-minutes',
  description: 'Template for documenting meeting discussions and action items',
  format: DocumentFormat.DOCX,
  variables: [
    'meetingTitle',
    'date',
    'time',
    'location',
    'facilitator',
    'attendees', // Array of strings
    'absentees', // Array of strings
    'agendaItems', // Array of { topic, discussion, decisions }
    'actionItems', // Array of { task, assignee, dueDate }
    'nextMeeting',
    'notes',
  ],
  content: `
# Meeting Minutes

## {{meetingTitle}}

**Date:** {{date}}
**Time:** {{time}}
**Location:** {{location}}
**Facilitator:** {{facilitator}}

---

## Attendees
{{#each attendees}}
- {{this}}
{{/each}}

{{#if absentees}}
## Absent
{{#each absentees}}
- {{this}}
{{/each}}
{{/if}}

---

## Agenda & Discussion

{{#each agendaItems}}
### {{topic}}

**Discussion:**
{{discussion}}

**Decisions:**
{{decisions}}

{{/each}}

---

## Action Items

| Task | Assignee | Due Date |
|------|----------|----------|
{{#each actionItems}}
| {{task}} | {{assignee}} | {{dueDate}} |
{{/each}}

---

**Next Meeting:** {{nextMeeting}}

{{#if notes}}
## Additional Notes
{{notes}}
{{/if}}
`,
  options: {
    pageSize: 'A4',
  },
};

/**
 * Project Proposal Template
 */
export const projectProposalTemplate: DocumentTemplate = {
  name: 'project-proposal',
  description: 'Template for business project proposals',
  format: DocumentFormat.PDF,
  variables: [
    'projectTitle',
    'clientName',
    'preparedBy',
    'date',
    'executiveSummary',
    'background',
    'objectives', // Array of strings
    'scope',
    'methodology',
    'timeline', // Array of { phase, description, duration }
    'budget', // Array of { item, cost }
    'totalBudget',
    'deliverables', // Array of strings
    'teamMembers', // Array of { name, role }
    'risksAndMitigation',
    'conclusion',
  ],
  content: `
# Project Proposal

## {{projectTitle}}

Prepared for: **{{clientName}}**
Prepared by: **{{preparedBy}}**
Date: {{date}}

---

## Executive Summary

{{executiveSummary}}

---

## Background

{{background}}

---

## Objectives

{{#each objectives}}
{{@index}}. {{this}}
{{/each}}

---

## Scope

{{scope}}

---

## Methodology

{{methodology}}

---

## Project Timeline

| Phase | Description | Duration |
|-------|-------------|----------|
{{#each timeline}}
| {{phase}} | {{description}} | {{duration}} |
{{/each}}

---

## Budget

| Item | Cost |
|------|------|
{{#each budget}}
| {{item}} | {{cost}} |
{{/each}}
| **Total** | **{{totalBudget}}** |

---

## Deliverables

{{#each deliverables}}
- {{this}}
{{/each}}

---

## Team

| Name | Role |
|------|------|
{{#each teamMembers}}
| {{name}} | {{role}} |
{{/each}}

---

## Risks and Mitigation

{{risksAndMitigation}}

---

## Conclusion

{{conclusion}}
`,
  options: {
    pageSize: 'A4',
    tableOfContents: true,
  },
};

/**
 * Business Presentation Template
 */
export const presentationTemplate: DocumentTemplate = {
  name: 'presentation',
  description: 'Business presentation template for slideshows',
  format: DocumentFormat.PPTX,
  variables: [
    'title',
    'subtitle',
    'author',
    'date',
    'slides', // Array of { title, bullets, notes }
  ],
  content: `
# {{title}}

{{subtitle}}

{{author}} | {{date}}

---

{{#each slides}}
## {{title}}

{{#each bullets}}
- {{this}}
{{/each}}

{{/each}}
`,
  options: {
    slideWidth: 10,
    slideHeight: 7.5,
  },
};

/**
 * Letter Template
 */
export const letterTemplate: DocumentTemplate = {
  name: 'letter',
  description: 'Formal business letter template',
  format: DocumentFormat.PDF,
  variables: [
    'senderName',
    'senderTitle',
    'senderCompany',
    'senderAddress',
    'senderEmail',
    'senderPhone',
    'date',
    'recipientName',
    'recipientTitle',
    'recipientCompany',
    'recipientAddress',
    'subject',
    'salutation',
    'body', // Array of paragraphs
    'closing',
    'signature',
  ],
  content: `
{{senderName}}
{{#if senderTitle}}{{senderTitle}}{{/if}}
{{#if senderCompany}}{{senderCompany}}{{/if}}
{{senderAddress}}
{{senderEmail}}
{{senderPhone}}

{{date}}

{{recipientName}}
{{#if recipientTitle}}{{recipientTitle}}{{/if}}
{{#if recipientCompany}}{{recipientCompany}}{{/if}}
{{recipientAddress}}

**Subject: {{subject}}**

{{salutation}}

{{#each body}}
{{this}}

{{/each}}

{{closing}}

{{signature}}
{{senderName}}
`,
  options: {
    pageSize: 'letter',
  },
};

/**
 * Contract Template
 */
export const contractTemplate: DocumentTemplate = {
  name: 'contract',
  description: 'Basic contract agreement template',
  format: DocumentFormat.PDF,
  variables: [
    'contractTitle',
    'effectiveDate',
    'party1Name',
    'party1Address',
    'party2Name',
    'party2Address',
    'recitals', // Array of strings
    'terms', // Array of { title, content }
    'governingLaw',
    'signatureDate',
  ],
  content: `
# {{contractTitle}}

**Effective Date:** {{effectiveDate}}

---

## Parties

**Party 1:**
{{party1Name}}
{{party1Address}}

**Party 2:**
{{party2Name}}
{{party2Address}}

---

## Recitals

{{#each recitals}}
WHEREAS, {{this}}

{{/each}}

NOW, THEREFORE, in consideration of the mutual covenants and agreements herein contained, the parties agree as follows:

---

## Terms and Conditions

{{#each terms}}
### {{@index}}. {{title}}

{{content}}

{{/each}}

---

## Governing Law

This Agreement shall be governed by and construed in accordance with the laws of {{governingLaw}}.

---

## Signatures

IN WITNESS WHEREOF, the parties have executed this Agreement as of {{signatureDate}}.

**{{party1Name}}**

Signature: _____________________________

Date: _____________________________

**{{party2Name}}**

Signature: _____________________________

Date: _____________________________
`,
  options: {
    pageSize: 'A4',
    tableOfContents: false,
  },
};

/**
 * All available templates
 */
export const documentTemplates: DocumentTemplate[] = [
  invoiceTemplate,
  reportTemplate,
  resumeTemplate,
  meetingMinutesTemplate,
  projectProposalTemplate,
  presentationTemplate,
  letterTemplate,
  contractTemplate,
];

/**
 * Get template by name
 */
export function getTemplateByName(name: string): DocumentTemplate | undefined {
  return documentTemplates.find(t => t.name === name);
}

/**
 * Get all templates for a specific format
 */
export function getTemplatesByFormat(format: DocumentFormat): DocumentTemplate[] {
  return documentTemplates.filter(t => t.format === format);
}

/**
 * Apply variables to template content
 * Simple Handlebars-like variable replacement
 */
export function applyTemplateVariables(
  template: DocumentTemplate,
  variables: Record<string, any>,
): string {
  let content = template.content;

  // Replace simple variables {{variable}}
  content = content.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
    return variables[varName] !== undefined ? String(variables[varName]) : match;
  });

  // Handle {{#each array}} ... {{/each}} blocks
  content = content.replace(
    /\{\{#each (\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g,
    (match, arrayName, block) => {
      const array = variables[arrayName];
      if (!Array.isArray(array)) return '';

      return array
        .map((item, index) => {
          let itemContent = block;

          // Replace {{this}} for simple arrays
          if (typeof item === 'string' || typeof item === 'number') {
            itemContent = itemContent.replace(/\{\{this\}\}/g, String(item));
          }
          // Replace {{property}} for object arrays
          else if (typeof item === 'object') {
            for (const [key, value] of Object.entries(item)) {
              itemContent = itemContent.replace(
                new RegExp(`\\{\\{${key}\\}\\}`, 'g'),
                String(value),
              );
            }
          }

          // Replace {{@index}}
          itemContent = itemContent.replace(/\{\{@index\}\}/g, String(index + 1));

          return itemContent;
        })
        .join('');
    },
  );

  // Handle {{#if variable}} ... {{/if}} blocks
  content = content.replace(
    /\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (match, varName, block) => {
      const value = variables[varName];
      if (value && (Array.isArray(value) ? value.length > 0 : true)) {
        return block;
      }
      return '';
    },
  );

  return content;
}
