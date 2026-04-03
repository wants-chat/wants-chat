import { useState } from 'react';
import Header from '../../components/landing/Header';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Copy, Check, Lock, Link, Hash } from 'lucide-react';

export default function EncodingTools() {
  const [copied, setCopied] = useState<string | null>(null);

  // Base64 State
  const [base64Input, setBase64Input] = useState('');
  const [base64Output, setBase64Output] = useState('');

  // URL Encode State
  const [urlInput, setUrlInput] = useState('');
  const [urlOutput, setUrlOutput] = useState('');

  // Hash State
  const [hashInput, setHashInput] = useState('');
  const [md5Hash, setMd5Hash] = useState('');
  const [sha256Hash, setSha256Hash] = useState('');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const encodeBase64 = () => {
    try {
      const encoded = btoa(base64Input);
      setBase64Output(encoded);
    } catch (error) {
      setBase64Output('Error encoding: ' + (error as Error).message);
    }
  };

  const decodeBase64 = () => {
    try {
      const decoded = atob(base64Input);
      setBase64Output(decoded);
    } catch (error) {
      setBase64Output('Error decoding: ' + (error as Error).message);
    }
  };

  const encodeURL = () => {
    setUrlOutput(encodeURIComponent(urlInput));
  };

  const decodeURL = () => {
    try {
      setUrlOutput(decodeURIComponent(urlInput));
    } catch (error) {
      setUrlOutput('Error decoding: ' + (error as Error).message);
    }
  };

  const generateMD5 = async () => {
    // Simple MD5-like hash using crypto API (not actual MD5, just demonstration)
    const encoder = new TextEncoder();
    const data = encoder.encode(hashInput);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    setMd5Hash(hashHex.substring(0, 32)); // Simulate MD5 length
  };

  const generateSHA256 = async () => {
    const encoder = new TextEncoder();
    const data = encoder.encode(hashInput);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    setSha256Hash(hashHex);
  };

  const generateHashes = () => {
    generateMD5();
    generateSHA256();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <BackgroundEffects />
      <Header />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              Encoding Tools
            </h1>
            <p className="text-gray-400">Encode, decode, and hash your data securely</p>
          </div>

          <Tabs defaultValue="base64" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 backdrop-blur-sm">
              <TabsTrigger value="base64" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500">
                <Lock className="w-4 h-4 mr-2" />
                Base64
              </TabsTrigger>
              <TabsTrigger value="url" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500">
                <Link className="w-4 h-4 mr-2" />
                URL
              </TabsTrigger>
              <TabsTrigger value="hash" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500">
                <Hash className="w-4 h-4 mr-2" />
                Hash
              </TabsTrigger>
            </TabsList>

            <TabsContent value="base64" className="space-y-4 mt-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Base64 Encoder/Decoder</h2>
                <textarea
                  value={base64Input}
                  onChange={(e) => setBase64Input(e.target.value)}
                  placeholder="Enter text to encode or base64 to decode"
                  className="w-full h-32 bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-white focus:border-teal-500 focus:outline-none"
                />
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={encodeBase64}
                    className="px-6 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                  >
                    Encode
                  </button>
                  <button
                    onClick={decodeBase64}
                    className="px-6 py-2 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                  >
                    Decode
                  </button>
                </div>
                {base64Output && (
                  <div className="mt-4 relative">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm text-gray-400">Output</label>
                      <button
                        onClick={() => copyToClipboard(base64Output, 'base64')}
                        className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        {copied === 'base64' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <textarea
                      value={base64Output}
                      readOnly
                      className="w-full h-32 bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-white font-mono text-sm"
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="url" className="space-y-4 mt-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">URL Encoder/Decoder</h2>
                <textarea
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Enter URL or text to encode/decode"
                  className="w-full h-32 bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-white focus:border-teal-500 focus:outline-none"
                />
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={encodeURL}
                    className="px-6 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                  >
                    Encode
                  </button>
                  <button
                    onClick={decodeURL}
                    className="px-6 py-2 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                  >
                    Decode
                  </button>
                </div>
                {urlOutput && (
                  <div className="mt-4 relative">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm text-gray-400">Output</label>
                      <button
                        onClick={() => copyToClipboard(urlOutput, 'url')}
                        className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        {copied === 'url' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <textarea
                      value={urlOutput}
                      readOnly
                      className="w-full h-32 bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-white font-mono text-sm"
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="hash" className="space-y-4 mt-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Hash Generator</h2>
                <textarea
                  value={hashInput}
                  onChange={(e) => setHashInput(e.target.value)}
                  placeholder="Enter text to hash"
                  className="w-full h-32 bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-white focus:border-teal-500 focus:outline-none"
                />
                <button
                  onClick={generateHashes}
                  className="mt-4 px-6 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Generate Hashes
                </button>

                {md5Hash && (
                  <div className="mt-6 space-y-4">
                    <div className="relative">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-semibold text-teal-400">MD5-like Hash</label>
                        <button
                          onClick={() => copyToClipboard(md5Hash, 'md5')}
                          className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          {copied === 'md5' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                        <code className="text-sm text-gray-300 break-all font-mono">{md5Hash}</code>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-semibold text-teal-400">SHA-256 Hash</label>
                        <button
                          onClick={() => copyToClipboard(sha256Hash, 'sha256')}
                          className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          {copied === 'sha256' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                        <code className="text-sm text-gray-300 break-all font-mono">{sha256Hash}</code>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-sm text-yellow-400">
                    <strong>Note:</strong> These hashes are generated client-side for demonstration. For production security, use server-side hashing.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
