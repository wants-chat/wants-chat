/**
 * Verify Email Page Generator
 *
 * Generates a React email verification page that verifies the email token
 * from the URL query parameters and displays the verification status.
 */
import { ResolvedComponent } from '../types/resolved-component.interface';

export function generateVerifyEmailPage(resolved?: ResolvedComponent): string {
  const dataSource = resolved?.dataSource || 'verification';

  // Parse data source for clean prop naming (sanitize to camelCase)
  const sanitizeVariableName = (name: string): string => {
    return name
      .split(/[._]/)
      .map((part, index) => {
        if (index === 0) {
          return part;
        }
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join('');
  };

  const getDataPath = () => {
    if (!dataSource || dataSource.trim() === '') return 'verification';
    const parts = dataSource.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart ? sanitizeVariableName(lastPart) : 'verification';
  };

  const dataName = getDataPath();

  // Get API route for token verification
  const getApiRoute = () => {
    if (resolved?.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return '/auth/verify-email';
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'verification';

  return `import { useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, Mail, RefreshCw } from 'lucide-react';

interface VerifyEmailProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function VerifyEmail({ ${dataName}: propData, className }: VerifyEmailProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  // Verify email token using useQuery
  const { data: fetchedData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['${entity}', 'verify', token],
    queryFn: async () => {
      if (!token) {
        throw new Error('Invalid verification link - no token provided');
      }

      const response = await api.post<any>('${apiRoute}', { token }, {
        requireAuth: false,
      });

      if (response?.success || response?.data?.success) {
        return {
          success: true,
          message: response?.message || response?.data?.message || 'Your email has been verified successfully!',
        };
      } else {
        throw new Error(response?.message || response?.data?.message || 'Email verification failed');
      }
    },
    enabled: !!token && !propData,
    retry: false,
    staleTime: Infinity, // Don't refetch automatically - verification should only happen once
  });

  const ${dataName} = propData || fetchedData || {};

  // Auto-redirect to login after successful verification
  useEffect(() => {
    if (${dataName}?.success) {
      const timer = setTimeout(() => {
        navigate('/login');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [${dataName}?.success, navigate]);

  // Resend verification email mutation
  const resendMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post<any>('/auth/resend-verification', {}, {
        requireAuth: false,
      });
      return response;
    },
  });

  // No token provided
  if (!token && !propData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Invalid Link</CardTitle>
            <CardDescription>
              This verification link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              The email verification link you clicked is not valid.
              This could happen if:
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>The link has expired</li>
              <li>The link was already used</li>
              <li>The link was copied incorrectly</li>
            </ul>
            <div className="space-y-2 pt-4">
              <Link to="/login">
                <Button className="w-full">Go to login</Button>
              </Link>
              <Link to="/signup">
                <Button variant="outline" className="w-full">Create new account</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
            <CardTitle className="text-2xl font-bold">Verifying Email</CardTitle>
            <CardDescription>
              Please wait while we verify your email address...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center py-4">
              <p className="text-sm text-gray-500 text-center">
                This should only take a moment.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (isError || (!isLoading && !${dataName}?.success)) {
    const errorMessage = (error as Error)?.message || 'Email verification failed';

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Verification Failed</CardTitle>
            <CardDescription>
              {errorMessage}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              We couldn't verify your email address. The link may have expired or already been used.
            </p>

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Try again
              </Button>

              <Link to="/login">
                <Button className="w-full">Go to login</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Email Verified!</CardTitle>
          <CardDescription>
            {${dataName}?.message || 'Your email has been verified successfully!'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center py-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Redirecting to login...</span>
            </div>
          </div>

          <Link to="/login">
            <Button className="w-full">Continue to login</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}`;
}
