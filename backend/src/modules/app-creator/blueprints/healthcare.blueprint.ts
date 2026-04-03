import { Blueprint } from './blueprint.interface';

/**
 * Healthcare/Medical Blueprint
 *
 * Defines the structure for a healthcare application:
 * - Patient management
 * - Appointments
 * - Medical records
 * - Prescriptions
 * - Doctors/Staff
 */
export const healthcareBlueprint: Blueprint = {
  appType: 'healthcare',
  description: 'Healthcare app with patients, appointments, and medical records',

  coreEntities: ['patient', 'doctor', 'appointment', 'medical_record', 'prescription', 'department'],

  commonFields: {
    timestamps: true,
    softDelete: true,
    userOwnership: true,
  },

  pages: [
    // Dashboard
    {
      path: '/',
      name: 'Dashboard',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
          props: {
            links: [
              { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
              { label: 'Patients', path: '/patients', icon: 'Users' },
              { label: 'Appointments', path: '/appointments', icon: 'Calendar' },
              { label: 'Doctors', path: '/doctors', icon: 'Stethoscope' },
              { label: 'Records', path: '/records', icon: 'FileText' },
              { label: 'Prescriptions', path: '/prescriptions', icon: 'Pill' },
            ],
          },
        },
        {
          id: 'stats',
          component: 'stats-cards',
          position: 'main',
          props: {
            stats: ['total_patients', 'appointments_today', 'pending_appointments', 'doctors_available'],
          },
        },
        {
          id: 'today-appointments',
          component: 'appointment-list',
          entity: 'appointment',
          position: 'main',
          props: {
            title: "Today's Appointments",
            today: true,
          },
        },
      ],
    },
    // Patients List
    {
      path: '/patients',
      name: 'Patients',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'patients-table',
          component: 'data-table',
          entity: 'patient',
          position: 'main',
          props: {
            title: 'Patients',
            showCreate: true,
            showEdit: true,
            columns: ['name', 'email', 'phone', 'date_of_birth', 'blood_type', 'last_visit'],
          },
        },
      ],
    },
    // Patient Detail
    {
      path: '/patients/:id',
      name: 'Patient Detail',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'patient-profile',
          component: 'patient-profile',
          entity: 'patient',
          position: 'main',
        },
        {
          id: 'medical-history',
          component: 'medical-history',
          entity: 'medical_record',
          position: 'main',
          props: {
            title: 'Medical History',
          },
        },
        {
          id: 'patient-appointments',
          component: 'appointment-list',
          entity: 'appointment',
          position: 'main',
          props: {
            title: 'Appointments',
          },
        },
      ],
    },
    // Appointments
    {
      path: '/appointments',
      name: 'Appointments',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'appointment-calendar',
          component: 'appointment-calendar',
          entity: 'appointment',
          position: 'main',
        },
      ],
    },
    // New Appointment
    {
      path: '/appointments/new',
      name: 'New Appointment',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'appointment-form',
          component: 'appointment-form',
          entity: 'appointment',
          position: 'main',
        },
      ],
    },
    // Doctors
    {
      path: '/doctors',
      name: 'Doctors',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'doctors-grid',
          component: 'doctor-grid',
          entity: 'doctor',
          position: 'main',
        },
      ],
    },
    // Doctor Profile
    {
      path: '/doctors/:id',
      name: 'Doctor Profile',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'doctor-profile',
          component: 'doctor-profile',
          entity: 'doctor',
          position: 'main',
        },
        {
          id: 'doctor-schedule',
          component: 'doctor-schedule',
          entity: 'appointment',
          position: 'main',
        },
      ],
    },
    // Medical Records
    {
      path: '/records',
      name: 'Medical Records',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'records-table',
          component: 'data-table',
          entity: 'medical_record',
          position: 'main',
          props: {
            title: 'Medical Records',
            columns: ['patient', 'doctor', 'diagnosis', 'treatment', 'date'],
          },
        },
      ],
    },
    // Prescriptions
    {
      path: '/prescriptions',
      name: 'Prescriptions',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'prescriptions-table',
          component: 'data-table',
          entity: 'prescription',
          position: 'main',
          props: {
            title: 'Prescriptions',
            showCreate: true,
            columns: ['patient', 'doctor', 'medication', 'dosage', 'status', 'date'],
          },
        },
      ],
    },
  ],

  endpoints: [
    // Patients
    { method: 'GET', path: '/patients', entity: 'patient', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/patients/:id', entity: 'patient', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/patients', entity: 'patient', operation: 'create', requiresAuth: true },
    { method: 'PUT', path: '/patients/:id', entity: 'patient', operation: 'update', requiresAuth: true },
    { method: 'GET', path: '/patients/:id/records', entity: 'medical_record', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/patients/:id/appointments', entity: 'appointment', operation: 'list', requiresAuth: true },

    // Doctors
    { method: 'GET', path: '/doctors', entity: 'doctor', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/doctors/:id', entity: 'doctor', operation: 'get', requiresAuth: true },
    { method: 'GET', path: '/doctors/:id/schedule', entity: 'appointment', operation: 'list', requiresAuth: true },

    // Appointments
    { method: 'GET', path: '/appointments', entity: 'appointment', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/appointments/:id', entity: 'appointment', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/appointments', entity: 'appointment', operation: 'create', requiresAuth: true },
    { method: 'PUT', path: '/appointments/:id', entity: 'appointment', operation: 'update', requiresAuth: true },
    { method: 'PATCH', path: '/appointments/:id/status', entity: 'appointment', operation: 'update', requiresAuth: true },

    // Medical Records
    { method: 'GET', path: '/records', entity: 'medical_record', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/records', entity: 'medical_record', operation: 'create', requiresAuth: true },

    // Prescriptions
    { method: 'GET', path: '/prescriptions', entity: 'prescription', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/prescriptions', entity: 'prescription', operation: 'create', requiresAuth: true },
  ],

  entityConfig: {
    patient: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'date_of_birth', type: 'date', required: true },
        { name: 'gender', type: 'enum' },
        { name: 'blood_type', type: 'enum' },
        { name: 'address', type: 'json' },
        { name: 'emergency_contact', type: 'json' },
        { name: 'insurance_info', type: 'json' },
        { name: 'allergies', type: 'json' },
        { name: 'medical_conditions', type: 'json' },
        { name: 'avatar_url', type: 'image' },
      ],
      relationships: [
        { type: 'hasMany', target: 'appointment' },
        { type: 'hasMany', target: 'medical_record' },
        { type: 'hasMany', target: 'prescription' },
      ],
    },
    doctor: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'specialization', type: 'string', required: true },
        { name: 'qualification', type: 'string' },
        { name: 'experience_years', type: 'integer' },
        { name: 'bio', type: 'text' },
        { name: 'avatar_url', type: 'image' },
        { name: 'consultation_fee', type: 'decimal' },
        { name: 'available_days', type: 'json' },
        { name: 'available_hours', type: 'json' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'department' },
        { type: 'hasMany', target: 'appointment' },
        { type: 'hasMany', target: 'medical_record' },
      ],
    },
    appointment: {
      defaultFields: [
        { name: 'date', type: 'date', required: true },
        { name: 'time', type: 'string', required: true },
        { name: 'duration_minutes', type: 'integer' },
        { name: 'type', type: 'enum', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'reason', type: 'text' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
        { type: 'belongsTo', target: 'doctor' },
      ],
    },
    medical_record: {
      defaultFields: [
        { name: 'date', type: 'date', required: true },
        { name: 'diagnosis', type: 'text', required: true },
        { name: 'symptoms', type: 'json' },
        { name: 'treatment', type: 'text' },
        { name: 'notes', type: 'text' },
        { name: 'vitals', type: 'json' },
        { name: 'attachments', type: 'json' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
        { type: 'belongsTo', target: 'doctor' },
        { type: 'belongsTo', target: 'appointment' },
      ],
    },
    prescription: {
      defaultFields: [
        { name: 'date', type: 'date', required: true },
        { name: 'medications', type: 'json', required: true },
        { name: 'instructions', type: 'text' },
        { name: 'duration_days', type: 'integer' },
        { name: 'refills', type: 'integer' },
        { name: 'status', type: 'enum' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
        { type: 'belongsTo', target: 'doctor' },
        { type: 'belongsTo', target: 'medical_record' },
      ],
    },
    department: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'head_doctor_id', type: 'uuid' },
      ],
      relationships: [
        { type: 'hasMany', target: 'doctor' },
      ],
    },
  },
};

export default healthcareBlueprint;
