import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { siteConfig, pathConfigs } from '../../config/seo';

interface HeadProps {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
}

export const Head: React.FC<HeadProps> = ({
  title,
  description,
  image = '/og-image.jpg', 
  type = 'website',
}) => {
  const location = useLocation();
  const path = location.pathname;

  const pathConfig = Object.values(pathConfigs).find(config => config.path === path);
  
  const finalTitle = title || pathConfig?.title || siteConfig.defaultTitle;
  const finalDescription = description || pathConfig?.description || siteConfig.defaultDescription;
  const canonicalUrl = `${siteConfig.siteUrl}${path}`;

  useEffect(() => {
    document.title = finalTitle;
    document.querySelector('meta[name="description"]')?.setAttribute('content', finalDescription);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonicalUrl);

    document.querySelector('meta[property="og:title"]')?.setAttribute('content', finalTitle);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', finalDescription);
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', canonicalUrl);
    document.querySelector('meta[property="og:image"]')?.setAttribute('content', `${siteConfig.siteUrl}${image}`);
    document.querySelector('meta[property="og:type"]')?.setAttribute('content', type);

    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', finalTitle);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', finalDescription);
    document.querySelector('meta[name="twitter:image"]')?.setAttribute('content', `${siteConfig.siteUrl}${image}`);
  }, [finalTitle, finalDescription, canonicalUrl, image, type]);

  return null;
};

export default Head;