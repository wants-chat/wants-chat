import React from 'react';
import { Star } from 'lucide-react';
import { BlogPost } from '../../types/blog';

const BlogCard: React.FC<{ post: BlogPost }> = ({ post }) => {
  // Get image URL from new structure or fallback to legacy fields
  const getImageUrl = () => {
    // First try the new image_urls array (use first image as featured)
    if (post.image_urls && post.image_urls.length > 0) {
      return post.image_urls[0];
    }
    // Fallback to legacy fields
    return post.featured_image || post.imageUrl || '/placeholder-blog.svg';
  };
  
  const imageUrl = getImageUrl();
  
  // Clean HTML for preview and handle truncation properly
  const getPreviewContent = (html: string, maxLength: number = 120) => {
    // First strip HTML to get plain text length
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    
    // If plain text is short enough, clean and return the HTML
    if (plainText.length <= maxLength) {
      return html
        .replace(/<p>/g, '')
        .replace(/<\/p>/g, ' ')
        .replace(/<br\s*\/?>/g, ' ')
        .replace(/<div>/g, '')
        .replace(/<\/div>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .trim();
    }
    
    // If too long, truncate plain text and add ellipsis
    const truncatedText = plainText.slice(0, maxLength) + '...';
    return truncatedText;
  };
  
  const previewContent = getPreviewContent(post.content);

  return (
    <div className="relative group bg-white/10 backdrop-blur-xl border border-white/20 cursor-pointer rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 shadow-sm h-full flex flex-col">
      {/* Blog Image */}
      <div className="relative overflow-hidden group">
        <img
          src={imageUrl}
          alt={post.title}
          className="w-full h-52 object-cover bg-white/10 transform group-hover:scale-110 transition-transform duration-700"
          onError={(e) => {
            console.error('Image failed to load:', imageUrl);
            (e.target as HTMLImageElement).src = '/placeholder-blog.svg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Blog Content */}
      <div className="p-6 bg-white/10 backdrop-blur-xl flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-bold bg-white/10 backdrop-blur-xl border border-white/20 text-white px-3 py-1.5 rounded-full shadow-sm">
            {post.category}
          </span>
          <div className="flex items-center gap-1 bg-white/10 backdrop-blur-xl border border-white/20 px-3 py-1 rounded-full">
            <Star className="text-amber-400" size={14} fill="currentColor" />
            <span className="text-sm font-bold text-white">
              {post.rating}
            </span>
          </div>
        </div>

        <h3 className="text-xl font-bold mb-3 text-white leading-tight hover:text-primary transition-colors duration-300 line-clamp-2">
          {post.title}
        </h3>
        {previewContent.includes('<') ? (
          <div
            className="text-white/60 text-sm leading-relaxed line-clamp-3 flex-1 mb-4"
            dangerouslySetInnerHTML={{ __html: previewContent }}
          />
        ) : (
          <p className="text-white/60 text-sm leading-relaxed line-clamp-3 flex-1 mb-4">
            {previewContent}
          </p>
        )}

        {/* Author and Date Info */}
        <div className="mt-auto pt-4 border-t border-white/20 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-white/60">
            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
            <span className="font-medium">By {post.author}</span>
          </div>
          {post.createdAt && (
            <span className="text-white/60 font-medium">
              {new Date(post.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          )}
        </div>
      </div>

    </div>
  );
};

export default BlogCard;
