/**
 * Property Detail Component Generator
 */

export interface PropertyDetailOptions {
  componentName?: string;
  endpoint?: string;
}

export function generatePropertyGallery(options: PropertyDetailOptions = {}): string {
  const componentName = options.componentName || 'PropertyGallery';

  return `import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Expand } from 'lucide-react';

interface ${componentName}Props {
  images: string[];
}

const ${componentName}: React.FC<${componentName}Props> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const next = () => setCurrentIndex((i) => (i + 1) % images.length);
  const prev = () => setCurrentIndex((i) => (i - 1 + images.length) % images.length);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center text-gray-400">
        No images available
      </div>
    );
  }

  return (
    <>
      <div className="relative rounded-xl overflow-hidden">
        <img
          src={images[currentIndex]}
          alt={\`Property image \${currentIndex + 1}\`}
          className="w-full h-96 object-cover cursor-pointer"
          onClick={() => setIsFullscreen(true)}
        />
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 dark:bg-black/50 rounded-full hover:bg-white dark:hover:bg-black/70"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 dark:bg-black/50 rounded-full hover:bg-white dark:hover:bg-black/70"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={\`w-2 h-2 rounded-full transition-colors \${i === currentIndex ? 'bg-white' : 'bg-white/50'}\`}
                />
              ))}
            </div>
          </>
        )}
        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute top-4 right-4 p-2 bg-white/80 dark:bg-black/50 rounded-full hover:bg-white dark:hover:bg-black/70"
        >
          <Expand className="w-5 h-5" />
        </button>
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={\`Thumbnail \${i + 1}\`}
              onClick={() => setCurrentIndex(i)}
              className={\`w-20 h-20 object-cover rounded-lg cursor-pointer flex-shrink-0 \${
                i === currentIndex ? 'ring-2 ring-blue-600' : 'opacity-70 hover:opacity-100'
              }\`}
            />
          ))}
        </div>
      )}

      {isFullscreen && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full"
          >
            <X className="w-8 h-8" />
          </button>
          <img src={images[currentIndex]} alt="Fullscreen" className="max-w-full max-h-full" />
          {images.length > 1 && (
            <>
              <button onClick={prev} className="absolute left-4 p-3 text-white hover:bg-white/20 rounded-full">
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button onClick={next} className="absolute right-4 p-3 text-white hover:bg-white/20 rounded-full">
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ${componentName};
`;
}

export function generatePropertyDetails(options: PropertyDetailOptions = {}): string {
  const { componentName = 'PropertyDetails', endpoint = '/properties' } = options;

  return `import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Bed, Bath, Square, MapPin, Calendar, Check } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!property) {
    return <div className="text-center py-12 text-gray-500">Property not found</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{property.title}</h1>
          {property.address && (
            <p className="text-gray-500 flex items-center gap-1 mt-1">
              <MapPin className="w-4 h-4" />
              {property.address}
            </p>
          )}
        </div>
        <p className="text-3xl font-bold text-green-600">\${property.price?.toLocaleString()}</p>
      </div>

      <div className="grid grid-cols-4 gap-4 py-4 border-y border-gray-200 dark:border-gray-700 mb-6">
        {property.bedrooms && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-900 dark:text-white">
              <Bed className="w-5 h-5" />
              <span className="text-xl font-bold">{property.bedrooms}</span>
            </div>
            <p className="text-sm text-gray-500">Bedrooms</p>
          </div>
        )}
        {property.bathrooms && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-900 dark:text-white">
              <Bath className="w-5 h-5" />
              <span className="text-xl font-bold">{property.bathrooms}</span>
            </div>
            <p className="text-sm text-gray-500">Bathrooms</p>
          </div>
        )}
        {property.sqft && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-900 dark:text-white">
              <Square className="w-5 h-5" />
              <span className="text-xl font-bold">{property.sqft?.toLocaleString()}</span>
            </div>
            <p className="text-sm text-gray-500">Sq Ft</p>
          </div>
        )}
        {property.year_built && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-900 dark:text-white">
              <Calendar className="w-5 h-5" />
              <span className="text-xl font-bold">{property.year_built}</span>
            </div>
            <p className="text-sm text-gray-500">Year Built</p>
          </div>
        )}
      </div>

      {property.description && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Description</h2>
          <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">{property.description}</p>
        </div>
      )}

      {property.amenities && property.amenities.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Amenities</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {property.amenities.map((amenity: string, i: number) => (
              <div key={i} className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Check className="w-4 h-4 text-green-600" />
                {amenity}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateInquiryForm(options: PropertyDetailOptions = {}): string {
  const { componentName = 'InquiryForm', endpoint = '/inquiries' } = options;

  return `import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Loader2, Send, Phone, Mail, User, MessageSquare } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ${componentName}Props {
  propertyId: string;
  agentName?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ propertyId, agentName }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const sendMutation = useMutation({
    mutationFn: (data: any) => api.post('${endpoint}', { ...data, property_id: propertyId }),
    onSuccess: () => {
      toast.success('Inquiry sent successfully!');
      setFormData({ name: '', email: '', phone: '', message: '' });
    },
    onError: () => toast.error('Failed to send inquiry'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMutation.mutate(formData);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {agentName ? \`Contact \${agentName}\` : 'Request Information'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <User className="w-4 h-4 inline mr-1" /> Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Your name"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <Mail className="w-4 h-4 inline mr-1" /> Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="your@email.com"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <Phone className="w-4 h-4 inline mr-1" /> Phone
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="(555) 123-4567"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <MessageSquare className="w-4 h-4 inline mr-1" /> Message *
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="I'm interested in this property..."
            rows={4}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent resize-none"
            required
          />
        </div>
        <button
          type="submit"
          disabled={sendMutation.isPending}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {sendMutation.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send Inquiry
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ${componentName};
`;
}
