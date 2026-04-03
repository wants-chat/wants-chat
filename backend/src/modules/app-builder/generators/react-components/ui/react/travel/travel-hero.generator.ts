import { ResolvedComponent } from '../../../types/resolved-component.interface';

export function generateTravelHero(resolved: ResolvedComponent, variant?: string): string {
  const { title, props } = resolved;
  const subtitle = props?.subtitle || 'Find your next adventure';
  const showSearch = props?.showSearch !== false;

  // Dynamic API route extraction
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return '/destinations';
  };
  const apiRoute = getApiRoute();

  return `import { Search, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface TravelHeroProps {
  title?: string;
  subtitle?: string;
}

export default function TravelHero({ title, subtitle }: TravelHeroProps) {
  return (
    <div className="relative h-80 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 via-blue-600/30 to-purple-600/30" />
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800')] bg-cover bg-center opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

      <div className="relative h-full flex flex-col justify-end p-6">
        <div className="mb-4">
          <p className="text-cyan-400 text-sm font-medium mb-1">Welcome!</p>
          <h1 className="text-3xl font-bold text-white mb-2">{title || '${title || 'Explore the World'}'}</h1>
          <p className="text-gray-300 text-sm">{subtitle || '${subtitle}'}</p>
        </div>

        ${showSearch ? `
        <div className="relative">
          <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-2xl p-1">
            <div className="flex items-center gap-2 px-4 py-3">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search destinations, hotels..."
                className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
              />
              <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-xl font-medium">
                Search
              </button>
            </div>
          </div>
        </div>
        ` : ''}
      </div>
    </div>
  );
}`;
}
