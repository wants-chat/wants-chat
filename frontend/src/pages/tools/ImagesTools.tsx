import { useState, useRef } from 'react';
import Header from '../../components/landing/Header';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Image, Maximize2, FileImage, Download } from 'lucide-react';

export default function ImagesTools() {
  // Image Resizer State
  const [resizeImage, setResizeImage] = useState<string | null>(null);
  const [resizeWidth, setResizeWidth] = useState('');
  const [resizeHeight, setResizeHeight] = useState('');
  const [resizedImage, setResizedImage] = useState<string | null>(null);
  const resizeInputRef = useRef<HTMLInputElement>(null);

  // Image Compressor State
  const [compressImage, setCompressImage] = useState<string | null>(null);
  const [compressQuality, setCompressQuality] = useState(80);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const compressInputRef = useRef<HTMLInputElement>(null);

  // Format Converter State
  const [convertImage, setConvertImage] = useState<string | null>(null);
  const [convertFormat, setConvertFormat] = useState('png');
  const [convertedImage, setConvertedImage] = useState<string | null>(null);
  const convertInputRef = useRef<HTMLInputElement>(null);

  const handleResizeImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setResizeImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCompressImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOriginalSize(file.size);
      const reader = new FileReader();
      reader.onload = (event) => {
        setCompressImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConvertImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setConvertImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resizeImageFile = () => {
    if (!resizeImage || !resizeWidth || !resizeHeight) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = parseInt(resizeWidth);
      canvas.height = parseInt(resizeHeight);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setResizedImage(canvas.toDataURL('image/png'));
      }
    };
    img.src = resizeImage;
  };

  const compressImageFile = () => {
    if (!compressImage) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const compressed = canvas.toDataURL('image/jpeg', compressQuality / 100);
        setCompressedImage(compressed);
        // Estimate compressed size
        const base64Length = compressed.length - ('data:image/jpeg;base64,'.length);
        const estimatedSize = (base64Length * 3) / 4;
        setCompressedSize(estimatedSize);
      }
    };
    img.src = compressImage;
  };

  const convertImageFormat = () => {
    if (!convertImage) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        let mimeType = 'image/png';
        if (convertFormat === 'jpeg') mimeType = 'image/jpeg';
        else if (convertFormat === 'webp') mimeType = 'image/webp';
        setConvertedImage(canvas.toDataURL(mimeType, 0.95));
      }
    };
    img.src = convertImage;
  };

  const downloadImage = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <BackgroundEffects />
      <Header />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              Image Tools
            </h1>
            <p className="text-gray-400">Resize, compress, and convert your images</p>
          </div>

          <Tabs defaultValue="resize" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 backdrop-blur-sm">
              <TabsTrigger value="resize" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500">
                <Maximize2 className="w-4 h-4 mr-2" />
                Resize
              </TabsTrigger>
              <TabsTrigger value="compress" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500">
                <Image className="w-4 h-4 mr-2" />
                Compress
              </TabsTrigger>
              <TabsTrigger value="convert" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500">
                <FileImage className="w-4 h-4 mr-2" />
                Convert
              </TabsTrigger>
            </TabsList>

            <TabsContent value="resize" className="space-y-4 mt-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Image Resizer</h2>
                <input
                  type="file"
                  ref={resizeInputRef}
                  accept="image/*"
                  onChange={handleResizeImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => resizeInputRef.current?.click()}
                  className="w-full px-6 py-3 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600 transition-colors mb-4"
                >
                  Choose Image
                </button>

                {resizeImage && (
                  <div className="space-y-4">
                    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                      <img src={resizeImage} alt="Original" className="max-w-full h-auto max-h-64 mx-auto" />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Width (px)</label>
                        <input
                          type="number"
                          value={resizeWidth}
                          onChange={(e) => setResizeWidth(e.target.value)}
                          placeholder="800"
                          className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white focus:border-teal-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Height (px)</label>
                        <input
                          type="number"
                          value={resizeHeight}
                          onChange={(e) => setResizeHeight(e.target.value)}
                          placeholder="600"
                          className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white focus:border-teal-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <button
                      onClick={resizeImageFile}
                      className="w-full px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                    >
                      Resize Image
                    </button>
                  </div>
                )}

                {resizedImage && (
                  <div className="mt-6 space-y-4">
                    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                      <img src={resizedImage} alt="Resized" className="max-w-full h-auto max-h-64 mx-auto" />
                    </div>
                    <button
                      onClick={() => downloadImage(resizedImage, 'resized-image.png')}
                      className="w-full px-6 py-3 bg-green-600 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download Resized Image
                    </button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="compress" className="space-y-4 mt-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Image Compressor</h2>
                <input
                  type="file"
                  ref={compressInputRef}
                  accept="image/*"
                  onChange={handleCompressImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => compressInputRef.current?.click()}
                  className="w-full px-6 py-3 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600 transition-colors mb-4"
                >
                  Choose Image
                </button>

                {compressImage && (
                  <div className="space-y-4">
                    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                      <img src={compressImage} alt="Original" className="max-w-full h-auto max-h-64 mx-auto" />
                      <p className="text-center text-sm text-gray-400 mt-2">Original Size: {formatFileSize(originalSize)}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Quality: {compressQuality}%</label>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={compressQuality}
                        onChange={(e) => setCompressQuality(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <button
                      onClick={compressImageFile}
                      className="w-full px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                    >
                      Compress Image
                    </button>
                  </div>
                )}

                {compressedImage && (
                  <div className="mt-6 space-y-4">
                    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                      <img src={compressedImage} alt="Compressed" className="max-w-full h-auto max-h-64 mx-auto" />
                      <p className="text-center text-sm text-gray-400 mt-2">
                        Compressed Size: {formatFileSize(compressedSize)} ({Math.round((compressedSize / originalSize) * 100)}% of original)
                      </p>
                    </div>
                    <button
                      onClick={() => downloadImage(compressedImage, 'compressed-image.jpg')}
                      className="w-full px-6 py-3 bg-green-600 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download Compressed Image
                    </button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="convert" className="space-y-4 mt-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Format Converter</h2>
                <input
                  type="file"
                  ref={convertInputRef}
                  accept="image/*"
                  onChange={handleConvertImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => convertInputRef.current?.click()}
                  className="w-full px-6 py-3 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600 transition-colors mb-4"
                >
                  Choose Image
                </button>

                {convertImage && (
                  <div className="space-y-4">
                    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                      <img src={convertImage} alt="Original" className="max-w-full h-auto max-h-64 mx-auto" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Convert to</label>
                      <select
                        value={convertFormat}
                        onChange={(e) => setConvertFormat(e.target.value)}
                        className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white focus:border-teal-500 focus:outline-none"
                      >
                        <option value="png">PNG</option>
                        <option value="jpeg">JPEG</option>
                        <option value="webp">WebP</option>
                      </select>
                    </div>
                    <button
                      onClick={convertImageFormat}
                      className="w-full px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                    >
                      Convert Image
                    </button>
                  </div>
                )}

                {convertedImage && (
                  <div className="mt-6 space-y-4">
                    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                      <img src={convertedImage} alt="Converted" className="max-w-full h-auto max-h-64 mx-auto" />
                    </div>
                    <button
                      onClick={() => downloadImage(convertedImage, `converted-image.${convertFormat}`)}
                      className="w-full px-6 py-3 bg-green-600 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download {convertFormat.toUpperCase()} Image
                    </button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
