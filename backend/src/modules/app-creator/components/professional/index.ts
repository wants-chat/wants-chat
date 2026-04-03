/**
 * Professional Services Component Generators
 *
 * Generators for various professional service businesses like
 * accounting, consulting, legal, security, etc.
 */

export interface ProfessionalOptions {
  title?: string;
  entityType?: string;
}

// Active Jobs Component
export function generateActiveJobs(options: ProfessionalOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

interface Job {
  id: string;
  title: string;
  client: string;
  status: 'in-progress' | 'pending' | 'review';
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  assignee: string;
  progress: number;
}

export default function ActiveJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    setJobs([
      { id: '1', title: 'Website Redesign', client: 'ABC Corp', status: 'in-progress', priority: 'high', dueDate: '2024-01-25', assignee: 'John', progress: 65 },
      { id: '2', title: 'Mobile App Development', client: 'XYZ Inc', status: 'in-progress', priority: 'medium', dueDate: '2024-02-15', assignee: 'Sarah', progress: 40 },
      { id: '3', title: 'Brand Identity', client: 'StartupCo', status: 'pending', priority: 'low', dueDate: '2024-02-01', assignee: 'Mike', progress: 0 },
      { id: '4', title: 'SEO Optimization', client: 'RetailShop', status: 'review', priority: 'medium', dueDate: '2024-01-20', assignee: 'Emma', progress: 90 }
    ]);
  }, []);

  const priorityColors: Record<string, string> = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800'
  };

  const statusColors: Record<string, string> = {
    'in-progress': 'text-blue-600',
    'pending': 'text-gray-600',
    'review': 'text-purple-600'
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Active Jobs</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          + New Job
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Job</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Client</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Assignee</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Due Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Priority</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Progress</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium">{job.title}</div>
                  <div className={\`text-sm \${statusColors[job.status]}\`}>{job.status.replace('-', ' ')}</div>
                </td>
                <td className="px-4 py-3">{job.client}</td>
                <td className="px-4 py-3">{job.assignee}</td>
                <td className="px-4 py-3">{new Date(job.dueDate).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className={\`px-2 py-1 rounded-full text-xs \${priorityColors[job.priority]}\`}>
                    {job.priority}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: \`\${job.progress}%\` }} />
                    </div>
                    <span className="text-sm text-gray-500">{job.progress}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}`;
}

// Active Work Orders Component
export function generateActiveWorkOrders(options: ProfessionalOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

interface WorkOrder {
  id: string;
  orderNumber: string;
  description: string;
  customer: string;
  technician: string;
  status: 'assigned' | 'in-progress' | 'on-hold' | 'completed';
  priority: 'urgent' | 'high' | 'normal';
  scheduledDate: string;
  type: string;
}

export default function ActiveWorkOrders() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);

  useEffect(() => {
    setWorkOrders([
      { id: '1', orderNumber: 'WO-001', description: 'HVAC Repair', customer: 'Office Building A', technician: 'John Smith', status: 'in-progress', priority: 'urgent', scheduledDate: '2024-01-15', type: 'Repair' },
      { id: '2', orderNumber: 'WO-002', description: 'Plumbing Inspection', customer: 'Residential Complex', technician: 'Mike Johnson', status: 'assigned', priority: 'normal', scheduledDate: '2024-01-16', type: 'Inspection' },
      { id: '3', orderNumber: 'WO-003', description: 'Electrical Upgrade', customer: 'Retail Store', technician: 'Sarah Wilson', status: 'on-hold', priority: 'high', scheduledDate: '2024-01-17', type: 'Installation' },
      { id: '4', orderNumber: 'WO-004', description: 'Generator Maintenance', customer: 'Hospital', technician: 'Bob Davis', status: 'in-progress', priority: 'urgent', scheduledDate: '2024-01-15', type: 'Maintenance' }
    ]);
  }, []);

  const statusConfig: Record<string, { bg: string; text: string }> = {
    'assigned': { bg: 'bg-blue-100', text: 'text-blue-800' },
    'in-progress': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    'on-hold': { bg: 'bg-red-100', text: 'text-red-800' },
    'completed': { bg: 'bg-green-100', text: 'text-green-800' }
  };

  const priorityConfig: Record<string, string> = {
    'urgent': 'border-l-4 border-red-500',
    'high': 'border-l-4 border-orange-500',
    'normal': 'border-l-4 border-gray-300'
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Active Work Orders</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          + New Work Order
        </button>
      </div>

      <div className="grid gap-3">
        {workOrders.map((wo) => {
          const status = statusConfig[wo.status];
          return (
            <div key={wo.id} className={\`bg-white rounded-lg shadow p-4 \${priorityConfig[wo.priority]}\`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-gray-500">{wo.orderNumber}</span>
                    <span className={\`px-2 py-0.5 rounded-full text-xs \${status.bg} \${status.text}\`}>
                      {wo.status.replace('-', ' ')}
                    </span>
                  </div>
                  <h3 className="font-semibold mt-1">{wo.description}</h3>
                  <p className="text-sm text-gray-600">{wo.customer}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{wo.technician}</div>
                  <div className="text-sm text-gray-500">{new Date(wo.scheduledDate).toLocaleDateString()}</div>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 rounded text-xs">{wo.type}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}`;
}

// Agent Reply Form
export function generateAgentReplyForm(options: ProfessionalOptions = {}): string {
  return `import React, { useState } from 'react';

interface AgentReplyFormProps {
  ticketId?: string;
  onSubmit?: (reply: { message: string; isInternal: boolean; attachments: File[] }) => void;
}

export default function AgentReplyForm({ ticketId, onSubmit }: AgentReplyFormProps) {
  const [message, setMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [templates] = useState([
    { id: '1', name: 'Greeting', content: 'Hello! Thank you for contacting us.' },
    { id: '2', name: 'Resolution', content: 'We have resolved your issue.' },
    { id: '3', name: 'Escalation', content: 'I have escalated your ticket.' }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.({ message, isInternal, attachments });
    setMessage('');
    setAttachments([]);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Reply to Ticket #{ticketId}</h3>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} className="rounded" />
          Internal Note
        </label>
      </div>
      <div className="flex gap-2 flex-wrap">
        <span className="text-sm text-gray-500">Templates:</span>
        {templates.map(t => (
          <button key={t.id} type="button" onClick={() => setMessage(prev => prev + t.content)} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded">
            {t.name}
          </button>
        ))}
      </div>
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={isInternal ? 'Add internal note...' : 'Type your reply...'} className={\`w-full px-4 py-3 border rounded-lg min-h-[150px] \${isInternal ? 'bg-yellow-50 border-yellow-300' : 'border-gray-300'}\`} required />
      <div className="flex justify-end gap-2">
        <button type="submit" className={\`px-4 py-2 rounded-lg text-white \${isInternal ? 'bg-yellow-600' : 'bg-blue-600'}\`}>
          {isInternal ? 'Add Note' : 'Send Reply'}
        </button>
      </div>
    </form>
  );
}`;
}

// Assignment List - renamed to avoid conflict
export function generateAssignmentList(options: ProfessionalOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

interface Assignment {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  priority: 'high' | 'medium' | 'low';
}

export default function AssignmentList() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    setAssignments([
      { id: '1', title: 'Research Paper', description: 'Write research paper', assignedTo: 'John', dueDate: '2024-01-25', status: 'in-progress', priority: 'high' },
      { id: '2', title: 'Project Review', description: 'Review project documents', assignedTo: 'Jane', dueDate: '2024-01-20', status: 'pending', priority: 'medium' },
    ]);
  }, []);

  const filteredAssignments = filter === 'all' ? assignments : assignments.filter(a => a.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Assignments</h2>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 border rounded-lg">
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <div className="space-y-3">
        {filteredAssignments.map((a) => (
          <div key={a.id} className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold">{a.title}</h3>
            <p className="text-sm text-gray-600">{a.description}</p>
            <div className="flex justify-between mt-2 text-sm">
              <span>Assigned to: {a.assignedTo}</span>
              <span>Due: {new Date(a.dueDate).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

// Billing Overview
export function generateBillingOverview(options: ProfessionalOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

export default function BillingOverview() {
  const [summary, setSummary] = useState({
    totalRevenue: 125000,
    outstanding: 35000,
    overdue: 8500,
    paidThisMonth: 45000,
    pendingInvoices: 12,
    averagePaymentDays: 28
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Billing Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Revenue', value: \`$\${summary.totalRevenue.toLocaleString()}\`, icon: '💰', color: 'bg-green-100' },
          { label: 'Outstanding', value: \`$\${summary.outstanding.toLocaleString()}\`, icon: '📊', color: 'bg-blue-100' },
          { label: 'Overdue', value: \`$\${summary.overdue.toLocaleString()}\`, icon: '⚠️', color: 'bg-red-100' },
          { label: 'Paid This Month', value: \`$\${summary.paidThisMonth.toLocaleString()}\`, icon: '✓', color: 'bg-purple-100' },
          { label: 'Pending Invoices', value: summary.pendingInvoices, icon: '📄', color: 'bg-yellow-100' },
          { label: 'Avg Payment Days', value: summary.averagePaymentDays, icon: '📅', color: 'bg-gray-100' }
        ].map((stat, i) => (
          <div key={i} className={\`\${stat.color} rounded-lg p-4\`}>
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-xl font-bold">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

// Billing Summary
export function generateBillingSummary(options: ProfessionalOptions = {}): string {
  return `import React, { useState } from 'react';

export default function BillingSummary() {
  const [data] = useState({
    period: 'January 2024',
    invoiced: 85000,
    collected: 72000,
    outstanding: 13000,
    byCategory: [
      { category: 'Services', amount: 45000 },
      { category: 'Products', amount: 28000 },
      { category: 'Subscriptions', amount: 12000 }
    ]
  });

  const collectionRate = Math.round((data.collected / data.invoiced) * 100);

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Billing Summary</h2>
        <span className="text-gray-500">{data.period}</span>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-700">\${(data.invoiced / 1000).toFixed(0)}K</div>
          <div className="text-sm text-blue-600">Invoiced</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-700">\${(data.collected / 1000).toFixed(0)}K</div>
          <div className="text-sm text-green-600">Collected</div>
        </div>
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-700">\${(data.outstanding / 1000).toFixed(0)}K</div>
          <div className="text-sm text-yellow-600">Outstanding</div>
        </div>
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Collection Rate</span>
          <span className="font-medium">{collectionRate}%</span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full">
          <div className="h-full bg-green-500 rounded-full" style={{ width: \`\${collectionRate}%\` }} />
        </div>
      </div>
    </div>
  );
}`;
}

// Book Search
export function generateBookSearch(options: ProfessionalOptions = {}): string {
  return `import React, { useState } from 'react';

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  available: boolean;
  category: string;
}

export default function BookSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Book[]>([]);

  const handleSearch = () => {
    setResults([
      { id: '1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '978-0743273565', available: true, category: 'Fiction' },
      { id: '2', title: '1984', author: 'George Orwell', isbn: '978-0451524935', available: false, category: 'Fiction' },
    ]);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Book Search</h2>
      <div className="flex gap-4">
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by title, author, or ISBN..." className="flex-1 px-4 py-2 border rounded-lg" />
        <button onClick={handleSearch} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Search</button>
      </div>
      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((book) => (
            <div key={book.id} className="bg-white rounded-lg shadow p-4 flex justify-between">
              <div>
                <h3 className="font-semibold">{book.title}</h3>
                <p className="text-gray-600">by {book.author}</p>
                <p className="text-sm text-gray-500">ISBN: {book.isbn}</p>
              </div>
              <span className={\`px-3 py-1 h-fit rounded-full text-sm \${book.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}\`}>
                {book.available ? 'Available' : 'Checked Out'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}`;
}
