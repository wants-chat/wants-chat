import { Helmet } from '@dr.pogodin/react-helmet';
import { SEO_CONFIG } from '../config/seo';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
  keywords?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title = SEO_CONFIG.defaultTitle,
  description = SEO_CONFIG.defaultDescription,
  image = SEO_CONFIG.defaultImage,
  url,
  type = 'website',
  noindex = false,
  keywords,
  author,
  publishedTime,
  modifiedTime,
}) => {
  // Auto-detect canonical URL from current location if not provided
  const canonicalUrl = url || (typeof window !== 'undefined'
    ? `${SEO_CONFIG.siteUrl}${window.location.pathname}`.replace(/\/$/, '') || SEO_CONFIG.siteUrl
    : SEO_CONFIG.siteUrl);

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {author && <meta name="author" content={author} />}
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={SEO_CONFIG.siteName} />

      {/* Article specific Open Graph tags */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      {SEO_CONFIG.twitterHandle && (
        <>
          <meta name="twitter:site" content={SEO_CONFIG.twitterHandle} />
          <meta name="twitter:creator" content={SEO_CONFIG.twitterHandle} />
        </>
      )}
    </Helmet>
  );
};
