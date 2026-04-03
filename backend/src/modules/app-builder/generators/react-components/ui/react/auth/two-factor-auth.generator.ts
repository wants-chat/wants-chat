import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateTwoFactorAuth = (
  resolved: ResolvedComponent,
  variant: 'setup' | 'verify' | 'backup' = 'setup'
) => {
  const dataSource = resolved.dataSource;

  // Get the resolved field names from the field resolver service
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

  // Parse data source for clean prop naming
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
    return `/${dataSource || 'auth'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'auth';

  const commonImports = `
import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Play, Copy, Download, Printer, Check, Shield, Smartphone, ArrowLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';`;

  const variants = {
    setup: `
${commonImports}

interface TwoFactorAuthProps {
  ${dataName}?: any;
  className?: string;
  onComplete?: (secretKey: string) => void;
  onCancel?: () => void;
}

const TwoFactorAuthComponent: React.FC<TwoFactorAuthProps> = ({
  ${dataName},
  className,
  onComplete,
  onCancel
}) => {
  const twoFactorData = ${dataName} || {};

  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<'setup' | 'verify'>('setup');

  const setupTitle = ${getField('setupTitle')};
  const setupSubtitle = ${getField('setupSubtitle')};
  const scanQrTitle = ${getField('scanQrTitle')};
  const scanQrDescription = ${getField('scanQrDescription')};
  const manualEntryTitle = ${getField('manualEntryTitle')};
  const secretKey = ${getField('secretKey')};
  const appSuggestions = ${getField('appSuggestions')};
  const verifyTitle = ${getField('verifyTitle')};
  const verifySubtitle = ${getField('verifySubtitle')};
  const codeLabel = ${getField('codeLabel')};
  const codePlaceholder = ${getField('codePlaceholder')};
  const verifyButtonText = ${getField('verifyButtonText')};
  const continueButtonText = ${getField('continueButtonText')};
  const backButtonText = ${getField('backButtonText')};
  const cancelButtonText = ${getField('cancelButtonText')};
  const qrCodeImage = ${getField('qrCodeImage')};
  const logoText = ${getField('logoText')};

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secretKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContinue = () => {
    setStep('verify');
  };

  const handleVerify = () => {
    if (!verificationCode) {
      setError('Verification code is required');
      return;
    }

    if (verificationCode.length !== 6) {
      setError('Code must be 6 digits');
      return;
    }

    // Simulate verification
    console.log('Verifying code:', verificationCode);
    console.log('Secret key:', secretKey);

    // In real app, verify against backend
    onComplete?.(secretKey);
  };

  const handleCancel = () => {
    console.log('2FA setup cancelled');
    onCancel?.();
  };

  const FluxezLogo = () => (
    <div className="flex items-center justify-center space-x-3 mb-8">
      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
        <Play className="w-6 h-6 text-white fill-white" />
      </div>
      <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{logoText}</span>
    </div>
  );

  if (step === 'verify') {
    return (
      <div className={cn("min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center p-4", className)}>
        <div className="w-full max-w-md">
          <FluxezLogo />

          <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Smartphone className="w-10 h-10 text-white" />
              </div>

              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {verifyTitle}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {verifySubtitle}
              </p>
            </div>

            <div className="mb-6">
              <Label htmlFor="code">{codeLabel}</Label>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder={codePlaceholder}
                value={verificationCode}
                onChange={(e) => {
                  setVerificationCode(e.target.value.replace(/\\D/g, ''));
                  setError('');
                }}
                className={cn(
                  "mt-1 h-12 text-center text-2xl font-mono tracking-widest",
                  error && "border-red-500"
                )}
              />
              {error && (
                <p className="text-sm text-red-500 mt-1">{error}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('setup')}
                className="flex-1 h-12 rounded-full border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 font-bold transition-all hover:scale-105 shadow-md flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {backButtonText}
              </button>

              <button
                onClick={handleVerify}
                className="flex-1 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold transition-all hover:scale-105 shadow-lg"
              >
                {verifyButtonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center p-4", className)}>
      <div className="w-full max-w-lg">
        <FluxezLogo />

        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Shield className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {setupTitle}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {setupSubtitle}
            </p>
          </div>

          {/* QR Code Section */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 mb-6 border-2 border-blue-200 dark:border-blue-800 shadow-lg">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-center flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {scanQrTitle}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 text-center mb-4">
              {scanQrDescription}
            </p>

            <div className="flex justify-center mb-4">
              <div className="bg-white p-4 rounded-xl shadow-xl border-2 border-gray-200 dark:border-gray-600">
                <img
                  src={qrCodeImage}
                  alt="QR Code"
                  className="w-48 h-48"
                />
              </div>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center font-medium">
              {appSuggestions}
            </p>
          </div>

          {/* Manual Entry Section */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-center">
              {manualEntryTitle}
            </h3>

            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl p-4 flex items-center justify-between border-2 border-gray-200 dark:border-gray-700 shadow-md">
              <code className="text-sm font-mono font-bold text-gray-900 dark:text-white">
                {secretKey}
              </code>
              <button
                onClick={handleCopySecret}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center justify-center transition-all hover:scale-110 shadow-lg"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-white" />
                ) : (
                  <Copy className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 h-12 rounded-full border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 font-bold transition-all hover:scale-105 shadow-md"
            >
              {cancelButtonText}
            </button>

            <button
              onClick={handleContinue}
              className="flex-1 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold transition-all hover:scale-105 shadow-lg"
            >
              {continueButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuthComponent;
    `,

    verify: `
${commonImports}

interface TwoFactorAuthProps {
  ${dataName}?: any;
  className?: string;
  onSuccess?: (code: string) => void;
  onUseBackupCode?: () => void;
  onUseSms?: () => void;
}

const TwoFactorAuthComponent: React.FC<TwoFactorAuthProps> = ({
  ${dataName},
  className,
  onSuccess,
  onUseBackupCode,
  onUseSms
}) => {
  const twoFactorData = ${dataName} || {};

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [trustDevice, setTrustDevice] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const verifyTitle = ${getField('verifyTitle')};
  const verifySubtitle = ${getField('verifySubtitle')};
  const verifyButtonText = ${getField('verifyButtonText')};
  const trustDeviceText = ${getField('trustDeviceText')};
  const alternativeMethodsText = ${getField('alternativeMethodsText')};
  const useBackupCodeText = ${getField('useBackupCodeText')};
  const useSmsText = ${getField('useSmsText')};
  const logoText = ${getField('logoText')};

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^[0-9]$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const digits = pastedData.replace(/\\D/g, '').split('');

    const newCode = [...code];
    digits.forEach((digit, index) => {
      if (index < 6) {
        newCode[index] = digit;
      }
    });
    setCode(newCode);

    // Focus last filled input
    const lastIndex = Math.min(digits.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleVerify = () => {
    const verificationCode = code.join('');

    if (verificationCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    console.log('Verifying code:', verificationCode);
    console.log('Trust device:', trustDevice);

    // Simulate verification
    onSuccess?.(verificationCode);
  };

  const handleUseBackupCode = () => {
    console.log('Use backup code clicked');
    onUseBackupCode?.();
  };

  const handleUseSms = () => {
    console.log('Use SMS clicked');
    onUseSms?.();
  };

  const FluxezLogo = () => (
    <div className="flex items-center justify-center space-x-3 mb-8">
      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
        <Play className="w-6 h-6 text-white fill-white" />
      </div>
      <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{logoText}</span>
    </div>
  );

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center p-4", className)}>
      <div className="w-full max-w-md">
        <FluxezLogo />

        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Smartphone className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {verifyTitle}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {verifySubtitle}
            </p>
          </div>

          {/* Code Input */}
          <div className="mb-6">
            <div
              className="flex justify-center gap-2 mb-4"
              onPaste={handlePaste}
            >
              {code.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={cn(
                    "w-12 h-14 text-center text-2xl font-mono border-2 rounded-xl shadow-md transition-all focus:scale-105",
                    error ? "border-red-500" : "border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-purple-500"
                  )}
                />
              ))}
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center font-medium">{error}</p>
            )}
          </div>

          {/* Trust Device */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-3 rounded-xl border-2 border-blue-200 dark:border-blue-800">
              <Checkbox
                id="trust"
                checked={trustDevice}
                onCheckedChange={(checked) => setTrustDevice(checked === true)}
              />
              <Label htmlFor="trust" className="text-sm cursor-pointer font-medium">
                {trustDeviceText}
              </Label>
            </div>
          </div>

          <button
            onClick={handleVerify}
            className="w-full h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold transition-all hover:scale-105 shadow-lg mb-6"
          >
            {verifyButtonText}
          </button>

          {/* Alternative Methods */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium">
              {alternativeMethodsText}
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleUseBackupCode}
                className="text-blue-600 dark:text-blue-400 hover:text-purple-600 dark:hover:text-purple-400 font-bold transition-colors"
              >
                {useBackupCodeText}
              </button>
              <button
                onClick={handleUseSms}
                className="text-blue-600 dark:text-blue-400 hover:text-purple-600 dark:hover:text-purple-400 font-bold transition-colors"
              >
                {useSmsText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuthComponent;
    `,

    backup: `
${commonImports}

interface TwoFactorAuthProps {
  ${dataName}?: any;
  className?: string;
  onComplete?: () => void;
}

const TwoFactorAuthComponent: React.FC<TwoFactorAuthProps> = ({
  ${dataName},
  className,
  onComplete
}) => {
  const twoFactorData = ${dataName} || {};

  const [copied, setCopied] = useState(false);

  const backupTitle = ${getField('backupTitle')};
  const backupSubtitle = ${getField('backupSubtitle')};
  const backupCodes = ${getField('backupCodes')};
  const downloadButtonText = ${getField('downloadButtonText')};
  const copyButtonText = ${getField('copyButtonText')};
  const printButtonText = ${getField('printButtonText')};
  const completeSetupText = ${getField('completeSetupText')};
  const logoText = ${getField('logoText')};

  const handleCopyAll = () => {
    const codesText = backupCodes.join('\\n');
    navigator.clipboard.writeText(codesText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const codesText = backupCodes.join('\\n');
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=600,height=600');
    if (printWindow) {
      printWindow.document.write(\`
        <html>
          <head>
            <title>Backup Codes</title>
            <style>
              body { font-family: monospace; padding: 20px; }
              h1 { font-size: 18px; }
              .code { margin: 10px 0; font-size: 14px; }
            </style>
          </head>
          <body>
            <h1>Two-Factor Authentication Backup Codes</h1>
            \${backupCodes.map((code: string) => \`<div class="code">\${code}</div>\`).join('')}
          </body>
        </html>
      \`);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleComplete = () => {
    console.log('2FA setup completed');
    onComplete?.();
  };

  const FluxezLogo = () => (
    <div className="flex items-center justify-center space-x-3 mb-8">
      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
        <Play className="w-6 h-6 text-white fill-white" />
      </div>
      <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{logoText}</span>
    </div>
  );

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center p-4", className)}>
      <div className="w-full max-w-lg">
        <FluxezLogo />

        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Shield className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {backupTitle}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {backupSubtitle}
            </p>
          </div>

          {/* Backup Codes */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 mb-6 border-2 border-green-200 dark:border-green-800 shadow-lg">
            <div className="grid grid-cols-2 gap-3">
              {backupCodes.map((code: string, index: number) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center font-mono text-sm font-bold border-2 border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all hover:scale-105"
                >
                  {code}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <button
              onClick={handleDownload}
              className="h-12 rounded-full border-2 border-blue-300 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-600 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 font-bold transition-all hover:scale-105 shadow-md flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              {downloadButtonText}
            </button>

            <button
              onClick={handleCopyAll}
              className="h-12 rounded-full border-2 border-blue-300 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-600 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 font-bold transition-all hover:scale-105 shadow-md flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  {copyButtonText}
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="h-12 rounded-full border-2 border-blue-300 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-600 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 font-bold transition-all hover:scale-105 shadow-md flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              {printButtonText}
            </button>
          </div>

          {/* Warning */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-xl p-4 mb-6 shadow-md">
            <p className="text-sm text-yellow-900 dark:text-yellow-200 font-medium">
              <strong className="text-orange-600 dark:text-orange-400">Important:</strong> Store these codes in a secure location. Each code can only be used once. If you lose access to your authenticator app, these codes are your only way to regain access to your account.
            </p>
          </div>

          <button
            onClick={handleComplete}
            className="w-full h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold transition-all hover:scale-105 shadow-lg"
          >
            {completeSetupText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuthComponent;
    `
  };

  return variants[variant] || variants.setup;
};
