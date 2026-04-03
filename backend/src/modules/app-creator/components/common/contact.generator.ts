/**
 * Contact & Map Component Generators
 *
 * Generates contact information displays and map sections.
 */

export interface ContactInfoOptions {
  componentName?: string;
  showPhone?: boolean;
  showEmail?: boolean;
  showAddress?: boolean;
  showSocialLinks?: boolean;
  showContactForm?: boolean;
}

export interface MapSectionOptions {
  componentName?: string;
  defaultCenter?: { lat: number; lng: number };
  defaultZoom?: number;
  showMarker?: boolean;
  showAddressOverlay?: boolean;
}

/**
 * Generate a ContactInfo component for displaying contact details
 */
export function generateContactInfo(options: ContactInfoOptions = {}): string {
  const {
    componentName = 'ContactInfo',
    showPhone = true,
    showEmail = true,
    showAddress = true,
    showSocialLinks = true,
    showContactForm = false,
  } = options;

  return `import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Send,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContactDetails {
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  hours?: string;
  website?: string;
  social?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
}

interface ${componentName}Props {
  contact?: ContactDetails;
  className?: string;
  variant?: 'card' | 'inline' | 'sidebar';
  onSubmitContact?: (data: { name: string; email: string; message: string }) => Promise<void>;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  contact,
  className,
  variant = 'card',
  onSubmitContact,
}) => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmitContact) return;

    setIsSubmitting(true);
    try {
      await onSubmitContact(formData);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setIsSubmitted(false), 3000);
    } catch (error) {
      console.error('Failed to submit contact form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatAddress = () => {
    if (!contact) return null;
    const parts = [contact.address, contact.city, contact.state, contact.zip, contact.country].filter(Boolean);
    return parts.join(', ');
  };

  const socialLinks = [
    { key: 'facebook', icon: Facebook, label: 'Facebook', color: 'hover:text-blue-600' },
    { key: 'twitter', icon: Twitter, label: 'Twitter', color: 'hover:text-sky-500' },
    { key: 'instagram', icon: Instagram, label: 'Instagram', color: 'hover:text-pink-600' },
    { key: 'linkedin', icon: Linkedin, label: 'LinkedIn', color: 'hover:text-blue-700' },
  ];

  if (variant === 'inline') {
    return (
      <div className={cn('flex flex-wrap items-center gap-6', className)}>
        ${showPhone ? `{contact?.phone && (
          <a
            href={\`tel:\${contact.phone}\`}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span>{contact.phone}</span>
          </a>
        )}` : ''}
        ${showEmail ? `{contact?.email && (
          <a
            href={\`mailto:\${contact.email}\`}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <Mail className="w-4 h-4" />
            <span>{contact.email}</span>
          </a>
        )}` : ''}
        ${showAddress ? `{formatAddress() && (
          <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <MapPin className="w-4 h-4" />
            <span>{formatAddress()}</span>
          </span>
        )}` : ''}
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div className={cn('space-y-4', className)}>
        <h3 className="font-semibold text-gray-900 dark:text-white">Contact Us</h3>
        <div className="space-y-3">
          ${showPhone ? `{contact?.phone && (
            <a
              href={\`tel:\${contact.phone}\`}
              className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Phone className="w-5 h-5 flex-shrink-0" />
              <span>{contact.phone}</span>
            </a>
          )}` : ''}
          ${showEmail ? `{contact?.email && (
            <a
              href={\`mailto:\${contact.email}\`}
              className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Mail className="w-5 h-5 flex-shrink-0" />
              <span className="break-all">{contact.email}</span>
            </a>
          )}` : ''}
          ${showAddress ? `{formatAddress() && (
            <div className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
              <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{formatAddress()}</span>
            </div>
          )}` : ''}
          {contact?.hours && (
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <Clock className="w-5 h-5 flex-shrink-0" />
              <span>{contact.hours}</span>
            </div>
          )}
        </div>
        ${showSocialLinks ? `{contact?.social && Object.keys(contact.social).length > 0 && (
          <div className="flex gap-3 pt-2">
            {socialLinks.map(({ key, icon: Icon, label, color }) => {
              const url = contact.social?.[key as keyof typeof contact.social];
              if (!url) return null;
              return (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={\`p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 \${color} transition-colors\`}
                  aria-label={label}
                >
                  <Icon className="w-5 h-5" />
                </a>
              );
            })}
          </div>
        )}` : ''}
      </div>
    );
  }

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden', className)}>
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Contact Information</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            ${showPhone ? `{contact?.phone && (
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                  <a
                    href={\`tel:\${contact.phone}\`}
                    className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {contact.phone}
                  </a>
                </div>
              </div>
            )}` : ''}

            ${showEmail ? `{contact?.email && (
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <a
                    href={\`mailto:\${contact.email}\`}
                    className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {contact.email}
                  </a>
                </div>
              </div>
            )}` : ''}

            ${showAddress ? `{formatAddress() && (
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formatAddress()}</p>
                </div>
              </div>
            )}` : ''}

            {contact?.hours && (
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Business Hours</p>
                  <p className="font-medium text-gray-900 dark:text-white">{contact.hours}</p>
                </div>
              </div>
            )}

            {contact?.website && (
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Website</p>
                  <a
                    href={contact.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {contact.website.replace(/^https?:\\/\\//, '')}
                  </a>
                </div>
              </div>
            )}

            ${showSocialLinks ? `{contact?.social && Object.keys(contact.social).length > 0 && (
              <div className="pt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Follow Us</p>
                <div className="flex gap-3">
                  {socialLinks.map(({ key, icon: Icon, label, color }) => {
                    const url = contact.social?.[key as keyof typeof contact.social];
                    if (!url) return null;
                    return (
                      <a
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={\`p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 \${color} transition-colors\`}
                        aria-label={label}
                      >
                        <Icon className="w-5 h-5" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}` : ''}
          </div>

          ${showContactForm ? `<div className="border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 pt-6 md:pt-0 md:pl-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Send us a message</h3>
            {isSubmitted ? (
              <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-700 dark:text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span>Message sent successfully!</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="How can we help?"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Send Message
                </button>
              </form>
            )}
          </div>` : ''}
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate a MapSection component for displaying location on a map
 */
export function generateMapSection(options: MapSectionOptions = {}): string {
  const {
    componentName = 'MapSection',
    defaultCenter = { lat: 40.7128, lng: -74.006 },
    defaultZoom = 14,
    showMarker = true,
    showAddressOverlay = true,
  } = options;

  return `import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, ExternalLink, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Location {
  lat: number;
  lng: number;
}

interface AddressInfo {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  phone?: string;
}

interface ${componentName}Props {
  location?: Location;
  address?: AddressInfo;
  className?: string;
  height?: string;
  zoom?: number;
  showDirectionsButton?: boolean;
  mapStyle?: 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
}

const ${componentName}: React.FC<${componentName}Props> = ({
  location = { lat: ${defaultCenter.lat}, lng: ${defaultCenter.lng} },
  address,
  className,
  height = '400px',
  zoom = ${defaultZoom},
  showDirectionsButton = true,
  mapStyle = 'roadmap',
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  const formatFullAddress = () => {
    if (!address) return null;
    const parts = [address.address, address.city, address.state, address.zip, address.country].filter(Boolean);
    return parts.join(', ');
  };

  const getGoogleMapsUrl = () => {
    const fullAddress = formatFullAddress();
    if (fullAddress) {
      return \`https://www.google.com/maps/search/?api=1&query=\${encodeURIComponent(fullAddress)}\`;
    }
    return \`https://www.google.com/maps/search/?api=1&query=\${location.lat},\${location.lng}\`;
  };

  const getDirectionsUrl = () => {
    const fullAddress = formatFullAddress();
    if (fullAddress) {
      return \`https://www.google.com/maps/dir/?api=1&destination=\${encodeURIComponent(fullAddress)}\`;
    }
    return \`https://www.google.com/maps/dir/?api=1&destination=\${location.lat},\${location.lng}\`;
  };

  useEffect(() => {
    const loadMap = async () => {
      if (!mapRef.current) return;

      try {
        // Check if Google Maps is available
        if (typeof window !== 'undefined' && (window as any).google?.maps) {
          const { Map } = await (window as any).google.maps.importLibrary('maps');
          const { AdvancedMarkerElement } = await (window as any).google.maps.importLibrary('marker');

          const map = new Map(mapRef.current, {
            center: location,
            zoom,
            mapTypeId: mapStyle,
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: false,
            fullscreenControl: true,
            mapTypeControl: false,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }],
              },
            ],
          });

          ${showMarker ? `// Add marker
          new AdvancedMarkerElement({
            map,
            position: location,
            title: address?.name || 'Location',
          });` : ''}

          setIsLoading(false);
        } else {
          // Fallback to static map or iframe
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to load map:', error);
        setMapError('Failed to load map');
        setIsLoading(false);
      }
    };

    // Simple timeout to simulate loading for demo purposes
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    loadMap();

    return () => clearTimeout(timer);
  }, [location, zoom, mapStyle]);

  return (
    <div className={cn('relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700', className)}>
      {/* Map Container */}
      <div
        ref={mapRef}
        className="w-full bg-gray-100 dark:bg-gray-800"
        style={{ height }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              <span className="text-sm text-gray-500">Loading map...</span>
            </div>
          </div>
        )}

        {mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <div className="flex flex-col items-center gap-4 p-6 text-center">
              <MapPin className="w-12 h-12 text-gray-400" />
              <p className="text-gray-500">{mapError}</p>
              <a
                href={getGoogleMapsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open in Google Maps
              </a>
            </div>
          </div>
        )}

        {/* Fallback: Embed Google Maps iframe when API is not available */}
        {!isLoading && !mapError && (
          <iframe
            src={\`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=\${location.lat},\${location.lng}&zoom=\${zoom}\`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Location Map"
            className="absolute inset-0"
          />
        )}
      </div>

      ${showAddressOverlay ? `{/* Address Overlay */}
      {address && (
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              {address.name && (
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                  {address.name}
                </h3>
              )}
              {formatFullAddress() && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {formatFullAddress()}
                </p>
              )}
              {address.phone && (
                <a
                  href={\`tel:\${address.phone}\`}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-block"
                >
                  {address.phone}
                </a>
              )}
            </div>
          </div>

          {showDirectionsButton && (
            <div className="flex gap-2 mt-4">
              <a
                href={getDirectionsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Navigation className="w-4 h-4" />
                Get Directions
              </a>
              <a
                href={getGoogleMapsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      )}` : ''}
    </div>
  );
};

export default ${componentName};
`;
}
