import { useState } from 'react';
import Header from '../../components/landing/Header';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { QrCode, Barcode, Download } from 'lucide-react';

export default function QRBarcode() {
  // QR Code State
  const [qrText, setQrText] = useState('');
  const [qrSize, setQrSize] = useState(256);
  const [qrColor, setQrColor] = useState('#000000');
  const [qrBgColor, setQrBgColor] = useState('#ffffff');

  // Barcode State
  const [barcodeText, setBarcodeText] = useState('');
  const [barcodeFormat, setBarcodeFormat] = useState('code128');

  const generateQRCode = (): string => {
    if (!qrText) return '';
    // Using api.qrserver.com - free, CORS-friendly QR API
    const encodedText = encodeURIComponent(qrText);
    const colorHex = qrColor.replace('#', '');
    const bgColorHex = qrBgColor.replace('#', '');
    return `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodedText}&color=${colorHex}&bgcolor=${bgColorHex}`;
  };

  const generateBarcode = (): string => {
    if (!barcodeText) return '';
    // Using barcode.tec-it.com API for barcode generation
    const encodedText = encodeURIComponent(barcodeText);
    return `https://barcode.tec-it.com/barcode.ashx?data=${encodedText}&code=${barcodeFormat.toUpperCase()}&translate-esc=on`;
  };

  const downloadQRCode = async () => {
    const qrUrl = generateQRCode();
    if (!qrUrl) return;

    try {
      // Use download parameter from API
      const downloadUrl = `${qrUrl}&format=png`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'qr-code.png';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading QR code:', error);
    }
  };

  const downloadBarcode = async () => {
    const barcodeUrl = generateBarcode();
    if (!barcodeUrl) return;

    try {
      const response = await fetch(barcodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'barcode.png';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading barcode:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <BackgroundEffects />
      <Header />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              QR & Barcode Generator
            </h1>
            <p className="text-gray-400">Generate QR codes and barcodes instantly</p>
          </div>

          <Tabs defaultValue="qr" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 backdrop-blur-sm">
              <TabsTrigger value="qr" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500">
                <QrCode className="w-4 h-4 mr-2" />
                QR Code
              </TabsTrigger>
              <TabsTrigger value="barcode" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500">
                <Barcode className="w-4 h-4 mr-2" />
                Barcode
              </TabsTrigger>
            </TabsList>

            <TabsContent value="qr" className="space-y-4 mt-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">QR Code Generator</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Text or URL</label>
                    <textarea
                      value={qrText}
                      onChange={(e) => setQrText(e.target.value)}
                      placeholder="Enter text, URL, or any data to encode"
                      className="w-full h-24 bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white focus:border-teal-500 focus:outline-none resize-none"
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Size: {qrSize}px</label>
                      <input
                        type="range"
                        min="128"
                        max="512"
                        step="64"
                        value={qrSize}
                        onChange={(e) => setQrSize(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">QR Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={qrColor}
                          onChange={(e) => setQrColor(e.target.value)}
                          className="w-12 h-10 bg-gray-900/50 border border-gray-700 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={qrColor}
                          onChange={(e) => setQrColor(e.target.value)}
                          className="flex-1 bg-gray-900/50 border border-gray-700 rounded-lg px-3 text-white focus:border-teal-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Background Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={qrBgColor}
                          onChange={(e) => setQrBgColor(e.target.value)}
                          className="w-12 h-10 bg-gray-900/50 border border-gray-700 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={qrBgColor}
                          onChange={(e) => setQrBgColor(e.target.value)}
                          className="flex-1 bg-gray-900/50 border border-gray-700 rounded-lg px-3 text-white focus:border-teal-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {qrText && (
                    <div className="mt-6 space-y-4">
                      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-8 flex items-center justify-center">
                        <img
                          src={generateQRCode()}
                          alt="QR Code"
                          className="max-w-full"
                          style={{ width: qrSize, height: qrSize }}
                        />
                      </div>
                      <button
                        onClick={downloadQRCode}
                        className="w-full px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download QR Code
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="barcode" className="space-y-4 mt-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Barcode Generator</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Barcode Data</label>
                    <input
                      type="text"
                      value={barcodeText}
                      onChange={(e) => setBarcodeText(e.target.value)}
                      placeholder="Enter numbers or text for barcode"
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white focus:border-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Barcode Format</label>
                    <select
                      value={barcodeFormat}
                      onChange={(e) => setBarcodeFormat(e.target.value)}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white focus:border-teal-500 focus:outline-none"
                    >
                      <option value="code128">Code 128 (Alphanumeric)</option>
                      <option value="code39">Code 39 (Alphanumeric)</option>
                      <option value="ean13">EAN-13 (13 digits)</option>
                      <option value="ean8">EAN-8 (8 digits)</option>
                      <option value="upca">UPC-A (12 digits)</option>
                      <option value="upce">UPC-E (6-8 digits)</option>
                      <option value="itf">ITF (Even length numbers)</option>
                      <option value="codabar">Codabar (Numbers + special)</option>
                    </select>
                  </div>

                  {barcodeText && (
                    <div className="mt-6 space-y-4">
                      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-8 flex items-center justify-center">
                        <img
                          src={generateBarcode()}
                          alt="Barcode"
                          className="max-w-full h-auto"
                        />
                      </div>
                      <button
                        onClick={downloadBarcode}
                        className="w-full px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download Barcode
                      </button>
                      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <p className="text-sm text-blue-400">
                          <strong>Format Info:</strong> {barcodeFormat.toUpperCase()} is suitable for {
                            barcodeFormat === 'code128' ? 'alphanumeric data with high density' :
                            barcodeFormat === 'code39' ? 'alphanumeric data with lower density' :
                            barcodeFormat === 'ean13' ? 'retail products (13 digits)' :
                            barcodeFormat === 'ean8' ? 'small retail products (8 digits)' :
                            barcodeFormat === 'upca' ? 'North American retail products (12 digits)' :
                            barcodeFormat === 'upce' ? 'compressed UPC codes (6-8 digits)' :
                            barcodeFormat === 'itf' ? 'warehouse and distribution (even length numbers)' :
                            'numeric data with start/stop characters'
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
