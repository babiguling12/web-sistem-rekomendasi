'use client';

import { useEffect } from 'react';

export default function GoogleMapsScript() {
  useEffect(() => {
    const scriptId = 'google-maps-keyless';
    if (document.getElementById(scriptId)) return;

    const script = document.createElement('script');
    script.id = scriptId;
    script.src =
      'https://cdn.jsdelivr.net/gh/somanchiu/Keyless-Google-Maps-API@v7.0/mapsJavaScriptAPI.js';
    script.async = true;

    ;(window as any).initMap = function () {}

    document.body.appendChild(script);

    console.log('[GoogleMapsScript] Script injected!');
  }, []);

  return null;
}
