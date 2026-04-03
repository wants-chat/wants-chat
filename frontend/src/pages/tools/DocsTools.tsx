import { useState, useRef } from 'react';
import Header from '../../components/landing/Header';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { FileText, RefreshCw, Download, Upload } from 'lucide-react';
import { useConfirm } from '../../contexts/ConfirmDialogContext';

export default function DocsTools() {
  const { alert } = useConfirm();
  // PDF Tools State
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfOperation, setPdfOperation] = useState('merge');
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Document Converter State
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docFormat, setDocFormat] = useState('pdf');
  const [convertedDoc, setConvertedDoc] = useState<string | null>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    } else {
      await alert({
        title: 'Invalid File',
        message: 'Please select a valid PDF file',
        variant: 'warning'
      });
    }
  };

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocFile(file);
    }
  };

  const processPdfTool = async () => {
    if (!pdfFile) {
      await alert({
        title: 'No File Selected',
        message: 'Please select a PDF file first',
        variant: 'warning'
      });
      return;
    }

    await alert({
      title: 'Implementation Required',
      message: `PDF ${pdfOperation} operation would be performed here. This requires a backend service with PDF processing libraries like pdf-lib or PyPDF2.`,
      variant: 'info'
    });
  };

  const convertDocument = async () => {
    if (!docFile) {
      await alert({
        title: 'No File Selected',
        message: 'Please select a document first',
        variant: 'warning'
      });
      return;
    }

    await alert({
      title: 'Implementation Required',
      message: `Document conversion to ${docFormat.toUpperCase()} would be performed here. This requires a backend service with conversion libraries like Pandoc, LibreOffice, or cloud services.`,
      variant: 'info'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <BackgroundEffects />
      <Header />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              Document Tools
            </h1>
            <p className="text-gray-400">PDF manipulation and document conversion utilities</p>
          </div>

          <Tabs defaultValue="pdf" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 backdrop-blur-sm">
              <TabsTrigger value="pdf" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500">
                <FileText className="w-4 h-4 mr-2" />
                PDF Tools
              </TabsTrigger>
              <TabsTrigger value="converter" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500">
                <RefreshCw className="w-4 h-4 mr-2" />
                Converter
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pdf" className="space-y-4 mt-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">PDF Tools</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Select PDF Operation</label>
                    <select
                      value={pdfOperation}
                      onChange={(e) => setPdfOperation(e.target.value)}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white focus:border-teal-500 focus:outline-none"
                    >
                      <option value="merge">Merge PDFs</option>
                      <option value="split">Split PDF</option>
                      <option value="compress">Compress PDF</option>
                      <option value="rotate">Rotate Pages</option>
                      <option value="extract">Extract Pages</option>
                      <option value="watermark">Add Watermark</option>
                      <option value="protect">Password Protect</option>
                      <option value="unlock">Remove Password</option>
                    </select>
                  </div>

                  <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
                    <input
                      type="file"
                      ref={pdfInputRef}
                      accept=".pdf"
                      onChange={handlePdfUpload}
                      className="hidden"
                      multiple={pdfOperation === 'merge'}
                    />
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                    <button
                      onClick={() => pdfInputRef.current?.click()}
                      className="px-6 py-2 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                    >
                      {pdfOperation === 'merge' ? 'Choose PDFs to Merge' : 'Choose PDF File'}
                    </button>
                    {pdfFile && (
                      <p className="mt-4 text-sm text-gray-400">
                        Selected: {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>

                  <button
                    onClick={processPdfTool}
                    disabled={!pdfFile}
                    className="w-full px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Process PDF
                  </button>

                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <h3 className="font-semibold text-blue-400 mb-2">Operation Details:</h3>
                    <p className="text-sm text-blue-300">
                      {pdfOperation === 'merge' && 'Combine multiple PDF files into a single document'}
                      {pdfOperation === 'split' && 'Split a PDF into separate files by page ranges'}
                      {pdfOperation === 'compress' && 'Reduce PDF file size while maintaining quality'}
                      {pdfOperation === 'rotate' && 'Rotate pages in your PDF document'}
                      {pdfOperation === 'extract' && 'Extract specific pages from your PDF'}
                      {pdfOperation === 'watermark' && 'Add text or image watermark to PDF pages'}
                      {pdfOperation === 'protect' && 'Add password protection to your PDF'}
                      {pdfOperation === 'unlock' && 'Remove password protection from PDF'}
                    </p>
                  </div>

                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <h3 className="font-semibold text-yellow-400 mb-2">Implementation Note:</h3>
                    <p className="text-sm text-yellow-300">
                      PDF processing requires backend implementation using libraries like:
                    </p>
                    <ul className="text-sm text-yellow-300 mt-2 list-disc list-inside space-y-1">
                      <li><strong>pdf-lib</strong> (JavaScript) - Create, modify PDFs</li>
                      <li><strong>PyPDF2/pypdf</strong> (Python) - Merge, split, rotate</li>
                      <li><strong>Ghostscript</strong> - Compress, convert PDFs</li>
                      <li><strong>PDFtk</strong> - Command-line PDF toolkit</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="converter" className="space-y-4 mt-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Document Converter</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Convert To</label>
                    <select
                      value={docFormat}
                      onChange={(e) => setDocFormat(e.target.value)}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white focus:border-teal-500 focus:outline-none"
                    >
                      <option value="pdf">PDF</option>
                      <option value="docx">Word (DOCX)</option>
                      <option value="txt">Plain Text (TXT)</option>
                      <option value="html">HTML</option>
                      <option value="markdown">Markdown (MD)</option>
                      <option value="rtf">Rich Text Format (RTF)</option>
                      <option value="odt">OpenDocument (ODT)</option>
                      <option value="epub">EPUB</option>
                    </select>
                  </div>

                  <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
                    <input
                      type="file"
                      ref={docInputRef}
                      accept=".pdf,.doc,.docx,.txt,.html,.md,.rtf,.odt,.epub"
                      onChange={handleDocUpload}
                      className="hidden"
                    />
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                    <button
                      onClick={() => docInputRef.current?.click()}
                      className="px-6 py-2 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                    >
                      Choose Document
                    </button>
                    {docFile && (
                      <p className="mt-4 text-sm text-gray-400">
                        Selected: {docFile.name} ({(docFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>

                  <button
                    onClick={convertDocument}
                    disabled={!docFile}
                    className="w-full px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Convert Document
                  </button>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <h3 className="font-semibold text-green-400 mb-2">Supported Input Formats:</h3>
                      <ul className="text-sm text-green-300 space-y-1">
                        <li>PDF, DOC, DOCX</li>
                        <li>TXT, RTF, ODT</li>
                        <li>HTML, Markdown</li>
                        <li>EPUB, MOBI</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                      <h3 className="font-semibold text-purple-400 mb-2">Conversion Features:</h3>
                      <ul className="text-sm text-purple-300 space-y-1">
                        <li>Preserve formatting</li>
                        <li>Maintain images</li>
                        <li>Keep hyperlinks</li>
                        <li>Retain metadata</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <h3 className="font-semibold text-yellow-400 mb-2">Implementation Options:</h3>
                    <p className="text-sm text-yellow-300 mb-2">
                      Document conversion can be implemented using:
                    </p>
                    <ul className="text-sm text-yellow-300 list-disc list-inside space-y-1">
                      <li><strong>Pandoc</strong> - Universal document converter</li>
                      <li><strong>LibreOffice</strong> - Headless conversion server</li>
                      <li><strong>CloudConvert API</strong> - Cloud-based conversion</li>
                      <li><strong>Aspose APIs</strong> - Enterprise document conversion</li>
                      <li><strong>Mammoth</strong> - DOCX to HTML conversion</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
