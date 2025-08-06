import { useEffect } from 'react';

export function useDocumentTitle(title: string) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;
    
    // Restore the previous title when component unmounts
    return () => {
      document.title = prevTitle;
    };
  }, [title]);
}

export function setFavicon(iconPath: string) {
  const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
  link.type = 'image/png';
  link.rel = 'icon';
  link.href = iconPath;
  document.getElementsByTagName('head')[0].appendChild(link);
} 