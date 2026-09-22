'use client';

import { useEffect } from 'react';

function deviceType() {
  const w = window.innerWidth;
  return w < 700 ? 'mobile' : w < 1100 ? 'tablet' : 'desktop';
}

function browserName() {
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return 'Edge';
  if (/Chrome\//.test(ua)) return 'Chrome';
  if (/Firefox\//.test(ua)) return 'Firefox';
  if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return 'Safari';
  return 'Other';
}

function osName() {
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return 'Android';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
  if (/Windows/i.test(ua)) return 'Windows';
  if (/Mac OS X/i.test(ua)) return 'macOS';
  if (/Linux/i.test(ua)) return 'Linux';
  return 'Other';
}

export default function QevliAnalyticsTracker() {
  useEffect(() => {
    const key = 'qevli.analytics.session';
    let sessionId = sessionStorage.getItem(key);
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem(key, sessionId);
    }

    const payload = {
      name: 'page_view',
      path: window.location.pathname,
      metadata: {
        sessionId,
        referrer: document.referrer || 'direct',
        device: deviceType(),
        browser: browserName(),
        os: osName(),
        language: navigator.language || 'unknown',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown',
        viewport: `${window.innerWidth}x${window.innerHeight}`,
      },
    };

    void fetch('/api/analytics/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => undefined);
  }, []);

  return null;
}
