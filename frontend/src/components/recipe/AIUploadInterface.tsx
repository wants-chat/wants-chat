import React from 'react';
import { Upload, Video, Camera, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { UploadMethod } from '../../types/recipe';

interface AIUploadInterfaceProps {
  uploadMethod: UploadMethod;
  isAnalyzing: boolean;
  uploadedFile: File | null;
  videoUrl: string;
  recipeImage?: string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onVideoUrlChange: (url: string) => void;
  onAnalyzeWithAI: () => void;
}

export const AIUploadInterface: React.FC<AIUploadInterfaceProps> = ({
  uploadMethod,
  isAnalyzing,
  uploadedFile,
  videoUrl,
  recipeImage,
  fileInputRef,
  onFileUpload,
  onVideoUrlChange,
  onAnalyzeWithAI
}) => {
  const renderImageUpload = () => (
    <div className="border-2 border-dashed border-teal-500/50 rounded-xl p-6 sm:p-8 bg-white/5">
      <div className="text-center">
        <Camera className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-teal-400/50" />
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileUpload}
          accept="image/*"
          className="hidden"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="ghost"
          className="rounded-xl mb-4 border border-white/20 text-white hover:bg-white/10"
          size="lg"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Recipe Image
        </Button>
        <p className="text-sm text-white/60 mb-4">
          Upload an image of your recipe for AI analysis. Supported formats: JPG, PNG, WEBP
        </p>
        {uploadedFile && (
          <div className="mb-4 p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg">
            <p className="text-sm text-green-400 mb-3">✓ File uploaded: {uploadedFile.name}</p>
            {recipeImage && (
              <div className="mb-4">
                <img
                  src={recipeImage}
                  alt="Uploaded recipe"
                  className="max-w-full h-32 sm:h-48 object-cover rounded-lg mx-auto"
                />
              </div>
            )}
            <Button
              onClick={onAnalyzeWithAI}
              disabled={isAnalyzing}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analyze Recipe with AI
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  const renderVideoUpload = () => (
    <div className="border-2 border-dashed border-teal-500/50 rounded-xl p-6 sm:p-8 bg-white/5">
      <div className="text-center">
        <Video className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-teal-400/50" />
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileUpload}
          accept="video/*"
          className="hidden"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="ghost"
          className="rounded-xl mb-4 border border-white/20 text-white hover:bg-white/10"
          size="lg"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Cooking Video
        </Button>
        <p className="text-sm text-white/60">
          Upload a cooking video for AI recipe extraction. Supported formats: MP4, MOV, AVI
        </p>
        {uploadedFile && (
          <div className="mt-4 p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg">
            <p className="text-sm text-green-400 mb-3">✓ File uploaded: {uploadedFile.name}</p>
            <Button
              onClick={onAnalyzeWithAI}
              disabled={isAnalyzing}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing Video...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Extract Recipe from Video
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  const renderUrlInput = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="video-url" className="text-base font-medium text-white">Video URL</Label>
        <Input
          id="video-url"
          placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
          value={videoUrl}
          onChange={(e) => onVideoUrlChange(e.target.value)}
          className="rounded-xl h-12 text-sm mt-2 bg-white/10 border-white/20 text-white placeholder:text-white/40"
        />
      </div>
      <Button
        onClick={onAnalyzeWithAI}
        disabled={!videoUrl || isAnalyzing}
        className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl"
        size="lg"
      >
        {isAnalyzing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Analyzing Video...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            Analyze Video URL
          </>
        )}
      </Button>
    </div>
  );

  return (
    <Card className="mb-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 border-l-4 border-l-teal-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl font-bold text-white">
          <Sparkles className="h-6 w-6 text-teal-400" />
          AI-Powered Recipe Analysis
        </CardTitle>
        <CardDescription className="text-base text-white/60">
          Upload your media and let AI extract the recipe details for you
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {uploadMethod === 'image' && renderImageUpload()}
        {uploadMethod === 'video' && renderVideoUpload()}
        {uploadMethod === 'url' && renderUrlInput()}

        {isAnalyzing && (
          <div className="mt-6 p-4 bg-teal-500/10 border border-teal-500/20 rounded-lg">
            <div className="flex items-center gap-3 text-teal-300">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-400"></div>
              <span className="text-sm font-medium">AI is analyzing your content...</span>
            </div>
            <p className="text-xs text-teal-400/80 mt-2">
              This may take a few moments. We're identifying ingredients, steps, and cooking details.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};