import React, { useState, useRef } from 'react';
import { Upload, FolderPlus, Grid3x3, Grid, Download, Trash2, Heart, Search, X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '../../components/landing/Header';
import BackgroundEffects from '../../components/ui/BackgroundEffects';

interface Photo {
  id: number;
  url: string;
  name: string;
  size: string;
  date: string;
  folder: string;
  isFavorite: boolean;
}

interface Folder {
  id: number;
  name: string;
  count: number;
}

const PhotoGallery: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([
    {
      id: 1,
      url: 'https://picsum.photos/seed/photo1/800/600',
      name: 'Mountain Landscape',
      size: '2.4 MB',
      date: '2024-12-20',
      folder: 'Nature',
      isFavorite: false
    },
    {
      id: 2,
      url: 'https://picsum.photos/seed/photo2/800/600',
      name: 'City Sunset',
      size: '3.1 MB',
      date: '2024-12-19',
      folder: 'Urban',
      isFavorite: true
    },
    {
      id: 3,
      url: 'https://picsum.photos/seed/photo3/800/600',
      name: 'Beach Waves',
      size: '2.8 MB',
      date: '2024-12-18',
      folder: 'Nature',
      isFavorite: false
    },
    {
      id: 4,
      url: 'https://picsum.photos/seed/photo4/800/600',
      name: 'Forest Path',
      size: '3.5 MB',
      date: '2024-12-17',
      folder: 'Nature',
      isFavorite: true
    },
    {
      id: 5,
      url: 'https://picsum.photos/seed/photo5/800/600',
      name: 'Night Sky',
      size: '2.2 MB',
      date: '2024-12-16',
      folder: 'Urban',
      isFavorite: false
    },
    {
      id: 6,
      url: 'https://picsum.photos/seed/photo6/800/600',
      name: 'Desert Dunes',
      size: '2.9 MB',
      date: '2024-12-15',
      folder: 'Nature',
      isFavorite: false
    }
  ]);

  const [folders, setFolders] = useState<Folder[]>([
    { id: 1, name: 'All Photos', count: 6 },
    { id: 2, name: 'Nature', count: 4 },
    { id: 3, name: 'Urban', count: 2 },
    { id: 4, name: 'Favorites', count: 2 }
  ]);

  const [selectedFolder, setSelectedFolder] = useState('All Photos');
  const [gridSize, setGridSize] = useState<'small' | 'large'>('large');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newPhoto: Photo = {
          id: Date.now() + Math.random(),
          url: event.target?.result as string,
          name: file.name,
          size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          date: new Date().toISOString().split('T')[0],
          folder: selectedFolder === 'All Photos' ? 'Uploads' : selectedFolder,
          isFavorite: false
        };
        setPhotos(prev => [newPhoto, ...prev]);
      };
      reader.readAsDataURL(file);
    });
  };

  const toggleFavorite = (id: number) => {
    setPhotos(prev =>
      prev.map(photo =>
        photo.id === id ? { ...photo, isFavorite: !photo.isFavorite } : photo
      )
    );
  };

  const deletePhoto = (id: number) => {
    setPhotos(prev => prev.filter(photo => photo.id !== id));
    setSelectedPhoto(null);
  };

  const downloadPhoto = (photo: Photo) => {
    const link = document.createElement('a');
    link.href = photo.url;
    link.download = photo.name;
    link.click();
  };

  const createFolder = () => {
    if (!newFolderName.trim()) return;
    const newFolder: Folder = {
      id: Date.now(),
      name: newFolderName,
      count: 0
    };
    setFolders(prev => [...prev, newFolder]);
    setNewFolderName('');
    setShowNewFolderDialog(false);
  };

  const filteredPhotos = photos.filter(photo => {
    const matchesSearch = photo.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder =
      selectedFolder === 'All Photos' ||
      (selectedFolder === 'Favorites' && photo.isFavorite) ||
      photo.folder === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  const currentPhotoIndex = selectedPhoto
    ? filteredPhotos.findIndex(p => p.id === selectedPhoto.id)
    : -1;

  const showNextPhoto = () => {
    if (currentPhotoIndex < filteredPhotos.length - 1) {
      setSelectedPhoto(filteredPhotos[currentPhotoIndex + 1]);
    }
  };

  const showPreviousPhoto = () => {
    if (currentPhotoIndex > 0) {
      setSelectedPhoto(filteredPhotos[currentPhotoIndex - 1]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-cyan-900">
      <BackgroundEffects />
      <Header />

      <div className="relative z-10 container mx-auto px-4 py-8 pt-24">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Photo Gallery</h1>
          <p className="text-cyan-300">Organize and view your photo collection</p>
        </div>

        {/* Toolbar */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400" size={20} />
            <input
              type="text"
              placeholder="Search photos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 backdrop-blur-lg border border-cyan-500/30 rounded-2xl py-3 pl-12 pr-4 text-white placeholder-cyan-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-2xl hover:from-cyan-600 hover:to-teal-600 transition shadow-lg flex items-center gap-2"
            >
              <Upload size={20} />
              Upload
            </button>
            <button
              onClick={() => setShowNewFolderDialog(true)}
              className="px-6 py-3 bg-white/10 backdrop-blur-lg border border-cyan-500/30 text-white rounded-2xl hover:bg-white/20 transition flex items-center gap-2"
            >
              <FolderPlus size={20} />
              New Folder
            </button>
            <button
              onClick={() => setGridSize(gridSize === 'large' ? 'small' : 'large')}
              className="p-3 bg-white/10 backdrop-blur-lg border border-cyan-500/30 text-white rounded-2xl hover:bg-white/20 transition"
            >
              {gridSize === 'large' ? <Grid3x3 size={20} /> : <Grid size={20} />}
            </button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Folders Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-cyan-500/30">
              <h3 className="text-xl font-bold text-white mb-4">Folders</h3>
              <div className="space-y-2">
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolder(folder.name)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition ${
                      selectedFolder === folder.name
                        ? 'bg-gradient-to-r from-cyan-500/30 to-teal-500/30 border border-cyan-400 text-white'
                        : 'bg-white/5 hover:bg-white/10 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{folder.name}</span>
                      <span className="text-sm opacity-75">{folder.count}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Photo Grid */}
          <div className="lg:col-span-3">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-cyan-500/30">
              <div className={`grid gap-4 ${
                gridSize === 'large'
                  ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                  : 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
              }`}>
                {filteredPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="group relative overflow-hidden rounded-2xl bg-white/5 cursor-pointer"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <img
                      src={photo.url}
                      alt={photo.name}
                      className="w-full h-64 object-cover transition-transform group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h4 className="text-white font-semibold mb-1">{photo.name}</h4>
                        <p className="text-cyan-300 text-sm">{photo.size} • {photo.date}</p>
                      </div>
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(photo.id);
                          }}
                          className={`p-2 rounded-full transition ${
                            photo.isFavorite
                              ? 'bg-red-500/30 text-red-400'
                              : 'bg-white/20 text-white hover:bg-white/30'
                          }`}
                        >
                          <Heart size={18} fill={photo.isFavorite ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredPhotos.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg">No photos found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Photo Viewer Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 p-3 bg-white/10 backdrop-blur-lg rounded-full text-white hover:bg-white/20 transition"
          >
            <X size={24} />
          </button>

          <button
            onClick={showPreviousPhoto}
            disabled={currentPhotoIndex === 0}
            className="absolute left-4 p-3 bg-white/10 backdrop-blur-lg rounded-full text-white hover:bg-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={showNextPhoto}
            disabled={currentPhotoIndex === filteredPhotos.length - 1}
            className="absolute right-4 p-3 bg-white/10 backdrop-blur-lg rounded-full text-white hover:bg-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={24} />
          </button>

          <div className="max-w-6xl w-full">
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.name}
              className="w-full h-auto max-h-[80vh] object-contain rounded-2xl"
            />
            <div className="mt-4 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-cyan-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{selectedPhoto.name}</h3>
                  <p className="text-cyan-300">{selectedPhoto.size} • {selectedPhoto.date} • {selectedPhoto.folder}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => toggleFavorite(selectedPhoto.id)}
                    className={`p-3 rounded-full transition ${
                      selectedPhoto.isFavorite
                        ? 'bg-red-500/30 text-red-400'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <Heart size={20} fill={selectedPhoto.isFavorite ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={() => downloadPhoto(selectedPhoto)}
                    className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
                  >
                    <Download size={20} />
                  </button>
                  <button
                    onClick={() => deletePhoto(selectedPhoto.id)}
                    className="p-3 rounded-full bg-red-500/30 text-red-400 hover:bg-red-500/50 transition"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Folder Dialog */}
      {showNewFolderDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 max-w-md w-full border border-cyan-500/30">
            <h3 className="text-2xl font-bold text-white mb-6">Create New Folder</h3>
            <input
              type="text"
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full bg-white/10 border border-cyan-500/30 rounded-2xl py-3 px-4 text-white placeholder-cyan-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 mb-6"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowNewFolderDialog(false)}
                className="flex-1 px-6 py-3 bg-white/10 border border-cyan-500/30 text-white rounded-2xl hover:bg-white/20 transition"
              >
                Cancel
              </button>
              <button
                onClick={createFolder}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-2xl hover:from-cyan-600 hover:to-teal-600 transition"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;
