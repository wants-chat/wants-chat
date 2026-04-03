import { AppBlueprint } from '../../../interfaces/app-builder.types';

export function generateLayout(blueprint: AppBlueprint): string {
  // Flatten all pages from sections
  const allPages = blueprint.sections.flatMap(section => section.pages);

  // Extract public routes from blueprint (authRequired: false)
  const publicPages = allPages.filter(page => !page.authRequired);
  const publicRoutes = publicPages.map(page => page.route);

  // Extract user-facing pages that should use public layout even though they require auth
  // These are pages like booking forms, checkout, confirmation that shouldn't show admin sidebar
  const userFacingAuthPages = allPages.filter(page =>
    page.authRequired &&
    (page.layout === 'centered' ||
     page.route.includes('/booking/') ||
     page.route.includes('/account/') ||
     page.route.includes('/checkout/') ||
     page.route.includes('/confirmation/'))
  );
  const userFacingRoutes = userFacingAuthPages.map(page => page.route);

  // Add auth-related routes
  const allPublicRoutes = [...publicRoutes, ...userFacingRoutes, '/login', '/signup', '/forgot-password', '/reset-password', '/verify-email'];

  // Extract main navigation links from public pages (exclude auth pages and dynamic routes with params)
  const navigationPages = publicPages.filter(page =>
    !page.route.includes(':') && // Exclude dynamic routes
    !['/login', '/signup', '/forgot-password', '/reset-password', '/verify-email'].includes(page.route) // Exclude auth pages
  );

  // Get first authenticated page for dashboard link (if exists)
  const authenticatedPages = allPages.filter(page => page.authRequired && !page.route.includes(':'));
  const dashboardPage = authenticatedPages.length > 0 ? authenticatedPages[0] : null;

  return `import { ReactNode } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getVariantStyles } from '@/lib/design-variants';
import { UI_VARIANT, UI_COLOR_SCHEME } from '@/lib/ui-config';

interface LayoutProps {
  children: ReactNode;
}

// Public routes that should NOT show the sidebar
const publicRoutes = ${JSON.stringify(allPublicRoutes)};

// Check if a route is public (including dynamic routes)
function isPublicRoute(pathname: string): boolean {
  // Exact match
  if (publicRoutes.includes(pathname)) {
    return true;
  }

  // Check for dynamic routes (public pages)
  ${publicPages
    .filter(page => page.route.includes(':'))
    .map(page => {
      const pattern = page.route.replace(/:[^/]+/g, '[^/]+');
      return `if (pathname.match(/^${pattern.replace(/\//g, '\\/')}$/)) { return true; }`;
    })
    .join('\n  ')}

  // Check for dynamic routes (user-facing auth pages like booking, checkout, confirmation)
  ${userFacingAuthPages
    .filter(page => page.route.includes(':'))
    .map(page => {
      const pattern = page.route.replace(/:[^/]+/g, '[^/]+');
      return `if (pathname.match(/^${pattern.replace(/\//g, '\\/')}$/)) { return true; }`;
    })
    .join('\n  ')}

  return false;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const showSidebar = !isPublicRoute(location.pathname);
  const styles = getVariantStyles(UI_VARIANT, UI_COLOR_SCHEME);

  // Public layout with header
  if (!showSidebar) {
    return (
      <div className={cn('min-h-screen', styles.background)}>
        <header className={cn('border-b sticky top-0 z-50', styles.card, styles.border)}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className={cn('text-2xl font-bold', styles.title)}>
                ${blueprint.metadata.name || 'App'}
              </Link>

              <nav className="hidden md:flex items-center space-x-8">
                ${navigationPages
    .map(
      page => `<Link to="${page.route}" className={cn('font-medium transition-colors', styles.text, 'hover:opacity-80')}>
                  ${page.name}
                </Link>`
    )
    .join('\n                ')}
              </nav>

              <div className="flex items-center gap-3">
                {isAuthenticated ? (
                  <>
                    ${dashboardPage
    ? `<Link to="${dashboardPage.route}">
                      <Button className={cn(styles.button, styles.buttonHover)}>Dashboard</Button>
                    </Link>`
    : ''}
                  </>
                ) : (
                  <>
                    <Link to="/login">
                      <Button variant="ghost" className={cn(styles.text, 'hover:opacity-80')}>Sign In</Button>
                    </Link>
                    <Link to="/signup">
                      <Button className={cn(styles.button, styles.buttonHover)}>Sign Up</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="min-h-screen">
          {children}
        </main>

        <footer className={cn('border-t mt-20', styles.card, styles.border)}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <p className={cn('text-center text-sm', styles.subtitle)}>
              © {new Date().getFullYear()} ${blueprint.metadata.name || 'App'}. Built with Fluxez
            </p>
          </div>
        </footer>
      </div>
    );
  }

  // Authenticated layout with sidebar
  return (
    <div className={cn('flex h-screen', styles.background)}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}`;
}
