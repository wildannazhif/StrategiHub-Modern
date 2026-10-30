import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import 'leaflet/dist/leaflet.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'StrategiHub Analytics 2026 V2 • Pusat Data dan Informasi Kemenhub',
  description:
    'Dashboard Terpadu Pemantauan Mobilitas Angkutan Penumpang Multimoda Nasional & Model Peramalan Nataru 2026/2027.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 dark:bg-slate-950`}>
        {children}
      </body>
    </html>
  );
}
