import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { RegisterSW } from '@/components/pwa/RegisterSW';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { ThemeProvider, themeInitScript } from '@/components/theme/ThemeProvider';
import { ReminderEngine } from '@/components/reminders/ReminderEngine';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const space = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'InfluLab — Laboratório de Criação para TikTok Shop',
  description:
    'Acelere suas vendas no TikTok Shop com produtos campeões, prompts validados e modelos virais. Sistema exclusivo para alunos InfluLab.',
  applicationName: 'InfluLab',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'InfluLab',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'InfluLab',
    description: 'O laboratório de criação para vendas no TikTok Shop.',
    type: 'website',
    siteName: 'InfluLab',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#070912' },
    { media: '(prefers-color-scheme: light)', color: '#F5F6FA' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${space.variable}`} suppressHydrationWarning>
      <head>
        {/* Aplica tema antes do paint para evitar flash */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="font-sans antialiased min-h-screen">
        <ThemeProvider>
          {children}
          <RegisterSW />
          <InstallPrompt />
          <ReminderEngine />
        </ThemeProvider>
      </body>
    </html>
  );
}
