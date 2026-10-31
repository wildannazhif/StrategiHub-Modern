'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getBasePath } from '@/lib/constants';
import { SankeyWorkspace } from '@/components/workspaces/SankeyWorkspace';

interface ODWorkspaceProps {
  isDarkMode?: boolean;
}

export const ODMapWorkspace: React.FC<ODWorkspaceProps> = ({ isDarkMode = false }) => {
  const [iframeHeight, setIframeHeight] = useState<number>(1050);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const basePath = getBasePath();

  useEffect(() => {
    const handleMsg = (e: MessageEvent) => {
      if (e.data && e.data.type === 'map_resize' && typeof e.data.height === 'number') {
        setIframeHeight(Math.max(950, e.data.height + 20));
      }
    };
    window.addEventListener('message', handleMsg);
    return () => window.removeEventListener('message', handleMsg);
  }, []);

  // Sync theme
  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage({ type: 'theme_change', isDark: isDarkMode }, '*');
      try {
        iframeRef.current.contentDocument?.documentElement.classList.toggle('dark', isDarkMode);
      } catch (e) {}
    }
  }, [isDarkMode]);

  const handleLoad = () => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage({ type: 'theme_change', isDark: isDarkMode }, '*');
      try {
        iframeRef.current.contentDocument?.documentElement.classList.toggle('dark', isDarkMode);
      } catch (e) {}
    }
  };

  return (
    <div className="space-y-4">
      {/* MAP IFRAME CONTAINER (Seamless, zero redundant double headers, 100% theme synchronized) */}
      <div className="relative isolate z-0 w-full overflow-hidden bg-transparent">
        <iframe
          ref={iframeRef}
          src={`${basePath}/peta_rute_od_echarts.html?dark=${isDarkMode ? '1' : '0'}`}
          onLoad={handleLoad}
          style={{ height: `${iframeHeight}px` }}
          className="w-full border-none transition-all duration-150 bg-transparent"
          title="Peta Rute OD Udara"
          scrolling="no"
        />
      </div>
    </div>
  );
};

// Seamless Native React Sankey Workspace (Zero iframe, 100% theme harmony, executive modern UI)
export const ODSankeyWorkspace: React.FC<ODWorkspaceProps> = ({ isDarkMode = false }) => {
  return <SankeyWorkspace isDarkMode={isDarkMode} />;
};
