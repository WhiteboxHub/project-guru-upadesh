import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/lib/providers';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Guru Upadesh - AI-Powered Interview Preparation',
  description: 'Ace your interviews with AI-powered preparation, mock interviews, and real-time assistance',
  keywords: ['interview preparation', 'mock interviews', 'AI interview assistant', 'career development'],
  authors: [{ name: 'Guru Upadesh' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#3b82f6',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <a href="#main-content" className="skip-to-content">
            Skip to content
          </a>
          <main id="main-content">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
