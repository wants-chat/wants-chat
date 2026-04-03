import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { useAllBlogs } from '../../hooks/blog/useAllBlogs';

// Fallback background colors for blogs without images
const fallbackColors = [
  'from-blue-500 to-blue-600',
  'from-purple-500 to-purple-600', 
  'from-green-500 to-green-600',
  'from-orange-500 to-orange-600',
  'from-pink-500 to-pink-600',
  'from-indigo-500 to-indigo-600',
  'from-red-500 to-red-600',
  'from-teal-500 to-teal-600',
];

// Helper function to strip HTML tags and get clean text
const stripHtml = (html: string): string => {
  if (!html) return '';
  // Remove HTML tags using regex
  const cleanText = html.replace(/<[^>]*>/g, '');
  // Decode common HTML entities
  const decoded = cleanText
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
  return decoded.trim();
};

// Helper function to get excerpt from content
const getExcerpt = (excerpt: string | undefined, content: string | undefined, maxLength: number = 120): string => {
  if (excerpt) {
    const cleanExcerpt = stripHtml(excerpt);
    return cleanExcerpt.length > maxLength ? cleanExcerpt.substring(0, maxLength) + '...' : cleanExcerpt;
  }
  
  if (content) {
    const cleanContent = stripHtml(content);
    return cleanContent.length > maxLength ? cleanContent.substring(0, maxLength) + '...' : cleanContent;
  }
  
  return 'No description available';
};

const Hero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { blogs: allBlogs, loading } = useAllBlogs();

  // Get latest 4 blogs sorted by creation date
  const sliderPosts = useMemo(() => {
    return [...allBlogs]
      .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
      .slice(0, 4);
  }, [allBlogs]);

  const nextSlide = () => setCurrentSlide((s) => (s === sliderPosts.length - 1 ? 0 : s + 1));
  const prevSlide = () => setCurrentSlide((s) => (s === 0 ? sliderPosts.length - 1 : s - 1));

  useEffect(() => {
    if (sliderPosts.length > 0) {
      const interval = setInterval(() => {
        nextSlide();
      }, 5000); // auto-slide every 5s
      return () => clearInterval(interval);
    }
  }, [sliderPosts.length]);

  // Show loading skeleton while blogs are being fetched
  if (loading) {
    return (
      <section className="relative h-[550px] max-w-7xl mx-auto rounded-3xl mt-8 mb-20 overflow-hidden shadow-2xl border border-border/20">
        <div className="absolute inset-0">
          <Skeleton className="w-full h-full" />
          <div className="absolute bottom-0 left-0 p-10 md:p-16 space-y-6">
            <Skeleton className="h-8 w-32 rounded-full" />
            <Skeleton className="h-16 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Show empty state if no blogs
  if (sliderPosts.length === 0) {
    return (
      <section className="relative h-[550px] max-w-7xl mx-auto rounded-3xl mt-8 mb-20 overflow-hidden shadow-2xl border border-white/20 bg-white/10 backdrop-blur-xl">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white/80 mb-2">No blogs available</h2>
            <p className="text-white/60">Check back later for new content</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-[550px] max-w-7xl mx-auto rounded-3xl mt-8 mb-20 overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 border border-border/20">
      {sliderPosts.map((post, index) => {
        const hasImage = post.featured_image || post.imageUrl;
        const fallbackColor = fallbackColors[index % fallbackColors.length];
        
        return (
          <Link
            key={post.id}
            to={`/blog/details/${post.id}`}
            className={`absolute inset-0 transition-opacity duration-1000 cursor-pointer ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0'
            }`}
          >
            {hasImage ? (
              <img
                src={(post.featured_image || post.imageUrl) as string}
                alt={post.title}
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                onError={(e) => {
                  // Fallback to gradient background if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const gradientDiv = target.nextElementSibling as HTMLElement;
                  if (gradientDiv) {
                    gradientDiv.style.display = 'block';
                  }
                }}
              />
            ) : null}
            
            {/* Fallback gradient background for blogs without images */}
            <div 
              className={`w-full h-full bg-gradient-to-br ${fallbackColor} ${hasImage ? 'hidden' : 'block'}`}
              style={{ display: hasImage ? 'none' : 'block' }}
            />

            {/* Premium Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 via-black/30 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/10"></div>

            {/* Premium Content */}
            <div className="absolute bottom-0 left-0 p-10 md:p-16 text-white space-y-6 transform translate-y-0 hover:translate-y-[-8px] transition-transform duration-300">
              <span className="inline-block text-xs font-bold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 px-6 py-2 rounded-full shadow-lg hover:shadow-xl backdrop-blur-sm border border-white/20 transition-all duration-300 transform hover:scale-105">
                {post.category}
              </span>
              <h1 className="text-4xl md:text-6xl font-black drop-shadow-2xl max-w-3xl bg-gradient-to-r from-white to-gray-100 bg-clip-text text-transparent leading-tight hover:from-white hover:to-primary/20 transition-all duration-500">
                {post.title}
              </h1>
              <p className="text-lg md:text-xl max-w-2xl text-gray-100 drop-shadow-lg leading-relaxed backdrop-blur-sm">
                {getExcerpt(post.excerpt, post.content, 120)}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span>
                    By <span className="font-bold text-white">{post.author}</span>
                  </span>
                </div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <span className="font-medium">
                  {post.createdAt && new Date(post.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </Link>
        );
      })}

      {/* Premium Navigation Arrows */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          prevSlide();
        }}
        className="absolute top-1/2 left-6 -translate-y-1/2 
                  z-50 bg-gradient-to-r from-black/70 to-black/50 hover:from-black/90 hover:to-black/70 
                  text-white p-5 rounded-full 
                  shadow-xl hover:shadow-2xl transition-all duration-300 
                  flex items-center justify-center backdrop-blur-md border border-white/20
                  transform hover:scale-110 hover:-translate-x-1"
      >
        <ChevronLeft size={28} />
      </button>

      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          nextSlide();
        }}
        className="absolute top-1/2 right-6 -translate-y-1/2 
                  z-50 bg-gradient-to-r from-black/70 to-black/50 hover:from-black/90 hover:to-black/70 
                  text-white p-5 rounded-full 
                  shadow-xl hover:shadow-2xl transition-all duration-300 
                  flex items-center justify-center backdrop-blur-md border border-white/20
                  transform hover:scale-110 hover:translate-x-1"
      >
        <ChevronRight size={28} />
      </button>

      {/* Premium Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-4 bg-black/30 backdrop-blur-md rounded-full px-6 py-3 border border-white/20">
        {sliderPosts.map((_, i) => (
          <button
            key={i}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setCurrentSlide(i);
            }}
            className={`w-4 h-4 rounded-full transition-all duration-300 transform ${
              i === currentSlide
                ? 'bg-gradient-to-r from-primary to-primary/80 scale-125 shadow-lg ring-2 ring-white/50'
                : 'bg-white/40 hover:bg-white/60 hover:scale-110 shadow-md'
            }`}
          ></button>
        ))}
      </div>
    </section>
  );
};

export default Hero;
