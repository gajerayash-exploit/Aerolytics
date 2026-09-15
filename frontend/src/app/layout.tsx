import type { Metadata, Viewport } from 'next';
import '@/styles/design-system.css';
import '@/styles/app.css';

export const metadata: Metadata = {
  title: { default: 'Aerolytics — Drone Intelligence Engine', template: '%s · Aerolytics' },
  description: 'Drone imagery turned into geolocated AI detections inside a live 3D digital twin — for solar farms, crop fields and search-and-rescue zones.',
  icons: { icon: '/brand/logo-mark.png' },
};

export const viewport: Viewport = { themeColor: '#030814', colorScheme: 'dark' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Saira:ital,wdth,wght@0,75..125,300..800;1,75..125,300..800&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
