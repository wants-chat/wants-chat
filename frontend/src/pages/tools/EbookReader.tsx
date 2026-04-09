// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Upload, Settings, Bookmark, List, ChevronLeft, ChevronRight, Sun, Moon, ZoomIn, ZoomOut, X } from 'lucide-react';
import Header from '../../components/landing/Header';
import BackgroundEffects from '../../components/ui/BackgroundEffects';
import { useConfirm } from '../../contexts/ConfirmDialogContext';

interface Book {
  id: string;
  title: string;
  author?: string;
  content: string;
  type: 'pdf' | 'epub' | 'txt';
  uploadedAt: string;
  currentPage: number;
  totalPages: number;
  bookmarks: number[];
  fontSize: number;
  theme: 'light' | 'dark' | 'sepia';
}

const EbookReader: React.FC = () => {
  const { confirm } = useConfirm();
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showLibrary, setShowLibrary] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load books from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('ebookLibrary');
    if (stored) {
      try {
        setBooks(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading books:', error);
      }
    }
  }, []);

  // Save books to localStorage whenever they change
  useEffect(() => {
    if (books.length > 0) {
      localStorage.setItem('ebookLibrary', JSON.stringify(books));
    }
  }, [books]);

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const fileType = file.name.split('.').pop()?.toLowerCase() as 'pdf' | 'epub' | 'txt';

      const newBook: Book = {
        id: Date.now().toString(),
        title: file.name.replace(/\.[^/.]+$/, ''),
        content: content,
        type: fileType || 'txt',
        uploadedAt: new Date().toISOString(),
        currentPage: 0,
        totalPages: Math.ceil(content.length / 2000), // Approximate pages
        bookmarks: [],
        fontSize: 16,
        theme: 'light',
      };

      setBooks([...books, newBook]);
      setSelectedBook(newBook);
      setShowLibrary(false);
    };

    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Open book
  const openBook = (book: Book) => {
    setSelectedBook(book);
    setShowLibrary(false);
  };

  // Delete book
  const deleteBook = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Book',
      message: 'Are you sure you want to delete this book?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive'
    });
    if (confirmed) {
      setBooks(books.filter(b => b.id !== id));
      if (selectedBook?.id === id) {
        setSelectedBook(null);
        setShowLibrary(true);
      }
    }
  };

  // Update book settings
  const updateBookSettings = (updates: Partial<Book>) => {
    if (!selectedBook) return;

    const updatedBook = { ...selectedBook, ...updates };
    setSelectedBook(updatedBook);
    setBooks(books.map(b => b.id === selectedBook.id ? updatedBook : b));
  };

  // Navigate pages
  const goToPage = (page: number) => {
    if (!selectedBook) return;
    const newPage = Math.max(0, Math.min(page, selectedBook.totalPages - 1));
    updateBookSettings({ currentPage: newPage });
  };

  // Toggle bookmark
  const toggleBookmark = () => {
    if (!selectedBook) return;

    const bookmarks = selectedBook.bookmarks.includes(selectedBook.currentPage)
      ? selectedBook.bookmarks.filter(p => p !== selectedBook.currentPage)
      : [...selectedBook.bookmarks, selectedBook.currentPage];

    updateBookSettings({ bookmarks });
  };

  // Get current page content
  const getCurrentPageContent = () => {
    if (!selectedBook) return '';

    const startIndex = selectedBook.currentPage * 2000;
    const endIndex = startIndex + 2000;
    return selectedBook.content.substring(startIndex, endIndex);
  };

  // Theme styles
  const getThemeStyles = () => {
    if (!selectedBook) return {};

    const themes = {
      light: { bg: 'bg-white', text: 'text-gray-900' },
      dark: { bg: 'bg-gray-900', text: 'text-gray-100' },
      sepia: { bg: 'bg-amber-50', text: 'text-amber-900' },
    };

    return themes[selectedBook.theme];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-cyan-900">
      <BackgroundEffects />
      <Header />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Library View */}
        {showLibrary && (
          <>
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <BookOpen className="w-12 h-12 text-teal-400" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">E-Book Reader</h1>
              <p className="text-teal-200">Your personal digital library</p>
            </div>

            {/* Upload button */}
            <div className="mb-6">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.pdf,.epub"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-6 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-teal-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Upload className="w-5 h-5" />
                Upload Book (TXT, PDF, EPUB)
              </button>
            </div>

            {/* Books grid */}
            {books.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 text-center border border-white/20">
                <BookOpen className="w-16 h-16 text-teal-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No books yet</h3>
                <p className="text-teal-200 mb-6">Upload your first book to start reading</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {books.map(book => (
                  <div
                    key={book.id}
                    className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all cursor-pointer"
                    onClick={() => openBook(book)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-2">{book.title}</h3>
                        {book.author && (
                          <p className="text-teal-300 text-sm mb-2">{book.author}</p>
                        )}
                        <span className="inline-block px-3 py-1 bg-teal-500/30 text-teal-200 rounded-full text-xs font-medium uppercase">
                          {book.type}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-teal-300">Progress</span>
                        <span className="text-white font-medium">
                          {Math.round((book.currentPage / book.totalPages) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full transition-all"
                          style={{ width: `${(book.currentPage / book.totalPages) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-teal-300">
                      <span>Page {book.currentPage + 1} of {book.totalPages}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteBook(book.id);
                        }}
                        className="px-3 py-1 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Reader View */}
        {!showLibrary && selectedBook && (
          <div className="space-y-4">
            {/* Reader controls */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 flex items-center justify-between flex-wrap gap-4">
              <button
                onClick={() => setShowLibrary(true)}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Library
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(selectedBook.currentPage - 1)}
                  disabled={selectedBook.currentPage === 0}
                  className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-white px-4">
                  Page {selectedBook.currentPage + 1} / {selectedBook.totalPages}
                </span>
                <button
                  onClick={() => goToPage(selectedBook.currentPage + 1)}
                  disabled={selectedBook.currentPage >= selectedBook.totalPages - 1}
                  className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleBookmark}
                  className={`p-2 rounded-lg transition-all ${
                    selectedBook.bookmarks.includes(selectedBook.currentPage)
                      ? 'bg-yellow-500 text-white'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Bookmark className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowBookmarks(!showBookmarks)}
                  className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
                >
                  <List className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Settings panel */}
            {showSettings && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Reading Settings</h3>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="p-1 hover:bg-white/10 rounded-lg transition-all"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Font size */}
                  <div>
                    <label className="block text-sm font-medium text-teal-300 mb-3">Font Size</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateBookSettings({ fontSize: Math.max(12, selectedBook.fontSize - 2) })}
                        className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
                      >
                        <ZoomOut className="w-5 h-5 text-white" />
                      </button>
                      <span className="text-white font-medium">{selectedBook.fontSize}px</span>
                      <button
                        onClick={() => updateBookSettings({ fontSize: Math.min(32, selectedBook.fontSize + 2) })}
                        className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
                      >
                        <ZoomIn className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Theme */}
                  <div>
                    <label className="block text-sm font-medium text-teal-300 mb-3">Theme</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateBookSettings({ theme: 'light' })}
                        className={`flex-1 p-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                          selectedBook.theme === 'light'
                            ? 'bg-white text-gray-900'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        <Sun className="w-4 h-4" />
                        Light
                      </button>
                      <button
                        onClick={() => updateBookSettings({ theme: 'dark' })}
                        className={`flex-1 p-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                          selectedBook.theme === 'dark'
                            ? 'bg-gray-900 text-white border-2 border-white'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        <Moon className="w-4 h-4" />
                        Dark
                      </button>
                      <button
                        onClick={() => updateBookSettings({ theme: 'sepia' })}
                        className={`flex-1 p-3 rounded-lg transition-all ${
                          selectedBook.theme === 'sepia'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        Sepia
                      </button>
                    </div>
                  </div>

                  {/* Jump to page */}
                  <div>
                    <label className="block text-sm font-medium text-teal-300 mb-3">Jump to Page</label>
                    <input
                      type="number"
                      min="1"
                      max={selectedBook.totalPages}
                      value={selectedBook.currentPage + 1}
                      onChange={(e) => goToPage(parseInt(e.target.value) - 1)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bookmarks panel */}
            {showBookmarks && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Bookmarks</h3>
                  <button
                    onClick={() => setShowBookmarks(false)}
                    className="p-1 hover:bg-white/10 rounded-lg transition-all"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                {selectedBook.bookmarks.length === 0 ? (
                  <p className="text-teal-300 text-center py-8">No bookmarks yet</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {selectedBook.bookmarks.sort((a, b) => a - b).map(page => (
                      <button
                        key={page}
                        onClick={() => {
                          goToPage(page);
                          setShowBookmarks(false);
                        }}
                        className="px-4 py-3 bg-white/10 rounded-lg hover:bg-teal-500 transition-all text-white font-medium"
                      >
                        Page {page + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reading area */}
            <div className={`rounded-2xl p-8 md:p-12 shadow-2xl min-h-[600px] ${getThemeStyles().bg}`}>
              <h1 className={`text-3xl font-bold mb-6 ${getThemeStyles().text}`}>
                {selectedBook.title}
              </h1>
              <div
                className={`leading-relaxed whitespace-pre-wrap ${getThemeStyles().text}`}
                style={{ fontSize: `${selectedBook.fontSize}px` }}
              >
                {getCurrentPageContent()}
              </div>
            </div>

            {/* Bottom navigation */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => goToPage(selectedBook.currentPage - 1)}
                disabled={selectedBook.currentPage === 0}
                className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-teal-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous Page
              </button>
              <button
                onClick={() => goToPage(selectedBook.currentPage + 1)}
                disabled={selectedBook.currentPage >= selectedBook.totalPages - 1}
                className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-teal-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
              >
                Next Page
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default EbookReader;