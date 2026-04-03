import { Blueprint } from './blueprint.interface';

/**
 * Radiology Center Blueprint
 */
export const radiologyBlueprint: Blueprint = {
  appType: 'radiology',
  description: 'Radiology center app with patients, imaging studies, scan management, and reporting',

  coreEntities: ['patient', 'appointment', 'imaging_study', 'scan', 'report', 'radiologist', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Appointments', path: '/appointments', icon: 'Calendar' },
        { label: 'Patients', path: '/patients', icon: 'Users' },
        { label: 'Imaging Queue', path: '/queue', icon: 'ListOrdered' },
        { label: 'Scan Viewer', path: '/viewer', icon: 'Image' },
        { label: 'Reports', path: '/reports', icon: 'FileText' },
        { label: 'Radiologists', path: '/radiologists', icon: 'UserCheck' },
        { label: 'Billing', path: '/billing', icon: 'Receipt' },
      ]}},
      { id: 'radiology-stats', component: 'radiology-stats', position: 'main' },
      { id: 'imaging-queue', component: 'imaging-queue', entity: 'imaging_study', position: 'main' },
    ]},
    { path: '/appointments', name: 'Appointments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'appointment-calendar', component: 'appointment-calendar', entity: 'appointment', position: 'main' },
    ]},
    { path: '/appointments/new', name: 'New Appointment', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'appointment-form', component: 'appointment-form', entity: 'appointment', position: 'main' },
    ]},
    { path: '/patients', name: 'Patients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'patient-filters', component: 'patient-filters', entity: 'patient', position: 'main' },
      { id: 'patient-table', component: 'data-table', entity: 'patient', position: 'main' },
    ]},
    { path: '/patients/:id', name: 'Patient Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'patient-profile', component: 'patient-profile', entity: 'patient', position: 'main' },
      { id: 'imaging-history', component: 'data-list', entity: 'imaging_study', position: 'main' },
    ]},
    { path: '/queue', name: 'Imaging Queue', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'imaging-queue', component: 'imaging-queue', entity: 'imaging_study', position: 'main' },
    ]},
    { path: '/viewer', name: 'Scan Viewer', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'scan-viewer', component: 'scan-viewer', entity: 'scan', position: 'main' },
    ]},
    { path: '/reports', name: 'Reports', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'report-list', component: 'data-table', entity: 'report', position: 'main' },
    ]},
    { path: '/radiologists', name: 'Radiologists', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'radiologist-grid', component: 'doctor-grid', entity: 'radiologist', position: 'main' },
    ]},
    { path: '/radiologists/:id', name: 'Radiologist Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'radiologist-profile', component: 'doctor-profile', entity: 'radiologist', position: 'main' },
      { id: 'radiologist-schedule', component: 'doctor-schedule', entity: 'appointment', position: 'main' },
    ]},
    { path: '/billing', name: 'Billing', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'billing-stats', component: 'stats-cards', position: 'main' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/appointments', entity: 'appointment', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/appointments', entity: 'appointment', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/patients', entity: 'patient', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/patients/:id', entity: 'patient', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/patients', entity: 'patient', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/studies', entity: 'imaging_study', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/studies', entity: 'imaging_study', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/scans', entity: 'scan', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/reports', entity: 'report', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/reports', entity: 'report', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/radiologists', entity: 'radiologist', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    patient: {
      defaultFields: [
        { name: 'patient_id', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'date_of_birth', type: 'date', required: true },
        { name: 'gender', type: 'enum' },
        { name: 'address', type: 'json' },
        { name: 'insurance', type: 'json' },
        { name: 'allergies', type: 'json' },
        { name: 'contrast_allergy', type: 'boolean' },
        { name: 'claustrophobic', type: 'boolean' },
        { name: 'pacemaker', type: 'boolean' },
        { name: 'metal_implants', type: 'json' },
        { name: 'referring_physician', type: 'json' },
      ],
      relationships: [
        { type: 'hasMany', target: 'appointment' },
        { type: 'hasMany', target: 'imaging_study' },
        { type: 'hasMany', target: 'invoice' },
      ],
    },
    appointment: {
      defaultFields: [
        { name: 'date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime', required: true },
        { name: 'modality', type: 'enum', required: true },
        { name: 'body_part', type: 'string' },
        { name: 'status', type: 'enum', required: true },
        { name: 'preparation_instructions', type: 'text' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
        { type: 'belongsTo', target: 'radiologist' },
      ],
    },
    imaging_study: {
      defaultFields: [
        { name: 'accession_number', type: 'string', required: true },
        { name: 'study_date', type: 'datetime', required: true },
        { name: 'modality', type: 'enum', required: true },
        { name: 'body_part', type: 'string', required: true },
        { name: 'clinical_indication', type: 'text' },
        { name: 'protocol', type: 'string' },
        { name: 'contrast_used', type: 'boolean' },
        { name: 'contrast_type', type: 'string' },
        { name: 'technologist', type: 'string' },
        { name: 'status', type: 'enum', required: true },
        { name: 'priority', type: 'enum' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
        { type: 'belongsTo', target: 'appointment' },
        { type: 'hasMany', target: 'scan' },
        { type: 'hasOne', target: 'report' },
      ],
    },
    scan: {
      defaultFields: [
        { name: 'series_number', type: 'integer', required: true },
        { name: 'series_description', type: 'string' },
        { name: 'image_count', type: 'integer' },
        { name: 'slice_thickness', type: 'decimal' },
        { name: 'file_path', type: 'string' },
        { name: 'dicom_uid', type: 'string' },
        { name: 'acquisition_time', type: 'datetime' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'imaging_study' },
      ],
    },
    report: {
      defaultFields: [
        { name: 'report_date', type: 'datetime', required: true },
        { name: 'findings', type: 'text', required: true },
        { name: 'impression', type: 'text', required: true },
        { name: 'recommendations', type: 'text' },
        { name: 'critical_finding', type: 'boolean' },
        { name: 'critical_finding_communicated', type: 'boolean' },
        { name: 'communication_details', type: 'json' },
        { name: 'status', type: 'enum', required: true },
        { name: 'addendum', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'imaging_study' },
        { type: 'belongsTo', target: 'radiologist' },
      ],
    },
    radiologist: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'specialization', type: 'enum' },
        { name: 'license_number', type: 'string' },
        { name: 'board_certifications', type: 'json' },
        { name: 'npi_number', type: 'string' },
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'schedule', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'report' },
      ],
    },
  },
};

export default radiologyBlueprint;
