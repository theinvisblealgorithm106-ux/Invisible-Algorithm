import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'The Invisible Algorithm — International Student Technology Non-Profit',
    template: '%s | The Invisible Algorithm',
  },
  description:
    'The Invisible Algorithm is an international student-led non-profit focused on AI, machine learning, computer science, financial literacy, and technology education. Join our global community of curious students.',
  keywords: [
    'artificial intelligence',
    'machine learning',
    'student organization',
    'technology education',
    'financial literacy',
    'research',
    'computer science',
    'non-profit',
    'international',
  ],
  authors: [{ name: 'The Invisible Algorithm' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: 'The Invisible Algorithm',
    title: 'The Invisible Algorithm — International Student Technology Non-Profit',
    description:
      'Join a global community of students learning, researching, and building the future of AI and technology.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Invisible Algorithm',
    description: 'International student-led technology and business non-profit.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-bg text-text-primary antialiased">
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#14141e',
              color: '#f8fafc',
              border: '1px solid #222234',
              borderRadius: '10px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#14141e' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#14141e' },
            },
          }}
        />
      </body>
    </html>
  );
}
