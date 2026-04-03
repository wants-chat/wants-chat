import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateContactPageContent = (
  resolved: ResolvedComponent,
  variant: 'standard' | 'withMap' | 'minimal' = 'standard'
) => {
  const dataSource = resolved.dataSource;

  const sanitizeVariableName = (name: string): string => {
    return name
      .split(/[._]/)
      .map((part, index) => {
        if (index === 0) return part;
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join('');
  };

  const getDataPath = () => {
    if (!dataSource || dataSource.trim() === '') return 'data';
    const parts = dataSource.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart ? sanitizeVariableName(lastPart) : 'data';
  };

  const dataName = getDataPath();

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'data'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'data';

  const variants = {
    standard: `
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface ContactPageContentProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function ContactPageContent({ ${dataName}: propData, className }: ContactPageContentProps) {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const content = ${dataName} || {};
  const companyName = content.companyName || 'Company Name';
  const email = content.email || 'contact@company.com';
  const phone = content.phone || '+1 (555) 123-4567';
  const address = content.address || '123 Business St, Suite 100, City, ST 12345';
  const hours = content.hours || 'Monday - Friday: 9:00 AM - 6:00 PM';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 text-white py-32 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-7xl font-extrabold mb-8 drop-shadow-2xl bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">Get in Touch</h1>
          <p className="text-3xl text-blue-100 font-bold drop-shadow-lg">We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50/20 dark:from-gray-900 dark:via-gray-950 dark:to-blue-950/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16">
            {/* Contact Information */}
            <div>
              <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 mb-12">Contact Information</h2>

              <div className="space-y-6">
                <div className="group flex items-start space-x-5 p-8 bg-gradient-to-br from-white via-blue-50/30 to-white dark:from-gray-800 dark:via-blue-900/20 dark:to-gray-800 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 border-2 border-blue-200/50 dark:border-blue-700/50">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3">Email</h3>
                    <a href={\`mailto:\${email}\`} className="text-blue-600 dark:text-blue-400 hover:underline font-bold text-xl">
                      {email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Phone</h3>
                    <a href={\`tel:\${phone}\`} className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                      {phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Address</h3>
                    <p className="text-gray-700 dark:text-gray-300">{address}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Business Hours</h3>
                    <p className="text-gray-700 dark:text-gray-300">{hours}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 mb-12">Send us a Message</h2>

              {submitted ? (
                <div className="bg-gradient-to-br from-green-50 via-green-100 to-emerald-100 dark:from-green-900/30 dark:via-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 rounded-3xl p-10 flex items-center space-x-6 shadow-2xl animate-in fade-in zoom-in duration-500">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-extrabold text-green-900 dark:text-green-100 mb-3">Message Sent!</h3>
                    <p className="text-xl text-green-700 dark:text-green-300 font-medium">We'll get back to you as soon as possible.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 bg-gradient-to-br from-white via-purple-50/20 to-white dark:from-gray-800 dark:via-purple-900/10 dark:to-gray-800 p-10 rounded-3xl shadow-2xl border-2 border-purple-200/50 dark:border-purple-700/50">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-5 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-all duration-300 hover:border-purple-400"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-5 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-all duration-300 hover:border-purple-400"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-5 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-all duration-300 hover:border-purple-400"
                      placeholder="How can we help?"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-5 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none transition-all duration-300 hover:border-purple-400"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white font-extrabold px-10 py-5 rounded-2xl text-xl transition-all shadow-2xl hover:shadow-3xl hover:scale-105 focus:ring-4 focus:ring-purple-500 focus:ring-offset-2 flex items-center justify-center space-x-3 group"
                  >
                    <Send className="w-7 h-7 group-hover:translate-x-1 transition-transform duration-300" />
                    <span>Send Message</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
    `,

    withMap: `
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, MessageSquare, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface ContactPageContentProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function ContactPageContent({ ${dataName}: propData, className }: ContactPageContentProps) {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const content = ${dataName} || {};
  const companyName = content.companyName || 'Company Name';
  const email = content.email || 'contact@company.com';
  const phone = content.phone || '+1 (555) 123-4567';
  const address = content.address || '123 Business St, Suite 100, City, ST 12345';
  const hours = content.hours || 'Monday - Friday: 9:00 AM - 6:00 PM';
  const mapUrl = content.mapUrl || 'https://maps.google.com/maps?q=San+Francisco&output=embed';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-blue-100">We're here to help. Reach out and let's start a conversation.</p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Email</h3>
              <a href={\`mailto:\${email}\`} className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                {email}
              </a>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Phone</h3>
              <a href={\`tel:\${phone}\`} className="text-gray-700 dark:text-gray-300 hover:text-blue-600 text-sm">
                {phone}
              </a>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Address</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">{address}</p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Hours</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">{hours}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Form & Map */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <div className="flex items-center space-x-3 mb-8">
                <MessageSquare className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Send a Message</h2>
              </div>

              {submitted ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 flex items-center space-x-4">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-1">Thank You!</h3>
                    <p className="text-green-700 dark:text-green-300">Your message has been sent successfully.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-5 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-all duration-300 hover:border-purple-400"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-5 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-all duration-300 hover:border-purple-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-5 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-all duration-300 hover:border-purple-400"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-5 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none transition-all duration-300 hover:border-purple-400"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white font-extrabold px-10 py-5 rounded-2xl text-xl transition-all shadow-2xl hover:shadow-3xl hover:scale-105 focus:ring-4 focus:ring-purple-500 focus:ring-offset-2 flex items-center justify-center space-x-3 group"
                  >
                    <Send className="w-7 h-7 group-hover:translate-x-1 transition-transform duration-300" />
                    <span>Send Message</span>
                  </button>
                </form>
              )}
            </div>

            {/* Map */}
            <div>
              <div className="flex items-center space-x-3 mb-8">
                <MapPin className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Find Us</h2>
              </div>

              <div className="rounded-xl overflow-hidden shadow-lg h-[500px]">
                <iframe
                  src={mapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Location Map"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
    `,

    minimal: `
import React from 'react';
import { cn } from '@/lib/utils';
import { Mail, Phone, MapPin, Clock, Facebook, Twitter, Linkedin, Instagram, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface ContactPageContentProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function ContactPageContent({ ${dataName}: propData, className }: ContactPageContentProps) {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const content = ${dataName} || {};
  const companyName = content.companyName || 'Company Name';
  const email = content.email || 'contact@company.com';
  const phone = content.phone || '+1 (555) 123-4567';
  const address = content.address || '123 Business St, Suite 100, City, ST 12345';
  const hours = content.hours || 'Monday - Friday: 9:00 AM - 6:00 PM';
  const description = content.description || 'Get in touch with our team. We're always here to help and answer any questions you may have.';

  const socialLinks = content.socialLinks || {
    facebook: '#',
    twitter: '#',
    linkedin: '#',
    instagram: '#'
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Header */}
      <section className="bg-white dark:bg-gray-900 py-16 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">Contact {companyName}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{description}</p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                      Email
                    </h3>
                    <a
                      href={\`mailto:\${email}\`}
                      className="text-lg text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      {email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                      Phone
                    </h3>
                    <a
                      href={\`tel:\${phone}\`}
                      className="text-lg text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                    >
                      {phone}
                    </a>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                      Address
                    </h3>
                    <p className="text-lg text-gray-900 dark:text-white font-medium">{address}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                      Business Hours
                    </h3>
                    <p className="text-lg text-gray-900 dark:text-white font-medium">{hours}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
                Follow Us
              </h3>
              <div className="flex justify-center space-x-4">
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-400 hover:text-white transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-700 hover:text-white transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center hover:bg-pink-600 hover:text-white transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Prefer to send us an email directly?
            </p>
            <a
              href={\`mailto:\${email}\`}
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              <Mail className="w-5 h-5" />
              <span>Send Email</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.standard;
};
