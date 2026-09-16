import './globals.css';
import type { Metadata } from 'next';
import ServiceWorker from '@/components/ServiceWorker';
import LaunchSplash from '@/components/LaunchSplash';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'default-no-store';

export const metadata: Metadata = {
  title: 'Qevli — Connect. Share. Grow.',
  description: 'Qevli is an original social platform for people, ideas and communities.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><ServiceWorker /><LaunchSplash />{children}</body></html>;
}
