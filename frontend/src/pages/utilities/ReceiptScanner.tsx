import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, FileText, Trash2, DollarSign, Calendar, Store, Check, X } from 'lucide-react';
import Header from '../../components/landing/Header';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

interface ReceiptData {
  id: string;
  merchantName: string;
  date: string;
  total: number;
  items: Array<{ name: string; price: number; quantity: number }>;
  imageUrl: string;
}

const ReceiptScanner: React.FC = () => {
  const [scannedReceipts, setScannedReceipts] = useState<ReceiptData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const processReceipt = (file: File) => {
    setIsProcessing(true);

    // Simulate OCR processing
    setTimeout(() => {
      const mockReceipt: ReceiptData = {
        id: Math.random().toString(36).substr(2, 9),
        merchantName: ['Walmart', 'Target', 'Costco', 'Whole Foods', 'Trader Joes'][
          Math.floor(Math.random() * 5)
        ],
        date: new Date().toISOString().split('T')[0],
        total: Math.random() * 200 + 20,
        items: [
          {
            name: 'Grocery Item 1',
            price: Math.random() * 20 + 5,
            quantity: Math.floor(Math.random() * 3) + 1,
          },
          {
            name: 'Grocery Item 2',
            price: Math.random() * 15 + 3,
            quantity: Math.floor(Math.random() * 2) + 1,
          },
          {
            name: 'Grocery Item 3',
            price: Math.random() * 25 + 8,
            quantity: 1,
          },
        ],
        imageUrl: URL.createObjectURL(file),
      };

      setScannedReceipts((prev) => [mockReceipt, ...prev]);
      setSelectedReceipt(mockReceipt);
      setIsProcessing(false);
    }, 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processReceipt(file);
    }
  };

  const deleteReceipt = (id: string) => {
    setScannedReceipts((prev) => prev.filter((r) => r.id !== id));
    if (selectedReceipt?.id === id) {
      setSelectedReceipt(null);
    }
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
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                Receipt Scanner
              </h1>
              <p className="text-gray-400">
                Scan and extract data from receipts using OCR
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Scanner & List */}
              <div className="space-y-6">
                {/* Scanner Card */}
                <Card className="bg-slate-800/50 border-teal-500/30 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-teal-400">
                      <Camera className="w-5 h-5" />
                      Scan Receipt
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-gradient-to-br from-teal-900/30 to-cyan-900/30 rounded-2xl p-8 border-2 border-dashed border-teal-500/30 text-center">
                      <FileText className="w-16 h-16 text-teal-400 mx-auto mb-4" />
                      <p className="text-white mb-4">Upload or capture receipt image</p>
                      <div className="flex gap-3 justify-center">
                        <Button
                          onClick={() => cameraInputRef.current?.click()}
                          className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Take Photo
                        </Button>
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          variant="outline"
                          className="border-teal-500/30 text-teal-400 hover:bg-teal-900/30"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload
                        </Button>
                      </div>
                      <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>

                    {isProcessing && (
                      <div className="text-center py-8">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-12 h-12 border-4 border-teal-400 border-t-transparent rounded-full mx-auto mb-4"
                        />
                        <p className="text-gray-400">Processing receipt...</p>
                        <p className="text-sm text-gray-500 mt-1">Extracting data using OCR</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Receipts List */}
                {scannedReceipts.length > 0 && (
                  <Card className="bg-slate-800/50 border-teal-500/30 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-teal-400">
                        <FileText className="w-5 h-5" />
                        Scanned Receipts ({scannedReceipts.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {scannedReceipts.map((receipt) => (
                          <motion.button
                            key={receipt.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => setSelectedReceipt(receipt)}
                            className={`w-full text-left p-4 rounded-lg border transition-all ${
                              selectedReceipt?.id === receipt.id
                                ? 'bg-teal-900/30 border-teal-400'
                                : 'bg-slate-700/30 border-teal-500/20 hover:border-teal-400/50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Store className="w-4 h-4 text-teal-400" />
                                  <p className="font-semibold text-white truncate">
                                    {receipt.merchantName}
                                  </p>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {receipt.date}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" />
                                    ${receipt.total.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteReceipt(receipt.id);
                                }}
                                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column - Receipt Details */}
              <div>
                <AnimatePresence mode="wait">
                  {selectedReceipt ? (
                    <motion.div
                      key={selectedReceipt.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <Card className="bg-slate-800/50 border-teal-500/30 backdrop-blur-xl">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-teal-400">
                            <FileText className="w-5 h-5" />
                            Receipt Details
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Receipt Image */}
                          <div className="relative rounded-lg overflow-hidden border border-teal-500/30">
                            <img
                              src={selectedReceipt.imageUrl}
                              alt="Receipt"
                              className="w-full h-64 object-cover"
                            />
                          </div>

                          {/* Merchant Info */}
                          <div className="bg-gradient-to-br from-teal-900/30 to-cyan-900/30 rounded-lg p-4 border border-teal-500/30">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-400 mb-1">Merchant</p>
                                <p className="font-semibold text-white flex items-center gap-2">
                                  <Store className="w-4 h-4 text-teal-400" />
                                  {selectedReceipt.merchantName}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-400 mb-1">Date</p>
                                <p className="font-semibold text-white flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-teal-400" />
                                  {selectedReceipt.date}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Items */}
                          <div>
                            <h4 className="text-white font-semibold mb-3">Items</h4>
                            <div className="space-y-2">
                              {selectedReceipt.items.map((item, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-teal-500/20"
                                >
                                  <div className="flex-1">
                                    <p className="text-white font-medium">{item.name}</p>
                                    <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                                  </div>
                                  <p className="text-teal-400 font-semibold">
                                    ${item.price.toFixed(2)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Total */}
                          <div className="bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-lg p-4 border border-teal-400">
                            <div className="flex items-center justify-between">
                              <p className="text-white font-semibold text-lg flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-teal-400" />
                                Total
                              </p>
                              <p className="text-2xl font-bold text-teal-400">
                                ${selectedReceipt.total.toFixed(2)}
                              </p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-3">
                            <Button className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white">
                              <Check className="w-4 h-4 mr-2" />
                              Save to Expenses
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => deleteReceipt(selectedReceipt.id)}
                              className="border-red-500/30 text-red-400 hover:bg-red-900/20"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="no-selection"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Card className="bg-slate-800/50 border-teal-500/30 backdrop-blur-xl h-full">
                        <CardContent className="flex items-center justify-center min-h-[500px]">
                          <div className="text-center">
                            <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400">
                              {scannedReceipts.length > 0
                                ? 'Select a receipt to view details'
                                : 'Scan a receipt to get started'}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReceiptScanner;
