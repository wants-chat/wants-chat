import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowUp, RefreshCw, Wifi, Gauge } from 'lucide-react';
import Header from '../../components/landing/Header';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

interface SpeedResult {
  download: number;
  upload: number;
  ping: number;
  jitter: number;
}

const InternetSpeed: React.FC = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<SpeedResult | null>(null);
  const [testPhase, setTestPhase] = useState<'idle' | 'ping' | 'download' | 'upload'>('idle');

  const startTest = async () => {
    setIsTesting(true);
    setProgress(0);
    setResult(null);

    // Simulate ping test
    setTestPhase('ping');
    await simulateProgress(0, 25, 1000);

    // Simulate download test
    setTestPhase('download');
    await simulateProgress(25, 60, 2000);

    // Simulate upload test
    setTestPhase('upload');
    await simulateProgress(60, 100, 1500);

    // Set mock results
    setResult({
      download: Math.random() * 80 + 20, // 20-100 Mbps
      upload: Math.random() * 40 + 10, // 10-50 Mbps
      ping: Math.random() * 30 + 10, // 10-40 ms
      jitter: Math.random() * 5 + 1, // 1-6 ms
    });

    setIsTesting(false);
    setTestPhase('idle');
  };

  const simulateProgress = (start: number, end: number, duration: number): Promise<void> => {
    return new Promise((resolve) => {
      const steps = 50;
      const increment = (end - start) / steps;
      const stepDuration = duration / steps;
      let current = start;

      const interval = setInterval(() => {
        current += increment;
        setProgress(Math.min(current, end));

        if (current >= end) {
          clearInterval(interval);
          resolve();
        }
      }, stepDuration);
    });
  };

  const getSpeedColor = (speed: number, max: number) => {
    const percentage = (speed / max) * 100;
    if (percentage >= 70) return 'text-green-400';
    if (percentage >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900">
      <BackgroundEffects variant="subtle" />
      <Header />

      <div className="relative z-10 container mx-auto px-4 py-8 mt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                Internet Speed Test
              </h1>
              <p className="text-gray-400">
                Test your download and upload speeds
              </p>
            </div>

            <Card className="bg-slate-800/50 border-teal-500/30 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-teal-400">
                  <Wifi className="w-5 h-5" />
                  Speed Test
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {/* Speed Gauges */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Download Speed */}
                    <motion.div
                      className="relative"
                      animate={testPhase === 'download' ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ duration: 0.5, repeat: testPhase === 'download' ? Infinity : 0 }}
                    >
                      <div className="bg-gradient-to-br from-teal-900/30 to-cyan-900/30 rounded-2xl p-6 border border-teal-500/30">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-gray-400 text-sm">Download Speed</span>
                          <ArrowDown className="w-5 h-5 text-teal-400" />
                        </div>
                        <div className="relative w-40 h-40 mx-auto">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle
                              cx="80"
                              cy="80"
                              r="70"
                              stroke="currentColor"
                              strokeWidth="12"
                              fill="none"
                              className="text-slate-700"
                            />
                            <circle
                              cx="80"
                              cy="80"
                              r="70"
                              stroke="currentColor"
                              strokeWidth="12"
                              fill="none"
                              strokeLinecap="round"
                              className="text-teal-400"
                              strokeDasharray={`${2 * Math.PI * 70}`}
                              strokeDashoffset={`${
                                2 * Math.PI * 70 * (1 - (result?.download || 0) / 100)
                              }`}
                              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <div className={`text-3xl font-bold ${getSpeedColor(result?.download || 0, 100)}`}>
                                {result ? result.download.toFixed(1) : '--'}
                              </div>
                              <div className="text-xs text-gray-400">Mbps</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Upload Speed */}
                    <motion.div
                      className="relative"
                      animate={testPhase === 'upload' ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ duration: 0.5, repeat: testPhase === 'upload' ? Infinity : 0 }}
                    >
                      <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 rounded-2xl p-6 border border-cyan-500/30">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-gray-400 text-sm">Upload Speed</span>
                          <ArrowUp className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div className="relative w-40 h-40 mx-auto">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle
                              cx="80"
                              cy="80"
                              r="70"
                              stroke="currentColor"
                              strokeWidth="12"
                              fill="none"
                              className="text-slate-700"
                            />
                            <circle
                              cx="80"
                              cy="80"
                              r="70"
                              stroke="currentColor"
                              strokeWidth="12"
                              fill="none"
                              strokeLinecap="round"
                              className="text-cyan-400"
                              strokeDasharray={`${2 * Math.PI * 70}`}
                              strokeDashoffset={`${
                                2 * Math.PI * 70 * (1 - (result?.upload || 0) / 100)
                              }`}
                              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <div className={`text-3xl font-bold ${getSpeedColor(result?.upload || 0, 100)}`}>
                                {result ? result.upload.toFixed(1) : '--'}
                              </div>
                              <div className="text-xs text-gray-400">Mbps</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Additional Metrics */}
                  {result && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div className="bg-slate-700/30 rounded-lg p-4 border border-teal-500/20">
                        <div className="text-gray-400 text-sm mb-1">Ping</div>
                        <div className="text-2xl font-bold text-teal-400">
                          {result.ping.toFixed(0)} ms
                        </div>
                      </div>
                      <div className="bg-slate-700/30 rounded-lg p-4 border border-cyan-500/20">
                        <div className="text-gray-400 text-sm mb-1">Jitter</div>
                        <div className="text-2xl font-bold text-cyan-400">
                          {result.jitter.toFixed(1)} ms
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Progress Bar */}
                  {isTesting && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>
                          {testPhase === 'ping' && 'Testing ping...'}
                          {testPhase === 'download' && 'Testing download speed...'}
                          {testPhase === 'upload' && 'Testing upload speed...'}
                        </span>
                        <span>{progress.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-teal-500 to-cyan-500"
                          style={{ width: `${progress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Test Button */}
                  <Button
                    onClick={startTest}
                    disabled={isTesting}
                    className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold py-6 text-lg"
                  >
                    {isTesting ? (
                      <>
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Gauge className="w-5 h-5 mr-2" />
                        {result ? 'Test Again' : 'Start Test'}
                      </>
                    )}
                  </Button>

                  {/* Info */}
                  <div className="text-center text-sm text-gray-400">
                    <p>Speed tests are simulated for demonstration purposes.</p>
                    <p className="mt-1">For accurate results, use your ISP's speed test tool.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InternetSpeed;
