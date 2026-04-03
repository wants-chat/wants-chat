import React, { useState, useRef } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import Icon from '@mdi/react';
import { mdiCamera, mdiClose } from '@mdi/js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Label } from '../../ui/label';

interface Photo {
  date: Date;
  url: string;
  type: 'front' | 'side' | 'back';
}

interface PhotoProgressProps {
  photos: Photo[];
  onAddPhoto: (file: File, type: 'front' | 'side' | 'back') => void;
}

const PhotoProgress: React.FC<PhotoProgressProps> = ({
  photos,
  onAddPhoto
}) => {
  const [photoType, setPhotoType] = useState<'front' | 'side' | 'back'>('front');
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setShowUploadDialog(true);
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      setIsUploading(true);
      try {
        await onAddPhoto(selectedFile, photoType);
        setShowUploadDialog(false);
        setSelectedFile(null);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl('');
        }
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Upload failed:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleCancel = () => {
    setShowUploadDialog(false);
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo);
    setShowPhotoDialog(true);
  };

  return (
    <>
      <Card className="p-6 bg-white/5 border border-white/10">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Progress Photos</h3>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              size="sm"
              className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600"
            >
              <Icon path={mdiCamera} size={0.8} className="mr-2" />
              Add Photo
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

        {photos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((photo, index) => (
              <div key={index} className="space-y-2 group cursor-pointer" onClick={() => handlePhotoClick(photo)}>
                <div className="aspect-square bg-white/5 border border-white/10 rounded-lg overflow-hidden relative">
                  <img
                    src={photo.url}
                    alt={`Progress ${photo.type}`}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    onError={(e) => {
                      // Fallback for broken images
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRTVFN0VCIi8+CjxwYXRoIGQ9Ik0xNjggMTYwQzE2OCAxNDYuNzQ1IDE3OC43NDUgMTM2IDE5MiAxMzZIMjA4QzIyMS4yNTUgMTM2IDIzMiAxNDYuNzQ1IDIzMiAxNjBWMjQwQzIzMiAyNTMuMjU1IDIyMS4yNTUgMjY0IDIwOCAyNjRIMTkyQzE3OC43NDUgMjY0IDE2OCAyNTMuMjU1IDE2OCAyNDBWMTYwWiIgZmlsbD0iIzlDQTNCOCIvPgo8L3N2Zz4=';
                    }}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <Icon
                      path={mdiCamera}
                      size={1.5}
                      className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                  <span className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded capitalize">
                    {photo.type}
                  </span>
                </div>
                <div className="text-center">
                  <p className="text-xs text-white/60">
                    {photo.date.toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-white/60">
            <Icon path={mdiCamera} size={3} className="mx-auto mb-4 opacity-20" />
            <p>No progress photos yet</p>
            <p className="text-sm">Take photos to track visual changes</p>
          </div>
        )}
      </div>
    </Card>

    {/* Upload Dialog */}
    <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
      <DialogContent className="sm:max-w-[500px] bg-gray-900 border border-white/20">
        <DialogHeader>
          <DialogTitle className="text-white">Upload Progress Photo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Preview */}
          {previewUrl && (
            <div className="aspect-square max-w-[300px] mx-auto rounded-lg overflow-hidden bg-white/5 border border-white/10">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="photo-type" className="text-white/80">Photo Type</Label>
            <Select value={photoType} onValueChange={(value: any) => setPhotoType(value)}>
              <SelectTrigger id="photo-type" className="w-full bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Select photo type" />
              </SelectTrigger>
              <SelectContent className="bg-teal-800/90 border-teal-400/30">
                <SelectItem value="front" className="text-white hover:bg-white/10">Front View</SelectItem>
                <SelectItem value="side" className="text-white hover:bg-white/10">Side View</SelectItem>
                <SelectItem value="back" className="text-white hover:bg-white/10">Back View</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              onClick={handleCancel}
              disabled={isUploading}
              className="bg-white/10 border border-white/20 text-white hover:bg-white/20"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={isUploading || !selectedFile}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50"
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Photo View Dialog */}
    <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
      <DialogContent className="max-w-4xl w-full bg-gray-900 border border-white/20">
        <DialogHeader>
          <DialogTitle className="text-white">
            Progress Photo - {selectedPhoto?.type ? selectedPhoto.type.charAt(0).toUpperCase() + selectedPhoto.type.slice(1) : ''} View
          </DialogTitle>
        </DialogHeader>

        {selectedPhoto && (
          <div className="space-y-4">
            {/* Large Image */}
            <div className="relative bg-white/5 border border-white/10 rounded-lg overflow-hidden">
              <img
                src={selectedPhoto.url}
                alt={`Progress ${selectedPhoto.type}`}
                className="w-full h-auto max-h-[70vh] object-contain"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRTVFN0VCIi8+CjxwYXRoIGQ9Ik0xNjggMTYwQzE2OCAxNDYuNzQ1IDE3OC43NDUgMTM2IDE5MiAxMzZIMjA4QzIyMS4yNTUgMTM2IDIzMiAxNDYuNzQ1IDIzMiAxNjBWMjQwQzIzMiAyNTMuMjU1IDIyMS4yNTUgMjY0IDIwOCAyNjRIMTkyQzE3OC43NDUgMjY0IDE2OCAyNTMuMjU1IDE2OCAyNDBWMTYwWiIgZmlsbD0iIzlDQTNCOCIvPgo8L3N2Zz4=';
                }}
              />
            </div>

            {/* Photo Info */}
            <div className="flex items-center justify-between text-sm text-white/60">
              <span>Type: <strong className="text-white capitalize">{selectedPhoto.type}</strong></span>
              <span>Date: <strong className="text-white">{selectedPhoto.date.toLocaleDateString()}</strong></span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  </>
  );
};

export default PhotoProgress;