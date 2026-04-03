import React, { useState } from 'react';
import { Button } from '../ui/button';
import { toast } from '../ui/sonner';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SendIcon from '@mui/icons-material/Send';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import XIcon from '@mui/icons-material/X';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Handle form submission here
    console.log('Form submitted:', formData);

    // Show success toast
    toast.success('Message sent successfully!', {
      description: 'Thank you for contacting us. We\'ll get back to you soon.',
      duration: 4000,
    });

    // Reset form after successful submission
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  const contactInfo = [
    {
      icon: EmailIcon,
      title: 'Email',
      content: 'support@wants.chat',
      link: 'mailto:support@wants.chat'
    },
    {
      icon: PhoneIcon,
      title: 'Phone',
      content: '+1 (555) 123-4567',
      link: 'tel:+15551234567'
    },
    {
      icon: LocationOnIcon,
      title: 'Office',
      content: 'San Francisco, CA 94105',
      link: '#'
    },
    {
      icon: AccessTimeIcon,
      title: 'Hours',
      content: 'Mon-Fri 9AM-6PM PST',
      link: '#'
    }
  ];

  const socialLinks = [
    { icon: FacebookIcon, link: 'https://www.facebook.com/infoinlet', label: 'Facebook' },
    { icon: XIcon, link: 'https://x.com/InfoInlet2019', label: 'X (Twitter)' },
    // { icon: InstagramIcon, link: 'https://instagram.com', label: 'Instagram' }
  ];

  return (
    <section id="contact" className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900">
      {/* Animated gradient orbs */}
      <div
        className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[120px] animate-pulse"
        style={{
          animation: 'pulse 10s ease-in-out infinite',
        }}
      />
      <div
        className="absolute bottom-1/3 right-0 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[120px] animate-pulse"
        style={{
          animation: 'pulse 12s ease-in-out infinite',
          animationDelay: '4s',
        }}
      />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
            <SupportAgentIcon className="h-4 w-4 text-teal-400" />
            <span className="text-sm font-medium text-white">Get In Touch</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-white">
            Contact Us
          </h2>

          <p className="text-lg text-white/70">
            Have questions or need help? We're here for you. Reach out to our team
            and we'll get back to you as soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-semibold mb-6 text-white">Send us a message</h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2 text-white">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2 text-white">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-2 text-white">
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                >
                  <option value="" className="bg-teal-800/90">Select a subject</option>
                  <option value="general" className="bg-teal-800/90">General Inquiry</option>
                  <option value="support" className="bg-teal-800/90">Technical Support</option>
                  <option value="billing" className="bg-teal-800/90">Billing Question</option>
                  <option value="partnership" className="bg-teal-800/90">Partnership</option>
                  <option value="feedback" className="bg-teal-800/90">Feedback</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2 text-white">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-2 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-none"
                  placeholder="Tell us how we can help..."
                />
              </div>

              <Button type="submit" className="w-full group bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white">
                Send Message
                <SendIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Quick Contact Info */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-semibold mb-6 text-white">Get in touch</h3>

              <div className="space-y-4">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon;
                  return (
                    <a
                      key={index}
                      href={info.link}
                      className="flex items-start gap-4 p-3 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-teal-400" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-white">{info.title}</p>
                        <p className="text-sm text-white/70">{info.content}</p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h3 className="text-xl font-semibold mb-6 text-white">Follow us</h3>
              <p className="mb-6 text-white/70">
                Stay connected and get the latest updates on social media.
              </p>

              <div className="flex gap-3">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="w-12 h-12 rounded-lg bg-white/10 hover:bg-teal-500 hover:text-white flex items-center justify-center transition-colors text-white"
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Contact;