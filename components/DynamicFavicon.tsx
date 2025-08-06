"use client";

import { useEffect } from 'react';
import { useDocumentTitle, setFavicon } from '@/lib/useDocumentTitle';

interface DynamicFaviconProps {
  title?: string;
  iconPath?: string;
}

export default function DynamicFavicon({ 
  title = "Syntra AI Agentic Assistant", 
  iconPath = "/logo.png" 
}: DynamicFaviconProps) {
  useDocumentTitle(title);
  
  useEffect(() => {
    setFavicon(iconPath);
  }, [iconPath]);

  return null; // This component doesn't render anything
} 