import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateCaptchaIntegration = (
  resolved: ResolvedComponent,
  variant: 'recaptcha' | 'hcaptcha' | 'custom' = 'recaptcha'
) => {
  const dataSource = resolved.dataSource;

  const getField = (fieldName: string): string => {
    const mapping = resolved.fieldMappings.find(m => m.targetField === fieldName);
    if (mapping?.sourceField) {
      return `propData?.${mapping.sourceField}`;
    }
    // Return undefined/empty for missing data - let component handle gracefully
    // For ID fields
    if (fieldName === 'id' || fieldName.endsWith('Id')) {
      return `propData?.id || ${dataName}?._id`;
    }
    // For array fields
    if (fieldName.match(/items|steps|updates|timeline|list|array|images|products|users|orders|features|links|stats|statistics|metrics|categories|tags|members|avatars|methods|examples|reviews|comments|notifications|messages|events|courses|lessons|modules|posts|articles|videos|photos|data|results|activities|cards|testimonials|faqs|questions|answers|options|choices|variants|attributes|filters|transactions|invoices|payments|receipts|shipments|deliveries/i)) {
      return `propData?.${fieldName} || ([] as any[])`;
    }
    // For object fields
    if (fieldName.match(/address|metadata|config|settings|tracking|gallery/i)) {
      return `propData?.${fieldName} || ({} as any)`;
    }
    // For scalar values - return empty string as fallback
    return `propData?.${fieldName} || ''`;
  };

  // Parse data source for clean prop naming (sanitize to camelCase)
  const sanitizeVariableName = (name: string): string => {
    // Replace dots and underscores with camelCase
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

  const commonImports = `
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Shield, CheckCircle, XCircle, RefreshCw, Volume2, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';`;

  const variants = {
    recaptcha: `
${commonImports}

interface CaptchaRecaptchaProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onVerify?: (token: string) => void;
}

const CaptchaRecaptcha: React.FC<CaptchaRecaptchaProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className, onVerify }) => {
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);

  // Fetch data using useQuery
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: () => api.get<any>(\`${apiRoute}\`),
    enabled: !propData,
  });

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const captchaData = propData || fetchedData || {};

  const verifyLabel = ${getField('verifyLabel')};
  const verifyingText = ${getField('verifyingText')};
  const verifiedText = ${getField('verifiedText')};
  const checkboxLabel = ${getField('checkboxLabel')};
  const submitButton = ${getField('submitButton')};
  const privacyText = ${getField('privacyText')};
  const termsText = ${getField('termsText')};

  // Simulate reCAPTCHA behavior
  const handleCheckboxClick = () => {
    if (isVerified) return;

    setIsChecked(true);
    setIsVerifying(true);

    // Simulate verification delay
    setTimeout(() => {
      // Randomly decide if additional challenge is needed
      const needsChallenge = Math.random() > 0.7;

      if (needsChallenge) {
        setShowChallenge(true);
        setIsVerifying(false);
      } else {
        setIsVerified(true);
        setIsVerifying(false);
        onVerify?.('mock-recaptcha-token-' + Date.now());
      }
    }, 1500);
  };

  const handleChallengeComplete = () => {
    setShowChallenge(false);
    setIsVerified(true);
    onVerify?.('mock-recaptcha-token-' + Date.now());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isVerified) {
      console.log('Form submitted with reCAPTCHA verification');
    }
  };

  return (
    <div className={cn("max-w-md mx-auto p-6", className)}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center mb-6">
          <Shield className="h-16 w-16 mx-auto mb-4 text-blue-600" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {verifyLabel}
          </h3>
        </div>

        {/* reCAPTCHA Widget */}
        <div className="bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCheckboxClick}
              disabled={isVerified || isVerifying}
              className={\`flex-shrink-0 w-8 h-8 border-2 rounded transition-all \${
                isVerified
                  ? 'bg-green-500 border-green-500'
                  : isVerifying
                  ? 'border-blue-500 animate-pulse'
                  : 'border-gray-400 hover:border-gray-500'
              } disabled:cursor-not-allowed\`}
            >
              {isVerified && <CheckCircle className="h-7 w-7 text-white" />}
            </button>

            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {isVerifying ? verifyingText : isVerified ? verifiedText : checkboxLabel}
              </p>
            </div>

            {!isVerified && !isVerifying && (
              <div className="flex-shrink-0">
                <img
                  src="https://www.gstatic.com/recaptcha/api2/logo_48.png"
                  alt="reCAPTCHA"
                  className="h-8 w-8"
                />
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{privacyText}</span>
              <a href="#" className="hover:underline">{termsText}</a>
            </div>
          </div>
        </div>

        {/* Challenge Modal */}
        {showChallenge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-6">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Additional Verification Required
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Please select all images containing traffic lights
              </p>

              <div className="grid grid-cols-3 gap-2 mb-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                  <button
                    key={i}
                    type="button"
                    className="aspect-square bg-gray-200 dark:bg-gray-700 rounded hover:ring-2 hover:ring-blue-500 transition-all"
                  >
                    <img
                      src={\`https://via.placeholder.com/150?text=\${i}\`}
                      alt={\`Challenge \${i}\`}
                      className="w-full h-full object-cover rounded"
                    />
                  </button>
                ))}
              </div>

              <button
                onClick={handleChallengeComplete}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Verify
              </button>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isVerified}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-semibold rounded-lg transition-colors disabled:cursor-not-allowed"
        >
          {submitButton}
        </button>
      </form>
    </div>
  );
};

export default CaptchaRecaptcha;
    `,

    hcaptcha: `
${commonImports}

interface CaptchaHcaptchaProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onVerify?: (token: string) => void;
}

const CaptchaHcaptcha: React.FC<CaptchaHcaptchaProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className, onVerify }) => {
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [selectedImages, setSelectedImages] = useState<number[]>([]);

  // Fetch data using useQuery
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: () => api.get<any>(\`${apiRoute}\`),
    enabled: !propData,
  });

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const captchaData = propData || fetchedData || {};

  const verifyLabel = ${getField('verifyLabel')};
  const verifyingText = ${getField('verifyingText')};
  const verifiedText = ${getField('verifiedText')};
  const failedText = ${getField('failedText')};
  const retryText = ${getField('retryText')};
  const submitButton = ${getField('submitButton')};
  const imageChallenge = ${getField('imageChallenge')};
  const images = ${getField('images')};
  const accessibilityOption = ${getField('accessibilityOption')};

  const handleVerifyClick = () => {
    setShowChallenge(true);
  };

  const handleImageClick = (imageId: number) => {
    setSelectedImages(prev =>
      prev.includes(imageId)
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  const handleChallengeSubmit = () => {
    setIsVerifying(true);

    // Simulate verification
    setTimeout(() => {
      const correctImages = images.filter((img: any) => img.hasTarget).map((img: any) => img.id);
      const isCorrect = correctImages.every((id: number) => selectedImages.includes(id)) &&
                        selectedImages.every((id: number) => correctImages.includes(id));

      if (isCorrect) {
        setIsVerified(true);
        setShowChallenge(false);
        onVerify?.('mock-hcaptcha-token-' + Date.now());
      }
      setIsVerifying(false);
      setSelectedImages([]);
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isVerified) {
      console.log('Form submitted with hCaptcha verification');
    }
  };

  return (
    <div className={cn("max-w-md mx-auto p-6", className)}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center mb-6">
          <Shield className="h-16 w-16 mx-auto mb-4 text-purple-600" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {verifyLabel}
          </h3>
        </div>

        {/* hCaptcha Widget */}
        <div className="bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
          {isVerified ? (
            <div className="p-6 bg-green-50 dark:bg-green-900/30 border-2 border-green-500">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-semibold text-green-900 dark:text-green-100">
                    {verifiedText}
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    You may now continue
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleVerifyClick}
              className="w-full p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 border-2 border-gray-400 dark:border-gray-500 rounded" />
                <p className="flex-1 text-sm font-medium text-gray-900 dark:text-white">
                  Click to verify
                </p>
                <img
                  src="https://assets.hcaptcha.com/captcha/v1/static/hcaptcha-logo.svg"
                  alt="hCaptcha"
                  className="h-6"
                />
              </div>
            </button>
          )}
        </div>

        {/* Challenge Modal */}
        {showChallenge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-lg w-full">
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <h4 className="font-bold text-gray-900 dark:text-white">hCaptcha Challenge</h4>
                </div>
                <button
                  onClick={() => setShowChallenge(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>

              {/* Challenge */}
              <div className="p-6">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                  {imageChallenge}
                </p>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  {images.map((img: any) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => handleImageClick(img.id)}
                      className={\`relative aspect-square rounded-lg overflow-hidden border-2 transition-all \${
                        selectedImages.includes(img.id)
                          ? 'border-purple-500 ring-2 ring-purple-500'
                          : 'border-transparent'
                      }\`}
                    >
                      <img
                        src={img.url}
                        alt={\`Challenge \${img.id}\`}
                        className="w-full h-full object-cover"
                      />
                      {selectedImages.includes(img.id) && (
                        <div className="absolute inset-0 bg-purple-500/30 flex items-center justify-center">
                          <CheckCircle className="h-8 w-8 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  >
                    <Volume2 className="h-4 w-4" />
                    {accessibilityOption}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedImages([])}
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  >
                    <RefreshCw className="h-4 w-4" />
                    New Challenge
                  </button>
                </div>

                <button
                  onClick={handleChallengeSubmit}
                  disabled={selectedImages.length === 0 || isVerifying}
                  className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-semibold rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  {isVerifying ? 'Verifying...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isVerified}
          className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-semibold rounded-lg transition-colors disabled:cursor-not-allowed"
        >
          {submitButton}
        </button>
      </form>
    </div>
  );
};

export default CaptchaHcaptcha;
    `,

    custom: `
${commonImports}

interface CaptchaCustomProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onVerify?: (success: boolean) => void;
}

const CaptchaCustom: React.FC<CaptchaCustomProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className, onVerify }) => {
  const [currentChallenge, setCurrentChallenge] = useState<any>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState('');

  // Fetch data using useQuery
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: () => api.get<any>(\`${apiRoute}\`),
    enabled: !propData,
  });

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const captchaData = propData || fetchedData || {};

  const verifyLabel = ${getField('verifyLabel')};
  const verifiedText = ${getField('verifiedText')};
  const failedText = ${getField('failedText')};
  const retryText = ${getField('retryText')};
  const submitButton = ${getField('submitButton')};
  const challenges = ${getField('challenges')};
  const errorMessage = ${getField('errorMessage')};

  useEffect(() => {
    generateNewChallenge();
  }, []);

  const generateNewChallenge = () => {
    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    setCurrentChallenge(randomChallenge);
    setUserAnswer('');
    setError('');
  };

  const handleVerify = () => {
    if (!currentChallenge) return;

    if (userAnswer.trim().toLowerCase() === currentChallenge.answer.toLowerCase()) {
      setIsVerified(true);
      setError('');
      onVerify?.(true);
    } else {
      setAttempts(prev => prev + 1);
      setError(failedText);

      if (attempts >= 2) {
        generateNewChallenge();
        setAttempts(0);
      }
    }
  };

  const handleRetry = () => {
    setIsVerified(false);
    setUserAnswer('');
    setError('');
    setAttempts(0);
    generateNewChallenge();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isVerified) {
      console.log('Form submitted with custom CAPTCHA verification');
    }
  };

  return (
    <div className={cn("max-w-md mx-auto p-6", className)}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center mb-6">
          <Shield className="h-16 w-16 mx-auto mb-4 text-indigo-600" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {verifyLabel}
          </h3>
        </div>

        {/* Custom CAPTCHA */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 border-2 border-indigo-200 dark:border-indigo-800 rounded-lg p-6">
          {isVerified ? (
            <div className="text-center py-4">
              <CheckCircle className="h-16 w-16 mx-auto mb-3 text-green-600" />
              <p className="text-lg font-semibold text-green-900 dark:text-green-100">
                {verifiedText}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Challenge Question */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <p className="text-center text-xl font-mono font-bold text-gray-900 dark:text-white">
                  {currentChallenge?.question}
                </p>
              </div>

              {/* Answer Input */}
              <div>
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                  placeholder="Enter your answer"
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {error}. {attempts >= 2 ? 'New challenge generated.' : \`\${2 - attempts} attempt(s) remaining.\`}
                  </p>
                </div>
              )}

              {/* Verify Button */}
              <button
                type="button"
                onClick={handleVerify}
                disabled={!userAnswer.trim()}
                className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-semibold rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                Verify Answer
              </button>

              {/* Refresh Button */}
              <button
                type="button"
                onClick={generateNewChallenge}
                className="w-full px-4 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Get New Challenge
              </button>
            </div>
          )}
        </div>

        {/* Retry Option */}
        {isVerified && (
          <button
            type="button"
            onClick={handleRetry}
            className="w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 font-medium transition-colors"
          >
            {retryText}
          </button>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isVerified}
          className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-semibold rounded-lg transition-colors disabled:cursor-not-allowed"
        >
          {submitButton}
        </button>

        {/* Info */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400">
          This is a custom math-based CAPTCHA for demonstration purposes
        </div>
      </form>
    </div>
  );
};

export default CaptchaCustom;
    `
  };

  return variants[variant] || variants.recaptcha;
};
