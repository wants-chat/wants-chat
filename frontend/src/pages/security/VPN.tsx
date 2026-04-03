import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, MapPin, Wifi, WifiOff, Clock, Globe, Check, Zap } from 'lucide-react';
import Header from '../../components/landing/Header';
import BackgroundEffects from '../../components/ui/BackgroundEffects';

interface VPNServer {
  id: string;
  country: string;
  city: string;
  flag: string;
  load: number;
  ping: number;
  isPremium: boolean;
}

const VPN: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [selectedServer, setSelectedServer] = useState<VPNServer | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const servers: VPNServer[] = [
    { id: '1', country: 'United States', city: 'New York', flag: '🇺🇸', load: 45, ping: 12, isPremium: false },
    { id: '2', country: 'United Kingdom', city: 'London', flag: '🇬🇧', load: 62, ping: 28, isPremium: false },
    { id: '3', country: 'Germany', city: 'Berlin', flag: '🇩🇪', load: 38, ping: 35, isPremium: false },
    { id: '4', country: 'Japan', city: 'Tokyo', flag: '🇯🇵', load: 51, ping: 118, isPremium: true },
    { id: '5', country: 'Singapore', city: 'Singapore', flag: '🇸🇬', load: 44, ping: 95, isPremium: true },
    { id: '6', country: 'Canada', city: 'Toronto', flag: '🇨🇦', load: 29, ping: 18, isPremium: false },
    { id: '7', country: 'Australia', city: 'Sydney', flag: '🇦🇺', load: 58, ping: 142, isPremium: true },
    { id: '8', country: 'France', city: 'Paris', flag: '🇫🇷', load: 42, ping: 32, isPremium: false },
  ];

  const handleConnect = (server: VPNServer) => {
    setIsConnecting(true);
    setSelectedServer(server);

    setTimeout(() => {
      setIsConnected(true);
      setIsConnecting(false);
    }, 2000);
  };

  const handleDisconnect = () => {
    setIsConnecting(true);

    setTimeout(() => {
      setIsConnected(false);
      setIsConnecting(false);
      setSelectedServer(null);
    }, 1000);
  };

  const getLoadColor = (load: number) => {
    if (load < 40) return 'text-emerald-400';
    if (load < 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects variant="subtle" />
      <Header />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                VPN Shield
              </h1>
              <p className="text-slate-400 text-sm">Secure your connection with encrypted VPN</p>
            </div>
          </div>
        </motion.div>

        {/* Connection Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-teal-400/30 p-6 shadow-xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Status Display */}
              <div className="flex-1 w-full">
                <div className="flex items-center gap-4 mb-4">
                  <motion.div
                    animate={{
                      scale: isConnecting ? [1, 1.2, 1] : 1,
                      rotate: isConnecting ? 360 : 0,
                    }}
                    transition={{
                      duration: isConnecting ? 1 : 0,
                      repeat: isConnecting ? Infinity : 0,
                    }}
                    className={`p-4 rounded-full ${
                      isConnected
                        ? 'bg-emerald-500/20 border-2 border-emerald-500'
                        : 'bg-slate-700/50 border-2 border-slate-600'
                    }`}
                  >
                    {isConnected ? (
                      <Wifi className="w-8 h-8 text-emerald-400" />
                    ) : (
                      <WifiOff className="w-8 h-8 text-slate-400" />
                    )}
                  </motion.div>

                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {isConnecting ? 'Connecting...' : isConnected ? 'Connected' : 'Disconnected'}
                    </h2>
                    {selectedServer && isConnected && (
                      <div className="flex items-center gap-2 text-teal-400">
                        <span className="text-3xl">{selectedServer.flag}</span>
                        <span className="font-medium">{selectedServer.city}, {selectedServer.country}</span>
                      </div>
                    )}
                    {!isConnected && !isConnecting && (
                      <p className="text-slate-400">Select a server to connect</p>
                    )}
                  </div>
                </div>

                {/* Connection Stats */}
                {isConnected && selectedServer && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-700/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                        <Zap className="w-3 h-3" />
                        <span>Ping</span>
                      </div>
                      <p className="text-lg font-bold text-emerald-400">{selectedServer.ping}ms</p>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                        <Globe className="w-3 h-3" />
                        <span>Load</span>
                      </div>
                      <p className={`text-lg font-bold ${getLoadColor(selectedServer.load)}`}>
                        {selectedServer.load}%
                      </p>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                        <Clock className="w-3 h-3" />
                        <span>Protocol</span>
                      </div>
                      <p className="text-lg font-bold text-cyan-400">WireGuard</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Connect/Disconnect Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={isConnected ? handleDisconnect : () => {}}
                disabled={!isConnected && !selectedServer}
                className={`px-8 py-4 rounded-xl font-bold text-lg transition-all ${
                  isConnected
                    ? 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white shadow-lg shadow-red-500/50'
                    : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg shadow-teal-500/50 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {isConnecting ? 'Connecting...' : isConnected ? 'Disconnect' : 'Select Server'}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Server List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-teal-400" />
            Available Servers
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {servers.map((server, index) => (
              <motion.div
                key={server.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => !isConnected && handleConnect(server)}
                className={`bg-slate-800/50 backdrop-blur-xl rounded-xl border p-4 cursor-pointer transition-all ${
                  selectedServer?.id === server.id && isConnected
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-teal-400/30 hover:border-teal-400/50'
                } ${isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{server.flag}</span>
                    <div>
                      <h3 className="font-bold text-white flex items-center gap-2">
                        {server.country}
                        {selectedServer?.id === server.id && isConnected && (
                          <Check className="w-4 h-4 text-emerald-400" />
                        )}
                      </h3>
                      <p className="text-sm text-slate-400">{server.city}</p>
                    </div>
                  </div>
                  {server.isPremium && (
                    <span className="px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full">
                      PRO
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Zap className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300">{server.ping}ms</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe className="w-4 h-4 text-slate-400" />
                    <span className={getLoadColor(server.load)}>{server.load}% load</span>
                  </div>
                </div>

                {/* Load Bar */}
                <div className="mt-3 bg-slate-700/50 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${server.load}%` }}
                    transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    className={`h-full rounded-full ${
                      server.load < 40
                        ? 'bg-gradient-to-r from-emerald-500 to-green-500'
                        : server.load < 70
                        ? 'bg-gradient-to-r from-yellow-500 to-amber-500'
                        : 'bg-gradient-to-r from-red-500 to-rose-500'
                    }`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VPN;
