import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Nfc, Smartphone, CheckCircle, XCircle, Info, Wifi } from 'lucide-react';
import Header from '../../components/landing/Header';
import BackgroundEffects from '../../components/ui/BackgroundEffects';

interface NFCData {
  serialNumber?: string;
  type?: string;
  records?: any[];
  timestamp: number;
}

const NFCScanner: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [nfcData, setNfcData] = useState<NFCData | null>(null);
  const [error, setError] = useState<string>('');
  const [isSupported, setIsSupported] = useState(false);

  // Check if Web NFC API is supported
  React.useEffect(() => {
    if ('NDEFReader' in window) {
      setIsSupported(true);
    } else {
      setIsSupported(false);
    }
  }, []);

  const startScanning = async () => {
    if (!isSupported) {
      setError('Web NFC API is not supported on this device/browser.');
      return;
    }

    try {
      // @ts-ignore - NDEFReader is not in TypeScript types yet
      const ndef = new NDEFReader();

      setIsScanning(true);
      setError('');

      await ndef.scan();

      ndef.addEventListener('reading', ({ serialNumber, message }: any) => {
        const data: NFCData = {
          serialNumber,
          type: message?.records?.[0]?.recordType || 'unknown',
          records: message?.records || [],
          timestamp: Date.now()
        };
        setNfcData(data);
        setIsScanning(false);
      });

      ndef.addEventListener('readingerror', () => {
        setError('Failed to read NFC tag. Please try again.');
        setIsScanning(false);
      });

    } catch (err: any) {
      console.error('NFC error:', err);
      setError(err.message || 'Failed to start NFC scanning. Please check permissions.');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
  };

  const clearData = () => {
    setNfcData(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900">
      <BackgroundEffects variant="subtle" />
      <Header />

      <main className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Nfc className="w-10 h-10 text-cyan-400" />
            NFC Scanner
          </h1>
          <p className="text-teal-200">Scan and read NFC tags using Web NFC API</p>
        </motion.div>

        {/* Main Scanner Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-teal-900/50 to-cyan-900/50 backdrop-blur-xl border border-teal-400/30 rounded-2xl p-8 shadow-2xl mb-6"
        >
          {/* Scanner Visual */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-64 h-64 mb-6">
              {/* Animated NFC Waves */}
              {isScanning && (
                <>
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-cyan-400"
                    initial={{ scale: 0.8, opacity: 0.8 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-teal-400"
                    initial={{ scale: 0.8, opacity: 0.8 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-cyan-500"
                    initial={{ scale: 0.8, opacity: 0.8 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
                  />
                </>
              )}

              {/* Center Icon */}
              <motion.div
                className={`absolute inset-0 rounded-full flex items-center justify-center ${
                  isScanning
                    ? 'bg-gradient-to-br from-cyan-500 to-teal-500'
                    : nfcData
                    ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                    : 'bg-gradient-to-br from-teal-700 to-cyan-700'
                } shadow-2xl`}
                animate={{
                  scale: isScanning ? [1, 1.05, 1] : 1,
                }}
                transition={{ duration: 1, repeat: isScanning ? Infinity : 0 }}
              >
                {isScanning ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <Wifi className="w-24 h-24 text-white" />
                  </motion.div>
                ) : nfcData ? (
                  <CheckCircle className="w-24 h-24 text-white" />
                ) : (
                  <Nfc className="w-24 h-24 text-white" />
                )}
              </motion.div>

              {/* Status Badge */}
              <motion.div
                className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-sm border border-teal-400/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span className="text-white font-medium text-sm">
                  {isScanning ? 'Scanning...' : nfcData ? 'Tag Detected' : 'Ready'}
                </span>
              </motion.div>
            </div>

            {/* Control Buttons */}
            <div className="flex gap-4">
              <button
                onClick={isScanning ? stopScanning : startScanning}
                disabled={!isSupported}
                className={`px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 ${
                  isScanning
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600'
                    : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600'
                } shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isScanning ? 'Stop Scanning' : 'Start Scanning'}
              </button>

              {nfcData && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={clearData}
                  className="px-6 py-4 rounded-xl font-semibold text-white bg-white/10 hover:bg-white/20 border border-teal-400/30 transition-all"
                >
                  Clear Data
                </motion.button>
              )}
            </div>
          </div>

          {/* NFC Data Display */}
          {nfcData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-teal-400/20"
            >
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                NFC Tag Information
              </h3>
              <div className="space-y-3">
                {nfcData.serialNumber && (
                  <div className="flex justify-between items-center">
                    <span className="text-teal-200">Serial Number:</span>
                    <span className="text-white font-mono text-sm">{nfcData.serialNumber}</span>
                  </div>
                )}
                {nfcData.type && (
                  <div className="flex justify-between items-center">
                    <span className="text-teal-200">Type:</span>
                    <span className="text-white">{nfcData.type}</span>
                  </div>
                )}
                {nfcData.records && nfcData.records.length > 0 && (
                  <div>
                    <span className="text-teal-200">Records:</span>
                    <div className="mt-2 text-white text-sm">
                      {nfcData.records.length} record(s) found
                    </div>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-teal-200">Scanned:</span>
                  <span className="text-white text-sm">
                    {new Date(nfcData.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-900/30 border border-red-500/30 rounded-xl p-4 backdrop-blur-sm"
          >
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Browser Support Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`mb-6 ${
            isSupported
              ? 'bg-green-900/30 border-green-500/30'
              : 'bg-yellow-900/30 border-yellow-500/30'
          } border rounded-xl p-6 backdrop-blur-sm`}
        >
          <div className="flex items-start gap-3">
            {isSupported ? (
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <h3 className={`${isSupported ? 'text-green-200' : 'text-yellow-200'} font-semibold mb-2`}>
                {isSupported ? 'Web NFC API Supported' : 'Web NFC API Not Supported'}
              </h3>
              <p className={`${isSupported ? 'text-green-200' : 'text-yellow-200'} text-sm mb-3`}>
                {isSupported
                  ? 'Your device and browser support Web NFC API. You can scan NFC tags.'
                  : 'Web NFC API is currently only supported on Android devices with Chrome 89+ or Edge 93+.'}
              </p>
              {!isSupported && (
                <div className="text-yellow-200 text-sm">
                  <p className="font-semibold mb-2">Supported Platforms:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Chrome 89+ on Android</li>
                    <li>• Edge 93+ on Android</li>
                    <li>• Samsung Internet (some versions)</li>
                  </ul>
                  <p className="mt-3">
                    <strong>Note:</strong> iOS and desktop browsers do not currently support Web NFC API.
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        >
          <div className="bg-gradient-to-br from-teal-900/30 to-cyan-900/30 backdrop-blur-sm border border-teal-400/20 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Nfc className="w-5 h-5 text-teal-400" />
              <h3 className="text-white font-semibold">Read NFC Tags</h3>
            </div>
            <p className="text-teal-200 text-sm">Scan and read data from NFC tags</p>
          </div>

          <div className="bg-gradient-to-br from-teal-900/30 to-cyan-900/30 backdrop-blur-sm border border-teal-400/20 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Smartphone className="w-5 h-5 text-cyan-400" />
              <h3 className="text-white font-semibold">Mobile Only</h3>
            </div>
            <p className="text-teal-200 text-sm">Requires Android device with NFC hardware</p>
          </div>

          <div className="bg-gradient-to-br from-teal-900/30 to-cyan-900/30 backdrop-blur-sm border border-teal-400/20 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Info className="w-5 h-5 text-teal-400" />
              <h3 className="text-white font-semibold">Tag Information</h3>
            </div>
            <p className="text-teal-200 text-sm">View serial number and tag data</p>
          </div>
        </motion.div>

        {/* Usage Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-6 backdrop-blur-sm"
        >
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-400" />
            How to Use NFC Scanner
          </h3>
          <div className="space-y-2 text-teal-200 text-sm">
            <ol className="space-y-2 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">1.</span>
                <span>Make sure NFC is enabled in your device settings</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">2.</span>
                <span>Click "Start Scanning" to activate the NFC reader</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">3.</span>
                <span>Hold your device close to an NFC tag (within 4cm)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">4.</span>
                <span>The tag information will be displayed once detected</span>
              </li>
            </ol>
            <div className="mt-4 pt-4 border-t border-blue-500/20">
              <p className="font-semibold mb-2">What can you scan?</p>
              <ul className="space-y-1 ml-4">
                <li>• NFC business cards</li>
                <li>• Smart posters and advertisements</li>
                <li>• Product tags and labels</li>
                <li>• Access control cards (read-only)</li>
                <li>• Transit/payment cards (limited data)</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default NFCScanner;
