import React, { useState } from 'react';
import { Facebook, Twitter, Linkedin, Link2, Check, MessageCircle } from 'lucide-react';
import { Button } from '../ui/button';

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ url, title, description }) => {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedText = encodeURIComponent(`${title}${description ? ` - ${description}` : ''}`);

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
  };

  const handleShare = (platform: keyof typeof shareUrls) => {
    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-white/60 mr-2">Share:</span>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleShare('facebook')}
        className="p-2 h-9 w-9 bg-white/10 hover:bg-blue-600/20 border border-white/20 hover:border-blue-400/50 rounded-full transition-all"
        title="Share on Facebook"
      >
        <Facebook className="h-4 w-4 text-white/80" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleShare('twitter')}
        className="p-2 h-9 w-9 bg-white/10 hover:bg-sky-500/20 border border-white/20 hover:border-sky-400/50 rounded-full transition-all"
        title="Share on X (Twitter)"
      >
        <Twitter className="h-4 w-4 text-white/80" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleShare('linkedin')}
        className="p-2 h-9 w-9 bg-white/10 hover:bg-blue-700/20 border border-white/20 hover:border-blue-500/50 rounded-full transition-all"
        title="Share on LinkedIn"
      >
        <Linkedin className="h-4 w-4 text-white/80" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleShare('whatsapp')}
        className="p-2 h-9 w-9 bg-white/10 hover:bg-green-500/20 border border-white/20 hover:border-green-400/50 rounded-full transition-all"
        title="Share on WhatsApp"
      >
        <MessageCircle className="h-4 w-4 text-white/80" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopyLink}
        className="p-2 h-9 w-9 bg-white/10 hover:bg-teal-500/20 border border-white/20 hover:border-teal-400/50 rounded-full transition-all"
        title={copied ? 'Copied!' : 'Copy link'}
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-400" />
        ) : (
          <Link2 className="h-4 w-4 text-white/80" />
        )}
      </Button>
    </div>
  );
};

export default ShareButtons;
